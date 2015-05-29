/**
 * jqGrid pivot functions
 * Tony Tomov tony@trirand.com, http://trirand.com/blog/
 * Full rewritten by Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
*/

/*jshint eqeqeq:false */
/*global jQuery */
/*jslint eqeq: true, plusplus: true, white: true */
(function ($) {
	"use strict";
	var jgrid = $.jgrid;
	jgrid.extend({
		pivotSetup: function (data, options) {
			// data should come in json format
			// The function return the new colModel and the transformed data
			// again with group setup options which then will be passed to the grid
			var self = this[0], isArray = $.isArray, summaries = {},
				groupingView = {
					groupField: [],
					groupSummary: [],
					groupSummaryPos: []
				},
				groupOptions = {
					grouping: true,
					groupingView: groupingView
				},
				o = $.extend({
					rowTotals: false,
					rowTotalsText: "{0} {1}",
					useColSpanStyle: false,
					trimByCollect: true,
					footerTotals: false, // old colTotals option
					groupSummary: true,
					groupSummaryPos: "header",
					frozenStaticCols: false,
					defaultFormatting: true,
					sortByX: false,
					sortByY: true
				}, options || {}),
				row, i, nRows = data.length, x, y, cm, iRow,	xValues, yValues, k, nm, v,	iXData, itemXData, isDifferent,
				xDimension = o.xDimension, yDimension = o.yDimension, aggregates = o.aggregates, aggrContext,
				isRowTotal = o.totalText || o.rowTotals || o.totalHeader,
				xlen = isArray(xDimension) ? xDimension.length : 0,
				ylen = isArray(yDimension) ? yDimension.length : 0,
				aggrlen = isArray(aggregates) ? aggregates.length : 0,
				// The next array uniqueXData will contains unique vectors (arrays) of xValues
				// from the input data. The length of vectors (arrays) will be always the same - xlen
				// (the length of xDimension array)
				uniqueXData = [], uniqueXDataLength = 0, // uniqueXDataLength is uniqueXData.length
				// The length of the next array will be the same as the length of uniqueXData
				// the value will be array of indexes in input data array with the same xValues
				dataIndexByUniqueXData = [], indexesOfDataWithTheSameXValues, converter, iYData, itemYData,
				uniqueYData = [], uniqueYDataLength = 0,
				dataIndexToUniqueYData = [], dataIndexByUniqueYData = [], orderY = [], orderX = [],
				indexesOfDataWithTheSameYValues, iRows, colModel = [], agr, outputItem, outputItems = [],
				previousY, headerLevels = ylen - (aggrlen === 1 ? 1 : 0),
				colHeaders = [], groupHeaders, iRowsY,
				initAggregation = function (aggregator) {
					return {
						result: undefined,
						count: undefined,
						aggregator: aggregator,
						finilized: false,
						calcAggregate: function (v, fieldName) {
							var aggr = this;
							if (v !== undefined) {
								aggr.result = aggr.result || 0; // change undefined to 0
								v = parseFloat(v);
								switch(aggr.aggregator) {
									case "sum":
										aggr.result += v;
										break;
									case "count":
										aggr.result++;
										break;
									case "avg":
										aggr.result += v;
										aggr.count = aggr.count || 0; // change undefined to 0
										aggr.count++;
										break;
									case "min":
										aggr.result = Math.min(aggr.result, v);
										break;
									case "max":
										aggr.result = Math.max(aggr.result, v);
										break;
									default:
										if ($.isFunction(aggr.aggregator)) {
											aggr.result = aggr.aggregator.call(self, aggr.result, v, fieldName, row);
										}
										break;
								}
							}
						},
						finilizeAggregation: function () {
							var aggr = this;
							if (aggr.aggregator === "avg" && aggr.result !== undefined) {
								aggr.result = aggr.result/aggr.count;
							}
							aggr.finilized = true;
						},
						setPropIfDefinedResult: function (obj, propName) {
							var aggr = this;
							if (aggr.result !== undefined) {
								if (!aggr.finilized) { this.finilizeAggregation(); }
								obj[propName] = aggr.result;
							}
						}
					};
				};

			if (xlen === 0 || aggrlen === 0) {
				throw ("xDimension or aggregates options are not set!");
			}

			// ****************************************************************
			// The step 1: scan input data and build the list of unique xValues
			// ****************************************************************
			// We will build later the array outputItems which will be used as the input data of jqGrid.
			// Every data item with unique set of xDimension elements build new row of data
			// (new item in the outputItems array)
			for (iRow = 0; iRow < nRows; iRow++) {
				row = data[iRow];

				// build the set of xValues with data of the current row
				xValues = [];
				for (i = 0; i < xlen; i++) {
					v = row[xDimension[i].dataName];
					if (o.trimByCollect) {
						v = $.trim(v);
					}
					xValues.push(v);
				}

				// look through uniqueXData and validate whether the current item
				// have new set of xValues or the same set already was in some previous item
				isDifferent = true; // it's need be set to add the first item in uniqueXData
				for (iXData = 0; iXData < uniqueXDataLength; iXData++) {
					itemXData = uniqueXData[iXData];
					isDifferent = false;
					for (i = 0; i < xlen; i++) {
						v = row[xDimension[i].dataName];
						if (o.trimByCollect) {
							v = $.trim(v);
						}
						if ($.trim(v) !== itemXData[i]) {
							// row have one xValue which is different as itemXData. we need try with another item
							isDifferent = true;
							break;
						}
					}
					if (!isDifferent) {
						// we found an item in uniqueXData which is identical by xValues
						// with the existing item of uniqueXData. The array dataIndexByUniqueXData[iRow]
						// will hold indexes of all items of the source data array with the xValues
						dataIndexByUniqueXData[iXData].push(iRow);
						break;
					}
				}
				if (isDifferent) {
					dataIndexByUniqueXData.push([iRow]);
					uniqueXData.push(xValues);
					uniqueXDataLength++;
				}
			}
			// We know now that the input jqGrid data (the outputItems array) will have uniqueXDataLength rows

			// ****************************************************************
			// The step 2: scan input data and build the list of unique yValues
			// ****************************************************************
			// We will build the columns of outputItems from every row of uniqueXData.
			// The columns will contains different unique vectors (arrays) of yValues
			// from the input data for all items.
			// We will enumerate the input items grouped by the same xValues although it's
			// not really required. We well scan all input data in any way.
			for (iXData = 0; iXData < uniqueXDataLength; iXData++) {
				itemXData = uniqueXData[iXData];
				indexesOfDataWithTheSameXValues = dataIndexByUniqueXData[iXData];
				for (i = 0; i < indexesOfDataWithTheSameXValues.length; i++) {
					iRow = indexesOfDataWithTheSameXValues[i];
					row = data[iRow];

					// build the set of yValues with data of the current row
					yValues = [];
					for (k = 0; k < ylen; k++) {
						y = yDimension[k];
						v = row[y.dataName];
						if (o.trimByCollect) {
							v = $.trim(v);
						}
						converter = y.converter;
						yValues.push(
							$.isFunction(converter) ? converter.call(self, v, itemXData, row) : v
						);
					}
					// look through uniqueXData and validate whether the current item
					// have new set of xValues or the same set already was in some previous item
					isDifferent = true; // it's need be set to add the first item in uniqueXData
					for (iYData = 0; iYData < uniqueYDataLength; iYData++) {
						itemYData = uniqueYData[iYData];
						isDifferent = false;
						for (k = 0; k < ylen; k++) {
							v = row[yDimension[k].dataName];
							if (o.trimByCollect) {
								v = $.trim(v);
							}
							if (v !== itemYData[k]) {
								// row have one xValue which is different as itemXData. we need try with another item
								isDifferent = true;
								break;
							}
						}
						if (!isDifferent) {
							// we found an item in uniqueYData which is identical by yValues
							// with the existing item of uniqueXData. We save the index in
							// dataIndexToUniqueYData array. Now dataIndexToUniqueYData[iRow]
							// will 
							dataIndexToUniqueYData.push(iYData);
							dataIndexByUniqueYData[iYData].push(iRow);
							break;
						}
					}
					if (isDifferent) {
						dataIndexToUniqueYData.push(uniqueYDataLength);
						dataIndexByUniqueYData.push([iRow]);
						uniqueYData.push(yValues);
						uniqueYDataLength++;
					}
				}
			}
			// We know now that the input jqGrid data the outputItems array) have uniqueXDataLength rows
			// and uniqueXDataLength+(uniqueYDataLength*aggregates.length) columns.
			// If we want to have additional totals: true in some yDimension item then
			// we will have additional columns with totals over every YData + on every Y-level
			
			// ********************
			// the step 3: Ordering
			// ********************
			// We have to sort uniqueYData and reorder dataIndexToUniqueYData and dataIndexByUniqueYData
			// correspond the resorting.
			for (iYData = 0; iYData < uniqueYDataLength; iYData++) {
				orderY.push(iYData);
			}
			if (o.sortByY) {
				orderY.sort(function (a, b) {
					var uniqueYDataA = uniqueYData[a], uniqueYDataB = uniqueYData[b], va, vb;
					for (k = 0; k < ylen; k++) {
						va = uniqueYDataA[k];
						vb = uniqueYDataB[k];
					    if (yDimension[k].sorttype === "number" && va !== undefined && vb !== undefined) {
							va = parseFloat(va);
							vb = parseFloat(vb);
						}
						if (va < vb) {
							return -1;
						}
						if (va > vb) {
							return 1;
						}
					}
					return 0;
				});
			}
			// now we will access uniqueYData not directly, but by using
			// uniqueYData[orderY[iYData]] to get the order of columns which can be
			// better grouped in column headers

			// We have to sort uniqueYData and reorder dataIndexToUniqueYData and dataIndexByUniqueYData
			// correspond the resorting.
			for (iXData = 0; iXData < uniqueXDataLength; iXData++) {
				orderX.push(iXData);
			}
			if (o.sortByX) {
				orderX.sort(function (a, b) {
					var uniqueXDataA = uniqueXData[a], uniqueXDataB = uniqueXData[b];
					for (i = 0; i < xlen; i++) {
						if (uniqueXDataA[i] < uniqueXDataB[i]) {
							return -1;
						}
						if (uniqueXDataA[i] > uniqueXDataB[i]) {
							return 1;
						}
					}
					return 0;
				});
			}
			// now will will access uniqueXData not directly, but by using
			// uniqueXData[orderX[iXData]] to get the order of columns which can be
			// better grouped in column headers
			
			// *******************************************
			// The step 4: build colModel and groupOptions
			// *******************************************
			// fill the first xlen columns of colModel and fill the groupOptions
			// the names of the first columns will be "x"+i. The first column have the name "x0".
			for (i = 0; i < xlen; i++) {
				x = xDimension[i];
				cm = {
					name: "x" + i,
					label: x.label != null ?
								($.isFunction(x.label) ? x.totalHeader.call(self, x, i, o) : x.label) :
								x.dataName,
					frozen: o.frozenStaticCols
				};
				if (i < xlen - 1) {
					// based on xDimension levels build grouping
					groupingView.groupField.push(cm.name);
					groupingView.groupSummary.push(o.groupSummary);
					groupingView.groupSummaryPos.push(o.groupSummaryPos);
				}
				cm = $.extend(cm, x);
				delete cm.dataName;
				colModel.push(cm);
			}
			if (xlen < 2) {
				groupOptions.grouping = false; // no grouping is needed
			}
			groupOptions.sortname = colModel[xlen - 1].name;
			groupingView.hideFirstGroupCol = true;

			// fill other columns of colModel based on collected uniqueYData and aggregates options
			// the names of the first columns will be "y"+i in case of one aggregate and
			// "y"+i+"a"+k in case of multiple aggregates. The name of the first "y"-column is "y0" or "y0a0"
			previousY = uniqueYData[orderY[0]];
			for (iYData = 0; iYData < uniqueYDataLength; iYData++) {
				itemYData = uniqueYData[orderY[iYData]];
				// fill first columns of data
				for (k = 0; k < aggrlen; k++) {
					agr = aggregates[k];
					if (agr.template === undefined && agr.formatter === undefined && o.defaultFormatting) {
						agr.template = agr.aggregator === "count" ? "integer" : "number";
					}
					agr = $.extend({}, agr, {
						name: "y" + iYData + (aggrlen === 1 ? "" : "a" + k),
						label: $.isFunction(agr.label) ?
							agr.label.call(self, itemYData, agr, k) :
							jgrid.template(agr.label || "{0}", agr.aggregator, agr.member, itemYData[ylen - 1], k)
					});
					colModel.push(agr);
				}
			}
			// add total columns calculated over all data of the row
			if (isRowTotal) {
				for (k = 0; k < aggrlen; k++) {
					agr = aggregates[k];
					if (agr.template === undefined && agr.formatter === undefined && o.defaultFormatting) {
						agr.template = agr.aggregator === "count" ? "integer" : "number";
					}
					agr = $.extend({}, agr, {
						name: "t" + (aggrlen === 1 ? "" : "a" + k),
						label: $.isFunction(o.totalText) ?
							o.totalText.call(self, agr, k) :
							jgrid.template(o.totalText || "{0}", agr.aggregator, agr.member, k)
					});
					colModel.push(agr);
				}
			}

			// ********************************
			// The step 5: build column headers
			// ********************************
			// initialize colHeaders
			previousY = uniqueYData[orderY[0]];
			for (i = 0; i < headerLevels; i++) {
				colHeaders.push({
					useColSpanStyle: o.useColSpanStyle,
					groupHeaders: [{
						titleText: previousY[i],
						startColumnName: aggrlen === 1 ? "y0" : "y0a0" ,
						numberOfColumns: aggrlen
					}]
				});
			}
			for (i = 0; i < headerLevels; i++) {
				previousY = uniqueYData[orderY[0]];
				for (iYData = 1; iYData < uniqueYDataLength; iYData++) {
					itemYData = uniqueYData[orderY[iYData]];
					groupHeaders = colHeaders[i].groupHeaders;
					isDifferent = false;
					for (k = 0; k <= i; k++) {
						// we need to compare all elements of itemYData with previousY
						// on the current level and on the all hight (top) levels
						if (itemYData[k] !== previousY[k]) {
							isDifferent = true;
							break;
						}
					}
					if (isDifferent) {
						groupHeaders.push({
							titleText: itemYData[i],
							startColumnName: "y" + iYData + (aggrlen === 1 ? "" :"a0"),
							numberOfColumns: aggrlen 
						});
					} else {
						groupHeaders[groupHeaders.length - 1].numberOfColumns += aggrlen;
					}
					previousY = itemYData;
				}
			}
			if (isRowTotal) {
				for (i = 0; i < headerLevels; i++) {
					colHeaders[i].groupHeaders.push({
						titleText: (i < headerLevels - 1 ? "" : o.totalHeader || ""),
						startColumnName: "t" + (aggrlen === 1 ? "" :"a0"),
						numberOfColumns: aggrlen 
					});
				}
			}

			// *****************************
			// The step 6: fill data of grid
			// *****************************
			for (iXData = 0; iXData < uniqueXDataLength; iXData++) {
				outputItem = {}; // item of output data
				
				itemXData = uniqueXData[orderX[iXData]];
				// itemXData is the row of data
				for (i = 0; i < xlen; i++) {
					// fill first columns of data
					outputItem["x" + i] = itemXData[i];
				}

				indexesOfDataWithTheSameXValues = dataIndexByUniqueXData[orderX[iXData]];
				// The rows of input data with indexes from indexesOfDataWithTheSameXValues contains itemXData
				// Now we build columns of itemXData row
				for (iYData = 0; iYData < uniqueYDataLength; iYData++) {
					itemYData = uniqueYData[orderY[iYData]];
					indexesOfDataWithTheSameYValues = dataIndexByUniqueYData[orderY[iYData]];
					// we calculate aggregate in every itemYData 
					for (k = 0; k < aggrlen; k++) {
						iRows = [];
						for (i = 0; i < indexesOfDataWithTheSameYValues.length; i++) {
							iRowsY = indexesOfDataWithTheSameYValues[i];
							if ($.inArray(iRowsY, indexesOfDataWithTheSameXValues) >= 0) {
								iRows.push(iRowsY);
							}
						}
						// iRows array have all indexes of input data which have both itemXData and itemYData
						// We need calculate aggregate agr over all the items
						agr = aggregates[k];
						aggrContext = initAggregation(agr.aggregator); // result = undefined; count = undefined;
						for (iRow = 0; iRow < iRows.length; iRow++) {
							row =  data[iRows[iRow]];
							aggrContext.calcAggregate(row[agr.member], agr.member, row);
						}
						aggrContext.setPropIfDefinedResult(outputItem, "y" + iYData + (aggrlen === 1 ? "" : "a" + k));
					}
				}
				if (isRowTotal) {
					for (k = 0; k < aggrlen; k++) {
						agr = aggregates[k];
						aggrContext = initAggregation(agr.aggregator === "count" ? "sum" : agr.aggregator);
						for (iYData = 0; iYData < uniqueYDataLength; iYData++) {
							aggrContext.calcAggregate(outputItem[["y" + iYData + (aggrlen === 1 ? "" : "a" + k)]], agr.member, row);
						}
						aggrContext.setPropIfDefinedResult(outputItem, "t" + (aggrlen === 1 ? "" : "a" + k));
					}
				}
				outputItems.push(outputItem);
			}

			// loop again trough the pivot rows in order to build grand total
			if (o.footerTotals || o.colTotals) {
				nRows = outputItems.length;
				for (i = 0; i < xlen; i++) {
					summaries["x" + i] = xDimension[i].totalText || "";
				}
				for (i = xlen; i < colModel.length; i++) {
					nm = colModel[i].name;
					aggrContext = initAggregation(o.colTotalAggregator || "sum"); // result = undefined; count = undefined;
					for (iRow = 0; iRow < nRows; iRow++) {
						outputItem = outputItems[iRow];
						aggrContext.calcAggregate(outputItem[nm], nm, outputItem);
					}
					aggrContext.setPropIfDefinedResult(summaries, nm);
				}
			}

			// return the final result.
			return { colModel: colModel, rows: outputItems, groupOptions: groupOptions, groupHeaders: colHeaders, summary: summaries };
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
							// Multiple calls of setGroupHeaders for one grid are wrong,
							// but there are produces good results in case of usage
							// useColSpanStyle: false option. The rowspan values
							// needed be increased in case of usage useColSpanStyle: true
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
