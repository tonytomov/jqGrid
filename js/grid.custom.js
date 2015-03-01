/*jshint eqeqeq:false */
/*jslint browser: true, devel: true, eqeq: true, evil: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, vars: true, white: true, maxerr: 999 */
/*global jQuery */
(function($){
/**
 * jqGrid extension for custom methods
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/ 
 * 
 * Wildraid wildraid@mail.ru
 * Oleg Kiriljuk oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
**/
"use strict";
var jgrid = $.jgrid, getGridRes = jgrid.getMethod("getGridRes");
jgrid.extend({
	getColProp : function(colname){
		var ret ={}, $t = this[0];
		if ( !$t.grid ) { return false; }
		var cM = $t.p.colModel, i;
		for ( i=0;i<cM.length;i++ ) {
			if ( cM[i].name === colname ) {
				ret = cM[i];
				break;
			}
		}
		return ret;
	},
	setColProp : function(colname, obj){
		//do not set width will not work
		return this.each(function(){
			var self = this, p = self.p; 
			if (self.grid && p != null && obj) {
				var cM = p.colModel, i;
				for ( i=0;i<cM.length;i++ ) {
					if ( cM[i].name === colname ) {
						$.extend(true, cM[i],obj);
						break;
					}
				}
			}
		});
	},
	sortGrid : function(colname, reload, sor){
		return this.each(function(){
			var self = this, grid = self.grid, p = self.p, colModel = p.colModel, l = colModel.length, cm, i, sobj = false, sort;
			if (!grid) { return; }
			if (!colname) { colname = p.sortname; }
			if (typeof reload !=='boolean') { reload = false; }
			for (i = 0; i < l; i++) {
				cm = colModel[i];
				if (cm.index === colname || cm.name === colname) {
					if (p.frozenColumns === true && cm.frozen === true) {
						sobj = grid.fhDiv.find("#" + p.id + "_" + colname);
					}
					if (!sobj || sobj.length === 0) {
						sobj = grid.headers[i].el;
					}
					sort = cm.sortable;
					if (typeof sort !== 'boolean' || sort) {
						self.sortData("jqgh_"+p.id+"_" + colname, i, reload, sor, sobj);
					}
					break;
				}
			}
		});
	},
	clearBeforeUnload : function () {
		return this.each(function(){
			var self = this, p = self.p, grid = self.grid, propOrMethod, clearArray = jgrid.clearArray;
			if ($.isFunction(grid.emptyRows)) {
				grid.emptyRows.call(self, true, true); // this work quick enough and reduce the size of memory leaks if we have someone
			}

			$(document).unbind("mouseup.jqGrid" + p.id ); 
			$(grid.hDiv).unbind("mousemove"); // TODO add namespace
			$(self).unbind();

			/*grid.dragEnd = null;
			grid.dragMove = null;
			grid.dragStart = null;
			grid.emptyRows = null;
			grid.populate = null;
			grid.populateVisible = null;
			grid.scrollGrid = null;
			grid.selectionPreserver = null;

			grid.bDiv = null;
			grid.cDiv = null;
			grid.hDiv = null;
			grid.cols = null;*/
			var i, l = grid.headers.length;
			for (i = 0; i < l; i++) {
				grid.headers[i].el = null;
			}
			for (propOrMethod in grid) {
				if (grid.hasOwnProperty(propOrMethod)) {
					grid.propOrMethod = null;
				}
			}

			/*self.formatCol = null;
			self.sortData = null;
			self.updatepager = null;
			self.refreshIndex = null;
			self.setHeadCheckBox = null;
			self.constructTr = null;
			self.formatter = null;
			self.addXmlData = null;
			self.addJSONData = null;
			self.grid = null;*/

			var propOrMethods = ['formatCol','sortData','updatepager','refreshIndex','setHeadCheckBox','constructTr','formatter','addXmlData','addJSONData','nav','grid','p'];
			l = propOrMethods.length;
			for(i = 0; i < l; i++) {
				if(self.hasOwnProperty(propOrMethods[i])) {
					self[propOrMethods[i]] = null;
				}
			}
			self._index = {};
			clearArray(p.data);
			clearArray(p.lastSelectedData);
			clearArray(p.selarrrow);
			clearArray(p.savedRow);
		});
	},
	GridDestroy : function () {
		return this.each(function(){
			var self = this, p = self.p, pager = p.pager;
			if ( self.grid ) { 
				if (pager) { // if not part of grid
					$(pager).remove();
				}
				try {
					$(self).jqGrid('clearBeforeUnload');
					$(p.gBox).remove();
					$("#alertmod_"+p.idSel).remove();
				} catch (ignore) {}
			}
		});
	},
	GridUnload : function(){
		return this.each(function(){
			var self = this, p = self.p;
			if ( !self.grid ) {return;}
			var defgrid = {id: $(self).attr('id'),cl: $(self).attr('class')};
			if (p.pager) {
				$(p.pager).empty().removeClass("ui-state-default ui-jqgrid-pager ui-corner-bottom");
			}
			var newtable = document.createElement('table');
			$(newtable).attr({id:defgrid.id});
			newtable.className = defgrid.cl;
			$(newtable).removeClass("ui-jqgrid-btable");
			if( $(p.pager).parents(p.gBox).length === 1 ) {
				$(newtable).insertBefore(p.gBox).show();
				$(p.pager).insertBefore(p.gBox);
			} else {
				$(newtable).insertBefore(p.gBox).show();
			}
			$(self).jqGrid('clearBeforeUnload');
			$(p.gBox).remove();
		});
	},
	setGridState : function(state) {
		return this.each(function(){
			var $t = this, p = $t.p, grid = $t.grid, cDiv = grid.cDiv, $uDiv = $(grid.uDiv), $ubDiv = $(grid.ubDiv);
			if (!grid) {return;}
			if(state === 'hidden'){
				$(".ui-jqgrid-bdiv, .ui-jqgrid-hdiv",p.gView).slideUp("fast");
				if(p.pager) {$(p.pager).slideUp("fast");}
				if(p.toppager) {$(p.toppager).slideUp("fast");}
				if(p.toolbar[0]===true) {
					if( p.toolbar[1] === 'both') {
						$ubDiv.slideUp("fast");
					}
					$uDiv.slideUp("fast");
				}
				if(p.footerrow) { $(".ui-jqgrid-sdiv",p.gBox).slideUp("fast"); }
				$(".ui-jqgrid-titlebar-close span",cDiv).removeClass("ui-icon-circle-triangle-n").addClass("ui-icon-circle-triangle-s");
				p.gridstate = 'hidden';
			} else if(state === 'visible') {
				$(".ui-jqgrid-hdiv, .ui-jqgrid-bdiv",p.gView).slideDown("fast");
				if(p.pager) {$(p.pager).slideDown("fast");}
				if(p.toppager) {$(p.toppager).slideDown("fast");}
				if(p.toolbar[0]===true) {
					if( p.toolbar[1] === 'both') {
						$ubDiv.slideDown("fast");
					}
					$uDiv.slideDown("fast");
				}
				if(p.footerrow) { $(".ui-jqgrid-sdiv",p.gBox).slideDown("fast"); }
				$(".ui-jqgrid-titlebar-close span",cDiv).removeClass("ui-icon-circle-triangle-s").addClass("ui-icon-circle-triangle-n");
				p.gridstate = 'visible';
			}

		});
	},
	filterToolbar : function(oMuligrid){
		// if one uses jQuery wrapper with multiple grids, then oMultiple specify the object with common options
		return this.each(function(){
			var $t = this, grid = $t.grid, $self = $($t), p = $t.p, bindEv = jgrid.bindEv, infoDialog = jgrid.info_dialog;
			if(this.ftoolbar) { return; }
			// make new copy of the options and use it for ONE specific grid.
			// p.searching can contains grid specific options
			// we will don't modify the input options oMuligrid
			var o = $.extend(true, {
				autosearch: true,
				autosearchDelay: 500,
				searchOnEnter : true,
				beforeSearch: null,
				afterSearch: null,
				beforeClear: null,
				afterClear: null,
				searchurl : '',
				stringResult: false,
				groupOp: 'AND',
				defaultSearch : "bw",
				searchOperators : false,
				resetIcon : "x",
				operands : { "eq" :"==", "ne":"!","lt":"<","le":"<=","gt":">","ge":">=","bw":"^","bn":"!^","in":"=","ni":"!=","ew":"|","en":"!@","cn":"~","nc":"!~","nu":"#","nn":"!#"}
			}, jgrid.search, p.searching || {}, oMuligrid || {});
			var colModel = p.colModel,
				getRes = function (path) {
					return getGridRes.call($self, path);
				},
				errcap = getRes("errors.errcap"), bClose = getRes("edit.bClose"), editMsg = getRes("edit.msg"),
				jqID = jgrid.jqID;
			var triggerToolbar = function() {
				var sdata={}, j=0, v, nm, sopt={},so;
				$.each(colModel,function(){
					var cm = this, $elem = $("#gs_"+jqID(cm.name), (cm.frozen===true && p.frozenColumns === true) ?  grid.fhDiv : grid.hDiv);
					nm = cm.index || cm.name;
					if(o.searchOperators ) {
						so = $elem.parent().prev().children("a").data("soper") || o.defaultSearch;
					} else {
						so  = (cm.searchoptions && cm.searchoptions.sopt) ? cm.searchoptions.sopt[0] : cm.stype==='select'?  'eq' : o.defaultSearch;
					}
					v = cm.stype === "custom" && $.isFunction(cm.searchoptions.custom_value) && $elem.length > 0 && $elem[0].nodeName.toUpperCase() === "SPAN" ?
						cm.searchoptions.custom_value.call($t, $elem.children(".customelement").filter(":first"), "get") :
						$elem.val();
					if(v || so==="nu" || so==="nn") {
						sdata[nm] = v;
						sopt[nm] = so;
						j++;
					} else {
						try {
							delete p.postData[nm];
						} catch (ignore) {}
					}
				});
				var sd =  j>0 ? true : false;
				if(o.stringResult === true || p.datatype === "local" || o.searchOperators === true) {
					var ruleGroup = "{\"groupOp\":\"" + o.groupOp + "\",\"rules\":[";
					var gi=0;
					$.each(sdata,function(i,n){
						if (gi > 0) {ruleGroup += ",";}
						ruleGroup += "{\"field\":\"" + i + "\",";
						ruleGroup += "\"op\":\"" + sopt[i] + "\",";
						n+="";
						ruleGroup += "\"data\":\"" + n.replace(/\\/g,'\\\\').replace(/\"/g,'\\"') + "\"}";
						gi++;
					});
					ruleGroup += "]}";
					$.extend(p.postData,{filters:ruleGroup});
					$.each(['searchField', 'searchString', 'searchOper'], function(i, n){
						if(p.postData.hasOwnProperty(n)) { delete p.postData[n];}
					});
				} else {
					$.extend(p.postData,sdata);
				}
				var saveurl;
				if(p.searchurl) {
					saveurl = p.url;
					$self.jqGrid("setGridParam",{url:p.searchurl});
				}
				var bsr = $self.triggerHandler("jqGridToolbarBeforeSearch") === 'stop' ? true : false;
				if(!bsr && $.isFunction(o.beforeSearch)){bsr = o.beforeSearch.call($t);}
				if(!bsr) { $self.jqGrid("setGridParam",{search:sd}).trigger("reloadGrid",[{page:1}]); }
				if(saveurl) {$self.jqGrid("setGridParam",{url:saveurl});}
				$self.triggerHandler("jqGridToolbarAfterSearch");
				if($.isFunction(o.afterSearch)){o.afterSearch.call($t);}
			},
			clearToolbar = function(trigger){
				var sdata={}, j=0, nm;
				trigger = (typeof trigger !== 'boolean') ? true : trigger;
				$.each(colModel,function(){
					var v, cm = this, $elem = $("#gs_"+jqID(cm.name),(cm.frozen===true && p.frozenColumns === true) ? grid.fhDiv : grid.hDiv),
						isSindleSelect;
					if(cm.searchoptions && cm.searchoptions.defaultValue !== undefined) { v = cm.searchoptions.defaultValue; }
					nm = cm.index || cm.name;
					switch (cm.stype) {
						case 'select' :
							isSindleSelect = $elem.length > 0 ? !$elem[0].multiple : true;
							$elem.find("option").each(function (i){
								this.selected = i === 0 && isSindleSelect;
								if ($(this).val() === v) {
									this.selected = true;
									return false;
								}
							});
							if ( v !== undefined ) {
								// post the key and not the text
								sdata[nm] = v;
								j++;
							} else {
								try {
									delete p.postData[nm];
								} catch(ignore) {}
							}
							break;
						case 'text':
							$elem.val(v || "");
							if(v !== undefined) {
								sdata[nm] = v;
								j++;
							} else {
								try {
									delete p.postData[nm];
								} catch (ignore){}
							}
							break;
						case 'custom':
							if ($.isFunction(cm.searchoptions.custom_value) && $elem.length > 0 && $elem[0].nodeName.toUpperCase() === "SPAN") {
								cm.searchoptions.custom_value.call($t, $elem.children(".customelement").filter(":first"), "set", v || "");
							}
							break;
					}
				});
				var sd =  j>0 ? true : false;
				p.resetsearch =  true;
				if(o.stringResult === true || p.datatype === "local") {
					var ruleGroup = "{\"groupOp\":\"" + o.groupOp + "\",\"rules\":[";
					var gi=0;
					$.each(sdata,function(i,n){
						if (gi > 0) {ruleGroup += ",";}
						ruleGroup += "{\"field\":\"" + i + "\",";
						ruleGroup += "\"op\":\"" + "eq" + "\",";
						n+="";
						ruleGroup += "\"data\":\"" + n.replace(/\\/g,'\\\\').replace(/\"/g,'\\"') + "\"}";
						gi++;
					});
					ruleGroup += "]}";
					$.extend(p.postData,{filters:ruleGroup});
					$.each(['searchField', 'searchString', 'searchOper'], function(i, n){
						if(p.postData.hasOwnProperty(n)) { delete p.postData[n];}
					});
				} else {
					$.extend(p.postData,sdata);
				}
				var saveurl;
				if(p.searchurl) {
					saveurl = p.url;
					$self.jqGrid("setGridParam",{url:p.searchurl});
				}
				var bcv = $self.triggerHandler("jqGridToolbarBeforeClear") === 'stop' ? true : false;
				if(!bcv && $.isFunction(o.beforeClear)){bcv = o.beforeClear.call($t);}
				if(!bcv) {
					if(trigger) {
						$self.jqGrid("setGridParam",{search:sd}).trigger("reloadGrid",[{page:1}]);
					}
				}
				if(saveurl) {$self.jqGrid("setGridParam",{url:saveurl});}
				$self.triggerHandler("jqGridToolbarAfterClear");
				if($.isFunction(o.afterClear)){o.afterClear();}
			},
			toggleToolbar = function(){
				var trow = $("tr.ui-search-toolbar",grid.hDiv),
				trow2 = p.frozenColumns === true ?  $("tr.ui-search-toolbar",grid.fhDiv) : false;
				if(trow.css("display") === 'none') {
					trow.show(); 
					if(trow2) {
						trow2.show();
					}
				} else { 
					trow.hide(); 
					if(trow2) {
						trow2.hide();
					}
				}
			},
			odata = getRes("search.odata") || [],
			customSortOperations = p.customSortOperations,
			buildRuleMenu = function( elem, left, top ){
				$("#sopt_menu").remove();

				left=parseInt(left,10);
				top=parseInt(top,10) + 18;

				var fs =  $('.ui-jqgrid-view').css('font-size') || '11px';
				var str = '<ul id="sopt_menu" class="ui-search-menu" role="menu" tabindex="0" style="font-size:'+fs+';left:'+left+'px;top:'+top+'px;">',
				selected = $(elem).data("soper"), selclass,
				aoprs = [], ina;
				var i=0, nm =$(elem).data("colname"),len = colModel.length;
				while(i<len) {
					if(colModel[i].name === nm) {
						break;
					}
					i++;
				}
				var cm = colModel[i], options = $.extend({}, cm.searchoptions), odataItem, item, itemOper, itemOperand, itemText;
				if(!options.sopt) {
					options.sopt = [];
					options.sopt[0]= cm.stype==='select' ?  'eq' : o.defaultSearch;
				}
				$.each(odata, function() { aoprs.push(this.oper); });
				// append aoprs array with custom operations defined in customSortOperations parameter jqGrid
				if (customSortOperations != null) {
					$.each(customSortOperations, function(propertyName) { aoprs.push(propertyName); });
				}
				for ( i = 0 ; i < options.sopt.length; i++) {
					itemOper = options.sopt[i];
					ina = $.inArray(itemOper,aoprs);
					if(ina !== -1) {
						odataItem = odata[ina];
						if (odataItem !== undefined) {
							// standard operation
							itemOperand = o.operands[itemOper];
							itemText = odataItem.text;
						} else if (customSortOperations != null) {
							// custom operation
							item = customSortOperations[itemOper];
							itemOperand = item.operand;							
							itemText = item.text;
						}
						selclass = selected === itemOper ? "ui-state-highlight" : "";
						str += '<li class="ui-menu-item '+selclass+'" role="presentation"><a class="ui-corner-all g-menu-item" tabindex="0" role="menuitem" value="'+itemOper+'" data-oper="'+itemOperand+'"><table'+(jgrid.msie && jgrid.msiever() < 8 ? ' cellspacing="0"' : '')+'><tr><td style="width:25px">'+itemOperand+'</td><td>'+ itemText+'</td></tr></table></a></li>';
					}
				}
				str += "</ul>";
				$('body').append(str);
				$("#sopt_menu").addClass("ui-menu ui-widget ui-widget-content ui-corner-all");
				$("#sopt_menu > li > a").hover(
					function(){ $(this).addClass("ui-state-hover"); },
					function(){ $(this).removeClass("ui-state-hover"); }
				).click(function(){
					var v = $(this).attr("value"),
					oper = $(this).data("oper");
					$self.triggerHandler("jqGridToolbarSelectOper", [v, oper, elem]);
					$("#sopt_menu").hide();
					$(elem).text(oper).data("soper",v);
					if(o.autosearch===true){
						var inpelm = $(elem).parent().next().children()[0];
						if( $(inpelm).val() || v==="nu" || v ==="nn") {
							triggerToolbar();
						}
					}
				});
			};
			// create the row
			var tr = $("<tr class='ui-search-toolbar' role='row'></tr>");
			var timeoutHnd;
			$.each(colModel,function(ci){
				var cm=this, soptions, surl, self, select = "", sot, so, i, searchoptions = cm.searchoptions, editoptions = cm.editoptions,
				th = $("<th role='columnheader' class='ui-state-default ui-th-column ui-th-"+p.direction+"'></th>"),
				thd = $("<div style='position:relative;height:auto;padding-right:0.3em;padding-left:0.3em;'></div>"),
				stbl = $("<table class='ui-search-table'"+(jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "")+"><tr><td class='ui-search-oper'></td><td class='ui-search-input'></td><td class='ui-search-clear'></td></tr></table>");
				if(this.hidden===true) { $(th).css("display","none");}
				this.search = this.search === false ? false : true;
				if(this.stype === undefined) {this.stype='text';}
				soptions = $.extend({},this.searchoptions || {});
				if(this.search){
					if(o.searchOperators) {
						so = (soptions.sopt) ? soptions.sopt[0] : cm.stype==='select' ?  'eq' : o.defaultSearch;
						for(i = 0;i<odata.length;i++) {
							if(odata[i].oper === so) {
								sot = o.operands[so] || "";
								break;
							}
						}
						if (sot === undefined && customSortOperations != null) {
							var customOp;
							for (customOp in customSortOperations) {
								if (customSortOperations.hasOwnProperty(customOp)) {
									sot = customSortOperations[customOp].operand;
									//soptions.searchtitle = customSortOperations[customOp].title;
								}
							}
						}
						if (sot === undefined) { sot = "="; }
						var st = soptions.searchtitle != null ? soptions.searchtitle : getRes("search.operandTitle");
						select = "<a title='"+st+"' style='padding-right: 0.5em;' data-soper='"+so+"' class='soptclass' data-colname='"+this.name+"'>"+sot+"</a>";
					}
					$("td",stbl).filter(":first").data("colindex",ci).append(select);
					if (soptions.sopt == null || soptions.sopt.length === 1) {
						$("td.ui-search-oper",stbl).hide();
					}
					if(soptions.clearSearch === undefined) {
						soptions.clearSearch = this.stype === "text" ? true : false;
					}
					if(soptions.clearSearch) {
						var csv = getRes("search.resetTitle") || 'Clear Search Value';
						$("td",stbl).eq(2).append("<a title='"+csv+"' style='padding-right: 0.3em;padding-left: 0.3em;' class='clearsearchclass'>"+o.resetIcon+"</a>");
					} else {
						$("td",stbl).eq(2).hide();
					}
					switch (this.stype)
					{
					case "select":
						surl = this.surl || soptions.dataUrl;
						if(surl) {
							// data returned should have already constructed html select
							// primitive jQuery load
							self = thd;
							$(self).append(stbl);
							$.ajax($.extend({
								url: surl,
								dataType: "html",
								success: function (data) {
									if(soptions.buildSelect !== undefined) {
										var d = soptions.buildSelect(data);
										if (d) {
											$("td",stbl).eq(1).append(d);
										}
									} else {
										$("td",stbl).eq(1).append(data);
									}
									var $select = stbl.find("td.ui-search-input>select"); // stbl.find(">tbody>tr>td.ui-search-input>select")
									if(soptions.defaultValue !== undefined) { $select.val(soptions.defaultValue); }
									$select.attr({name:cm.index || cm.name, id: "gs_"+cm.name});
									if(soptions.attr) {$select.attr(soptions.attr);}
									$select.css({width: "100%"});
									// preserve autoserch
									bindEv.call($t, $select[0], soptions);
									jgrid.fullBoolFeedback.call($t, soptions.selectFilled, "jqGridSelectFilled", {
										elem: $select[0],
										options: soptions,
										cm: cm,
										cmName: cm.name,
										iCol: ci
									});
									if(o.autosearch===true){
										$select.change(function(){
											triggerToolbar();
											return false;
										});
									}
								}
							}, jgrid.ajaxOptions, p.ajaxSelectOptions || {} ));
						} else {
							var oSv, sep, delim;
							if(searchoptions) {
								oSv = searchoptions.value === undefined ? "" : searchoptions.value;
								sep = searchoptions.separator === undefined ? ":" : searchoptions.separator;
								delim = searchoptions.delimiter === undefined ? ";" : searchoptions.delimiter;
							} else if(editoptions) {
								oSv = editoptions.value === undefined ? "" : editoptions.value;
								sep = editoptions.separator === undefined ? ":" : editoptions.separator;
								delim = editoptions.delimiter === undefined ? ";" : editoptions.delimiter;
							}
							if (oSv) {	
								var elem = document.createElement("select");
								elem.style.width = "100%";
								$(elem).attr({name:cm.index || cm.name, id: "gs_"+cm.name});
								var sv, ov, key, k;
								if(typeof oSv === "string") {
									so = oSv.split(delim);
									for(k=0; k<so.length;k++){
										sv = so[k].split(sep);
										ov = document.createElement("option");
										ov.value = sv[0]; ov.innerHTML = sv[1];
										elem.appendChild(ov);
									}
								} else if(typeof oSv === "object" ) {
									for (key in oSv) {
										if(oSv.hasOwnProperty(key)) {
											ov = document.createElement("option");
											ov.value = key; ov.innerHTML = oSv[key];
											elem.appendChild(ov);
										}
									}
								}
								if(soptions.defaultValue !== undefined) { $(elem).val(soptions.defaultValue); }
								if(soptions.attr) {$(elem).attr(soptions.attr);}
								$(thd).append(stbl);
								bindEv.call($t, elem , soptions);
								$("td",stbl).eq(1).append( elem );
								jgrid.fullBoolFeedback.call($t, searchoptions.selectFilled, "jqGridSelectFilled", {
									elem: elem,
									options: searchoptions,
									cm: cm,
									cmName: cm.name,
									iCol: ci
								});
								if(o.autosearch===true){
									$(elem).change(function(){
										triggerToolbar();
										return false;
									});
								}
							}
						}
						break;
					case "text":
						var df = soptions.defaultValue !== undefined ? soptions.defaultValue: "";

						$("td",stbl).eq(1).append("<input type='text' style='width:100%;padding:0;' name='"+(cm.index || cm.name)+"' id='gs_"+cm.name+"' value='"+df+"'/>");
						$(thd).append(stbl);

						if(soptions.attr) {$("input",thd).attr(soptions.attr);}
						bindEv.call($t, $("input",thd)[0], soptions);
						if(o.autosearch===true){
							if(o.searchOnEnter) {
								$("input",thd).keypress(function(e){
									var key1 = e.charCode || e.keyCode || 0;
									if(key1 === 13){
										triggerToolbar();
										return false;
									}
									return this;
								});
							} else {
								$("input",thd).keydown(function(e){
									var key1 = e.which;
									switch (key1) {
										case 13:
											return false;
										case 9 :
										case 16:
										case 37:
										case 38:
										case 39:
										case 40:
										case 27:
											break;
										default :
											if(timeoutHnd) { clearTimeout(timeoutHnd); }
											timeoutHnd = setTimeout(function(){triggerToolbar();}, o.autosearchDelay);
									}
								});
							}
						}
						break;
					case "custom":
						$("td",stbl).eq(1).append("<span style='width:95%;padding:0;' name='"+(cm.index || cm.name)+"' id='gs_"+cm.name+"'/>");
						$(thd).append(stbl);
						try {
							if($.isFunction(soptions.custom_element)) {
								var celm = soptions.custom_element.call($t,soptions.defaultValue !== undefined ? soptions.defaultValue: "",soptions);
								if(celm) {
									celm = $(celm).addClass("customelement");
									$(thd).find("span[name='" + (cm.index || cm.name) + "']").append(celm);
								} else {
									throw "e2";
								}
							} else {
								throw "e1";
							}
						} catch (e) {
							if (e === "e1") { infoDialog.call($t,errcap,"function 'custom_element' "+editMsg.nodefined,bClose);}
							if (e === "e2") { infoDialog.call($t,errcap,"function 'custom_element' "+editMsg.novalue,bClose);}
							else { infoDialog.call($t,errcap,typeof e==="string"?e:e.message,bClose); }
						}
						break;
					}
				}
				$(th).append(thd);
				$(tr).append(th);
				if(!o.searchOperators) {
					$("td",stbl).eq(0).hide();
				}
			});
			$("table thead",grid.hDiv).append(tr);
			if(o.searchOperators) {
				$(".soptclass",tr).click(function(e){
					var offset = $(this).offset(),
					left = ( offset.left ),
					top = ( offset.top);
					buildRuleMenu(this, left, top );
					e.stopPropagation();
				});
				$("body").on('click', function(e){
					if(e.target.className !== "soptclass") {
						$("#sopt_menu").hide();
					}
				});
			}
			$(".clearsearchclass",tr).click(function(){
				var ptr = $(this).parents("tr").filter(":first"),
				coli = parseInt($("td.ui-search-oper", ptr).data('colindex'),10),
				sval  = $.extend({},colModel[coli].searchoptions || {}),
				dval = sval.defaultValue || "";
				if(colModel[coli].stype === "select") {
					if(dval) {
						$("td.ui-search-input select", ptr).val( dval );
					} else {
						$("td.ui-search-input select", ptr)[0].selectedIndex = 0;
					}
				} else {
					$("td.ui-search-input input", ptr).val( dval );
				}
				// ToDo custom search type
				if(o.autosearch===true){
					triggerToolbar();
				}

			});
			$t.ftoolbar = true;
			$t.triggerToolbar = triggerToolbar;
			$t.clearToolbar = clearToolbar;
			$t.toggleToolbar = toggleToolbar;
		});
	},
	destroyFilterToolbar: function () {
		return this.each(function () {
			var self = this;
			if (!self.ftoolbar) {
				return;
			}
			self.triggerToolbar = null;
			self.clearToolbar = null;
			self.toggleToolbar = null;
			self.ftoolbar = false;
			$(self.grid.hDiv).find("table thead tr.ui-search-toolbar").remove();
		});
	},
	destroyGroupHeader : function(nullHeader) {
		if(nullHeader === undefined) {
			nullHeader = true;
		}
		return this.each(function()
		{
			var $t = this, i, l, $th, $resizing, grid = $t.grid,
			thead = $("table.ui-jqgrid-htable thead", grid.hDiv), cm = $t.p.colModel, hc;
			if(!grid) { return; }

			$($t).unbind('.setGroupHeaders');
			var $tr = $("<tr>", {role: "row"}).addClass("ui-jqgrid-labels");
			var headers = grid.headers;
			for (i = 0, l = headers.length; i < l; i++) {
				hc = cm[i].hidden ? "none" : "";
				$th = $(headers[i].el)
					.width(headers[i].width)
					.css('display',hc);
				try {
					$th.removeAttr("rowSpan");
				} catch (rs) {
					//IE 6/7
					$th.attr("rowSpan",1);
				}
				$tr.append($th);
				$resizing = $th.children("span.ui-jqgrid-resize");
				if ($resizing.length>0) {// resizable column
					$resizing[0].style.height = "";
				}
				$th.children("div")[0].style.top = "";
			}
			$(thead).children('tr.ui-jqgrid-labels').remove();
			$(thead).prepend($tr);

			if(nullHeader === true) {
				$($t).jqGrid('setGridParam',{ 'groupHeader': null});
			}
		});
	},
	setGroupHeaders : function ( o ) {
		o = $.extend({
			useColSpanStyle :  false,
			groupHeaders: []
		},o  || {});
		return this.each(function(){
			this.p.groupHeader = o;
			var ts = this,
			i, cmi, skip = 0, $tr, $colHeader, th, $th, thStyle,
			iCol,
			cghi,
			//startColumnName,
			numberOfColumns,
			titleText,
			cVisibleColumns,
			colModel = ts.p.colModel,
			cml = colModel.length,
			ths = ts.grid.headers,
			$htable = $("table.ui-jqgrid-htable", ts.grid.hDiv),
			$trLabels = $htable.children("thead").children("tr.ui-jqgrid-labels:last").addClass("jqg-second-row-header"),
			$thead = $htable.children("thead"),
			$theadInTable,
			$firstHeaderRow = $htable.find(".jqg-first-row-header");
			if($firstHeaderRow[0] === undefined) {
				$firstHeaderRow = $('<tr>', {role: "row", "aria-hidden": "true"}).addClass("jqg-first-row-header").css("height", "auto");
			} else {
				$firstHeaderRow.empty();
			}
			var inColumnHeader = function (text, columnHeaders) {
				var length = columnHeaders.length, j;
				for (j = 0; j < length; j++) {
					if (columnHeaders[j].startColumnName === text) {
						return j;
					}
				}
				return -1;
			};

			$(ts).prepend($thead);
			$tr = $('<tr>', {role: "row"}).addClass("ui-jqgrid-labels jqg-third-row-header");
			for (i = 0; i < cml; i++) {
				th = ths[i].el;
				$th = $(th);
				cmi = colModel[i];
				// build the next cell for the first header row
				thStyle = { height: '0', width: ths[i].width + 'px', display: (cmi.hidden ? 'none' : '')};
				$("<th>", {role: 'gridcell'}).css(thStyle).addClass("ui-first-th-"+ts.p.direction).appendTo($firstHeaderRow);

				th.style.width = ""; // remove unneeded style
				iCol = inColumnHeader(cmi.name, o.groupHeaders);
				if (iCol >= 0) {
					cghi = o.groupHeaders[iCol];
					numberOfColumns = cghi.numberOfColumns;
					titleText = cghi.titleText;

					// caclulate the number of visible columns from the next numberOfColumns columns
					for (cVisibleColumns = 0, iCol = 0; iCol < numberOfColumns && (i + iCol < cml); iCol++) {
						if (!colModel[i + iCol].hidden) {
							cVisibleColumns++;
						}
					}

					// The next numberOfColumns headers will be moved in the next row
					// in the current row will be placed the new column header with the titleText.
					// The text will be over the cVisibleColumns columns
					$colHeader = $('<th>').attr({role: "columnheader"})
						.addClass("ui-state-default ui-th-column-header ui-th-"+ts.p.direction)
						.css({'height':'22px', 'border-top': '0 none'})
						.html(titleText);
					if(cVisibleColumns > 0) {
						$colHeader.attr("colspan", String(cVisibleColumns));
					}
					if (ts.p.headertitles) {
						$colHeader.attr("title", $colHeader.text());
					}
					// hide if not a visible cols
					if( cVisibleColumns === 0) {
						$colHeader.hide();
					}

					$th.before($colHeader); // insert new column header before the current
					$tr.append(th);         // move the current header in the next row

					// set the coumter of headers which will be moved in the next row
					skip = numberOfColumns - 1;
				} else {
					if (skip === 0) {
						if (o.useColSpanStyle) {
							// expand the header height to two rows
							$th.attr("rowspan", "2");
						} else {
							$('<th>', {role: "columnheader"})
								.addClass("ui-state-default ui-th-column-header ui-th-"+ts.p.direction)
								.css({"display": cmi.hidden ? 'none' : '', 'border-top': '0 none'})
								.insertBefore($th);
							$tr.append(th);
						}
					} else {
						// move the header to the next row
						$tr.append(th);
						skip--;
					}
				}
			}
			$theadInTable = $(ts).children("thead");
			$theadInTable.prepend($firstHeaderRow);
			$tr.insertAfter($trLabels);
			$htable.append($theadInTable);

			if (o.useColSpanStyle) {
				// Increase the height of resizing span of visible headers
				$htable.find("span.ui-jqgrid-resize").each(function () {
					var $parent = $(this).parent();
					if ($parent.is(":visible")) {
						this.style.cssText = 'height: ' + $parent.height() + 'px !important; cursor: col-resize;';
					}
				});

				// Set position of the sortable div (the main lable)
				// with the column header text to the middle of the cell.
				// One should not do this for hidden headers.
				$htable.find("div.ui-jqgrid-sortable").each(function () {
					var $ts = $(this), $parent = $ts.parent();
					if ($parent.is(":visible") && $parent.is(":has(span.ui-jqgrid-resize)")) {
						$ts.css('top', ($parent.height() - $ts.outerHeight()) / 2 + 'px');
					}
				});
			}
		});				
	},
	setFrozenColumns : function () {
		return this.each(function() {
			var $t = this, $self = $($t), p = $t.p, grid = $t.grid, jqID = jgrid.jqID;
			if (!grid) {return;}
			var cm = p.colModel,i=0, len = cm.length, maxfrozen = -1, frozen= false;
			// TODO treeGrid and grouping  Support
			// TODO: allow to edit columns AFTER frozen columns
			if(p.subGrid === true || p.treeGrid === true || p.cellEdit === true || p.sortable || p.scroll )
			{
				return;
			}
			if(p.rownumbers) { i++; }
			if(p.multiselect) { i++; }
			
			// get the max index of frozen col
			while(i<len)
			{
				// from left, no breaking frozen
				if(cm[i].frozen === true)
				{
					frozen = true;
					maxfrozen = i;
				} else {
					break;
				}
				i++;
			}
			if( maxfrozen>=0 && frozen) {
				var top = p.caption ? $(grid.cDiv).outerHeight() : 0,
				hth = $(".ui-jqgrid-htable",p.gView).height();
				//headers
				if(p.toppager) {
					top = top + $(grid.topDiv).outerHeight();
				}
				if(p.toolbar[0] === true) {
					if(p.toolbar[1] !== "bottom") {
						top = top + $(grid.uDiv).outerHeight();
					}
				}
				grid.fhDiv = $('<div style="position:absolute;left:0;top:'+top+'px;height:'+hth+'px;" class="frozen-div ui-state-default ui-jqgrid-hdiv"></div>');
				grid.fbDiv = $('<div style="position:absolute;left:0;top:'+(parseInt(top,10)+parseInt(hth,10) + 1)+'px;overflow-y:hidden" class="frozen-bdiv ui-jqgrid-bdiv"></div>');
				$(p.gView).append(grid.fhDiv);
				var htbl = $(".ui-jqgrid-htable",p.gView).clone(true);
				// groupheader support - only if useColSpanstyle is false
				if(p.groupHeader) {
					$("tr.jqg-first-row-header, tr.jqg-third-row-header", htbl).each(function(){
						$("th:gt("+maxfrozen+")",this).remove();
					});
					var swapfroz = -1, fdel = -1, cs, rs;
					$("tr.jqg-second-row-header th", htbl).each(function(){
						cs= parseInt($(this).attr("colspan"),10);
						rs= parseInt($(this).attr("rowspan"),10);
						if(rs) {
							swapfroz++;
							fdel++;
						}
						if(cs) {
							swapfroz = swapfroz+cs;
							fdel++;
						}
						if(swapfroz === maxfrozen) {
							return false;
						}
					});
					if(swapfroz !== maxfrozen) {
						fdel = maxfrozen;
					}
					$("tr.jqg-second-row-header", htbl).each(function(){
						$("th:gt("+fdel+")",this).remove();
					});
				} else {
					$("tr",htbl).each(function(){
						$("th:gt("+maxfrozen+")",this).remove();
					});
				}
				$(htbl).width(1);
				// resizing stuff
				$(grid.fhDiv).append(htbl)
				.mousemove(function (e) {
					if(grid.resizing){ grid.dragMove(e);return false; }
				});
				if(p.footerrow) {
					var hbd = $(".ui-jqgrid-bdiv",p.gView).height();

					grid.fsDiv = $('<div style="position:absolute;left:0;top:'+(parseInt(top,10)+parseInt(hth,10) + parseInt(hbd,10)+1)+'px;" class="frozen-sdiv ui-jqgrid-sdiv"></div>');
					$(p.gView).append(grid.fsDiv);
					var ftbl = $(".ui-jqgrid-ftable",p.gView).clone(true);
					$("tr",ftbl).each(function(){
						$("td:gt("+maxfrozen+")",this).remove();
					});
					$(ftbl).width(1);
					$(grid.fsDiv).append(ftbl);
				}
				$self.bind('jqGridResizeStop.setFrozenColumns', function (e, w, index) {
					var rhth = $(".ui-jqgrid-htable",grid.fhDiv);
					$("th:eq("+index+")",rhth).width( w ); 
					var btd = $(".ui-jqgrid-btable",grid.fbDiv);
					$("tr:first td:eq("+index+")",btd).width( w );
					if(p.footerrow) {
						var ftd = $(".ui-jqgrid-ftable",grid.fsDiv);
						$("tr:first td:eq("+index+")",ftd).width( w );
					}
				});
				// sorting stuff
				$self.bind('jqGridSortCol.setFrozenColumns', function (e, index, idxcol) {

					var previousSelectedTh = $("tr.ui-jqgrid-labels:last th:eq("+p.lastsort+")",grid.fhDiv), newSelectedTh = $("tr.ui-jqgrid-labels:last th:eq("+idxcol+")",grid.fhDiv);

					$("span.ui-grid-ico-sort",previousSelectedTh).addClass('ui-state-disabled');
					$(previousSelectedTh).attr("aria-selected","false");
					$("span.ui-icon-"+p.sortorder,newSelectedTh).removeClass('ui-state-disabled');
					$(newSelectedTh).attr("aria-selected","true");
					if(!p.viewsortcols[0]) {
						if(p.lastsort !== idxcol) {
							$("span.s-ico",previousSelectedTh).hide();
							$("span.s-ico",newSelectedTh).show();
						}
					}
				});
				
				// data stuff
				//TODO support for setRowData
				$(p.gView).append(grid.fbDiv);
				$(grid.bDiv).scroll(function () {
					$(grid.fbDiv).scrollTop($(this).scrollTop());
				});
				if(p.hoverrows === true) {
					$(p.idSel).unbind('mouseover').unbind('mouseout');
				}
				var fixDiv = function ($hDiv, hDivBase) {
						var pos = $(hDivBase).position();
						if ($hDiv != null && $hDiv.length > 0) {
							$hDiv.css({
								top: pos.top,
								left: p.direction === "rtl" ? hDivBase.clientWidth - grid.fhDiv.width() : 0
							});
						}
						$hDiv.height(hDivBase.clientHeight);
					};
				$self.bind('jqGridAfterGridComplete.setFrozenColumns', function () {
					$(p.idSel+"_frozen").remove();
					$(grid.fbDiv).height(grid.hDiv.clientHeight);
					var btbl = $(p.idSel).clone(true);
					$("tr[role=row]",btbl).each(function(){
						$("td[role=gridcell]:gt("+maxfrozen+")",this).remove();
					});

					$(btbl).width(1).attr("id",p.id+"_frozen");
					$(grid.fbDiv).append(btbl);
					if(p.hoverrows === true) {
						$("tr.jqgrow", btbl).hover(
							function(){ var tr = this; $(tr).addClass("ui-state-hover"); $("#"+jqID(tr.id), p.idSel).addClass("ui-state-hover"); },
							function(){ var tr = this; $(tr).removeClass("ui-state-hover"); $("#"+jqID(tr.id), p.idSel).removeClass("ui-state-hover"); }
						);
						$("tr.jqgrow", p.idSel).hover(
							function(){ var tr = this; $(tr).addClass("ui-state-hover"); $("#"+jqID(tr.id), p.idSel+"_frozen").addClass("ui-state-hover");},
							function(){ var tr = this; $(tr).removeClass("ui-state-hover"); $("#"+jqID(tr.id), p.idSel+"_frozen").removeClass("ui-state-hover"); }
						);
					}
					fixDiv(grid.fhDiv, grid.hDiv);
					fixDiv(grid.fbDiv, grid.bDiv);
					fixDiv(grid.fsDiv, grid.sDiv);
					btbl=null;
				});
				$(p.gBox).bind("resizestop.setFrozenColumns", function () {
					setTimeout(function () {
						// TODO: the width of all column headers can be changed
						// so one should recalculate frozenWidth in other way.
						fixDiv(grid.fhDiv, grid.hDiv);
						fixDiv(grid.fbDiv, grid.bDiv);
						fixDiv(grid.fsDiv, grid.sDiv);
						var frozenWidth = grid.fhDiv[0].clientWidth;
						if (grid.fhDiv != null && grid.fhDiv.length > 0) {
							$(grid.fhDiv).height(grid.hDiv.clientHeight);
							//$(grid.fhDiv).css("top", $(grid.hDiv).position().top);
						}
						if (grid.fbDiv != null && grid.fbDiv.length > 0) {
							//$(grid.fbDiv).height(grid.bDiv.clientHeight);
							$(grid.fbDiv).width(frozenWidth);
							//$(grid.fbDiv).css("top", $(grid.bDiv).position().top);
						}
						if (grid.fsDiv != null && grid.fsDiv.length > 0) {
							//$(grid.fsDiv).height(grid.sDiv.clientHeight);
							$(grid.fsDiv).width(frozenWidth);
							//$(grid.fsDiv).css("top", $(grid.sDiv).position().top);
						}
					}, 50);
				});
				if(!grid.hDiv.loading) {
					$self.triggerHandler("jqGridAfterGridComplete");
				}
				p.frozenColumns = true;
			}
		});
	},
	destroyFrozenColumns :  function() {
		return this.each(function() {
			var $t = this, $self = $($t), grid = $t.grid, p = $t.p;
			if (!grid) {return;}
			if(p.frozenColumns === true) {
				$(grid.fhDiv).remove();
				$(grid.fbDiv).remove();
				grid.fhDiv = null; grid.fbDiv=null;
				if(p.footerrow) {
					$(grid.fsDiv).remove();
					grid.fsDiv = null;
				}
				$self.unbind('.setFrozenColumns');
				if(p.hoverrows === true) {
					var ptr;
					$self.bind('mouseover',function(e) {
						ptr = $(e.target).closest("tr.jqgrow");
						if($(ptr).attr("class") !== "ui-subgrid") {
						$(ptr).addClass("ui-state-hover");
					}
					}).bind('mouseout',function(e) {
						ptr = $(e.target).closest("tr.jqgrow");
						$(ptr).removeClass("ui-state-hover");
					});
				}
				p.frozenColumns = false;
			}
		});
	}
});
}(jQuery));
