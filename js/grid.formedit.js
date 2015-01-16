/*jshint eqeqeq:false, eqnull:true, devel:true */
/*global xmlJsonClass, jQuery */
(function($){
/**
 * jqGrid extension for form editing Grid Data
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
**/
"use strict";
var rp_ge = {}, jgrid = $.jgrid;
jgrid.extend({
	searchGrid : function (o) {
		o = $.extend(true, {
			recreateFilter: false,
			drag: true,
			sField:'searchField',
			sValue:'searchString',
			sOper: 'searchOper',
			sFilter: 'filters',
			loadDefaults: true, // this options activates loading of default filters from grid's postData for Multipe Search only.
			beforeShowSearch: null,
			afterShowSearch : null,
			onInitializeSearch: null,
			afterRedraw : null,
			afterChange: null,
			closeAfterSearch : false,
			closeAfterReset: false,
			closeOnEscape : false,
			searchOnEnter : false,
			multipleSearch : false,
			multipleGroup : false,
			//cloneSearchRowOnAdd: true,
			top : 0,
			left: 0,
			jqModal : true,
			modal: false,
			resize : true,
			width: 450,
			height: 'auto',
			dataheight: 'auto',
			showQuery: false,
			errorcheck : true,
			sopt: null,
			stringResult: undefined,
			onClose : null,
			onSearch : null,
			onReset : null,
			toTop : true,
			overlay : 30,
			columns : [],
			tmplNames : null,
			tmplFilters : null,
			tmplLabel : ' Template: ',
			showOnLoad: false,
			layer: null,
			operands : { "eq" :"=", "ne":"<>","lt":"<","le":"<=","gt":">","ge":">=","bw":"LIKE","bn":"NOT LIKE","in":"IN","ni":"NOT IN","ew":"LIKE","en":"NOT LIKE","cn":"LIKE","nc":"NOT LIKE","nu":"IS NULL","nn":"ISNOT NULL"}
		}, jgrid.search, o || {});
		return this.each(function() {
			var $t = this, $self = $($t), jqID = jgrid.jqID, p = $t.p;
			if(!$t.grid) {return;}
			var fid = "fbox_"+p.id,
			showFrm = true,
			mustReload = true,
			ids = {themodal:'searchmod'+fid,modalhead:'searchhd'+fid,modalcontent:'searchcnt'+fid, scrollelm : fid},
			themodalSelector = "#"+jqID(ids.themodal), gboxSelector = p.gBox, gviewSelector = p.gView,
			defaultFilters  = p.postData[o.sFilter],
			fl;
			if(typeof defaultFilters === "string") {
				defaultFilters = jgrid.parse( defaultFilters );
			}
			if(o.recreateFilter === true) {
				$(themodalSelector).remove();
			}
			function showFilter($filter) {
				showFrm = $self.triggerHandler("jqGridFilterBeforeShow", [$filter]);
				if(showFrm === undefined) {
					showFrm = true;
				}
				if(showFrm && $.isFunction(o.beforeShowSearch)) {
					showFrm = o.beforeShowSearch.call($t,$filter);
				}
				if(showFrm) {
					jgrid.viewModal(themodalSelector,{gbox:gboxSelector,jqm:o.jqModal, modal:o.modal, overlay: o.overlay, toTop: o.toTop});
					$self.triggerHandler("jqGridFilterAfterShow", [$filter]);
					if($.isFunction(o.afterShowSearch)) {
						o.afterShowSearch.call($t, $filter);
					}
				}
			}
			if ( $(themodalSelector)[0] !== undefined ) {
				showFilter($("#fbox_"+p.idSel));
			} else {
				var fil = $("<div><div id='"+fid+"' class='searchFilter' style='overflow:auto'></div></div>").insertBefore(gviewSelector),
				align = "left", butleft =""; 
				if(p.direction === "rtl") {
					align = "right";
					butleft = " style='text-align:left'";
					fil.attr("dir","rtl");
				}
				var columns = $.extend([],p.colModel),
				bS = "<a id='"+fid+"_search' class='fm-button ui-state-default ui-corner-all fm-button-icon-right ui-reset'><span class='ui-icon ui-icon-search'></span>"+o.Find+"</a>",
				bC = "<a id='"+fid+"_reset' class='fm-button ui-state-default ui-corner-all fm-button-icon-left ui-search'><span class='ui-icon ui-icon-arrowreturnthick-1-w'></span>"+o.Reset+"</a>",
				bQ = "", tmpl="", colnm, found = false, bt, cmi=-1;
				if(o.showQuery) {
					bQ ="<a id='"+fid+"_query' class='fm-button ui-state-default ui-corner-all fm-button-icon-left'><span class='ui-icon ui-icon-comment'></span>Query</a>";
				}
				if(!o.columns.length) {
					$.each(columns, function(i,n){
						if(!n.label) {
							n.label = p.colNames[i];
						}
						// find first searchable column and set it if no default filter
						if(!found) {
							var searchable = (n.search === undefined) ?  true: n.search ,
							hidden = (n.hidden === true),
							ignoreHiding = (n.searchoptions && n.searchoptions.searchhidden === true);
							if ((ignoreHiding && searchable) || (searchable && !hidden)) {
								found = true;
								colnm = n.index || n.name;
								cmi =i;
							}
						}
					});
				} else {
					columns = o.columns;
					cmi = 0;
					colnm = columns[0].index || columns[0].name;
				}
				// old behaviour
				if( (!defaultFilters && colnm) || o.multipleSearch === false  ) {
					var cmop = "eq";
					if(cmi >=0 && columns[cmi].searchoptions && columns[cmi].searchoptions.sopt) {
						cmop = columns[cmi].searchoptions.sopt[0];
					} else if(o.sopt && o.sopt.length) {
						cmop = o.sopt[0];
					}
					defaultFilters = {groupOp: "AND", rules: [{field: colnm, op: cmop, data: ""}]};
				}
				found = false;
				if(o.tmplNames && o.tmplNames.length) {
					found = true;
					tmpl = o.tmplLabel;
					tmpl += "<select class='ui-template'>";
					tmpl += "<option value='default'>Default</option>";
					$.each(o.tmplNames, function(i,n){
						tmpl += "<option value='"+i+"'>"+n+"</option>";
					});
					tmpl += "</select>";
				}

				bt = "<table class='EditTable' style='border:0px none;margin-top:5px' id='"+fid+"_2'><tbody><tr><td colspan='2'><hr class='ui-widget-content' style='margin:1px'/></td></tr><tr><td class='EditButton' style='text-align:"+align+"'>"+bC+tmpl+"</td><td class='EditButton' "+butleft+">"+bQ+bS+"</td></tr></tbody></table>";
				fid = jqID(fid);
				o.gbox = "#gbox_"+fid;
				fid = "#"+fid;
				$(fid).jqFilter({
					columns : columns,
					filter: o.loadDefaults ? defaultFilters : null,
					showQuery: o.showQuery,
					errorcheck : o.errorcheck,
					sopt: o.sopt,
					groupButton : o.multipleGroup,
					ruleButtons : o.multipleSearch,
					afterRedraw : o.afterRedraw,
					ops : o.odata,
					operands : o.operands,
					ajaxSelectOptions: p.ajaxSelectOptions,
					groupOps: o.groupOps,
					onChange : function() {
						if(this.p.showQuery) {
							$('.query',this).html(this.toUserFriendlyString());
						}
						if ($.isFunction(o.afterChange)) {
							o.afterChange.call($t, $(fid), o);
						}
					},
					direction : p.direction,
					id: p.id
				});
				fil.append( bt );
				if(found && o.tmplFilters && o.tmplFilters.length) {
					$(".ui-template", fil).bind('change', function(){
						var curtempl = $(this).val();
						if(curtempl==="default") {
							$(fid).jqFilter('addFilter', defaultFilters);
						} else {
							$(fid).jqFilter('addFilter', o.tmplFilters[parseInt(curtempl,10)]);
						}
						return false;
					});
				}
				if(o.multipleGroup === true) {o.multipleSearch = true;}
				$self.triggerHandler("jqGridFilterInitialize", [$(fid)]);
				if($.isFunction(o.onInitializeSearch) ) {
					o.onInitializeSearch.call($t, $(fid));
				}
				if (o.layer) {
					jgrid.createModal(ids ,fil,o,gviewSelector,$(gboxSelector)[0], "#"+jqID(o.layer), {position: "relative"});
				} else {
					jgrid.createModal(ids ,fil,o,gviewSelector,$(gboxSelector)[0]);
				}
				if (o.searchOnEnter || o.closeOnEscape) {
					$(themodalSelector).keydown(function (e) {
						var $target = $(e.target);
						if (o.searchOnEnter && e.which === 13 && // 13 === $.ui.keyCode.ENTER
								!$target.hasClass('add-group') && !$target.hasClass('add-rule') &&
								!$target.hasClass('delete-group') && !$target.hasClass('delete-rule') &&
								(!$target.hasClass("fm-button") || !$target.is("[id$=_query]"))) {
							$(fid+"_search").click();
							return false;
						}
						if (o.closeOnEscape && e.which === 27) { // 27 === $.ui.keyCode.ESCAPE
							$("#"+jqID(ids.modalhead)).find(".ui-jqdialog-titlebar-close").click();
							return false;
						}
					});
				}
				if(bQ) {
					$(fid+"_query").bind('click', function(){
						$(".queryresult", fil).toggle();
						return false;
					});
				}
				if (o.stringResult===undefined) {
					// to provide backward compatibility, inferring stringResult value from multipleSearch
					o.stringResult = o.multipleSearch;
				}
				$(fid+"_search").bind('click', function(){
					var sdata={}, res, filters;
					fl = $(fid);
					fl.find(".input-elm:focus").change();
					filters = fl.jqFilter('filterData');
					if(o.errorcheck) {
						fl[0].hideError();
						if(!o.showQuery) {fl.jqFilter('toSQLString');}
						if(fl[0].p.error) {
							fl[0].showError();
							return false;
						}
					}

					if(o.stringResult) {
						try {
							// xmlJsonClass or JSON.stringify
							res = xmlJsonClass.toJson(filters, '', '', false);
						} catch (e) {
							try {
								res = JSON.stringify(filters);
							} catch (e2) { }
						}
						if(typeof res==="string") {
							sdata[o.sFilter] = res;
							$.each([o.sField,o.sValue, o.sOper], function() {sdata[this] = "";});
						}
					} else {
						if(o.multipleSearch) {
							sdata[o.sFilter] = filters;
							$.each([o.sField,o.sValue, o.sOper], function() {sdata[this] = "";});
						} else {
							sdata[o.sField] = filters.rules[0].field;
							sdata[o.sValue] = filters.rules[0].data;
							sdata[o.sOper] = filters.rules[0].op;
							sdata[o.sFilter] = "";
						}
					}
					p.search = true;
					$.extend(p.postData,sdata);
					mustReload = $self.triggerHandler("jqGridFilterSearch");
					if( mustReload === undefined) {
						mustReload = true;
					}
					if(mustReload && $.isFunction(o.onSearch) ) {
						mustReload = o.onSearch.call($t, p.filters);
					}
					if (mustReload !== false) {
						$self.trigger("reloadGrid",[{page:1}]);
					}
					if(o.closeAfterSearch) {
						jgrid.hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: o.onClose});
					}
					return false;
				});
				$(fid+"_reset").bind('click', function(){
					var sdata={},
					fl = $(fid);
					p.search = false;
					p.resetsearch =  true;
					if(o.multipleSearch===false) {
						sdata[o.sField] = sdata[o.sValue] = sdata[o.sOper] = "";
					} else {
						sdata[o.sFilter] = "";
					}
					fl[0].resetFilter();
					if(found) {
						$(".ui-template", fil).val("default");
					}
					$.extend(p.postData,sdata);
					mustReload = $self.triggerHandler("jqGridFilterReset");
					if(mustReload === undefined) {
						mustReload = true;
					}
					if(mustReload && $.isFunction(o.onReset) ) {
						mustReload = o.onReset.call($t);
					}
					if(mustReload !== false) {
						$self.trigger("reloadGrid",[{page:1}]);
					}
					if (o.closeAfterReset) {
						jgrid.hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: o.onClose});
					}
					return false;
				});
				showFilter($(fid));
				$(".fm-button:not(.ui-state-disabled)",fil).hover(
					function(){$(this).addClass('ui-state-hover');},
					function(){$(this).removeClass('ui-state-hover');}
				);
			}
		});
	},
	editGridRow : function(rowid, o){
		o = $.extend(true, {
			top : 0,
			left: 0,
			width: 300,
			datawidth: 'auto',
			height: 'auto',
			dataheight: 'auto',
			modal: false,
			overlay : 30,
			drag: true,
			resize: true,
			url: null,
			mtype : "POST",
			clearAfterAdd :true,
			closeAfterEdit : false,
			reloadAfterSubmit : true,
			onInitializeForm: null,
			beforeInitData: null,
			beforeShowForm: null,
			afterShowForm: null,
			beforeSubmit: null,
			afterSubmit: null,
			onclickSubmit: null,
			afterComplete: null,
			onclickPgButtons : null,
			afterclickPgButtons: null,
			editData : {},
			recreateForm : false,
			jqModal : true,
			closeOnEscape : false,
			addedrow : "first",
			topinfo : '',
			bottominfo: '',
			saveicon : [],
			closeicon : [],
			savekey: [false,13],
			navkeys: [false,38,40],
			checkOnSubmit : false,
			checkOnUpdate : false,
			_savedData : {},
			processing : false,
			onClose : null,
			ajaxEditOptions : {},
			serializeEditData : null,
			viewPagerButtons : true,
			overlayClass : 'ui-widget-overlay',
			removemodal : true,
			form: 'edit'
		}, jgrid.edit, o || {});
		rp_ge[$(this)[0].p.id] = o;
		return this.each(function(){
			var $t = this, $self = $($t);
			if (!$t.grid || !rowid) {return;}
			var p = $t.p, gID = p.id, jqID = jgrid.jqID, hideModal = jgrid.hideModal,
			frmgr = "FrmGrid_"+gID, frmgrID = frmgr, frmtborg = "TblGrid_"+gID, frmtb = "#"+jqID(frmtborg), frmtb2 = frmtb+"_2",
			ids = {themodal:'editmod'+gID,modalhead:'edithd'+gID,modalcontent:'editcnt'+gID, scrollelm : frmgr},
			themodalSelector = "#"+jqID(ids.themodal), gboxSelector = p.gBox,
			onBeforeShow = $.isFunction(rp_ge[gID].beforeShowForm) ? rp_ge[gID].beforeShowForm : false,
			onAfterShow = $.isFunction(rp_ge[gID].afterShowForm) ? rp_ge[gID].afterShowForm : false,
			onBeforeInit = $.isFunction(rp_ge[gID].beforeInitData) ? rp_ge[gID].beforeInitData : false,
			onInitializeForm = $.isFunction(rp_ge[gID].onInitializeForm) ? rp_ge[gID].onInitializeForm : false,
			showFrm = true,
			maxCols = 1, maxRows=0,	postdata, diff, frmoper;
			frmgr = "#" + jqID(frmgr);
			if (rowid === "new") {
				rowid = "_empty";
				frmoper = "add";
				o.caption=rp_ge[gID].addCaption;
			} else {
				o.caption=rp_ge[gID].editCaption;
				frmoper = "edit";
			}
			if(!o.recreateForm) {
				if( $self.data("formProp") ) {
					$.extend(rp_ge[gID], $self.data("formProp"));
				}
			}
			var closeovrl = true;
			if(o.checkOnUpdate && o.jqModal && !o.modal) {
				closeovrl = false;
			}
			function getFormData(){
				$(frmtb+" > tbody > tr > td .FormElement").each(function() {
					var celm = $(".customelement", this);
					if (celm.length) {
						var  elem = celm[0], nm = $(elem).attr('name');
						$.each(p.colModel, function(){
							if(this.name === nm && this.editoptions && $.isFunction(this.editoptions.custom_value)) {
								try {
									postdata[nm] = this.editoptions.custom_value.call($t, $("#"+jqID(nm),frmtb),'get');
									if (postdata[nm] === undefined) {throw "e1";}
								} catch (e) {
									if (e==="e1") {jgrid.info_dialog(jgrid.errors.errcap,"function 'custom_value' "+jgrid.edit.msg.novalue,jgrid.edit.bClose);}
									else {jgrid.info_dialog(jgrid.errors.errcap,e.message,jgrid.edit.bClose);}
								}
								return true;
							}
						});
					} else {
					switch ($(this).get(0).type) {
						case "checkbox":
							if($(this).is(":checked")) {
								postdata[this.name]= $(this).val();
							}else {
								var ofv = $(this).attr("offval");
								postdata[this.name]= ofv;
							}
						break;
						case "select-one":
							postdata[this.name]= $("option:selected",this).val();
						break;
						case "select-multiple":
							postdata[this.name]= $(this).val();
							if(postdata[this.name]) {postdata[this.name] = postdata[this.name].join(",");}
							else {postdata[this.name] ="";}
							var selectedText = [];
							$("option:selected",this).each(
								function(i,selected){
									selectedText[i] = $(selected).text();
								}
							);
						break;
						case "password":
						case "text":
						case "textarea":
						case "button":
							postdata[this.name] = $(this).val();

						break;
					}
					if(p.autoencode) {postdata[this.name] = jgrid.htmlEncode(postdata[this.name]);}
					}
				});
				return true;
			}
			function createData(rowid,tb,maxcols){
				var nm, hc,trdata, cnt=0,tmp, dc,elc, retpos=[], ind=false,
				tdtmpl = "<td class='CaptionTD'></td><td class='DataTD'></td>", tmpl="", i; //*2
				for (i =1; i<=maxcols;i++) {
					tmpl += tdtmpl;
				}
				if(rowid !== '_empty') {
					ind = $self.jqGrid("getInd",rowid);
				}
				$(p.colModel).each( function(i) {
					nm = this.name;
					// hidden fields are included in the form
					if(this.editrules && this.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = this.hidden === true ? true : false;
					}
					dc = hc ? "style='display:none'" : "";
					if ( nm !== 'cb' && nm !== 'subgrid' && this.editable===true && nm !== 'rn') {
						if(ind === false) {
							tmp = "";
						} else {
							if(nm === p.ExpandColumn && p.treeGrid === true) {
								tmp = $("td[role='gridcell']:eq("+i+")",$t.rows[ind]).text();
							} else {
								try {
									tmp =  $.unformat.call($t, $("td[role='gridcell']:eq("+i+")",$t.rows[ind]),{rowId:rowid, colModel:this},i);
								} catch (_) {
									tmp =  (this.edittype && this.edittype === "textarea") ? $("td[role='gridcell']:eq("+i+")",$t.rows[ind]).text() : $("td[role='gridcell']:eq("+i+")",$t.rows[ind]).html();
								}
								if(!tmp || tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
							}
						}
						var opt = $.extend({}, this.editoptions || {} ,{id:nm,name:nm, rowId: rowid}),
						frmopt = $.extend({}, {elmprefix:'',elmsuffix:'',rowabove:false,rowcontent:''}, this.formoptions || {}),
						rp = parseInt(frmopt.rowpos,10) || cnt+1,
						cp = parseInt((parseInt(frmopt.colpos,10) || 1)*2,10);
						if(rowid === "_empty" && opt.defaultValue ) {
							tmp = $.isFunction(opt.defaultValue) ? opt.defaultValue.call($t) : opt.defaultValue;
						}
						if(!this.edittype) {this.edittype = "text";}
						if(p.autoencode) {tmp = jgrid.htmlDecode(tmp);}
						elc = jgrid.createEl.call($t,this.edittype,opt,tmp,false,$.extend({},jgrid.ajaxOptions,p.ajaxSelectOptions || {}));
						//if(tmp === "" && this.edittype == "checkbox") {tmp = $(elc).attr("offval");}
						//if(tmp === "" && this.edittype == "select") {tmp = $("option:eq(0)",elc).text();}
						if(rp_ge[gID].checkOnSubmit || rp_ge[gID].checkOnUpdate) {rp_ge[gID]._savedData[nm] = tmp;}
						$(elc).addClass("FormElement");
						if( $.inArray(this.edittype, ['text','textarea','password','select']) > -1) {
							$(elc).addClass("ui-widget-content ui-corner-all");
						}
						trdata = $(tb).find("tr[rowpos="+rp+"]");
						if(frmopt.rowabove) {
							var newdata = $("<tr><td class='contentinfo' colspan='"+(maxcols*2)+"'>"+frmopt.rowcontent+"</td></tr>");
							$(tb).append(newdata);
							newdata[0].rp = rp;
						}
						if ( trdata.length===0 ) {
							trdata = $("<tr "+dc+" rowpos='"+rp+"'></tr>").addClass("FormData").attr("id","tr_"+nm);
							$(trdata).append(tmpl);
							$(tb).append(trdata);
							trdata[0].rp = rp;
						}
						$("td:eq("+(cp-2)+")",trdata[0]).html(frmopt.label === undefined ? p.colNames[i]: frmopt.label);
						$("td:eq("+(cp-1)+")",trdata[0]).html(frmopt.elmprefix).append(elc).append(frmopt.elmsuffix);
						if(this.edittype==='custom' && $.isFunction(opt.custom_value) ) {
							opt.custom_value.call($t, $("#"+jqID(nm),frmgr),'set',tmp);
						}
						jgrid.bindEv.call($t, elc, opt);
						retpos[cnt] = i;
						cnt++;
					}
				});
				if( cnt > 0) {
					var idrow = $("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='"+ (maxcols*2-1)+"' class='DataTD'><input class='FormElement' id='id_g' type='text' name='"+gID+"_id' value='"+rowid+"'/></td></tr>");
					idrow[0].rp = cnt+999;
					$(tb).append(idrow);
					if(rp_ge[gID].checkOnSubmit || rp_ge[gID].checkOnUpdate) {rp_ge[gID]._savedData[gID+"_id"] = rowid;}
				}
				return retpos;
			}
			function fillData(rowid,fmid){
				var nm,cnt=0,tmp, fld,opt,vl,vlc;
				if(rp_ge[gID].checkOnSubmit || rp_ge[gID].checkOnUpdate) {rp_ge[gID]._savedData = {};rp_ge[gID]._savedData[gID+"_id"]=rowid;}
				var cm = p.colModel;
				if(rowid === '_empty') {
					$(cm).each(function(){
						nm = this.name;
						opt = $.extend({}, this.editoptions || {} );
						fld = $("#"+jqID(nm),fmid);
						if(fld && fld.length && fld[0] !== null) {
							vl = "";
							if(this.edittype === 'custom' && $.isFunction(opt.custom_value)) {
								opt.custom_value.call($t, fld,'set',vl);
							} else if(opt.defaultValue ) {
								vl = $.isFunction(opt.defaultValue) ? opt.defaultValue.call($t) : opt.defaultValue;
								if(fld[0].type==='checkbox') {
									vlc = vl.toLowerCase();
									if(vlc.search(/(false|f|0|no|n|off|undefined)/i)<0 && vlc!=="") {
										fld[0].checked = true;
										fld[0].defaultChecked = true;
										fld[0].value = vl;
									} else {
										fld[0].checked = false;
										fld[0].defaultChecked = false;
									}
								} else {fld.val(vl);}
							} else {
								if( fld[0].type==='checkbox' ) {
									fld[0].checked = false;
									fld[0].defaultChecked = false;
									vl = $(fld).attr("offval");
								} else if (fld[0].type && fld[0].type.substr(0,6)==='select') {
									fld[0].selectedIndex = 0;
								} else {
									fld.val(vl);
								}
							}
							if(rp_ge[gID].checkOnSubmit===true || rp_ge[gID].checkOnUpdate) {rp_ge[gID]._savedData[nm] = vl;}
						}
					});
					$("#id_g",fmid).val(rowid);
					return;
				}
				var tre = $self.jqGrid("getInd",rowid,true);
				if(!tre) {return;}
				$('td[role="gridcell"]',tre).each( function(i) {
					nm = cm[i].name;
					// hidden fields are included in the form
					if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn' && cm[i].editable===true) {
						if(nm === p.ExpandColumn && p.treeGrid === true) {
							tmp = $(this).text();
						} else {
							try {
								tmp =  $.unformat.call($t, $(this),{rowId:rowid, colModel:cm[i]},i);
							} catch (_) {
								tmp = cm[i].edittype==="textarea" ? $(this).text() : $(this).html();
							}
						}
						if(p.autoencode) {tmp = jgrid.htmlDecode(tmp);}
						if(rp_ge[gID].checkOnSubmit===true || rp_ge[gID].checkOnUpdate) {rp_ge[gID]._savedData[nm] = tmp;}
						nm = "#"+jqID(nm);
						switch (cm[i].edittype) {
							case "password":
							case "text":
							case "button" :
							case "image":
							case "textarea":
								if(tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
								$(nm,fmid).val(tmp);
								break;
							case "select":
								var opv = tmp.split(",");
								opv = $.map(opv,function(n){return $.trim(n);});
								$(nm+" option",fmid).each(function(){
									if (!cm[i].editoptions.multiple && ($.trim(tmp) === $.trim($(this).text()) || opv[0] === $.trim($(this).text()) || opv[0] === $.trim($(this).val())) ){
										this.selected= true;
									} else if (cm[i].editoptions.multiple){
										if(  $.inArray($.trim($(this).text()), opv ) > -1 || $.inArray($.trim($(this).val()), opv ) > -1  ){
											this.selected = true;
										}else{
											this.selected = false;
										}
									} else {
										this.selected = false;
									}
								});
								break;
							case "checkbox":
								tmp = String(tmp);
								if(cm[i].editoptions && cm[i].editoptions.value) {
									var cb = cm[i].editoptions.value.split(":");
									if(cb[0] === tmp) {
										$(nm,fmid)[p.useProp ? 'prop': 'attr']({"checked":true, "defaultChecked" : true});
									} else {
										$(nm,fmid)[p.useProp ? 'prop': 'attr']({"checked":false, "defaultChecked" : false});
									}
								} else {
									tmp = tmp.toLowerCase();
									if(tmp.search(/(false|f|0|no|n|off|undefined)/i)<0 && tmp!=="") {
										$(nm,fmid)[p.useProp ? 'prop': 'attr']("checked",true);
										$(nm,fmid)[p.useProp ? 'prop': 'attr']("defaultChecked",true); //ie
									} else {
										$(nm,fmid)[p.useProp ? 'prop': 'attr']("checked", false);
										$(nm,fmid)[p.useProp ? 'prop': 'attr']("defaultChecked", false); //ie
									}
								}
								break;
							case 'custom' :
								try {
									if(cm[i].editoptions && $.isFunction(cm[i].editoptions.custom_value)) {
										cm[i].editoptions.custom_value.call($t, $(nm,fmid),'set',tmp);
									} else {throw "e1";}
								} catch (e) {
									if (e==="e1") {jgrid.info_dialog(jgrid.errors.errcap,"function 'custom_value' "+jgrid.edit.msg.nodefined,jgrid.edit.bClose);}
									else {jgrid.info_dialog(jgrid.errors.errcap,e.message,jgrid.edit.bClose);}
								}
								break;
						}
						cnt++;
					}
				});
				if(cnt>0) {$("#id_g",frmtb).val(rowid);}
			}
			function setNulls() {
				$.each(p.colModel, function(i,n){
					if(n.editoptions && n.editoptions.NullIfEmpty === true) {
						if(postdata.hasOwnProperty(n.name) && postdata[n.name] === "") {
							postdata[n.name] = 'null';
						}
					}
				});
			}
			function postIt() {
				var copydata, ret=[true,"",""], onCS = {}, opers = p.prmNames, idname, oper, key, selr, i, url;
				
				var retvals = $self.triggerHandler("jqGridAddEditBeforeCheckValues", [$(frmgr), frmoper]);
				if(retvals && typeof retvals === 'object') {postdata = retvals;}
				
				if($.isFunction(rp_ge[gID].beforeCheckValues)) {
					retvals = rp_ge[gID].beforeCheckValues.call($t, postdata,$(frmgr),frmoper);
					if(retvals && typeof retvals === 'object') {postdata = retvals;}
				}
				for( key in postdata ){
					if(postdata.hasOwnProperty(key)) {
						ret = jgrid.checkValues.call($t,postdata[key],key);
						if(ret[0] === false) {break;}
					}
				}
				setNulls();
				if(ret[0]) {
					onCS = $self.triggerHandler("jqGridAddEditClickSubmit", [rp_ge[gID], postdata, frmoper]);
					if( onCS === undefined && $.isFunction( rp_ge[gID].onclickSubmit)) { 
						onCS = rp_ge[gID].onclickSubmit.call($t, rp_ge[gID], postdata, frmoper) || {}; 
					}
					ret = $self.triggerHandler("jqGridAddEditBeforeSubmit", [postdata, $(frmgr), frmoper]);
					if(ret === undefined) {
						ret = [true,"",""];
					}
					if( ret[0] && $.isFunction(rp_ge[gID].beforeSubmit))  {
						ret = rp_ge[gID].beforeSubmit.call($t,postdata,$(frmgr), frmoper);
					}
				}

				if(ret[0] && !rp_ge[gID].processing) {
					rp_ge[gID].processing = true;
					$("#sData", frmtb2).addClass('ui-state-active');
					url = rp_ge[gID].url || $self.jqGrid('getGridParam','editurl');
					oper = opers.oper;
					idname = url === 'clientArray' ? p.keyName : opers.id;
					// we add to pos data array the action - the name is oper
					postdata[oper] = ($.trim(postdata[gID+"_id"]) === "_empty") ? opers.addoper : opers.editoper;
					if(postdata[oper] !== opers.addoper) {
						postdata[idname] = postdata[gID+"_id"];
					} else {
						// check to see if we have allredy this field in the form and if yes lieve it
						if( postdata[idname] === undefined ) {postdata[idname] = postdata[gID+"_id"];}
					}
					delete postdata[gID+"_id"];
					postdata = $.extend(postdata,rp_ge[gID].editData,onCS);
					if(p.treeGrid === true)  {
						if(postdata[oper] === opers.addoper) {
						selr = $self.jqGrid("getGridParam", 'selrow');
							var trParID = p.treeGridModel === 'adjacency' ? p.treeReader.parent_id_field : 'parent_id';
							postdata[trParID] = selr;
						}
						for(i in p.treeReader){
							if(p.treeReader.hasOwnProperty(i)) {
								var itm = p.treeReader[i];
								if(postdata.hasOwnProperty(itm)) {
									if(postdata[oper] === opers.addoper && i === 'parent_id_field') {continue;}
									delete postdata[itm];
								}
							}
						}
					}
					
					postdata[idname] = jgrid.stripPref(p.idPrefix, postdata[idname]);
					var ajaxOptions = $.extend({
						url: url,
						type: rp_ge[gID].mtype,
						data: $.isFunction(rp_ge[gID].serializeEditData) ? rp_ge[gID].serializeEditData.call($t,postdata) :  postdata,
						complete:function(data,status){
							var key;
							$("#sData", frmtb2).removeClass('ui-state-active');
							postdata[idname] = p.idPrefix + postdata[idname];
							if(data.status >= 300 && data.status !== 304) {
								ret[0] = false;
								ret[1] = $self.triggerHandler("jqGridAddEditErrorTextFormat", [data, frmoper]);
								if ($.isFunction(rp_ge[gID].errorTextFormat)) {
									ret[1] = rp_ge[gID].errorTextFormat.call($t, data, frmoper);
								} else {
									ret[1] = status + " Status: '" + data.statusText + "'. Error code: " + data.status;
								}
							} else {
								// data is posted successful
								// execute aftersubmit with the returned data from server
								ret = $self.triggerHandler("jqGridAddEditAfterSubmit", [data, postdata, frmoper]);
								if(ret === undefined) {
									ret = [true,"",""];
								}
								if( ret[0] && $.isFunction(rp_ge[gID].afterSubmit) ) {
									ret = rp_ge[gID].afterSubmit.call($t, data,postdata, frmoper);
								}
							}
							if(ret[0] === false) {
								$("#FormError>td",frmtb).html(ret[1]);
								$("#FormError",frmtb).show();
							} else {
								if(p.autoencode) {
									$.each(postdata,function(n,v){
										postdata[n] = jgrid.htmlDecode(v);
									});
								}
								//rp_ge[gID].reloadAfterSubmit = rp_ge[gID].reloadAfterSubmit && $t.o.datatype != "local";
								// the action is add
								if(postdata[oper] === opers.addoper ) {
									//id processing
									// user not set the id ret[2]
									if(!ret[2]) {ret[2] = jgrid.randId();}
									if(postdata[idname] == null || postdata[idname] === "_empty"){
										postdata[idname] = ret[2];
									} else {
										ret[2] = postdata[idname];
									}
									if(rp_ge[gID].reloadAfterSubmit) {
										$self.trigger("reloadGrid");
									} else {
										if(p.treeGrid === true){
											$self.jqGrid("addChildNode",ret[2],selr,postdata );
										} else {
											$self.jqGrid("addRowData",ret[2],postdata,o.addedrow);
										}
									}
									if(rp_ge[gID].closeAfterAdd) {
										if(p.treeGrid !== true){
											$self.jqGrid("setSelection",ret[2]);
										}
										hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: rp_ge[gID].onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});
									} else if (rp_ge[gID].clearAfterAdd) {
										fillData("_empty",frmgr);
									}
								} else {
									// the action is update
									if(rp_ge[gID].reloadAfterSubmit) {
										$self.trigger("reloadGrid");
										if( !rp_ge[gID].closeAfterEdit ) {setTimeout(function(){$self.jqGrid("setSelection",postdata[idname]);},1000);}
									} else {
										if(p.treeGrid === true) {
											$self.jqGrid("setTreeRow", postdata[idname],postdata);
										} else {
											$self.jqGrid("setRowData", postdata[idname],postdata);
										}
									}
									if(rp_ge[gID].closeAfterEdit) {hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: rp_ge[gID].onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});}
								}
								if($.isFunction(rp_ge[gID].afterComplete)) {
									copydata = data;
									setTimeout(function(){
										$self.triggerHandler("jqGridAddEditAfterComplete", [copydata, postdata, $(frmgr), frmoper]);
										rp_ge[gID].afterComplete.call($t, copydata, postdata, $(frmgr), frmoper);
										copydata=null;
									},500);
								}
								if(rp_ge[gID].checkOnSubmit || rp_ge[gID].checkOnUpdate) {
									$(frmgr).data("disabled",false);
									if(rp_ge[gID]._savedData[gID+"_id"] !== "_empty"){
										for(key in rp_ge[gID]._savedData) {
											if(rp_ge[gID]._savedData.hasOwnProperty(key) && postdata[key]) {
												rp_ge[gID]._savedData[key] = postdata[key];
											}
										}
									}
								}
							}
							rp_ge[gID].processing=false;
							try{$(':input:visible',frmgr)[0].focus();} catch (e){}
						}
					}, jgrid.ajaxOptions, rp_ge[gID].ajaxEditOptions );

					if (!ajaxOptions.url && !rp_ge[gID].useDataProxy) {
						if ($.isFunction(p.dataProxy)) {
							rp_ge[gID].useDataProxy = true;
						} else {
							ret[0]=false;ret[1] += " "+jgrid.errors.nourl;
						}
					}
					if (ret[0]) {
						if (rp_ge[gID].useDataProxy) {
							var dpret = p.dataProxy.call($t, ajaxOptions, "set_"+gID); 
							if(dpret === undefined) {
								dpret = [true, ""];
							}
							if(dpret[0] === false ) {
								ret[0] = false;
								ret[1] = dpret[1] || "Error deleting the selected row!" ;
							} else {
								if(ajaxOptions.data.oper === opers.addoper && rp_ge[gID].closeAfterAdd ) {
									hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: rp_ge[gID].onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});
								}
								if(ajaxOptions.data.oper === opers.editoper && rp_ge[gID].closeAfterEdit ) {
									hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: rp_ge[gID].onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});
								}
							}
						} else {
							if(ajaxOptions.url === "clientArray") {
								rp_ge[gID].reloadAfterSubmit = false;
								postdata = ajaxOptions.data;
								ajaxOptions.complete({status:200, statusText:''},'');
							} else {
								$.ajax(ajaxOptions); 
							}
						}
					}
				}
				if(ret[0] === false) {
					$("#FormError>td",frmtb).html(ret[1]);
					$("#FormError",frmtb).show();
					// return;
				}
			}
			function compareData(nObj, oObj ) {
				var ret = false,key;
				for (key in nObj) {
					if(nObj.hasOwnProperty(key) && nObj[key] != oObj[key]) {
						ret = true;
						break;
					}
				}
				return ret;
			}
			function checkUpdates () {
				var stat = true;
				$("#FormError",frmtb).hide();
				if(rp_ge[gID].checkOnUpdate) {
					postdata = {};
					getFormData();
					diff = compareData(postdata,rp_ge[gID]._savedData);
					if(diff) {
						$(frmgr).data("disabled",true);
						$(".confirm",themodalSelector).show();
						stat = false;
					}
				}
				return stat;
			}
			function restoreInline()
			{
				var i;
				if (rowid !== "_empty" && p.savedRow !== undefined && p.savedRow.length > 0 && $.isFunction($.fn.jqGrid.restoreRow)) {
					for (i=0;i<p.savedRow.length;i++) {
						if (p.savedRow[i].id == rowid) {
							$self.jqGrid('restoreRow',rowid);
							break;
						}
					}
				}
			}
			function updateNav(cr, posarr){
				var totr = posarr[1].length-1;
				if (cr===0) {
					$("#pData",frmtb2).addClass('ui-state-disabled');
				} else if( posarr[1][cr-1] !== undefined && $("#"+jqID(posarr[1][cr-1])).hasClass('ui-state-disabled')) {
						$("#pData",frmtb2).addClass('ui-state-disabled');
				} else {
					$("#pData",frmtb2).removeClass('ui-state-disabled');
				}
				
				if (cr===totr) {
					$("#nData",frmtb2).addClass('ui-state-disabled');
				} else if( posarr[1][cr+1] !== undefined && $("#"+jqID(posarr[1][cr+1])).hasClass('ui-state-disabled')) {
					$("#nData",frmtb2).addClass('ui-state-disabled');
				} else {
					$("#nData",frmtb2).removeClass('ui-state-disabled');
				}
			}
			function getCurrPos() {
				var rowsInGrid = $self.jqGrid("getDataIDs"),
				selrow = $("#id_g",frmtb).val(),
				pos = $.inArray(selrow,rowsInGrid);
				return [pos,rowsInGrid];
			}

			var dh = isNaN(rp_ge[gID].dataheight) ? rp_ge[gID].dataheight : rp_ge[gID].dataheight+"px",
			dw = isNaN(rp_ge[gID].datawidth) ? rp_ge[gID].datawidth : rp_ge[gID].datawidth+"px",
			frm = $("<form name='FormPost' id='"+frmgrID+"' class='FormGrid' onSubmit='return false;' style='width:"+dw+";overflow:auto;position:relative;height:"+dh+";'></form>").data("disabled",false),
			tbl = $("<table id='"+frmtborg+"' class='EditTable'"+(jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "")+"><tbody></tbody></table>");
			$(p.colModel).each( function() {
				var fmto = this.formoptions;
				maxCols = Math.max(maxCols, fmto ? fmto.colpos || 0 : 0 );
				maxRows = Math.max(maxRows, fmto ? fmto.rowpos || 0 : 0 );
			});
			$(frm).append(tbl);
			var flr = $("<tr id='FormError' style='display:none'><td class='ui-state-error' colspan='"+(maxCols*2)+"'></td></tr>");
			flr[0].rp = 0;
			$(tbl).append(flr);
			//topinfo
			flr = $("<tr style='display:none' class='tinfo'><td class='topinfo' colspan='"+(maxCols*2)+"'>"+rp_ge[gID].topinfo+"</td></tr>");
			flr[0].rp = 0;
			$(tbl).append(flr);
			showFrm = $self.triggerHandler("jqGridAddEditBeforeInitData", [frm, frmoper]);
			if(showFrm === undefined) {
				showFrm = true;
			}
			if(showFrm && onBeforeInit) {
				showFrm = onBeforeInit.call($t,frm, frmoper);
			}
			if(showFrm === false) {return;}
			restoreInline();
			// set the id.
			// use carefull only to change here colproperties.
			// create data
			var rtlb = p.direction === "rtl" ? true :false,
			bp = rtlb ? "nData" : "pData",
			bn = rtlb ? "pData" : "nData";
			createData(rowid,tbl,maxCols);
			// buttons at footer
			var bP = "<a id='"+bp+"' class='fm-button ui-state-default ui-corner-left'><span class='ui-icon ui-icon-triangle-1-w'></span></a>",
			bN = "<a id='"+bn+"' class='fm-button ui-state-default ui-corner-right'><span class='ui-icon ui-icon-triangle-1-e'></span></a>",
			bS  ="<a id='sData' class='fm-button ui-state-default ui-corner-all'>"+o.bSubmit+"</a>",
			bC  ="<a id='cData' class='fm-button ui-state-default ui-corner-all'>"+o.bCancel+"</a>";
			var bt = "<table"+(jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "")+" class='EditTable' id='"+frmtborg+"_2'><tbody><tr><td colspan='2'><hr class='ui-widget-content' style='margin:1px'/></td></tr><tr id='Act_Buttons'><td class='navButton'>"+(rtlb ? bN+bP : bP+bN)+"</td><td class='EditButton'>"+bS+bC+"</td></tr>";
			bt += "<tr style='display:none' class='binfo'><td class='bottominfo' colspan='2'>"+rp_ge[gID].bottominfo+"</td></tr>";
			bt += "</tbody></table>";
			if(maxRows >  0) {
				var sd=[];
				$.each($(tbl)[0].rows,function(i,r){
					sd[i] = r;
				});
				sd.sort(function(a,b){
					if(a.rp > b.rp) {return 1;}
					if(a.rp < b.rp) {return -1;}
					return 0;
				});
				$.each(sd, function(index, row) {
					$('tbody',tbl).append(row);
				});
			}
			o.gbox = gboxSelector;
			var cle = false;
			if(o.closeOnEscape===true){
				o.closeOnEscape = false;
				cle = true;
			}
			var tms = $("<div></div>").append(frm).append(bt);
			jgrid.createModal(ids,tms, rp_ge[gID] ,p.gView,$(gboxSelector)[0]);
			if(rtlb) {
				$("#pData, #nData",frmtb2).css("float","right");
				$(".EditButton",frmtb2).css("text-align","left");
			}
			if(rp_ge[gID].topinfo) {$(".tinfo",frmtb).show();}
			if(rp_ge[gID].bottominfo) {$(".binfo",frmtb2).show();}
			tms = null;bt=null;
			$(themodalSelector).keydown( function( e ) {
				var wkey = e.target;
				if ($(frmgr).data("disabled")===true ) {return false;}//??
				if(rp_ge[gID].savekey[0] === true && e.which === rp_ge[gID].savekey[1]) { // save
					if(wkey.tagName !== "TEXTAREA") {
						$("#sData", frmtb2).trigger("click");
						return false;
					}
				}
				if(e.which === 27) {
					if(!checkUpdates()) {return false;}
					if(cle)	{hideModal(themodalSelector,{gb:o.gbox,jqm:o.jqModal, onClose: rp_ge[gID].onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});}
					return false;
				}
				if(rp_ge[gID].navkeys[0]===true) {
					if($("#id_g",frmtb).val() === "_empty") {return true;}
					if(e.which === rp_ge[gID].navkeys[1]){ //up
						$("#pData", frmtb2).trigger("click");
						return false;
					}
					if(e.which === rp_ge[gID].navkeys[2]){ //down
						$("#nData", frmtb2).trigger("click");
						return false;
					}
				}
			});
			if(o.checkOnUpdate) {
				$("a.ui-jqdialog-titlebar-close span",themodalSelector).removeClass("jqmClose");
				$("a.ui-jqdialog-titlebar-close",themodalSelector).unbind("click")
				.click(function(){
					if(!checkUpdates()) {return false;}
					hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: rp_ge[gID].onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});
					return false;
				});
			}
			o.saveicon = $.extend([true,"left","ui-icon-disk"],o.saveicon);
			o.closeicon = $.extend([true,"left","ui-icon-close"],o.closeicon);
			// beforeinitdata after creation of the form
			if(o.saveicon[0]===true) {
				$("#sData",frmtb2).addClass(o.saveicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
				.append("<span class='ui-icon "+o.saveicon[2]+"'></span>");
			}
			if(o.closeicon[0]===true) {
				$("#cData",frmtb2).addClass(o.closeicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
				.append("<span class='ui-icon "+o.closeicon[2]+"'></span>");
			}
			if(rp_ge[gID].checkOnSubmit || rp_ge[gID].checkOnUpdate) {
				bS  ="<a id='sNew' class='fm-button ui-state-default ui-corner-all' style='z-index:1002'>"+o.bYes+"</a>";
				bN  ="<a id='nNew' class='fm-button ui-state-default ui-corner-all' style='z-index:1002'>"+o.bNo+"</a>";
				bC  ="<a id='cNew' class='fm-button ui-state-default ui-corner-all' style='z-index:1002'>"+o.bExit+"</a>";
				var zI = o.zIndex  || 999;zI ++;
				$("<div class='"+ o.overlayClass+" jqgrid-overlay confirm' style='z-index:"+zI+";display:none;'>&#160;"+"</div><div class='confirm ui-widget-content ui-jqconfirm' style='z-index:"+(zI+1)+"'>"+o.saveData+"<br/><br/>"+bS+bN+bC+"</div>").insertAfter(frmgr);
				$("#sNew",themodalSelector).click(function(){
					postIt();
					$(frmgr).data("disabled",false);
					$(".confirm",themodalSelector).hide();
					return false;
				});
				$("#nNew",themodalSelector).click(function(){
					$(".confirm",themodalSelector).hide();
					$(frmgr).data("disabled",false);
					setTimeout(function(){$(":input:visible",frmgr)[0].focus();},0);
					return false;
				});
				$("#cNew",themodalSelector).click(function(){
					$(".confirm",themodalSelector).hide();
					$(frmgr).data("disabled",false);
					hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: rp_ge[gID].onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});
					return false;
				});
			}
			// here initform - only once
			$self.triggerHandler("jqGridAddEditInitializeForm", [$(frmgr), frmoper]);
			if(onInitializeForm) {onInitializeForm.call($t,$(frmgr), frmoper);}
			if(rowid==="_empty" || !rp_ge[gID].viewPagerButtons) {$("#pData,#nData",frmtb2).hide();} else {$("#pData,#nData",frmtb2).show();}
			$self.triggerHandler("jqGridAddEditBeforeShowForm", [$(frmgr), frmoper]);
			if(onBeforeShow) { onBeforeShow.call($t, $(frmgr), frmoper);}
			$(themodalSelector).data("onClose",rp_ge[gID].onClose);
			jgrid.viewModal(themodalSelector,{
				gbox:gboxSelector,
				jqm:o.jqModal, 
				overlay: o.overlay,
				modal:o.modal, 
				overlayClass: o.overlayClass,
				onHide :  function(h) {
					var fh = $(themodalSelector)[0].style.height;
					if(fh.indexOf("px") > -1 ) {
						fh = parseFloat(fh);
					}
					$self.data("formProp", {
						top:parseFloat($(h.w).css("top")),
						left : parseFloat($(h.w).css("left")),
						width : $(h.w).width(),
						height : fh,
						dataheight : $(frmgr).height(),
						datawidth: $(frmgr).width()
					});
					h.w.remove();
					if(h.o) {h.o.remove();}
				}
			});
			if(!closeovrl) {
				$("." + jqID(o.overlayClass)).click(function(){
					if(!checkUpdates()) {return false;}
					hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: rp_ge[gID].onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});
					return false;
				});
			}
			$(".fm-button",themodalSelector).hover(
				function(){$(this).addClass('ui-state-hover');},
				function(){$(this).removeClass('ui-state-hover');}
			);
			$("#sData", frmtb2).click(function(){
				postdata = {};
				$("#FormError",frmtb).hide();
				// all depend on ret array
				//ret[0] - succes
				//ret[1] - msg if not succes
				//ret[2] - the id  that will be set if reload after submit false
				getFormData();
				if(postdata[gID+"_id"] === "_empty")	{postIt();}
				else if(o.checkOnSubmit===true ) {
					diff = compareData(postdata,rp_ge[gID]._savedData);
					if(diff) {
						$(frmgr).data("disabled",true);
						$(".confirm",themodalSelector).show();
					} else {
						postIt();
					}
				} else {
					postIt();
				}
				return false;
			});
			$("#cData", frmtb2).click(function(){
				if(!checkUpdates()) {return false;}
				hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: rp_ge[gID].onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});
				return false;
			});
			$("#nData", frmtb2).click(function(){
				if(!checkUpdates()) {return false;}
				$("#FormError",frmtb).hide();
				var npos = getCurrPos();
				npos[0] = parseInt(npos[0],10);
				if(npos[0] !== -1 && npos[1][npos[0]+1]) {
					$self.triggerHandler("jqGridAddEditClickPgButtons", ['next',$(frmgr),npos[1][npos[0]]]);
					var nposret;
					if($.isFunction(o.onclickPgButtons)) {
						nposret = o.onclickPgButtons.call($t, 'next',$(frmgr),npos[1][npos[0]]);
						if( nposret !== undefined && nposret === false ) {return false;}
					}
					if( $("#"+jqID(npos[1][npos[0]+1])).hasClass('ui-state-disabled')) {return false;}
					fillData(npos[1][npos[0]+1],frmgr);
					$self.jqGrid("setSelection",npos[1][npos[0]+1]);
					$self.triggerHandler("jqGridAddEditAfterClickPgButtons", ['next',$(frmgr),npos[1][npos[0]]]);
					if($.isFunction(o.afterclickPgButtons)) {
						o.afterclickPgButtons.call($t, 'next',$(frmgr),npos[1][npos[0]+1]);
					}
					updateNav(npos[0]+1,npos);
				}
				return false;
			});
			$("#pData", frmtb2).click(function(){
				if(!checkUpdates()) {return false;}
				$("#FormError",frmtb).hide();
				var ppos = getCurrPos();
				if(ppos[0] !== -1 && ppos[1][ppos[0]-1]) {
					$self.triggerHandler("jqGridAddEditClickPgButtons", ['prev',$(frmgr),ppos[1][ppos[0]]]);
					var pposret;
					if($.isFunction(o.onclickPgButtons)) {
						pposret = o.onclickPgButtons.call($t, 'prev',$(frmgr),ppos[1][ppos[0]]);
						if( pposret !== undefined && pposret === false ) {return false;}
					}
					if( $("#"+jqID(ppos[1][ppos[0]-1])).hasClass('ui-state-disabled')) {return false;}
					fillData(ppos[1][ppos[0]-1],frmgr);
					$self.jqGrid("setSelection",ppos[1][ppos[0]-1]);
					$self.triggerHandler("jqGridAddEditAfterClickPgButtons", ['prev',$(frmgr),ppos[1][ppos[0]]]);
					if($.isFunction(o.afterclickPgButtons)) {
						o.afterclickPgButtons.call($t, 'prev',$(frmgr),ppos[1][ppos[0]-1]);
					}
					updateNav(ppos[0]-1,ppos);
				}
				return false;
			});
			$self.triggerHandler("jqGridAddEditAfterShowForm", [$(frmgr), frmoper]);
			if(onAfterShow) { onAfterShow.call($t, $(frmgr), frmoper); }
			var posInit =getCurrPos();
			updateNav(posInit[0],posInit);
		});
	},
	viewGridRow : function(rowid, o){
		o = $.extend(true, {
			top : 0,
			left: 0,
			width: 0,
			datawidth: 'auto',
			height: 'auto',
			dataheight: 'auto',
			modal: false,
			overlay: 30,
			drag: true,
			resize: true,
			jqModal: true,
			closeOnEscape : false,
			labelswidth: '30%',
			closeicon: [],
			navkeys: [false,38,40],
			onClose: null,
			beforeShowForm : null,
			beforeInitData : null,
			viewPagerButtons : true,
			recreateForm : false,
			removemodal: true,
			form: 'view'
		}, jgrid.view, o || {});
		rp_ge[$(this)[0].p.id] = o;
		return this.each(function(){
			var $t = this, $self = $($t);
			if (!$t.grid || !rowid) {return;}
			var p = $t.p, gID = p.id, jqID = jgrid.jqID,
			frmgr = "#ViewGrid_"+jqID(gID), frmtb = "#ViewTbl_" + jqID(gID), frmtb2 = frmtb+"_2",
			frmgrID = "ViewGrid_"+gID, frmtbID = "ViewTbl_"+gID,
			ids = {themodal:'viewmod'+gID,modalhead:'viewhd'+gID,modalcontent:'viewcnt'+gID, scrollelm : frmgrID},
			themodalSelector = "#"+jqID(ids.themodal), gboxSelector = p.gBox,
			onBeforeInit = $.isFunction(rp_ge[gID].beforeInitData) ? rp_ge[gID].beforeInitData : false,
			showFrm = true,
			maxCols = 1, maxRows=0;
			if(!o.recreateForm) {
				if( $self.data("viewProp") ) {
					$.extend(rp_ge[gID], $self.data("viewProp"));
				}
			}
			function focusaref(){ //Sfari 3 issues
				if(rp_ge[gID].closeOnEscape===true || rp_ge[gID].navkeys[0]===true) {
					setTimeout(function(){$(".ui-jqdialog-titlebar-close","#"+jqID(ids.modalhead)).attr("tabindex", "-1").focus();},0);
				}
			}
			function createData(rowid,tb,maxcols){
				var nm, hc,trdata, cnt=0,tmp, dc, retpos=[], ind = $self.jqGrid("getInd",rowid), i,
				tdtmpl = "<td class='CaptionTD form-view-label ui-widget-content' width='"+o.labelswidth+"'></td><td class='DataTD form-view-data ui-helper-reset ui-widget-content'></td>", tmpl="",
				tdtmpl2 = "<td class='CaptionTD form-view-label ui-widget-content'></td><td class='DataTD form-view-data ui-widget-content'></td>",
				fmtnum = ['integer','number','currency'], max1=0, max2=0, maxw, setme, viewfld;
				for (i=1;i<=maxcols;i++) {
					tmpl += i === 1 ? tdtmpl : tdtmpl2;
				}
				// find max number align rigth with property formatter
				$(p.colModel).each( function() {
					if(this.editrules && this.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = this.hidden === true ? true : false;
					}
					if(!hc && this.align==='right') {
						if(this.formatter && $.inArray(this.formatter,fmtnum) !== -1 ) {
							max1 = Math.max(max1,parseInt(this.width,10));
						} else {
							max2 = Math.max(max2,parseInt(this.width,10));
						}
					}
				});
				maxw  = max1 !==0 ? max1 : max2 !==0 ? max2 : 0;
				$(p.colModel).each( function(i) {
					var $td;
					nm = this.name;
					setme = false;
					// hidden fields are included in the form
					if(this.editrules && this.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = this.hidden === true ? true : false;
					}
					dc = hc ? "style='display:none'" : "";
					viewfld = (typeof this.viewable !== 'boolean') ? true : this.viewable;
					if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn' && viewfld) {
						if(ind === false) {
							tmp = "";
						} else {
							$td = $("td:eq("+i+")",$t.rows[ind]);
							if(nm === p.ExpandColumn && p.treeGrid === true) {
								tmp = $td.text();
							} else {
								tmp = this.autoResizable && $td.length > 0 && $($td[0].firstChild).hasClass(p.autoResizableWrapperClassName) ?
									$($td[0].firstChild).html() :
									$td.html();
							}
						}
						setme = this.align === 'right' && maxw !==0 ? true : false;
						var frmopt = $.extend({},{rowabove:false,rowcontent:''}, this.formoptions || {}),
						rp = parseInt(frmopt.rowpos,10) || cnt+1,
						cp = parseInt((parseInt(frmopt.colpos,10) || 1)*2,10);
						if(frmopt.rowabove) {
							var newdata = $("<tr><td class='contentinfo' colspan='"+(maxcols*2)+"'>"+frmopt.rowcontent+"</td></tr>");
							$(tb).append(newdata);
							newdata[0].rp = rp;
						}
						trdata = $(tb).find("tr[rowpos="+rp+"]");
						if ( trdata.length===0 ) {
							trdata = $("<tr "+dc+" rowpos='"+rp+"'></tr>").addClass("FormData").attr("id","trv_"+nm);
							$(trdata).append(tmpl);
							$(tb).append(trdata);
							trdata[0].rp = rp;
						}
						$("td:eq("+(cp-2)+")",trdata[0]).html('<b>'+ ((frmopt.label === undefined ? p.colNames[i]: frmopt.label) || "&nbsp;")+'</b>');
						$("td:eq("+(cp-1)+")",trdata[0]).html("<span>"+(tmp || "&nbsp;")+"</span>").attr("id","v_"+nm);
						if(setme){
							$("td:eq("+(cp-1)+") span",trdata[0]).css({'text-align':'right',width:maxw+"px"});
						}
						retpos[cnt] = i;
						cnt++;
					}
				});
				if( cnt > 0) {
					var idrow = $("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='"+ (maxcols*2-1)+"' class='DataTD'><input class='FormElement' id='id_g' type='text' name='id' value='"+rowid+"'/></td></tr>");
					idrow[0].rp = cnt+99;
					$(tb).append(idrow);
				}
				return retpos;
			}
			function fillData(rowid){
				var nm, hc,cnt=0,tmp,trv = $self.jqGrid("getInd",rowid,true), cm;
				if(!trv) {return;}
				$('td',trv).each( function(i) {
					cm = p.colModel[i];
					nm = cm.name;
					// hidden fields are included in the form
					if(cm.editrules && cm.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = cm.hidden === true ? true : false;
					}
					if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn') {
						if(nm === p.ExpandColumn && p.treeGrid === true) {
							tmp = $(this).text();
						} else {
							tmp = cm.autoResizable && $(this.firstChild).hasClass(p.autoResizableWrapperClassName) ?
								$(this.firstChild).html() :
								$(this).html();
						}
						nm = jqID("v_"+nm);
						$("#"+nm+" span",frmtb).html(tmp);
						if (hc) {$("#"+nm,frmtb).parents("tr:first").hide();}
						cnt++;
					}
				});
				if(cnt>0) {$("#id_g",frmtb).val(rowid);}
			}
			function updateNav(cr,posarr){
				var totr = posarr[1].length-1;
				if (cr===0) {
					$("#pData",frmtb2).addClass('ui-state-disabled');
				} else if( posarr[1][cr-1] !== undefined && $("#"+jqID(posarr[1][cr-1])).hasClass('ui-state-disabled')) {
					$("#pData",frmtb2).addClass('ui-state-disabled');
				} else {
					$("#pData",frmtb2).removeClass('ui-state-disabled');
				}
				if (cr===totr) {
					$("#nData",frmtb2).addClass('ui-state-disabled');
				} else if( posarr[1][cr+1] !== undefined && $("#"+jqID(posarr[1][cr+1])).hasClass('ui-state-disabled')) {
					$("#nData",frmtb2).addClass('ui-state-disabled');
				} else {
					$("#nData",frmtb2).removeClass('ui-state-disabled');
				}
			}
			function getCurrPos() {
				var rowsInGrid = $self.jqGrid("getDataIDs"),
				selrow = $("#id_g",frmtb).val(),
				pos = $.inArray(selrow,rowsInGrid);
				return [pos,rowsInGrid];
			}

			var dh = isNaN(rp_ge[gID].dataheight) ? rp_ge[gID].dataheight : rp_ge[gID].dataheight+"px",
			dw = isNaN(rp_ge[gID].datawidth) ? rp_ge[gID].datawidth : rp_ge[gID].datawidth+"px",
			frm = $("<form name='FormPost' id='"+frmgrID+"' class='FormGrid' style='width:"+dw+";overflow:auto;position:relative;height:"+dh+";'></form>"),
			tbl =$("<table id='"+frmtbID+"' class='EditTable' cellspacing='1' cellpadding='2' border='0' style='table-layout:fixed'><tbody></tbody></table>");
			$(p.colModel).each( function() {
				var fmto = this.formoptions;
				maxCols = Math.max(maxCols, fmto ? fmto.colpos || 0 : 0 );
				maxRows = Math.max(maxRows, fmto ? fmto.rowpos || 0 : 0 );
			});
			// set the id.
			$(frm).append(tbl);
			if(onBeforeInit) {
				showFrm = onBeforeInit.call($t, frm );
				if(showFrm === undefined) {
					showFrm = true;
				}
			}
			if(showFrm === false) {return;}
			createData(rowid, tbl, maxCols);
			var rtlb = p.direction === "rtl" ? true :false,
			bp = rtlb ? "nData" : "pData",
			bn = rtlb ? "pData" : "nData",
				// buttons at footer
			bP = "<a id='"+bp+"' class='fm-button ui-state-default ui-corner-left'><span class='ui-icon ui-icon-triangle-1-w'></span></a>",
			bN = "<a id='"+bn+"' class='fm-button ui-state-default ui-corner-right'><span class='ui-icon ui-icon-triangle-1-e'></span></a>",
			bC  ="<a id='cData' class='fm-button ui-state-default ui-corner-all'>"+o.bClose+"</a>";
			if(maxRows >  0) {
				var sd=[];
				$.each($(tbl)[0].rows,function(i,r){
					sd[i] = r;
				});
				sd.sort(function(a,b){
					if(a.rp > b.rp) {return 1;}
					if(a.rp < b.rp) {return -1;}
					return 0;
				});
				$.each(sd, function(index, row) {
					$('tbody',tbl).append(row);
				});
			}
			o.gbox = gboxSelector;
			var bt = $("<div></div>").append(frm).append("<table border='0' class='EditTable' id='"+frmtbID+"_2'><tbody><tr id='Act_Buttons'><td class='navButton' width='"+o.labelswidth+"'>"+(rtlb ? bN+bP : bP+bN)+"</td><td class='EditButton'>"+bC+"</td></tr></tbody></table>");
			jgrid.createModal(ids,bt,o,p.gView,$(p.gView)[0]);
			if(rtlb) {
				$("#pData, #nData",frmtb2).css("float","right");
				$(".EditButton",frmtb2).css("text-align","left");
			}
			if(!o.viewPagerButtons) {$("#pData, #nData",frmtb2).hide();}
			bt = null;
			$(themodalSelector).keydown( function( e ) {
				if(e.which === 27) {
					if(rp_ge[gID].closeOnEscape) {jgrid.hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});}
					return false;
				}
				if(o.navkeys[0]===true) {
					if(e.which === o.navkeys[1]){ //up
						$("#pData", frmtb2).trigger("click");
						return false;
					}
					if(e.which === o.navkeys[2]){ //down
						$("#nData", frmtb2).trigger("click");
						return false;
					}
				}
			});
			o.closeicon = $.extend([true,"left","ui-icon-close"],o.closeicon);
			if(o.closeicon[0]===true) {
				$("#cData",frmtb2).addClass(o.closeicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
				.append("<span class='ui-icon "+o.closeicon[2]+"'></span>");
			}
			if($.isFunction(o.beforeShowForm)) {o.beforeShowForm.call($t,$(frmgr));}
			jgrid.viewModal(themodalSelector,{
				gbox:gboxSelector,
				jqm:o.jqModal,
				overlay: o.overlay, 
				modal:o.modal,
				onHide :  function(h) {
					$self.data("viewProp", {
						top:parseFloat($(h.w).css("top")),
						left : parseFloat($(h.w).css("left")),
						width : $(h.w).width(),
						height : $(h.w).height(),
						dataheight : $(frmgr).height(),
						datawidth: $(frmgr).width()
					});
					h.w.remove();
					if(h.o) {h.o.remove();}
				}
			});
			$(".fm-button:not(.ui-state-disabled)",frmtb2).hover(
				function(){$(this).addClass('ui-state-hover');},
				function(){$(this).removeClass('ui-state-hover');}
			);
			focusaref();
			$("#cData", frmtb2).click(function(){
				jgrid.hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: rp_ge[gID].removemodal, formprop: !rp_ge[gID].recreateForm, form: rp_ge[gID].form});
				return false;
			});
			$("#nData", frmtb2).click(function(){
				$("#FormError",frmtb).hide();
				var npos = getCurrPos();
				npos[0] = parseInt(npos[0],10);
				if(npos[0] !== -1 && npos[1][npos[0]+1]) {
					if($.isFunction(o.onclickPgButtons)) {
						o.onclickPgButtons.call($t,'next',$(frmgr),npos[1][npos[0]]);
					}
					fillData(npos[1][npos[0]+1]);
					$self.jqGrid("setSelection",npos[1][npos[0]+1]);
					if($.isFunction(o.afterclickPgButtons)) {
						o.afterclickPgButtons.call($t,'next',$(frmgr),npos[1][npos[0]+1]);
					}
					updateNav(npos[0]+1,npos);
				}
				focusaref();
				return false;
			});
			$("#pData", frmtb2).click(function(){
				$("#FormError",frmtb).hide();
				var ppos = getCurrPos();
				if(ppos[0] !== -1 && ppos[1][ppos[0]-1]) {
					if($.isFunction(o.onclickPgButtons)) {
						o.onclickPgButtons.call($t,'prev',$(frmgr),ppos[1][ppos[0]]);
					}
					fillData(ppos[1][ppos[0]-1]);
					$self.jqGrid("setSelection",ppos[1][ppos[0]-1]);
					if($.isFunction(o.afterclickPgButtons)) {
						o.afterclickPgButtons.call($t,'prev',$(frmgr),ppos[1][ppos[0]-1]);
					}
					updateNav(ppos[0]-1,ppos);
				}
				focusaref();
				return false;
			});
			var posInit =getCurrPos();
			updateNav(posInit[0],posInit);
		});
	},
	delGridRow : function(rowids,o) {
		o = $.extend(true, {
			top : 0,
			left: 0,
			width: 240,
			height: 'auto',
			dataheight : 'auto',
			modal: false,
			overlay: 30,
			drag: true,
			resize: true,
			url : '',
			mtype : "POST",
			reloadAfterSubmit: true,
			beforeShowForm: null,
			beforeInitData : null,
			afterShowForm: null,
			beforeSubmit: null,
			onclickSubmit: null,
			afterSubmit: null,
			jqModal : true,
			closeOnEscape : false,
			delData: {},
			delicon : [],
			cancelicon : [],
			onClose : null,
			ajaxDelOptions : {},
			processing : false,
			serializeDelData : null,
			useDataProxy : false
		}, jgrid.del, o ||{});
		rp_ge[$(this)[0].p.id] = o;
		return this.each(function(){
			var $t = this;
			if (!$t.grid ) {return;}
			if(!rowids) {return;}
			var p = $t.p, gID = p.id, onBeforeShow = $.isFunction(rp_ge[gID].beforeShowForm), jqID = jgrid.jqID,
			onAfterShow = $.isFunction(rp_ge[gID].afterShowForm), dtblID = "DelTbl_" + gID,
			onBeforeInit = $.isFunction(rp_ge[gID].beforeInitData) ? rp_ge[gID].beforeInitData : false,
			ids = {themodal:'delmod'+gID,modalhead:'delhd'+gID,modalcontent:'delcnt'+gID, scrollelm: dtblID},
		    themodalSelector = "#"+jqID(ids.themodal), gboxSelector = p.gBox,
			showFrm = true,
			dtbl = "#DelTbl_"+jqID(gID),postd, idname, opers, oper;

			if ($.isArray(rowids)) { rowids = rowids.join(); }
			if ( $(themodalSelector)[0] !== undefined ) {
				if(onBeforeInit) {
					showFrm = onBeforeInit.call($t,$(dtbl));
					if(showFrm === undefined) {
						showFrm = true;
					}
				}
				if(showFrm === false) {return;}
				$("#DelData>td",dtbl).text(rowids);
				$("#DelError",dtbl).hide();
				if( rp_ge[gID].processing === true) {
					rp_ge[gID].processing=false;
					$("#dData",dtbl).removeClass('ui-state-active');
				}
				if(onBeforeShow) {rp_ge[gID].beforeShowForm.call($t,$(dtbl));}
				jgrid.viewModal(themodalSelector,{gbox:gboxSelector,jqm:rp_ge[gID].jqModal,jqM: false, overlay: rp_ge[gID].overlay, modal:rp_ge[gID].modal});
				if(onAfterShow) {rp_ge[gID].afterShowForm.call($t,$(dtbl));}
			} else {
				var dh = isNaN(rp_ge[gID].dataheight) ? rp_ge[gID].dataheight : rp_ge[gID].dataheight+"px",
				dw = isNaN(o.datawidth) ? o.datawidth : o.datawidth+"px",
				tbl = "<div id='"+dtblID+"' class='formdata' style='width:"+dw+";overflow:auto;position:relative;height:"+dh+";'>";
				tbl += "<table class='DelTable'><tbody>";
				// error data
				tbl += "<tr id='DelError' style='display:none'><td class='ui-state-error'></td></tr>";
				tbl += "<tr id='DelData' style='display:none'><td >"+rowids+"</td></tr>";
				tbl += "<tr><td class=\"delmsg\" style=\"white-space:pre;\">"+rp_ge[gID].msg+"</td></tr><tr><td >&#160;</td></tr>";
				// buttons at footer
				tbl += "</tbody></table></div>";
				var bS  = "<a id='dData' class='fm-button ui-state-default ui-corner-all'>"+o.bSubmit+"</a>",
				bC  = "<a id='eData' class='fm-button ui-state-default ui-corner-all'>"+o.bCancel+"</a>";
				tbl += "<table"+(jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "")+" class='EditTable' id='"+dtblID+"_2'><tbody><tr><td><hr class='ui-widget-content' style='margin:1px'/></td></tr><tr><td class='DelButton EditButton'>"+bS+"&#160;"+bC+"</td></tr></tbody></table>";
				o.gbox = gboxSelector;
				jgrid.createModal(ids,tbl,o,p.gView,$(p.gView)[0]);

				if(onBeforeInit) {
					showFrm = onBeforeInit.call($t,$(tbl));
					if(showFrm === undefined) {
						showFrm = true;
					}
				}
				if(showFrm === false) {return;}

				$(".fm-button",dtbl+"_2").hover(
					function(){$(this).addClass('ui-state-hover');},
					function(){$(this).removeClass('ui-state-hover');}
				);
				o.delicon = $.extend([true,"left","ui-icon-scissors"],rp_ge[gID].delicon);
				o.cancelicon = $.extend([true,"left","ui-icon-cancel"],rp_ge[gID].cancelicon);
				if(o.delicon[0]===true) {
					$("#dData",dtbl+"_2").addClass(o.delicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
					.append("<span class='ui-icon "+o.delicon[2]+"'></span>");
				}
				if(o.cancelicon[0]===true) {
					$("#eData",dtbl+"_2").addClass(o.cancelicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
					.append("<span class='ui-icon "+o.cancelicon[2]+"'></span>");
				}
				$("#dData",dtbl+"_2").click(function(){
					var ret=[true,""], pk,
					postdata = $("#DelData>td",dtbl).text(), //the pair is name=val1,val2,...
					cs = {};
					if( $.isFunction( rp_ge[gID].onclickSubmit ) ) {cs = rp_ge[gID].onclickSubmit.call($t,rp_ge[gID], postdata) || {};}
					if( $.isFunction( rp_ge[gID].beforeSubmit ) ) {ret = rp_ge[gID].beforeSubmit.call($t,postdata);}
					if(ret[0] && !rp_ge[gID].processing) {
						rp_ge[gID].processing = true;
						opers = p.prmNames;
						postd = $.extend({},rp_ge[gID].delData, cs);
						oper = opers.oper;
						postd[oper] = opers.deloper;
						idname = opers.id;
						postdata = String(postdata).split(",");
						if(!postdata.length) { return false; }
						for(pk in postdata) {
							if(postdata.hasOwnProperty(pk)) {
								postdata[pk] = jgrid.stripPref(p.idPrefix, postdata[pk]);
							}
						}
						postd[idname] = postdata.join();
						$(this).addClass('ui-state-active');
						var ajaxOptions = $.extend({
							url: rp_ge[gID].url || $($t).jqGrid('getGridParam','editurl'),
							type: rp_ge[gID].mtype,
							data: $.isFunction(rp_ge[gID].serializeDelData) ? rp_ge[gID].serializeDelData.call($t,postd) : postd,
							complete:function(data,status){
								var i;
								$("#dData",dtbl+"_2").removeClass('ui-state-active');
								if(data.status >= 300 && data.status !== 304) {
									ret[0] = false;
									if ($.isFunction(rp_ge[gID].errorTextFormat)) {
										ret[1] = rp_ge[gID].errorTextFormat.call($t,data);
									} else {
										ret[1] = status + " Status: '" + data.statusText + "'. Error code: " + data.status;
									}
								} else {
									// data is posted successful
									// execute aftersubmit with the returned data from server
									if( $.isFunction( rp_ge[gID].afterSubmit ) ) {
										ret = rp_ge[gID].afterSubmit.call($t,data,postd);
									}
								}
								if(ret[0] === false) {
									$("#DelError>td",dtbl).html(ret[1]);
									$("#DelError",dtbl).show();
								} else {
									if(rp_ge[gID].reloadAfterSubmit && p.datatype !== "local") {
										$($t).trigger("reloadGrid");
									} else {
										if(p.treeGrid===true){
												try {$($t).jqGrid("delTreeNode",p.idPrefix+postdata[0]);} catch(e){}
										} else {
											for(i=0;i<postdata.length;i++) {
												$($t).jqGrid("delRowData",p.idPrefix+ postdata[i]);
											}
										}
										p.selrow = null;
										p.selarrrow = [];
									}
									if($.isFunction(rp_ge[gID].afterComplete)) {
										setTimeout(function(){rp_ge[gID].afterComplete.call($t,data,postdata);},500);
									}
								}
								rp_ge[gID].processing=false;
								if(ret[0]) {jgrid.hideModal(themodalSelector,{gb:gboxSelector,jqm:rp_ge[gID].jqModal, onClose: rp_ge[gID].onClose});}
							}
						}, jgrid.ajaxOptions, rp_ge[gID].ajaxDelOptions);


						if (!ajaxOptions.url && !rp_ge[gID].useDataProxy) {
							if ($.isFunction(p.dataProxy)) {
								rp_ge[gID].useDataProxy = true;
							} else {
								ret[0]=false;ret[1] += " "+jgrid.errors.nourl;
							}
						}
						if (ret[0]) {
							if (rp_ge[gID].useDataProxy) {
								var dpret = p.dataProxy.call($t, ajaxOptions, "del_"+gID); 
								if(dpret === undefined) {
									dpret = [true, ""];
								}
								if(dpret[0] === false ) {
									ret[0] = false;
									ret[1] = dpret[1] || "Error deleting the selected row!" ;
								} else {
									jgrid.hideModal(themodalSelector,{gb:gboxSelector,jqm:rp_ge[gID].jqModal, onClose: rp_ge[gID].onClose});
								}
							}
							else {
								if(ajaxOptions.url === "clientArray") {
									postd = ajaxOptions.data;
									ajaxOptions.complete({status:200, statusText:''},'');
								} else {
									$.ajax(ajaxOptions); 
								}
							}
						}
					}

					if(ret[0] === false) {
						$("#DelError>td",dtbl).html(ret[1]);
						$("#DelError",dtbl).show();
					}
					return false;
				});
				$("#eData",dtbl+"_2").click(function(){
					jgrid.hideModal(themodalSelector,{gb:gboxSelector,jqm:rp_ge[gID].jqModal, onClose: rp_ge[gID].onClose});
					return false;
				});
				if(onBeforeShow) {rp_ge[gID].beforeShowForm.call($t,$(dtbl));}
				jgrid.viewModal(themodalSelector,{gbox:gboxSelector,jqm:rp_ge[gID].jqModal, overlay: rp_ge[gID].overlay, modal:rp_ge[gID].modal});
				if(onAfterShow) {rp_ge[gID].afterShowForm.call($t,$(dtbl));}
			}
			if(rp_ge[gID].closeOnEscape===true) {
				setTimeout(function(){$(".ui-jqdialog-titlebar-close","#"+jqID(ids.modalhead)).attr("tabindex","-1").focus();},0);
			}
		});
	},
	navGrid : function (elem, o, pEdit,pAdd,pDel,pSearch, pView) {
		o = $.extend({
			edit: true,
			editicon: "ui-icon-pencil",
			add: true,
			addicon:"ui-icon-plus",
			del: true,
			delicon:"ui-icon-trash",
			search: true,
			searchicon:"ui-icon-search",
			refresh: true,
			refreshicon:"ui-icon-refresh",
			refreshstate: 'firstpage',
			view: false,
			viewicon : "ui-icon-document",
			position : "left",
			closeOnEscape : true,
			beforeRefresh : null,
			afterRefresh : null,
			cloneToTop : false,
			alertwidth : 200,
			alertheight : 'auto',
			alerttop: null,
			alertleft: null,
			alertzIndex : null
		}, jgrid.nav, o ||{});
		return this.each(function() {
			if(this.nav) {return;}
			var p = this.p, gridId = p.id, alertIDs = {themodal: 'alertmod_' + gridId, modalhead: 'alerthd_' + gridId,modalcontent: 'alertcnt_' + gridId},
			$t = this, twd, tdw, jqID = jgrid.jqID, gridIdEscaped = p.idSel, gboxSelector = p.gBox,
			viewModalAlert = function () {
				jgrid.viewModal("#"+jqID(alertIDs.themodal),{gbox:gboxSelector,jqm:true});
				$("#jqg_alrt").focus();
			};
			if(!$t.grid || typeof elem !== 'string') {return;}
			if ($("#"+jqID(alertIDs.themodal))[0] === undefined) {
				if(!o.alerttop && !o.alertleft) {
					if (window.innerWidth !== undefined) {
						o.alertleft = window.innerWidth;
						o.alerttop = window.innerHeight;
					} else if (document.documentElement !== undefined && document.documentElement.clientWidth !== undefined && document.documentElement.clientWidth !== 0) {
						o.alertleft = document.documentElement.clientWidth;
						o.alerttop = document.documentElement.clientHeight;
					} else {
						o.alertleft=1024;
						o.alerttop=768;
					}
					o.alertleft = o.alertleft/2 - parseInt(o.alertwidth,10)/2;
					o.alerttop = o.alerttop/2-25;
				}
				jgrid.createModal(alertIDs,
					"<div>"+o.alerttext+"</div><span tabindex='0'><span tabindex='-1' id='jqg_alrt'></span></span>",
					{ 
						gbox:gboxSelector,
						jqModal:true,
						drag:true,
						resize:true,
						caption:o.alertcap,
						top:o.alerttop,
						left:o.alertleft,
						width:o.alertwidth,
						height: o.alertheight,
						closeOnEscape:o.closeOnEscape, 
						zIndex: o.alertzIndex
					},
					"#gview_"+gridIdEscaped,
					$(gboxSelector)[0],
					true
				);
			}
			var clone = 1, i,
			onHoverIn = function () {
				if (!$(this).hasClass('ui-state-disabled')) {
					$(this).addClass("ui-state-hover");
				}
			},
			onHoverOut = function () {
				$(this).removeClass("ui-state-hover");
			};
			if(o.cloneToTop && p.toppager) {clone = 2;}
			for(i = 0; i<clone; i++) {
				var tbd,
				navtbl = $("<table"+(jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "")+" class='ui-pg-table navtable' style='float:left;table-layout:auto;'><tbody><tr></tr></tbody></table>"),
				sep = "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='ui-separator'></span></td>",
				pgid, elemids;
				if(i===0) {
					pgid = elem;
					elemids = gridId;
					if(pgid === p.toppager) {
						elemids += "_top";
						clone = 1;
					}
				} else {
					pgid = p.toppager;
					elemids = gridId+"_top";
				}
				if(p.direction === "rtl") {$(navtbl).attr("dir","rtl").css("float","right");}
				if (o.add) {
					pAdd = pAdd || {};
					tbd = $("<td class='ui-pg-button ui-corner-all'></td>");
					$(tbd).append("<div class='ui-pg-div'><span class='ui-icon "+o.addicon+"'></span>"+o.addtext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.addtitle || "",id : pAdd.id || "add_"+elemids})
					.click(function(){
						if (!$(this).hasClass('ui-state-disabled')) {
							if ($.isFunction( o.addfunc )) {
								o.addfunc.call($t);
							} else {
								$($t).jqGrid("editGridRow","new",pAdd);
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				if (o.edit) {
					tbd = $("<td class='ui-pg-button ui-corner-all'></td>");
					pEdit = pEdit || {};
					$(tbd).append("<div class='ui-pg-div'><span class='ui-icon "+o.editicon+"'></span>"+o.edittext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.edittitle || "",id: pEdit.id || "edit_"+elemids})
					.click(function(){
						if (!$(this).hasClass('ui-state-disabled')) {
							var sr = p.selrow;
							if (sr) {
								if($.isFunction( o.editfunc ) ) {
									o.editfunc.call($t, sr);
								} else {
									$($t).jqGrid("editGridRow",sr,pEdit);
								}
							} else {
								viewModalAlert();
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				if (o.view) {
					tbd = $("<td class='ui-pg-button ui-corner-all'></td>");
					pView = pView || {};
					$(tbd).append("<div class='ui-pg-div'><span class='ui-icon "+o.viewicon+"'></span>"+o.viewtext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.viewtitle || "",id: pView.id || "view_"+elemids})
					.click(function(){
						if (!$(this).hasClass('ui-state-disabled')) {
							var sr = p.selrow;
							if (sr) {
								if($.isFunction( o.viewfunc ) ) {
									o.viewfunc.call($t, sr);
								} else {
									$($t).jqGrid("viewGridRow",sr,pView);
								}
							} else {
								viewModalAlert();
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				if (o.del) {
					tbd = $("<td class='ui-pg-button ui-corner-all'></td>");
					pDel = pDel || {};
					$(tbd).append("<div class='ui-pg-div'><span class='ui-icon "+o.delicon+"'></span>"+o.deltext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.deltitle || "",id: pDel.id || "del_"+elemids})
					.click(function(){
						if (!$(this).hasClass('ui-state-disabled')) {
							var dr;
							if(p.multiselect) {
								dr = p.selarrrow;
								if(dr.length===0) {dr = null;}
							} else {
								dr = p.selrow;
							}
							if(dr){
								if($.isFunction( o.delfunc )){
									o.delfunc.call($t, dr);
								}else{
									$($t).jqGrid("delGridRow",dr,pDel);
								}
							} else  {
								viewModalAlert();
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				if(o.add || o.edit || o.del || o.view) {$("tr",navtbl).append(sep);}
				if (o.search) {
					tbd = $("<td class='ui-pg-button ui-corner-all'></td>");
					pSearch = pSearch || {};
					$(tbd).append("<div class='ui-pg-div'><span class='ui-icon "+o.searchicon+"'></span>"+o.searchtext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.searchtitle  || "",id:pSearch.id || "search_"+elemids})
					.click(function(){
						if (!$(this).hasClass('ui-state-disabled')) {
							if($.isFunction( o.searchfunc )) {
								o.searchfunc.call($t, pSearch);
							} else {
								$($t).jqGrid("searchGrid",pSearch);
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					if (pSearch.showOnLoad && pSearch.showOnLoad === true) {
						$(tbd,navtbl).click();
					}
					tbd = null;
				}
				if (o.refresh) {
					tbd = $("<td class='ui-pg-button ui-corner-all'></td>");
					$(tbd).append("<div class='ui-pg-div'><span class='ui-icon "+o.refreshicon+"'></span>"+o.refreshtext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.refreshtitle  || "",id: "refresh_"+elemids})
					.click(function(){
						if (!$(this).hasClass('ui-state-disabled')) {
							if($.isFunction(o.beforeRefresh)) {o.beforeRefresh.call($t);}
							p.search = false;
							p.resetsearch =  true;
							try {
								if( o.refreshstate !== 'currentfilter') {
									p.postData.filters ="";
									try {
										$("#fbox_"+gridIdEscaped).jqFilter('resetFilter');
									} catch(ef) {}
									if($.isFunction($t.clearToolbar)) {$t.clearToolbar.call($t,false);}
								}
							} catch (e) {}
							switch (o.refreshstate) {
								case 'firstpage':
									$($t).trigger("reloadGrid", [{page:1}]);
									break;
								case 'current':
								case 'currentfilter':
									$($t).trigger("reloadGrid", [{current:true}]);
									break;
							}
							if($.isFunction(o.afterRefresh)) {o.afterRefresh.call($t);}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				tdw = $(".ui-jqgrid").css("font-size") || "11px";
				$('body').append("<div id='testpg2' class='ui-jqgrid ui-widget ui-widget-content' style='font-size:"+tdw+";visibility:hidden;' ></div>");
				twd = $(navtbl).clone().appendTo("#testpg2").width();
				$("#testpg2").remove();
				$(pgid+"_"+o.position,pgid).append(navtbl);
				if(p._nvtd) {
					if(twd > p._nvtd[0] ) {
						$(pgid+"_"+o.position,pgid).width(twd);
						p._nvtd[0] = twd;
					}
					p._nvtd[1] = twd;
				}
				tdw =null;twd=null;navtbl =null;
				this.nav = true;
			}
		});
	},
	navButtonAdd : function (elem, p) {
		p = $.extend({
			caption : "newButton",
			title: '',
			buttonicon : 'ui-icon-newwin',
			onClickButton: null,
			position : "last",
			cursor : 'pointer'
		}, p ||{});
		return this.each(function() {
			var jqID = jgrid.jqID;
			if( !this.grid)  {return;}
			if( typeof elem === "string" && elem.indexOf("#") !== 0) {elem = "#"+jqID(elem);}
			var findnav = $(".navtable",elem)[0], $t = this;
			if (findnav) {
				if( p.id && $(p.idSel, findnav)[0] !== undefined )  {return;}
				var tbd = $("<td></td>");
				if(p.buttonicon.toString().toUpperCase() === "NONE") {
                    $(tbd).addClass('ui-pg-button ui-corner-all').append("<div class='ui-pg-div'>"+p.caption+"</div>");
				} else	{
					$(tbd).addClass('ui-pg-button ui-corner-all').append("<div class='ui-pg-div'><span class='ui-icon "+p.buttonicon+"'></span>"+p.caption+"</div>");
				}
				if(p.id) {$(tbd).attr("id",p.id);}
				if(p.position==='first'){
					if(findnav.rows[0].cells.length ===0 ) {
						$("tr",findnav).append(tbd);
					} else {
						$("tr td:eq(0)",findnav).before(tbd);
					}
				} else {
					$("tr",findnav).append(tbd);
				}
				$(tbd,findnav)
				.attr("title",p.title  || "")
				.click(function(e){
					if (!$(this).hasClass('ui-state-disabled')) {
						if ($.isFunction(p.onClickButton) ) {p.onClickButton.call($t,e);}
					}
					return false;
				})
				.hover(
					function () {
						if (!$(this).hasClass('ui-state-disabled')) {
							$(this).addClass('ui-state-hover');
						}
					},
					function () {$(this).removeClass("ui-state-hover");}
				);
			}
		});
	},
	navSeparatorAdd:function (elem,p) {
		p = $.extend({
			sepclass : "ui-separator",
			sepcontent: '',
			position : "last"
		}, p ||{});
		return this.each(function() {
			if( !this.grid)  {return;}
			if( typeof elem === "string" && elem.indexOf("#") !== 0) {elem = "#"+jgrid.jqID(elem);}
			var findnav = $(".navtable",elem)[0];
			if(findnav) {
				var sep = "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='"+p.sepclass+"'></span>"+p.sepcontent+"</td>";
				if (p.position === 'first') {
					if (findnav.rows[0].cells.length === 0) {
						$("tr", findnav).append(sep);
					} else {
						$("tr td:eq(0)", findnav).before(sep);
					}
				} else {
					$("tr", findnav).append(sep);
				}
			}
		});
	},
	GridToForm : function( rowid, formid ) {
		return this.each(function(){
			var $t = this, i, $field;
			if (!$t.grid) {return;}
			var rowdata = $($t).jqGrid("getRowData",rowid);
			if (rowdata) {
				for(i in rowdata) {
					if(rowdata.hasOwnProperty(i)) {
					$field = $("[name="+jgrid.jqID(i)+"]",formid);
					if ($field.is("input:radio") || $field.is("input:checkbox"))  {
						$field.each( function() {
							if( $(this).val() == rowdata[i] ) {
								$(this)[$t.p.useProp ? 'prop': 'attr']("checked",true);
							} else {
								$(this)[$t.p.useProp ? 'prop': 'attr']("checked", false);
							}
						});
					} else {
					// this is very slow on big table and form.
						$field.val(rowdata[i]);
					}
				}
			}
			}
		});
	},
	FormToGrid : function(rowid, formid, mode, position){
		return this.each(function() {
			var $t = this;
			if(!$t.grid) {return;}
			if(!mode) {mode = 'set';}
			if(!position) {position = 'first';}
			var fields = $(formid).serializeArray();
			var griddata = {};
			$.each(fields, function(i, field){
				griddata[field.name] = field.value;
			});
			if(mode==='add') {$($t).jqGrid("addRowData",rowid,griddata, position);}
			else if(mode==='set') {$($t).jqGrid("setRowData",rowid,griddata);}
		});
	}
});
})(jQuery);
