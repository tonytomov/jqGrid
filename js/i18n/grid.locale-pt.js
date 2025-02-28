/**
 * jqGrid Portuguese Translation
 * Traduçã da jqGrid em Portugues por Frederico Carvalho, http://www.eyeviewdesign.pt
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
$.jgrid.regional["pt"] = {
	defaults : {
		recordtext: "View {0} - {1} of {2}",
	    emptyrecords: "No records to view",
		loadtext: "A carregar...",
		pgtext : "Página {0} de {1}",
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
	    caption: "Busca...",
	    Find: "Procurar",
	    Reset: "Limpar",
	    odata: [{ oper:'eq', text:'igual'},{ oper:'ne', text:'desigual'},{oper:'lt', text:'menor'},{ oper:'le', text:'menor ou igual'},{ oper:'gt',text:'maior'},{ oper:'ge', text:'maior ou igual'},{ oper:'bw', text:'comecacom'},{ oper:'bn', text:'nao comeca com'},{ oper:'in', text:'estadentro'},{ oper:'ni', text:'nao esta dentro'},{ oper:'ew', text:'finalizacom'},{ oper:'en', text:'nao finaliza com'},{ oper:'cn', text:'contem'},{oper:'nc', text:'nao contem'}],
	    groupOps: [ { op: "AND", text: "tudo" }, { op: "OR", text:"qualquer" } ],
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
	    addCaption: "Adicionar Registo",
	    editCaption: "Modificar Registo",
	    bSubmit: "Submeter",
	    bCancel: "Cancelar",
		bClose: "Fechar",
		saveData: "Dados foram alterados. Guardar?",
		bYes : "Sim",
		bNo : "Nao",
		bExit : "Cancelar",
	    msg: {
	        required:"Campo obrigatório",
	        number:"Por favor, introduza um numero",
	        minValue:"O valor deve ser maior ou igual que",
	        maxValue:"O valor deve ser menor ou igual a",
	        email: "Não é um email válid",
	        integer: "Por favor, introduza um numero inteiro",
			date: "Introduza una fecha correcta ",
			url: "nao e um URL valido. Requerido prefixo ('http://' or 'https://')",
			nodefined : " nao esta definido!",
			novalue : " valor requerido!",
			customarray : "Funcao customizada deve entrar!",
			customfcheck : "Funcao customizada deve estar presente em caso deconfirmar customizacao!"
		}
	},
	view : {
	    caption: "View Record",
	    bClose: "Close"
	},
	del : {
	    caption: "Eliminar",
	    msg: "Deseja eliminar o(s) registo(s) seleccionado(s)?",
	    bSubmit: "Eliminar",
	    bCancel: "Cancelar"
	},
	nav : {
		edittext: " ",
	    edittitle: "Modificar registo seleccionado",
		addtext:" ",
	    addtitle: "Adicionar novo registo",
	    deltext: " ",
	    deltitle: "Eliminar registo seleccionado",
	    searchtext: " ",
	    searchtitle: "Procurar",
	    refreshtext: "",
	    refreshtitle: "Actualizar",
	    alertcap: "Aviso",
	    alerttext: "Por favor, seleccione um registo",
		viewtext: "",
		viewtitle: "Ver coluna selecionada",
		savetext: "",
		savetitle: "Save row",
		canceltext: "",
		canceltitle : "Cancel row editing",
		selectcaption : "Actions..."
	},
	col : {
	    caption: "Mostrar/Ocultar Colunas",
	    bSubmit: "Enviar",
	    bCancel: "Cancelar"	
	},
	errors : {
		errcap : "Erro",
		nourl : "Não especificou um url",
		norecords: "Não existem dados para processar",
	    model : "Tamanho do colNames <> colModel!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaultValue: '0'},
		number : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0.00'},
		currency : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0.00'},
		date : {
			dayNames:   [
				"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab",
				"Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"
			],
			monthNames: [
				"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
				"Janeiro", "Fevereiro", "Mar�o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) {return j < 11 || j > 13 ? ['�', '�', '�', '�'][Math.min((j - 1) % 10, 3)] : '�'},
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
