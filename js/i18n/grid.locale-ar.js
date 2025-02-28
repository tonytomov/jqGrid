/**
 * jqGrid Arabic Translation
 * 
 * http://trirand.com/blog/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
/*global jQuery, define */
(function( factory ) {
	"use strict";
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"../grid.base"
		], factory );
	} else {
		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

$.jgrid = $.jgrid || {};
if(!$.jgrid.hasOwnProperty("regional")) {
	$.jgrid.regional = [];
}
$.jgrid.regional["ar"] = {
	defaults : {
		recordtext: "تسجيل {0} - {1} على {2}",
		emptyrecords: "لا يوجد تسجيل",
		loadtext: "تحميل...",
		savetext: "Saving...",
		pgtext : "صفحة {0} على {1}",
		pgfirst : "First Page",
		pglast : "Last Page",
		pgnext : "Next Page",
		pgprev : "Previous Page",
		pgrecs : "Records per Page",
		showhide: "Toggle Expand Collapse Grid",
		// mobile
		pagerCaption : "Grid::Page Settings",
		pageText : "Page:",
		recordPage : "Records per Page",
		nomorerecs : "No more records...",
		scrollPullup: "Pull up to load more...",
		scrollPulldown : "Pull down to refresh...",
		scrollRefresh : "Release to refresh...",
		valT : "checked",
		valF : "unchecked",
		selectLine : "Select row",
		selectAllLines : "Select all rows"
	},
	search : {
		caption: "بحث...",
		Find: "بحث",
		Reset: "إلغاء",
		odata: [{ oper:'eq', text:"يساوي"},{ oper:'ne', text:"يختلف"},{ oper:'lt', text:"أقل"},{ oper:'le', text:"أقل أو يساوي"},{ oper:'gt', text:"أكبر"},{ oper:'ge', text:"أكبر أو يساوي"},{ oper:'bw', text:"يبدأ بـ"},{ oper:'bn', text:"لا يبدأ بـ"},{ oper:'in', text:"est dans"},{ oper:'ni', text:"n'est pas dans"},{ oper:'ew', text:"ينته بـ"},{ oper:'en', text:"لا ينته بـ"},{ oper:'cn', text:"يحتوي"},{ oper:'nc', text:"لا يحتوي"},{ oper:'nu', text:'is null'},{ oper:'nn', text:'is not null'}, {oper:'bt', text:'between'}],
		groupOps: [	{ op: "مع", text: "الكل" },	{ op: "أو",  text: "لا أحد" }],
		operandTitle : "Click to select search operation.",
		resetTitle : "Reset Search Value",
		addsubgrup : "Add subgroup",
		addrule : "Add rule",
		delgroup : "Delete group",
		delrule : "Delete rule",
		Close : "Close",
		Operand : "Operand : ",
		Operation : "Oper : ",
		filterFor : "filter for"
},
	edit : {
		addCaption: "اضافة",
		editCaption: "تحديث",
		bSubmit: "تثبيث",
		bCancel: "إلغاء",
		bClose: "غلق",
		saveData: "تغيرت المعطيات هل تريد التسجيل ?",
		bYes: "نعم",
		bNo: "لا",
		bExit: "إلغاء",
		msg: {
			required: "خانة إجبارية",
			number: "سجل رقم صحيح",
			minValue: "يجب أن تكون القيمة أكبر أو تساوي 0",
			maxValue: "يجب أن تكون القيمة أقل أو تساوي 0",
			email: "بريد غير صحيح",
			integer: "سجل عدد طبييعي صحيح",
			url: "ليس عنوانا صحيحا. البداية الصحيحة ('http://' أو 'https://')",
			nodefined : " ليس محدد!",
			novalue : " قيمة الرجوع مطلوبة!",
			customarray : "يجب على الدالة الشخصية أن تنتج جدولا",
			customfcheck : "الدالة الشخصية مطلوبة في حالة التحقق الشخصي"
		}
	},
	view : {
		caption: "رأيت التسجيلات",
		bClose: "غلق"
	},
	del : {
		caption: "حذف",
		msg: "حذف التسجيلات المختارة ?",
		bSubmit: "حذف",
		bCancel: "إلغاء"
	},
	nav : {
		edittext: " ",
		edittitle: "تغيير التسجيل المختار",
		addtext:" ",
		addtitle: "إضافة تسجيل",
		deltext: " ",
		deltitle: "حذف التسجيل المختار",
		searchtext: " ",
		searchtitle: "بحث عن تسجيل",
		refreshtext: "",
		refreshtitle: "تحديث الجدول",
		alertcap: "تحذير",
		alerttext: "يرجى إختيار السطر",
		viewtext: "",
		viewtitle: "إظهار السطر المختار",
		savetext: "",
		savetitle: "Save row",
		canceltext: "",
		canceltitle : "Cancel row editing",
		selectcaption : "Actions..."
	},
	col : {
		caption: "إظهار/إخفاء الأعمدة",
		bSubmit: "تثبيث",
		bCancel: "إلغاء"
	},
	errors : {
		errcap : "خطأ",
		nourl : "لا يوجد عنوان محدد",
		norecords: "لا يوجد تسجيل للمعالجة",
		model : "عدد العناوين (colNames) <> عدد التسجيلات (colModel)!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaultValue: '0'},
		number : {decimalSeparator:",", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0,00'},
		currency : {decimalSeparator:",", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0,00'},
		date : {
			dayNames:   [
				"الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت",
				"الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
			],
			monthNames: [
				"جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
				"جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
			],
			AmPm : ["صباحا","مساءا","صباحا","مساءا"],
			S: function (j) {return j == 1 ? 'er' : 'e';},
			srcformat: 'Y-m-d',
			newformat: 'd/m/Y',
			parseRe : /[#%\\\/:_;.,\t\s-]/,
			masks : {
				ISO8601Long:"Y-m-d H:i:s",
				ISO8601Short:"Y-m-d",
				ShortDate: "n/j/Y",
				LongDate: "l, F d, Y",
				FullDateTime: "l, F d, Y g:i:s A",
				MonthDay: "F d",
				ShortTime: "g:i A",
				LongTime: "g:i:s A",
				SortableDateTime: "Y-m-d\\TH:i:s",
				UniversalSortableDateTime: "Y-m-d H:i:sO",
				YearMonth: "F, Y"
			},
			reformatAfterEdit : false,
			userLocalTime : false
		},
		baseLinkUrl: '',
		showAction: '',
		target: '',
		checkbox : {disabled:true},
		idName : 'id'
	},
	colmenu : {
		sortasc : "Sort Ascending",
		sortdesc : "Sort Descending",
		columns : "Columns",
		filter : "Filter",
		grouping : "Group By",
		ungrouping : "Ungroup",
		searchTitle : "Get items with value that:",
		freeze : "Freeze",
		unfreeze : "Unfreeze",
		reorder : "Move to reorder",
		hovermenu: "Click for column quick actions"
	},
	clipboard : {
		menus : {
			copy_act : "Copy Selected to Clipboard",
			paste_act : "Paste Update from Clipboard",
			paste_act_add: "Paste Add from Clipboard",
			undo_act : "Undo",
			repeat_act_row : "Repeat row vertically",
			repeat_act_col : "Repeat column horizontally",
			cancel_act : "Cancel"
		},
		msg : {
			text_c : "Text copied to clipboard.",
			select_pos : "Please click position to paste!",
			info_cap : "Information",
			total_row : "Total rows: ",
			insert_row: "Inserted: ",
			update_row: "Updated: "
		},
		errors : {
			enb_prm : "Copy paste disabled in browser, please enable it!",
			copy_err : "Failed to copy to clipboard: ",
			read_err : "Failed to read clipboard contents: ",
			get_data_err : "Can not get data from clipboard or empty!",
			start_ind_err : "Start index of the cell is not valid!",
			local_stor_err : "Local storage not available! Can not store data for undo changes!",
			not_array_err: "Data can not be converted to array"
		}
	}
};
}));
