;(function($){
/**
 * jqGrid French Translation
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
$.jgrid = {
	defaults : {
		recordtext: "View {0} - {1} of {2}",
	    emptyrecords: "No records to view",
		loadtext: "Chargement...",
		pgtext : "Page {0} of {1}"
	},
	search : {
	    caption: "Recherche...",
	    Find: "Chercher",
	    Reset: "Annuler",
	    odata : ['equal', 'not equal', 'less', 'less or equal','greater','greater or equal', 'begins with','does not begin with','is in','is not in','ends with','does not end with','contains','does not contain'],
	    groupOps: [	{ op: "AND", text: "all" },	{ op: "OR",  text: "any" }	],
		matchText: " match",
		rulesText: " rules"
	},
	edit : {
	    addCaption: "Ajouter",
	    editCaption: "Editer",
	    bSubmit: "Valider",
	    bCancel: "Annuler",
		bClose: "Fermer",
	    processData: "Traitement...",
	    msg: {
	        required:"Champ obligatoire",
	        number:"Saisissez un nombre valide",
	        minValue:"La valeur doit être supérieure ou égal à 0 ",
	        maxValue:"La valeur doit être inférieure ou égal à 0",
	        email: "n'est pas un email valide",
	        integer: "Saisissez un entier valide",
			url: "is not a valid URL. Prefix required ('http://' or 'https://')"
		}
	},
	view : {
	    caption: "View Record",
	    bClose: "Close"
	},
	del : {
	    caption: "Supprimer",
	    msg: "Supprimer les enregistrements sélectionnés ?",
	    bSubmit: "Supprimer",
	    bCancel: "Annuler",
	    processData: "Traitement..."
	},
	nav : {
		edittext: " ",
	    edittitle: "Editer la ligne sélectionnée",
		addtext:" ",
	    addtitle: "Ajouter une ligne",
	    deltext: " ",
	    deltitle: "Supprimer la ligne sélectionnée",
	    searchtext: " ",
	    searchtitle: "Chercher un enregistrement",
	    refreshtext: "",
	    refreshtitle: "Recharger le tableau",
	    alertcap: "Avertissement",
	    alerttext: "Veuillez sélectionner une ligne",
		viewtext: "",
		viewtitle: "View selected row"
	},
	col : {
	    caption: "Afficher/Masquer les colonnes",
	    bSubmit: "Valider",
	    bCancel: "Annuler"	
	},
	errors : {
		errcap : "Erreur",
		nourl : "Aucune url paramétrée",
		norecords: "Aucun enregistrement à traiter",
		model : "Nombre de titres (colNames) <> Nombre de données (colModel)!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaulValue: 0},
		number : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, defaulValue: 0},
		currency : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaulValue: 0},
		date : {
			dayNames:   [
				"Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam",
				"Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"
			],
			monthNames: [
				"Jan", "Fev", "Mar", "Avr", "Mai", "Jui", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec",
				"Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Saptembre", "Octobre", "Novembre", "Décembre"
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
