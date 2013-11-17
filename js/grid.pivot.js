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
			colTotals : true
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
					tmp[pivotValue] = result;
					if(o.rowTotals) {
						tmp['p_Total'] = result;
					}
					pivotrows.push( tmp );
				} else {
					if( rowindex >= 0) {
						if(newObj.hasOwnProperty(pivotValue)) {
							newObj[pivotValue] += result;
							pivotrows[rowindex] = newObj;
						} else {
							newObj[pivotValue] = result;
							pivotrows[rowindex] = newObj;
						}
						if(o.rowTotals) {
							pivotrows[rowindex].p_Total += result;
						}
					}
				}
				if(!exists(groups, findPivot, pivotValue)) {
					// colmodel
					var colm = {name: $.trim(pivotValue), label: $.trim(pivotValue), summaryType:'sum', summaryRound: 2 };
					groups.push(colm);
				}
				r++;
			}
			if(o.rowTotals) {
				groups.push({name:'p_Total', label:'Total', summaryType:'sum', summaryRound: 2});
			}
			for(i=0;i<groupfields;i++) {
				groupOptions.groupingView.groupField[i] = groups[i].name;
				groupOptions.groupingView.groupSummary[i] = o.colTotals;
			}

		});
		return { "colModel" : groups, "rows": pivotrows, "groupOptions" : groupOptions };
	}
});
})(jQuery);

