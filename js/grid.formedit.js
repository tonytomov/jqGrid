/*jshint eqeqeq:false, eqnull:true, devel:true */
/*jslint browser: true, devel: true, eqeq: true, evil: true, nomen: true, plusplus: true, continue: true, regexp: true, unparam: true, todo: true, vars: true, white: true, maxerr: 999 */
/*global xmlJsonClass, jQuery */
(function($){
/**
 * jqGrid extension for form editing Grid Data
 * Copyright (c) 2008-2014, Tony Tomov, tony@trirand.com
 * Copyright (c) 2014-2015, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * http://trirand.com/blog/
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
**/
"use strict";
var jgrid = $.jgrid, feedback = jgrid.feedback, fullBoolFeedback = jgrid.fullBoolFeedback, jqID = jgrid.jqID,
	hideModal = jgrid.hideModal, viewModal = jgrid.viewModal, createModal = jgrid.createModal, infoDialog = jgrid.info_dialog,
	mergeCssClasses = jgrid.mergeCssClasses,
	getCssStyleOrFloat = function ($elem, styleName) {
		var v = $elem[0].style[styleName];
		return v.indexOf("px") >= 0 ? parseFloat(v) : v;
	},
	savePositionOnHide = function (propName, frmgr, h) {
		var $w = h.w, $form = $(frmgr);
		// we use below .style.height and .style.width to save correctly "auto" and "100%" values
		// the "px" suffix will be saved too, but it's not a problem 
		this.data(propName, {
			top: getCssStyleOrFloat($w, "top"),					//parseFloat($w.css("top")),
			left: getCssStyleOrFloat($w, "left"),				//parseFloat($w.css("left")),
			width: getCssStyleOrFloat($w, "width"),				//$(h.w).width(),
			height: getCssStyleOrFloat($w, "height"),			//$(h.w).height(),
			dataheight: getCssStyleOrFloat($form, "height") || "auto",
			datawidth: getCssStyleOrFloat($form, "width") || "auto"
		});
		$w.remove();
		if(h.o) {h.o.remove();}
	},
	addFormIcon = function ($fmButton, iconInfos, commonIcon) {
		var iconspan;
		if (iconInfos[0] === true) {
			iconspan = "<span class='" + mergeCssClasses("fm-button-icon", commonIcon, iconInfos[2]) + "'></span>";
			if (iconInfos[1] === "right") {
				$fmButton.addClass('fm-button-icon-right').append(iconspan);
			} else {
				$fmButton.addClass('fm-button-icon-left').prepend(iconspan);
			}
		}
	};
jgrid.extend({
	searchGrid : function (oMuligrid) {
		// if one uses jQuery wrapper with multiple grids, then oMuligrid specify the object with common options
		return this.each(function() {
			var $t = this, $self = $($t), p = $t.p;
			if(!$t.grid || p == null) {return;}
			// make new copy of the options and use it for ONE specific grid.
			// p.searching can contains grid specific options
			// we will don't modify the input options oMuligrid
			var o = $.extend(true, {
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
				// we can't use srort names like resetIcon because of conflict with existing "x" of filterToolbar
				top : 0,
				left: 0,
				removemodal: true,
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
				toTop : false,
				overlay : 30,
				columns : [],
				tmplNames : null,
				tmplFilters : null,
				tmplLabel : ' Template: ',
				showOnLoad: false,
				layer: null,
				operands : { "eq" :"=", "ne":"<>","lt":"<","le":"<=","gt":">","ge":">=","bw":"LIKE","bn":"NOT LIKE","in":"IN","ni":"NOT IN","ew":"LIKE","en":"NOT LIKE","cn":"LIKE","nc":"NOT LIKE","nu":"IS NULL","nn":"IS NOT NULL"}
			},
			$self.jqGrid("getGridRes", "search"),
			jgrid.search || {},
			p.searching || {},
			oMuligrid || {});

			var fid = "fbox_"+p.id, commonIconClass = o.commonIconClass,
			ids = {themodal:'searchmod'+fid,modalhead:'searchhd'+fid,modalcontent:'searchcnt'+fid, resizeAlso : fid},
			themodalSelector = "#"+jqID(ids.themodal), gboxSelector = p.gBox, gviewSelector = p.gView,
			defaultFilters = p.postData[o.sFilter],
			searchFeedback = function () {
				var args = $.makeArray(arguments);
				args.unshift("Search");
				args.unshift("Filter");
				args.unshift(o);
				return feedback.apply($t, args);
			};
			if(typeof defaultFilters === "string") {
				defaultFilters = jgrid.parse( defaultFilters );
			}
			if(o.recreateFilter === true) {
				$(themodalSelector).remove();
			} else if ($self.data("searchProp")) {
				$.extend(o, $self.data("searchProp"));
			}
			function showFilter($filter) {
				if(searchFeedback("beforeShow", $filter)) {
					$(themodalSelector).data("onClose",o.onClose);
					viewModal(themodalSelector,{
						gbox:gboxSelector,
						jqm:o.jqModal, 
						overlay: o.overlay,
						modal:o.modal, 
						overlayClass: o.overlayClass,
						toTop: o.toTop,
						onHide :  function(h) {
							savePositionOnHide.call($self, "searchProp", fid, h);
						}
					});
					searchFeedback("afterShow", $filter);
				}
			}
			if ( $(themodalSelector)[0] !== undefined ) {
				showFilter($("#fbox_"+p.idSel));
			} else {
				var fil = $("<div><div id='"+fid+"' class='searchFilter' style='overflow:auto'></div></div>").insertBefore(gviewSelector); 
				if(p.direction === "rtl") {
					fil.attr("dir","rtl");
				}
				var columns = $.extend([],p.colModel),
				bS = "<a id='"+fid+"_search' class='fm-button ui-state-default ui-corner-all fm-button-icon-right ui-reset'><span class='fm-button-icon " + mergeCssClasses(commonIconClass, o.findDialogIcon) + "'></span><span class='fm-button-text'>"+o.Find+"</span></a>",
				bC = "<a id='"+fid+"_reset' class='fm-button ui-state-default ui-corner-all fm-button-icon-left ui-search'><span class='fm-button-icon " + mergeCssClasses(commonIconClass, o.resetDialogIcon) + "'></span><span class='fm-button-text'>"+o.Reset+"</span></a>",
				bQ = "", tmpl="", colnm, found = false, bt, cmi=-1;
				if(o.showQuery) {
					bQ ="<a id='"+fid+"_query' class='fm-button ui-state-default ui-corner-all fm-button-icon-left'><span class='fm-button-icon " + mergeCssClasses(commonIconClass, o.queryDialogIcon) + "'></span><span class='fm-button-text'>Query</span></a>&#160;";
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

				bt = "<table class='EditTable' style='border:0px none;margin-top:5px' id='"+fid+"_2'><tbody><tr><td colspan='2'><hr class='ui-widget-content' style='margin:1px'/></td></tr><tr><td class='EditButton EditButton-" + p.direction + "'  style='float:"+ (p.direction === "rtl" ? "right" : "left") +";'>"+bC+tmpl+"</td><td class='EditButton EditButton-" + p.direction + "'>"+bQ+bS+"</td></tr></tbody></table>";
				fid = jqID(fid);
				o.gbox = "#gbox_"+fid;
				o.height = "auto";
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
					cops: p.customSortOperations,
					operands : o.operands,
					ajaxSelectOptions: p.ajaxSelectOptions,
					groupOps: o.groupOps,
					onChange : function() {
						if(this.p.showQuery) {
							$('.query',this).html(this.toUserFriendlyString());
						}
						fullBoolFeedback.call($t, o.afterChange, "jqGridFilterAfterChange", $(fid), o);
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
				searchFeedback("onInitialize", $(fid));
				if (o.layer) {
					createModal.call($t, ids, fil, o, gviewSelector, $(gboxSelector)[0], "#"+jqID(o.layer), {position: "relative"});
				} else {
					createModal.call($t, ids, fil, o, gviewSelector, $(gboxSelector)[0]);
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
					var sdata={}, res, filters, fl = $(fid), $inputs = fl.find(".input-elm");
					if ($inputs.filter(":focus")) {
						$inputs = $inputs.filter(":focus");
					}
					$inputs.change();
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
							} catch (ignore) { }
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
					if (fullBoolFeedback.call($t, o.onSearch, "jqGridFilterSearch", p.filters)) {
						$self.trigger("reloadGrid",[{page:1}]);
					}
					if(o.closeAfterSearch) {
						hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: o.onClose,removemodal:o.removemodal});
					}
					return false;
				});
				$(fid+"_reset").bind('click', function(){
					var sdata={}, fl1 = $(fid);
					p.search = false;
					p.resetsearch =  true;
					if(o.multipleSearch===false) {
						sdata[o.sField] = sdata[o.sValue] = sdata[o.sOper] = "";
					} else {
						sdata[o.sFilter] = "";
					}
					fl1[0].resetFilter();
					if(found) {
						$(".ui-template", fil).val("default");
					}
					$.extend(p.postData,sdata);
					if(fullBoolFeedback.call($t, o.onReset, "jqGridFilterReset")) {
						$self.trigger("reloadGrid",[{page:1}]);
					}
					if (o.closeAfterReset) {
						hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: o.onClose,removemodal: o.removemodal});
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
	editGridRow : function(rowid, oMuligrid){		// if one uses jQuery wrapper with multiple grids, then oMultiple specify the object with common options
		return this.each(function(){
			var $t = this, $self = $($t), p = $t.p;
			if (!$t.grid || p == null || !rowid) {return;}
			// make new copy of the options oMuligrid and use it for ONE specific grid.
			// p.formEditing can contains grid specific options
			// we will don't modify the input options oMuligrid
			var gID = p.id,
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
			},
			$self.jqGrid("getGridRes", "edit"),
			jgrid.edit,
			p.formEditing || {},
			oMuligrid || {});
			
			var frmgr = "FrmGrid_"+gID, frmgrID = frmgr, frmtborg = "TblGrid_"+gID, frmtb = "#"+jqID(frmtborg), frmtb2 = frmtb+"_2",
			ids = {themodal:'editmod'+gID,modalhead:'edithd'+gID,modalcontent:'editcnt'+gID, resizeAlso : frmgr},
			themodalSelector = "#"+jqID(ids.themodal), gboxSelector = p.gBox, propOrAttr = p.propOrAttr,
			maxCols = 1, maxRows=0,	postdata, diff, frmoper, commonIconClass = o.commonIconClass,
			editFeedback = function () {
				var args = $.makeArray(arguments);
				args.unshift("");
				args.unshift("AddEdit");
				args.unshift(o);
				return feedback.apply($t, args);
			};
			frmgr = "#" + jqID(frmgr);
			if (rowid === "new") {
				rowid = "_empty";
				frmoper = "add";
				o.caption=o.addCaption;
			} else {
				o.caption=o.editCaption;
				frmoper = "edit";
			}
			if(!o.recreateForm) {
				if( $self.data("formProp") ) {
					$.extend(o, $self.data("formProp"));
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
									if (e==="e1") {infoDialog.call($t,jgrid.errors.errcap,"function 'custom_value' "+jgrid.edit.msg.novalue,jgrid.edit.bClose);}
									else {infoDialog.call($t,jgrid.errors.errcap,e.message,jgrid.edit.bClose);}
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
					// REMARK: to be exactly one should call htmlEncode LATER and to use validation and unformatting of unencoded data!!
					if(p.autoencode) {postdata[this.name] = jgrid.htmlEncode(postdata[this.name]);}
					}
				});
				return true;
			}
			function createData(rowid,tb,maxcols){
				var cnt=0, retpos=[], ind=false,
				tdtmpl = "<td class='CaptionTD'></td><td class='DataTD'></td>", tmpl="", i; //*2
				for (i =1; i<=maxcols;i++) {
					tmpl += tdtmpl;
				}
				if(rowid !== '_empty') {
					ind = $self.jqGrid("getInd",rowid);
				}
				$(p.colModel).each( function(i) {
					var cm = this, nm = cm.name, hc, trdata, tmp, dc, elc, editable = cm.editable, disabled = false, readonly = false;
					if ($.isFunction(editable)) {
						editable = editable.call($t, {
							rowid: rowid,
							iCol: i,
							iRow: ind, // can be false for Add operation
							name: nm,
							cm: cm,
							mode: rowid === "_empty" ? "addForm" : "editForm"
						});
					}
					// hidden fields are included in the form
					if(cm.editrules && cm.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = cm.hidden === true || editable === "hidden" ? true : false;
					}
					dc = hc ? "style='display:none'" : "";
					switch (String(editable).toLowerCase()) {
						case "hidden":
							editable = true;
							break;
						case "disabled":
							editable = true;
							disabled = true;
							break;
						case "readonly":
							editable = true;
							readonly = true;
							break;
					}
					if (nm !== 'cb' && nm !== 'subgrid' && editable === true && nm !== 'rn') {
						if(ind === false) {
							tmp = "";
						} else {
							if(nm === p.ExpandColumn && p.treeGrid === true) {
								tmp = $("td[role='gridcell']:eq("+i+")",$t.rows[ind]).text();
							} else {
								try {
									tmp = $.unformat.call($t, $("td[role='gridcell']:eq("+i+")",$t.rows[ind]),{rowId:rowid, colModel:cm},i);
								} catch (_) {
									tmp = (cm.edittype && cm.edittype === "textarea") ? $("td[role='gridcell']:eq("+i+")",$t.rows[ind]).text() : $("td[role='gridcell']:eq("+i+")",$t.rows[ind]).html();
								}
								if(!tmp || tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
							}
						}
						var opt = $.extend({}, cm.editoptions || {} ,{id:nm,name:nm, rowId: rowid}),
						frmopt = $.extend({}, {elmprefix:'',elmsuffix:'',rowabove:false,rowcontent:''}, cm.formoptions || {}),
						rp = parseInt(frmopt.rowpos,10) || cnt+1,
						cp = parseInt((parseInt(frmopt.colpos,10) || 1)*2,10);
						if(rowid === "_empty" && opt.defaultValue ) {
							tmp = $.isFunction(opt.defaultValue) ? opt.defaultValue.call($t) : opt.defaultValue;
						}
						if(!cm.edittype) {cm.edittype = "text";}
						if(p.autoencode) {tmp = jgrid.htmlDecode(tmp);}
						elc = jgrid.createEl.call($t,cm.edittype,opt,tmp,false,$.extend({},jgrid.ajaxOptions,p.ajaxSelectOptions || {}));
						//if(tmp === "" && cm.edittype == "checkbox") {tmp = $(elc).attr("offval");}
						//if(tmp === "" && cm.edittype == "select") {tmp = $("option:eq(0)",elc).text();}
						if(o.checkOnSubmit || o.checkOnUpdate) {o._savedData[nm] = tmp;}
						$(elc).addClass("FormElement");
						if( $.inArray(cm.edittype, ['text','textarea','password','select']) > -1) {
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
						var $label = $("td:eq("+(cp-2)+")",trdata[0]),
							$data = $("td:eq("+(cp-1)+")",trdata[0]);
						$label.html(frmopt.label === undefined ? p.colNames[i]: frmopt.label);
						$data.html(frmopt.elmprefix).append(elc).append(frmopt.elmsuffix);
						if (disabled) {
							$label.addClass("ui-state-disabled");
							$data.addClass("ui-state-disabled");
							$(elc).prop("readonly", true);
							$(elc).prop("disabled", true);
						} else if (readonly) {
							$(elc).prop("readonly", true);
						}
						if(cm.edittype==='custom' && $.isFunction(opt.custom_value) ) {
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
					if(o.checkOnSubmit || o.checkOnUpdate) {o._savedData[gID+"_id"] = rowid;}
				}
				return retpos;
			}
			function fillData(rowid,fmid){
				var nm,cnt=0,tmp, fld,opt,vl,vlc;
				if(o.checkOnSubmit || o.checkOnUpdate) {o._savedData = {};o._savedData[gID+"_id"]=rowid;}
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
							if(o.checkOnSubmit===true || o.checkOnUpdate) {o._savedData[nm] = vl;}
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
						if(o.checkOnSubmit===true || o.checkOnUpdate) {o._savedData[nm] = tmp;}
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
									var selOpt = this, $selOpt = $(selOpt), optVal = $.trim($selOpt.val()), optText = $.trim($selOpt.text());
									if (!cm[i].editoptions.multiple && ($.trim(tmp) === optText || opv[0] === optText || opv[0] === optVal) ){
										selOpt.selected= true;
									} else if (cm[i].editoptions.multiple){
										if( $.inArray(optText, opv) > -1 || $.inArray(optVal, opv) > -1 ){
											selOpt.selected = true;
										}else{
											selOpt.selected = false;
										}
									} else {
										selOpt.selected = false;
									}
								});
								break;
							case "checkbox":
								tmp = String(tmp);
								if(cm[i].editoptions && cm[i].editoptions.value) {
									var cb = cm[i].editoptions.value.split(":");
									if(cb[0] === tmp) {
										$(nm,fmid)[propOrAttr]({"checked":true, "defaultChecked" : true});
									} else {
										$(nm,fmid)[propOrAttr]({"checked":false, "defaultChecked" : false});
									}
								} else {
									tmp = tmp.toLowerCase();
									if(tmp.search(/(false|f|0|no|n|off|undefined)/i)<0 && tmp!=="") {
										$(nm,fmid)[propOrAttr]("checked",true);
										$(nm,fmid)[propOrAttr]("defaultChecked",true); //ie
									} else {
										$(nm,fmid)[propOrAttr]("checked", false);
										$(nm,fmid)[propOrAttr]("defaultChecked", false); //ie
									}
								}
								break;
							case 'custom' :
								try {
									if(cm[i].editoptions && $.isFunction(cm[i].editoptions.custom_value)) {
										cm[i].editoptions.custom_value.call($t, $(nm,fmid),'set',tmp);
									} else {throw "e1";}
								} catch (e) {
									if (e==="e1") {infoDialog.call($t,jgrid.errors.errcap,"function 'custom_value' "+jgrid.edit.msg.nodefined,jgrid.edit.bClose);}
									else {infoDialog.call($t,jgrid.errors.errcap,e.message,jgrid.edit.bClose);}
								}
								break;
						}
						cnt++;
					}
				});
				if(cnt>0) {$("#id_g",frmtb).val(rowid);}
			}
			function setNullsOrUnformat() {
				var url = o.url || p.editurl;
				$.each(p.colModel, function(i, cm){
					var cmName = cm.name, value = postdata[cmName];
					if (cm.formatter && cm.formatter === "date" && (cm.formatoptions == null || cm.formatoptions.sendFormatted !== true)) {
						// TODO: call all other predefined formatters!!! Not only formatter: "date" have the problem.
						// Floating point separator for example
						postdata[cmName] = $.unformat.date.call($t, value, cm);
					}
					if (url !== "clientArray" && cm.editoptions && cm.editoptions.NullIfEmpty === true) {
						if(postdata.hasOwnProperty(cmName) && value === "") {
							postdata[cmName] = 'null';
						}
					}
				});
			}
			function postIt() {
				var copydata, ret=[true,"",""], onCS = {}, opers = p.prmNames, idname, oper, key, selr, i, url, itm;
				
				var retvals = $self.triggerHandler("jqGridAddEditBeforeCheckValues", [$(frmgr), frmoper]);
				if(retvals && typeof retvals === 'object') {postdata = retvals;}
				
				if($.isFunction(o.beforeCheckValues)) {
					retvals = o.beforeCheckValues.call($t, postdata,$(frmgr),frmoper);
					if(retvals && typeof retvals === 'object') {postdata = retvals;}
				}
				for( key in postdata ){
					if(postdata.hasOwnProperty(key)) {
						ret = jgrid.checkValues.call($t,postdata[key],key);
						if(ret[0] === false) {break;}
					}
				}
				setNullsOrUnformat();
				if(ret[0]) {
					onCS = $self.triggerHandler("jqGridAddEditClickSubmit", [o, postdata, frmoper]);
					if( onCS === undefined && $.isFunction( o.onclickSubmit)) { 
						onCS = o.onclickSubmit.call($t, o, postdata, frmoper) || {}; 
					}
					ret = $self.triggerHandler("jqGridAddEditBeforeSubmit", [postdata, $(frmgr), frmoper]);
					if(ret === undefined) {
						ret = [true,"",""];
					}
					if( ret[0] && $.isFunction(o.beforeSubmit))  {
						ret = o.beforeSubmit.call($t,postdata,$(frmgr), frmoper);
					}
				}

				if(ret[0] && !o.processing) {
					o.processing = true;
					$("#sData", frmtb2).addClass('ui-state-active');
					url = o.url || p.editurl;
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
					postdata = $.extend(postdata,o.editData,onCS);
					if(p.treeGrid === true)  {
						if(postdata[oper] === opers.addoper) {
							selr = p.selrow;
							var trParID = p.treeGridModel === 'adjacency' ? p.treeReader.parent_id_field : 'parent_id';
							postdata[trParID] = selr;
						}
						for(i in p.treeReader){
							if(p.treeReader.hasOwnProperty(i)) {
								itm = p.treeReader[i];
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
						type: o.mtype,
						//data: $.isFunction(o.serializeEditData) ? o.serializeEditData.call($t,postdata) :  postdata,
						data: jgrid.serializeFeedback.call($t,
							$.isFunction(o.serializeEditData) ? o.serializeEditData : p.serializeEditData,
							"jqGridAddEditSerializeEditData",
							postdata),						
						complete: function (jqXHR, textStatus) {
							$("#sData", frmtb2).removeClass('ui-state-active');
							postdata[idname] = p.idPrefix + $("#id_g",frmtb).val();
							if((jqXHR.status >= 300 && jqXHR.status !== 304) || (jqXHR.status === 0 && jqXHR.readyState === 4)) {
								ret[0] = false;
								ret[1] = $self.triggerHandler("jqGridAddEditErrorTextFormat", [jqXHR, frmoper]);
								if ($.isFunction(o.errorTextFormat)) {
									ret[1] = o.errorTextFormat.call($t, jqXHR, frmoper);
								} else {
									ret[1] = textStatus + " Status: '" + jqXHR.statusText + "'. Error code: " + jqXHR.status;
								}
							} else {
								// data is posted successful
								// execute aftersubmit with the returned data from server
								ret = $self.triggerHandler("jqGridAddEditAfterSubmit", [jqXHR, postdata, frmoper]);
								if(ret === undefined) {
									ret = [true,"",""];
								}
								if( ret[0] && $.isFunction(o.afterSubmit) ) {
									ret = o.afterSubmit.call($t, jqXHR,postdata, frmoper);
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
								//o.reloadAfterSubmit = o.reloadAfterSubmit && $t.o.datatype != "local";
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
									if(o.reloadAfterSubmit) {
										$self.trigger("reloadGrid");
									} else {
										if(p.treeGrid === true){
											$self.jqGrid("addChildNode",ret[2],selr,postdata );
										} else {
											$self.jqGrid("addRowData",ret[2],postdata,o.addedrow);
										}
									}
									if(o.closeAfterAdd) {
										if(p.treeGrid !== true){
											$self.jqGrid("setSelection",ret[2]);
										}
										hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});
									} else if (o.clearAfterAdd) {
										fillData("_empty",frmgr);
									}
								} else {
									// the action is update
									if(o.reloadAfterSubmit) {
										$self.trigger("reloadGrid");
										if( !o.closeAfterEdit ) {setTimeout(function(){$self.jqGrid("setSelection",postdata[idname]);},1000);}
									} else {
										if(p.treeGrid === true) {
											$self.jqGrid("setTreeRow", postdata[idname],postdata);
										} else {
											$self.jqGrid("setRowData", postdata[idname],postdata);
										}
									}
									if(o.closeAfterEdit) {hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});}
								}
								if($.isFunction(o.afterComplete)) {
									copydata = jqXHR;
									setTimeout(function(){
										$self.triggerHandler("jqGridAddEditAfterComplete", [copydata, postdata, $(frmgr), frmoper]);
										o.afterComplete.call($t, copydata, postdata, $(frmgr), frmoper);
										copydata=null;
									},500);
								}
								if(o.checkOnSubmit || o.checkOnUpdate) {
									$(frmgr).data("disabled",false);
									if(o._savedData[gID+"_id"] !== "_empty"){
										var key1;
										for(key1 in o._savedData) {
											if(o._savedData.hasOwnProperty(key1) && postdata[key1]) {
												o._savedData[key1] = postdata[key1];
											}
										}
									}
								}
							}
							o.processing=false;
							try{$(':input:visible',frmgr)[0].focus();} catch (ignore){}
						}
					}, jgrid.ajaxOptions, o.ajaxEditOptions );

					if (!ajaxOptions.url && !o.useDataProxy) {
						if ($.isFunction(p.dataProxy)) {
							o.useDataProxy = true;
						} else {
							ret[0]=false;ret[1] += " "+jgrid.errors.nourl;
						}
					}
					if (ret[0]) {
						if (o.useDataProxy) {
							var dpret = p.dataProxy.call($t, ajaxOptions, "set_"+gID); 
							if(dpret === undefined) {
								dpret = [true, ""];
							}
							if(dpret[0] === false ) {
								ret[0] = false;
								ret[1] = dpret[1] || "Error deleting the selected row!" ;
							} else {
								if(ajaxOptions.data.oper === opers.addoper && o.closeAfterAdd ) {
									hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});
								}
								if(ajaxOptions.data.oper === opers.editoper && o.closeAfterEdit ) {
									hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});
								}
							}
						} else {
							if(ajaxOptions.url === "clientArray") {
								o.reloadAfterSubmit = false;
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
				if(o.checkOnUpdate) {
					postdata = {};
					getFormData();
					diff = compareData(postdata,o._savedData);
					if(diff) {
						$(frmgr).data("disabled",true);
						$(".confirm",themodalSelector).show();
						stat = false;
					}
				}
				return stat;
			}
			function restoreInline() {
				var editingInfo = jgrid.detectRowEditing.call($t, rowid);
				if (editingInfo != null) {
					if (editingInfo.mode === "inlineEditing") {
						$self.jqGrid("restoreRow", rowid);
					} else {
						var savedRowInfo = editingInfo.savedRow, tr = $t.rows[savedRowInfo.id];
						$self.jqGrid("restoreCell", savedRowInfo.id, savedRowInfo.ic);
						// remove highlighting of the cell
						$(tr.cells[savedRowInfo.ic]).removeClass("edit-cell ui-state-highlight");
						$(tr).addClass("ui-state-highlight").attr({"aria-selected":"true", "tabindex" : "0"});
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

			var dh = isNaN(o.dataheight) ? o.dataheight : o.dataheight+"px",
			dw = isNaN(o.datawidth) ? o.datawidth : o.datawidth+"px",
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
			flr = $("<tr style='display:none' class='tinfo'><td class='topinfo' colspan='"+(maxCols*2)+"'>"+o.topinfo+"</td></tr>");
			flr[0].rp = 0;
			$(tbl).append(flr);
			if (!editFeedback("beforeInitData", frm, frmoper)) {return;}
			restoreInline();
			// set the id.
			// use carefull only to change here colproperties.
			// create data
			var rtlb = p.direction === "rtl" ? true :false,
			bp = rtlb ? "nData" : "pData",
			bn = rtlb ? "pData" : "nData";
			createData(rowid,tbl,maxCols);
			// buttons at footer
			var bP = "<a id='"+bp+"' class='fm-button ui-state-default ui-corner-left'><span class='" + mergeCssClasses(commonIconClass, o.prevIcon) + "'></span></a>",
			bN = "<a id='"+bn+"' class='fm-button ui-state-default ui-corner-right'><span class='" + mergeCssClasses(commonIconClass, o.nextIcon) + "'></span></a>",
			bS  ="<a id='sData' class='fm-button ui-state-default ui-corner-all'><span class='fm-button-text'>"+o.bSubmit+"</span></a>",
			bC  ="<a id='cData' class='fm-button ui-state-default ui-corner-all'><span class='fm-button-text'>"+o.bCancel+"</span></a>";
			var bt = "<table"+(jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "")+" class='EditTable' id='"+frmtborg+"_2'><tbody><tr><td colspan='2'><hr class='ui-widget-content' style='margin:1px'/></td></tr><tr id='Act_Buttons'><td class='navButton navButton-" + p.direction + "'>"+(rtlb ? bN+bP : bP+bN)+"</td><td class='EditButton EditButton-" + p.direction + "'>"+bS+"&#160;"+bC+"</td></tr>";
			bt += "<tr style='display:none' class='binfo'><td class='bottominfo' colspan='2'>"+o.bottominfo+"</td></tr>";
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
			createModal.call($t, ids,tms, o ,p.gView,$(gboxSelector)[0]);
			if(o.topinfo) {$(".tinfo",frmtb).show();}
			if(o.bottominfo) {$(".binfo",frmtb2).show();}
			tms = null;bt=null;
			$(themodalSelector).keydown( function( e ) {
				var wkey = e.target;
				if ($(frmgr).data("disabled")===true ) {return false;}//??
				if(o.savekey[0] === true && e.which === o.savekey[1]) { // save
					if(wkey.tagName !== "TEXTAREA") {
						$("#sData", frmtb2).trigger("click");
						return false;
					}
				}
				if(e.which === 27) {
					if(!checkUpdates()) {return false;}
					if(cle)	{hideModal(themodalSelector,{gb:o.gbox,jqm:o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});}
					return false;
				}
				if(o.navkeys[0]===true) {
					if($("#id_g",frmtb).val() === "_empty") {return true;}
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
			if(o.checkOnUpdate) {
				$("a.ui-jqdialog-titlebar-close span",themodalSelector).removeClass("jqmClose");
				$("a.ui-jqdialog-titlebar-close",themodalSelector).unbind("click")
				.click(function(){
					if(!checkUpdates()) {return false;}
					hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});
					return false;
				});
			}
			addFormIcon($("#sData",frmtb2), o.saveicon, commonIconClass);
			addFormIcon($("#cData",frmtb2), o.closeicon, commonIconClass);
			if(o.checkOnSubmit || o.checkOnUpdate) {
				bS  ="<a id='sNew' class='fm-button ui-state-default ui-corner-all' style='z-index:1002'>"+o.bYes+"</a>";
				bN  ="<a id='nNew' class='fm-button ui-state-default ui-corner-all' style='z-index:1002'>"+o.bNo+"</a>";
				bC  ="<a id='cNew' class='fm-button ui-state-default ui-corner-all' style='z-index:1002'>"+o.bExit+"</a>";
				var zI = o.zIndex  || 999;zI ++;
				$("<div class='"+ o.overlayClass+" jqgrid-overlay confirm' style='z-index:"+zI+";display:none;'>&#160;"+"</div><div class='confirm ui-widget-content ui-jqconfirm' style='z-index:"+(zI+1)+"'>"+o.saveData+"<br/><br/>"+bS+bN+bC+"</div>").insertAfter(frmgr);
				$("#sNew",themodalSelector).click(function(){
					// if the form will be hidden at the first usage and it will be shown at the next usage
					// then the execution context click handler and all other functions like postIt()
					// will contains the variables (like rowid, postdata and so on) from THE FIRST call
					// of editGridRow. One should be very careful in the code of postIt()
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
					// if the form will be hidden at the first usage and it will be shown at the next usage
					// then the execution context click handler and all other functions like postIt()
					// will contains the variables (like o) from THE FIRST call
					$(".confirm",themodalSelector).hide();
					$(frmgr).data("disabled",false);
					hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});
					return false;
				});
			}
			// here initform - only once
			editFeedback("onInitializeForm", $(frmgr), frmoper);
			if(rowid==="_empty" || !o.viewPagerButtons) {$("#pData,#nData",frmtb2).hide();} else {$("#pData,#nData",frmtb2).show();}
			editFeedback("beforeShowForm", $(frmgr), frmoper);
			$(themodalSelector).data("onClose",o.onClose);
			viewModal(themodalSelector,{
				gbox:gboxSelector,
				jqm:o.jqModal, 
				overlay: o.overlay,
				modal:o.modal, 
				overlayClass: o.overlayClass,
				onHide :  function(h) {
					savePositionOnHide.call($self, "formProp", frmgr, h);
				}
			});
			if(!closeovrl) {
				$("." + jqID(o.overlayClass)).click(function(){
					if(!checkUpdates()) {return false;}
					hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});
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
					diff = compareData(postdata,o._savedData);
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
				hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal,onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});
				return false;
			});
			$("#nData", frmtb2).click(function(){
				if(!checkUpdates()) {return false;}
				$("#FormError",frmtb).hide();
				var npos = getCurrPos();
				npos[0] = parseInt(npos[0],10);
				if(npos[0] !== -1 && npos[1][npos[0]+1]) {
					if (!editFeedback("onclickPgButtons", 'next', $(frmgr), npos[1][npos[0]])) {return false;}
					fillData(npos[1][npos[0]+1],frmgr);
					$self.jqGrid("setSelection",npos[1][npos[0]+1]);
					editFeedback("afterclickPgButtons", 'next', $(frmgr), npos[1][npos[0]+1]);
					updateNav(npos[0]+1,npos);
				}
				return false;
			});
			$("#pData", frmtb2).click(function(){
				if(!checkUpdates()) {return false;}
				$("#FormError",frmtb).hide();
				var ppos = getCurrPos();
				if(ppos[0] !== -1 && ppos[1][ppos[0]-1]) {
					if (!editFeedback("onclickPgButtons", 'prev', $(frmgr), ppos[1][ppos[0]])) {return false;}
					if ($("#"+jqID(ppos[1][ppos[0]-1])).hasClass('ui-state-disabled')) {return false;}
					fillData(ppos[1][ppos[0]-1],frmgr);
					$self.jqGrid("setSelection",ppos[1][ppos[0]-1]);
					editFeedback("afterclickPgButtons", 'prev', $(frmgr), ppos[1][ppos[0]-1]);
					updateNav(ppos[0]-1,ppos);
				}
				return false;
			});
			editFeedback("afterShowForm", $(frmgr), frmoper);
			var posInit = getCurrPos();
			updateNav(posInit[0],posInit);
		});
	},
	viewGridRow : function(rowid, oMuligrid){
		return this.each(function(){
			var $t = this, $self = $($t), p = $t.p;
			if (!$t.grid || p == null || !rowid) {return;}
			// make new copy of the options oMuligrid and use it for ONE specific grid.
			// p.formViewing can contains grid specific options
			// we will don't modify the input options oMuligrid
			var gID = p.id,
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
				navkeys: [false,38,40],
				onClose: null,
				beforeShowForm : null,
				beforeInitData : null,
				viewPagerButtons : true,
				recreateForm : false,
				removemodal: true,
				form: 'view'
			},
			$self.jqGrid("getGridRes", "view"),
			jgrid.view || {},
			p.formViewing || {},
			oMuligrid || {});

			var frmgr = "#ViewGrid_"+jqID(gID), frmtb = "#ViewTbl_" + jqID(gID), frmtb2 = frmtb+"_2",
			frmgrID = "ViewGrid_"+gID, frmtbID = "ViewTbl_"+gID, commonIconClass = o.commonIconClass,
			ids = {themodal:'viewmod'+gID,modalhead:'viewhd'+gID,modalcontent:'viewcnt'+gID, resizeAlso : frmgrID},
			themodalSelector = "#"+jqID(ids.themodal), gboxSelector = p.gBox,
			maxCols = 1, maxRows = 0,
			viewFeedback = function () {
				var args = $.makeArray(arguments);
				args.unshift("");
				args.unshift("View");
				args.unshift(o);
				return feedback.apply($t, args);
			};
			if(!o.recreateForm) {
				if( $self.data("viewProp") ) {
					$.extend(o, $self.data("viewProp"));
				}
			}
			function focusaref(){ //Sfari 3 issues
				if(o.closeOnEscape===true || o.navkeys[0]===true) {
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
					var cm = this;
					if(cm.editrules && cm.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = cm.hidden === true ? true : false;
					}
					if(!hc && cm.align==='right') {
						if(cm.formatter && $.inArray(cm.formatter,fmtnum) !== -1 ) {
							max1 = Math.max(max1,parseInt(cm.width,10));
						} else {
							max2 = Math.max(max2,parseInt(cm.width,10));
						}
					}
				});
				maxw  = max1 !==0 ? max1 : max2 !==0 ? max2 : 0;
				$(p.colModel).each( function(i) {
					var $td, cm = this;
					nm = cm.name;
					setme = false;
					// hidden fields are included in the form
					if(cm.editrules && cm.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = cm.hidden === true ? true : false;
					}
					dc = hc ? "style='display:none'" : "";
					viewfld = (typeof cm.viewable !== 'boolean') ? true : cm.viewable;
					if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn' && viewfld) {
						if(ind === false) {
							tmp = "";
						} else {
							$td = $("td:eq("+i+")",$t.rows[ind]);
							if(nm === p.ExpandColumn && p.treeGrid === true) {
								tmp = $td.text();
							} else {
								tmp = cm.autoResizable && $td.length > 0 && $($td[0].firstChild).hasClass(p.autoResizableWrapperClassName) ?
									$($td[0].firstChild).html() :
									$td.html();
							}
						}
						setme = cm.align === 'right' && maxw !==0 ? true : false;
						var frmopt = $.extend({},{rowabove:false,rowcontent:''}, cm.formoptions || {}),
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
					    var labelText = (frmopt.label === undefined ? p.colNames[i] : frmopt.label);
						$("td:eq("+(cp-2)+")",trdata[0]).html('<b>'+ (labelText || "&nbsp;")+'</b>');
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

			var dh = isNaN(o.dataheight) ? o.dataheight : o.dataheight+"px",
			dw = isNaN(o.datawidth) ? o.datawidth : o.datawidth+"px",
			frm = $("<form name='FormPost' id='"+frmgrID+"' class='FormGrid' style='width:"+dw+";overflow:auto;position:relative;height:"+dh+";'></form>"),
			tbl =$("<table id='"+frmtbID+"' class='EditTable' cellspacing='1' cellpadding='2' border='0' style='table-layout:fixed'><tbody></tbody></table>");
			$(p.colModel).each( function() {
				var fmto = this.formoptions;
				maxCols = Math.max(maxCols, fmto ? fmto.colpos || 0 : 0 );
				maxRows = Math.max(maxRows, fmto ? fmto.rowpos || 0 : 0 );
			});
			// set the id.
			frm.append(tbl);
			if (!viewFeedback("beforeInitData", frm)) {return;}
			createData(rowid, tbl, maxCols);
			var rtlb = p.direction === "rtl" ? true :false,
			bp = rtlb ? "nData" : "pData",
			bn = rtlb ? "pData" : "nData",
				// buttons at footer
			bP = "<a id='"+bp+"' class='fm-button ui-state-default ui-corner-left'><span class='fm-button-icon " + mergeCssClasses(commonIconClass, o.prevIcon) + "'></span></a>",
			bN = "<a id='"+bn+"' class='fm-button ui-state-default ui-corner-right'><span class='fm-button-icon " + mergeCssClasses(commonIconClass, o.nextIcon) + "'></span></a>",
			bC  ="<a id='cData' class='fm-button ui-state-default ui-corner-all'><span class='fm-button-text'>"+o.bClose+"</span></a>";
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
			var bt = $("<div></div>").append(frm).append("<table border='0' class='EditTable' id='"+frmtbID+"_2'><tbody><tr id='Act_Buttons'><td class='navButton navButton-" + p.direction + "' width='"+(o.labelswidth || "auto")+"'>"+(rtlb ? bN+bP : bP+bN)+"</td><td class='EditButton EditButton-" + p.direction + "'>"+bC+"</td></tr></tbody></table>");
			createModal.call($t,ids,bt,o,p.gView,$(p.gView)[0]);
			if(!o.viewPagerButtons) {$("#pData, #nData",frmtb2).hide();}
			bt = null;
			$(themodalSelector).keydown( function( e ) {
				if(e.which === 27) {
					if(o.closeOnEscape) {hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});}
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
			addFormIcon($("#cData",frmtb2), o.closeicon, commonIconClass);
			viewFeedback("beforeShowForm", $(frmgr));
			viewModal(themodalSelector,{
				gbox:gboxSelector,
				jqm:o.jqModal,
				overlay: o.overlay, 
				modal:o.modal,
				onHide :  function(h) {
					savePositionOnHide.call($self, "viewProp", frmgr, h);
				}
			});
			$(".fm-button:not(.ui-state-disabled)",frmtb2).hover(
				function(){$(this).addClass('ui-state-hover');},
				function(){$(this).removeClass('ui-state-hover');}
			);
			focusaref();
			$("#cData", frmtb2).click(function(){
				hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form});
				return false;
			});
			$("#nData", frmtb2).click(function(){
				$("#FormError",frmtb).hide();
				var npos = getCurrPos();
				npos[0] = parseInt(npos[0],10);
				if(npos[0] !== -1 && npos[1][npos[0]+1]) {
					if (!viewFeedback("onclickPgButtons", 'next', $(frmgr), npos[1][npos[0]])) {return false;}
					fillData(npos[1][npos[0]+1]);
					$self.jqGrid("setSelection",npos[1][npos[0]+1]);
					viewFeedback("afterclickPgButtons", 'next', $(frmgr), npos[1][npos[0]+1]);
					updateNav(npos[0]+1,npos);
				}
				focusaref();
				return false;
			});
			$("#pData", frmtb2).click(function(){
				$("#FormError",frmtb).hide();
				var ppos = getCurrPos();
				if(ppos[0] !== -1 && ppos[1][ppos[0]-1]) {
					if (!viewFeedback("onclickPgButtons", 'prev', $(frmgr), ppos[1][ppos[0]])) {return false;}
					fillData(ppos[1][ppos[0]-1]);
					$self.jqGrid("setSelection",ppos[1][ppos[0]-1]);
					viewFeedback("afterclickPgButtons", 'prev', $(frmgr), ppos[1][ppos[0]-1]);
					updateNav(ppos[0]-1,ppos);
				}
				focusaref();
				return false;
			});
			var posInit =getCurrPos();
			updateNav(posInit[0],posInit);
		});
	},
	delGridRow : function(rowids,oMuligrid) {
		return this.each(function(){
			var $t = this, p = $t.p, $self = $($t);
			if (!$t.grid || p == null || !rowids) {return;}
			// make new copy of the options oMuligrid and use it for ONE specific grid.
			// p.formDeleting can contains grid specific options
			// we will don't modify the input options oMuligrid
			var gID = p.id,
			o = $.extend(true, {
				top : 0,
				left: 0,
				width: 240,
				removemodal: true,
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
				onClose : null,
				ajaxDelOptions : {},
				processing : false,
				serializeDelData : null,
				useDataProxy : false
			},
			$self.jqGrid("getGridRes", "del"),
			jgrid.del || {},
			p.formDeleting || {},
			oMuligrid || {});

			var dtblID = "DelTbl_" + gID, dtbl = "#DelTbl_"+jqID(gID), postd, idname, opers, oper,
			ids = {themodal:'delmod'+gID,modalhead:'delhd'+gID,modalcontent:'delcnt'+gID, resizeAlso: dtblID},
		    themodalSelector = "#"+jqID(ids.themodal), gboxSelector = p.gBox, commonIconClass = o.commonIconClass,
			deleteFeedback = function () {
				var args = $.makeArray(arguments);
				args.unshift("");
				args.unshift("Delete");
				args.unshift(o);
				return feedback.apply($t, args);
			};

			if (!$.isArray(rowids)) { rowids = [String(rowids)]; }
			if ( $(themodalSelector)[0] !== undefined ) {
				if (!deleteFeedback("beforeInitData", $(dtbl))) {return;}
				$("#DelData>td",dtbl).text(rowids.join()).data("rowids", rowids);
				$("#DelError",dtbl).hide();
				if( o.processing === true) {
					o.processing=false;
					$("#dData",dtbl).removeClass('ui-state-active');
				}
				deleteFeedback("beforeShowForm", $(dtbl));
				viewModal(themodalSelector,{gbox:gboxSelector,jqm:o.jqModal,jqM: false, overlay: o.overlay, modal:o.modal});
				deleteFeedback("afterShowForm", $(dtbl));
			} else {
				var dh = isNaN(o.dataheight) ? o.dataheight : o.dataheight+"px",
				dw = isNaN(o.datawidth) ? o.datawidth : o.datawidth+"px",
				tbl = "<div id='"+dtblID+"' class='formdata' style='width:"+dw+";overflow:auto;position:relative;height:"+dh+";'>";
				tbl += "<table class='DelTable'><tbody>";
				// error data
				tbl += "<tr id='DelError' style='display:none'><td class='ui-state-error'></td></tr>";
				tbl += "<tr id='DelData' style='display:none'><td >"+rowids.join()+"</td></tr>";
				tbl += "<tr><td class=\"delmsg\" style=\"white-space:pre;\">"+o.msg+"</td></tr><tr><td >&#160;</td></tr>";
				// buttons at footer
				tbl += "</tbody></table></div>";
				var bS  = "<a id='dData' class='fm-button ui-state-default ui-corner-all'><span class='fm-button-text'>"+o.bSubmit+"</span></a>",
				bC  = "<a id='eData' class='fm-button ui-state-default ui-corner-all'><span class='fm-button-text'>"+o.bCancel+"</span></a>";
				tbl += "<table"+(jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "")+" class='EditTable' id='"+dtblID+"_2'><tbody><tr><td><hr class='ui-widget-content' style='margin:1px'/></td></tr><tr><td class='DelButton EditButton EditButton-" + p.direction + "'>"+bS+"&#160;"+bC+"</td></tr></tbody></table>";
				o.gbox = gboxSelector;
				createModal.call($t,ids,tbl,o,p.gView,$(p.gView)[0]);
				$("#DelData>td",dtbl).data("rowids", rowids);

				if (!deleteFeedback("beforeInitData", $(tbl))) {return;}
				$(".fm-button",dtbl+"_2").hover(
					function(){$(this).addClass('ui-state-hover');},
					function(){$(this).removeClass('ui-state-hover');}
				);
				addFormIcon($("#dData",dtbl+"_2"), o.delicon, commonIconClass);
				addFormIcon($("#eData",dtbl+"_2"), o.cancelicon, commonIconClass);
				$("#dData",dtbl+"_2").click(function(){
					var ret=[true,""], pk, $delData = $("#DelData>td",dtbl),
					postdata = $delData.text(), //the pair is name=val1,val2,...
					formRowIds = $delData.data("rowids"),
					cs = {};
					if( $.isFunction( o.onclickSubmit ) ) {cs = o.onclickSubmit.call($t,o, postdata) || {};}
					if( $.isFunction( o.beforeSubmit ) ) {ret = o.beforeSubmit.call($t,postdata);}
					if(ret[0] && !o.processing) {
						o.processing = true;
						opers = p.prmNames;
						postd = $.extend({},o.delData, cs);
						oper = opers.oper;
						postd[oper] = opers.deloper;
						idname = opers.id;
						postdata = formRowIds;
						if(!postdata.length) { return false; }
						for(pk in postdata) {
							if(postdata.hasOwnProperty(pk)) {
								postdata[pk] = jgrid.stripPref(p.idPrefix, postdata[pk]);
							}
						}
						postd[idname] = postdata.join();
						$(this).addClass('ui-state-active');
						var ajaxOptions = $.extend({
							url: o.url || p.editurl,
							type: o.mtype,
							data: $.isFunction(o.serializeDelData) ? o.serializeDelData.call($t,postd) : postd,
							complete: function (jqXHR, textStatus) {
								var i;
								$("#dData",dtbl+"_2").removeClass('ui-state-active');
								if((jqXHR.status >= 300 && jqXHR.status !== 304) || (jqXHR.status === 0 && jqXHR.readyState === 4)) {
									ret[0] = false;
									if ($.isFunction(o.errorTextFormat)) {
										ret[1] = o.errorTextFormat.call($t,jqXHR);
									} else {
										ret[1] = textStatus + " Status: '" + jqXHR.statusText + "'. Error code: " + jqXHR.status;
									}
								} else {
									// data is posted successful
									// execute aftersubmit with the returned data from server
									if( $.isFunction( o.afterSubmit ) ) {
										ret = o.afterSubmit.call($t,jqXHR,postd);
									}
								}
								if(ret[0] === false) {
									$("#DelError>td",dtbl).html(ret[1]);
									$("#DelError",dtbl).show();
								} else {
									if(o.reloadAfterSubmit && p.datatype !== "local") {
										$self.trigger("reloadGrid");
									} else {
										if(p.treeGrid===true){
												try {$self.jqGrid("delTreeNode",formRowIds[0]);} catch(ignore){}
										} else {
											for(i=0;i<formRowIds.length;i++) {
												$self.jqGrid("delRowData",formRowIds[i]);
											}
										}
									}
									setTimeout(function(){
										deleteFeedback("afterComplete", jqXHR, postdata, $(dtbl));
									}, 500);
								}
								o.processing=false;
								if(ret[0]) {hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: o.removemodal});}
							}
						}, jgrid.ajaxOptions, o.ajaxDelOptions);


						if (!ajaxOptions.url && !o.useDataProxy) {
							if ($.isFunction(p.dataProxy)) {
								o.useDataProxy = true;
							} else {
								ret[0]=false;ret[1] += " "+jgrid.errors.nourl;
							}
						}
						if (ret[0]) {
							if (o.useDataProxy) {
								var dpret = p.dataProxy.call($t, ajaxOptions, "del_"+gID); 
								if(dpret === undefined) {
									dpret = [true, ""];
								}
								if(dpret[0] === false ) {
									ret[0] = false;
									ret[1] = dpret[1] || "Error deleting the selected row!" ;
								} else {
									hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: o.removemodal});
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
					hideModal(themodalSelector,{gb:gboxSelector,jqm:o.jqModal, onClose: o.onClose, removemodal: o.removemodal});
					return false;
				});
				deleteFeedback("beforeShowForm", $(dtbl));
				viewModal(themodalSelector,{gbox:gboxSelector,jqm:o.jqModal, overlay: o.overlay, modal:o.modal});
				deleteFeedback("afterShowForm", $(dtbl));
			}
			if(o.closeOnEscape===true) {
				setTimeout(function(){$(".ui-jqdialog-titlebar-close","#"+jqID(ids.modalhead)).attr("tabindex","-1").focus();},0);
			}
		});
	},
	navGrid : function (elem, oMuligrid, pEdit,pAdd,pDel,pSearch, pView) {
		if (typeof elem === "object") {
			// the option pager are skipped
			pView = pSearch;
			pSearch = pDel;
			pDel = pAdd;
			pAdd = pEdit;
			pEdit = oMuligrid;
			oMuligrid = elem;
			elem = undefined;
		}
		pAdd = pAdd || {};
		pEdit = pEdit || {};
		pView = pView || {};
		pDel = pDel || {};
		pSearch = pSearch || {};
		return this.each(function() {
			var $t = this, p = $t.p, $self = $($t);
			if(!$t.grid || p == null || ($t.nav && $(elem).find(".navtable").length > 0)) {
				return; // error or the navigator bar already exists
			}
			// make new copy of the options oMuligrid and use it for ONE specific grid.
			// p.navOptions can contains grid specific options
			// we will don't modify the input options oMuligrid
			var gridId = p.id,
			o = $.extend({
				edit: true,
				add: true,
				del: true,
				search: true,
				refresh: true,
				refreshstate: 'firstpage',
				view: false,
				closeOnEscape : true,
				beforeRefresh : null,
				afterRefresh : null,
				cloneToTop : false,
				alertwidth : 200,
				alertheight : 'auto',
				alerttop: null,
				alertleft: null,
				alertzIndex : null,
				iconsOverText : false
			},
			$self.jqGrid("getGridRes", "nav"),
			jgrid.nav || {},
			p.navOptions || {},
			oMuligrid || {});
			// set default position depend of RTL/LTR direction of the grid
			o.position = o.position || (p.direction === "rtl" ? "right" : "left");

			var alertIDs = {themodal: 'alertmod_' + gridId, modalhead: 'alerthd_' + gridId,modalcontent: 'alertcnt_' + gridId},
			twd, tdw, gridIdEscaped = p.idSel, gboxSelector = p.gBox, commonIconClass = o.commonIconClass,
			viewModalAlert = function () {
				viewModal("#"+jqID(alertIDs.themodal),{gbox:gboxSelector,jqm:true});
				$("#jqg_alrt").focus();
			};
			if(!$t.grid) {
				return; // error
			}
			if (elem === undefined) {
				if (p.pager) {
					elem = p.pager;
					if (p.toppager) {
						o.cloneToTop = true; // add buttons to both pagers
					}
				} else if (p.toppager) {
					elem = p.toppager;
				}
			}

			if ($("#" + jqID(alertIDs.themodal))[0] === undefined) {
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
				createModal.call($t, alertIDs,
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
						zIndex: o.alertzIndex,
						removemodal: false
					},
					p.gView,
					$(gboxSelector)[0],
					false
				);
			}
			var clone = 1, i, tbd, navtbl, pgid, elemids,
			sep = "<div class='ui-pg-button ui-state-disabled'><span class='ui-separator'></span></div>",
			onHoverIn = function () {
				if (!$(this).hasClass('ui-state-disabled')) {
					$(this).addClass("ui-state-hover");
				}
			},
			onHoverOut = function () {
				$(this).removeClass("ui-state-hover");
			},
			onAdd = function(){
				if (!$(this).hasClass('ui-state-disabled')) {
					if ($.isFunction( o.addfunc )) {
						o.addfunc.call($t);
					} else {
						$self.jqGrid("editGridRow","new",pAdd);
					}
				}
				return false;
			},
			onEdit = function(){
				if (!$(this).hasClass('ui-state-disabled')) {
					var sr = p.selrow;
					if (sr) {
						if($.isFunction( o.editfunc ) ) {
							o.editfunc.call($t, sr);
						} else {
							$self.jqGrid("editGridRow",sr,pEdit);
						}
					} else {
						viewModalAlert();
					}
				}
				return false;
			},
			onView = function(){
				if (!$(this).hasClass('ui-state-disabled')) {
					var sr = p.selrow;
					if (sr) {
						if($.isFunction( o.viewfunc ) ) {
							o.viewfunc.call($t, sr);
						} else {
							$self.jqGrid("viewGridRow",sr,pView);
						}
					} else {
						viewModalAlert();
					}
				}
				return false;
			},
			onDel = function(){
				var dr;
				if (!$(this).hasClass('ui-state-disabled')) {
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
							$self.jqGrid("delGridRow",dr,pDel);
						}
					} else  {
						viewModalAlert();
					}
				}
				return false;
			},
			onSearch = function(){
				if (!$(this).hasClass('ui-state-disabled')) {
					if($.isFunction( o.searchfunc )) {
						o.searchfunc.call($t, pSearch);
					} else {
						$self.jqGrid("searchGrid",pSearch);
					}
				}
				return false;
			},
			onRefresh = function(){
				if (!$(this).hasClass('ui-state-disabled')) {
					if($.isFunction(o.beforeRefresh)) {o.beforeRefresh.call($t);}
					p.search = false;
					p.resetsearch =  true;
					try {
						if( o.refreshstate !== 'currentfilter') {
							p.postData.filters ="";
							try {
								$("#fbox_"+gridIdEscaped).jqFilter('resetFilter');
							} catch(ignore) {}
							if($.isFunction($t.clearToolbar)) {$t.clearToolbar(false);}
						}
					} catch (ignore) {}
					switch (o.refreshstate) {
						case 'firstpage':
							$self.trigger("reloadGrid", [$.extend({}, o.reloadGridOptions || {}, {page:1})]);
							break;
						case 'current':
						case 'currentfilter':
							$self.trigger("reloadGrid", [$.extend({}, o.reloadGridOptions || {}, {current:true})]);
							break;
					}
					if($.isFunction(o.afterRefresh)) {o.afterRefresh.call($t);}
				}
				return false;
			},
			stdButtonActivation = function (name, id, onClick, navtbl, elemids) {
				var $button = $("<div class='ui-pg-button ui-corner-all'></div>"),
					iconClass = o[name+"icon"], iconText = $.trim(o[name+"text"]);
				$button.append("<div class='ui-pg-div'><span class='" +
					(o.iconsOverText ?
						mergeCssClasses("ui-pg-button-icon-over-text", commonIconClass, iconClass) :
						mergeCssClasses(commonIconClass, iconClass)) +
					"'></span>" +
					(iconText ? "<span class='ui-pg-button-text"+(o.iconsOverText ? " ui-pg-button-icon-over-text" : "") +"'>"+iconText+"</span>" : "")+
					"</div>");
				$(navtbl).append($button);
				$button.attr({"title":o[name+"title"] || "",id : id || name + "_" + elemids})
					.click(onClick)
					.hover(onHoverIn, onHoverOut);
				return $button;
			};
			if(o.cloneToTop && p.toppager) {clone = 2;}
			for(i = 0; i<clone; i++) {
				navtbl = $("<div"+" class='ui-pg-table navtable' style='float:left;table-layout:auto;'></div>");
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
					stdButtonActivation("add", pAdd.id, onAdd, navtbl, elemids);
				}
				if (o.edit) {
					stdButtonActivation("edit", pEdit.id, onEdit, navtbl, elemids);
				}
				if (o.view) {
					stdButtonActivation("view", pView.id, onView, navtbl, elemids);
				}
				if (o.del) {
					stdButtonActivation("del", pDel.id, onDel, navtbl, elemids);
				}
				if(o.add || o.edit || o.del || o.view) {$(navtbl).append(sep);}
				if (o.search) {
					tbd = stdButtonActivation("search", pSearch.id, onSearch, navtbl, elemids);
					if (pSearch.showOnLoad && pSearch.showOnLoad === true) {
						$(tbd,navtbl).click();
					}
				}
				if (o.refresh) {
					stdButtonActivation("refresh", "", onRefresh, navtbl, elemids);
				}
				// TODO use setWidthOfPagerTdWithPager or remove at all and use div structure with wrapping
				tdw = $(".ui-jqgrid>.ui-jqgrid-view").css("font-size") || "11px";
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
				$t.nav = true;
			}
		});
	},
	navButtonAdd : function (elem, oMuligrid) {
		if (typeof elem === "object") {
			oMuligrid = elem;
			elem = undefined;
		}
		return this.each(function() {
			var $t = this, p = $t.p;
			if (!$t.grid)  {return;}
			var o = $.extend({
				caption : "newButton",
				title: '',
				onClickButton: null,
				position : "last",
				cursor : 'pointer',
				iconsOverText : false
			},
			$($t).jqGrid("getGridRes", "nav"),
			jgrid.nav || {},
			p.navOptions || {},
			oMuligrid || {});
			if (elem === undefined) {
				if (p.pager) {
					$($t).jqGrid("navButtonAdd", p.pager, o);
					if (p.toppager) {
						elem = p.toppager;
					} else {
						return;
					}
				} else if (p.toppager) {
					elem = p.toppager;
				}
			}
			if (typeof elem === "string" && elem.indexOf("#") !== 0) {elem = "#"+jqID(elem);}
			var findnav = $(".navtable",elem), commonIconClass = o.commonIconClass;
			if (findnav.length > 0) {
				if (o.id && findnav.find("#" + jqID(o.id)).length > 0)  {return;}
				var tbd = $("<div></div>");
				if (o.buttonicon.toString().toUpperCase() === "NONE") {
					$(tbd).addClass('ui-pg-button ui-corner-all').append("<div class='ui-pg-div'>"+
						(o.caption ? "<span class='ui-pg-button-text" + (o.iconsOverText ? " ui-pg-button-icon-over-text" : "") + "'>"+o.caption+"</span>" : "") +
						"</div>");
				} else {
					$(tbd).addClass('ui-pg-button ui-corner-all').append("<div class='ui-pg-div'>" +
						"<span class='" +
						(o.iconsOverText ?
							mergeCssClasses("ui-pg-button-icon-over-text", commonIconClass, o.buttonicon) :
							mergeCssClasses(commonIconClass, o.buttonicon)) +
						"'></span>"+
						(o.caption ? "<span class='ui-pg-button-text" + (o.iconsOverText ? " ui-pg-button-icon-over-text" : "") + "'>"+o.caption+"</span>" : "") +
						"</div>");
				}
				if (o.id) {$(tbd).attr("id",o.id);}
				if (o.position === 'first' && findnav.children("div.ui-pg-button").length > 0){
					findnav.children("div.ui-pg-button").filter(":first").before(tbd);
				} else {
					findnav.append(tbd);
				}
				$(tbd,findnav)
				.attr("title",o.title  || "")
				.click(function(e){
					if (!$(this).hasClass('ui-state-disabled')) {
						if ($.isFunction(o.onClickButton) ) {o.onClickButton.call($t,o,e);}
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
			if( typeof elem === "string" && elem.indexOf("#") !== 0) {elem = "#"+jqID(elem);}
			var findnav = $(".navtable",elem)[0];
			if(findnav.length > 0) {
				var sep = "<div class='ui-pg-button ui-state-disabled'><span class='"+p.sepclass+"'></span>"+p.sepcontent+"</div>";
				if (p.position === 'first') {
					if ($(">div.ui-pg-button",findnav).length === 0) {
						findnav.append(sep);
					} else {
						$(">div.ui-pg-button", findnav).filter(":first").before(sep);
					}
				} else {
					findnav.append(sep);
				}
			}
		});
	},
	GridToForm : function( rowid, formid ) {
		return this.each(function(){
			var $t = this, i, $field, iField, $fieldi;
			if (!$t.grid) {return;}
			var rowdata = $($t).jqGrid("getRowData",rowid), propOrAttr = $t.p.useProp;
			if (rowdata) {
				for(i in rowdata) {
					if(rowdata.hasOwnProperty(i)) {
						$field = $("[name="+jqID(i)+"]",formid);
						if ($field.is("input:radio") || $field.is("input:checkbox")) {
							for (iField = 0; iField < $field.length; iField++) {
								$fieldi = $($field[iField]);
								$fieldi[propOrAttr]("checked", $fieldi.val() === String(rowdata[i]));
							}
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
}(jQuery));
