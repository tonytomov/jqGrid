/**
 * jqGrid Czech Translation
 * Pavel Jirak pavel.jirak@jipas.cz
 * doplnil Thomas Wagner xwagne01@stud.fit.vutbr.cz
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
$.jgrid.regional["cs"] = {
	defaults : {
		recordtext: "Zobrazeno {0} - {1} z {2} záznamů",
	    emptyrecords: "Nenalezeny žádné záznamy",
		loadtext: "Načítám...",
		savetext: "Saving...",
		pgtext : "Strana {0} z {1}",
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
		caption: "Vyhledávám...",
		Find: "Hledat",
		Reset: "Reset",
	    odata: [{ oper:'eq', text:"rovno"},{ oper:'ne', text:"nerovno"},{ oper:'lt', text:"menší"},{ oper:'le', text:"menší nebo rovno"},{ oper:'gt', text:"větší"},{ oper:'ge', text:"větší nebo rovno"},{ oper:'bw', text:"začíná s"},{ oper:'bn', text:"nezačíná s"},{ oper:'in', text:"je v"},{ oper:'ni', text:"není v"},{ oper:'ew', text:"končí s"},{ oper:'en', text:"nekončí s"},{ oper:'cn', text:"obsahuje"},{ oper:'nc', text:"neobsahuje"},{ oper:'nu', text:'is null'},{ oper:'nn', text:'is not null'}, {oper:'bt', text:'between'}],
	    groupOps: [	{ op: "AND", text: "všech" },	{ op: "OR",  text: "některého z" }	],
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
		addCaption: "Přidat záznam",
		editCaption: "Editace záznamu",
		bSubmit: "Uložit",
		bCancel: "Storno",
		bClose: "Zavřít",
		saveData: "Data byla změněna! Uložit změny?",
		bYes : "Ano",
		bNo : "Ne",
		bExit : "Zrušit",
		msg: {
		    required:"Pole je vyžadováno",
		    number:"Prosím, vložte validní číslo",
		    minValue:"hodnota musí být větší než nebo rovná ",
		    maxValue:"hodnota musí být menší než nebo rovná ",
		    email: "není validní e-mail",
		    integer: "Prosím, vložte celé číslo",
			date: "Prosím, vložte validní datum",
			url: "není platnou URL. Vyžadován prefix ('http://' or 'https://')",
			nodefined : " není definován!",
			novalue : " je vyžadována návratová hodnota!",
			customarray : "Custom function mělá vrátit pole!",
			customfcheck : "Custom function by měla být přítomna v případě custom checking!"
		}
	},
	view : {
	    caption: "Zobrazit záznam",
	    bClose: "Zavřít"
	},
	del : {
		caption: "Smazat",
		msg: "Smazat vybraný(é) záznam(y)?",
		bSubmit: "Smazat",
		bCancel: "Storno"
	},
	nav : {
		edittext: " ",
		edittitle: "Editovat vybraný řádek",
		addtext:" ",
		addtitle: "Přidat nový řádek",
		deltext: " ",
		deltitle: "Smazat vybraný záznam ",
		searchtext: " ",
		searchtitle: "Najít záznamy",
		refreshtext: "",
		refreshtitle: "Obnovit tabulku",
		alertcap: "Varování",
		alerttext: "Prosím, vyberte řádek",
		viewtext: "",
		viewtitle: "Zobrazit vybraný řádek",
		savetext: "",
		savetitle: "Save row",
		canceltext: "",
		canceltitle : "Cancel row editing",
		selectcaption : "Actions..."
	},
	col : {
		caption: "Zobrazit/Skrýt sloupce",
		bSubmit: "Uložit",
		bCancel: "Storno"	
	},
	errors : {
		errcap : "Chyba",
		nourl : "Není nastavena url",
		norecords: "Žádné záznamy ke zpracování",
		model : "Délka colNames <> colModel!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaultValue: '0'},
		number : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0.00'},
		currency : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0.00'},
		date : {
			dayNames:   [
				"Ne", "Po", "Út", "St", "Čt", "Pá", "So",
				"Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"
			],
			monthNames: [
				"Led", "Úno", "Bře", "Dub", "Kvě", "Čer", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro",
				"Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
			],
			AmPm : ["do","od","DO","OD"],
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
