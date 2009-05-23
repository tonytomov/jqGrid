;(function($){
/**
 * jqGrid Russian Translation v1.1 21.01.2009
 * Alexey Kanaev softcore@rambler.ru
 * http://softcore.com.ru 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
$.jgrid = {
	defaults : {
		recordtext: "View {0} - {1} of {2}",
	    emptyrecords: "No records to view",
		loadtext: "Загрузка...",
		pgtext : "Page {0} of {1}"
	},
	search : {
	    caption: "Поиск...",
	    Find: "Найти",
	    Reset: "Сброс",
	    odata : ['equal', 'not equal', 'less', 'less or equal','greater','greater or equal', 'begins with','does not begin with','is in','is not in','ends with','does not end with','contains','does not contain'],
	    groupOps: [	{ op: "AND", text: "all" },	{ op: "OR",  text: "any" }	],
		matchText: " match",
		rulesText: " rules"
	},
	edit : {
	    addCaption: "Добавить запись",
	    editCaption: "Редактировать запись",
	    bSubmit: "Сохранить",
	    bCancel: "Отмена",
		bClose: "Закрыть",
	    processData: "Обработка...",
	    msg: {
	        required:"Поле является обязательным",
	        number:"Пожалуйста, введите правильное число",
	        minValue:"значение должно быть больше либо равно",
	        maxValue:"значение должно быть больше либо равно",
	        email: "некорректное значение e-mail",
	        integer: "Пожалуйста введите целое число",
			date: "Please, enter valid date value",
			url: "is not a valid URL. Prefix required ('http://' or 'https://')"
		}
	},
	view : {
	    caption: "View Record",
	    bClose: "Close"
	},
	del : {
	    caption: "Удалить",
	    msg: "Удалить выделенную запись(и)?",
	    bSubmit: "Удвлить",
	    bCancel: "Отмена",
	    processData: "Обработка..."
	},
	nav : {
		edittext: " ",
	    edittitle: "Редактировать выделенную запись",
		addtext:" ",
	    addtitle: "Добавить новую запись",
	    deltext: " ",
	    deltitle: "Удалить выделенную запись",
	    searchtext: " ",
	    searchtitle: "Найти записи",
	    refreshtext: "",
	    refreshtitle: "Обновить таблицу",
	    alertcap: "Внимание",
	    alerttext: "Пожалуйста, выделите запись",
		viewtext: "",
		viewtitle: "View selected row"
	},
	col : {
	    caption: "Показать/скрыть столбцы",
	    bSubmit: "Сохранить",
	    bCancel: "Отмена"	
	},
	errors : {
		errcap : "Ошибка",
		nourl : "URL не установлен",
		norecords: "Нет записей для обработки",
	    model : "Число полей не соответствует числу столбцов таблицы!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaulValue: 0},
		number : {decimalSeparator:",", thousandsSeparator: " ", decimalPlaces: 2, defaulValue: 0},
		currency : {decimalSeparator:",", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaulValue: 0},
		date : {
			dayNames:   [
				"Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб",
				"Воскресение", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"
			],
			monthNames: [
				"Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
				"Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th'},
			srcformat: 'Y-m-d',
			newformat: 'd.m.Y',
			masks : {
	            ISO8601Long:"Y-m-d H:i:s",
	            ISO8601Short:"Y-m-d",
	            ShortDate: "n.j.Y",
	            LongDate: "l, F d, Y",
	            FullDateTime: "l, F d, Y G:i:s",
	            MonthDay: "F d",
	            ShortTime: "G:i",
	            LongTime: "G:i:s",
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
