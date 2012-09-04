;(function($) {
/**
 * jqGrid Ukrainian Translation v1.1 04.09.2012
 * Sergey Dyagovchenko
 * http://d.sumy.ua
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 **/
$.jgrid = $.jgrid || {};
$.extend($.jgrid, {
	defaults: {
		recordtext: "Перегляд {0} - {1} з {2}",
		emptyrecords: "Немає записів для перегляду",
		loadtext: "Завантаження...",
		pgtext: "Стор. {0} з {1}"
	},
	search: {
		caption: "Пошук...",
		Find: "Знайти",
		Reset: "Скидання",
		odata: ['рівно', 'не рівно', 'менше', 'менше або рівне', 'більше', 'більше або рівне', 'починається з', 'не починається з', 'знаходиться в', 'не знаходиться в', 'закінчується на', 'не закінчується на', 'містить', 'не містить'],
		groupOps: [{op: "AND", text: "все"}, {op: "OR", text: "будь-який"}],
		matchText: " збігається",
		rulesText: " правила"
	},
	edit: {
		addCaption: "Додати запис",
		editCaption: "Змінити запис",
		bSubmit: "Зберегти",
		bCancel: "Відміна",
		bClose: "Закрити",
		saveData: "Дані були змінені! Зберегти зміни?",
		bYes: "Так",
		bNo: "Ні",
		bExit: "Відміна",
		msg: {
			required: "Поле є обов'язковим",
			number: "Будь ласка, введіть правильне число",
			minValue: "значення повинне бути більше або дорівнює",
			maxValue: "значення повинно бути менше або дорівнює",
			email: "некоректна адреса електронної пошти",
			integer: "Будь ласка, введіть дійсне ціле число",
			date: "Будь ласка, введіть вірну дату",
			url: "не є правильним URL. Необхідна додати префікс ('http://' or 'https://')",
			nodefined: " значення не визначено!",
			novalue: " повинна повертати значення!",
			customarray: "Функція повинна повернути масив!",
			customfcheck: "Функція для перевірки поля повинна буди заданою!"
		}
	},
	view: {
		caption: "Перегляд запису",
		bClose: "Закрити"
	},
	del: {
		caption: "Видалити",
		msg: "Видалити обраний запис(и)?",
		bSubmit: "Видалити",
		bCancel: "Відміна"
	},
	nav: {
		edittext: "",
		edittitle: "Змінити вибраний рядок",
		addtext: "",
		addtitle: "Додати новий рядок",
		deltext: "",
		deltitle: "Видалити вибраний рядок",
		searchtext: "",
		searchtitle: "Знайти записи",
		refreshtext: "",
		refreshtitle: "Оновити",
		alertcap: "Увага",
		alerttext: "Будь ласка, виберіть строку",
		viewtext: "",
		viewtitle: "Переглянути вибрану строку"
	},
	col: {
		caption: "Вибрати стовпці",
		bSubmit: "ОК",
		bCancel: "Відміна"
	},
	errors: {
		errcap: "Помилка",
		nourl: "URL не задан",
		norecords: "Немає записів для обробки",
		model: "Число полів не відповідає числу стовпців таблиці!"
	},
	formatter: {
		integer: {
			thousandsSeparator: " ",
			defaultValue: '0'
		},
		number: {
			decimalSeparator: ",",
			thousandsSeparator: " ",
			decimalPlaces: 2,
			defaultValue: '0,00'
		},
		currency: {
			decimalSeparator: ",",
			thousandsSeparator: " ",
			decimalPlaces: 2,
			prefix: "",
			suffix: "",
			defaultValue: '0,00'
		},
		date: {
			dayNames: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"],
			monthNames: ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру", "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"],
			AmPm: ["утра", "вечора", "утра", "вечора"],
			S: function(j) {
				return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th';
			},
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