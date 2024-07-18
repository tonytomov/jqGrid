!function(i){"function"==typeof define&&define.amd?define(["jquery","./grid.base"],i):i(jQuery)}(function(x){x.jgrid.extend({setSubGrid:function(){return this.each(function(){var i,e,s=this,d=x.jgrid.styleUI[s.p.styleUI||"jQueryUI"].subgrid,d={plusicon:d.icon_plus,minusicon:d.icon_minus,openicon:d.icon_open,expandOnLoad:!1,selectOnExpand:!1,selectOnCollapse:!1,reloadOnExpand:!0,onErrorLoadData:null};if(s.p.subGridOptions=x.extend(d,s.p.subGridOptions||{}),s.p.colNames.unshift(""),s.p.colModel.unshift({name:"subgrid",width:x.jgrid.cell_width?s.p.subGridWidth+s.p.cellLayout:s.p.subGridWidth,sortable:!1,resizable:!1,hidedlg:!0,search:!1,fixed:!0}),(i=s.p.subGridModel)[0])for(i[0].align=x.extend([],i[0].align||[]),e=0;e<i[0].name.length;e++)i[0].align[e]=i[0].align[e]||"left"})},addSubGridCell:function(i,e){var s,d,r,t="";return this.each(function(){t=this.formatCol(i,e),d=this.p.id,s=this.p.subGridOptions.plusicon,r=x.jgrid.styleUI[this.p.styleUI||"jQueryUI"].common}),'<td role="gridcell" aria-describedby="'+d+'_subgrid" class="ui-sgcollapsed sgcollapsed" '+t+"><a style='cursor:pointer;' class='ui-sghref'><span class='"+r.icon_base+" "+s+"'></span></a></td>"},addSubGrid:function(j,t){return this.each(function(){var u=this;if(u.grid){var n,a,l,o,p,i,s,c=x.jgrid.styleUI[u.p.styleUI||"jQueryUI"].base,g=x.jgrid.styleUI[u.p.styleUI||"jQueryUI"].common,b=x.jgrid.getRegional(this,"errors"),h=function(i,e,s){s=x("<td align='"+u.p.subGridModel[0].align[s]+"'></td>").html(e);x(i).append(s)},f=function(i,e){for(var s,d,r=x("<table class='"+c.rowTable+" ui-common-table'><tbody></tbody></table>"),t=x("<tr></tr>"),n=0;n<u.p.subGridModel[0].name.length;n++)s=x("<th class='"+c.headerBox+" ui-th-subgrid ui-th-column ui-th-"+u.p.direction+"'></th>"),x(s).html(u.p.subGridModel[0].name[n]),x(s).width(u.p.subGridModel[0].width[n]),x(t).append(s);x(r).append(t),i&&(d=u.p.xmlReader.subgrid,x(d.root+" "+d.row,i).each(function(){if(t=x("<tr class='"+g.content+" ui-subtblcell'></tr>"),!0===d.repeatitems)x(d.cell,this).each(function(i){h(t,x(this).text()||"&#160;",i)});else{var i=u.p.subGridModel[0].mapping||u.p.subGridModel[0].name;if(i)for(n=0;n<i.length;n++)h(t,x.jgrid.getXmlData(this,i[n])||"&#160;",n)}x(r).append(t)}));i=x(u.grid.bDiv).find("table").first().attr("id")+"_";return x("#"+x.jgrid.jqID(i+e)).append(r),u.grid.hDiv.loading=!1,x("#load_"+x.jgrid.jqID(u.p.id)).hide(),!1},G=function(i,e){for(var s,d,r,t,n,a=x("<table class='"+c.rowTable+" ui-common-table'><tbody></tbody></table>"),l=x("<tr></tr>"),o=0;o<u.p.subGridModel[0].name.length;o++)s=x("<th class='"+c.headerBox+" ui-th-subgrid ui-th-column ui-th-"+u.p.direction+"'></th>"),x(s).html(u.p.subGridModel[0].name[o]),x(s).width(u.p.subGridModel[0].width[o]),x(l).append(s);if(x(a).append(l),i&&(t=u.p.jsonReader.subgrid,void 0!==(d=x.jgrid.getAccessor(i,t.root))))for(o=0;o<d.length;o++){if(r=d[o],l=x("<tr class='"+g.content+" ui-subtblcell'></tr>"),!0===t.repeatitems)for(t.cell&&(r=r[t.cell]),n=0;n<r.length;n++)h(l,r[n]||"&#160;",n);else{var p=u.p.subGridModel[0].mapping||u.p.subGridModel[0].name;if(p.length)for(n=0;n<p.length;n++)h(l,x.jgrid.getAccessor(r,p[n])||"&#160;",n)}x(a).append(l)}i=x(u.grid.bDiv).find("table").first().attr("id")+"_";return x("#"+x.jgrid.jqID(i+e)).append(a),u.grid.hDiv.loading=!1,x("#load_"+x.jgrid.jqID(u.p.id)).hide(),!1},m=0,e=(x.each(u.p.colModel,function(){!0!==this.hidden&&"rn"!==this.name&&"cb"!==this.name&&"sc"!==this.name||m++}),u.rows.length),d=1,r=x.jgrid.isFunction(u.p.isHasSubGrid);for(void 0!==t&&0<t&&(e=(d=t)+1);d<e;)x(u.rows[d]).hasClass("jqgrow")&&(u.p.scroll&&x(u.rows[d].cells[j]).off("click"),i=null,!1===(i=r?u.p.isHasSubGrid.call(u,u.rows[d].id):i)?u.rows[d].cells[j].innerHTML="":x(u.rows[d].cells[j]).on("click",function(){var i=x(this).parent("tr")[0];if(a=u.p.id,n=i.id,p=x("#"+a+"_"+n+"_expandedContent"),x(this).hasClass("sgcollapsed")){if(!1===(o=(o=!1!==(o=x(u).triggerHandler("jqGridSubGridBeforeExpand",[a+"_"+n,n]))&&"stop"!==o)&&x.jgrid.isFunction(u.p.subGridBeforeExpand)?u.p.subGridBeforeExpand.call(u,a+"_"+n,n):o))return!1;if(!0===u.p.subGridOptions.reloadOnExpand||!1===u.p.subGridOptions.reloadOnExpand&&!p.hasClass("ui-subgrid"))if(l=1<=j?"<td colspan='"+j+"'>&#160;</td>":"",x(i).after("<tr role='row' id='"+a+"_"+n+"_expandedContent' class='ui-subgrid ui-sg-expanded'>"+l+"<td class='"+g.content+" subgrid-cell'><span class='"+g.icon_base+" "+u.p.subGridOptions.openicon+"'></span></td><td colspan='"+parseInt(u.p.colNames.length-1-m,10)+"' class='"+g.content+" subgrid-data'><div id="+a+"_"+n+" class='tablediv'></div></td></tr>"),x(u).triggerHandler("jqGridSubGridRowExpanded",[a+"_"+n,n]),x.jgrid.isFunction(u.p.subGridRowExpanded))u.p.subGridRowExpanded.call(u,a+"_"+n,n);else{var e,s,d=i,r=x(d).attr("id"),t={nd_:(new Date).getTime()};if(t[u.p.prmNames.subgridid]=r,u.p.subGridModel[0]){if(u.p.subGridModel[0].params)for(s=0;s<u.p.subGridModel[0].params.length;s++)for(e=0;e<u.p.colModel.length;e++)u.p.colModel[e].name===u.p.subGridModel[0].params[s]&&(t[u.p.colModel[e].name]=x("td",d).eq(e).text().replace(/\&#160\;/gi,""));if(!u.grid.hDiv.loading)switch(u.grid.hDiv.loading=!0,x("#load_"+x.jgrid.jqID(u.p.id)).show(),u.p.subgridtype||(u.p.subgridtype=u.p.datatype),x.jgrid.isFunction(u.p.subgridtype)?u.p.subgridtype.call(u,t):u.p.subgridtype=u.p.subgridtype.toLowerCase(),u.p.subgridtype){case"xml":case"json":x.ajax(x.extend({type:u.p.mtype,url:x.jgrid.isFunction(u.p.subGridUrl)?u.p.subGridUrl.call(u,t):u.p.subGridUrl,dataType:u.p.subgridtype,data:x.jgrid.isFunction(u.p.serializeSubGridData)?u.p.serializeSubGridData.call(u,t):t,success:function(i,e,s){"xml"===u.p.subgridtype?f(s.responseXML,r):G(x.jgrid.parse(s.responseText),r)},error:function(i,e,s){if(x.jgrid.isFunction(u.p.subGridOptions.onErrorLoadData))u.p.subGridOptions.onErrorLoadData.call(u,rowid,i,e,s);else{e=i.responseText+" <br/>"+i.statusText;try{x.jgrid.info_dialog(b.errcap,'<div class="'+g.error+'">'+e+"</div>",edit.bClose,{buttonalign:"right",styleUI:u.p.styleUI})}catch(i){alert(e)}}}},x.jgrid.ajaxOptions,u.p.ajaxSubgridOptions||{}))}}}else p.show().removeClass("ui-sg-collapsed").addClass("ui-sg-expanded");x(this).html("<a style='cursor:pointer;' class='ui-sghref'><span class='"+g.icon_base+" "+u.p.subGridOptions.minusicon+"'></span></a>").removeClass("sgcollapsed").addClass("sgexpanded"),u.p.subGridOptions.selectOnExpand&&x(u).jqGrid("setSelection",n)}else if(x(this).hasClass("sgexpanded")){if(!1===(o=(o=!1!==(o=x(u).triggerHandler("jqGridSubGridRowColapsed",[a+"_"+n,n]))&&"stop"!==o)&&x.jgrid.isFunction(u.p.subGridRowColapsed)?u.p.subGridRowColapsed.call(u,a+"_"+n,n):o))return!1;!0===u.p.subGridOptions.reloadOnExpand?p.remove(".ui-subgrid"):p.hasClass("ui-subgrid")&&p.hide().addClass("ui-sg-collapsed").removeClass("ui-sg-expanded"),x(this).html("<a style='cursor:pointer;' class='ui-sghref'><span class='"+g.icon_base+" "+u.p.subGridOptions.plusicon+"'></span></a>").removeClass("sgexpanded").addClass("sgcollapsed"),u.p.subGridOptions.selectOnCollapse&&x(u).jqGrid("setSelection",n)}return!1})),d++;!0===u.p.subGridOptions.expandOnLoad&&(s=0,u.p.multiselect&&s++,u.p.rownumbers&&s++,x(u.rows).filter(".jqgrow").each(function(i,e){x(e.cells[s]).click()})),u.subGridXml=function(i,e){f(i,e)},u.subGridJson=function(i,e){G(i,e)}}})},expandSubGridRow:function(e){return this.each(function(){var i;(this.grid||e)&&!0===this.p.subGrid&&(i=x(this).jqGrid("getInd",e,!0))&&(i=x("td.sgcollapsed",i)[0])&&x(i).trigger("click")})},collapseSubGridRow:function(e){return this.each(function(){var i;(this.grid||e)&&!0===this.p.subGrid&&(i=x(this).jqGrid("getInd",e,!0))&&(i=x("td.sgexpanded",i)[0])&&x(i).trigger("click")})},toggleSubGridRow:function(s){return this.each(function(){var i,e;(this.grid||s)&&!0===this.p.subGrid&&(i=x(this).jqGrid("getInd",s,!0))&&(e=(e=x("td.sgcollapsed",i)[0])||x("td.sgexpanded",i)[0])&&x(e).trigger("click")})}})});