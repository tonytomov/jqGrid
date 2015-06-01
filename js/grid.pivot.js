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
/*jslint eqeq: true, plusplus: true, continue: true, white: true */
(function ($) {
	"use strict";
	function Aggregation (aggregator, context) {
		if (!(this instanceof Aggregation)) {
			return new Aggregation(aggregator);
		}
		//this.result = undefined;
		//this.count = undefined;
		this.aggregator = aggregator;
		this.finilized = false;
		this.context = context;
	}
	Aggregation.prototype.calc = function (v, fieldName, row) {
		var self = this;
		if (v !== undefined) {
			self.result = self.result || 0; // change undefined to 0
			v = parseFloat(v);
			switch(self.aggregator) {
				case "sum":
					self.result += v;
					break;
				case "count":
					self.result++;
					break;
				case "avg":
					if (self.finilized) {
						self.count = self.count || 0; // change undefined to 0
						self.result = (self.result * self.count + v) / (self.count + 1);
						self.count++;
					} else {
						self.result += v;
						self.count = self.count || 0; // change undefined to 0
						self.count++;
					}
					break;
				case "min":
					self.result = Math.min(self.result, v);
					break;
				case "max":
					self.result = Math.max(self.result, v);
					break;
				default:
					if ($.isFunction(self.aggregator)) {
						self.result = self.aggregator.call(self.context, self.result, v, fieldName, row);
					}
					break;
			}
		}
	};
	Aggregation.prototype.getResult = function (obj, propName, forceSaving) {
		var self = this;
		if (self.result !== undefined || forceSaving) {
			if (forceSaving) {
				if (self.result !== undefined) {
					self.result = 0;
					self.count = 0;
				}
			}
			if (self.result !== undefined && !self.finilized && self.aggregator === "avg") {
				self.result = self.result/self.count;
				self.finilized = true;
			}
			obj[propName] = self.result;
		}
	};

	function ArrayOfFieldsets (trimByCollect, caseSensitive, skipSort, dimension, fieldName) {
		var iField, dimensionLength = dimension.length, dimensionItem,
			stringCompare = function (a, b) {
				var a1 = a, b1 = b; 
				if (a1 == null) { a1 = ""; } // we will place undefined and null values as the lowest TOGETHER with ""
				if (b1 == null) { b1 = ""; }
				// be sure that we have no other input data (Number, Date and so on)
				a1 = String(a1);
				b1 = String(b1);
				if (!this.caseSensitive) {
					a1 = a1.toUpperCase();
					b1 = b1.toUpperCase();
				}
				if (a1 === b1) {
					if (a === b) {//typeof a === typeof b) {
						return 0;
					}
					// either a or b is undefined or null
					if (a === undefined) { return -1; } // make undefined less as all other
					if (b === undefined) { return 1; }
					if (a === null) { return -1; } // make null less as all other with the exception undefined
					if (b === null) { return 1; }
				}
				if (a1 < b1) {
					return -1;
				}
				return 1;
			},
			numberCompare = function (a, b) {
				a = Number(a);
				b = Number(b);
				if (a === b) {
					return 0;
				}
				if (a < b) {
					return -1;
				}
				return 1;
			},
			integerCompare = function (a, b) {
				a = Math.floor(Number(a));
				b = Math.floor(Number(b));
				if (a === b) {
					return 0;
				}
				if (a < b) {
					return -1;
				}
				return 1;
			};

		this.items = [];
		this.indexesOfSourceData = [];
		this.trimByCollect = trimByCollect;
		this.caseSensitive = caseSensitive;
		this.skipSort = skipSort;
		this.fieldLength = dimensionLength;
		this.fieldNames = new Array(dimensionLength);
		this.fieldCompare = new Array(dimensionLength); // 0 - number, 1 - integer, 2 - string, one can extend for Date and other
		for (iField = 0; iField < dimensionLength; iField++) {
			dimensionItem = dimension[iField];
			this.fieldNames[iField] = dimensionItem[fieldName || "dataName"];
			switch (dimensionItem.sorttype) {
				case "integer":
				case "int":
					this.fieldCompare[iField] = integerCompare;
					break;
				case "number":
				case "currency":
				case "float":
					this.fieldCompare[iField] = numberCompare;
					break;
				default:
					this.fieldCompare[iField] = $.isFunction(dimensionItem.compare) ? dimensionItem.compare : stringCompare;
					break;
			}
		}
	}
	ArrayOfFieldsets.prototype.compareVectorsEx = function (vector1, vector2) {
		var self = this, fieldLength = self.fieldLength, iField, compareResult;
		for (iField = 0; iField < fieldLength; iField++) {
			compareResult = self.fieldCompare[iField](vector1[iField], vector2[iField]);
			if (compareResult !== 0) {
				return {
					index: iField,
					result: compareResult
				};
			}
		}
		return {
			index: -1,
			result: 0
		};
	};
	ArrayOfFieldsets.prototype.getIndexOfDifferences = function (vector1, vector2) {
		if (vector2 === null || vector1 === null) {
			return 0;
		}
		return this.compareVectorsEx(vector1, vector2).index;
	};
	ArrayOfFieldsets.prototype.compareVectors = function (vector1, vector2) {
		return this.compareVectorsEx(vector1, vector2).result;
	};
	ArrayOfFieldsets.prototype.getItem = function (index) {
		return this.items[index];
	};
	ArrayOfFieldsets.prototype.getIndexLength = function () {
		return this.items.length;
	};
	ArrayOfFieldsets.prototype.getIndexesOfSourceData = function (index) {
		return this.indexesOfSourceData[index];
	};
	ArrayOfFieldsets.prototype.createDataIndex = function (data) {
		var self = this, iRow, nRows = data.length, fieldLength = self.fieldLength, values, v,
			fieldNames = self.fieldNames, indexesOfSourceData = self.indexesOfSourceData, iField, compareResult, i, item,
			items = self.items, iMin, iMax;

		for (iRow = 0; iRow < nRows; iRow++) {
			item = data[iRow];

			// build the set of fields with data of the current item
			values = new Array(fieldLength);
			for (iField = 0; iField < fieldLength; iField++) {
				v = item[fieldNames[iField]];
				if (v !== undefined) {
					if (typeof v === "string" && self.trimByCollect) {
						v = $.trim(v);
					}
					values[iField] = v;
				}
			}

			// compare values with items having index iMax and iMin
			// If we use skipSort:true option then we compare always
			// with iMax item only.
			iMin = 0;
			iMax = items.length - 1;
			if (iMax < 0) {
				items.push(values);
				indexesOfSourceData.push([iRow]);
				continue;
			}
			compareResult = self.compareVectors(values, items[iMax]);
			if (compareResult === 0) {
				indexesOfSourceData[iMax].push(iRow);
				continue;
			}
			if (compareResult === 1 || self.skipSort) {
				// in case of the empty array this.items or if the values is larger as the
				// the max (last) element of this.items: append values to the array this.items
				items.push(values);
				indexesOfSourceData.push([iRow]);
				continue;
			}
			compareResult = self.compareVectors(items[0], values);
			if (compareResult === 1) {
				// if the min (first) element values is larger as the values:
				// insert the values as the first element of the array this.items
				items.unshift(values);
				indexesOfSourceData.unshift([iRow]);
				continue;
			}
			if (compareResult === 0) {
				indexesOfSourceData[0].push(iRow);
				continue;
			}
			// we are sure that items[iMin] < values < items[iMax]
			while (true) {
				if (iMax - iMin < 2) {
					// no identical items are found we need to insert the item at i index
					items.splice(iMax, 0, values); // insert after iMin
					indexesOfSourceData.splice(iMax, 0, [iRow]);
					break;
				}
				i = Math.floor((iMin + iMax) / 2); // | 0 means Math.floor, but it's faster sometimes.
				compareResult = self.compareVectors(items[i], values);
				if (compareResult === 0) {
					indexesOfSourceData[i].push(iRow);
					break;
				}
				if (compareResult === 1) {
					iMax = i;
				} else {
					iMin = i;
				}
			}
		}
	};
	
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
					skipSortByX: false,
					skipSortByY: false,
					caseSensitive: false,
					footerTotals: false, // old colTotals option
					groupSummary: true,
					groupSummaryPos: "header",
					frozenStaticCols: false,
					defaultFormatting: true
				}, options || {}),
				row, i, k, nRows = data.length, x, y, cm, iRow, nm, iXData, itemXData,
				xDimension = o.xDimension, yDimension = o.yDimension, aggregates = o.aggregates, aggrContext,
				isRowTotal = o.totalText || o.rowTotals || o.totalHeader,
				xlen = isArray(xDimension) ? xDimension.length : 0,
				ylen = isArray(yDimension) ? yDimension.length : 0,
				aggrlen = isArray(aggregates) ? aggregates.length : 0,
				headerLevels = ylen - (aggrlen === 1 ? 1 : 0),
				colHeaders = [], hasGroupTotal = [], colModel = [], outputItems = [],
				aggrContextTotalRows = new Array(aggrlen), aggrContextGroupTotalRows = new Array(ylen),
				xIndexLength, indexesOfDataWithTheSameXValues, iYData, itemYData, indexesOfDataWithTheSameYValues,
				iRows, agr, outputItem, previousY, groupHeaders, iRowsY, xIndex, yIndex, yIndexLength,
				indexDataBy = function (dimension, skipSort) {
					var index = new ArrayOfFieldsets(o.trimByCollect, o.caseSensitive, skipSort, dimension);
					index.createDataIndex(data);
					return index;
				},
				buildColModelItem = function (colType, agr, iAggr, level, iyData) {
					var label, name, cmItem;
					switch (colType) {
						case 1: // total group
							label = yDimension[level].totalText || "{0} {1} {2}";
							name = "y" + iyData + "t" + level;
							break;
						case 2: // grand total
							label = o.totalText || "{0}";
							name = "t";
							break;
						//case 0: // standard column
						default:
							label = aggrlen > 1 ? agr.label || "{0}" : yIndex.getItem(iyData)[level];
							name = "y" + iyData;
							break;
					}
					cmItem = $.extend({}, agr, {
						name: name + (aggrlen > 1 ? "a" + iAggr : ""),
						label: $.isFunction(label) ?
									label.apply(self, colType === 2 ? [agr, k] : [yIndex.getItem(iyData), agr, k, i]) :
									jgrid.template.apply(self, colType === 2 ? [label, agr.aggregator, agr.member, k] : [label, agr.aggregator, agr.member, yIndex.getItem(iyData)[level], k])
					});
					delete cmItem.member;
					delete cmItem.aggregator;
					return cmItem;
				},
				addColumnToColModel = function (colType, level, iyData) {
					var iAggr, aggregate;
					for (iAggr = 0; iAggr < aggrlen; iAggr++) {
						aggregate = aggregates[iAggr];
						if (aggregate.template === undefined && aggregate.formatter === undefined && o.defaultFormatting) {
							aggregate.template = aggregate.aggregator === "count" ? "integer" : "number";
						}
						colModel.push(buildColModelItem(colType, aggregate, iAggr, level, iyData));
					}
				},
				addGroupTotalHeaders = function (iyData, level, previousY) {
					var iLevel, j, totalHeader, headerOnTop;
					for (iLevel = headerLevels - 1; iLevel >= level; iLevel--) {
						if (hasGroupTotal[iLevel]) {
							for (j = 0; j <= iLevel; j++) {
								groupHeaders = colHeaders[j].groupHeaders;
								groupHeaders[groupHeaders.length - 1].numberOfColumns += aggrlen;
							}
							y = yDimension[iLevel];
							totalHeader = y.totalHeader;
							headerOnTop = y.headerOnTop;
							for (j = iLevel + 1; j <= headerLevels - 1; j++) {
								colHeaders[j].groupHeaders.push({
									titleText: ((headerOnTop && j === iLevel + 1) || (!headerOnTop && j === headerLevels - 1)) ?
											($.isFunction(totalHeader) ?
													totalHeader.call(self, previousY, iLevel) :
													jgrid.template.call(self, totalHeader || "", previousY[iLevel], iLevel)) :
											"",
									startColumnName: "y" + (iyData - 1) + "t" + iLevel + (aggrlen === 1 ? "" :"a0"),
									numberOfColumns: aggrlen
								});
							}
						}
					}
				},
				initializeGroupTotals = function () {
					var iLevel, iAggr;
					for (iLevel = headerLevels - 1; iLevel >= 0; iLevel--) {
						if (hasGroupTotal[iLevel]) {
							if (aggrContextGroupTotalRows[iLevel] == null) {// first call
								aggrContextGroupTotalRows[iLevel] = new Array(aggrlen);
							}
							for (iAggr = 0; iAggr < aggrlen; iAggr++) {
								aggrContextGroupTotalRows[iLevel][iAggr] = new Aggregation(agr.aggregator === "count" ? "sum" : agr.aggregator, self);
							}
						}
					}
				},
				finalizeGroupTotals = function (iyData, itemYData, previousY, iAggr) {
					var iLevel, level = yIndex.getIndexOfDifferences(itemYData, previousY),	fieldName;

					if (previousY !== null) {
						// test whether the group is finished and one need to get results
						level = Math.max(level, 0); // change -1 to 0 for the last call (itemYData === previousY)
						for (iLevel = headerLevels - 1; iLevel >= level; iLevel--) {
							fieldName = "y" + iyData + "t" + iLevel + (aggrlen > 1 ? "a" + iAggr : "");
							if (hasGroupTotal[iLevel] && outputItem[fieldName] === undefined) {
								aggrContextGroupTotalRows[iLevel][iAggr].getResult(outputItem, fieldName);
								if (itemYData !== previousY) {
									aggrContextGroupTotalRows[iLevel][iAggr] = new Aggregation(agr.aggregator === "count" ? "sum" : agr.aggregator, self);
								}
							}
						}
					}
				},
				calculateGroupTotals = function (itemYData, previousY, aggregate, iAggr, row) {
					// the method will be called at the first time with previousY === null in every output row
					// and finally with itemYData === previousY for getting results of all aggregation contexts
					var iLevel;

					if (itemYData !== previousY) { // not the last call in the row
						for (iLevel = headerLevels - 1; iLevel >= 0; iLevel--) {
							if (hasGroupTotal[iLevel]) {
								aggrContextGroupTotalRows[iLevel][iAggr].calc(row[aggregate.member], aggregate.member, row);
							}
						}
					}
				};
			
			if (xlen === 0 || aggrlen === 0) {
				throw ("xDimension or aggregates options are not set!");
			}
			
			// ****************************************************************
			// The step 1: scan input data and build the list of unique indexes
			// ****************************************************************
			xIndex = indexDataBy(xDimension, o.skipSortByX);
			yIndex = indexDataBy(yDimension, o.skipSortByY);
			
			// *******************************************
			// The step 2: build colModel and groupOptions
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

			// Fill hasGroupTotal and groupColumnsPerLevel arrays
			// The hasGroupTotal just shows whether one need create additional totals for every group.
			for (i = 0; i < ylen; i++) {
				y = yDimension[i];
				hasGroupTotal.push(y.totals || y.rowTotals || y.totalText || y.totalHeader ? true : false);
			}

			// fill other columns of colModel based on collected uniqueYData and aggregates options
			// the names of the first columns will be "y"+i in case of one aggregate and
			// "y"+i+"a"+k in case of multiple aggregates. The name of the first "y"-column is "y0" or "y0a0"
			// The next function build and insert item in colModel
			// colType: 0 - means standard column, 1 - total group, 2 - grand total
			previousY = yIndex.getItem(0);
			addColumnToColModel(0, ylen - 1, 0); // add standard column
			yIndexLength = yIndex.getIndexLength();
			for (iYData = 1; iYData < yIndexLength; iYData++) {
				itemYData = yIndex.getItem(iYData);
				/*
				 * find where (on which level) the itemYData have the differences to
				 * the previous y (previousY). If the level has (totals:true/rowTotals:true) in yDimension
				 * then one should insert new total columns for all levels starting with the highest one
				 * (yDimension[yDimension.length-1]) and till the current one.
				 */
				i = yIndex.getIndexOfDifferences(itemYData, previousY);
				for (k = headerLevels - 1; k >= i; k--) {
					if (hasGroupTotal[k]) {
						addColumnToColModel(1, k, iYData - 1); // add group total columns
					}
				}
				previousY = itemYData;
				addColumnToColModel(0, ylen - 1, iYData); // add standard column
			}
			// finalize of all totals
			for (i = headerLevels - 1; i >= 0; i--) {
				if (hasGroupTotal[i]) {
					addColumnToColModel(1, i, yIndexLength - 1); // add the last group total columns
				}
			}
			// add total columns calculated over all data of the row
			if (isRowTotal) {
				addColumnToColModel(2);
			}

			// ********************************
			// The step 3: build column headers
			// ********************************
			// initialize colHeaders
			previousY = yIndex.getItem(0);
			for (k = 0; k < headerLevels; k++) {
				colHeaders.push({
					useColSpanStyle: o.useColSpanStyle,
					groupHeaders: [{
						titleText: previousY[k],
						startColumnName: aggrlen === 1 ? "y0" : "y0a0" ,
						numberOfColumns: aggrlen
					}]
				});
			}
			for (iYData = 1; iYData < yIndexLength; iYData++) {
				itemYData = yIndex.getItem(iYData);
				i = yIndex.getIndexOfDifferences(itemYData, previousY);
				// We placed QNIQUE data in uniqueYData array.
				// So we always find a difference on one level

				addGroupTotalHeaders(iYData, i, previousY);
				// add column headers which corresponds the main data
				for (k = headerLevels - 1; k >= i; k--) {
					colHeaders[k].groupHeaders.push({
						titleText: itemYData[k],
						startColumnName: "y" + iYData + (aggrlen === 1 ? "" :"a0"),
						numberOfColumns: aggrlen
					});
				}
				for (k = 0; k < i; k++) {
					groupHeaders = colHeaders[k].groupHeaders;
					groupHeaders[groupHeaders.length - 1].numberOfColumns += aggrlen;
				}
				previousY = itemYData;
			}
			addGroupTotalHeaders(yIndexLength, 0, previousY);

			// fill groupHeaders without taking in consideration group total columns
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
			// The step 4: fill data of grid
			// *****************************
			xIndexLength = xIndex.getIndexLength();
			for (iXData = 0; iXData < xIndexLength; iXData++) {
				outputItem = {}; // item of output data

				itemXData = xIndex.getItem(iXData);
				// itemXData corresponds to the row of output data
				for (i = 0; i < xlen; i++) {
					// fill first columns of data
					outputItem["x" + i] = itemXData[i];
				}

				indexesOfDataWithTheSameXValues = xIndex.getIndexesOfSourceData(iXData);
				// The rows of input data with indexes from indexesOfDataWithTheSameXValues contains itemXData
				// Now we build columns of itemXData row
				if (isRowTotal) {
					for (k = 0; k < aggrlen; k++) {
						agr = aggregates[k];
						aggrContextTotalRows[k] = new Aggregation(agr.aggregator === "count" ? "sum" : agr.aggregator, self);
					}
				}
				previousY = null;
				initializeGroupTotals();
				for (iYData = 0; iYData < yIndexLength; iYData++) {
					itemYData = yIndex.getItem(iYData);
					indexesOfDataWithTheSameYValues = yIndex.getIndexesOfSourceData(iYData);
					// we calculate aggregate in every itemYData 
					for (k = 0; k < aggrlen; k++) {
						if (previousY !== null) { // empty input data
							finalizeGroupTotals(iYData - 1, itemYData, previousY, k);
						}
						iRows = [];
						for (i = 0; i < indexesOfDataWithTheSameYValues.length; i++) {
							iRowsY = indexesOfDataWithTheSameYValues[i];
							if ($.inArray(iRowsY, indexesOfDataWithTheSameXValues) >= 0) {
								iRows.push(iRowsY);
							}
						}
						if (iRows.length > 0) {
							// iRows array have all indexes of input data which have both itemXData and itemYData
							// We need calculate aggregate agr over all the items
							agr = aggregates[k];
							aggrContext = new Aggregation(agr.aggregator, self); // result = undefined; count = undefined;
							for (iRow = 0; iRow < iRows.length; iRow++) {
								row = data[iRows[iRow]];
								aggrContext.calc(row[agr.member], agr.member, row);
								if (isRowTotal) {
									aggrContextTotalRows[k].calc(row[agr.member], agr.member, row);
								}
								calculateGroupTotals(itemYData, previousY, agr, k, row);
							}
							aggrContext.getResult(outputItem, "y" + iYData + (aggrlen === 1 ? "" : "a" + k));
						}
					}
					previousY = itemYData;
				}
				if (previousY !== null) { // if non-empty input data
					for (k = 0; k < aggrlen; k++) {
						finalizeGroupTotals(yIndexLength - 1, previousY, previousY, k);
					}
				}
				if (isRowTotal) {
					for (k = 0; k < aggrlen; k++) {
						aggrContextTotalRows[k].getResult(outputItem, "t" + (aggrlen === 1 ? "" : "a" + k));
					}
				}
				outputItems.push(outputItem);
			}

			// *****************************
			// The step 5: fill total footer
			// *****************************
			if (o.footerTotals || o.colTotals) {
				nRows = outputItems.length;
				for (i = 0; i < xlen; i++) {
					summaries["x" + i] = xDimension[i].totalText || "";
				}
				for (i = xlen; i < colModel.length; i++) {
					nm = colModel[i].name;
					aggrContext = new Aggregation(o.colTotalAggregator || "sum", self);
					for (iRow = 0; iRow < nRows; iRow++) {
						outputItem = outputItems[iRow];
						aggrContext.calc(outputItem[nm], nm, outputItem);
					}
					aggrContext.getResult(summaries, nm);
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
