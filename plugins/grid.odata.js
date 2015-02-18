
/*
 * jqGrid OData (WebApi v3) support
 *
 * Authors:
 *  Mark Babayev (https://github.com/mirik123)
 *  Richard Bennett (https://gist.github.com/dealproc)
 * 
 * License MIT (MIT-LICENSE.txt)
 * 
 * based on Richard Bennett gist code: jqGrid.ODataExtensions.js 
 * https://gist.github.com/dealproc/6678280
 *
 * the example of using plugin is shown in InitJqGridODataSample
 *
 * TODO: add OData v4 support using annotations instead of odata.nextLink/odata.count
 */

function InitJqGridODataSample() {
    var colModelDefinition = GetODataMetadata('http://localhost:59661/odata');
    SetODataDefaults('grid', 25, "http://localhost:59661/odata/ODClient", colModelDefinition);

    $("#grid").jqGrid({
        height: '100%',
        pager: $('#gridpager'),
        sortname: 'id',
        viewrecords: true,
        sortorder: "asc",
        deepempty: true,
        altRows: true,
        footerrow: false,
        shrinkToFit: true,
        ignoreCase: true,
        gridview: true,
        headertitles: true,
        sortable: true,
        autowidth: true,
        toppager: true,
        toolbar: [true, 'top'],
        ondblClickRow: function (id) {
            $('#grid').jqGrid('editRow', id, {
                beforeEditRow: function (options, rowid) {
                    return true;
                }
            });
            $("#grid_ilsave").removeClass('ui-state-disabled');
        },
        multiSort: true,
        colModel: colModelDefinition
    })
    .jqGrid("navGrid", "#pg_grid_toppager", { add: true, del: true, edit: true, view: true, reload: true, search: false, cloneToTop: true },
        {
            //edit
            closeAfterEdit: true
        },
        {   //add
            closeAfterAdd: true
        })
    .jqGrid('inlineNav', "#pg_grid_toppager", { add: true, edit: false, save: true, cancel: false,
        editParams: {
            keys: true
        }
    })
    .jqGrid('filterToolbar', { searchOnEnter: false, enableClear: false, stringResult: true })
    .jqGrid('searchGrid', { multipleSearch: true, multipleGroup: false, overlay: 0 });
};

function GetODataMetadata(url) {
    var colModel = [];

    $.ajax({
        url: url+'/$metadata',
        type: 'GET',
        dataType: 'xml',
        async: false
    })
    .done(function (data, st, xhr) {
        
        //var xmldata = $.parseXML(xhr.responseText);
        var props = $('EntityType[Name!="Default"] Property', data);
        props.each(function (n, itm) {
            var name = $(itm).attr('Name');
            var type = $(itm).attr('Type').replace('Edm.', '');
            var isNullable = $(itm).attr('Nullable');
            colModel.push({ label: name, name: name, index: name, editable: true });
        });
    })
    .fail(function (jqXHR, st, err) {
        var title = err, message = jqXHR.responseText;

        if (jqXHR.responseJSON) {
            if (jqXHR.responseJSON.InnerException) {
                title = jqXHR.responseJSON.InnerException.ExceptionMessage;
                message = jqXHR.responseJSON.InnerException.StackTrace;
            }
            else {
                title = jqXHR.responseJSON.ExceptionMessage;
                message = jqXHR.responseJSON.StackTrace;
            }
        }

        $.jgrid.info_dialog($.jgrid.errors.errcap, "<div>Message: " + title + '</div><br/><div>' + message + '</div>', $.jgrid.edit.bClose);
    });

    return colModel;
}

function SetODataDefaults(gID, pageSize, url, colModel) {
    $.extend(true, $.jgrid.inlineEdit, {
        beforeSaveRow: function (options, rowid, frmoper) {
            if (options.extraparam.oper == 'edit') {
                options.url = url;
                options.mtype = "PATCH";
                options.url += '(' + rowid + ')';
            }
            else {
                options.url = url;
                options.mtype = "PUT";
            }

            return true;
        },
        serializeSaveData: function (postdata) {
            return JSON.stringify(postdata);
        }
    });

    $.extend(true, $.jgrid.edit, {
        onclickSubmit: function (options, postdata, frmoper) {
            if (frmoper == 'add') {
                options.url = url;
                options.mtype = "POST";
            }
            else if (frmoper == 'edit') {
                options.url = url + '(' + postdata[gID + "_id"] + ')';
                options.mtype = "PUT";
            }

            return postdata;
        },
        ajaxEditOptions: {
            contentType: 'application/json;charset=utf-8',
            datatype: 'json'
        },
        serializeEditData: function (postdata) {
            return JSON.stringify(postdata);
        }
    });

    $.extend(true, $.jgrid.del, {
        url: url,
        mtype: "DELETE",
        serializeDelData: function (postdata) {
            return "";
        },
        onclickSubmit: function (options, postdata) {
            options.url += '(' + postdata + ')';
            return '';
        },
        ajaxDelOptions: {
            contentType: 'application/json;charset=utf-8',
            datatype: 'json'
        }
    });

    $.extend(true, $.jgrid.defaults, {
        rowNum: pageSize,
        datatype: "json",
        url: url,
        colModel: colModel,
        mtype: 'GET',
        ajaxGridOptions: {
            contentType: "application/json;charset=utf-8",
            datatype: 'json'
        },
        loadBeforeSend: function(jqXHR) {
            jqXHR.setRequestHeader("Prefer", 'odata.include-annotations="*"');
        },
        serializeGridData: function (postData) {
            postData = setupWebServiceData(postData, colModel, pageSize);
            return postData;
        },
        ajaxRowOptions: {
            contentType: "application/json;charset=utf-8",
            dataType: "json"
        },
        serializeRowData: function (postData) {
            return JSON.stringify(postData);
        },
        jsonReader: {
            root: "value",
            repeatitems: false,
            records: "odata.count",
            page: function (data) {
                if (data["odata.nextLink"] != undefined) {
                    var skip = data["odata.nextLink"].split('skip=')[1];
                    return Math.ceil(parseInt(skip) / pageSize);
                }
                else {
                    var total = data["odata.count"];
                    return Math.ceil(parseInt(total) / pageSize);
                }
            },
            total: function (data) {
                var total = data["odata.count"];
                return Math.ceil(parseInt(total) / pageSize);
            },
            userdata: "userdata"
        }
    });
}

