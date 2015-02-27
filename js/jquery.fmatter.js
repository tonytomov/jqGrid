/*
**
 * formatter for values but most of the values if for jqGrid
 * Some of this was inspired and based on how YUI does the table datagrid but in jQuery fashion
 * we are trying to keep it as light as possible
 * Joshua Burnett josh@9ci.com
 * http://www.greenbill.com
 *
 * Changes from Tony Tomov tony@trirand.com
 * Changed by Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
**/
/*jshint eqeqeq:false */
/*jslint browser: true, devel: true, eqeq: true, evil: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, vars: true, white: true, maxerr: 999 */
/*global jQuery */

(function($) {
	"use strict";
	$.fmatter = $.fmatter || {};
	$.jgrid = $.jgrid || {};
	var fmatter = $.fmatter, jgrid = $.jgrid, getGridRes = jgrid.getMethod("getGridRes"); // locales = jgrid.locales, getRes = jgrid.getRes
	$.extend(true, jgrid, {
		formatter: { // setting common formatter settings, which are independent from the language and locale
			date: {
				parseRe: /[#%\\\/:_;.,\t\s\-]/,
				masks: {
					ISO8601Long: "Y-m-d H:i:s",
					ISO8601Short: "Y-m-d",
					SortableDateTime: "Y-m-d\\TH:i:s",
					UniversalSortableDateTime: "Y-m-d H:i:sO"
				},
				reformatAfterEdit: true,
				userLocalTime: false
			},
			baseLinkUrl: "",
			showAction: "",
			target: "",
			checkbox: { disabled: true },
			idName: "id"
		},
		cmTemplate: {
			integerStr: {
				formatter: "integer", align: "right", sorttype: "integer",
				searchoptions: { sopt: ["eq", "ne", "lt", "le", "gt", "ge"] }
			},
			integer: {
				formatter: "integer", align: "right", sorttype: "integer",
				convertOnSave: function (options) {
					var nData = options.newValue;
					return isNaN(nData) ? nData : parseInt(nData, 10);
				},
				searchoptions: { sopt: ["eq", "ne", "lt", "le", "gt", "ge"] }
			},
			numberStr: {
				formatter: "number", align: "right", sorttype: "number",
				searchoptions: { sopt: ["eq", "ne", "lt", "le", "gt", "ge"] }
			},
			number: {
				formatter: "number", align: "right", sorttype: "number",
				convertOnSave: function (options) {
					var nData = options.newValue;
					return isNaN(nData) ? nData : parseFloat(nData);
				},
				searchoptions: { sopt: ["eq", "ne", "lt", "le", "gt", "ge"] }
			},
			booleanCheckbox: {
				align: "center", formatter: "checkbox",
				edittype: "checkbox", editoptions: {value: "true:false", defaultValue: "false"},
				convertOnSave: function (options) {
					var nData = options.newValue, cm = options.cm,
						lnData = String(nData).toLowerCase(),
						cbv = cm.editoptions != null && typeof cm.editoptions.value === "string" ?
							cm.editoptions.value.split(":") : ["yes","no"];

					if ($.inArray(lnData, ["1", "true", cbv[0].toLowerCase()]) >= 0) {
						nData = true;
					} else if ($.inArray(lnData, ["0", "false", cbv[1].toLowerCase()]) >= 0) {
						nData = false;
					}
					return nData;
				},
				stype: "select", searchoptions: { sopt: ["eq", "ne"], value: ":Any;true:Yes;false:No" }
			},
			booleanCheckboxFa: {
				align: "center", formatter: "checkboxFontAwesome4",
				edittype: "checkbox", editoptions: {value: "true:false", defaultValue: "false"},
				convertOnSave: function (options) {
					var nData = options.newValue, cm = options.cm,
						lnData = String(nData).toLowerCase(),
						cbv = cm.editoptions != null && typeof cm.editoptions.value === "string" ?
							cm.editoptions.value.split(":") : ["yes","no"];

					if ($.inArray(lnData, ["1", "true", cbv[0].toLowerCase()]) >= 0) {
						nData = true;
					} else if ($.inArray(lnData, ["0", "false", cbv[1].toLowerCase()]) >= 0) {
						nData = false;
					}
					return nData;
				},
				stype: "select", searchoptions: { sopt: ["eq", "ne"], value: ":Any;true:Yes;false:No" }
			},
			// TODO: add cmTemplate for currency and date
			actions: function () {
				return {
					formatter: "actions",
					width: (this.p != null && this.p.fontAwesomeIcons ? 33 : 36) + ($.jgrid.cellWidth() ? 5 : 0),
					align: "center",
					autoResizable: false,
					frozen: true,
					fixed: true,
					resizable: false,
					sortable: false,
					search: false,
					editable: false,
					viewable: false
				};
			}
		}
	});

	//opts can be id:row id for the row, rowdata:the data for the row, colmodel:the column model for this column
	//example {id:1234,}
	$.extend(fmatter,{
		// one can consider to use $.type instead of some functions below (see http://api.jquery.com/jQuery.type/)
		isObject : function(o) {
			return (o && (typeof o === 'object' || $.isFunction(o))) || false;
		},
		isNumber : function(o) {
			// probably Number.isFinite can be used instead.
			return typeof o === 'number' && isFinite(o); // return false for +infinity, -infinity, or NaN 
		},
		isValue : function (o) {
			return (this.isObject(o) || typeof o === "string" || this.isNumber(o) || typeof o === 'boolean');
		},
		isEmpty : function(o) {
			if(typeof o !== "string" && this.isValue(o)) {
				return false;
			}
			if (!this.isValue(o)){
				return true;
			}
			o = $.trim(o).replace(/\&nbsp\;/ig,'').replace(/\&#160\;/ig,'');
			return o==="";	
		},
		NumberFormat : function(nData,opts) {
			var isNumber = fmatter.isNumber;
			if(!isNumber(nData)) {
				nData *= 1;
			}
			if(isNumber(nData)) {
				var bNegative = (nData < 0);
				var sOutput = String(nData);
				var sDecimalSeparator = opts.decimalSeparator || ".";
				var nDotIndex;
				if(isNumber(opts.decimalPlaces)) {
					// Round to the correct decimal place
					var nDecimalPlaces = opts.decimalPlaces;
					var nDecimal = Math.pow(10, nDecimalPlaces);
					sOutput = String(Math.round(nData*nDecimal)/nDecimal);
					nDotIndex = sOutput.lastIndexOf(".");
					if(nDecimalPlaces > 0) {
					// Add the decimal separator
						if(nDotIndex < 0) {
							sOutput += sDecimalSeparator;
							nDotIndex = sOutput.length-1;
						}
						// Replace the "."
						else if(sDecimalSeparator !== "."){
							sOutput = sOutput.replace(".",sDecimalSeparator);
						}
					// Add missing zeros
						while((sOutput.length - 1 - nDotIndex) < nDecimalPlaces) {
							sOutput += "0";
						}
					}
				}
				if(opts.thousandsSeparator) {
					var sThousandsSeparator = opts.thousandsSeparator;
					nDotIndex = sOutput.lastIndexOf(sDecimalSeparator);
					nDotIndex = (nDotIndex > -1) ? nDotIndex : sOutput.length;
					var sNewOutput = sOutput.substring(nDotIndex);
					var nCount = -1, i;
					for (i=nDotIndex; i>0; i--) {
						nCount++;
						if ((nCount%3 === 0) && (i !== nDotIndex) && (!bNegative || (i > 1))) {
							sNewOutput = sThousandsSeparator + sNewOutput;
						}
						sNewOutput = sOutput.charAt(i-1) + sNewOutput;
					}
					sOutput = sNewOutput;
				}
				// Prepend prefix
				sOutput = (opts.prefix) ? opts.prefix + sOutput : sOutput;
				// Append suffix
				sOutput = (opts.suffix) ? sOutput + opts.suffix : sOutput;
				return sOutput;
				
			}
			return nData;
		}
	});
	var $FnFmatter = function(formatType, cellval, opts, rwd, act) {
		// build main options before element iteration
		var v=cellval;
		opts = $.extend(true, {}, getGridRes.call($(this), "formatter"), opts);
		//$.extend(true, {}, getRes(locales[this.p.locale], "formatter"), jgrid.formatter, opts);

		try {
			v = $.fn.fmatter[formatType].call(this, cellval, opts, rwd, act);
		} catch(ignore){}
		return v;
	};
	$.fn.fmatter = $FnFmatter;
	$FnFmatter.defaultFormat = function(cellval, opts) {
		return (fmatter.isValue(cellval) && cellval!=="" ) ?  cellval : opts.defaultValue || "&#160;";
	};
	$FnFmatter.email = function(cellval, opts) {
		if(!fmatter.isEmpty(cellval)) {
			return "<a href=\"mailto:" + cellval + "\">" + cellval + "</a>";
		}
		return $FnFmatter.defaultFormat(cellval,opts );
	};
	$FnFmatter.checkbox =function(cval, opts) {
		var op = $.extend({},opts.checkbox), ds;
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if(fmatter.isEmpty(cval) || cval === undefined ) {cval = $FnFmatter.defaultFormat(cval,op);}
		cval=String(cval);
		cval=String(cval).toLowerCase();
		var bchk = cval.search(/(false|f|0|no|n|off|undefined)/i)<0 ? " checked='checked' " : "";
		return "<input type=\"checkbox\" " + bchk  + " value=\""+ cval+"\" offval=\"no\" "+ds+ "/>";
	};
	$FnFmatter.checkboxFontAwesome4 = function (cellValue, options) {
		var title = options.colModel.title !== false ? ' title="' + (options.colName || options.colModel.label || options.colModel.name) + '"' : '',
			strCellValue = String(cellValue).toLowerCase(),
			editoptions = options.colModel.editoptions,
			editYes = editoptions != null && typeof editoptions.value === "string" ? editoptions.value.split(":")[0] : "yes";
		return (cellValue === 1 || strCellValue === "1" || strCellValue === "x" || cellValue === true || strCellValue === "true" || strCellValue === "yes" || strCellValue === editYes) ?
			'<i class="fa fa-check-square-o fa-lg"' + title + '></i>' :
			'<i class="fa fa-square-o fa-lg"' + title + '></i>';
	};
	$FnFmatter.checkboxFontAwesome4.unformat = function (cellValue, options, elem) {
		var cbv = (options.colModel.editoptions != null && options.colModel.editoptions.value) ?
				options.colModel.editoptions.value.split(":") :
				["Yes", "No"];
		return $(">i", elem).hasClass("fa-check-square-o") ? cbv[0] : cbv[1];
	};
	$FnFmatter.link = function(cellval, opts) {
		var op = {target:opts.target};
		var target = "";
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.target) {target = 'target=' + op.target;}
		if(!fmatter.isEmpty(cellval)) {
			return "<a "+target+" href=\"" + cellval + "\">" + cellval + "</a>";
		}
		return $FnFmatter.defaultFormat(cellval,opts);
	};
	$FnFmatter.showlink = function(cellval, opts, rowData) {
		var self = this,
			op = {
				baseLinkUrl: opts.baseLinkUrl,
				showAction: opts.showAction,
				addParam: opts.addParam || "",
				target: opts.target,
				idName: opts.idName,
				hrefDefaultValue: "#"
			},
			target = "",
			idUrl,
			idParam,
			addParam,
			getOptionValue = function (option) {
				return $.isFunction(option) ?
					option.call(self, {
						cellValue: cellval,
						rowid: opts.rowId,
						rowData: rowData,
						options: op
					}):
					option || "";
			};
		
		if (opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({}, op, opts.colModel.formatoptions);
		}

		if (op.target) {
			target = 'target=' + getOptionValue(op.target);
		}
		idUrl = getOptionValue(op.baseLinkUrl) + getOptionValue(op.showAction);
		idParam = op.idName ? encodeURIComponent(getOptionValue(op.idName)) + '=' + encodeURIComponent(getOptionValue(op.rowId) || opts.rowId) : "";
		addParam = getOptionValue(op.addParam);
		if (typeof addParam === "object" && addParam !== null) {
			// add "&" only in case of usage object for of addParam
			addParam = (idParam !== "" ? "&" : "") + $.param(addParam);
		}
		idUrl += !idParam && !addParam ? "" : '?' + idParam + addParam;
		if (idUrl === "") {
			idUrl = getOptionValue(op.hrefDefaultValue);
		}
		if (typeof cellval === 'string' || fmatter.isNumber(cellval) || $.isFunction(op.cellValue)) {
			//add this one even if cellval is blank string
			return "<a "+target+" href=\"" + idUrl + "\">" +
				($.isFunction(op.cellValue) ? getOptionValue(op.cellValue) : cellval) +
				"</a>";
		}
		// the code below will be called typically for undefined cellval or 
		// if cellval have null value or some other unclear value like an object
		// and no cellValue callback function are defined "to decode" the value
		return $FnFmatter.defaultFormat(cellval,opts);
	};
	var numberHelper = function(cellval, opts, formatType) {
		var op = $.extend({},opts[formatType]);
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(fmatter.isEmpty(cellval)) {
			return op.defaultValue;
		}
		return fmatter.NumberFormat(cellval,op);
	};
	$FnFmatter.integer = function(cellval, opts) {
		return numberHelper(cellval,opts,"integer");
	};
	$FnFmatter.number = function (cellval, opts) {
		return numberHelper(cellval,opts,"number");
	};
	$FnFmatter.currency = function (cellval, opts) {
		return numberHelper(cellval,opts,"currency");
	};
	$FnFmatter.date = function (cellval, opts, rwd, act) {
		var op = $.extend({},opts.date);
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(!op.reformatAfterEdit && act === 'edit'){
			return $FnFmatter.defaultFormat(cellval, opts);
		}
		if(!fmatter.isEmpty(cellval)) {
			return jgrid.parseDate.call(this,op.srcformat,cellval,op.newformat,op);
		}
		return $FnFmatter.defaultFormat(cellval, opts);
	};
	$FnFmatter.select = function (cellval,opts) {
		// jqGrid specific
		cellval = String(cellval);
		var oSelect = false, ret=[], sep, delim;
		if(opts.colModel.formatoptions !== undefined){
			oSelect= opts.colModel.formatoptions.value;
			sep = opts.colModel.formatoptions.separator === undefined ? ":" : opts.colModel.formatoptions.separator;
			delim = opts.colModel.formatoptions.delimiter === undefined ? ";" : opts.colModel.formatoptions.delimiter;
		} else if(opts.colModel.editoptions !== undefined){
			oSelect= opts.colModel.editoptions.value;
			sep = opts.colModel.editoptions.separator === undefined ? ":" : opts.colModel.editoptions.separator;
			delim = opts.colModel.editoptions.delimiter === undefined ? ";" : opts.colModel.editoptions.delimiter;
		}
		if (oSelect) {
			var	msl =  (opts.colModel.editoptions != null && opts.colModel.editoptions.multiple === true) === true ? true : false,
			scell = [], sv, mapFunc = function(n,i){if(i>0) {return n;}};
			if(msl) {scell = cellval.split(",");scell = $.map(scell,function(n){return $.trim(n);});}
			if (typeof oSelect === "string") {
				// mybe here we can use some caching with care ????
				var so = oSelect.split(delim), j=0, i;
				for(i=0; i<so.length;i++){
					sv = so[i].split(sep);
					if(sv.length > 2 ) {
						sv[1] = $.map(sv,mapFunc).join(sep);
					}
					if(msl) {
						if($.inArray($.trim(sv[0]),scell)>-1) {
							ret[j] = sv[1];
							j++;
						}
					} else if($.trim(sv[0]) === $.trim(cellval)) {
						ret[0] = sv[1];
						break;
					}
				}
			} else if(fmatter.isObject(oSelect)) {
				// this is quicker
				if(msl) {
					ret = $.map(scell, function(n){
						return oSelect[n];
					});
				} else {
					ret[0] = oSelect[cellval] || "";
				}
			}
		}
		cellval = ret.join(", ");
		return  cellval === "" ? $FnFmatter.defaultFormat(cellval,opts) : cellval;
	};
	$FnFmatter.rowactions = function(e, act) {
		var $tr = $(this).closest("tr.jqgrow"),rid = $tr.attr("id"),
			$id = $(this).closest("table.ui-jqgrid-btable").attr('id').replace(/_frozen([^_]*)$/,'$1'),
			$grid = $("#"+jgrid.jqID($id)),
			$t = $grid[0],
			p = $t.p,
			cm = p.colModel[jgrid.getCellIndex(this)],
			op = $.extend(true, { extraparam: {}}, cm.formatoptions || {});

		if (p.editOptions !== undefined) {
			op.editOptions = p.editOptions;
		}
		if (p.delOptions !== undefined) {
			op.delOptions = p.delOptions;
		}
		if ($tr.hasClass("jqgrid-new-row")){
			op.extraparam[p.prmNames.oper] = p.prmNames.addoper;
		}
		var actop = {
			keys: op.keys,
			oneditfunc: op.onEdit,
			successfunc: op.onSuccess,
			url: op.url,
			extraparam: op.extraparam,
			aftersavefunc: op.afterSave,
			errorfunc: op.onError,
			afterrestorefunc: op.afterRestore,
			restoreAfterError: op.restoreAfterError,
			mtype: op.mtype
		};
		if ((!p.multiselect && rid !== p.selrow) || (p.multiselect && $.inArray(rid, p.selarrrow) < 0)) {
			$grid.jqGrid('setSelection', rid, true, e);
		} else {
			jgrid.fullBoolFeedback.call($t, "onSelectRow", "jqGridSelectRow", rid, true, e);
		}
		switch(act)	{
			case 'edit':
				$grid.jqGrid('editRow', rid, actop);
				break;
			case 'save':
				$grid.jqGrid('saveRow', rid, actop);
				break;
			case 'cancel' :
				$grid.jqGrid('restoreRow', rid, op.afterRestore);
				break;
			case 'del':
				$grid.jqGrid('delGridRow', rid, op.delOptions);
				break;
			case 'formedit':
				$grid.jqGrid('editGridRow', rid, op.editOptions);
				break;
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		return false; // prevent other processing of the click on the row
	};
	$FnFmatter.actions = function(cellval,opts) {
		var rowid = opts.rowId, str = "", ocl, $t = this, p = $t.p, $self = $($t), //locale = jgrid.locales[p.locale],
			//navRegional = getRes(locale, "nav") || {},
			//nav = $.extend(true, {}, navRegional, jgrid.nav || {}),
			edit = getGridRes.call($self, "edit") || {},
			//edit = $.extend(true, {}, getRes(locale, "edit") || {}, jgrid.edit || {}),
			op = $.extend({
				editbutton: true,
				delbutton: true,
				editformbutton: false,
				commonIconClass: "ui-icon",
				editicon: "ui-icon-pencil",
				delicon: "ui-icon-trash",
				//addicon: "ui-icon-plus",
				saveicon: "ui-icon-disk",
				cancelicon: "ui-icon-cancel",
				//edittitle: nav.edittitle,
				//deltitle: nav.deltitle,
				savetitle: edit.bSubmit || "",
				canceltitle: edit.bCancel || ""
			},
			getGridRes.call($self, "nav") || {},
			jgrid.nav || {},
			p.navOptions || {},
			getGridRes.call($self, "actionsNav") || {},
			jgrid.actionsNav || {},
			p.actionsNavOptions || {},
			opts.colModel.formatoptions || {}),
			cssIconClass = function (name) {
				return jgrid.mergeCssClasses(op.commonIconClass, op[name + "icon"]);
			};

		if(rowid === undefined || fmatter.isEmpty(rowid)) {return "";}
		if(op.editformbutton){
			ocl = "id='jEditButton_"+rowid+"' onclick=\"return jQuery.fn.fmatter.rowactions.call(this,event,'formedit');\" onmouseover=jQuery(this).addClass('ui-state-hover'); onmouseout=jQuery(this).removeClass('ui-state-hover'); ";
			str += "<div title='"+op.edittitle+"' class='ui-pg-div ui-inline-edit' "+ocl+"><span class='" + cssIconClass("edit") + "'></span></div>";
		} else if(op.editbutton){
			ocl = "id='jEditButton_"+rowid+"' onclick=\"return jQuery.fn.fmatter.rowactions.call(this,event,'edit');\" onmouseover=jQuery(this).addClass('ui-state-hover'); onmouseout=jQuery(this).removeClass('ui-state-hover') ";
			str += "<div title='"+op.edittitle+"' class='ui-pg-div ui-inline-edit' "+ocl+"><span class='" + cssIconClass("edit") + "'></span></div>";
		}
		if(op.delbutton) {
			ocl = "id='jDeleteButton_"+rowid+"' onclick=\"return jQuery.fn.fmatter.rowactions.call(this,event,'del');\" onmouseover=jQuery(this).addClass('ui-state-hover'); onmouseout=jQuery(this).removeClass('ui-state-hover'); ";
			str += "<div title='"+op.deltitle+"' class='ui-pg-div ui-inline-del' "+ocl+"><span class='" + cssIconClass("del") + "'></span></div>";
		}
		ocl = "id='jSaveButton_"+rowid+"' onclick=\"return jQuery.fn.fmatter.rowactions.call(this,event,'save');\" onmouseover=jQuery(this).addClass('ui-state-hover'); onmouseout=jQuery(this).removeClass('ui-state-hover'); ";
		str += "<div title='"+op.savetitle+"' style='display:none' class='ui-pg-div ui-inline-save' "+ocl+"><span class='" + cssIconClass("save") + "'></span></div>";
		ocl = "id='jCancelButton_"+rowid+"' onclick=\"return jQuery.fn.fmatter.rowactions.call(this,event,'cancel');\" onmouseover=jQuery(this).addClass('ui-state-hover'); onmouseout=jQuery(this).removeClass('ui-state-hover'); ";
		str += "<div title='"+op.canceltitle+"' style='display:none;' class='ui-pg-div ui-inline-cancel' "+ocl+"><span class='" + cssIconClass("cancel") + "'></span></div>";
		return "<div class='ui-jqgrid-actions'>" + str + "</div>";
	};
	$FnFmatter.actions.pageFinalization = function (iCol) {
		var $self = $(this), p = this.p, colModel = p.colModel, cm = colModel[iCol],
			showHideEditDelete = function (show, rowid) {
				// TODO: implement support for frozen columns
				// if(cm.frozen && p.frozenColumns) {} && iCol < number of frozen columns in the table of the frozen div
				var tr = $self.jqGrid("getGridRowById", rowid);
				if (tr != null && tr.cells != null) {
					//$actionsDiv = cm.frozen ? $("tr#"+jgrid.jqID(rid)+" td:eq("+jgrid.getCellIndex(this)+") > div",$grid) :$(this).parent(),
					var $actionsDiv = $(tr.cells[iCol]).children(".ui-jqgrid-actions");
					if (show) {
						$actionsDiv.find(">.ui-inline-edit,>.ui-inline-del").show();
						$actionsDiv.find(">.ui-inline-save,>.ui-inline-cancel").hide();
					} else {
						$actionsDiv.find(">.ui-inline-edit,>.ui-inline-del").hide();
						$actionsDiv.find(">.ui-inline-save,>.ui-inline-cancel").show();
					}
				}
			},
			showEditDelete = function (e, rowid) {
				showHideEditDelete(true, rowid);
				return false;
			},
			hideEditDelete = function (e, rowid) {
				showHideEditDelete(false, rowid);
				return false;
			};
		if (cm.formatoptions == null || !cm.formatoptions.editformbutton) {
			// we use unbind to be sure that we don't register the same events multiple times
			$self.unbind("jqGridInlineAfterRestoreRow.jqGridFormatter jqGridInlineAfterSaveRow.jqGridFormatter", showEditDelete);
			$self.bind("jqGridInlineAfterRestoreRow.jqGridFormatter jqGridInlineAfterSaveRow.jqGridFormatter", showEditDelete);
			$self.unbind("jqGridInlineEditRow.jqGridFormatter", hideEditDelete);
			$self.bind("jqGridInlineEditRow.jqGridFormatter", hideEditDelete);
		}
	};
	$.unformat = function (cellval,options,pos,cnt) {
		// specific for jqGrid only
		var ret, formatType = options.colModel.formatter, p = this.p,
		op =options.colModel.formatoptions || {}, sep,
		re = /([\.\*\_\'\(\)\{\}\+\?\\])/g,
		unformatFunc = options.colModel.unformat||($FnFmatter[formatType] && $FnFmatter[formatType].unformat);
		if (cellval instanceof jQuery && cellval.length > 0) {
			cellval = cellval[0];
		}
		if (options.colModel.autoResizable && cellval != null && $(cellval.firstChild).hasClass(p.autoResizing.wrapperClassName)) {
			cellval = cellval.firstChild;
		}
		if(unformatFunc !== undefined && $.isFunction(unformatFunc) ) {
			ret = unformatFunc.call(this, $(cellval).text(), options, cellval);
		} else if(formatType !== undefined && typeof formatType === "string") {
			//var opts = $.extend(true, {}, getRes(locales[p.locale], "formatter"), jgrid.formatter || {}), stripTag;
			var opts = getGridRes.call($(this), "formatter"), stripTag;
			switch(formatType) {
				case 'integer' :
					op = $.extend({},opts.integer,op);
					sep = op.thousandsSeparator.replace(re,"\\$1");
					stripTag = new RegExp(sep, "g");
					ret = $(cellval).text().replace(stripTag,'');
					break;
				case 'number' :
					op = $.extend({},opts.number,op);
					sep = op.thousandsSeparator.replace(re,"\\$1");
					stripTag = new RegExp(sep, "g");
					ret = $(cellval).text().replace(stripTag,"").replace(op.decimalSeparator,'.');
					break;
				case 'currency':
					op = $.extend({},opts.currency,op);
					sep = op.thousandsSeparator.replace(re,"\\$1");
					stripTag = new RegExp(sep, "g");
					ret = $(cellval).text();
					if (op.prefix && op.prefix.length) {
						ret = ret.substr(op.prefix.length);
					}
					if (op.suffix && op.suffix.length) {
						ret = ret.substr(0, ret.length - op.suffix.length);
					}
					ret = ret.replace(stripTag,'').replace(op.decimalSeparator,'.');
					break;
				case 'checkbox':
					var cbv = (options.colModel.editoptions != null && typeof options.colModel.editoptions.value === "string") ?
							options.colModel.editoptions.value.split(":") :
							["Yes","No"];
					ret = $('input',cellval).is(":checked") ? cbv[0] : cbv[1];
					break;
				case 'select' :
					ret = $.unformat.select(cellval,options,pos,cnt);
					break;
				case 'actions':
					return "";
				default:
					ret= $(cellval).text();
			}
		}
		ret = ret !== undefined ? ret : cnt===true ? $(cellval).text() : jgrid.htmlDecode($(cellval).html());
		return ret;
	};
	$.unformat.select = function (cellval,options,pos,cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [];
		var cell = $(cellval).text();
		if(cnt===true) {return cell;}
		var op = $.extend({}, options.colModel.formatoptions !== undefined ? options.colModel.formatoptions: options.colModel.editoptions),
		sep = op.separator === undefined ? ":" : op.separator,
		delim = op.delimiter === undefined ? ";" : op.delimiter;
		
		if(op.value){
			var oSelect = op.value,
			msl =  op.multiple === true ? true : false,
			scell = [], sv, mapFunc = function(n,i){if(i>0) {return n;}};
			if(msl) {scell = cell.split(",");scell = $.map(scell,function(n){return $.trim(n);});}
			if (typeof oSelect === "string") {
				var so = oSelect.split(delim), j=0, i;
				for(i=0; i<so.length;i++){
					sv = so[i].split(sep);
					if(sv.length > 2 ) {
						sv[1] = $.map(sv,mapFunc).join(sep);
					}					
					if(msl) {
						if($.inArray($.trim(sv[1]),scell)>-1) {
							ret[j] = sv[0];
							j++;
						}
					} else if($.trim(sv[1]) === $.trim(cell)) {
						ret[0] = sv[0];
						break;
					}
				}
			} else if(fmatter.isObject(oSelect) || $.isArray(oSelect) ){
				if(!msl) {scell[0] =  cell;}
				ret = $.map(scell, function(n){
					var rv;
					$.each(oSelect, function(i,val){
						if (val === n) {
							rv = i;
							return false;
						}
					});
					if( rv !== undefined ) {return rv;}
				});
			}
			return ret.join(", ");
		}
		return cell || "";
	};
	$.unformat.date = function (cellval, opts) {
		// TODO
		var op = $.extend(true, {},
				//getRes(locales[this.p.locale], "formatter.date"),
				getGridRes.call($(this), "formatter.date"),
				jgrid.formatter != null && jgrid.formatter.date != null ? jgrid.formatter.date : {});

		if(opts.formatoptions !== undefined) {
			op = $.extend({},op,opts.formatoptions);
		}		
		if(!fmatter.isEmpty(cellval)) {
			return jgrid.parseDate.call(this,op.newformat,cellval,op.srcformat,op);
		}
		return $FnFmatter.defaultFormat(cellval, opts);
	};
}(jQuery));
