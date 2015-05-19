/**
 * jqGrid pivot functions
 * Tony Tomov tony@trirand.com, http://trirand.com/blog/
 * Changed by Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
*/

/*jshint eqeqeq:false */
/*global jQuery */
/*jslint eqeq: true, plusplus: true, white: true */
(function ($) {
	"use strict";
	// To optimize the search we need custom array filter
	// This code is taken from
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
	var jgrid = $.jgrid;
	jgrid.extend({
		pivotSetup: function (data, options) {
			// data should come in json format
			// The function return the new colModel and the transformed data
			// again with group setup options which then will be passed to the grid
			var columns = [], pivotrows = [], isArray = $.isArray,
				summaries = {}, member = {}, labels = {},
				groupOptions = {
					grouping: true,
					groupingView: {
						groupField: [],
						groupSummary: [],
						groupSummaryPos: []
					}
				},
				headers = [],
				o = $.extend({
					rowTotals: false,
					rowTotalsText: "Total",
					// summary columns
					colTotals: false,
					groupSummary: true,
					groupSummaryPos: "header",
					frozenStaticCols: false
				}, options || {}),
				row, rowindex, i, nRows = data.length, xlen, ylen, aggrlen, tmp, newObj, dn, colc, iRow, groupfields,
				tree = {}, xValues, yValues, k, currentLevel, current, nm, plen, v,
				existing, kk, lastval = [];

			/*
			 * Filter the data to a given criteria. Return the first occurrence
			 */
			function findPivotRowByXValues(pivotRows) {
				var j, pivotRow, iPivotRows, length = pivotRows.length, xValue, isTheSame; // name

				for (iPivotRows = 0; iPivotRows < length; iPivotRows++) {
					pivotRow = pivotRows[iPivotRows];
					isTheSame = true;
					// test ALL xValues with the value of existing pivot row
					for (j = 0; j < xValues.length; j++) {
						xValue = xValues[j];
						if (pivotRow[xValue.name] !== xValue.value) {
							isTheSame = false;
							break;
						}
					}
					if (isTheSame) {
						// if no differences found then the row is already exist
						return iPivotRows;
					}
				}
				return -1;
			}
			/*
			 * Perform calculations of the pivot values.
			 */
			function calculation(oper, v, field, rc) {
				var ret = 0, vOld = parseFloat(v || 0), vNew = parseFloat((rc[field] || 0));
				switch (oper) {
					case "sum":
						ret = vOld + vNew;
						break;
					case "count":
						if (v === "" || v == null) {
							v = 0;
						}
						ret = rc.hasOwnProperty(field) ? v + 1 : v;
						break;
					case "min":
						ret = v === "" || v == null ?
							vNew :
							Math.min(vOld, vNew);
						break;
					case "max":
						ret = v === "" || v == null ?
							vNew :
							Math.max(vOld, vNew);
						break;
				}
				return ret;
			}
			/*
			 * The function aggregates the values of the pivot grid.
			 * Return the current row with pivot summary values
			 */
			function agregateFunc(row, aggr, value, curr) {
				// default is sum
				var arrln = aggr.length, n, label, j, jv, mainval = "", swapvals = [], tmpmember, vl;
				if (isArray(value)) {
					jv = value.length;
					swapvals = value;
				} else {
					jv = 1;
					swapvals[0] = value;
				}
				labels = {};
				member = { root: 0 };
				for (j = 0; j < jv; j++) {
					tmpmember = {};
					vl = value[j].replace(/\s+/g, "");
					label = mainval !== "" ? mainval + "_" + vl : vl;
					for (n = 0; n < arrln; n++) {
						if (value === null) {
							label = $.trim(aggr[n].member) + "_" + aggr[n].aggregator;
							vl = label;
							swapvals[j] = vl;
						} else {
						    if (arrln !== 1) {
						        try {
						            label += "_" + aggr[n].aggregator + "_" + String(n);
						        } catch (ignore) { }
						    }
						}
						label = !isNaN(parseInt(label, 10)) ? label + " " : label;
						curr[label] = tmpmember[label] = calculation(aggr[n].aggregator, curr[label], aggr[n].member, row);
						if (j <= 1 && vl !== "_r_Totals" && mainval === "") { // this does not fix full the problem
							mainval = vl;
						}
					}
					//vl = !isNaN(parseInt(vl,10)) ? vl + " " : vl;
					member[label] = tmpmember;
					labels[label] = swapvals[j];
				}
				return curr;
			}
			// Making the row totals without to add in yDimension
			if (o.rowTotals && o.yDimension.length > 0) {
				dn = o.yDimension[0].dataName;
				o.yDimension.splice(0, 0, { dataName: dn });
				o.yDimension[0].converter = function () {
					return "_r_Totals";
				};
			}
			// build initial columns (colModel) from xDimension
			xlen = isArray(o.xDimension) ? o.xDimension.length : 0;
			ylen = o.yDimension.length;
			aggrlen = isArray(o.aggregates) ? o.aggregates.length : 0;
			if (xlen === 0 || aggrlen === 0) {
				throw ("xDimension or aggregates options are not set!");
			}
			for (i = 0; i < xlen; i++) {
				current = o.xDimension[i];
				colc = { name: current.dataName, frozen: o.frozenStaticCols };
				if (current.isGroupField == null) {
					current.isGroupField = true;
				}
				colc = $.extend(true, colc, current);
				columns.push(colc);
			}
			groupfields = xlen - 1;
			//tree = { text: "root", leaf: false, children: [] };
			//loop over all the source data
			for (iRow = 0; iRow < nRows; iRow++) {
				row = data[iRow];
				xValues = [];
				yValues = [];
				tmp = {};
				// build the data from xDimension
				for (i = 0; i < xlen; i++) {
					dn = o.xDimension[i].dataName;
					v = $.trim(row[dn]);
					xValues.push({name: dn, value: v });
					tmp[dn] = v;
				}

				rowindex = findPivotRowByXValues(pivotrows);
				newObj = rowindex >= 0 ? pivotrows[rowindex] : null;
				// if yDimension is set
				if (ylen >= 1) {
					// build the cols set in yDimension
					for (k = 0; k < ylen; k++) {
						current = o.yDimension[k];
						v = $.trim(row[current.dataName]);
						// Check to see if we have user defined conditions
						yValues.push(current.converter && $.isFunction(current.converter) ?
								current.converter.call(this[0], v, xValues) :
								v);
					}
					// make the columns based on aggregates definition
					// and return the members for late calculation
					newObj = agregateFunc(row, o.aggregates, yValues, newObj || tmp);
				} else {
					// if not set use direct the aggregates
					newObj = agregateFunc(row, o.aggregates, null, newObj || tmp);
				}
				// the pivot exists
				if (rowindex >= 0) {
					// update the row
					pivotrows[rowindex] = newObj;
				} else {
					// if the row is not in our set
					// add the result in pivot rows
					pivotrows.push(newObj);
				}

				current = null;
				existing = null;
				// Build a JSON tree from the member (see aggregateFunc)
				// to make later the columns
				currentLevel = 0;
				for (kk in member) {
					if (member.hasOwnProperty(kk)) {
						if (currentLevel === 0) {
							if (!tree.children || tree.children === undefined) {
								tree = { text: kk, level: 0, children: [], label: kk };
							}
							current = tree.children;
						} else {
							existing = null;
							for (i = 0; i < current.length; i++) {
								if (current[i].text === kk) {
									//current[i].fields=member[kk];
									existing = current[i];
									break;
								}
							}
							if (existing) {
								current = existing.children;
							} else {
								current.push({ children: [], text: kk, level: currentLevel, fields: member[kk], label: labels[kk] });
								current = current[current.length - 1].children;
							}
						}
						currentLevel++;
					}
				}
			}
			if (ylen > 0) {
				headers[ylen - 1] = { useColSpanStyle: false, groupHeaders: [] };
			}
			/*
			 * Recursive function which uses the tree to build the
			 * columns from the pivot values and set the group Headers
			 */
			function list(items) {
				var l, j, key, n, col, collen, colpos, l1, ll, header, initColLen;
				for (key in items) { // iterate
					if (items.hasOwnProperty(key)) {
						// write amount of spaces according to level
						// and write name and newline
						if (typeof items[key] !== "object") {
							// If not a object build the header of the appropriate level
							if (key === "level") {
								if (lastval[items.level] === undefined) {
									lastval[items.level] = "";
									if (items.level > 0 && items.text !== "_r_Totals") {
										headers[items.level - 1] = {
											useColSpanStyle: false,
											groupHeaders: []
										};
									}
								}
								if (lastval[items.level] !== items.text && items.children.length && items.text !== "_r_Totals") {
									if (items.level < ylen && items.level > 0) {
										header = headers[items.level - 1];
										for (l = 0, initColLen = 0; l < header.groupHeaders.length; l++) {
											initColLen += header.groupHeaders[l].numberOfColumns;
										}
										header.groupHeaders.push({
											titleText: items.label,
											numberOfColumns: 0
										});
										collen = header.groupHeaders.length - 1;
										colpos = initColLen + xlen;
										if (items.level - 1 === (o.rowTotals ? 1 : 0)) {
											if (collen > 0) {
												l1 = header.groupHeaders[collen].numberOfColumns;
												if (l1) {
													colpos = l1 + 1 + o.aggregates.length;
												}
											}
										}
										header.groupHeaders[collen].startColumnName = columns[colpos].name;
										header.groupHeaders[collen].numberOfColumns = columns.length - colpos;
									}
								}
								lastval[items.level] = items.text;
							}
							// This is in case when the member contain more than one summary item
							if (items.level === ylen && key === "level" && ylen > 0) {
								if (aggrlen > 1) {
									ll = 1;
									header = headers[ylen - 1];
									for (l in items.fields) {
										if (items.fields.hasOwnProperty(l)) {
											if (ll === 1) {
												header.groupHeaders.push({ startColumnName: l, numberOfColumns: 1, titleText: items.label });
											}
											ll++;
										}
									}
									header.groupHeaders[header.groupHeaders.length - 1].numberOfColumns = ll - 1;
								} else {
									headers.splice(ylen - 1, 1);
								}
							}
						}
						// if object, call recursively
						if (items[key] != null && typeof items[key] === "object") {
							list(items[key]);
						}
						// Finally build the coulumns
						if (key === "level") {
							if (items.level === ylen || (o.rowTotals && items.text === "_r_Totals")) {
								j = 0;
								for (l in items.fields) {
									if (items.fields.hasOwnProperty(l)) {
										col = {};
										for (n in o.aggregates[j]) {
											if (o.aggregates[j].hasOwnProperty(n)) {
												switch (n) {
													case "member":
													case "label":
													case "aggregator":
														break;
													default:
														col[n] = o.aggregates[j][n];
												}
											}
										}
										if (aggrlen > 1) {
											col.name = l;
											col.label = o.aggregates[j].label || items.label;
										} else {
											col.name = items.text;
											col.label = items.text === "_r_Totals" ? o.rowTotalsText : items.label;
										}
										columns.push(col);
										j++;
									}
								}
							}
						}
					}
				}
			}

			list(tree);
			// loop again trough the pivot rows in order to build grand total
			if (o.colTotals) {
				plen = pivotrows.length;
				while (plen--) {
					for (i = xlen; i < columns.length; i++) {
						nm = columns[i].name;
						if (!summaries[nm]) {
							summaries[nm] = parseFloat(pivotrows[plen][nm] || 0);
						} else {
							// TODO: implement not only SUM in colTotals
							summaries[nm] += parseFloat(pivotrows[plen][nm] || 0);
						}
					}
				}
			}
			// based on xDimension  levels build grouping
			if (groupfields > 0) {
				for (i = 0; i < groupfields; i++) {
					if (columns[i].isGroupField) {
						groupOptions.groupingView.groupField.push(columns[i].name);
						groupOptions.groupingView.groupSummary.push(o.groupSummary);
						groupOptions.groupingView.groupSummaryPos.push(o.groupSummaryPos);
					}
				}
			} else {
				// no grouping is needed
				groupOptions.grouping = false;
			}
			groupOptions.sortname = columns[groupfields].name;
			groupOptions.groupingView.hideFirstGroupCol = true;

			// return the final result.
			return { colModel: columns, rows: pivotrows, groupOptions: groupOptions, groupHeaders: headers, summary: summaries };
		},
		jqPivot: function (data, pivotOpt, gridOpt, ajaxOpt) {
			return this.each(function () {
				var $t = this, $self = $($t), $j = $.fn.jqGrid;

				function pivot(data) {
					var pivotGrid = $j.pivotSetup.call($self, data, pivotOpt),
						gHead = pivotGrid.groupHeaders,
						assocArraySize = function (obj) {
							// http://stackoverflow.com/a/6700/11236
							var size = 0, key;
							for (key in obj) {
								if (obj.hasOwnProperty(key)) {
									size++;
								}
							}
							return size;
						},
						footerrow = assocArraySize(pivotGrid.summary) > 0 ? true : false,
						groupingView = pivotGrid.groupOptions.groupingView,
						query = jgrid.from.call($t, pivotGrid.rows), i;
					for (i = 0; i < groupingView.groupField.length; i++) {
						query.orderBy(groupingView.groupField[i],
							gridOpt != null && gridOpt.groupingView && gridOpt.groupingView.groupOrder != null && gridOpt.groupingView.groupOrder[i] === "desc" ? "d" : "a",
							"text",
							"");
					}
					$j.call($self, $.extend(true, {
						datastr: $.extend(query.select(), footerrow ? { userdata: pivotGrid.summary } : {}),
						datatype: "jsonstring",
						footerrow: footerrow,
						userDataOnFooter: footerrow,
						colModel: pivotGrid.colModel,
						viewrecords: true,
						sortname: pivotOpt.xDimension[0].dataName // ?????
					}, pivotGrid.groupOptions, gridOpt || {}));
					if (gHead.length) {
						for (i = 0; i < gHead.length; i++) {
							if (gHead[i] && gHead[i].groupHeaders.length) {
								$j.setGroupHeaders.call($self, gHead[i]);
							}
						}
					}
					if (pivotOpt.frozenStaticCols) {
						$j.setFrozenColumns.call($self);
					}
				}

				if (typeof data === "string") {
					$.ajax($.extend({
						url: data,
						dataType: "json",
						success: function (data) {
							pivot(jgrid.getAccessor(data, ajaxOpt && ajaxOpt.reader ? ajaxOpt.reader : "rows"));
						}
					}, ajaxOpt || {}));
				} else {
					pivot(data);
				}
			});
		}
	});
}(jQuery));
