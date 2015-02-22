/*jshint eqeqeq:false */
/*jslint browser: true, devel: true, eqeq: true, evil: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, vars: true, white: true, maxerr: 999 */
/*global jQuery */
(function($){
/**
 * jqGrid extension for SubGrid Data
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
**/
"use strict";
var jgrid = $.jgrid, jqID = jgrid.jqID,
	subGridFeedback = function () {
		var args = $.makeArray(arguments);
		args[0] = "subGrid" + args[0].charAt(0).toUpperCase() + args[0].substring(1);
		args.unshift("");
		args.unshift("");
		args.unshift(this.p);
		return jgrid.feedback.apply(this, args);
	};
jgrid.extend({
setSubGrid : function () {
	return this.each(function (){
	    var $t = this, p = $t.p, cm = p.subGridModel[0], i;
		p.subGridOptions = $.extend({
			expandOnLoad:  false,
			delayOnLoad : 50,
			selectOnExpand : false,
			selectOnCollapse : false,
			reloadOnExpand : true
		}, p.subGridOptions || {});
		p.colNames.unshift("");
		p.colModel.unshift({name:'subgrid',width: jgrid.cell_width ?  p.subGridWidth+p.cellLayout : p.subGridWidth,labelClasses:"jqgh_subgrid",sortable: false,resizable:false,hidedlg:true,search:false,fixed:true});
		if(cm) {
			cm.align = $.extend([],cm.align || []);
			for(i=0;i<cm.name.length;i++) { cm.align[i] = cm.align[i] || 'left';}
		}
	});
},
addSubGridCell :function (pos,iRow) {
	var self=this[0];
	return self == null || self.p == null || self.p.subGridOptions == null ? "" :
		"<td role=\"gridcell\" aria-describedby=\""+self.p.id+"_subgrid\" class=\"ui-sgcollapsed sgcollapsed\" "+
			self.formatCol(pos,iRow)+"><a style='cursor:pointer;'><span class='"+
			jgrid.mergeCssClasses(self.p.subGridOptions.commonIconClass, self.p.subGridOptions.plusicon)+"'></span></a></td>";
},
addSubGrid : function( pos, sind ) {
	return this.each(function(){
		var ts = this, p = ts.p;
		if (!ts.grid ) { return; }
		//-------------------------
		var subGridCell = function (trdiv, cell, pos) {
			var tddiv = $("<td align='"+p.subGridModel[0].align[pos]+"'></td>").html(cell);
			$(trdiv).append(tddiv);
		};
		var subGridXml = function(sjxml, sbid){
			var tddiv, i, sgmap, f,
			dummy = $("<table"+(jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "")+"><tbody></tbody></table>"),
			trdiv = $("<tr></tr>");
			for (i = 0; i<p.subGridModel[0].name.length; i++) {
				tddiv = $("<th class='ui-state-default ui-th-subgrid ui-th-column ui-th-"+p.direction+"'></th>");
				$(tddiv).html(p.subGridModel[0].name[i]);
				$(tddiv).width( p.subGridModel[0].width[i]);
				$(trdiv).append(tddiv);
			}
			$(dummy).append(trdiv);
			if (sjxml){
				sgmap = p.xmlReader.subgrid;
				$(sgmap.root+" "+sgmap.row, sjxml).each( function(){
					trdiv = $("<tr class='ui-widget-content ui-subtblcell'></tr>");
					if(sgmap.repeatitems === true) {
						$(sgmap.cell,this).each( function(i) {
							subGridCell(trdiv, $(this).text() || '&#160;',i);
						});
					} else {
						f = p.subGridModel[0].mapping || p.subGridModel[0].name;
						if (f) {
							for (i=0;i<f.length;i++) {
								subGridCell(trdiv, $(f[i],this).text() || '&#160;',i);
							}
						}
					}
					$(dummy).append(trdiv);
				});
			}
			var pID = p.id+"_";
			$("#"+jqID(pID+sbid)).append(dummy);
			ts.grid.hDiv.loading = false;
			$("#load_"+jqID(p.id)).hide();
			return false;
		};
		var subGridJson = function(sjxml, sbid){
			var tddiv,result,i,cur, sgmap, j, f,
			dummy = $("<table"+(jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "")+"><tbody></tbody></table>"),
			trdiv = $("<tr></tr>");
			for (i = 0; i<p.subGridModel[0].name.length; i++) {
				tddiv = $("<th class='ui-state-default ui-th-subgrid ui-th-column ui-th-"+p.direction+"'></th>");
				$(tddiv).html(p.subGridModel[0].name[i]);
				$(tddiv).width( p.subGridModel[0].width[i]);
				$(trdiv).append(tddiv);
			}
			$(dummy).append(trdiv);
			if (sjxml){
				sgmap = p.jsonReader.subgrid;
				result = jgrid.getAccessor(sjxml, sgmap.root);
				if ( result !== undefined ) {
					for (i=0;i<result.length;i++) {
						cur = result[i];
						trdiv = $("<tr class='ui-widget-content ui-subtblcell'></tr>");
						if(sgmap.repeatitems === true) {
							if(sgmap.cell) { cur=cur[sgmap.cell]; }
							for (j=0;j<cur.length;j++) {
								subGridCell(trdiv, cur[j] || '&#160;',j);
							}
						} else {
							f = p.subGridModel[0].mapping || p.subGridModel[0].name;
							if(f.length) {
								for (j=0;j<f.length;j++) {
									subGridCell(trdiv, cur[f[j]] || '&#160;',j);
								}
							}
						}
						$(dummy).append(trdiv);
					}
				}
			}
			var pID = p.id + "_";
			$("#"+jqID(pID+sbid)).append(dummy);
			ts.grid.hDiv.loading = false;
			$("#load_"+jqID(p.id)).hide();
			return false;
		};
		var populatesubgrid = function (rd) {
		    var sid = $(rd).attr("id"), dp = { nd_: (new Date().getTime()) }, i, j;
			dp[p.prmNames.subgridid]=sid;
			if(!p.subGridModel[0]) { return false; }
			if(p.subGridModel[0].params) {
				for(j=0; j < p.subGridModel[0].params.length; j++) {
					for(i=0; i<p.colModel.length; i++) {
						if(p.colModel[i].name === p.subGridModel[0].params[j]) {
						    dp[p.colModel[i].name] = $(rd.cells[i]).text().replace(/\&#160\;/ig, '');
						}
					}
				}
			}
			if(!ts.grid.hDiv.loading) {
				ts.grid.hDiv.loading = true;
				$("#load_"+jqID(p.id)).show();
				if(!p.subgridtype) { p.subgridtype = p.datatype; }
				if($.isFunction(p.subgridtype)) {
					p.subgridtype.call(ts, dp);
				} else {
					p.subgridtype = p.subgridtype.toLowerCase();
				}
				switch(p.subgridtype) {
					case "xml":
					case "json":
					$.ajax($.extend({
						type:p.mtype,
						url: $.isFunction(p.subGridUrl) ? p.subGridUrl.call(ts, dp) : p.subGridUrl,
						dataType:p.subgridtype,
						//data: $.isFunction(p.serializeSubGridData)? p.serializeSubGridData.call(ts, dp) : dp,
						data: jgrid.serializeFeedback.call(ts, p.serializeSubGridData, "jqGridSerializeSubGridData", dp),
						complete: function(jqXHR) {
							if(p.subgridtype === "xml") {
								subGridXml(jqXHR.responseXML, sid);
							} else {
								subGridJson(jgrid.parse(jqXHR.responseText),sid);
							}
						}
					}, jgrid.ajaxOptions, p.ajaxSubgridOptions || {}));
					break;
				}
			}
			return false;
		};
		var len = ts.rows.length, iRow=1;
		if( sind !== undefined && sind > 0) {
			iRow = sind;
			len = sind+1;
		}
		var onClick = function() {
		    var tr = $(this).parent("tr")[0], r = tr.nextSibling, rowid = tr.id, subgridDivId = p.id + "_" + rowid, atd,
				iconClass = function (iconName) {
					return [p.subGridOptions.commonIconClass, p.subGridOptions[iconName]].join(" ");
				},
				nhc = 1;
			$.each(p.colModel,function(){
				if(this.hidden === true || this.name === 'rn' || this.name === 'cb') {
					nhc++;
				}
			});
			if($(this).hasClass("sgcollapsed")) {
				if(p.subGridOptions.reloadOnExpand === true || ( p.subGridOptions.reloadOnExpand === false && !$(r).hasClass('ui-subgrid') ) ) {
					atd = pos >=1 ? "<td colspan='"+pos+"'>&#160;</td>":"";
					if (!subGridFeedback.call(ts, "beforeExpand", subgridDivId, rowid)) {return;}
					$(tr).after( "<tr role='row' class='ui-widget-content ui-subgrid ui-row-"+p.direction+"'>"+atd+"<td class='ui-widget-content subgrid-cell'><span class='"+iconClass("openicon")+"'></span></td><td colspan='"+parseInt(p.colNames.length-nhc,10)+"' class='ui-widget-content subgrid-data'><div id="+subgridDivId+" class='tablediv'></div></td></tr>" );
					$(ts).triggerHandler("jqGridSubGridRowExpanded", [subgridDivId, rowid]);
					if( $.isFunction(p.subGridRowExpanded)) {
						p.subGridRowExpanded.call(ts, subgridDivId,rowid);
					} else {
						populatesubgrid(tr);
					}
				} else {
					$(r).show();
				}
				$(this).html("<a style='cursor:pointer;'><span class='"+iconClass("minusicon")+"'></span></a>").removeClass("sgcollapsed").addClass("sgexpanded");
				if(p.subGridOptions.selectOnExpand) {
					$(ts).jqGrid('setSelection',rowid);
				}
			} else if($(this).hasClass("sgexpanded")) {
				if (!subGridFeedback.call(ts, "beforeCollapse", subgridDivId, rowid)) {return;}
				if(p.subGridOptions.reloadOnExpand === true) {
					$(r).remove(".ui-subgrid");
				} else if($(r).hasClass('ui-subgrid')) { // incase of dynamic deleting
					$(r).hide();
				}
				$(this).html("<a style='cursor:pointer;'><span class='"+iconClass("plusicon")+"'></span></a>").removeClass("sgexpanded").addClass("sgcollapsed");
				if(p.subGridOptions.selectOnCollapse) {
					$(ts).jqGrid('setSelection',rowid);
				}
			}
			return false;
		};
		while(iRow < len) {
			if($(ts.rows[iRow]).hasClass('jqgrow')) {
				if(p.scroll) {
					$(ts.rows[iRow].cells[pos]).unbind('click');
				}
				$(ts.rows[iRow].cells[pos]).bind('click', onClick);
			}
			iRow++;
		}
		if(p.subGridOptions.expandOnLoad === true) {
			$(ts.rows).filter('.jqgrow').each(function(index,row){
				$(row.cells[0]).click();
			});
		}
		ts.subGridXml = function(xml,sid) {subGridXml(xml,sid);};
		ts.subGridJson = function(json,sid) {subGridJson(json,sid);};
	});
},
expandSubGridRow : function(rowid) {
	return this.each(function () {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.p.subGrid===true) {
		    var tr = $(this).jqGrid("getInd", rowid, true);
		    $(tr).find(">td.sgcollapsed").trigger("click");
		}
	});
},
collapseSubGridRow : function(rowid) {
	return this.each(function () {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.p.subGrid===true) {
		    var tr = $(this).jqGrid("getInd", rowid, true);
		    $(tr).find(">td.sgexpanded").trigger("click");
		}
	});
},
toggleSubGridRow : function(rowid) {
	return this.each(function () {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.p.subGrid===true) {
		    var tr = $(this).jqGrid("getInd", rowid, true);
		    $(tr).find(">td.ui-sgcollapsed").trigger("click");
		}
	});
}
});
}(jQuery));
