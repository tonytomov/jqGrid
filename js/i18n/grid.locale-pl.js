;(function($){
/**
 * jqGrid Polish Translation
 * Piotr Roznicki roznicki@o2.pl
 * http://www.roznicki.prv.pl
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
$.jgrid = {
	defaults : {
		recordtext: "View {0} - {1} of {2}",
	    emptyrecords: "No records to view",
		loadtext: "Ładowanie...",
		pgtext : "Page {0} of {1}"
	},
	search : {
	    caption: "Wyszukiwanie...",
	    Find: "Szukaj",
	    Reset: "Czyść",
	    odata : ['equal', 'not equal', 'less', 'less or equal','greater','greater or equal', 'begins with','does not begin with','is in','is not in','ends with','does not end with','contains','does not contain'],
	    groupOps: [	{ op: "AND", text: "all" },	{ op: "OR",  text: "any" }	],
		matchText: " match",
		rulesText: " rules"
	},
	edit : {
	    addCaption: "Dodaj rekord",
	    editCaption: "Edytuj rekord",
	    bSubmit: "Zapisz",
	    bCancel: "Anuluj",
		bClose: "Zamknij",
	    processData: "Przetwarzanie...",
	    msg: {
	        required:"Pole jest wymagane",
	        number:"Proszę wpisać poprawną liczbę",
	        minValue:"wartość musi być większa lub równa",
	        maxValue:"wartość musi być mniejsza od",
	        email: "nie jest adresem e-mail",
	        integer: "Proszę wpisać poprawną liczbę",
			date: "Please, enter valid date value",
			url: "is not a valid URL. Prefix required ('http://' or 'https://')"
		}
	},
	view : {
	    caption: "View Record",
	    bClose: "Close"
	},
	del : {
	    caption: "Usuwanie",
	    msg: "Usuń wybrany rekord(y)?",
	    bSubmit: "Usuń",
	    bCancel: "Anuluj",
		    processData: "Przetwarzanie..."
	},
	nav : {
		edittext: " ",
	    edittitle: "Edytuj wybrany wiersz",
		addtext:" ",
	    addtitle: "Dodaj nowy wiersz",
	    deltext: " ",
	    deltitle: "Usuń wybrany wiersz",
	    searchtext: " ",
	    searchtitle: "Wyszukaj rekord",
	    refreshtext: "",
	    refreshtitle: "Przeładuj",
	    alertcap: "Uwaga",
	    alerttext: "Proszę wybrać wiersz",
		viewtext: "",
		viewtitle: "View selected row"
	},
	col : {
	    caption: "Pokaż/Ukryj kolumny",
	    bSubmit: "Zatwierdź",
	    bCancel: "Anuluj"	
	},
	errors : {
		errcap : "Błąd",
		nourl : "Brak adresu url",
		norecords: "Brak danych",
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