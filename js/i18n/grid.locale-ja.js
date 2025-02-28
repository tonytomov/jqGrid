/**
 * jqGrid Japanese Translation
 * OKADA Yoshitada okada.dev@sth.jp
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
$.jgrid.regional["ja"] = {
	defaults : {
		recordtext: "{2} \u4EF6\u4E2D {0} - {1} \u3092\u8868\u793A ",
	    emptyrecords: "\u8868\u793A\u3059\u308B\u30EC\u30B3\u30FC\u30C9\u304C\u3042\u308A\u307E\u305B\u3093",
		loadtext: "\u8aad\u307f\u8fbc\u307f\u4e2d...",
		pgtext : "{1} \u30DA\u30FC\u30B8\u4E2D {0} \u30DA\u30FC\u30B8\u76EE ",
		savetext: "\u4fdd\u5b58\u4e2d...",
		pgfirst : "\u6700\u521d\u306e\u30da\u30fc\u30b8\u3078",
		pglast : "\u6700\u5f8c\u306e\u30da\u30fc\u30b8\u3078",
		pgnext : "\u6b21\u306e\u30da\u30fc\u30b8",
		pgprev : "\u524d\u306e\u30da\u30fc\u30b8",
		pgrecs : "\u30da\u30fc\u30b8\u5358\u4f4d\u306e\u30ec\u30b3\u30fc\u30c9\u6570",
		showhide: "\u30b0\u30ea\u30c3\u30c9\u306e\u5c55\u958b/\u9589\u3058\u8fbc\u307f",
		// mobile
		pagerCaption : "\u30b0\u30ea\u30c3\u30c9::\u30da\u30fc\u30b8\u8a2d\u5b9a",
		pageText : "\u30da\u30fc\u30b8:",
		recordPage : "\u30da\u30fc\u30b8\u5358\u4f4d\u306e\u30ec\u30b3\u30fc\u30c9\u6570",
		nomorerecs : "\u30ec\u30b3\u30fc\u30c9\u304c\u3042\u308a\u307e\u305b\u3093...",
		scrollPullup: "\u4e0a\u306b\u30b9\u30af\u30ed\u30fc\u30eb\u3057\u3066\u8aad\u307f\u8fbc\u307f...",
		scrollPulldown : "\u4e0b\u306b\u30b9\u30af\u30ed\u30fc\u30eb\u3057\u3066\u66f4\u65b0...",
		scrollRefresh : "\u653e\u3057\u3066\u66f4\u65b0...",
		valT : "checked",
		valF : "unchecked",
		selectLine : "Select row",
		selectAllLines : "Select all rows"
	},
	search : {
	    caption: "\u691c\u7d22...",
	    Find: "\u691c\u7d22",
	    Reset: "\u30ea\u30bb\u30c3\u30c8",
	    odata: [{ oper:'eq', text:"\u6B21\u306B\u7B49\u3057\u3044"}, { oper:'ne', text:"\u6B21\u306B\u7B49\u3057\u304F\u306A\u3044"},
            { oper:'lt', text:"\u6B21\u3088\u308A\u5C0F\u3055\u3044"}, { oper:'le', text:"\u6B21\u306B\u7B49\u3057\u3044\u304B\u5C0F\u3055\u3044"},
            { oper:'gt', text:"\u6B21\u3088\u308A\u5927\u304D\u3044"}, { oper:'ge', text:"\u6B21\u306B\u7B49\u3057\u3044\u304B\u5927\u304D\u3044"},
            { oper:'bw', text:"\u6B21\u3067\u59CB\u307E\u308B"}, { oper:'bn', text:"\u6B21\u3067\u59CB\u307E\u3089\u306A\u3044"},
            { oper:'in', text:"\u6B21\u306B\u542B\u307E\u308C\u308B"}, { oper:'ni', text:"\u6B21\u306B\u542B\u307E\u308C\u306A\u3044"},
            { oper:'ew', text:"\u6B21\u3067\u7D42\u308F\u308B"}, { oper:'en', text:"\u6B21\u3067\u7D42\u308F\u3089\u306A\u3044"},
            { oper:'cn', text:"\u6B21\u3092\u542B\u3080"}, { oper:'nc', text:"\u6B21\u3092\u542B\u307E\u306A\u3044"},
			{ oper:'nu', text:'is null'},{ oper:'nn', text:'is not null'}, {oper:'bt', text:'between'}],
	    groupOps: [{
                op: "AND",
                text: "\u3059\u3079\u3066\u306E"
            },
            {
                op: "OR",
                text: "\u3044\u305A\u308C\u304B\u306E"
            }],
		operandTitle : "\u30af\u30ea\u30c3\u30af\u3057\u3066\u691c\u7d22\u64cd\u4f5c\u3092\u9078\u629e",
		resetTitle : "\u691c\u7d22\u5024\u3092\u30ea\u30bb\u30c3\u30c8",
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
	    addCaption: "\u30ec\u30b3\u30fc\u30c9\u8ffd\u52a0",
	    editCaption: "\u30ec\u30b3\u30fc\u30c9\u7de8\u96c6",
	    bSubmit: "\u9001\u4fe1",
	    bCancel: "\u30ad\u30e3\u30f3\u30bb\u30eb",
  		bClose: "\u9589\u3058\u308b",
      saveData: "\u30C7\u30FC\u30BF\u304C\u5909\u66F4\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u4FDD\u5B58\u3057\u307E\u3059\u304B\uFF1F",
      bYes: "\u306F\u3044",
      bNo: "\u3044\u3044\u3048",
      bExit: "\u30AD\u30E3\u30F3\u30BB\u30EB",
	    msg: {
	        required:"\u3053\u306e\u9805\u76ee\u306f\u5fc5\u9808\u3067\u3059\u3002",
	        number:"\u6b63\u3057\u3044\u6570\u5024\u3092\u5165\u529b\u3057\u3066\u4e0b\u3055\u3044\u3002",
	        minValue:"\u6b21\u306e\u5024\u4ee5\u4e0a\u3067\u5165\u529b\u3057\u3066\u4e0b\u3055\u3044\u3002",
	        maxValue:"\u6b21\u306e\u5024\u4ee5\u4e0b\u3067\u5165\u529b\u3057\u3066\u4e0b\u3055\u3044\u3002",
	        email: "e-mail\u304c\u6b63\u3057\u304f\u3042\u308a\u307e\u305b\u3093\u3002",
	        integer: "\u6b63\u3057\u3044\u6574\u6570\u5024\u3092\u5165\u529b\u3057\u3066\u4e0b\u3055\u3044\u3002",
    			date: "\u6b63\u3057\u3044\u5024\u3092\u5165\u529b\u3057\u3066\u4e0b\u3055\u3044\u3002",
          url: "\u306F\u6709\u52B9\u306AURL\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u30D7\u30EC\u30D5\u30A3\u30C3\u30AF\u30B9\u304C\u5FC5\u8981\u3067\u3059\u3002 ('http://' \u307E\u305F\u306F 'https://')",
          nodefined: " \u304C\u5B9A\u7FA9\u3055\u308C\u3066\u3044\u307E\u305B\u3093",
          novalue: " \u623B\u308A\u5024\u304C\u5FC5\u8981\u3067\u3059",
          customarray: "\u30AB\u30B9\u30BF\u30E0\u95A2\u6570\u306F\u914D\u5217\u3092\u8FD4\u3059\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
          customfcheck: "\u30AB\u30B9\u30BF\u30E0\u691C\u8A3C\u306B\u306F\u30AB\u30B9\u30BF\u30E0\u95A2\u6570\u304C\u5FC5\u8981\u3067\u3059"
		}
	},
	view : {
      caption: "\u30EC\u30B3\u30FC\u30C9\u3092\u8868\u793A",
      bClose: "\u9589\u3058\u308B"
	},
	del : {
	    caption: "\u524a\u9664",
	    msg: "\u9078\u629e\u3057\u305f\u30ec\u30b3\u30fc\u30c9\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f",
	    bSubmit: "\u524a\u9664",
	    bCancel: "\u30ad\u30e3\u30f3\u30bb\u30eb"
	},
	nav : {
    	edittext: " ",
	    edittitle: "\u9078\u629e\u3057\u305f\u884c\u3092\u7de8\u96c6",
      addtext:" ",
	    addtitle: "\u884c\u3092\u65b0\u898f\u8ffd\u52a0",
	    deltext: " ",
	    deltitle: "\u9078\u629e\u3057\u305f\u884c\u3092\u524a\u9664",
	    searchtext: " ",
	    searchtitle: "\u30ec\u30b3\u30fc\u30c9\u691c\u7d22",
	    refreshtext: "",
	    refreshtitle: "\u30b0\u30ea\u30c3\u30c9\u3092\u30ea\u30ed\u30fc\u30c9",
	    alertcap: "\u8b66\u544a",
	    alerttext: "\u884c\u3092\u9078\u629e\u3057\u3066\u4e0b\u3055\u3044\u3002",
      viewtext: "",
      viewtitle: "\u9078\u629E\u3057\u305F\u884C\u3092\u8868\u793A",
		savetext: "",
		savetitle: "\u5217\u3092\u4fdd\u5b58",
		canceltext: "",
		canceltitle : "\u5217\u306e\u7de8\u96c6\u3092\u30ad\u30e3\u30f3\u30bb\u30eb",
		selectcaption : "\u30a2\u30af\u30b7\u30e7\u30f3..."
	},
	col : {
	    caption: "\u5217\u3092\u8868\u793a\uff0f\u96a0\u3059",
	    bSubmit: "\u9001\u4fe1",
	    bCancel: "\u30ad\u30e3\u30f3\u30bb\u30eb"	
	},
	errors : {
		errcap : "\u30a8\u30e9\u30fc",
		nourl : "URL\u304c\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002",
		norecords: "\u51e6\u7406\u5bfe\u8c61\u306e\u30ec\u30b3\u30fc\u30c9\u304c\u3042\u308a\u307e\u305b\u3093\u3002",
	    model : "colNames\u306e\u9577\u3055\u304ccolModel\u3068\u4e00\u81f4\u3057\u307e\u305b\u3093\u3002"
	},
	formatter : {
            integer: {
                thousandsSeparator: ",",
                defaultValue: '0'
            },
            number: {
                decimalSeparator: ".",
                thousandsSeparator: ",",
                decimalPlaces: 2,
                defaultValue: '0.00'
            },
            currency: {
                decimalSeparator: ".",
                thousandsSeparator: ",",
                decimalPlaces: 0,
                prefix: "",
                suffix: "",
                defaultValue: '0'
            },
		date : {
			dayNames:   [
				"\u65e5", "\u6708", "\u706b", "\u6c34", "\u6728", "\u91d1", "\u571f",
				"\u65e5", "\u6708", "\u706b", "\u6c34", "\u6728", "\u91d1", "\u571f"
			],
			monthNames: [
				"1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
				"1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) { return "\u756a\u76ee"; },
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