function setupWebServiceData(postData, cols, pageSize) {
    // basic posting parameters to the OData service.
    var params = {
        //$top: postData.rows, //- we cannot use $top because of it removes odata.nextLink parameter
        $skip: (parseInt(postData.page, pageSize) - 1) * pageSize,
        $inlinecount: "allpages" //- not relevant for V4
        //$count:true
    };

    // if we have an order-by clause to use, then we build it.
    if (postData.sidx) {
        // two columns have the following data:
        // postData.sidx = "{ColumnName} {order}, {ColumnName} "
        // postData.sord = "{order}"
        // we need to split sidx by the ", " and see if there are multiple columns.  If there are, we need to go through
        // each column and get its parts, then parse that for the appropriate columns to build for the sort.

        params.$orderby = postData.sidx + " " + postData.sord;
    }

    if (!postData._search)
        return params;

    // if we want to support "in" clauses, we need to follow this stackoverflow article:
    //http://stackoverflow.com/questions/7745231/odata-where-id-in-list-query/7745321#7745321
    // this is for basic searching, with a single term.
    if (postData.searchField && (postData.searchString != null || postData.searchOper == 'nu' || postData.searchOper == 'nn')) {
        //append '' when searched field is of the string type
        var col = GetGridColumn(cols, postData.searchField);
        if (col != null) {
            if (col.stype == 'select' && rule.data == '-1')
                return params;
            if (col.stype == 'select')
                postData.searchField = postData.searchField + '/Id';
            else if (col.searchrules == undefined || col.searchrules.integer != true)
                postData.searchString = "'" + postData.searchString + "'";
            else if (rule.searchString == '')
                return params;
        }

        params.$filter = ODataExpression(postData.searchOper, postData.searchField, postData.searchString);
    }

    // complex searching, with a groupOp.  This is for if we enable the form for multiple selection criteria.
    if (postData.filters) {
        var filterGroup = $.parseJSON(postData.filters);
        var groupSearch = parseFilterGroup(filterGroup, cols);

        if (groupSearch.length > 0)
            params.$filter = groupSearch;
    }

    return params;
}

function GetGridColumn(cols, field) {
    var col = $.grep(cols, function (n, i) { return n.name == field; });
    if (col.length == 0)
        return null;
    else
        return col[0];
}

// builds out OData expressions... the condition.
function ODataExpression(op, field, data) {
    switch (op) {
        case "cn":
            return "substringof(" + data + ", " + field + ") eq true";
        case "nc": // does not contain.
            return "substringof(" + data + ", " + field + ") eq false";
        case "bw":
            return "startswith(" + field + ", " + data + ") eq true";
        case "bn": // does not begin with
            return "startswith(" + field + ", " + data + ") eq false";
        case "ew":
            return "endswith(" + field + ", " + data + ") eq true";
        case "en": // does not end with.
            return "endswith(" + field + ", " + data + ") eq false";
        case "nu":
            return field + " eq null";
        case "nn":
            return field + " ne null";
        default:
            return field + " " + op + " " + data;
    }
};

// when dealing with the advanced query dialog, this parses the encapsulating Json object
// which we will then build the advanced OData expression from.
function parseFilterGroup(filterGroup, cols) {
    var filterText = "";
    if (filterGroup.groups) {
        if (filterGroup.groups.length) {
            for (var i = 0; i < filterGroup.groups.length; i++) {
                filterText += "(" + parseFilterGroup(filterGroup.groups[i]) + ")";

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
        for (var i = 0; i < filterGroup.rules.length; i++) {
            var rule = filterGroup.rules[i];

            if (rule.data == null && rule.op != 'nu' && rule.op != 'nn')
                continue;

            var col = GetGridColumn(cols, rule.field);
            if (col != null) {
                if (col.stype == 'select' && rule.data == '-1')
                    continue;
                if (col.stype == 'select')
                    rule.field = rule.field + '/Id';
                else if (col.searchrules == undefined || col.searchrules.integer != true)
                    rule.data = "'" + rule.data + "'";
                else if (rule.data == '')
                    continue;
            }
            filterText += ODataExpression(rule.op, rule.field, rule.data) + " " + filterGroup.groupOp.toLowerCase() + " ";
        }
    }

    filterText = filterText.trim().replace(/.(and|or)$/, '').trim();

    return filterText;
}
