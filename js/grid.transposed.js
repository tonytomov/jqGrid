/*jshint eqeqeq:false */
/*global jQuery, define */
(function( factory ) {
	"use strict";
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./grid.base"
		], factory );
	} else {
		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
"use strict";
//module begin
$.jgrid.extend({
	tranposeSetup : function( data, options ){
		// return the final result.
		var columns =[], rows=[],  model = false,
		o = $.extend ( {
			nameprefix : "col",  // prefix for the creted name in colModel + index
			labelprefix : "value ", // prefix for the colNames titles + index
			baseindex : 0, // which is the base index from source data to transpose cols to rows
			beforeCreateGrid : null // even befor creating the jqGrid. passed is a object 
									// containing colModel and data (rows)
		}, options || {});
		this.each(function(){
			// trnsform data and build colModel
			var keys = Object.keys(data[o.baseindex]), rowobj, col;
			
			// for all columns
			for(var i =0; i<  keys.length; i++) {
				rowobj = {}, col=0;
				
				rowobj["col_name"] = keys[i];
				
				if(!model) {
					// build colmodel first item
					columns.push({name:"col_name"});
				}
				col++;
				  
				 
				// loop in every row and put it as column
				for(var j=0; j< data.length; j++) {
					var tmp = data[j];
					rowobj[o.nameprefix + col]= tmp[keys[i]];
					if(!model) {
						// colModel next items
						columns.push({name:o.nameprefix + col, label : o.labelprefix + col});
					}
					col++;
				}
				// colModel is build
				model = true;
				rows.push(rowobj);
			}
		});
		return { "colModel" : columns, "rows": rows };
	},
	jqTranspose : function( data, transpOpt, gridOpt, ajaxOpt) {
		return this.each(function(){
			var $t = this,
				regional = (gridOpt && gridOpt.regional) ? gridOpt.regional : "en";
			if(transpOpt.loadMsg === undefined) {
				transpOpt.loadMsg = true;
			}
			if(transpOpt.loadMsg) {
				$("<div class='loading_pivot ui-state-default ui-state-active row'>"+$.jgrid.getRegional($t, "regional."+regional+".defaults.loadtext")+"</div>").insertBefore($t).show();
			}

			function transpose( data, o) {
				if(!$.isArray(data)) {
					//throw "data provides is not an array";
					data = [];
				}
				var transpGrid = jQuery($t).jqGrid('tranposeSetup',data, transpOpt);
				if($.jgrid.isFunction(transpOpt.beforeCreateGrid)) {
					transpOpt.beforeCreateGrid.call($t, transpGrid);
				}
				var query= $.jgrid.from.call($t, transpGrid.rows);
				jQuery($t).jqGrid($.extend(true, {
					datastr: query.select(),
					datatype: "jsonstring",
					colModel: transpGrid.colModel,
					jsonReader : {
						repeatitems : false
					},
					viewrecords: true
					//sortname: transpOpt.xDimension[0].dataName // ?????
				}, gridOpt || {}));
				if(transpOpt.loadMsg) {
					$(".loading_pivot").remove();
				}
			}
						
			if(typeof data === "string") {
				$.ajax($.extend({
					url : data,
					dataType: 'json',
					success : function(response) {
						transpose($.jgrid.getAccessor(response, ajaxOpt && ajaxOpt.reader ? ajaxOpt.reader: 'rows') );
					}
				}, ajaxOpt || {}) );
			} else {
				transpose( data );
			}
		});
	},
	addColSearchMenu :  function() {
		return this.each(function(){
			var $t = this;
			$($t).colMenuAdd('sc',{
				title: 'Reset',
				position : "first",
				id :"reset",
				funcname : function() {
					$("input[id^='jqs_']", "#"+this.p.id ).each(function(i){
						$(this).val("");
					});
					$(this)[0].p._results ={};
					$(this).jqGrid('showCol', this.p._avc);
				}
			});
			$($t).colMenuAdd('sc',{
				separator : true,
				id:"groupOp"
			});
			$($t).colMenuAdd('sc',{
				separator : true,
				id:"operOp"
			});
			$($t).colMenuAdd('sc',{
				//title: 'Close',
				separator : true,
				id :"close",
				funcname : function() {
					return true;
				}
			});
			$($t).on("jqGridcolMenuBeforeProcess.custom", function(t, p){
				if(p.module === 'custom' && p.column === 'sc') {
					var regional = $.jgrid.getRegional(this, "search"),
						tstl,
						sopt = this.p.searchColOptions,
						getstyle = $.jgrid.getMethod("getStyleUI"),
						stylemodule = this.p.styleUI + ".base";
					if(p.action.id === "reset") {
						p.action.title = regional.Reset || 'Reset';
						p.action.icon = getstyle(this.p.styleUI + ".colmenu", 'icon_reset', true, '');
					}
					if(p.action.id === "close") {
						p.action.title = regional.Close || 'Close';
						p.action.icon = getstyle(this.p.styleUI + ".colmenu", 'icon_close', true, '');
					}
					if(p.action.id === "groupOp") {
						tstl = getstyle(stylemodule, 'searchSelect', false, 'search-col-input');
						p.action.title = ""+(regional.Operand || "Operand: ")+"";
						p.action.title +='<select data-grid-id='+this.p.id+' id="opselect"  '+ tstl+'>';
						tstl = getstyle(this.p.styleUI + ".colmenu", 'icon_group_op', true, ''); 
						p.action.icon = tstl;
						for (var i = 0;i< regional.groupOps.length; i++) {
							var selected = sopt.searchOp === regional.groupOps[i].op ? "selected" : "";
							p.action.title += "<option value=\"" + regional.groupOps[i].op +"\" " + selected+">"+regional.groupOps[i].text+"</option>";
						}
						p.action.title += "</select>";
						setTimeout(function() {
							$("#opselect").on('change', function(){
								var gid =$("#"+ $(this).attr('data-grid-id'))[0];
								gid.p.searchColOptions.searchOp = $(this).val();
								$.jgrid.myfunc(gid.p.id);
								//$("#column_menu").remove();
							});
						}, 200);
					}
					if(p.action.id === "operOp") {
						tstl = getstyle(stylemodule, 'searchSelect', false, 'search-col-input');
						p.action.title = regional.Operation || "Oper : ";
						p.action.title += '<select data-grid-id='+this.p.id+' id="selectoper"  '+ tstl+'>';
						tstl = getstyle(this.p.styleUI + ".colmenu", 'icon_oper_op', true, ''); 
						p.action.icon = tstl;
						for (var i = 0;i <  regional.odata.length; i++) {
							var selected = sopt.operand === regional.odata[i].oper ? "selected" : "";
							if(sopt.aOperands.includes( regional.odata[i].oper )) {
								p.action.title += "<option value=\"" + regional.odata[i].oper +"\" " + selected+">"+regional.odata[i].text+"</option>";
							}
						}
						p.action.title += "</select>";
						setTimeout(function() {
							$("#selectoper").on('change', function(){
								var gid =$("#"+ $(this).attr('data-grid-id'))[0];
								gid.p.searchColOptions.operand = $(this).val();
								$.jgrid.myfunc(gid.p.id);
								//$("#column_menu").remove();
							});
						}, 200);
					}
				}
			});
		});
	}
});
//module end
}));
