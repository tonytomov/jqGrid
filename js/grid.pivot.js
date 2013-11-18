/*jshint eqeqeq:false */
/*global jQuery */
(function($){
/**
 * jqGrid pivot functions
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
*/
"use strict";
// To optimize the search we need custom array filter
// This code is taken from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
Array.prototype._pivotfilter = function (fn, context) {
	var i,
		value,
		result = [],
		length;

	if (!this || typeof fn !== 'function' || (fn instanceof RegExp)) {
		throw new TypeError();
	}

	length = this.length;

	for (i = 0; i < length; i++) {
		if (this.hasOwnProperty(i)) {
			value = this[i];
			if (fn.call(context, value, i, this)) {
				result.push(value);
				// We need break in order to cancel loop 
				// in case the row is found
				break;
			}
		}
	}
	return result;
};

$.jgrid.extend({
	pivotSetup : function( jsonData, options ){
		// data should come in format
		// jsonData = { colModel :[ { .. }...], rows : [ {...},...] }
		// The function return the new colModel and the transformed data
		// again with group setup options which then will be passed to the grid
		var groups =[],
		pivotrows =[],
		groupOptions = {
			grouping : true,
			groupingView :  {
				groupField : [],
				groupSummary: []
			}
		},
		o = $.extend ( {
			rowTotals : false,
			colTotals : true,
			// default values for all summary columns
			summaryType : 'sum',
			summaryRound: 2,
			summaryRoundType : 'round',
			agregateFunc : function( result, column, row) {
				// default is sum
				if( row[column] !== undefined ) {
					return row[column] += result;
				} else {
					return result;
				}
			}
		}, options || {});
		this.each(function(){

			var model = jsonData.colModel,
				rows = jsonData.rows,
				row,
				rowindex,
				i,
				col,
				rowlen = rows.length,
				collen = model.length,
				grouplen, groupfields,
				tmp,
				groupValue, newObj, pivotValue, result,
				r=0, pivotCol, resultCol;
			// utility funcs
			function sortrank(rowA, rowB) {
				var a = +rowA.grouprank, b = +rowB.grouprank;

				return (a < b) ? -1 : (a > b) ? 1 : 0;
			}
			function find(ar, fun, extra) {
				var res;
				res = ar._pivotfilter(fun, extra);
				return res.length > 0 ? res[0] : null;
			}
			function exists(ar, fun, extra) {
		        var i, len, item;
			    if (ar) {
				    if (typeof (ar.some) === 'function') {
					    return ar.some(fun, extra);
					} else {
						for (i = 0, len = ar.length; i < len; i += 1) {
							if (fun.call(extra, ar[i], i, ar)) {
								return true;
							}
						}
					}
				}
				return false;
			}
			// group funcs
			function findGroup(item, index) {
				var j = 0, ret = true;
				for(var i in item ) {
					if(item[i] != this[j]) {
						ret =  false;
						break;
					}
					j++;
					if(j>=this.length) {
						break;
					}
				}
				if(ret) {
					rowindex =  index;
				}
				return ret;
			}

			function findPivot(item, index) {
				return item.name == this;
			}

			// build groups from colModel

			for(i = 0; i< collen; i++) {
				col = model[i];
				if (typeof (col.grouprank) === 'number' && isFinite(col.grouprank)) {
					groups.push(col);
				} else if (col.pivot) {
					pivotCol = col;
				} else if (col.resultcol) {
					resultCol = col;
				}
			}
			groups.sort(sortrank);
			grouplen = groups.length;
			groupfields = grouplen - 1;
			while( r < rowlen ) {
				row = rows[r];
				groupValue = [];
				pivotValue = $.trim(row[pivotCol.name]);
				result = parseFloat($.trim(row[resultCol.name]));
				tmp = {};
				i = 0;
				while( i < grouplen ) {
					groupValue[i] = $.trim(row[groups[i].name]);
					tmp[groups[i].name] = groupValue[i];
					i++;
				}
				rowindex = -1;
				newObj = find(pivotrows, findGroup, groupValue);
				if(!newObj) {
					tmp[pivotValue] = o.agregateFunc.call(this, result, pivotValue, tmp);
					if(o.rowTotals) {
						tmp['p_Total'] = o.agregateFunc.call(this, result, 'p_Total', tmp);
					}
					pivotrows.push( tmp );
				} else {
					if( rowindex >= 0) {
						if(newObj.hasOwnProperty(pivotValue)) {
							// to set a function how to operate the repeated values
							newObj[pivotValue] = o.agregateFunc.call(this, result, pivotValue, newObj);
							pivotrows[rowindex] = newObj;
						} else {
							newObj[pivotValue] = o.agregateFunc.call(this, result, pivotValue, newObj);
							pivotrows[rowindex] = newObj;
						}
						if(o.rowTotals) {
							// to set a function how to operate the rowtotal values
							pivotrows[rowindex].p_Total = o.agregateFunc.call(this, result, 'p_Total', newObj);
						}
					}
				}
				if(!exists(groups, findPivot, pivotValue)) {
					// colmodel
					var colm = {name: $.trim(pivotValue), label: $.trim(pivotValue), summaryType:o.summaryType, summaryRound: o.summaryRound, summaryRoundType: o.summaryRoundType };
					groups.push(colm);
				}
				r++;
			}
			if(o.rowTotals) {
				groups.push({name:'p_Total', label:'Total', summaryType:o.summaryType, summaryRound: o.summaryRound, summaryRoundType: o.summaryRoundType});
			}
			if( groupfields > 0) {
				for(i=0;i<groupfields;i++) {
					groupOptions.groupingView.groupField[i] = groups[i].name;
					groupOptions.groupingView.groupSummary[i] = o.colTotals;
				}
			} else {
				// no grouping is needed
				groupOptions.grouping = false;
			}
			groupOptions['sortname'] = groups[groupfields].name;

		});
		return { "colModel" : groups, "rows": pivotrows, "groupOptions" : groupOptions };
	}
});
})(jQuery);

