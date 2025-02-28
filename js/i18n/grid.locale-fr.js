/**
 * jqGrid French Translation
 * Tony Tomov tony@trirand.com
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
$.jgrid.regional["fr"] = {
	defaults : {
		recordtext: "Enregistrements {0} - {1} sur {2}",
		emptyrecords: "Aucun enregistrement à afficher",
		loadtext: "Chargement...",
		savetext: "Sauvegarde en cours...",
		pgtext : "Page {0} de {1}",
		pgfirst : "Première page",
		pglast : "Dernière page",
		pgnext : "Page suivante",
		pgprev : "Page précédente",
		pgrecs : "Enregistrements par page",
		showhide: "Réduire/Agrandir la grille",
		// mobile
		pagerCaption : "Grille::Options de pagination",
		pageText : "Page:",
		recordPage: "Enregistrements par page",
		nomorerecs : "Plus de données...",
		scrollPullup: "Glisser vers le haut pour charger plus de données...",
		scrollPulldown : "Glisser vers le bas pour rafraîchir...",
		scrollRefresh : "Relâcher pour rafraîchir...",
		valueCheckbox : "Case à cocher",
		valT : "cochée",
		valF : "décochée",
		selectLine : "Sélectionner une ligne",
		selectAllLines : "Sélectionner toutes les lignes"
	},
	search : {
		caption: "Recherche...",
		Find: "Chercher",
		Reset: "Réinitialiser",
		odata: [{ oper:'eq', text:"égal"},{ oper:'ne', text:"différent"},{ oper:'lt', text:"inférieur"},{ oper:'le', text:"inférieur ou égal"},{ oper:'gt', text:"supérieur"},{ oper:'ge', text:"supérieur ou égal"},{ oper:'bw', text:"commence par"},{ oper:'bn', text:"ne commence pas par"},{ oper:'in', text:"est dans"},{ oper:'ni', text:"n'est pas dans"},{ oper:'ew', text:"finit par"},{ oper:'en', text:"ne finit pas par"},{ oper:'cn', text:"contient"},{ oper:'nc', text:"ne contient pas"},{ oper:'nu', text:'is null'},{ oper:'nn', text:'is not null'}, {oper:'bt', text:'entre'}],
		groupOps: [	{ op: "AND", text: "tous" },	{ op: "OR",  text: "au moins un" }	],
		operandTitle : "Cliquer pour sélectionner l'opérateur.",
		resetTitle : "Réinitialiser la valeur de recherche",
		addsubgrup : "Add subgroup",
		addrule : "Add rule",
		delgroup : "Delete group",
		delrule : "Delete rule",
		Close : "Close",
		Operand : "Operand : ",
		Operation : "Oper : ",
		filterFor : "filtre pour"
	},
	edit : {
		addCaption: "Ajouter",
		editCaption: "Éditer",
		bSubmit: "Valider",
		bCancel: "Annuler",
		bClose: "Fermer",
		saveData: "Les données ont changé ! Enregistrer les modifications ?",
		bYes: "Oui",
		bNo: "Non",
		bExit: "Annuler",
		msg: {
			required: "Champ obligatoire",
			number: "Saisissez un nombre correct",
			minValue: "La valeur doit être supérieure ou égale à",
			maxValue: "La valeur doit être inférieure ou égale à",
			email: "n'est pas un email valide",
			integer: "Saisissez un entier valide",
			url: "n'est pas une adresse valide. Préfixe requis ('http://' or 'https://')",
			nodefined : " n'est pas défini!",
			novalue : " la valeur de retour est requise!",
			customarray : "Une fonction personnalisée devrait retourner un tableau (array)!",
			customfcheck : "Une fonction personnalisée devrait être présente dans le cas d'une vérification personnalisée!"
		}
	},
	view : {
		caption: "Voir les enregistrements",
		bClose: "Fermer"
	},
	del : {
		caption: "Supprimer",
		msg: "Supprimer les enregistrements sélectionnés ?",
		bSubmit: "Supprimer",
		bCancel: "Annuler"
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
		viewtitle: "Afficher la ligne sélectionnée",
		savetext: "",
		savetitle: "Sauvegarder la ligne",
		canceltext: "",
		canceltitle : "Annuler l'édition de la ligne",
		selectcaption : "Actions..."
	},
	col : {
		caption: "Afficher/Masquer les colonnes",
		bSubmit: "Valider",
		bCancel: "Annuler"
	},
	errors : {
		errcap : "Erreur",
		nourl : "Aucune adresse n'est paramétrée",
		norecords: "Aucun enregistrement à traiter",
		model : "Nombre de titres (colNames) <> Nombre de données (colModel)!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaultValue: '0'},
		number : {decimalSeparator:",", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0,00'},
		currency : {decimalSeparator:",", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0,00'},
		date : {
			dayNames:   [
				"Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam",
				"Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"
			],
			monthNames: [
				"Jan", "Fév", "Mar", "Avr", "Mai", "Jui", "Jul", "Aou", "Sep", "Oct", "Nov", "Déc",
				"Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) {return j == 1 ? 'er' : 'e';},
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
		sortasc : "Trier en ordre croissant",
		sortdesc: "Trier en ordre décroissant",
		columns : "Colonnes",
		filter : "Filtrer",
		grouping : "Grouper par",
		ungrouping : "Séparer",
		searchTitle : "Prendre les items avec la valeur:",
		freeze : "Figer",
		unfreeze : "Relâcher",
		reorder : "Déplacer pour changer l'ordre",
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
