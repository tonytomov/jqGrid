;(function($){
/**
 * jqGrid German Translation
 * Version 1.0.0 (developed for jQuery Grid 3.3.1)
 * Olaf Klöppel opensource@blue-hit.de
 * http://blue-hit.de/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
$.jgrid = {
	defaults : {
		recordtext: "View {0} - {1} of {2}",
	    emptyrecords: "No records to view",
		loadtext: "Lädt...",
		pgtext : "Page {0} of {1}"
	},
	search : {
		caption: "Suche...",
		Find: "Finden",
		Reset: "Zurücksetzen",
	    odata : ['equal', 'not equal', 'less', 'less or equal','greater','greater or equal', 'begins with','does not begin with','is in','is not in','ends with','does not end with','contains','does not contain'],
	    groupOps: [	{ op: "AND", text: "all" },	{ op: "OR",  text: "any" }	],
		matchText: " match",
		rulesText: " rules"
	},
	edit : {
		addCaption: "Datensatz hinzufügen",
		editCaption: "Datensatz bearbeiten",
		bSubmit: "Speichern",
		bCancel: "Abbrechen",
		bClose: "Schließen",
		processData: "Verarbeitung läuft...",
		msg: {
		    required:"Feld ist erforderlich",
		    number: "Bitte geben Sie eine Zahl ein",
		    minValue:"Wert muss größer oder gleich sein, als ",
		    maxValue:"Wert muss kleiner oder gleich sein, als ",
		    email: "ist keine valide E-Mail Adresse",
		    integer: "Bitte geben Sie eine Ganzzahl ein",
			date: "Please, enter valid date value",
			url: "is not a valid URL. Prefix required ('http://' or 'https://')"
		}
	},
	view : {
	    caption: "View Record",
	    bClose: "Close"
	},
	del : {
		caption: "Löschen",
		msg: "Ausgewählte Datensätze löschen?",
		bSubmit: "Löschen",
		bCancel: "Abbrechen",
		processData: "Verarbeitung läuft..."
	},
	nav : {
		edittext: " ",
	    edittitle: "Ausgewählten Zeile editieren",
		addtext:" ",
	    addtitle: "Neuen Zeile einfügen",
	    deltext: " ",
	    deltitle: "Ausgewählte Zeile löschen",
	    searchtext: " ",
	    searchtitle: "Datensatz finden",
	    refreshtext: "",
	    refreshtitle: "Tabelle neu laden",
	    alertcap: "Warnung",
	    alerttext: "Bitte Zeile auswählen",
		viewtext: "",
		viewtitle: "View selected row"
	},
	col : {
		caption: "Spalten anzeigen/verbergen",
		bSubmit: "Speichern",
		bCancel: "Abbrechen"	
	},
	errors : {
		errcap : "Fehler",
		nourl : "Keine URL angegeben",
		norecords: "Keine Datensätze zum verarbeiten",
		model : "Length of colNames <> colModel!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaulValue: 0},
		number : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, defaulValue: 0},
		currency : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaulValue: 0},
		date : {
			dayNames:   [
				"Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat",
				"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
			],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
				"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th'},
			srcformat: 'Y-m-d',
			newformat: 'd/m/Y',
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
		    reformatAfterEdit : false
		},
		baseLinkUrl: '',
		showAction: '',
	    target: '',
	    checkbox : {disabled:true},
		idName : 'id'
	}
};
})(jQuery);

