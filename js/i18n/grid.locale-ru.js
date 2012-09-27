;(function($) {
/**
 * jqGrid Russian Translation v1.1 04.09.2012 (based on translation by Alexey Kanaev v1.1 21.01.2009, http://softcore.com.ru)
 * Sergey Dyagovchenko
 * http://d.sumy.ua
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 **/
$.jgrid = $.jgrid || {};
$.extend($.jgrid, {
	defaults: {
		recordtext: "Просмотр {0} - {1} из {2}",
		emptyrecords: "Нет записей для просмотра",
		loadtext: "Загрузка...",
		pgtext: "Стр. {0} из {1}"
	},
	search: {
		caption: "Поиск...",
		Find: "Найти",
		Reset: "Сброс",
		odata: ['равно', 'не равно', 'меньше', 'меньше или равно', 'больше', 'больше или равно', 'начинается с', 'не начинается с', 'находится в', 'не находится в', 'заканчивается на', 'не заканчивается на', 'содержит', 'не содержит'],
		groupOps: [ { op: "AND", text: "все" }, { op: "OR", text: "любой" } ],
		matchText: " совпадает",
		rulesText: " правила"
	},
	edit: {
		addCaption: "Добавить запись",
		editCaption: "Редактировать запись",
		bSubmit: "Сохранить",
		bCancel: "Отмена",
		bClose: "Закрыть",
		saveData: "Данные были изменены! Сохранить изменения?",
		bYes: "Да",
		bNo: "Нет",
		bExit: "Отмена",
		msg: {
			required: "Поле является обязательным",
			number: "Пожалуйста, введите правильное число",
			minValue: "значение должно быть больше либо равно",
			maxValue: "значение должно быть меньше либо равно",
			email: "некорректное значение e-mail",
			integer: "Пожалуйста, введите целое число",
			date: "Пожалуйста, введите правильную дату",
			url: "является неверной ссылкой. Необходимо ввести префикс ('http://' or 'https://')",
			nodefined: " значение не определено!",
			novalue: " возврощаемое значение обязательно!",
			customarray: "Функция должна возвращать массив!",
			customfcheck: "Функция для проверки поля должна быть задана!"
		}
	},
	view: {
		caption: "Просмотр записи",
		bClose: "Закрыть"
	},
	del: {
		caption: "Удалить",
		msg: "Удалить выбранную запись(и)?",
		bSubmit: "Удалить",
		bCancel: "Отмена"
	},
	nav: {
		edittext: "",
		edittitle: "Редактировать выбранную строку",
		addtext: "",
		addtitle: "Добавить новую строку",
		deltext: "",
		deltitle: "Удалить выбранную строку",
		searchtext: "",
		searchtitle: "Найти записи",
		refreshtext: "",
		refreshtitle: "Обновить",
		alertcap: "Внимание",
		alerttext: "Пожалуйста, выберите строку",
		viewtext: "",
		viewtitle: "Просмотреть выбранную строку"
	},
	col: {
		caption: "Выбрать столбцы",
		bSubmit: "ОК",
		bCancel: "Отмена"
	},
	errors: {
		errcap: "Ошибка",
		nourl: "URL не установлен",
		norecords: "Нет записей для обработки",
		model: "Число полей не соответствует числу столбцов таблицы!"
	},
	formatter: {
		integer: {thousandsSeparator: " ", defaultValue: '0'},
		number: {decimalSeparator: ",", thousandsSeparator: " ", decimalPlaces: 2, defaultValue: '0,00'},
		currency: {decimalSeparator: ",", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix: "", defaultValue: '0,00'},
		date: {
			dayNames: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
			monthNames: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
			AmPm: ["утра", "вечера", "утра", "вечера"],
			S: function(j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th';},
			srcformat: 'd.m.Y',
			newformat: 'd.m.Y',
			masks: {
				ISO8601Long: "Y-m-d H:i:s",
				ISO8601Short: "Y-m-d",
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
			reformatAfterEdit: false
		},
		baseLinkUrl: '',
		showAction: '',
		target: '',
		checkbox: {disabled: true},
		idName: 'id'
	}
});
})(jQuery);