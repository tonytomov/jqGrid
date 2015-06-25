/**
 * jqGrid extension for form editing Grid Data
 * Copyright (c) 2008-2014, Tony Tomov, tony@trirand.com, http://trirand.com/blog/
 * Copyright (c) 2014-2015, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
**/

/*jshint eqeqeq:false, eqnull:true, devel:true */
/*jslint browser: true, eqeq: true, plusplus: true, unparam: true, vars: true, nomen: true, continue: true, white: true, todo: true */
/*global xmlJsonClass, jQuery */
(function ($) {
	"use strict";
	var jgrid = $.jgrid, feedback = jgrid.feedback, fullBoolFeedback = jgrid.fullBoolFeedback, jqID = jgrid.jqID,
		hideModal = jgrid.hideModal, viewModal = jgrid.viewModal, createModal = jgrid.createModal, infoDialog = jgrid.info_dialog,
		mergeCssClasses = jgrid.mergeCssClasses, hasOneFromClasses = jgrid.hasOneFromClasses, $j = $.fn.jqGrid,
		builderFmButon = jgrid.builderFmButon,
		getCssStyleOrFloat = function ($elem, styleName) {
			var v = $elem[0].style[styleName];
			return v.indexOf("px") >= 0 ? parseFloat(v) : v;
		},
		savePositionOnHide = function (propName, frmgr, h) {
			var $w = h.w, $form = $(frmgr), toTop = h.c.toTop, offsetGbox, offset, top, left;
			if (toTop) {
				offsetGbox = this.closest(".ui-jqgrid").offset();
				offset = $w.offset();
				top = offset.top - offsetGbox.top;
				left = offset.left - offsetGbox.left;
			} else {
				// we use below .style.height and .style.width to save correctly "auto" and "100%" values
				// the "px" suffix will be saved too, but it's not a problem 
				top = getCssStyleOrFloat($w, "top");
				left = getCssStyleOrFloat($w, "left");
			}
			this.data(propName, {
				top: top,                 //parseFloat($w.css("top")),
				left: left,               //parseFloat($w.css("left")),
				width: getCssStyleOrFloat($w, "width"),             //$(h.w).width(),
				height: getCssStyleOrFloat($w, "height"),           //$(h.w).height(),
				dataheight: getCssStyleOrFloat($form, "height") || "auto",
				datawidth: getCssStyleOrFloat($form, "width") || "auto"
			});
			$w.remove();
			if (h.o) { h.o.remove(); }
		},
		addFormIcon = function ($fmButton, iconInfos, commonIcon) {
			var iconspan;
			if (iconInfos[0] === true) {
				iconspan = "<span class='" + mergeCssClasses("fm-button-icon", commonIcon, iconInfos[2]) + "'></span>";
				if (iconInfos[1] === "right") {
					$fmButton.addClass("fm-button-icon-right").append(iconspan);
				} else {
					$fmButton.addClass("fm-button-icon-left").prepend(iconspan);
				}
			}
		},
		getGuiStyles = function (path, jqClasses) {
			return jgrid.mergeCssClasses(jgrid.getRes(jgrid.guiStyles[this.p.guiStyle], path), jqClasses || "");
		},
		getGuiStateStyles = function (path) {
			return getGuiStyles.call(this, "states." + path);
		},
		isEmptyString = function (htmlStr) {
			return htmlStr === "&nbsp;" || htmlStr === "&#160;" || (htmlStr.length === 1 && htmlStr.charCodeAt(0) === 160);
		};
	jgrid.extend({
		searchGrid: function (oMuligrid) {
			// if one uses jQuery wrapper with multiple grids, then oMuligrid specify the object with common options
			return this.each(function () {
				var $t = this, $self = $($t), p = $t.p;
				if (!$t.grid || p == null) { return; }
				// make new copy of the options and use it for ONE specific grid.
				// p.searching can contains grid specific options
				// we will don't modify the input options oMuligrid
				var o = $.extend(true,
					{
						recreateFilter: false,
						drag: true,
						sField: "searchField",
						sValue: "searchString",
						sOper: "searchOper",
						sFilter: "filters",
						loadDefaults: true, // this options activates loading of default filters from grid's postData for Multipe Search only.
						beforeShowSearch: null,
						afterShowSearch: null,
						onInitializeSearch: null,
						afterRedraw: null,
						afterChange: null,
						closeAfterSearch: false,
						closeAfterReset: false,
						closeOnEscape: false,
						searchOnEnter: false,
						multipleSearch: false,
						multipleGroup: false,
						//cloneSearchRowOnAdd: true,
						// we can't use srort names like resetIcon because of conflict with existing "x" of filterToolbar
						top: 0,
						left: 0,
						removemodal: true,
						//jqModal : true,
						//modal: false,
						resize: true,
						width: 450,
						height: "auto",
						dataheight: "auto",
						showQuery: false,
						errorcheck: true,
						sopt: null,
						stringResult: undefined,
						onClose: null,
						onSearch: null,
						onReset: null,
						//toTop : false,
						//overlay : 30,
						columns: [],
						tmplNames: null,
						tmplFilters: null,
						tmplLabel: " Template: ",
						showOnLoad: false,
						layer: null,
						operands: { "eq": "=", "ne": "<>", "lt": "<", "le": "<=", "gt": ">", "ge": ">=", "bw": "LIKE", "bn": "NOT LIKE", "in": "IN", "ni": "NOT IN", "ew": "LIKE", "en": "NOT LIKE", "cn": "LIKE", "nc": "NOT LIKE", "nu": "IS NULL", "nn": "IS NOT NULL" }
					},
					$j.getGridRes.call($self, "search"),
					jgrid.search || {},
					p.searching || {},
					oMuligrid || {});

				var fid = "fbox_" + p.id, commonIconClass = o.commonIconClass,
					ids = { themodal: "searchmod" + fid, modalhead: "searchhd" + fid, modalcontent: "searchcnt" + fid, resizeAlso: fid },
					themodalSelector = "#" + jqID(ids.themodal), gboxSelector = p.gBox, gviewSelector = p.gView,
					defaultFilters = p.postData[o.sFilter],
					searchFeedback = function () {
						var args = $.makeArray(arguments);
						args.unshift("Search");
						args.unshift("Filter");
						args.unshift(o);
						return feedback.apply($t, args);
					};
				if (typeof defaultFilters === "string") {
					defaultFilters = jgrid.parse(defaultFilters);
				}
				if (o.recreateFilter === true) {
					$(themodalSelector).remove();
				} else if ($self.data("searchProp")) {
					$.extend(o, $self.data("searchProp"));
				}
				function showFilter($filter) {
					if (searchFeedback("beforeShow", $filter)) {
						$(themodalSelector).data("onClose", o.onClose);
						viewModal(themodalSelector, {
							gbox: gboxSelector,
							jqm: o.jqModal,
							overlay: o.overlay,
							modal: o.modal,
							overlayClass: o.overlayClass,
							toTop: o.toTop,
							onHide: function (h) {
								savePositionOnHide.call($self, "searchProp", fid, h);
							}
						});
						searchFeedback("afterShow", $filter);
					}
				}
				if ($(themodalSelector)[0] !== undefined) {
					showFilter($("#fbox_" + p.idSel));
				} else {
					var fil = $("<div><div id='" + fid + "' class='searchFilter' style='overflow:auto'></div></div>").insertBefore(gviewSelector);
					if (p.direction === "rtl") {
						fil.attr("dir", "rtl");
					}
					var bQ = "", tmpl = "", colnm, found = false, bt, cmi = -1, columns = $.extend([], p.colModel),
						bS = builderFmButon.call($t, fid + "_search", o.Find, mergeCssClasses(commonIconClass, o.findDialogIcon), "right"),
						bC = builderFmButon.call($t, fid + "_reset", o.Reset, mergeCssClasses(commonIconClass, o.resetDialogIcon), "left");
					if (o.showQuery) {
						bQ = builderFmButon.call($t, fid + "_query", "Query", mergeCssClasses(commonIconClass, o.queryDialogIcon), "left") +
							"&#160;";
					}
					if (!o.columns.length) {
						$.each(columns, function (i, n) {
							if (!n.label) {
								n.label = p.colNames[i];
							}
							// find first searchable column and set it if no default filter
							if (!found) {
								var searchable = (n.search === undefined) ? true : n.search,
									hidden = (n.hidden === true),
									ignoreHiding = (n.searchoptions && n.searchoptions.searchhidden === true);
								if ((ignoreHiding && searchable) || (searchable && !hidden)) {
									found = true;
									colnm = n.index || n.name;
									cmi = i;
								}
							}
						});
					} else {
						columns = o.columns;
						cmi = 0;
						colnm = columns[0].index || columns[0].name;
					}
					// old behaviour
					if ((!defaultFilters && colnm) || o.multipleSearch === false) {
						var cmop = "eq";
						if (cmi >= 0 && columns[cmi].searchoptions && columns[cmi].searchoptions.sopt) {
							cmop = columns[cmi].searchoptions.sopt[0];
						} else if (o.sopt && o.sopt.length) {
							cmop = o.sopt[0];
						}
						defaultFilters = { groupOp: "AND", rules: [{ field: colnm, op: cmop, data: "" }] };
					}
					found = false;
					if (o.tmplNames && o.tmplNames.length) {
						found = true;
						tmpl = o.tmplLabel;
						tmpl += "<select class='ui-template'>";
						tmpl += "<option value='default'>Default</option>";
						$.each(o.tmplNames, function (i, n) {
							tmpl += "<option value='" + i + "'>" + n + "</option>";
						});
						tmpl += "</select>";
					}

					bt = "<table class='EditTable' style='border:0px none;margin-top:5px' id='" + fid + "_2'><tbody><tr><td colspan='2'><hr class='" +
						getGuiStyles.call($t, "dialog.hr") + "' style='margin:1px'/></td></tr><tr><td class='EditButton EditButton-" + p.direction + "'  style='float:" + (p.direction === "rtl" ? "right" : "left") + ";'>" + bC + tmpl + "</td><td class='EditButton EditButton-" + p.direction + "'>" + bQ + bS + "</td></tr></tbody></table>";
					fid = jqID(fid);
					o.gbox = "#gbox_" + fid;
					o.height = "auto";
					fid = "#" + fid;
					$(fid).jqFilter({
						columns: columns,
						filter: o.loadDefaults ? defaultFilters : null,
						showQuery: o.showQuery,
						errorcheck: o.errorcheck,
						sopt: o.sopt,
						groupButton: o.multipleGroup,
						ruleButtons: o.multipleSearch,
						afterRedraw: o.afterRedraw,
						ops: o.odata,
						cops: p.customSortOperations,
						operands: o.operands,
						ajaxSelectOptions: p.ajaxSelectOptions,
						groupOps: o.groupOps,
						onChange: function () {
							if (this.p.showQuery) {
								$(".query", this).html(this.toUserFriendlyString());
							}
							fullBoolFeedback.call($t, o.afterChange, "jqGridFilterAfterChange", $(fid), o);
						},
						direction: p.direction,
						id: p.id
					});
					fil.append(bt);
					if (found && o.tmplFilters && o.tmplFilters.length) {
						$(".ui-template", fil).bind("change", function () {
							var curtempl = $(this).val();
							if (curtempl === "default") {
								$(fid).jqFilter("addFilter", defaultFilters);
							} else {
								$(fid).jqFilter("addFilter", o.tmplFilters[parseInt(curtempl, 10)]);
							}
							return false;
						});
					}
					if (o.multipleGroup === true) { o.multipleSearch = true; }
					searchFeedback("onInitialize", $(fid));
					if (o.layer) {
						createModal.call($t, ids, fil, o, gviewSelector, $(gboxSelector)[0], "#" + jqID(o.layer), { position: "relative" });
					} else {
						createModal.call($t, ids, fil, o, gviewSelector, $(gboxSelector)[0]);
					}
					if (o.searchOnEnter || o.closeOnEscape) {
						$(themodalSelector).keydown(function (e) {
							var $target = $(e.target);
							if (o.searchOnEnter && e.which === 13 && // 13 === $.ui.keyCode.ENTER
									!$target.hasClass("add-group") && !$target.hasClass("add-rule") &&
									!$target.hasClass("delete-group") && !$target.hasClass("delete-rule") &&
									(!$target.hasClass("fm-button") || !$target.is("[id$=_query]"))) {
								$(fid + "_search").click();
								return false;
							}
							if (o.closeOnEscape && e.which === 27) { // 27 === $.ui.keyCode.ESCAPE
								$("#" + jqID(ids.modalhead)).find(".ui-jqdialog-titlebar-close").click();
								return false;
							}
						});
					}
					if (bQ) {
						$(fid + "_query").bind("click", function () {
							$(".queryresult", fil).toggle();
							return false;
						});
					}
					if (o.stringResult === undefined) {
						// to provide backward compatibility, inferring stringResult value from multipleSearch
						o.stringResult = o.multipleSearch;
					}
					$(fid + "_search").bind("click", function () {
						var sdata = {}, res, filters, fl = $(fid), $inputs = fl.find(".input-elm");
						if ($inputs.filter(":focus")) {
							$inputs = $inputs.filter(":focus");
						}
						$inputs.change();
						filters = fl.jqFilter("filterData");
						if (o.errorcheck) {
							fl[0].hideError();
							if (!o.showQuery) { fl.jqFilter("toSQLString"); }
							if (fl[0].p.error) {
								fl[0].showError();
								return false;
							}
						}

						if (o.stringResult || p.datatype === "local") {
							try {
								// xmlJsonClass or JSON.stringify
								res = xmlJsonClass.toJson(filters, "", "", false);
							} catch (e) {
								try {
									res = JSON.stringify(filters);
								} catch (ignore) { }
							}
							if (typeof res === "string") {
								sdata[o.sFilter] = res;
								$.each([o.sField, o.sValue, o.sOper], function () { sdata[this] = ""; });
							}
						} else {
							if (o.multipleSearch) {
								sdata[o.sFilter] = filters;
								$.each([o.sField, o.sValue, o.sOper], function () { sdata[this] = ""; });
							} else {
								sdata[o.sField] = filters.rules[0].field;
								sdata[o.sValue] = filters.rules[0].data;
								sdata[o.sOper] = filters.rules[0].op;
								sdata[o.sFilter] = "";
							}
						}
						p.search = true;
						$.extend(p.postData, sdata);
						if (fullBoolFeedback.call($t, o.onSearch, "jqGridFilterSearch", p.filters)) {
							$self.trigger("reloadGrid", [$.extend({ page: 1 }, o.reloadGridSearchOptions || {})]);
						}
						if (o.closeAfterSearch) {
							hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal });
						}
						return false;
					});
					$(fid + "_reset").bind("click", function () {
						var sdata = {}, fl1 = $(fid);
						p.search = false;
						p.resetsearch = true;
						if (o.multipleSearch === false) {
							sdata[o.sField] = sdata[o.sValue] = sdata[o.sOper] = "";
						} else {
							sdata[o.sFilter] = "";
						}
						fl1[0].resetFilter();
						if (found) {
							$(".ui-template", fil).val("default");
						}
						$.extend(p.postData, sdata);
						if (fullBoolFeedback.call($t, o.onReset, "jqGridFilterReset")) {
							$self.trigger("reloadGrid", [$.extend({ page: 1 }, o.reloadGridResetOptions || {})]);
						}
						if (o.closeAfterReset) {
							hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal });
						}
						return false;
					});
					showFilter($(fid));
					var hoverClasses = getGuiStateStyles.call($t, "hover");
					// !!! The next row will not work if "states.disabled" is defined using more as one CSS class
					$(".fm-button:not(." + getGuiStateStyles.call($t, "disabled").split(" ").join(".") + ")", fil).hover(
						function () { $(this).addClass(hoverClasses); },
						function () { $(this).removeClass(hoverClasses); }
					);
				}
			});
		},
		editGridRow: function (rowid, oMuligrid) {    // if one uses jQuery wrapper with multiple grids, then oMultiple specify the object with common options
			return this.each(function () {
				var $t = this, $self = $($t), p = $t.p;
				if (!$t.grid || p == null || !rowid) { return; }
				// make new copy of the options oMuligrid and use it for ONE specific grid.
				// p.formEditing can contains grid specific options
				// we will don't modify the input options oMuligrid
				var gridId = p.id, getGridRes = $j.getGridRes, setSelection = $j.setSelection,
					o = $.extend(true,
						{
							top: 0,
							left: 0,
							width: 300,
							datawidth: "auto",
							height: "auto",
							dataheight: "auto",
							//modal: false,
							//toTop : false,
							//overlay : 30,
							drag: true,
							resize: true,
							url: null,
							mtype: "POST",
							clearAfterAdd: true,
							closeAfterEdit: false,
							reloadAfterSubmit: true,
							onInitializeForm: null,
							beforeInitData: null,
							beforeShowForm: null,
							afterShowForm: null,
							beforeSubmit: null,
							afterSubmit: null,
							onclickSubmit: null,
							afterComplete: null,
							onclickPgButtons: null,
							afterclickPgButtons: null,
							editData: {},
							recreateForm: false,
							//jqModal : true,
							closeOnEscape: false,
							addedrow: "first",
							topinfo: "",
							bottominfo: "",
							savekey: [false, 13],
							navkeys: [false, 38, 40],
							checkOnSubmit: false,
							checkOnUpdate: false,
							_savedData: {},
							processing: false,
							onClose: null,
							ajaxEditOptions: {},
							serializeEditData: null,
							viewPagerButtons: true,
							overlayClass: "ui-widget-overlay",
							removemodal: true,
							form: "edit"
						},
						getGridRes.call($self, "edit"),
						jgrid.edit,
						p.formEditing || {},
						oMuligrid || {});

				var frmgr = "FrmGrid_" + gridId, frmgrId = frmgr, frmtborg = "TblGrid_" + gridId, frmtb = "#" + jqID(frmtborg), frmtb2 = frmtb + "_2",
					ids = { themodal: "editmod" + gridId, modalhead: "edithd" + gridId, modalcontent: "editcnt" + gridId, resizeAlso: frmgr },
					themodalSelector = "#" + jqID(ids.themodal), gboxSelector = p.gBox, propOrAttr = p.propOrAttr, colModel = p.colModel, iColByName = p.iColByName,
					maxCols = 1, maxRows = 0, postdata, diff, frmoper, commonIconClass = o.commonIconClass,
					errcap = getGridRes.call($self, "errors.errcap"),
					editFeedback = function () {
						var args = $.makeArray(arguments);
						args.unshift("");
						args.unshift("AddEdit");
						args.unshift(o);
						return feedback.apply($t, args);
					},
					hoverClasses = getGuiStateStyles.call($t, "hover"),
					disabledClass = getGuiStateStyles.call($t, "disabled"),
					highlightClass = getGuiStateStyles.call($t, "select"),
					activeClass = getGuiStateStyles.call($t, "active"),
					errorClass = getGuiStateStyles.call($t, "error");
				frmgr = "#" + jqID(frmgr);
				if (rowid === "new") {
					rowid = "_empty";
					frmoper = "add";
					o.caption = o.addCaption;
				} else {
					o.caption = o.editCaption;
					frmoper = "edit";
				}
				if (!o.recreateForm) {
					var formProp = $self.data("formProp");
					if (formProp) {
						formProp.top = Math.max(formProp.top, 0);
						formProp.left = Math.max(formProp.left, 0);
						$.extend(o, formProp);
					}
				}
				var closeovrl = true;
				if (o.checkOnUpdate && (o.jqModal === true || o.jqModal === undefined) && !o.modal) {
					closeovrl = false;
				}
				function getFormData() {
					$(frmtb + " > tbody > tr > td .FormElement").each(function () {
						var $celm = $(".customelement", this), nm = this.name, cm, iCol, editoptions, formatoptions, newformat;
						if ($celm.length) {
							nm = $celm.attr("name");
							iCol = iColByName[nm];
							if (iCol !== undefined) {
								cm = colModel[iCol];
								editoptions = cm.editoptions || {};
								if ($.isFunction(editoptions.custom_value)) {
									try {
										postdata[nm] = editoptions.custom_value.call($t, $("#" + jqID(nm), frmtb), "get");
										if (postdata[nm] === undefined) { throw "e1"; }
									} catch (e) {
										if (e === "e1") {
											infoDialog.call($t, errcap, "function 'custom_value' " + o.msg.novalue, o.bClose);
										} else {
											infoDialog.call($t, errcap, e.message, o.bClose);
										}
									}
									return true;
								}
							}
						} else {
							switch ($(this)[0].type) {
								case "checkbox":
									postdata[nm] = $(this).is(":checked") ? $(this).val() : $(this).data("offval");
									break;
								case "select-one":
									postdata[nm] = $("option:selected", this).val();
									break;
								case "select-multiple":
									postdata[nm] = $(this).val();
									postdata[nm] = postdata[nm] ? postdata[nm].join(",") : "";
									var selectedText = [];
									$("option:selected", this).each(
										function (i, selected) {
											selectedText[i] = $(selected).text();
										}
									);
									break;
								case "password":
								case "text":
								case "textarea":
								case "button":
									postdata[nm] = $(this).val();
									break;
								case "date":
									postdata[nm] = $(this).val();
									if (String(postdata[nm]).split("-").length === 3) {
										iCol = iColByName[nm];
										if (iCol !== undefined) {
											cm = colModel[iCol];
											formatoptions = cm.formatoptions || {};
											newformat = formatoptions.newformat || getGridRes.call($self, "formatter.date.newformat");
											postdata[nm] = jgrid.parseDate.call($self[0], "Y-m-d", postdata[nm], newformat);
										}
									}
									break;
							}
							// REMARK: to be exactly one should call htmlEncode LATER and to use validation and unformatting of unencoded data!!
							if (p.autoencode) { postdata[nm] = jgrid.htmlEncode(postdata[nm]); }
						}
					});
					return true;
				}
				function createData(rowid, tb, maxcols) {
					var cnt = 0, retpos = [], ind = false,
						tdtmpl = "<td class='CaptionTD'>&#160;</td><td class='DataTD'>&#160;</td>", tmpl = "", i; //*2
					for (i = 1; i <= maxcols; i++) {
						tmpl += tdtmpl;
					}
					if (rowid !== "_empty") {
						ind = $j.getInd.call($self, rowid);
					}
					$(colModel).each(function (i) {
						var cm = this, nm = cm.name, $td, hc, trdata, tmp, dc, elc, editable = cm.editable, disabled = false, readonly = false,
							mode = rowid === "_empty" ? "addForm" : "editForm";
						if ($.isFunction(editable)) {
							editable = editable.call($t, {
								rowid: rowid,
								iCol: i,
								iRow: ind, // can be false for Add operation
								cmName: nm,
								cm: cm,
								mode: mode
							});
						}
						// hidden fields are included in the form
						if (cm.editrules && cm.editrules.edithidden === true) {
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
						if (nm !== "cb" && nm !== "subgrid" && editable === true && nm !== "rn") {
							if (ind === false) {
								tmp = "";
							} else {
								$td = $($t.rows[ind].cells[i]); // $("td[role=gridcell]:eq(" + i + ")", $t.rows[ind])
								try {
									tmp = $.unformat.call($t, $td, { rowId: rowid, colModel: cm }, i);
								} catch (_) {
									tmp = (cm.edittype && cm.edittype === "textarea") ? $td.text() : $td.html();
								}
								if (isEmptyString(tmp)) { tmp = ""; }
							}
							var opt = $.extend({}, cm.editoptions || {}, { id: nm, name: nm, rowId: rowid, mode: mode }),
								frmopt = $.extend({}, { elmprefix: "", elmsuffix: "", rowabove: false, rowcontent: "" }, cm.formoptions || {}),
								rp = parseInt(frmopt.rowpos, 10) || cnt + 1,
								cp = parseInt((parseInt(frmopt.colpos, 10) || 1) * 2, 10);
							if (rowid === "_empty" && opt.defaultValue) {
								tmp = $.isFunction(opt.defaultValue) ? opt.defaultValue.call($t) : opt.defaultValue;
							}
							if (!cm.edittype) { cm.edittype = "text"; }
							if (p.autoencode) { tmp = jgrid.htmlDecode(tmp); }
							elc = jgrid.createEl.call($t, cm.edittype, opt, tmp, false, $.extend({}, jgrid.ajaxOptions, p.ajaxSelectOptions || {}));
							//if(tmp === "" && cm.edittype == "checkbox") {tmp = $(elc).data("offval");}
							//if(tmp === "" && cm.edittype == "select") {tmp = $("option:eq(0)",elc).text();}
							if (o.checkOnSubmit || o.checkOnUpdate) { o._savedData[nm] = tmp; }
							$(elc).addClass("FormElement");
							if ($.inArray(cm.edittype, ["text", "textarea", "password", "select"]) > -1) {
								$(elc).addClass(getGuiStyles.call($t, "dialog.dataField"));
							}
							trdata = $(tb).find("tr[data-rowpos=" + rp + "]");
							if (frmopt.rowabove) {
								var newdata = $("<tr><td class='contentinfo' colspan='" + (maxcols * 2) + "'>" + frmopt.rowcontent + "</td></tr>");
								$(tb).append(newdata);
								newdata[0].rp = rp;
							}
							if (trdata.length === 0) {
								trdata = $("<tr " + dc + " data-rowpos='" + rp + "'></tr>").addClass("FormData").attr("id", "tr_" + nm);
								$(trdata).append(tmpl);
								$(tb).append(trdata);
								trdata[0].rp = rp;
							}
							var $label = $("td:eq(" + (cp - 2) + ")", trdata[0]),
								$data = $("td:eq(" + (cp - 1) + ")", trdata[0]);
							$label.html(frmopt.label === undefined ? p.colNames[i] : frmopt.label || "&#160;");
							$data[isEmptyString($data.html()) ? "html" : "append"](frmopt.elmprefix).append(elc).append(frmopt.elmsuffix);
							if (disabled) {
								$label.addClass(disabledClass);
								$data.addClass(disabledClass);
								$(elc).prop("readonly", true);
								$(elc).prop("disabled", true);
							} else if (readonly) {
								$(elc).prop("readonly", true);
							}
							if (cm.edittype === "custom" && $.isFunction(opt.custom_value)) {
								opt.custom_value.call($t, $("#" + jqID(nm), frmgr), "set", tmp);
							}
							jgrid.bindEv.call($t, elc, opt);
							retpos[cnt] = i;
							cnt++;
						}
					});
					if (cnt > 0) {
						var idrow = $("<tr class='FormData' style='display:none'><td class='CaptionTD'>&#160;</td><td colspan='" + (maxcols * 2 - 1) + "' class='DataTD'><input class='FormElement' id='id_g' type='text' name='" + gridId + "_id' value='" + rowid + "'/></td></tr>");
						idrow[0].rp = cnt + 999;
						$(tb).append(idrow);
						if (o.checkOnSubmit || o.checkOnUpdate) { o._savedData[gridId + "_id"] = rowid; }
					}
					return retpos;
				}
				function fillData(rowid, fmid) {
					var nm, cnt = 0, tmp, fld, opt, vl, vlc;
					if (o.checkOnSubmit || o.checkOnUpdate) { o._savedData = {}; o._savedData[gridId + "_id"] = rowid; }
					var cm = p.colModel;
					if (rowid === "_empty") {
						$(cm).each(function () {
							nm = this.name;
							opt = $.extend({}, this.editoptions || {});
							fld = $("#" + jqID(nm), fmid);
							if (fld && fld.length && fld[0] !== null) {
								vl = "";
								if (this.edittype === "custom" && $.isFunction(opt.custom_value)) {
									opt.custom_value.call($t, fld, "set", vl);
								} else if (opt.defaultValue) {
									vl = $.isFunction(opt.defaultValue) ? opt.defaultValue.call($t) : opt.defaultValue;
									if (fld[0].type === "checkbox") {
										vlc = vl.toLowerCase();
										if (vlc.search(/(false|f|0|no|n|off|undefined)/i) < 0 && vlc !== "") {
											fld[0].checked = true;
											fld[0].defaultChecked = true;
											fld[0].value = vl;
										} else {
											fld[0].checked = false;
											fld[0].defaultChecked = false;
										}
									} else { fld.val(vl); }
								} else {
									if (fld[0].type === "checkbox") {
										fld[0].checked = false;
										fld[0].defaultChecked = false;
										vl = $(fld).data("offval");
									} else if (fld[0].type && fld[0].type.substr(0, 6) === "select") {
										fld[0].selectedIndex = 0;
									} else {
										fld.val(vl);
									}
								}
								if (o.checkOnSubmit === true || o.checkOnUpdate) { o._savedData[nm] = vl; }
							}
						});
						$("#id_g", fmid).val(rowid);
						return;
					}
					var tre = $j.getInd.call($self, rowid, true);
					if (!tre) { return; }
					//$("td[role=gridcell]", tre)
					$(tre.cells).filter("td[role=gridcell]").each(function (i) {
						nm = cm[i].name;
						// hidden fields are included in the form
						if (nm !== "cb" && nm !== "subgrid" && nm !== "rn" && cm[i].editable === true) {
							try {
								tmp = $.unformat.call($t, $(this), { rowId: rowid, colModel: cm[i] }, i);
							} catch (_) {
								tmp = cm[i].edittype === "textarea" ? $(this).text() : $(this).html();
							}
							if (p.autoencode) { tmp = jgrid.htmlDecode(tmp); }
							if (o.checkOnSubmit === true || o.checkOnUpdate) { o._savedData[nm] = tmp; }
							nm = "#" + jqID(nm);
							switch (cm[i].edittype) {
								case "password":
								case "text":
								case "button":
								case "image":
								case "textarea":
									if (isEmptyString(tmp)) { tmp = ""; }
									$(nm, fmid).val(tmp);
									break;
								case "select":
									var opv = tmp.split(",");
									opv = $.map(opv, function (n) { return $.trim(n); });
									$(nm + " option", fmid).each(function () {
										var selOpt = this, $selOpt = $(selOpt), optVal = $.trim($selOpt.val()), optText = $.trim($selOpt.text());
										if (!cm[i].editoptions.multiple && ($.trim(tmp) === optText || opv[0] === optText || opv[0] === optVal)) {
											selOpt.selected = true;
										} else if (cm[i].editoptions.multiple) {
											if ($.inArray(optText, opv) > -1 || $.inArray(optVal, opv) > -1) {
												selOpt.selected = true;
											} else {
												selOpt.selected = false;
											}
										} else {
											selOpt.selected = false;
										}
									});
									break;
								case "checkbox":
									tmp = String(tmp);
									if (cm[i].editoptions && cm[i].editoptions.value) {
										var cb = cm[i].editoptions.value.split(":");
										if (cb[0] === tmp) {
											$(nm, fmid)[propOrAttr]({ "checked": true, "defaultChecked": true });
										} else {
											$(nm, fmid)[propOrAttr]({ "checked": false, "defaultChecked": false });
										}
									} else {
										tmp = tmp.toLowerCase();
										if (tmp.search(/(false|f|0|no|n|off|undefined)/i) < 0 && tmp !== "") {
											$(nm, fmid)[propOrAttr]("checked", true);
											$(nm, fmid)[propOrAttr]("defaultChecked", true); //ie
										} else {
											$(nm, fmid)[propOrAttr]("checked", false);
											$(nm, fmid)[propOrAttr]("defaultChecked", false); //ie
										}
									}
									break;
								case "custom":
									try {
										if (cm[i].editoptions && $.isFunction(cm[i].editoptions.custom_value)) {
											cm[i].editoptions.custom_value.call($t, $(nm, fmid), "set", tmp);
										} else { throw "e1"; }
									} catch (e) {
										if (e === "e1") {
											infoDialog.call($t, errcap, "function 'custom_value' " + o.msg.nodefined, o.bClose);
										} else {
											infoDialog.call($t, errcap, e.message, o.bClose);
										}
									}
									break;
							}
							cnt++;
						}
					});
					if (cnt > 0) { $("#id_g", frmtb).val(rowid); }
				}
				function setNullsOrUnformat() {
					var url = o.url || p.editurl;
					$.each(colModel, function (i, cm) {
						var cmName = cm.name, value = postdata[cmName];
						if (cm.formatter === "date" && (cm.formatoptions == null || cm.formatoptions.sendFormatted !== true)) {
							// TODO: call all other predefined formatters!!! Not only formatter: "date" have the problem.
							// Floating point separator for example
							postdata[cmName] = $.unformat.date.call($t, value, cm);
						}
						if (url !== "clientArray" && cm.editoptions && cm.editoptions.NullIfEmpty === true) {
							if (postdata.hasOwnProperty(cmName) && value === "") {
								postdata[cmName] = "null";
							}
						}
					});
				}
				function postIt() {
					var ret = [true, "", ""], onClickSubmitResult = {}, opers = p.prmNames, idname, oper, key, selr, i, url, itm;

					var retvals = $self.triggerHandler("jqGridAddEditBeforeCheckValues", [$(frmgr), frmoper]);
					if (retvals && typeof retvals === "object") { postdata = retvals; }

					if ($.isFunction(o.beforeCheckValues)) {
						retvals = o.beforeCheckValues.call($t, postdata, $(frmgr), frmoper);
						if (retvals && typeof retvals === "object") { postdata = retvals; }
					}
					for (key in postdata) {
						if (postdata.hasOwnProperty(key)) {
							ret = jgrid.checkValues.call($t, postdata[key], key);
							if (ret[0] === false) { break; }
						}
					}
					setNullsOrUnformat();
					if (ret[0]) {
						onClickSubmitResult = $self.triggerHandler("jqGridAddEditClickSubmit", [o, postdata, frmoper]);
						if (onClickSubmitResult === undefined && $.isFunction(o.onclickSubmit)) {
							onClickSubmitResult = o.onclickSubmit.call($t, o, postdata, frmoper) || {};
						}
						ret = $self.triggerHandler("jqGridAddEditBeforeSubmit", [postdata, $(frmgr), frmoper]);
						if (ret === undefined) {
							ret = [true, "", ""];
						}
						if (ret[0] && $.isFunction(o.beforeSubmit)) {
							ret = o.beforeSubmit.call($t, postdata, $(frmgr), frmoper);
						}
					}

					if (ret[0] && !o.processing) {
						o.processing = true;
						$("#sData", frmtb2).addClass(activeClass);
						url = o.url || p.editurl;
						oper = opers.oper;
						idname = url === "clientArray" && p.keyName !== false ? p.keyName : opers.id;
						// we add to pos data array the action - the name is oper
						postdata[oper] = ($.trim(postdata[gridId + "_id"]) === "_empty") ? opers.addoper : opers.editoper;
						if (postdata[oper] !== opers.addoper) {
							postdata[idname] = postdata[gridId + "_id"];
						} else {
							// check to see if we have allredy this field in the form and if yes lieve it
							if (postdata[idname] === undefined) { postdata[idname] = postdata[gridId + "_id"]; }
						}
						delete postdata[gridId + "_id"];
						postdata = $.extend(postdata, o.editData, onClickSubmitResult);
						if (p.treeGrid === true) {
							if (postdata[oper] === opers.addoper) {
								selr = p.selrow;
								var parentIdField = p.treeGridModel === "adjacency" ? p.treeReader.parent_id_field : "parent_id";
								postdata[parentIdField] = selr;
							}
							for (i in p.treeReader) {
								if (p.treeReader.hasOwnProperty(i)) {
									itm = p.treeReader[i];
									if (postdata.hasOwnProperty(itm)) {
										if (postdata[oper] === opers.addoper && i === "parent_id_field") { continue; }
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
								$("#sData", frmtb2).removeClass(activeClass);
								postdata[idname] = p.idPrefix + $("#id_g", frmtb).val();
								if ((jqXHR.status >= 300 && jqXHR.status !== 304) || (jqXHR.status === 0 && jqXHR.readyState === 4)) {
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
									if (ret === undefined) {
										ret = [true, "", ""];
									}
									if (ret[0] && $.isFunction(o.afterSubmit)) {
										ret = o.afterSubmit.call($t, jqXHR, postdata, frmoper);
									}
								}
								if (ret[0] === false) {
									$("#FormError>td", frmtb).html(ret[1]);
									$("#FormError", frmtb).show();
								} else {
									if (p.autoencode) {
										$.each(postdata, function (n, v) {
											postdata[n] = jgrid.htmlDecode(v);
										});
									}
									//o.reloadAfterSubmit = o.reloadAfterSubmit && $t.o.datatype != "local";
									// the action is add
									var reloadGridOptions = [$.extend({}, o.reloadGridOptions || {})];
									if (postdata[oper] === opers.addoper) {
										//id processing
										// user not set the id ret[2]
										if (!ret[2]) { ret[2] = jgrid.randId(); }
										if (postdata[idname] == null || postdata[idname] === "_empty" || postdata[oper] === opers.addoper) {
											postdata[idname] = ret[2];
										} else {
											ret[2] = postdata[idname];
										}
										if (o.reloadAfterSubmit) {
											$self.trigger("reloadGrid", reloadGridOptions);
										} else {
											if (p.treeGrid === true) {
												$j.addChildNode.call($self, ret[2], selr, postdata);
											} else {
												$j.addRowData.call($self, ret[2], postdata, o.addedrow);
											}
										}
										if (o.closeAfterAdd) {
											if (p.treeGrid !== true) {
												setSelection.call($self, ret[2]);
											}
											hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form });
										} else if (o.clearAfterAdd) {
											fillData("_empty", frmgr);
										}
									} else {
										// the action is update
										if (o.reloadAfterSubmit) {
											$self.trigger("reloadGrid", reloadGridOptions);
											if (!o.closeAfterEdit) { setTimeout(function () { setSelection.call($self, postdata[idname]); }, 1000); }
										} else {
											if (p.treeGrid === true) {
												$j.setTreeRow.call($self, postdata[idname], postdata);
											} else {
												$j.setRowData.call($self, postdata[idname], postdata);
											}
										}
										if (o.closeAfterEdit) { hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form }); }
									}
									if ($.isFunction(o.afterComplete)) {
										var copydata = jqXHR;
										setTimeout(function () {
											$self.triggerHandler("jqGridAddEditAfterComplete", [copydata, postdata, $(frmgr), frmoper]);
											o.afterComplete.call($t, copydata, postdata, $(frmgr), frmoper);
											copydata = null;
										}, 50);
									}
									if (o.checkOnSubmit || o.checkOnUpdate) {
										$(frmgr).data("disabled", false);
										if (o._savedData[gridId + "_id"] !== "_empty") {
											var key1;
											for (key1 in o._savedData) {
												if (o._savedData.hasOwnProperty(key1) && postdata[key1]) {
													o._savedData[key1] = postdata[key1];
												}
											}
										}
									}
								}
								o.processing = false;
								try { $(":input:visible", frmgr)[0].focus(); } catch (ignore) { }
							}
						}, jgrid.ajaxOptions, o.ajaxEditOptions);

						if (!ajaxOptions.url && !o.useDataProxy) {
							if ($.isFunction(p.dataProxy)) {
								o.useDataProxy = true;
							} else {
								ret[0] = false;
								ret[1] += " " + jgrid.errors.nourl;
							}
						}
						if (ret[0]) {
							if (o.useDataProxy) {
								var dpret = p.dataProxy.call($t, ajaxOptions, "set_" + gridId);
								if (dpret === undefined) {
									dpret = [true, ""];
								}
								if (dpret[0] === false) {
									ret[0] = false;
									ret[1] = dpret[1] || "Error deleting the selected row!";
								} else {
									if (ajaxOptions.data.oper === opers.addoper && o.closeAfterAdd) {
										hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form });
									}
									if (ajaxOptions.data.oper === opers.editoper && o.closeAfterEdit) {
										hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form });
									}
								}
							} else {
								if (ajaxOptions.url === "clientArray") {
									o.reloadAfterSubmit = false;
									postdata = ajaxOptions.data;
									ajaxOptions.complete({ status: 200, statusText: "" }, "");
								} else {
									$.ajax(ajaxOptions);
								}
							}
						}
					}
					if (ret[0] === false) {
						$("#FormError>td", frmtb).html(ret[1]);
						$("#FormError", frmtb).show();
						// return;
					}
				}
				function compareData(nObj, oObj) {
					var ret = false, key;
					for (key in nObj) {
						if (nObj.hasOwnProperty(key) && String(nObj[key]) !== String(oObj[key])) {
							ret = true;
							break;
						}
					}
					return ret;
				}
				function checkUpdates() {
					var stat = true;
					$("#FormError", frmtb).hide();
					if (o.checkOnUpdate) {
						postdata = {};
						getFormData();
						diff = compareData(postdata, o._savedData);
						if (diff) {
							$(frmgr).data("disabled", true);
							$(".confirm", themodalSelector).show();
							stat = false;
						}
					}
					return stat;
				}
				function restoreInline() {
					var editingInfo = jgrid.detectRowEditing.call($t, rowid);
					if (editingInfo != null) {
						if (editingInfo.mode === "inlineEditing") {
							$j.restoreRow.call($self, rowid);
						} else {
							var savedRowInfo = editingInfo.savedRow, tr = $t.rows[savedRowInfo.id];
							$j.restoreCell.call($self, savedRowInfo.id, savedRowInfo.ic);
							// remove highlighting of the cell
							$(tr.cells[savedRowInfo.ic]).removeClass("edit-cell " + highlightClass);
							$(tr).addClass(highlightClass).attr({ "aria-selected": "true", "tabindex": "0" });
						}
					}
				}
				function updateNav(cr, posarr) {
					var totr = posarr[1].length - 1;
					if (cr === 0) {
						$("#pData", frmtb2).addClass(disabledClass);
					} else if (posarr[1][cr - 1] !== undefined && hasOneFromClasses($("#" + jqID(posarr[1][cr - 1])), disabledClass)) {
						$("#pData", frmtb2).addClass(disabledClass);
					} else {
						$("#pData", frmtb2).removeClass(disabledClass);
					}

					if (cr === totr) {
						$("#nData", frmtb2).addClass(disabledClass);
					} else if (posarr[1][cr + 1] !== undefined && hasOneFromClasses($("#" + jqID(posarr[1][cr + 1])), disabledClass)) {
						$("#nData", frmtb2).addClass(disabledClass);
					} else {
						$("#nData", frmtb2).removeClass(disabledClass);
					}
				}
				function getCurrPos() {
					var rowsInGrid = $j.getDataIDs.call($self),
						selrow = $("#id_g", frmtb).val(),
						pos = $.inArray(selrow, rowsInGrid);
					return [pos, rowsInGrid];
				}

				var dh = isNaN(o.dataheight) ? o.dataheight : o.dataheight + "px",
					dw = isNaN(o.datawidth) ? o.datawidth : o.datawidth + "px",
					frm = $("<form name='FormPost' id='" + frmgrId + "' class='FormGrid' onSubmit='return false;' style='width:" + dw + ";overflow:auto;position:relative;height:" + dh + ";'></form>").data("disabled", false),
					tbl = $("<table id='" + frmtborg + "' class='EditTable'" + (jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "") + "><tbody></tbody></table>");
				$(colModel).each(function () {
					var fmto = this.formoptions;
					maxCols = Math.max(maxCols, fmto ? fmto.colpos || 0 : 0);
					maxRows = Math.max(maxRows, fmto ? fmto.rowpos || 0 : 0);
				});
				$(frm).append(tbl);
				var flr = $("<tr id='FormError' style='display:none'><td class='" + errorClass + "' colspan='" + (maxCols * 2) + "'>&#160;</td></tr>");
				flr[0].rp = 0;
				$(tbl).append(flr);
				//topinfo
				flr = $("<tr style='display:none' class='tinfo'><td class='topinfo' colspan='" + (maxCols * 2) + "'>" + (o.topinfo || "&#160;") + "</td></tr>");
				flr[0].rp = 0;
				$(tbl).append(flr);
				if (!editFeedback("beforeInitData", frm, frmoper)) { return; }
				restoreInline();
				// set the id.
				// use carefull only to change here colproperties.
				// create data
				var rtlb = p.direction === "rtl" ? true : false,
					bp = rtlb ? "nData" : "pData",
					bn = rtlb ? "pData" : "nData";
				createData(rowid, tbl, maxCols);
				// buttons at footer
				var bP = builderFmButon.call($t, bp, "", mergeCssClasses(commonIconClass, o.prevIcon), "", "left"),
					bN = builderFmButon.call($t, bn, "", mergeCssClasses(commonIconClass, o.nextIcon), "", "right"),
					bS = builderFmButon.call($t, "sData", o.bSubmit),
					bC = builderFmButon.call($t, "cData", o.bCancel),
					bt = "<table" + (jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "") + " class='EditTable' id='" + frmtborg + "_2'><tbody><tr><td colspan='2'><hr class='" +
					getGuiStyles.call($t, "dialog.hr") + "' style='margin:1px'/></td></tr><tr id='Act_Buttons'><td class='navButton navButton-" + p.direction + "'>" + (rtlb ? bN + bP : bP + bN) + "</td><td class='EditButton EditButton-" + p.direction + "'>" + bS + "&#160;" + bC + "</td></tr>";
				bt += "<tr style='display:none' class='binfo'><td class='bottominfo' colspan='2'>" + (o.bottominfo || "&#160;") + "</td></tr>";
				bt += "</tbody></table>";
				if (maxRows > 0) {
					var sd = [];
					$.each($(tbl)[0].rows, function (i, r) {
						sd[i] = r;
					});
					sd.sort(function (a, b) {
						if (a.rp > b.rp) { return 1; }
						if (a.rp < b.rp) { return -1; }
						return 0;
					});
					$.each(sd, function (index, row) {
						$("tbody", tbl).append(row);
					});
				}
				o.gbox = gboxSelector;
				var cle = false;
				if (o.closeOnEscape === true) {
					o.closeOnEscape = false;
					cle = true;
				}
				var tms = $("<div></div>").append(frm).append(bt);
				createModal.call($t, ids, tms, o, p.gView, $(gboxSelector)[0]);
				// TODO: remove the call of jgrid.bindEv and probably call of opt.custom_value from createData
				// and place the calls here AFTER the form are placed on the HTML page
				if (o.topinfo) { $(".tinfo", frmtb).show(); }
				if (o.bottominfo) { $(".binfo", frmtb2).show(); }
				tms = null;
				bt = null;
				$(themodalSelector).keydown(function (e) {
					var wTagName = (e.target.tagName || "").toUpperCase(), $focused, idFocused;
					if ($(frmgr).data("disabled") === true) { return false; }//??
					if (e.which === 13) {
						if (wTagName !== "TEXTAREA") {
							$focused = $(frmtb2).find(":focus");
							idFocused = $focused.attr("id");
							if ($focused.length > 0 && $.inArray(idFocused, ["pData", "nData", "cData"]) >= 0) {
								$focused.trigger("click");
								return false;
							}
							if (o.savekey[0] === true && o.savekey[1] === 13) {
								$("#sData", frmtb2).trigger("click");
								return false;
							}
						}
					}
					if (o.savekey[0] === true && e.which === o.savekey[1]) { // save
						if (wTagName !== "TEXTAREA") {
							$("#sData", frmtb2).trigger("click");
							return false;
						}
					}
					if (e.which === 27) {
						if (!checkUpdates()) { return false; }
						if (cle) { hideModal(themodalSelector, { gb: o.gbox, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form }); }
						return false;
					}
					if (o.navkeys[0] === true) {
						if ($("#id_g", frmtb).val() === "_empty") { return true; }
						if (e.which === o.navkeys[1]) { //up
							$("#pData", frmtb2).trigger("click");
							return false;
						}
						if (e.which === o.navkeys[2]) { //down
							$("#nData", frmtb2).trigger("click");
							return false;
						}
					}
				});
				if (o.checkOnUpdate) {
					$("a.ui-jqdialog-titlebar-close span", themodalSelector).removeClass("jqmClose");
					$("a.ui-jqdialog-titlebar-close", themodalSelector).unbind("click")
						.click(function () {
							if (!checkUpdates()) {
								return false;
							}
							hideModal(themodalSelector, {
								gb: gboxSelector,
								jqm: o.jqModal,
								onClose: o.onClose,
								removemodal: o.removemodal,
								formprop: !o.recreateForm,
								form: o.form
							});
							return false;
						});
				}
				addFormIcon($("#sData", frmtb2), o.saveicon, commonIconClass);
				addFormIcon($("#cData", frmtb2), o.closeicon, commonIconClass);
				if (o.checkOnSubmit || o.checkOnUpdate) {
					bS = builderFmButon.call($t, "sNew", o.bYes);
					bN = builderFmButon.call($t, "nNew", o.bNo);
					bC = builderFmButon.call($t, "cNew", o.bExit);
					var zI = o.zIndex || 999;
					zI++;
					$("<div class='" + o.overlayClass + " jqgrid-overlay confirm' style='z-index:" + zI + ";display:none;'>&#160;</div><div class='" + getGuiStyles.call($t, "dialog.content", "confirm ui-jqconfirm") + "' style='z-index:" + (zI + 1) + "'>" + o.saveData + "<br/><br/>" + bS + bN + bC + "</div>").insertAfter(frmgr);
					$("#sNew", themodalSelector).click(function () {
						// if the form will be hidden at the first usage and it will be shown at the next usage
						// then the execution context click handler and all other functions like postIt()
						// will contains the variables (like rowid, postdata and so on) from THE FIRST call
						// of editGridRow. One should be very careful in the code of postIt()
						postIt();
						$(frmgr).data("disabled", false);
						$(".confirm", themodalSelector).hide();
						return false;
					});
					$("#nNew", themodalSelector).click(function () {
						$(".confirm", themodalSelector).hide();
						$(frmgr).data("disabled", false);
						setTimeout(function () { $(":input:visible", frmgr)[0].focus(); }, 0);
						return false;
					});
					$("#cNew", themodalSelector).click(function () {
						// if the form will be hidden at the first usage and it will be shown at the next usage
						// then the execution context click handler and all other functions like postIt()
						// will contains the variables (like o) from THE FIRST call
						$(".confirm", themodalSelector).hide();
						$(frmgr).data("disabled", false);
						hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form });
						return false;
					});
				}
				// here initform - only once
				editFeedback("onInitializeForm", $(frmgr), frmoper);
				if (rowid === "_empty" || !o.viewPagerButtons) {
					$("#pData,#nData", frmtb2).hide();
				} else {
					$("#pData,#nData", frmtb2).show();
				}
				editFeedback("beforeShowForm", $(frmgr), frmoper);
				$(themodalSelector).data("onClose", o.onClose);
				viewModal(themodalSelector, {
					gbox: gboxSelector,
					jqm: o.jqModal,
					overlay: o.overlay,
					modal: o.modal,
					overlayClass: o.overlayClass,
					toTop: o.toTop,
					onHide: function (h) {
						savePositionOnHide.call($self, "formProp", frmgr, h);
					}
				});
				if (!closeovrl) {
					$("." + jqID(o.overlayClass)).click(function () {
						if (!checkUpdates()) { return false; }
						hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form });
						return false;
					});
				}
				$(".fm-button", themodalSelector).hover(
					function () { $(this).addClass(hoverClasses); },
					function () { $(this).removeClass(hoverClasses); }
				);
				$("#sData", frmtb2).click(function () {
					postdata = {};
					$("#FormError", frmtb).hide();
					// all depend on ret array
					//ret[0] - succes
					//ret[1] - msg if not succes
					//ret[2] - the id  that will be set if reload after submit false
					getFormData();
					if (postdata[gridId + "_id"] === "_empty") {
						postIt();
					} else if (o.checkOnSubmit === true) {
						diff = compareData(postdata, o._savedData);
						if (diff) {
							$(frmgr).data("disabled", true);
							$(".confirm", themodalSelector).show();
						} else {
							postIt();
						}
					} else {
						postIt();
					}
					return false;
				});
				$("#cData", frmtb2).click(function () {
					if (!checkUpdates()) { return false; }
					hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form });
					return false;
				});
				$("#nData", frmtb2).click(function () {
					if (!checkUpdates()) { return false; }
					$("#FormError", frmtb).hide();
					var npos = getCurrPos();
					npos[0] = parseInt(npos[0], 10);
					if (npos[0] !== -1 && npos[1][npos[0] + 1]) {
						if (!editFeedback("onclickPgButtons", "next", $(frmgr), npos[1][npos[0]])) { return false; }
						fillData(npos[1][npos[0] + 1], frmgr);
						setSelection.call($self, npos[1][npos[0] + 1]);
						editFeedback("afterclickPgButtons", "next", $(frmgr), npos[1][npos[0] + 1]);
						updateNav(npos[0] + 1, npos);
					}
					return false;
				});
				$("#pData", frmtb2).click(function () {
					if (!checkUpdates()) { return false; }
					$("#FormError", frmtb).hide();
					var ppos = getCurrPos();
					if (ppos[0] !== -1 && ppos[1][ppos[0] - 1]) {
						if (!editFeedback("onclickPgButtons", "prev", $(frmgr), ppos[1][ppos[0]])) { return false; }
						if (hasOneFromClasses($("#" + jqID(ppos[1][ppos[0] - 1])), disabledClass)) { return false; }
						fillData(ppos[1][ppos[0] - 1], frmgr);
						setSelection.call($self, ppos[1][ppos[0] - 1]);
						editFeedback("afterclickPgButtons", "prev", $(frmgr), ppos[1][ppos[0] - 1]);
						updateNav(ppos[0] - 1, ppos);
					}
					return false;
				});
				editFeedback("afterShowForm", $(frmgr), frmoper);
				var posInit = getCurrPos();
				updateNav(posInit[0], posInit);
			});
		},
		viewGridRow: function (rowid, oMuligrid) {
			return this.each(function () {
				var $t = this, $self = $($t), p = $t.p;
				if (!$t.grid || p == null || !rowid) { return; }
				// make new copy of the options oMuligrid and use it for ONE specific grid.
				// p.formViewing can contains grid specific options
				// we will don't modify the input options oMuligrid
				var gridId = p.id,
					o = $.extend(true,
						{
							top: 0,
							left: 0,
							width: 0,
							datawidth: "auto",
							height: "auto",
							dataheight: "auto",
							//modal: false,
							//toTop : false,
							//overlay: 30,
							drag: true,
							resize: true,
							//jqModal: true,
							closeOnEscape: false,
							labelswidth: "30%",
							navkeys: [false, 38, 40],
							onClose: null,
							beforeShowForm: null,
							beforeInitData: null,
							viewPagerButtons: true,
							recreateForm: false,
							removemodal: true,
							form: "view"
						},
						$j.getGridRes.call($self, "view"),
						jgrid.view || {},
						p.formViewing || {},
						oMuligrid || {});

				var frmgr = "#ViewGrid_" + jqID(gridId), frmtb = "#ViewTbl_" + jqID(gridId), frmtb2 = frmtb + "_2",
					frmgrId = "ViewGrid_" + gridId, frmtbId = "ViewTbl_" + gridId, commonIconClass = o.commonIconClass,
					ids = { themodal: "viewmod" + gridId, modalhead: "viewhd" + gridId, modalcontent: "viewcnt" + gridId, resizeAlso: frmgrId },
					themodalSelector = "#" + jqID(ids.themodal), gboxSelector = p.gBox, colModel = p.colModel,
					maxCols = 1, maxRows = 0,
					viewFeedback = function () {
						var args = $.makeArray(arguments);
						args.unshift("");
						args.unshift("View");
						args.unshift(o);
						return feedback.apply($t, args);
					},
					hoverClasses = getGuiStateStyles.call($t, "hover"),
					disabledClass = getGuiStateStyles.call($t, "disabled");

				if (!o.recreateForm) {
					if ($self.data("viewProp")) {
						$.extend(o, $self.data("viewProp"));
					}
				}
				function focusaref() { //Sfari 3 issues
					if (o.closeOnEscape === true || o.navkeys[0] === true) {
						setTimeout(function () { $(".ui-jqdialog-titlebar-close", "#" + jqID(ids.modalhead)).attr("tabindex", "-1").focus(); }, 0);
					}
				}
				function createData(rowid, tb, maxcols) {
					var nm, hc, trdata, cnt = 0, tmp, dc, retpos = [], ind = $j.getInd.call($self, rowid), i,
						viewDataClasses = getGuiStyles.call($t, "dialog.viewData", "DataTD form-view-data"),
						viewLabelClasses = getGuiStyles.call($t, "dialog.viewLabel", "CaptionTD form-view-label"),
						tdtmpl = "<td class='" + viewLabelClasses + "' width='" + o.labelswidth + "'>&#160;</td><td class='" + viewDataClasses + " ui-helper-reset'>&#160;</td>", tmpl = "",
						tdtmpl2 = "<td class='" + viewLabelClasses + "'></td><td class='" + viewDataClasses + "'></td>",
						fmtnum = ["integer", "number", "currency"], max1 = 0, max2 = 0, maxw, setme, viewfld;
					for (i = 1; i <= maxcols; i++) {
						tmpl += i === 1 ? tdtmpl : tdtmpl2;
					}
					// find max number align rigth with property formatter
					$(colModel).each(function () {
						var cm = this;
						if (cm.editrules && cm.editrules.edithidden === true) {
							hc = false;
						} else {
							hc = cm.hidden === true ? true : false;
						}
						if (!hc && cm.align === "right") {
							if (cm.formatter && $.inArray(cm.formatter, fmtnum) !== -1) {
								max1 = Math.max(max1, parseInt(cm.width, 10));
							} else {
								max2 = Math.max(max2, parseInt(cm.width, 10));
							}
						}
					});
					maxw = max1 !== 0 ? max1 : max2 !== 0 ? max2 : 0;
					$(colModel).each(function (i) {
						var cm = this;
						nm = cm.name;
						setme = false;
						// hidden fields are included in the form
						if (cm.editrules && cm.editrules.edithidden === true) {
							hc = false;
						} else {
							hc = cm.hidden === true ? true : false;
						}
						dc = hc ? "style='display:none'" : "";
						viewfld = (typeof cm.viewable !== "boolean") ? true : cm.viewable;
						if (nm !== "cb" && nm !== "subgrid" && nm !== "rn" && viewfld) {
							tmp = ind === false ? "" : jgrid.getDataFieldOfCell.call($t, $t.rows[ind], i).html();
							setme = cm.align === "right" && maxw !== 0 ? true : false;
							var frmopt = $.extend({}, { rowabove: false, rowcontent: "" }, cm.formoptions || {}),
								rp = parseInt(frmopt.rowpos, 10) || cnt + 1,
								cp = parseInt((parseInt(frmopt.colpos, 10) || 1) * 2, 10);
							if (frmopt.rowabove) {
								var newdata = $("<tr><td class='contentinfo' colspan='" + (maxcols * 2) + "'>" + frmopt.rowcontent + "</td></tr>");
								$(tb).append(newdata);
								newdata[0].rp = rp;
							}
							trdata = $(tb).find("tr[data-rowpos=" + rp + "]");
							if (trdata.length === 0) {
								trdata = $("<tr " + dc + " data-rowpos='" + rp + "'></tr>").addClass("FormData").attr("id", "trv_" + nm);
								$(trdata).append(tmpl);
								$(tb).append(trdata);
								trdata[0].rp = rp;
							}
							var labelText = (frmopt.label === undefined ? p.colNames[i] : frmopt.label),
								$data = $("td:eq(" + (cp - 1) + ")", trdata[0]);
							$("td:eq(" + (cp - 2) + ")", trdata[0]).html("<b>" + (labelText || "&nbsp;") + "</b>");
							$data[isEmptyString($data.html()) ? "html" : "append"]("<span>" + (tmp || "&nbsp;") + "</span>").attr("id", "v_" + nm);
							if (setme) {
								$("td:eq(" + (cp - 1) + ") span", trdata[0]).css({ "text-align": "right", width: maxw + "px" });
							}
							retpos[cnt] = i;
							cnt++;
						}
					});
					if (cnt > 0) {
						var idrow = $("<tr class='FormData' style='display:none'><td class='CaptionTD'>&#160;</td><td colspan='" + (maxcols * 2 - 1) + "' class='DataTD'><input class='FormElement' id='id_g' type='text' name='id' value='" + rowid + "'/></td></tr>");
						idrow[0].rp = cnt + 99;
						$(tb).append(idrow);
					}
					return retpos;
				}
				function fillData(rowid) {
					var nm, hc, cnt = 0, trv = $j.getInd.call($self, rowid, true), cm;
					if (!trv) { return; }
					$("td", trv).each(function (i) {
						cm = colModel[i];
						nm = cm.name;
						// hidden fields are included in the form
						if (cm.editrules && cm.editrules.edithidden === true) {
							hc = false;
						} else {
							hc = cm.hidden === true ? true : false;
						}
						if (nm !== "cb" && nm !== "subgrid" && nm !== "rn") {
							nm = jqID("v_" + nm);
							$("#" + nm + " span", frmtb).html(jgrid.getDataFieldOfCell.call($t, trv, i).html());
							if (hc) { $("#" + nm, frmtb).parents("tr:first").hide(); }
							cnt++;
						}
					});
					if (cnt > 0) { $("#id_g", frmtb).val(rowid); }
				}
				function updateNav(cr, posarr) {
					var totr = posarr[1].length - 1;
					if (cr === 0) {
						$("#pData", frmtb2).addClass(disabledClass);
					} else if (posarr[1][cr - 1] !== undefined && hasOneFromClasses($("#" + jqID(posarr[1][cr - 1])), disabledClass)) {
						$("#pData", frmtb2).addClass(disabledClass);
					} else {
						$("#pData", frmtb2).removeClass(disabledClass);
					}
					if (cr === totr) {
						$("#nData", frmtb2).addClass(disabledClass);
					} else if (posarr[1][cr + 1] !== undefined && hasOneFromClasses($("#" + jqID(posarr[1][cr + 1])), disabledClass)) {
						$("#nData", frmtb2).addClass(disabledClass);
					} else {
						$("#nData", frmtb2).removeClass(disabledClass);
					}
				}
				function getCurrPos() {
					var rowsInGrid = $j.getDataIDs.call($self),
						selrow = $("#id_g", frmtb).val(),
						pos = $.inArray(selrow, rowsInGrid);
					return [pos, rowsInGrid];
				}

				var dh = isNaN(o.dataheight) ? o.dataheight : o.dataheight + "px",
					dw = isNaN(o.datawidth) ? o.datawidth : o.datawidth + "px",
					frm = $("<form name='FormPost' id='" + frmgrId + "' class='FormGrid' style='width:" + dw + ";overflow:auto;position:relative;height:" + dh + ";'></form>"),
					tbl = $("<table id='" + frmtbId + "' class='EditTable' cellspacing='1' cellpadding='2' border='0' style='table-layout:fixed'><tbody></tbody></table>");
				$(colModel).each(function () {
					var fmto = this.formoptions;
					maxCols = Math.max(maxCols, fmto ? fmto.colpos || 0 : 0);
					maxRows = Math.max(maxRows, fmto ? fmto.rowpos || 0 : 0);
				});
				// set the id.
				frm.append(tbl);
				if (!viewFeedback("beforeInitData", frm)) { return; }
				createData(rowid, tbl, maxCols);
				var rtlb = p.direction === "rtl" ? true : false,
					bp = rtlb ? "nData" : "pData",
					bn = rtlb ? "pData" : "nData",
						// buttons at footer
					bP = builderFmButon.call($t, bp, "", mergeCssClasses(commonIconClass, o.prevIcon), "", "left"),
					bN = builderFmButon.call($t, bn, "", mergeCssClasses(commonIconClass, o.nextIcon), "", "right"),
					bC = builderFmButon.call($t, "cData", o.bClose);

				if (maxRows > 0) {
					var sd = [];
					$.each($(tbl)[0].rows, function (i, r) {
						sd[i] = r;
					});
					sd.sort(function (a, b) {
						if (a.rp > b.rp) { return 1; }
						if (a.rp < b.rp) { return -1; }
						return 0;
					});
					$.each(sd, function (index, row) {
						$("tbody", tbl).append(row);
					});
				}
				o.gbox = gboxSelector;
				var bt = $("<div></div>").append(frm).append("<table border='0' class='EditTable' id='" + frmtbId + "_2'><tbody><tr id='Act_Buttons'><td class='navButton navButton-" + p.direction + "' width='" + (o.labelswidth || "auto") + "'>" + (rtlb ? bN + bP : bP + bN) + "</td><td class='EditButton EditButton-" + p.direction + "'>" + bC + "</td></tr></tbody></table>");
				createModal.call($t, ids, bt, o, p.gView, $(p.gView)[0]);
				if (!o.viewPagerButtons) { $("#pData, #nData", frmtb2).hide(); }
				bt = null;
				$(themodalSelector).keydown(function (e) {
					var $focused, idFocused;
					if ($(frmgr).data("disabled") === true) { return false; }//??
					if (e.which === 13) {
						$focused = $(frmtb2).find(":focus");
						idFocused = $focused.attr("id");
						if ($focused.length > 0 && $.inArray(idFocused, ["pData", "nData", "cData"]) >= 0) {
							$focused.trigger("click");
							return false;
						}
					}

					if (e.which === 27) {
						if (o.closeOnEscape) { hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form }); }
						return false;
					}
					if (o.navkeys[0] === true) {
						if (e.which === o.navkeys[1]) { //up
							$("#pData", frmtb2).trigger("click");
							return false;
						}
						if (e.which === o.navkeys[2]) { //down
							$("#nData", frmtb2).trigger("click");
							return false;
						}
					}
				});
				addFormIcon($("#cData", frmtb2), o.closeicon, commonIconClass);
				viewFeedback("beforeShowForm", $(frmgr));
				viewModal(themodalSelector, {
					gbox: gboxSelector,
					jqm: o.jqModal,
					overlay: o.overlay,
					toTop: o.toTop,
					modal: o.modal,
					onHide: function (h) {
						savePositionOnHide.call($self, "viewProp", frmgr, h);
					}
				});
				$(".fm-button:not(." + disabledClass.split(" ").join(".") + ")", frmtb2).hover(
					function () { $(this).addClass(hoverClasses); },
					function () { $(this).removeClass(hoverClasses); }
				);
				focusaref();
				$("#cData", frmtb2).click(function () {
					hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal, formprop: !o.recreateForm, form: o.form });
					return false;
				});
				$("#nData", frmtb2).click(function () {
					$("#FormError", frmtb).hide();
					var npos = getCurrPos();
					npos[0] = parseInt(npos[0], 10);
					if (npos[0] !== -1 && npos[1][npos[0] + 1]) {
						if (!viewFeedback("onclickPgButtons", "next", $(frmgr), npos[1][npos[0]])) { return false; }
						fillData(npos[1][npos[0] + 1]);
						$j.setSelection.call($self, npos[1][npos[0] + 1]);
						viewFeedback("afterclickPgButtons", "next", $(frmgr), npos[1][npos[0] + 1]);
						updateNav(npos[0] + 1, npos);
					}
					focusaref();
					return false;
				});
				$("#pData", frmtb2).click(function () {
					$("#FormError", frmtb).hide();
					var ppos = getCurrPos();
					if (ppos[0] !== -1 && ppos[1][ppos[0] - 1]) {
						if (!viewFeedback("onclickPgButtons", "prev", $(frmgr), ppos[1][ppos[0]])) { return false; }
						fillData(ppos[1][ppos[0] - 1]);
						$j.setSelection.call($self, ppos[1][ppos[0] - 1]);
						viewFeedback("afterclickPgButtons", "prev", $(frmgr), ppos[1][ppos[0] - 1]);
						updateNav(ppos[0] - 1, ppos);
					}
					focusaref();
					return false;
				});
				var posInit = getCurrPos();
				updateNav(posInit[0], posInit);
			});
		},
		delGridRow: function (rowids, oMuligrid) {
			return this.each(function () {
				var $t = this, p = $t.p, $self = $($t);
				if (!$t.grid || p == null || !rowids) { return; }
				// make new copy of the options oMuligrid and use it for ONE specific grid.
				// p.formDeleting can contains grid specific options
				// we will don't modify the input options oMuligrid
				var gridId = p.id,
					o = $.extend(true,
						{
							top: 0,
							left: 0,
							width: 240,
							removemodal: true,
							height: "auto",
							dataheight: "auto",
							//modal: false,
							//toTop: false,
							//overlay: 30,
							drag: true,
							resize: true,
							url: "",
							mtype: "POST",
							reloadAfterSubmit: true,
							beforeShowForm: null,
							beforeInitData: null,
							afterShowForm: null,
							beforeSubmit: null,
							onclickSubmit: null,
							afterSubmit: null,
							//jqModal : true,
							closeOnEscape: false,
							delData: {},
							onClose: null,
							ajaxDelOptions: {},
							processing: false,
							serializeDelData: null,
							useDataProxy: false
						},
						$j.getGridRes.call($self, "del"),
						jgrid.del || {},
						p.formDeleting || {},
						oMuligrid || {});

				var dtblId = "DelTbl_" + gridId, dtbl = "#DelTbl_" + jqID(gridId), postd, idname, opers, oper,
					ids = { themodal: "delmod" + gridId, modalhead: "delhd" + gridId, modalcontent: "delcnt" + gridId, resizeAlso: dtblId },
					themodalSelector = "#" + jqID(ids.themodal), gboxSelector = p.gBox, commonIconClass = o.commonIconClass,
					deleteFeedback = function () {
						var args = $.makeArray(arguments);
						args.unshift("");
						args.unshift("Delete");
						args.unshift(o);
						return feedback.apply($t, args);
					},
					hoverClasses = getGuiStateStyles.call($t, "hover"),
					activeClass = getGuiStateStyles.call($t, "active"),
					errorClass = getGuiStateStyles.call($t, "error");

				if (!$.isArray(rowids)) { rowids = [String(rowids)]; }
				if ($(themodalSelector)[0] !== undefined) {
					if (!deleteFeedback("beforeInitData", $(dtbl))) { return; }
					$("#DelData>td", dtbl).text(rowids.join()).data("rowids", rowids);
					$("#DelError", dtbl).hide();
					if (o.processing === true) {
						o.processing = false;
						$("#dData", dtbl).removeClass(activeClass);
					}
					deleteFeedback("beforeShowForm", $(dtbl));
					viewModal(themodalSelector, { gbox: gboxSelector, jqm: o.jqModal, jqM: false, overlay: o.overlay, toTop: o.toTop, modal: o.modal });
					deleteFeedback("afterShowForm", $(dtbl));
				} else {
					var dh = isNaN(o.dataheight) ? o.dataheight : o.dataheight + "px",
						dw = isNaN(o.datawidth) ? o.datawidth : o.datawidth + "px",
						tbl = "<div id='" + dtblId + "' class='formdata' style='width:" + dw + ";overflow:auto;position:relative;height:" + dh + ";'>";
					tbl += "<table class='DelTable'><tbody>";
					// error data
					tbl += "<tr id='DelError' style='display:none'><td class='" + errorClass + "'></td></tr>";
					tbl += "<tr id='DelData' style='display:none'><td >" + rowids.join() + "</td></tr>";
					tbl += "<tr><td class=\"delmsg\" style=\"white-space:pre;\">" + o.msg + "</td></tr><tr><td >&#160;</td></tr>";
					// buttons at footer
					tbl += "</tbody></table></div>";
					var bS = builderFmButon.call($t, "dData", o.bSubmit),
						bC = builderFmButon.call($t, "eData", o.bCancel);
					tbl += "<table" + (jgrid.msie && jgrid.msiever() < 8 ? " cellspacing='0'" : "") + " class='EditTable' id='" + dtblId + "_2'><tbody><tr><td><hr class='" +
					getGuiStyles.call($t, "dialog.hr") + "' style='margin:1px'/></td></tr><tr><td class='DelButton EditButton EditButton-" + p.direction + "'>" + bS + "&#160;" + bC + "</td></tr></tbody></table>";
					o.gbox = gboxSelector;
					createModal.call($t, ids, tbl, o, p.gView, $(p.gView)[0]);
					$("#DelData>td", dtbl).data("rowids", rowids);

					if (!deleteFeedback("beforeInitData", $(tbl))) { return; }
					$(".fm-button", dtbl + "_2").hover(
						function () { $(this).addClass(hoverClasses); },
						function () { $(this).removeClass(hoverClasses); }
					);
					addFormIcon($("#dData", dtbl + "_2"), o.delicon, commonIconClass);
					addFormIcon($("#eData", dtbl + "_2"), o.cancelicon, commonIconClass);
					$("#dData", dtbl + "_2").click(function () {
						var ret = [true, ""], pk, $delData = $("#DelData>td", dtbl),
							postdata = $delData.text(), //the pair is name=val1,val2,...
							formRowIds = $delData.data("rowids"),
							cs = {};
						if ($.isFunction(o.onclickSubmit)) { cs = o.onclickSubmit.call($t, o, postdata) || {}; }
						if ($.isFunction(o.beforeSubmit)) { ret = o.beforeSubmit.call($t, postdata); }
						if (ret[0] && !o.processing) {
							o.processing = true;
							opers = p.prmNames;
							postd = $.extend({}, o.delData, cs);
							oper = opers.oper;
							postd[oper] = opers.deloper;
							idname = opers.id;
							postdata = formRowIds.slice();
							if (!postdata.length) { return false; }
							for (pk in postdata) {
								if (postdata.hasOwnProperty(pk)) {
									postdata[pk] = jgrid.stripPref(p.idPrefix, postdata[pk]);
								}
							}
							postd[idname] = postdata.join();
							$(this).addClass(activeClass);
							var ajaxOptions = $.extend({
								url: o.url || p.editurl,
								type: o.mtype,
								data: $.isFunction(o.serializeDelData) ? o.serializeDelData.call($t, postd) : postd,
								complete: function (jqXHR, textStatus) {
									var i;
									$("#dData", dtbl + "_2").removeClass(activeClass);
									if ((jqXHR.status >= 300 && jqXHR.status !== 304) || (jqXHR.status === 0 && jqXHR.readyState === 4)) {
										ret[0] = false;
										if ($.isFunction(o.errorTextFormat)) {
											ret[1] = o.errorTextFormat.call($t, jqXHR);
										} else {
											ret[1] = textStatus + " Status: '" + jqXHR.statusText + "'. Error code: " + jqXHR.status;
										}
									} else {
										// data is posted successful
										// execute aftersubmit with the returned data from server
										if ($.isFunction(o.afterSubmit)) {
											ret = o.afterSubmit.call($t, jqXHR, postd);
										}
									}
									if (ret[0] === false) {
										$("#DelError>td", dtbl).html(ret[1]);
										$("#DelError", dtbl).show();
									} else {
										if (o.reloadAfterSubmit && p.datatype !== "local") {
											$self.trigger("reloadGrid", [$.extend({}, o.reloadGridOptions || {})]);
										} else {
											if (p.treeGrid === true) {
												try { $j.delTreeNode.call($self, formRowIds[0]); } catch (ignore) { }
											} else {
												formRowIds = formRowIds.slice(); // make copy for save deleting
												for (i = 0; i < formRowIds.length; i++) {
													$j.delRowData.call($self, formRowIds[i]);
												}
											}
										}
										setTimeout(function () {
											deleteFeedback("afterComplete", jqXHR, postdata, $(dtbl));
										}, 50);
									}
									o.processing = false;
									if (ret[0]) { hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal }); }
								}
							}, jgrid.ajaxOptions, o.ajaxDelOptions);


							if (!ajaxOptions.url && !o.useDataProxy) {
								if ($.isFunction(p.dataProxy)) {
									o.useDataProxy = true;
								} else {
									ret[0] = false;
									ret[1] += " " + jgrid.errors.nourl;
								}
							}
							if (ret[0]) {
								if (o.useDataProxy) {
									var dpret = p.dataProxy.call($t, ajaxOptions, "del_" + gridId);
									if (dpret === undefined) {
										dpret = [true, ""];
									}
									if (dpret[0] === false) {
										ret[0] = false;
										ret[1] = dpret[1] || "Error deleting the selected row!";
									} else {
										hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal });
									}
								} else {
									if (ajaxOptions.url === "clientArray") {
										postd = ajaxOptions.data;
										ajaxOptions.complete({ status: 200, statusText: "" }, "");
									} else {
										$.ajax(ajaxOptions);
									}
								}
							}
						}

						if (ret[0] === false) {
							$("#DelError>td", dtbl).html(ret[1]);
							$("#DelError", dtbl).show();
						}
						return false;
					});
					$("#eData", dtbl + "_2").click(function () {
						hideModal(themodalSelector, { gb: gboxSelector, jqm: o.jqModal, onClose: o.onClose, removemodal: o.removemodal });
						return false;
					});
					deleteFeedback("beforeShowForm", $(dtbl));
					viewModal(themodalSelector, { gbox: gboxSelector, jqm: o.jqModal, overlay: o.overlay, toTop: o.toTop, modal: o.modal });
					deleteFeedback("afterShowForm", $(dtbl));
				}
				if (o.closeOnEscape === true) {
					setTimeout(function () { $(".ui-jqdialog-titlebar-close", "#" + jqID(ids.modalhead)).attr("tabindex", "-1").focus(); }, 0);
				}
			});
		},
		navGrid: function (elem, oMuligrid, pEdit, pAdd, pDel, pSearch, pView) {
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
			return this.each(function () {
				var $t = this, p = $t.p, $self = $($t);
				if (!$t.grid || p == null || ($t.nav && $(elem).find(".navtable").length > 0)) {
					return; // error or the navigator bar already exists
				}
				// make new copy of the options oMuligrid and use it for ONE specific grid.
				// p.navOptions can contains grid specific options
				// we will don't modify the input options oMuligrid
				var gridId = p.id,
					o = $.extend(
						{
							edit: true,
							add: true,
							del: true,
							search: true,
							refresh: true,
							refreshstate: "firstpage",
							view: false,
							closeOnEscape: true,
							beforeRefresh: null,
							afterRefresh: null,
							cloneToTop: false,
							hideEmptyPagerParts: true,
							//jqModal: true,
							alertwidth: 200,
							alertheight: "auto",
							alerttop: null,
							//alertToTop: false,
							removemodal: true,
							alertleft: null,
							alertzIndex: null,
							iconsOverText: false
						},
						$j.getGridRes.call($self, "nav"),
						jgrid.nav || {},
						p.navOptions || {},
						oMuligrid || {}
					);
				// set default position depend of RTL/LTR direction of the grid
				o.position = o.position || (p.direction === "rtl" ? "right" : "left");

				var twd, tdw, gridIdEscaped = p.idSel, gboxSelector = p.gBox, commonIconClass = o.commonIconClass,
					alertIDs = { themodal: "alertmod_" + gridId, modalhead: "alerthd_" + gridId, modalcontent: "alertcnt_" + gridId },
					createModalAlert = function () {
						return function () {
						    var documentElement = document.documentElement, w = window, left = 1024, top = 768,
								offsetGbox = $self.closest(".ui-jqgrid").offset();
							if ($("#" + jqID(alertIDs.themodal))[0] === undefined) {
								if (!o.alerttop && !o.alertleft) {
									if (w.innerWidth !== undefined) {
										left = w.innerWidth;
										top = w.innerHeight;
									} else if (documentElement != null && documentElement.clientWidth !== undefined && documentElement.clientWidth !== 0) {
										left = documentElement.clientWidth;
										top = documentElement.clientHeight;
									}
									left = left / 2 - parseInt(o.alertwidth, 10) / 2 - offsetGbox.left;
									top = top / 2 - 25 - offsetGbox.top;
								}
								createModal.call($t, alertIDs,
									"<div>" + o.alerttext + "</div><span tabindex='0'><span tabindex='-1' id='" + gridId + "_jqg_alrt'></span></span>",
									{
										gbox: gboxSelector,
										jqModal: o.jqModal,
										drag: true,
										resize: true,
										caption: o.alertcap,
										top: o.alerttop != null ? o.alerttop : top,
										left: o.alertleft != null ? o.alertleft : left,
										width: o.alertwidth,
										height: o.alertheight,
										closeOnEscape: o.closeOnEscape,
										zIndex: o.alertzIndex,
										removemodal: o.removemodal
									},
									p.gView,
									$(gboxSelector)[0],
									false);
							}
							viewModal("#" + jqID(alertIDs.themodal), { gbox: gboxSelector, toTop: o.alertToTop, jqm: o.jqModal });
							var $close = $("#" + jqID(alertIDs.modalhead)).find(".ui-jqdialog-titlebar-close");
							$close.attr({ tabindex: "0", href: "#", role: "button" });
							setTimeout(function () {
								$close.focus(); //$(p.idSel + "_jqg_alrt").focus();
							}, 50);
						};
					},
					viewModalAlert = createModalAlert(),
					navtbl,
					clickOnEnter = function (e) {
						var $focused;
						if (e.which === 13) {
							$focused = $(this).find(":focus");
							if ($focused.length > 0) {
								$focused.trigger("click");
								return false;
							}
						}
					},
					hoverClasses = getGuiStateStyles.call($t, "hover"),
					disabledClass = getGuiStateStyles.call($t, "disabled");
				if (!$t.grid) {
					return; // error
				}
				// set modalAlert which can be used inside of
				$t.modalAlert = viewModalAlert;
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

				var clone = 1, i, tbd, pgid, elemids, iPart, pagerTable, $pagerPart, pagerParts = ["left", "center", "right"],
					sep = "<div class='ui-pg-button " + disabledClass + "'><span class='ui-separator'></span></div>",
					onHoverIn = function () {
						if (!hasOneFromClasses(this, disabledClass)) {
							$(this).addClass(hoverClasses);
						}
					},
					onHoverOut = function () {
						$(this).removeClass(hoverClasses);
					},
					onAdd = function () {
						if (!hasOneFromClasses(this, disabledClass)) {
							if ($.isFunction(o.addfunc)) {
								o.addfunc.call($t);
							} else {
								$j.editGridRow.call($self, "new", pAdd);
							}
						}
						return false;
					},
					editOrViewOfSelectedRow = function (func, methodName, param) {
						if (!hasOneFromClasses(this, disabledClass)) {
							var sr = p.selrow;
							if (sr) {
								if ($.isFunction(func)) {
									func.call($t, sr);
								} else {
									$j[methodName].call($self, sr, param);
								}
							} else {
								viewModalAlert();
							}
						}
						return false;
					},
					onEdit = function () {
						return editOrViewOfSelectedRow.call(this, o.editfunc, "editGridRow", pEdit);
					},
					onView = function () {
						return editOrViewOfSelectedRow.call(this, o.viewfunc, "viewGridRow", pView);
					},
					onDel = function () {
						var dr;
						if (!hasOneFromClasses(this, disabledClass)) {
							if (p.multiselect) {
								dr = p.selarrrow;
								if (dr.length === 0) { dr = null; }
							} else {
								dr = p.selrow;
							}
							if (dr) {
								if ($.isFunction(o.delfunc)) {
									o.delfunc.call($t, dr);
								} else {
									$j.delGridRow.call($self, dr, pDel);
								}
							} else {
								viewModalAlert();
							}
						}
						return false;
					},
					onSearch = function () {
						if (!hasOneFromClasses(this, disabledClass)) {
							if ($.isFunction(o.searchfunc)) {
								o.searchfunc.call($t, pSearch);
							} else {
								$j.searchGrid.call($self, pSearch);
							}
						}
						return false;
					},
					onRefresh = function () {
						if (!hasOneFromClasses(this, disabledClass)) {
							if ($.isFunction(o.beforeRefresh)) { o.beforeRefresh.call($t); }
							p.search = false;
							p.resetsearch = true;
							try {
								if (o.refreshstate !== "currentfilter") {
									p.postData.filters = "";
									try {
										$("#fbox_" + gridIdEscaped).jqFilter("resetFilter");
									} catch (ignore) { }
									if ($.isFunction($t.clearToolbar)) { $t.clearToolbar(false); }
								}
							} catch (ignore) { }
							switch (o.refreshstate) {
								case "firstpage":
									$self.trigger("reloadGrid", [$.extend({}, o.reloadGridOptions || {}, { page: 1 })]);
									break;
								case "current":
								case "currentfilter":
									$self.trigger("reloadGrid", [$.extend({}, o.reloadGridOptions || {}, { current: true })]);
									break;
							}
							if ($.isFunction(o.afterRefresh)) { o.afterRefresh.call($t); }
						}
						return false;
					},
					stdButtonActivation = function (name, id, onClick, navtbl, elemids) {
						var $button = $("<div class='ui-pg-button ui-corner-all' tabindex='0' role='button'></div>"),
							iconClass = o[name + "icon"],
							iconText = $.trim(o[name + "text"]);
						$button.append("<div class='ui-pg-div'><span class='" +
							(o.iconsOverText ?
									mergeCssClasses("ui-pg-button-icon-over-text", commonIconClass, iconClass) :
									mergeCssClasses(commonIconClass, iconClass)) +
							"'></span>" +
							(iconText ? "<span class='ui-pg-button-text" + (o.iconsOverText ? " ui-pg-button-icon-over-text" : "") + "'>" + iconText + "</span>" : "") +
							"</div>");
						$(navtbl).append($button);
						$button.attr({ "title": o[name + "title"] || "", id: id || name + "_" + elemids })
							.click(onClick)
							.hover(onHoverIn, onHoverOut);
						return $button;
					};

				if (o.cloneToTop && p.toppager) { clone = 2; }
				for (i = 0; i < clone; i++) {
					// we can set aria-activedescendant="idOfFirstButton" later
					navtbl = $("<div" + " class='ui-pg-table navtable' role='toolbar' style='float:" +
						(p.direction === "rtl" ? "right" : "left") +
						";table-layout:auto;'></div>");
					if (i === 0) {
						pgid = elem;
						elemids = gridId;
						if (pgid === p.toppager) {
							elemids += "_top";
							clone = 1;
						}
					} else {
						pgid = p.toppager;
						elemids = gridId + "_top";
					}
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
					if (o.add || o.edit || o.del || o.view) { $(navtbl).append(sep); }
					if (o.search) {
						tbd = stdButtonActivation("search", pSearch.id, onSearch, navtbl, elemids);
						if (pSearch.showOnLoad && pSearch.showOnLoad === true) {
							$(tbd, navtbl).click();
						}
					}
					if (o.refresh) {
						stdButtonActivation("refresh", "", onRefresh, navtbl, elemids);
					}
					// TODO use setWidthOfPagerTdWithPager or remove at all and use div structure with wrapping
					tdw = $(".ui-jqgrid>.ui-jqgrid-view").css("font-size") || "11px";
					$("body").append("<div id='testpg2' class='" + getGuiStyles.call($t, "gBox", "ui-jqgrid") + "' style='font-size:" + tdw + ";visibility:hidden;' ></div>");
					twd = $(navtbl).clone().appendTo("#testpg2").width();
					$("#testpg2").remove();
					$(pgid + "_" + o.position, pgid).append(navtbl);
					if (o.hideEmptyPagerParts) {
						for (iPart = 0; iPart < pagerParts.length; iPart++) {
							if (pagerParts[iPart] !== o.position) {
								$pagerPart = $(pgid + "_" + pagerParts[iPart], pgid);
								if ($pagerPart.length === 0 || $pagerPart[0].childNodes.length === 0) {
									$pagerPart.hide();
								} else if ($pagerPart[0].childNodes.length === 1) {
									pagerTable = $pagerPart[0].firstChild;
									if ($(pagerTable).is("table.ui-pg-table") && (pagerTable.rows === 0 || pagerTable.rows[0].cells.length === 0)) {
										$pagerPart.hide();
									}
								}
							}
						}
					}
					if (p._nvtd) {
						if (twd > p._nvtd[0]) {
							$(pgid + "_" + o.position, pgid).width(twd);
							p._nvtd[0] = twd;
						}
						p._nvtd[1] = twd;
					}
					$t.nav = true;
					navtbl.bind("keydown.jqGrid", clickOnEnter);
				}
				$self.triggerHandler("jqGridResetFrozenHeights");
			});
		},
		navButtonAdd: function (elem, oMuligrid) {
			if (typeof elem === "object") {
				oMuligrid = elem;
				elem = undefined;
			}
			return this.each(function () {
				var $t = this, p = $t.p;
				if (!$t.grid) { return; }
				var o = $.extend(
						{
							caption: "newButton",
							title: "",
							onClickButton: null,
							position: "last",
							cursor: "pointer",
							iconsOverText: false
						},
						$j.getGridRes.call($($t), "nav"),
						jgrid.nav || {},
						p.navOptions || {},
						oMuligrid || {}
					),
					hoverClasses = getGuiStateStyles.call($t, "hover"),
					disabledClass = getGuiStateStyles.call($t, "disabled");
				if (elem === undefined) {
					if (p.pager) {
						$j.navButtonAdd.call($($t), p.pager, o);
						if (p.toppager) {
							elem = p.toppager;
						} else {
							return;
						}
					} else if (p.toppager) {
						elem = p.toppager;
					}
				}
				if (typeof elem === "string" && elem.indexOf("#") !== 0) { elem = "#" + jqID(elem); }
				var findnav = $(".navtable", elem), commonIconClass = o.commonIconClass;
				if (findnav.length > 0) {
					if (o.id && findnav.find("#" + jqID(o.id)).length > 0) { return; }
					var tbd = $("<div tabindex='0' role='button'></div>");
					if (o.buttonicon.toString().toUpperCase() === "NONE") {
						$(tbd).addClass("ui-pg-button ui-corner-all").append("<div class='ui-pg-div'>" +
							(o.caption ? "<span class='ui-pg-button-text" + (o.iconsOverText ? " ui-pg-button-icon-over-text" : "") + "'>" + o.caption + "</span>" : "") +
							"</div>");
					} else {
						$(tbd).addClass("ui-pg-button ui-corner-all").append("<div class='ui-pg-div'>" +
							"<span class='" +
							(o.iconsOverText ?
									mergeCssClasses("ui-pg-button-icon-over-text", commonIconClass, o.buttonicon) :
									mergeCssClasses(commonIconClass, o.buttonicon)) +
							"'></span>" +
							(o.caption ? "<span class='ui-pg-button-text" + (o.iconsOverText ? " ui-pg-button-icon-over-text" : "") + "'>" + o.caption + "</span>" : "") +
							"</div>");
					}
					if (o.id) { $(tbd).attr("id", o.id); }
					if (o.position === "first" && findnav.children("div.ui-pg-button").length > 0) {
						findnav.children("div.ui-pg-button").filter(":first").before(tbd);
					} else {
						findnav.append(tbd);
					}
					$(tbd, findnav)
						.attr("title", o.title || "")
						.click(function (e) {
							if (!hasOneFromClasses(this, disabledClass)) {
								if ($.isFunction(o.onClickButton)) { o.onClickButton.call($t, o, e); }
							}
							return false;
						})
						.hover(
							function () {
								if (!hasOneFromClasses(this, disabledClass)) {
									$(this).addClass(hoverClasses);
								}
							},
							function () { $(this).removeClass(hoverClasses); }
						);
					$($t).triggerHandler("jqGridResetFrozenHeights");
				}
			});
		},
		navSeparatorAdd: function (elem, p) {
			p = $.extend({
				sepclass: "ui-separator",
				sepcontent: "",
				position: "last"
			}, p || {});
			return this.each(function () {
				if (!this.grid) { return; }
				if (typeof elem === "string" && elem.indexOf("#") !== 0) { elem = "#" + jqID(elem); }
				var findnav = $(".navtable", elem)[0];
				if (findnav.length > 0) {
					var sep = "<div class='ui-pg-button " + getGuiStateStyles.call(this, "disabled") + "'><span class='" + p.sepclass + "'></span>" + p.sepcontent + "</div>";
					if (p.position === "first") {
						if ($(">div.ui-pg-button", findnav).length === 0) {
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
		GridToForm: function (rowid, formid) {
			return this.each(function () {
				var $t = this, i, $field, iField, $fieldi;
				if (!$t.grid) { return; }
				var rowdata = $j.getRowData.call($($t), rowid), propOrAttr = $t.p.propOrAttr;
				if (rowdata) {
					for (i in rowdata) {
						if (rowdata.hasOwnProperty(i)) {
							$field = $("[name=" + jqID(i) + "]", formid);
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
		FormToGrid: function (rowid, formid, mode, position) {
			return this.each(function () {
				var $t = this;
				if (!$t.grid) { return; }
				if (!mode) { mode = "set"; }
				if (!position) { position = "first"; }
				var fields = $(formid).serializeArray();
				var griddata = {};
				$.each(fields, function (i, field) {
					griddata[field.name] = field.value;
				});
				if (mode === "add") {
					$j.addRowData.call($($t), rowid, griddata, position);
				} else if (mode === "set") {
					$j.setRowData.call($($t), rowid, griddata);
				}
			});
		}
	});
}(jQuery));
