/*jshint eqeqeq:false */
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
var jgrid = $.jgrid;
jgrid.extend({
setSubGrid : function () {
	return this.each(function (){
		var $t = this, p = $t.p, cm, i,
		suboptions = {
			plusicon : "ui-icon-plus",
			minusicon : "ui-icon-minus",
			openicon: "ui-icon-carat-1-sw",
			expandOnLoad:  false,
			delayOnLoad : 50,
			selectOnExpand : false,
			selectOnCollapse : false,
			reloadOnExpand : true
		};
		p.subGridOptions = $.extend(suboptions, p.subGridOptions || {});
		p.colNames.unshift("");
		p.colModel.unshift({name:'subgrid',width: jgrid.cell_width ?  p.subGridWidth+p.cellLayout : p.subGridWidth,sortable: false,resizable:false,hidedlg:true,search:false,fixed:true});
		cm = p.subGridModel;
		if(cm[0]) {
			cm[0].align = $.extend([],cm[0].align || []);
			for(i=0;i<cm[0].name.length;i++) { cm[0].align[i] = cm[0].align[i] || 'left';}
		}
	});
},
addSubGridCell :function (pos,iRow) {
	var prp='',ic,sid;
	this.each(function(){
		prp = this.formatCol(pos,iRow);
		sid= this.p.id;
		ic = this.p.subGridOptions.plusicon;
	});
	return "<td role=\"gridcell\" aria-describedby=\""+sid+"_subgrid\" class=\"ui-sgcollapsed sgcollapsed\" "+prp+"><a style='cursor:pointer;'><span class='ui-icon "+ic+"'></span></a></td>";
},
addSubGrid : function( pos, sind ) {
	return this.each(function(){
		var ts = this, p = ts.p;
		if (!ts.grid ) { return; }
		//-------------------------
		var subGridCell = function(trdiv,cell,pos)
		{
			var tddiv = $("<td align='"+p.subGridModel[0].align[pos]+"'></td>").html(cell);
			$(trdiv).append(tddiv);
		};
		var subGridXml = function(sjxml, sbid){
			var tddiv, i,  sgmap,
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
						var f = p.subGridModel[0].mapping || p.subGridModel[0].name;
						if (f) {
							for (i=0;i<f.length;i++) {
								subGridCell(trdiv, $(f[i],this).text() || '&#160;',i);
							}
						}
					}
					$(dummy).append(trdiv);
				});
			}
			var pID = $("table:first",ts.grid.bDiv).attr("id")+"_";
			$("#"+jgrid.jqID(pID+sbid)).append(dummy);
			ts.grid.hDiv.loading = false;
			$("#load_"+jgrid.jqID(p.id)).hide();
			return false;
		};
		var subGridJson = function(sjxml, sbid){
			var tddiv,result,i,cur, sgmap,j,
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
							var f = p.subGridModel[0].mapping || p.subGridModel[0].name;
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
			var pID = $("table:first",ts.grid.bDiv).attr("id")+"_";
			$("#"+jgrid.jqID(pID+sbid)).append(dummy);
			ts.grid.hDiv.loading = false;
			$("#load_"+jgrid.jqID(p.id)).hide();
			return false;
		};
		var populatesubgrid = function( rd )
		{
			var sid,dp, i, j;
			sid = $(rd).attr("id");
			dp = {nd_: (new Date().getTime())};
			dp[p.prmNames.subgridid]=sid;
			if(!p.subGridModel[0]) { return false; }
			if(p.subGridModel[0].params) {
				for(j=0; j < p.subGridModel[0].params.length; j++) {
					for(i=0; i<p.colModel.length; i++) {
						if(p.colModel[i].name === p.subGridModel[0].params[j]) {
							dp[p.colModel[i].name]= $("td:eq("+i+")",rd).text().replace(/\&#160\;/ig,'');
						}
					}
				}
			}
			if(!ts.grid.hDiv.loading) {
				ts.grid.hDiv.loading = true;
				$("#load_"+jgrid.jqID(p.id)).show();
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
						data: $.isFunction(p.serializeSubGridData)? p.serializeSubGridData.call(ts, dp) : dp,
						complete: function(sxml) {
							if(p.subgridtype === "xml") {
								subGridXml(sxml.responseXML, sid);
							} else {
								subGridJson(jgrid.parse(sxml.responseText),sid);
							}
							sxml=null;
						}
					}, jgrid.ajaxOptions, p.ajaxSubgridOptions || {}));
					break;
				}
			}
			return false;
		};
		var _id, pID,atd, nhc=1, bfsc, r;
		$.each(p.colModel,function(){
			if(this.hidden === true || this.name === 'rn' || this.name === 'cb') {
				nhc++;
			}
		});
		var len = ts.rows.length, i=1;
		if( sind !== undefined && sind > 0) {
			i = sind;
			len = sind+1;
		}
		while(i < len) {
			if($(ts.rows[i]).hasClass('jqgrow')) {
				if(p.scroll) {
					$(ts.rows[i].cells[pos]).unbind('click');
				}
				$(ts.rows[i].cells[pos]).bind('click', function() {
					var tr = $(this).parent("tr")[0];
					r = tr.nextSibling;
					if($(this).hasClass("sgcollapsed")) {
						pID = p.id;
						_id = tr.id;
						if(p.subGridOptions.reloadOnExpand === true || ( p.subGridOptions.reloadOnExpand === false && !$(r).hasClass('ui-subgrid') ) ) {
							atd = pos >=1 ? "<td colspan='"+pos+"'>&#160;</td>":"";
							bfsc = $(ts).triggerHandler("jqGridSubGridBeforeExpand", [pID + "_" + _id, _id]);
							bfsc = (bfsc === false || bfsc === 'stop') ? false : true;
							if(bfsc && $.isFunction(p.subGridBeforeExpand)) {
								bfsc = p.subGridBeforeExpand.call(ts, pID+"_"+_id,_id);
							}
							if(bfsc === false) {return false;}
							$(tr).after( "<tr role='row' class='ui-subgrid'>"+atd+"<td class='ui-widget-content subgrid-cell'><span class='ui-icon "+p.subGridOptions.openicon+"'></span></td><td colspan='"+parseInt(p.colNames.length-nhc,10)+"' class='ui-widget-content subgrid-data'><div id="+pID+"_"+_id+" class='tablediv'></div></td></tr>" );
							$(ts).triggerHandler("jqGridSubGridRowExpanded", [pID + "_" + _id, _id]);
							if( $.isFunction(p.subGridRowExpanded)) {
								p.subGridRowExpanded.call(ts, pID+"_"+ _id,_id);
							} else {
								populatesubgrid(tr);
							}
						} else {
							$(r).show();
						}
						$(this).html("<a style='cursor:pointer;'><span class='ui-icon "+p.subGridOptions.minusicon+"'></span></a>").removeClass("sgcollapsed").addClass("sgexpanded");
						if(p.subGridOptions.selectOnExpand) {
							$(ts).jqGrid('setSelection',_id);
						}
					} else if($(this).hasClass("sgexpanded")) {
						bfsc = $(ts).triggerHandler("jqGridSubGridRowColapsed", [pID + "_" + _id, _id]);
						bfsc = (bfsc === false || bfsc === 'stop') ? false : true;
						_id = tr.id;
						if( bfsc &&  $.isFunction(p.subGridRowColapsed)) {
							bfsc = p.subGridRowColapsed.call(ts, pID+"_"+_id,_id );
						}
						if(bfsc===false) {return false;}
						if(p.subGridOptions.reloadOnExpand === true) {
							$(r).remove(".ui-subgrid");
						} else if($(r).hasClass('ui-subgrid')) { // incase of dynamic deleting
							$(r).hide();
						}
						$(this).html("<a style='cursor:pointer;'><span class='ui-icon "+p.subGridOptions.plusicon+"'></span></a>").removeClass("sgexpanded").addClass("sgcollapsed");
						if(p.subGridOptions.selectOnCollapse) {
							$(ts).jqGrid('setSelection',_id);
						}
					}
					return false;
				});
			}
			i++;
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
			var rc = $(this).jqGrid("getInd",rowid,true);
			if(rc) {
				var sgc = $("td.sgcollapsed",rc)[0];
				if(sgc) {
					$(sgc).trigger("click");
				}
			}
		}
	});
},
collapseSubGridRow : function(rowid) {
	return this.each(function () {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.p.subGrid===true) {
			var rc = $(this).jqGrid("getInd",rowid,true);
			if(rc) {
				var sgc = $("td.sgexpanded",rc)[0];
				if(sgc) {
					$(sgc).trigger("click");
				}
			}
		}
	});
},
toggleSubGridRow : function(rowid) {
	return this.each(function () {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.p.subGrid===true) {
			var rc = $(this).jqGrid("getInd",rowid,true);
			if(rc) {
				var sgc = $("td.sgcollapsed",rc)[0];
				if(sgc) {
					$(sgc).trigger("click");
				} else {
					sgc = $("td.sgexpanded",rc)[0];
					if(sgc) {
						$(sgc).trigger("click");
					}
				}
			}
		}
	});
}
});
})(jQuery);
