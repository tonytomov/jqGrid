// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS

/**
 * @license jqGrid  4.8.0 - free jqGrid
 * Copyright (c) 2008-2014, Tony Tomov, tony@trirand.com
 * Copyright (c) 2014-2015, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2015-03-02
 */
//jsHint options
/*jshint evil:true, eqeqeq:false, eqnull:true, devel:true */
/*jslint browser: true, devel: true, eqeq: true, evil: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, vars: true, white: true, maxerr: 999 */
/*global jQuery, HTMLElement */

(function ($) {
"use strict";
var englishLanguageDefaults = {
	name: "English (United States)",
	nameEnglish: "English (United States)",
	isRTL: false,
	defaults: {
		recordtext: "View {0} - {1} of {2}",
		emptyrecords: "No records to view",
		loadtext: "Loading...",
		pgtext: "Page {0} of {1}",
		pgfirst: "First Page",
		pglast: "Last Page",
		pgnext: "Next Page",
		pgprev: "Previous Page",
		pgrecs: "Records per Page",
		showhide: "Toggle Expand Collapse Grid",
		savetext: "Saving..."
	},
	search: {
		caption: "Search...",
		Find: "Find",
		Reset: "Reset",
		odata: [
			{ oper: "eq", text: "equal" },
			{ oper: "ne", text: "not equal" },
			{ oper: "lt", text: "less" },
			{ oper: "le", text: "less or equal" },
			{ oper: "gt", text: "greater" },
			{ oper: "ge", text: "greater or equal" },
			{ oper: "bw", text: "begins with" },
			{ oper: "bn", text: "does not begin with" },
			{ oper: "in", text: "is in" },
			{ oper: "ni", text: "is not in" },
			{ oper: "ew", text: "ends with" },
			{ oper: "en", text: "does not end with" },
			{ oper: "cn", text: "contains" },
			{ oper: "nc", text: "does not contain" },
			{ oper: "nu", text: "is null" },
			{ oper: "nn", text: "is not null" }
		],
		groupOps: [
			{ op: "AND", text: "all" },
			{ op: "OR", text: "any" }
		],
		operandTitle: "Click to select search operation.",
		resetTitle: "Reset Search Value"
	},
	edit: {
		addCaption: "Add Record",
		editCaption: "Edit Record",
		bSubmit: "Submit",
		bCancel: "Cancel",
		bClose: "Close",
		saveData: "Data has been changed! Save changes?",
		bYes: "Yes",
		bNo: "No",
		bExit: "Cancel",
		msg: {
			required: "Field is required",
			number: "Please, enter valid number",
			minValue: "value must be greater than or equal to ",
			maxValue: "value must be less than or equal to",
			email: "is not a valid e-mail",
			integer: "Please, enter valid integer value",
			date: "Please, enter valid date value",
			url: "is not a valid URL. Prefix required ('http://' or 'https://')",
			nodefined: " is not defined!",
			novalue: " return value is required!",
			customarray: "Custom function should return array!",
			customfcheck: "Custom function should be present in case of custom checking!"
		}
	},
	view: {
		caption: "View Record",
		bClose: "Close"
	},
	del: {
		caption: "Delete",
		msg: "Delete selected record(s)?",
		bSubmit: "Delete",
		bCancel: "Cancel"
	},
	nav: {
		edittext: "",
		edittitle: "Edit selected row",
		addtext: "",
		addtitle: "Add new row",
		deltext: "",
		deltitle: "Delete selected row",
		searchtext: "",
		searchtitle: "Find records",
		refreshtext: "",
		refreshtitle: "Reload Grid",
		alertcap: "Warning",
		alerttext: "Please, select row",
		viewtext: "",
		viewtitle: "View selected row"
	},
	col: {
		caption: "Select columns",
		bSubmit: "Ok",
		bCancel: "Cancel"
	},
	errors: {
		errcap: "Error",
		nourl: "No url is set",
		norecords: "No records to process",
		model: "Length of colNames <> colModel!"
	},
	formatter: {
		integer: {
			thousandsSeparator: ",",
			defaultValue: "0"
		},
		number: {
			decimalSeparator: ".",
			thousandsSeparator: ",",
			decimalPlaces: 2,
			defaultValue: "0.00"
		},
		currency: {
			decimalSeparator: ".",
			thousandsSeparator: ",",
			decimalPlaces: 2,
			prefix: "",
			suffix: "",
			defaultValue: "0.00"
		},
		date: {
			dayNames: [
				"Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat",
				"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
			],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
				"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
			],
			AmPm: ["am", "pm", "AM", "PM"],
			S: function (j) {
				var ending = ["st", "nd", "rd", "th"];
				return j < 11 || j > 13 ? ending[Math.min((j - 1) % 10, 3)] : "th";
			},
			srcformat: "Y-m-d",
			newformat: "n/j/Y",
			masks: {
				// see http://php.net/manual/en/function.date.php for PHP format used in jqGrid
				// and see http://docs.jquery.com/UI/Datepicker/formatDate
				// and https://github.com/jquery/globalize#dates for alternative formats used frequently
				// one can find on https://github.com/jquery/globalize/tree/master/lib/cultures many
				// information about date, time, numbers and currency formats used in different countries
				// one should just convert the information in PHP format
				// short date:
				//    n - Numeric representation of a month, without leading zeros
				//    j - Day of the month without leading zeros
				//    Y - A full numeric representation of a year, 4 digits
				// example: 3/1/2012 which means 1 March 2012
				ShortDate: "n/j/Y", // in jQuery UI Datepicker: "M/d/yyyy"
				// long date:
				//    l - A full textual representation of the day of the week
				//    F - A full textual representation of a month
				//    d - Day of the month, 2 digits with leading zeros
				//    Y - A full numeric representation of a year, 4 digits
				LongDate: "l, F d, Y", // in jQuery UI Datepicker: "dddd, MMMM dd, yyyy"
				// long date with long time:
				//    l - A full textual representation of the day of the week
				//    F - A full textual representation of a month
				//    d - Day of the month, 2 digits with leading zeros
				//    Y - A full numeric representation of a year, 4 digits
				//    g - 12-hour format of an hour without leading zeros
				//    i - Minutes with leading zeros
				//    s - Seconds, with leading zeros
				//    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
				FullDateTime: "l, F d, Y g:i:s A", // in jQuery UI Datepicker: "dddd, MMMM dd, yyyy h:mm:ss tt"
				// month day:
				//    F - A full textual representation of a month
				//    d - Day of the month, 2 digits with leading zeros
				MonthDay: "F d", // in jQuery UI Datepicker: "MMMM dd"
				// short time (without seconds)
				//    g - 12-hour format of an hour without leading zeros
				//    i - Minutes with leading zeros
				//    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
				ShortTime: "g:i A", // in jQuery UI Datepicker: "h:mm tt"
				// long time (with seconds)
				//    g - 12-hour format of an hour without leading zeros
				//    i - Minutes with leading zeros
				//    s - Seconds, with leading zeros
				//    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
				LongTime: "g:i:s A", // in jQuery UI Datepicker: "h:mm:ss tt"
				// month with year
				//    Y - A full numeric representation of a year, 4 digits
				//    F - A full textual representation of a month
				YearMonth: "F, Y" // in jQuery UI Datepicker: "MMMM, yyyy"
			}
		}
	}
};

$.jgrid = $.jgrid || {};
var jgrid = $.jgrid;
jgrid.locales = jgrid.locales || {};
var locales = jgrid.locales;

if (jgrid.defaults == null || $.isEmptyObject(locales) || locales["en-US"] === undefined) {
	// set English options only if no grid.locale-XX.js file are included before jquery.jqGrid.min.js or jquery.jqGrid.src.js
	// the files included AFTER jquery.jqGrid.min.js or jquery.jqGrid.src.js will just overwrite all the settings which were set previously

	// We can set locInfo under $.jgrid additionally to setting under $.jgrid.locales[locale] 
	// only to have more compatibility with the previous version of jqGrid.
	// We don't make this currently.
	if (locales["en-US"] === undefined) {
		$.extend(true, $.jgrid, /*englishLanguageDefaults,*/ {
			locales: {
				"en-US": englishLanguageDefaults	// and for English US
			}
		});
	}
	jgrid.defaults = jgrid.defaults || {};
	if (jgrid.defaults.locale === undefined) {
		jgrid.defaults.locale = "en-US";
	}
}

//if (jgrid.defaults.locale && locales[jgrid.defaults.locale]) {
//	$.extend(true, $.jgrid, locales[jgrid.defaults.locale]); // add to improve compatibility only
//}

$.extend(true,jgrid,{
	version: "4.8.0",
	productName: "free jqGrid",
	defaults: {},
	search: {},
	edit: {},
	view: {},
	del: {},
	nav: {},
	col: {},
	errors: {},
	formatter: {
		unused: '' // used only to detect whether the changes are overwritten because of wrong usage
	},
	icons: {
		jQueryUI: {
			common: "ui-icon",
			pager: {
				first: "ui-icon-seek-first",
				prev: "ui-icon-seek-prev",
				next: "ui-icon-seek-next",
				last: "ui-icon-seek-end"
			},
			sort: {
				asc: "ui-icon-triangle-1-n",
				desc: "ui-icon-triangle-1-s"
			},
			gridMinimize: {
				visible: "ui-icon-circle-triangle-n",
				hidden: "ui-icon-circle-triangle-s"
			},
			nav: {
				edit: "ui-icon-pencil",
				add: "ui-icon-plus",
				del: "ui-icon-trash",
				search: "ui-icon-search",
				refresh: "ui-icon-refresh",
				view: "ui-icon-document",
				save: "ui-icon-disk",
				cancel: "ui-icon-cancel",
				newbutton: "ui-icon-newwin"
			},
			actions: {
				edit: "ui-icon-pencil",
				del: "ui-icon-trash",
				save: "ui-icon-disk",
				cancel: "ui-icon-cancel"
			},
			form: {
				close: "ui-icon-closethick",
				prev: "ui-icon-triangle-1-w",
				next: "ui-icon-triangle-1-e",
				save: "ui-icon-disk",
				undo: "ui-icon-close",
				del: "ui-icon-scissors",
				cancel: "ui-icon-cancel",
				resizableLtr: "ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se"
			},
			search: {
				search: "ui-icon-search",
				reset: "ui-icon-arrowreturnthick-1-w",
				query: "ui-icon-comment"
			},
			subgrid: {
				plus: "ui-icon-plus",
				minus: "ui-icon-minus",
				openLtr: "ui-icon-carat-1-sw",
				openRtl: "ui-icon-carat-1-se"
			},
			grouping: {
				plus: "ui-icon-circlesmall-plus",
				minus: "ui-icon-circlesmall-minus"
			},
			treeGrid: {
				minus: "ui-icon-triangle-1-s",
				leaf: "ui-icon-radio-off",
				plusLtr: "ui-icon-triangle-1-e",
				plusRtl: "ui-icon-triangle-1-w"
			}
		},
		fontAwesome: {
			common: "fa",
			pager: {
				common: "fa-fw",
				first: "fa-step-backward",
				prev: "fa-backward",
				next: "fa-forward",
				last: "fa-step-forward"
			},
			sort: {
				common: "fa-lg", 		// common: "",
				asc: "fa-sort-asc",		// asc: "fa-sort-amount-asc",
				desc: "fa-sort-desc"	// desc: "fa-sort-amount-desc"
			},
			gridMinimize: {
				visible: "fa-chevron-circle-up",
				hidden: "fa-chevron-circle-down"
			},
			nav: {
				common: "fa-lg fa-fw",
				edit: "fa-pencil",
				add: "fa-plus",
				del: "fa-trash-o",
				search: "fa-search",
				refresh: "fa-refresh",
				view: "fa-file-o",
				save: "fa-floppy-o",
				cancel: "fa-ban",
				newbutton: "fa-external-link"
			},
			actions: {
				common: "ui-state-default fa-fw",
				edit: "fa-pencil",
				del: "fa-trash-o",
				save: "fa-floppy-o",
				cancel: "fa-ban"
			},
			form: {
				close: "fa-times",
				prev: "fa-caret-left",
				next: "fa-caret-right",
				save: "fa-floppy-o",
				undo: "fa-undo",
				del: "fa-trash-o",
				cancel: "fa-ban",
				resizableLtr: "ui-resizable-se ui-state-default fa fa-rss fa-rotate-270"
			},
			search: {
				search: "fa-search",
				reset: "fa-undo",
				query: "fa-comments-o"
			},
			subgrid: {
				common: "ui-state-default fa-fw",
				plus: "fa-plus",
				minus: "fa-minus",
				openLtr: "fa-reply fa-rotate-180",
				openRtl: "fa-share fa-rotate-180"
			},
			grouping: {
				common: "fa-fw",
				plus: "fa-plus-square-o",
				minus: "fa-minus-square-o"
			},
			treeGrid: {
				common: "fa-fw",
				minus: "fa-lg fa-sort-desc",
				leaf: "fa-dot-circle-o",
				plusLtr: "fa-lg fa-caret-right",
				plusRtl: "fa-lg fa-caret-left"
			}
		}
	},
	htmlDecode : function(value){
		if(value && (value==='&nbsp;' || value==='&#160;' || (value.length===1 && value.charCodeAt(0)===160))) { return "";}
		return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");		
	},
	htmlEncode : function (value){
		return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	clearArray : function (ar) {
		// see http://jsperf.com/empty-javascript-array
		while (ar.length > 0) {
			ar.pop();
		}
	},
	format : function(format){ //jqgformat
		var args = $.makeArray(arguments).slice(1);
		if(format==null) { format = ""; }
		return format.replace(/\{(\d+)\}/g, function(m, i){
			return args[i];
		});
	},
	msie : navigator.appName === 'Microsoft Internet Explorer',
	msiever : function () {
		// Trident/4.0 - Internet Explorer 8,
		// Trident/5.0 - Internet Explorer 9,
		// Trident/6.0 - Internet Explorer 10
		// Trident/7.0 - IE11
		// Version tokens MSIE might not reflect the actual version of the browser
		// If Compatibility View is enabled for a webpage or the browser mode is set to an earlier version
		var rv = -1, match = /(MSIE) ([0-9]{1,}[.0-9]{0,})/.exec(navigator.userAgent);
		if (match.length === 3) {
			rv = parseFloat(match[2] || -1);
		}
		return rv;
	},
	getCellIndex : function (cell) {
		var c = $(cell);
		if (c.is('tr')) { return -1; }
		c = (!c.is('td') && !c.is('th') ? c.closest("td,th") : c)[0];
		if (jgrid.msie) { return $.inArray(c, c.parentNode.cells); }
		return c.cellIndex;
	},
	stripHtml : function(v) {
		v = String(v);
		if (v) {
			v = v.replace(/<("[^"]*"|'[^']*'|[^'">])*>/gi,"");
			return (v && v !== '&nbsp;' && v !== '&#160;') ? v.replace(/\"/g,"'") : "";
		} 
			return v;
	},
	stripPref : function (pref, id) {
		var obj = $.type( pref );
		if( obj === "string" || obj === "number") {
			pref =  String(pref);
			id = pref !== "" ? String(id).replace(String(pref), "") : id;
		}
		return id;
	},
	parse : function(jsonString) {
		var js = jsonString;
		if (js.substr(0,9) === "while(1);") { js = js.substr(9); }
		if (js.substr(0,2) === "/*") { js = js.substr(2,js.length-4); }
		if(!js) { js = "{}"; }
		return (jgrid.useJSON===true && typeof JSON === 'object' && typeof JSON.parse === 'function') ?
			JSON.parse(js) :
			eval('(' + js + ')');
	},
	getRes: function (base, path) {
		var pathParts = path.split("."), n = pathParts.length, i;
		if (base == null) {
			return undefined;
		}
		for (i = 0; i < n; i++) {
			if (!pathParts[i]) {
				return null;
			}
			base = base[pathParts[i]];
			if (base === undefined) {
				break;
			}
			if (typeof base === "string") {
				return base;
			}
		}
		return base;
	},
	parseDate : function(format, date, newformat, opts) {
		var	token = /\\.|[dDjlNSwzWFmMntLoYyaABgGhHisueIOPTZcrU]/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[\-+]\d{4})?)\b/g,
		timezoneClip = /[^\-+\dA-Z]/g,
		msMatch = ((typeof date === 'string') ? date.match(/^\/Date\((([\-+])?[0-9]+)(([\-+])([0-9]{2})([0-9]{2}))?\)\/$/): null),
		pad = function (value, length) {
			value = String(value);
			length = parseInt(length,10) || 2;
			while (value.length < length)  { value = '0' + value; }
			return value;
		},
		ts = {m : 1, d : 1, y : 1970, h : 0, i : 0, s : 0, u:0},
		timestamp = 0, dM, k, hl,
		h12To24 = function (ampm, h) {
			if (ampm === 0) {
				if (h === 12) { h = 0; } 
			} else {
				if (h !== 12) { h += 12; }
			}
			return h;
		},
		offset =0;
		if (opts === undefined) {
			opts = this.p != null ?
				jgrid.getRes(locales[this.p.locale], "formatter.date") || jgrid.formatter.date :
				jgrid.formatter.date;
		}
		// old lang files
		if(opts.parseRe === undefined ) {
			opts.parseRe = /[#%\\\/:_;.,\t\s\-]/;
		}
		if( opts.masks.hasOwnProperty(format) ) { format = opts.masks[format]; }
		if(date && date != null) {
			if( !isNaN(date) && String(format).toLowerCase() === "u") {
				//Unix timestamp
				timestamp = new Date( parseFloat(date)*1000 );
			} else if(date.constructor === Date) {
				timestamp = date;
				// Microsoft date format support
			} else if( msMatch !== null ) {
				timestamp = new Date(parseInt(msMatch[1], 10));
				if (msMatch[3]) {
					offset = Number(msMatch[5]) * 60 + Number(msMatch[6]);
					offset *= ((msMatch[4] === '-') ? 1 : -1);
					offset -= timestamp.getTimezoneOffset();
					timestamp.setTime(Number(Number(timestamp) + (offset * 60 * 1000)));
				}
			} else {
				//Support ISO8601Long that have Z at the end to indicate UTC timezone
				if(opts.srcformat === 'ISO8601Long' && date.charAt(date.length - 1) === 'Z') {
					offset -= (new Date()).getTimezoneOffset();
				}
				date = String(date).replace(/\T/g,"#").replace(/\t/,"%").split(opts.parseRe);
				format = format.replace(/\T/g,"#").replace(/\t/,"%").split(opts.parseRe);
				// parsing for month names and time
				for (k = 0, hl = format.length; k < hl; k++) {
					switch (format[k]) {
					    case "M":
					        // A short textual representation of a month, three letters	Jan through Dec
							dM = $.inArray(date[k],opts.monthNames);
							if (dM !== -1 && dM < 12) {
								date[k] = dM + 1;
								ts.m = date[k];
							}
							break;
					    case "F":
					        // A full textual representation of a month, such as January or March
							dM = $.inArray(date[k], opts.monthNames, 12);
							if (dM !== -1 && dM > 11) {
								date[k] = dM + 1 - 12;
								ts.m = date[k];
							}
							break;
					    case "n":
					        // Numeric representation of a month, without leading zeros	1 through 12
							ts.m = parseInt(date[k], 10);
							break;
					    case "j":
					        // Day of the month without leading zeros	1 to 31
							ts.d = parseInt(date[k], 10);
							break;
					    case "g":
					        // 12-hour format of an hour without leading zeros	1 through 12
							ts.h = parseInt(date[k], 10);
							break;
					    case "a":
					        // Lowercase Ante meridiem and Post meridiem	am or pm
							dM = $.inArray(date[k], opts.AmPm);
							if (dM !== -1 && dM < 2 && date[k] === opts.AmPm[dM]) {
								date[k] = dM;
								ts.h = h12To24(date[k], ts.h);
							}
							break;
					    case "A":
					        // Uppercase Ante meridiem and Post meridiem	AM or PM
							dM = $.inArray(date[k], opts.AmPm);
							if (dM !== -1 && dM > 1 && date[k] === opts.AmPm[dM]) {
								date[k] = dM-2;
								ts.h = h12To24(date[k], ts.h);
							}
							break;
					}
					if (date[k] !== undefined) {
						ts[format[k].toLowerCase()] = parseInt(date[k], 10);
					}
				}
				if(ts.f) {ts.m = ts.f;}
				if( ts.m === 0 && ts.y === 0 && ts.d === 0) {
					return "&#160;" ;
				}
				ts.m = parseInt(ts.m,10)-1;
				var ty = ts.y;
				if (ty >= 70 && ty <= 99) {ts.y = 1900+ts.y;}
				else if (ty >=0 && ty <=69) {ts.y= 2000+ts.y;}
				timestamp = new Date(ts.y, ts.m, ts.d, ts.h, ts.i, ts.s, ts.u);
				//Apply offset to show date as local time.
				if(offset > 0) {
					timestamp.setTime(Number(Number(timestamp) + (offset * 60 * 1000)));
				}
			}
		} else {
			timestamp = new Date(ts.y, ts.m, ts.d, ts.h, ts.i, ts.s, ts.u);
		}
		if(opts.userLocalTime && offset === 0) {
			offset -= (new Date()).getTimezoneOffset();
			if( offset > 0 ) {
				timestamp.setTime(Number(Number(timestamp) + (offset * 60 * 1000)));
			}
		}
		if( newformat === undefined ) {
			return timestamp;
		}
		if( opts.masks.hasOwnProperty(newformat) )  {
			newformat = opts.masks[newformat];
		} else if ( !newformat ) {
			newformat = 'Y-m-d';
		}
		var 
			hours = timestamp.getHours(), // a Number, from 0 to 23, representing the hour
			i = timestamp.getMinutes(),
			j = timestamp.getDate(),
			n = timestamp.getMonth() + 1,
			o = timestamp.getTimezoneOffset(),
			s = timestamp.getSeconds(),
			u = timestamp.getMilliseconds(),
			w = timestamp.getDay(),
			year = timestamp.getFullYear(), // a Number, representing four digits, representing the year. Examples: 1999 or 2003
			dayOfWeek = (w + 6) % 7 + 1, // numeric representation of the day of the week. 1 (for Monday) through 7 (for Sunday)
			z = (new Date(year, n - 1, j) - new Date(year, 0, 1)) / 86400000,
			weekNumberOfYear = dayOfWeek < 5 ?
				Math.floor((z + dayOfWeek - 1) / 7) + 1 :
				Math.floor((z + dayOfWeek - 1) / 7) || ((new Date(year - 1, 0, 1).getDay() + 6) % 7 < 4 ? 53 : 52),
			flags = {
				// Day
			    d: pad(j), // Day of the month, 2 digits with leading zeros	01 to 31
				D: opts.dayNames[w], // A textual representation of a day, three letters. Mon through Sun
				j: j, // Day of the month without leading zeros	1 to 31
				l: opts.dayNames[w + 7], // A full textual representation of the day of the week. Sunday through Saturday
				N: dayOfWeek, // ISO-8601 numeric representation of the day of the week. 1 (for Monday) through 7 (for Sunday)
				S: opts.S(j), // English ordinal suffix for the day of the month, 2 characters. st, nd, rd or th. Works well with j
				w: w, // Numeric representation of the day of the week. 0 (for Sunday) through 6 (for Saturday)
				z: z, // The day of the year (starting from 0). 0 through 365
			    // Week.
				W: weekNumberOfYear, // ISO-8601 week number of year, weeks starting on Monday. Example: 42 (the 42nd week in the year)
				// Month
				F: opts.monthNames[n - 1 + 12], // A full textual representation of a month, such as January or March. January through December
				m: pad(n), // Numeric representation of a month, with leading zeros. 01 through 12
				M: opts.monthNames[n - 1], // A short textual representation of a month, three letters. Jan through Dec
				n: n, // Numeric representation of a month, without leading zeros. 1 through 12
				t: '?', // Number of days in the given month. 28 through 31
				// Year
				L: '?', // Whether it's a leap year. 1 if it is a leap year, 0 otherwise.
				o: '?', // SO-8601 year number. This has the same value as Y, except that if the ISO week number (W) belongs to the previous or next year, that year is used instead. Examples: 1999 or 2003
				Y: year, // A full numeric representation of a year, 4 digits. Examples: 1999 or 2003
				y: String(year).substring(2), // A two digit representation of a year. Examples: 99 or 03
				// Time
				a: hours < 12 ? opts.AmPm[0] : opts.AmPm[1], // Lowercase Ante meridiem and Post meridiem: am or pm
				A: hours < 12 ? opts.AmPm[2] : opts.AmPm[3], // Uppercase Ante meridiem and Post meridiem: AM or PM
				B: '?', // Swatch Internet time	000 through 999
				g: hours % 12 || 12, // 12-hour format of an hour without leading zeros	1 through 12
				G: hours, // 24-hour format of an hour without leading zeros. 0 through 23
				h: pad(hours % 12 || 12), // 12-hour format of an hour with leading zeros: 01 through 12
				H: pad(hours), // 24-hour format of an hour with leading zeros: 00 through 23
				i: pad(i), // Minutes with leading zeros: 00 to 59
				s: pad(s), // Seconds, with leading zeros: 00 through 59
				u: u, // Microseconds. Example: 654321
				// Timezone
				e: '?', // Timezone identifier. Examples: UTC, GMT, Atlantic/Azores
				I: '?', // Whether or not the date is in daylight saving time. 1 if Daylight Saving Time, 0 otherwise.
				O: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4), // Difference to Greenwich time (GMT) in hours. Example: +0200
				P: '?', // Difference to Greenwich time (GMT) with colon between hours and minutes. Example: +02:00
				T: (String(timestamp).match(timezone) || [""]).pop().replace(timezoneClip, ""), // Timezone abbreviation. Examples: EST, MDT
				Z: '?', // Timezone offset in seconds. The offset for timezones west of UTC is always negative, and for those east of UTC is always positive. -43200 through 50400
				// Full Date/Time
				c: '?', // ISO 8601 date. Example: 2004-02-12T15:19:21+00:00
				r: '?', // RFC 2822 formatted date. Example: Thu, 21 Dec 2000 16:01:07 +0200
				U: Math.floor(timestamp / 1000) // Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
			};
		return newformat.replace(token, function ($0) {
			return flags.hasOwnProperty($0) ? flags[$0] : $0.substring(1);
		});
	},
	jqID : function(sid){
		return String(sid).replace(/[!"#$%&'()*+,.\/:; <=>?@\[\\\]\^`{|}~]/g,"\\$&");
	},
	/*gridComponent: { // enum. The code includes additional 881 bytes in jquery.jqGrid.min.js so we comment it till we really will use it
		// let us this - <table> from which grid is created. Then
		//	gBox (grid box) - outer div which includes all grid components: $(this).closest(".ui-jqgrid")[0]
		// In the same way 

		GRID_BOX_DIV: 0,								// tagName: "div". class: "ui-jqgrid". Id: "gbox_" + gridId
			GRID_OVERLAY_DIV: 1,						// tagName: "div". class: "jqgrid-overlay". Id: "lui_" + gridId
			LOADING_DIV: 2,								// tagName: "div". class: "loading". Id: "load_" + gridId
			DIALOG_ALERT_DIV: 3,						// tagName: "div". class: "ui-jqdialog". Id: "alertmod_" + gridId
			DIALOG_SEARCH_DIV: 4,						// tagName: "div". class: "ui-jqdialog". Id: "searchmodfbox_" + gridId
			DIALOG_VIEW_DIV: 5,							// tagName: "div". class: "ui-jqdialog". Id: "viewmod" + gridId
			DIALOG_EDIT_DIV: 6,							// tagName: "div". class: "ui-jqdialog". Id: "editmod" + gridId
			DIALOG_DELETE_DIV: 7,						// tagName: "div". class: "ui-jqdialog". Id: "delmod" + gridId

			GRID_VIEW_DIV: 8,							// tagName: "div". class: "ui-jqgrid-view". Id: "gview_" + gridId
				TITLE_BAR_DIV: 9,						// tagName: "div". class: "ui-jqgrid-titlebar" and either "ui-jqgrid-caption" or "ui-jqgrid-caption-rtl"

				UPPER_TOOLBAR_DIV: 10,					// tagName: "div". class: "ui-userdata". Id: "tb_" + gridId

				TOP_PAGER_DIV: 11,						// tagName: "div". class: "ui-jqgrid-toppager". Id: gridId + "_toppager"

				HEADER_DIV: 12,							// tagName: "div". class: "ui-jqgrid-hdiv"
					HEADER_BOX_DIV: 13,					// tagName: "div". class: either "ui-jqgrid-hdiv" or "ui-jqgrid-hbox-rtl"
						HEADER_TABLE: 14,				// tagName: "table". class: "ui-jqgrid-htable"
							HEADER_COLS_ROW: 15,		// tagName: "tr". class: "jqgfirstrow"
								HEADER_COLS: 16,		// tagName: "th". class: either "ui-first-th-rtl" or "ui-first-th-rtl"
							SEARCH_TOOLBAR: 17,			// tagName: "tr". class: "ui-search-toolbar". Its direct children are th having class "ui-th-column" and optionally "ui-th-rtl"

				BODY_DIV: 18,							// tagName: "div". class: "ui-jqgrid-bdiv"
					BODY_SCROLL_FULL_DIV: 19,			// tagName: "div"
						BODY_SCROLL_TOP_DIV: 20,		// tagName: "div"
							BODY_TABLE: 21,				// tagName: "table". class: "ui-jqgrid-btable". Id: gridId
								BODY_COLS_ROW: 22,		// tagName: "tr". class: "jqgfirstrow"
									BODY_COLS: 23,		// tagName: "td"
								BODY_DATA_ROWS: 24,		// tagName: "tr". class: "jqgrow" and optionally "ui-row-rtl"
				FOOTER_DIV: 25,							// tagName: "div". class: "ui-jqgrid-sdiv"
					FOOTER_BOX_DIV: 26, 				// tagName: "div". class: either "ui-jqgrid-hdiv" or "ui-jqgrid-hbox-rtl". ??? is it really needed ???
						FOOTER_TABLE: 27,				// tagName: "table". class: "ui-jqgrid-ftable"
							FOOTER_DATA_ROWS: 28,		// tagName: "tr". class: "footrow", optionally additionally "footrow-rtl"

				BOTTOM_TOOLBAR_DIV: 29,					// tagName: "div". class: "ui-userdata". Id: "tb_" + gridId

				FROZEN_HEADER_DIV: 30,					// tagName: "div". class: "frozen-div" and "ui-jqgrid-hdiv"
					// no hBox currently exists
					FROZEN_HEADER_TABLE: 31,			// tagName: "table". class: "ui-jqgrid-htable"
						FROZEN_HEADER_COLS_ROW: 32,		// tagName: "tr". class: "jqgfirstrow"
							FROZEN_HEADER_COLS: 33,		// tagName: "th". class: either "ui-first-th-rtl" or "ui-first-th-rtl"
						FROZEN_SEARCH_TOOLBAR: 34,		// tagName: "tr". class: "ui-search-toolbar". Its direct children are th having class "ui-th-column" and optionally "ui-th-rtl"
		// TODO: fix id of children of .ui-search-input to have no id duplicates with the main grid

				FROZEN_FOOTER_DIV: 35,					// tagName: "div". class: "frozen-div" and "ui-jqgrid-sdiv"
					FROZEN_FOOTER_TABLE: 36,			// tagName: "table". class: "ui-jqgrid-ftable"
						FROZEN_FOOTER_DATA_ROWS: 37,	// tagName: "tr". class: "footrow", optionally additionally "footrow-rtl"

				FROZEN_BODY_DIV: 38,					// tagName: "div". class: "frozen-div" and "ui-jqgrid-bdiv"
					// no full scroll div and top scroll div is currently exist
					FROZEN_BODY_TABLE: 39,				// tagName: "table". class: "ui-jqgrid-btable". Id: gridId + "_frozen"
						FROZEN_BODY_COLS_ROW: 40,		// tagName: "tr". class: "jqgfirstrow"
							FROZEN_BODY_COLS: 41,		// tagName: "td"
						FROZEN_BODY_DATA_ROWS: 42,		// tagName: "tr". class: "jqgrow" and optionally "ui-row-rtl"
		// TODO: fix id of children of .jqgrow to have no id duplicates with the main grid

			COLUMN_RESIZER_DIV: 43,						// tagName: "div". class: "ui-jqgrid-resize-mark". Id: "rs_m" + gridId
			BOTTOM_PAGER_DIV: 44						// tagName: "div". class: "ui-jqgrid-pager"
	},*/
	getGridComponentId: function (componentName) {
		var self = this;
		if (self.p == null || !self.p.id) {
			return ""; // return empty string
		}
		var id = self.p.id;
		switch (componentName) {
			case "grid":
				return id;
			case "gBox":
				return "gbox_" + id;
			case "gView":
				return "gview_" + id;
			case "alertMod": // footer/summary table
				return "alertmod_" + id;
			case "columnResizer":
				return "rs_m" + id;
			case "selectAllCheckbox":
				return "cb_" + id;
			case "searchOperationMenu":
				return "sopt_menu";
			default:
				return ""; // return empty string
		}
	},
	getGridComponentIdSelector: function (componentName) {
		var id = jgrid.getGridComponentId.call(this, componentName);
		return id ? "#" + jgrid.jqID(id) : "";
	},
	getGridComponent: function (componentName, $p, p1) {
		var p;
		if ($p instanceof $ || $p.length > 0) {
			p = $p[0];
		} else if ($p instanceof HTMLElement) {
			p = $p;
			$p = $(p);
		} else {
			return $(); // return empty jQuery object
		}
		switch (componentName) {
			case "bTable": // get body table from bDiv
				return $p.hasClass("ui-jqgrid-bdiv") ? $p.find(">div>.ui-jqgrid-btable") : $();
			case "hTable": // header table from bDiv
				return $p.hasClass("ui-jqgrid-hdiv") ? $p.find(">div>.ui-jqgrid-htable") : $();
			case "fTable": // footer/summary table from sDiv
				return $p.hasClass("ui-jqgrid-sdiv") ? $p.find(">div>.ui-jqgrid-ftable") : $();
			case "bDiv":   // get bDiv of grid (bTable)
				return $p.hasClass("ui-jqgrid-btable") && p.grid != null ? $(p.grid.bDiv) : $();
			case "hDiv":   // get hDiv of grid (bTable)
				return $p.hasClass("ui-jqgrid-btable") && p.grid != null ? $(p.grid.hDiv) : $();
			case "sDiv":   // get sDiv of grid (bTable)
				return $p.hasClass("ui-jqgrid-btable") && p.grid != null ? $(p.grid.sDiv) : $();
			case "colHeader": // p should be iCol
				return !isNaN(p1) && p.grid != null && p.grid.headers != null && p.grid.headers[p1] != null ?
					$(p.grid.headers[p1].el) : $();
			default:
				return $(); // return empty jQuery object
		}
	},
	fixScrollOffsetAndhBoxPadding: function () {
		var self = this, grid = self.grid;
		if (!grid) {
			return;
		}

		var p = self.p, bDiv = grid.bDiv,
			fixhBox = function (hDiv) {
				var $hDivhBox = $(hDiv).children("div").first();
				$hDivhBox.css($hDivhBox.hasClass("ui-jqgrid-hbox-rtl") ? "padding-left": "padding-right", p.scrollOffset);
				hDiv.scrollLeft = bDiv.scrollLeft;
			};
		if ($(bDiv).width() > 0) {
			p.scrollOffset = (bDiv.offsetWidth - bDiv.clientWidth); // can be 0 if no scrollbar exist
			// TODO: add detection of the width of vertical scroll bar if the grid is hidden
			// at the moment of executing fixScrollOffsetAndhBoxPadding (for example inside of inactive jQuery UI Tab)
			// one need just create close construction with visible:hidden style, add to body and get its width
			fixhBox(grid.hDiv);
			if (grid.sDiv) {
				fixhBox(grid.sDiv);
			}
		}
	},
	mergeCssClasses: function () {
		var args = $.makeArray(arguments), map = {}, i, j, ar, cssClass, classes = [];
		for (i = 0; i < args.length; i++) {
			ar = String(args[i]).split(" ");
			for (j = 0; j < ar.length; j++) {
				cssClass = ar[j];
				if (cssClass !== "" && !map.hasOwnProperty(cssClass)) {
					map[cssClass] = true;
					classes.push(cssClass);
				}
			}
		}
		return classes.join(" ");
	},
	detectRowEditing: function (rowid) {
		var i, savedRowInfo, tr, self = this, rows = self.rows, p = self.p;
		if (!self.grid || rows == null || p == null) {
			return null; // this is not a grid
		}
		if (p.savedRow === undefined || p.savedRow.length === 0) {
			return null; // the row is not editing now
		}
		for (i = 0; i < p.savedRow.length; i++) {
			savedRowInfo = p.savedRow[i];
			// sell editing saves in savedRow array items like {id: iRow, ic: iCol, name: colModel[iCol].name, v: cellValue}
			if (typeof savedRowInfo.id === "number" && typeof savedRowInfo.ic === "number" &&
					savedRowInfo.name !== undefined && savedRowInfo.v !== undefined &&
					rows[savedRowInfo.id] != null && rows[savedRowInfo.id].id === rowid &&
					$.isFunction($.fn.jqGrid.restoreCell)) {
				// cell editing
				tr = rows[savedRowInfo.id];
				if (tr != null && tr.id === rowid) {
					return { mode: "cellEditing", savedRow: savedRowInfo };
				}
			} else if (savedRowInfo.id === rowid && $.isFunction($.fn.jqGrid.restoreRow)) {
				return { mode: "inlineEditing", savedRow: savedRowInfo };
			}
		}
		return null;
	},
	guid : 1,
	uidPref: 'jqg',
	randId : function( prefix )	{
		return (prefix || jgrid.uidPref) + (jgrid.guid++);
	},
	getAccessor : function(obj, expr) {
		var ret,p,prm = [], i;
		if( typeof expr === 'function') { return expr(obj); }
		ret = obj[expr];
		if(ret===undefined) {
			try {
				if ( typeof expr === 'string' ) {
					prm = expr.split('.');
				}
				i = prm.length;
				if( i ) {
					ret = obj;
					while (ret && i--) {
						p = prm.shift();
						ret = ret[p];
					}
				}
			} catch (ignore) {}
		}
		return ret;
	},
	getXmlData: function (obj, expr, returnObj) {
		var m = typeof expr === 'string' ? expr.match(/^(.*)\[(\w+)\]$/) : null;
		if (typeof expr === 'function') { return expr(obj); }
		if (m && m[2]) {
			// m[2] is the attribute selector
			// m[1] is an optional element selector
			// examples: "[id]", "rows[page]"
			return m[1] ? $(m[1], obj).attr(m[2]) : $(obj).attr(m[2]);
		}
		var ret = $(expr, obj);
		if (returnObj) { return ret; }
		//$(expr, obj).filter(':last'); // we use ':last' to be more compatible with old version of jqGrid
		return ret.length > 0 ? $(ret).text() : undefined;
	},
	cellWidth : function () {
		var $testDiv = $("<div class='ui-jqgrid' style='left:10000px'><table class='ui-jqgrid-btable' style='width:5px;'><tr class='jqgrow'><td style='width:5px;display:block;'></td></tr></table></div>"),
		testCell = $testDiv.appendTo("body")
			.find("td")
			.width();
		$testDiv.remove();
		return Math.abs(testCell-5) > 0.1;
	},
	cell_width : true,
	ajaxOptions: {},
	from : function(source){
		// Original Author Hugo Bonacci
		// License MIT http://jlinq.codeplex.com/license
		var context = this,
		QueryObject=function(d,q){
			if(typeof d==="string"){
				d=$.data(d);
			}
			var self=this,
			_data=d,
			_usecase=true,
			_trim=false,
			_query=q,
			_stripNum = /[\$,%]/g,
			_lastCommand=null,
			_lastField=null,
			_orDepth=0,
			_negate=false,
			_queuedOperator="",
			_sorting=[],
			_useProperties=true;
			if(typeof d==="object"&&d.push) {
				if(d.length>0){
					if(typeof d[0]!=="object"){
						_useProperties=false;
					}else{
						_useProperties=true;
					}
				}
			}else{
				throw "data provides is not an array";
			}
			this._hasData=function(){
				return _data===null?false:_data.length===0?false:true;
			};
			this._getStr=function(s){
				var phrase=[];
				if(_trim){
					phrase.push("jQuery.trim(");
				}
				phrase.push("String("+s+")");
				if(_trim){
					phrase.push(")");
				}
				if(!_usecase){
					phrase.push(".toLowerCase()");
				}
				return phrase.join("");
			};
			this._strComp=function(val){
				if(typeof val==="string"){
					return".toString()";
				}
				return"";
			};
			this._group=function(f,u){
				return({field:f.toString(),unique:u,items:[]});
			};
			this._toStr=function(phrase){
				if(_trim){
					phrase=$.trim(phrase);
				}
				phrase=phrase.toString().replace(/\\/g,'\\\\').replace(/\"/g,'\\"');
				return _usecase ? phrase : phrase.toLowerCase();
			};
			this._funcLoop=function(func){
				var results=[];
				$.each(_data,function(i,v){
					results.push(func(v));
				});
				return results;
			};
			this._append=function(s){
				var i;
				if(_query===null){
					_query="";
				} else {
					_query+=_queuedOperator === "" ? " && " :_queuedOperator;
				}
				for (i=0;i<_orDepth;i++){
					_query+="(";
				}
				if(_negate){
					_query+="!";
				}
				_query+="("+s+")";
				_negate=false;
				_queuedOperator="";
				_orDepth=0;
			};
			this._setCommand=function(f,c){
				_lastCommand=f;
				_lastField=c;
			};
			this._resetNegate=function(){
				_negate=false;
			};
			this._repeatCommand=function(f,v){
				if(_lastCommand===null){
					return self;
				}
				if(f!==null&&v!==null){
					return _lastCommand(f,v);
				}
				if(_lastField===null){
					return _lastCommand(f);
				}
				if(!_useProperties){
					return _lastCommand(f);
				}
				return _lastCommand(_lastField,f);
			};
			this._equals=function(a,b){
				return(self._compare(a,b,1)===0);
			};
			this._compare=function(a,b,d){
				var toString = Object.prototype.toString;
				if( d === undefined) { d = 1; }
				if(a===undefined) { a = null; }
				if(b===undefined) { b = null; }
				if(a===null && b===null){
					return 0;
				}
				if(a===null&&b!==null){
					return 1;
				}
				if(a!==null&&b===null){
					return -1;
				}
				if (toString.call(a) === '[object Date]' && toString.call(b) === '[object Date]') {
					if (a < b) { return -d; }
					if (a > b) { return d; }
					return 0;
				}
				if(!_usecase && typeof a !== "number" && typeof b !== "number" ) {
					a=String(a);
					b=String(b);
				}
				if(a<b){return -d;}
				if(a>b){return d;}
				return 0;
			};
			this._performSort=function(){
				if(_sorting.length===0){return;}
				_data=self._doSort(_data,0);
			};
			this._doSort=function(d,q){
				var by=_sorting[q].by,
				dir=_sorting[q].dir,
				type = _sorting[q].type,
				dfmt = _sorting[q].datefmt,
				sfunc = _sorting[q].sfunc;
				if(q===_sorting.length-1){
					return self._getOrder(d, by, dir, type, dfmt, sfunc);
				}
				q++;
				var values=self._getGroup(d,by,dir,type,dfmt), results=[], i, j, sorted;
				for(i=0;i<values.length;i++){
					sorted=self._doSort(values[i].items,q);
					for(j=0;j<sorted.length;j++){
						results.push(sorted[j]);
					}
				}
				return results;
			};
			this._getOrder=function(data,by,dir,type, dfmt, sfunc){
				var sortData=[],_sortData=[], newDir = dir==="a" ? 1 : -1, i,ab,
				findSortKey;

				if(type === undefined ) { type = "text"; }
				if (type === 'float' || type=== 'number' || type=== 'currency' || type=== 'numeric') {
					findSortKey = function($cell) {
						var key = parseFloat( String($cell).replace(_stripNum, ''));
						return isNaN(key) ? Number.NEGATIVE_INFINITY : key;
					};
				} else if (type==='int' || type==='integer') {
					findSortKey = function($cell) {
						return $cell ? parseFloat(String($cell).replace(_stripNum, '')) : Number.NEGATIVE_INFINITY;
					};
				} else if(type === 'date' || type === 'datetime') {
					findSortKey = function($cell) {
						return jgrid.parseDate.call(context,dfmt,$cell).getTime();
					};
				} else if($.isFunction(type)) {
					findSortKey = type;
				} else {
					findSortKey = function($cell) {
						$cell = $cell ? $.trim(String($cell)) : "";
						return _usecase ? $cell : $cell.toLowerCase();
					};
				}
				$.each(data,function(i,v){
					ab = by!=="" ? jgrid.getAccessor(v,by) : v;
					if(ab === undefined) { ab = ""; }
					ab = findSortKey(ab, v);
					_sortData.push({ 'vSort': ab,'index':i});
				});
				if($.isFunction(sfunc)) {
					_sortData.sort(function(a,b){
						a = a.vSort;
						b = b.vSort;
						return sfunc.call(this,a,b,newDir);
					});
				} else {
					_sortData.sort(function(a,b){
						a = a.vSort;
						b = b.vSort;
						return self._compare(a,b,newDir);
					});
				}
				var j = 0, nrec= data.length;
				// overhead, but we do not change the original data.
				while(j<nrec) {
					i = _sortData[j].index;
					sortData.push(data[i]);
					j++;
				}
				return sortData;
			};
			this._getGroup=function(data,by,dir,type, dfmt){
				var results=[],
				group=null,
				last=null;
				$.each(self._getOrder(data,by,dir,type, dfmt),function(i,v){
					var val = jgrid.getAccessor(v, by);
					if(val == null) { val = ""; }
					if(!self._equals(last,val)){
						last=val;
						if(group !== null){
							results.push(group);
						}
						group=self._group(by,val);
					}
					group.items.push(v);
				});
				if(group !== null){
					results.push(group);
				}
				return results;
			};
			this.ignoreCase=function(){
				_usecase=false;
				return self;
			};
			this.useCase=function(){
				_usecase=true;
				return self;
			};
			this.trim=function(){
				_trim=true;
				return self;
			};
			this.noTrim=function(){
				_trim=false;
				return self;
			};
			this.execute=function(){
				var match=_query, results=[];
				if(match === null){
					return self;
				}
				$.each(_data,function(){
					if(eval(match)){results.push(this);}
				});
				_data=results;
				return self;
			};
			this.data=function(){
				return _data;
			};
			this.select=function(f){
				self._performSort();
				if(!self._hasData()){ return[]; }
				self.execute();
				if($.isFunction(f)){
					var results=[];
					$.each(_data,function(i,v){
						results.push(f(v));
					});
					return results;
				}
				return _data;
			};
			this.hasMatch=function(){
				if(!self._hasData()) { return false; }
				self.execute();
				return _data.length>0;
			};
			this.andNot=function(f,v,x){
				_negate=!_negate;
				return self.and(f,v,x);
			};
			this.orNot=function(f,v,x){
				_negate=!_negate;
				return self.or(f,v,x);
			};
			this.not=function(f,v,x){
				return self.andNot(f,v,x);
			};
			this.and=function(f,v,x){
				_queuedOperator=" && ";
				if(f===undefined){
					return self;
				}
				return self._repeatCommand(f,v,x);
			};
			this.or=function(f,v,x){
				_queuedOperator=" || ";
				if(f===undefined) { return self; }
				return self._repeatCommand(f,v,x);
			};
			this.orBegin=function(){
				_orDepth++;
				return self;
			};
			this.orEnd=function(){
				if (_query !== null){
					_query+=")";
				}
				return self;
			};
			this.isNot=function(f){
				_negate=!_negate;
				return self.is(f);
			};
			this.is=function(f){
				self._append('this.'+f);
				self._resetNegate();
				return self;
			};
			this._compareValues=function(func,f,v,how,t){
				var fld;
				if(_useProperties){
					fld=f;
				}else{
					fld='this';
				}
				if(v===undefined) { v = null; }
				//var val=v===null?f:v,
				var val =v,
				swst = t.stype === undefined ? "text" : t.stype;
				if(v !== null) {
				switch(swst) {
					case 'int':
					case 'integer':
						val = (isNaN(Number(val)) || val==="") ? '0' : val; // To be fixed with more inteligent code
						fld = 'parseInt('+fld+',10)';
						val = 'parseInt('+val+',10)';
						break;
					case 'float':
					case 'number':
					case 'numeric':
						val = String(val).replace(_stripNum, '');
						val = (isNaN(Number(val)) || val==="") ? '0' : val; // To be fixed with more inteligent code
						fld = 'parseFloat('+fld+')';
						val = 'parseFloat('+val+')';
						break;
					case 'date':
					case 'datetime':
						val = String(jgrid.parseDate.call(context,t.newfmt || 'Y-m-d',val).getTime());
						fld = 'jQuery.jgrid.parseDate.call(jQuery("'+context.p.idSel+'")[0],"'+t.srcfmt+'",'+fld+').getTime()';
						break;
					default :
						fld=self._getStr(fld);
						val=self._getStr('"'+self._toStr(val)+'"');
				}
				}
				self._append(fld+' '+how+' '+val);
				self._setCommand(func,f);
				self._resetNegate();
				return self;
			};
			this.equals=function(f,v,t){
				return self._compareValues(self.equals,f,v,"==",t);
			};
			this.notEquals=function(f,v,t){
				return self._compareValues(self.equals,f,v,"!==",t);
			};
			this.isNull = function(f,v,t){
				return self._compareValues(self.equals,f,null,"===",t);
			};
			this.greater=function(f,v,t){
				return self._compareValues(self.greater,f,v,">",t);
			};
			this.less=function(f,v,t){
				return self._compareValues(self.less,f,v,"<",t);
			};
			this.greaterOrEquals=function(f,v,t){
				return self._compareValues(self.greaterOrEquals,f,v,">=",t);
			};
			this.lessOrEquals=function(f,v,t){
				return self._compareValues(self.lessOrEquals,f,v,"<=",t);
			};
			this.startsWith=function(f,v){
				var val = (v==null) ? f: v,
				length=_trim ? $.trim(val.toString()).length : val.toString().length;
				if(_useProperties){
					self._append(self._getStr(f)+'.substr(0,'+length+') == '+self._getStr('"'+self._toStr(v)+'"'));
				}else{
					if (v!=null) { length=_trim?$.trim(v.toString()).length:v.toString().length; }
					self._append(self._getStr('this')+'.substr(0,'+length+') == '+self._getStr('"'+self._toStr(f)+'"'));
				}
				self._setCommand(self.startsWith,f);
				self._resetNegate();
				return self;
			};
			this.endsWith=function(f,v){
				var val = (v==null) ? f: v,
				length=_trim ? $.trim(val.toString()).length:val.toString().length;
				if(_useProperties){
					self._append(self._getStr(f)+'.substr('+self._getStr(f)+'.length-'+length+','+length+') == "'+self._toStr(v)+'"');
				} else {
					self._append(self._getStr('this')+'.substr('+self._getStr('this')+'.length-"'+self._toStr(f)+'".length,"'+self._toStr(f)+'".length) == "'+self._toStr(f)+'"');
				}
				self._setCommand(self.endsWith,f);self._resetNegate();
				return self;
			};
			this.contains=function(f,v){
				if(_useProperties){
					self._append(self._getStr(f)+'.indexOf("'+self._toStr(v)+'",0) > -1');
				}else{
					self._append(self._getStr('this')+'.indexOf("'+self._toStr(f)+'",0) > -1');
				}
				self._setCommand(self.contains,f);
				self._resetNegate();
				return self;
			};
			this.groupBy=function(by,dir,type, datefmt){
				if(!self._hasData()){
					return null;
				}
				return self._getGroup(_data,by,dir,type, datefmt);
			};
			this.orderBy=function(by,dir,stype, dfmt, sfunc){
				dir = dir == null ? "a" :$.trim(dir.toString().toLowerCase());
				if(stype == null) { stype = "text"; }
				if(dfmt == null) { dfmt = "Y-m-d"; }
				if(sfunc == null) { sfunc = false; }
				if(dir==="desc"||dir==="descending"){dir="d";}
				if(dir==="asc"||dir==="ascending"){dir="a";}
				_sorting.push({by:by,dir:dir,type:stype, datefmt: dfmt, sfunc: sfunc});
				return self;
			};
			this.custom = function (ruleOp, field, data) {
				self._append('jQuery("'+context.p.idSel+'")[0].p.customSortOperations.'+ruleOp+'.filter.call(jQuery("'+context.p.idSel+'")[0],{item:this,cmName:"'+field+'",searchValue:"'+data+'"})');
				self._setCommand(self.custom,field);
				self._resetNegate();
				return self;
			};
			return self;
		};
		return new QueryObject(source,null);
	},
	serializeFeedback: function (callback, eventName, postData) {
		var self = this, eventResult;
		if (self instanceof $ && self.length > 0) {
			self = self[0];
		}
		if (typeof postData === "string") {
			return postData;
		}
		eventResult = $(self).triggerHandler(eventName, postData);
		if (typeof eventResult === "string") {
			return eventResult;
		}
		if (eventResult == null || typeof eventResult !== "object") {
			eventResult = postData; // uses original postData
		}
		return $.isFunction(callback) ? callback.call(self, eventResult) : eventResult;
	},
	fullBoolFeedback: function (callback, eventName) {
		var self = this, args = $.makeArray(arguments).slice(2), result = $(self).triggerHandler(eventName, args);

		result = (result === false || result === "stop") ? false : true;
		if ($.isFunction(callback)) {
			var callbackResult = callback.apply(self, args);
			if (callbackResult === false || callbackResult === "stop") {
				result = false;
			 }
		}
		return result;
	},
	feedback: function (p, eventPrefix, callbackSuffix, callbackName) {
		var self = this;
		if (self instanceof $ && self.length > 0) {
			self = self[0];
		}
		if (p == null || typeof callbackName !== "string" || callbackName.length < 2) {
			return null; // incorrect call
		}
		// onSortCol -> jqGridSortCol, onSelectAll -> jqGridSelectAll, ondblClickRow -> jqGridDblClickRow
		// resizeStop -> jqGridResizeStop
		var eventName = callbackName.substring(0, 2) === "on"?
				"jqGrid" + eventPrefix + callbackName.charAt(2).toUpperCase() + callbackName.substring(3):
				"jqGrid" + eventPrefix + callbackName.charAt(0).toUpperCase() + callbackName.substring(1),
			args = $.makeArray(arguments).slice(4),
			callback = p[callbackName + callbackSuffix];

		args.unshift(eventName);
		args.unshift(callback);
		return jgrid.fullBoolFeedback.apply(self, args);
	},
	getIconRes: function (base, path) {
		var pathParts = path.split("."), root, n = pathParts.length, i, classes = [];
		base = jgrid.icons[base];
		if (base == null) {
			return ""; // error unknows iconSet
		}
		root = base;
		if (root.common) {
			classes.push(root.common);
		}
		for (i = 0; i < n; i++) {
			if (!pathParts[i]) {
				break;
			}
			root = root[pathParts[i]];
			if (root === undefined) {
				break;
			}
			if (typeof root === "string") {
				classes.push(root);
				break;
			}
			if (root != null && root.common) {
				classes.push(root.common);
			}
		}
		return jgrid.mergeCssClasses.apply(this, classes);
	},
	convertOnSaveLocally: function (nData, cm, oData, rowid, item, iCol) {
		var self = this, p = self.p;
		if (p == null) {
			return nData;
		}
		if ($.isFunction(cm.convertOnSave)) {
			return cm.convertOnSave.call(this, {newValue: nData, cm: cm, oldValue: oData, id: rowid, item: item, iCol: iCol});
		}
		if (typeof oData !== "boolean" && typeof oData !== "number") {
			// we support first of all editing of boolean and numeric data
			// TODO: more data types (like Date) need be implemented
			return nData;
		}
		
		if (typeof oData === "boolean" && (cm.edittype === "checkbox" || cm.formatter === "checkbox")) {
			// convert nData to boolean if possible
			var lnData = String(nData).toLowerCase(),
				cbv = cm.editoptions != null && typeof cm.editoptions.value === "string" ?
					cm.editoptions.value.split(":") : ["yes","no"];
			if ($.inArray(lnData, ["1", "true", cbv[0].toLowerCase()]) >= 0) {
				nData = true;
			} else if ($.inArray(lnData, ["0", "false", cbv[1].toLowerCase()]) >= 0) {
				nData = false;
			}
		} else if (typeof oData === "number" && !isNaN(nData)) {
			if (cm.formatter === "number" || cm.formatter === "currency") {
				nData = parseFloat(nData);
			} else if (cm.formatter === "integer") {
				nData = parseInt(nData, 10);
			}
		}
		return nData;
	},
	getMethod: function (name) {
        return this.getAccessor($.fn.jqGrid, name);
	},
	extend : function(methods) {
		$.extend($.fn.jqGrid,methods);
		if (!this.no_legacy_api) {
			$.fn.extend(methods);
		}
	}
});
var clearArray = jgrid.clearArray, jqID = jgrid.jqID,
	getGridComponentIdSelector = jgrid.getGridComponentIdSelector, getGridComponentId = jgrid.getGridComponentId,
	getGridComponent = jgrid.getGridComponent, stripPref = jgrid.stripPref, randId = jgrid.randId,
	getAccessor = jgrid.getAccessor, getCellIndex = jgrid.getCellIndex, convertOnSaveLocally = jgrid.convertOnSaveLocally,
	stripHtml = jgrid.stripHtml, htmlEncode = jgrid.htmlEncode, htmlDecode = jgrid.htmlDecode,
	feedback = function () {
		// short form of $.jgrid.feedback to save usage this.p as the first parameter
		var args = $.makeArray(arguments);
		args.unshift("");
		args.unshift("");
		args.unshift(this.p);
		return jgrid.feedback.apply(this, args);
	};

$.fn.jqGrid = function( pin ) {
	if (typeof pin === 'string') {
		var fn = jgrid.getMethod(pin);
		if (!fn) {
			throw ("jqGrid - No such method: " + pin);
		}
		var args = $.makeArray(arguments).slice(1);
		return fn.apply(this,args);
	}
	return this.each( function() {
		if(this.grid) {return;}
		var ts = this, localData, localDataStr,
		fatalErrorFunction = jgrid.defaults != null && $.isFunction(jgrid.defaults.fatalError) ? jgrid.defaults.fatalError : alert,
		locale = pin.locale || ($.jgrid.defaults || {}).locale || "en-US",
		direction = locales[locale] != null && typeof locales[locale].isRTL === "boolean" ? (locales[locale].isRTL ? "rtl" : "ltr") : "ltr",
		iconSet = pin.iconSet || ($.jgrid.defaults || {}).iconSet || "jQueryUI",
		getIcon = function (path) {
			return jgrid.getIconRes(iconSet, path);
		};
		if (pin == null) {
			pin = { datatype: "local" };
		}
		if (pin.datastr !== undefined && $.isArray(pin.datastr)) {
			localDataStr = pin.datastr;
			pin.datastr = []; // don't clear the array, just change the value of datastr property
		}
		if (pin.data !== undefined) {
			localData = pin.data;
			pin.data = []; // don't clear the array, just change the value of data property
		}
		if (jgrid.formatter == null || jgrid.formatter.unused == null) {
			// detect old locale file grid.locale-XX.js are included (without DEEP extend).
			fatalErrorFunction("CRITICAL ERROR!!!\n\n\nOne uses probably\n\n	$.extend($.jgrid.defaults, {...});\n\nto set default settings of jqGrid instead of the usage the DEEP version of jQuery.extend (with true as the first parameter):\n\n	$.extend(true, $.jgrid.defaults, {...});\n\nOne other possible reason:\n\nyou included some OLD version of language file (grid.locale-en.js for example) AFTER jquery.jqGrid.min.js. For example all language files of jqGrid 4.7.0 uses non-deep call of jQuery.extend.\n\n\nSome options of jqGrid could still work, but another one will be broken.");
		}
		if (pin.datatype === undefined && pin.dataType !== undefined) {
			// fix the bug in the usage of dataType instead of datatype
			pin.datatype = pin.dataType;
			delete pin.dataType;
		}
		if (pin.mtype === undefined && pin.type !== undefined) {
			// fix the bug in the usage of type instead of mtype
			pin.mtype = pin.type;
			delete pin.type;
		}

		var p = $.extend(true,{
			//url: "",
			height: "auto",
			page: 1,
			rowNum: 20,
			maxRowNum: 10000,
			autoresizeOnLoad: false,
			columnsToReResizing: [],
			autoResizing: {
				wrapperClassName: "ui-jqgrid-cell-wrapper",
				//widthOfVisiblePartOfSortIcon: pin.iconSet === "fontAwesome" ? 13 : 12,
				minColWidth: 33,
				maxColWidth: 300,
				adjustGridWidth: true, // shrinkToFit and widthOrg (no width option or width:"auto" during jqGrid creation will be detected) will be used additionally with adjustGridWidth
				compact: false,
				fixWidthOnShrink: false
			},
			doubleClickSensitivity: 250,
			rowTotal : null,
			records: 0,
			pager: "",
			pgbuttons: true,
			pginput: true,
			colModel: [],
			rowList: [],
			colNames: [],
			sortorder: "asc",
			//showOneSortIcon: pin.showOneSortIcon !== undefined ? pin.showOneSortIcon :
			//	pin.iconSet === "fontAwesome" ? true : false, // hide or set ui-state-disabled class on the other icon
			sortname: "",
			//datatype: pin.datatype !== undefined ? pin.datatype : // datatype parameter are specified - use it
			//	localData !== undefined || pin.url == null ? "local" : // data parameter specified or no url are specified
			//		pin.jsonReader != null && typeof pin.jsonReader === "object" ? "json" : "xml", // if jsonReader are specified - use "json". In all other cases - use "xml"
			mtype: "GET",
			altRows: false,
			selarrrow: [],
			savedRow: [],
			shrinkToFit: true,
			xmlReader: {},
			//jsonReader: {},
			subGrid: false,
			subGridModel :[],
			reccount: 0,
			lastpage: 0,
			lastsort: 0,
			selrow: null,
			singleSelectClickMode: "toggle",
			beforeSelectRow: null,
			onSelectRow: null,
			onSortCol: null,
			ondblClickRow: null,
			onRightClickRow: null,
			onPaging: null,
			onSelectAll: null,
			onInitGrid : null,
			loadComplete: null,
			gridComplete: null,
			loadError: null,
			loadBeforeSend: null,
			afterInsertRow: null,
			beforeRequest: null,
			beforeProcessing : null,
			onHeaderClick: null,
			viewrecords: false,
			loadonce: false,
			multiselect: false,
			multikey: false,
			editurl: "clientArray",
			search: false,
			caption: "",
			hidegrid: true,
			hiddengrid: false,
			postData: {},
			userData: {},
			treeGrid : false,
			treeGridModel : 'nested',
			treeReader : {},
			treeANode : -1,
			ExpandColumn: null,
			tree_root_level : 0,
			prmNames: {page:"page",rows:"rows", sort: "sidx",order: "sord", search:"_search", nd:"nd", id:"id",oper:"oper",editoper:"edit",addoper:"add",deloper:"del", subgridid:"id", npage: null, totalrows:"totalrows"},
			forceFit : false,
			gridstate : "visible",
			cellEdit: false,
			//cellsubmit: pin.cellurl === undefined ? "clientArray" : "remote",
			nv:0,
			loadui: "enable",
			toolbar: [false,""],
			scroll: false,
			multiboxonly : false,
			deselectAfterSort : true,
			scrollrows : false,
			autowidth: false,
			scrollOffset :18,
			cellLayout: 5,
			subGridWidth: 16,
			multiselectWidth: 16,
			gridview: (pin == null || pin.afterInsertRow == null), // use true if callback afterInsertRow is not specified
			rownumWidth: 25,
			rownumbers : false,
			pagerpos: 'center',
			footerrow : false,
			userDataOnFooter : false,
			hoverrows : true,
			altclass : 'ui-priority-secondary',
			viewsortcols : [false,'vertical',true],
			resizeclass : '',
			autoencode : false, // true is better for the most cases, but we hold old value to have better backwards compatibility
			remapColumns : [],
			ajaxGridOptions :{},
			direction : direction,
			toppager: false,
			headertitles: false,
			scrollTimeout: 40,
			data : [],
			lastSelectedData : [],
			_index : {},
			grouping : false,
			groupingView : {groupField:[],groupOrder:[], groupText:[],groupColumnShow:[],groupSummary:[], showSummaryOnHide: false, sortitems:[], sortnames:[], summary:[],summaryval:[], displayField: [], groupSummaryPos:[], formatDisplayField : [], _locgr : false, commonIconClass: getIcon("grouping.common"), plusicon: getIcon("grouping.plus"), minusicon: getIcon("grouping.minus")},
			ignoreCase : true,
			cmTemplate : {},
			idPrefix : "",
			iconSet: "fontAwesome", //"jQueryUI",
			locale: locale,
			multiSort :  false,
			treeIcons: {
				commonIconClass: getIcon("treeGrid.common"),
				plusLtr: getIcon("treeGrid.plusLtr"),
				plusRtl: getIcon("treeGrid.plusRtl"),
				minus: getIcon("treeGrid.minus"),
				leaf: getIcon("treeGrid.leaf")
			},
			subGridOptions: {
				commonIconClass: getIcon("subgrid.common"),
				plusicon: getIcon("subgrid.plus"),
				minusicon: getIcon("subgrid.minus")
			}
		},
		//locales[locale].defaults,
		jgrid.defaults,
		{
			navOptions: $.extend(true, {
				commonIconClass: getIcon("nav.common"),
				editicon: getIcon("nav.edit"),
				addicon: getIcon("nav.add"),
				delicon: getIcon("nav.del"),
				searchicon: getIcon("nav.search"),
				refreshicon: getIcon("nav.refresh"),
				viewicon: getIcon("nav.view"),
				saveicon: getIcon("nav.save"),
				cancelicon: getIcon("nav.cancel"),
				buttonicon: getIcon("nav.newbutton")
			}, jgrid.nav || {}),
			actionsNavOptions: $.extend(true, {
				commonIconClass: getIcon("actions.common"),
				editicon: getIcon("actions.edit"),
				delicon: getIcon("actions.del"),
				saveicon: getIcon("actions.save"),
				cancelicon: getIcon("actions.cancel")
			}, jgrid.actionsNav || {}),
			formEditing: $.extend(true, {
				commonIconClass: getIcon("form.common"),
				prevIcon: getIcon("form.prev"),
				nextIcon: getIcon("form.next"),
				saveicon: [true, "left", getIcon("form.save")],
				closeicon: [true, "left", getIcon("form.undo")]
			}, jgrid.edit || {}),
			searching: $.extend(true, {
				commonIconClass: getIcon("search.common"),
				findDialogIcon: getIcon("search.search"),
				resetDialogIcon: getIcon("search.reset"),
				queryDialogIcon: getIcon("search.query")
			}, jgrid.search || {}),
			formViewing: $.extend(true, {
				commonIconClass: getIcon("form.common"),
				prevIcon: getIcon("form.prev"),
				nextIcon: getIcon("form.next"),
				closeicon: [true, "left", getIcon("form.cancel")]
			}, jgrid.view || {}),
			formDeleting: $.extend(true, {
				commonIconClass: getIcon("form.common"),
				delicon: [true, "left", getIcon("form.del")],
				cancelicon: [true, "left", getIcon("form.cancel")]
			}, jgrid.del || {})
		},
		pin || {}),
		getRes = function (path) {
			//return jgrid.getRes(jgrid, path) || jgrid.getRes(locales[locale], path);
			return $(ts).jqGrid("getGridRes", path);
		},
		getDef = function (path) {
			//return jgrid.getRes(jgrid, path) || jgrid.getRes(locales[locale], "defaults." + path) || jgrid.getRes(locales["en-US"], "defaults." + path);
			return $(ts).jqGrid("getGridRes", "defaults." + path);
		};
		// set dynamic options
		p.recordpos = p.recordpos || (p.direction === "rtl" ? "left" : "right");
		p.subGridOptions.openicon = p.direction === "rtl" ? getIcon("subgrid.openRtl") : getIcon("subgrid.openLtr");
		p.autoResizing.widthOfVisiblePartOfSortIcon =
			p.autoResizing.widthOfVisiblePartOfSortIcon !== undefined ?
			p.autoResizing.widthOfVisiblePartOfSortIcon :
			(p.iconSet === "fontAwesome" ? 13 : 12);
		//p.showOneSortIcon = p.showOneSortIcon !== undefined ? p.showOneSortIcon :
		//	(p.iconSet === "fontAwesome" ? true : false);
		p.datatype = p.datatype !== undefined ? p.datatype : // datatype parameter are specified - use it
			localData !== undefined || p.url == null ? "local" : // data parameter specified or no url are specified
				p.jsonReader != null && typeof p.jsonReader === "object" ? "json" : "xml"; // if jsonReader are specified - use "json". In all other cases - use "xml"
		p.jsonReader = p.jsonReader || {};
		p.url = p.url || "";
		p.cellsubmit = p.cellsubmit !== undefined ? p.cellsubmit :
			p.cellurl === undefined ? "clientArray" : "remote";
		p.gridview = p.gridview !== undefined ? p.gridview : (p.afterInsertRow == null);

		if (localData !== undefined) {
			p.data = localData;
			pin.data = localData;
		}
		if (localDataStr !== undefined) {
			p.datastr = localDataStr;
			pin.datastr = localDataStr;
		}
		if(ts.tagName.toUpperCase() !== 'TABLE') {
			fatalErrorFunction("Element is not a table!");
			return;
		}
		if (ts.id === "") {
			$(ts).attr("id", randId());
		}
		if(document.documentMode !== undefined ) { // IE only
			if(document.documentMode <= 5) {
				fatalErrorFunction("Grid can not be used in this ('quirks') mode!");
				return;
			}
		}
		$(ts).empty().attr("tabindex","0");
		ts.p = p;
		p.id = ts.id;
		p.idSel = "#" + jqID(ts.id);
		p.gBoxId = getGridComponentId.call(ts, "gBox");   // gbox id like "gbox_list" or "gbox_my.list"
		p.gBox = getGridComponentIdSelector.call(ts, "gBox");   // gbox selector like "#gbox_list" or "#gbox_my\\.list"
		p.gViewId = getGridComponentId.call(ts, "gView"); // gview id like "gview_list" or "gview_my.list"
		p.gView = getGridComponentIdSelector.call(ts, "gView"); // gview selector like "#gview_list" or "#gview_my\\.list"
		p.rsId = getGridComponentId.call(ts, "columnResizer"); // vertical div inside of gbox which will be seen on resizing of columns
		p.rs = getGridComponentIdSelector.call(ts, "columnResizer"); // vertical div inside of gbox which will be seen on resizing of columns
		p.cbId = getGridComponentId.call(ts, "selectAllCheckbox"); // "cb_" +id
		p.cb = getGridComponentIdSelector.call(ts, "selectAllCheckbox"); // "cb_" +id
		p.useProp = !!$.fn.prop;
		p.propOrAttr = p.useProp ? 'prop' : 'attr';

		var propOrAttr = p.propOrAttr,
		fixScrollOffsetAndhBoxPadding = jgrid.fixScrollOffsetAndhBoxPadding,
		myResizerClickHandler = function (e) {
			var pageX = $(this).data("pageX");
			if (pageX) {
				pageX = String(pageX).split(";");
				pageX = pageX[pageX.length - 1];
				$(this).data("pageX", pageX + ";" + e.pageX);
			} else {
				$(this).data("pageX", e.pageX);
			}
		},
		grid = {
			headers:[],
			cols:[],
			footers: [],
			dragStart: function(i,x,y) {
				var self = this, $bDiv = $(self.bDiv), gridLeftPos = $bDiv.offset().left;
				self.resizing = { idx: i, startX: x.pageX, sOL : x.pageX - gridLeftPos, moved: false };
				self.hDiv.style.cursor = "col-resize";
				self.curGbox = $(p.rs,p.gBox);
				self.curGbox.css({display:"block",left:x.pageX-gridLeftPos,top:y[1],height:y[2]});
				self.curGbox.data("idx",i);
				myResizerClickHandler.call(this.curGbox, x);
				feedback.call(getGridComponent("bTable", $bDiv), "resizeStart", x, i);
				document.onselectstart=function(){return false;};
			},
			dragMove: function(x) {
				var self = this, resizing = self.resizing;
				if(resizing) {
					var diff = x.pageX-resizing.startX, headers = self.headers,
					h = headers[resizing.idx],
					newWidth = p.direction === "ltr" ? h.width + diff : h.width - diff, hn, nWn;
					resizing.moved = true;
					if(newWidth > 33) {
						if (self.curGbox == null) {
							self.curGbox = $(p.rs,p.gBox);
						}
						self.curGbox.css({left:resizing.sOL+diff});
						if(p.forceFit===true ){
							hn = headers[resizing.idx+p.nv];
							nWn = p.direction === "ltr" ? hn.width - diff : hn.width + diff;
							if(nWn > p.autoResizing.minColWidth ) {
								h.newWidth = newWidth;
								hn.newWidth = nWn;
							}
						} else {
							self.newWidth = p.direction === "ltr" ? p.tblwidth+diff : p.tblwidth-diff;
							h.newWidth = newWidth;
						}
					}
				}
			},
			resizeColumn: function (idx, skipCallbacks) {
				var self = this, headers = self.headers, footers = self.footers, h = headers[idx], hn, nw = h.newWidth || h.width,
					$bTable = getGridComponent("bTable", $(self.bDiv)), $hTable = getGridComponent("hTable", $(self.hDiv)),
					hCols = $hTable.children("thead").children("tr").first()[0].cells;
				nw = parseInt(nw,10);
				p.colModel[idx].width = nw;
				h.width = nw;
				hCols[idx].style.width = nw + "px";
				self.cols[idx].style.width = nw+"px";
				if(footers.length>0) {footers[idx].style.width = nw+"px";}
				fixScrollOffsetAndhBoxPadding.call($bTable[0]);
				if(p.forceFit===true){
					hn = headers[idx+p.nv]; // next visible th
					nw = hn.newWidth || hn.width;
					hn.width = nw;
					hCols[idx+p.nv].style.width = nw + "px";
					self.cols[idx+p.nv].style.width = nw+"px";
					if(footers.length>0) {footers[idx+p.nv].style.width = nw+"px";}
					p.colModel[idx+p.nv].width = nw;
				} else {
					p.tblwidth = self.newWidth || p.tblwidth;
					$bTable.css("width",p.tblwidth+"px");
					getGridComponent("hTable", $(self.hDiv)).css("width",p.tblwidth+"px");
					self.hDiv.scrollLeft = self.bDiv.scrollLeft;
					if(p.footerrow) {
						getGridComponent("fTable", $(self.sDiv)).css("width",p.tblwidth+"px");
						self.sDiv.scrollLeft = self.bDiv.scrollLeft;
					}
				}
				if (!p.autowidth && (p.widthOrg === undefined || p.widthOrg === "auto" || p.widthOrg === "100%")) {
					$bTable.jqGrid("setGridWidth", self.newWidth, false);
				}
				if (!skipCallbacks) {
					feedback.call($bTable[0], "resizeStop", nw, idx);
				}
			},
			dragEnd: function() {
				var self = this;
				self.hDiv.style.cursor = "default";
				if(self.resizing) {
					if (self.resizing !== null && self.resizing.moved === true) {
						$(self.headers[self.resizing.idx].el).removeData("autoResized");
						self.resizeColumn(self.resizing.idx, false);
					}
					$(p.rs).removeData("pageX");
					self.resizing = false;
					setTimeout(function () {
						$(p.rs).css("display","none");
					}, p.doubleClickSensitivity);
				}
				self.curGbox = null;
				document.onselectstart=function(){return true;};
			},
			populateVisible: function() {
				var self = this, $self = $(self), gridSelf = self.grid, bDiv = gridSelf.bDiv, $bDiv = $(bDiv);
				if (gridSelf.timer) { clearTimeout(gridSelf.timer); }
				gridSelf.timer = null;
				var dh = $bDiv.height();
				if (!dh) { return; }
				var firstDataRow, rh;
				if(self.rows.length) {
					try {
						firstDataRow = self.rows[1]; // self.rows[0] is cols row (the first row (.jqgfirstrow)) used only to set column width
						rh = firstDataRow ? $(firstDataRow).outerHeight() || gridSelf.prevRowHeight : gridSelf.prevRowHeight;
					} catch (pv) {
						rh = gridSelf.prevRowHeight;
					}
				}
				if (!rh) { return; }
				gridSelf.prevRowHeight = rh;
				var rn = p.rowNum;
				gridSelf.scrollTop = bDiv.scrollTop;
				var scrollTop = gridSelf.scrollTop;
				var ttop = Math.round($self.position().top) - scrollTop;
				var tbot = ttop + $self.height();
				var div = rh * rn;
				var page, npage, empty;
				if ( tbot < dh && ttop <= 0 &&
					(p.lastpage===undefined||(parseInt((tbot + scrollTop + div - 1) / div,10) || 0) <= p.lastpage))
				{
					npage = parseInt((dh - tbot + div - 1) / div,10) || 1;
					if (tbot >= 0 || npage < 2 || p.scroll === true) {
						page = ( Math.round((tbot + scrollTop) / div) || 0) + 1;
						ttop = -1;
					} else {
						ttop = 1;
					}
				}
				if (ttop > 0) {
					page = ( parseInt(scrollTop / div,10) || 0 ) + 1;
					npage = (parseInt((scrollTop + dh) / div,10) || 0) + 2 - page;
					empty = true;
				}
				if (npage) {
					if (p.lastpage && (page > p.lastpage || p.lastpage===1 || (page === p.page && page===p.lastpage)) ) {
						return;
					}
					if (gridSelf.hDiv.loading) {
						gridSelf.timer = setTimeout(function () {gridSelf.populateVisible.call(self);}, p.scrollTimeout);
					} else {
						p.page = page;
						if (empty) {
							gridSelf.selectionPreserver.call(self);
							gridSelf.emptyRows.call(self, false, false);
						}
						gridSelf.populate.call(self,npage);
					}
				}
			},
			scrollGrid: function(e) { // this must be bDiv
				var bDiv = this, $bTable = getGridComponent("bTable", $(bDiv));
				if (e) { e.stopPropagation(); }
				if ($bTable.length === 0) { return true; }
				var gridSelf = $bTable[0].grid;
				if (p.scroll) {
					var scrollTop = bDiv.scrollTop;
					// save last scrollTop of bDiv as property of grid object
					if (gridSelf.scrollTop === undefined) { gridSelf.scrollTop = 0; }
					if (scrollTop !== gridSelf.scrollTop) {
						gridSelf.scrollTop = scrollTop;
						if (gridSelf.timer) { clearTimeout(gridSelf.timer); }
						gridSelf.timer = setTimeout(function () {gridSelf.populateVisible.call($bTable[0]);}, p.scrollTimeout);
					}
				}
				gridSelf.hDiv.scrollLeft = bDiv.scrollLeft;
				if(p.footerrow) {
					gridSelf.sDiv.scrollLeft = bDiv.scrollLeft;
				}
			},
			selectionPreserver : function() {
				var self = this, $self = $(self), sr = p.selrow, sra = p.selarrrow ? $.makeArray(p.selarrrow) : null,
				bDiv = self.grid.bDiv, left = bDiv.scrollLeft,
				restoreSelection = function() {
					var i;
					p.selrow = null;
					clearArray(p.selarrrow); // p.selarrrow = [];
					if(p.multiselect && sra && sra.length>0) {
						for(i=0;i<sra.length;i++){
							if (sra[i] !== sr) {
								$self.jqGrid("setSelection",sra[i],false, null);
							}
						}
					}
					if (sr) {
						$self.jqGrid("setSelection",sr,false,null);
					}
					bDiv.scrollLeft = left;
					$self.unbind('.selectionPreserver', restoreSelection);
				};
				$self.bind('jqGridGridComplete.selectionPreserver', restoreSelection);				
			}
		};
		ts.grid = grid;
		feedback.call(ts, "beforeInitGrid");

	    // TODO: replace altclass : 'ui-priority-secondary',
	    // set default buttonicon : 'ui-icon-newwin' of navButtonAdd: fa-external-link, fa-desktop or other 
	    // change the order in $.extend to allows to set icons using $.jgrid (for example $.jgrid.nav). It will be ovewritten currently by p.navOptions which we set above.
		var iCol, dir;
		if(p.colNames.length === 0) {
			for (iCol=0;iCol<p.colModel.length;iCol++){
				p.colNames[iCol] = p.colModel[iCol].label || p.colModel[iCol].name;
			}
		}
		if( p.colNames.length !== p.colModel.length ) {
			fatalErrorFunction(getRes("errors.model"));
			return;
		}
		var gv = $("<div class='ui-jqgrid-view' role='grid' aria-multiselectable='" + !!p.multiselect +"'></div>"),
		isMSIE = jgrid.msie,
		isMSIE7 = isMSIE && jgrid.msiever() < 8;
		p.direction = $.trim(p.direction.toLowerCase());
		if($.inArray(p.direction,["ltr","rtl"]) === -1) { p.direction = "ltr"; }
		dir = p.direction;

		$(gv).insertBefore(ts);
		$(ts).removeClass("scroll").appendTo(gv);
		var eg = $("<div class='ui-jqgrid ui-widget ui-widget-content ui-corner-all'></div>");
		$(eg).attr({"id": p.gBoxId,"dir": dir}).insertBefore(gv);
		$(gv).attr("id", p.gViewId).appendTo(eg);
		$("<div class='ui-widget-overlay jqgrid-overlay' id='lui_"+p.id+"'></div>").insertBefore(gv);
		$("<div class='loading ui-state-default ui-state-active' id='load_"+p.id+"'>"+getDef("loadtext")+"</div>").insertBefore(gv);
		if (isMSIE7) {
			$(ts).attr({cellspacing:"0"});
		}
		$(ts).attr({"role":"presentation","aria-labelledby":"gbox_"+ts.id});
		var sortkeys = ["shiftKey","altKey","ctrlKey"],
		stripGridPrefix = function (rowId) {
			return stripPref(p.idPrefix, rowId);
		},
		intNum = function(val,defval) {
			val = parseInt(val,10);
			if (isNaN(val)) { return defval || 0;}
			return val;
		},
		formatCol = function (pos, rowInd, tv, rawObject, rowId, rdata){
			var cm = p.colModel[pos], cellAttrFunc,
			ral = cm.align, result="style=\"", clas = cm.classes, nm = cm.name, celp, acp=[];
			if(ral) { result += "text-align:"+ral+";"; }
			if(cm.hidden===true) { result += "display:none;"; }
			if(rowInd===0) {
				result += "width: "+grid.headers[pos].width+"px;";
			} else if ($.isFunction(cm.cellattr) || (typeof cm.cellattr === "string" && jgrid.cellattr != null && $.isFunction(jgrid.cellattr[cm.cellattr]))) {
				cellAttrFunc = $.isFunction(cm.cellattr) ? cm.cellattr : jgrid.cellattr[cm.cellattr];
				celp = cellAttrFunc.call(ts, rowId, tv, rawObject, cm, rdata);
				if(celp && typeof celp === "string") {
					celp = celp.replace(/style/i,'style').replace(/title/i,'title');
					if(celp.indexOf('title') > -1) { cm.title=false;}
					if(celp.indexOf('class') > -1) { clas = undefined;}
					acp = celp.replace(/\-style/g,'-sti').split(/style/);
					if(acp.length === 2 ) {
						acp[1] =  $.trim(acp[1].replace(/\-sti/g,'-style').replace("=",""));
						if(acp[1].indexOf("'") === 0 || acp[1].indexOf('"') === 0) {
							acp[1] = acp[1].substring(1);
						}
						result += acp[1].replace(/'/gi,'"');
					} else {
						result += "\"";
					}
				}
			}
			if(!acp.length) { acp[0] = ""; result += "\"";}
			result += (clas !== undefined ? (" class=\""+clas+"\"") :"") + ((cm.title && tv) ? (" title=\""+stripHtml(tv)+"\"") :"");
			result += " aria-describedby=\""+p.id+"_"+nm+"\"";
			return result + acp[0];
		},
		cellVal =  function (val) {
			return val == null || val === "" ? "&#160;" : (p.autoencode ? htmlEncode(val) : String(val));
		},
		formatter = function (rowId, cellval, colpos, rwdat, act){
			var cm = p.colModel[colpos],v;
			if(cm.formatter !== undefined) {
				rowId = String(p.idPrefix) !== "" ? stripGridPrefix(rowId) : rowId;
				var opts= {rowId: rowId, colModel:cm, gid:p.id, pos:colpos };
				if($.isFunction( cm.formatter ) ) {
					v = cm.formatter.call(ts,cellval,opts,rwdat,act);
				} else if($.fmatter){
					v = $.fn.fmatter.call(ts,cm.formatter,cellval,opts,rwdat,act);
				} else {
					v = cellVal(cellval);
				}
			} else {
				v = cellVal(cellval);
			}
			return cm.autoResizable && cm.formatter !== "actions" ? "<span class='" + p.autoResizing.wrapperClassName + "'>" + v + "</span>" : v;
		},
		addCell = function(rowId,cell,pos,irow, srvr, rdata) {
			var v = formatter(rowId,cell,pos,srvr,'add');
			return "<td role=\"gridcell\" "+formatCol( pos,irow, v, srvr, rowId, rdata)+">"+v+"</td>";
		},
		addMulti = function(rowid,pos,irow,checked){
			var	v = "<input role=\"checkbox\" type=\"checkbox\""+" id=\"jqg_"+p.id+"_"+rowid+"\" class=\"cbox\" name=\"jqg_"+p.id+"_"+rowid+"\"" + (checked ? " checked=\"checked\" aria-checked=\"true\"" : " aria-checked=\"false\"")+"/>";
			return "<td role=\"gridcell\" "+
				formatCol(pos,irow,'',null, rowid, true)+">"+v+"</td>";
		},
		addRowNum = function (pos,irow,pG,rN) {
			var v = (parseInt(pG,10)-1)*parseInt(rN,10)+1+irow;
			return "<td role=\"gridcell\" class=\"ui-state-default jqgrid-rownum\" "+
				formatCol(pos,irow,v, null, irow, true)+">"+v+"</td>";
		},
		reader = function (datatype) {
			var field, f=[], i, colModel = p.colModel, nCol = colModel.length, name;
			for(i=0; i<nCol; i++){
				field = colModel[i];
				if (field.name !== 'cb' && field.name !=='subgrid' && field.name !=='rn') {
					name = (datatype === "xml" || datatype === "xmlstring") ?
							field.xmlmap || field.name :
							(datatype === "local" && !p.dataTypeOrg) || datatype === "json" ? field.jsonmap || field.name : field.name;
					if(p.keyName !== false && field.key===true ) {
						p.keyName = name;
					}
					f.push(name);
				}
			}
			return f;
		},
		orderedCols = function (offset) {
			var order = p.remapColumns;
			if (!order || !order.length) {
				order = $.map(p.colModel, function(v,i) { return i; });
			}
			if (offset) {
				order = $.map(order, function(v) { return v<offset?null:v-offset; });
			}
			return order;
		},
		emptyRows = function (scroll, locdata) {
			var firstrow, self = this, rows = self.rows, bDiv = self.grid.bDiv;
			$(self).unbind(".jqGridFormatter");
			if (p.deepempty) {
				$(rows).slice(1).remove();
			} else {
				firstrow = rows.length > 0 ? rows[0] : null;
				$(self.firstChild).empty().append(firstrow);
			}
			if (scroll && p.scroll) {
				$(bDiv.firstChild).css({height: "auto"});
				$(bDiv.firstChild.firstChild).css({height: 0, display: "none"});
				if (bDiv.scrollTop !== 0) {
					bDiv.scrollTop = 0;
				}
			}
			if(locdata === true && p.treeGrid) {
				clearArray(p.data); //p.data = [];
				clearArray(p.lastSelectedData); //p.lastSelectedData = [];
				p._index = {};
			}
			//$(self.grid.headers).each(function () { $(this.el).removeData("autoResized"); });
		},
		normalizeData = function() {
			var data = p.data, dataLength = data.length, i, j, cur, cells, idn, idi, idr, v, rd,
			localReader = p.localReader,
			colModel = p.colModel,
			cellName = localReader.cell,
			iOffset = (p.multiselect === true ? 1 : 0) + (p.subGrid === true ? 1 : 0) + (p.rownumbers === true ? 1 : 0),
			br = p.scroll ? randId() : 1,
			arrayReader, objectReader, rowReader;

			if (p.datatype !== "local" || localReader.repeatitems !== true) {
				return; // nothing to do
			}

			arrayReader = orderedCols(iOffset);
			objectReader = reader("local");
			// read ALL input items and convert items to be read by
			// $.jgrid.getAccessor with column name as the second parameter
			idn = p.keyName === false ?
				($.isFunction(localReader.id) ? localReader.id.call(this, data) : localReader.id) :
				p.keyName;
			if (!isNaN(idn)) {
				idi = Number(idn);
			}
			for (i = 0; i < colModel.length; i++) {
				if (colModel[i].name === idn) {
					idi = i - iOffset;
					break;
				}
			}
			for (i = 0; i < dataLength; i++) {
				cur = data[i];
				cells = cellName ? getAccessor(cur, cellName) || cur : cur;
				rowReader = $.isArray(cells) ? arrayReader : objectReader;
				idr = p.keyName === false ? getAccessor(cur, idn) : getAccessor(cells, rowReader[idi]);
				if (idr === undefined) {
					// it could be that one uses the index of column in localReader.id
					if (!isNaN(idn) && colModel[Number(idn) + iOffset] != null) {
						idr = getAccessor(cells, rowReader[Number(idn)]);
					}
					if (idr === undefined) {
						idr = br + i;
					}
				}
				rd = { };
				rd[localReader.id] = idr;
				for (j = 0; j < rowReader.length; j++) {
					v = getAccessor(cells, rowReader[j]);
					rd[colModel[j + iOffset].name] = v;
				}
				$.extend(true, data[i], rd);
			}
		},
		refreshIndex = function() {
			var datalen = p.data.length, idname, i, val;

			if(p.keyName === false || p.loadonce) {
				idname = p.localReader.id;
			} else {
				idname = p.keyName;
			}
			p._index = {};
			for(i =0;i < datalen; i++) {
				val = getAccessor(p.data[i],idname);
				if (val === undefined) { val=String(i+1); }
				p._index[val] = i;
			}
		},
		constructTr = function(id, hide, altClass, rd, cur, selected) {
			var tabindex = '-1', restAttr = '', attrName, style = hide ? 'display:none;' : '', self = this,
				classes = 'ui-widget-content jqgrow ui-row-' + p.direction + (altClass ? ' ' + altClass : '') + (selected ? ' ui-state-highlight' : ''),
				rowAttrObj = $(self).triggerHandler("jqGridRowAttr", [rd, cur, id]);
			if( typeof rowAttrObj !== "object" ) {
				rowAttrObj = $.isFunction(p.rowattr) ? p.rowattr.call(self, rd, cur, id) :
					(typeof p.rowattr === "string" && jgrid.rowattr != null && $.isFunction(jgrid.rowattr[p.rowattr]) ?
					 jgrid.rowattr[p.rowattr].call(self, rd, cur, id) : {});
			}
			if(rowAttrObj != null && !$.isEmptyObject( rowAttrObj )) {
				if (rowAttrObj.hasOwnProperty("id")) {
					id = rowAttrObj.id;
					delete rowAttrObj.id;
				}
				if (rowAttrObj.hasOwnProperty("tabindex")) {
					tabindex = rowAttrObj.tabindex;
					delete rowAttrObj.tabindex;
				}
				if (rowAttrObj.hasOwnProperty("style")) {
					style += rowAttrObj.style;
					delete rowAttrObj.style;
				}
				if (rowAttrObj.hasOwnProperty("class")) {
					classes += ' ' + rowAttrObj['class'];
					delete rowAttrObj['class'];
				}
				// dot't allow to change role attribute
				try { delete rowAttrObj.role; } catch(ignore){}
				for (attrName in rowAttrObj) {
					if (rowAttrObj.hasOwnProperty(attrName)) {
						restAttr += ' ' + attrName + '=' + rowAttrObj[attrName];
					}
				}
			}
			return '<tr role="row" id="' + id + '" tabindex="' + tabindex + '" class="' + classes + '"' +
				(style === '' ? '' : ' style="' + style + '"') + restAttr + '>';
		},
		finalizationFormatters = function () {
			var i, formatName;
			for (i=0; i<p.colModel.length; i++) {
				formatName = p.colModel[i].formatter;
				if (typeof formatName === "string" && $.fn.fmatter != null &&
						$.isFunction($.fn.fmatter[formatName]) && $.isFunction($.fn.fmatter[formatName].pageFinalization)) {
					$.fn.fmatter[formatName].pageFinalization.call(this, i);
				}
			}
		},
		addXmlData = function (xml, rcnt, more, adjust) {
			var self = this, $self = $(this), startReq = new Date(), getXmlData = jgrid.getXmlData,
			locdata = (p.datatype !== "local" && p.loadonce) || p.datatype === "xmlstring",
			xmlid = "_id_", xmlRd = p.xmlReader, colModel = p.colModel,
			frd = p.datatype === "local" ? "local" : "xml";
			if(locdata) {
				clearArray(p.data); //p.data = [];
				clearArray(p.lastSelectedData); //p.lastSelectedData = [];
				p._index = {};
				p.localReader.id = xmlid;
			}
			p.reccount = 0;
			if($.isXMLDoc(xml)) {
				if(p.treeANode===-1 && !p.scroll) {
					emptyRows.call(self, false, true);
					rcnt=1;
				} else { rcnt = rcnt > 1 ? rcnt :1; }
			} else { return; }
			var i,fpos,ir=0,v,gi=p.multiselect===true?1:0,si=0,addSubGridCell,ni=p.rownumbers===true?1:0,idn, getId,f=[],colOrder,rd ={},
			xmlr,rid, rowData=[], cn=(p.altRows === true) ? p.altclass:"",cn1;
			if(p.subGrid===true) {
				si = 1;
				addSubGridCell = jgrid.getMethod("addSubGridCell");
			}
			if(!xmlRd.repeatitems) {f = reader(frd);}
			if( p.keyName===false) {
				idn = $.isFunction( xmlRd.id ) ?  xmlRd.id.call(self, xml) : xmlRd.id;
			} else {
				idn = p.keyName;
			}
			if (isNaN(idn) && xmlRd.repeatitems) {
				for (i=0; i<colModel.length; i++) {
					if (colModel[i].name === idn) {
						idn = i - (gi+si+ni);
						break;
					}
				}
			}

			if( String(idn).indexOf("[") === -1 ) {
				if (f.length) {
					getId = function( trow, k) {return $(idn,trow).text() || k;};
				} else {
					getId = function( trow, k) {return $(xmlRd.cell,trow).eq(idn).text() || k;};
				}
			}
			else {
				getId = function( trow, k) {return trow.getAttribute(idn.replace(/[\[\]]/g,"")) || k;};
			}
			p.userData = {};
			p.page = intNum(getXmlData(xml, xmlRd.page), p.page);
			p.lastpage = intNum(getXmlData(xml, xmlRd.total), 1);
			p.records = intNum(getXmlData(xml, xmlRd.records));
			if($.isFunction(xmlRd.userdata)) {
				p.userData = xmlRd.userdata.call(self, xml) || {};
			} else {
				getXmlData(xml, xmlRd.userdata, true).each(function() {p.userData[this.getAttribute("name")]= $(this).text();});
			}
			var hiderow=false, groupingPrepare, gxml = getXmlData( xml, xmlRd.root, true);
			gxml = getXmlData(gxml, xmlRd.row, true) || [];
			var gl = gxml.length, j=0, grpdata=[], rn = parseInt(p.rowNum,10), br=p.scroll?randId():1, altr, iStartTrTag, cells;
			if (gl > 0 &&  p.page <= 0) { p.page = 1; }
			if(p.grouping) {
				hiderow = p.groupingView.groupCollapse === true;
				groupingPrepare = jgrid.getMethod("groupingPrepare");
			}
			var cell, $tbody = $(self.tBodies[0]); //$self.children("tbody").filter(":first");
			if(gxml && gl){
				if (adjust) { rn *= adjust+1; }
				while (j<gl) {
					xmlr = gxml[j];
					rid = getId(xmlr,br+j);
					rid  = p.idPrefix + rid;
					altr = rcnt === 0 ? 0 : rcnt+1;
					cn1 = (altr+j)%2 === 1 ? cn : '';
					iStartTrTag = rowData.length;
					rowData.push("");
					if( ni ) {
						rowData.push( addRowNum(0,j,p.page,p.rowNum) );
					}
					if( gi ) {
						rowData.push( addMulti(rid,ni,j, false) );
					}
					if( si ) {
						rowData.push( addSubGridCell.call($self,gi+ni,j+rcnt) );
					}
					if(xmlRd.repeatitems){
						if (!colOrder) { colOrder=orderedCols(gi+si+ni); }
						cells = getXmlData( xmlr, xmlRd.cell, true);
						for(i = 0; i < colOrder.length;i++) {
							cell = cells[colOrder[i]];
							if (!cell) {
								break;
							}
							v = cell.textContent || cell.text;
							rd[colModel[i+gi+si+ni].name] = v;
							rowData.push( addCell(rid, v, i+gi+si+ni, j+rcnt, xmlr, rd) );
						}
					} else {
						for(i = 0; i < f.length;i++) {
							v = getXmlData( xmlr, f[i]);
							rd[colModel[i+gi+si+ni].name] = v;
							rowData.push( addCell(rid, v, i+gi+si+ni, j+rcnt, xmlr, rd) );
						}
					}
					rowData[iStartTrTag] = constructTr.call(self, rid, hiderow, cn1, rd, xmlr, false);
					rowData.push("</tr>");
					if(p.grouping) {
						grpdata.push( rowData );
						if(!p.groupingView._locgr) {
							groupingPrepare.call($self, rd, j );
						}
						rowData = [];
					}
					if(locdata || p.treeGrid === true) {
						rd[xmlid] = stripGridPrefix(rid);
						p.data.push(rd);
						p._index[rd[xmlid]] = p.data.length-1;
					}
					if(p.gridview === false ) {
						$tbody.append(rowData.join(''));
						feedback.call(self, "afterInsertRow", rid, rd, xmlr);
						clearArray(rowData);//rowData=[];
					}
					rd={};
					ir++;
					j++;
					if(ir===rn) {break;}
				}
			}
			if(p.gridview === true) {
				fpos = p.treeANode > -1 ? p.treeANode: 0;
				if(p.grouping) {
					if(!locdata) {
						$self.jqGrid('groupingRender',grpdata,colModel.length, p.page, rn);
						grpdata = null;
					}
				} else if(p.treeGrid === true && fpos > 0) {
					$(self.rows[fpos]).after(rowData.join(''));
				} else if (self.firstElementChild) {
					//$("tbody:first",self.grid.bDiv).append(rowData.join(''));
					self.firstElementChild.innerHTML += rowData.join(''); // append to innerHTML of tbody which contains the first row (.jqgfirstrow)
					self.grid.cols = self.rows[0].cells; // update cached first row
				} else {
					// for IE8 for example
					$tbody($tbody.html() + rowData.join('')); // append to innerHTML of tbody which contains the first row (.jqgfirstrow)
					self.grid.cols = self.rows[0].cells; // update cached first row
				}
			}
			if(p.subGrid === true ) {
				try {$self.jqGrid("addSubGrid",gi+ni);} catch (ignore){}
			}
			p.totaltime = new Date() - startReq;
			if(ir>0) { if(p.records===0) { p.records=gl;} }
			clearArray(rowData);
			if(p.treeGrid === true) {
				try {$self.jqGrid("setTreeNode", fpos+1, ir+fpos+1);} catch (ignore) {}
			}
			//if(!p.treeGrid && !p.scroll) {grid.bDiv.scrollTop = 0;}
			p.reccount=ir;
			p.treeANode = -1;
			if(p.userDataOnFooter) { $self.jqGrid("footerData","set",p.userData,true); }
			if(locdata) {
				p.records = gl;
				p.lastpage = Math.ceil(gl/ rn);
			}
			if (!more) { self.updatepager(false,true); }
			finalizationFormatters.call(self);
			if(locdata) {
				while (ir<gl) {
					xmlr = gxml[ir];
					rid = getId(xmlr,ir+br);
					rid  = p.idPrefix + rid;
					if(xmlRd.repeatitems){
						if (!colOrder) { colOrder=orderedCols(gi+si+ni); }
						cells = getXmlData( xmlr, xmlRd.cell, true);
						for(i = 0; i < colOrder.length;i++) {
							cell = cells[colOrder[i]];
							if (!cell) {
								break;
							}
							rd[colModel[i+gi+si+ni].name] = cell.textContent || cell.text;
						}
					} else {
						for(i = 0; i < f.length;i++) {
							v = getXmlData( xmlr, f[i]);
							rd[colModel[i+gi+si+ni].name] = v;
						}
					}
					rd[xmlid] = stripGridPrefix(rid);
					if(p.grouping) {
						groupingPrepare.call($self, rd, ir );
					}
					p.data.push(rd);
					p._index[rd[xmlid]] = p.data.length-1;
					rd = {};
					ir++;
				}
				if(p.grouping) {
					p.groupingView._locgr = true;
					$self.jqGrid('groupingRender', grpdata, colModel.length, p.page, rn);
					grpdata = null;
				}
			}
		},
		addJSONData = function(data, rcnt, more, adjust) {
			var self = this, $self = $(self), startReq = new Date();
			if(data) {
				if(p.treeANode === -1 && !p.scroll) {
					emptyRows.call(self, false, true);
					rcnt=1;
				} else { rcnt = rcnt > 1 ? rcnt :1; }
			} else {
				// in case of usage TreeGrid for example
				return;
			}

			var dReader, locid = "_id_", frd,
			locdata = (p.datatype !== "local" && p.loadonce) || p.datatype === "jsonstring";
			if(locdata) {
				clearArray(p.data); //p.data = [];
				clearArray(p.lastSelectedData); //p.lastSelectedData = [];
				p._index = {};
				p.localReader.id = locid;
			}
			p.reccount = 0;
			if(p.datatype === "local") {
				dReader =  p.localReader;
				frd= 'local';
			} else {
				dReader =  p.jsonReader;
				frd='json';
			}
			var ir,v,i,j,cur,cells,gi=p.multiselect?1:0,si=p.subGrid===true?1:0,addSubGridCell,ni=p.rownumbers===true?1:0,
			arrayReader=orderedCols(gi+si+ni),objectReader=reader(frd),rowReader,len,drows,idn,idi,rd={}, fpos, idr,rowData=[],
			cn=(p.altRows === true) ? p.altclass:"",cn1;
			p.page = intNum(getAccessor(data,dReader.page), p.page);
			p.lastpage = intNum(getAccessor(data,dReader.total), 1);
			p.records = intNum(getAccessor(data,dReader.records));
			p.userData = getAccessor(data,dReader.userdata) || {};
			if(si) {
				addSubGridCell = jgrid.getMethod("addSubGridCell");
			}
			if( p.keyName===false ) {
				idn = $.isFunction(dReader.id) ? dReader.id.call(self, data) : dReader.id; 
			} else {
				idn = p.keyName;
			}
			if (!isNaN(idn)) {
				idi = Number(idn);
			}
			for (i=0; i<p.colModel.length; i++) {
				// we need to have idi with corresponds the indexes in rowReader which SKIPS
				// columns 'cb', 'subgrid' and !=='rn'
				if (p.colModel[i].name === idn) {
					idi = i - (gi+si+ni);
					break;
				}
			}
			drows = getAccessor(data,dReader.root);
			if (drows == null && $.isArray(data)) { drows = data; }
			if (!drows) { drows = []; }
			len = drows.length;
			if (len > 0 && p.page <= 0) { p.page = 1; }
			var rn = parseInt(p.rowNum,10),br=p.scroll?randId():1, altr, selected=false, selr;
			if (adjust) { rn *= adjust+1; }
			if(p.datatype === "local" && !p.deselectAfterSort) {
				selected = true;
			}
			var grpdata=[],hiderow=false, groupingPrepare, iStartTrTag;
			if(p.grouping)  {
				hiderow = p.groupingView.groupCollapse === true;
				groupingPrepare = jgrid.getMethod("groupingPrepare");
			}
			var $tbody = $(self.tBodies[0]); //$self.children("tbody").filter(":first");
			for (i=0; i<len && i<rn; i++) {
				cur = drows[i];
				cells = dReader.repeatitems && dReader.cell ? getAccessor(cur, dReader.cell) || cur : cur;
				rowReader = dReader.repeatitems && $.isArray(cells) ? arrayReader : objectReader;
				idr = p.keyName === false ? getAccessor(cur, idn) : getAccessor(cells, rowReader[idi]);
				if(idr === undefined) {
					// it could be that one uses the index of column in dReader.id
					if (!isNaN(idn) && p.colModel[Number(idn)+gi+si+ni] != null) {
						idr = getAccessor(cells, rowReader[Number(idn)]);
					}
					if(idr === undefined) {
						idr = br+i;
					}
				}
				idr  = p.idPrefix + idr;
				altr = rcnt === 1 ? 0 : rcnt;
				cn1 = (altr+i)%2 === 1 ? cn : '';
				if( selected) {
					if( p.multiselect) {
						selr = ($.inArray(idr, p.selarrrow) !== -1);
					} else {
						selr = (idr === p.selrow);
					}
				}
				iStartTrTag = rowData.length;
				rowData.push("");
				if( ni ) {
					rowData.push( addRowNum(0,i,p.page,p.rowNum) );
				}
				if( gi ){
					rowData.push( addMulti(idr,ni,i,selr) );
				}
				if( si ) {
					rowData.push( addSubGridCell.call($self,gi+ni,i+rcnt) );
				}
				for (j=0;j<rowReader.length;j++) {
					v = getAccessor(cells, rowReader[j]);
					rd[p.colModel[j+gi+si+ni].name] = v;
					rowData.push( addCell(idr,v,j+gi+si+ni,i+rcnt,cells, rd) );
				}
				rowData[iStartTrTag] = constructTr.call(self, idr, hiderow, cn1, rd, cells, selr);
				rowData.push( "</tr>" );
				if(p.grouping) {
					grpdata.push( rowData );
					if(!p.groupingView._locgr) {
						groupingPrepare.call($self, rd, i);
					}
					rowData = [];
				}
				if(locdata || p.treeGrid===true) {
					rd[locid] = stripGridPrefix(idr);
					p.data.push(rd);
					p._index[rd[locid]] = p.data.length-1;
				}
				if(p.gridview === false ) {
					$tbody.append(rowData.join('')); // ??? $self.append(rowData.join(''));
					feedback.call(self, "afterInsertRow", idr, rd, cells);
					clearArray(rowData); // rowData=[];
				}
				rd={};
			}
			if(p.gridview === true ) {
				fpos = p.treeANode > -1 ? p.treeANode: 0;
				if(p.grouping) {
					if(!locdata) {
						$self.jqGrid('groupingRender', grpdata, p.colModel.length, p.page, rn);
						grpdata = null;
					}
				} else if(p.treeGrid === true && fpos > 0) {
					$(self.rows[fpos]).after(rowData.join(''));
				} else if (self.firstElementChild) {
					self.firstElementChild.innerHTML += rowData.join(''); // append to innerHTML of tbody which contains the first row (.jqgfirstrow)
					self.grid.cols = self.rows[0].cells; // update cached first row
				} else {
					// for IE8 for example
					$tbody.html($tbody.html() + rowData.join('')); // append to innerHTML of tbody which contains the first row (.jqgfirstrow)
					self.grid.cols = self.rows[0].cells; // update cached first row
				}
			}
			if(p.subGrid === true ) {
				try { $self.jqGrid("addSubGrid",gi+ni);} catch (ignore){}
			}
			p.totaltime = new Date() - startReq;
			if(i>0) {
				if(p.records===0) { p.records=len; }
			}
			clearArray(rowData);
			if( p.treeGrid === true) {
				try {$self.jqGrid("setTreeNode", fpos+1, i+fpos+1);} catch (ignore) {}
			}
			//if(!p.treeGrid && !p.scroll) {grid.bDiv.scrollTop = 0;}
			p.reccount=i;
			p.treeANode = -1;
			if(p.userDataOnFooter) { $self.jqGrid("footerData","set",p.userData,true); }
			if(locdata) {
				p.records = len;
				p.lastpage = Math.ceil(len/ rn);
			}
			if (!more) { self.updatepager(false,true); }
			finalizationFormatters.call(self);
			if(locdata) {
				for (ir=i; ir<len && drows[ir]; ir++) {
					cur = drows[ir];
					cells = dReader.repeatitems && dReader.cell ? getAccessor(cur, dReader.cell) || cur : cur;
					rowReader = dReader.repeatitems && $.isArray(cells) ? arrayReader : objectReader;
					idr = p.keyName === false ? getAccessor(cur, idn) : getAccessor(cells, rowReader[idi]);
					if(idr === undefined) {
						// it could be that one uses the index of column in dReader.id
						if (!isNaN(idn) && p.colModel[Number(idn)+gi+si+ni] != null) {
							idr = getAccessor(cells, rowReader[Number(idn)]);
						}
						if(idr === undefined) {
							idr = br+ir;
						}
					}
					if(cells) {
						for (j=0;j<rowReader.length;j++) {
							rd[p.colModel[j+gi+si+ni].name] = getAccessor(cells,rowReader[j]);
						}
						rd[locid] = stripGridPrefix(idr);
						if(p.grouping) {
							groupingPrepare.call($self, rd, ir );
						}
						p.data.push(rd);
						p._index[rd[locid]] = p.data.length-1;
						rd = {};
					}
				}
				if(p.grouping) {
					p.groupingView._locgr = true;
					$self.jqGrid('groupingRender', grpdata, p.colModel.length, p.page, rn);
					grpdata = null;
				}
			}
		},
		addLocalData = function() {
			var $self = $(this), st = p.multiSort ? [] : "", sto=[], fndsort=false, cmtypes={}, grtypes=[], grindexes=[], srcformat, sorttype, newformat,
				dateDefaults = getRes("formatter.date");
			if(!$.isArray(p.data)) {
				return {};
			}
			var grpview = p.grouping ? p.groupingView : false, lengrp, gin;
			$.each(p.colModel,function(iCol){
				var cm = this, grindex = cm.index || cm.name;
				sorttype = cm.sorttype || "text";
				cmtypes[cm.name] = {reader: !p.dataTypeOrg ? cm.jsonmap || cm.name : cm.name, iCol: iCol, stype: sorttype, srcfmt:'', newfmt:'', sfunc: cm.sortfunc || null};
				if(sorttype === "date" || sorttype === "datetime") {
					if(cm.formatter && typeof cm.formatter === 'string' && cm.formatter === 'date') {
						if(cm.formatoptions && cm.formatoptions.srcformat) {
							srcformat = cm.formatoptions.srcformat;
						} else {
							srcformat = dateDefaults.srcformat;
						}
						if(cm.formatoptions && cm.formatoptions.newformat) {
							newformat = cm.formatoptions.newformat;
						} else {
							newformat = dateDefaults.newformat;
						}
					} else {
						srcformat = newformat = cm.datefmt || "Y-m-d";
					}
					cmtypes[cm.name].srcfmt = srcformat;
					cmtypes[cm.name].newfmt = newformat;
				}
				if(p.grouping) {
					for(gin =0, lengrp = grpview.groupField.length; gin< lengrp; gin++) {
						if( cm.name === grpview.groupField[gin]) {
							grtypes[gin] = cmtypes[grindex];
							grindexes[gin]= grindex;
						}
					}
				}
				if(p.multiSort) {
					if(cm.lso) {
						st.push(cm.name);
						var tmplso= cm.lso.split("-");
						sto.push( tmplso[tmplso.length-1] );
					}
				} else {
					if(!fndsort && (cm.index === p.sortname || cm.name === p.sortname)){
						st = cm.name; // ???
						fndsort = true;
					}
				}
			});
			if(p.treeGrid) {
				$self.jqGrid("SortTree", st, p.sortorder,
					cmtypes[st] != null && cmtypes[st].stype ? cmtypes[st].stype : 'text',
					cmtypes[st] != null && cmtypes[st].srcfmt ? cmtypes[st].srcfmt : '');
				return false;
			}
			var compareFnMap = {
				'eq':function(queryObj) {return queryObj.equals;},
				'ne':function(queryObj) {return queryObj.notEquals;},
				'lt':function(queryObj) {return queryObj.less;},
				'le':function(queryObj) {return queryObj.lessOrEquals;},
				'gt':function(queryObj) {return queryObj.greater;},
				'ge':function(queryObj) {return queryObj.greaterOrEquals;},
				'cn':function(queryObj) {return queryObj.contains;},
				'nc':function(queryObj,op) {return op === "OR" ? queryObj.orNot().contains : queryObj.andNot().contains;},
				'bw':function(queryObj) {return queryObj.startsWith;},
				'bn':function(queryObj,op) {return op === "OR" ? queryObj.orNot().startsWith : queryObj.andNot().startsWith;},
				'en':function(queryObj,op) {return op === "OR" ? queryObj.orNot().endsWith : queryObj.andNot().endsWith;},
				'ew':function(queryObj) {return queryObj.endsWith;},
				'ni':function(queryObj,op) {return op === "OR" ? queryObj.orNot().equals : queryObj.andNot().equals;},
				'in':function(queryObj) {return queryObj.equals;},
				'nu':function(queryObj) {return queryObj.isNull;},
				'nn':function(queryObj,op) {return op === "OR" ? queryObj.orNot().isNull : queryObj.andNot().isNull;}
			},
			query = jgrid.from.call(this,p.data);
			if (p.ignoreCase) { query = query.ignoreCase(); }
			function tojLinq ( group ) {
				var s = 0, index, gor, ror, opr, rule, r, cmi;
				if (group.groups != null) {
					gor = group.groups.length && group.groupOp.toString().toUpperCase() === "OR";
					if (gor) {
						query.orBegin();
					}
					for (index = 0; index < group.groups.length; index++) {
						if (s > 0 && gor) {
							query.or();
						}
						try {
							tojLinq(group.groups[index]);
						} catch (e) {fatalErrorFunction(e);}
						s++;
					}
					if (gor) {
						query.orEnd();
					}
				}
				if (group.rules != null) {
					try{
						ror = group.rules.length && group.groupOp.toString().toUpperCase() === "OR";
						if (ror) {
							query.orBegin();
						}
						for (index = 0; index < group.rules.length; index++) {
							rule = group.rules[index];
							opr = group.groupOp.toString().toUpperCase();
							if (compareFnMap[rule.op] && rule.field ) {
								if(s > 0 && opr && opr === "OR") {
									query = query.or();
								}
								cmi = cmtypes[rule.field];
								r = cmi.reader;
								query = compareFnMap[rule.op](query, opr)(
									$.isFunction(r) ?
										'jQuery.jgrid.getAccessor(this,jQuery("'+p.idSel+'")[0].p.colModel['+ cmi.iCol +'].jsonmap)' :
										'jQuery.jgrid.getAccessor(this,\''+r+'\')',
									rule.data,
									cmtypes[rule.field]);
							} else if (p.customSortOperations != null && p.customSortOperations[rule.op] != null && $.isFunction(p.customSortOperations[rule.op].filter)) {
								query = query.custom(rule.op, rule.field, rule.data);
							}
							s++;
						}
						if (ror) {
							query.orEnd();
						}
					} catch (g) {fatalErrorFunction(g);}
				}
			}
			if (p.search === true) {
				var srules = p.postData.filters;
				if(srules) {
					if(typeof srules === "string") { srules = jgrid.parse(srules);}
					tojLinq( srules );
				} else {
					try {
						query = compareFnMap[p.postData.searchOper](query)(p.postData.searchField, p.postData.searchString,cmtypes[p.postData.searchField]);
					} catch (ignore){}
				}
			}
			if(p.grouping) {
				for(gin=0; gin<lengrp;gin++) {
					query.orderBy(grindexes[gin],grpview.groupOrder[gin],grtypes[gin].stype, grtypes[gin].srcfmt);
				}
			}
			if(p.multiSort) {
				$.each(st,function(i){
					query.orderBy(this, sto[i], cmtypes[this].stype, cmtypes[this].srcfmt, cmtypes[this].sfunc);
				});
			} else {
				if (st && p.sortorder && fndsort) {
					if(p.sortorder.toUpperCase() === "DESC") {
						query.orderBy(p.sortname, "d", cmtypes[st].stype, cmtypes[st].srcfmt, cmtypes[st].sfunc);
					} else {
						query.orderBy(p.sortname, "a", cmtypes[st].stype, cmtypes[st].srcfmt, cmtypes[st].sfunc);
					}
				}
			}
			p.lastSelectedData = query.select();
			var recordsperpage = parseInt(p.rowNum,10),
			total = p.lastSelectedData.length,
			page = parseInt(p.page,10),
			totalpages = Math.ceil(total / recordsperpage),
			retresult = {};
			if((p.search || p.resetsearch) && p.grouping && p.groupingView._locgr) {
				p.groupingView.groups =[];
				var j, grPrepare = jgrid.getMethod("groupingPrepare"), key, udc;
				if(p.footerrow && p.userDataOnFooter) {
					for (key in p.userData) {
						if(p.userData.hasOwnProperty(key)) {
							p.userData[key] = 0;
						}
					}
					udc = true;
				}
				for(j=0; j<total; j++) {
					if(udc) {
						for(key in p.userData){
							if(p.userData.hasOwnProperty(key)) {
								p.userData[key] += parseFloat(p.lastSelectedData[j][key] || 0);
							}
						}
					}
					grPrepare.call($self,p.lastSelectedData[j],j, recordsperpage );
				}
			}
			query = null;
			cmtypes = null;
			var localReader = p.localReader;
			retresult[localReader.total] = totalpages;
			retresult[localReader.page] = page;
			retresult[localReader.records] = total;
			retresult[localReader.root] = p.lastSelectedData.slice((page-1)*recordsperpage, page*recordsperpage);
			retresult[localReader.userdata] = p.userData;
			return retresult;
		},
		setWidthOfPagerTdWithPager = function ($pgTable) {
			var self = this, w = $pgTable.outerWidth(), fontSize;
			if (w <= 0) { // not visible
				fontSize = $(self).closest(".ui-jqgrid>.ui-jqgrid-view").css("font-size") || "11px";
				$(document.body).append("<div id='testpg' class='ui-jqgrid ui-widget ui-widget-content' style='font-size:"+
					fontSize+
					";visibility:hidden;' ></div>");
				$($pgTable).clone().appendTo("#testpg");
				w = $("#testpg>.ui-pg-table").width();
				$("#testpg").remove();
			}
			if (w > 0) {
				$pgTable.parent().width(w);
			}
			return w;
		},
		updatepager = function(rn, dnd) {
			var self = this, $self = $(self), gridSelf = self.grid, cp, last, base, from, to, tot, fmt, pgboxes = p.pager || "", sppg,
			tspg = p.pager ? "_"+p.pager.substr(1) : "", bDiv = gridSelf.bDiv, numberFormat = $.fmatter ? $.fmatter.NumberFormat : null,
			tspgTop = p.toppager ? "_"+p.toppager.substr(1) : "";
			base = parseInt(p.page,10)-1;
			if(base < 0) { base = 0; }
			base = base*parseInt(p.rowNum,10);
			to = base + p.reccount;
			if (p.scroll) {
				var rows = $(getGridComponent("bTable", $(bDiv))[0].rows).slice(1);//$("tbody:first > tr:gt(0)", bDiv);
				base = to - rows.length;
				p.reccount = rows.length;
				var rh = rows.outerHeight() || gridSelf.prevRowHeight;
				if (rh) {
					var top = base * rh;
					var height = parseInt(p.records,10) * rh;
					$(bDiv).children("div").first().css({height : height + "px"})
						.children("div").first().css({height:top + "px",display:top + "px"?"":"none"});
					if (bDiv.scrollTop === 0 && p.page > 1) {
						bDiv.scrollTop = p.rowNum * (p.page - 1) * rh;
					}
				}
				bDiv.scrollLeft = gridSelf.hDiv.scrollLeft;
			}
			pgboxes += p.toppager ? (pgboxes ? ",": "") + p.toppager : "";
			if(pgboxes) {
				fmt = getRes("formatter.integer") || {};
				cp = intNum(p.page);
				last = intNum(p.lastpage);
				$(".selbox", pgboxes)[propOrAttr]("disabled", false);
				if(p.pginput===true) {
					$('.ui-pg-input',pgboxes).val(p.page);
					sppg = p.toppager ? '#sp_1'+tspg+",#sp_1"+tspgTop : '#sp_1'+tspg;
					$(sppg).html($.fmatter ? numberFormat(p.lastpage,fmt):p.lastpage)
						.closest(".ui-pg-table").each(function () {
							setWidthOfPagerTdWithPager.call(self, $(this));
						});
				}
				if (p.viewrecords){
					if(p.reccount === 0) {
						$(".ui-paging-info",pgboxes).html(getDef("emptyrecords"));
					} else {
						from = base+1;
						tot=p.records;
						if($.fmatter) {
							from = numberFormat(from,fmt);
							to = numberFormat(to,fmt);
							tot = numberFormat(tot,fmt);
						}
						$(".ui-paging-info",pgboxes).html(jgrid.format(getDef("recordtext"),from,to,tot));
					}
				}
				if(p.pgbuttons===true) {
					if(cp<=0) {cp = last = 0;}
					if(cp===1 || cp === 0) {
						$("#first"+tspg+", #prev"+tspg).addClass('ui-state-disabled').removeClass('ui-state-hover');
						if(p.toppager) { $("#first_t"+tspgTop+", #prev_t"+tspgTop).addClass('ui-state-disabled').removeClass('ui-state-hover'); }
					} else {
						$("#first"+tspg+", #prev"+tspg).removeClass('ui-state-disabled');
						if(p.toppager) { $("#first_t"+tspgTop+", #prev_t"+tspgTop).removeClass('ui-state-disabled'); }
					}
					if(cp===last || cp === 0) {
						$("#next"+tspg+", #last"+tspg).addClass('ui-state-disabled').removeClass('ui-state-hover');
						if(p.toppager) { $("#next_t"+tspgTop+", #last_t"+tspgTop).addClass('ui-state-disabled').removeClass('ui-state-hover'); }
					} else {
						$("#next"+tspg+", #last"+tspg).removeClass('ui-state-disabled');
						if(p.toppager) { $("#next_t"+tspgTop+", #last_t"+tspgTop).removeClass('ui-state-disabled'); }
					}
				}
			}
			if(rn===true && p.rownumbers === true) {
				$(">td.jqgrid-rownum",self.rows).each(function(i){
					$(this).html(base+1+i);
				});
			}
			if(dnd && p.jqgdnd) { $self.jqGrid('gridDnD','updateDnD');}
			feedback.call(self, "gridComplete");
			$self.triggerHandler("jqGridAfterGridComplete");
		},
		beginReq = function() {
			var self = this;
			self.grid.hDiv.loading = true;
			if(p.hiddengrid) { return;}
			$(self).jqGrid("progressBar", {method:"show", loadtype : p.loadui, htmlcontent: getDef("loadtext") });
		},
		endReq = function() {
			var self = this;
			self.grid.hDiv.loading = false;
			$(self).jqGrid("progressBar", {method:"hide", loadtype : p.loadui });
		},
		populate = function (npage) {
			var self = this, $self = $(self), gridSelf = self.grid;
			if(!gridSelf.hDiv.loading) {
				var pvis = p.scroll && npage === false,
				prm = {}, dt, dstr, pN=p.prmNames;
				if(p.page <=0) { p.page = Math.min(1,p.lastpage); }
				if(pN.search !== null) {prm[pN.search] = p.search;} if(pN.nd !== null) {prm[pN.nd] = new Date().getTime();}
				if (isNaN(parseInt(p.rowNum,10)) || parseInt(p.rowNum,10) <= 0) { p.rowNum = p.maxRowNum; }
				if(pN.rows !== null) {prm[pN.rows]= p.rowNum;} if(pN.page !== null) {prm[pN.page]= p.page;}
				if(pN.sort !== null) {prm[pN.sort]= p.sortname;} if(pN.order !== null) {prm[pN.order]= p.sortorder;}
				if(p.rowTotal !== null && pN.totalrows !== null) { prm[pN.totalrows]= p.rowTotal; }
				var lcf = $.isFunction(p.loadComplete), lc = lcf ? p.loadComplete : null;
				var adjust = 0;
				npage = npage || 1;
				if (npage > 1) {
					if(pN.npage !== null) {
						prm[pN.npage] = npage;
						adjust = npage - 1;
						npage = 1;
					} else {
						lc = function(req) {
							p.page++;
							gridSelf.hDiv.loading = false;
							if (lcf) {
								p.loadComplete.call(self,req);
							}
							populate.call(self,npage-1);
						};
					}
				} else if (pN.npage !== null) {
					delete p.postData[pN.npage];
				}
				if(p.grouping) {
					$self.jqGrid('groupingSetup');
					var grp = p.groupingView, gi, gs="", index, iColumn, cmValue;
					for(gi=0;gi<grp.groupField.length;gi++) {
						index = grp.groupField[gi];
						for (iColumn = 0; iColumn < p.colModel.length; iColumn++) {
							cmValue = p.colModel[iColumn];
							if (cmValue.name === index && cmValue.index){
								index = cmValue.index;
							}
						}
						gs += index +" "+grp.groupOrder[gi]+", ";
					}
					prm[pN.sort] = gs + prm[pN.sort];
				}
				$.extend(p.postData,prm);
				var rcnt = !p.scroll ? 1 : self.rows.length-1,
				fixDisplayingHorizontalScrollbar = function () {
					// if no items are displayed in the btable, but the column header is too wide
					// the horizontal scrollbar of bDiv will be disabled. The fix set CSS height to 1px
					// on btable in the case to fix the problem
					var gBodyWidth = $self.width(), gViewWidth = $self.closest(".ui-jqgrid-view").width(),
						gridCssHeight = $self.css("height");
					if (gViewWidth < gBodyWidth && p.reccount === 0) {
						$self.css("height", "1px");
					} else if (gridCssHeight !== "0" && gridCssHeight !== "0px") {
						$self.css("height", "");
					}
				},
				resort = function () {
					var iRes;
					if (p.autoresizeOnLoad) {
						$self.jqGrid("autoResizeAllColumns");
						clearArray(p.columnsToReResizing);
					} else {
						for (iRes = 0; iRes < p.columnsToReResizing.length; iRes++) {
							$self.jqGrid("autoResizeColumn", p.columnsToReResizing[iRes]);
						}
						clearArray(p.columnsToReResizing);
					}
				},
				finalReportSteps = function () {
					feedback.call(self, "loadComplete", dstr);
					resort();
					$self.triggerHandler("jqGridAfterLoadComplete", [dstr]);
					endReq.call(self);
					p.datatype = "local";
					p.datastr = null;
					fixScrollOffsetAndhBoxPadding.call(self);
					fixDisplayingHorizontalScrollbar();
				},
				finalReportVirtual = function (data) {
					$self.triggerHandler("jqGridLoadComplete", [data]);
					if(lc) { lc.call(self, data); }
					resort();
					$self.triggerHandler("jqGridAfterLoadComplete", [data]);
					if (pvis) { gridSelf.populateVisible.call(self); }
					if (npage === 1) { endReq.call(self); }
					fixScrollOffsetAndhBoxPadding.call(self);
					fixDisplayingHorizontalScrollbar();
				};
				if (!feedback.call(self, "beforeRequest")) { return; }
				if ($.isFunction(p.datatype)) { p.datatype.call(self,p.postData,"load_"+p.id, rcnt, npage, adjust); return;}
				dt = p.datatype.toLowerCase();
				switch(dt)
				{
				case "json":
				case "jsonp":
				case "xml":
				case "script":
					$.ajax($.extend({
						url:p.url,
						type:p.mtype,
						dataType: dt ,
						//data: $.isFunction(p.serializeGridData)? p.serializeGridData.call(self,p.postData) : p.postData,
						data: jgrid.serializeFeedback.call(ts, p.serializeGridData, "jqGridSerializeGridData", p.postData),
						success: function (data, textStatus, jqXHR) {
							if ($.isFunction(p.beforeProcessing)) {
								if (p.beforeProcessing.call(self, data, textStatus, jqXHR) === false) {
									endReq.call(self);
									return;
								}
							}
							if(dt === "xml") { addXmlData.call(self,data,rcnt,npage>1,adjust); }
							else { addJSONData.call(self,data,rcnt,npage>1,adjust); }
							finalReportVirtual(data);
							if (p.loadonce || p.treeGrid) {
								p.dataTypeOrg = p.datatype;
								p.datatype = "local";
							}
						},
						error: function (jqXHR, textStatus, errorThrown) {
							if($.isFunction(p.loadError)) { p.loadError.call(self,jqXHR,textStatus,errorThrown); }
							if (npage === 1) { endReq.call(self); }
						},
						beforeSend: function (jqXHR, settings) {
							var gotoreq = true;
							if($.isFunction(p.loadBeforeSend)) {
								gotoreq = p.loadBeforeSend.call(self,jqXHR, settings); 
							}
							if(gotoreq === undefined) { gotoreq = true; }
							if(gotoreq === false) {
								return false;
							}
							beginReq.call(self);
						}
					},jgrid.ajaxOptions, p.ajaxGridOptions));
				break;
				case "xmlstring":
					beginReq.call(self);
					dstr = typeof p.datastr === 'string' ? $.parseXML(p.datastr) : p.datastr;
					addXmlData.call(self,dstr);
					finalReportSteps();
				break;
				case "jsonstring":
					beginReq.call(self);
					dstr = typeof p.datastr === 'string' ? jgrid.parse(p.datastr) : p.datastr;
					addJSONData.call(self,dstr);
					finalReportSteps();
				break;
				case "local":
				case "clientside":
					beginReq.call(self);
					p.datatype = "local";
					var req = addLocalData.call(self);
					addJSONData.call(self,req,rcnt,npage>1,adjust);
					finalReportVirtual(req);
				break;
				}
			}
		},
		setHeadCheckBox = function (checked) {
		    var self = this, gridSelf = self.grid;
			$(p.cb,gridSelf.hDiv)[p.propOrAttr]("checked", checked);
			var fid = p.frozenColumns ? p.id+"_frozen" : "";
			if(fid) {
				$(p.cb,gridSelf.fhDiv)[p.propOrAttr]("checked", checked);
			}
		},
		setPager = function (pgid, tp){
			var sep = "<td class='ui-pg-button ui-state-disabled'><span class='ui-separator'></span></td>",
			pginp = "",
			blockAlign = p.pagerpos === "left" ? "margin-right:auto;" : (p.pagerpos === "right" ? "margin-left:auto;" : "margin-left:auto;margin-right:auto;"),
			pgl="<table "+(isMSIE7 ? "cellspacing='0' " : "")+"style='table-layout:auto;"+blockAlign+"' class='ui-pg-table'><tbody><tr>",
			str="", pgcnt, lft, cent, rgt, twd, i,
			clearVals = function(onpaging, newPage, newRowNum){
				if (!feedback.call(ts, "onPaging", onpaging, {
							newPage: newPage,
							currentPage: intNum(p.page,1),
							lastPage: intNum(p.lastpage,1),
							currentRowNum: intNum(p.rowNum,10),
							newRowNum: newRowNum
						})) {return false;}
				p.selrow = null;
				if(p.multiselect) {
					clearArray(p.selarrrow); // p.selarrrow = [];
					setHeadCheckBox.call(ts, false);
				}
				clearArray(p.savedRow); // p.savedRow = [];
				return true;
			};
			tp += "_" + pgid;
			pgcnt = "pg_"+pgid;
			lft = pgid+"_left"; cent = pgid+"_center"; rgt = pgid+"_right";
			$("#"+jqID(pgid) )
			.append("<div id='"+pgcnt+"' class='ui-pager-control' role='group'><table "+(isMSIE7 ? "cellspacing='0' " : "")+"class='ui-pg-table' style='width:100%;table-layout:fixed;height:100%;'><tbody><tr><td id='"+lft+"' style='text-align:left;'></td><td id='"+cent+"' style='text-align:center;white-space:pre;'></td><td id='"+rgt+"' style='text-align:right;'></td></tr></tbody></table></div>")
			.attr("dir","ltr"); //explicit setting
			pgcnt = "#" + jqID(pgcnt); // modify to id selector
			if(p.rowList.length >0){
				str = "<td dir='"+dir+"'>";
				var pgrecs = getDef("pgrecs");
				str +="<select class='ui-pg-selbox' role='listbox' " + (pgrecs ? "title='"+pgrecs +"'" : "")+ ">";
				var strnm;
				for(i=0;i<p.rowList.length;i++){
					strnm = p.rowList[i].toString().split(":");
					if(strnm.length === 1) {
						strnm[1] = strnm[0];
					}
					str +="<option role=\"option\" value=\""+strnm[0]+"\""+(( intNum(p.rowNum,0) === intNum(strnm[0],0))?" selected=\"selected\"":"")+">"+strnm[1]+"</option>";
				}
				str +="</select></td>";
			}
			if(dir==="rtl") { pgl += str; }
			if(p.pginput===true) { pginp= "<td dir='"+dir+"'>"+jgrid.format(getDef("pgtext") || "","<input class='ui-pg-input' type='text' size='2' maxlength='7' value='0' role='textbox'/>","<span id='sp_1_"+pgid+"'>0</span>")+"</td>";}
			pgid = "#"+jqID(pgid); // modify to id selector
			if(p.pgbuttons===true) {
				var po=["first"+tp,"prev"+tp, "next"+tp,"last"+tp],
					pgfirst = getDef("pgfirst"),
					pgprev = getDef("pgprev"),
					pgnext = getDef("pgnext"),
					pglast = getDef("pglast");
				if(dir==="rtl") { po.reverse(); }
				pgl += "<td id='"+po[0]+"' class='ui-pg-button ui-corner-all' " + (pgfirst ? "title='"+pgfirst +"'" : "")+"><span class='" + getIcon("pager.first") + "'></span></td>";
				pgl += "<td id='"+po[1]+"' class='ui-pg-button ui-corner-all' " + (pgprev ? "title='"+pgprev +"'" : "")+"><span class='" + getIcon("pager.prev") + "'></span></td>";
				pgl += pginp !== "" ? sep+pginp+sep:"";
				pgl += "<td id='"+po[2]+"' class='ui-pg-button ui-corner-all' " + (pgnext ? "title='"+pgnext +"'" : "")+"><span class='" + getIcon("pager.next") + "'></span></td>";
				pgl += "<td id='"+po[3]+"' class='ui-pg-button ui-corner-all' " + (pglast ? "title='"+pglast +"'" : "")+"><span class='" + getIcon("pager.last") + "'></span></td>";
			} else if (pginp !== "") { pgl += pginp; }
			if(dir==="ltr") { pgl += str; }
			pgl += "</tr></tbody></table>";
			if(p.viewrecords===true) {$("td"+pgid+"_"+p.recordpos,pgcnt).append("<div dir='"+dir+"' style='text-align:"+p.recordpos+"' class='ui-paging-info'></div>");}
			var $pagerIn = $("td"+pgid+"_"+p.pagerpos,pgcnt);
			$pagerIn.append(pgl);
			twd = setWidthOfPagerTdWithPager.call(this, $pagerIn.children(".ui-pg-table"));
			p._nvtd = [];
			p._nvtd[0] = twd ? Math.floor((p.width - twd)/2) : Math.floor(p.width/3);
			p._nvtd[1] = 0;
			pgl=null;
			$('.ui-pg-selbox',pgcnt).bind('change',function() {
				var newRowNum = intNum(this.value, 10),
					newPage = Math.round(p.rowNum*(p.page-1)/newRowNum-0.5)+1;
				if(!clearVals('records', newPage, newRowNum)) { return false; }
				p.page = newPage;
				p.rowNum = newRowNum;
				if(p.pager) { $('.ui-pg-selbox',p.pager).val(newRowNum); }
				if(p.toppager) { $('.ui-pg-selbox',p.toppager).val(newRowNum); }
				populate.call(ts);
				return false;
			});
			if(p.pgbuttons===true) {
			$(".ui-pg-button",pgcnt).hover(function(){
				if($(this).hasClass('ui-state-disabled')) {
					this.style.cursor='default';
				} else {
					$(this).addClass('ui-state-hover');
					this.style.cursor='pointer';
				}
			},function() {
				if(!$(this).hasClass('ui-state-disabled')) {
					$(this).removeClass('ui-state-hover');
					this.style.cursor= "default";
				}
			});
			$("#first"+jqID(tp)+", #prev"+jqID(tp)+", #next"+jqID(tp)+", #last"+jqID(tp)).click( function() {
				if ($(this).hasClass("ui-state-disabled")) {
					return false;
				}
				var cp = intNum(p.page,1), newPage = cp, onpaging = this.id,
				last = intNum(p.lastpage,1), selclick = false,
				fp=true, pp=true, np=true,lp=true;
				if(last ===0 || last===1) {fp=false;pp=false;np=false;lp=false; }
				else if( last>1 && cp >=1) {
					if( cp === 1) { fp=false; pp=false; }
					//else if( cp>1 && cp <last){ }
					else if( cp===last){ np=false;lp=false; }
				} else if( last>1 && cp===0 ) { np=false;lp=false; cp=last-1;}
				if( this.id === 'first'+tp && fp ) { onpaging = 'first'; newPage=1; selclick=true;}
				if( this.id === 'prev'+tp && pp) { onpaging = 'prev'; newPage=(cp-1); selclick=true;}
				if( this.id === 'next'+tp && np) { onpaging = 'next'; newPage=(cp+1); selclick=true;}
				if( this.id === 'last'+tp && lp) { onpaging = 'last'; newPage=last; selclick=true;}
				if(!clearVals(onpaging, newPage, intNum(p.rowNum,10))) { return false; }
				p.page = newPage;
				if(selclick) {
					populate.call(ts);
				}
				return false;
			});
			}
			if(p.pginput===true) {
			$('input.ui-pg-input',pgcnt).keypress( function(e) {
				var key = e.charCode || e.keyCode || 0, newPage = intNum($(this).val(), 1);
				if(key === 13) {
					if(!clearVals('user', newPage, intNum(p.rowNum,10))) { return false; }
					$(this).val(newPage);
					p.page = ($(this).val()>0) ? $(this).val():p.page;
					populate.call(ts);
					return false;
				}
				return this;
			});
			}
		},
		multiSort = function(iCol, obj ) {
			var splas, sort = "", colModel = p.colModel, cm = colModel[iCol], fs = false, so = "",
				$selTh = p.frozenColumns ? $(obj) : $(ts.grid.headers[iCol].el),
				$iconsSpan = $selTh.find("span.s-ico"),
				$iconAsc = $iconsSpan.children("span.ui-icon-asc"),
				$iconDesc = $iconsSpan.children("span.ui-icon-desc"),
				$iconsActive = $iconAsc, $iconsInictive = $iconDesc;

			$selTh.find("span.ui-grid-ico-sort").addClass("ui-state-disabled"); // for both icons
			$selTh.attr("aria-selected", "false");

			// first set new value of lso:
			// "asc" -> "asc-desc", new sorting to "desc"
			// "desc" -> "desc-asc", new sorting to "desc"
			// "asc-desc" or "desc-asc" -> "", no new sorting ""
			// "" -> cm.firstsortorder || "asc"
			if (cm.lso) {
				if (cm.lso === "asc") {
					cm.lso += "-desc";
					so = "desc";
					$iconsActive = $iconDesc;
					$iconsInictive = $iconAsc;
				} else if (cm.lso === "desc") {
					cm.lso += "-asc";
					so = "asc";
				} else if (cm.lso === "asc-desc" || cm.lso === "desc-asc") {
					cm.lso = "";
					if (!p.viewsortcols[0]) {
						$iconsSpan.hide();
					}
				}
			} else {
				cm.lso = so = cm.firstsortorder || "asc";
				$iconsActive = $iconAsc;
				$iconsInictive = $iconDesc;
			}

			if (so) {
				$iconsSpan.show();
				$iconsActive.removeClass("ui-state-disabled").css("display", ""); // show;
				if (p.showOneSortIcon) {
					$iconsInictive.hide();
				}
				$selTh.attr("aria-selected", "true");
			}
			p.sortorder = "";
			$.each(colModel, function(i){
				if(this.lso) {
					if(i>0 && fs) {
						sort += ", ";
					}
					splas = this.lso.split("-");
					sort += colModel[i].index || colModel[i].name;
					sort += " "+splas[splas.length-1];
					fs = true;
					p.sortorder = splas[splas.length-1];
				}
			});
			sort = sort.substring(0, sort.lastIndexOf(p.sortorder));
			p.sortname = sort;
		},
		sortData = function (index, idxcol,reload,sor, obj){
			var self = this, mygrid = self.grid;
			if(!p.colModel[idxcol].sortable) { return; }
			if(p.savedRow.length > 0) {return;}
			if(!reload) {
				if( p.lastsort === idxcol && p.sortname !== "" ) {
					if( p.sortorder === 'asc') {
						p.sortorder = 'desc';
					} else if(p.sortorder === 'desc') { p.sortorder = 'asc';}
				} else { p.sortorder = p.colModel[idxcol].firstsortorder || 'asc'; }
				p.page = 1;
			}
			if(p.multiSort) {
				multiSort( idxcol, obj);
			} else {
				if(sor) {
					if(p.lastsort === idxcol && p.sortorder === sor && !reload) { return; }
					p.sortorder = sor;
				}
				var headers = mygrid.headers, fhDiv = mygrid.fhDiv,
					$previousSelectedTh = headers[p.lastsort] ? $(headers[p.lastsort].el) : $(),
					$newSelectedTh = p.frozenColumns ? $(obj) : $(headers[idxcol].el),
					$iconsSpan = $newSelectedTh.find("span.s-ico"), cm = p.colModel[p.lastsort],
					$iconsActive = $iconsSpan.children("span.ui-icon-" + p.sortorder),
					$iconsInictive = $iconsSpan.children("span.ui-icon-" + (p.sortorder === "asc" ? "desc" : "asc"));

				$previousSelectedTh.find("span.ui-grid-ico-sort").addClass("ui-state-disabled");
				$previousSelectedTh.attr("aria-selected", "false");
				if (p.frozenColumns) {
					fhDiv.find("span.ui-grid-ico-sort").addClass("ui-state-disabled");
					fhDiv.find("th").attr("aria-selected", "false");
				}
				$iconsActive.removeClass("ui-state-disabled").css("display", ""); // show
				if (p.showOneSortIcon) {
					$iconsInictive.removeClass("ui-state-disabled").hide();
				}
				$newSelectedTh.attr("aria-selected","true");
				if(!p.viewsortcols[0]) {
					if(p.lastsort !== idxcol) {
						if(p.frozenColumns){
							fhDiv.find("span.s-ico").hide();
						}
						$previousSelectedTh.find("span.s-ico").hide();
						$iconsSpan.show();
					} else if (p.sortname === "") { // if p.lastsort === idxcol but p.sortname === ""
						$iconsSpan.show();
					}
				}
				if (p.lastsort !== idxcol) {
					if ($previousSelectedTh.data("autoResized") === "true" &&
							((cm != null && cm.autoResizing != null && cm.autoResizing.compact) ||
								p.autoResizing.compact)) {
						// recalculate the width of the column after removing sort icon
						//$(self).jqGrid("autoResizeColumn", p.lastsort);
						p.columnsToReResizing.push(p.lastsort);
					}
				}
				if (p.lastsort !== idxcol && $newSelectedTh.data("autoResized") === "true") {
					cm = p.colModel[idxcol];
					if ((cm != null && cm.autoResizing != null && cm.autoResizing.compact) ||
							p.autoResizing.compact) {
						// recalculate the width of the column after removing sort icon
						p.columnsToReResizing.push(idxcol);
						//$(self).jqGrid("autoResizeColumn", idxcol);
					}
				}
				// the index looks like "jqgh_" + p.id + "_" + colIndex (like "jqgh_list_invdate")
				index = index.substring(5 + p.id.length + 1); // bad to be changed!?!
				p.sortname = p.colModel[idxcol].index || index;
			}
			if (!feedback.call(self, "onSortCol", p.sortname, idxcol, p.sortorder)) {
				p.lastsort = idxcol;
				return;
			}
			if(p.datatype === "local") {
				if(p.deselectAfterSort) {$(self).jqGrid("resetSelection");}
			} else {
				p.selrow = null;
				if(p.multiselect){setHeadCheckBox.call(self, false);}
				clearArray(p.selarrrow); //p.selarrrow =[];
				clearArray(p.savedRow); //p.savedRow =[];
			}
			if(p.scroll) {
				var sscroll = mygrid.bDiv.scrollLeft;
				emptyRows.call(self, true, false);
				mygrid.hDiv.scrollLeft = sscroll;
			}
			if(p.subGrid && p.datatype === 'local') {
				$("td.sgexpanded","#"+jqID(p.id)).each(function(){
					$(this).trigger("click");
				});
			}
			populate.call(self);
			p.lastsort = idxcol;
			if(p.sortname !== index && idxcol) {p.lastsort = idxcol;}
		},
		setColWidth = function () {
			var initwidth = 0, brd=jgrid.cell_width? 0: intNum(p.cellLayout,0), vc=0, lvc, scw=intNum(p.scrollOffset,0),cw,hs=false,aw,gw=0,cr;
			$.each(p.colModel, function() {
				if(this.hidden === undefined) {this.hidden=false;}
				if(p.grouping && p.autowidth) {
					var ind = $.inArray(this.name, p.groupingView.groupField);
					if(ind >= 0 && p.groupingView.groupColumnShow.length > ind) {
						this.hidden = !p.groupingView.groupColumnShow[ind];
					}
				}
				this.widthOrg = cw = intNum(this.width,0);
				if(this.hidden===false){
					initwidth += cw+brd;
					if(this.fixed) {
						gw += cw+brd;
					} else {
						vc++;
					}
				}
			});
			if(isNaN(p.width)) {
				p.width  = initwidth + ((p.shrinkToFit ===false && !isNaN(p.height)) ? scw : 0);
			}
			grid.width = p.width;
			p.tblwidth = initwidth;
			if(p.shrinkToFit ===false && p.forceFit === true) {p.forceFit=false;}
			if(p.shrinkToFit===true && vc > 0) {
				aw = grid.width-brd*vc-gw;
				if(!isNaN(p.height)) {
					aw -= scw;
					hs = true;
				}
				initwidth =0;
				$.each(p.colModel, function(i) {
					if(this.hidden === false && !this.fixed){
						cw = Math.round(aw*this.width/(p.tblwidth-brd*vc-gw));
						this.width =cw;
						initwidth += cw;
						lvc = i;
					}
				});
				cr =0;
				if (hs) {
					if(grid.width-gw-(initwidth+brd*vc) !== scw){
						cr = grid.width-gw-(initwidth+brd*vc)-scw;
					}
				} else if(!hs && Math.abs(grid.width-gw-(initwidth+brd*vc)) !== 1) {
					cr = grid.width-gw-(initwidth+brd*vc);
				}
				p.colModel[lvc].width += cr;
				p.tblwidth = initwidth+cr+brd*vc+gw;
				if(p.tblwidth > p.width) {
					p.colModel[lvc].width -= (p.tblwidth - parseInt(p.width,10));
					p.tblwidth = p.width;
				}
			}
		},
		nextVisible= function(iCol) {
			var ret = iCol, j=iCol, i;
			for (i = iCol+1;i<p.colModel.length;i++){
				if(p.colModel[i].hidden !== true ) {
					j=i; break;
				}
			}
			return j-ret;
		},
		getOffset = function (iCol) {
			var $th = $(ts.grid.headers[iCol].el), ret = [$th.position().left + $th.outerWidth()];
			if(p.direction==="rtl") { ret[0] = p.width - ret[0]; }
			ret[0] -= ts.grid.bDiv.scrollLeft;
			ret.push($(ts.grid.hDiv).position().top);
			ret.push($(ts.grid.bDiv).offset().top - $(ts.grid.hDiv).offset().top + $(ts.grid.bDiv).height());
			return ret;
		},
		getColumnHeaderIndex = function (th) {
			var i, headers = ts.grid.headers, ci = getCellIndex(th);
			for (i = 0; i < headers.length; i++) {
				if (th === headers[i].el) {
					ci = i;
					break;
				}
			}
			return ci;
		},
		colTemplate;
		if ($.inArray(p.multikey,sortkeys) === -1 ) {p.multikey = false;}
		p.keyName=false;
		p.sortorder = p.sortorder.toLowerCase();
		jgrid.cell_width = jgrid.cellWidth();
		var jgridCmTemplate = jgrid.cmTemplate;
		for (iCol=0; iCol<p.colModel.length;iCol++) {
			colTemplate = typeof p.colModel[iCol].template === "string" ?
				(jgridCmTemplate != null && (typeof jgridCmTemplate[p.colModel[iCol].template] === "object" || typeof jgridCmTemplate[p.colModel[iCol].template] === "function") ?
					jgridCmTemplate[p.colModel[iCol].template]: {}) :
				p.colModel[iCol].template;
			if ($.isFunction(colTemplate)) {
				colTemplate = colTemplate.call(ts, {cm: p.colModel[iCol], iCol: iCol});
			}
			p.colModel[iCol] = $.extend(true, {}, p.cmTemplate, colTemplate || {}, p.colModel[iCol]);
			if (p.keyName === false && p.colModel[iCol].key===true) {
				p.keyName = p.colModel[iCol].name;
			}
		}
		if(p.grouping===true) {
			p.scroll = false;
			p.rownumbers = false;
			//p.subGrid = false; expiremental
			p.treeGrid = false;
			p.gridview = true;
		}
		if(p.treeGrid === true) {
			try { $(ts).jqGrid("setTreeGrid");} catch (ignore) {}
			if(p.datatype !== "local") { p.localReader = {id: "_id_"};	}
		}
		if(p.subGrid) {
			try { $(ts).jqGrid("setSubGrid");} catch (ignore){}
		}
		if(p.multiselect) {
			p.colNames.unshift("<input role='checkbox' id='"+p.cbId+"' class='cbox' type='checkbox' aria-checked='false'/>");
			p.colModel.unshift({name:'cb',width:jgrid.cell_width ? p.multiselectWidth+p.cellLayout : p.multiselectWidth,labelClasses:"jqgh_cbox",classes:"td_cbox",sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true});
		}
		if(p.rownumbers) {
			p.colNames.unshift("");
			p.colModel.unshift({name:'rn',width:jgrid.cell_width ? p.rownumWidth+p.cellLayout : p.rownumWidth,labelClasses:"jqgh_rn",classes:"td_rn",sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true});
		}
		p.xmlReader = $.extend(true,{
			root: "rows",
			row: "row",
			page: "rows>page",
			total: "rows>total",
			records : "rows>records",
			repeatitems: true,
			cell: "cell",
			id: "[id]",
			userdata: "userdata",
			subgrid: {root:"rows", row: "row", repeatitems: true, cell:"cell"}
		}, p.xmlReader);
		p.jsonReader = $.extend(true,{
			root: "rows",
			page: "page",
			total: "total",
			records: "records",
			repeatitems: true,
			cell: "cell",
			id: "id",
			userdata: "userdata",
			subgrid: {root:"rows", repeatitems: true, cell:"cell"}
		},p.jsonReader);
		p.localReader = $.extend(true,{
			root: "rows",
			page: "page",
			total: "total",
			records: "records",
			repeatitems: false,
			cell: "cell",
			id: "id",
			userdata: "userdata",
			subgrid: {root:"rows", repeatitems: true, cell:"cell"}
		},p.localReader);
		if(p.scroll){
			p.pgbuttons = false; p.pginput=false; p.rowList=[];
		}
		if(p.data.length) { normalizeData.call(ts); refreshIndex(); }
		var thead = "<thead><tr class='ui-jqgrid-labels' role='row'>",
		tdc, idn, w, res, sort, cmi, tooltip, labelStyle,
		td, ptr, tbody, imgs,iac="",idc="",sortarr=[], sortord=[], sotmp=[];
		if(p.shrinkToFit===true && p.forceFit===true) {
			for (iCol=p.colModel.length-1;iCol>=0;iCol--){
				if(p.colModel[iCol].hidden !== true) {
					p.colModel[iCol].resizable=false;
					break;
				}
			}
		}
		if(p.viewsortcols[1] === 'horizontal') {iac=" ui-i-asc";idc=" ui-i-desc";}
		tdc = isMSIE ?  "ui-th-div-ie" :"";
		imgs = "<span class='s-ico' style='display:none'><span class='ui-grid-ico-sort ui-icon-asc"+iac+" ui-state-disabled " + getIcon("sort.asc") + " ui-sort-"+dir+"'></span>";
		imgs += "<span class='ui-grid-ico-sort ui-icon-desc"+idc+" ui-state-disabled " + getIcon("sort.desc") + " ui-sort-"+dir+"'></span></span>";
		if(p.multiSort) {
			sortarr = p.sortname.split(",");
			var iSort;
			for (iSort=0; iSort<sortarr.length; iSort++) {
				sotmp = $.trim(sortarr[iSort]).split(" ");
				sortarr[iSort] = $.trim(sotmp[0]);
				sortord[iSort] = sotmp[1] ? $.trim(sotmp[1]) : p.sortorder || "asc";
			}
		}
		for(iCol=0;iCol<p.colNames.length;iCol++){
			cmi = p.colModel[iCol];
			tooltip = p.headertitles ? (" title=\""+stripHtml(p.colNames[iCol])+"\"") :"";
			thead += "<th id='"+p.id+"_"+cmi.name+"' role='columnheader' class='ui-state-default ui-th-column ui-th-"+dir+"'"+ tooltip+">";
			idn = cmi.index || cmi.name;
			switch (cmi.labelAlign) {
				case "left":
					labelStyle = "text-align:left;";
					break;
				case "right":
					labelStyle = "text-align:right;" + (cmi.sortable === false ? "" : "padding-right:" + p.autoResizing.widthOfVisiblePartOfSortIcon + "px;");
					break;
				case "likeData":
					labelStyle = cmi.align === undefined || cmi.align === "left" ? 
							"text-align:left;" :
							(cmi.align === "right" ? "text-align:right;" + (cmi.sortable === false ? "" : "padding-right:" + p.autoResizing.widthOfVisiblePartOfSortIcon + "px;") : "");
					break;
				default:
					labelStyle = "";
			}
			thead += "<div id='jqgh_"+p.id+"_"+cmi.name+"'" +
				(tdc === "" && !cmi.labelClasses ? "" : " class='" + (tdc !== "" ? tdc + " " : "") + (cmi.labelClasses || "") + "'") +
				(labelStyle === "" ? "" : " style='" + labelStyle + "'") +
				">"+
				(cmi.autoResizable && cmi.formatter !== "actions" ?
					"<span class='" + p.autoResizing.wrapperClassName + "'>" + p.colNames[iCol] + "</span>":
					p.colNames[iCol]);
			if(!cmi.width)  { cmi.width = 150; }
			else { cmi.width = parseInt(cmi.width,10); }
			if(typeof cmi.title !== "boolean") { cmi.title = true; }
			cmi.lso = "";
			if (idn === p.sortname) {
				p.lastsort = iCol;
			}
			if(p.multiSort) {
				sotmp = $.inArray(idn,sortarr);
				if( sotmp !== -1 ) {
					cmi.lso = sortord[sotmp];
				}
			}
			thead += imgs+"</div></th>";
		}
		thead += "</tr></thead>";
		imgs = null;
		$(ts).append(thead);
		$(ts.tHead).children("tr").children("th").hover(function(){$(this).addClass('ui-state-hover');},function(){$(this).removeClass('ui-state-hover');});
		if(p.multiselect) {
			var emp=[], chk;
			$(p.cb,ts).bind('click',function(){
				clearArray(p.selarrrow); // p.selarrrow = [];
				var froz = p.frozenColumns === true ? p.id + "_frozen" : "";
				if (this.checked) {
					$(ts.rows).each(function(i) {
						if (i>0) {
							if(!$(this).hasClass("ui-subgrid") &&
									!$(this).hasClass("jqgroup") &&
									!$(this).hasClass('ui-state-disabled') &&
									!$(this).hasClass("jqfoot")){
								$("#jqg_"+jqID(p.id)+"_"+jqID(this.id) )[p.propOrAttr]("checked",true);
								$(this).addClass("ui-state-highlight").attr("aria-selected","true");  
								p.selarrrow.push(this.id);
								p.selrow = this.id;
								if(froz) {
									$("#jqg_"+jqID(p.id)+"_"+jqID(this.id), ts.grid.fbDiv )[p.propOrAttr]("checked",true);
									$("#"+jqID(this.id), ts.grid.fbDiv).addClass("ui-state-highlight");
								}
							}
						}
					});
					chk=true;
					emp=[];
				}
				else {
					$(ts.rows).each(function(i) {
						if(i>0) {
							if(!$(this).hasClass("ui-subgrid") &&
									!$(this).hasClass("jqgroup") &&
									!$(this).hasClass('ui-state-disabled') &&
									!$(this).hasClass("jqfoot") &&
									jgrid.detectRowEditing.call(ts, this.id) === null){
								$("#jqg_"+jqID(p.id)+"_"+jqID(this.id) )[p.propOrAttr]("checked", false);
								$(this).removeClass("ui-state-highlight").attr("aria-selected","false");
								emp.push(this.id);
								if(froz) {
									$("#jqg_"+jqID(p.id)+"_"+jqID(this.id), ts.grid.fbDiv )[p.propOrAttr]("checked",false);
									$("#"+jqID(this.id), ts.grid.fbDiv).removeClass("ui-state-highlight");
								}
							}
						}
					});
					p.selrow = null;
					chk=false;
				}
				feedback.call(ts, "onSelectAll", chk ? p.selarrrow : emp, chk);
			});
		}

		if(p.autowidth===true) {
			var pw = $(eg).innerWidth();
			p.width = pw > 0?  pw: 'nw';
		}
		p.widthOrg = p.width;
		setColWidth();
		$(eg).css("width",grid.width+"px").append("<div class='ui-jqgrid-resize-mark' id='"+p.rsId+"'>&#160;</div>");
		$(p.rs).bind("selectstart", function () {
			return false;
		})
		.click(myResizerClickHandler).dblclick(function (e) {
		    var iColIndex = $(this).data("idx"),
                pageX = $(this).data("pageX"),
                cm = p.colModel[iColIndex];

			if (pageX == null) {
				return false;
			}
			var arPageX = String(pageX).split(";"),
                pageX1 = parseFloat(arPageX[0]),
                pageX2 = parseFloat(arPageX[1]);
			if (arPageX.length === 2 && (Math.abs(pageX1-pageX2) > 5 || Math.abs(e.pageX-pageX1) > 5 || Math.abs(e.pageX-pageX2) > 5)) {
				return false;
			}
			if (feedback.call(ts, "resizeDblClick", iColIndex, cm, e) && cm != null && cm.autoResizable) {
				$(ts).jqGrid("autoResizeColumn", iColIndex);
			}

			return false; // stop propagate
		});
		$(gv).css("width",grid.width+"px");
		var	tfoot = "";
		if(p.footerrow) { tfoot += "<table role='presentation' style='width:"+p.tblwidth+"px' class='ui-jqgrid-ftable'"+(isMSIE7 ? " cellspacing='0'" : "")+"><tbody><tr role='row' class='ui-widget-content footrow footrow-"+dir+"'>"; }
		var firstr = "<tr class='jqgfirstrow' role='row' style='height:auto'>";
		p.disableClick=false;
		$("th",ts.tHead.rows[0]).each(function (j) {
			var cm = p.colModel[j], nm = cm.name, $th = $(this),
				$sortableDiv = $th.children("div"),
				$iconsSpan = $sortableDiv.children("span.s-ico"),
				showOneSortIcon = p.showOneSortIcon;
			
			w = cm.width;
			if(cm.resizable === undefined) {cm.resizable = true;}
			if(cm.resizable){
				res = document.createElement("span");
				$(res).html("&#160;")
					.addClass('ui-jqgrid-resize ui-jqgrid-resize-'+dir)
					//.css("cursor","col-resize")
					.bind("selectstart", function () {
						return false;
					});
				$th.addClass(p.resizeclass);
			} else {
				res = "";
			}
			$th.css("width", w + "px")
				.prepend(res);
			res = null;
			var hdcol = "";
			if(cm.hidden === true) {
				$th.css("display","none");
				hdcol = "display:none;";
			}
			firstr += "<td role='gridcell' style='height:0;width:"+w+"px;"+hdcol+"'></td>";
			grid.headers[j] = { width: w, el: this };
			sort = cm.sortable;
			if (typeof sort !== 'boolean') {cm.sortable = true; sort=true;}
			if (!(nm === 'cb' || nm === 'subgrid' || nm === 'rn') && sort) {
				if(p.viewsortcols[2]){
					// class ui-jqgrid-sortable changes the cursor in 
					$sortableDiv.addClass('ui-jqgrid-sortable');
				}
			}
			if(sort) {
				if(p.multiSort) {
					var notLso = cm.lso === "desc" ? "asc" : "desc";
					if (p.viewsortcols[0]) {
						$iconsSpan.show(); 
						if (cm.lso) { 
							$iconsSpan.children("span.ui-icon-"+cm.lso).removeClass("ui-state-disabled");
							if (showOneSortIcon) {
								$iconsSpan.children("span.ui-icon-"+notLso).hide();
							}
						}
					} else if (cm.lso) {
						$iconsSpan.show();
						$iconsSpan.children("span.ui-icon-"+cm.lso).removeClass("ui-state-disabled");
						if (showOneSortIcon) {
							$iconsSpan.children("span.ui-icon-"+notLso).hide();
						}
					}
				} else {
					var notSortOrder = p.sortorder === "desc" ? "asc" : "desc";
					if (p.viewsortcols[0]) {
						$iconsSpan.show();
						if (j===p.lastsort) {
							$iconsSpan.children("span.ui-icon-"+p.sortorder).removeClass("ui-state-disabled");
							if (showOneSortIcon) {
								$iconsSpan.children("span.ui-icon-"+notSortOrder).hide();
							}
						}
					} else if (j === p.lastsort && p.sortname !== "") {
						$iconsSpan.show();
						$iconsSpan.children("span.ui-icon-"+p.sortorder).removeClass("ui-state-disabled");
						if (showOneSortIcon) {
							$iconsSpan.children("span.ui-icon-"+notSortOrder).hide();
						}
					}
				}
			}
			if(p.footerrow) { tfoot += "<td role='gridcell' "+formatCol(j,0,'', null, '', false)+">&#160;</td>"; }
		})
		.mousedown(function(e) {
			if ($(e.target).closest("th>span.ui-jqgrid-resize").length !== 1) { return; }
			var ci = getColumnHeaderIndex(this);
			if(p.forceFit===true) {p.nv= nextVisible(ci);}
			grid.dragStart(ci, e, getOffset(ci));
			return false;
		})
		.click(function(e) {
			if (p.disableClick) {
				p.disableClick = false;
				return false;
			}
			var s = "th.ui-th-column>div",r,d;
			if (!p.viewsortcols[2]) {
				s += ">span.s-ico>span.ui-grid-ico-sort"; // sort only on click on sorting icon
			} else {
				s += ".ui-jqgrid-sortable";
			}
			var t = $(e.target).closest(s);
			if (t.length !== 1) { return; }
			var ci;
			if(p.frozenColumns) {
				var tid =  $(this)[0].id.substring( p.id.length + 1 );
				$(p.colModel).each(function(i){
					if (this.name === tid) {
						ci = i;
						return false;
					}
				});
			} else {
				ci = getColumnHeaderIndex(this);
			}
			if (!p.viewsortcols[2]) {
				r = true;
				d = t.hasClass("ui-icon-desc") ? "desc" : "asc";
			}
			if(ci != null){
				sortData.call(ts, $('div',this)[0].id, ci, r, d, this);
			}
			return false;
		});
		if (p.sortable && $.fn.sortable) {
			try {
				$(ts).jqGrid("sortableColumns", $(ts.tHead.rows[0]));
			} catch (ignore){}
		}
		if(p.footerrow) { tfoot += "</tr></tbody></table>"; }
		firstr += "</tr>";
		tbody = document.createElement("tbody");
		ts.appendChild(tbody);
		$(ts).addClass('ui-jqgrid-btable').append(firstr);
		firstr = null;
		var hTable = $("<table class='ui-jqgrid-htable' style='width:"+p.tblwidth+"px' role='presentation' aria-labelledby='gbox_"+p.id+"'"+(isMSIE7 ? " cellspacing='0'" : "")+"></table>").append(ts.tHead),
		hg = (p.caption && p.hiddengrid===true) ? true : false,
		hb = $("<div class='ui-jqgrid-hbox" + (dir==="rtl" ? "-rtl" : "" )+"'></div>");
		grid.hDiv = document.createElement("div");
		$(grid.hDiv)
			.css({ width: grid.width+"px"})
			.addClass("ui-state-default ui-jqgrid-hdiv")
			.append(hb);
		$(hb).append(hTable);
		hTable = null;
		if(hg) { $(grid.hDiv).hide(); }
		p.rowNum = parseInt(p.rowNum, 10);
		if (isNaN(p.rowNum) || p.rowNum <= 0) {
			p.rowNum = p.maxRowNum;
		}
		if(p.pager){
			// see http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
			// or http://api.jquery.com/id-selector/ or http://api.jquery.com/category/selectors/
			// about the requirement to escape characters like '.', ':' or some other in case.
			var $pager, pagerId;
			if (typeof p.pager === "string" && p.pager.substr(0,1) !== "#") {
				pagerId = p.pager; // UNESCAPED id of the pager
				$pager = $("#" + jqID(p.pager));
			} else if (p.pager === true) {
				pagerId = randId();
				$pager = $("<div id='" + pagerId + "'></div>");
				$pager.appendTo("body");
				p.pager = "#" + jqID(pagerId);
			} else {
				$pager = $(p.pager); // jQuery wrapper or ESCAPED id selector
				pagerId = $pager.attr("id");
			}
			if ($pager.length > 0) {
				$pager.css({width: grid.width+"px"}).addClass('ui-state-default ui-jqgrid-pager ui-corner-bottom').appendTo(eg);
				if(hg) {$pager.hide();}
				setPager.call(ts, pagerId, '');
				p.pager = "#" + jqID(pagerId); // hold ESCAPED id selector in the pager
			} else {
				p.pager = ""; // clear wrong value of the pager option
			}
		}
		if( p.cellEdit === false && p.hoverrows === true) {
			$(ts).bind('mouseover',function(e) {
				ptr = $(e.target).closest("tr.jqgrow");
				if($(ptr).attr("class") !== "ui-subgrid") {
					$(ptr).addClass("ui-state-hover");
				}
			}).bind('mouseout',function(e) {
				ptr = $(e.target).closest("tr.jqgrow");
				$(ptr).removeClass("ui-state-hover");
			});
		}
		var ri,ci, tdHtml;
		$(ts).before(grid.hDiv).click(function(e) {
			td = e.target;
			ptr = $(td,ts.rows).closest("tr.jqgrow");
			if($(ptr).length === 0 || ptr[0].className.indexOf( 'ui-state-disabled' ) > -1 || ($(td,ts).closest("table.ui-jqgrid-btable").attr('id') || '').replace("_frozen","") !== ts.id ) {
				return this;
			}
			ri = ptr[0].id;
			var scb = $(td).hasClass("cbox"), cSel = feedback.call(ts, "beforeSelectRow", ri, e),
			    editingInfo = jgrid.detectRowEditing.call(ts, ri),
				locked = editingInfo!= null && editingInfo.mode !== "cellEditing"; // editingInfo.savedRow.ic
			if (td.tagName === 'A' || (locked && !scb)) { return; }
			td = $(td).closest("tr.jqgrow>td");
			if (td.length > 0) {
				ci = getCellIndex(td);
				tdHtml = $(td).closest("td,th").html();
				feedback.call(ts, "onCellSelect", ri, ci, tdHtml, e);
			}
			if(p.cellEdit === true) {
				if(p.multiselect && scb && cSel){
					$(ts).jqGrid("setSelection", ri ,true,e);
				} else if (td.length > 0) {
					ri = ptr[0].rowIndex;
					try {$(ts).jqGrid("editCell",ri,ci,true);} catch (ignore) {}
				}
				return;
			}
			if (!cSel) {
				return;
			}
			if ( !p.multikey ) {
				if(p.multiselect && p.multiboxonly) {
					if(scb){$(ts).jqGrid("setSelection",ri,true,e);}
					else {
						var frz = p.frozenColumns ? p.id+"_frozen" : "";
						$(p.selarrrow).each(function(i,n){
							var trid = $(ts).jqGrid('getGridRowById',n);
							if(trid) { $( trid ).removeClass("ui-state-highlight"); }
							$("#jqg_"+jqID(p.id)+"_"+jqID(n))[p.propOrAttr]("checked", false);
							if(frz) {
								$("#"+jqID(n), "#"+jqID(frz)).removeClass("ui-state-highlight");
								$("#jqg_"+jqID(p.id)+"_"+jqID(n), "#"+jqID(frz))[p.propOrAttr]("checked", false);
							}
						});
						clearArray(p.selarrrow); // p.selarrrow = [];
						$(ts).jqGrid("setSelection",ri,true,e);
					}
				} else {
					var oldSelRow = p.selrow;
					$(ts).jqGrid("setSelection",ri,true,e);
					if (p.singleSelectClickMode === "toggle" && !p.multiselect && oldSelRow === ri) {
						td.parent().removeClass("ui-state-highlight").attr({"aria-selected":"false", "tabindex" : "-1"});
						p.selrow = null;
					}
				}
			} else {
				if(e[p.multikey]) {
					$(ts).jqGrid("setSelection",ri,true,e);
				} else if(p.multiselect && scb) {
					scb = $("#jqg_"+jqID(p.id)+"_"+ri).is(":checked");
					$("#jqg_"+jqID(p.id)+"_"+ri)[propOrAttr]("checked", scb);
				}
			}
		}).bind('reloadGrid', function(e,opts) {
		    var self = this, gridSelf = self.grid, $self = $(this);
			if (p.treeGrid === true) {
				p.datatype = p.treedatatype;
			}
			opts = opts || {};
			if (p.datatype === "local" && p.dataTypeOrg && p.loadonce && opts.fromServer) {
				p.datatype = p.dataTypeOrg;
				delete p.dataTypeOrg;
			}
			if (opts.current) {
				gridSelf.selectionPreserver.call(self);
			}
			if(p.datatype==="local"){ $self.jqGrid("resetSelection");  if(p.data.length) { normalizeData.call(self); refreshIndex();} }
			else if(!p.treeGrid) {
				p.selrow=null;
				if(p.multiselect) {
					clearArray(p.selarrrow); // p.selarrrow = [];
					setHeadCheckBox.call(self, false);
				}
				clearArray(p.savedRow); // p.savedRow = [];
			}
			if(p.scroll) {emptyRows.call(self, true, false);}
			if (opts.page) {
				var page = parseInt(opts.page, 10);
				if (page > p.lastpage) { page = p.lastpage; }
				if (page < 1) { page = 1; }
				p.page = page;
				if (gridSelf.prevRowHeight) {
					gridSelf.bDiv.scrollTop = (page - 1) * gridSelf.prevRowHeight * p.rowNum;
				} else {
					gridSelf.bDiv.scrollTop = 0;
				}
			}
			if (gridSelf.prevRowHeight && p.scroll) {
				delete p.lastpage;
				gridSelf.populateVisible.call(self);
			} else {
				gridSelf.populate.call(self);
			}
			if(p._inlinenav===true) {$self.jqGrid('showAddEditButtons', false);}
			return false;
		})
		.dblclick(function(e) {
			td = e.target;
			ptr = $(td,ts.rows).closest("tr.jqgrow");
			if($(ptr).length === 0 ){return;}
			ri = ptr[0].rowIndex;
			ci = getCellIndex(td);
			if (!feedback.call(ts, "ondblClickRow", $(ptr).attr("id"), ri, ci, e)) {
				return false; // e.preventDefault() and e.stopPropagation() together
			}
		})
		.bind('contextmenu', function(e) {
			td = e.target;
			ptr = $(td,ts.rows).closest("tr.jqgrow");
			if($(ptr).length === 0 ){return;}
			if(!p.multiselect) {	$(ts).jqGrid("setSelection",ptr[0].id,true,e);	}
			ri = ptr[0].rowIndex;
			ci = getCellIndex(td);
			if (!feedback.call(ts, "onRightClickRow", $(ptr).attr("id"), ri, ci, e)) {
				return false; // e.preventDefault() and e.stopPropagation() together
			}
		});
		grid.bDiv = document.createElement("div");
		if(isMSIE) { if(String(p.height).toLowerCase() === "auto") { p.height = "100%"; } }
		$(grid.bDiv)
			.append($('<div style="position:relative;'+(isMSIE7 ? "height:0.01%;" : "")+'"></div>').append('<div></div>').append(ts))
			.addClass("ui-jqgrid-bdiv")
			.css({ height: p.height+(isNaN(p.height)?"":"px"), width: (grid.width)+"px"})
			.scroll(grid.scrollGrid);
		$(ts).css({width:p.tblwidth+"px"});
		if( !$.support.tbody ) { //IE
			if( $(">tbody",ts).length === 2 ) { $(">tbody:gt(0)",ts).remove();}
		}
		if(p.multikey){
			if( jgrid.msie) {
				$(grid.bDiv).bind("selectstart",function(){return false;});
			} else {
				$(grid.bDiv).bind("mousedown",function(){return false;});
			}
		}
		if(hg) {$(grid.bDiv).hide();}
		grid.cDiv = document.createElement("div");
		var visibleGridIcon = getIcon("gridMinimize.visible"), hiddenGridIcon = getIcon("gridMinimize.hidden"), showhide = getDef("showhide"),
			arf = p.hidegrid===true ? $("<a role='link' class='ui-jqgrid-titlebar-close ui-corner-all'" + (showhide ? " title='"+showhide+"'" : "")+"/>").hover(
			function(){ arf.addClass('ui-state-hover');},
			function() {arf.removeClass('ui-state-hover');})
		.append("<span class='" + visibleGridIcon + "'></span>") : "";
		$(grid.cDiv).append("<span class='ui-jqgrid-title'>"+p.caption+"</span>").append(arf)
		.addClass("ui-jqgrid-titlebar ui-jqgrid-caption"+(dir==="rtl" ? "-rtl" :"" )+" ui-widget-header ui-corner-top ui-helper-clearfix");
		$(grid.cDiv).insertBefore(grid.hDiv);
		if( p.toolbar[0] ) {
			grid.uDiv = document.createElement("div");
			if(p.toolbar[1] === "top") {$(grid.uDiv).insertBefore(grid.hDiv);}
			else if (p.toolbar[1]==="bottom" ) {$(grid.uDiv).insertAfter(grid.hDiv);}
			if(p.toolbar[1]==="both") {
				grid.ubDiv = document.createElement("div");
				$(grid.uDiv).addClass("ui-userdata ui-state-default").attr("id","t_"+p.id).insertBefore(grid.hDiv);
				$(grid.ubDiv).addClass("ui-userdata ui-state-default").attr("id","tb_"+p.id).insertAfter(grid.hDiv);
				if(hg)  {$(grid.ubDiv).hide();}
			} else {
				$(grid.uDiv).width(grid.width).addClass("ui-userdata ui-state-default").attr("id","t_"+p.id);
			}
			if(hg) {$(grid.uDiv).hide();}
		}
		p.datatype = p.datatype.toLowerCase();
		if(p.toppager) {
			p.toppager = p.id+"_toppager";
			grid.topDiv = $("<div id='"+p.toppager+"'></div>")[0];
			$(grid.topDiv).addClass('ui-state-default ui-jqgrid-toppager').css({width: grid.width+"px"}).insertBefore(grid.hDiv);
			setPager.call(ts, p.toppager, '_t');
			p.toppager = "#"+jqID(p.toppager); // hold ESCAPED id selector in the toppager option
		} else if (p.pager === "" && !p.scroll) {
			p.rowNum = p.maxRowNum;
		}
		if(p.footerrow) {
			grid.sDiv = $("<div class='ui-jqgrid-sdiv'></div>")[0];
			hb = $("<div class='ui-jqgrid-hbox"+(dir==="rtl"?"-rtl":"")+"'></div>");
			$(grid.sDiv).append(hb).width(grid.width).insertAfter(grid.hDiv);
			$(hb).append(tfoot);
			grid.footers = $(".ui-jqgrid-ftable",grid.sDiv)[0].rows[0].cells;
			if(p.rownumbers) { grid.footers[0].className = 'ui-state-default jqgrid-rownum'; }
			if(hg) {$(grid.sDiv).hide();}
		}
		hb = null;
		if(p.caption) {
			var tdt = p.datatype;
			if(p.hidegrid===true) {
				$(".ui-jqgrid-titlebar-close",grid.cDiv).click( function(e){
					var elems = ".ui-jqgrid-bdiv,.ui-jqgrid-hdiv,.ui-jqgrid-pager,.ui-jqgrid-sdiv", self = this;
					if(p.toolbar[0]===true) {
						if( p.toolbar[1]==='both') {
							elems += ',#' + jqID($(grid.ubDiv).attr('id'));
						}
						elems += ',#' + jqID($(grid.uDiv).attr('id'));
					}
					var counter = $(elems, p.gView).length;
					if(p.toppager) {
						elems += ',' + p.toppager;
					}

					if(p.gridstate === 'visible') {
						$(elems, p.gBox).slideUp("fast", function() {
							counter--;
							if (counter === 0) {
								$("span",self).removeClass(visibleGridIcon).addClass(hiddenGridIcon);
								p.gridstate = 'hidden';
								if($(p.gBox).hasClass("ui-resizable")) { $(".ui-resizable-handle",p.gBox).hide(); }
								$(grid.cDiv).addClass("ui-corner-bottom");
								if (!hg) { feedback.call(ts, "onHeaderClick", p.gridstate, e); }
							}
						});
					} else if(p.gridstate === 'hidden'){
						$(grid.cDiv).removeClass("ui-corner-bottom");
						$(elems,p.gBox).slideDown("fast", function() {
							counter--;
							if (counter === 0) {
								$("span",self).removeClass(hiddenGridIcon).addClass(visibleGridIcon);
								if(hg) {p.datatype = tdt;populate.call(ts);hg=false;}
								p.gridstate = 'visible';
								if($(p.gBox).hasClass("ui-resizable")) { $(".ui-resizable-handle",p.gBox).show(); }
								if (!hg) { feedback.call(ts, "onHeaderClick", p.gridstate, e); }
							}
						});
					}
					return false;
				});
				if(hg) {p.datatype="local"; $(".ui-jqgrid-titlebar-close",grid.cDiv).trigger("click");}
			}
		} else {
			$(grid.cDiv).hide();
			$(grid.cDiv).nextAll("div:visible").first().addClass('ui-corner-top'); // set on top toolbar or toppager or on hDiv
		}
		$(grid.hDiv).after(grid.bDiv)
		.mousemove(function (e) {
			if(grid.resizing){grid.dragMove(e);return false;}
		});
		$(eg).click(myResizerClickHandler).dblclick(function (e) { // it's still needed for Firefox
			var $resizer = $(p.rs),
				resizerOffset = $resizer.offset(),
				iColIndex = $resizer.data("idx"),
				cm = p.colModel[iColIndex],
				pageX = $(this).data("pageX") || $resizer.data("pageX");

			if (pageX == null) {
				return false;
			}
			var arPageX = String(pageX).split(";"),
                pageX1 = parseFloat(arPageX[0]),
                pageX2 = parseFloat(arPageX[1]);
			if (arPageX.length === 2 && (Math.abs(pageX1-pageX2) > 5 || Math.abs(e.pageX-pageX1) > 5 || Math.abs(e.pageX-pageX2) > 5)) {
				return false;
			}
				
			if (feedback.call(ts, "resizeDblClick", iColIndex, cm) &&
					(resizerOffset.left - 1 <= e.pageX && e.pageX <= resizerOffset.left + $resizer.outerWidth() + 1) && cm != null && cm.autoResizable) {
				$(ts).jqGrid("autoResizeColumn", iColIndex);
			}
			return false;
		});
		if (!p.pager) {
			$(grid.cDiv).nextAll("div:visible").filter(":last").addClass('ui-corner-bottom'); // set on bottom toolbar or footer (sDiv) or on bDiv
		}
		$(".ui-jqgrid-labels",grid.hDiv).bind("selectstart", function () { return false; });
		$(document).bind( "mouseup.jqGrid" + p.id, function () {
			if (grid.resizing !== false) {
				grid.dragEnd();
				return false;
			}
			return true;
		});
		ts.formatCol = formatCol;
		ts.sortData = sortData;
		ts.updatepager = updatepager;
		ts.refreshIndex = refreshIndex;
		ts.setHeadCheckBox = setHeadCheckBox;
		ts.fixScrollOffsetAndhBoxPadding = fixScrollOffsetAndhBoxPadding;
		ts.constructTr = constructTr;
		ts.formatter = function ( rowId, cellval , colpos, rwdat, act){return formatter(rowId, cellval , colpos, rwdat, act);};
		$.extend(grid,{populate : populate, emptyRows: emptyRows, beginReq: beginReq, endReq: endReq});
		ts.addXmlData = function(d) {addXmlData.call(ts,d);};
		ts.addJSONData = function(d) {addJSONData.call(ts,d);};
		ts.grid.cols = ts.rows[0].cells;
		feedback.call(ts, "onInitGrid");
		
		// fix to allow to load TreeGrid using datatype:"local", data:mydata instead of treeGrid: true
		if (p.treeGrid && p.datatype === "local" && p.data != null && p.data.length > 0) {
			p.datatype = "jsonstring";
			p.datastr = p.data;
			p.data = [];
		}

		populate.call(ts);p.hiddengrid=false;
	});
};
jgrid.extend({
	getGridRes: function (defaultPropName) {
		// The problem is the following: there are already exist some properties of $.jgrid which can be used
		// to set some defaults of jqGrid. It's: $.jgrid.defaults, $.jgrid.search, $.jgrid.edit, $.jgrid.view, $.jgrid.del, $.jgrid.nav
		// $.jgrid.formatter, $.jgrid.errors, $.jgrid.col
		// Existing programs could use the objects to set either language specific settings (which are now moved under regional part)
		// be language independent. Thus one should combine language specific settings with the user's settings and overwrite the settings
		// with grid specific settings if the settings exist.
		//
		// For example:
		//		p.loadtext (grid option) = "..."
		//		$.jgrid.defaults.loadtext = "........."
		//		p.regional = "en-US",
		//		$.jgrid.regional["en-US"].defaults.loadtext = "Loading...";
		//
		//		p.edit.addCaption = "Add Invoice"
		//		$.jgrid.edit.addCaption = "Add"
		//		p.regional = "en-US",
		//		$.jgrid.regional["en-US"].edit.addCaption = "Add Record";
		//
		// In the case the grid option p.loadtext = "..." need be used. If p.loadtext is not defined then $.jgrid.defaults.loadtext. If
		// $.jgrid.defaults.loadtext is not defined explicitly by the user, then language settings will be used

		var $t = this[0];
		if (!$t || !$t.grid || !$t.p) {return null;}
		// One need get defaultPropName from $.jgrid root first. If no value exist then one should get it from $.jgrid[reg] root
		var res = jgrid.getRes(locales[$t.p.locale], defaultPropName) || jgrid.getRes(locales["en-US"], defaultPropName),
			resDef = jgrid.getRes(jgrid, defaultPropName);
		return typeof res === "object" && res !== null && !$.isArray(res) ?
			$.extend(true, {}, res, resDef || {}) :
			resDef !== undefined ? resDef : res;
	},
	getGridParam : function(pName) {
		var $t = this[0];
		if (!$t || !$t.grid) {return null;}
		if (!pName) { return $t.p; }
		return $t.p[pName] !== undefined ? $t.p[pName] : null;
	},
	setGridParam : function (newParams, overwrite){
		return this.each(function(){
			var self = this;
			if(overwrite == null) {
				overwrite = false;
			}
			if (self.grid && typeof newParams === 'object') {
				if(overwrite === true) {
					var params = $.extend({}, self.p, newParams);
					self.p = params;
				} else {
					$.extend(true,self.p,newParams);
				}
			}
		});
	},
	getGridRowById: function ( rowid ) {
		if (rowid == null) {
			return null;
		}
		var row, rowId = rowid.toString();
		this.each( function(){
			var i, rows = this.rows, tr;
			try {
				//row = this.rows.namedItem( rowid );
				i = rows.length;
				while(i--) {
					tr = rows[i];
					if( rowId === tr.id) {
						row = tr;
						break;
					}
				}
			} catch ( e ) {
				row = $(this.grid.bDiv).find( "#" + jqID( rowid ));
				row = row.length > 0 ? row[0] : null;
			}
		});
		return row;
	},
	getDataIDs : function () {
		var ids=[];
		this.each(function(){
			var rows = this.rows, len = rows.length, i, tr;
			if(len && len>0){
				for (i=0; i<len; i++) {
					tr = rows[i];
					if($(tr).hasClass('jqgrow')) {
						ids.push(tr.id);
					}
				}
			}
		});
		return ids;
	},
	setSelection : function(selection,onsr, e) {
		return this.each(function(){
			var $t = this, p = $t.p, stat,pt, ner, ia, tpsr, fid, csr;
			if(selection === undefined) { return; }
			onsr = onsr === false ? false : true;
			pt=$($t).jqGrid('getGridRowById', selection);
			if(!pt || !pt.className || pt.className.indexOf( 'ui-state-disabled' ) > -1 ) { return; }
			function scrGrid(tr, bDiv){
				var ch = bDiv.clientHeight,
				st = bDiv.scrollTop,
				rpos = $(tr).position().top,
				rh = tr.clientHeight;
				if(rpos+rh >= ch+st) {bDiv.scrollTop = rpos-(ch+st)+rh+st; }
				else if(rpos < ch+st) {
					if(rpos < st) {
						bDiv.scrollTop = rpos;
					}
				}
			}
			if(p.scrollrows===true) {
				ner = $($t).jqGrid('getGridRowById',selection).rowIndex;
				if(ner >=0 ){
					scrGrid($t.rows[ner], $t.grid.bDiv);
				}
			}
			if(p.frozenColumns === true ) {
				fid = p.id+"_frozen";
			}
			if(!p.multiselect) {	
				if(pt.className !== "ui-subgrid") {
					if( p.selrow !== pt.id ) {
						if (p.selrow !== null) {
							csr = $($t).jqGrid('getGridRowById', p.selrow);
							if( csr ) {
								$(  csr ).removeClass("ui-state-highlight").attr({"aria-selected":"false", "tabindex" : "-1"});
							}
						}
						$(pt).addClass("ui-state-highlight").attr({"aria-selected":"true", "tabindex" : "0"});//.focus();
						if(fid) {
							$("#"+jqID(p.selrow), "#"+jqID(fid)).removeClass("ui-state-highlight");
							$("#"+jqID(selection), "#"+jqID(fid)).addClass("ui-state-highlight");
						}
						stat = true;
					} else {
						stat = false;
					}
					p.selrow = pt.id;
					if( onsr ) {
						feedback.call($t, "onSelectRow", pt.id, stat, e);
					}
				}
			} else {
				//unselect selectall checkbox when deselecting a specific row
				$t.setHeadCheckBox(false);
				p.selrow = pt.id;
				ia = $.inArray(p.selrow,p.selarrrow);
				if (  ia === -1 ){
					if(pt.className !== "ui-subgrid") { $(pt).addClass("ui-state-highlight").attr("aria-selected","true");}
					stat = true;
					p.selarrrow.push(p.selrow);
				} else if (jgrid.detectRowEditing.call($t, pt.id) !== null) {
					// the row is editing and selected now. The checkbox is clicked
					stat = true; // set to force the checkbox stay selected
				} else {
					// deselect only if the row is not in editing mode
					if(pt.className !== "ui-subgrid") { $(pt).removeClass("ui-state-highlight").attr("aria-selected","false");}
					stat = false;
					p.selarrrow.splice(ia,1);
					tpsr = p.selarrrow[0];
					p.selrow = (tpsr === undefined) ? null : tpsr;
				}
				$("#jqg_"+jqID(p.id)+"_"+jqID(pt.id))[p.propOrAttr]("checked",stat);
				if(fid) {
					if(ia === -1 || stat) {
						$("#"+jqID(selection), "#"+jqID(fid)).addClass("ui-state-highlight");
					} else {
						$("#"+jqID(selection), "#"+jqID(fid)).removeClass("ui-state-highlight");
					}
					$("#jqg_"+jqID(p.id)+"_"+jqID(selection), "#"+jqID(fid))[p.propOrAttr]("checked",stat);
				}
				if( onsr ) {
					feedback.call($t, "onSelectRow", pt.id, stat, e);
				}
			}
		});
	},
	resetSelection : function( rowid ){
		return this.each(function(){
			var t = this, p = t.p, sr, frozenColumns = p.frozenColumns === true,
			gridIdEscaped = jqID(p.id), gridIdSelector = p.idSel,
			fid = p.id+"_frozen", gridIdFrozenSelector = "#"+jqID(fid);
			if( p.frozenColumns === true ) {
				fid = p.id+"_frozen";
			}
			if(rowid !== undefined ) {
				sr = rowid === p.selrow ? p.selrow : rowid;
				$(gridIdSelector+">tbody>tr#"+jqID(sr)).removeClass("ui-state-highlight").attr("aria-selected","false");
				if (frozenColumns) { $("#"+jqID(sr), gridIdFrozenSelector).removeClass("ui-state-highlight"); }
				if(p.multiselect) {
					$("#jqg_"+jqID(p.id)+"_"+jqID(sr), gridIdSelector)[p.propOrAttr]("checked",false);
					if(frozenColumns) { $("#jqg_"+gridIdEscaped+"_"+jqID(sr), gridIdFrozenSelector)[p.propOrAttr]("checked",false); }
					t.setHeadCheckBox(false);
					var ia = $.inArray(jqID(sr), p.selarrrow);
					if (ia !== -1) {
						p.selarrrow.splice(ia,1);
					}
				}
				sr = null;
			} else if(!p.multiselect) {
				if(p.selrow) {
					$(gridIdSelector+">tbody>tr#"+jqID(p.selrow)).removeClass("ui-state-highlight").attr("aria-selected","false");
					if(frozenColumns) { $("#"+jqID(p.selrow), gridIdFrozenSelector).removeClass("ui-state-highlight"); }
					p.selrow = null;
				}
			} else {
				$(p.selarrrow).each(function(i,n){
					var selRowIdEscaped = jqID(n);
					$( $(t).jqGrid('getGridRowById',n) ).removeClass("ui-state-highlight").attr("aria-selected","false");
					$("#jqg_"+gridIdEscaped+"_"+selRowIdEscaped)[p.propOrAttr]("checked",false);
					if(frozenColumns) { 
						$("#"+selRowIdEscaped, gridIdFrozenSelector).removeClass("ui-state-highlight"); 
						$("#jqg_"+gridIdEscaped+"_"+selRowIdEscaped, gridIdFrozenSelector)[p.propOrAttr]("checked",false);
					}
				});
				t.setHeadCheckBox(false);
				clearArray(p.selarrrow); // p.selarrrow = [];
				p.selrow = null;
			}
			if(p.cellEdit === true) {
				if(parseInt(p.iCol,10)>=0  && parseInt(p.iRow,10)>=0) {
					$("td:eq("+p.iCol+")",t.rows[p.iRow]).removeClass("edit-cell ui-state-highlight");
					$(t.rows[p.iRow]).removeClass("selected-row ui-state-hover");
				}
			}
			clearArray(p.savedRow); // p.savedRow = [];
		});
	},
	getRowData : function( rowid ) {
		// TODO: add additional parameter, which will inform whether the output data need be in formatted or unformatted form
		var res = {}, resall;
		this.each(function(){
			var $t = this, p = $t.p, getall=false, ind, len = 2, j=0, rows = $t.rows, i, $td, cm, nm, td;
			if(rowid === undefined) {
				getall = true;
				resall = [];
				len = rows.length;
			} else {
				ind = $($t).jqGrid('getGridRowById', rowid);
				if(!ind) { return res; }
			}
			while(j<len){
				if(getall) { ind = rows[j]; }
				if( $(ind).hasClass('jqgrow') ) {
					$td = $('td[role="gridcell"]',ind);
					for (i = 0; i < $td.length; i++) {
						cm = p.colModel[i];
						nm = cm.name;
						if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn' && cm.formatter !== "actions") {
							td = $td[i];
							if(p.treeGrid===true && nm === p.ExpandColumn) {
								res[nm] = htmlDecode($("span",td).first().html());
							} else {
								try {
									res[nm] = $.unformat.call($t,td,{rowId:ind.id, colModel:cm},i);
								} catch (exception){
									res[nm] = htmlDecode($(td).html());
								}
							}
						}
					}
					if(getall) { resall.push(res); res={}; }
				}
				j++;
			}
		});
		return resall || res;
	},
	delRowData : function(rowid) {
		var success = false, rowInd, ia, nextRow;
		this.each(function() {
			var $t = this, p = $t.p;
			rowInd = $($t).jqGrid('getGridRowById', rowid);
			if(!rowInd) {return false;}
				if(p.subGrid) {
					nextRow = $(rowInd).next();
					if(nextRow.hasClass('ui-subgrid')) {
						nextRow.remove();
					}
				}
				$(rowInd).remove();
				p.records--;
				p.reccount--;
				$t.updatepager(true,false);
				success=true;
				if(p.multiselect) {
					ia = $.inArray(rowid,p.selarrrow);
					if(ia !== -1) { p.selarrrow.splice(ia,1);}
				}
				if (p.multiselect && p.selarrrow.length > 0) {
					p.selrow = p.selarrrow[p.selarrrow.length-1];
				} else if (p.selrow === rowid) {
					p.selrow = null;
				}
			if(p.datatype === 'local') {
				var id = stripPref(p.idPrefix, rowid),
				pos = p._index[id];
				if(pos !== undefined) {
					p.data.splice(pos,1);
					$t.refreshIndex();
				}
			}
			if( p.altRows === true && success ) {
				var cn = p.altclass;
				$($t.rows).each(function(i){
					if(i % 2 === 1) { $(this).addClass(cn); }
					else { $(this).removeClass(cn); }
				});
			}
		});
		return success;
	},
	setRowData : function(rowid, data, cssp) {
		// TODO: add additional parameter to setRowData which inform that input data is in formatted or unformatted form
		var success=true;
		this.each(function(){
			var t = this, p = t.p, vl, ind, cp = typeof cssp, lcdata={};
			if(!t.grid) {return false;}
			ind = $(t).jqGrid('getGridRowById', rowid);
			if(!ind) { return false; }
			if( data ) {
				try {
					var id = stripPref(p.idPrefix, rowid), key, pos = p._index[id], oData = pos != null ? p.data[pos] : undefined;
					$(p.colModel).each(function(i){
						var cm = this, nm = cm.name, title, dval = getAccessor(data,nm);
						if( dval !== undefined) {
							if (p.datatype === 'local' && oData != null) {
								vl = convertOnSaveLocally.call(t, dval, cm, oData[nm], id, oData, i);
								if ($.isFunction(cm.saveLocally)) {
									cm.saveLocally.call(t, { newValue: vl, newItem: lcdata, oldItem: oData, id: id, cm: cm, cmName: nm, iCol: i });
								} else {
									lcdata[nm] = vl;
								}
							}
							vl = t.formatter( rowid, dval, i, data, 'edit');
							title = cm.title ? {"title":stripHtml(vl)} : {};
							if(p.treeGrid===true && nm === p.ExpandColumn) {
								$("td[role='gridcell']:eq("+i+") > span:first",ind).first().html(vl).attr(title);
							} else {
								$("td[role='gridcell']:eq("+i+")",ind).html(vl).attr(title);
							}
						}
					});
					if(p.datatype === 'local') {
						if(p.treeGrid) {
							for(key in p.treeReader){
								if(p.treeReader.hasOwnProperty(key)) {
									delete lcdata[p.treeReader[key]];
								}
							}
						}
						if(oData !== undefined) {
							p.data[pos] = $.extend(true, oData, lcdata);
						}
						lcdata = null;
					}
				} catch (exception) {
					success = false;
				}
			}
			if(success) {
				if(cp === 'string') {$(ind).addClass(cssp);} else if(cssp !== null && cp === 'object') {$(ind).css(cssp);}
				$(t).triggerHandler("jqGridAfterGridComplete");
			}
		});
		return success;
	},
	addRowData : function(rowid,rdata,pos,src) {
		// TODO: add an additional parameter, which will inform whether the input data rdata is in formatted or unformatted form
		if($.inArray(pos, ["first", "last", "before", "after"]) < 0) {pos = "last";}
		var success = false, nm, row, gi, si, ni,sind, i, v, prp="", aradd, cnm, cn, data, cm, id;
		if(rdata) {
			if($.isArray(rdata)) {
				aradd=true;
				//pos = "last";
				cnm = rowid;
			} else {
				rdata = [rdata];
				aradd = false;
			}
			this.each(function() {
				var t = this, p = t.p, datalen = rdata.length;
				ni = p.rownumbers===true ? 1 :0;
				gi = p.multiselect ===true ? 1 :0;
				si = p.subGrid===true ? 1 :0;
				if(!aradd) {
					if(rowid !== undefined) { rowid = String(rowid);}
					else {
						rowid = randId();
						if(p.keyName !== false) {
							cnm = p.keyName;
							if(rdata[0][cnm] !== undefined) { rowid = rdata[0][cnm]; }
						}
					}
				}
				cn = p.altclass;
				var k = 0, cna ="", lcdata = {};
				while(k < datalen) {
					data = rdata[k];
					row=[];
					if(aradd) {
						try {
							rowid = data[cnm];
							if(rowid===undefined) {
								rowid = randId();
							}
						}
						catch (exception) {rowid = randId();}
						cna = p.altRows === true ?  (t.rows.length-1)%2 === 0 ? cn : "" : "";
					}
					id = rowid;
					rowid  = p.idPrefix + rowid;
					if(ni){
						prp = t.formatCol(0,1,'',null,rowid, true);
						row.push("<td role=\"gridcell\" class=\"ui-state-default jqgrid-rownum\" "+prp+">0</td>");
					}
					if(gi) {
						v = "<input role=\"checkbox\" type=\"checkbox\""+" id=\"jqg_"+p.id+"_"+rowid+"\" class=\"cbox\" aria-checked=\"false\"/>";
						prp = t.formatCol(ni,1,'', null, rowid, true);
						row.push("<td role=\"gridcell\" "+prp+">"+v+"</td>");
					}
					if(si) {
						row.push($(t).jqGrid("addSubGridCell",gi+ni,1));
					}
					for(i = gi+si+ni; i < p.colModel.length;i++){
						cm = p.colModel[i];
						nm = cm.name;
						v = convertOnSaveLocally.call(t, data[nm], cm, undefined, id, {}, i);
						if ($.isFunction(cm.saveLocally)) {
							cm.saveLocally.call(t, { newValue: v, newItem: lcdata, oldItem: {}, id: id, cm: cm, cmName: nm, iCol: i });
						} else {
							lcdata[nm] = v;
						}
						v = t.formatter( rowid, getAccessor(data,nm), i, data );
						prp = t.formatCol(i,1,v, data, rowid, lcdata);
						row.push("<td role=\"gridcell\" "+prp+">"+v+"</td>");
					}
					row.unshift(t.constructTr(rowid, false, cna, lcdata, data, false));
					row.push("</tr>");
					row = row.join('');
					if(t.rows.length === 0){
						$("table:first",t.grid.bDiv).append(row);
					} else {
						switch (pos) {
							case 'last':
								$(t.rows[t.rows.length-1]).after(row);
								sind = t.rows.length-1;
								break;
							case 'first':
								$(t.rows[0]).after(row);
								sind = 1;
								break;
							case 'after':
								sind = $(t).jqGrid('getGridRowById', src);
								if (sind) {
									if ($(t.rows[sind.rowIndex+1]).hasClass("ui-subgrid")) {
										$(t.rows[sind.rowIndex+1]).after(row);
										sind=sind.rowIndex + 2;
									} else {
										$(sind).after(row);
										sind=sind.rowIndex + 1;
									}
								}	
								break;
							case 'before':
								sind = $(t).jqGrid('getGridRowById', src);
								if(sind) {
									$(sind).before(row);
									sind=sind.rowIndex - 1;
								}
								break;
						}
					}
					if(p.subGrid===true) {
						$(t).jqGrid("addSubGrid",gi+ni, sind);
					}
					p.records++;
					p.reccount++;
					if (p.lastpage === 0) {
						p.lastpage = 1;
					}
					feedback.call(t, "afterInsertRow", rowid, data, data);
					k++;
					if(p.datatype === 'local') {
						lcdata[p.localReader.id] = id;
						p._index[id] = p.data.length;
						p.data.push(lcdata);
						lcdata = {};
					}
				}
				if( p.altRows === true && !aradd) {
					if (pos === "last") {
						if ((t.rows.length-1)%2 === 1)  {$(t.rows[t.rows.length-1]).addClass(cn);}
					} else {
						$(t.rows).each(function(i){
							if(i % 2 ===1) { $(this).addClass(cn); }
							else { $(this).removeClass(cn); }
						});
					}
				}
				t.updatepager(true,true);
				success = true;
			});
		}
		return success;
	},
	footerData : function(action,data, format) {
		// TODO: add an additional parameter, which will inform whether the input data "data" is in formatted or unformatted form
		var nm, success=false, res={}, title;
		function isEmpty(obj) {
			var i;
			for(i in obj) {
				if (obj.hasOwnProperty(i)) { return false; }
			}
			return true;
		}
		if(action == null) { action = "get"; }
		if(typeof format !== "boolean") { format  = true; }
		action = action.toLowerCase();
		this.each(function(){
			var t = this, p = t.p, vl;
			if(!t.grid || !p.footerrow) {return false;}
			if(action === "set") { if(isEmpty(data)) { return false; } }
			success=true;
			$(p.colModel).each(function(i){
				nm = this.name;
				if(action === "set") {
					if( data[nm] !== undefined) {
						vl = format ? t.formatter( "", data[nm], i, data, 'edit') : data[nm];
						title = this.title ? {"title":stripHtml(vl)} : {};
						$("tr.footrow td:eq("+i+")",t.grid.sDiv).html(vl).attr(title);
						success = true;
					}
				} else if(action === "get") {
					res[nm] = $("tr.footrow td:eq("+i+")",t.grid.sDiv).html();
				}
			});
		});
		return action === "get" ? res : success;
	},
	showHideCol : function(colname,show) {
		return this.each(function() {
			var $t = this, fndh=false, p = $t.p,
			brd=jgrid.cell_width ? 0: p.cellLayout, cw;
			if (!$t.grid ) {return;}
			if( typeof colname === 'string') {colname=[colname];}
			show = show !== "none" ? "" : "none";
			var sw = show === "" ? true :false,
			gh = p.groupHeader && (typeof p.groupHeader === 'object' || $.isFunction(p.groupHeader) );
			if(gh) { $($t).jqGrid('destroyGroupHeader', false); }
			$(p.colModel).each(function(i) {
				if ($.inArray(this.name,colname) !== -1 && this.hidden === sw) {
					if(p.frozenColumns === true && this.frozen === true) {
						return true;
					}
					$("tr[role=row]",$t.grid.hDiv).each(function(){
						$(this.cells[i]).css("display", show);
					});
					$($t.rows).each(function(){
						if (!$(this).hasClass("jqgroup")) {
							$(this.cells[i]).css("display", show);
						}
					});
					if(p.footerrow) { $("tr.footrow td:eq("+i+")", $t.grid.sDiv).css("display", show); }
					cw =  parseInt(this.width,10);
					if(show === "none") {
						p.tblwidth -= cw+brd;
					} else {
						p.tblwidth += cw+brd;
					}
					this.hidden = !sw;
					fndh=true;
					feedback.call($t, "onShowHideCol", sw, this.name, i);
				}
			});
			if(fndh===true) {
				if(p.shrinkToFit === true && !isNaN(p.height)) { p.tblwidth += parseInt(p.scrollOffset,10);}
				$($t).jqGrid("setGridWidth",p.shrinkToFit === true ? p.tblwidth : p.width );
			}
			if( gh )  {
				$($t).jqGrid('setGroupHeaders',p.groupHeader);
			}
		});
	},
	hideCol : function (colname) {
		return this.each(function(){$(this).jqGrid("showHideCol",colname,"none");});
	},
	showCol : function(colname) {
		return this.each(function(){$(this).jqGrid("showHideCol",colname,"");});
	},
	remapColumns : function(permutation, updateCells, keepHeader) {
		function resortArray(a) {
			var ac;
			if (a.length) {
				ac = $.makeArray(a);
			} else {
				ac = $.extend({}, a);
			}
			$.each(permutation, function(i) {
				a[i] = ac[this];
			});
		}
		var ts = this.get(0), p = ts.p, grid = ts.grid;
		function resortRows(parent, clobj) {
			$(">tr"+(clobj||""), parent).each(function() {
				var row = this;
				var elems = $.makeArray(row.cells);
				$.each(permutation, function() {
					var e = elems[this];
					if (e) {
						row.appendChild(e);
					}
				});
			});
		}
		resortArray(p.colModel);
		resortArray(p.colNames);
		resortArray(grid.headers);
		resortRows($("thead:first", grid.hDiv), keepHeader && ":not(.ui-jqgrid-labels)");
		if (updateCells) {
			resortRows($(ts.tBodies[0]), ".jqgfirstrow, tr.jqgrow, tr.jqfoot");
		}
		if (p.footerrow) {
			resortRows($("tbody:first", grid.sDiv));
		}
		if (p.remapColumns) {
			if (!p.remapColumns.length){
				p.remapColumns = $.makeArray(permutation);
			} else {
				resortArray(p.remapColumns);
			}
		}
		p.lastsort = $.inArray(p.lastsort, permutation);
		if(p.treeGrid) { p.expColInd = $.inArray(p.expColInd, permutation); }
		feedback.call(ts, "onRemapColumns", permutation, updateCells, keepHeader);
	},
	setGridWidth : function(nwidth, shrink) {
		return this.each(function(){
			var $t = this, p = $t.p, cw, grid = $t.grid, initwidth = 0, lvc, vc=0, hs=false, aw, gw=0, cr;
			if (!grid || p == null) {return;}
			var colModel = p.colModel, cm, scw = p.scrollOffset, brd = jgrid.cell_width ? 0 : p.cellLayout, thInfo,
				headers = grid.headers, footers = grid.footers, bDiv = grid.bDiv, hDiv = grid.hDiv, sDiv = grid.sDiv,
				cols = grid.cols, delta, cle,
				hCols = $(hDiv).find(">div>.ui-jqgrid-htable>thead>tr").first()[0].cells,
				setWidthOfAllDivs = function (newWidth) {
					grid.width = p.width = newWidth;
					$(p.gBox).css("width", newWidth + "px");
					$(p.gView).css("width", newWidth + "px");
					$(bDiv).css("width", newWidth + "px");
					$(hDiv).css("width", newWidth + "px");
					if (p.pager) {
						$(p.pager).css("width", newWidth + "px");
					}
					if (p.toppager) {
						$(p.toppager).css("width", newWidth + "px");
					}
					if (p.toolbar[0] === true){
						$(grid.uDiv).css("width", newWidth + "px");
						if(p.toolbar[1] === "both") {
							$(grid.ubDiv).css("width", newWidth + "px");
						}
					}
					if (p.footerrow) {
						$(sDiv).css("width", nwidth + "px");
					}
				};
			if(typeof shrink !== 'boolean') {
				shrink=p.shrinkToFit;
			}
			if(isNaN(nwidth)) {return;}
			nwidth = parseInt(nwidth, 10); // round till integer value of px
			setWidthOfAllDivs(nwidth);
			if(shrink ===false && p.forceFit === true) {p.forceFit=false;}
			if(shrink===true) {
				$.each(colModel, function() {
					if(this.hidden===false){
						cw = this.widthOrg;
						initwidth += cw+brd;
						if(this.fixed) {
							gw += cw+brd;
						} else {
							vc++;
						}
					}
				});
				if(vc  === 0) { return; }
				p.tblwidth = parseInt(initwidth, 10); // round till integer value of px;
				aw = nwidth-brd*vc-gw;
				if(!isNaN(p.height)) {
					if(bDiv.clientHeight < bDiv.scrollHeight || $t.rows.length === 1){
						hs = true;
						aw -= scw;
					}
				}
				initwidth =0;
				cle = cols.length >0;
				$.each(colModel, function(i) {
					if(this.hidden === false && !this.fixed){
						cw = this.widthOrg;
						cw = Math.round(aw*cw/(p.tblwidth-brd*vc-gw));
						if (cw < 0) { return; }
						this.width =cw;
						initwidth += cw;
						headers[i].width=cw;
						hCols[i].style.width=cw+"px";
						if(p.footerrow) { footers[i].style.width = cw+"px"; }
						if(cle) { cols[i].style.width = cw+"px"; }
						lvc = i;
					}
				});

				if (!lvc) { return; }

				cr = 0;
				if (hs) {
					if(nwidth-gw-(initwidth+brd*vc) !== scw){
						cr = nwidth-gw-(initwidth+brd*vc)-scw;
					}
				} else if( Math.abs(nwidth-gw-(initwidth+brd*vc)) !== 1) {
					cr = nwidth-gw-(initwidth+brd*vc);
				}
				cm = colModel[lvc];
				cm.width += cr;
				p.tblwidth = parseInt(initwidth+cr+brd*vc+gw, 10); // round till integer value of px;
				if(p.tblwidth > nwidth) {
					delta = p.tblwidth - parseInt(nwidth,10);
					p.tblwidth = nwidth;
					cm.width = cm.width-delta;
				}
				cw = cm.width;
				thInfo = headers[lvc];
				thInfo.width = cw;
				hCols[lvc].style.width=cw+"px";
				if(cle) { cols[lvc].style.width = cw+"px"; }
				if(p.footerrow) {
					footers[lvc].style.width = cw+"px";
				}
				if (p.tblwidth < p.width) {
					// decrease the width if required
					setWidthOfAllDivs(p.tblwidth);
				}
				if (bDiv.offsetWidth > bDiv.clientWidth) { // the part seems never work
					// horizontal scroll bar exist.
					// we need increase the width of bDiv to fix the problem or to reduce the width of the table
					// currently we just increase the width
					if (!p.autowidth && (p.widthOrg === undefined || p.widthOrg === "auto" || p.widthOrg === "100%")) {
						setWidthOfAllDivs(bDiv.offsetWidth);
					}
				}
			}
			if(p.tblwidth) {
				p.tblwidth = parseInt(p.tblwidth, 10); // round till integer value of px;
				$($t).css("width",p.tblwidth+"px");
				getGridComponent("hTable", $(hDiv)).css("width",p.tblwidth+"px");
				hDiv.scrollLeft = bDiv.scrollLeft;
				if(p.footerrow) {
					getGridComponent("fTable", $(sDiv)).css("width",p.tblwidth+"px");
				}
				// small fix which origin should be examined more exactly
				delta = Math.abs(p.tblwidth - p.width);
				if (p.shrinkToFit && !shrink && delta < 3 && delta > 0) {
					if (p.tblwidth < p.width) {
						setWidthOfAllDivs(p.tblwidth); // decrease the width if required
					}
					if (bDiv.offsetWidth > bDiv.clientWidth) { // the part seems never work
						if (!p.autowidth && (p.widthOrg === undefined || p.widthOrg === "auto" || p.widthOrg === "100%")) {
							setWidthOfAllDivs(bDiv.offsetWidth);
						}
					}
				}
			}
		});
	},
	setGridHeight : function (nh) {
		return this.each(function (){
			var $t = this, grid = $t.grid, p = $t.p;
			if(!$t.grid) {return;}
			var bDiv = $(grid.bDiv);
			bDiv.css({height: nh+(isNaN(nh)?"":"px")});
			if(p.frozenColumns === true){
				//follow the original set height to use 16, better scrollbar width detection
				$(p.idSel+"_frozen").parent().height(bDiv.height() - 16);
			}
			p.height = nh;
			if (p.scroll) { grid.populateVisible.call($t); }
		});
	},
	setCaption : function (newcap){
		return this.each(function(){
			var self = this, cDiv = self.grid.cDiv;
			self.p.caption=newcap;
			$("span.ui-jqgrid-title, span.ui-jqgrid-title-rtl",cDiv).html(newcap);
			$(cDiv).show();
			$(cDiv).nextAll("div").removeClass('ui-corner-top');
		});
	},
	setLabel : function(colname, nData, prop, attrp ){
		return this.each(function(){
			var $t = this, pos=-1;
			if(!$t.grid) {return;}
			if(colname !== undefined) {
				$($t.p.colModel).each(function(i){
					if (this.name === colname) {
						pos = i;return false;
					}
				});
			} else { return; }
			if(pos>=0) {
				var thecol = $("tr.ui-jqgrid-labels th:eq("+pos+")",$t.grid.hDiv);
				if (nData){
					var ico = $(".s-ico",thecol);
					$("[id^=jqgh_]",thecol).empty().html(nData).append(ico);
					$t.p.colNames[pos] = nData;
				}
				if (prop) {
					if(typeof prop === 'string') {$(thecol).addClass(prop);} else {$(thecol).css(prop);}
				}
				if(typeof attrp === 'object') {$(thecol).attr(attrp);}
			}
		});
	},
	setCell : function(rowid,colname,nData,cssp,attrp, forceupd) {
		// TODO: add an additional parameter, which will inform whether the input data nData is in formatted or unformatted form
		return this.each(function(){
			var $t = this, p = $t.p, pos =-1, v, title, cl, cm, item, ind, tcell, rawdat=[], id, index;
			if(!$t.grid) {return;}
			if(isNaN(colname)) {
				$(p.colModel).each(function(i){
					if (this.name === colname) {
						pos = i;return false;
					}
				});
			} else {pos = parseInt(colname,10);}
			if(pos>=0) {
				ind = $($t).jqGrid('getGridRowById', rowid); 
				if (ind){
					tcell = $("td:eq("+pos+")",ind);
					if(nData !== "" || forceupd === true) {
						for(cl=0; cl<ind.cells.length; cl++) {
							// slow down speed
							rawdat.push(ind.cells[cl].innerHTML);
						}
						v = $t.formatter(rowid, nData, pos, rawdat, 'edit');
						title = p.colModel[pos].title ? {"title":stripHtml(v)} : {};
						if(p.treeGrid && $(".tree-wrap",$(tcell)).length>0) {
							$("span",$(tcell)).html(v).attr(title);
						} else {
							$(tcell).html(v).attr(title);
						}
						if(p.datatype === "local") {
							id = stripPref(p.idPrefix, rowid);
							index = p._index[id];
							if(index !== undefined) {
								item = p.data[index];
								if (item != null) {
									cm = p.colModel[pos];
									v = convertOnSaveLocally.call($t, nData, cm, item[cm.name], id, item, pos);
									if ($.isFunction(cm.saveLocally)) {
										cm.saveLocally.call($t, { newValue: v, newItem: item, oldItem: item, id: id, cm: cm, cmName: cm.name, iCol: pos });
									} else {
										item[cm.name] = v;
									}
								}
							}
						}
					}
					if(typeof cssp === 'string'){
						$(tcell).addClass(cssp);
					} else if(cssp) {
						$(tcell).css(cssp);
					}
					if(typeof attrp === 'object') {$(tcell).attr(attrp);}
				}
			}
		});
	},
	getCell : function(rowid,col) {
		// TODO: add an additional parameter, which will inform whether the output data should be in formatted or unformatted form
		var ret = false;
		this.each(function(){
			var $t=this, pos=-1;
			if(!$t.grid) {return;}
			if(isNaN(col)) {
				$($t.p.colModel).each(function(i){
					if (this.name === col) {
						pos = i;return false;
					}
				});
			} else {pos = parseInt(col,10);}
			if(pos>=0) {
				var ind = $($t).jqGrid('getGridRowById', rowid);
				if(ind) {
					try {
						ret = $.unformat.call($t,$("td:eq("+pos+")",ind),{rowId:ind.id, colModel:$t.p.colModel[pos]},pos);
					} catch (exception){
						ret = htmlDecode($("td:eq("+pos+")",ind).html());
					}
				}
			}
		});
		return ret;
	},
	getCol : function (col, obj, mathopr) {
		// TODO: add an additional parameter, which will inform whether the output data should be in formatted or unformatted form
		var ret = [], val, sum=0, min, max, v;
		obj = typeof obj !== 'boolean' ? false : obj;
		if(mathopr === undefined) { mathopr = false; }
		this.each(function(){
			var $t=this, pos=-1;
			if(!$t.grid) {return;}
			if(isNaN(col)) {
				$($t.p.colModel).each(function(j){
					if (this.name === col) {
						pos = j;return false;
					}
				});
			} else {pos = parseInt(col,10);}
			if(pos>=0) {
				var ln = $t.rows.length, i =0, dlen=0;
				if (ln && ln>0){
					while(i<ln){
						if($($t.rows[i]).hasClass('jqgrow')) {
							try {
								val = $.unformat.call($t,$($t.rows[i].cells[pos]),{rowId:$t.rows[i].id, colModel:$t.p.colModel[pos]},pos);
							} catch (exception) {
								val = htmlDecode($t.rows[i].cells[pos].innerHTML);
							}
							if(mathopr) {
								v = parseFloat(val);
								if(!isNaN(v)) {
									sum += v;
									if (max === undefined) {max = min = v;}
									min = Math.min(min, v);
									max = Math.max(max, v);
									dlen++;
								}
							}
							else if(obj) { ret.push( {id:$t.rows[i].id,value:val} ); }
							else { ret.push( val ); }
						}
						i++;
					}
					if(mathopr) {
						switch(mathopr.toLowerCase()){
							case 'sum': ret =sum; break;
							case 'avg': ret = sum/dlen; break;
							case 'count': ret = (ln-1); break;
							case 'min': ret = min; break;
							case 'max': ret = max; break;
						}
					}
				}
			}
		});
		return ret;
	},
	clearGridData : function(clearfooter) {
		return this.each(function(){
			var $t = this, p = $t.p, gridIdEscaped = jqID(p.id);
			if(!$t.grid) {return;}
			if(typeof clearfooter !== 'boolean') { clearfooter = false; }
			$($t).unbind(".jqGridFormatter");
			if(p.deepempty) {$("#"+gridIdEscaped+" tbody:first tr:gt(0)").remove();}
			else {
				var trf = $("#"+gridIdEscaped+" tbody:first tr:first")[0];
				$("#"+gridIdEscaped+" tbody:first").empty().append(trf);
			}
			if(p.footerrow && clearfooter) { $(".ui-jqgrid-ftable td",$t.grid.sDiv).html("&#160;"); }
			p.selrow = null;
			clearArray(p.selarrrow); // p.selarrrow= [];
			clearArray(p.savedRow); // p.savedRow = [];
			p.records = 0;
			p.page=1;
			p.lastpage=0;
			p.reccount=0;
			clearArray(p.data); // $t.p.data = [];
			clearArray(p.lastSelectedData); // p.lastSelectedData = [];
			p._index = {};
			$t.updatepager(true,false);
		});
	},
	getInd : function(rowid,rc){
		var ret =false,rw;
		this.each(function(){
			rw = $(this).jqGrid('getGridRowById', rowid);
			if(rw) {
				ret = rc===true ? rw: rw.rowIndex;
			}
		});
		return ret;
	},
	bindKeys : function( settings ){
		var o = $.extend({
			onEnter: null,
			onSpace: null,
			onLeftKey: null,
			onRightKey: null,
			scrollingRows : true
		},settings || {});
		return this.each(function(){
			var $t = this, p = $t.p;
			if( !$('body').is('[role]') ){$('body').attr('role','application');}
			p.scrollrows = o.scrollingRows;
			$($t).keydown(function(event){
				var target = $($t).find('tr[tabindex=0]')[0], id, r, mind,
				expanded = p.treeReader.expanded_field;
				//check for arrow keys
				if(target) {
					mind = p._index[stripPref(p.idPrefix, target.id)];
					if(event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40){
						// up key
						if(event.keyCode === 38 ){
							r = target.previousSibling;
							id = "";
							if(r) {
								if($(r).is(":hidden")) {
									while(r) {
										r = r.previousSibling;
										if(!$(r).is(":hidden") && $(r).hasClass('jqgrow')) {id = r.id;break;}
									}
								} else {
									id = r.id;
								}
							}
							$($t).jqGrid('setSelection', id, true, event);
							event.preventDefault();
						}
						//if key is down arrow
						if(event.keyCode === 40){
							r = target.nextSibling;
							id ="";
							if(r) {
								if($(r).is(":hidden")) {
									while(r) {
										r = r.nextSibling;
										if(!$(r).is(":hidden") && $(r).hasClass('jqgrow') ) {id = r.id;break;}
									}
								} else {
									id = r.id;
								}
							}
							$($t).jqGrid('setSelection', id, true, event);
							event.preventDefault();
						}
						// left
						if(event.keyCode === 37 ){
							if(p.treeGrid && p.data[mind][expanded]) {
								$(target).find("div.treeclick").trigger('click');
							}
							$($t).triggerHandler("jqGridKeyLeft", [p.selrow]);
							if($.isFunction(o.onLeftKey)) {
								o.onLeftKey.call($t, p.selrow);
							}
						}
						// right
						if(event.keyCode === 39 ){
							if(p.treeGrid && !p.data[mind][expanded]) {
								$(target).find("div.treeclick").trigger('click');
							}
							$($t).triggerHandler("jqGridKeyRight", [p.selrow]);
							if($.isFunction(o.onRightKey)) {
								o.onRightKey.call($t, p.selrow);
							}
						}
					}
					//check if enter was pressed on a grid or treegrid node
					else if( event.keyCode === 13 ){
						$($t).triggerHandler("jqGridKeyEnter", [p.selrow]);
						if($.isFunction(o.onEnter)) {
							o.onEnter.call($t, p.selrow);
						}
					} else if(event.keyCode === 32) {
						$($t).triggerHandler("jqGridKeySpace", [p.selrow]);
						if($.isFunction(o.onSpace)) {
							o.onSpace.call($t, p.selrow);
						}
					}
				}
			});
		});
	},
	unbindKeys : function(){
		return this.each(function(){
			$(this).unbind('keydown');
		});
	},
	getLocalRow : function (rowid) {
		var ret = false, ind;
		this.each(function(){
			if(rowid !== undefined) {
				ind = this.p._index[stripPref(this.p.idPrefix, rowid)];
				if(ind >= 0 ) {
					ret = this.p.data[ind];
				}
			}
		});
		return ret;
	},
	progressBar : function ( p ) {
		p = $.extend({
			htmlcontent : "",
			method : "hide",
			loadtype : "disable" 
		}, p || {});
		return this.each(function(){
			var sh = p.method==="show" ? true : false, gridIdEscaped = jqID(this.p.id);
			if(p.htmlcontent !== "") {
				$("#load_"+gridIdEscaped).html( p.htmlcontent );
			}
			switch(p.loadtype) {
				case "disable":
					break;
				case "enable":
					$("#load_"+gridIdEscaped).toggle( sh );
					break;
				case "block":
					$("#lui_"+gridIdEscaped).toggle( sh );
					$("#load_"+gridIdEscaped).toggle( sh );
					break;
			}
		});
	},
	setColWidth: function (iCol, newWidth, adjustGridWidth) {
		return this.each(function () {
			var self = this, $self = $(self), grid = self.grid, p = self.p, colModel = p.colModel, colName, i, nCol;
			if (typeof iCol === "string") {
				// the first parametrer is column name instead of index
				colName = iCol;
				for (i = 0, nCol = colModel.length; i < nCol; i++) {
					if (colModel[i].name === colName) {
						iCol = i;
						break;
					}
				}
				if (i >= nCol) {
					return; // error: non-existing column name specified as the first parameter
				}
			} else if (typeof iCol !== "number") {
				return; // error: wrong parameters
			}
			grid.headers[iCol].newWidth = newWidth;
			grid.newWidth = p.tblwidth + newWidth - grid.headers[iCol].width;
			grid.resizeColumn(iCol, true);
			if (adjustGridWidth !== false) {
				$self.jqGrid("setGridWidth", grid.newWidth, false); // adjust grid width too
			}
		});
	},
	getAutoResizableWidth: function (iCol) {
		var self = this;
		if (self.length === 0) {
			return -1;
		}
		self = self[0];
		var rows = self.rows, row, cell, iRow, $cell, $cellFirstChild,
			p = self.p,
			cm = p.colModel[iCol],
			$th = $($(self.grid.hDiv).find(".ui-jqgrid-labels>.ui-th-column")[iCol]),
			$thDiv = $th.find(">div"),
			thPaddingLeft = parseFloat($th.css("padding-left") || 0),
			thPaddingRight = parseFloat($th.css("padding-right") || 0),
			$incosDiv = $thDiv.find("span.s-ico"),
			$wrapper = $thDiv.find(">." + p.autoResizing.wrapperClassName),
			wrapperOuterWidth = $wrapper.outerWidth(),
			wrapperCssWidth = parseFloat($wrapper.css("width") || 0),
			widthOuter = 0,
			colWidth = 0,
			compact = (cm.autoResizing != null && cm.autoResizing.compact !== undefined) ? cm.autoResizing.compact: p.autoResizing.compact,
			wrapperClassName = p.autoResizing.wrapperClassName;

		if (cm == null || !cm.autoResizable || $wrapper.length === 0 || cm.hidden || cm.fixed) {
			return -1; // do nothing
		}
		if (!compact || $incosDiv.is(":visible") || ($incosDiv.css("display") !== "none")) {  //|| p.viewsortcols[0]
			colWidth = p.autoResizing.widthOfVisiblePartOfSortIcon; // $incosDiv.width() can be grater as the visible part of icon
			if ($thDiv.css("text-align") === "center") {
				colWidth += colWidth; // *2
			}
			if (p.viewsortcols[1] === "horizontal") {
				colWidth += colWidth; // *2
			}
		}
		colWidth += wrapperOuterWidth + thPaddingLeft +
				(wrapperCssWidth === wrapperOuterWidth ? thPaddingLeft + thPaddingRight : 0) +
				parseFloat($thDiv.css("margin-left") || 0) + parseFloat($thDiv.css("margin-right") || 0);
		for (iRow = 0, rows = self.rows; iRow < rows.length; iRow++) {
			row = rows[iRow];
			cell = row.cells[iCol];
			$cell = $(row.cells[iCol]);
			if ($(row).hasClass("jqgrow") && cell != null) {
				$cellFirstChild = $(cell.firstChild);
				if ($cellFirstChild.hasClass(wrapperClassName)) {
					colWidth = Math.max(colWidth, $cellFirstChild.outerWidth() + widthOuter);
				} else if (p.treeGrid && p.ExpandColumn === cm.name) {
					$cellFirstChild = $cell.children(".cell-wrapper,.cell-wrapperleaf");
					colWidth = Math.max(colWidth, $cellFirstChild.outerWidth() + widthOuter + $cell.children(".tree-wrap").outerWidth());						
				}
			} else if ($(row).hasClass("jqgfirstrow")) {
				widthOuter = (jgrid.cell_width ? parseFloat($cell.css("padding-left") || 0) + parseFloat($cell.css("padding-right") || 0) : 0) +
						parseFloat($cell.css("border-right") || 0) +
						parseFloat($cell.css("border-left") || 0);
			}
		}
		colWidth = Math.max(colWidth,
			cm.autoResizing != null && cm.autoResizing.minColWidth !== undefined ?
			cm.autoResizing.minColWidth :
			p.autoResizing.minColWidth);
		return Math.min(
			colWidth,
			cm.autoResizing != null && cm.autoResizing.maxColWidth !== undefined ?
				cm.autoResizing.maxColWidth :
				p.autoResizing.maxColWidth
		);
	},
	autoResizeColumn: function (iCol) {
		return this.each(function () {
			var self = this, $self = $(this), p = self.p, cm = p.colModel[iCol], widthOrg,
				$th = $($(self.grid.hDiv).find(".ui-jqgrid-labels>.ui-th-column")[iCol]),
				newWidth = $self.jqGrid("getAutoResizableWidth", iCol);

			if (cm == null || newWidth < 0) {
				return;
			}
			$self.jqGrid("setColWidth", iCol, newWidth, p.autoResizing.adjustGridWidth && !p.autoResizing.fixWidthOnShrink);
			if (p.autoResizing.fixWidthOnShrink && p.shrinkToFit) {
				cm.fixed = true;
				widthOrg = cm.widthOrg; // save the value in temporary variable
				cm.widthOrg = cm.width; // to force not changing of the column width
				$self.jqGrid("setGridWidth", p.width, true);
				cm.widthOrg = widthOrg;
				cm.fixed = false;
			}
			$th.data("autoResized", "true");
		});
	},
	autoResizeAllColumns: function () {
		return this.each(function () {
			var $self = $(this), p = this.p, colModel = p.colModel, nCol = colModel.length, iCol, cm,
				shrinkToFit = p.shrinkToFit, // save the original shrinkToFit value in the grid
				adjustGridWidth = p.autoResizing.adjustGridWidth,
				fixWidthOnShrink = p.autoResizing.fixWidthOnShrink,
				width = parseInt(p.widthOrg,10),
				autoResizeColumn = jgrid.getMethod("autoResizeColumn"); // cache autoResizeColumn reference
				
			//    1) Analyse colModel, colNames properties and sortname parameter to calculate
			//       minimal and optimal width of every column and the grid. It could be
			//       some important cases which should be 
			//      a) The current width of the grid is LESS then optimal width and resizable column don't have fixed:true property.
			//         1. save widthOrg of the resizable column in temporary variable
			//         2. set widthOrg property of the resizable column to optimal size and set additionally fixed:true
			//         3. call setGridWidth with the CURRENT grid width to change shrink width of all fixed:false

			p.shrinkToFit = false; // make no shrinking during resizing of any columns 
			p.autoResizing.adjustGridWidth = true;
			p.autoResizing.fixWidthOnShrink = false;
			for (iCol = 0; iCol < nCol; iCol++) {
				cm = colModel[iCol];
				if (cm.autoResizable && cm.formatter !== "actions") {
					autoResizeColumn.call($self, iCol);
				}
			}
			if (!isNaN(width)) {
				$(this).jqGrid("setGridWidth", width, false);
			}
			// restore the original shrinkToFit value
			p.autoResizing.fixWidthOnShrink = fixWidthOnShrink;
			p.autoResizing.adjustGridWidth = adjustGridWidth;
			p.shrinkToFit = shrinkToFit;
		});
	}
});
}(jQuery));
