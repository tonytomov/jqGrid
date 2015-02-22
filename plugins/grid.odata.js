
(function($){
/*
 * jqGrid OData (WebApi v3/v4) support
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
 * TODO: add OData v4 server side part that generates annotations.
 */

 "use strict";
$.jgrid.extend({
	setColModelMetadata: function (savecolfunc, successfunc, errorfunc) {
		var $t = this;
		if (!$t.grid ) { return; }
		
		$.ajax({
			url: $t.url+'/$metadata',
			type: 'GET',
			dataType: 'xml'
		})
		.done(function (data, st, xhr) {
			//var xmldata = $.parseXML(xhr.responseText);
			var props = $('EntityType[Name!="Default"] Property', data);
			if (props.length > 0) {
				$t.colModel = [];
				props.each(function (n, itm) {
					var name = $(itm).attr('Name');
					var type = $(itm).attr('Type').replace('Edm.', '');
					var nullable = $(itm).attr('Nullable');
					
					var origcol = { label: name, name: name, index: name, editable: true };
					var newcol = $self.triggerHandler("jqGridODataSaveColumnModel", origcol);
					if (newcol === undefined && $.isFunction(savecolfunc)) { newcol = savecolfunc(origcol); }		
					if (newcol !== undefined) {
						$t.colModel.push(newcol);
					}
				});
				
				if($.isFunction(successfunc)) { successfunc(data, st, xhr); }
			}
			else
			{
				if($.isFunction(errorfunc)) { errorfunc(data, st, xhr); }
			}
		})
		.fail(function (jqXHR, st, err) {
			if($.isFunction(errorfunc)) { errorfunc(jqXHR, st, err); }
		});
	}

	initODataDefaults: function (p) {
		return this.each(function(){
			var $t = this;
			if (!$t.grid ) { return; }
			
			p = $.extend(true, {
				pageSize: $t.rowNum,
				annotations: false,
				annotationName: "@jqgrid.GridModelAnnotate",
				inlinecount: true,
				count: false,
				top: false
			}, p || {});
			
			$t.inlineEditing({
				beforeSaveRow: function (options, rowid, frmoper) {
					if (options.extraparam.oper === 'edit') {
						options.url = $t.url;
						options.mtype = "PATCH";
						options.url += '(' + rowid + ')';
					}
					else {
						options.url = $t.url;
						options.mtype = "PUT";
					}

					return true;
				},
				serializeSaveData: function (postdata) {
					return JSON.stringify(postdata);
				}
			});

			$t.formEditing({
				onclickSubmit: function (options, postdata, frmoper) {
					if (frmoper === 'add') {
						options.url = $t.url;
						options.mtype = "POST";
					}
					else if (frmoper === 'edit') {
						options.url = $t.url + '(' + postdata[$t.gID + "_id"] + ')';
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

			$t.formDeleting({
				url: $t.url,
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
			
			$t.p.serializeGridData = function (postData) {
					postData = setupWebServiceData(postData);
					return postData;
				};
				
			$t.p.ajaxGridOptions = {
					contentType: "application/json;charset=utf-8",
					datatype: 'json'
				};

			$.extend(true, $.jgrid.defaults, {
				datatype: "json",
				mtype: 'GET',
				rowNum: p.pageSize,
				jsonReader: {
					root: "value",
					repeatitems: false,
					records: "odata.count",
					page: function (data) {
						if (data["odata.nextLink"] !== undefined) {
							var skip = data["odata.nextLink"].split('skip=')[1];
							return Math.ceil(parseInt(skip, 0) / $t.rowNum);
						}
						else {
							var total = data["odata.count"];
							return Math.ceil(parseInt(total, 0) / $t.rowNum);
						}
					},
					total: function (data) {
						var total = data["odata.count"];
						return Math.ceil(parseInt(total, 0) / $t.rowNum);
					},
					userdata: "userdata"
				}
			});

			if (p.annotations) {
				$.extend(true, $.jgrid.defaults, {
					loadBeforeSend: function (jqXHR) {
						jqXHR.setRequestHeader("Prefer", 'odata.include-annotations="*"');
					},
					jsonReader: {
						root: "value",
						repeatitems: false,
						records: function(data) { return data[p.annotationName].records; },
						page: function(data) { return data[p.annotationName].page; },
						total: function(data) { return data[p.annotationName].total; },
						userdata: function(data) { return data[p.annotationName].userdata; }
					}
				});
			}
		});
	}

	setupWebServiceData: function (postData) {
		// basic posting parameters to the OData service.
		var params = {
			//$top: postData.rows, //- we cannot use $top because of it removes odata.nextLink parameter
			$skip: (parseInt(postData.page, $t.rowNum) - 1) * $t.rowNum,
			//$inlinecount: "allpages" //- not relevant for V4
		};

		if (p.count) {params.$count = true;}
		if (p.top) {params.$top = postData.rows;}
		if (p.inlinecount) {params.$inlinecount = "allpages";}

		// if we have an order-by clause to use, then we build it.
		if (postData.sidx) {
			// two columns have the following data:
			// postData.sidx = "{ColumnName} {order}, {ColumnName} "
			// postData.sord = "{order}"
			// we need to split sidx by the ", " and see if there are multiple columns.  If there are, we need to go through
			// each column and get its parts, then parse that for the appropriate columns to build for the sort.

			params.$orderby = postData.sidx + " " + postData.sord;
		}

		if (!postData._search) {return params;}

		// if we want to support "in" clauses, we need to follow this stackoverflow article:
		//http://stackoverflow.com/questions/7745231/odata-where-id-in-list-query/7745321#7745321
		// this is for basic searching, with a single term.
		if (postData.searchField && (postData.searchString !== null || postData.searchOper === 'nu' || postData.searchOper === 'nn')) {
			//append '' when searched field is of the string type
			//var col = getGridColumn(postData.searchField);
			var col = $.grep($t.colModel, function (n, i) { return n.name === postData.searchField; });
			if (col !== null && col.length > 0) {
				col = col[0];
				if (col.stype === 'select' && rule.data.length === 0){
					return params;
				}
				if (col.stype === 'select') {
					postData.searchField = postData.searchField + '/' + $t.jsonReader.id;
				}
				else if (col.searchrules === undefined || col.searchrules.integer !== true) {
					postData.searchString = "'" + postData.searchString + "'";
				}
				else if (rule.searchString === '') {
					return params;
				}
			}

			params.$filter = odataExpression(postData.searchOper, postData.searchField, postData.searchString);
		}

		// complex searching, with a groupOp.  This is for if we enable the form for multiple selection criteria.
		if (postData.filters) {
			var filterGroup = $.parseJSON(postData.filters);
			var groupSearch = parseFilterGroup(filterGroup);

			if (groupSearch.length > 0) {
				params.$filter = groupSearch;
			}
		}

		return params;
	}

	// builds out OData expressions... the condition.
	odataExpression: function (op, field, data) {
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
	}

	// when dealing with the advanced query dialog, this parses the encapsulating Json object
	// which we will then build the advanced OData expression from.
	parseFilterGroup: function (filterGroup) {
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

				if (rule.data === null && rule.op !== 'nu' && rule.op !== 'nn') {
					continue;
				}

				var col = $.grep($t.colModel, function (n, i) { return n.name === rule.field; });
				if (col !== null && col.length > 0) {
					col = col[0];
					if (col.stype === 'select' && rule.data.length === 0) {
						continue;
					}
					if (col.stype === 'select') {
						rule.field = rule.field + '/' + $t.jsonReader.id;
					}
					else if (col.searchrules === undefined || col.searchrules.integer !== true) {
						rule.data = "'" + rule.data + "'";
					}
					else if (rule.data === '') {
						continue;
					}
				}
				filterText += odataExpression(rule.op, rule.field, rule.data) + " " + filterGroup.groupOp.toLowerCase() + " ";
			}
		}

		filterText = filterText.trim().replace(/.(and|or)$/, '').trim();

		return filterText;
	}
}(jQuery));
