/**
 * jqGrid Danish Translation
 * Kaare Rasmussen kjs@jasonic.dk
 * http://jasonic.dk/blog 
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
$.jgrid.regional["dk"] = {
	defaults : {
		recordtext: "View {0} - {1} of {2}",
	    emptyrecords: "No records to view",
		loadtext: "Loading...",
		savetext: "Saving...",
		pgtext : "Page {0} of {1}",
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
	    caption: "Søg...",
	    Find: "Find",
	    Reset: "Nulstil",
	    odata: [{ oper:'eq', text:'equal'},{ oper:'ne', text:'not equal'},{ oper:'lt', text:'less'},{ oper:'le', text:'less or equal'},{ oper:'gt', text:'greater'},{ oper:'ge', text:'greater or equal'},{ oper:'bw', text:'begins with'},{ oper:'bn', text:'does not begin with'},{ oper:'in', text:'is in'},{ oper:'ni', text:'is not in'},{ oper:'ew', text:'ends with'},{ oper:'en', text:'does not end with'},{ oper:'cn', text:'contains'},{ oper:'nc', text:'does not contain'},{ oper:'nu', text:'is null'},{ oper:'nn', text:'is not null'}, {oper:'bt', text:'between'}],
	    groupOps: [	{ op: "AND", text: "all" },	{ op: "OR",  text: "any" }	],
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
	    addCaption: "Tilføj",
	    editCaption: "Ret",
	    bSubmit: "Send",
	    bCancel: "Annuller",
		bClose: "Luk",
		saveData: "Data has been changed! Save changes?",
		bYes : "Yes",
		bNo : "No",
		bExit : "Cancel",
	    msg: {
	        required:"Felt er nødvendigt",
	        number:"Indtast venligst et validt tal",
	        minValue:"værdi skal være større end eller lig med",
	        maxValue:"værdi skal være mindre end eller lig med",
	        email: "er ikke en valid email",
	        integer: "Indtast venligst et validt heltalt",
			date: "Indtast venligst en valid datoværdi",
			url: "is not a valid URL. Prefix required ('http://' or 'https://')",
			nodefined : " is not defined!",
			novalue : " return value is required!",
			customarray : "Custom function should return array!",
			customfcheck : "Custom function should be present in case of custom checking!"
		}
	},
	view : {
	    caption: "View Record",
	    bClose: "Close"
	},
	del : {
	    caption: "Slet",
	    msg: "Slet valgte række(r)?",
	    bSubmit: "Slet",
	    bCancel: "Annuller"
	},
	nav : {
		edittext: " ",
	    edittitle: "Rediger valgte række",
		addtext:" ",
	    addtitle: "Tilføj ny række",
	    deltext: " ",
	    deltitle: "Slet valgte række",
	    searchtext: " ",
	    searchtitle: "Find poster",
	    refreshtext: "",
	    refreshtitle: "Indlæs igen",
	    alertcap: "Advarsel",
	    alerttext: "Vælg venligst række",
		viewtext: "",
		viewtitle: "View selected row",
		savetext: "",
		savetitle: "Save row",
		canceltext: "",
		canceltitle : "Cancel row editing",
		selectcaption : "Actions..."
	},
	col : {
	    caption: "Vis/skjul kolonner",
	    bSubmit: "Send",
	    bCancel: "Annuller"
	},
	errors : {
		errcap : "Fejl",
		nourl : "Ingel url valgt",
		norecords: "Ingen poster at behandle",
	    model : "colNames og colModel har ikke samme længde!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaultValue: '0'},
		number : {decimalSeparator:",", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0,00'},
		currency : {decimalSeparator:",", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0,00'},
		date : {
			dayNames:   [
				"Søn", "Man", "Tirs", "Ons", "Tors", "Fre", "Lør",
				"Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"
			],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
				"Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"
			],
			AmPm : ["","","",""],
			S: function (j) {return '.'},
			srcformat: 'Y-m-d',
			newformat: 'd/m/Y',
			parseRe : /[#%\\\/:_;.,\t\s-]/,
			masks : {
	            ISO8601Long:"Y-m-d H:i:s",
	            ISO8601Short:"Y-m-d",
	            ShortDate: "j/n/Y",
	            LongDate: "l d. F Y",
	            FullDateTime: "l d F Y G:i:s",
	            MonthDay: "d. F",
	            ShortTime: "G:i",
	            LongTime: "G:i:s",
	            SortableDateTime: "Y-m-d\\TH:i:s",
	            UniversalSortableDateTime: "Y-m-d H:i:sO",
	            YearMonth: "F Y"
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
// DK
}));
