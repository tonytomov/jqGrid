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
/*jslint eqeq: true, plusplus: true, unparam: true, vars: true, regexp: true, white: true, todo: true */
/*global jQuery */

(function ($) {
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
				edittype: "checkbox", editoptions: { value: "true:false", defaultValue: "false" },
				convertOnSave: function (options) {
					var nData = options.newValue, cm = options.cm,
						lnData = String(nData).toLowerCase(),
						cbv = cm.editoptions != null && typeof cm.editoptions.value === "string" ?
							cm.editoptions.value.split(":") : ["yes", "no"];

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
				edittype: "checkbox", editoptions: { value: "true:false", defaultValue: "false" },
				convertOnSave: function (options) {
					var nData = options.newValue, cm = options.cm,
						lnData = String(nData).toLowerCase(),
						cbv = cm.editoptions != null && typeof cm.editoptions.value === "string" ?
							cm.editoptions.value.split(":") : ["yes", "no"];

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
					width: (this.p != null && this.p.fontAwesomeIcons ? 33 : 37) + (jgrid.cellWidth() ? 5 : 0),
					align: "center",
					label: "",
					autoResizable: false,
					frozen: true,
					fixed: true,
					hidedlg: true,
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
	$.extend(fmatter, {
		// one can consider to use $.type instead of some functions below (see http://api.jquery.com/jQuery.type/)
		isObject: function (o) {
			return (o && (typeof o === "object" || $.isFunction(o))) || false;
		},
		isNumber: function (o) {
			// probably Number.isFinite can be used instead.
			return typeof o === "number" && isFinite(o); // return false for +infinity, -infinity, or NaN 
		},
		isValue: function (o) {
			return (this.isObject(o) || typeof o === "string" || this.isNumber(o) || typeof o === "boolean");
		},
		isEmpty: function (o) {
			if (typeof o !== "string" && this.isValue(o)) {
				return false;
			}
			if (!this.isValue(o)) {
				return true;
			}
			o = $.trim(o).replace(/\&nbsp\;/ig, "").replace(/\&#160\;/ig, "");
			return o === "";
		},
		NumberFormat: function (nData, opts) {
			var isNumber = fmatter.isNumber;
			if (!isNumber(nData)) {
				nData *= 1;
			}
			if (isNumber(nData)) {
				var bNegative = (nData < 0);
				var sOutput = String(nData);
				var sDecimalSeparator = opts.decimalSeparator || ".";
				var nDotIndex;
				if (isNumber(opts.decimalPlaces)) {
					// Round to the correct decimal place
					var nDecimalPlaces = opts.decimalPlaces;
					var nDecimal = Math.pow(10, nDecimalPlaces);
					sOutput = String(Math.round(nData * nDecimal) / nDecimal);
					nDotIndex = sOutput.lastIndexOf(".");
					if (nDecimalPlaces > 0) {
						// Add the decimal separator
						if (nDotIndex < 0) {
							sOutput += sDecimalSeparator;
							nDotIndex = sOutput.length - 1;
						} else if (sDecimalSeparator !== ".") { // Replace the "."
							sOutput = sOutput.replace(".", sDecimalSeparator);
						}
						// Add missing zeros
						while ((sOutput.length - 1 - nDotIndex) < nDecimalPlaces) {
							sOutput += "0";
						}
					}
				}
				if (opts.thousandsSeparator) {
					var sThousandsSeparator = opts.thousandsSeparator;
					nDotIndex = sOutput.lastIndexOf(sDecimalSeparator);
					nDotIndex = (nDotIndex > -1) ? nDotIndex : sOutput.length;
					// we cut the part after the point for integer numbers
					// it will prevent storing/restoring of wrong numbers during inline editing
					var sNewOutput = opts.decimalSeparator === undefined ? "" : sOutput.substring(nDotIndex);
					var nCount = -1, i;
					for (i = nDotIndex; i > 0; i--) {
						nCount++;
						if ((nCount % 3 === 0) && (i !== nDotIndex) && (!bNegative || (i > 1))) {
							sNewOutput = sThousandsSeparator + sNewOutput;
						}
						sNewOutput = sOutput.charAt(i - 1) + sNewOutput;
					}
					sOutput = sNewOutput;
				}
				return sOutput;

			}
			return nData;
		}
	});
	var $FnFmatter = function (formatType, cellval, opts, rwd, act) {
		// build main options before element iteration
		var v = cellval;
		opts = $.extend({}, getGridRes.call($(this), "formatter"), opts);

		try {
			v = $.fn.fmatter[formatType].call(this, cellval, opts, rwd, act);
		} catch (ignore) { }
		return v;
	};
	$.fn.fmatter = $FnFmatter;
	$FnFmatter.getCellBuilder = function (formatType, opts, act) {
		var cellBuilder = $.fn.fmatter[formatType] != null ? $.fn.fmatter[formatType].getCellBuilder : null;
		return $.isFunction(cellBuilder) ?
			cellBuilder.call(this, $.extend({}, getGridRes.call($(this), "formatter"), opts), act) :
			null;
	};
	$FnFmatter.defaultFormat = function (cellval, opts) {
		return (fmatter.isValue(cellval) && cellval !== "") ? cellval : opts.defaultValue || "&#160;";
	};
	var defaultFormat = $FnFmatter.defaultFormat;
	$FnFmatter.email = function (cellval, opts) {
		if (!fmatter.isEmpty(cellval)) {
			return "<a href=\"mailto:" + cellval + "\">" + cellval + "</a>";
		}
		return defaultFormat(cellval, opts);
	};
	$FnFmatter.checkbox = function (cval, opts) {
		var colModel = opts.colModel, op = $.extend({}, opts.checkbox), ds;
		if (colModel != null) {
			op = $.extend({}, op, colModel.formatoptions || {});
		}
		if (op.disabled === true) { ds = "disabled=\"disabled\""; } else { ds = ""; }
		if (fmatter.isEmpty(cval) || cval === undefined) { cval = defaultFormat(cval, op); }
		cval = String(cval);
		cval = String(cval).toLowerCase();
		var bchk = cval.search(/(false|f|0|no|n|off|undefined)/i) < 0 ? " checked='checked' " : "";
		return "<input type=\"checkbox\" " + bchk + " value=\"" + cval + "\" data-offval=\"no\" " + ds + "/>";
	};
	$FnFmatter.checkbox.getCellBuilder = function (opts) {
		var colModel = opts.colModel, op = $.extend({}, opts.checkbox), tagEnd;
		if (colModel != null) {
			op = $.extend({}, op, colModel.formatoptions || {});
		}
		tagEnd = "\" data-offval=\"no\" " + (op.disabled === true ? "disabled=\"disabled\"" : "") + "/>";
		return function (cval) {
			if (fmatter.isEmpty(cval) || cval === undefined) { cval = defaultFormat(cval, op); }
			cval = String(cval).toLowerCase();
			return "<input type=\"checkbox\" " +
				(cval.search(/(false|f|0|no|n|off|undefined)/i) < 0 ? " checked='checked' " : "") +
				" value=\"" + cval + tagEnd;
		};
	};
	$FnFmatter.checkboxFontAwesome4 = function (cellValue, options) {
		var colModel = options.colModel, title = colModel.title !== false ? ' title="' + (options.colName || colModel.label || colModel.name) + '"' : "",
			strCellValue = String(cellValue).toLowerCase(),
			editoptions = colModel.editoptions || {},
			editYes = typeof editoptions.value === "string" ? editoptions.value.split(":")[0] : "yes";
		return (cellValue === 1 || strCellValue === "1" || strCellValue === "x" || cellValue === true || strCellValue === "true" || strCellValue === "yes" || strCellValue === editYes) ?
				'<i class="fa fa-check-square-o fa-lg"' + title + "></i>" :
				'<i class="fa fa-square-o fa-lg"' + title + "></i>";
	};
	$FnFmatter.checkboxFontAwesome4.getCellBuilder = function (options) {
		var colModel = options.colModel, title = colModel.title !== false ? ' title="' + (options.colName || colModel.label || colModel.name) + '"' : "",
			editoptions = colModel.editoptions || {},
			editYes = typeof editoptions.value === "string" ? editoptions.value.split(":")[0] : "yes",
			checked = '<i class="fa fa-check-square-o fa-lg"' + title + "></i>",
			unchecked = '<i class="fa fa-square-o fa-lg"' + title + "></i>";
		return function (cellValue) {
			var strCellValue = String(cellValue).toLowerCase();
			return (cellValue === true || cellValue === 1 || strCellValue === "1" || strCellValue === "x" || strCellValue === "true" || strCellValue === "yes" || strCellValue === editYes) ?
				checked : unchecked;
		};
	};
	$FnFmatter.checkboxFontAwesome4.unformat = function (cellValue, options, elem) {
		var colModel = options.colModel, editoptions = colModel.editoptions || {},
			cbv = typeof editoptions.value === "string" ? editoptions.value.split(":") : ["Yes", "No"];
		return $(">i", elem).hasClass("fa-check-square-o") ? cbv[0] : cbv[1];
	};
	$FnFmatter.link = function (cellval, opts) {
		var colModel = opts.colModel, target = "", op = { target: opts.target };
		if (colModel != null) {
			op = $.extend({}, op, colModel.formatoptions || {});
		}
		if (op.target) { target = "target=" + op.target; }
		if (!fmatter.isEmpty(cellval)) {
			return "<a " + target + " href=\"" + cellval + "\">" + cellval + "</a>";
		}
		return defaultFormat(cellval, op);
	};
	$FnFmatter.showlink = function (cellval, opts, rowData) {
		var self = this, colModel = opts.colModel,
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
						}) :
						option || "";
			};

		if (colModel != null) {
			op = $.extend({}, op, colModel.formatoptions || {});
		}

		if (op.target) {
			target = "target=" + getOptionValue(op.target);
		}
		idUrl = getOptionValue(op.baseLinkUrl) + getOptionValue(op.showAction);
		idParam = op.idName ? encodeURIComponent(getOptionValue(op.idName)) + "=" + encodeURIComponent(getOptionValue(op.rowId) || opts.rowId) : "";
		addParam = getOptionValue(op.addParam);
		if (typeof addParam === "object" && addParam !== null) {
			// add "&" only in case of usage object for of addParam
			addParam = (idParam !== "" ? "&" : "") + $.param(addParam);
		}
		idUrl += !idParam && !addParam ? "" : "?" + idParam + addParam;
		if (idUrl === "") {
			idUrl = getOptionValue(op.hrefDefaultValue);
		}
		if (typeof cellval === "string" || fmatter.isNumber(cellval) || $.isFunction(op.cellValue)) {
			//add this one even if cellval is blank string
			return "<a " + target + " href=\"" + idUrl + "\">" +
				($.isFunction(op.cellValue) ? getOptionValue(op.cellValue) : cellval) +
				"</a>";
		}
		// the code below will be called typically for undefined cellval or 
		// if cellval have null value or some other unclear value like an object
		// and no cellValue callback function are defined "to decode" the value
		return defaultFormat(cellval, op);
	};
	$FnFmatter.showlink.getCellBuilder = function (opts) {
		var op = {
				baseLinkUrl: opts.baseLinkUrl,
				showAction: opts.showAction,
				addParam: opts.addParam || "",
				target: opts.target,
				idName: opts.idName,
				hrefDefaultValue: "#"
			},
			colModel = opts.colModel;

		if (colModel != null) {
			op = $.extend({}, op, colModel.formatoptions || {});
		}

		return function (cellval, opts, rowData) {
			var self = this, rowid = opts.rowId, target = "", idUrl, idParam, addParam,
				getOptionValue = function (option) {
					return $.isFunction(option) ?
							option.call(self, {
								cellValue: cellval,
								rowid: rowid,
								rowData: rowData,
								options: op
							}) :
							option || "";
				};
			if (op.target) {
				target = "target=" + getOptionValue(op.target);
			}
			idUrl = getOptionValue(op.baseLinkUrl) + getOptionValue(op.showAction);
			idParam = op.idName ? encodeURIComponent(getOptionValue(op.idName)) + "=" + encodeURIComponent(getOptionValue(rowid) || opts.rowId) : "";
			addParam = getOptionValue(op.addParam);
			if (typeof addParam === "object" && addParam !== null) {
				// add "&" only in case of usage object for of addParam
				addParam = (idParam !== "" ? "&" : "") + $.param(addParam);
			}
			idUrl += !idParam && !addParam ? "" : "?" + idParam + addParam;
			if (idUrl === "") {
				idUrl = getOptionValue(op.hrefDefaultValue);
			}
			if (typeof cellval === "string" || fmatter.isNumber(cellval) || $.isFunction(op.cellValue)) {
				//add this one even if cellval is blank string
				return "<a " + target + " href=\"" + idUrl + "\">" +
					($.isFunction(op.cellValue) ? getOptionValue(op.cellValue) : cellval) +
					"</a>";
			}
			// the code below will be called typically for undefined cellval or 
			// if cellval have null value or some other unclear value like an object
			// and no cellValue callback function are defined "to decode" the value
			return defaultFormat(cellval, op);
		};
	};
	$FnFmatter.showlink.pageFinalization = function (iCol) {
		var $self = $(this), p = this.p, colModel = p.colModel, cm = colModel[iCol], iRow, rows = this.rows, nRows = rows.length, row, td,
			onClick = function (e) {
				var $tr = $(this).closest(".jqgrow");
				if ($tr.length > 0) {
					return cm.formatoptions.onClick.call($self[0], {
						iCol: iCol,
						iRow: $tr[0].rowIndex,
						rowid: $tr.attr("id"),
						cm: cm,
						cmName: cm.name,
						cellValue: $(this).text(),
						a: this,
						event: e
					});
				}
			};
		if (cm.formatoptions != null && $.isFunction(cm.formatoptions.onClick)) {
			for (iRow = 0; iRow < nRows; iRow++) {
				row = rows[iRow];
				if ($(row).hasClass("jqgrow")) {
					td = row.cells[iCol];
					if (cm.autoResizable && td != null && $(td.firstChild).hasClass(p.autoResizing.wrapperClassName)) {
						td = td.firstChild;
					}
					$(td.firstChild).bind("click", onClick);
				}
			}
		}
	};
	var insertPrefixAndSuffix = function (sOutput, opts) {
			// Prepend prefix
			sOutput = (opts.prefix) ? opts.prefix + sOutput : sOutput;
			// Append suffix
			return (opts.suffix) ? sOutput + opts.suffix : sOutput;
		},
		numberHelper = function (cellval, opts, formatType) {
			var colModel = opts.colModel, op = $.extend({}, opts[formatType]);
			if (colModel != null) {
				op = $.extend({}, op, colModel.formatoptions || {});
			}
			if (fmatter.isEmpty(cellval)) {
				return insertPrefixAndSuffix(op.defaultValue, op);
			}
			return insertPrefixAndSuffix(fmatter.NumberFormat(cellval, op), op);
		};
	$FnFmatter.integer = function (cellval, opts) {
		return numberHelper(cellval, opts, "integer");
	};
	$FnFmatter.number = function (cellval, opts) {
		return numberHelper(cellval, opts, "number");
	};
	$FnFmatter.currency = function (cellval, opts) {
		return numberHelper(cellval, opts, "currency");
	};
	
	var numberCellBuilder = function (opts, formatType) {
		var colModel = opts.colModel, op = $.extend({}, opts[formatType]);
		if (colModel != null) {
			op = $.extend({}, op, colModel.formatoptions || {});
		}
		var numberFormat = fmatter.NumberFormat,
			defaultValue = op.defaultValue ? insertPrefixAndSuffix(op.defaultValue, op) : "";

		return function (cellValue) {
			if (fmatter.isEmpty(cellValue)) { return defaultValue; }
			return insertPrefixAndSuffix(numberFormat(cellValue, op), op);
		};
	};
	$FnFmatter.integer.getCellBuilder = function (options) {
		return numberCellBuilder(options, "integer");
	};
	$FnFmatter.number.getCellBuilder = function (options) {
		return numberCellBuilder(options, "number");
	};
	$FnFmatter.currency.getCellBuilder = function (options) {
		return numberCellBuilder(options, "currency");
	};
	$FnFmatter.date = function (cellval, opts, rwd, act) {
		var colModel = opts.colModel, op = $.extend({}, opts.date);
		if (colModel != null) {
			op = $.extend({}, op, colModel.formatoptions || {});
		}
		if (!op.reformatAfterEdit && act === "edit") {
			return defaultFormat(cellval, op);
		}
		if (!fmatter.isEmpty(cellval)) {
			return jgrid.parseDate.call(this, op.srcformat, cellval, op.newformat, op);
		}
		return defaultFormat(cellval, op);
	};
	$FnFmatter.date.getCellBuilder = function (opts, act) {
		var op = $.extend({}, opts.date);
		if (opts.colModel != null) {
			op = $.extend({}, op, opts.colModel.formatoptions || {});
		}
		var parseDate = jgrid.parseDate,
			srcformat = op.srcformat, newformat = op.newformat;
		if (!op.reformatAfterEdit && act === "edit") {
			return function (cellValue) {
				return defaultFormat(cellValue, op);
			};
		}
		return function (cellValue) {
			return fmatter.isEmpty(cellValue) ?
				defaultFormat(cellValue, op) :
				parseDate.call(this, srcformat, cellValue, newformat, op);
		};
	};
	$FnFmatter.select = function (cellval, opts) {
		var ret = [], colModel = opts.colModel, defaultValue,
			op = $.extend({}, colModel.editoptions || {}, colModel.formatoptions || {}),
			oSelect = op.value, sep = op.separator || ":", delim = op.delimiter || ";";
		if (oSelect) {
			var msl = op.multiple === true ? true : false, scell = [], sv,
			mapFunc = function (n, i) { if (i > 0) { return n; } };
			if (msl) {
				scell = $.map(String(cellval).split(","), function (n) { return $.trim(n); });
			}
			if (typeof oSelect === "string") {
				// maybe here we can use some caching with care ????
				var so = oSelect.split(delim), i, v;
				for (i = 0; i < so.length; i++) {
					sv = so[i].split(sep);
					if (sv.length > 2) {
						sv[1] = $.map(sv, mapFunc).join(sep);
					}
					v = $.trim(sv[0]);
					if (op.defaultValue === v) {
						defaultValue = sv[1];
					}
					if (msl) {
						if ($.inArray(v, scell) > -1) {
							ret.push(sv[1]);
						}
					} else if (v === $.trim(cellval)) {
						ret = [sv[1]];
						break;
					}
				}
			} else if (fmatter.isObject(oSelect)) {
				defaultValue = oSelect[op.defaultValue];
				if (msl) {
					ret = $.map(scell, function (n) {
						return oSelect[n];
					});
				} else {
					ret = [oSelect[cellval] === undefined ? "" : oSelect[cellval]];
				}
			}
		}
		cellval = ret.join(", ");
		return cellval !== "" ? cellval :
				(op.defaultValue !== undefined ? defaultValue : defaultFormat(cellval, op));
	};
	$FnFmatter.select.getCellBuilder = function (opts) {
		// jqGrid specific
		var colModel = opts.colModel, $fnDefaultFormat = $FnFmatter.defaultFormat,
			op = $.extend({}, colModel.editoptions || {}, colModel.formatoptions || {}),
			oSelect = op.value, sep = op.separator || ":", delim = op.delimiter || ";",
			defaultValue, defaultValueDefined = op.defaultValue !== undefined,
			isMultiple = op.multiple === true ? true : false, sv, so, i, nOpts, selOptions = {},
			mapFunc = function (n, i) { if (i > 0) { return n; } };
		if (typeof oSelect === "string") {
			// maybe here we can use some caching with care ????
			so = oSelect.split(delim);
			nOpts = so.length;
			for (i = nOpts - 1; i >= 0; i--) {
				sv = so[i].split(sep);
				if (sv.length > 2) {
					sv[1] = $.map(sv, mapFunc).join(sep);
				}
				selOptions[$.trim(sv[0])] = sv[1];
			}
		} else if (fmatter.isObject(oSelect)) {
			selOptions = oSelect;
		} else {
			return function (cellValue) {
				return cellValue ? String(cellValue) : $fnDefaultFormat(cellValue, op);
			};
		}
		if (defaultValueDefined) {
			defaultValue = selOptions[op.defaultValue];
		}
		return isMultiple ?
			function (cellValue) {
				var ret = [], iOpt,
					splitedCell = $.map(String(cellValue).split(","), function (n) { return $.trim(n); });
				for (iOpt = 0; iOpt < splitedCell.length; iOpt++) {
					cellValue = splitedCell[iOpt];
					if (selOptions.hasOwnProperty(cellValue)) {
						ret.push(selOptions[cellValue]);
					}
				}
				cellValue = ret.join(", ");
				return cellValue !== "" ? cellValue :
						(defaultValueDefined ? defaultValue : $fnDefaultFormat(cellValue, op));
			} :
			function (cellValue) {
				var ret = selOptions[String(cellValue)];
				return ret !== "" && ret !== undefined ? ret :
						(defaultValueDefined ? defaultValue : $fnDefaultFormat(cellValue, op));
			};
	};
	$FnFmatter.rowactions = function (e, act) {
		var $tr = $(this).closest("tr.jqgrow"), rid = $tr.attr("id"),
			$id = $(this).closest("table.ui-jqgrid-btable").attr("id").replace(/_frozen([^_]*)$/, "$1"),
			$grid = $("#" + jgrid.jqID($id)),
			$t = $grid[0],
			p = $t.p,
			cm = p.colModel[jgrid.getCellIndex(this)],
			op = $.extend(true, { extraparam: {} }, jgrid.actionsNav || {},	p.actionsNavOptions || {}, cm.formatoptions || {});

		if (p.editOptions !== undefined) {
			op.editOptions = p.editOptions;
		}
		if (p.delOptions !== undefined) {
			op.delOptions = p.delOptions;
		}
		if ($tr.hasClass("jqgrid-new-row")) {
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
			$grid.jqGrid("setSelection", rid, true, e);
		} else {
			jgrid.fullBoolFeedback.call($t, "onSelectRow", "jqGridSelectRow", rid, true, e);
		}
		switch (act) {
			case "edit":
				$grid.jqGrid("editRow", rid, actop);
				break;
			case "save":
				$grid.jqGrid("saveRow", rid, actop);
				break;
			case "cancel":
				$grid.jqGrid("restoreRow", rid, op.afterRestore);
				break;
			case "del":
				op.delOptions = op.delOptions || {};
				if (op.delOptions.top === undefined) {
					op.delOptions.top = $tr.offset().top + $tr.outerHeight() - $grid.closest(".ui-jqgrid").offset().top;
				}
				$grid.jqGrid("delGridRow", rid, op.delOptions);
				break;
			case "formedit":
				op.editOptions = op.editOptions || {};
				if (op.editOptions.top === undefined) {
					op.editOptions.top = $tr.offset().top + $tr.outerHeight() - $grid.closest(".ui-jqgrid").offset().top;
					op.editOptions.recreateForm = true;
				}
				$grid.jqGrid("editGridRow", rid, op.editOptions);
				break;
			default:
				if (op.custom != null && op.custom.length > 0) {
					var i, n = op.custom.length, customAction;
					for (i = 0; i < n; i++) {
						customAction = op.custom[i];
						if (customAction.action === act && $.isFunction(customAction.onClick)) {
							customAction.onClick.call($t, {rowid: rid, event: e, action: act, options: customAction});
						}
					}
				}
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		return false; // prevent other processing of the click on the row
	};
	$FnFmatter.actions = function (cellval, opts, rwd, act) {
		var rowid = opts.rowId, str = "", $t = this, p = $t.p, $self = $($t), i, customAction, info, displayMask = {},
			edit = getGridRes.call($self, "edit") || {},
			op = $.extend({
				editbutton: true,
				delbutton: true,
				editformbutton: false,
				commonIconClass: "ui-icon",
				editicon: "ui-icon-pencil",
				delicon: "ui-icon-trash",
				saveicon: "ui-icon-disk",
				cancelicon: "ui-icon-cancel",
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
			mergeCssClasses = jgrid.mergeCssClasses,
			cssIconClass = function (name) {
				return mergeCssClasses(op.commonIconClass, op[name + "icon"]);
			},
			hoverClass = mergeCssClasses(jgrid.getRes(jgrid.guiStyles[p.guiStyle], "states.hover")),
			hoverAttributes = "onmouseover=\"jQuery(this).addClass('" + hoverClass +
				"');\" onmouseout=\"jQuery(this).removeClass('" + hoverClass + "');\"",
			buttonInfos = [
				{ action: "edit", actionName: "formedit", display: op.editformbutton },
				{ action: "edit", display: !op.editformbutton && op.editbutton },
				{ action: "del", idPrefix: "Delete", display: op.delbutton },
				{ action: "save", display: op.editformbutton || op.editbutton, hidden: true },
				{ action: "cancel", display: op.editformbutton || op.editbutton, hidden: true }
			],
			actionButton = function (options) {
				var action = options.action, actionName = options.actionName || action,
					idPrefix = options.idPrefix !== undefined ? options.idPrefix : (action.charAt(0).toUpperCase() + action.substring(1));
				return "<div title='" + op[action+"title"] +
					(options.hidden ? "' style='display:none;" : "") +
					"' class='ui-pg-div ui-inline-" + action + "' " +
					(idPrefix !== null ? "id='j" + idPrefix + "Button_" + rowid : "") +
					"' onclick=\"return jQuery.fn.fmatter.rowactions.call(this,event,'" + actionName + "');\" " +
					(options.noHovering ? "" : hoverAttributes) + "><span class='" +
					cssIconClass(action) + "'></span></div>";
			},
			n = op.custom != null ? op.custom.length - 1 : -1;

		if (rowid === undefined || fmatter.isEmpty(rowid)) { return ""; }
		if ($.isFunction(op.isDisplayButtons)) {
			try {
				displayMask = op.isDisplayButtons.call($t, opts, rwd, act) || {};
			} catch(ignore) {}
		}
		while (n >= 0) {
			customAction = op.custom[n--];
			buttonInfos[customAction.position === "first" ? "unshift" : "push"](customAction);
		}
		for (i = 0, n = buttonInfos.length; i < n; i++) {
			info = $.extend({}, buttonInfos[i], displayMask[buttonInfos[i].action] || {});
			if (info.display !== false) {
			    str += actionButton(info);
			}
		}
		return "<div class='ui-jqgrid-actions'>" + str + "</div>";
	};
	$FnFmatter.actions.pageFinalization = function (iCol) {
		var $self = $(this), p = this.p, colModel = p.colModel, cm = colModel[iCol],
			showHideEditDelete = function (show, rowid) {
				var maxfrozen = 0, tr, $actionsDiv, len = colModel.length, i;
				for (i = 0; i < len; i++) {
					// from left, no breaking frozen
					if (colModel[i].frozen !== true) {
						break;
					}
					maxfrozen = i;
				}
				tr = $self.jqGrid("getGridRowById", rowid);
				if (tr != null && tr.cells != null) {
					//$actionsDiv = cm.frozen ? $("tr#"+jgrid.jqID(rid)+" td:eq("+jgrid.getCellIndex(this)+") > div",$grid) :$(this).parent(),
					iCol = p.iColByName[cm.name];
					$actionsDiv = $(tr.cells[iCol]).children(".ui-jqgrid-actions");
					if (cm.frozen && p.frozenColumns && iCol <= maxfrozen) {
						// uses the corresponding tr from frozen div with the same rowIndex ADDITIONALLY
						// to the standard action div
						$actionsDiv = $actionsDiv
								.add($($self[0].grid.fbRows[tr.rowIndex].cells[iCol])
								.children(".ui-jqgrid-actions"));
					}
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
	$.unformat = function (cellval, options, pos, cnt) {
		// specific for jqGrid only
		var ret, colModel = options.colModel, formatType = colModel.formatter, p = this.p,
			op = colModel.formatoptions || {},// sep,
			//re = /([\.\*\_\'\(\)\{\}\+\?\\])/g,
			unformatFunc = colModel.unformat || ($FnFmatter[formatType] && $FnFmatter[formatType].unformat);
		if (cellval instanceof jQuery && cellval.length > 0) {
			cellval = cellval[0];
		}
		if (p.treeGrid && cellval != null && $(cellval.firstChild).hasClass("tree-wrap") && ($(cellval.lastChild).hasClass("cell-wrapper") || $(cellval.lastChild).hasClass("cell-wrapperleaf"))) {
			cellval = cellval.lastChild;
		}
		if (colModel.autoResizable && cellval != null && $(cellval.firstChild).hasClass(p.autoResizing.wrapperClassName)) {
			cellval = cellval.firstChild;
		}
		if (unformatFunc !== undefined && $.isFunction(unformatFunc)) {
			ret = unformatFunc.call(this, $(cellval).text(), options, cellval);
		} else if (formatType !== undefined && typeof formatType === "string") {
			//var opts = $.extend(true, {}, getRes(locales[p.locale], "formatter"), jgrid.formatter || {}), stripTag;
			var $self = $(this), //stripTag, //opts = getGridRes.call($self, "formatter"),
				getFormaterOption = function (formatterName, optionName) {
					return op[optionName] !== undefined ?
						op[optionName] :
						getGridRes.call($self, "formatter." + formatterName + "." + optionName);
				},
				cutThousandsSeparator = function (formatterName, val) {
					var separator = getFormaterOption(formatterName, "thousandsSeparator")
							.replace(/([\.\*\_\'\(\)\{\}\+\?\\])/g, "\\$1");
					return val.replace(new RegExp(separator, "g"), "");
				};
			switch (formatType) {
				case "integer":
					ret = cutThousandsSeparator("integer", $(cellval).text());
					break;
				case "number":
					ret = cutThousandsSeparator("number", $(cellval).text())
							.replace(getFormaterOption("number", "decimalSeparator"), ".");
					break;
				case "currency":
					ret = $(cellval).text();
					var prefix = getFormaterOption("currency", "prefix"),
						suffix = getFormaterOption("currency", "suffix");
					if (prefix && prefix.length) {
						ret = ret.substr(prefix.length);
					}
					if (suffix && suffix.length) {
						ret = ret.substr(0, ret.length - suffix.length);
					}
					ret = cutThousandsSeparator("number", ret)
							.replace(getFormaterOption("number", "decimalSeparator"), ".");
					break;
				case "checkbox":
					var cbv = (colModel.editoptions != null && typeof colModel.editoptions.value === "string") ?
							colModel.editoptions.value.split(":") :
							["Yes", "No"];
					ret = $("input", cellval).is(":checked") ? cbv[0] : cbv[1];
					break;
				case "select":
					ret = $.unformat.select(cellval, options, pos, cnt);
					break;
				case "actions":
					return "";
				default:
					ret = $(cellval).text();
			}
		}
		ret = ret !== undefined ? ret : cnt === true ? $(cellval).text() : jgrid.htmlDecode($(cellval).html());
		return ret;
	};
	$.unformat.select = function (cellval, options, pos, cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [], cell = $(cellval).text(), colModel = options.colModel;
		if (cnt === true) { return cell; }
		var op = $.extend({}, colModel.editoptions || {}, colModel.formatoptions || {}),
			sep = op.separator === undefined ? ":" : op.separator,
			delim = op.delimiter === undefined ? ";" : op.delimiter;

		if (op.value) {
			var oSelect = op.value,
				msl = op.multiple === true ? true : false,
				scell = [], sv, mapFunc = function (n, i) { if (i > 0) { return n; } };
			if (msl) { scell = cell.split(","); scell = $.map(scell, function (n) { return $.trim(n); }); }
			if (typeof oSelect === "string") {
				var so = oSelect.split(delim), j = 0, i;
				for (i = 0; i < so.length; i++) {
					sv = so[i].split(sep);
					if (sv.length > 2) {
						sv[1] = $.map(sv, mapFunc).join(sep);
					}
					if (msl) {
						if ($.inArray($.trim(sv[1]), scell) > -1) {
							ret[j] = sv[0];
							j++;
						}
					} else if ($.trim(sv[1]) === $.trim(cell)) {
						ret[0] = sv[0];
						break;
					}
				}
			} else if (fmatter.isObject(oSelect) || $.isArray(oSelect)) {
				if (!msl) { scell[0] = cell; }
				ret = $.map(scell, function (n) {
					var rv;
					$.each(oSelect, function (i, val) {
						if (val === n) {
							rv = i;
							return false;
						}
					});
					if (rv !== undefined) { return rv; }
				});
			}
			return ret.join(", ");
		}
		return cell || "";
	};
	$.unformat.date = function (cellval, opts) {
		// TODO
		var op = $.extend(true, {},
				getGridRes.call($(this), "formatter.date"),
				jgrid.formatter.date || {},
				opts.formatoptions || {});

		return !fmatter.isEmpty(cellval) ?
				jgrid.parseDate.call(this, op.newformat, cellval, op.srcformat, op) :
				"";
	};
}(jQuery));
