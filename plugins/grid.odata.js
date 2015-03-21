/*jslint continue: true, nomen: true, plusplus: true, unparam: true, todo: true, vars: true, white: true */
/*global jQuery */

//global functions
(function () {
    //   resolveJsonReferences                   - json = $.jgrid.ODataHelper.resolveJsonReferences(json, out refs);
    //   convertXmlToJson                        - json = $.jgrid.ODataHelper.convertXmlToJson(xml);

    "use strict";
    $.jgrid.ODataHelper = {

        //http://stackoverflow.com/questions/15312529/resolve-circular-references-from-json-object
        resolveJsonReferences: function (json, refs) {
            var i, ref, byid = {}; // all objects by id
            refs = refs || []; // references to objects that could not be resolved

            function recurse(obj, prop, parent) {
                if (typeof obj !== 'object' || !obj) {// a primitive value
                    return obj;
                }
                if (Object.prototype.toString.call(obj) === '[object Array]') {
                    for (i = 0; i < obj.length; i++) {
                        // check also if the array element is not a primitive value
                        if (typeof obj[i] !== 'object' || !obj[i]) {// a primitive value
                            return obj[i];
                        }
                        if (obj[i].$ref) {
                            obj[i] = recurse(obj[i], i, obj);
                        }
                        else {
                            obj[i] = recurse(obj[i], prop, obj);
                        }
                    }
                    return obj;
                }
                if (obj.$ref) { // a reference
                    ref = obj.$ref;
                    if (byid[ref]) {
                        return byid[ref];
                    }
                    // else we have to make it lazy:
                    refs.push([parent, prop, ref]);
                    return;
                }
                if (obj.$id) {
                    var id = obj.$id;
                    delete obj.$id;
                    if (obj.$values) {// an array
                        obj = obj.$values.map(recurse);
                    }
                    else {// a plain object
                        var itm;
                        for (itm in obj) {
                            if (obj.hasOwnProperty(itm)) {
                                obj[itm] = recurse(obj[itm], itm, obj);
                            }
                        }
                    }
                    byid[id] = obj;
                }
                return obj;
            }

            if (typeof json === 'string') { json = JSON.parse(json); }
            json = recurse(json); // run it!

            for (i = 0; i < refs.length; i++) { // resolve previously unknown references
                ref = refs[i];
                ref[0][ref[1]] = byid[ref[2]];
                // Notice that this throws if you put in a reference at top-level
            }

            return json;
        },

        // Changes XML to JSON
        //http://davidwalsh.name/convert-xml-json
        convertXmlToJson: function (xml) {
            // Create the return object
            var obj = {}, i, j, attribute, item, nodeName, old;

            if (xml.nodeType === 1) { // element
                // do attributes
                if (xml.attributes.length > 0) {
                    obj["@attributes"] = {};
                    for (j = 0; j < xml.attributes.length; j++) {
                        attribute = xml.attributes.item(j);
                        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                    }
                }
            }
            else if (xml.nodeType === 3) { // text
                obj = xml.nodeValue;
            }
            else if (!xml.nodeType) {
                obj = xml;
            }

            // do children
            if (xml.hasChildNodes && xml.hasChildNodes()) {
                for (i = 0; i < xml.childNodes.length; i++) {
                    item = xml.childNodes.item(i);
                    if (item.nodeType === 3) {
                        return item.nodeValue;
                    }

                    nodeName = item.nodeName;
                    if (obj[nodeName] === undefined) {
                        obj[nodeName] = $.jgrid.ODataHelper.convertXmlToJson(item);
                    } else {
                        if (obj[nodeName].push === undefined) {
                            old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push($.jgrid.ODataHelper.convertXmlToJson(item));
                    }
                }
            }

            return $.isEmptyObject(obj) ? null : obj;
        }
    };
}());


(function ($) {
    /*
     * jqGrid OData (WebApi v3/v4) support
     *
     * Authors:
     *  Mark Babayev (https://github.com/mirik123)
     * 
     * License MIT (MIT-LICENSE.txt)
     * 
     * based on Richard Bennett gist code: jqGrid.ODataExtensions.js 
     * https://gist.github.com/dealproc/6678280
     *
     *Functions:
     *   odataGenColModel                        - $("#grid").jqGrid('odataGenColModel', {...});
     *       This function generates jqgrid columns by requesting odata $metadata.
     *       It is called by odataInit when gencolumns=true.
     *       
     *       Options:
     *           datatype: 'xml'                 - ajax dataType, can be json or xml           
     *           async: false                    - set ajax sync/async for $metadata request (when calling from odataInit only async=false is supported)
     *           entityType: null                - required field, odata entityType name
     *           metadataurl: (odataurl || p.url) + '/$metadata' 
     *                                           - set ajax url for $metadata request
     *           successfunc: null               - odataGenColModel callback to see when metadata request is over and jqgrid can be refreshed
     *           parsecolfunc: null              - event for converting parsed metadata data array in form of {name,type,nullable,iskey} to the jqgrid colModel array
     *           parsemetadatafunc: null         - event for converting unparsed metadata data (xml or json) to the jqgrid colModel array
     *           errorfunc: null                 - error callback
     *
     *       jqGrid Events:
     *           jqGridODataParseMetadata        - the same as parsemetadatafunc
     *           jqGridODataParseColumns         - the same as parsecolfunc
     *
     *   odataInit                               - $("#grid").jqGrid('odataInit', {...});
     *       This is main plugin function. It should be called before colModel is initialized.
     *       When columns are defined manually it can be called from events beforeInitGrid, onInitGrid.
     *       When columns are created automatically it can be called from event beforeInitGrid only.
     *       
     *       Options:
     *           gencolumns: false               - automatically generate columns from odata $metadata (calls odataGenColModel)
     *           odataurl: p.url                 - required field, main odata url
     *           datatype: 'json'                - ajax dataType, can be json or xml
     *           entityType: null                - required field, odata entityType name
     *           annotations: false              - use odata annotations for getting jqgrid parameters: page,records,count,total
     *           annotationName: "@jqgrid.GridModelAnnotate" - odata annotations class and namespace
     *           version                         - odata version, used to set $count=true or $inlinecount=allpages
     *           errorfunc: null                 - error callback
     *           metadatatype: datatype || 'xml' - when gencolumns=true, alternative ajax dataType for $metadata request
     *           
     *
     * Examples:		
     * $("#grid").jqGrid({
     *    ...,
     *    beforeInitGrid: function () {           // can be also put at onInitGrid when columns are defined manually
     *        $(this).jqGrid('odataInit', {
     *            version: 3,
     *            gencolumns: false,
     *            odataurl: 'http://localhost:56216/odata/ODClient'
     *        });
     *    }
     * });
     * 
     * $("#grid").jqGrid({
     *    ...,
     *    beforeInitGrid: function () {
     *        $(this).jqGrid('odataInit', {
     *            version: 4,
                  datatype: 'json',
     *            annotations: true,
     *            gencolumns: true,
     *            entityType: 'ClientModel',
     *            odataurl: 'http://localhost:56216/odata/ODClient',
     *            metadataurl: 'http://localhost:56216/odata/$metadata'
     *        });
     *    }
     * });
     * 
     * annotation are not supported by OData v3/4 XML serializer
     * $("#grid").jqGrid({
     *    ...,
     *    beforeInitGrid: function () {
     *        $(this).jqGrid('odataInit', {
     *            version: 4,
                  datatype: 'xml',
     *            annotations: false,
     *            gencolumns: true,
     *            entityType: 'ClientModel',
     *            odataurl: 'http://localhost:56216/odata/ODClient',
     *            metadataurl: 'http://localhost:56216/odata/$metadata'
     *        });
     *    }
     * });
     */

    "use strict";
    $.jgrid.extend({
        odataInit: function (options) {
            // builds out OData expressions... the condition.
            function prepareExpression(p, searchField, searchString, searchOper) {
                var i, col;

                // if we want to support "in" clauses, we need to follow this stackoverflow article:
                //http://stackoverflow.com/questions/7745231/odata-where-id-in-list-query/7745321#7745321
                // this is for basic searching, with a single term.
                if (searchField && (searchString || searchOper === 'nu' || searchOper === 'nn')) {
                    if (searchString) {
                        //append '' when searched field is of the string type
                        for (i = 0; i < p.colModel.length; i++) {
                            col = p.colModel[i];
                            if (col.name === searchField) {
                                if (col.odata === false) { return; }
                                if (col.odataunformat) {
                                    searchField = $.isFunction(col.odataunformat) ? col.odataunformat(searchField, searchString, searchOper) : col.odataunformat;
                                    if (!searchField) { return; }
                                }
                                if (!col.searchrules || (!col.searchrules.integer && !col.searchrules.date)) {
                                    searchString = "'" + searchString + "'";
                                }
                                else if (col.searchrules && col.searchrules.date) {
                                    searchString = (new Date(searchString)).toISOString();
                                    //v3: postData.searchString = "datetimeoffset'" + postData.searchString + "'";  
                                    //v2: postData.searchString = "DateTime'" + postData.searchString + "'"; 
                                }

                                break;
                            }
                        }
                    }

                    switch (searchOper) {
                        case "in":  // is in
                        case "cn":	// contains
                            return "substringof(" + searchString + ", " + searchField + ") eq true";
                            //return "indexof(tolower(" + field + "), '" + data + "') gt -1";
                        case "ni": // is not in
                        case "nc": // does not contain.
                            return "substringof(" + searchString + ", " + searchField + ") eq false";
                            //return "indexof(tolower(" + field + "), '" + data + "') eq -1";
                        case "bw": // begins with
                            return "startswith(" + searchField + ", " + searchString + ") eq true";
                        case "bn": // does not begin with
                            return "startswith(" + searchField + ", " + searchString + ") eq false";
                        case "ew": // ends with
                            return "endswith(" + searchField + ", " + searchString + ") eq true";
                        case "en": // does not end with.
                            return "endswith(" + searchField + ", " + searchString + ") eq false";
                        case "nu": // is null
                            return searchField + " eq null";
                        case "nn": // is not null
                            return searchField + " ne null";
                        default:   // eq,ne,lt,le,gt,ge,
                            return searchField + " " + searchOper + " " + searchString;
                    }
                }
            }

            // when dealing with the advanced query dialog, this parses the encapsulating Json object
            // which we will then build the advanced OData expression from.
            function parseFilterGroup(filterGroup, p) {
                var i, rule, filterText = "", filterRes;
                if (filterGroup.groups) {
                    if (filterGroup.groups.length) {
                        for (i = 0; i < filterGroup.groups.length; i++) {
                            filterText += "(" + parseFilterGroup(filterGroup.groups[i], p) + ")";

                            if (i < filterGroup.groups.length - 1) {
                                filterText += " " + filterGroup.groupOp.toLowerCase() + " ";
                            }
                        }

                        if (filterGroup.rules && filterGroup.rules.length) {
                            filterText += " " + filterGroup.groupOp.toLowerCase() + " ";
                        }
                    }
                }

                if (filterGroup.rules.length) {
                    for (i = 0; i < filterGroup.rules.length; i++) {
                        rule = filterGroup.rules[i];

                        filterRes = prepareExpression(p, rule.field, rule.data, rule.op);
                        if (filterRes) {
                            filterText += filterRes + " " + filterGroup.groupOp.toLowerCase() + " ";
                        }
                    }
                }

                filterText = filterText.trim().replace(/\s(and|or)$/, '').trim();

                return filterText;
            }

            function setupWebServiceData(p, o, postData) {
                // basic posting parameters to the OData service.
                var params = {
                    $top: postData.rows, //- $top removes odata.nextLink parameter
                    $skip: (parseInt(postData.page, 10) - 1) * p.rowNum
                    //$format: 'application/' + o.datatype + ';odata.metadata=full'
                    //$inlinecount: "allpages" //- not relevant for V4
                };

                //if (o.datatype === 'jsonp') { params.$callback = o.callback; }
                if (o.count) { params.$count = true; }
                if (o.inlinecount) { params.$inlinecount = "allpages"; }

                // if we have an order-by clause to use, then we build it.
                if (postData.sidx) {
                    // two columns have the following data:
                    // postData.sidx = "{ColumnName} {order}, {ColumnName} "
                    // postData.sord = "{order}"
                    // we need to split sidx by the ", " and see if there are multiple columns.  If there are, we need to go through
                    // each column and get its parts, then parse that for the appropriate columns to build for the sort.

                    params.$orderby = postData.sidx + " " + postData.sord;
                }

                if (!postData._search) { return params; }
            
                // complex searching, with a groupOp.  This is for if we enable the form for multiple selection criteria.
                if (postData.filters) {
                    var filterGroup = $.parseJSON(postData.filters);
                    var groupSearch = parseFilterGroup(filterGroup, p);

                    if (groupSearch.length > 0) {
                        params.$filter = groupSearch;
                    }
                }
                else {
                    params.$filter = prepareExpression(p, postData.searchField, postData.searchString, postData.searchOper);
                }

                return params;
            }

            function initDefaults(p, o) {
                var defaultAjaxOptions = {
                    contentType: 'application/' + o.datatype + ';charset=utf-8',
                    datatype: o.datatype
                };

                p.inlineEditing = $.extend(true, {
                    beforeSaveRow: function (options, rowid, frmoper) {
                        if (options.extraparam.oper === 'edit') {
                            options.url = o.odataurl;
                            options.mtype = "PATCH";
                            options.url += '(' + rowid + ')';
                        }
                        else {
                            options.url = o.odataurl;
                            options.mtype = "POST";
                        }

                        return true;
                    },
                    serializeSaveData: function (postdata) {
                        return JSON.stringify(postdata);
                    },
                    ajaxSaveOptions: defaultAjaxOptions
                }, p.inlineEditing || {});

                $.extend(p.formEditing, {
                    onclickSubmit: function (options, postdata, frmoper) {
                        if (frmoper === 'add') {
                            options.url = o.odataurl;
                            options.mtype = "POST";
                        }
                        else if (frmoper === 'edit') {
                            options.url = o.odataurl + '(' + postdata[p.id + "_id"] + ')';
                            options.mtype = "PUT";
                        }

                        return postdata;
                    },
                    ajaxEditOptions: defaultAjaxOptions,
                    serializeEditData: function (postdata) {
                        return JSON.stringify(postdata);
                    }
                });

                $.extend(p.formDeleting, {
                    url: o.odataurl,
                    mtype: "DELETE",
                    serializeDelData: function (postdata) {
                        return "";
                    },
                    onclickSubmit: function (options, postdata) {
                        options.url += '(' + postdata + ')';
                        return '';
                    },
                    ajaxDelOptions: defaultAjaxOptions
                });

                $.extend(p, {
                    serializeGridData: function (postData) {
                        postData = setupWebServiceData(p, o, postData);
                        this.p.odataPostData = postData;
                        return postData;
                    },
                    ajaxGridOptions: defaultAjaxOptions,                   
                    //jsonpCallback: o.callback,
                    mtype: 'GET',
                    url: o.odataurl
                }, defaultAjaxOptions);

                if (o.datatype === 'xml') {
                    if (o.annotations) {
                        $.extend(true, p, {
                            loadBeforeSend: function (jqXHR) {
                                jqXHR.setRequestHeader("Prefer", 'odata.include-annotations="*"');
                            }
                        });
                    }

                    $.extend(true, p, {
                        xmlReader: {
                            root: 'ArrayOf' + o.entityType,
                            row: o.entityType,
                            records: function (data) { return $('ArrayOf' + o.entityType + ' ' + o.entityType, data).length; },
                            page: function (data) {
                                var skip = p.odataPostData.$skip + p.rowNum;
                                return Math.ceil(skip / p.rowNum);
                            },
                            total: function (data) {
                                var records = $('ArrayOf' + o.entityType + ' ' + o.entityType, data).length;
                                var skip = p.odataPostData.$skip + p.rowNum;
                                return Math.ceil(skip / p.rowNum) + (records > 0 ? 1:0);
                            },
                            repeatitems: false,
                            id: p.id,
                            userdata: "ArrayOfUserData UserData"
                        }
                    });
                }
                else {
                    if (o.annotations) {
                        $.extend(true, p, {
                            loadBeforeSend: function (jqXHR) {
                                jqXHR.setRequestHeader("Prefer", 'odata.include-annotations="*"');
                            },
                            jsonReader: {
                                root: "value",
                                repeatitems: false,
                                records: function (data) { return data[o.annotationName].records; },
                                page: function (data) { return data[o.annotationName].page; },
                                total: function (data) { return data[o.annotationName].total; },
                                userdata: function (data) { return data[o.annotationName].userdata; }
                            }
                        });
                    }
                    else {
                        $.extend(true, p, {
                            jsonReader: {
                                root: "value",
                                repeatitems: false,
                                records: function (data) { return data["odata.count"] || data["@odata.count"]; },
                                page: function (data) {
                                    var skip;
                                    if (data["odata.nextLink"]) {
                                        skip = parseInt(data["odata.nextLink"].split('skip=')[1], 10);
                                    }
                                    else {
                                        skip = p.odataPostData.$skip + p.rowNum;
                                        var total = data["odata.count"] || data["@odata.count"];
                                        if (skip > total) {skip = total;}
                                    }
                                    
                                    return Math.ceil(skip / p.rowNum);
                                },
                                total: function (data) {
                                    var total = data["odata.count"] || data["@odata.count"];
                                    return Math.ceil(parseInt(total, 10) / p.rowNum);
                                },
                                userdata: "userdata"
                            }
                        });
                    }
                }         
            }

            return this.each(function () {
                var $t = this, $self = $($t), p = $t.p;
                if (!$t.grid || !p) { return; }

                var o = $.extend(true, {
                    gencolumns: false,
                    odataurl: p.url,
                    datatype: 'json',     //json,jsonp,xml
                    entityType: null,
                    annotations: false,
                    annotationName: "@jqgrid.GridModelAnnotate"
                }, options || {});

                if (!o.entityType && (o.gencolumns || o.datatype === 'xml')) {
                    if ($.isFunction(o.errorfunc)) { o.errorfunc({}, 'entityType cannot be empty', 0); }
                    return;
                }

                if (!o.version || o.version < 4) {
                    o = $.extend(true, {
                        inlinecount: true,
                        count: false
                    }, o || {});
                }
                else {
                    o = $.extend(true, {
                        inlinecount: false,
                        count: true
                    }, o || {});
                }

                //if (o.datatype === 'jsonp') { o.callback = "jsonCallback_" + $.jgrid.randId(); }
                if (o.gencolumns) {
                    var gencol = $.extend(true, {
                        parsecolfunc: null,
                        parsemetadatafunc: null,
                        successfunc: null,
                        errorfunc: null,
                        async: false,
                        entityType: null,
                        metadatatype: options.datatype || 'xml',
                        metadataurl: (options.odataurl || p.url) + '/$metadata'
                    }, options || {});

                    gencol.datatype = gencol.metadatatype;
                    if (gencol.async) {
                        gencol.successfunc = function () {
                            if ($t.grid.hDiv) { $t.grid.hDiv.loading = false; }
                            $self.trigger('reloadGrid');
                        };

                        if ($t.grid.hDiv) { $t.grid.hDiv.loading = true; }
                    }

                    $self.jqGrid('odataGenColModel', gencol);
                }

                initDefaults(p, o);
            });
        },

        odataGenColModel: function (options) {           
			
			function parseXmlData(data, entityType) {
                var cols = [], props, keys, key, name, type, nullable, iskey;

                //var xmldata = $.parseXML(xhr.responseText);
                props = $('EntityType[Name="' + entityType + '"] Property', data);
                keys = $('EntityType[Name="' + entityType + '"] Key PropertyRef', data);

                key = keys && keys.length > 0 ? keys.first().attr('Name') : '';
                if (props) {
                    props.each(function (n, itm) {
                        name = $(itm).attr('Name');
                        type = $(itm).attr('Type');
                        nullable = $(itm).attr('Nullable');
                        iskey = (name === key);

                        cols.push({ name: name, type: type, nullable: nullable, iskey: iskey });
                    });
                }

                return cols;
            }

            function parseJsonData(data, entityType) {
                var cols = [], props, keys, key, name, type, nullable, iskey, i;
                var schemaElements = (data.SchemaElements.$values || data.SchemaElements);
                for (i = 0; i < schemaElements.length ; i++) {
                    if (schemaElements[i].Name === entityType) {
                        props = schemaElements[i].DeclaredProperties.$values || schemaElements[i].DeclaredProperties;
                        keys = schemaElements[i].DeclaredKey.$values || schemaElements[i].DeclaredKey;
                        break;
                    }
                }

                key = keys && keys.length > 0 ? keys[0].Name : '';
                if (props) {
                    for (i = 0; i < props.length; i++) {
                        if (props[i].$ref) {
                            cols.push({ name: props[i].$ref, type: null, nullable: false, iskey: false });
                        }
                        else {
                            name = props[i].Name;
                            iskey = (name === key);
                            nullable = props[i].Type.IsNullable;

                            if (props[i].Type.Definition.$ref) {
                                type = props[i].Type.Definition.$ref;
                            }
                            else {
                                type = props[i].Type.Definition.Namespace + '.' + props[i].Type.Definition.Name;
                            }

                            cols.push({ name: name, type: type, nullable: nullable, iskey: iskey });
                        }
                    }
                }

                return cols;
            }
			
			var $t = this[0], p = $t.p, $self = $($t);

            var o = $.extend(true, {
                parsecolfunc: null, 
                parsemetadatafunc: null, 
                successfunc: null, 
                errorfunc: null,
                entityType: null,
                metadataurl: p.url + '/$metadata',
                datatype: 'json',           //json,xml
                async: false
            }, options || {});

            if(!o.entityType) {
                if($.isFunction(o.errorfunc)) { o.errorfunc({}, 'entityType cannot be empty', 0); }
                return;
            }

            $.ajax({
                url: o.metadataurl,
                type: 'GET',
                dataType: o.datatype,
                contentType: 'application/' + o.datatype + ';charset=utf-8',
                //headers: {
                    //"OData-Version": "4.0"
                    //"Accept": "application/json;odata=light;q=1,application/json;odata=verbose;q=0.5"
                //},
                async: o.async,
                cache: false
            })
            .done(function (data, st, xhr) {
                var i = 0, j = 0, isInt, isNum, isDate;
                var intTypes = 'Edm.Byte,Edm.Int16,Edm.Int32,Edm.Int64,Edm.SByte';
                var numTypes = 'Edm.Decimal,Edm.Double,Edm.Single';

                if (o.datatype === 'json') { data = $.jgrid.ODataHelper.resolveJsonReferences(data); }
                var newcol = $self.triggerHandler("jqGridODataParseMetadata", data);
                if (newcol === undefined && $.isFunction(o.parsemetadatafunc)) { newcol = o.parsemetadatafunc(data, st, xhr); }
                if (newcol === undefined) {
                    var cols = o.datatype === 'xml' ? parseXmlData(data, o.entityType) : parseJsonData(data, o.entityType);
                    if (cols.length === 0) {
                        if ($.isFunction(o.errorfunc)) { o.errorfunc({data: data, status: st, xhr: xhr}, 'parse $metadata error', 0); }
                    }
                    else {
                        newcol = $self.triggerHandler("jqGridODataParseColumns", cols);
                        if (newcol === undefined && $.isFunction(o.parsecolfunc)) { newcol = o.parsecolfunc(cols); }
                        if (newcol === undefined) {
                            newcol = [];
                            for (i = 0; i < cols.length; i++) {
                                isInt = intTypes.indexOf(cols[i].type) >= 0;
                                isNum = numTypes.indexOf(cols[i].type) >= 0;
                                isDate = cols[i].type.indexOf('Edm.') >= 0 && (cols[i].type.indexOf('Date') >= 0 || cols[i].type.indexOf('Time') >= 0);
                                newcol.push({
                                    label: cols[i].name,
                                    name: cols[i].name,
                                    index: cols[i].name,
                                    editable: !cols[i].iskey,
                                    searchrules: { integer: isInt, number: isNum, datetime: isDate },
                                    editrules: { integer: isInt, number: isNum, datetime: isDate }
                                });
                            }
                        }
                    }
                }

                if (newcol) {
                    for (i = 0; i < p.colModel.length; i++) {
                        for (j = 0; j < newcol.length; j++) {
                            if (newcol[j].name === p.colModel[i].name) {
                                $.extend(true, newcol[j], p.colModel[i]);
                                if (p.colModel[i].searchrules) {
                                    newcol[j].searchrules = p.colModel[i].searchrules;
                                }
                                if (p.colModel[i].editrules) {
                                    newcol[j].editrules = p.colModel[i].editrules;
                                }
                                break;
                            }
                        }
                    }
                    p.colModel = newcol;

                    if ($.isFunction(o.successfunc)) {
                        o.successfunc();
                    }
                }
                else {
                    if ($.isFunction(o.errorfunc)) { o.errorfunc({ data: data, status: st, xhr: xhr }, 'parse $metadata error', 0); }
                }                               
            })
            .fail(function (xhr, err, code) {
                if ($.isFunction(o.errorfunc)) { o.errorfunc(xhr, err, code); }
            });
        }
    });
}(jQuery));