;(function($){
/**
 * jqGrid (fi) Finnish Translation
 * Jukka Inkeri  awot.fi  2010-05-19 Version
 * http://awot.fi
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
$.jgrid = {
	defaults : {
		//recordtext: "N&auml;yt&auml; {0} - {1} / {2}",
		recordtext: " {0}-{1}/{2}",
	        emptyrecords: "Ei n&auml;ytett&auml;vi&auml;",
		loadtext: "Haetaan...",
		//pgtext : "Sivu {0} / {1}"
		pgtext : "{0}/{1}"
	},
	search : {
	    caption: "Etsi...",
	    Find: "Etsi",
	    Reset: "Tyhj&auml;&auml;",
	    odata : ['=', '<>', '<', '<=','>','>=', 'alkaa','ei ala','joukossa','ei joukossa ','loppuu','ei lopu','sis&auml;lt&auml;&auml;','ei sis&auml;ll&auml;'],
	    groupOps: [	{ op: "JA", text: "kaikki" },	{ op: "TAI",  text: "mik&auml; tahansa" }	],
		matchText: " match",
		rulesText: " rules"
	},
	edit : {
	    addCaption: "Uusi rivi",
	    editCaption: "Muokkaa rivi",
	    bSubmit: "OK",
	    bCancel: "Peru",
		bClose: "Sulje",
		saveData: "Tietoja muutettu! Tallenetaanko?",
		bYes : "K",
		bNo : "E",
		bExit : "Peru",
	    msg: {
	        required:"pakollinen",
	        number:"Anna kelvollinen nro",
	        minValue:"arvo oltava >= ",
	        maxValue:"arvo oltava  <= ",
	        email: "virheellinen sposti ",
	        integer: "Anna kelvollinen kokonaisluku",
			date: "Anna kelvollinen pvm",
			url: "Ei ole sopiva linkki(URL). Alku oltava ('http://' tai 'https://')",
			nodefined : " ei ole m&auml;&auml;ritelty!",
			novalue : " paluuarvo vaaditaan!",
			customarray : "Custom function should return array!",
			customfcheck : "Custom function should be present in case of custom checking!"
		}
	},
	view : {
	    caption: "N&auml;  rivi",
	    bClose: "Sulje"
	},
	del : {
	    caption: "Poista",
	    msg: "Poista valitut  rivi(t)?",
	    bSubmit: "Poista",
	    bCancel: "Peru"
	},
	nav : {
		edittext: " ",
	    edittitle: "Muokkaa valittu rivi",
		addtext:" ",
	    addtitle: "Uusi rivi",
	    deltext: " ",
	    deltitle: "Poista valittu rivi",
	    searchtext: " ",
	    searchtitle: "Etsi tietoja",
	    refreshtext: "",
	    refreshtitle: "Lataa uudelleen",
	    alertcap: "Varoitus",
	    alerttext: "Valitse rivi",
		viewtext: "",
		viewtitle: "Nayta valitut rivit"
	},
	col : {
	    caption: "Nayta/Piilota sarakkeet",
	    bSubmit: "OK",
	    bCancel: "Peru"	
	},
	errors : {
		errcap : "Virhe",
		nourl : "url asettamatta",
		norecords: "Ei muokattavia tietoja",
	    model : "Pituus colNames <> colModel!"
	},
	formatter : {
		integer : {thousandsSeparator: "", defaultValue: '0'},
		number : {decimalSeparator:",", thousandsSeparator: "", decimalPlaces: 2, defaultValue: '0,00'},
		currency : {decimalSeparator:",", thousandsSeparator: "", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0,00'},
		date : {
			dayNames:   [
				"Su", "Ma", "Ti", "Ke", "To", "Pe", "La",
				"Sunnuntai", "Maanantai", "Tiista", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"
			],
			monthNames: [
				"Tam", "Hel", "Maa", "Huh", "Tou", "Kes", "Hei", "Elo", "Syy", "Lok", "Mar", "Jou",
				"Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kes&auml;kuu", "Hein&auml;kuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th'},
			srcformat: 'Y-m-d',
			newformat: 'd/m/Y',
			masks : {
	            ISO8601Long:"Y-m-d H:i:s",
	            ISO8601Short:"Y-m-d",
	            ShortDate: "d.m.Y",
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
// FI
})(jQuery);
