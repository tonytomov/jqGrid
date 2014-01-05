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

function _pivotfilter (fn, context) {
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
	pivotSetup : function( data, options ){
		// data should come in format
		// jsonData = { colModel :[ { .. }...], rows : [ {...},...] }
		// The function return the new colModel and the transformed data
		// again with group setup options which then will be passed to the grid
		var columns =[],
		pivotrows =[],
		summaries = [],
		member=[],
		groupOptions = {
			grouping : true,
			groupingView :  {
				groupField : [],
				groupSummary: [],
				groupSummaryPos:[]
			}
		},
		headers = [],
		o = $.extend ( {
			rowTotals : false,
			rowTotalsText : 'Total',
			colTotals : true,
			// default values for all summary columns
			formatter : 'number',
			align : 'right',
			summaryType : 'sum',
			summaryRound: 2,
			summaryRoundType : 'round',
			summaryGroups : true
		}, options || {});
		this.each(function(){

			var 
				row,
				rowindex,
				i,
				
				rowlen = data.length,
				xlen, ylen,
				tmp,
				newObj,
				r=0;
			// utility funcs
			function find(ar, fun, extra) {
				var res;
				res = _pivotfilter.call(ar, fun, extra);
				return res.length > 0 ? res[0] : null;
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
			function calculation(oper, v, field, rc)  {
				var ret;
				switch (oper) {
					case  "sum" : 
						ret = parseFloat(v||0) + parseFloat((rc[field]||0));
						break;
					case "count" :
						if(v==="" || v == null) {
							v=0;
						}
						if(rc.hasOwnProperty(field)) {
							ret = v+1;
						} else {
							ret = 0;
						}
						break;
					case "min" : 
						if(v==="") {
							ret = parseFloat(rc[field]||0);
						} else {
							ret =Math.min(parseFloat(v),parseFloat(rc[field]||0));
						}
						break;
					case "max" : 
						if(v==="") {
							ret = parseFloat(rc[field]||0);
						} else {
							ret = Math.max(parseFloat(v),parseFloat(rc[field]||0));
						}
						break;
				}
				return ret;
			}

			function agregateFunc ( row, aggr, value, curr) {
				// default is sum
				var arrln = aggr.length, i, label, j, jv, jj;
				if($.isArray(value)) {
					jv = value.length;
				} else {
					jv = 1;
				}
				member = [];
				member['root'] = 0;
				for(j=0;j<jv;j++) {
					var  tmpmember = [], vl;
					for(i=0; i < arrln; i++) {
						if(value == null) {
							label = $.trim(aggr[i].member)+"_"+aggr[i].aggregator;
							vl = label;
						} else {
							vl = $.trim(value[j]);
							try {
								label = (arrln === 1 ? vl : vl+"_"+aggr[i].aggregator);
							} catch(e) {}
						}
						curr[label] =  tmpmember[label] = calculation( aggr[i].aggregator, curr[label], aggr[i].member, row);
					}
					member[vl] = tmpmember;
				}
				return curr;
			}
			// if rowTotals make it
			if(o.rowTotals && o.yDimension.length > 0) {
				var dn = o.yDimension[0].dataName;
				o.yDimension.splice(0,0,{dataName:dn});
				o.yDimension[0].converter =  function(){ return '_r_Totals'; };
			}
			// build groups from colModel
			xlen = o.xDimension.length;
			ylen = o.yDimension.length;
			for(i = 0; i< xlen; i++) {
				var colc = {name:o.xDimension[i].dataName};
				columns.push( colc );
			}
			var aggrlen  = o.aggregates.length;
			var groupfields = xlen - 1, tree={};
			//tree = { text: 'root', leaf: false, children: [] };
			while( r < rowlen ) {
				row = data[r];
				var xValue = [];//groupValue = [];
				var yValue = []; //pivotValue =[];
				tmp = {};
				i = 0;
				do {
					xValue[i]  = $.trim(row[o.xDimension[i].dataName]);
					tmp[o.xDimension[i].dataName] = xValue[i];
					i++;
				} while( i < xlen );
				
				var k = 0;
				rowindex = -1;
				newObj = find(pivotrows, findGroup, xValue);
				if(!newObj) {
					k = 0;
					if(ylen>=1) {
						for(k=0;k<ylen;k++) {
							yValue[k] = $.trim(row[o.yDimension[k].dataName]);
							if(o.yDimension[k].converter && $.isFunction(o.yDimension[k].converter)) {
								yValue[k] = o.yDimension[k].converter.call(this, yValue[k], xValue, yValue);
							}
						}
						// make the colums and return the members for late calculation
						tmp = agregateFunc( row, o.aggregates, yValue, tmp );
						//make the sums to other levels if they are enabled 
						// and create the grid heading
					} else  if( ylen === 0 ) {
						tmp = agregateFunc( row, o.aggregates, null, tmp );
					}
					pivotrows.push( tmp );
				} else {
					if( rowindex >= 0) {
						k = 0;
						if(ylen>=1) {
							for(k=0;k<ylen;k++) {
								yValue[k] = $.trim(row[o.yDimension[k].dataName]);
								if(o.yDimension[k].converter && $.isFunction(o.yDimension[k].converter)) {
									yValue[k] = o.yDimension[k].converter.call(this, yValue[k], xValue, yValue);
								}
							}
							newObj = agregateFunc( row, o.aggregates, yValue, newObj );
							//make the sums to other levels if they are enabled 
							// and create the grid heading
						} else  if( ylen === 0 ) {
							newObj = agregateFunc( row, o.aggregates, null, newObj );
						}
						pivotrows[rowindex] = newObj;
					}
				}
				var kj=0, current = null,existing = null;
				for (var kk in member) {
					if(kj === 0) {
						if (!tree.children||typeof tree.children === 'undefined'){
							tree = { text: kk, level : 0, children: [] };
						}
						current = tree.children;
					} else {
						existing = null;
						for (i=0; i < current.length; i++) {
							if (current[i].text === kk) {
								//current[i].fields=member[kk];
								existing = current[i];
								break;
							}
						}
						if (existing) {
							current = existing.children;
						} else {
							current.push({ children: [], text: kk, level: kj,  fields: member[kk] });
							current = current[current.length - 1].children;
						}
					}
					kj++;
				}
				r++;
			}
			var  lastval=[], initColLen = columns.length, swaplen = initColLen;
			if(ylen>0) {
				headers[ylen-1] = {	useColSpanStyle: false,	groupHeaders: []};
			}
		   
			function list(items, level) {
				var l, j;
				for (var key in items) { // iterate
					if (items.hasOwnProperty(key)) {
					// write amount of spaces according to level
					// and write name and newline
						if(typeof items[key] !== "object") {
							if( key === 'level') {
								if(lastval[items.level] === undefined) {
									lastval[items.level] ='';
									if(items.level>0 && items.text !== '_r_Totals') {
										headers[items.level-1] = {
											useColSpanStyle: false,
											groupHeaders: []
										};
									}
								}
								if(lastval[items.level] !== items.text && items.children.length && items.text !== '_r_Totals') {
									if(items.level>0) {
										headers[items.level-1].groupHeaders.push({
											titleText: items.text
										});
										var collen = headers[items.level-1].groupHeaders.length,
										colpos = collen === 1 ? swaplen : initColLen+(collen-1)*aggrlen;
										headers[items.level-1].groupHeaders[collen-1].startColumnName = columns[colpos].name;
										headers[items.level-1].groupHeaders[collen-1].numberOfColumns = columns.length - colpos;
										initColLen = columns.length;
									}
								}
								lastval[items.level] = items.text;
							}
							if(items.level === ylen  && key==='level' && ylen >0) {
								if( aggrlen > 1){
									var ll=1;
									for( l in items.fields) {
										if(ll===1) {
											headers[ylen-1].groupHeaders.push({startColumnName: l, numberOfColumns: 1, titleText: items['text']});
										}
										ll++;
									}
									headers[ylen-1].groupHeaders[headers[ylen-1].groupHeaders.length-1].numberOfColumns = ll-1;
								} else {
									headers.splice(ylen-1,1);
								}
							}
						}
						// if object, call recursively
						if (items[key] != null && typeof items[key] === "object") {
							list(items[key], level + 1);
						}
						if( key === 'level') {
							if(items.level >0){
								if(aggrlen > 1) {
									j=0;
									for(l in items.fields) {
										columns.push({name: l, label: o.aggregates[j].label || l, width: 80, formatter: o.formatter, summaryType: o.summaryType, summaryRound: o.summaryRound, summaryRoundType : o.summaryRoundType, align: o.align  });
										j++;
									}
								} else {
									columns.push({name:items.text, label: items.text==='_r_Totals' ? o.rowTotalsText : items.text, width:80, formatter: o.formatter, summaryType: o.summaryType, summaryRound: o.summaryRound, summaryRoundType : o.summaryRoundType, align: o.align});
								}
							}
						}
					}
				}
			}

			list(tree, 0);
			var nm;
			if(o.colTotals) {
				var plen = pivotrows.length;
				while(plen--) {
					for(i=xlen;i<columns.length;i++) {
						nm = columns[i].name;
						if(!summaries[nm]) {
							summaries[nm] = pivotrows[plen][nm];
						} else {
							summaries[nm] += pivotrows[plen][nm];
						}
					}
				}
			}
			if( groupfields > 0) {
				for(i=0;i<groupfields;i++) {
					groupOptions.groupingView.groupField[i] = columns[i].name;
					groupOptions.groupingView.groupSummary[i] = o.summaryGroups;
					groupOptions.groupingView.groupSummaryPos[i] = 'header';
				}
			} else {
				// no grouping is needed
				groupOptions.grouping = false;
			}
			groupOptions['sortname'] = columns[groupfields].name;

		});
		return { "colModel" : columns, "rows": pivotrows, "groupOptions" : groupOptions, "groupHeaders" :  headers, summary : summaries };
	}
});
})(jQuery);
