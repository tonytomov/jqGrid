;(function($){
/**
 * jqGrid Spanish Translation
 * Traduccion jqGrid en Español por Yamil Bracho
 * Traduccion corregida y ampliada por Faserline, S.L. - http://www.faserline.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
$.jgrid = {
	defaults : {
		recordtext: "View {0} - {1} of {2}",
	    emptyrecords: "No records to view",
		loadtext: "Cargando...",
		pgtext : "Page {0} of {1}"
	},
	search : {
	    caption: "Búsqueda...",
	    Find: "Buscar",
	    Reset: "Limpiar",
	    odata : ['equal', 'not equal', 'less', 'less or equal','greater','greater or equal', 'begins with','does not begin with','is in','is not in','ends with','does not end with','contains','does not contain'],
	    groupOps: [	{ op: "AND", text: "all" },	{ op: "OR",  text: "any" }	],
		matchText: " match",
		rulesText: " rules"
	},
	edit : {
	    addCaption: "Agregar registro",
	    editCaption: "Modificar registro",
	    bSubmit: "Enviar",
	    bCancel: "Cancelar",
		bClose: "Cerrar",
	    processData: "Procesando...",
	    msg: {
	        required:"Campo obligatorio",
	        number:"Introduzca un número",
	        minValue:"El valor debe ser mayor o igual a ",
	        maxValue:"El valor debe ser menor o igual a ",
	        email: "no es una dirección de correo válida",
	        integer: "Introduzca un valor entero",
			date: "Introduza una fecha correcta ",
			url: "is not a valid URL. Prefix required ('http://' or 'https://')"
		}
	},
	view : {
	    caption: "View Record",
	    bClose: "Close"
	},
	del : {
	    caption: "Eliminar",
	    msg: "¿Desea eliminar los registros seleccionados?",
	    bSubmit: "Eliminar",
	    bCancel: "Cancelar",
	    processData: "Procesando..."
	},
	nav : {
		edittext: " ",
	    edittitle: "Modificar fila seleccionada",
		addtext:" ",
	    addtitle: "Agregar nueva fila",
	    deltext: " ",
	    deltitle: "Eliminar fila seleccionada",
	    searchtext: " ",
	    searchtitle: "Buscar información",
	    refreshtext: "",
	    refreshtitle: "Recargar datos",
	    alertcap: "Aviso",
	    alerttext: "Seleccione una fila",
		viewtext: "",
		viewtitle: "View selected row"
	},
	col : {
	    caption: "Mostrar/ocultar columnas",
	    bSubmit: "Enviar",
	    bCancel: "Cancelar"	
	},
	errors : {
		errcap : "Error",
		nourl : "No se ha especificado una URL",
		norecords: "No hay datos para procesar",
	    model : "Las columnas de nombres son diferentes de las columnas de modelo"
	},
	formatter : {
		integer : {thousandsSeparator: ".", defaulValue: 0},
		number : {decimalSeparator:",", thousandsSeparator: ".", decimalPlaces: 2, defaulValue: 0},
		currency : {decimalSeparator:",", thousandsSeparator: ".", decimalPlaces: 2, prefix: "", suffix:"", defaulValue: 0},
		date : {
			dayNames:   [
				"Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa",
				"Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"
			],
			monthNames: [
				"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
				"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
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
		showAction: '',
	    target: '',
	    checkbox : {disabled:true},
		idName : 'id'
	}
};
})(jQuery);
