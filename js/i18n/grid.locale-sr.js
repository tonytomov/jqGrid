/**
 * jqGrid Serbian Translation
 * Александар Миловац(Aleksandar Milovac) aleksandar.milovac@gmail.com
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
$.jgrid.regional["sr"] = {
	defaults : {
		recordtext: "Преглед {0} - {1} од {2}",
		emptyrecords: "Не постоји ниједан запис",
		loadtext: "Учитавање...",
		pgtext : "Страна {0} од {1}",
		savetext: "Saving...",
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
		caption: "Тражење...",
		Find: "Тражи",
		Reset: "Ресетуј",
		odata: [{ oper:'eq', text:"једнако"},{ oper:'ne', text:"није једнако"},{ oper:'lt', text:"мање"},{ oper:'le', text:"мање или једнако"},{ oper:'gt', text:"веће"},{ oper:'ge', text:"веће или једнако"},{ oper:'bw', text:"почиње са"},{ oper:'bn', text:"не почиње са"},{ oper:'in', text:"је у"},{ oper:'ni', text:"није у"},{ oper:'ew', text:"завршава са"},{ oper:'en', text:"не завршава са"},{ oper:'cn', text:"садржи"},{ oper:'nc', text:"не садржи"},{ oper:'nu', text:'is null'},{ oper:'nn', text:'is not null'}, {oper:'bt', text:'between'}],
		groupOps: [	{ op: "И", text: "сви" },	{ op: "ИЛИ",  text: "сваки" }	],
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
		addCaption: "Додај запис",
		editCaption: "Измени запис",
		bSubmit: "Пошаљи",
		bCancel: "Одустани",
		bClose: "Затвори",
		saveData: "Податак је измењен! Сачувај измене?",
		bYes : "Да",
		bNo : "Не",
		bExit : "Одустани",
		msg: {
			required:"Поље је обавезно",
			number:"Молим, унесите исправан број",
			minValue:"вредност мора бити већа од или једнака са ",
			maxValue:"вредност мора бити мања од или једнака са",
			email: "није исправна имејл адреса",
			integer: "Молим, унесите исправну целобројну вредност ",
			date: "Молим, унесите исправан датум",
			url: "није исправан УРЛ. Потребан је префикс ('http://' or 'https://')",
			nodefined : " није дефинисан!",
			novalue : " захтевана је повратна вредност!",
			customarray : "Custom function should return array!",
			customfcheck : "Custom function should be present in case of custom checking!"
			
		}
	},
	view : {
		caption: "Погледај запис",
		bClose: "Затвори"
	},
	del : {
		caption: "Избриши",
		msg: "Избриши изабран(е) запис(е)?",
		bSubmit: "Ибриши",
		bCancel: "Одбаци"
	},
	nav : {
		edittext: "",
		edittitle: "Измени изабрани ред",
		addtext:"",
		addtitle: "Додај нови ред",
		deltext: "",
		deltitle: "Избриши изабран ред",
		searchtext: "",
		searchtitle: "Нађи записе",
		refreshtext: "",
		refreshtitle: "Поново учитај податке",
		alertcap: "Упозорење",
		alerttext: "Молим, изаберите ред",
		viewtext: "",
		viewtitle: "Погледај изабрани ред",
		savetext: "",
		savetitle: "Save row",
		canceltext: "",
		canceltitle : "Cancel row editing",
		selectcaption : "Actions..."
	},
	col : {
		caption: "Изабери колоне",
		bSubmit: "ОК",
		bCancel: "Одбаци"
	},
	errors : {
		errcap : "Грешка",
		nourl : "Није постављен URL",
		norecords: "Нема записа за обраду",
		model : "Дужина модела colNames <> colModel!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaultValue: '0'},
		number : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0.00'},
		currency : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0.00'},
		date : {
			dayNames:   [
				"Нед", "Пон", "Уто", "Сре", "Чет", "Пет", "Суб",
				"Недеља", "Понедељак", "Уторак", "Среда", "Четвртак", "Петак", "Субота"
			],
			monthNames: [
				"Јан", "Феб", "Мар", "Апр", "Мај", "Јун", "Јул", "Авг", "Сеп", "Окт", "Нов", "Дец",
				"Јануар", "Фебруар", "Март", "Април", "Мај", "Јун", "Јул", "Август", "Септембар", "Октобар", "Новембар", "Децембар"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th'},
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
