/**
 * jqGrid Croatian Translation
 * Version 1.0.1 (developed for jQuery Grid 4.4)
 * msajko@gmail.com
 * 
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
$.jgrid.regional["hr"] = {
	defaults : {
		recordtext: "Pregled {0} - {1} od {2}",
		emptyrecords: "Nema zapisa",
		loadtext: "Učitavam...",
		pgtext : "Stranica {0} od {1}",
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
		caption: "Traži...",
		Find: "Pretraživanje",
		Reset: "Poništi",
		odata: [{ oper:'eq', text:"jednak"},{ oper:'ne', text:"nije identičan"},{ oper:'lt', text:"manje"},{ oper:'le', text:"manje ili identično"},{ oper:'gt', text:"veće"},{ oper:'ge', text:"veće ili identično"},{ oper:'bw', text:"počinje sa"},{ oper:'bn', text:"ne počinje sa "},{ oper:'in', text:"je u"},{ oper:'ni', text:"nije u"},{ oper:'ew', text:"završava sa"},{ oper:'en', text:"ne završava sa"},{ oper:'cn', text:"sadrži"},{ oper:'nc', text:"ne sadrži"},{ oper:'nu', text:'is null'},{ oper:'nn', text:'is not null'}, {oper:'bt', text:'between'}],
		groupOps: [	{ op: "I", text: "sve" },	{ op: "ILI",  text: "bilo koji" }	],
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
		addCaption: "Dodaj zapis",
		editCaption: "Promijeni zapis",
		bSubmit: "Preuzmi",
		bCancel: "Odustani",
		bClose: "Zatvri",
		saveData: "Podaci su promijenjeni! Preuzmi promijene?",
		bYes : "Da",
		bNo : "Ne",
		bExit : "Odustani",
		msg: {
			required:"Polje je obavezno",
			number:"Molim, unesite ispravan broj",
			minValue:"Vrijednost mora biti veća ili identična ",
			maxValue:"Vrijednost mora biti manja ili identična",
			email: "neispravan e-mail",
			integer: "Molim, unjeti ispravan cijeli broj (integer)",
			date: "Molim, unjeti ispravan datum ",
			url: "neispravan URL. Prefiks je obavezan ('http://' or 'https://')",
			nodefined : " nije definiran!",
			novalue : " zahtjevan podatak je obavezan!",
			customarray : "Opcionalna funkcija trebala bi bili polje (array)!",
			customfcheck : "Custom function should be present in case of custom checking!"
			
		}
	},
	view : {
		caption: "Otvori zapis",
		bClose: "Zatvori"
	},
	del : {
		caption: "Obriši",
		msg: "Obriši označen zapis ili više njih?",
		bSubmit: "Obriši",
		bCancel: "Odustani"
	},
	nav : {
		edittext: "",
		edittitle: "Promijeni obilježeni red",
		addtext: "",
		addtitle: "Dodaj novi red",
		deltext: "",
		deltitle: "Obriši obilježeni red",
		searchtext: "",
		searchtitle: "Potraži zapise",
		refreshtext: "",
		refreshtitle: "Ponovo preuzmi podatke",
		alertcap: "Upozorenje",
		alerttext: "Molim, odaberi red",
		viewtext: "",
		viewtitle: "Pregled obilježenog reda",
		savetext: "",
		savetitle: "Save row",
		canceltext: "",
		canceltitle : "Cancel row editing",
		selectcaption : "Actions..."
	},
	col : {
		caption: "Obilježi kolonu",
		bSubmit: "Uredu",
		bCancel: "Odustani"
	},
	errors : {
		errcap : "Greška",
		nourl : "Nedostaje URL",
		norecords: "Bez zapisa za obradu",
		model : "colNames i colModel imaju različitu duljinu!"
	},
	formatter : {
		integer : {thousandsSeparator: ".", defaultValue: '0'},
		number : {decimalSeparator:",", thousandsSeparator: ".", decimalPlaces: 2, defaultValue: '0,00'},
		currency : {decimalSeparator:",", thousandsSeparator: ".", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0,00'},
		date : {
			dayNames:   [
				"Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub",
				"Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"
			],
			monthNames: [
				"Sij", "Velj", "Ožu", "Tra", "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro",
				"Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) {return ''},
			srcformat: 'Y-m-d',
			newformat: 'd.m.Y.',
			parseRe : /[#%\\\/:_;.,\t\s-]/,
			masks : {
				// see http://php.net/manual/en/function.date.php for PHP format used in jqGrid
				// and see http://docs.jquery.com/UI/Datepicker/formatDate
				// and https://github.com/jquery/globalize#dates for alternative formats used frequently
				ISO8601Long: "Y-m-d H:i:s",
				ISO8601Short: "Y-m-d",
				// short date:
				//    d - Day of the month, 2 digits with leading zeros
				//    m - Numeric representation of a month, with leading zeros
				//    Y - A full numeric representation of a year, 4 digits
				ShortDate: "d.m.Y.",	// in jQuery UI Datepicker: "dd.mm.yy."
				// long date:
				//    l - A full textual representation of the day of the week
				//    j - Day of the month without leading zeros
				//    F - A full textual representation of a month
				//    Y - A full numeric representation of a year, 4 digits
				LongDate: "l, j. F Y", // in jQuery UI Datepicker: "dddd, d. MMMM yyyy"
				// long date with long time:
				//    l - A full textual representation of the day of the week
				//    j - Day of the month without leading zeros
				//    F - A full textual representation of a month
				//    Y - A full numeric representation of a year, 4 digits
				//    H - 24-hour format of an hour with leading zeros
				//    i - Minutes with leading zeros
				//    s - Seconds, with leading zeros
				FullDateTime: "l, j. F Y H:i:s", // in jQuery UI Datepicker: "dddd, d. MMMM yyyy HH:mm:ss"
				// month day:
				//    d - Day of the month, 2 digits with leading zeros
				//    F - A full textual representation of a month
				MonthDay: "d F", // in jQuery UI Datepicker: "dd MMMM"
				// short time (without seconds)
				//    H - 24-hour format of an hour with leading zeros
				//    i - Minutes with leading zeros
				ShortTime: "H:i", // in jQuery UI Datepicker: "HH:mm"
				// long time (with seconds)
				//    H - 24-hour format of an hour with leading zeros
				//    i - Minutes with leading zeros
				//    s - Seconds, with leading zeros
				LongTime: "H:i:s", // in jQuery UI Datepicker: "HH:mm:ss"
				SortableDateTime: "Y-m-d\\TH:i:s",
				UniversalSortableDateTime: "Y-m-d H:i:sO",
				// month with year
				//    F - A full textual representation of a month
				//    Y - A full numeric representation of a year, 4 digits
				YearMonth: "F Y" // in jQuery UI Datepicker: "MMMM yyyy"
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
