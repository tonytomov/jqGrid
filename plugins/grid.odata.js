/*jslint continue: true, nomen: true, plusplus: true, unparam: true, todo: true, vars: true, white: true */
/*global jQuery */

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
     * The use examples:		
     * $("#grid").jqGrid({
     *    ...,
     *    beforeInitGrid: function () {           //can be also put at: onInitGrid
     *        $(this).jqGrid('odataInit', {
     *            version: 4,
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
     *            async: false,
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
                    //$top: postData.rows, //- we cannot use $top because of it removes odata.nextLink parameter
                    $skip: (parseInt(postData.page, 10) - 1) * p.rowNum,
                    $format: o.datatype
                    //$inlinecount: "allpages" //- not relevant for V4
                };

                //if (o.datatype === 'jsonp') { params.$callback = o.callback; }
                if (o.count) { params.$count = true; }
                if (o.top) { params.$top = postData.rows; }
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
                            },
                            //xmlReader: { ??? }
                        });
                    }
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
                                records: "odata.count",
                                page: function (data) {
                                    if (data["odata.nextLink"] !== undefined) {
                                        var skip = data["odata.nextLink"].split('skip=')[1];
                                        return Math.ceil(parseInt(skip, 10) / p.rowNum);
                                    }

                                    var total = data["odata.count"];
                                    return Math.ceil(parseInt(total, 10) / p.rowNum);
                                },
                                total: function (data) {
                                    var total = data["odata.count"];
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
                    datatype: 'json'     //json,xml
                }, options || {});

                //xml dataType is not supported
                o.datatype = 'json';

                if (!o.version || o.version < 4) {
                    o = $.extend(true, {
                        annotations: false,
                        annotationName: "",
                        inlinecount: true,
                        count: false,
                        top: false
                    }, o || {});
                }
                else {
                    o = $.extend(true, {
                        annotations: true,
                        annotationName: "@jqgrid.GridModelAnnotate",
                        inlinecount: false,
                        count: true,
                        top: true
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
                        metadataurl: (options.odataurl || p.url) + '/$metadata'
                    }, options || {});

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
                async: o.async,
                cache: false
            })
            .done(function (data, st, xhr) {
                var i = 0, j = 0, isInt, isNum, isDate;
                var intTypes = 'Edm.Byte,Edm.Int16,Edm.Int32,Edm.Int64,Edm.SByte';
                var numTypes = 'Edm.Decimal,Edm.Double,Edm.Single';

                if (o.datatype === 'json') { data = resolveReferences(data); }
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

            //http:// stackoverflow.com/questions/15312529/resolve-circular-references-from-json-object
            function resolveReferences(json) {
                if (typeof json === 'string')
                    json = JSON.parse(json);

                var byid = {}, // all objects by id
                    refs = []; // references to objects that could not be resolved
                json = (function recurse(obj, prop, parent) {
                    if (typeof obj !== 'object' || !obj) // a primitive value
                        return obj;
                    if (Object.prototype.toString.call(obj) === '[object Array]') {
                        for (var i = 0; i < obj.length; i++) {
                            // check also if the array element is not a primitive value
                            if (typeof obj[i] !== 'object' || !obj[i]) // a primitive value
                                return obj[i];
                            else if ("$ref" in obj[i])
                                obj[i] = recurse(obj[i], i, obj);
                            else
                                obj[i] = recurse(obj[i], prop, obj);
                        }
                        return obj;
                    }
                    if ("$ref" in obj) { // a reference
                        var ref = obj.$ref;
                        if (ref in byid)
                            return byid[ref];
                        // else we have to make it lazy:
                        refs.push([parent, prop, ref]);
                        return;
                    } else if ("$id" in obj) {
                        var id = obj.$id;
                        delete obj.$id;
                        if ("$values" in obj) // an array
                            obj = obj.$values.map(recurse);
                        else {// a plain object
                            for (var prop in obj) {
                                obj[prop] = recurse(obj[prop], prop, obj);
                            }
                        }
                        byid[id] = obj;
                    }
                    return obj;
                })(json); // run it!

                for (var i = 0; i < refs.length; i++) { // resolve previously unknown references
                    var ref = refs[i];
                    ref[0][ref[1]] = byid[ref[2]];
                    // Notice that this throws if you put in a reference at top-level
                }
                return json;
            }

            function parseJsonData(data, entityType) {
                var cols = [], props, keys, key, name, type, nullable, iskey, i, j;
                var schemaElements = (data.SchemaElements.$values || data.SchemaElements);
                for (i = 0; i < schemaElements.length ; i++) {
                    if (schemaElements[i].Name === o.entityType) {
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
        }
    });
}(jQuery));