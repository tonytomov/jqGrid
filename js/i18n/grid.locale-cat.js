;(function($){
/**
 * jqGrid Catalan Translation
 * Traducció jqGrid en Catatà per Faserline, S.L. - Compatible amb jqGrid 3.4.4
 * http://www.faserline.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
$.jgrid = {
	defaults : {
		recordtext: "View {0} - {1} of {2}",
	    emptyrecords: "No records to view",
		loadtext: "Carregant...",
		pgtext : "Page {0} of {1}"
	},
	search : {
		caption: "Cerca...",
		Find: "Cercar",
		Reset: "Buidar",
	    odata : ['equal', 'not equal', 'less', 'less or equal','greater','greater or equal', 'begins with','does not begin with','is in','is not in','ends with','does not end with','contains','does not contain'],
	    groupOps: [	{ op: "AND", text: "all" },	{ op: "OR",  text: "any" }	],
		matchText: " match",
		rulesText: " rules"
	},
	edit : {
		addCaption: "Afegir registre",
		editCaption: "Modificar registre",
		bSubmit: "Enviar",
		bCancel: "Cancelar",
		bClose: "Tancar",
		processData: "Processant...",
		msg: {
		    required:"Camp obligatori",
		    number:"Introdueixi un nombre",
		    minValue:"El valor ha de ser major o igual que ",
		    maxValue:"El valor ha de ser menor o igual a ",
		    email: "no és una direcció de correu vàlida",
		    integer: "Introdueixi un valor enter",
			date: "Introdueixi una data correcta ",
			url: "is not a valid URL. Prefix required ('http://' or 'https://')"
		}
	},
	view : {
		caption: "Veure registre",
		bClose: "Tancar"
	},
	del : {
		caption: "Eliminar",
		msg: "¿Desitja eliminar els registres seleccionats?",
		bSubmit: "Eliminar",
		bCancel: "Cancelar",
		processData: "Processant..."
	},
	nav : {
		edittext: " ",
		edittitle: "Modificar fila seleccionada",
		addtext:" ",
		addtitle: "Agregar nova fila",
		deltext: " ",
		deltitle: "Eliminar fila seleccionada",
		searchtext: " ",
		searchtitle: "Cercar informació",
		refreshtext: "",
		refreshtitle: "Refrescar taula",
		alertcap: "Avís",
		alerttext: "Seleccioni una fila",
		viewtext: " ",
		viewtitle: "Veure fila seleccionada"
	},
// setcolumns module
	col : {
		caption: "Mostrar/ocultar columnes",
		bSubmit: "Enviar",
		bCancel: "Cancelar"	
	},
	errors : {
		errcap : "Error",
		nourl : "No s'ha especificat una URL",
		norecords: "No hi ha dades per processar",
		model : "Les columnes de noms són diferents de les columnes del model"
	},
	formatter : {
		integer : {thousandsSeparator: ".", defaulValue: 0},
		number : {decimalSeparator:",", thousandsSeparator: ".", decimalPlaces: 2, defaulValue: 0},
		currency : {decimalSeparator:",", thousandsSeparator: ".", decimalPlaces: 2, prefix: "", suffix:"", defaulValue: 0},
		date : {
			dayNames:   [
				"Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds",
				"Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"
			],
			monthNames: [
				"Gen", "Febr", "Març", "Abr", "Maig", "Juny", "Jul", "Ag", "Set", "Oct", "Nov", "Des",
				"Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th'},
			srcformat: 'Y-m-d',
			newformat: 'd-m-Y',
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
		showAction: 'show',
	    target: '',
	    checkbox : {disabled:true},
		idName : 'id'
	}
};
})(jQuery);
