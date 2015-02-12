/*jshint eqeqeq:false, eqnull:true, devel:true */
/*global jQuery, jqGridUtils, define */
(function( factory ) {
	"use strict";
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./grid.utils",
			"./grid.base"
		], factory );
	} else {
		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
"use strict";
//module begin
$.jgrid = $.jgrid || {};
$.extend($.jgrid,{
	saveState : function ( jqGridId, o ) {
		o = $.extend({
			useStorage : true,
			storageType : "localStorage", // localStorage or sessionStorage
			beforeSetItem : null,
			compression: false,
			compressionModule :  'LZString', // object by example gzip, LZString
			compressionMethod : 'compressToUTF16' // string by example zip, compressToUTF16
		}, o || {});
		if(!jqGridId) { return; }
		var gridstate = "", data = "", ret, $t = $("#"+jqGridId)[0], tmp;
		// to use navigator set storeNavOptions to true in grid options
		if(!$t.grid) { return;}
		tmp = $($t).data('inlineNav');
		if(tmp && $t.p.inlineNav) {
			$($t).jqGrid('setGridParam',{_iN: tmp});
		}
		tmp = $($t).data('filterToolbar');
		if(tmp && $t.p.filterToolbar) {
			$($t).jqGrid('setGridParam',{_fT: tmp});
		}
		gridstate  =  $($t).jqGrid('jqGridExport', { exptype : "jsonstring", ident:"", root:"" });
		$($t.grid.bDiv).find(".ui-jqgrid-btable tr:gt(0)").each(function(i,d){
			data += d.outerHTML;
		});
		if($.isFunction(o.beforeSetItem)) {
			ret = o.beforeSetItem.call($t, gridstate);
			if(ret != null) {
				gridstate = ret;
			}
		}
		if(o.compression) {
			if(o.compressionModule) {
				try { 
					ret = window[o.compressionModule][o.compressionMethod](gridstate);
					if(ret != null) {
						gridstate = ret;
						data = window[o.compressionModule][o.compressionMethod](data);
					}
				} catch (e) {
					// can not execute a compression.
				}
			}
		}
		if(o.useStorage && $.jgrid.isLocalStorage()) {
			try {
				window[o.storageType].setItem("jqGrid"+$t.p.id, gridstate);
				window[o.storageType].setItem("jqGrid"+$t.p.id+"_data", data);
			} catch (e) {
				if(e.code === 22) { // chrome is 21
					// just for now. we should make some additionla changes and eventually clear some local items
					alert("Local storage limit is over!");
				}
			}
		}
		return gridstate;
	},
	loadState : function (jqGridId, gridstring, o) {
		o = $.extend({
			useStorage : true,
			storageType : "localStorage",
			clearAfterLoad: false,  // clears the jqGrid localStorage items aftre load
			beforeSetGrid : null,
			decompression: false,
			decompressionModule :  'LZString', // object by example gzip, LZString
			decompressionMethod : 'decompressFromUTF16' // string by example unzip, decompressFromUTF16
		}, o || {});
		if(!jqGridId) { return; }
		var ret, tmp, $t = $("#"+jqGridId)[0], data, iN, fT;
		if($t.grid) { 
			$.jgrid.gridUnload( jqGridId ); 
		}
		if(o.useStorage) {
			try {
				gridstring = window[o.storageType].getItem("jqGrid"+$t.id);
				data = window[o.storageType].getItem("jqGrid"+$t.id+"_data");
			} catch (e) {
				// can not get data
			}
		}
		if(!gridstring) { return; }
		if(o.decompression) {
			if(o.decompressionModule) {
			try {
					ret = window[o.decompressionModule][o.decompressionMethod]( gridstring );
					if(ret != null ) {
						gridstring = ret;
						data = window[o.decompressionModule][o.decompressionMethod]( data );
					}
				} catch (e) {
					// decompression can not be done
				}
			}
		}
		ret = jqGridUtils.parse( gridstring );
		if( ret && $.type(ret) === 'object') {
			if($.isFunction(o.beforeSetGrid)) {
				tmp = o.beforeSetGrid( ret );
				if(tmp && $.type(tmp) === 'object') {
					ret = tmp;
				}
			}
			// some preparings
			var retfunc = function( param ) { var p; p = param; return p;},
			prm = {
				"reccount" : ret.reccount,
				"records" : ret.records,
				"lastpage" : ret.lastpage,
				"shrinkToFit" : retfunc( ret.shrinkToFit),
				"data": retfunc(ret.data),
				"datatype" : retfunc(ret.datatype),
				"grouping" : retfunc(ret.grouping)
			};
			ret.shrinkToFit = false;
			ret.data = [];
			ret.datatype = 'local';
			ret.grouping = false;
			ret.navGrid = false;

			if(ret.inlineNav) {
				iN = retfunc( ret._iN );
				ret._iN = null; delete ret._iN; 
			}
			if(ret.filterToolbar) {
				fT = retfunc( ret._fT );
				ret._fT = null; delete ret._fT; 
			}
			var grid = $("#"+jqGridId).jqGrid( ret );
			grid.append( data );
			grid.jqGrid( 'setGridParam', prm);
			if(ret.storeNavOptions) {
				grid.jqGrid('navGrid', ret.pager, ret.navOptions, ret.editOptions, ret.addOptions, ret.delOptions, ret.searchOptions, ret.viewOptions);
			}
			if(ret.inlineNav && iN) {
				grid.jqGrid('setGridParam', { inlineNav:false });
				grid.jqGrid('inlineNav', ret.pager, iN);
			}
			if(ret.filterToolbar && fT) {
				grid.jqGrid('setGridParam', { filterToolbar:false });
				grid.jqGrid('filterToolbar', fT);
			}
			grid[0].updatepager(true, true);
			if(o.clearAfterLoad) {
				window[o.storageType].removeItem("jqGrid"+$t.id);
				window[o.storageType].removeItem("jqGrid"+$t.id + "_data");
			}
		} else {
			alert("can not convert to object");
		}
	},
	setRegional : function( jqGridId , options) {
		$.jgrid.saveState( jqGridId, {
			storageType: "sessionStorage"
		});
		$.jgrid.loadState( jqGridId, null, {
			storageType: "sessionStorage",
			beforeSetGrid: function(params) {
				params.regional = options.regional;
				params.force_regional = true;
				return params;
			}
		});
		// check for formatter actions
		var grid = $("#"+jqGridId)[0],
		model = $(grid).jqGrid('getGridParam','colModel'), i=-1, nav = $.jgrid.getRegional(grid, 'nav');
		$.each(model,function(k){
			if(this.formatter && this.formatter === 'actions') {
				i = k;
				return false;
			}
		});
		if(i !== -1 && nav) {
			$("#"+jqGridId + " tbody tr").each(function(){
				var td = this.cells[i];
				$(td).find(".ui-inline-edit").attr("title",nav.edittitle);
				$(td).find(".ui-inline-del").attr("title",nav.deltitle);
				$(td).find(".ui-inline-save").attr("title",nav.savetitle);
				$(td).find(".ui-inline-cancel").attr("title",nav.canceltitle);
			});
		}
		try {
			window['sessionStorage'].removeItem("jqGrid"+grid.id);
			window['sessionStorage'].removeItem("jqGrid"+grid.id+"_data");
		} catch (e) {}
	},
	jqGridImport : function(jqGridId, o) {
		o = $.extend({
			imptype : "xml", // xml, json, xmlstring, jsonstring
			impstring: "",
			impurl: "",
			mtype: "GET",
			impData : {},
			xmlGrid :{
				config : "root>grid",
				data: "root>rows"
			},
			jsonGrid :{
				config : "grid",
				data: "data"
			},
			ajaxOptions :{}
		}, o || {});
		var $t = (jqGridId.indexOf("#") === 0 ? "": "#") + $.jgrid.jqID(jqGridId);
		var xmlConvert = function (xml,o) {
			var cnfg = $(o.xmlGrid.config,xml)[0];
			var xmldata = $(o.xmlGrid.data,xml)[0], jstr, jstr1, key;
			if(jqGridUtils.xmlToJSON ) {
				jstr = jqGridUtils.xmlToJSON( cnfg );
				//jstr = $.jgrid.parse(jstr);
				for(key in jstr) {
					if(jstr.hasOwnProperty(key)) {
						jstr1=jstr[key];
					}
				}
				if(xmldata) {
				// save the datatype
					var svdatatype = jstr.grid.datatype;
					jstr.grid.datatype = 'xmlstring';
					jstr.grid.datastr = xml;
					$($t).jqGrid( jstr1 ).jqGrid("setGridParam",{datatype:svdatatype});
				} else {
					setTimeout(function() { $($t).jqGrid( jstr1 ); },0);
				}
			} else {
				alert("xml2json or parse are not present");
			}
		};
		var jsonConvert = function (jsonstr,o){
			if (jsonstr && typeof jsonstr === 'string') {
				var json = jqGridUtils.parse(jsonstr);
				var gprm = json[o.jsonGrid.config];
				var jdata = json[o.jsonGrid.data];
				if(jdata) {
					var svdatatype = gprm.datatype;
					gprm.datatype = 'jsonstring';
					gprm.datastr = jdata;
					$($t).jqGrid( gprm ).jqGrid("setGridParam",{datatype:svdatatype});
				} else {
					$($t).jqGrid( gprm );
				}
			}
		};
		switch (o.imptype){
			case 'xml':
				$.ajax($.extend({
					url:o.impurl,
					type:o.mtype,
					data: o.impData,
					dataType:"xml",
					complete: function(xml,stat) {
						if(stat === 'success') {
							xmlConvert(xml.responseXML,o);
							$($t).triggerHandler("jqGridImportComplete", [xml, o]);
							if($.isFunction(o.importComplete)) {
								o.importComplete(xml);
							}
						}
						xml=null;
					}
				}, o.ajaxOptions));
				break;
			case 'xmlstring' :
				// we need to make just the conversion and use the same code as xml
				if(o.impstring && typeof o.impstring === 'string') {
					var xmld = $.parseXML(o.impstring);
					if(xmld) {
						xmlConvert(xmld,o);
						$($t).triggerHandler("jqGridImportComplete", [xmld, o]);
						if($.isFunction(o.importComplete)) {
							o.importComplete(xmld);
						}
					}
				}
				break;
			case 'json':
				$.ajax($.extend({
					url:o.impurl,
					type:o.mtype,
					data: o.impData,
					dataType:"json",
					complete: function(json) {
						try {
							jsonConvert(json.responseText,o );
							$($t).triggerHandler("jqGridImportComplete", [json, o]);
							if($.isFunction(o.importComplete)) {
								o.importComplete(json);
							}
						} catch (ee){}
						json=null;
					}
				}, o.ajaxOptions ));
				break;
			case 'jsonstring' :
				if(o.impstring && typeof o.impstring === 'string') {
					jsonConvert(o.impstring,o );
					$($t).triggerHandler("jqGridImportComplete", [o.impstring, o]);
					if($.isFunction(o.importComplete)) {
						o.importComplete(o.impstring);
					}
				}
				break;
		}
	}
});
	$.jgrid.extend({
		jqGridExport : function(o) {
			o = $.extend({
				exptype : "xmlstring",
				root: "grid",
				ident: "\t",
				addOptions : {}
			}, o || {});
			var ret = null;
			this.each(function () {
				if(!this.grid) { return;}
				var key, gprm = $.extend(true, {}, $(this).jqGrid("getGridParam"), o.addOptions);
				// we need to check for:
				// 1.multiselect, 2.subgrid  3. treegrid and remove the unneded columns from colNames
				if(gprm.rownumbers) {
					gprm.colNames.splice(0,1);
					gprm.colModel.splice(0,1);
				}
				if(gprm.multiselect) {
					gprm.colNames.splice(0,1);
					gprm.colModel.splice(0,1);
				}
				if(gprm.subGrid) {
					gprm.colNames.splice(0,1);
					gprm.colModel.splice(0,1);
				}
				gprm.knv = null;
				if(gprm.treeGrid) {
					for (key in gprm.treeReader) {
						if(gprm.treeReader.hasOwnProperty(key)) {
							gprm.colNames.splice(gprm.colNames.length-1);
							gprm.colModel.splice(gprm.colModel.length-1);
						}
					}
				}
				switch (o.exptype) {
					case 'xmlstring' :
						ret = "<"+o.root+">"+ jqGridUtils.jsonToXML( gprm, {xmlDecl:""} )+"</"+o.root+">";
						break;
					case 'jsonstring' :
						ret =  jqGridUtils.stringify( gprm );
						if(o.root) { ret = "{"+ o.root +":"+ret+"}"; }
						break;
				}
			});
			return ret;
		},
		excelExport : function(o) {
			o = $.extend({
				exptype : "remote",
				url : null,
				oper: "oper",
				tag: "excel",
				exportOptions : {}
			}, o || {});
			return this.each(function(){
				if(!this.grid) { return;}
				var url;
				if(o.exptype === "remote") {
					var pdata = $.extend({},this.p.postData);
					pdata[o.oper] = o.tag;
					var params = jQuery.param(pdata);
					if(o.url.indexOf("?") !== -1) { url = o.url+"&"+params; }
					else { url = o.url+"?"+params; }
					window.location = url;
				}
			});
		}
    });
//module end
}));
