/**
 * jqGrid Icelandic Translation
 * jtm@hi.is Univercity of Iceland
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
$.jgrid.regional["is"] = {
	defaults : {
		recordtext: "Skoða {0} - {1} af {2}",
	    emptyrecords: "Engar færslur",
		loadtext: "Hleður...",
		pgtext : "Síða {0} af {1}",
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
	    caption: "Leita...",
	    Find: "Leita",
	    Reset: "Endursetja",
	    odata: [{ oper:'eq', text:"sama og"},{ oper:'ne', text:"ekki sama og"},{ oper:'lt', text:"minna en"},{ oper:'le', text:"minna eða jafnt og"},{ oper:'gt', text:"stærra en"},{ oper:'ge', text:"stærra eða jafnt og"},{ oper:'bw', text:"byrjar á"},{ oper:'bn', text:"byrjar ekki á"},{ oper:'in', text:"er í"},{ oper:'ni', text:"er ekki í"},{ oper:'ew', text:"endar á"},{ oper:'en', text:"endar ekki á"},{ oper:'cn', text:"inniheldur"},{ oper:'nc', text:"inniheldur ekki"},{ oper:'nu', text:'is null'},{ oper:'nn', text:'is not null'}, {oper:'bt', text:'between'}],
	    groupOps: [	{ op: "AND", text: "allt" },	{ op: "OR",  text: "eða" }	],
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
	    addCaption: "Bæta við færslu",
	    editCaption: "Breyta færslu",
	    bSubmit: "Vista",
	    bCancel: "Hætta við",
		bClose: "Loka",
		saveData: "Gögn hafa breyst! Vista breytingar?",
		bYes : "Já",
		bNo : "Nei",
		bExit : "Hætta við",
	    msg: {
	        required:"Reitur er nauðsynlegur",
	        number:"Vinsamlega settu inn tölu",
	        minValue:"gildi verður að vera meira en eða jafnt og ",
	        maxValue:"gildi verður að vera minna en eða jafnt og ",
	        email: "er ekki löglegt email",
	        integer: "Vinsamlega settu inn tölu",
			date: "Vinsamlega setti inn dagsetningu",
			url: "er ekki löglegt URL. Vantar ('http://' eða 'https://')",
			nodefined : " er ekki skilgreint!",
			novalue : " skilagildi nauðsynlegt!",
			customarray : "Fall skal skila fylki!",
			customfcheck : "Fall skal vera skilgreint!"
		}
	},
	view : {
	    caption: "Skoða færslu",
	    bClose: "Loka"
	},
	del : {
	    caption: "Eyða",
	    msg: "Eyða völdum færslum ?",
	    bSubmit: "Eyða",
	    bCancel: "Hætta við"
	},
	nav : {
		edittext: " ",
	    edittitle: "Breyta færslu",
		addtext:" ",
	    addtitle: "Ný færsla",
	    deltext: " ",
	    deltitle: "Eyða færslu",
	    searchtext: " ",
	    searchtitle: "Leita",
	    refreshtext: "",
	    refreshtitle: "Endurhlaða",
	    alertcap: "Viðvörun",
	    alerttext: "Vinsamlega veldu færslu",
		viewtext: "",
		viewtitle: "Skoða valda færslu",
		savetext: "",
		savetitle: "Save row",
		canceltext: "",
		canceltitle : "Cancel row editing",
		selectcaption : "Actions..."
	},
	col : {
	    caption: "Sýna / fela dálka",
	    bSubmit: "Vista",
	    bCancel: "Hætta við"	
	},
	errors : {
		errcap : "Villa",
		nourl : "Vantar slóð",
		norecords: "Engar færslur valdar",
	    model : "Lengd colNames <> colModel!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaultValue: '0'},
		number : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0.00'},
		currency : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0.00'},
		date : {
			dayNames:   [
				"Sun", "Mán", "Þri", "Mið", "Fim", "Fös", "Lau",
				"Sunnudagur", "Mánudagur", "Þriðjudagur", "Miðvikudagur", "Fimmtudagur", "Föstudagur", "Laugardagur"
			],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "Maí", "Jún", "Júl", "Ágú", "Sep", "Oct", "Nóv", "Des",
				"Janúar", "Febrúar", "Mars", "Apríl", "Maí", "Júný", "Júlý", "Ágúst", "September", "Október", "Nóvember", "Desember"
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
