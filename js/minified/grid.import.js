!function(e){"function"==typeof define&&define.amd?define(["jquery","./grid.utils","./grid.base"],e):e(jQuery)}(function(G){G.jgrid=G.jgrid||{},G.extend(G.jgrid,{saveState:function(e,t){if(t=G.extend({useStorage:!0,storageType:"localStorage",beforeSetItem:null,compression:!1,compressionModule:"LZString",compressionMethod:"compressToUTF16",debug:!1,saveData:!0},t||{}),e){var r,i="",o="",e=G("#"+e)[0];if(e.grid){if((d=G(e).data("inlineNav"))&&e.p.inlineNav&&G(e).jqGrid("setGridParam",{_iN:d}),(d=G(e).data("filterToolbar"))&&e.p.filterToolbar&&G(e).jqGrid("setGridParam",{_fT:d}),i=G(e).jqGrid("jqGridExport",{exptype:"jsonstring",ident:"",root:"",data:t.saveData}),o="",t.saveData&&(d=(o=G(e.grid.bDiv).find(".ui-jqgrid-btable tbody").first().html()).indexOf("</tr>"),o=o.slice(d+5)),G.jgrid.isFunction(t.beforeSetItem)&&null!=(r=t.beforeSetItem.call(e,i))&&(i=r),t.debug){G("#gbox_tree").prepend('<a id="link_save" target="_blank" download="jqGrid_dump.txt">Click to save Dump Data</a>');var a,d=[],n={};d.push("Grid Options\n"),d.push(i),d.push("\n"),d.push("GridData\n"),d.push(o),n.type="plain/text;charset=utf-8";try{a=new File(d,"jqGrid_dump.txt",n)}catch(e){a=new Blob(d,n)}d=URL.createObjectURL(a),G("#link_save").attr("href",d).on("click",function(){G(this).remove()})}if(t.compression&&t.compressionModule)try{null!=(r=window[t.compressionModule][t.compressionMethod](i))&&(i=r,o=window[t.compressionModule][t.compressionMethod](o))}catch(e){}if(t.useStorage&&G.jgrid.isLocalStorage())try{window[t.storageType].setItem("jqGrid"+e.p.id,i),window[t.storageType].setItem("jqGrid"+e.p.id+"_data",o)}catch(e){22===e.code&&alert("Local storage limit is over!")}return i}}},loadState:function(e,t,r){if(r=G.extend({useStorage:!0,storageType:"localStorage",clearAfterLoad:!1,beforeSetGrid:null,afterSetGrid:null,decompression:!1,decompressionModule:"LZString",decompressionMethod:"decompressFromUTF16",restoreData:!0},r||{}),e){var i,o,a,d=G("#"+e)[0];if(r.useStorage)try{t=window[r.storageType].getItem("jqGrid"+d.id),n=window[r.storageType].getItem("jqGrid"+d.id+"_data")}catch(e){}if(t){if(r.decompression&&r.decompressionModule)try{null!=(i=window[r.decompressionModule][r.decompressionMethod](t))&&(t=i,n=window[r.decompressionModule][r.decompressionMethod](n))}catch(e){}if((i=G.jgrid.parseFunc(t))&&"object"===G.jgrid.type(i)){d.grid&&G.jgrid.gridUnload(e);var n,t=function(e){return e},s={reccount:(i=G.jgrid.isFunction(r.beforeSetGrid)&&(s=r.beforeSetGrid(i))&&"object"===G.jgrid.type(s)?s:i).reccount,records:i.records,lastpage:i.lastpage,shrinkToFit:t(i.shrinkToFit),data:t(i.data),datatype:t(i.datatype),grouping:t(i.grouping)},l=(i.shrinkToFit=!1,i.data=[],i.datatype="local",i.grouping=!1,i.inlineNav&&(o=t(i._iN),i._iN=null,delete i._iN),i.filterToolbar&&(a=t(i._fT),i._fT=null,delete i._fT),G("#"+e).jqGrid(i));if(l.jqGrid("delRowData","norecs"),r.restoreData&&""!==G.jgrid.trim(n)&&l.append(n),l.jqGrid("setGridParam",s),i.storeNavOptions&&i.navGrid&&(l[0].p.navGrid=!1,l.jqGrid("navGrid",i.pager,i.navOptions,i.editOptions,i.addOptions,i.delOptions,i.searchOptions,i.viewOptions),i.navButtons)&&i.navButtons.length)for(var p=0;p<i.navButtons.length;p++)"sepclass"in i.navButtons[p][1]?l.jqGrid("navSeparatorAdd",i.navButtons[p][0],i.navButtons[p][1]):l.jqGrid("navButtonAdd",i.navButtons[p][0],i.navButtons[p][1]);if(l[0].refreshIndex(),i.subGrid&&(t=1===i.multiselect?1:0,n=!0===i.rownumbers?1:0,l.jqGrid("addSubGrid",t+n),G.each(l[0].rows,function(e,t){G(t).hasClass("ui-sg-expanded")&&G(l[0].rows[e-1]).find("td.sgexpanded").click().click()})),i.treeGrid)for(var c=1,g=l[0].rows.length,u=i.expColInd,m=i.treeReader.leaf_field,f=i.treeReader.expanded_field;c<g;)G(l[0].rows[c].cells[u]).find("div.treeclick").on("click",function(e){e=e.target||e.srcElement,e=G.jgrid.stripPref(i.idPrefix,G(e,l[0].rows).closest("tr.jqgrow")[0].id),e=l[0].p._index[e];return l[0].p.data[e][m]||(l[0].p.data[e][f]?(l.jqGrid("collapseRow",l[0].p.data[e]),l.jqGrid("collapseNode",l[0].p.data[e])):(l.jqGrid("expandRow",l[0].p.data[e]),l.jqGrid("expandNode",l[0].p.data[e]))),!1}),!0===i.ExpandColClick&&G(l[0].rows[c].cells[u]).find("span.cell-wrapper").css("cursor","pointer").on("click",function(e){var e=e.target||e.srcElement,e=G.jgrid.stripPref(i.idPrefix,G(e,l[0].rows).closest("tr.jqgrow")[0].id),t=l[0].p._index[e];return l[0].p.data[t][m]||(l[0].p.data[t][f]?(l.jqGrid("collapseRow",l[0].p.data[t]),l.jqGrid("collapseNode",l[0].p.data[t])):(l.jqGrid("expandRow",l[0].p.data[t]),l.jqGrid("expandNode",l[0].p.data[t]))),l.jqGrid("setSelection",e),!1}),c++;if(i.multiselect&&G.each(i.selarrrow,function(){G("#jqg_"+e+"_"+this)[i.useProp?"prop":"attr"]("checked","checked")}),l.jqGrid("isGroupHeaderOn")&&l.jqGrid("refreshGroupHeaders"),i.searchCols)for(var j in i._results)i._results.hasOwnProperty(j)&&G("#jqs_"+e+"_"+j).val(i._results[j].v);i.inlineNav&&o&&(l.jqGrid("setGridParam",{inlineNav:!1}),l.jqGrid("inlineNav",i.pager,o)),i.filterToolbar&&a&&(l.jqGrid("setGridParam",{filterToolbar:!1}),a.restoreFromFilters=!0,l.jqGrid("filterToolbar",a)),i.frozenColumns&&l.jqGrid("setFrozenColumns"),l[0].updatepager(!0,!0),G.jgrid.isFunction(r.afterSetGrid)&&r.afterSetGrid(l),r.clearAfterLoad&&(window[r.storageType].removeItem("jqGrid"+d.id),window[r.storageType].removeItem("jqGrid"+d.id+"_data"))}else alert("can not convert to object")}}},isGridInStorage:function(e,t){var r,i,o,t=G.extend({storageType:"localStorage"},t||{});try{i=window[t.storageType].getItem("jqGrid"+e),o=window[t.storageType].getItem("jqGrid"+e+"_data"),r=null!=i&&null!=o&&"string"==typeof i&&"string"==typeof o}catch(e){r=!1}return r},setRegional:function(e,t){var r={storageType:"sessionStorage"};if((r=G.extend(r,t||{})).regional){G.jgrid.saveState(e,r),r.beforeSetGrid=function(e){return e.regional=r.regional,e.force_regional=!0,e},G.jgrid.loadState(e,null,r);var t=G("#"+e)[0],i=G(t).jqGrid("getGridParam","colModel"),o=-1,a=G.jgrid.getRegional(t,"nav");G.each(i,function(e){if(this.formatter&&"actions"===this.formatter)return o=e,!1}),-1!==o&&a&&G("#"+e+" tbody tr").each(function(){var e=this.cells[o];G(e).find(".ui-inline-edit").attr("title",a.edittitle),G(e).find(".ui-inline-del").attr("title",a.deltitle),G(e).find(".ui-inline-save").attr("title",a.savetitle),G(e).find(".ui-inline-cancel").attr("title",a.canceltitle)});try{window[r.storageType].removeItem("jqGrid"+t.id),window[r.storageType].removeItem("jqGrid"+t.id+"_data")}catch(e){}}},jqGridImport:function(e,r){r=G.extend({imptype:"xml",impstring:"",impurl:"",mtype:"GET",impData:{},xmlGrid:{config:"root>grid",data:"root>rows"},jsonGrid:{config:"grid",data:"data"},ajaxOptions:{}},r||{});function i(e,t){var r,i,o,a=G(t.xmlGrid.config,e)[0],t=G(t.xmlGrid.data,e)[0];if(G.grid.xmlToJSON){for(o in r=G.jgrid.xmlToJSON(a))r.hasOwnProperty(o)&&(i=r[o]);t?(a=r.grid.datatype,r.grid.datatype="xmlstring",r.grid.datastr=e,G(d).jqGrid(i).jqGrid("setGridParam",{datatype:a})):setTimeout(function(){G(d).jqGrid(i)},0)}else alert("xml2json or parse are not present")}function t(e,t){var r;e&&"string"==typeof e&&(r=(e=G.jgrid.parseFunc(e))[t.jsonGrid.config],(e=e[t.jsonGrid.data])?(t=r.datatype,r.datatype="jsonstring",r.datastr=e,G(d).jqGrid(r).jqGrid("setGridParam",{datatype:t})):G(d).jqGrid(r))}var o,d=(0===e.indexOf("#")?"":"#")+G.jgrid.jqID(e);switch(r.imptype){case"xml":G.ajax(G.extend({url:r.impurl,type:r.mtype,data:r.impData,dataType:"xml",complete:function(e,t){"success"===t&&(i(e.responseXML,r),G(d).triggerHandler("jqGridImportComplete",[e,r]),G.jgrid.isFunction(r.importComplete))&&r.importComplete(e)}},r.ajaxOptions));break;case"xmlstring":r.impstring&&"string"==typeof r.impstring&&(o=G.parseXML(r.impstring))&&(i(o,r),G(d).triggerHandler("jqGridImportComplete",[o,r]),G.jgrid.isFunction(r.importComplete))&&r.importComplete(o);break;case"json":G.ajax(G.extend({url:r.impurl,type:r.mtype,data:r.impData,dataType:"json",complete:function(e){try{t(e.responseText,r),G(d).triggerHandler("jqGridImportComplete",[e,r]),G.jgrid.isFunction(r.importComplete)&&r.importComplete(e)}catch(e){}}},r.ajaxOptions));break;case"jsonstring":r.impstring&&"string"==typeof r.impstring&&(t(r.impstring,r),G(d).triggerHandler("jqGridImportComplete",[r.impstring,r]),G.jgrid.isFunction(r.importComplete))&&r.importComplete(r.impstring)}}}),G.jgrid.extend({jqGridExport:function(t){t=G.extend({exptype:"xmlstring",root:"grid",ident:"\t",addOptions:{},data:!0},t||{});var r=null;return this.each(function(){if(this.grid){var e=G.extend(!0,{},G(this).jqGrid("getGridParam"),t.addOptions);switch(e.rownumbers&&(e.colNames.splice(0,1),e.colModel.splice(0,1)),e.multiselect&&(e.colNames.splice(0,1),e.colModel.splice(0,1)),e.searchCols&&(e.colNames.splice(0,1),e.colModel.splice(0,1)),e.subGrid&&(e.colNames.splice(0,1),e.colModel.splice(0,1)),e.knv=null,t.data||(e.data=[],e._index={}),t.exptype){case"xmlstring":r="<"+t.root+">"+G.jgrid.jsonToXML(e,{xmlDecl:""})+"</"+t.root+">";break;case"jsonstring":r=G.jgrid.stringify(e),t.root&&(r="{"+t.root+":"+r+"}")}}}),r},excelExport:function(d){return d=G.extend({exptype:"remote",url:null,oper:"oper",tag:"excel",beforeExport:null,exporthidden:!1,exportgrouping:!1,exportOptions:{},method:"GET"},d||{}),this.each(function(){if(this.grid&&"remote"===d.exptype){var t=G.extend({},this.p.postData);if(t[d.oper]=d.tag,G.jgrid.isFunction(d.beforeExport)&&(a=d.beforeExport.call(this,t),G.isPlainObject(a))&&(t=a),d.exporthidden){for(var e=this.p.colModel,r=e.length,i=[],o=0;o<r;o++)void 0===e[o].hidden&&(e[o].hidden=!1),i.push({name:e[o].name,hidden:e[o].hidden});var a=JSON.stringify(i);"string"==typeof a&&(t.colModel=a)}d.exportgrouping&&"string"==typeof(a=JSON.stringify(this.p.groupingView))&&(t.groupingView=a);try{G.jgrid.postForm(d.url,t,d.method)}catch(e){a=jQuery.param(t),t=-1!==d.url.indexOf("?")?d.url+"&"+a:d.url+"?"+a;window.location=t}}})}})});