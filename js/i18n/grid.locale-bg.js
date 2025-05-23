/**
 * jqGrid Bulgarian Translation 
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
$.jgrid.regional["bg"] = {
	defaults : {
		recordtext: "{0} - {1} от {2}",
		emptyrecords: "Няма запис(и)",
		loadtext: "Зареждам...",
		savetext: "Записвам...",
		pgtext : "Стр. {0} от {1}",
		pgfirst : "Първа Стр.",
		pglast : "Последна Стр.",
		pgnext : "Следваща Стр.",
		pgprev : "Предишна Стр.",
		pgrecs : "Брой записи на Стр.",
		showhide: "Свиване/Разтягане на таблицата",
		// mobile
		pagerCaption : "Таблица::Настр. Страница",
		pageText : "Страница:",
		recordPage : "Записи на стр.",
		nomorerecs : "Няма повече записи...",
		scrollPullup: "Издърпайте нагоре за повече...",
		scrollPulldown : "Дръпнете надолу за опресняване...",
		scrollRefresh : "Освободете за да опресните...",
		valT : "с отметка",
		valF : "без отметка",
		selectLine : "Избери ред",
		selectAllLines : "Избери всички"
	},
	search : {
		caption: "Търсене...",
		Find: "Намери",
		Reset: "Изчисти",
		odata: [{ oper:'eq', text:"равно"},{ oper:'ne', text:"различно"},{ oper:'lt', text:"по-малко"},{ oper:'le', text:"по-малко или="},{ oper:'gt', text:"по-голямо"},{ oper:'ge', text:"по-голямо или ="},{ oper:'bw', text:"започва с"},{ oper:'bn', text:"не започва с"},{ oper:'in', text:"се намира в"},{ oper:'ni', text:"не се намира в"},{ oper:'ew', text:"завършва с"},{ oper:'en', text:"не завършава с"},{ oper:'cn', text:"съдържа"},{ oper:'nc', text:"не съдържа"},{ oper:'nu', text:'е NULL'},{ oper:'nn', text:'не е NULL'}, {oper:'bt', text:'между'}],
	    groupOps: [	{ op: "AND", text: "&nbsp;И " },	{ op: "OR",  text: "ИЛИ" }	],
		operandTitle : "Натисни за избор на операнд.",
		resetTitle : "Изчисти стойността",
		addsubgrup : "Добави група",
		addrule : "Добави правило",
		delgroup : "Изтрий група",
		delrule : "Изтрий правило",
		Close : "Затвори",
		Operand : "Операнд : ",
		Operation : "Опер. : ",
		filterFor : "филтър за"
	},
	edit : {
		addCaption: "Нов Запис",
		editCaption: "Редакция Запис",
		bSubmit: "Запиши",
		bCancel: "Изход",
		bClose: "Затвори",
		saveData: "Данните са променени! Да съхраня ли промените?",
		bYes : "Да",
		bNo : "Не",
		bExit : "Отказ",
		msg: {
			required:"Полето е задължително",
			number:"Въведете валидно число!",
			minValue:"стойността трябва да е по-голяма или равна от",
			maxValue:"стойността трябва да е по-малка или равна от",
			email: "не е валиден ел. адрес",
			integer: "Въведете валидно цяло число",
			date: "Въведете валидна дата",
			url: "e невалиден URL. Изискава се префикс('http://' или 'https://')",
			nodefined : " е недефинирана!",
			novalue : " изисква връщане на стойност!",
			customarray : "Потреб. Функция трябва да върне масив!",
			customfcheck : "Потребителска функция е задължителна при този тип елемент!"
		}
	},
	view : {
		caption: "Преглед запис",
		bClose: "Затвори"
	},
	del : {
		caption: "Изтриване",
		msg: "Да изтрия ли избраният запис?",
		bSubmit: "Изтрий",
		bCancel: "Отказ"
	},
	nav : {
		edittext: " ",
		edittitle: "Редакция избран запис",
		addtext:" ",
		addtitle: "Добавяне нов запис",
		deltext: " ",
		deltitle: "Изтриване избран запис",
		searchtext: " ",
		searchtitle: "Търсене запис(и)",
		refreshtext: "",
		refreshtitle: "Обнови таблица",
		alertcap: "Предупреждение",
		alerttext: "Моля, изберете запис",
		viewtext: "",
		viewtitle: "Преглед избран запис",
		savetext: "",
		savetitle: "Съхрани запис",
		canceltext: "",
		canceltitle : "Отказ редакция",
		selectcaption : "Действия..."
	},
	col : {
		caption: "Избери колони",
		bSubmit: "Ок",
		bCancel: "Изход"	
	},
	errors : {
		errcap : "Грешка",
		nourl : "Няма посочен url адрес",
		norecords: "Няма запис за обработка",
		model : "Модела не съответства на имената!"	
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaultValue: '0'},
		number : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0.00'},
		currency : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:" лв.", defaultValue: '0.00'},
		date : {
			dayNames:   [
				"Нед", "Пон", "Вт", "Ср", "Чет", "Пет", "Съб",
				"Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"
			],
			monthNames: [
				"Яну", "Фев", "Мар", "Апр", "Май", "Юни", "Юли", "Авг", "Сеп", "Окт", "Нов", "Дек",
				"Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
			],
			AmPm : ["","","",""],
			S: function (j) {
				if(j==7 || j==8 || j== 27 || j== 28) {
					return 'ми';
				}
				return ['ви', 'ри', 'ти'][Math.min((j - 1) % 10, 2)];
			},
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
		sortasc : "Сортирай възходящо",
		sortdesc : "Сортирай низходящо",
		columns : "Колони",
		filter : "Филтрирай",
		grouping : "Групирай по",
		ungrouping : "Разгрупиране",
		searchTitle : "Търси данни със стойност, която",
		freeze : "Неподвижна",
		unfreeze : "Отмяна неподвижност",
		reorder : "Премести за пренареждане",
		hovermenu: "Щракнете за бързи действия в колоната"
	},
	clipboard : {
		menus : {
			copy_act : "Копирай избраното в клипборда",
			paste_act : "Постави от избраната позиция",
			paste_act_add: "Постави с добавяне",
			undo_act : "Отмени",
			repeat_act_row : "Повтори реда вертикално",
			repeat_act_col : "Повтори колона хоризонтално",
			cancel_act : "Отказ"
		},
		msg : {
			text_c : "Текста е копиран в клипборда.",
			select_pos : "Моля, изберете позиция за поставяне!",
			info_cap : "Информация",
			total_row : "Общо редове: ",
			insert_row: "Добавени: ",
			update_row: "Променени: "
		},
		errors : {
			enb_prm : "Копирането и поставянето е забранено в браузера, моля разрешете го!",
			copy_err : "Неуспешно копиране в клипборда: ",
			read_err : "Неуспешно четене на съдържанието на клипборда: ",
			get_data_err : "Не могат да се получат данни от клипборда или е празен!",
			start_ind_err : "Началният индекс на клетката не е валиден!",
			local_stor_err : "Локалното хранилище не е налично! Не могат да се съхраняват данни за отмяна на промени!",
			not_array_err: "Данните не могат да се конвертират в масив."
		}
	}
};
}));
