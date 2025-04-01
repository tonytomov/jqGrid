/**
*
* @license Guriddo jqGrid JS - v5.8.9 - 2025-04-01
* Copyright(c) 2008, Tony Tomov, tony@trirand.com
* 
* License: http://guriddo.net/?page_id=103334
*/
(function( factory ) {
	"use strict";
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define([ 
			"jquery"
		], factory );
 	} else {
		// Browser globals
		factory( jQuery );
 	}
}(function( $ ) {
"use strict";
//module begin
$.jgrid = $.jgrid || {};
if(!$.jgrid.hasOwnProperty("defaults")) {
	$.jgrid.defaults = {};
}
$.extend($.jgrid,{
	version : "5.8.9",
	isNull : function( p, strict_eq) {
		if(strict_eq && strict_eq === true) {
			return p === null;
		} else {
			return p == null;
		}
	},
	trim : function (x) {
		if(typeof x === "string") {
			return x.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		} else {
			return x;
		}
	},
	isFunction : function (x){
		return typeof x === 'function';
	},
	type : function (obj, fullClass) {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
		if (fullClass) {
			return (obj === null) ? '[object Null]' : Object.prototype.toString.call(obj);
		}
		if (obj == null) { return (obj + '').toLowerCase(); } // implicit toString() conversion
		var deepType = Object.prototype.toString.call(obj).slice(8,-1).toLowerCase();
		if (deepType === 'generatorfunction') { return 'function'; }
		return deepType.match(/^(array|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType :
			(typeof obj === 'object' || typeof obj === 'function') ? 'object' : typeof obj;
	},	
	floatNum : function(val, defval) {
		if( defval === undefined ) {
			defval = 0;
		}
		val = parseFloat(val);
		return !isNaN(val) ?  val : defval;
	},
	htmlDecode : function(value){
		if(value && (value==='&nbsp;' || value==='&#160;' || (value.length===1 && value.charCodeAt(0)===160))) { return "";}
		return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
	},
	htmlEncode : function (value){
		return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	template : function(format){ //jqgformat
		var args = $.makeArray(arguments).slice(1), j, al = args.length;
		if( $.jgrid.isNull(format) ) { 
			format = ""; 
		}
		return format.replace(/\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g, function(m,i){
			if(!isNaN(parseInt(i,10))) {
				return args[parseInt(i,10)];
			}
			for(j=0; j < al;j++) {
				if(Array.isArray(args[j])) {
					var nmarr = args[ j ],
					k = nmarr.length;
					while(k--) {
						if(i===nmarr[k].nm) {
							return nmarr[k].v;
						}
					}
				} else if(typeof args[j] === 'object' && args[j][i]) {
					return $.jgrid.isFunction(args[j][i]) ? args[j][i]() : args[j][i];
				}
			}
		});
	},
	msie : function () {
		return $.jgrid.msiever() > 0;
	},
	msiever : function () {
		var rv = 0,
		sAgent = window.navigator.userAgent,
		Idx = sAgent.indexOf("MSIE");

		if (Idx > 0)  {
			rv = parseInt(sAgent.substring(Idx+ 5, sAgent.indexOf(".", Idx)));
		} else if ( !!navigator.userAgent.match(/Trident\/7\./) ) {
			rv = 11;
		}
		return rv;
	},
	getCellIndex : function (cell) {
		var c = $(cell);
		if (c.is('tr')) { return -1; }
		c = (!c.is('td') && !c.is('th') ? c.closest("td,th") : c)[0];
		if ($.jgrid.msie()) { return $.inArray(c, c.parentNode.cells); }
		return c.cellIndex;
	},
	stripHtml : function(v) {
		v = String(v);
		var regexp = /<("[^"]*"|'[^']*'|[^'">])*>/gi;
		if (v) {
			v = v.replace(regexp,"");
			return (v && v !== '&nbsp;' && v !== '&#160;') ? v.replace(/\"/g,"'") : "";
		}
		return v;
	},
	stripPref : function (pref, id) {
		var obj = $.jgrid.type( pref );
		if( obj === "string" || obj === "number") {
			pref =  String(pref);
			id = pref !== "" ? String(id).replace(String(pref), "") : id;
		}
		return id;
	},
	stripScript : function( v ) {
		return v.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
	},
	useJSON : true,
	runCode : function (obj){	
		return Function('"use strict";return (' + obj + ')')();
	},
	parse : function(jsonString) {
		var js = jsonString;
		if (js.slice(0,9) === "while(1);") { js = js.slice(9); }
		if (js.slice(0,2) === "/*") { js = js.slice(2,js.length-2); }
		if(!js) { js = "{}"; }
		return ($.jgrid.useJSON===true && typeof JSON === 'object' && typeof JSON.parse === 'function') ?
			JSON.parse(js) :
			$.jgrid.runCode( js );
			//eval('(' + js + ')');
	},
	dateToOADate :function  (date) {
		// Add 1462 in 1904 system (apple)
		var temp = new Date(date);
		// Set temp to start of day and get whole days between dates,
		var days = Math.round((temp.setHours(0,0,0,0) - new Date(1899, 11, 30)) / 8.64e7);
		// Get decimal part of day, OADate always assumes 24 hours in day
		var partDay = (Math.abs((date - temp) % 8.64e7) / 8.64e7).toFixed(10);
		return days + partDay.slice(1);
	},
	parseDate : function(format, date, newformat, opts) {
		var	token = /\\.|[dDjlNSwzWFmMntLoYyaABgGhHisueIOPTZcrU]/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		msDateRegExp = new RegExp("^\/Date\\((([-+])?[0-9]+)(([-+])([0-9]{2})([0-9]{2}))?\\)\/$"),
		msMatch = ((typeof date === 'string') ? date.match(msDateRegExp): null),
		pad = function (value, length) {
			value = String(value);
			length = parseInt(length,10) || 2;
			while (value.length < length)  { value = '0' + value; }
			return value;
		},
		insStr = function( value, pos, ch) {
			value = String(value);
			return value.slice(0, pos) + ch + value.slice(pos);
		},
		ts = {m : 1, d : 1, y : 1970, h : 0, i : 0, s : 0, u:0},
		timestamp=0, dM, k,hl,
		h12to24 = function(ampm, h){
			if (ampm === 0){ if (h === 12) { h = 0;} }
			else { if (h !== 12) { h += 12; } }
			return h;
		},
		offset =0;
		if(opts === undefined) {
			opts = $.jgrid.getRegional(this, "formatter.date");//$.jgrid.formatter.date;
		}
		// old lang files
		if(opts === undefined) {
			opts = {};
		}
		if(opts.parseRe === undefined ) {
			opts.parseRe = /[#%\\\/:_;.,\t\s-]/;
		}
		if(opts.AmPm === undefined ) {
			opts.AmPm = ["am","pm","AM","PM"];
		}
		if( opts.masks && opts.masks.hasOwnProperty(format) ) { format = opts.masks[format]; }
		if(date && !$.jgrid.isNull( date ) ) {
			if( !isNaN( date - 0 ) && String(format).toLowerCase() === "u") {
				//Unix timestamp
				timestamp = new Date( parseFloat(date)*1000 );
				opts.validate = false;
			} else if(date.constructor === Date) {
				timestamp = date;
				opts.validate = false;
			} else if( msMatch !== null ) {
				// Microsoft date format support
				timestamp = new Date(parseInt(msMatch[1], 10));
				if (msMatch[3]) {
					offset = Number(msMatch[5]) * 60 + Number(msMatch[6]);
					offset *= ((msMatch[4] === '-') ? 1 : -1);
					offset -= timestamp.getTimezoneOffset();
					timestamp.setTime(Number(Number(timestamp) + (offset * 60 * 1000)));
				}
				opts.validate = false;
			} else {
				//Support ISO8601Long that have Z at the end to indicate UTC timezone
				if(opts.srcformat === 'ISO8601Long' && date.charAt(date.length - 1) === 'Z') {
					offset -= (new Date()).getTimezoneOffset();
				}
				date = String(date).replace(/\T/g,"#").replace(/\t/,"%").split(opts.parseRe);
				format = format.replace(/\T/g,"#").replace(/\t/,"%").split(opts.parseRe);
				// parsing for month names
				for(k=0,hl=format.length;k<hl;k++){
					switch ( format[k] ) {
						case 'M':
							dM = $.inArray(date[k],opts.monthNames);
							if(dM !== -1 && dM < 12){date[k] = dM+1; ts.m = date[k];}
							break;
						case 'F':
							dM = $.inArray(date[k],opts.monthNames,12);
							if(dM !== -1 && dM > 11){date[k] = dM+1-12; ts.m = date[k];}
							break;
						case 'n':
							format[k] = 'm';
							break;
						case 'j':
							format[k] = 'd';
							break;
						case 'a':
							dM = $.inArray(date[k],opts.AmPm);
							if(dM !== -1 && dM < 2 && date[k] === opts.AmPm[dM]){
								date[k] = dM;
								ts.h = h12to24(date[k], ts.h);
							}
							break;
						case 'A':
							dM = $.inArray(date[k],opts.AmPm);
							if(dM !== -1 && dM > 1 && date[k] === opts.AmPm[dM]){
								date[k] = dM-2;
								ts.h = h12to24(date[k], ts.h);
							}
							break;
						case 'g':
							ts.h = parseInt(date[k], 10);
							break;
					}
					if(date[k] !== undefined) {
						ts[format[k].toLowerCase()] = parseInt(date[k],10);
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
				if(offset !== 0) {
					timestamp.setTime(Number(Number(timestamp) + (offset * 60 * 1000)));
				}
			}
		} else {
			timestamp = new Date(ts.y, ts.m, ts.d, ts.h, ts.i, ts.s, ts.u);
		}
		if(opts && opts.validate === true ) { // validation
			var valid_date =  new Date(ts.y, (+ts.m), ts.d, ts.h, ts.i);
			return (Boolean(+valid_date) && valid_date.getDate() === ts.d && valid_date.getHours() === ts.h && valid_date.getMinutes() === ts.i);
		}
		if(opts.userLocalTime && offset === 0) {
			offset -= (new Date()).getTimezoneOffset();
			if( offset !== 0 ) {
				timestamp.setTime(Number(Number(timestamp) + (offset * 60 * 1000)));
			}
		}
		if( newformat === undefined ) {
			return timestamp;
		}
		if( opts.masks && opts.masks.hasOwnProperty(newformat) )  {
			newformat = opts.masks[newformat];
		} else if ( !newformat ) {
			newformat = 'Y-m-d';
		}
		var
			G = timestamp.getHours(),
			i = timestamp.getMinutes(),
			j = timestamp.getDate(),
			n = timestamp.getMonth() + 1,
			o = timestamp.getTimezoneOffset(),
			s = timestamp.getSeconds(),
			u = timestamp.getMilliseconds(),
			w = timestamp.getDay(),
			Y = timestamp.getFullYear(),
			N = (w + 6) % 7 + 1,
			z = (new Date(Y, n - 1, j) - new Date(Y, 0, 1)) / 86400000,
			flags = {
				// Day
				d: pad(j),
				D: opts.dayNames[w],
				j: j,
				l: opts.dayNames[w + 7],
				N: N,
				S: opts.S(j),
				//j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th',
				w: w,
				z: z,
				// Week
				W: N < 5 ? Math.floor((z + N - 1) / 7) + 1 : Math.floor((z + N - 1) / 7) || ((new Date(Y - 1, 0, 1).getDay() + 6) % 7 < 4 ? 53 : 52),
				// Month
				F: opts.monthNames[n - 1 + 12],
				m: pad(n),
				M: opts.monthNames[n - 1],
				n: n,
				t: '?',
				// Year
				L: '?',
				o: '?',
				Y: Y,
				y: String(Y).substring(2),
				// Time
				a: G < 12 ? opts.AmPm[0] : opts.AmPm[1],
				A: G < 12 ? opts.AmPm[2] : opts.AmPm[3],
				B: '?',
				g: G % 12 || 12,
				G: G,
				h: pad(G % 12 || 12),
				H: pad(G),
				i: pad(i),
				s: pad(s),
				u: u,
				// Timezone
				e: '?',
				I: '?',
				O: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				P: (o > 0 ? "-" : "+") + insStr( pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4), -2, ":"),
				T: (String(timestamp).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				Z: '?',
				// Full Date/Time
				c: '?',
				r: '?',
				U: Math.floor(timestamp / 1000)
			};
		return newformat.replace(token, function ($0) {
			return flags.hasOwnProperty($0) ? flags[$0] : $0.substring(1);
		});
	},
	jqID : function(sid){
		return String(sid).replace(/[!"#$%&'()*+,.\/:; <=>?@\[\\\]\^`{|}~]/g,"\\$&");
	},
	guid : 1,
	uidPref: 'jqg',
	randId : function( prefix )	{
		return (prefix || $.jgrid.uidPref) + ($.jgrid.guid++);
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
			} catch (e) {}
		}
		return ret;
	},
	getXmlData: function (obj, expr, returnObj) {
		var ret, m = typeof expr === 'string' ? expr.match(/^(.*)\[(\w+)\]$/) : null;
		if (typeof expr === 'function') { return expr(obj); }
		if (m && m[2]) {
			// m[2] is the attribute selector
			// m[1] is an optional element selector
			// examples: "[id]", "rows[page]"
			return m[1] ? $(m[1], obj).attr(m[2]) : $(obj).attr(m[2]);
		}
		ret = $(expr, obj);
		if (returnObj) { return ret; }
		//$(expr, obj).filter(':last'); // we use ':last' to be more compatible with old version of jqGrid
		return ret.length > 0 ? $(ret).text() : undefined;
	},
	cellWidth : function () {
		var $testDiv = $("<div class='ui-jqgrid' style='left:10000px'><table class='ui-jqgrid-btable ui-common-table' style='width:5px;'><tr class='jqgrow'><td style='width:5px;display:block;'></td></tr></table></div>"),
		testCell = $testDiv.appendTo("body")
			.find("td")
			.width();
		$testDiv.remove();
		return Math.abs(testCell-5) > 0.1;
	},
	isLocalStorage : function () {
		try {
			return 'localStorage' in window && window.localStorage !== null;
		} catch (e) {
			return false;
		}
	},
	getRegional : function(inst, param, def_val) {
		var ret;
		if(def_val !== undefined) {
			return def_val;
		}
		if(inst.p && inst.p.regional && $.jgrid.regional) {
				ret = $.jgrid.getAccessor( $.jgrid.regional[inst.p.regional] || {}, param);
		}
		if(ret === undefined ) {
			ret = $.jgrid.getAccessor( $.jgrid, param);
		}
		return ret;
	},
	isMobile : function() {
		try {
			if(/Android|webOS|iPhone|iPad|iPod|pocket|psp|kindle|avantgo|blazer|midori|Tablet|Palm|maemo|plucker|phone|BlackBerry|symbian|IEMobile|mobile|ZuneWP7|Windows Phone|Opera Mini/i.test(navigator.userAgent)) {
				return true;
			}
			return false;
		} catch(e)	{
			return false;
		}
	},
	cell_width : true,
	scrollbarWidth : function() {
		// http://jdsharp.us/jQuery/minute/calculate-scrollbar-width.php
		var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
		$('body').append(div);
		var w1 = $('div', div).innerWidth();
		div.css('overflow-y', 'scroll');
		var w2 = $('div', div).innerWidth();
		$(div).remove();
		return (w1 - w2) < 0 ? 18 : (w1 - w2);
	},
	scrollbarHeight : function() {
		var div = $('<div style="width:50px;overflow-x:scroll;position:absolute;top:-200px;left:-200px;"<span>1234567890</span></div>');
		$('body').append(div);
		var w1 = $(div).outerHeight();
		var w2 = $(div)[0].scrollHeight;
		$(div).remove();
		return (w1 - w2) < 0 ? 18 : (w1 - w2);
	},
	ajaxOptions: {},
	from : function(source){
		// Original Author Hugo Bonacci
		// License MIT http://jlinq.codeplex.com/license
		var $t = this,
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
		_this = "a_d_d_t_h_i_s",
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
				phrase.push("$.jgrid.trim(");
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
				phrase=$.jgrid.trim(phrase);
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
			if( (toString.call(a) === '[object Date]' && toString.call(b) === '[object Date]') || 
				(typeof a === "number" && typeof b === "number") ) {
				return a > b ? d : a < b ? -d : 0;
			}
			var ret = String(a).localeCompare(String(b));
			return ret < 0 ? -d : ret > 0 ? d : 0;
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
			var sortData=[],_sortData=[], newDir = dir==="a" ? 1 : -1, i,ab,j,
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
					return $.jgrid.parseDate.call($t, dfmt, $cell).getTime();
				};
			} else if($.jgrid.isFunction(type)) {
				findSortKey = type;
			} else {
				findSortKey = function($cell) {
					$cell = $cell ? $.jgrid.trim(String($cell)) : "";
					return _usecase ? $cell : $cell.toLowerCase();
				};
			}
			$.each(data,function(i,v){
				ab = by!=="" ? $.jgrid.getAccessor(v,by) : v;
				if(ab === undefined) { ab = ""; }
				ab = findSortKey(ab, v);
				_sortData.push({ 'vSort': ab,'index':i});
			});
			if($.jgrid.isFunction(sfunc)) {
				_sortData.sort(function(a,b){
					return sfunc.call(this,a.vSort, b.vSort, newDir, a, b);
				});
			} else {
				_sortData.sort(function(a,b){
					return self._compare(a.vSort, b.vSort,newDir);
				});
			}
			j=0;
			var nrec= data.length;
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
			last=null, val;
			$.each(self._getOrder(data,by,dir,type, dfmt),function(i,v){
				val = $.jgrid.getAccessor(v, by);
				if($.jgrid.isNull(val)) { val = ""; }
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
			const re = new RegExp(`${_this}`, 'g');
			$.each(_data,function(){
				if($.jgrid.runCode.call($t, match.replace(re, JSON.stringify(this)) ) ){ //eval(match)
					results.push(this);
				}
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
			if($.jgrid.isFunction(f)){
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
			self._append(_this+"."+f);
			self._resetNegate();
			return self;
		};
		this._compareValues=function(func,f,v,how,t){
			var fld;
			if(_useProperties){
				fld='jQuery.jgrid.getAccessor('+_this+',\''+f+'\')'; 
			}else{
				fld=_this; 
			}
			if(v===undefined) { v = null; }
			//var val=v===null?f:v,
			var val =v,
			swst = t.stype === undefined ? "text" : t.stype;
			if(v !== null) {
			switch(swst) {
				case 'int':
				case 'integer':
					val = (isNaN(Number(val)) || val==="") ? Number.NEGATIVE_INFINITY : val; // To be fixed with more inteligent code
					fld = 'parseInt('+fld+',10)';
					val = 'parseInt('+val+',10)';
					break;
				case 'float':
				case 'number':
				case 'numeric':
					val = String(val).replace(_stripNum, '');
					val = (isNaN(Number(val)) || val==="") ? Number.NEGATIVE_INFINITY : Number(val); // To be fixed with more inteligent code
					fld = 'parseFloat('+fld+')';
					val = 'parseFloat('+val+')';
					break;
				case 'date':
				case 'datetime':
					val = String($.jgrid.parseDate.call($t, t.srcfmt || 'Y-m-d',val).getTime());
					fld = 'jQuery.jgrid.parseDate.call(jQuery("#'+$.jgrid.jqID($t.p.id)+'")[0],"'+t.srcfmt+'",'+fld+').getTime()';
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
			//var val = $.jgrid.isNull(v) ? f: v,
			//length=_trim ? $.jgrid.trim(val.toString()).length : val.toString().length;
			if(_useProperties	){ 
				//self._append(self._getStr('jQuery.jgrid.getAccessor(this,\''+f+'\')')+'.slice(0,'+length+') == '+self._getStr('"'+self._toStr(v)+'"'));
				self._append(self._getStr('jQuery.jgrid.getAccessor('+_this+',\''+f+'\')')+'.startsWith('+self._getStr('"'+self._toStr(v)+'"')+')');
			}else{
				//if ( !$.jgrid.isNull(v) ) { length=_trim?$.jgrid.trim(v.toString()).length:v.toString().length; }
				self._append(self._getStr(_this)+'.startsWith(' +self._getStr('"'+self._toStr(f)+'"')+')');
			}
			self._setCommand(self.startsWith,f);
			self._resetNegate();
			return self;
		};
		this.endsWith=function(f,v){
			//var val = $.jgrid.isNull(v) ? f: v,
			//length=_trim ? $.jgrid.trim(val.toString()).length:val.toString().length;
			if(_useProperties){
				//self._append(self._getStr('jQuery.jgrid.getAccessor(this,\''+f+'\')')+'.substr('+self._getStr('jQuery.jgrid.getAccessor(this,\''+f+'\')')+'.length-'+length+','+length+') == "'+self._toStr(v)+'"');
				self._append(self._getStr('jQuery.jgrid.getAccessor('+_this+',\''+f+'\')')+'.endsWith('+self._getStr('"'+self._toStr(v)+'"')+')');
			} else {
				//self._append(self._getStr('this')+'.substr('+self._getStr('this')+'.length-"'+self._toStr(f)+'".length,"'+self._toStr(f)+'".length) == "'+self._toStr(f)+'"');
				self._append(self._getStr(_this)+'.endsWith(' +self._getStr('"'+self._toStr(f)+'"')+')');
			}
			self._setCommand(self.endsWith,f);
			self._resetNegate();
			return self;
		};
		this.contains=function(f,v){
			if(_useProperties){
				self._append(self._getStr('jQuery.jgrid.getAccessor('+_this+',\''+f+'\')')+'.indexOf("'+self._toStr(v)+'",0) > -1');
			}else{
				self._append(self._getStr(_this)+'.indexOf("'+self._toStr(f)+'",0) > -1');
			}
			self._setCommand(self.contains,f);
			self._resetNegate();
			return self;
		};
		this.user=function(op, f, v){
			var _a = '$("#'+$t.p.id+'")[0]';
			self._append(_a + '.p.customFilterDef.' + op + '.action.call('+_a+' ,{rowItem:'+_this+', searchName:"' + f + '",searchValue:"' + v + '"})');
			self._setCommand(self.user,f);
			self._resetNegate();
			return self;
		};
		this.inData = function (f, v, t) {
			var vl =  v === undefined ? "" : self._getStr("\"" + self._toStr(v) + "\"");
			if( _useProperties ) {
				self._append(vl + '.split(\''+',' + '\')' + '.indexOf( jQuery.jgrid.getAccessor('+_this+',\''+f+'\') ) > -1');
			} else {
				self._append(vl + '.split(\''+',' + '\')' + '.indexOf('+_this+'.'+f+') > -1');
			}
			self._setCommand(self.inData, f);
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
			dir = $.jgrid.isNull(dir) ? "a" :$.jgrid.trim(dir.toString().toLowerCase());
			if( $.jgrid.isNull(stype) ) { stype = "text"; }
			if( $.jgrid.isNull(dfmt) ) { dfmt = "Y-m-d"; }
			if( $.jgrid.isNull(sfunc) ) { sfunc = false; }
			if(dir==="desc"||dir==="descending"){dir="d";}
			if(dir==="asc"||dir==="ascending"){dir="a";}
			_sorting.push({by:by,dir:dir,type:stype, datefmt: dfmt, sfunc: sfunc});
			return self;
		};
		return self;
		};
	return new QueryObject(source,null);
	},
	getMethod: function (name) {
        return this.getAccessor($.fn.jqGrid, name);
	},
	extend : function(methods) {
		$.extend($.fn.jqGrid,methods);
		if (!this.no_legacy_api) {
			$.fn.extend(methods);
		}
	},
	clearBeforeUnload : function( jqGridId ) {
		var $t = $("#"+$.jgrid.jqID( jqGridId ))[0], grid;
		if(!$t.grid) { return;}
		grid = $t.grid;
		if ($.jgrid.isFunction(grid.emptyRows)) {
			grid.emptyRows.call($t, true, true); // this work quick enough and reduce the size of memory leaks if we have someone
		}

		$(document).off("mouseup.jqGrid" + $t.p.id );
		$(grid.hDiv).off("mousemove"); // TODO add namespace
		$($t).off();
		var i, l = grid.headers.length,
		removevents = ['formatCol','sortData','updatepager','refreshIndex','setHeadCheckBox','constructTr','formatter','addXmlData','addJSONData','grid','p', 'addLocalData'];
		for (i = 0; i < l; i++) {
			grid.headers[i].el = null;
		}

		for( i in grid) {
			if( grid.hasOwnProperty(i)) {
				grid[i] = null;
			}
		}
		// experimental
		for( i in $t.p) {
			if($t.p.hasOwnProperty(i)) {
				$t.p[i] = Array.isArray($t.p[i]) ? [] : null;
			}
		}
		l = removevents.length;
		for(i = 0; i < l; i++) {
			if($t.hasOwnProperty(removevents[i])) {
				$t[removevents[i]] = null;
				delete($t[removevents[i]]);
			}
		}
	},
	gridUnload : function ( jqGridId ) {
		if(!jqGridId) { return; }
		jqGridId = $.jgrid.trim(jqGridId);
		if(jqGridId.indexOf("#") === 0) {
			jqGridId = jqGridId.substring(1);
		}

		var $t = $("#"+ $.jgrid.jqID(jqGridId))[0];
		if ( !$t.grid ) {return;}
		var defgrid = {id: $($t).attr('id'),cl: $($t).attr('class')};
		if ($t.p.pager) {
			$($t.p.pager).off().empty().removeClass("ui-state-default ui-jqgrid-pager ui-corner-bottom");
		}
		var newtable = document.createElement('table');
		newtable.className = defgrid.cl;
		var gid = $.jgrid.jqID($t.id);
		$(newtable).removeClass("ui-jqgrid-btable ui-common-table").insertBefore("#gbox_"+gid);
		if( $($t.p.pager).parents("#gbox_"+gid).length === 1 ) {
			$($t.p.pager).insertBefore("#gbox_"+gid);
		}
		$.jgrid.clearBeforeUnload( jqGridId );
		$("#gbox_"+gid).remove();
		$(newtable).attr({id:defgrid.id});
		$("#alertmod_"+$.jgrid.jqID(jqGridId)).remove();
	},
	gridDestroy : function ( jqGridId ) {
		if(!jqGridId) { return; }
		jqGridId = $.jgrid.trim(jqGridId);
		if(jqGridId.indexOf("#") === 0) {
			jqGridId = jqGridId.substring(1);
		}
		var $t = $("#"+ $.jgrid.jqID(jqGridId))[0];
		if ( !$t || !$t.grid ) {return;}
		if ( $t.p.pager ) { // if not part of grid
			$($t.p.pager).remove();
		}
		try {
			$.jgrid.clearBeforeUnload( jqGridId );
			$("#gbox_"+$.jgrid.jqID(jqGridId)).remove();
		} catch (_) {}
	},
	isElementInViewport : function(el) {
		var rect = el.getBoundingClientRect();
		return (
			rect.left >= 0 &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	},
	getTextWidth : function(text, font) {
		if (!jQuery._cacheCanvas) {
			var canvas = document.createElement('canvas');
			var docFragment = document.createDocumentFragment();
			docFragment.appendChild(canvas);
			jQuery._cacheCanvas = canvas.getContext("2d");
		}
		if(font) {
			jQuery._cacheCanvas.font = font;
		}
		return jQuery._cacheCanvas.measureText( $.jgrid.stripHtml( text ) ).width;
	},
	getFont : function (instance) {
		var getfont = window.getComputedStyle( instance, null );
		return getfont.getPropertyValue( 'font-style' ) + " " +
				getfont.getPropertyValue( 'font-variant' ) + " " +
				getfont.getPropertyValue( 'font-weight' ) + " " +
				getfont.getPropertyValue( 'font-size' ) + " " +
				getfont.getPropertyValue( 'font-family');
	},
	setSelNavIndex : function ($t,  selelem ) {
		var cels = $(".ui-pg-button",$t.p.pager);
		$.each(cels, function(i,n) {
			if(selelem===n) {
				$t.p.navIndex = i;
				return false;
			}
		});
		$(selelem).attr("tabindex","0");		
	},
	splitSearch : function (p) {
		/*
		p : {
			mergeOper : 'OR',
			filterInput : null,
			filterToolbar : null,
			searchGrid : null
		}
		 */
		var rules = "{\"groupOp\":\"" + p.mergeOper + "\",\"groups\":[", i=0; //],\"groups\":[
		for( var property in p) {
			if(p.hasOwnProperty(property)) {
				if(property !== 'mergeOper') {
					rules += (p[property] !== null && p[property] !== "" && typeof p[property] !=='boolean' ) ? p[property] + ",": "";
					i++;
				}
			}
		}
		if( rules.indexOf("[", rules.length - "[".length)  === -1 ) {
			rules = rules.slice(0, -1);
		}
		rules += "]}";
		return rules;
	},
	getElemByAttrVal : function( elem, attr, value, position) {
		if( typeof position !== 'boolean' ) {
			position = false;
		}
		var len = Array.isArray(elem) ? elem.length : 0, i=0, ret = {}, pos = -1;
		if( len > 0 ) {
			while( i < len) {
				if( elem[i][attr] === value) {
					ret = elem[i];
					pos = i;
					break;
				}
				i++;
			}
		}
		return position ? pos : ret;
	},
	searchColOnEnter : function(gridid, rid, t, e ) {
		var tb = $("#"+gridid)[0], i;
		if(!tb.grid) {
			return;
		}
		var opt = tb.p.searchColOptions, res, val, frozen= false;
		try {
			val = t.value;
		} catch (e1){
			val = "";
		}
		if(tb.p.frozenColumns) {
			$(tb).jqGrid('destroyFrozenColumns');
			frozen = true;
		}
		if(!tb.p._ftsc) {
			// store originally hidden columns
			tb.p._ftsc = true;
			tb.p._fthc = [];
			tb.p._avc =[];
			for(i=0; i<tb.p.colModel.length; i++) {
				if(tb.p.colModel[i].hidden) {
					tb.p._fthc.push(tb.p.colModel[i].name);
				} else {
					tb.p._avc.push(tb.p.colModel[i].name);
				}
			}
			tb.p._results = {};
		}// else {
		//}
		var _cnth = [...new Set([...opt._cnth ,...opt.visibleColumns])], // exclude search here
				_cnthSet = new Set([..._cnth,...tb.p._fthc]); // add hidden columns
		//$(tb).jqGrid('hideCol',tb.p._avc.filter(x=>!_cnth.includes(x)));
		$(tb).jqGrid('hideCol',tb.p._avc.filter(function(x) { 
			return !_cnth.includes(x);
		}));
		
		//======================================================================
		function get_result (id) {
			var datarow = $(tb).jqGrid('getRowData', id), vall;
			var _cts =[];
			if(datarow && val) {
				for(var key in datarow) {
					if(!_cnthSet.has(key)) {
						if(datarow.hasOwnProperty(key)) {
							vall = val;
							if(!opt.useCase) {
								datarow[key] = datarow[key].toLowerCase();
								vall = val.toLowerCase();
							} 
							if(opt.aOperands.includes(opt.operand)) {
								switch( opt.operand) {
									case 'cn': // contain
										res = datarow[key].search(vall) !== -1; // find the column containing the search str
										break;
										case 'eq': // equal
										res = datarow[key] === vall;
										break;
									case 'ne': // not equal
										res = datarow[key] !== vall;
										break;
									case 'bw': // startWith
										res = datarow[key].substring(0, vall.length) === vall;
										break;
									case 'ew': // endWith
										var this_len = datarow[key].length;
										res = datarow[key].substring(this_len - vall.length, this_len) === vall;
									break;
								}
							}
							if(res) {
								_cts.push(key);
							}
						}
					}
				}
				tb.p._results[id] = {v:val, r:_cts};
			} else if(datarow && val==="") {
				if(tb.p._results[id]) {
					delete tb.p._results[id];
				}
			}
		}
		//======================================================================
		
		if(tb.grid && (rid === null || rid === undefined) ) { // reload
			for(var key in tb.p._results) {
				if(tb.p._results.hasOwnProperty(key)) {
					val = tb.p._results[key].v;
					get_result (key);
				}
			}
		} else if(tb.grid && (rid !== null || rid !== undefined)) {
			get_result (rid);
		}
		var to_show = [], count = 0;
		for(i in tb.p._results) {
			if(opt.searchOp.toUpperCase() === "OR") {
				to_show = [...new Set([...to_show, ...tb.p._results[i].r])]; // use union to meet OR
			} else if(opt.searchOp.toUpperCase() === "AND") {
				if(count===0) {
					to_show = tb.p._results[i].r;
				} else {
					//to_show = to_show.filter(x => tb.p._results[i].r.includes(x)); // use intersection
					to_show = to_show.filter( function(x) { return  tb.p._results[i].r.includes(x); }); // use intersection
				}
				count++;
			}
		}
		if($.isEmptyObject(tb.p._results)) { // if nosearch show all
			to_show = tb.p._avc;
		}
		var swap = to_show.concat(_cnth);

		$(tb).jqGrid('showCol',swap);
		if(frozen) { // for future processing
			$(tb).jqGrid('setFrozenColumns');
		}
		/// let intersection = arrA.filter(x => arrB.includes(x));
		/// let difference = arrA.filter(x => !arrB.includes(x));
		/// let difference = arrA
                 //.filter(x => !arrB.includes(x))
                 //.concat(arrB.filter(x => !arrA.includes(x)));
				 
		/// let union = [...new Set([...arrA, ...arrB])];
	},
	searchColOnKey : function(gridid, rid, t, e ) {
		switch(e.key) {
			case 'ArrowRight':
			case 'ArrowDown':
			case 'ArrowUp':
			case 'ArrowLeft':
			case 'PageUp':
			case 'PageDown':
			case 'Alt':
			case 'Control':
			case 'Tab':
			case 'Escape':
			case 'Shift':
				return;
			default :
		}
		setTimeout(function() {
			$.jgrid.searchColOnEnter(gridid, rid, t,e);
		}, 50);
	},
	comboGrid : function ( elemId, opt, gridopt ) {
		/*
		opt  = {
			data : "", // string, array or function
			return_fld : "", //string or function
			deaultSearch : "bw"
		};
		*/
		var gridId =  $.jgrid.randId("combo");
		var divId = "div"+gridId;
		var save_datatype = gridopt.datatype;
		gridopt.datatype = 'local';
		gridopt.onSelectRow = function(id) {
			var srow = $("#"+gridId).jqGrid('getRowData',id);
			if(!$.isEmptyObject(srow)) {
				var ret = $.jgrid.isFunction( opt.return_fld ) ? opt.return_fld.call(this, srow) : srow[opt.return_fld];
				$("#"+elemId).val( ret );
				$("#"+divId).hide();
			}
		};
		gridopt.data = [];
		gridopt.scrollrows = true;
		$('body').append("<div id='"+divId+"'><table id='"+gridId+"'></table>");
		if(gridopt.pager) {
			$('body').append("<div id='"+gridopt.pager+"'></div>");
		}
		$('body').append("</div>");
		$("#"+gridId).jqGrid( gridopt );
		$("#"+gridId).jqGrid('bindKeys', {onSelectRow : false});
		$("#"+elemId).attr("autocomplete","off").data("comboGrid", {grid:gridId, divgrid: divId});
		var coord = document.getElementById(elemId).getBoundingClientRect();
		
		$("#"+divId).css({"background-color": "inherit", position:"absolute", top:(coord.top+50)+"px", left: (coord.left+10)+"px", zIndex: 20000}).hide();
		$("#"+elemId).on("keydown", function(e){
			var gID = $(this).data("comboGrid").grid, dID=$(this).data("comboGrid").divgrid, self = this;
			//e.preventDefault();
			if($("#"+dID).is(":hidden")) {
				coord = document.getElementById(elemId).getBoundingClientRect();
				//var coord = $("#"+elemId).position();
				$("#"+dID).show().css({top:(coord.top+50)+"px", left: (coord.left+10)+"px"});
			}
			var timer;

			if($.inArray(e.key, ['Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) > -1) {
			var eee =  $.Event('keydown'), $t = this;

			switch (e.key) {
				case 'Enter' :
					// select the row
					var srow = $("#"+gID).jqGrid('getRowData',$("#"+gID)[0].p.selrow);
					if(!$.isEmptyObject(srow)) {
						$t.value = srow[opt.return_fld];
						$("#"+dID).hide();
					}
					break;
				case 'Escape' :
					$("#"+dID).hide();
					break;
				case 'ArrowUp' :
					eee.keyCode = 38;
					$("#"+gID).trigger(eee);
					break;
				case 'ArrowDown' :
					//console.log(eee);
					eee.keyCode = 40;
					$("#"+gID).trigger(eee);
					break;
			}
			} else {
				if(timer) { clearTimeout(timer); }
				timer = setTimeout(function(){ 
					$("#"+gID).jqGrid('filterInput', self.value, {defaultSearch: opt.defaultSearch || 'bw', selectFirstFound : true});
				}, 100);
			}
		});
		if(opt.data) {
			if(typeof opt.data === 'string') {
				$("#"+gridId).jqGrid('setGridParam', {url : opt.data});
			} else if (Array.isArray(opt.data) ) {
				$("#"+gridId).jqGrid('setGridParam', {data : opt.data});
			}
		}
		$("#"+gridId).jqGrid('setGridParam', { datatype : save_datatype });

	},
	inColumnHeader : function (text, columnHeaders) {
		var length = columnHeaders.length, i;
		for (i = 0; i < length; i++) {
			if (columnHeaders[i].startColumnName === text) {
				return i;
			}
		}
		return -1;
	},
	isServiceCol : function( name ) {
		return ['cb', 'rn','subgrid', 'sc'].includes( name );
	},
	normalizeDbData : function( input, colModel ) {
		if(!Array.isArray(input)) {
			input = [input];
		}
		for(let key = 0; key < input.length; key++) {
			for(let i = 0; i < colModel.length; i++) {
				let cm = colModel[i];
				if(!$.jgrid.isServiceCol( cm.name ) && input[key].hasOwnProperty(cm.name)) {
					let type = cm.sorttype || cm.stype || cm.formatter || 'text';
					switch(type) 
					{
						case 'int':
						case 'integer':
							input[key][cm.name] = parseInt(input[key][cm.name],10);
							break;
						case 'float':
						case 'number':
						case 'numeric':
						case 'currency':
							input[key][cm.name] = parseFloat(input[key][cm.name]);
							break;
						case 'date': // future development
						case 'datetime':
							cm.formatoptions.reformatAfterEdit = true;
							input[key][cm.name] = $.jgrid.parseDate.call(this, cm.formatoptions.newformat, input[key][cm.name], cm.formatoptions.srcformat || 'Y-m-d');
							break;
					}
				}
			}
		}
		return input;
	},
	isVisible : function(e) {
		return !!( e.offsetWidth || e.offsetHeight || e.getClientRects().length );
	},
	styleUI : {
		jQueryUI : {
			common : {
				disabled: "ui-state-disabled",
				highlight : "ui-state-highlight",
				hover : "ui-state-hover",
				cornerall: "ui-corner-all",
				cornertop: "ui-corner-top",
				cornerbottom : "ui-corner-bottom",
				hidden : "ui-helper-hidden",
				icon_base : "ui-icon",
				overlay : "ui-widget-overlay",
				active : "ui-state-active",
				error : "ui-state-error",
				button : "ui-state-default ui-corner-all",
				content : "ui-widget-content",
				shadow : ""
			},
			base : {
				entrieBox : "ui-widget ui-widget-content ui-corner-all", // entrie div  incl everthing
				viewBox : "", // view diw
				headerTable : "",
				headerBox : "ui-state-default",
				rowTable : "",
				rowBox : "ui-widget-content",
				stripedTable : "ui-jqgrid-table-striped",
				footerTable : "",
				footerBox : "ui-widget-content",
				headerRowTable : "",
				headerRowBox : "ui-widget-content",
				headerDiv : "ui-state-default",
				gridtitleBox : "ui-widget-header ui-corner-top ui-helper-clearfix",
				customtoolbarBox : "ui-state-default",
				//overlayBox: "ui-widget-overlay",
				loadingBox : "ui-state-default ui-state-active",
				rownumBox :  "ui-state-default",
				scrollBox : "ui-widget-content",
				multiBox : "",
				searchBox : "ui-widget-content ui-corner-all",
				searchSelect : "ui-widget-content ui-corner-all",
				pagerBox : "ui-state-default ui-corner-bottom",
				pagerTable : "",
				toppagerBox : "ui-state-default",
				pgInput : "ui-corner-all",
				pgSelectBox : "ui-widget-content ui-corner-all",
				pgButtonBox : "ui-corner-all",
				icon_first : "ui-icon-seek-first",
				icon_prev : "ui-icon-seek-prev",
				icon_next: "ui-icon-seek-next",
				icon_end: "ui-icon-seek-end",
				icon_asc : "ui-icon-triangle-1-n",
				icon_desc : "ui-icon-triangle-1-s",
				icon_caption_open : "ui-icon-circle-triangle-n",
				icon_caption_close : "ui-icon-circle-triangle-s"
			},
			modal : {
				modal : "ui-widget ui-widget-content ui-corner-all ui-dialog",
				header : "ui-widget-header ui-corner-all ui-helper-clearfix",
				content :"ui-widget-content",
				body : "ui-widget-content",
				footer : "ui-widget-content",
				resizable : "ui-resizable-handle ui-resizable-se",
				icon_close : "ui-icon-closethick",
				icon_resizable : "ui-icon-gripsmall-diagonal-se"
			},
			celledit : {
				inputClass : "ui-widget-content ui-corner-all",
				selectClass: "ui-widget-content ui-corner-all"
			},
			inlinedit : {
				inputClass : "ui-widget-content ui-corner-all",
				selectClass: "ui-widget-content ui-corner-all",
				icon_edit_nav : "ui-icon-pencil",
				icon_add_nav : "ui-icon-plus",
				icon_save_nav : "ui-icon-disk",
				icon_cancel_nav : "ui-icon-cancel"
			},
			formedit : {
				labelClass : "",
				inputClass : "ui-widget-content ui-corner-all",
				selectClass: "ui-widget-content ui-corner-all",
				icon_prev : "ui-icon-triangle-1-w",
				icon_next : "ui-icon-triangle-1-e",
				icon_save : "ui-icon-disk",
				icon_close : "ui-icon-close",
				icon_del : "ui-icon-scissors",
				icon_cancel : "ui-icon-cancel"
			},
			navigator : {
				icon_edit_nav : "ui-icon-pencil",
				icon_add_nav : "ui-icon-plus",
				icon_del_nav : "ui-icon-trash",
				icon_search_nav : "ui-icon-search",
				icon_refresh_nav : "ui-icon-refresh",
				icon_view_nav : "ui-icon-document",
				icon_newbutton_nav : "ui-icon-newwin"
			},
			grouping : {
				icon_plus : 'ui-icon-circlesmall-plus',
				icon_minus : 'ui-icon-circlesmall-minus'
			},
			filter : {
				table_widget : 'ui-widget ui-widget-content',
				srSelect : 'ui-widget-content ui-corner-all',
				srInput : 'ui-widget-content ui-corner-all',
				menu_widget : 'ui-widget ui-widget-content ui-corner-all',
				icon_search : 'ui-icon-search',
				icon_reset : 'ui-icon-arrowreturnthick-1-w',
				icon_query :'ui-icon-comment'
			},
			subgrid : {
				icon_plus : 'ui-icon-plus',
				icon_minus : 'ui-icon-minus',
				icon_open : 'ui-icon-carat-1-sw'
			},
			treegrid : {
				icon_plus : 'ui-icon-triangle-1-',
				icon_minus : 'ui-icon-triangle-1-s',
				icon_leaf : 'ui-icon-radio-off'
			},
			fmatter : {
				icon_edit : "ui-icon-pencil",
				icon_add : "ui-icon-plus",
				icon_save : "ui-icon-disk",
				icon_cancel : "ui-icon-cancel",
				icon_del : "ui-icon-trash"
			},
			colmenu : {
				menu_widget : 'ui-widget ui-widget-content ui-corner-all',
				input_checkbox : "ui-widget ui-widget-content",
				filter_select: "ui-widget-content ui-corner-all",
				filter_input : "ui-widget-content ui-corner-all",
				icon_menu : "ui-icon-comment",
				icon_search_menu : "ui-icon-grip-dotted-vertical",
				icon_sort_asc : "ui-icon-arrow-1-n",
				icon_sort_desc : "ui-icon-arrow-1-s",
				icon_columns : "ui-icon-extlink",
				icon_filter : "ui-icon-calculator",
				icon_group : "ui-icon-grip-solid-horizontal",
				icon_freeze : "ui-icon-grip-solid-vertical",
				icon_move: "ui-icon-arrow-4",
				icon_new_item : "ui-icon-newwin",
				icon_toolbar_menu : "ui-icon-document",
				icon_group_op :"ui-icon-bullet",
				icon_oper_op : "ui-icon-transfer-e-w",
				icon_reset : "ui-icon-arrowreturnthick-1-w",
				icon_close : "ui-icon-close"
		},
			clipboard : {
				icon_copy :"ui-icon-copy",
				icon_paste : "ui-icon-clipboard",
				icon_paste_add: "ui-icon-plusthick",
				icon_repeat_row :"ui-icon-arrow-1-s",
				icon_repeat_col :"ui-icon-arrow-1-e",
				icon_undo: "ui-icon-arrowreturn-1-w",
				icon_cancel : "ui-icon-cancel"
			}
		},
		Bootstrap4 : {
			common : {
				disabled: "ui-disabled",
				highlight : "table-success",
				hover : "table-active",
				cornerall: "",
				cornertop: "",
				cornerbottom : "",
				hidden : "",
				overlay: "ui-overlay",
				active : "active",
				error : "alert-danger",
				button : "btn btn-light",
				content : "",
				shadow : "shadow p-3 mb-5 bg-white rounded"
			},
			base : {
				entrieBox : "",
				viewBox : "table-responsive",
				headerTable : "table table-bordered",
				headerBox : "",
				rowTable : "table table-bordered",
				rowBox : "",
				stripedTable : "table-striped",
				footerTable : "table table-bordered",
				footerBox : "",
				headerRowTable : "table table-bordered",
				headerRowBox : "",
				headerDiv : "",
				gridtitleBox : "",
				customtoolbarBox : "",
				//overlayBox: "ui-overlay",
				loadingBox : "row",
				rownumBox :  "active",
				scrollBox : "",
				multiBox : "checkbox",
				searchBox : "form-control",				
				searchSelect : "form-control form-control-sm",
				pagerBox : "",
				pagerTable : "table",
				toppagerBox : "",
				pgInput : "form-control",
				pgSelectBox : "form-control",
				pgButtonBox : ""
			},
			modal : {
				modal : "modal",
				content :"modal-content",
				header : "modal-header",
				title : "modal-title",
				body :"modal-body",
				footer :"modal-footer",				
				resizable : "ui-resizable-handle ui-resizable-se",
				icon_close : "oi-circle-x",
				icon_resizable : "oi-circle-x"
			},
			celledit : {
				inputClass : 'form-control',
				selectClass: 'form-control'
			},
			inlinedit : {
				inputClass : 'form-control',
				selectClass: 'form-control'
			},
			formedit : {
				labelClass : "form-label", 
				inputClass : "form-control",
				selectClass: 'form-control'
			},
			navigator : {
			},
			grouping : {
			},
			filter : {
				table_widget : 'table table-condensed',
				srSelect : 'form-control',
				srInput : 'form-control',
				menu_widget : ''
			},
			subgrid : {
			},
			treegrid : {
			},
			fmatter : {
			},
			colmenu : {
				menu_widget : '',
				input_checkbox : "",
				filter_select: "form-control",
				filter_input : "form-control"
			}
		},
		Bootstrap5 : {
			common : {
				disabled: "ui-disabled",
				highlight : "table-success",
				hover : "table-active",
				cornerall: "",
				cornertop: "",
				cornerbottom : "",
				hidden : "",
				overlay: "ui-overlay",
				active : "active",
				error : "alert alert-danger",
				button : "btn btn-light",
				content : "",
				shadow : "shadow p-3 mb-5 bg-body rounded"
			},
			base : {
				entrieBox : "",
				viewBox : "table-responsive",
				headerTable : "table table-bordered",
				headerBox : "",
				rowTable : "table table-bordered",
				rowBox : "",
				stripedTable : "table-striped",
				footerTable : "table table-bordered",
				footerBox : "",
				headerRowTable : "table table-bordered",
				headerRowBox : "",
				headerDiv : "",
				gridtitleBox : "",
				customtoolbarBox : "",
				//overlayBox: "ui-overlay",
				loadingBox : "row",
				rownumBox :  "active",
				scrollBox : "",
				multiBox : "checkbox",
				searchBox : "form-control",				
				searchSelect : "form-select",
				pagerBox : "",
				pagerTable : "table",
				toppagerBox : "",
				pgInput : "form-control",
				pgSelectBox : "form-select",
				pgButtonBox : ""
			},
			modal : {
				modal : "modal",
				header : "modal-header",
				title : "modal-title",
				content :"modal-content",
				body :"modal-body",
				footer :"modal-footer",				
				resizable : "ui-resizable-handle ui-resizable-se",
				icon_close : "oi-circle-x",
				icon_resizable : "oi-circle-x"
			},
			celledit : {
				inputClass : 'form-control',
				selectClass: 'form-select'
			},
			inlinedit : {
				inputClass : 'form-control',
				selectClass: 'form-select'
			},
			formedit : {
				labelClass : "form-label", 
				inputClass : "form-control",
				selectClass: 'form-select'
			},
			navigator : {
			},
			grouping : {
			},
			filter : {
				table_widget : 'table table-sm',
				srSelect : 'form-select',
				srInput : 'form-control',
				menu_widget : ''
			},
			subgrid : {
			},
			treegrid : {
			},
			fmatter : {
			},
			colmenu : {
				menu_widget : '',
				input_checkbox : "",
				filter_select: "form-select",
				filter_input : "form-control"
			}
		}
	},
	iconSet : {
		Iconic : {
			common : {
				icon_base : "oi"
			},
			base : {
				icon_first : "oi-media-step-backward",
				icon_prev : "oi-caret-left",
				icon_next: "oi-caret-right",
				icon_end: "oi-media-step-forward",
				icon_asc : "oi-caret-top",
				icon_desc : "oi-caret-bottom",
				icon_caption_open : "oi-collapse-up",
				icon_caption_close : "oi-expand-down"
			},
			modal : {
				icon_close : "oi-circle-x",
				icon_resizable : "oi-plus"
			},
			inlinedit : {
				icon_edit_nav : "oi-pencil",
				icon_add_nav : "oi-plus",
				icon_save_nav : "oi-check",
				icon_cancel_nav : "oi-action-undo"
			},
			formedit : {
				icon_prev : "oi-chevron-left",
				icon_next : "oi-chevron-right",
				icon_save : "oi-check",
				icon_close : "oi-ban",
				icon_del : "oi-delete",
				icon_cancel : "oi-ban"
			},
			navigator : {
				icon_edit_nav : "oi-pencil",
				icon_add_nav : "oi-plus",
				icon_del_nav : "oi-trash",
				icon_search_nav : "oi-zoom-in",
				icon_refresh_nav : "oi-reload",
				icon_view_nav : "oi-browser",
				icon_newbutton_nav : "oi-book"
			},
			grouping : {
				icon_plus : 'oi-caret-right',
				icon_minus : 'oi-caret-bottom'
			},
			filter : {
				icon_search : 'oi-magnifying-glass',
				icon_reset : 'oi-reload',
				icon_query :'oi-comment-square'
			},
			subgrid : {
				icon_plus : 'oi-chevron-right',
				icon_minus : 'oi-chevron-bottom',
				icon_open : 'oi-expand-left'
			},
			treegrid : {
				icon_plus : 'oi-plus',
				icon_minus : 'oi-minus',
				icon_leaf : 'oi-media-record'
			},
			fmatter : {
				icon_edit : "oi-pencil",
				icon_add : "oi-plus",
				icon_save : "oi-check",
				icon_cancel : "oi-action-undo",
				icon_del : "oi-trash"
			},
			colmenu : {
				icon_menu : "oi-list",
				icon_sort_asc : "oi-sort-ascending",
				icon_sort_desc : "oi-sort-descending",
				icon_columns : "oi-project",
				icon_filter : "oi-magnifying-glass",
				icon_group : "oi-list-rich",
				icon_freeze : "oi-spreadsheet",
				icon_move: "oi-move",
				icon_new_item : "oi-external-link",
				icon_toolbar_menu : "oi-menu",
				icon_group_op :"",
				icon_oper_op : "",
				icon_reset : "oi-reload",
				icon_close : "oi-ban"				
			},
			clipboard : {
				icon_copy :"oi-copy-outline",
				icon_paste : "oi-clipboard-outline",
				icon_paste_add: "oi-download-outline",
				icon_repeat_row :"oi-arrow-down-outline",
				icon_repeat_col :"oi-arrow-forward-outline",
				icon_undo: "oi-arrow-undo-outline",
				icon_cancel : "oi-exit-outline"
			}
		},
		Octicons : {
			common : {
				icon_base : "octicon"
			},
			base : {
				icon_first : "octicon-triangle-left",
				icon_prev : "octicon-chevron-left",
				icon_next: "octicon-chevron-right",
				icon_end: "octicon-triangle-right",
				icon_asc : "octicon-triangle-up",
				icon_desc : "octicon-triangle-down",
				icon_caption_open : "octicon-triangle-up",
				icon_caption_close : "octicon-triangle-down"
			},
			modal : {
				icon_close : "octicon-x",
				icon_resizable : "octicon-plus"
			},
			inlinedit : {
				icon_edit_nav : "octicon-pencil",
				icon_add_nav : "octicon-plus",
				icon_save_nav : "octicon-check",
				icon_cancel_nav : "octicon-circle-slash"
			},
			formedit : {
				icon_prev : "octicon-chevron-left",
				icon_next : "octicon-chevron-right",
				icon_save : "octicon-check",
				icon_close : "octicon-x",
				icon_del : "octicon-trashcan",
				icon_cancel : "octicon-circle-slash"
			},
			navigator : {
				icon_edit_nav : "octicon-pencil",
				icon_add_nav : "octicon-plus",
				icon_del_nav : "octicon-trashcan",
				icon_search_nav : "octicon-search",
				icon_refresh_nav : "octicon-sync",
				icon_view_nav : "octicon-file",
				icon_newbutton_nav : "octicon-link-external"
			},
			grouping : {
				icon_plus : 'octicon-triangle-right',
				icon_minus : 'octicon-triangle-down'
			},
			filter : {
				icon_search : 'octicon-search',
				icon_reset : 'octicon-sync',
				icon_query :'octicon-file-code'
			},
			subgrid : {
				icon_plus : 'octicon-triangle-right',
				icon_minus : 'octicon-triangle-down',
				icon_open : 'octicon-git-merge'
			},
			treegrid : {
				icon_plus : 'octicon-triangle-right',
				icon_minus : 'octicon-triangle-down',
				icon_leaf : 'octicon-primitive-dot'
			},
			fmatter : {
				icon_edit : "octicon-pencil",
				icon_add : "octicon-plus",
				icon_save : "octicon-check",
				icon_cancel : "octicon-circle-slash",
				icon_del : "octicon-trashcan"
			},
			colmenu : {
				icon_menu : "octicon-grabber",
				icon_sort_asc : "octicon-arrow-up",
				icon_sort_desc : "octicon-arrow-down",
				icon_columns : "octicon-repo",
				icon_filter : "octicon-search",
				icon_group : "octicon-list-unordered",
				icon_freeze : "octicon-repo",
				icon_move: "octicon-git-compare",
				icon_new_item : "octicon-link-external",
				icon_toolbar_menu : "octicon-three-bars",
				icon_group_op :"",
				icon_oper_op : "",
				icon_reset : "octicon-sync",
				icon_close : "octicon-x"				
			},
			clipboard : {
				icon_copy :"octicon-copy",
				icon_paste : "octicon-paste",
				icon_paste_add: "octicon-north-star",
				icon_repeat_row :"octicon-move-to-bottom",
				icon_repeat_col :"octicon-move-to-end",
				icon_undo: "octicon-undo",
				icon_cancel : "octicon-x"
			}
		},
		fontAwesome : {
			common : {
				icon_base : "fas"
			},
			base : {
				icon_first : "fa-step-backward",
				icon_prev : "fa-backward",
				icon_next: "fa-forward",
				icon_end: "fa-step-forward",
				icon_asc : "fa-caret-up",
				icon_desc : "fa-caret-down",
				icon_caption_open : "fa-caret-square-up",
				icon_caption_close : "fa-caret-square-down "
			},
			modal : {
				icon_close : "fa-window-close",
				icon_resizable : "fa-plus"
			},
			inlinedit : {
				icon_edit_nav : "fa-edit",
				icon_add_nav : "fa-plus",
				icon_save_nav : "fa-save",
				icon_cancel_nav : "fa-replay"
			},
			formedit : {
				icon_prev : "fa-chevron-left",
				icon_next : "fa-chevron-right",
				icon_save : "fa-save",
				icon_close : "fa-window-close",
				icon_del : "fa-trash",
				icon_cancel : "fa-times"
			},
			navigator : {
				icon_edit_nav : "fa-edit",
				icon_add_nav : "fa-plus",
				icon_del_nav : "fa-trash",
				icon_search_nav : "fa-search",
				icon_refresh_nav : "fa-sync",
				icon_view_nav : "fa-sticky-note",
				icon_newbutton_nav : "fa-external-link-alt"
			},
			grouping : {
				icon_plus : 'fa-caret-right',
				icon_minus : 'fa-caret-down'
			},
			filter : {
				icon_search : 'fa-search',
				icon_reset : 'fa-reply',
				icon_query :'fa-pen-square '
			},
			subgrid : {
				icon_plus : 'fa-arrow-circle-right',
				icon_minus : 'fa-arrow-circle-down',
				icon_open : 'fa-ellipsis-v'
			},
			treegrid : {
				icon_plus : 'fa-plus',
				icon_minus : 'fa-minus',
				icon_leaf : 'fa-circle'
			},
			fmatter : {
				icon_edit : "fa-edit",
				icon_add : "fa-plus",
				icon_save : "fa-save",
				icon_cancel : "fa-undo",
				icon_del : "fa-trash"
			},
			colmenu : {
				icon_menu : "fa-ellipsis-v",
				icon_sort_asc : "fa-sort-amount-up",
				icon_sort_desc : "fa-sort-amount-down",
				icon_columns : "fa-columns",
				icon_filter : "fa-filter",
				icon_group : "fa-object-group",
				icon_freeze : "fa-snowflake",
				icon_move: "fa-expand-arrows-alt",
				icon_new_item : "fa-external-link-alt",
				icon_toolbar_menu : "fa-list",
				icon_group_op :"",
				icon_oper_op : "",
				icon_reset : "fa-reply",
				icon_close : "fa-window-close"
				
			},
			clipboard : {
				icon_copy :"fa-copy",
				icon_paste : "fa-paste",
				icon_paste_add: "fa-plus",
				icon_repeat_row :"fa-arrow-down",
				icon_repeat_col :"fa-arrow-right",
				icon_undo: "fa-rotate-left",
				icon_cancel : "fa-xmark"
			}
		},
		Bootstrap5 : {
			common : {
				icon_base : "bi"
			},
			base : {
				icon_first : "bi-chevron-bar-left",
				icon_prev : "bi-chevron-left",
				icon_next: "bi-chevron-right",
				icon_end: "bi-chevron-bar-right",
				icon_asc : "bi-caret-up-fill",
				icon_desc : "bi-caret-down-fill",
				icon_caption_open : "bi-arrows-collapse",
				icon_caption_close : "bi-arrows-expand"
			},
			modal : {
				icon_close : "bi-x-lg",
				icon_resizable : "bi-box-arrow-in-down-right"
			},
			inlinedit : {
				icon_edit_nav : "bi-pencil-square",
				icon_add_nav : "bi-plus-square",
				icon_save_nav : "bi-save",
				icon_cancel_nav : "bi-x-square"
			},
			formedit : {
				icon_prev : "bi-chevron-left",
				icon_next : "bi-chevron-right",
				icon_save : "bi-save",
				icon_close : "bi-x-square",
				icon_del : "bi-trash",
				icon_cancel : "bi-x-octagon"
			},
			navigator : {
				icon_edit_nav : "bi-pencil-square",
				icon_add_nav : "bi-plus-square",
				icon_del_nav : "bi-trash",
				icon_search_nav : "bi-search",
				icon_refresh_nav : "bi-arrow-clockwise",
				icon_view_nav : "bi-view-list",
				icon_newbutton_nav : "bi-window"
			},
			grouping : {
				icon_plus : 'bi-caret-right',
				icon_minus : 'bi-caret-down'
			},
			filter : {
				icon_search : 'bi-search',
				icon_reset : 'bi-arrow-clockwise',
				icon_query :'bi-journal-code'
			},
			subgrid : {
				icon_plus : 'bi-chevron-right',
				icon_minus : 'bi-chevron-down',
				icon_open : 'bi-arrow-bar-right'
			},
			treegrid : {
				icon_plus : 'bi-plus-square-dotted',
				icon_minus : 'bi-dash-square-dotted',
				icon_leaf : 'bi-circle'
			},
			fmatter : {
				icon_edit : "bi-pencil-square",
				icon_add : "bi-plus-square",
				icon_save : "bi-save",
				icon_cancel : "bi-x-square",
				icon_del : "bi-trash"
			},
			colmenu : {
				icon_menu : "bi-list",
				icon_sort_asc : "bi-sort-alpha-down",
				icon_sort_desc : "bi-sort-alpha-up",
				icon_columns : "bi-columns",
				icon_filter : "bi-search",
				icon_group : "bi-collection-play",
				icon_freeze : "bi-layout-text-sidebar-reverse",
				icon_move: "bi-arrows-move",
				icon_new_item : "bi-window",
				icon_toolbar_menu : "bi-card-text",
				icon_group_op :"",
				icon_oper_op : "",
				icon_reset : "bi-arrow-clockwise",
				icon_close : "bi-x-square"				
			},
			clipboard : {
				icon_copy :"bi-clipboard-fill",
				icon_paste : "bi-clipboard",
				icon_paste_add: "bi-clipboard-plus",
				icon_repeat_row :"bi-arrow-bar-down",
				icon_repeat_col :"bi-arrow-bar-right",
				icon_undo: "bi-arrow-counterclockwise",
				icon_cancel : "bi-x"
			}
		}
	}
});

$.fn.jqGrid = function( pin ) {
	if (typeof pin === 'string') {
		var fn = $.jgrid.getMethod(pin);
		if (!fn) {
			throw "jqGrid - No such method: " + pin;
		}
		var args = $.makeArray(arguments).slice(1);
		return fn.apply(this,args);
	}
	return this.each( function() {
		if(this.grid) {return;}
		var localData;
		if ( !$.jgrid.isNull(pin) && pin.data !== undefined) {
			localData = pin.data;
			pin.data = [];
		}

		var p = $.extend(true,{
			url: "",
			height: 150,
			defaultColWidth : 150,
			page: 1,
			rowNum: 20,
			rowTotal : null,
			records: 0,
			pager: "",
			pgbuttons: true,
			pginput: true,
			colModel: [],
			rowList: [],
			colNames: [],
			sortorder: "asc",
			sortname: "",
			datatype: "xml",
			mtype: "GET",
			altRows: false,
			selarrrow: [],
			preserveSelection : false,
			savedRow: [],
			shrinkToFit: true,
			xmlReader: {},
			jsonReader: {},
			subGrid: false,
			subGridModel :[],
			reccount: 0,
			lastpage: 0,
			lastsort: 0,
			selrow: null,
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
			multiboxonly : false,
			multimail : false,
			multiselectWidth: 30,
			onMultiSleect : null,
			editurl: null,
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
			prmNames: {
				page:"page",
				rows:"rows",
				sort: "sidx",
				order: "sord",
				search:"_search",
				nd:"nd",
				id:"id",
				oper:"oper",
				editoper:"edit",
				addoper:"add",
				deloper:"del",
				subgridid:"id",
				npage: null,
				totalrows:"totalrows"
			},
			forceFit : false,
			gridstate : "visible",
			cellEdit: false,
			cellsubmit: "remote",
			nv:0,
			loadui: "enable",
			toolbar: [false,""],
			deselectAfterSort : true,
			scrollrows : false,
			autowidth: false,
			scrollOffset : $.jgrid.scrollbarWidth() + 3, // one extra for windows
			cellLayout: 5,
			subGridWidth: 20,
			gridview: true,
			rownumWidth: 35,
			rownumbers : false,
			pagerpos: 'center',
			recordpos: 'right',
			footerrow : false,
			userDataOnFooter : false,
			headerrow : false,
			userDataOnHeader : false,
			hoverrows : true,
			viewsortcols : [false,'vertical',true],
			resizeclass : '',
			autoencode : false,
			remapColumns : [],
			ajaxGridOptions :{},
			direction : "ltr",
			toppager: false,
			headertitles: false,
			data : [],
			_index : {},
			grouping : false,
			groupingView : {
				groupField:[],
				groupOrder:[],
				groupText:[],
				groupColumnShow:[],
				groupSummary:[],
				showSummaryOnHide: false,
				sortitems:[],
				sortnames:[],
				summary:[],
				summaryval:[],
				plusicon: '',
				minusicon: '',
				displayField: [],
				groupSummaryPos:[],
				formatDisplayField : [],
				_locgr : false
			},
			groupHeaderOn : false,
			ignoreCase : true,
			cmTemplate : {},
			idPrefix : "",
			multiSort :  false,
			minColWidth : 33,
			minGridWidth : 100,
			maxGridWidth : 3000,
			scroll: false,
			scrollTimeout: 300,
			scrollPopUp : false,
			scrollTopOffset: 0, // pixel
			scrollLeftOffset : "100%", //percent
			scrollMaxBuffer : 1,
			storeNavOptions: false,
			regional :  "en",
			styleUI : "jQueryUI",
			iconSet : "Iconic",
			responsive : false,
			forcePgButtons : false,
			resizeHeight : true,
			restoreCellonFail : true,
			editNextRowCell : false,
			colFilters : {},
			colMenu : false,
			colMenuCustom : {},
			colMenuColumnDone : null,
			colMenuBeforeProcess : null,
			colSpanHeader : [],
			// tree pagging
			treeGrid_bigData: false,
			treeGrid_rootParams: {otherData:{}},
			treeGrid_beforeRequest: null,
			treeGrid_afterLoadComplete: null,
			useNameForSearch : false,
			formatFooterData : false,
			formatHeaderData : false,
			mergeSearch : false,
			searchModules : {
				mergeOper : 'AND',
				filterInput : true,
				filterToolbar : true,
				searchGrid : true,
				colMenuSearch : true
			},
			emptyRecordRow : true,
			ariaBody : false,
			searchCols : false,
			searchColOptions : {
				colWidth : 90,
				searchOp : "OR", //default
				operand : "cn", // default
				useCase : false, // for searching
				colName : "Search Col", // header title 
				colmenu : true, // special colmenu
				searchOnEnter : true,
				aOperands : ['cn', 'bw', 'ew', 'eq', 'ne'], // allowed options
				_cnth : ['cb', 'rn', 'sc', 'subgrid', 'col_name'], // internal (just in case)
				visibleColumns : []
			},
			dbconfig: {
				dbname : "",
				dbversion : -1,
				dbtable : "",
				deleteIfExists : false,
				loadIfExists : false,
				isKeyInData : false,
				dataUrl : "",
				reader : null,
				beforeInsertData : null,
				fetchOptions : {}
			},
			isClipboard : false,
		}, $.jgrid.defaults , pin );
		if (localData !== undefined) {
			p.data = localData;
			pin.data = localData;
		}
		var ts= this, grid={
			headers:[],
			cols:[],
			footers: [],
			hrheaders : [],
			dragStart: function(i,x,y) {
				var gridLeftPos = $(this.bDiv).offset().left,
					minW = parseInt( (p.colModel[i].minResizeWidth ? p.colModel[i].minResizeWidth : p.minColWidth), 10);
				if(isNaN( minW )) {
					minW = 33;
				}
				this.resizing = { idx: i, startX: x.pageX, sOL : x.pageX - gridLeftPos, minW :  minW  };
				this.hDiv.style.cursor = "col-resize";
				this.curGbox = $("#rs_m"+$.jgrid.jqID(p.id),"#gbox_"+$.jgrid.jqID(p.id));
				this.curGbox.css({display:"block",left:x.pageX-gridLeftPos,top:y[1],height:y[2]});
				$(ts).triggerHandler("jqGridResizeStart", [x, i]);
				if($.jgrid.isFunction(p.resizeStart)) { p.resizeStart.call(ts,x,i); }
				document.onselectstart=function(){return false;};
			},
			dragMove: function(x) {
				if(this.resizing) {
					var diff = x.pageX-this.resizing.startX,
					h = this.headers[this.resizing.idx],
					newWidth = p.direction === "ltr" ? h.width + diff : h.width - diff, hn, nWn;
					if(newWidth > this.resizing.minW) {
						this.curGbox.css({left:this.resizing.sOL+diff});
						if(p.forceFit===true ){
							hn = this.headers[this.resizing.idx+p.nv];
							nWn = p.direction === "ltr" ? hn.width - diff : hn.width + diff;
							if(nWn > this.resizing.minW ) {
								h.newWidth = newWidth;
								hn.newWidth = nWn;
							}
						} else {
							this.newWidth = p.direction === "ltr" ? p.tblwidth+diff : p.tblwidth-diff;
							h.newWidth = newWidth;
						}
					}
				}
			},
			dragEnd: function( events, forceFrozen ) {
				this.hDiv.style.cursor = "default";
				if(forceFrozen === undefined) {
					forceFrozen = true;
				}
				if(this.resizing) {
					var idx = this.resizing.idx,
					nw = this.headers[idx].newWidth || this.headers[idx].width;
					nw = parseFloat(nw);
					this.resizing = false;
					$("#rs_m"+$.jgrid.jqID(p.id)).css("display","none");
					p.colModel[idx].width = nw;
					this.headers[idx].width = nw;
					this.headers[idx].el.style.width = nw + "px";
					this.cols[idx].style.width = nw+"px";
					if(this.footers.length>0) {this.footers[idx].style.width = nw+"px";}
					if(this.hrheaders.length>0) {this.hrheaders[idx].style.width = nw+"px";}
					if(p.forceFit===true){
						nw = this.headers[idx+p.nv].newWidth || this.headers[idx+p.nv].width;
						this.headers[idx+p.nv].width = nw;
						this.headers[idx+p.nv].el.style.width = nw + "px";
						this.cols[idx+p.nv].style.width = nw+"px";
						if(this.footers.length>0) {this.footers[idx+p.nv].style.width = nw+"px";}
						if(this.hrheaders.length>0) {this.hrheaders[idx+p.nv].style.width = nw+"px";}
						p.colModel[idx+p.nv].width = nw;
					} else {
						p.tblwidth = this.newWidth || p.tblwidth;
						$(this.bDiv).find('table').first().css("width",p.tblwidth+"px");
						$(this.hDiv).find('table').first().css("width",p.tblwidth+"px");
						this.hDiv.scrollLeft = this.bDiv.scrollLeft;
						if(p.footerrow) {
							$(this.sDiv).find('table').first().css("width",p.tblwidth+"px");
							this.sDiv.scrollLeft = this.bDiv.scrollLeft;
						}
						if(p.headerrow) {
							$(this.hrDiv).find('table').first().css("width",p.tblwidth+"px");
							this.hrDiv.scrollLeft = this.bDiv.scrollLeft;
						}
					}
					if(events) {
						$(ts).triggerHandler("jqGridResizeStop", [nw, idx]);
						if($.jgrid.isFunction(p.resizeStop)) { p.resizeStop.call(ts,nw,idx); }
					}
					if(p.frozenColumns && forceFrozen) {
						if(idx <= p.frozenColCount) {
							$("#"+$.jgrid.jqID(p.id)).jqGrid('refreshFrozenColumns');
						}
					}
				}
				this.curGbox = null;
				document.onselectstart=function(){return true;};
			},
			populateVisible : function() {
				if (grid.timer) { clearTimeout(grid.timer); }
				grid.timer = null;
				var dh = $(grid.bDiv).height();
				if (!dh) { return; }
				var table = $(grid.bDiv).find("table").first();
				var rows, rh;
				if(table[0].rows.length) {
					try {
						rows = table[0].rows[1];
						rh = rows ? $(rows).outerHeight() || grid.prevRowHeight : grid.prevRowHeight;
					} catch (pv) {
						rh = grid.prevRowHeight;
					}
				}
				if (!rh) { return; }
				grid.prevRowHeight = rh;
				var rn = p.rowNum;
				var scrollTop = grid.scrollTop = grid.bDiv.scrollTop;
				var ttop = Math.round(table.position().top) - scrollTop;
				var tbot = ttop + table.height();
				var div = rh * rn;
				var page, npage, empty;
				if ( tbot < dh && ttop <= 0 &&
					(p.lastpage===undefined||(parseInt((tbot + scrollTop + div - 1) / div,10) || 0) <= p.lastpage))
				{
					npage = parseInt((dh - tbot + div - 1) / div,10) || 1;
					if (tbot >= 0 || npage < 2) {
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
					if (grid.hDiv.loading) {
						grid.timer = setTimeout(grid.populateVisible, p.scrollTimeout);
					} else {
						p.page = page;
						if( p.scrollMaxBuffer > 0 ) {
							if( rn > 0 && p.scrollMaxBuffer < rn ) {
								p.scrollMaxBuffer = rn + 1;
							}
							if(p.reccount  > (p.scrollMaxBuffer - (rn > 0 ? rn : 0) )  ) {
								empty = true;
							}
						}
						if (empty) {
							grid.selectionPreserver(table[0]);
							grid.emptyRows.call(table[0], true, false);
						}
						grid.populate(npage);
					}
					if(p.scrollPopUp && !$.jgrid.isNull(p.lastpage)) {
						$("#scroll_g"+p.id).html( $.jgrid.template( $.jgrid.getRegional(ts, "defaults.pgtext", p.pgtext) , p.page, p.lastpage)).css({ "top": p.scrollTopOffset+scrollTop*((parseInt(p.height,10) - 45)/ (parseInt(rh,10)*parseInt(p.records,10))) +"px", "left" : p.scrollLeftOffset});
					}
				}
			},
			scrollGrid: function() {
				if(!grid.bScroll) {
					grid.hScroll  = true;

					if(p.scroll) {
						var scrollTop = grid.bDiv.scrollTop;
						if(grid.scrollTop === undefined) { grid.scrollTop = 0; }
						if (scrollTop !== grid.scrollTop) {
							grid.scrollTop = scrollTop;
							if (grid.timer) { clearTimeout(grid.timer); }
							grid.timer = setTimeout(grid.populateVisible, p.scrollTimeout);
						}
						if(p.scrollPopUp && !$.jgrid.isNull(p.lastpage)) {
							$("#scroll_g"+p.id).show();
						}
					}
					grid.hDiv.scrollLeft = grid.bDiv.scrollLeft;
					if(p.footerrow) {
						grid.sDiv.scrollLeft = grid.bDiv.scrollLeft;
					}
					if(p.headerrow) {
						grid.hrDiv.scrollLeft = grid.bDiv.scrollLeft;
					}
					try {
						$("#column_menu").remove();
					} catch (e) {}
				}
				grid.bScroll = false;
			},
			selectionPreserver : function(ts) {
				var p = ts.p,
				sr = p.selrow, sra = p.selarrrow ? $.makeArray(p.selarrrow) : null,
				left = ts.grid.bDiv.scrollLeft,
				restoreSelection = function() {
					var i;
					//p.selrow = null;
					//p.selarrrow = [];
					if(p.multiselect && sra && sra.length>0) {
						for(i=0;i<sra.length;i++){
							if (sra[i]) {
								$(ts).jqGrid("setSelection", sra[i], false, "_sp_");
							}
						}
					}
					if (!p.multiselect && sr) {
						$(ts).jqGrid("setSelection", sr, false, null);
					}
					ts.grid.bDiv.scrollLeft = left;
					$(ts).off('.selectionPreserver', restoreSelection);
				};
				$(ts).on('jqGridGridComplete.selectionPreserver', restoreSelection);
			},
			hScroll : false,
			bScroll : false
		};
		if( this.tagName.toUpperCase() !== 'TABLE' || $.jgrid.isNull(this.id) ) {
			alert("Element is not a table or has no id!");
			return;
		}
		if(document.documentMode !== undefined ) { // IE only
			if(document.documentMode <= 5) {
				alert("Grid can not be used in this ('quirks') mode!");
				return;
			}
		}
		var i =0, lr, lk, dir, spsh;
		for( lk in $.jgrid.regional ){
			if($.jgrid.regional.hasOwnProperty(lk)) {
				if(i===0) { lr = lk; }
				i++;
			}
		}
		if(i === 1 && lr !== p.regional) {
			p.regional = lr;
		}
		$(this).empty().attr("tabindex","0");
		this.p = p ;
		this.p.useProp = !!$.fn.prop;
		if(this.p.colNames.length === 0) {
			for (i=0;i<this.p.colModel.length;i++){
				this.p.colNames[i] = this.p.colModel[i].label || this.p.colModel[i].name;
			}
		}
		if( this.p.colNames.length !== this.p.colModel.length ) {
			alert($.jgrid.getRegional(this,"errors.model"));
			return;
		}
		if(ts.p.styleUI === 'Bootstrap4') {
			if($.jgrid.iconSet.hasOwnProperty(ts.p.iconSet)) {
				$.extend(true, $.jgrid.styleUI.Bootstrap4, $.jgrid.iconSet[ts.p.iconSet]);
			}
		}
		if(ts.p.styleUI === 'Bootstrap5') {
			if($.jgrid.iconSet.hasOwnProperty(ts.p.iconSet)) {
				$.extend(true, $.jgrid.styleUI.Bootstrap5, $.jgrid.iconSet[ts.p.iconSet]);
			}
		}
		var getstyle = $.jgrid.getMethod("getStyleUI"),
		stylemodule = ts.p.styleUI + ".common",
		disabled = getstyle(stylemodule,'disabled', true),
		highlight = getstyle(stylemodule,'highlight', true),
		hover = getstyle(stylemodule,'hover', true),
		cornerall = getstyle(stylemodule,'cornerall', true),
		iconbase = getstyle(stylemodule,'icon_base', true),
		colmenustyle = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].colmenu,
		isMSIE = $.jgrid.msie(),
		gv, sortarr = [], sortord = [], sotmp=[];
		stylemodule = ts.p.styleUI + ".base";
		gv = $("<div "+getstyle(stylemodule, 'viewBox', false, 'ui-jqgrid-view')+" ></div>");
		ts.p.direction = $.jgrid.trim(ts.p.direction.toLowerCase());
		ts.p._ald = false;
		if($.inArray(ts.p.direction,["ltr","rtl"]) === -1) { ts.p.direction = "ltr"; }
		dir = ts.p.direction;

		$(gv).insertBefore(this);
		$(this).appendTo(gv);

		var eg = $("<div "+ getstyle(stylemodule, 'entrieBox', false, 'ui-jqgrid') +"></div>");
		$(eg).attr({"id" : "gbox_"+this.id,"dir":dir}).insertBefore(gv);
		$(gv).attr("id","gview_"+this.id).appendTo(eg);
		$("<div "+getstyle(ts.p.styleUI+'.common','overlay', false, 'jqgrid-overlay')+ " id='lui_"+this.id+"'></div>").insertBefore(gv);
		$("<div "+getstyle(stylemodule,'loadingBox', false, 'loading')+" id='load_"+this.id+"'>"+$.jgrid.getRegional(ts, "defaults.loadtext", this.p.loadtext)+"</div>").insertBefore(gv);

		$(this).attr({role:"grid","aria-multiselectable":!!this.p.multiselect,"aria-labelledby":"gbox_"+this.id});

		if(ts.p.datatype === 'indexeddb') { // datatype in databases
			$(ts).jqGrid('dbInit',ts.p.datatype );
		}
		var sortkeys = ["shiftKey","altKey","ctrlKey"],
		grid_font = $.jgrid.getFont( ts ) ,
		intNum = function(val, defval) {
			if( defval === undefined ) {
				defval = 0;
			}
			val = parseInt(val,10);
			return !isNaN(val) ? val : defval;
		},
		formatCol = function (pos, rowInd, tv, rawObject, rowId, rdata){
			var cm = ts.p.colModel[pos], cellAttrFunc,
			ral = cm.align, result="style=\"", clas = cm.classes, nm = cm.name, celp, acp=[];
			if(ral) { result += "text-align:"+ral+";"; }
			if(cm.hidden===true) { result += "display:none;"; }
			if(rowInd===0) {
				result += "width: "+grid.headers[pos].width+"px;";
			} else if ( $.jgrid.isFunction(cm.cellattr) || (typeof cm.cellattr === "string" && !$.jgrid.isNull( $.jgrid.cellattr ) && $.jgrid.isFunction($.jgrid.cellattr[cm.cellattr]))) {
				cellAttrFunc = $.jgrid.isFunction(cm.cellattr) ? cm.cellattr : $.jgrid.cellattr[cm.cellattr];
				celp = cellAttrFunc.call(ts, rowId, tv, rawObject, cm, rdata);
				if(celp && typeof celp === "string") {
					if(celp.indexOf('title') > -1) { cm.title=false;}
					if(celp.indexOf('class') > -1) { clas = undefined;}
					celp = String(celp).replace(/\s+\=/g, '=');
					acp = celp.split("style=");

					if(acp.length === 2 ) {
						acp[1] =  $.jgrid.trim(acp[1]);
						if(acp[1].indexOf("'") === 0 || acp[1].indexOf('"') === 0) {
							acp[1] = acp[1].substring(1);
						}
						result += acp[1].replace(/'/gi,'"');
					} else {
						result += "\"";
					}
				}
			}
			if(!acp.length ) { 
				acp[0] = ""; 
				result += "\"";
			} else if(acp.length > 2) {
				acp[0] = ""; 
			}
			result += (clas !== undefined ? (" class=\""+clas+"\"") :"") + ((cm.title && tv) ? (" title=\""+$.jgrid.stripHtml(tv)+"\"") :"");
			result += " aria-describedby=\""+ts.p.id+"_"+nm+"\"";
			return result + acp[0];
		},
		cellVal =  function (val) {
			return $.jgrid.isNull(val) || val === "" ? "&#160;" : (ts.p.autoencode ? $.jgrid.htmlEncode(val) : String(val));
		},
		formatter = function (rowId, cellval , colpos, rwdat, _act){
			var cm = ts.p.colModel[colpos],v;
			rowId = String(ts.p.idPrefix) !== "" ? $.jgrid.stripPref(ts.p.idPrefix, rowId) : rowId;
			var opts= {rowId: rowId, colModel:cm, gid:ts.p.id, pos:colpos, styleUI: ts.p.styleUI };
			if(cm.formatter !== undefined) {
				if($.jgrid.isFunction( cm.formatter ) ) {
					v = cm.formatter.call(ts,cellval,opts,rwdat,_act);
				} else if($.fmatter){
					v = $.fn.fmatter.call(ts,cm.formatter,cellval,opts,rwdat,_act);
				} else {
					v = cellVal(cellval);
				}
			} else {
				v = cellVal(cellval);
			}
			if(ts.p.autoResizing && cm.autosize) {
				if(!cm._maxsize) {
					cm._maxsize = cm.canvas_width;
				}
				cm._maxsize = Math.max( (!!$.jgrid.isFunction( cm.sizingStringFunc ) ? 
							cm.sizingStringFunc.call(ts, v, grid_font, opts, rwdat) : 
							$.jgrid.getTextWidth( v, grid_font ) ), 
					cm._maxsize );
			}
			return v;
		},
		addCell = function(rowId,cell,pos,irow, srvr, rdata) {
			var v,prp;
			v = formatter(rowId,cell,pos,srvr,'add');
			prp = formatCol( pos,irow, v, srvr, rowId, rdata);
			return "<td role=\"gridcell\" "+prp+">"+v+"</td>";
		},
		addMulti = function(rowid, pos, irow, checked, uiclass, srvr){
			var rowSelectTitle=$.jgrid.getRegional(ts, "defaults.selectLine");
			rowSelectTitle=rowSelectTitle ? rowSelectTitle : $.jgrid.regional['en'].defaults.selectLine;
			var	v = "<input role=\"checkbox\" title='"+rowSelectTitle+"' type=\"checkbox\""+" id=\"jqg_"+ts.p.id+"_"+rowid+"\" "+uiclass+" name=\"jqg_"+ts.p.id+"_"+rowid+"\"" + (checked ? "checked=\"checked\"" : "")+"/>",
			cm = ts.p.colModel[pos];
			if(cm.formatter !== undefined && $.jgrid.isFunction( cm.formatter )) {
				v = cm.formatter.call(ts,v,{rowId: rowid, colModel:cm, gid:ts.p.id, pos:pos, styleUI: ts.p.styleUI },srvr,'add');
			}
			var prp = formatCol( pos,irow, v, srvr, rowid, true);
			return "<td role=\"gridcell\" "+prp+">"+v+"</td>";
		},
		addRowNum = function (pos, irow, pG, rN, uiclass ) {
			var v =  (parseInt(pG,10)-1)*parseInt(rN,10)+1+irow,
			prp = formatCol( pos,irow,v, null, irow, true);
			return "<td role=\"gridcell\" "+uiclass+" "+prp+">"+v+"</td>";
		},
		addSearch = function(rowid, pos, irow, uiclass){
			var searchColEvent = ts.p.searchColOptions.searchOnEnter ? " onchange=\"$.jgrid.searchColOnEnter('"+ts.p.id+"',"+rowid+", this)\"" : " onkeydown=\"$.jgrid.searchColOnKey('"+ts.p.id+"',"+rowid+",this, event)\"";
			var	v = "<input type=\"text\""+" id=\"jqs_"+ts.p.id+"_"+rowid+"\" name=\"jqs_"+ts.p.id+"_"+rowid+"\" "+uiclass+ searchColEvent +"/>",
				prp = formatCol( pos,irow,'',null, rowid, true);
			return "<td role=\"gridcell\" "+prp+">"+v+"</td>";
		},
		reader = function (datatype) {
			var field, f=[], j=0, i;
			for(i = 0; i < ts.p.colModel.length; i++){
				field = ts.p.colModel[i];
				if ( Object.hasOwn(field, "name") && !$.jgrid.isServiceCol(field.name) ) {
					f[j]= datatype === "local" ?
					field.name :
					( (datatype==="xml" || datatype === "xmlstring") ? field.xmlmap || field.name : field.jsonmap || field.name );
					if(ts.p.keyName !== false && field.key===true ) {
						ts.p.keyName = f[j];
						ts.p.keyIndex = j;
					}
					j++;
				}
			}
			return f;
		},
		orderedCols = function (offset) {
			var order = ts.p.remapColumns;
			if (!order || !order.length) {
				order = $.map(ts.p.colModel, function(v,i) { return i; });
			}
			if (offset) {
				order = $.map(order, function(v) { return v<offset?null:v-offset; });
			}
			return order;
		},
		emptyRows = function (scroll, locdata) {
			var firstrow;
			if (this.p.deepempty) {
				$(this.rows).slice(1).remove();
			} else {
				firstrow = this.rows.length > 0 ? this.rows[0] : null;
				$(this.firstChild).empty().append(firstrow);
			}
			if (scroll && this.p.scroll) {
				$(this.grid.bDiv.firstChild).css({height: "auto"});
				$(this.grid.bDiv.firstChild.firstChild).css({height: "0px", display: "none"});
				if (this.grid.bDiv.scrollTop !== 0) {
					this.grid.bDiv.scrollTop = 0;
				}
			}
			if(locdata === true ) { //&& this.p.treeGrid && !this.p.loadonce ) {
				this.p.data = []; 
				this.p._index = {};
			}
		},
		normalizeData = function() {
			var p = ts.p, data = p.data, dataLength = data.length, i, j, cur, idn, idr, ccur, v, rd,
			localReader = p.localReader,
			colModel = p.colModel,
			cellName = localReader.cell,
			iOffset = (p.multiselect === true ? 1 : 0) + (p.subGrid === true ? 1 : 0) + (p.rownumbers === true ? 1 : 0) + (p.searchCols === true ? 1 : 0),
			br = p.scroll ? $.jgrid.randId() : 1,
			arrayReader, objectReader, rowReader;

			if (p.datatype !== "local" || localReader.repeatitems !== true) {
				return; // nothing to do
			}

			arrayReader = orderedCols(iOffset);
			objectReader = reader("local");
			// read ALL input items and convert items to be read by
			// $.jgrid.getAccessor with column name as the second parameter
			idn = p.keyName === false ?
				($.jgrid.isFunction(localReader.id) ? localReader.id.call(ts, data) : localReader.id) :
				p.keyName;
			for (i = 0; i < dataLength; i++) {
				cur = data[i];
				// read id in the same way like addJSONData do
				// probably it would be better to start with "if (cellName) {...}"
				// but the goal of the current implementation was just have THE SAME
				// id values like in addJSONData ...
				idr = $.jgrid.getAccessor(cur, idn);
				if (idr === undefined) {
					if (typeof idn === "number" &&  !$.jgrid.isNull( colModel[idn + iOffset]) ) {
						// reread id by name
						idr = $.jgrid.getAccessor(cur, colModel[idn + iOffset].name);
					}
					if (idr === undefined) {
						idr = br + i;
						if (cellName) {
							ccur = $.jgrid.getAccessor(cur, cellName) || cur;
							idr = !$.jgrid.isNull(ccur) && ccur[idn] !== undefined ? ccur[idn] : idr;
							ccur = null;
						}
					}
				}
				rd = { };
				rd[localReader.id] = idr;
				if (cellName) {
					cur = $.jgrid.getAccessor(cur, cellName) || cur;
				}
				rowReader = Array.isArray(cur) ? arrayReader : objectReader;
				for (j = 0; j < rowReader.length; j++) {
					v = $.jgrid.getAccessor(cur, rowReader[j]);
					rd[colModel[j + iOffset].name] = v;
				}
				data[i] = rd;
				//$.extend(true, data[i], rd);
			}
		},
		refreshIndex = function() {
			var datalen = ts.p.data.length, idname, i, val;

			idname =  ts.p.keyName !== false ? ts.p.keyName : idname = ts.p.localReader.id;
			ts.p._index = {};
			for(i =0;i < datalen; i++) {
				val = $.jgrid.getAccessor(ts.p.data[i],idname);
				if (val === undefined) { val=String(i+1); }
				ts.p._index[val] = i;
			}
		},
		constructTr = function(id, hide, classes, rd, cur ) {
			var tabindex = '-1', restAttr = '', attrName, style = hide ? 'display:none;' : '',
				//classes = getstyle(stylemodule, 'rowBox', true) + ts.p.direction + (altClass ? ' ' + altClass : '') + (selected ? ' ' + highlight : ''),
				rowAttrObj = $(ts).triggerHandler("jqGridRowAttr", [rd, cur, id]);
			if( typeof rowAttrObj !== "object" ) {
				rowAttrObj = $.jgrid.isFunction(ts.p.rowattr) ? ts.p.rowattr.call(ts, rd, cur, id) :
					(typeof ts.p.rowattr === "string" && !$.jgrid.isNull($.jgrid.rowattr) && $.jgrid.isFunction($.jgrid.rowattr[ts.p.rowattr]) ?
					$.jgrid.rowattr[ts.p.rowattr].call(ts, rd, cur, id) : {});
			}
			if(!$.isEmptyObject( rowAttrObj )) {
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
				try { delete rowAttrObj.role; } catch(ra){}
				for (attrName in rowAttrObj) {
					if (rowAttrObj.hasOwnProperty(attrName)) {
						restAttr += ' ' + attrName + '=' + rowAttrObj[attrName];
					}
				}
			}
			return '<tr role="row" id="' + id + '" tabindex="' + tabindex + '" class="' + classes + '"' +
				(style === '' ? '' : ' style="' + style + '"') + restAttr + '>';
		},
		//bvn13
		treeGrid_beforeRequest = function() {
			if (ts.p.treeGrid && ts.p.treeGrid_bigData) {
				if (	ts.p.postData.nodeid !== undefined &&
						typeof(ts.p.postData.nodeid) === 'string' &&
						( ts.p.postData.nodeid !== ""	||
							parseInt(ts.p.postData.nodeid,10) > 0 )
				) {
                    ts.p.postData.rows = 10000;
                    ts.p.postData.page = 1;
                    ts.p.treeGrid_rootParams.otherData.nodeid = ts.p.postData.nodeid;
				}
			}
		},
		treeGrid_afterLoadComplete = function() {
			if (ts.p.treeGrid && ts.p.treeGrid_bigData) {
				if (	ts.p.treeGrid_rootParams.otherData.nodeid !== undefined	&&
						typeof(ts.p.treeGrid_rootParams.otherData.nodeid) === 'string' &&
						(
							ts.p.treeGrid_rootParams.otherData.nodeid !== "" ||
                            parseInt(ts.p.treeGrid_rootParams.otherData.nodeid,10) > 0
						)
				) {
					if ( ts.p.treeGrid_rootParams !== undefined && !$.jgrid.isNull(ts.p.treeGrid_rootParams) ) {
						ts.p.page = ts.p.treeGrid_rootParams.page;
						ts.p.lastpage = ts.p.treeGrid_rootParams.lastpage;

						ts.p.postData.rows = ts.p.treeGrid_rootParams.postData.rows;
                        ts.p.postData.totalrows = ts.p.treeGrid_rootParams.postData.totalrows;

                        ts.p.treeGrid_rootParams.otherData.nodeid = "";
                        ts.updatepager(false,true);
					}
				} else {
					ts.p.treeGrid_rootParams = {
						page : ts.p.page,
						lastpage : ts.p.lastpage,
						postData : {
                            rows: ts.p.postData.rows,
                            totalrows: ts.p.postData.totalrows
                        },
                        rowNum : ts.p.rowNum,
                        rowTotal : ts.p.rowTotal,
                        otherData : {
                            nodeid : ""
                        }
					};
				}
			}
		},
		//-bvn13
		addXmlData = function (xml, rcnt, more, adjust) {
			var startReq = new Date(),
			locdata = (ts.p.datatype !== "local" && ts.p.loadonce) || ts.p.datatype === "xmlstring",
			xmlid = "_id_", xmlRd = ts.p.xmlReader,
			treeadjtmp =[],
			frd = ts.p.datatype === "local" ? "local" : "xml";
			if(locdata) {
				ts.p.data = [];
				ts.p._index = {};
				ts.p.localReader.id = xmlid;
			}
			ts.p.reccount = 0;
			if($.isXMLDoc(xml)) {
				if(ts.p.treeANode===-1 && !ts.p.scroll) {
					emptyRows.call(ts, false, false);
					rcnt=1;
				} else { rcnt = rcnt > 1 ? rcnt :1; }
			} else { return; }
			var self= $(ts), i,fpos,ir=0,v,si=0,addSubGridCell,idn, getId,f=[],F,rd ={},
					xmlr,rid, rowData=[], classes = getstyle(stylemodule, 'rowBox', true, 'jqgrow ui-row-'+ ts.p.direction),
					ni=ts.p.rownumbers===true ? 1 : 0,
					gi=ts.p.multiselect===true ? 1 : 0,
					sc = ts.p.searchCols ===true ? 1 : 0;
			if(ts.p.subGrid===true) {
				si = 1;
				addSubGridCell = $.jgrid.getMethod("addSubGridCell");
			}
			if(!xmlRd.repeatitems) {f = reader(frd);}
			if( ts.p.keyName===false) {
				idn = $.jgrid.isFunction( xmlRd.id ) ?  xmlRd.id.call(ts, xml) : xmlRd.id;
			} else {
				idn = ts.p.keyName;
			}
			if(xmlRd.repeatitems && ts.p.keyName && isNaN(idn)) {
				idn = ts.p.keyIndex;
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
			ts.p.userData = {};
			ts.p.page = intNum($.jgrid.getXmlData(xml, xmlRd.page), ts.p.page);
			ts.p.lastpage = intNum($.jgrid.getXmlData(xml, xmlRd.total), 1);
			ts.p.records = intNum($.jgrid.getXmlData(xml, xmlRd.records));
			if($.jgrid.isFunction(xmlRd.userdata)) {
				ts.p.userData = xmlRd.userdata.call(ts, xml) || {};
			} else {
				$.jgrid.getXmlData(xml, xmlRd.userdata, true).each(function() {ts.p.userData[this.getAttribute("name")]= $(this).text();});
			}
			var gxml = $.jgrid.getXmlData( xml, xmlRd.root, true);
			gxml = $.jgrid.getXmlData( gxml, xmlRd.row, true);
			if (!gxml) { gxml = []; }
			var gl = gxml.length, j=0, grpdata=[], rn = parseInt(ts.p.rowNum,10), br=ts.p.scroll?$.jgrid.randId():1,
				tablebody = $(ts).find("tbody").first(),
				hiderow=false, groupingPrepare, selr;
			if(ts.p.grouping)  {
				hiderow = ts.p.groupingView.groupCollapse === true;
				groupingPrepare = $.jgrid.getMethod("groupingPrepare");
			}
			if (gl > 0 &&  ts.p.page <= 0) { ts.p.page = 1; }
			if(gxml && gl){
				if (adjust) { rn *= adjust+1; }
				var afterInsRow = $.jgrid.isFunction(ts.p.afterInsertRow),
				rnc = ni ? getstyle(stylemodule, 'rownumBox', false, 'jqgrid-rownum') :"",
				scc = sc ? getstyle(stylemodule, 'searchBox', false, '') :"",
				mlc = gi ? getstyle(stylemodule, 'multiBox', false, 'cbox'):"";

				while (j<gl) {
					xmlr = gxml[j];
					rid = getId(xmlr,br+j);
					rid  = ts.p.idPrefix + rid;
					if( ts.p.preserveSelection) {
						if( ts.p.multiselect) {
							selr = ts.p.selarrrow.indexOf( rid ) !== -1;
							spsh = selr ? spsh+1: spsh;
						} else {
							selr = (rid === ts.p.selrow);
						}
					}
					var iStartTrTag = rowData.length;
					rowData.push("");
					if( ni ) {
						rowData.push( addRowNum(0, j, ts.p.page, ts.p.rowNum, rnc ) );
					}
					if( gi ) {
						rowData.push( addMulti(rid, ni, j + 1, selr, mlc, xmlr) );
					}
					if( sc ){
						rowData.push( addSearch(rid, gi+ni, j + 1, scc) );
					}
					if( si ) {
						rowData.push( addSubGridCell.call(self, gi+ni+sc, j + 1) );
					}
					if(xmlRd.repeatitems){
						if (!F) { F=orderedCols(gi+si+ni+sc); }
						var cells = $.jgrid.getXmlData( xmlr, xmlRd.cell, true);
						$.each(F, function (k) {
							var cell = cells[this];
							if (!cell) { return false; }
							v = cell.textContent || cell.text || "";
							rd[ts.p.colModel[k+gi+si+ni+sc].name] = v;
							rowData.push( addCell(rid,v,k+gi+si+ni+sc,j+rcnt,xmlr, rd) );
						});
					} else {
						for(i = 0; i < f.length;i++) {
							v = $.jgrid.getXmlData( xmlr, f[i]);
							rd[ts.p.colModel[i+gi+si+ni+sc].name] = v;
							rowData.push( addCell(rid, v, i+gi+si+ni+sc, j+rcnt, xmlr, rd) );
						}
					}
					rowData[iStartTrTag] = constructTr(rid, hiderow, classes, rd, xmlr);
					rowData.push("</tr>");
					if(ts.p.grouping) {
						grpdata.push( rowData );
						if(!ts.p.groupingView._locgr) {
							groupingPrepare.call(self , rd, j );
						}
						rowData = [];
					}
					if(locdata || (ts.p.treeGrid === true && !(ts.p._ald)) ) {
						rd[xmlid] = $.jgrid.stripPref(ts.p.idPrefix, rid);
						ts.p.data.push(rd);
						ts.p._index[rd[xmlid]] = ts.p.data.length-1;
						if(ts.p.treeANode > -1 && ts.p.treeGridModel === 'adjacency') {
							treeadjtmp.push(rd);
						}
					}
					if(ts.p.gridview === false ) {
						tablebody.append(rowData.join(''));
						self.triggerHandler("jqGridAfterInsertRow", [rid, rd, xmlr]);
						if(afterInsRow) {ts.p.afterInsertRow.call(ts,rid,rd,xmlr);}
						rowData=[];
					}
					rd={};
					ir++;
					j++;
					if(ir===rn) {break;}
				}
			}
			spsh =  ir > 0 && ts.p.multiselect && ts.p.preserveSelection && ir === spsh ;
			if(ts.p.gridview === true) {
				fpos = ts.p.treeANode > -1 ? ts.p.treeANode: 0;
				if(ts.p.grouping) {
					if(!locdata) {
						self.jqGrid('groupingRender',grpdata,ts.p.colModel.length, ts.p.page, rn);
						grpdata = null;
					}
				} else if(ts.p.treeGrid === true && fpos > 0) {
					$(ts.rows[fpos]).after(rowData.join(''));
				} else {
					//$("tbody:first",t).append(rowData.join(''));
					tablebody.append(rowData.join(''));
					ts.grid.cols = ts.rows[0].cells; // update cached first row
				}
			}
			ts.p.totaltime = new Date() - startReq;
			rowData =null;
			if(ir>0) { if(ts.p.records===0) { ts.p.records=gl;} }
			if( ts.p.treeGrid === true) {
				try {self.jqGrid("setTreeNode", fpos+1, ir+fpos+1);} catch (e) {}
				if(ts.p.treeANode > -1 && ts.p.treeGridModel === 'adjacency') {
					v = ts.rows[ts.p.treeANode].id;
					v = ts.p._index[v]+1;
					if( v >= 1) {
						ts.p.data.splice(-(gl), gl);
						for(i=0; i < gl; i++) {
							ts.p.data.splice(v + i,0,treeadjtmp[i]);
						}
						refreshIndex();
					}
				}				
			}
			//if(!ts.p.treeGrid && !ts.p.scroll) {ts.grid.bDiv.scrollTop = 0;}
			ts.p.reccount=ir;
			ts.p.treeANode = -1;
			if(ts.p.userDataOnFooter) { self.jqGrid("footerData", "set", ts.p.userData, ts.p.formatFooterData, 0, false); }
			if(ts.p.userDataOnHeader) { self.jqGrid("headerData", "set", ts.p.userData, ts.p.formatHeaderData, 0, false); }
			if(locdata) {
				ts.p.records = gl;
				ts.p.lastpage = Math.ceil(gl/ rn);
			}
			if (!more) { ts.updatepager(false,true); }
			if(spsh) {
				setHeadCheckBox( true );
			}
			if(locdata) {
				while (ir<gl) {
					xmlr = gxml[ir];
					rid = getId(xmlr,ir+br);
					rid  = ts.p.idPrefix + rid;
					if(xmlRd.repeatitems){
						if (!F) { F=orderedCols(gi+si+ni+sc); }
						var cells2 = $.jgrid.getXmlData( xmlr, xmlRd.cell, true);
						$.each(F, function (k) {
							var cell = cells2[this];
							if (!cell) { return false; }
							v = cell.textContent || cell.text || "";
							rd[ts.p.colModel[k+gi+si+ni+sc].name] = v;
						});
					} else {
						for(i = 0; i < f.length;i++) {
							v = $.jgrid.getXmlData( xmlr, f[i]);
							rd[ts.p.colModel[i+gi+si+ni+sc].name] = v;
						}
					}
					rd[xmlid] = $.jgrid.stripPref(ts.p.idPrefix, rid);
					if( ts.p.grouping ) {
						groupingPrepare.call(self, rd, ir );
					}
					ts.p.data.push(rd);
					ts.p._index[rd[xmlid]] = ts.p.data.length-1;
					rd = {};
					ir++;
				}
				if(ts.p.grouping) {
					ts.p.groupingView._locgr = true;
					self.jqGrid('groupingRender', grpdata, ts.p.colModel.length, ts.p.page, rn);
					grpdata = null;
				}
			}
			if(ts.p.subGrid === true ) {
				try {self.jqGrid("addSubGrid",gi+ni);} catch (_){}
			}
		},
		addJSONData = function(data, rcnt, more, adjust) {
			var startReq = new Date();
			if(data) {
				if(ts.p.treeANode === -1 && !ts.p.scroll) {
					emptyRows.call(ts, false, false);
					rcnt=1;
				} else { rcnt = rcnt > 1 ? rcnt :1; }
			} else { return; }

			var dReader, frd;
			if(ts.p.datatype === "local") {
				dReader =  ts.p.localReader;
				frd= 'local';
			} else {
				dReader =  ts.p.jsonReader;
				frd='json';
			}

			var locid = "_id_",
				locdata = (ts.p.datatype !== "local" && ts.p.loadonce) || ts.p.datatype === "jsonstring",
				self = $(ts),
				ir=0,v,i,j,f=[],cur, addSubGridCell,
				gi = ts.p.multiselect ? 1 : 0,
				si = ts.p.subGrid ===true ? 1 : 0,
				ni = ts.p.rownumbers ===true ? 1 : 0,
				sc = ts.p.searchCols ===true ? 1 : 0,
				br = (ts.p.scroll && ts.p.datatype !== 'local') ? $.jgrid.randId() : 1,
				rn = parseInt(ts.p.rowNum,10),
				selected=false, selr,
				arrayReader=orderedCols(gi+si+ni+sc),
				objectReader=reader(frd),
				rowReader,len,drows,idn,rd={}, fpos, idr,rowData=[],
				treeadjtmp =[],
				classes = getstyle(stylemodule, 'rowBox', true, 'jqgrow ui-row-'+ ts.p.direction),
				afterInsRow = $.jgrid.isFunction(ts.p.afterInsertRow), grpdata=[],hiderow=false, groupingPrepare,
				tablebody = $(ts).find("tbody").first(),
				rnc = ni ? getstyle(stylemodule, 'rownumBox', false, 'jqgrid-rownum') :"",
				scc = sc ? getstyle(stylemodule, 'searchBox', false, '') :"",
				mlc = gi ? getstyle(stylemodule, 'multiBox', false, 'cbox'):"";

			if(locdata) {
				ts.p.data = [];
				ts.p._index = {};
				ts.p.localReader.id = locid;
			}

			ts.p.reccount = 0;
			ts.p.page = intNum($.jgrid.getAccessor(data,dReader.page), ts.p.page);
			ts.p.lastpage = intNum($.jgrid.getAccessor(data,dReader.total), 1);
			ts.p.records = intNum($.jgrid.getAccessor(data,dReader.records));
			ts.p.userData = $.jgrid.getAccessor(data,dReader.userdata) || {};
			
			if(si) {
				addSubGridCell = $.jgrid.getMethod("addSubGridCell");
			}
			if( ts.p.keyName===false ) {
				idn = $.jgrid.isFunction(dReader.id) ? dReader.id.call(ts, data) : dReader.id;
			} else {
				idn = ts.p.keyName;
			}
			if(dReader.repeatitems && ts.p.keyName && isNaN(idn)) {
				idn = ts.p.keyIndex;
			}
			drows = $.jgrid.getAccessor(data,dReader.root);
			if ( $.jgrid.isNull(drows) && Array.isArray(data)) { drows = data; }
			if (!drows) { drows = []; }
			len = drows.length; i = 0;
			if (len > 0 && ts.p.page <= 0) { ts.p.page = 1; }
			if (adjust) { rn *= adjust+1; }
			if(ts.p.datatype === "local" && !ts.p.deselectAfterSort) {
				selected = true;
			}
			if(ts.p.grouping)  {
				hiderow = ts.p.groupingView.groupCollapse === true;
				groupingPrepare = $.jgrid.getMethod("groupingPrepare");
			}
			while (i<len) {
				cur = drows[i];
				idr = $.jgrid.getAccessor(cur,idn);
				if(idr === undefined) {
					if (typeof idn === "number" && !$.jgrid.isNull( ts.p.colModel[idn+gi+si+ni+sc]) ) {
						// reread id by name
						idr = $.jgrid.getAccessor(cur,ts.p.colModel[idn+gi+si+ni+sc].name);
					}
					if(idr === undefined) {
						idr = br+i;
						if(f.length===0){
							if(dReader.cell){
								var ccur = $.jgrid.getAccessor(cur,dReader.cell) || cur;
								idr = !$.jgrid.isNull(ccur) && ccur[idn] !== undefined ? ccur[idn] : idr;
								ccur=null;
							}
						}
					}
				}
				idr  = ts.p.idPrefix + idr;
				if( selected || ts.p.preserveSelection) {
					if( ts.p.multiselect) {
						selr = ts.p.selarrrow.indexOf( idr ) !== -1;
						spsh = selr ? spsh+1: spsh;
					} else {
						selr = (idr === ts.p.selrow);
					}
				}
				var iStartTrTag = rowData.length;
				rowData.push("");
				if( ni ) {
					rowData.push( addRowNum(0, i, ts.p.page, ts.p.rowNum, rnc ) );
				}
				if( gi ){
					rowData.push( addMulti(idr, ni, i + 1, selr, mlc, cur) );
				}
				if( sc ){
					rowData.push( addSearch(idr, gi+ni, i + 1, scc) );
				}
				if( si ) {
					rowData.push( addSubGridCell.call(self ,gi+ni+sc,i + 1) );
				}
				rowReader=objectReader;
				if (dReader.repeatitems) {
					if(dReader.cell) {cur = $.jgrid.getAccessor(cur,dReader.cell) || cur;}
					if (Array.isArray(cur)) { rowReader=arrayReader; }
				}
				for (j=0;j<rowReader.length;j++) {
					v = $.jgrid.getAccessor(cur,rowReader[j]);
					rd[ts.p.colModel[j+gi+si+ni+sc].name] = v;
					rowData.push( addCell(idr,v,j+gi+si+ni+sc,i+rcnt,cur, rd) );
				}
				rowData[iStartTrTag] = constructTr(idr, hiderow, (selr ? classes + ' ' + highlight : classes), rd, cur);
				rowData.push( "</tr>" );
				if(ts.p.grouping) {
					grpdata.push( rowData );
					if(!ts.p.groupingView._locgr) {
						groupingPrepare.call(self , rd, i);
					}
					rowData = [];
				}
				if(locdata || (ts.p.treeGrid===true && !(ts.p._ald))) {
					rd[locid] = $.jgrid.stripPref(ts.p.idPrefix, idr);
					ts.p.data.push(rd);
					ts.p._index[rd[locid]] = ts.p.data.length-1;
					if(ts.p.treeANode > -1 && ts.p.treeGridModel === 'adjacency') {
						treeadjtmp.push(rd);
					}
				}
				if(ts.p.gridview === false ) {
					tablebody.append(rowData.join(''));
					self.triggerHandler("jqGridAfterInsertRow", [idr, rd, cur]);
					if(afterInsRow) {ts.p.afterInsertRow.call(ts,idr,rd,cur);}
					rowData=[];//ari=0;
				}
				rd={};
				ir++;
				i++;
				if(ir===rn) { break; }
			}
			spsh =  ir > 0 && ts.p.multiselect && (ts.p.preserveSelection || selected) && ir === spsh;
			if(ts.p.gridview === true ) {
				fpos = ts.p.treeANode > -1 ? ts.p.treeANode: 0;
				if(ts.p.grouping) {
					if(!locdata) {
						self.jqGrid('groupingRender', grpdata, ts.p.colModel.length, ts.p.page, rn);
						grpdata = null;
					}
				} else if(ts.p.treeGrid === true && fpos > 0) {
					$(ts.rows[fpos]).after(rowData.join(''));
				} else {
					tablebody.append(rowData.join(''));
					ts.grid.cols = ts.rows[0].cells;
				}
			}
			ts.p.totaltime = new Date() - startReq;
			rowData = null;
			if(ir>0) {
				if(ts.p.records===0) { ts.p.records=len; }
			}
			if( ts.p.treeGrid === true) {
				try {self.jqGrid("setTreeNode", fpos+1, ir+fpos+1);} catch (e) {}
				if(ts.p.treeANode > -1 && ts.p.treeGridModel === 'adjacency') {
					v = ts.rows[ts.p.treeANode].id;
					v = ts.p._index[v]+1;
					if( v >= 1) {
						ts.p.data.splice(-(len), len);
						for(i=0; i < len; i++) {
							ts.p.data.splice(v + i,0,treeadjtmp[i]);
						}
						refreshIndex();
					}
				}
			}
			//if(!ts.p.treeGrid && !ts.p.scroll) {ts.grid.bDiv.scrollTop = 0;}
			ts.p.reccount=ir;
			ts.p.treeANode = -1;
			if(ts.p.userDataOnFooter) { self.jqGrid("footerData", "set", ts.p.userData, ts.p.formatFooterData, 0, false); }
			if(ts.p.userDataOnHeader) { self.jqGrid("headerData", "set", ts.p.userData, ts.p.formatHeaderData, 0, false); }
			if(locdata) {
				ts.p.records = len;
				ts.p.lastpage = Math.ceil(len/ rn);
			}
			if (!more) { ts.updatepager(false,true); }
			if(spsh) {
				setHeadCheckBox( true );
			}
			if(locdata) {
				while (ir<len && drows[ir]) {
					cur = drows[ir];
					idr = $.jgrid.getAccessor(cur,idn);
					if(idr === undefined) {
						if (typeof idn === "number" && !$.jgrid.isNull(ts.p.colModel[idn+gi+si+ni+sc])) {
							// reread id by name
							idr = $.jgrid.getAccessor(cur,ts.p.colModel[idn+gi+si+ni+sc].name);
						}
						if(idr === undefined) {
							idr = br+ir;
							if(f.length===0){
								if(dReader.cell){
									var ccur2 = $.jgrid.getAccessor(cur,dReader.cell) || cur;
									idr = !$.jgrid.isNull(ccur2) && ccur2[idn] !== undefined ? ccur2[idn] : idr;
									ccur2=null;
								}
							}
						}
					}
					if(cur) {
						idr  = ts.p.idPrefix + idr;
						rowReader=objectReader;
						if (dReader.repeatitems) {
							if(dReader.cell) {cur = $.jgrid.getAccessor(cur,dReader.cell) || cur;}
							if (Array.isArray(cur)) { rowReader=arrayReader; }
						}

						for (j=0;j<rowReader.length;j++) {
							rd[ts.p.colModel[j+gi+si+ni+sc].name] = $.jgrid.getAccessor(cur,rowReader[j]);
						}
						rd[locid] = $.jgrid.stripPref(ts.p.idPrefix, idr);
						if(ts.p.grouping) {
							groupingPrepare.call(self, rd, ir );
						}
						ts.p.data.push(rd);
						ts.p._index[rd[locid]] = ts.p.data.length-1;
						rd = {};
					}
					ir++;
				}
				if(ts.p.grouping) {
					ts.p.groupingView._locgr = true;
					self.jqGrid('groupingRender', grpdata, ts.p.colModel.length, ts.p.page, rn);
					grpdata = null;
				}
			}
			if(ts.p.subGrid === true ) {
				try { self.jqGrid("addSubGrid",gi+ni+sc);} catch (_){}
			}
		},
		addIndexedDBData = async function ( retAll ) {
			return new Promise(function(resolve, reject){
			let INDEX_NAME = ts.p.sortname,
			ORDER = ts.p.sortorder.toLowerCase(),
			recordsperpage = parseInt(ts.p.rowNum,10),
			total=0, totalpages,
			page = parseInt(ts.p.page,10),
			srules, everyORsome = 'every',
			range = null;
			const _usecase = ts.p.ignoreCase;
			if(retAll) {
				page = 1;
				recordsperpage = 1000000;
			}
			if(!INDEX_NAME) {
				INDEX_NAME = ts.p.sortname = ts.p.colModel[0].index || ts.p.colModel[0].name;
			}
			if (ts.p.search === true) {
				srules = ts.p.postData.filters;
				if(srules) {
					if(typeof srules === "string") { srules = $.jgrid.parse(srules);}
					if(srules.groupOp === "OR") {
						everyORsome = 'some';
					}
					srules.rules.map(el=>{ 
						if(_usecase) {
							el.data = el.data.toLowerCase();
						}
						el.type = 'text';
						let col = $(ts).jqGrid('getColProp', el.field);
						let type = col.sorttype || col.stype;
						let conv =  !(el.op === 'bt' || el.op === 'in' || el.op === 'ni');
						switch(type) {
							case 'int':
							case 'integer':
								if(conv) {
									el.data = parseInt(el.data,10);
								}
								el.type='num';
								break;
							case 'float':
							case 'number':
							case 'numeric':
								if(conv) {
									el.data = parseFloat(el.data);
								}
								el.type='num';
								break;
						}
					});
				}
			}
			var compareFnMap = {
				'eq': function(queryObj, data, _uselwcs) { return (_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field])  === queryObj.data;},
				'ne': function(queryObj, data, _uselwcs) { return (_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]) !== queryObj.data;},
				'lt': function(queryObj, data, _uselwcs) { return (_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]) < queryObj.data;},
				'le': function(queryObj, data, _uselwcs) { return (_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]) <= queryObj.data;},
				'gt': function(queryObj, data, _uselwcs) { return (_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]) > queryObj.data;},
				'ge': function(queryObj, data, _uselwcs) { return (_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]) >= queryObj.data;},
				'bw': function(queryObj, data, _uselwcs) { return (_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]).indexOf(queryObj.data) === 0;},
				'bn': function(queryObj, data, _uselwcs) { return !((_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]).indexOf(queryObj.data) === 0);},
				'ew': function(queryObj, data, _uselwcs) { return (_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]).endsWith(queryObj.data);},
				'en': function(queryObj, data, _uselwcs) { return !((_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]).endsWith(queryObj.data));},
				'cn': function(queryObj, data, _uselwcs) { return (_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]).indexOf(queryObj.data) > -1;},
				'nc': function(queryObj, data, _uselwcs) { return !((_uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field])) > -1;},
				'in': function(queryObj, data, _uselwcs) { return queryObj.data.split(",").map(el=>{return (_uselwcs ? el.trim().toLowerCase() : el.trim());}).indexOf(data[queryObj.field]) > -1;},
				'ni': function(queryObj, data, _uselwcs) { return queryObj.data.split(",").map(el=>{return (_uselwcs ? el.trim().toLowerCase() : el.trim());}).indexOf(data[queryObj.field].trim()) === -1;},
				'nu': function(queryObj, data, _uselwcs) { return data[queryObj.field] === null;},
				'nn': function(queryObj, data, _uselwcs) { return data[queryObj.field] !== null;},
				'bt': function(queryObj, data, _uselwcs) { 
					let minmax = queryObj.data.split("...").map(el=>{return  queryObj.type === "num" ? el - 0 : el.trim();}); 
					try { 
						let r = _uselwcs ? data[queryObj.field].toLowerCase() : data[queryObj.field]; 
						return r >= minmax[0] && r <= minmax[1];
					} catch(e) { 
						return false;
					}
				}
			};

			const connection = window.indexedDB.open(ts.p.dbconfig.dbname);
			connection.onsuccess = function( e ) {
				const db = connection.result;
				const transaction = db.transaction(ts.p.dbconfig.dbtable, 'readonly');
				let retresult ={};
				retresult[ts.p.localReader.root] =[];
			    transaction.oncomplete = function(event) {
					if(ORDER === 'desc' || ts.p.grouping) { // we need here multi sorting too
						retresult[ts.p.localReader.root].sort(function(a,b){
							var low=[], high=[];
							if(ts.p.grouping) {
								for(let j =0;j<ts.p.groupingView.groupField.length; j++) {
									if(ts.p.groupingView.groupOrder[j] === 'asc') {
										low.push(a[ts.p.groupingView.groupField[j]]);
										high.push(b[ts.p.groupingView.groupField[j]]);
									} else {
										low.push(b[ts.p.groupingView.groupField[j]]);
										high.push(a[ts.p.groupingView.groupField[j]]);										
									}
								}
								if(ORDER === 'asc') {
									low.push(a[INDEX_NAME]);
									high.push(b[INDEX_NAME]);
								} else {
									low.push(b[INDEX_NAME]);
									high.push(a[INDEX_NAME]);										
								}
							} else {
								low = [b[INDEX_NAME]];
								high = [a[INDEX_NAME]];
							}
							return indexedDB.cmp(low,high);
						});
					}
					retresult[ts.p.localReader.root]= retresult[ts.p.localReader.root].slice( (page-1)*recordsperpage , page*recordsperpage );
					totalpages = Math.ceil(total / recordsperpage);
					retresult[ts.p.localReader.total] = totalpages;
					retresult[ts.p.localReader.page] = page;
					retresult[ts.p.localReader.records] = total;
					retresult[ts.p.localReader.userdata] = ts.p.userData;
					resolve(retresult);
				};
				
				transaction.onerror = function(event) {
					endReq();
					reject(event.target);
					//console.log(event.target);
				};
				const store = transaction.objectStore(ts.p.dbconfig.dbtable);
				const index = store.index( INDEX_NAME );
				index.count(range).onsuccess = (e) => {
					//console.log(e);
					if(ts.p.search && srules.rules.length) {
						total = 0;
					} else  {
						total = e.target.result;
					}
				};
				var limit = Math.pow(2,32) - 1;
				if(ts.p.search === false && ORDER === 'asc' && !ts.p.grouping) {
					limit = page*recordsperpage;
				}
				var res = index.getAll(range, limit);
			    res.onsuccess = event => {
					if(ts.p.search === true && srules.hasOwnProperty('rules') &&  srules.rules.length) {
						var lenn = res.result.length, i=0;
						
						while(i<lenn) {
							if(srules.rules[everyORsome](function(c) {
								return compareFnMap[c.op](c, res.result[i], _usecase && c.type === 'text');}) ) {
								total++;
								retresult[ts.p.localReader.root].push(res.result[i]);
							}
							i++;
						}
					}  else {
						retresult[ts.p.localReader.root] = res.result;
					}
				};
				res.onerror = function(event) {
					console.log(event);
				};
			};
		});},
		addLocalData = function( retAll ) {
			var st = ts.p.multiSort ? [] : "", sto=[], fndsort=false, cmtypes={}, grtypes=[], grindexes=[], srcformat, sorttype, newformat, sfld;
			if(!Array.isArray(ts.p.data)) {
				return;
			}
			var grpview = ts.p.grouping ? ts.p.groupingView : false, lengrp, gin, si;
			$.each(ts.p.colModel,function(){
                if ( !(this.name !== 'cb' && this.name !== 'subgrid' && this.name !== 'rn' && this.name !== 'sc') ) {
                    return true;
                }
				sorttype = this.sorttype || "text";
				si = this.index || this.name;
				if(sorttype === "date" || sorttype === "datetime") {
					if(this.formatter && typeof this.formatter === 'string' && this.formatter === 'date') {
						if(this.formatoptions && this.formatoptions.srcformat) {
							srcformat = this.formatoptions.srcformat;
						} else {
							srcformat = $.jgrid.getRegional(ts, "formatter.date.srcformat");
						}
						if(this.formatoptions && this.formatoptions.newformat) {
							newformat = this.formatoptions.newformat;
						} else {
							newformat = $.jgrid.getRegional(ts, "formatter.date.newformat");
						}
					} else {
						srcformat = newformat = this.datefmt || "Y-m-d";
					}
					cmtypes[si] = {"stype": sorttype, "srcfmt": srcformat,"newfmt":newformat, "sfunc": this.sortfunc || null, name : this.name};
				} else {
					cmtypes[si] = {"stype": sorttype, "srcfmt":'',"newfmt":'', "sfunc": this.sortfunc || null, name : this.name};
				}
				if(ts.p.grouping ) {
					for(gin =0, lengrp = grpview.groupField.length; gin< lengrp; gin++) {
						if( this.name === grpview.groupField[gin]) {
							grtypes[gin] = cmtypes[si];
							grindexes[gin]= si;
						}
					}
				}
				if(!ts.p.multiSort) {
					if(!fndsort && (si === ts.p.sortname)){
						st = si;
						fndsort = true;
					}
				}
			});
			if(ts.p.multiSort) {
				st =  sortarr;
				sto = sortord;
			}
			if(ts.p.treeGrid && ts.p._sort) {
				$(ts).jqGrid("SortTree", st, ts.p.sortorder, cmtypes[st].stype || 'text', cmtypes[st].srcfmt || '');
				return;
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
				"ni":function (queryObj, op) { return op === "OR" ? queryObj.orNot().inData : queryObj.andNot().inData; },
				"in":function (queryObj) { return queryObj.inData; },
				'nu':function(queryObj) {return queryObj.isNull;},
				'nn':function(queryObj,op) {return op === "OR" ? queryObj.orNot().isNull : queryObj.andNot().isNull;}

			},
			query = $.jgrid.from.call(ts, ts.p.data);
			if (ts.p.ignoreCase) { query = query.ignoreCase(); }
			function tojLinq ( group ) {
				var s = 0, index, gor, ror, opr, rule, fld;
				if (!$.jgrid.isNull(group.groups)) {
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
						} catch (e) {alert(e);}
						s++;
					}
					if (gor) {
						query.orEnd();
					}
				}
				if (!$.jgrid.isNull(group.rules)) {
					//if(s>0) {
					//	var result = query.select();
					//	query = $.jgrid.from( result);
					//	if (ts.p.ignoreCase) { query = query.ignoreCase(); }
					//}
					try{
						ror = group.rules.length && group.groupOp.toString().toUpperCase() === "OR";
						if (ror) {
							query.orBegin();
						}
						var rulefld;
						for (index = 0; index < group.rules.length; index++) {
							rule = group.rules[index];
							opr = group.groupOp.toString().toUpperCase();
							if (compareFnMap[rule.op] && rule.field ) {
								if(s > 0 && opr && opr === "OR") {
									query = query.or();
								}
								rulefld = rule.field;
								if( ts.p.useNameForSearch) {
									if(cmtypes.hasOwnProperty(rule.field)) {
										rulefld = cmtypes[rule.field].name;
									}
								}
								try {
									fld = cmtypes[rule.field];
									if(fld.stype === 'date') {
										if(typeof fld.srcfmt === "string" && typeof fld.newfmt === "string" ) {
											rule.data = $.jgrid.parseDate.call(ts, fld.newfmt, rule.data, fld.srcfmt);
										}
									}
									query = compareFnMap[rule.op](query, opr)(rulefld, rule.data, fld);
								} catch (e) {}
							} else if( ts.p.customFilterDef !== undefined && ts.p.customFilterDef[rule.op] !== undefined  && $.jgrid.isFunction(ts.p.customFilterDef[rule.op].action)) {
								query = query.user.call(ts, rule.op, rule.field, rule.data);
							}
							s++;
						}
						if (ror) {
							query.orEnd();
						}
					} catch (g) {alert(g);}
				}
			}

			if (ts.p.search === true) {
				var srules = ts.p.postData.filters;
				if(srules) {
					if(typeof srules === "string") { srules = $.jgrid.parse(srules);}
					tojLinq( srules );
				} else {
					try {
						sfld = cmtypes[ts.p.postData.searchField];
						if(sfld.stype === 'date') {
							if(sfld.srcfmt && sfld.newfmt && sfld.srcfmt !== sfld.newfmt ) {
								ts.p.postData.searchString = $.jgrid.parseDate.call(ts, sfld.newfmt, ts.p.postData.searchString, sfld.srcfmt);
							}
						}
 						if(compareFnMap[ts.p.postData.searchOper]) {
						query = compareFnMap[ts.p.postData.searchOper](query)(ts.p.postData.searchField, ts.p.postData.searchString,cmtypes[ts.p.postData.searchField]);
						} else if( ts.p.customFilterDef !== undefined && ts.p.customFilterDef[ts.p.postData.searchOper] !== undefined  && $.jgrid.isFunction(ts.p.customFilterDef[ts.p.postData.searchOper].action)) {
							query = query.user.call(ts, ts.p.postData.searchOper, ts.p.postData.searchField, ts.p.postData.searchString);
						}
					} catch (se){}
				}
			}
			if(ts.p.treeGrid && ts.p.treeGridModel === "nested") {
				query.orderBy(ts.p.treeReader.left_field, 'asc', 'integer', '', null);
			}
			if(ts.p.treeGrid && ts.p.treeGridModel === "adjacency") {
				lengrp =0;
				st = null;
			}
			if(ts.p.grouping) {
				for(gin=0; gin<lengrp;gin++) {
					query.orderBy(grindexes[gin],grpview.groupOrder[gin],grtypes[gin].stype, grtypes[gin].srcfmt);
				}
			}
			if(ts.p.multiSort) {
				$.each(st,function(i){
					query.orderBy(this, sto[i], cmtypes[this].stype, cmtypes[this].srcfmt, cmtypes[this].sfunc);
				});
			} else {
				if (st && ts.p.sortorder && fndsort) {
					// to be fixed in case sortname has more than one field
					if(ts.p.sortorder.toUpperCase() === "DESC") {
						query.orderBy(ts.p.sortname, "d", cmtypes[st].stype, cmtypes[st].srcfmt, cmtypes[st].sfunc);
					} else {
						query.orderBy(ts.p.sortname, "a", cmtypes[st].stype, cmtypes[st].srcfmt, cmtypes[st].sfunc);
					}
				}
			}
			var queryResults = query.select(),
			recordsperpage = parseInt(ts.p.rowNum,10),
			total = queryResults.length,
			page = parseInt(ts.p.page,10),
			totalpages = Math.ceil(total / recordsperpage),
			retresult = {};
			if((ts.p.search || ts.p.resetsearch) && ts.p.grouping && ts.p.groupingView._locgr) {
				ts.p.groupingView.groups =[];
				var j, grPrepare = $.jgrid.getMethod("groupingPrepare"), key, udc;
				if(ts.p.footerrow && ts.p.userDataOnFooter) {
					for (key in ts.p.userData) {
						if(ts.p.userData.hasOwnProperty(key)) {
							ts.p.userData[key] = 0;
						}
					}
					udc = true;
				}
				for(j=0; j<total; j++) {
					if(udc) {
						for(key in ts.p.userData){
							if( ts.p.userData.hasOwnProperty( key ) ) {
								ts.p.userData[key] += parseFloat(queryResults[j][key] || 0);
							}
						}
					}
					grPrepare.call($(ts),queryResults[j],j, recordsperpage );
				}
			}
			if( retAll ) {
				return  queryResults;
			}
			if(ts.p.treeGrid && ts.p.search) {
				queryResults = $(ts).jqGrid("searchTree", queryResults);
			} else {
				queryResults = queryResults.slice( (page-1)*recordsperpage , page*recordsperpage );
			}
			query = null;
			cmtypes = null;
			retresult[ts.p.localReader.total] = totalpages;
			retresult[ts.p.localReader.page] = page;
			retresult[ts.p.localReader.records] = total;
			retresult[ts.p.localReader.root] = queryResults;
			retresult[ts.p.localReader.userdata] = ts.p.userData;
			queryResults = null;
			return  retresult;
		},
		updatepager = function(rn, dnd) {
			var cp, last, base, from,to,tot,fmt, pgboxes = "", sppg,
			pgid = ts.p.pager ? ts.p.pager.substring(1) : "",
			tspg = pgid ? "_"+pgid : "",
			tspg_t = ts.p.toppager ? "_"+ts.p.toppager.slice(1) : "";
			base = parseInt(ts.p.page,10)-1;
			if(base < 0) { base = 0; }
			base = base*parseInt(ts.p.rowNum,10);
			to = base + ts.p.reccount;
			if (ts.p.scroll) {
				var rows = $("tbody", ts.grid.bDiv).first().find("> tr").slice( 1 );
				if(to > ts.p.records) {
					to = ts.p.records;
				}
				base = to - rows.length;
				ts.p.reccount = rows.length;
				var rh = rows.outerHeight() || ts.grid.prevRowHeight;
				if (rh) {
					var top = base * rh;
					var height = parseInt(ts.p.records,10) * rh;
					$(ts.grid.bDiv).find(">div").first().css({height : height}).children("div").first().css({height:top,display:top?"":"none"});
					if (ts.grid.bDiv.scrollTop === 0 && ts.p.page > 1) {
						ts.grid.bDiv.scrollTop = ts.p.rowNum * (ts.p.page - 1) * rh;
					}
				}
				ts.grid.bDiv.scrollLeft = ts.grid.hDiv.scrollLeft;
			}
			pgboxes = ts.p.pager || "";
			pgboxes += ts.p.toppager ?  (pgboxes ? "," + ts.p.toppager : ts.p.toppager) : "";
			if(pgboxes) {
				fmt = $.jgrid.getRegional(ts, "formatter.integer");
				cp = intNum(ts.p.page);
				last = intNum(ts.p.lastpage);
				$(".selbox",pgboxes)[ this.p.useProp ? 'prop' : 'attr' ]("disabled",false);
				if(ts.p.pginput===true) {
					$('.ui-pg-input',pgboxes)[$('.ui-pg-input',pgboxes).first().is(':input')?'val':'html']( (last < cp) ? ts.p.lastpage : ts.p.page);
					sppg = ts.p.toppager ? '#sp_1'+tspg+",#sp_1"+tspg_t : '#sp_1'+tspg;
					$(sppg).html($.fmatter ? $.fmatter.util.NumberFormat(ts.p.lastpage,fmt):ts.p.lastpage);
				}
				if (ts.p.viewrecords){
					if(ts.p.reccount === 0) {
						$(".ui-paging-info",pgboxes).html($.jgrid.getRegional(ts, "defaults.emptyrecords", ts.p.emptyrecords ));
					} else {
						from = base+1;
						tot=ts.p.records;
						if($.fmatter) {
							from = $.fmatter.util.NumberFormat(from,fmt);
							to = $.fmatter.util.NumberFormat(to,fmt);
							tot = $.fmatter.util.NumberFormat(tot,fmt);
						}
						var rt = $.jgrid.getRegional(ts, "defaults.recordtext", ts.p.recordtext);
						$(".ui-paging-info",pgboxes).html($.jgrid.template( rt ,from,to,tot));
					}
				}
				if(ts.p.pgbuttons===true) {
					if(cp<=0) {cp = last = 0;}
					if(cp===1 || cp === 0) {
						$("#first"+tspg+", #prev"+tspg).addClass( disabled ).removeClass( hover );
						if(ts.p.toppager) { $("#first_t"+tspg_t+", #prev_t"+tspg_t).addClass( disabled ).removeClass( hover ); }
					} else {
						$("#first"+tspg+", #prev"+tspg).removeClass( disabled );
						if(ts.p.toppager) { $("#first_t"+tspg_t+", #prev_t"+tspg_t).removeClass( disabled ); }
					}
					if(cp===last || cp === 0) {
						$("#next"+tspg+", #last"+tspg).addClass( disabled ).removeClass( hover );
						if(ts.p.toppager) { $("#next_t"+tspg_t+", #last_t"+tspg_t).addClass( disabled ).removeClass( hover ); }
					} else {
						$("#next"+tspg+", #last"+tspg).removeClass( disabled );
						if(ts.p.toppager) { $("#next_t"+tspg_t+", #last_t"+tspg_t).removeClass( disabled ); }
					}
				}
			}
			if(rn===true && ts.p.rownumbers === true) {
				$(">td.jqgrid-rownum",ts.rows).each(function(i){
					$(this).html(base+1+i);
				});
			}
			if(ts.p.reccount === 0 ) {
				var classes = ts.p.emptyRecordRow ?
					getstyle(stylemodule, 'rowBox', true, 'jqgrow ui-row-'+ ts.p.direction+' not-editable-row not-editable-cell '+ disabled) :
					'jqgfirstrow not-editable-row not-editable-cell',
				tstr = constructTr("norecs", false, classes, {}, "");
		
				tstr += ts.p.emptyRecordRow ? 
				"<td style='text-align:center;' colspan='"+grid.headers.length+"'>"+$.jgrid.getRegional(ts, "defaults.emptyrecords", ts.p.emptyrecords )+"</td>" :
				"<td style='height:0.1px;visibility:hidden;' colspan='"+grid.headers.length+"'>&nbsp;</td>";
				tstr += "</tr>";
				$(grid.bDiv).find("table").first().append(tstr);
			}
			if(dnd && ts.p.jqgdnd) { $(ts).jqGrid('gridDnD','updateDnD');}
			$(ts).triggerHandler("jqGridGridComplete");
			if($.jgrid.isFunction(ts.p.gridComplete)) {ts.p.gridComplete.call(ts);}
			$(ts).triggerHandler("jqGridAfterGridComplete");
		},
		beginReq = function() {
			ts.grid.hDiv.loading = true;
			if(ts.p.hiddengrid) { return;}
			$(ts).jqGrid("progressBar", {method:"show", loadtype : ts.p.loadui, htmlcontent: $.jgrid.getRegional(ts, "defaults.loadtext", ts.p.loadtext) });
		},
		endReq = function() {
			ts.grid.hDiv.loading = false;
			$(ts).jqGrid("progressBar", {method:"hide", loadtype : ts.p.loadui });
		},
		beforeprocess = function(data, st, xhr) {
			var bfpcr = $(ts).triggerHandler("jqGridBeforeProcessing", [data,st,xhr]);
			bfpcr = (bfpcr === undefined || typeof(bfpcr) !== 'boolean') ? true : bfpcr;
			if ($.jgrid.isFunction(ts.p.beforeProcessing)) {
				if (ts.p.beforeProcessing.call(ts, data, st, xhr) === false) {
					bfpcr =  false;
				}
			}
			return bfpcr;
		},
		afterprocess = function(dstr, lcf) {
			$(ts).triggerHandler("jqGridLoadComplete", [dstr]);
			if(lcf) {ts.p.loadComplete.call(ts,dstr);}
			$(ts).triggerHandler("jqGridAfterLoadComplete", [dstr]);
			ts.p.datatype = "local";
			ts.p.datastr = null;
			endReq();
		},
		populate = function (npage) {
			if(!ts.grid.hDiv.loading) {
				var pvis = ts.p.scroll && npage === false,
				prm = {}, dt, dstr, pN=ts.p.prmNames;
				spsh = 0;
				if(ts.p.page <=0) { ts.p.page = Math.min(1,ts.p.lastpage); }
				if( !$.jgrid.isNull(pN.search, true) ) {prm[pN.search] = ts.p.search;}
				if(!$.jgrid.isNull(pN.nd, true) ) {prm[pN.nd] = new Date().getTime();}
				if(!$.jgrid.isNull(pN.rows, true) ) {prm[pN.rows]= ts.p.rowNum;}
				if(!$.jgrid.isNull(pN.page, true) ) {prm[pN.page]= ts.p.page;}
				if(!$.jgrid.isNull(pN.sort, true) ) {prm[pN.sort]= ts.p.sortname;}
				if(!$.jgrid.isNull(pN.order, true) ) {prm[pN.order]= ts.p.sortorder;}
				if(!$.jgrid.isNull(ts.p.rowTotal, true) && !$.jgrid.isNull(pN.totalrows, true) ) { prm[pN.totalrows]= ts.p.rowTotal; }

				var lcf = $.jgrid.isFunction(ts.p.loadComplete), lc = lcf ? ts.p.loadComplete : null;
				var adjust = 0;
				npage = npage || 1;
				if (npage > 1) {
					if( !$.jgrid.isNull(pN.npage, true) ) {
						prm[pN.npage] = npage;
						adjust = npage - 1;
						npage = 1;
					} else {
						lc = function(req) {
							ts.p.page++;
							ts.grid.hDiv.loading = false;
							if (lcf) {
								ts.p.loadComplete.call(ts,req);
							}
							populate(npage-1);
						};
					}
				} else if (!$.jgrid.isNull(pN.npage, true) ) {
					delete ts.p.postData[pN.npage];
				}
				if(ts.p.grouping) {
					$(ts).jqGrid('groupingSetup');
					var grp = ts.p.groupingView, gi, gs="", tmpordarr = [];
					for(gi=0;gi<grp.groupField.length;gi++) {
						var index = grp.groupField[gi];
						$.each(ts.p.colModel, function(cmIndex, cmValue) {
							if (cmValue.name === index && cmValue.index){
								index = cmValue.index;
							}
						} );
						tmpordarr.push(index +" "+grp.groupOrder[gi]);
					}
					gs = tmpordarr.join();
					if( $.jgrid.trim(prm[pN.sort]) !== "") {
						prm[pN.sort] = gs!=="" ? gs + " ,"+prm[pN.sort] : prm[pN.sort];
					} else {
						prm[pN.sort] = gs;
						prm[pN.order] = "";
					}
					/*
					if(ts.p.datatype==='local' && !grp._locgr) {
						ts.p.datatype = 'jsonstring';
						ts.p.datastr = ts.p.data;
					}
					*/
				}
				$.extend(ts.p.postData,prm);
				var rcnt = !ts.p.scroll ? 1 : ts.rows.length-1;
				if ($.jgrid.isFunction(ts.p.datatype)) {
					ts.p.datatype.call(ts,ts.p.postData,"load_"+ts.p.id, rcnt, npage, adjust);
					return;
				}
				var bfr = $(ts).triggerHandler("jqGridBeforeRequest");
				if (bfr === false || bfr === 'stop') { return; }
				if ($.jgrid.isFunction(ts.p.beforeRequest)) {
					bfr = ts.p.beforeRequest.call(ts);
					if (bfr === false || bfr === 'stop') { return; }
				}
				//bvn
				if ($.jgrid.isFunction(ts.treeGrid_beforeRequest)) {
					ts.treeGrid_beforeRequest.call(ts);
				}

				dt = ts.p.datatype.toLowerCase();
				switch(dt)
				{
				case "json":
				case "jsonp":
				case "xml":
				case "script":
					$.ajax($.extend({
						url:ts.p.url,
						type:ts.p.mtype,
						dataType: dt ,
						data: $.jgrid.isFunction(ts.p.serializeGridData)? ts.p.serializeGridData.call(ts,ts.p.postData) : ts.p.postData,
						success:function(data,st, xhr) {
							if(!beforeprocess(data, st,xhr)) {
								endReq();
								return;
							}
							if(dt === "xml") { addXmlData(data, rcnt,npage>1,adjust); }
							else { addJSONData(data, rcnt, npage>1, adjust); }
							$(ts).triggerHandler("jqGridLoadComplete", [data]);
							if(lc) { lc.call(ts,data); }
							$(ts).triggerHandler("jqGridAfterLoadComplete", [data]);
							if (pvis) { ts.grid.populateVisible(); }
							if (!ts.p.treeGrid_bigData) {
								if( ts.p.loadonce || ts.p.treeGrid) {ts.p.datatype = "local";}
							} else {
								if( ts.p.loadonce) {ts.p.datatype = "local";} //bvn13
							}
							data=null;
							if (npage === 1) { endReq(); }
							// bvn
							if ($.jgrid.isFunction(ts.treeGrid_afterLoadComplete)) {
								ts.treeGrid_afterLoadComplete.call(ts);
							}
						},
						error:function(xhr,st,err){
							$(ts).triggerHandler("jqGridLoadError", [xhr,st,err]);
							if($.jgrid.isFunction(ts.p.loadError)) { ts.p.loadError.call(ts,xhr,st,err); }
							if (npage === 1) { endReq(); }
							xhr=null;
						},
						beforeSend: function(xhr, settings ){
							var gotoreq = true;
							gotoreq = $(ts).triggerHandler("jqGridLoadBeforeSend", [xhr,settings]);
							if($.jgrid.isFunction(ts.p.loadBeforeSend)) {
								gotoreq = ts.p.loadBeforeSend.call(ts,xhr, settings);
							}
							if(gotoreq === undefined) { gotoreq = true; }
							if(gotoreq === false) {
								return false;
							}
							beginReq();
						}
					},$.jgrid.ajaxOptions, ts.p.ajaxGridOptions));
				break;
				case "xmlstring":
					beginReq();
					dstr = typeof ts.p.datastr !== 'string' ? ts.p.datastr : $.parseXML(ts.p.datastr);
					if(!beforeprocess(dstr, 200 , null)) {
						endReq();
						return;
					}
					addXmlData(dstr);
					afterprocess(dstr, lcf);
				break;
				case "jsonstring":
					beginReq();
					if(typeof ts.p.datastr === 'string') { dstr = $.jgrid.parse(ts.p.datastr); }
					else { dstr = ts.p.datastr; }
					if(!beforeprocess(dstr, 200 , null)) {
						endReq();
						return;
					}
					addJSONData(dstr);
					/*
					if(ts.p.grouping && ts.p.groupingView._locgr) {
						// back to original data???
						ts.p.data = dstr;
					}
					*/
					afterprocess(dstr, lcf);
				break;
				case "local":
				case "clientside":
					beginReq();
					ts.p.datatype = "local";
					ts.p._ald = true;
					var req = addLocalData( false );
					if(!beforeprocess(req, 200 , null)) {
						endReq();
						return;
					}
					addJSONData(req,rcnt,npage>1,adjust);
					$(ts).triggerHandler("jqGridLoadComplete", [req]);
					if(lc) { lc.call(ts,req); }
					$(ts).triggerHandler("jqGridAfterLoadComplete", [req]);
					if (pvis) { ts.grid.populateVisible(); }
					if (npage === 1) { 
					endReq();
					}
					ts.p._ald = false;
				break;
				case "indexeddb":
					if(!ts.p.dbconfig.ready_req) {
						return;
				}
					beginReq();
					addIndexedDBData(false).then(function(res) {
						if(!beforeprocess(res, 200 , null)) {
							endReq();
							return;
						}
						addJSONData(res, rcnt, npage>1, adjust);
						$(ts).triggerHandler("jqGridLoadComplete", [res]);
						if(lc) { lc.call(ts,res); }
						$(ts).triggerHandler("jqGridAfterLoadComplete", [res]);
						if (pvis) { ts.grid.populateVisible(); }
						endReq();
						ts.p._ald = false;
					});
				break;				
				}
				ts.p._sort = false;
			}
		},
		setHeadCheckBox = function ( checked ) {
			$('#cb_'+$.jgrid.jqID(ts.p.id),ts.grid.hDiv)[ts.p.useProp ? 'prop': 'attr']("checked", checked);
		},
		setPager = function (pgid, tp){
			// TBD - consider escaping pgid with pgid = $.jgrid.jqID(pgid);
			var sep = "<td class='ui-pg-button "+disabled+"'><span class='ui-separator'></span></td>",
			pginp = "",
			pgl="<table class='ui-pg-table ui-common-table ui-paging-pager'><tbody><tr>",
			str="", pgcnt, lft, cent, rgt, twd, tdw, i, removebutt,
			clearVals = function(onpaging, thus){
				var ret;
				ret = $(ts).triggerHandler("jqGridPaging", [onpaging, thus]);
				if(ret==='stop') {return false;}
				if ($.jgrid.isFunction(ts.p.onPaging) ) { ret = ts.p.onPaging.call(ts,onpaging, thus); }
				if(ret==='stop') {return false;}
				ts.p.selrow = null;
				if(ts.p.multiselect) {
					if(!ts.p.preserveSelection) {
						ts.p.selarrrow =[];
					}
					setHeadCheckBox( false );
				}
				ts.p.savedRow = [];
				return true;
			};
			//pgid = pgid.substr(1);
			tp += "_" + pgid;
			pgcnt = "pg_"+pgid;
			lft = pgid+"_left"; cent = pgid+"_center"; rgt = pgid+"_right";
			$("#"+$.jgrid.jqID(pgid) )
			.append("<div id='"+pgcnt+"' class='ui-pager-control' role='group'><table " + getstyle(stylemodule, 'pagerTable', false, 'ui-pg-table ui-common-table ui-pager-table') + "><tbody><tr><td id='"+lft+"' align='left'></td><td id='"+cent+"' align='center' style='white-space:pre;'></td><td id='"+rgt+"' align='right'></td></tr></tbody></table></div>")
			.attr("dir", dir); 
			if(ts.p.rowList.length >0){
				str = "<td dir=\""+dir+"\">";
				str +="<select "+getstyle(stylemodule, 'pgSelectBox', false, 'ui-pg-selbox')+" size=\"1\" name=\"pg_sel_box\" role=\"listbox\" title=\""+($.jgrid.getRegional(ts,"defaults.pgrecs",ts.p.pgrecs) || "")+ "\">";
				var strnm;
				for(i=0;i<ts.p.rowList.length;i++){
					strnm = ts.p.rowList[i].toString().split(":");
					if(strnm.length === 1) {
						strnm[1] = strnm[0];
					}
					if (strnm[1].length == 0) {
						str +="<option role=\"option\" value=\""+strnm[0]+"\""+(( intNum(ts.p.rowNum,0) === intNum(strnm[0],0))?" aria-label=\""+strnm[1]+"\" selected=\"selected\"":"")+">"+strnm[1]+"</option>";
					} else {
						str +="<option role=\"option\" value=\""+strnm[0]+"\""+(( intNum(ts.p.rowNum,0) === intNum(strnm[0],0))?" selected=\"selected\"":"")+">"+strnm[1]+"</option>";
					}
				}
				str +="</select></td>";
			}
			if(dir==="rtl") { 
				pgl += str; 
				$("#"+rgt).attr("align","left");
			}
			if(ts.p.pginput===true) {
				pginp= "<td id='input"+tp+"' dir='"+dir+"'>"+$.jgrid.template( $.jgrid.getRegional(ts, "defaults.pgtext", ts.p.pgtext) || "","<input "+getstyle(stylemodule, 'pgInput', false, 'ui-pg-input') + " type='text' size='2' maxlength='7' value='0' role='textbox' name='jqgpginput'/>","<span id='sp_1_"+$.jgrid.jqID(pgid)+"'></span>")+"</td>";
			}
			var po=["first"+tp,"prev"+tp, "next"+tp,"last"+tp];
			if(ts.p.pgbuttons===true) {
				var btc=getstyle(stylemodule, 'pgButtonBox', true, 'ui-pg-button'),
						pot = [($.jgrid.getRegional(ts,"defaults.pgfirst",ts.p.pgfirst) || ""),
								($.jgrid.getRegional(ts,"defaults.pgprev",ts.p.pgprev) || ""),
								($.jgrid.getRegional(ts,"defaults.pgnext",ts.p.pgnext) || ""),
								($.jgrid.getRegional(ts,"defaults.pglast",ts.p.pglast) || "")],
									n1, n2,n3, n4, nn;
				if(dir==="rtl") {
					po.reverse();
					pot.reverse();
				}
				n1 = "<td id='"+po[0]+"' class='"+btc+"' title='"+ pot[0] +"'" + "><span " + getstyle(stylemodule, 'icon_first', false, iconbase)+"></span></td>";
				n2 = "<td id='"+po[1]+"' class='"+btc+"'  title='"+ pot[1] +"'" +"><span " + getstyle(stylemodule, 'icon_prev', false, iconbase)+"></span></td>";
				n3 = "<td id='"+po[2]+"' class='"+btc+"' title='"+ pot[2] +"'" +"><span " + getstyle(stylemodule, 'icon_next',false, iconbase)+"></span></td>";
				n4 = "<td id='"+po[3]+"' class='"+btc+"' title='"+ pot[3] +"'" +"><span " + getstyle(stylemodule, 'icon_end',false, iconbase)+"></span></td>";
				nn = pginp !== "" ? sep+pginp+sep:"";
				if (dir === 'ltr') {
					pgl += n1 + n2 + nn + n3 + n4;
				} else {
					pgl += n4 + n3  +nn + n2 + n1;
				}
			} else if (pginp !== "") {
				pgl += pginp;
			}
			if(dir==="ltr") {
				pgl += str;
			}
			pgl += "</tr></tbody></table>";
			pgid = $.jgrid.jqID(pgid);
			pgcnt = $.jgrid.jqID(pgcnt);
			if(ts.p.viewrecords===true) {
				$("td#"+pgid+"_"+ts.p.recordpos,"#"+pgcnt).append("<div dir='"+dir+"' class='ui-paging-info'></div>");
			}
			$("td#"+pgid+"_"+ts.p.pagerpos,"#"+pgcnt).append(pgl);
			tdw = $("#gbox_"+$.jgrid.jqID(ts.p.id)).css("font-size") || "11px";
			$("#gbox_"+$.jgrid.jqID(ts.p.id)).append("<div id='testpg' "+getstyle(stylemodule, 'entrieBox', false, 'ui-jqgrid')+" style='font-size:"+tdw+";visibility:hidden;' ></div>");
			twd = $(pgl).clone().appendTo("#testpg").width();
			$("#testpg").remove();
			if(twd > 0) {
				if(pginp !== "") { twd += 50; } //should be param
				removebutt = twd > $("td#"+pgid+"_"+ts.p.pagerpos,"#"+pgcnt).innerWidth();
				$("td#"+pgid+"_"+ts.p.pagerpos,"#"+pgcnt).width(twd);
			}
			ts.p._nvtd = [];
			ts.p._nvtd[0] = twd ? Math.floor((ts.p.width - twd)/2) : Math.floor(ts.p.width/3);
			ts.p._nvtd[1] = 0;
			pgl=null;
			$('.ui-pg-selbox',"#"+pgcnt).on('change',function() {
				if(!clearVals('records', this)) { return false; }
				ts.p.page = Math.round(ts.p.rowNum*(ts.p.page-1)/this.value-0.5)+1;
				ts.p.rowNum = this.value;
				if(ts.p.pager) { $('.ui-pg-selbox', ts.p.pager ).val(this.value); }
				if(ts.p.toppager) { $('.ui-pg-selbox', ts.p.toppager).val(this.value); }
				populate();
				return false;
			});
			if(ts.p.pgbuttons===true) {
				$(".ui-pg-button","#"+pgcnt).hover(function(){
					if($(this).hasClass(disabled)) {
						this.style.cursor='default';
					} else {
						$(this).addClass(hover);
						this.style.cursor='pointer';
					}
				},function() {
					if(!$(this).hasClass(disabled)) {
						$(this).removeClass(hover);
						this.style.cursor= "default";
					}
				});
				$("#first"+$.jgrid.jqID(tp)+", #prev"+$.jgrid.jqID(tp)+", #next"+$.jgrid.jqID(tp)+", #last"+$.jgrid.jqID(tp)).click( function() {
					if ($(this).hasClass(disabled)) {
						return false;
					}
					var cp = intNum(ts.p.page,1),
					last = intNum(ts.p.lastpage,1), selclick = false,
					fp=true, pp=true, np=true,lp=true;
					if(last ===0 || last===1) {
						fp=false;
						pp=false;
						np=false;
						lp=false;
					} else if( last>1 && cp >=1) {
						if( cp === 1) {
							fp=false;
							pp=false;
						} else if( cp===last){
							np=false;
							lp=false;
						}
					} else if( last>1 && cp===0 ) {
						np=false;
						lp=false;
						cp=last-1;
					}
					if(!clearVals(this.id.split("_")[0], this)) { return false; }
					if( this.id === 'first'+tp && fp ) { ts.p.page=1; selclick=true;}
					if( this.id === 'prev'+tp && pp) { ts.p.page=(cp-1); selclick=true;}
					if( this.id === 'next'+tp && np) { ts.p.page=(cp+1); selclick=true;}
					if( this.id === 'last'+tp && lp) { ts.p.page=last; selclick=true;}
					if(selclick) {
						populate();
					}
					$.jgrid.setSelNavIndex(ts, this);
					return false;
				});
			}
			if(ts.p.pginput===true) {
				$("#"+pgcnt).on('keypress','input.ui-pg-input', function(e) {
					var key = e.charCode || e.keyCode || 0;
					if(key === 13) {
						e.preventDefault();
						if(!clearVals('user', this)) { return false; }
						$(this).val( intNum( $(this).val(), 1));
						ts.p.page = ($(this).val()>0) ? $(this).val():ts.p.page;
						populate();
						return false;
					}
					return this;
				});
			}
			if(removebutt && ts.p.responsive && !ts.p.forcePgButtons) {
				$("#"+po[0]+",#"+po[3]+",#input"+$.jgrid.jqID(tp)).hide();
				$(".ui-paging-info", "td#"+pgid+"_"+ts.p.recordpos).hide();
				$(".ui-pg-selbox","td#"+pgid+"_"+ts.p.pagerpos).hide();
			}
		},
		multiSort = function(iCol, obj, sor ) {
			var cm = ts.p.colModel,selarr =[],
					/*ts.p.frozenColumns ?  (ts.p.autoResizing ? ts.grid.headers[iCol].el : obj) :*/  so="", sn;
			selarr.push(ts.grid.headers[iCol].el);
			$("span.ui-grid-ico-sort",selarr).addClass(disabled);
			$(selarr).attr({"aria-selected":"false","aria-sort" : "none"});
			sn = (cm[iCol].index || cm[iCol].name);
			if ( typeof sor === "undefined" )
			{
				if(cm[iCol].lso) {
					if(cm[iCol].lso==="asc") {
						cm[iCol].lso += "-desc";
						so = "desc";
					} else if(cm[iCol].lso==="desc") {
						cm[iCol].lso += "-asc";
						so = "asc";
					} else if(cm[iCol].lso==="asc-desc" || cm[iCol].lso==="desc-asc") {
						cm[iCol].lso="";
					}
				} else {
					cm[iCol].lso = so = cm[iCol].firstsortorder || 'asc';
				}
			}
			else {
				cm[iCol].lso = so = sor;
			}
			if( so ) {
				$("span.s-ico",selarr).show();
				$("span.ui-icon-"+so,selarr).removeClass(disabled);
				$(selarr).attr({"aria-selected":"true","aria-sort" : so+"ending"});
			} else {
				if(!ts.p.viewsortcols[0]) {
					$("span.s-ico",selarr).hide();
				}
			}
			var isn = sortarr.indexOf( sn );
			if( isn === -1 ) {
				sortarr.push( sn );
				sortord.push( so );
			} else {
				if( so ) {
					sortord[isn] = so;
				} else {
					sortord.splice( isn, 1 );
					sortarr.splice( isn, 1 );
				}
			}
			ts.p.sortorder = "";
			ts.p.sortname = "";
			for( var i = 0, len = sortarr.length; i < len ; i++) {
				if( i > 0) {
					ts.p.sortname += ", ";
				}
				ts.p.sortname += sortarr[ i ];
				if( i !== len -1) {
					ts.p.sortname += " "+sortord[ i ];
				}
			}
			ts.p.sortorder = sortord[ len -1 ];
			/*
			$.each(cm, function(i){
				if(this.lso) {
					if(i>0 && fs) {
						sort += ", ";
					}
					splas = this.lso.split("-");
					sort += cm[i].index || cm[i].name;
					sort += " "+splas[splas.length-1];
					fs = true;
					ts.p.sortorder = splas[splas.length-1];
				}
			});
			ls = sort.lastIndexOf(ts.p.sortorder);
			sort = sort.substring(0, ls);
			ts.p.sortname = sort;
			*/
		},
		sortData = function (index, idxcol,reload,sor, obj){
			if(!ts.p.colModel[idxcol].sortable) { return; }
			if(ts.p.savedRow.length > 0) {return;}
			if(!reload) {
				if( ts.p.lastsort === idxcol && ts.p.sortname !== "" ) {
					if( ts.p.sortorder === 'asc') {
						ts.p.sortorder = 'desc';
					} else if(ts.p.sortorder === 'desc') { ts.p.sortorder = 'asc';}
				} else { ts.p.sortorder = ts.p.colModel[idxcol].firstsortorder || 'asc'; }
				ts.p.page = 1;
			}
			if(ts.p.multiSort) {
				multiSort( idxcol, obj, sor);
			} else {
				if(sor) {
					if(ts.p.lastsort === idxcol && ts.p.sortorder === sor && !reload) { return; }
					ts.p.sortorder = sor;
				}
				var previousSelectedTh = ts.grid.headers[ts.p.lastsort] ? ts.grid.headers[ts.p.lastsort].el : null, newSelectedTh = /*ts.p.frozenColumns ?  obj :*/ ts.grid.headers[idxcol].el,
						// newSelThFC = ts.p.frozenColumns ?  obj : null,
						//sortrule = $.trim(ts.p.viewsortcols[1] === 'single' ? hidden : disabled);
					usehide = ts.p.viewsortcols[1] === 'single' ? true : false, tmpicon;
				tmpicon = $(previousSelectedTh).find("span.ui-grid-ico-sort");
				tmpicon.addClass(disabled);
				if(usehide) {
					$(tmpicon).css("display","none");
				}
				$(previousSelectedTh).attr({"aria-selected":"false","aria-sort" : "none"});
				tmpicon = $(newSelectedTh).find("span.ui-icon-"+ts.p.sortorder);
				tmpicon.removeClass(disabled);
				if(usehide) { tmpicon.css("display",""); }
				$(newSelectedTh).attr({"aria-selected":"true","aria-sort" : ts.p.sortorder + "ending"});
				if(!ts.p.viewsortcols[0]) {
					if(ts.p.lastsort !== idxcol) {
						$("span.s-ico",previousSelectedTh).hide();
						$("span.s-ico",newSelectedTh).show();
					} else if (ts.p.sortname === "") { // if ts.p.lastsort === idxcol but ts.p.sortname === ""
						$("span.s-ico",newSelectedTh).show();
					}
				}
				index = index.substring(5 + ts.p.id.length + 1); // bad to be changed!?!
				ts.p.sortname = ts.p.colModel[idxcol].index || index;
			}
			if ($(ts).triggerHandler("jqGridSortCol", [ts.p.sortname, idxcol, ts.p.sortorder]) === 'stop') {
				ts.p.lastsort = idxcol;
				return;
			}
			if($.jgrid.isFunction(ts.p.onSortCol)) {
				if (ts.p.onSortCol.call(ts, ts.p.sortname, idxcol, ts.p.sortorder)==='stop') {
					ts.p.lastsort = idxcol;
					return;
				}
			}
			setHeadCheckBox(false);
			if(ts.p.datatype === "local") {
				if(ts.p.deselectAfterSort && !ts.p.preserveSelection) {
					$(ts).jqGrid("resetSelection");
				}
			} else {
				ts.p.selrow = null;
				if(ts.p.multiselect){
					if(!ts.p.preserveSelection) {
						ts.p.selarrrow =[];
					}
				}
				ts.p.savedRow =[];
			}
			if(ts.p.scroll) {
				var sscroll = ts.grid.bDiv.scrollLeft;
				emptyRows.call(ts, true, false);
				ts.grid.hDiv.scrollLeft = sscroll;
			}
			if(ts.p.subGrid && ts.p.datatype === 'local') {
				$("td.sgexpanded","#"+$.jgrid.jqID(ts.p.id)).each(function(){
					$(this).trigger("click");
				});
			}
			ts.p._sort = true;
			populate();
			ts.p.lastsort = idxcol;
			if(ts.p.sortname !== index && idxcol) {ts.p.lastsort = idxcol;}
		},
		setColWidth = function () {
			var initwidth = 0, brd=$.jgrid.cell_width? 0: intNum(ts.p.cellLayout,0), vc=0, lvc, 
					scw=intNum(ts.p.scrollOffset,0),cw,hs=false,aw,gw=0,cr, chrome_fix, lvmc;
			$.each(ts.p.colModel, function() {
				if(this.hidden === undefined) {this.hidden=false;}
				if(ts.p.grouping && ts.p.autowidth) {
					var ind = $.inArray(this.name, ts.p.groupingView.groupField);
					if(ind >= 0 && ts.p.groupingView.groupColumnShow.length > ind) {
						this.hidden = !ts.p.groupingView.groupColumnShow[ind];
					}
				}
				this.widthOrg = intNum(this.width,0);
				// 
				if(this.maxWidth && intNum(this.width,0) > intNum(this.maxWidth,0) ) {
					this.width = this.maxWidth;
				}
				//
				cw = intNum(this.width,0);
				if(this.hidden===false){
					initwidth += cw+brd;
					if(this.fixed) {
						gw += cw+brd;
					} else {
						vc++;
					}
				}
			});
			if(isNaN(ts.p.width)) {
				ts.p.width  = initwidth + ((ts.p.shrinkToFit ===false && !isNaN(ts.p.height)) ? scw : 0);
			}
			grid.width = parseInt(ts.p.width,10);
			ts.p.tblwidth = initwidth;
			if(ts.p.shrinkToFit ===false && ts.p.forceFit === true) {ts.p.forceFit=false;}
			if(ts.p.shrinkToFit===true && vc > 0) {
				aw = grid.width-brd*vc-gw;
				if(!isNaN(ts.p.height)) {
					aw -= scw;
					hs = true;
				}
				initwidth =0;
				var maxwidthcount = 0, diffmaxwidth = 0, notmax = [], notmaxwidth=0;
				$.each(ts.p.colModel, function(i) {
					if(this.hidden === false && !this.fixed){
						cw = Math.round(aw*this.width/(ts.p.tblwidth-brd*vc-gw));
						if(this.maxWidth && cw > this.maxWidth) {
							maxwidthcount++;
							diffmaxwidth += cw;
							this.width = this.maxWidth;
							lvmc = i;
						} else {
						this.width =cw;
							notmaxwidth += cw;
							notmax.push(i+"");
						}
						initwidth += this.width	;
						lvc = i;
					}
				});
				cr = 0;
				chrome_fix = -1;/*bstw === 0 ? -1 :0;*/
				initwidth += diffmaxwidth;
				var jj = -1;
				// maxWidth columns available
				if(maxwidthcount > 0 && vc > 0) {
					// do recalc
					var testsum = 0;
					for(var nmi=0;nmi<notmax.length; nmi++) {
						jj  = parseInt(notmax[nmi],10);
						testsum += Math.round(ts.p.colModel[jj].width*diffmaxwidth/notmaxwidth);
						ts.p.colModel[jj].width = ts.p.colModel[jj].width + Math.round(ts.p.colModel[jj].width*diffmaxwidth/notmaxwidth);
					}
					// in case recalculated sum diffrent from the remeining sum
					if(testsum !== diffmaxwidth) {
						ts.p.colModel[jj].width += diffmaxwidth-testsum;
					}
				}
				if (hs) {
					if(grid.width-gw-(initwidth+brd*vc) !== scw){
						cr = grid.width-gw-(initwidth+brd*vc)-scw;
					}
				} else if(!hs && Math.abs(grid.width-gw-(initwidth+brd*vc)) !== 0) {
					cr = grid.width-gw-(initwidth+brd*vc) - bstw;
				}
				if(jj >-1 && lvc === lvmc) { // in case last visible = last maxWidth column
					lvc = jj; // change it
				}
				ts.p.colModel[lvc].width += cr + chrome_fix;
				//}
				ts.p.tblwidth = initwidth+cr+brd*vc+gw;
				if(ts.p.tblwidth > ts.p.width) {
					ts.p.colModel[lvc].width -= (ts.p.tblwidth - parseInt(ts.p.width,10));
					ts.p.tblwidth = ts.p.width;
				} else if(!hs && ts.p.tblwidth === ts.p.width) {
					ts.p.colModel[lvc].width -= bstw;
					ts.p.tblwidth -= bstw;
				}
			}
		},
		nextVisible= function(iCol) {
			var ret = iCol, j=iCol, i;
			for (i = iCol+1;i<ts.p.colModel.length;i++){
				if(ts.p.colModel[i].hidden !== true ) {
					j=i; break;
				}
			}
			return j-ret;
		},
		getOffset = function (iCol) {
			var $th = $(ts.grid.headers[iCol].el), ret = [$th.position().left + $th.outerWidth()];
			if(ts.p.direction==="rtl") { ret[0] = ts.p.width - ret[0]; }
			ret[0] -= ts.grid.bDiv.scrollLeft;
			ret.push($(ts.grid.hDiv).position().top);
			ret.push($(ts.grid.bDiv).offset().top - $(ts.grid.hDiv).offset().top + $(ts.grid.bDiv).height());
			return ret;
		},
		getColumnHeaderIndex = function (th) {
			var i, headers = ts.grid.headers, ci = $.jgrid.getCellIndex(th);
			for (i = 0; i < headers.length; i++) {
				if (th === headers[i].el) {
					ci = i;
					break;
				}
			}
			return ci;
		},
		buildColItems = function (top, left, parent, op) {
			var cm = ts.p.colModel, len = cm.length, i, cols=[], disp, all_visible = true, cols_nm=[],
			colNm = $.extend([], ts.p.colNames), iCol,
			common = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].common,
			texts = $.jgrid.getRegional(ts, "colmenu"), colArr =[],
			str1 = '<ul id="col_menu" class="ui-search-menu  ui-col-menu modal-content ' + common.shadow + '" role="menu" tabindex="0" style="left:'+left+'px;">';
			if( op.columns_selectAll ) {
				str1 += '<li class="ui-menu-item disabled" role="presentation" draggable="false"><a class="g-menu-item" tabindex="0" role="menuitem" ><table class="ui-common-table" ><tr><td class="menu_icon" title="'+texts.reorder+'"><span class="'+iconbase+' '+colmenustyle.icon_move+' notclick" style="visibility:hidden"></span></td><td class="menu_icon"><input id="chk_all" class="'+colmenustyle.input_checkbox+'" type="checkbox" name="check_all"></td><td class="menu_text">Check/Uncheck</td></tr></table></a></li>';
			}
			if(ts.p.colSpanHeader.length) { // fo future work Currently does not work
				for(var cj = 0;cj<ts.p.colSpanHeader.length;cj++) {
					var clitem = ts.p.colSpanHeader[cj];
					iCol = $.jgrid.getElemByAttrVal( cm, 'name', clitem.startColumnName, true);
					if(iCol >= 0) {
						colArr.push(iCol);
						colNm[iCol] = clitem.titleText;
					}
				}
			}
			if( $(ts).jqGrid('isGroupHeaderOn') /*&& opts.groupHeaders*/) {
				var gh_len = ts.p.groupHeader.length,
				// use the last set one
				groupH = ts.p.groupHeader[gh_len-1];

				for(var ij=0;ij<colNm.length; ij++){
					iCol = $.jgrid.inColumnHeader( cm[ij].name, groupH.groupHeaders);
					if(iCol>=0) {
						colNm[ij] = groupH.groupHeaders[iCol].titleText + "::" + colNm[ij];
						for(var jj= 1; jj<= groupH.groupHeaders[iCol].numberOfColumns-1; jj++) {
							colNm[ij+jj] = groupH.groupHeaders[iCol].titleText + "::" + colNm[ij+jj];
						}
						ij = ij+groupH.groupHeaders[iCol].numberOfColumns-1;
					}
				}
			}

			for(i=0;i<len;i++) {
				//if(!cm[i].hidedlg) { // column chooser
				var hid = !cm[i].hidden ? "checked" : "", 
					nm = cm[i].name, 
					lb = colNm[i]; //ts.p.colNames[i];
				disp = (nm === 'cb' || nm==='subgrid' || nm==='rn' || nm==='sc' ||  cm[i].hidedlg) ? "style='display:none'" :"";
				str1 += '<li '+disp+' class="ui-menu-item" role="presentation" draggable="true"><a class="g-menu-item" tabindex="0" role="menuitem" ><table class="ui-common-table" ><tr><td class="menu_icon" title="'+texts.reorder+'"><span class="'+iconbase+' '+colmenustyle.icon_move+' notclick"></span></td><td class="menu_icon"><input class="'+colmenustyle.input_checkbox+' chk_selected" type="checkbox" name="'+nm+'" '+hid+'></td><td class="menu_text">'+lb+'</td></tr></table></a></li>';
				cols.push(i);
				if( disp === "") {
					cols_nm.push(nm);
			}
				if(all_visible && hid==="") {
					all_visible = false;
				}
			}
			str1 += "</ul>";
			$(parent).append(str1);
			$("#col_menu").addClass("ui-menu " + colmenustyle.menu_widget);

			$("#chk_all", "#col_menu").prop("checked",all_visible);
			if(!$.jgrid.isElementInViewport($("#col_menu")[0])){
				$("#col_menu").css("left", - parseInt($("#column_menu").innerWidth(),10) +"px");
			}
			if($.fn.html5sortable()) {
				$("#col_menu").html5sortable({
					handle: 'span',
					items: ':not(.disabled)',
					forcePlaceholderSize: true }
				).on('sortupdate', function(e, ui) {
					cols.splice( ui.startindex,1);
					cols.splice(ui.endindex, 0, ui.startindex);
					$(ts).jqGrid("destroyFrozenColumns");
					$(ts).jqGrid("remapColumns", cols, true);
					$(ts).triggerHandler("jqGridColMenuColumnDone", [cols, null, null]);
					if($.jgrid.isFunction(ts.p.colMenuColumnDone)) {
						ts.p.colMenuColumnDone.call( ts, cols, null, null);
					}
					$(ts).jqGrid("setFrozenColumns");
					for(i=0;i<len;i++) {
						cols[i] = i;
					}
					if(1===2 /*colArr.length*/) { // setColSpanis on refresh. For future work
						$("#col_menu").remove();
						setTimeout(function(){
							buildColItems(top, left, parent, op);
						}, 0);
					}
				});
			} // NO jQuery UI
			$("#col_menu > li > a").on("click", function(e) {
				var checked, col_name;
				if($(e.target).hasClass('notclick')) {
					return;
				}
				if($(e.target).is(":input")) {
					checked = $(e.target).is(":checked");
				} else {
					checked = !$("input", this).is(":checked");
					$("input", this).prop("checked",checked);
				}

				col_name = $("input", this).attr('name');

				if(col_name === "check_all") {
					if(!checked) {
						$("input", "#col_menu" ).prop("checked",false);
						$(ts).jqGrid('hideCol', cols_nm);
					} else {
						$("input", "#col_menu" ).prop("checked",true);
						$(ts).jqGrid('showCol', cols_nm);
					}
				} else {
				$(ts).triggerHandler("jqGridColMenuColumnDone", [cols, col_name, checked]);
				if($.jgrid.isFunction(ts.p.colMenuColumnDone)) {
					ts.p.colMenuColumnDone.call( ts, cols, col_name, checked);
				}
				if(!checked) {
					$(ts).jqGrid('hideCol', col_name);
					$(this).parent().attr("draggable","false");
				} else {
					$(ts).jqGrid('showCol', col_name );
					$(this).parent().attr("draggable","true");
				}
					if(op.columns_selectAll) {
						$("#chk_all", "#col_menu").prop("checked",  $('.chk_selected:checked', "#col_menu").length === $('.chk_selected', "#col_menu").length );
					}
					$("#column_menu").remove();
				}
			}).hover(function(){
				$(this).addClass(hover);
			},function(){
				$(this).removeClass(hover);
			});
		},
		buildSearchBox = function (index, top, left, parent) {
			var cm = ts.p.colModel[index], rules, o1='',v1='',r1='',o2='',v2='', so, op, repstr='',selected, elem,
			numopts = ['eq','ne', 'lt', 'le', 'gt', 'ge', 'nu', 'nn', 'in', 'ni'],
			stropts = ['eq', 'ne', 'bw', 'bn', 'ew', 'en', 'cn', 'nc', 'nu', 'nn', 'in', 'ni'],
			strarr = ['text', 'string', 'blob'],
			texts = $.jgrid.getRegional(ts, "search"),
			common = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].common,
			classes = $.jgrid.styleUI[(p.styleUI || 'jQueryUI')].modal;

			if(!cm ) {
				return;
			}
			rules = ts.p.colFilters && ts.p.colFilters[cm.name] ?  ts.p.colFilters[cm.name] : false;
			if(rules && !$.isEmptyObject( rules )) {
				o1 = rules.oper1;
				v1 = rules.value1;
				r1 = rules.rule;
				o2 = rules.oper2;
				v2 = rules.value2;
			}
			if(! cm.searchoptions ) {
				cm.searchoptions = {};
			}
			if(cm.searchoptions.sopt) {
				so = cm.searchoptions.sopt;
			} else if( $.inArray(cm.sorttype, strarr) !== -1 ) {
				so = stropts;
			} else {
				so = numopts;
			}
			if(cm.searchoptions.groupOps) {
				op = cm.searchoptions.groupOps;
			} else  {
				op = texts.groupOps;
			}

			//elem = $('<ul id="search_menu" class="ui-search-menu modal-content" role="menu" tabindex="0" style="left:'+left+'px;top:'+top+'px;"></ul>');
			elem = $('<form></form>');
			var str1 = "<a id='bs_close' aria-label='Close'><span class='" + iconbase + " " + classes.icon_close + "'></span></a>";
			str1 += '<div>'+$.jgrid.getRegional(ts, "colmenu.searchTitle")+'</div>';
			str1 += '<div><select size="1" id="oper1" class="'+colmenustyle.filter_select+'">';
			$.each(texts.odata, function(i, n) {
				selected = n.oper === o1 ? 'selected="selected"' : '';
				if($.inArray(n.oper, so) !== -1) {
					repstr += '<option value="'+n.oper+'"  aria-label="'+n.text+'" '+selected+'>'+n.text+'</option>';
				}
			});
			str1 += repstr;
			str1 += '</select></div>';
			elem.append(str1);
			var df="";
			if(cm.searchoptions.defaultValue ) {
				df = $.jgrid.isFunction(cm.searchoptions.defaultValue) ? cm.searchoptions.defaultValue.call(ts) : cm.searchoptions.defaultValue;
			}
			//overwrite default value if restore from filters
			if( v1 ) {
				df = v1;
			}
			var soptions = $.extend(cm.searchoptions, {name:cm.index || cm.name, id: "sval1_" + ts.p.idPrefix+cm.name, oper:'search'}),
			input = $.jgrid.createEl.call(ts, cm.stype, soptions , df, false, $.extend({},$.jgrid.ajaxOptions, ts.p.ajaxSelectOptions || {}));
			$(input).addClass( colmenustyle.filter_input );
			str1 = $('<div></div>').append(input);
			elem.append(str1);
			// and/or
			str1 ='<div><select size="1" id="operand" class="'+colmenustyle.filter_select+'">';
			$.each(op, function(i, n){
				selected = n.op === r1 ? 'selected="selected"' : '';
				str1 += "<option value='"+n.op+"' "+selected+">"+n.text+"</option>";
			});
			str1 += '</select></div>';
			elem.append(str1);
			//oper2
			repstr ='';
			$.each(texts.odata, function(i, n) {
				selected = n.oper === o2 ? 'selected="selected"' : '';
				if($.inArray(n.oper, so) !== -1) {
					repstr += '<option value="'+n.oper+'" '+selected+'>'+n.text+'</option>';
				}
			});
			str1 = '<div><select size="1" id="oper2" class="'+colmenustyle.filter_select+'">' + repstr +'</select></div>';
			elem.append(str1);
			// value2
			if( v2 ) {
				df = v2;
			} else {
				df = "";
			}
			soptions = $.extend(cm.searchoptions, {name:cm.index || cm.name, id: "sval2_" + ts.p.idPrefix+cm.name, oper:'search'});
			input = $.jgrid.createEl.call(ts, cm.stype, soptions , df, false, $.extend({},$.jgrid.ajaxOptions, ts.p.ajaxSelectOptions || {}));
			$(input).addClass( colmenustyle.filter_input );
			str1 = $('<div></div>').append(input);
			elem.append(str1);
			// buttons
			str1 = "<div>";
			str1 +="<div class='search_buttons'><a tabindex='0' id='bs_reset' class='fm-button " + common.button +" ui-reset'>"+texts.Reset+"</a></div>";
			str1 +="<div class='search_buttons'><a tabindex='0' id='bs_search' class='fm-button " + common.button + " ui-search'>"+texts.Find+"</a></div>";
			str1 += "</div>";
			elem.append(str1);
			elem = $('<li class="ui-menu-item" role="presentation"></li>').append( elem );
			elem = $('<ul id="search_menu" class="ui-search-menu modal-content ' + common.shadow + '" role="menu" tabindex="0" style="left:'+left+'px;"></ul>').append(elem);
			$(parent).append(elem);
			$("#search_menu").addClass("ui-menu " + colmenustyle.menu_widget);

			if(!$.jgrid.isElementInViewport($("#search_menu")[0])){
				$("#search_menu").css("left", -parseInt($("#column_menu").innerWidth(),10) +"px");
			}

			$("#bs_reset, #bs_search", "#search_menu", "#bs_close").hover(function(){
				$(this).addClass(hover);
			},function(){
				$(this).removeClass(hover);
			});

			$("#bs_reset", elem).on('click', function(e){
				ts.p.colFilters[cm.name] = {};
				if(ts.p.mergeSearch === true && ts.p.searchModules.hasOwnProperty('colMenuSearch') && ts.p.searchModules.colMenuSearch !== false ) {
					ts.p.searchModules.colMenuSearch = buildFilters();
					$.extend(ts.p.postData,{filters: $.jgrid.splitSearch(ts.p.searchModules)});
					ts.p.search = true;
				} else {
					ts.p.postData.filters = buildFilters();
					ts.p.search = false;
					ts.p.resetsearch =  true;
				}
				df = "";
				if(cm.searchoptions.defaultValue ) {
					df = $.jgrid.isFunction(cm.searchoptions.defaultValue) ? cm.searchoptions.defaultValue.call(ts) : cm.searchoptions.defaultValue;
				}
				$("#sval1_" + ts.p.idPrefix+cm.name,"#search_menu").val(df);
				$("#sval2_" + ts.p.idPrefix+cm.name,"#search_menu").val("");
				if( $.jgrid.isFunction( ts.p.colMenuBeforeProcess )) {
					ts.p.colMenuBeforeProcess.call(ts, { module: 'filtering', action : 'reset', column : cm.name});
				}
				$(ts).trigger("reloadGrid");
				//$("#column_menu").remove();
			});
			$("#bs_search", elem).on('click', function(e){
				ts.p.colFilters[cm.name] = {
					oper1: $("#oper1","#search_menu").val(),
					value1: $("#sval1_" + ts.p.idPrefix+cm.name,"#search_menu").val(),
					rule: $("#operand","#search_menu").val(),
					oper2 : $("#oper2","#search_menu").val(),
					value2 : $("#sval2_" + ts.p.idPrefix+cm.name,"#search_menu").val()
				};
				if(ts.p.mergeSearch === true && ts.p.searchModules.hasOwnProperty('colMenuSearch') && ts.p.searchModules.colMenuSearch !== false ) {
					ts.p.searchModules.colMenuSearch = buildFilters();
					$.extend(ts.p.postData,{filters: $.jgrid.splitSearch(ts.p.searchModules)});
				} else {
					ts.p.postData.filters = buildFilters();
				}
				ts.p.search = true;
				if( $.jgrid.isFunction( ts.p.colMenuBeforeProcess )) {
					ts.p.colMenuBeforeProcess.call(ts, { module: 'filtering', action : 'search', column : cm.name});
				}
				$(ts).trigger("reloadGrid");
				$("#column_menu").remove();
			});
			$("#bs_close", elem).on('click', function(){
				$("#column_menu").remove();
			});
		},
		buildFilters = function() {
			var go = "AND",
			filters ="", i=0; //{\"groupOp\":\"" + go + "\",\"rules\":[], \"groups\" : [
			for (var item in ts.p.colFilters) {
				if(ts.p.colFilters.hasOwnProperty(item)) {
					var si = ts.p.colFilters[item];
					if(!$.isEmptyObject(si)) {
						if(si.value1==="" && si.value2==="") {
							break;
						}
						if(i>0) {
							filters += ",";
						}
						filters += "{\"groupOp\":\""+si.rule +"\",\"rules\":[";
						filters += "{\"field\":\"" + item + "\",";
						filters += "\"op\":\"" + si.oper1 + "\",";
						si.value1 +="";
						filters += "\"data\":\"" + si.value1.replace(/\\/g,'\\\\').replace(/\"/g,'\\"') + "\"}";
						if(si.value2) {
							filters += ",{\"field\":\"" + item + "\",";
							filters += "\"op\":\"" + si.oper2 + "\",";
							si.value2 +="";
							filters += "\"data\":\"" + si.value2.replace(/\\/g,'\\\\').replace(/\"/g,'\\"') + "\"}";
						}
						filters += "]";
						i++;
					} else {
						//console.log('empty object');
					}
				}
			}
			filters += "}";
			if( i === 0) {
				filters = "";
			}
			return filters;
		},
		buildGrouping = function( index, isgroup ) {
			var cm = ts.p.colModel[index],
				group = ts.p.groupingView;
			if(isgroup !== -1) {
				group.groupField.splice(isgroup,1);
			} else {
				group.groupField.push( cm.name);
			}
			if( $.jgrid.isFunction( ts.p.colMenuBeforeProcess )) {
				ts.p.colMenuBeforeProcess.call(ts, { module: 'grouping', action : (isgroup !== -1? 'ungroup' : 'group'), column : cm.name});
			}
			$(ts).jqGrid('groupingGroupBy', group.groupField );
		},
		buildFreeze = function( index, isfreeze ) {
			var cols = [], i, len = ts.p.colModel.length, lastfrozen = -1, cm = ts.p.colModel;
			for(i=0; i < len; i++) {
				if(cm[i].frozen) {
					lastfrozen = i;
				}
				cols.push(i);
			}
				// from position index to lastfrozen+1
			cols.splice( index, 1);
			cols.splice(lastfrozen + (isfreeze ? 1 : 0), 0, index);
			cm[index].frozen = isfreeze;
			if( $.jgrid.isFunction( ts.p.colMenuBeforeProcess )) {
				ts.p.colMenuBeforeProcess.call(ts, { module: 'freeze', action : isfreeze ? 'freeze' : 'unfreeze', column : cm[index].name});
			}
			$(ts).jqGrid("destroyFrozenColumns");
			$(ts).jqGrid("remapColumns", cols, true);
			$(ts).jqGrid("setFrozenColumns");
		},
		buildSubmenuItems = function (top, left, parent, id, cname) {
			var cm = ts.p.colModel, i,
			common = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].common,
			styles = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].colmenu,
			items = ts.p.colMenuCustom[id].items,
			str1 = '<ul id="col_menu" class="ui-search-menu  ui-col-menu modal-content ' + common.shadow + '" role="menu" tabindex="0" style="left:'+left+'px;">';
			items.forEach((item)=>{
				if(!item.icon) {
					item.icon = styles.icon_new_item;
				}
				if(item.id =="separator") {
					str1 += '<li class="ui-menu-item divider" role="separator"></li>';
				} else {
					str1 += '<li class="ui-menu-item" role="presentation"><a class="g-menu-item" tabindex="0" role="menuitem" data-value="' + item.id + '"><table class="ui-common-table"><tr><td class="menu_icon"><span class="'+iconbase+' '+item.icon+'"></span></td><td class="menu_text">'+item.title+'</td></tr></table></a></li>';
				}
			});
			str1 += "</ul>";
			$(parent).append(str1);	
			$("#col_menu").addClass("ui-menu " + colmenustyle.menu_widget);
			if(!$.jgrid.isElementInViewport($("#col_menu")[0])){
				$("#col_menu").css("left", - parseInt($("#column_menu").innerWidth(),10) +"px");
			}
			$("#col_menu > li > a").on("click", function(e) {
				var v = $(this).attr("data-value");
				//sobj = ts.grid.headers[index].el;
				var itm = items.find( (exec) => exec.id===v);
				if(itm) {
					if($.jgrid.isFunction(itm.funcname)) {
						itm.funcname.call(ts, cname);
						if(itm.closeOnRun) {
							$(this).remove();
						}
					}
				}
			}).hover(function(){
				$(this).addClass(hover);
			},function(){
				$(this).removeClass(hover);
			});
		},
		buildColMenu = function( index, left, top ){
			var menu_offset = $(grid.hDiv).height();
			if($(".ui-search-toolbar",grid.hDiv)[0] && !isNaN($(".ui-search-toolbar",grid.hDiv).height())) {
				menu_offset -= $(".ui-search-toolbar",grid.hDiv).height();
			}
			if( !$(grid.cDiv).is(":hidden") ){
				menu_offset += $(grid.cDiv).outerHeight();
			}
			if(ts.p.toolbar[1] && ts.p.toolbar[2] !== "bottom" && !$.jgrid.isNull( $(grid.uDiv), true) )  {
				menu_offset += $(grid.uDiv).outerHeight();
			}
			if( ts.p.toppager) {
				menu_offset += $("#"+ $.jgrid.jqID(ts.p.id) +"_toppager").outerHeight();
			}
			//$("#sopt_menu").remove();
			
			left = parseInt(left,10);
			top = menu_offset; /* + parseInt(top,10)*/
			var strb = '<ul id="column_menu" role="menu" tabindex="0">',
			str = '',
			stre = "</ul>",
			strl ='',
			cm = ts.p.colModel[index], op = $.extend({sorting:true, columns: true, filtering: true, seraching:true, grouping:true, freeze : true}, cm.coloptions),
			common = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].common,
			texts = $.jgrid.getRegional(ts, "colmenu"),
			label = ts.p.colNames[index],
			isgroup,
			isfreeze,
			menuData = [],
			cname = $.jgrid.trim(cm.name); // ???
			// sorting
			menuData.push( str );
			if(cm.sortable && op.sorting) {
				str = '<li class="ui-menu-item" role="presentation"><a class="g-menu-item" tabindex="0" role="menuitem" data-value="sortasc"><table class="ui-common-table"><tr><td class="menu_icon"><span class="'+iconbase+' '+colmenustyle.icon_sort_asc+'"></span></td><td class="menu_text">'+texts.sortasc+'</td></tr></table></a></li>';
				str += '<li class="ui-menu-item" role="presentation"><a class="g-menu-item" tabindex="0" role="menuitem" data-value="sortdesc"><table class="ui-common-table"><tr><td class="menu_icon"><span class="'+iconbase+' '+colmenustyle.icon_sort_desc+'"></span></td><td class="menu_text">'+texts.sortdesc+'</td></tr></table></a></li>';
				menuData.push( str );
			}
			if(op.columns) {
				str = '<li class="ui-menu-item divider" role="separator"></li>';
				str += '<li class="ui-menu-item" role="presentation"><a class="g-menu-item" tabindex="0" role="menuitem" data-value="columns"><table class="ui-common-table"><tr><td class="menu_icon"><span class="'+iconbase+' '+colmenustyle.icon_columns+'"></span></td><td class="menu_text">'+texts.columns+'</td></tr></table></a></li>';
				menuData.push( str );
			}
			if(op.filtering) {
				str = '<li class="ui-menu-item divider" role="separator"></li>';
				str += '<li class="ui-menu-item" role="presentation"><a class="g-menu-item" tabindex="0" role="menuitem" data-value="filtering"><table class="ui-common-table"><tr><td class="menu_icon"><span class="'+iconbase+' '+colmenustyle.icon_filter+'"></span></td><td class="menu_text">'+texts.filter + ' ' + label +'</td></tr></table></a></li>';
				menuData.push( str );
			}
			if(op.grouping) {
				isgroup = $.inArray(cm.name, ts.p.groupingView.groupField);
				str = '<li class="ui-menu-item divider" role="separator"></li>';
				str += '<li class="ui-menu-item" role="presentation"><a class="g-menu-item" tabindex="0" role="menuitem" data-value="grouping"><table class="ui-common-table"><tr><td class="menu_icon"><span class="'+iconbase+' '+colmenustyle.icon_group+'"></span></td><td class="menu_text">'+(isgroup !== -1 ?  texts.ungrouping: texts.grouping + ' ' + label)+'</td></tr></table></a></li>';
				menuData.push( str );
			}
			if(op.freeze) {
				if( !(ts.p.subGrid || ts.p.treeGrid || ts.p.cellEdit) ) {
					isfreeze = (cm.frozen && ts.p.frozenColumns) ? false : true;
					str = '<li class="ui-menu-item divider" role="separator"></li>';
					str += '<li class="ui-menu-item" role="presentation"><a class="g-menu-item" tabindex="0" role="menuitem" data-value="freeze"><table class="ui-common-table"><tr><td class="menu_icon"><span class="'+iconbase+' '+colmenustyle.icon_freeze+'"></span></td><td class="menu_text">'+(isfreeze ? (texts.freeze + " "+ label) : texts.unfreeze)+'</td></tr></table></a></li>';
					menuData.push( str );
				}
			}
			for( var key in ts.p.colMenuCustom) {
				if(ts.p.colMenuCustom.hasOwnProperty(key)) {
					var menuitem = ts.p.colMenuCustom[key];
					if( $.jgrid.isFunction( ts.p.colMenuBeforeProcess )) {
						ts.p.colMenuBeforeProcess.call(ts, { module: 'custom', action: menuitem , column : menuitem.colname});
					}
					$(ts).triggerHandler("jqGridcolMenuBeforeProcess", [{ module: 'custom', action: menuitem , column : menuitem.colname}]);
					var	exclude = menuitem.exclude.split(",");
					exclude = $.map(exclude, function(item){ return $.jgrid.trim(item);});
					if( menuitem.colname === cname  || (menuitem.colname === '_all_' && $.inArray(cname, exclude) === -1)) {
						var subid = menuitem.items.length ? "submenu": menuitem.id;
						strl = '<li class="ui-menu-item divider" role="separator"></li>';
						str = '<li class="ui-menu-item" role="presentation"><a id="'+menuitem.id+'" class="g-menu-item" tabindex="0" role="menuitem" data-value="' + subid + '"><table class="ui-common-table"><tr><td class="menu_icon"><span class="'+iconbase+' '+menuitem.icon+'"></span></td><td class="menu_text">'+menuitem.title+'</td></tr></table></a></li>';
						if(menuitem.position === 'last') {
							if(menuitem.separator) {
								menuData.push( strl );
							}
							menuData.push( str );
						} else if( menuitem.position === 'first') {
							if(menuitem.separator) {
								menuData.unshift( strl );
							}
							menuData.unshift( str );
						}
					}
				}
			}
			menuData.unshift( strb );
			menuData.push( stre );
			//str += "</ul>";
			$('#gbox_'+ts.p.id).append( menuData.join('') );
			$("#column_menu")
				.addClass("ui-search-menu modal-content column-menu jqgrid-column-menu ui-menu "+ common.shadow+ "  " + colmenustyle.menu_widget)
				.css({"left":left,"top":top});
			if(ts.p.direction === "ltr") {
				var wcm = $("#column_menu").width() + 26;
				$("#column_menu").css("left", (left- wcm)+'px');
			}
			$("#column_menu > li > a").hover(
				function(){
					$("#col_menu").remove();
					$("#search_menu").remove();
					var left1, top1;
					if($(this).attr("data-value") === 'columns') {
						left1 = $(this).parent().width()+8;
						top1 = $(this).parent().position().top - 5;
						buildColItems(top1, left1, $(this).parent(), op);
					}
					if($(this).attr("data-value") === 'filtering') {
						left1 = $(this).parent().width()+8;
						top1 = $(this).parent().position().top - 5;
						buildSearchBox(index, top1, left1, $(this).parent());
					}
					if($(this).attr("data-value") === 'submenu') {
						left1 = $(this).parent().width()+8;
						top1 = $(this).parent().position().top - 5;
						buildSubmenuItems(top1, left1, $(this).parent(), $(this).attr("id"), cname);
					}
					$(this).addClass(hover);
				},
				function(){ $(this).removeClass(hover); }
			).click(function(){
				var v = $(this).attr("data-value"),
				sobj = ts.grid.headers[index].el;
				if(v === 'sortasc' || v === 'sortdesc') {
					if( $.jgrid.isFunction( ts.p.colMenuBeforeProcess )) {
						ts.p.colMenuBeforeProcess.call(ts, { module: 'sorting', action: v === 'sortasc' ? 'asc' : 'desc' , column : cm.name});
					}
					sortData( "jqgh_"+ts.p.id+"_" + cm.name, index, true, (v === 'sortasc' ? 'asc' : 'desc'), sobj);
				} else if (v === 'grouping') {
					buildGrouping(index, isgroup);
				} else if( v==='freeze') {
					buildFreeze( index, isfreeze);
				}
				if(v === 'grouping' || v==='freeze') {
					$(this).remove();
				}
				if(ts.p.colMenuCustom.hasOwnProperty(v)) {
					var exec = ts.p.colMenuCustom[v];
					if($.jgrid.isFunction(exec.funcname)) {
						exec.funcname.call(ts, cname);
						if(exec.closeOnRun) {
							$(this).remove();
						}
					}
				}
			});
			if( parseFloat($("#column_menu").css("left")) < 0 ) {
				$("#column_menu").css("left", $(ts).css("left") );
			}
		},
		colTemplate;
		if(ts.p.colMenu || ts.p.menubar) {
			$("body").on('click', function(e){
				if(!$(e.target).closest("#column_menu").length) {
					try {
					$("#column_menu").remove();
					} catch (e1) {}
				}
				if(!$(e.target).closest(".ui-jqgrid-menubar").length) {
					try {
						$("#"+ts.p.id+"_menubar").hide();
					} catch (e1) {}
				}
			});
		}
		this.p.id = this.id;
		if(ts.p.autowidth===true) {
			var pw = $(eg).parent().width();
			tmpcm = $(window).width();
			ts.p.width = tmpcm - pw > 3 ?  pw: tmpcm-1;
		}		
		if ($.inArray(ts.p.multikey,sortkeys) === -1 ) {ts.p.multikey = false;}
		ts.p.keyName=false;
		for (i=0; i<ts.p.colModel.length;i++) {
			colTemplate = typeof ts.p.colModel[i].template === "string" ?
				( !$.jgrid.isNull($.jgrid.cmTemplate) && typeof $.jgrid.cmTemplate[ts.p.colModel[i].template] === "object" ? $.jgrid.cmTemplate[ts.p.colModel[i].template]: {}) :
				ts.p.colModel[i].template;
			ts.p.colModel[i] = $.extend(true, {}, ts.p.cmTemplate, colTemplate || {}, ts.p.colModel[i]);
			if (ts.p.keyName === false && ts.p.colModel[i].key===true) {
				ts.p.keyName = ts.p.colModel[i].name;
				ts.p.keyIndex = i;
			}
		}
		ts.p.sortorder = ts.p.sortorder.toLowerCase();
		$.jgrid.cell_width = $.jgrid.cellWidth();
		// calculate cellLayout
		var bstw2 = $("<table style='visibility:hidden'><tr class='jqgrow'><td>1</td></tr></table>").addClass(getstyle(stylemodule,"rowTable", true, 'ui-jqgrid-btable ui-common-table'));
		$(eg).append(bstw2);
		ts.p.cellLayout = $.jgrid.floatNum( $("td", bstw2).css('padding-left')) + $.jgrid.floatNum($("td", bstw2).css('padding-right'), 10) + 1;
		if(ts.p.cellLayout <=0 ) {
			ts.p.cellLayout = 5;
		}
		$(bstw2).remove();
		bstw2 = null;
		
		if(ts.p.grouping===true) {
			ts.p.scroll = false;
			ts.p.rownumbers = false;
			//ts.p.subGrid = false; expiremental
			ts.p.treeGrid = false;
			ts.p.gridview = true;
		}
		if(this.p.treeGrid === true) {
			try { $(this).jqGrid("setTreeGrid");} catch (_) {}
			if(ts.p.datatype !== "local") { 
				ts.p.localReader = { id: "_id_" };
			} else if(ts.p.keyName !== false) {
				ts.p.localReader = { id: ts.p.keyName };
			}
		}
		if(this.p.subGrid) {
			try { $(ts).jqGrid("setSubGrid");} catch (s){}
		}
		if(this.p.searchCols) {
			this.p.colNames.unshift(ts.p.searchColOptions.colName);
			this.p.colModel.unshift({name:'sc',width: ts.p.searchColOptions.colWidth,sortable:false,hidedlg:true,search:false,align:'left',fixed:true, frozen: true, colmenu: ts.p.searchColOptions.colmenu, classes : "jqgrid-searchcol", labelClasses: "jqgrid-searchcolumn",
					coloptions : {sorting:false, columns: false, filtering: false, seraching:false, grouping:false, freeze : false}});
		}
		if(this.p.multiselect) {
			var allRowsSelectTitle=$.jgrid.getRegional(ts, "defaults.selectAllLines");
			allRowsSelectTitle=allRowsSelectTitle ? allRowsSelectTitle : $.jgrid.regional['en'].defaults.selectAllLines;
			this.p.colNames.unshift("<input role='checkbox' id='cb_"+this.p.id+"' class='cbox' type='checkbox' title='"+allRowsSelectTitle+"'/>");
			this.p.colModel.unshift({name:'cb',width:$.jgrid.cell_width ? ts.p.multiselectWidth+ts.p.cellLayout : ts.p.multiselectWidth,sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true, frozen: true, classes : "jqgrid-multibox", labelClasses: "jqgrid-multibox" });
		}
		if(this.p.rownumbers) {
			this.p.colNames.unshift("");
			this.p.colModel.unshift({name:'rn',width:ts.p.rownumWidth,sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true, frozen : true, labelClasses: "jqgrid-rownumber"});
		}
		ts.p.xmlReader = $.extend(true,{
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
		}, ts.p.xmlReader);
		ts.p.jsonReader = $.extend(true,{
			root: "rows",
			page: "page",
			total: "total",
			records: "records",
			repeatitems: true,
			cell: "cell",
			id: "id",
			userdata: "userdata",
			subgrid: {root:"rows", repeatitems: true, cell:"cell"}
		},ts.p.jsonReader);
		ts.p.localReader = $.extend(true,{
			root: "rows",
			page: "page",
			total: "total",
			records: "records",
			repeatitems: false,
			cell: "cell",
			id: "id",
			userdata: "userdata",
			subgrid: {root:"rows", repeatitems: true, cell:"cell"}
		},ts.p.localReader);
		if(ts.p.scroll){
			ts.p.pgbuttons = false; ts.p.pginput=false; ts.p.rowList=[];
		}
		if(ts.p.data.length) {
			normalizeData();
			refreshIndex();
		}
		var thead = "<thead role='rowgroup'><tr class='ui-jqgrid-labels' role='row'>",
		tdc, idn, w, res, sort ="",
		td, ptr, tbody, imgs, iac="", idc="", tmpcm;
		if(ts.p.shrinkToFit===true && ts.p.forceFit===true) {
			for (i=ts.p.colModel.length-1;i>=0;i--){
				if(!ts.p.colModel[i].hidden) {
					ts.p.colModel[i].resizable=false;
					break;
				}
			}
		}
		if(ts.p.viewsortcols[1] === 'horizontal') {
			iac=" ui-i-asc";
			idc=" ui-i-desc";
		} else if(ts.p.viewsortcols[1] === "single") {
			iac = " ui-single-sort-asc";
			idc = " ui-single-sort-desc";
			sort = " style='display:none'";
			ts.p.viewsortcols[0] = false;
		}
		tdc = isMSIE ?  "class='ui-th-div-ie'" :"";
		imgs = "<span class='s-ico' style='display:none'>";
		imgs += "<span sort='asc'  class='ui-grid-ico-sort ui-icon-asc"+iac+" ui-sort-"+dir+" "+disabled+" " + iconbase + " " + getstyle(stylemodule, 'icon_asc', true)+ "'" + sort + " aria-label='empty'><span style='display:none'>empty</span></span>";
		imgs += "<span sort='desc' class='ui-grid-ico-sort ui-icon-desc"+idc+" ui-sort-"+dir+" "+disabled+" " + iconbase + " " + getstyle(stylemodule, 'icon_desc', true)+"'" + sort + " aria-label='empty'><span style='display:none'>empty</span></span></span>";
		if(ts.p.multiSort) {
			if(ts.p.sortname ) {
			sortarr = ts.p.sortname.split(",");
			for (i=0; i < sortarr.length; i++) {
				sotmp = $.jgrid.trim(sortarr[i]).split(" ");
				sortarr[i] = $.jgrid.trim(sotmp[0]);
				sortord[i] = sotmp[1] ? $.jgrid.trim(sotmp[1]) : ts.p.sortorder || "asc";
			}
			}
		}
		for(i=0;i<this.p.colNames.length;i++){
			var tooltip = ts.p.headertitles ? (" title=\"" + (ts.p.colModel[i].tooltip ? ts.p.colModel[i].tooltip : $.jgrid.stripHtml(ts.p.colNames[i])) + "\"") : "";
			tmpcm = ts.p.colModel[i];
			if(!tmpcm.hasOwnProperty('colmenu')) {
				tmpcm.colmenu = (tmpcm.name === "rn" || tmpcm.name === "cb" || tmpcm.name === "subgrid") ? false : true;
			}
			thead += "<th id='"+ts.p.id+"_" + tmpcm.name+"' role='columnheader'  scope='col' "+getstyle(stylemodule,'headerBox',false, "ui-th-column ui-th-" + dir + " " + ( tmpcm.labelClasses || "") ) +  tooltip+">";
			idn = tmpcm.index || tmpcm.name;
			thead += "<div class='ui-th-div' id='jqgh_"+ts.p.id+"_"+tmpcm.name+"' "+tdc+">"+ts.p.colNames[i];
			if(!tmpcm.width)  {
				tmpcm.width = ts.p.defaultColWidth;
			} else {
				tmpcm.width = parseInt(tmpcm.width,10);
			}
			if(typeof tmpcm.title !== "boolean") {
				tmpcm.title = true;
			}
			tmpcm.lso = "";
			if (idn === ts.p.sortname) {
				ts.p.lastsort = i;
			}
			if(ts.p.multiSort) {
				sotmp = $.inArray(idn,sortarr);
				if( sotmp !== -1 ) {
					tmpcm.lso = sortord[sotmp];
				}
			}
			thead += imgs;
			if(ts.p.colMenu && tmpcm.colmenu) {
				thead += "<a title='"+$.jgrid.getRegional(ts,"colmenu.hovermenu")+"' class='"+(ts.p.direction==='ltr' ? "colmenu" : "colmenu-rtl") +"'><span class='colmenuspan "+iconbase+' '+colmenustyle.icon_menu+"'></span></a>";
			}
			thead += "</div></th>";
		}
		thead += "</tr></thead>";
		imgs = null;
		tmpcm = null;
		$(this).append(thead);
		$("thead tr",this).first().find("th").hover(
			function(){ $(this).addClass(hover);},
			function(){	$(this).removeClass(hover);}
		);
		if(this.p.multiselect) {
			var emp=[], chk;
			$('#cb_'+$.jgrid.jqID(ts.p.id),this).on('click',function(){
				if(!ts.p.preserveSelection) {
					ts.p.selarrrow = [];
				}
				if (this.checked) {
					$(ts.rows).each(function(i) {
						if (i>0) {
							if(!$(this).hasClass("ui-subgrid") && !$(this).hasClass("jqgroup") && !$(this).hasClass(disabled) && !$(this).hasClass("jqfoot")){
								$("#jqg_"+$.jgrid.jqID(ts.p.id)+"_"+$.jgrid.jqID(this.id) )[ts.p.useProp ? 'prop': 'attr']("checked",true);
								$(this).addClass(highlight).attr("aria-selected","true");
								if(ts.p.preserveSelection) {
									if(ts.p.selarrrow.indexOf(this.id) === -1) {
										ts.p.selarrrow.push(this.id);
									}
								} else {
									ts.p.selarrrow.push(this.id);
								}
								ts.p.selrow = this.id;
							}
						}
					});
					chk=true;
					emp=[];
				}
				else {
					$(ts.rows).each(function(i) {
						if(i>0) {
							if(!$(this).hasClass("ui-subgrid") && !$(this).hasClass("jqgroup") && !$(this).hasClass(disabled) && !$(this).hasClass("jqfoot")){
								$("#jqg_"+$.jgrid.jqID(ts.p.id)+"_"+$.jgrid.jqID(this.id) )[ts.p.useProp ? 'prop': 'attr']("checked", false);
								$(this).removeClass(highlight).attr("aria-selected","false");
								emp.push(this.id);
								if(ts.p.preserveSelection) {
									var curind = ts.p.selarrrow.indexOf(this.id);
									if(curind > -1) {
										ts.p.selarrrow.splice(curind, 1);
									}
								}
							}
						}
					});
					ts.p.selrow = null;
					chk=false;
				}
				$(ts).triggerHandler("jqGridSelectAll", [chk ? ts.p.selarrrow : emp, chk]);
				if($.jgrid.isFunction(ts.p.onSelectAll)) {ts.p.onSelectAll.call(ts, chk ? ts.p.selarrrow : emp,chk);}
				if($.jgrid.isFunction(ts.p.onMultiSelect)) {ts.p.onMultiSelect.call(ts, ts.p.selarrrow);}
				//si
			});
		}

		var tfoot = "", trhead="", bstw = ts.p.styleUI.search('Bootstrap') !== -1  ? 2 : 0;
		setColWidth();
		bstw2 = ts.p.styleUI.search('Bootstrap') !== -1;
		$(eg).css("width",grid.width+"px").append("<div class='ui-jqgrid-resize-mark' id='rs_m"+ts.p.id+"'>&#160;</div>");
		if(ts.p.scrollPopUp) {
			$(eg).append("<div "+ getstyle(stylemodule, 'scrollBox', false, 'loading ui-scroll-popup')+" id='scroll_g"+ts.p.id+"'></div>")
			.mouseout(function(){
				$("#scroll_g"+p.id).hide();
			});
		}
		$(gv).css("width",grid.width+"px");
		thead = $(ts).find("thead").first().get(0);
		if(ts.p.footerrow) { 
			tfoot += "<table role='presentation' style='width:"+ts.p.tblwidth+"px' "+getstyle(stylemodule,'footerTable', false, 'ui-jqgrid-ftable ui-common-table')+ "><tbody><tr role='row' "+getstyle(stylemodule,'footerBox', false, 'footrow footrow-'+dir)+">"; 
		}
		if(ts.p.headerrow) { 
			trhead += "<table role='presentation' style='width:"+ts.p.tblwidth+"px' "+getstyle(stylemodule,'headerRowTable', false, 'ui-jqgrid-hrtable ui-common-table')+ "><tbody><tr role='row' "+getstyle(stylemodule,'headerRowBox', false, 'hrheadrow hrheadrow-'+dir)+">"; 
		}
		var thr = $(thead).find("tr").first(),
		firstr = "<tr class='jqgfirstrow "+ (ts.p.direction === "rtl"? "ui-row-rtl'" :"'") +" role='row'>",
		clicks =0,
		// header font for full autosize
		hdr_font = $.jgrid.getFont( $("th",thr).first()[0] );
		ts.p.disableClick=false;
		$("th",thr).each(function ( j ) {
			tmpcm = ts.p.colModel[j];
			w = tmpcm.width;
			if(tmpcm.resizable === undefined) {
				tmpcm.resizable = true;
			}
			if(tmpcm.resizable){
				res = document.createElement("span");
				$(res).html("&#160;").addClass('ui-jqgrid-resize ui-jqgrid-resize-'+dir)
				.css("cursor","col-resize");
				$(this).addClass(ts.p.resizeclass);
			} else {
				res = "";
			}
			$(this).css("width",w+"px").prepend(res);
			res = null;
			var hdcol = "", clcol ="";
			if( tmpcm.hidden ) {
				$(this).css("display","none");
				hdcol = "display:none;";
			}
			if(tmpcm.labelClasses) {
				clcol = "class='"+tmpcm.labelClasses+"'";
			}
			firstr += "<td "+clcol+" role='gridcell' style='height:0px;width:"+w+"px;"+hdcol+"'></td>";
			grid.headers[j] = { width: w, el: this };
			sort = tmpcm.sortable;
			if( typeof sort !== 'boolean') {
				tmpcm.sortable =  true;
				sort=true;
			}
			var nm = tmpcm.name;
			if( !(nm === 'cb' || nm==='subgrid' || nm==='rn' || nm==='sc') ) {
				if(ts.p.viewsortcols[2]){
					$(">div",this).addClass('ui-jqgrid-sortable');
				}
			}
			tmpcm.canvas_width = tmpcm.autosize_headers ? ($.jgrid.getTextWidth( $("div", this)[0].outerText, hdr_font) +
					(tmpcm.colmenu ? $.jgrid.floatNum( $(".colmenuspan", this).parent().width()) : 0) +
					$.jgrid.floatNum( $("div", this).css("padding-left")) + $.jgrid.floatNum( $("div", this).css("padding-right")) +
					$.jgrid.floatNum($(".ui-jqgrid-resize", this).width())) : 0;
			if(sort) {
				if(ts.p.multiSort) {
					if(ts.p.viewsortcols[0]) {
						$("div span.s-ico",this).show();
						if( tmpcm.lso ){
							$("div span.ui-icon-"+tmpcm.lso,this).removeClass(disabled).css("display","");
						}
					} else if( tmpcm.lso) {
						$("div span.s-ico",this).show();
						$("div span.ui-icon-"+tmpcm.lso,this).removeClass(disabled).css("display","");
					}
				} else {
					if(ts.p.viewsortcols[0]) {
						$("div span.s-ico",this).show();
						if(j===ts.p.lastsort){
							$("div span.ui-icon-"+ts.p.sortorder,this).removeClass(disabled).css("display","");
						}
					} else if(j === ts.p.lastsort && ts.p.sortname !== "") {
						$("div span.s-ico",this).show();
						$("div span.ui-icon-"+ts.p.sortorder,this).removeClass(disabled).css("display","");
					}
				}
			}
			if(ts.p.footerrow) {
				tfoot += "<td role='gridcell' "+formatCol(j,0,'', null, '', false)+">&#160;</td>";
			}
			if(ts.p.headerrow) {
				trhead += "<td role='gridcell' "+formatCol(j,0,'', null, '', false)+">&#160;</td>";
			}
		}).mousedown(function(e) {
			if ($(e.target).closest("th>span.ui-jqgrid-resize").length !== 1) { return; }
			var ci = getColumnHeaderIndex(this), cmax;
			e.preventDefault();
			clicks++;

			setTimeout(function() {
				clicks = 0;
			}, 400);

			if (clicks === 2) {
				// double click event handler
				try {
					if(ts.p.colModel[ci].autosize === true) {
						cmax = $(ts).jqGrid('getCol', ci, false, 'maxwidth');
						$(ts).jqGrid('resizeColumn', ci, cmax + ( bstw2 ? ts.p.cellLayout : 0 ) )
						.jqGrid('refreshGroupHeaders');
					}
				} catch(e1) {
				} finally {
					clicks = 0;
				}
				return;
			} else {
				if(ts.p.forceFit===true) {
					ts.p.nv= nextVisible(ci);
				}
				grid.dragStart(ci, e, getOffset(ci));
			}
			return false;
		}).click(function(e) {
			if (ts.p.disableClick) {
				ts.p.disableClick = false;
				return false;
			}
			var s = "th>div.ui-th-div",r,d,sh;
			if (!ts.p.viewsortcols[2]) { s = "th>div>span>span.ui-grid-ico-sort"; }
			var t = $(e.target).closest(s);
			if (t.length !== 1) { return; }
			var ci = getColumnHeaderIndex(this);
			if($(e.target).hasClass('colmenuspan')) {
				if( !$.jgrid.isNull($("#column_menu")[0]) ) {
					$("#column_menu").remove();
				}

				if(ci === undefined) { return; }
				var grid_offset = $("#gbox_"+ts.p.id).offset();
				var offset = $(this).offset(),
				left = ( offset.left ) - (grid_offset.left),
				top = 0;//( offset.top);
				if(ts.p.direction === "ltr") {
					left += $(this).outerWidth();
				}
				buildColMenu(ci, left, top);
				if(ts.p.menubar === true) {
					$("#"+ts.p.id+"_menubar").hide();
				}
				e.stopPropagation();
				return;
			}
			//
			if (!ts.p.viewsortcols[2]) { r=true;d=t.attr("sort"); }
			sh = $.jgrid.type(ts.p.colModel[ci].sortInHeader) !== 'boolean'? true : ts.p.colModel[ci].sortInHeader
			if( !$.jgrid.isNull(ci) && sh){
				sortData( $('div',this)[0].id, ci, r, d, this);
			}
			// added aria grid
			if(ts.p.selHeadInd !== undefined) {
				$(grid.headers[ts.p.selHeadInd].el).attr("tabindex", "-1");
			}
			ts.p.selHeadInd = ci;
			$(this).attr("tabindex", "0");
			// end aria
			//return false;
		});
		tmpcm = null;
		// reset font cache
		jQuery._cacheCanvas = null;
		if (ts.p.sortable && $.fn.sortable) {
			try {
				$(ts).jqGrid("sortableColumns", thr);
			} catch (e){}
		}
		if(ts.p.footerrow) { tfoot += "</tr></tbody></table>"; }
		if(ts.p.headerrow) { trhead += "</tr></tbody></table>"; }
		 
		firstr += "</tr>";
		tbody = document.createElement("tbody");
		//$(this).append(firstr);
		$(tbody).attr({"role":"rowgroup"});
		this.appendChild(tbody);
		$(this).addClass(getstyle(stylemodule,"rowTable", true, 'ui-jqgrid-btable ui-common-table')).append(firstr);
		if(ts.p.altRows) {
			$(this).addClass(getstyle(stylemodule,"stripedTable", true, ''));
		}
		//$(firstr).insertAfter(this);
		firstr = null;
		var hTable = $("<table "+getstyle(stylemodule,'headerTable',false,'ui-jqgrid-htable ui-common-table')+" style='width:"+ts.p.tblwidth+"px' role='grid' aria-labelledby='gbox_"+this.id+"'></table>").append(thead),
		hg = (ts.p.caption && ts.p.hiddengrid===true) ? true : false,
		hb = $("<div class='ui-jqgrid-hbox" + (dir==="rtl" ? "-rtl" : "" )+"'></div>");
		thead = null;
		grid.hDiv = document.createElement("div");
		grid.hDiv.style.width = (grid.width - bstw) + "px";
		grid.hDiv.className = getstyle(stylemodule,'headerDiv', true,'ui-jqgrid-hdiv');

		$(grid.hDiv).append(hb);
		$(hb).append(hTable);
		hTable = null;
		if(hg) { $(grid.hDiv).hide(); }
		if(ts.p.pager){
			// TBD -- escape ts.p.pager here?
			if(typeof ts.p.pager === "string") {if(ts.p.pager.slice(0,1) === "#") { ts.p.pager = ts.p.pager.substring(1);} }
			else { ts.p.pager = $(ts.p.pager).attr("id");}
			$("#"+$.jgrid.jqID(ts.p.pager)).css({width: (grid.width - bstw) +"px"}).addClass(getstyle(stylemodule,'pagerBox', true,'ui-jqgrid-pager')).appendTo(eg);
			if(hg) {
				$("#"+$.jgrid.jqID(ts.p.pager)).hide();
			}
			setPager(ts.p.pager,'');
			ts.p.pager = "#" + $.jgrid.jqID(ts.p.pager);
		}
		if( ts.p.cellEdit === false && ts.p.hoverrows === true) {
			$(ts).on({
				mouseover: function(e) {
					ptr = $(e.target).closest("tr.jqgrow");
					if($(ptr).attr("class") !== "ui-subgrid") {
						$(ptr).addClass(hover);
					}
				},
				mouseout: function(e) {
					ptr = $(e.target).closest("tr.jqgrow");
					$(ptr).removeClass(hover);
				}
			});
		}
		var ri,ci, tdHtml;
		function selectMultiRow(ri, scb, e, selection) {
			if((ts.p.multiselect && ts.p.multiboxonly) || ts.p.multimail ) {
				if(scb){
					$(ts).jqGrid("setSelection", ri, selection, e);
				} else if(  ts.p.multiboxonly && ts.p.multimail) {
					// execute onSelectRow
					$(ts).triggerHandler("jqGridSelectRow", [ri, false, e]);
					if( ts.p.onSelectRow) { ts.p.onSelectRow.call(ts, ri, false, e); }
				} else {
					$(ts.p.selarrrow).each(function(i,n){
						var trid = $(ts).jqGrid('getGridRowById',n);
						if(trid) {
							$( trid ).removeClass(highlight);
						}
						$("#jqg_"+$.jgrid.jqID(ts.p.id)+"_"+$.jgrid.jqID(n))[ts.p.useProp ? 'prop': 'attr']("checked", false);
					});
					ts.p.selarrrow = [];
					$(ts).jqGrid("setSelection", ri, selection, e);
				}
			} else {
				$(ts).jqGrid("setSelection", ri, selection, e);
			}
		}
		$(ts).before(grid.hDiv).on({
			'click': function(e) {
				td = e.target;
				ptr = $(td,ts.rows).closest("tr.jqgrow");
				if($(ptr).length === 0 || ptr[0].className.indexOf( disabled ) > -1 || ($(td,ts).closest("table.ui-jqgrid-btable").attr('id') || '').replace("_frozen","") !== ts.id ) {
					return this;
				}
				var scb = $(td).filter(":enabled").hasClass("cbox"),
				cSel = $(ts).triggerHandler("jqGridBeforeSelectRow", [ptr[0].id, e]);
				cSel = (cSel === false || cSel === 'stop') ? false : true;
				if ($.jgrid.isFunction(ts.p.beforeSelectRow)) {
					var allowRowSelect = ts.p.beforeSelectRow.call(ts, ptr[0].id, e);
					if (allowRowSelect === false || allowRowSelect === 'stop') {
						cSel = false;
					}
				}
				if(scb && cSel === false){
					$(e.target).prop('checked',!$(e.target).prop('checked'));
				}
				if (td.tagName === 'A' || ((td.tagName === 'INPUT' || td.tagName === 'TEXTAREA' || td.tagName === 'OPTION' || td.tagName === 'SELECT' ) && 
						!scb && 
						!(td.tagName === 'INPUT' && td.id.startsWith("jqs_"+ts.p.id))) )  { 
					return; 
				}
				ri = ptr[0].id;
				td = $(td).closest("tr.jqgrow>td");
				if (td.length > 0) {
					ci = $.jgrid.getCellIndex(td);
				}
				if(ts.p.cellEdit === true && !ts.p.ariaBody) {
					if(ts.p.multiselect && scb && cSel){
						$(ts).jqGrid("setSelection", ri ,true,e);
					} else if (td.length > 0) {
						try {
							$(ts).jqGrid("editCell", ptr[0].rowIndex, ci, true, e);
						} catch (_) {}
					}
					return;
				}
				if (td.length > 0) {
					tdHtml = $(td).closest("td,th").html();
					$(ts).triggerHandler("jqGridCellSelect", [ri,ci,tdHtml,e]);
					if($.jgrid.isFunction(ts.p.onCellSelect)) {
						ts.p.onCellSelect.call(ts,ri,ci,tdHtml,e);
					}
				}
				if (!cSel) {
					return;
				}
				if( ts.p.multimail && ts.p.multiselect) {
					if (e.shiftKey) {
						if (scb) {
							var initialRowSelect = $(ts).jqGrid('getGridParam', 'selrow'),

							CurrentSelectIndex = $(ts).jqGrid('getInd', ri),
							InitialSelectIndex = $(ts).jqGrid('getInd', initialRowSelect),
							startID = "",
							endID = "";
							if (CurrentSelectIndex > InitialSelectIndex) {
								startID = initialRowSelect;
								endID = ri;
							} else {
								startID = ri;
								endID = initialRowSelect;
							}
							var shouldSelectRow = false,
							shouldResetRow = false,
							perform_select = true;

							if( $.inArray( ri, ts.p.selarrrow) > -1) {
								perform_select = false;
							}

							$.each($(this).getDataIDs(), function(_, id){
								if ((shouldResetRow = id === startID || shouldResetRow)){
									$(ts).jqGrid('resetSelection', id);
								}
								return id !== endID;
							});
							if(perform_select) {
								$.each($(this).getDataIDs(), function(_, id){
									if ((shouldSelectRow = id === startID || shouldSelectRow)){
										$(ts).jqGrid('setSelection', id, false);
									}
									return id !== endID;
								});
							}

							ts.p.selrow = (CurrentSelectIndex > InitialSelectIndex) ? endID : startID;
							return;
						}
						window.getSelection().removeAllRanges();
					}
					selectMultiRow( ri, scb, e, false );
				} else if ( !ts.p.multikey ) {
					selectMultiRow( ri, scb, e, true );
				} else {
					if(e[ts.p.multikey]) {
						$(ts).jqGrid("setSelection", ri, true, e);
					} else if(ts.p.multiselect && scb) {
						scb = $("#jqg_"+$.jgrid.jqID(ts.p.id)+"_"+ri).is(":checked");
						$("#jqg_"+$.jgrid.jqID(ts.p.id)+"_"+ri)[ts.p.useProp ? 'prop' : 'attr']("checked", !scb);
					}
				}
			},
			'reloadGrid': function(e,opts) {
				if(ts.p.treeGrid ===true) {
					ts.p.datatype = ts.p.treedatatype;
				}
				opts = opts || {};
				if (opts.current) {
					ts.grid.selectionPreserver(ts);
				}
				if(ts.p.datatype==="local"){
					$(ts).jqGrid("resetSelection");
					if(ts.p.data.length) {
						normalizeData();
						refreshIndex();
					}
				} else if(!ts.p.treeGrid) {
					ts.p.selrow=null;
					if(ts.p.multiselect) {
						if(!ts.p.preserveSelection) {
							ts.p.selarrrow =[];
							setHeadCheckBox(false);
						}
					}
					ts.p.savedRow = [];
				}
				if(ts.p.scroll) {
					emptyRows.call(ts, true, false);
				}
				if (opts.page) {
					var page = opts.page;
					if (page > ts.p.lastpage) { page = ts.p.lastpage; }
					if (page < 1) { page = 1; }
					ts.p.page = page;
					if (ts.grid.prevRowHeight) {
						ts.grid.bDiv.scrollTop = (page - 1) * ts.grid.prevRowHeight * ts.p.rowNum;
					} else {
						ts.grid.bDiv.scrollTop = 0;
					}
				}
				if (ts.grid.prevRowHeight && ts.p.scroll && opts.page === undefined) {
					delete ts.p.lastpage;
					ts.grid.populateVisible();
				} else {
					ts.grid.populate();
				}
				if(ts.p.inlineNav===true) {$(ts).jqGrid('showAddEditButtons');}
				if(ts.p.searchCols) {
					if(!$.isEmptyObject(ts.p._results) ) {
						ts.p._results ={};
						$.jgrid.searchColOnEnter( ts.p.id, null );
					}
				}
				return false;
			},
			'dblclick' : function(e) {
				td = e.target;
				ptr = $(td,ts.rows).closest("tr.jqgrow");
				if($(ptr).length === 0 ){return;}
				ri = ptr[0].rowIndex;
				ci = $.jgrid.getCellIndex(td);
				var dbcr = $(ts).triggerHandler("jqGridDblClickRow", [$(ptr).attr("id"),ri,ci,e]);
				if( !$.jgrid.isNull(dbcr) ) { return dbcr; }
				if ($.jgrid.isFunction(ts.p.ondblClickRow)) {
					dbcr = ts.p.ondblClickRow.call(ts,$(ptr).attr("id"),ri,ci, e);
					if( !$.jgrid.isNull(dbcr) ) { return dbcr; }
				}
			},
			'contextmenu' : function(e) {
				td = e.target;
				ptr = $(td,ts.rows).closest("tr.jqgrow");
				if($(ptr).length === 0 ){return;}
				if(!ts.p.multiselect && !ts.p.isClipboard) { $(ts).jqGrid("setSelection",ptr[0].id,true,e);	}
				ri = ptr[0].rowIndex;
				ci = $.jgrid.getCellIndex(td);
				var rcr = $(ts).triggerHandler("jqGridRightClickRow", [$(ptr).attr("id"),ri,ci,e]);
				if( !$.jgrid.isNull(rcr) ) { return rcr; }
				if ($.jgrid.isFunction(ts.p.onRightClickRow)) {
					rcr = ts.p.onRightClickRow.call(ts,$(ptr).attr("id"),ri,ci, e);
					if( !$.jgrid.isNull(rcr) ) { return rcr; }
				}
			}
		});
		//---
		grid.bDiv = document.createElement("div");
		if(isMSIE) { if(String(ts.p.height).toLowerCase() === "auto") { ts.p.height = "100%"; } }
		$(grid.bDiv)
			.append($('<div style="position:relative;"></div>').append('<div></div>').append(this))
			.addClass("ui-jqgrid-bdiv")
			.css({ height: ts.p.height+(isNaN(ts.p.height)?"":"px"), width: (grid.width - bstw)+"px"})
			.on("scroll", grid.scrollGrid);
		$(grid.bDiv).find("table").first().css({width:ts.p.tblwidth+"px"});
		if( !$.support.tbody ) { //IE
			if( $("tbody",this).length === 2 ) { $("tbody",this).slice( 1 ).remove();}
		}
		if(ts.p.multikey){
			if( $.jgrid.msie()) {
				$(grid.bDiv).on("selectstart",function(){return false;});
			} else {
				$(grid.bDiv).on("mousedown",function(){return false;});
			}
		}
		if(hg) { // hidden grid
			$(grid.bDiv).hide();
		}
		var icoo =  iconbase + " " + getstyle(stylemodule,'icon_caption_open', true),
		icoc =  iconbase + " " + getstyle(stylemodule,'icon_caption_close', true);
		grid.cDiv = document.createElement("div");
		var arf = ts.p.hidegrid===true ? $("<a role='link' class='ui-jqgrid-titlebar-close HeaderButton "+cornerall+"' title='"+($.jgrid.getRegional(ts, "defaults.showhide", ts.p.showhide) || "")+"'" + " />").hover(
			function(){ arf.addClass(hover);},
			function() {arf.removeClass(hover);})
		.append("<span class='ui-jqgrid-headlink " + icoo +"'></span>").css((dir==="rtl"?"left":"right"),"0px") : "";
		$(grid.cDiv).append(arf).append("<span class='ui-jqgrid-title'>"+ts.p.caption+"</span>")
		.addClass("ui-jqgrid-titlebar ui-jqgrid-caption"+(dir==="rtl" ? "-rtl" :"" )+" "+getstyle(stylemodule,'gridtitleBox',true));
///// toolbar menu
		if( ts.p.menubar === true) {
			//var fs =  $('.ui-jqgrid-view').css('font-size') || '11px';
			var arf1 = '<ul id="'+ts.p.id+'_menubar" class="ui-search-menu modal-content column-menu ui-menu jqgrid-caption-menu ' + colmenustyle.menu_widget+'" role="menubar" tabindex="0"></ul>';
			$("#gbox_"+ts.p.id).append(arf1);
			$(grid.cDiv).append("<a role='link' class='ui-jqgrid-menubar menubar-"+(dir==="rtl" ? "rtl" :"ltr" )+"' style=''><span class='colmenuspan "+iconbase+' '+colmenustyle.icon_toolbar_menu+"'></span></a>");
			$(".ui-jqgrid-menubar",grid.cDiv).hover(
					function(){ $(this).addClass(hover);},
					function() {$(this).removeClass(hover);
			}).on('click',function(e) {
				var pos = $(e.target).position();
				$("#"+ts.p.id+"_menubar").show();
				if(ts.p.direction==="rtl") {
					$("#"+ts.p.id+"_menubar").css({left : pos.left - $("#"+ts.p.id+"_menubar").width() - 20 });
				}
			});
		}
///// end toolbar menu
		$(grid.cDiv).insertBefore(grid.hDiv);
		if( ts.p.toolbar[0] ) {
			var tbstyle = getstyle(stylemodule, 'customtoolbarBox', true, 'ui-userdata');
			grid.uDiv = document.createElement("div");
			if(ts.p.toolbar[1] === "top") {$(grid.uDiv).insertBefore(grid.hDiv);}
			else if (ts.p.toolbar[1]==="bottom" ) {$(grid.uDiv).insertAfter(grid.hDiv);}
			if(ts.p.toolbar[1]==="both") {
				grid.ubDiv = document.createElement("div");
				$(grid.uDiv).addClass( tbstyle + " ui-userdata-top").attr("id","t_"+this.id).insertBefore(grid.hDiv).width(grid.width - bstw);
				$(grid.ubDiv).addClass( tbstyle + " ui-userdata-bottom").attr("id","tb_"+this.id).insertAfter(grid.hDiv).width(grid.width - bstw);
				if(hg)  {$(grid.ubDiv).hide();}
			} else {
				$(grid.uDiv).width(grid.width - bstw).addClass( tbstyle + " ui-userdata-top").attr("id","t_"+this.id);
			}
			if(hg) {$(grid.uDiv).hide();}
		}
		if(ts.p.toppager) {
			ts.p.toppager = $.jgrid.jqID(ts.p.id)+"_toppager";
			grid.topDiv = $("<div id='"+ts.p.toppager+"'></div>")[0];
			$(grid.topDiv).addClass(getstyle(stylemodule, 'toppagerBox', true, 'ui-jqgrid-toppager')).width(grid.width - bstw).insertBefore(grid.hDiv);
			setPager(ts.p.toppager,'_t');
			ts.p.toppager = "#"+ts.p.toppager;
		}
		if(ts.p.footerrow) {
			grid.sDiv = $("<div class='ui-jqgrid-sdiv'></div>")[0];
			hb = $("<div class='ui-jqgrid-hbox"+(dir==="rtl"?"-rtl":"")+"'></div>");
			$(grid.sDiv).append(hb).width(grid.width - bstw).insertAfter(grid.hDiv);
			$(hb).append(tfoot);
			grid.footers = $(".ui-jqgrid-ftable",grid.sDiv)[0].rows[0].cells;
			if(ts.p.rownumbers) { grid.footers[0].className = getstyle(stylemodule, 'rownumBox', true, 'jqgrid-rownum'); }
			if(hg) {$(grid.sDiv).hide();}
		}
		if(ts.p.headerrow) {
			grid.hrDiv = $("<div class='ui-jqgrid-hrdiv'></div>")[0];
			hb = $("<div class='ui-jqgrid-hbox"+(dir==="rtl"?"-rtl":"")+"'></div>");
			$(grid.hrDiv).append(hb).width(grid.width - bstw).insertAfter(grid.hDiv);
			$(hb).append(trhead);
			grid.hrheaders = $(".ui-jqgrid-hrtable",grid.hrDiv)[0].rows[0].cells;
			if(ts.p.rownumbers) { 
				grid.hrheaders[0].className = getstyle(stylemodule, 'rownumBox', true, 'jqgrid-rownum'); 
			}
			if(hg) {
				$(grid.nDiv).hide();
			}
		}
		hb = null;
		if(ts.p.caption) {
			var tdt = ts.p.datatype;
			if(ts.p.hidegrid===true) {
				$(".ui-jqgrid-titlebar-close",grid.cDiv).click( function(e){
					var onHdCl = $.jgrid.isFunction(ts.p.onHeaderClick),
					elems = ".ui-jqgrid-bdiv, .ui-jqgrid-hdiv, .ui-jqgrid-toppager, .ui-jqgrid-pager, .ui-jqgrid-sdiv, .ui-jqgrid-hrdiv",
					counter, self = this;
					if(ts.p.toolbar[0]===true) {
						if( ts.p.toolbar[1]==='both') {
							elems += ', #' + $(grid.ubDiv).attr('id');
						}
						elems += ', #' + $(grid.uDiv).attr('id');
					}
					counter = $(elems,"#gview_"+$.jgrid.jqID(ts.p.id)).length;

					if(ts.p.gridstate === 'visible') {
						$(elems,"#gbox_"+$.jgrid.jqID(ts.p.id)).slideUp("fast", function() {
							counter--;
							if (counter === 0) {
								$("span",self).removeClass(icoo).addClass(icoc);
								ts.p.gridstate = 'hidden';
								if($("#gbox_"+$.jgrid.jqID(ts.p.id)).hasClass("ui-resizable")) { $(".ui-resizable-handle","#gbox_"+$.jgrid.jqID(ts.p.id)).hide(); }
								$(ts).triggerHandler("jqGridHeaderClick", [ts.p.gridstate,e]);
								if(onHdCl) {if(!hg) {ts.p.onHeaderClick.call(ts,ts.p.gridstate,e);}}
							}
						});
					} else if(ts.p.gridstate === 'hidden'){
						$(elems,"#gbox_"+$.jgrid.jqID(ts.p.id)).slideDown("fast", function() {
							counter--;
							if (counter === 0) {
								$("span",self).removeClass(icoc).addClass(icoo);
								if(hg) {ts.p.datatype = tdt;populate();hg=false;}
								ts.p.gridstate = 'visible';
								if($("#gbox_"+$.jgrid.jqID(ts.p.id)).hasClass("ui-resizable")) { $(".ui-resizable-handle","#gbox_"+$.jgrid.jqID(ts.p.id)).show(); }
								$(ts).triggerHandler("jqGridHeaderClick", [ts.p.gridstate,e]);
								if(onHdCl) {if(!hg) {ts.p.onHeaderClick.call(ts,ts.p.gridstate,e);}}
							}
						});
					}
					return false;
				});
				if(hg) {ts.p.datatype="local"; $(".ui-jqgrid-titlebar-close",grid.cDiv).trigger("click");}
			}
		} else {
			$(grid.cDiv).hide();
			if(!ts.p.toppager) {
				$(grid.hDiv).addClass(getstyle(ts.p.styleUI+'.common', 'cornertop', true));
			}
		}
		if(ts.p.headerrow) {
			$(grid.hrDiv).after(grid.bDiv);
		} else {
			$(grid.hDiv).after(grid.bDiv);
		}
		$(grid.hDiv)
		.mousemove(function (e) {
			if(grid.resizing){grid.dragMove(e);return false;}
		});
		$(".ui-jqgrid-labels",grid.hDiv).on("selectstart", function () { return false; });
		$(document).on( "mouseup.jqGrid" + ts.p.id, function () {
			if(grid.resizing) {	grid.dragEnd( true ); return false;}
			return true;
		});
		
		if(ts.p.direction === 'rtl') {
			$(ts).on('jqGridAfterGridComplete.setRTLPadding',function(){
					var  vScrollWidth = grid.bDiv.offsetWidth - grid.bDiv.clientWidth,
					gridhbox = $(grid.hDiv).find("div").first();
					//ts.p.scrollOffset = vScrollWidth;
					// for future implementation
					if( vScrollWidth > 0 ) vScrollWidth += 1;
					if (gridhbox.hasClass("ui-jqgrid-hbox-rtl")) {
						$(grid.hDiv).find("div").first().css({paddingLeft: vScrollWidth + "px"});
					}
					grid.hDiv.scrollLeft = grid.bDiv.scrollLeft;
			});
		}
		if(ts.p.autoResizing) {
			$(ts).on('jqGridAfterGridComplete.setAutoSizeColumns',function(){
				var arfrozen = false; //, focused = false;
				if(ts.p.frozenColumns === true) {
					//focused = $(':focus', '.frozen-div').attr("id");
					$(ts).jqGrid("destroyFrozenColumns");
					arfrozen = true;
				}
				
				if(ts.p.colSpanHeader.length > 0) {
					$(ts).jqGrid('destroyColSpanHeader',false);
				}
				$(ts.p.colModel).each(function(i){
					if (this.autosize && !this.hidden) {
						if(this._maxsize && this._maxsize > 0) {
							$(ts).jqGrid('resizeColumn', i, this._maxsize +  ts.p.cellLayout, false, false );
							//this._maxsize = this.canvas_width;
						}
					}
				});
				$(ts).jqGrid('refreshGroupHeaders');
				if(ts.p.colSpanHeader.length > 0) {
					$(ts).jqGrid('setColSpanHeader', ts.p.colSpanHeader);
				}				
				if(arfrozen) {
					$(ts).jqGrid("setFrozenColumns");
				}
			});
		}
		if(ts.p.searchCols) {
			$(ts).on("jqGridPaging.searchCols", function() {
				if(!$.isEmptyObject(ts.p._results) ) {
					ts.p._results ={};
					$.jgrid.searchColOnEnter( ts.p.id, null );
				}

			});
			$(ts).on("jqGridSortCol.searchCols", function() {
				if(!$.isEmptyObject(ts.p._results) ) {
					ts.p._results ={};
					$.jgrid.searchColOnEnter( ts.p.id, null );
				}

			});
			if(ts.p.colMenu && ts.p.searchColOptions.colmenu) {
				$(ts).jqGrid('addColSearchMenu');
			}
		}
		ts.formatCol = formatCol;
		ts.sortData = sortData;
		ts.updatepager = updatepager;
		ts.refreshIndex = refreshIndex;
		ts.setHeadCheckBox = setHeadCheckBox;
		ts.constructTr = constructTr;
		ts.formatter = function ( rowId, cellval , colpos, rwdat, act){return formatter(rowId, cellval , colpos, rwdat, act);};
		$.extend(grid,{populate : populate, emptyRows: emptyRows, beginReq: beginReq, endReq: endReq});
		this.grid = grid;
		ts.addXmlData = function(d) {addXmlData( d );};
		ts.addJSONData = function(d) {addJSONData( d );};
		ts.addLocalData = function(d) { return addLocalData( d );};
		ts.addIndexedDBData = function(d) { return addIndexedDBData( d );};
		ts.treeGrid_beforeRequest = function() { treeGrid_beforeRequest(); }; //bvn13
		ts.treeGrid_afterLoadComplete = function() {treeGrid_afterLoadComplete(); };
		this.grid.cols = this.rows[0].cells;
		if ($.jgrid.isFunction( ts.p.onInitGrid )) { ts.p.onInitGrid.call(ts); }
		$(ts).triggerHandler("jqGridInitGrid");
		populate();
		ts.p.hiddengrid=false;
		if(ts.p.responsive) {
			var supportsOrientationChange = "onorientationchange" in window,
			orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
			$(window).on( orientationEvent, function(){
				if($.jgrid.isVisible(ts)) {
					$(ts).jqGrid('resizeGrid', 500, true, ts.p.resizeHeight,true);
				}
			});
		}
	});
};
$.jgrid.extend({
	getGridParam : function(name, grid_module) {
		var $t = this[0], ret;
		if (!$t || !$t.grid) {return;}
		if(grid_module === undefined && typeof grid_module !== 'string') {
			grid_module = 'jqGrid'; //$t.p
		}
		ret = $t.p;
		if(grid_module !== 'jqGrid') {
			try {
				ret = $($t).data( grid_module );
			} catch (e) {
				ret = $t.p;
			}
		}
		if (!name) { return ret; }
		return ret[name] !== undefined ? ret[name] : null;
	},
	setGridParam : function (newParams, overwrite){
		return this.each(function(){
			if( $.jgrid.isNull(overwrite) ) {
				overwrite = false;
			}
			if (this.grid && typeof newParams === 'object') {
				if(overwrite === true) {
					var params = $.extend({}, this.p, newParams);
					this.p = params;
				} else {
					$.extend(true,this.p,newParams);
				}
			}
		});
	},
	getGridRowById : function ( rowid ) {
		var row;
		this.each( function(){
			try {
				row = this.rows.namedItem( rowid );
				/*
				var i = this.rows.length;
				while(i--) {
					if( rowid.toString() === this.rows[i].id) {
						row = this.rows[i];
						break;
					}
				}
				*/
			} catch ( e ) {
				row = $(this.grid.bDiv).find( "#" + $.jgrid.jqID( rowid ))[0];
			}
		});
		return row;
	},
	getGridRowByIndex : function (index) { //first row = 1
		var row = null;
		this.each(function(){
			var i = this.rows.length - 1;
			if(index >= 1 && i>=1 && index <= i) {
				row = this.rows[index];
			}
		});
		return row;
	},
	getDataIDs : function () {
		var ids=[], i=0, len, j=0;
		this.each(function(){
			len = this.rows.length;
			if(len && len>0){
				while(i<len) {
					if($(this.rows[i]).hasClass('jqgrow') && this.rows[i].id !== "norecs") {
						ids[j] = this.rows[i].id;
						j++;
					}
					i++;
				}
			}
		});
		return ids;
	},
	setSelection : function(selection,onsr, e, isHight) {
		return this.each(function(){
			var $t = this, stat,pt, ner, ia, tpsr, fid, csr, tfid,
			getstyle = $.jgrid.getMethod("getStyleUI"),
			highlight = getstyle($t.p.styleUI+'.common','highlight', true),
			disabled = getstyle($t.p.styleUI+'.common','disabled', true);
			if(selection === undefined) { return; }
			if(isHight === undefined ) { 
				isHight = true;
			}
			isHight = isHight === false ? false : true; 
			onsr = onsr === false ? false : true;
			pt=$($t).jqGrid('getGridRowById', selection);
			if(!pt || !pt.className || pt.className.indexOf( disabled ) > -1 ) { return; }
			function scrGrid(iR){
				var ch = $($t.grid.bDiv)[0].clientHeight,
				st = $($t.grid.bDiv)[0].scrollTop,
				rpos = $($t.rows[iR]).position().top,
				rh = $t.rows[iR].clientHeight;
				if(rpos+rh >= ch+st) { $($t.grid.bDiv)[0].scrollTop = rpos-(ch+st)+rh+st; }
				else if(rpos < ch+st) {
					if(rpos < st) {
						$($t.grid.bDiv)[0].scrollTop = rpos;
					}
				}
			}
			if($t.p.scrollrows===true) {
				ner = $($t).jqGrid('getGridRowById',selection).rowIndex;
				if(ner >=0 ){
					scrGrid(ner);
				}
			}
			if(!$t.p.multiselect) {
				if(pt.className !== "ui-subgrid") {
					if( $t.p.selrow !== pt.id ) {
						if( isHight ) {
							csr = $($t).jqGrid('getGridRowById', $t.p.selrow);
							if( csr ) {
								$(  csr ).removeClass(highlight).attr({"aria-selected":"false" , "tabindex" : "-1"});
							}
							$(pt).addClass(highlight).attr({"aria-selected":"true" ,"tabindex" : "0"});//.focus();
						}
						stat = true;
					} else {
						stat = false;
					}
					$t.p.selrow = pt.id;
					if( onsr ) {
						$($t).triggerHandler("jqGridSelectRow", [pt.id, stat, e]);
						if( $t.p.onSelectRow) { $t.p.onSelectRow.call($t, pt.id, stat, e); }
					}
				}
			} else {
				//unselect selectall checkbox when deselecting a specific row
				$t.setHeadCheckBox( false );
				$t.p.selrow = pt.id;
				ia = $.inArray($t.p.selrow,$t.p.selarrrow);
				if (  ia === -1 ){
					if(pt.className !== "ui-subgrid") { $(pt).addClass(highlight).attr("aria-selected","true");}
					stat = true;
					$t.p.selarrrow.push($t.p.selrow);
				} else if( ia !== -1 && e === "_sp_") { 
					// selection preserver multiselect
					if(pt.className !== "ui-subgrid") { $(pt).addClass(highlight).attr("aria-selected","true");}
					stat = true;					
				} else {
					if(pt.className !== "ui-subgrid") { $(pt).removeClass(highlight).attr("aria-selected","false");}
					stat = false;
					$t.p.selarrrow.splice(ia,1);
					tpsr = $t.p.selarrrow[0];
					$t.p.selrow = (tpsr === undefined) ? null : tpsr;
				}
				$("#jqg_"+$.jgrid.jqID($t.p.id)+"_"+$.jgrid.jqID(pt.id))[$t.p.useProp ? 'prop': 'attr']("checked",stat);
				if( onsr ) {
					$($t).triggerHandler("jqGridSelectRow", [pt.id, stat, e]);
					if( $t.p.onSelectRow) { $t.p.onSelectRow.call($t, pt.id , stat, e); }
				}
				//si
				if($.jgrid.isFunction($t.p.onMultiSelect)) {$t.p.onMultiSelect.call($t, $t.p.selarrrow);}
				
			}
		});
	},
	resetSelection : function( rowid ){
		return this.each(function(){
			var t = this, sr, fid,
			getstyle = $.jgrid.getMethod("getStyleUI"),
			highlight = getstyle(t.p.styleUI+'.common','highlight', true),
			hover = getstyle(t.p.styleUI+'.common','hover', true);
			if(rowid !== undefined ) {
				sr = rowid === t.p.selrow ? t.p.selrow : rowid;
				$("#"+$.jgrid.jqID(t.p.id)+" tbody").first().find("tr#"+$.jgrid.jqID(sr)).removeClass( highlight ).attr("aria-selected","false");
				if (fid) { $("#"+$.jgrid.jqID(sr), "#"+$.jgrid.jqID(fid)).removeClass( highlight ); }
				if(t.p.multiselect) {
					$("#jqg_"+$.jgrid.jqID(t.p.id)+"_"+$.jgrid.jqID(sr), "#"+$.jgrid.jqID(t.p.id))[t.p.useProp ? 'prop': 'attr']("checked",false);
					t.setHeadCheckBox( false);
					var ia = $.inArray($.jgrid.jqID(sr), t.p.selarrrow);
					if (  ia !== -1 ){
						t.p.selarrrow.splice(ia,1);
					}
				}
				if( t.p.onUnSelectRow) { t.p.onUnSelectRow.call(t, sr ); }
				sr = null;
			} else if(!t.p.multiselect) {
				if(t.p.selrow) {
					$("#"+$.jgrid.jqID(t.p.id)+" tbody").first().find("tr#"+$.jgrid.jqID(t.p.selrow)).removeClass( highlight ).attr("aria-selected","false");
					if( t.p.onUnSelectRow) { t.p.onUnSelectRow.call(t, t.p.selrow ); }
					t.p.selrow = null;
				}
			} else {
				$(t.p.selarrrow).each(function(i,n){
					$( $(t).jqGrid('getGridRowById',n) ).removeClass( highlight ).attr("aria-selected","false");
					$("#jqg_"+$.jgrid.jqID(t.p.id)+"_"+$.jgrid.jqID(n))[t.p.useProp ? 'prop': 'attr']("checked",false);
					if(fid) {
						$("#"+$.jgrid.jqID(n), "#"+$.jgrid.jqID(fid)).removeClass( highlight );
						$("#jqg_"+$.jgrid.jqID(t.p.id)+"_"+$.jgrid.jqID(n), "#"+$.jgrid.jqID(fid))[t.p.useProp ? 'prop': 'attr']("checked",false);
					}
					if( t.p.onUnSelectRow) { t.p.onUnSelectRow.call(t, n); }
				});
				t.setHeadCheckBox( false );
				t.p.selarrrow = [];
				t.p.selrow = null;
			}
			if(t.p.cellEdit === true) {
				if(parseInt(t.p.iCol,10)>=0  && parseInt(t.p.iRow,10)>=0) {
					$("td",t.rows[t.p.iRow]).eq(t.p.iCol).removeClass("edit-cell " + highlight );
					$(t.rows[t.p.iRow]).removeClass("selected-row " + hover );
				}
			}
			//t.p.savedRow = [];
			//si
			if($.jgrid.isFunction(t.p.onMultiSelect)) {t.p.onMultiSelect.call(t, t.p.selarrrow);}

		});
	},
	getRowData : function( rowid, usedata, treeindent, visibleTreeNodes ) {
		var res = {}, resall, getall=false, len, j=0;
		this.each(function(){
			var $t = this,nm,ind;
			if( $.jgrid.isNull(rowid) ) {
				getall = true;
				resall = [];
				len = $t.rows.length;
			} else {
				ind = $($t).jqGrid('getGridRowById', rowid);
				if(!ind) { return res; }
				len = 1;
			}
			if( !(usedata && usedata === true && $t.p.data.length > 0)  ) {
				usedata = false;
			}
			if( $.jgrid.isNull(treeindent) ) {
				treeindent = false;
			}
			if( $.jgrid.isNull(visibleTreeNodes) ) {
				visibleTreeNodes = false;
			}
			while(j<len){
				if(getall) {
					ind = $t.rows[j];
				}
				if( $(ind).hasClass('jqgrow') && ind.id !== "norecs") { // ignore first not visible row and norecs one
					if($t.p.treeGrid===true && visibleTreeNodes===true && $(ind).is(":hidden")) {
						j++;
						continue;
					}
					if(usedata) {
						res = res = $.extend( {}, $t.p.data[ $t.p._index[ $.jgrid.stripPref($t.p.idPrefix, ind.id) ] ] );
					} else {
						$(ind).children('td[role="gridcell"]').each( function(i) {
							nm = $t.p.colModel[i].name;
							if ( !$.jgrid.isServiceCol( nm ) ) {
								if($t.p.treeGrid===true && nm === $t.p.ExpandColumn) {
									res[nm] = $.jgrid.htmlDecode( $(this).find("span").first().html() );
								} else {
									try {
										res[nm] = $.unformat.call($t,this,{rowId:ind.id, colModel:$t.p.colModel[i]},i);
									} catch (e){
										res[nm] = $.jgrid.htmlDecode($(this).html());
									}
								}
							}
						});
					}
					if($t.p.treeGrid===true && treeindent) {
						var level = $t.p.treeReader.level_field;
						treeindent += '';
						try {
							level = parseInt(res[level],10);
						} catch(e_) {
							level = 0;
						}
						res[$t.p.ExpandColumn] = treeindent.repeat( level ) + res[$t.p.ExpandColumn];
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
			var $t = this;
			rowInd = $($t).jqGrid('getGridRowById', rowid);
			if(!rowInd) {
				return false;
			} else {
				rowid = rowInd.id;
			}
			if($t.p.subGrid) {
				nextRow = $(rowInd).next();
				if(nextRow.hasClass('ui-subgrid')) {
					nextRow.remove();
				}
			}
			$(rowInd).remove();
			$t.p.records--;
			$t.p.reccount--;
			$t.updatepager(true,false);
			success=true;
			if($t.p.multiselect) {
				ia = $.inArray(rowid,$t.p.selarrrow);
				if(ia !== -1) { $t.p.selarrrow.splice(ia,1);}
			}
			if ($t.p.multiselect && $t.p.selarrrow.length > 0) {
				$t.p.selrow = $t.p.selarrrow[$t.p.selarrrow.length-1];
			} else {
				if( $t.p.selrow === rowid ) {
					$t.p.selrow = null;
				}
			}
			if($t.p.datatype === 'local') {
				var id = $.jgrid.stripPref($t.p.idPrefix, rowid),
				pos = $t.p._index[id];
				if(pos !== undefined) {
					$t.p.data.splice(pos,1);
					$t.refreshIndex();
				}
			}
		});
		return success;
	},
	setRowData : function(rowid, data, cssp, usegetrow, skipformatter) {
		var nm, success=true;
		this.each(function(){
			if(!this.grid) {return false;}
			var t = this, vl, ind, lcdata={}, jsondat, title;
			ind = $(this).jqGrid('getGridRowById', rowid);
			if( $.jgrid.type(skipformatter) !== 'boolean') {
				skipformatter = false;
			} 
			if(!ind) { 
				return false; 
			}
			if(usegetrow === true) {
				jsondat = $(t).jqGrid("getRowData", rowid, (t.p.datatype === 'local'));
			}
			if( data ) {
				if(usegetrow) {
					data = $.extend( jsondat, data);
				}
				try {
					$(this.p.colModel).each(function(i){
						nm = this.name;
						var dval =$.jgrid.getAccessor(data,nm);
						if( dval !== undefined) {
							lcdata[nm] = dval; //this.formatter && typeof this.formatter === 'string' && this.formatter === 'date' ? $.unformat.date.call(t,dval,this) : dval;
							vl = !skipformatter ? t.formatter( rowid, lcdata[nm], i, data, 'edit') : dval;
							title = this.title ? {"title":$.jgrid.stripHtml(vl)} : {};
							
							if(t.p.treeGrid===true && nm === t.p.ExpandColumn) {
								$("td[role='gridcell']",ind).eq(i).find("span[class*='cell-wrapper']").html(vl).attr(title);
							} else {
								$("td[role='gridcell']",ind).eq(i).html(vl).attr(title);
							}
						}
					});
					if(t.p.datatype === 'local') {
						var id = $.jgrid.stripPref(t.p.idPrefix, rowid),
						pos = t.p._index[id], key;
						if(t.p.treeGrid) {
							for(key in t.p.treeReader){
								if(t.p.treeReader.hasOwnProperty(key)) {
									delete lcdata[t.p.treeReader[key]];
								}
							}
						}
						if(pos !== undefined) {
							t.p.data[pos] = $.extend(true, t.p.data[pos], lcdata);
						}
						lcdata = null;
					}
				} catch (e) {
					success = false;
				}
			}
			if(success) {
				if(typeof cssp === 'string') {
					$(ind).addClass(cssp);
				} else if( !$.jgrid.isNull(cssp) && typeof cssp === 'object') {
					$(ind).css(cssp);
				}
				$(t).triggerHandler("jqGridAfterGridComplete");
			}
		});
		return success;
	},
	addRowData : function(rowid, rdata, pos, src, addclass) {
		if($.inArray( pos, ["first", "last", "before", "after"] ) === -1) {pos = "last";}
		var success = false, nm, row, rnc="", msc="", gi, si, ni,sind, i, v, prp="", aradd, cnm, data, cm, id;
		if(rdata) {
			if(Array.isArray(rdata)) {
				aradd=true;
				//pos = "last";
				cnm = rowid;
			} else {
				rdata = [rdata];
				aradd = false;
			}
			this.each(function() {
				var t = this, datalen = rdata.length;
				ni = t.p.rownumbers===true ? 1 :0;
				gi = t.p.multiselect ===true ? 1 :0;
				si = t.p.subGrid===true ? 1 :0;
				if(!aradd) {
					if(rowid != null) { 
						rowid = String(rowid);
					} else {
						rowid = $.jgrid.randId();
						if(t.p.keyName !== false) {
							cnm = t.p.keyName;
							if(rdata[0][cnm] !== undefined) {
								rowid = rdata[0][cnm]; 
						}
					}
				}
				}
				var k = 0, classes = $(t).jqGrid('getStyleUI',t.p.styleUI+".base",'rowBox', true, 'jqgrow ui-row-'+ t.p.direction) + " " + (addclass || ""), lcdata = {},
				air = $.jgrid.isFunction(t.p.afterInsertRow) ? true : false;
				if(ni) {
					rnc = $(t).jqGrid('getStyleUI',t.p.styleUI+".base",'rownumBox', false, 'jqgrid-rownum');
				}
				if(gi) {
					msc = $(t).jqGrid('getStyleUI',t.p.styleUI+".base",'multiBox', false, 'cbox');
				}
				while(k < datalen) {
					data = rdata[k];
					row=[];
					if(aradd) {
						try {
							rowid = data[cnm];
							if(rowid===undefined) {
								rowid = $.jgrid.randId();
							}
						}
						catch (e) {
							rowid = $.jgrid.randId();
					}
					}
					id = rowid;
					rowid  = t.p.idPrefix + rowid;
					if(ni) {
						prp = t.formatCol(0,1,'',null,rowid, true);
						row[row.length] = "<td role=\"gridcell\" " + rnc +" "+prp+">0</td>";
					}
					if(gi) {
						v = "<input role=\"checkbox\" type=\"checkbox\""+" id=\"jqg_"+t.p.id+"_"+rowid+"\" "+msc+"/>";
						prp = t.formatCol(ni,1,'', null, rowid, true);
						row[row.length] = "<td role=\"gridcell\" "+prp+">"+v+"</td>";
					}
					if(si) {
						row[row.length] = $(t).jqGrid("addSubGridCell",gi+ni,1);
					}
					for(i = gi+si+ni; i < t.p.colModel.length;i++){
						cm = t.p.colModel[i];
						nm = cm.name;
						lcdata[nm] = data[nm];
						v = t.formatter( rowid, $.jgrid.getAccessor(data,nm), i, data );
						prp = t.formatCol(i,1,v, data, rowid, lcdata);
						row[row.length] = "<td role=\"gridcell\" "+prp+">"+v+"</td>";
					}
					row.unshift( t.constructTr(rowid, false, classes, lcdata, data ) );
					row[row.length] = "</tr>";
					if(t.rows.length === 0){
						$(t.grid.bDiv).find("table").first().append(row.join(''));
					} else {
						switch (pos) {
							case 'last':
								$(t.rows[t.rows.length-1]).after(row.join(''));
								sind = t.rows.length-1;
								break;
							case 'first':
								$(t.rows[0]).after(row.join(''));
								sind = 1;
								break;
							case 'after':
								sind = $(t).jqGrid('getGridRowById', src);
								if (sind) {
									if($(t.rows[sind.rowIndex+1]).hasClass("ui-subgrid")) { $(t.rows[sind.rowIndex+1]).after(row); }
									else { $(sind).after(row.join('')); }
									sind=sind.rowIndex + 1;
								}
								break;
							case 'before':
								sind = $(t).jqGrid('getGridRowById', src);
								if(sind) {
									$(sind).before(row.join(''));
									sind=sind.rowIndex - 1;
								}
								break;
						}
					}
					if(t.p.subGrid===true) {
						$(t).jqGrid("addSubGrid",gi+ni, sind);
					}
					t.p.records++;
					t.p.reccount++;
					$(t).triggerHandler("jqGridAfterInsertRow", [rowid,data,data]);
					if(air) { t.p.afterInsertRow.call(t,rowid,data,data); }
					k++;
					if(t.p.datatype === 'local') {
						lcdata[t.p.localReader.id] = id;
						switch (pos) {
							case 'first':
							t.p.data.unshift(lcdata);
								break;
							case 'last':
							t.p.data.push(lcdata);
								break;
							case 'before':
							case 'after':
								t.p.data.splice(sind-1, 0, lcdata);
								break;
						}
					}
					lcdata = {};
					if(t.p.reccount === 1) {
						sind = $(t).jqGrid('getGridRowById', "norecs");
						if(sind && sind.rowIndex && sind.rowIndex > 0) {
							$(t.rows[sind.rowIndex]).remove();
						}
					}
				}
				if(t.p.datatype === 'local') {
					t.refreshIndex();
				}
				t.updatepager(true,true);
				success = true;
			});
		}
		return success;
	},
	footerData : function(action,data, format, index, destroyFrozen) {
		var nm, success=false, res={};
		function isEmpty(obj) {
			var i;
			for(i in obj) {
				if (obj.hasOwnProperty(i)) { return false; }
			}
			return true;
		}
		if(action === undefined) { action = "get"; }
		if(typeof format !== "boolean") { format  = true; }
		if(index === undefined ) { index = 0;}
		if(destroyFrozen === undefined) { destroyFrozen = true; }
		action = action.toLowerCase();
		this.each(function(){
			var t = this, vl, title, len = this.p.colModel.length, frozen = false;
			if(!t.grid || !t.p.footerrow) {return false;}
			if(action === "set") { if(isEmpty(data)) { return false; } }
			if(action === "getlength") {
				var rowlen = $(".ui-jqgrid-ftable tr", t.grid.sDiv).length;
				res =  rowlen ? rowlen : 0;
				return false;
			}
			success=true;
			if(action === 'addrow') {
				var test = $(".ui-jqgrid-ftable tr", t.grid.sDiv).eq(0).clone();
				$("td", test).html("&nbsp;");
				$(".ui-jqgrid-ftable", t.grid.sDiv ).append(test);
				if(!isEmpty(data)) {
					action = 'set';
					index =  $(".ui-jqgrid-stable tr", t.grid.sDiv).length - 1;
				}
			}			
			if(action === 'delrow') {
				if(index === undefined) {
					index =  $(".ui-jqgrid-stable tr", t.grid.sDiv).length - 1;
				}
				if(index > 0 ) {
					$(".ui-jqgrid-ftable tr", t.grid.sDiv).eq(index).remove();
				}
			}			
			len = len * parseInt(index,10);
			if(action === 'get' || action === 'set') {	
			$(this.p.colModel).each(function(i){
				nm = this.name;
				if(action === "set") {
					if( data[nm] !== undefined) {
						vl = format ? t.formatter( "", data[nm], i, data, 'edit') : data[nm];
						title = this.title ? {"title":$.jgrid.stripHtml(vl)} : {};
							$("tr.footrow td",t.grid.sDiv).eq(i + len).html(vl).attr(title);
						success = true;
					}
				} else if(action === "get") {
					res[nm] = format ? $.unformat.call (t,  $("tr.footrow td",t.grid.sDiv).eq(i + len), { 'colModel' : t.p.colModel[i] }, i) :
						$("tr.footrow td",t.grid.sDiv).eq(i + len).html();
				}
			});
			}
			if(action === 'remove') {
				$(t.grid.sDiv).remove();
				t.grid.sDiv  = null;
				t.p.footerrow = false;
			}
		});
		return (action === "get" || action === "getlength") ? res : success;
	},
	headerData : function(action, data, format, index, destroyFrozen) {
		var nm, success=false, res={};
		function isEmpty(obj) {
			var i;
			for(i in obj) {
				if (obj.hasOwnProperty(i)) { return false; }
			}
			return true;
		}
		if(action === undefined) { action = "get"; }
		if(typeof format !== "boolean") { format  = true; }
		if(index === undefined ) { index=0;}
		if(destroyFrozen === undefined) { destroyFrozen = true; }
		action = action.toLowerCase();
		this.each(function(){
			var t = this, vl, title,len = this.p.colModel.length, frozen = false;
			if(!t.grid || !t.p.headerrow) {return false;}
			if(action === "set") { if(isEmpty(data)) { return false; } }
			if(action === "getlength") {
				var rowlen = $(".ui-jqgrid-hrtable tr", t.grid.hrDiv).length;
				res =  rowlen ? rowlen : 0;
				return true;
			}
			success=true;
			if(action === 'addrow') {
				var test = $(".ui-jqgrid-hrtable tr", t.grid.hrDiv).eq(0).clone();
				$("td", test).html("&nbsp;");
				$(".ui-jqgrid-hrtable", t.grid.hrDiv ).append(test);
				if(!isEmpty(data)) {
					action = 'set';
					index =  $(".ui-jqgrid-hrtable tr", t.grid.hrDiv).length - 1;
				}
			}			
			if(action === 'delrow') {
				if(index === undefined) {
					index =  $(".ui-jqgrid-hrtable tr", t.grid.hrDiv).length - 1;
				}
				if(index > 0 ) {
					$(".ui-jqgrid-hrtable tr", t.grid.hrDiv).eq(index).remove();
				}
			}			
			len = len * parseInt(index,10);
			if(action === 'get' || action === 'set') {		
			$(this.p.colModel).each(function(i){
				nm = this.name;
				if(action === "set") {
					if( data[nm] !== undefined) {
						vl = format ? t.formatter( "", data[nm], i, data, 'edit') : data[nm];
						title = this.title ? {"title":$.jgrid.stripHtml(vl)} : {};
							$("tr.hrheadrow td",t.grid.hrDiv).eq(i + len).html(vl).attr(title);
						success = true;
					}
				} else if(action === "get") {
					res[nm] = format ? $.unformat.call (t,  $("tr.hrheadrow td",t.grid.hrDiv).eq(i+len), { 'colModel' : t.p.colModel[i] }, i) :
						$("tr.hrheadrow td",t.grid.hrDiv).eq(i+len).html();					
				}
			});
			}
			if(action === 'remove') {
				$(t.grid.hrDiv).remove();
				t.grid.hrDiv  = null;
				t.p.headerrow = false;
			}
		});
		return (action === "get" || action === "getlength") ? res : success;
	},
	showHideCol : function(colname,show) {
		return this.each(function() {
			var $t = this, fndh=false, brd=$.jgrid.cell_width ? 0: $t.p.cellLayout, cw, frozen = false;
			if (!$t.grid ) {return;}
			if( typeof colname === 'string') {colname=[colname];}
			show = show !== "none" ? "" : "none";
			var sw = show === "" ? true :false,
			gHead = null,
			gh = $($t).jqGrid("isGroupHeaderOn");
			if($t.p.frozenColumns) {
				$($t).jqGrid('destroyFrozenColumns');
				frozen = true;
			}
			if(gh) { 
				$($t).jqGrid('destroyGroupHeader', false);
				gHead = $.extend([],$t.p.groupHeader);
				$t.p.groupHeader = null;
			}
			if($t.p.colSpanHeader.length) {
				$($t).jqGrid('destroyColSpanHeader', false);
			}
			$(this.p.colModel).each(function(i) {
				if ($.inArray(this.name,colname) !== -1 && this.hidden === sw) {
					//if($t.p.frozenColumns === true && this.frozen === true) {
					//	return true;
					//}
					$("tr[role=row]",$t.grid.hDiv).each(function(){
						$(this.cells[i]).css("display", show);
					});
					$($t.rows).each(function(){
						if (!$(this).hasClass("jqgroup")) {
							$(this.cells[i]).css("display", show);
						}
					});
					if($t.p.footerrow) { $("tr.footrow td", $t.grid.sDiv).eq( i ).css("display", show); }
					if($t.p.headerrow) { $("tr.hrheadrow td", $t.grid.hrDiv).eq( i ).css("display", show); }
					cw =  parseInt(this.width,10);
					if(show === "none") {
						$t.p.tblwidth -= cw+brd;
					} else {
						$t.p.tblwidth += cw+brd;
					}
					this.hidden = !sw;
					fndh=true;
					$($t).triggerHandler("jqGridShowHideCol", [sw,this.name,i]);
				}
			});
			if(fndh===true) {
				if($t.p.shrinkToFit === true && !isNaN($t.p.height)) { 
					$t.p.tblwidth += parseInt($t.p.scrollOffset,10);
				}
				$($t).jqGrid("setGridWidth",$t.p.shrinkToFit === true ? $t.p.tblwidth - (!isNaN($t.p.height) ? parseInt($t.p.scrollOffset,10) : 0) : $t.p.width );
			}
			if( gh && gHead)  {
				for(var k =0; k < gHead.length; k++) {
					$($t).jqGrid('setGroupHeaders', gHead[k]);
				}
			}
			if($t.p.colSpanHeader.length) {
				$($t).jqGrid('setColSpanHeader', $t.p.colSpanHeader);
			}
			if(frozen) {
				$($t).jqGrid("setFrozenColumns");
			}
		});
	},
	hideCol : function (colname) {
		return this.each(function(){$(this).jqGrid("showHideCol",colname,"none");});
	},
	showCol : function(colname) {
		return this.each(function(){$(this).jqGrid("showHideCol",colname,"");});
	},
	hideSearchCol : function(colname) {
		return this.each(function(){
			try {
				var index = this.p._avc.indexOf(colname);
				if(index > -1 ) {
					this.p._avc.splice(index, 1);
					this.p._fthc.push( colname );
					$(this).jqGrid("showHideCol",colname,"none");
				}
			} catch(_e) {} 
		});
	},
	showSearchCol : function(colname) {
		return this.each(function(){
			try {
				var index = this.p._fthc.indexOf(colname);
				if(index > -1 ) {
					this.p._fthc.splice(index, 1);
					this.p._avc.push( colname );
					$(this).jqGrid("showHideCol",colname,"");
				}
			} catch(_e) {} 
		});
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
		var ts = this.get(0);
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
		resortArray(ts.p.colModel);
		resortArray(ts.p.colNames);
		resortArray(ts.grid.headers);
		resortRows( $(ts.grid.hDiv).find("thead").first() , keepHeader && ":not(.ui-jqgrid-labels)");
		if (updateCells) {
			resortRows($("#"+$.jgrid.jqID(ts.p.id)+" tbody").first(), ".jqgfirstrow, tr.jqgrow, tr.jqfoot, tr.jqgroup");
		}
		if (ts.p.footerrow) {
			resortRows( $(ts.grid.sDiv).find("tbody").first() );
		}
		if (ts.p.headerrow) {
			resortRows( $(ts.grid.hrDiv).find("tbody").first());
		}
		if (ts.p.remapColumns) {
			if (!ts.p.remapColumns.length){
				ts.p.remapColumns = $.makeArray(permutation);
			} else {
				resortArray(ts.p.remapColumns);
			}
		}
		ts.p.lastsort = $.inArray(ts.p.lastsort, permutation);
		if(ts.p.treeGrid) { ts.p.expColInd = $.inArray(ts.p.expColInd, permutation); }
		$(ts).triggerHandler("jqGridRemapColumns", [permutation, updateCells, keepHeader]);
	},
	setGridWidth : function(nwidth, shrink, usefrozen) {
		return this.each(function(){
			if (!this.grid ) {return;}
			var $t = this, cw, setgr, frozen = false,
			initwidth = 0, brd=$.jgrid.cell_width ? 0: $t.p.cellLayout, lvc, vc=0, hs=false, scw=$t.p.scrollOffset, aw, gw=0, cr, bstw = $t.p.styleUI.search('Bootstrap') !== -1  ? 2 : 0;

			if(typeof shrink !== 'boolean') {
				shrink=$t.p.shrinkToFit;
			}
			if( typeof usefrozen !== 'boolean' ) {
				usefrozen = true;
			}
			if(isNaN(nwidth)) {return;}
			nwidth = parseInt(nwidth,10);
			if(nwidth < $t.p.minGridWidth || nwidth > $t.p.maxGridWidth) {
				return;
			}
			$t.grid.width = $t.p.width = nwidth;
			$("#gbox_"+$.jgrid.jqID($t.p.id)).css("width",nwidth+"px");
			$("#gview_"+$.jgrid.jqID($t.p.id)).css("width",nwidth+"px");
			$($t.grid.bDiv).css("width",(nwidth - bstw) +"px");
			$($t.grid.hDiv).css("width",(nwidth - bstw) +"px");
			if($t.p.pager ) {
				$($t.p.pager).css("width",(nwidth - bstw) +"px");
			}
			if($t.p.toppager ) {
				$($t.p.toppager).css("width",(nwidth - bstw)+"px");
			}
			if($t.p.toolbar[0] === true){
				$($t.grid.uDiv).css("width",(nwidth - bstw)+"px");
				if($t.p.toolbar[1]==="both") {$($t.grid.ubDiv).css("width",(nwidth - bstw)+"px");}
			}
			if($t.p.footerrow) {
				$($t.grid.sDiv).css("width",(nwidth - bstw)+"px");
			}
			if($t.p.headerrow) {
				$($t.grid.hrDiv).css("width",(nwidth - bstw)+"px");
			}
			// if (group_header)
			setgr = $($t).jqGrid("isGroupHeaderOn");
			if(setgr) { 
				$($t).jqGrid('destroyGroupHeader', false); 
			}
			if($t.p.frozenColumns && usefrozen) {
				$($t).jqGrid("destroyFrozenColumns");
				frozen = true;
			}

			if(shrink ===false && $t.p.forceFit === true) {$t.p.forceFit=false;}
			if(shrink===true) {
				$.each($t.p.colModel, function() {
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
				$t.p.tblwidth = initwidth;
				aw = nwidth-brd*vc-gw;
				var norec_row = $("#norecs", "#"+$.jgrid.jqID($t.p.id)).eq(0);
				if(!isNaN($t.p.height)) {
					if($($t.grid.bDiv)[0].clientHeight <= $($t.grid.bDiv)[0].scrollHeight || $t.rows.length === (norec_row.length + 1)  || $($t.grid.bDiv).css('overflow-y') === 'scroll'){
						hs = true;
						aw -= scw;
					}
				}
				initwidth =0;
				var cle = $t.grid.cols.length >0;
				$.each($t.p.colModel, function(i) {
					if(this.hidden === false && !this.fixed){
						cw = this.widthOrg;
						cw = Math.round(aw*cw/($t.p.tblwidth-brd*vc-gw));
						if (cw < 0) { return; }
						this.width =cw;
						initwidth += cw;
						$t.grid.headers[i].width=cw;
						$t.grid.headers[i].el.style.width=cw+"px";
						if($t.p.footerrow) { $t.grid.footers[i].style.width = cw+"px"; }
						if($t.p.headerrow) { $t.grid.hrheaders[i].style.width = cw+"px"; }
						if(cle) { $t.grid.cols[i].style.width = cw+"px"; }
						lvc = i;
					}
				});

				if (!lvc) { return; }

				cr =0;
				if (hs) {
					if(nwidth-gw-(initwidth+brd*vc) !== scw){
						cr = nwidth-gw-(initwidth+brd*vc)-scw;
					}
				} else if( !hs && Math.abs(nwidth-gw-(initwidth+brd*vc)) !== 0) {
					cr = nwidth-gw-(initwidth+brd*vc) - bstw; // + 1 pix to remove scroll
				}

				$t.p.colModel[lvc].width += cr;
				$t.p.tblwidth = initwidth+cr+brd*vc+gw;
				if($t.p.tblwidth > nwidth) {
					var delta = $t.p.tblwidth - parseInt(nwidth,10);
					$t.p.tblwidth = nwidth;
					cw = $t.p.colModel[lvc].width = $t.p.colModel[lvc].width-delta;
				} else if ($t.p.tblwidth === nwidth){
					cw = $t.p.colModel[lvc].width = $t.p.colModel[lvc].width-bstw;
					$t.p.tblwidth = nwidth - bstw;
				} else {
					cw= $t.p.colModel[lvc].width;
				}
				var has_scroll = ($($t.grid.bDiv)[0].scrollWidth > $($t.grid.bDiv).width()) && bstw !==0 ? -1 : 0;
				cw = $t.p.colModel[lvc].width += has_scroll;

				$t.grid.headers[lvc].width = cw;
				$t.grid.headers[lvc].el.style.width=cw+"px";
				if(cle) { $t.grid.cols[lvc].style.width = cw+"px"; }
				if($t.p.footerrow) {
					$t.grid.footers[lvc].style.width = cw+"px";
				}
				if($t.p.headerrow) {
					$t.grid.hrheaders[lvc].style.width = cw+"px";
				}
			}

			$($t.grid.bDiv).find('table').first().css("width",$t.p.tblwidth+"px");
			$($t.grid.hDiv).find('table').first().css("width",$t.p.tblwidth+"px");
			$t.grid.hDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
			if($t.p.footerrow) {
				$($t.grid.sDiv).find('table').first().css("width",$t.p.tblwidth+"px");
			}
			if($t.p.headerrow) {
				$($t.grid.hrDiv).find('table').first().css("width",$t.p.tblwidth+"px");
			}

			if( setgr )  {
				var gHead = $.extend([],$t.p.groupHeader);
				$t.p.groupHeader = null;
				for(var k =0; k < gHead.length; k++) {
					$($t).jqGrid('setGroupHeaders', gHead[k]);
				}
				$t.grid.hDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
			}
			if(frozen) {
				$($t).jqGrid("setFrozenColumns");
			}
		});
	},
	setGridHeight : function ( nh, entrie_grid, usefrozen ) {
		return this.each(function (){
			var $t = this;
			if(!$t.grid) {return;}
			var bDiv = $($t.grid.bDiv),
			static_height = $($t.grid.hDiv).outerHeight(), frozen = false;

			if( typeof entrie_grid !== 'boolean' ) {
				entrie_grid = false;
			}

			if( typeof usefrozen !== 'boolean' ) {
				usefrozen = true;
			}

			if(entrie_grid === true) {
				if($t.p.pager ) {
					static_height += $($t.p.pager).outerHeight();
				}
				if($t.p.toppager ) {
					static_height += $($t.p.toppager).outerHeight();
				}
				if($t.p.toolbar[0] === true){
					static_height += $($t.grid.uDiv).outerHeight();
					if($t.p.toolbar[1]==="both") {
						static_height += $($t.grid.ubDiv).outerHeight();
					}
				}
				if($t.p.footerrow) {
					static_height += $($t.grid.sDiv).outerHeight();
				}
				if($t.p.headerrow) {
					static_height +=  $($t.grid.hrDiv).outerHeight();
				}
				if($t.p.caption) {
					static_height +=  $($t.grid.cDiv).outerHeight();
				}
				if(nh > static_height) { // set it for the body
					nh = nh - static_height;
				}
			}
			if($t.p.frozenColumns && usefrozen) {
				$($t).jqGrid("destroyFrozenColumns");
				frozen = true;
			}
			bDiv.css({height: nh+(isNaN(nh)?"":"px")});
			$t.p.height = nh;
			if(frozen) {
				$($t).jqGrid("setFrozenColumns");
			}
			if ($t.p.scroll) { 
				$t.grid.populateVisible(); 
			}
		});
	},
	maxGridHeight : function( action, newhgh, minrh ) {
		return this.each(function() {
			var $t = this;
			if(!$t.grid) {
				return;
			}
			if(minrh===undefined) {
				minrh = 25;
			}
			var bDiv = $($t.grid.bDiv);
			if( action === 'set' && !isNaN(newhgh)) { // row min height
				newhgh = parseFloat(newhgh);
				if( newhgh > parseFloat(minrh) ) { // min row height
					bDiv.css("max-height", newhgh ); 
					if( ['100%','auto'].includes($t.p.height) && $($t.grid.bDiv).height() < $($t).height())  {
						$("#"+$.jgrid.jqID($t.p.id)).jqGrid('setGridWidth', $t.p.width+$t.p.scrollOffset-2, false, false );
					}
				}
			} else if( action === 'remove') {
				var test = ['100%','auto'].includes($t.p.height) && $($t.grid.bDiv).height() < $($t).height();
				bDiv.css("max-height", "");
				if(test) {
					$("#"+$.jgrid.jqID($t.p.id)).jqGrid('setGridWidth', $t.p.width-$t.p.scrollOffset+2, false, false );
				}
			}
		});
	},
	setCaption : function (newcap){
		return this.each(function(){
			var ctop = $(this).jqGrid('getStyleUI',this.p.styleUI+".common",'cornertop', true);
			this.p.caption=newcap;
			$(".ui-jqgrid-title, .ui-jqgrid-title-rtl",this.grid.cDiv).html(newcap);
			$(this.grid.cDiv).show();
			$(this.grid.hDiv).removeClass(ctop);
		});
	},
	setLabel : function(colname, nData, prop, attrp ){
		return this.each(function(){
			var $t = this, pos=-1;
			if(!$t.grid) {return;}
			if( !$.jgrid.isNull(colname) ) {
				if(isNaN(colname)) {
					pos = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', colname, true);
				} else {
					pos = parseInt(colname,10);
				}
			} else { return; }
			if( pos >= 0 ) {
				var thecol = $("tr.ui-jqgrid-labels th",$t.grid.hDiv).eq( pos );
				if (nData){
					var ico = $(".s-ico",thecol),
					col_menu = $(".colmenu",thecol);
					try {
						$("[id^=jqgh_]",thecol).empty().html(nData).append(ico).append(col_menu);
					} catch (er) {}
					$t.p.colNames[pos] = nData;
				}
				if (prop) {
					if(typeof prop === 'string') {$(thecol).addClass(prop);} else {$(thecol).css(prop);}
				}
				if(typeof attrp === 'object') {$(thecol).attr(attrp);}
				var tmpcm = $t.p.colModel[pos];
				if( tmpcm.autosize_headers ) {
					var hdr_font = $.jgrid.getFont( thecol[0]);
					tmpcm.canvas_width = ($.jgrid.getTextWidth( $("div", thecol)[0].outerText, hdr_font) +
						(tmpcm.colmenu ? $.jgrid.floatNum( $(".colmenuspan", thecol).parent().width()) : 0) +
						$.jgrid.floatNum( $("div", thecol).css("padding-left")) + $.jgrid.floatNum( $("div", thecol).css("padding-right")) +	
						$.jgrid.floatNum($(".ui-jqgrid-resize", thecol).width()));
				}
			}
		});
	},
	setSortIcon : function(position, colname) {
		return this.each(function(){
			var $t = this, pos=-1, len=1,
			nm, thecol, htmlcol, ico;
			if(!$t.grid) {return;}
			if( !$.jgrid.isNull(colname) ) {
				if(isNaN(colname)) {
					pos = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', colname, true);
				} else {
					pos = parseInt(colname,10);
				}
			} else {
				len = $t.p.colNames.length;
			}
			for(var i =0; i<len; i++) {
			if(pos>=0) {
					i = pos;
				}
				
				nm = $t.p.colModel[i].name;
				if(nm === 'cb' || nm==='subgrid' || nm==='rn' || nm !== 'sc') {
					continue;
				}
				thecol = $("tr.ui-jqgrid-labels th", $t.grid.hDiv).eq( i );
				htmlcol = $t.p.colNames[i];
				ico = thecol.find(".s-ico");

				if(position === 'left') {
					thecol.find("div.ui-th-div").first().empty().addClass("ui-icon-left").append(ico).append(htmlcol);				
				} else if(position === 'right') {
					thecol.find("div.ui-th-div").first().empty().removeClass("ui-icon-left").append(htmlcol).append(ico);
				}
			}
		});
	},
	setCell : function(rowid,colname,nData,cssp,attrp, forceupd) {
		return this.each(function(){
			var $t = this, pos =-1, v, ind;
			if(!$t.grid) {return;}
			if(isNaN(colname)) {
				pos = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', colname, true);
			} else {
				pos = parseInt(colname,10);
			}
			if(pos>=0) {
				ind = $($t).jqGrid('getGridRowById', rowid);
				if (ind){
					var tcell, title, rawdat={}, cm = $t.p.colModel[pos], index;
					try {
						tcell = ind.cells[pos];
					} catch(e){}
					if(tcell) {
						if(nData !== "" || forceupd === true ) {
							rawdat = $($t).jqGrid("getRowData", rowid, ($t.p.datatype === 'local'));
							rawdat[cm.name] = nData;
							v = $t.formatter(rowid, nData, pos, rawdat, 'edit');
							title = cm.title ? {"title":$.jgrid.stripHtml(v)} : {};
							
							if($t.p.treeGrid && $t.p.ExpandColumn === cm.name ) {
								$("span",$(tcell)).html(v).attr(title);
							} else {
								$(tcell).html(v).attr(title);
							}
							if($t.p.datatype === "local") {
								//nData = cm.formatter && typeof cm.formatter === 'string' && cm.formatter === 'date' ? $.unformat.date.call($t,nData,cm) : nData;
								index = $t.p._index[$.jgrid.stripPref($t.p.idPrefix, rowid)];
								if(index !== undefined) {
									$t.p.data[index][cm.name] = nData;
								}
							}
						}
						if(typeof cssp === 'string'){
							$(tcell).addClass(cssp);
						} else if(cssp) {
							$(tcell).css(cssp);
						}
						if(typeof attrp === 'object') {
							$(tcell).attr(attrp);
						}
					}
				}
			}
		});
	},
	getCell : function(rowid, col, returnobject) {
		var ret = false, obj;
		if(typeof returnobject !== 'boolean') {
			returnobject = false;
		}
		this.each(function(){
			var $t=this, pos=-1, ind;
			if(!$t.grid) {return;}
			if(isNaN(col)) {
				pos = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', col, true);
			} else {
				pos = parseInt(col,10);
			}
			if(pos>=0) {
				ind = $($t).jqGrid('getGridRowById', rowid);
				if(ind) {
					obj = $("td",ind).eq( pos );
					if( returnobject ) {
						ret = obj;
					} else {
						try {
							ret = $.unformat.call($t, obj ,{rowId:ind.id, colModel:$t.p.colModel[pos]},pos);
						} catch (e){
							ret = $.jgrid.htmlDecode( obj.html() );
						}
						if($t.p.treeGrid && ret && $t.p.ExpandColumn === col ) {
							ret = $( "<div>" + ret +"</div>").find("span").first().html();
						}
					}
				}
			}
		});
		return ret;
	},
	getCol : function (col, obj, mathopr) {
		var ret = [], val, sum=0, min, max, v;
		if( typeof obj !== 'boolean') {
			obj = false;
		}
		if(mathopr === undefined) { mathopr = false; }
		var font = $.jgrid.getFont( this[0] );

		this.each(function(){
			var $t=this, pos=-1, cm = $t.p.colModel;
			if(!$t.grid) {return;}
			if(isNaN(col)) {
				pos = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', col, true);
			} else {
				pos = parseInt(col,10);
			}
			if( pos >= 0 ) {
				var ln = $t.rows.length, i = 0, dlen = 0;
				if (ln && ln>0){
					for(; i < ln; i++){
						if($($t.rows[i]).hasClass('jqgrow') && $t.rows[i].id !== "norecs") {

							if(mathopr === 'maxwidth') {
								if(max === undefined) { 
									max = cm[pos].autosize_headers ? cm[pos].canvas_width  : 0;
								}
								max = Math.max( $.jgrid.getTextWidth($t.rows[i].cells[pos].outerText, font), max);
								continue;
							}

							try {
								val = $.unformat.call($t,$($t.rows[i].cells[pos]),{rowId:$t.rows[i].id, colModel:$t.p.colModel[pos]},pos);
							} catch (e) {
								val = $.jgrid.htmlDecode($t.rows[i].cells[pos].innerHTML);
							}
							if(mathopr) {
								v = $.jgrid.floatNum(val);
								//if(!isNaN(v)) {
								sum += v;
								if (max === undefined) {max = min = v;}
								min = Math.min(min, v);
								max = Math.max(max, v);
								dlen++;
								//}
							} else if(obj) {
								ret.push( {id:$t.rows[i].id,value:val} );
							} else {
								ret.push( val );
							}
						}
					}
					if(mathopr) {
						switch(mathopr.toLowerCase()){
							case 'sum': ret =sum; break;
							case 'avg': ret = sum/dlen; break;
							case 'count': ret = dlen; break;
							case 'min': ret = min; break;
							case 'max': ret = max; break;
							case 'maxwidth': ret = max;
						}
					}
				}
			}
		});
		return ret;
	},
	setCol : function( col, value) {
		this.each(function(){
			var $t=this, pos=-1, cm = $t.p.colModel, nm,vl, title;
			if(!$t.grid) {return;}
			if(isNaN(col)) {
				pos = $.jgrid.getElemByAttrVal(cm, 'name', col, true);
				nm = col;
			} else {
				pos = parseInt(col,10);
				nm = cm[pos].name;
			}
			if( pos >= 0 ) {
				var ln = $t.rows.length, i = 0;
				if (ln && ln>0){
					var fval  = $.jgrid.isFunction(value) ? value : function(value, data, rowObj) { return value; },
					lcd = $t.p.datatype === 'local';
					for(; i < ln; i++){
						if($($t.rows[i]).hasClass('jqgrow') && $t.rows[i].id !== "norecs") {
							var data={};
							for (let element=0;element<$t.rows[i].cells.length;element++) {
								if($t.rows[i].cells[element] !== undefined) {
									data[cm[element].name] = $.unformat.call($t, $t.rows[i].cells[element] ,{rowId:$t.rows[i].id, colModel:cm[pos]},pos);
								}
							}
							vl = fval.call($t, value, data, $t.rows[i]);
							if(lcd) { // local data
								let index = $t.p._index[$.jgrid.stripPref($t.p.idPrefix, $t.rows[i].id)];
								$t.p.data[index][cm[pos].name] = vl;
							}
							vl = $t.formatter( $t.rows[i].id, vl, pos, data, 'edit');
							title = cm[pos].title ? {"title":$.jgrid.stripHtml(vl)} : {};

							if($t.p.treeGrid===true && nm === $t.p.ExpandColumn) {
								$($t.rows[i].cells[pos]).find("span[class*='cell-wrapper']").html(vl).attr(title);
							} else {
								$($t.rows[i].cells[pos]).html(vl).attr(title);
							}
						}
					}
				}
			}
		});
	},
	clearGridData : function(clearfooter, clearheader) {
		return this.each(function(){
			var $t = this;
			if(!$t.grid) {return;}
			if(typeof clearfooter !== 'boolean') { clearfooter = false; }
			if(typeof clearheader !== 'boolean') { clearheader = false; }
			if($t.p.deepempty) {
				$("#"+$.jgrid.jqID($t.p.id)+" tbody").first().find("tr").slice( 1 ).remove();
			}
			else {
				var trf = $("#"+$.jgrid.jqID($t.p.id)+" tbody").first().find("tr").first()[0];
				$("#"+$.jgrid.jqID($t.p.id)+" tbody").first().empty().append(trf);
			}
			if($t.p.footerrow && clearfooter) { $(".ui-jqgrid-ftable td",$t.grid.sDiv).html("&#160;"); }
			if($t.p.headerrow && clearheader) { $(".ui-jqgrid-hrtable td",$t.grid.hrDiv).html("&#160;"); }
			$t.p.selrow = null; $t.p.selarrrow= []; $t.p.savedRow = [];
			$t.p.records = 0;$t.p.page=1;$t.p.lastpage=0;$t.p.reccount=0;
			$t.p.data = []; $t.p._index = {};
			$t.p.groupingView._locgr = false;
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
			onSelectRow : true,
			scrollingRows : true
		},settings || {});
		return this.each(function(){
			var $t = this;
			if( !$('body').is('[role]') ){$('body').attr('role','application');}
			$t.p.scrollrows = o.scrollingRows;
			$($t).on("keydown", function(event){
				var target = $($t).find('tr[tabindex=0]')[0], id, r, mind,
				expanded = $t.p.treeReader.expanded_field;
				//check for arrow keys
				if(target) {
					var previd = $t.p.selrow;
					mind = $t.p._index[$.jgrid.stripPref($t.p.idPrefix, target.id)];
					if(event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40){
						// up key
						if(event.keyCode === 38 ){
							r = target.previousSibling;
							id = "";
							if(r && $(r).hasClass('jqgrow')) {
								if($(r).is(":hidden")) {
									while(r) {
										r = r.previousSibling;
										if(!$(r).is(":hidden") && $(r).hasClass('jqgrow')) {id = r.id;break;}
									}
								} else {
									id = r.id;
								}
								$($t).jqGrid('setSelection', id, o.onSelectRow, event);
							}
							$($t).triggerHandler("jqGridKeyUp", [id, previd, event]);
							if($.jgrid.isFunction(o.onUpKey)) {
								o.onUpKey.call($t, id, previd, event);
							}
							event.preventDefault();
						}
						//if key is down arrow
						if(event.keyCode === 40){
							r = target.nextSibling;
							id ="";
							if(r && $(r).hasClass('jqgrow')) {
								if($(r).is(":hidden")) {
									while(r) {
										r = r.nextSibling;
										if(!$(r).is(":hidden") && $(r).hasClass('jqgrow') ) {id = r.id;break;}
									}
								} else {
									id = r.id;
								}
								$($t).jqGrid('setSelection', id, o.onSelectRow, event);
							}
							$($t).triggerHandler("jqGridKeyDown", [id, previd, event]);
							if($.jgrid.isFunction(o.onDownKey)) {
								o.onDownKey.call($t, id, previd, event);
							}
							event.preventDefault();
						}
						// left
						if(event.keyCode === 37 ){
							if($t.p.treeGrid && $t.p.data[mind][expanded]) {
								$(target).find("div.treeclick").trigger('click');
							}
							$($t).triggerHandler("jqGridKeyLeft", [$t.p.selrow, event]);
							if($.jgrid.isFunction(o.onLeftKey)) {
								o.onLeftKey.call($t, $t.p.selrow, event);
							}
						}
						// right
						if(event.keyCode === 39 ){
							if($t.p.treeGrid && !$t.p.data[mind][expanded]) {
								$(target).find("div.treeclick").trigger('click');
							}
							$($t).triggerHandler("jqGridKeyRight", [$t.p.selrow, event]);
							if($.jgrid.isFunction(o.onRightKey)) {
								o.onRightKey.call($t, $t.p.selrow, event);
							}
						}
					}
					//check if enter was pressed on a grid or treegrid node
					else if( event.keyCode === 13 ){
						event.preventDefault();
						$($t).triggerHandler("jqGridKeyEnter", [$t.p.selrow, event]);
						if($.jgrid.isFunction(o.onEnter)) {
							o.onEnter.call($t, $t.p.selrow, event);
						}
					} else if(event.keyCode === 32) {
						$($t).triggerHandler("jqGridKeySpace", [$t.p.selrow, event]);
						if($.jgrid.isFunction(o.onSpace)) {
							o.onSpace.call($t, $t.p.selrow, event);
						}
					}
				}
			}).on('click', function(e) {
				if( !$(e.target).is("input, textarea, select") ) {
					$(e.target,$t.rows).closest("tr.jqgrow").focus();
				}
			});
		});
	},
	unbindKeys : function(){
		return this.each(function(){
			$(this).off('keydown');
		});
	},
	getLocalRow : function (rowid) {
		var ret = false, ind;
		this.each(function(){
			if(rowid !== undefined) {
				ind = this.p._index[$.jgrid.stripPref(this.p.idPrefix, rowid)];
				if(ind >= 0 ) {
					ret = this.p.data[ind];
				}
			}
		});
		return ret;
	},
	progressBar : function ( pr ) {
		pr = $.extend({
			htmlcontent : "",
			method : "hide",
			loadtype : "disable"
		}, pr || {});
		return this.each(function(){
			var sh = pr.method==="show" ? true : false,
			loadDiv = $("#load_"+$.jgrid.jqID(this.p.id)),
			offsetParent, top,
			scrollTop = $(window).scrollTop();
			if(pr.htmlcontent !== "") {
				loadDiv.html( pr.htmlcontent );
			}
			switch(pr.loadtype) {
				case "disable":
					break;
				case "enable":
					loadDiv.toggle( sh );
					break;
				case "block":
					$("#lui_"+$.jgrid.jqID(this.p.id)).css(sh ? {top: 0,left:0, height: $("#gbox_" + $.jgrid.jqID(this.p.id) ).height(), width:$("#gbox_" + $.jgrid.jqID(this.p.id)).width(), "z-index":10000, position:"absolute"} : {}).toggle( sh );
					loadDiv.toggle( sh );
					break;
			}
			if (loadDiv.is(':visible')) {
				offsetParent = loadDiv.offsetParent();
				loadDiv.css('top', '');
				if (loadDiv.offset().top < scrollTop) {
					top = Math.min(
						10 + scrollTop - offsetParent.offset().top,
						offsetParent.height() - loadDiv.height()
					);
					loadDiv.css('top', top + 'px');
				}
			}
		});
	},
	getColProp : function(colname){
		var $t = this[0];
		if ( !$t.grid ) { return false; }
		return $.jgrid.getElemByAttrVal($t.p.colModel, 'name', colname, false);
	},
	setColProp : function(colname, obj){
		//do not set width will not work
		return this.each(function(){
			if ( this.grid ) {
				if ( $.isPlainObject( obj ) ) {
					var i = $.jgrid.getElemByAttrVal(this.p.colModel, 'name', colname, true);
					if ( i >= 0 ) {
						$.extend(true, this.p.colModel[i],obj);
					}
				}
			}
		});
	},
	sortGrid : function(colname,reload, sor){
		return this.each(function(){
			var $t=this,idx=-1,i, sobj=false;
			if ( !$t.grid ) { return;}
			if ( !colname ) { colname = $t.p.sortname; }
			for ( i=0;i<$t.p.colModel.length;i++ ) {
				if ( $t.p.colModel[i].index === colname || $t.p.colModel[i].name === colname ) {
					idx = i;
					break;
				}
			}
			if ( idx !== -1 ){
				var sort = $t.p.colModel[idx].sortable;
				if(!sobj) {
					sobj = $t.grid.headers[idx].el;
				}
				if ( typeof sort !== 'boolean' ) { sort =  true; }
				if ( typeof reload !=='boolean' ) { reload = false; }
				if ( sort ) { $t.sortData("jqgh_"+$t.p.id+"_" + colname, idx, reload, sor, sobj); }
			}
		});
	},
	setGridState : function(state) {
		return this.each(function(){
			if ( !this.grid ) {return;}
			var $t = this,
			open = $(this).jqGrid('getStyleUI',this.p.styleUI+".base",'icon_caption_open', true),
			close = $(this).jqGrid('getStyleUI',this.p.styleUI+".base",'icon_caption_close', true);

			if(state === 'hidden'){
				$(".ui-jqgrid-bdiv, .ui-jqgrid-hdiv","#gview_"+$.jgrid.jqID($t.p.id)).slideUp("fast");
				if($t.p.pager) {$($t.p.pager).slideUp("fast");}
				if($t.p.toppager) {$($t.p.toppager).slideUp("fast");}
				if($t.p.toolbar[0]===true) {
					if( $t.p.toolbar[1] === 'both') {
						$($t.grid.ubDiv).slideUp("fast");
					}
					$($t.grid.uDiv).slideUp("fast");
				}
				if($t.p.footerrow) { $(".ui-jqgrid-sdiv","#gbox_"+$.jgrid.jqID($t.p.id)).slideUp("fast"); }
				if($t.p.headerrow) { $(".ui-jqgrid-hrdiv","#gbox_"+$.jgrid.jqID($t.p.id)).slideUp("fast"); }
				$(".ui-jqgrid-headlink",$t.grid.cDiv).removeClass( open ).addClass( close );
				$t.p.gridstate = 'hidden';
			} else if(state === 'visible') {
				$(".ui-jqgrid-hdiv, .ui-jqgrid-bdiv","#gview_"+$.jgrid.jqID($t.p.id)).slideDown("fast");
				if($t.p.pager) {$($t.p.pager).slideDown("fast");}
				if($t.p.toppager) {$($t.p.toppager).slideDown("fast");}
				if($t.p.toolbar[0]===true) {
					if( $t.p.toolbar[1] === 'both') {
						$($t.grid.ubDiv).slideDown("fast");
					}
					$($t.grid.uDiv).slideDown("fast");
				}
				if($t.p.footerrow) { $(".ui-jqgrid-sdiv","#gbox_"+$.jgrid.jqID($t.p.id)).slideDown("fast"); }
				if($t.p.headerrow) { $(".ui-jqgrid-hrdiv","#gbox_"+$.jgrid.jqID($t.p.id)).slideDown("fast"); }
				$(".ui-jqgrid-headlink",$t.grid.cDiv).removeClass( close ).addClass( open );
				$t.p.gridstate = 'visible';
			}

		});
	},
	setFrozenColumns : function(frzclass='frozen-col-class', callername='') {
		return this.each(function(){
			//console.trace();
			if(this.p.direction === "rtl") {
				frzclass += "-rtl";
			}
			if(callername) {
				console.log("called set from:", callername, frzclass);
			}
			var $t = this, cm = $t.p.colModel,i=0, len = cm.length;
			$t.p.frozenColCount = -1;
			while(i<len)
			{
				// from left, no breaking frozen
				if(cm[i].frozen === true)
				{
					$t.p.frozenColCount = i;
				} else {
					break;
				}
				i++;
			}
			if( $t.p.frozenColCount >= 0) {
				$(this).jqGrid('refreshFrozenColumns', true, true, frzclass);
				$(this).on('jqGridAfterGridComplete.setFrozenColumns',function(){
					var pos =0;
					for(i=0;i<$t.p.frozenColCount+1;i++){
					// from left
						var nm = this.id+"_"+cm[i].name;
						$("#"+$.jgrid.jqID(this.id) +' td[aria-describedby="'+nm+'"]').addClass(frzclass).css("inset-inline-start", pos+"px");
						pos = pos +$('.ui-jqgrid-htable th#'+nm, "#gbox_" + $.jgrid.jqID(this.p.id)).outerWidth();
					}
					if($t.p.grouping) {
						$("#"+$.jgrid.jqID(this.p.id)+' tr.jqgroup td.for-sticky').addClass(frzclass).css("inset-inline-start", "0");
					}
				});
				this.p.frozenColumns = true;
			}
		});
	},
	refreshFrozenColumns : function (data= true, addfrzclass=false, frzclass='frozen-col-class') {
		return this.each(function(){
			if( this.p.direction === "rtl" && frzclass.slice(-4) !== "-rtl") {
				frzclass += "-rtl";
			}
			console.log("called refresh frozen", frzclass);
			var pos =0, cm = this.p.colModel;
			var elements =[];
			for(let i=0;i< this.p.frozenColCount+1; i++){
				// from left direction only for now
				if(cm[i].hidden) {
					continue;
				}
				var nm = this.p.id+"_"+cm[i].name ;					
				if(data) {
					elements.push('.ui-jqgrid-bdiv td[aria-describedby="'+nm+'"]');
				}
				elements.push('.ui-jqgrid-htable th#'+nm);
				if(this.p.filterToolbar) {
					elements.push('.ui-jqgrid-htable th#gsh_'+nm);
				}
				if(this.p.headerrow) {
					elements.push('.ui-jqgrid-hrtable td[aria-describedby="'+nm+'"]');
				}
				if(this.p.footerrow) {
					elements.push('.ui-jqgrid-ftable td[aria-describedby="'+nm+'"]');
				}
				if($(this).jqGrid('isGroupHeaderOn')) {
					elements.push('.ui-jqgrid-htable .ui-jqgrid-labels [data-spname="' + cm[i].name  + '"]');
				}
				var parse_str = elements.join();
				let parseobj = $(parse_str, "#gbox_" + $.jgrid.jqID(this.p.id)).css("inset-inline-start", pos+"px");
				if(addfrzclass) {
					parseobj.addClass(frzclass);
				}
				pos += $('.ui-jqgrid-htable th#'+nm, "#gbox_" + $.jgrid.jqID(this.p.id)).outerWidth();
				elements =[];
			}
		});
		
	},
	destroyFrozenColumns : function(frzclass='frozen-col-class') {
		return this.each(function() {
			var cm = this.p.colModel;
			var elements =[];
			if( this.p.direction === "rtl" && frzclass.slice(-4) !== "-rtl") {
				frzclass += "-rtl";
			}
			console.log("caled unset",frzclass);
			for(let i=0;i< this.p.frozenColCount+1; i++){
				// from left direction only for now
				var nm = this.p.id+"_"+cm[i].name ;					
				elements.push('.ui-jqgrid-bdiv td[aria-describedby="'+nm+'"]');
				elements.push('.ui-jqgrid-htable th#'+nm);
				if(this.p.filterToolbar) {
					elements.push('.ui-jqgrid-htable th#gsh_'+nm);
				}
				if(this.p.headerrow) {
					elements.push('.ui-jqgrid-hrtable td[aria-describedby="'+nm+'"]');
				}
				if(this.p.footerrow) {
					elements.push('.ui-jqgrid-ftable td[aria-describedby="'+nm+'"]');
				}
				if($(this).jqGrid('isGroupHeaderOn')) {
					elements.push('.ui-jqgrid-htable .ui-jqgrid-labels [data-spname="' + cm[i].name  + '"]');
				}
				var parse_str = elements.join();
				$(parse_str, "#gbox_" + $.jgrid.jqID(this.p.id)).css("inset-inline-start","").removeClass(frzclass);
				elements =[];
			}
			$(this).off('jqGridAfterGridComplete.setFrozenColumns');
			this.p.frozenColumns = false;
			this.p.frozenColCount = -1;
		});
	},	
	resizeColumn : function ( iCol, newWidth, forceresize, setfrozen ) {
		return this.each(function() {
			var tgrid = this.grid, pr = this.p,
				cm = pr.colModel, i, cmLen = cm.length, diff, diffnv;

			if( typeof forceresize !== 'boolean' ) {
				forceresize = false;
			}
			if( typeof setfrozen !== 'boolean' ) {
				setfrozen = true;
			}
			if(typeof iCol === "string" ) {
				for(i = 0; i < cmLen; i++) {
					if(cm[i].name === iCol) {
						iCol = i;
						break;
					}
				}
			} else {
				iCol = parseInt( iCol, 10 );
			}
			if( !cm[iCol].resizable && !forceresize || cm[iCol].hidden) {
				return;
			}
			newWidth = parseFloat( newWidth );
			// filters
			if(typeof iCol !== "number" || iCol < 0 || iCol > cm.length-1 || typeof newWidth !== "number" ) {
				return;
			}

			if( newWidth < pr.minColWidth ) { 
				newWidth = pr.minColWidth;
			}

			if( pr.forceFit ) {
				pr.nv = 0;
				for (i = iCol+1; i < cmLen; i++){
					if(cm[i].hidden !== true ) {
						pr.nv = i - iCol;
						break;
					}
				}
			}
			// use resize stuff
			tgrid.resizing = {idx : iCol };
			diff = newWidth - tgrid.headers[iCol].width;
			if(pr.forceFit) {
				diffnv = tgrid.headers[ iCol + pr.nv].width - diff;
				if(diffnv < pr.minColWidth) { return; }
				tgrid.headers[ iCol + pr.nv].newWidth = tgrid.headers[ iCol + pr.nv].width - diff;
			}
			tgrid.newWidth = pr.tblwidth + diff;
			tgrid.headers[ iCol ].newWidth = newWidth;
			tgrid.dragEnd( false, setfrozen );
		});
	},
	getStyleUI : function( styleui, classui, notclasstag, gridclass) {
		var ret = "", q = "";
		try {
			var stylemod = styleui.split(".");
			if(!notclasstag) {
				ret = "class=";
				q = "\"";
			}
			if( $.jgrid.isNull(gridclass) ) {
				gridclass = "";
			}
			switch(stylemod.length) {
				case 1 :
					ret += q + $.jgrid.trim(gridclass + " " + $.jgrid.styleUI[stylemod[0]][classui] + q);
					break;
				case 2 :
					ret += q + $.jgrid.trim(gridclass + " " + $.jgrid.styleUI[stylemod[0]][stylemod[1]][classui] + q);
			}
		} catch (cls) {
			ret = "";
		}
		return ret;
	},
	resizeGrid : function (timeout, width, height, refreshfrozen) {
		return this.each(function(){
			var $t = this, frozen = false;
			if(timeout === undefined) {
				timeout = 500;
			}
			if( typeof width !== 'boolean' ) {
				width = true;
			}
			if( typeof height !== 'boolean' ) {
				height = true;
			}
			if( typeof refreshfrozen !== 'boolean' ) {
				refreshfrozen = true;
			}

			setTimeout(function(){
				try {
					if($t.p.frozenColumns && refreshfrozen) {
						$("#"+$.jgrid.jqID($t.p.id)).jqGrid("destroyFrozenColumns");
						frozen = true;
					}
					if(width) {
						var winwidth = $(window).width(),
						parentwidth = $("#gbox_"+$.jgrid.jqID($t.p.id)).parent().width(),
						ww = $t.p.width;
						if( (winwidth-parentwidth) > 3 ) {
							ww = parentwidth;
						} else {
							ww = winwidth;
						}
						if( $($t.grid.bDiv).css("max-height") && ['100%','auto'].includes($t.p.height) && $($t.grid.bDiv).height() < $($t).height())  {
							$("#"+$.jgrid.jqID($t.p.id)).jqGrid('setGridWidth', ww+$t.p.scrollOffset-2, false, false );
						} else {
							$("#"+$.jgrid.jqID($t.p.id)).jqGrid('setGridWidth', ww, $t.p.shrinkToFit, false );
						}
					}

					if( !($t.p.height === 'auto' || $t.p.height === '100%') && height) {
						var wh = $t.p.height,
						bstw = $t.p.styleUI.search('Bootstrap') !== -1 && !isNaN($t.p.height) ? 2 : 0,
						winheight = $(window).height(),
						parentheight = $("#gbox_"+$.jgrid.jqID($t.p.id)).parent().height();
						
						if( (winheight-parentheight) > 3 ) {
							wh = parentheight;
						} else {
							wh = winheight;
						}
						$("#"+$.jgrid.jqID($t.p.id)).jqGrid('setGridHeight', wh - bstw, true, false);
					}
					if(frozen) {
						$("#"+$.jgrid.jqID($t.p.id)).jqGrid("setFrozenColumns");
					}
				} catch(e){}
			}, timeout);
		});
	},
	colMenuAdd : function (colname, options ) {
		var	currstyle = this[0].p.styleUI,
			styles = $.jgrid.styleUI[currstyle].colmenu;
		options = $.extend({
			title: 'Item',
			icon : styles.icon_new_item,
			funcname: null,
			position : "last",
			closeOnRun : true,
			exclude : "",
			id : null, 
			items : []
		}, options ||{});
		return this.each(function(){
			options.colname = colname === 'all' ? "_all_" : colname;
			var $t = this;
			options.id = $.jgrid.isNull(options.id, true) ? $.jgrid.randId(): options.id;
			$t.p.colMenuCustom[options.id] = options;
		});
	},
	colMenuDelete : function ( id ) {
		return this.each(function(){
			if(this.p.colMenuCustom.hasOwnProperty( id )) {
				delete this.p.colMenuCustom[ id ];
			}
		});
	},
	menubarAdd : function( items, target ) {
		var	currstyle = this[0].p.styleUI,
			styles = $.jgrid.styleUI[currstyle].common, item, str;

		return this.each(function(){
			var $t = this;
			if(target === undefined) {
				target = "_menubar";
			}
			if( Array.isArray(items)) {
				for(var i = 0; i < items.length; i++) {
					item = items[i];
					// icon, title, position, id, click
					if(!item.id ) {
						item.id = $.jgrid.randId();
					}
					var ico = '';
					if( item.icon) {
						ico = '<span class="'+styles.icon_base+' ' + item.icon+'"></span>';
					}
					if(!item.position) {
						item.position = 'last';
					}
					if(!item.closeoncall) {
						item.closeoncall = true;
					}
					if(item.divider) {
						str = '<li class="ui-menu-item divider" role="separator"></li>';
						item.cick = null;
					} else {
					str = '<li class="ui-menu-item" role="presentation"><a id="'+ item.id+'" class="g-menu-item" tabindex="0" role="menuitem" ><table class="ui-common-table"><tr><td class="menu_icon">'+ico+'</td><td class="menu_text">'+item.title+'</td></tr></table></a></li>';
					}
					if(item.position === 'last') {
						$("#"+this.p.id + target).append(str);
					} else {
						$("#"+this.p.id + target).prepend(str);
					}
				}
			}
			$("li a", "#"+this.p.id + target).each(function(i,n){
				$(items).each(function(j,f){
					if(f.id === n.id && $.jgrid.isFunction(f.click)) {
						$(n).on('click', function(e){
							f.click.call($t, e);
						});
						return false;
					}
				});
				$(this).hover(
					function(e){
						$(this).addClass(styles.hover);
						e.stopPropagation();
					},
					function(e){ $(this).removeClass(styles.hover);}
				);
			});
		});
	},
	menubarDelete : function( itemid, target ) {
		return this.each(function(){
			if(target === undefined) {
				target = "_menubar";
			}			
			$("#"+itemid, "#"+this.p.id + target).remove();
		});
	},
	addColSearchMenu :  function() {
		return this.each(function(){
			var $t = this;
			$($t).colMenuAdd('sc',{
				title: 'Reset',
				position : "first",
				id :"reset",
				funcname : function() {
					$("input[id^='jqs_']", "#"+this.p.id ).each(function(i){
						$(this).val("");
					});
					$(this)[0].p._results ={};
					$(this).jqGrid('showCol', this.p._avc);
				}
			});
			$($t).colMenuAdd('sc',{
				separator : true,
				id:"groupOp"
			});
			$($t).colMenuAdd('sc',{
				separator : true,
				id:"operOp"
			});
			$($t).colMenuAdd('sc',{
				//title: 'Close',
				separator : true,
				id :"close",
				funcname : function() {
					return true;
				}
			});
			$($t).on("jqGridcolMenuBeforeProcess.custom", function(t, p){
				if(p.module === 'custom' && p.column === 'sc') {
					var regional = $.jgrid.getRegional(this, "search"),
						tstl, i, selected,
						sopt = this.p.searchColOptions,
						getstyle = $.jgrid.getMethod("getStyleUI"),
						stylemodule = this.p.styleUI + ".base";
					if(p.action.id === "reset") {
						p.action.title = regional.Reset || 'Reset';
						p.action.icon = getstyle(this.p.styleUI + ".colmenu", 'icon_reset', true, '');
					}
					if(p.action.id === "close") {
						p.action.title = regional.Close || 'Close';
						p.action.icon = getstyle(this.p.styleUI + ".colmenu", 'icon_close', true, '');
					}
					if(p.action.id === "groupOp") {
						tstl = getstyle(stylemodule, 'searchSelect', false, 'search-col-input');
						p.action.title = ""+(regional.Operand || "Operand: ")+"";
						p.action.title +='<select data-grid-id='+this.p.id+' id="opselect"  '+ tstl+'>';
						tstl = getstyle(this.p.styleUI + ".colmenu", 'icon_group_op', true, ''); 
						p.action.icon = tstl;
						for (i = 0;i< regional.groupOps.length; i++) {
							selected = sopt.searchOp === regional.groupOps[i].op ? "selected" : "";
							p.action.title += "<option value=\"" + regional.groupOps[i].op +"\" " + selected+">"+regional.groupOps[i].text+"</option>";
						}
						p.action.title += "</select>";
						setTimeout(function() {
							$("#opselect").on('change', function(){
								var gid =$("#"+ $(this).attr('data-grid-id'))[0];
								gid.p.searchColOptions.searchOp = $(this).val();
								$.jgrid.myfunc(gid.p.id);
								//$("#column_menu").remove();
							});
						}, 200);
					}
					if(p.action.id === "operOp") {
						tstl = getstyle(stylemodule, 'searchSelect', false, 'search-col-input');
						p.action.title = regional.Operation || "Oper : ";
						p.action.title += '<select data-grid-id='+this.p.id+' id="selectoper"  '+ tstl+'>';
						tstl = getstyle(this.p.styleUI + ".colmenu", 'icon_oper_op', true, ''); 
						p.action.icon = tstl;
						for (i = 0;i <  regional.odata.length; i++) {
							selected = sopt.operand === regional.odata[i].oper ? "selected" : "";
							if(sopt.aOperands.includes( regional.odata[i].oper )) {
								p.action.title += "<option value=\"" + regional.odata[i].oper +"\" " + selected+">"+regional.odata[i].text+"</option>";
							}
						}
						p.action.title += "</select>";
						setTimeout(function() {
							$("#selectoper").on('change', function(){
								var gid =$("#"+ $(this).attr('data-grid-id'))[0];
								gid.p.searchColOptions.operand = $(this).val();
								$.jgrid.myfunc(gid.p.id);
								//$("#column_menu").remove();
							});
						}, 200);
					}
				}
			});
		});
	},
	disableColMenu : function( colname ) {
		return this.each(function (){
			$(this.grid.hDiv).find("tr #jqgh_"+this.p.id+"_"+colname+" > .colmenu").css("display","none");
		});
	},
	enableColMenu : function( colname ) {
		return this.each(function (){
			$(this.grid.hDiv).find("tr #jqgh_"+this.p.id+"_"+colname+" > .colmenu").css("display","inline");
		});
	}
});

//module begin
$.jgrid.extend({
	editCell : function (iRow,iCol, ed, event, excel){
		return this.each(function (){
			var $t = this, nm, tmp,cc, cm,
			highlight = $(this).jqGrid('getStyleUI',$t.p.styleUI+'.common','highlight', true),
			disabled = $(this).jqGrid('getStyleUI',$t.p.styleUI+'.common','disabled', true),			
			hover = !$t.p.ariaBody ? $(this).jqGrid('getStyleUI',$t.p.styleUI+'.common','hover', true) : "",
			inpclass = $(this).jqGrid('getStyleUI',$t.p.styleUI+".celledit",'inputClass', true),
			selclass = $(this).jqGrid('getStyleUI',$t.p.styleUI+".celledit",'selectClass', true);

			if (!$t.grid || $t.p.cellEdit !== true) {return;}
			if ( $($t.rows[iRow]).hasClass(disabled) ) {return;}
			iCol = parseInt(iCol,10);
			// select the row that can be used for other methods
			$t.p.selrow = $t.rows[iRow].id;
			if (!$t.p.knv && !$t.p.ariaBody) {$($t).jqGrid("GridNav");}
			// check to see if we have already edited cell
			if ($t.p.savedRow.length>0) {
				// prevent second click on that field and enable selects
				if (ed===true ) {
					if(iRow == $t.p.iRow && iCol == $t.p.iCol){
						return;
					}
				}
				// save the cell
				$($t).jqGrid("saveCell",$t.p.savedRow[0].id,$t.p.savedRow[0].ic);
			} else {
				window.setTimeout(function () { $("#"+$.jgrid.jqID($t.p.knv)).attr("tabindex","-1").focus();},1);
			}
			cm = $t.p.colModel[iCol];
			nm = cm.name;
			if (nm==='subgrid' || nm==='cb' || nm==='rn' || nm==='sc') {return;}
			try {
				cc = $($t.rows[iRow].cells[iCol]);
			} catch(e) {
				cc = $("td",$t.rows[iRow]).eq( iCol );
			}
			if(parseInt($t.p.iCol,10)>=0  && parseInt($t.p.iRow,10)>=0 && $t.p.iRowId !== undefined) {
				var therow = $($t).jqGrid('getGridRowById', $t.p.iRowId);
				//$("td:eq("+$t.p.iCol+")",$t.rows[$t.p.iRow]).removeClass("edit-cell " + highlight);
				$(therow).removeClass("selected-row " + hover).find("td").eq( $t.p.iCol ).removeClass("edit-cell " + highlight);
			}
			cc.addClass("edit-cell " + highlight);
			$($t.rows[iRow]).addClass("selected-row " + hover);
			if (cm.editable===true && ed===true && !cc.hasClass("not-editable-cell") && (!$.jgrid.isFunction($t.p.isCellEditable) || $t.p.isCellEditable.call($t,nm,iRow,iCol))) {
				try {
					tmp =  $.unformat.call($t,cc,{rowId: $t.rows[iRow].id, colModel:cm},iCol);
				} catch (_) {
					tmp = ( cm.edittype && cm.edittype === 'textarea' ) ? cc.text() : cc.html();
				}
				if($t.p.autoencode) { tmp = $.jgrid.htmlDecode(tmp); }
				if (!cm.edittype) {cm.edittype = "text";}
				$t.p.savedRow.push({id:iRow, ic:iCol, name:nm, v:tmp, rowId: $t.rows[iRow].id });
				try {
					if(tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
				} catch (etmp){}
				if($.jgrid.isFunction($t.p.formatCell)) {
					var tmp2 = $t.p.formatCell.call($t, $t.rows[iRow].id,nm,tmp,iRow,iCol);
					if(tmp2 !== undefined ) {tmp = tmp2;}
				}
				$($t).triggerHandler("jqGridBeforeEditCell", [$t.rows[iRow].id, nm, tmp, iRow, iCol]);
				if ($.jgrid.isFunction($t.p.beforeEditCell)) {
					$t.p.beforeEditCell.call($t, $t.rows[iRow].id,nm,tmp,iRow,iCol);
				}
				var opt = $.extend({}, cm.editoptions || {} ,{id:iRow+"_"+nm,name:nm,rowId: $t.rows[iRow].id, oper:'edit', module : 'cell'});
				if (excel) {
					tmp = event.key;
				}
				var elc = $.jgrid.createEl.call($t,cm.edittype,opt,tmp,true,$.extend({},$.jgrid.ajaxOptions,$t.p.ajaxSelectOptions || {}));
				if( $.inArray(cm.edittype, ['text','textarea','password']) > -1) {
					$(elc).addClass(inpclass);
				} else if(cm.edittype === 'select') {
					$(elc).addClass(selclass);
				}

				cc.html("").append(elc).attr("tabindex","0");
				$.jgrid.bindEv.call($t, elc, opt);
				window.setTimeout(function () { $(elc).focus();},1);
				$("input, select, textarea",cc).on("keydown",function(e) {
					var key = e.key;
					if (e.keyCode === 27) {
						if($("input.hasDatepicker",cc).length >0) {
							if( $(".ui-datepicker").is(":hidden") )  { $($t).jqGrid("restoreCell",iRow,iCol); }
							else { $("input.hasDatepicker",cc).datepicker('hide'); }
						} else {
							$($t).jqGrid("restoreCell",iRow,iCol);
						}
					} //ESC
					if (e.keyCode === 13 && e.altKey && this.nodeName === "TEXTAREA") {
						this.value = this.value + "\r";
						e.preventDefault();
						return true;
					}
					if (e.keyCode === 13 && !e.shiftKey) {
						e.preventDefault();
						$($t).jqGrid("saveCell",iRow,iCol);
						if(iRow < $t.rows.length-1 && excel) {
							$($t).jqGrid('focusBodyCell', iRow + 1 , iCol);
						} else {
							//setTimeout(function(){ $($t).jqGrid('focusBodyCell', iRow , iCol);},100);
						}
						// Prevent default action
						return false;
					} //Enter
					if (e.keyCode === 9 && !excel)  {
						if(!$t.grid.hDiv.loading ) {
							if (e.shiftKey) { //Shift TAb
								if($t.p.ariaBody) {
									$($t).jqGrid("saveCell", iRow , iCol);
									if(iCol >1 ) {
										$($t).jqGrid('focusBodyCell', iRow , iCol -1);
									}
								} else {
									var succ2 = $($t).jqGrid("prevCell", iRow, iCol, e);
									if(!succ2 && $t.p.editNextRowCell) {
										if(iRow-1 > 0 && $t.rows[iRow-1]) {
											iRow--;
											$($t).jqGrid("prevCell", iRow, $t.p.colModel.length, e);
										}
									}
								}
							} else {
								if($t.p.ariaBody) {
									$($t).jqGrid("saveCell", iRow , iCol);
									if(iCol < $t.p.colModel.length -1) {
										$($t).jqGrid('focusBodyCell', iRow , iCol + 1);
									}
								} else {
									var succ = $($t).jqGrid("nextCell", iRow, iCol, e);
									if(!succ && $t.p.editNextRowCell) {
										if($t.rows[iRow+1]) {
											iRow++;
											$($t).jqGrid("nextCell", iRow, 0, e);
										}
									}
								} //Tab
							}
						} else {
							return false;
						}
					}
					if(!excel && $t.p.F2key && $t.p.ariaBody && e.key === 'F2') {
						$($t).jqGrid("saveCell", iRow , iCol);
						$($t).jqGrid('focusBodyCell', iRow , iCol);
						$t.p.F2key = false;
					}
					if(excel) {
						if( key === 'ArrowUp') {
							$($t).jqGrid("saveCell", iRow , iCol);
							if(iRow >1 ) {
								$($t).jqGrid('focusBodyCell', iRow - 1 , iCol);
							}
						}
						if( key === 'ArrowDown' ) {
							$($t).jqGrid("saveCell", iRow , iCol);
							if(iRow < $t.p.rows.length-1 ) {
								$($t).jqGrid('focusBodyCell', iRow + 1 , iCol);
							}
						}
						if( key === 'ArrowLeft') {
							$($t).jqGrid("saveCell", iRow , iCol);
							if(iCol >1 ) {
								$($t).jqGrid('focusBodyCell', iRow , iCol -1);
							}
						}
						if( key === 'ArrowRight' ) {
							$($t).jqGrid("saveCell", iRow , iCol);
							if(iCol < $t.p.colModel.length -1) {
								$($t).jqGrid('focusBodyCell', iRow , iCol + 1);
							}
						}
						if (e.keyCode === 9)  {
							$($t).jqGrid("saveCell", iRow , iCol);
							if (e.shiftKey) {
								if(iCol >1 ) {
									$($t).jqGrid('focusBodyCell', iRow , iCol -1);
								}
							} else {
								if(iCol < $t.p.colModel.length -1) {
									$($t).jqGrid('focusBodyCell', iRow , iCol + 1);
								}
							}
						}
					}
					e.stopPropagation();
				});
				$($t).triggerHandler("jqGridAfterEditCell", [$t.rows[iRow].id, nm, tmp, iRow, iCol]);
				if ($.jgrid.isFunction($t.p.afterEditCell)) {
					$t.p.afterEditCell.call($t, $t.rows[iRow].id,nm,tmp,iRow,iCol);
				}
			} else {
				tmp = cc.html().replace(/\&#160\;/ig,'');
				$($t).triggerHandler("jqGridCellSelect", [$t.rows[iRow].id, iCol, tmp, event]);
				if ($.jgrid.isFunction($t.p.onCellSelect)) {
					$t.p.onCellSelect.call($t, $t.rows[iRow].id, iCol, tmp, event);
				}
			}
			$t.p.iCol = iCol; $t.p.iRow = iRow; $t.p.iRowId = $t.rows[iRow].id;
		});
	},
	saveCell : function (iRow, iCol, over_value){
		return this.each(function(){
			var $t= this, cm = $t.p.colModel[iCol], nm = cm.name, 
				trow = $($t).jqGrid("getGridRowById", $t.rows[iRow].id),
				cc = $('td', trow).eq( iCol ), tmp;
			if(over_value !== undefined ) {
				tmp = $.unformat.call($t, cc, {rowId: $t.rows[iRow].id, colModel:cm}, iCol);
				$t.p.savedRow.push( { id:iRow, ic:iCol, name:nm, v: tmp, rowId: $t.rows[iRow].id } );
				$t.p.savedValues = {oldvalue: tmp, newvalue: over_value, indexRow : iRow};
			}
			var fr = $t.p.savedRow.length >= 1 ? 0 : null,
			errors = $.jgrid.getRegional(this, 'errors'),
			edit =$.jgrid.getRegional(this, 'edit');
			if (!$t.grid || $t.p.cellEdit !== true) {return;}
			if(fr !== null) {
				var nmjq = $.jgrid.jqID(nm), v, v2,
				p = $(cc).offset();

				if( over_value === undefined ) {
				switch (cm.edittype) {
					case "select":
						if(!cm.editoptions.multiple) {
							v = $("#"+iRow+"_"+nmjq+" option:selected", trow ).val();
							v2 = $("#"+iRow+"_"+nmjq+" option:selected", trow).text();
						} else {
							var sel = $("#"+iRow+"_"+nmjq, trow), selectedText = [];
							v = $(sel).val();
							if(v) { v.join(",");} else { v=""; }
							$("option:selected",sel).each(
								function(i,selected){
									selectedText[i] = $(selected).text();
								}
							);
							v2 = selectedText.join(",");
						}
						if(cm.formatter) { v2 = v; }
						break;
					case "checkbox":
						var cbv  = ["Yes","No"];
						if(cm.editoptions && cm.editoptions.value){
							cbv = cm.editoptions.value.split(":");
						}
						v = $("#"+iRow+"_"+nmjq, trow).is(":checked") ? cbv[0] : cbv[1];
						v2=v;
						break;
					case "password":
					case "text":
					case "textarea":
					case "button" :
						v = $("#"+iRow+"_"+nmjq, trow).val();
						v2=v;
						break;
					case 'custom' :
						try {
							if(cm.editoptions && $.jgrid.isFunction(cm.editoptions.custom_value)) {
								v = cm.editoptions.custom_value.call($t, $(".customelement",cc),'get');
								if (v===undefined) { throw "e2";} else { v2=v; }
							} else { throw "e1"; }
						} catch (e) {
							if (e==="e1") { $.jgrid.info_dialog(errors.errcap, "function 'custom_value' " + edit.msg.nodefined, edit.bClose, {styleUI : $t.p.styleUI }); }
							else if (e==="e2") { $.jgrid.info_dialog(errors.errcap, "function 'custom_value' " + edit.msg.novalue, edit.bClose, {styleUI : $t.p.styleUI }); }
							else {$.jgrid.info_dialog(errors.errcap, e.message, edit.bClose, {styleUI : $t.p.styleUI }); }
						}
						break;
				}
				} else  {
					if (cm.editable===true && !cc.hasClass("not-editable-cell") && (!$.jgrid.isFunction($t.p.isCellEditable) || $t.p.isCellEditable.call($t,nm,iRow,iCol))) {
						v = over_value;
						v2 = v;
					} else {
						v = over_value;
						v2 = v;
						$t.p.savedRow.splice(0,1);
						return;
					}
				}
				// The common approach is if nothing changed do not do anything
				if (v2 !== $t.p.savedRow[fr].v){
					var vvv = $($t).triggerHandler("jqGridBeforeSaveCell", [$t.p.savedRow[fr].rowId, nm, v, iRow, iCol]);
					if (vvv) {v = vvv; v2=vvv;}
					if ($.jgrid.isFunction($t.p.beforeSaveCell)) {
						var vv = $t.p.beforeSaveCell.call($t, $t.p.savedRow[fr].rowId, nm, v, iRow, iCol);
						if (vv) {v = vv; v2=vv;}
					}
					var cv = $.jgrid.checkValues.call($t, v, iCol), nuem = false;
					if(cv[0] === true) {
						var addpost = $($t).triggerHandler("jqGridBeforeSubmitCell", [$t.p.savedRow[fr].rowId, nm, v, iRow, iCol]) || {};
						if ($.jgrid.isFunction($t.p.beforeSubmitCell)) {
							addpost = $t.p.beforeSubmitCell.call($t, $t.p.savedRow[fr].rowId, nm, v, iRow, iCol);
							if (!addpost) {addpost={};}
						}
						var retsub = $($t).triggerHandler("jqGridOnSubmitCell", [$t.p.savedRow[fr].rowId, nm, v, iRow, iCol]);
						if(retsub === undefined) {
							retsub = true;
						}
						if($.jgrid.isFunction($t.p.onSubmitCell) ) {
							retsub = $t.p.onSubmitCell($t.p.savedRow[fr].rowId, nm, v, iRow, iCol);
							if( retsub === undefined) {
								retsub = true;
							} 
						}
						if( retsub === false) {
							return;
						}
						if( $("input.hasDatepicker",cc).length >0) { $("input.hasDatepicker",cc).datepicker('hide'); }
						var postdata = {};
						if ($t.p.cellsubmit === 'remote') {
							if ($t.p.cellurl) {
								if($t.p.autoencode) { v = $.jgrid.htmlEncode(v); }
								if(cm.editoptions && cm.editoptions.NullIfEmpty && v === "") {
									v = 'null';
									nuem = true;
								}
								postdata[nm] = v;
								var opers = $t.p.prmNames,
								idname = opers.id,
								oper = opers.oper;
								
								postdata[idname] = $.jgrid.stripPref($t.p.idPrefix, $t.p.savedRow[fr].rowId);
								postdata[oper] = opers.editoper;
								postdata = $.extend(addpost,postdata);
								$($t).jqGrid("progressBar", {method:"show", loadtype : $t.p.loadui, htmlcontent: $.jgrid.getRegional($t,'defaults.savetext') });
								$t.grid.hDiv.loading = true;
								$.ajax( $.extend( {
									url: $t.p.cellurl,
									data :$.jgrid.isFunction($t.p.serializeCellData) ? $t.p.serializeCellData.call($t, postdata, nm) : postdata,
									type: "POST",
									success: function (anydata, stat, result) {
										$($t).jqGrid("progressBar", {method:"hide", loadtype : $t.p.loadui });
										$t.grid.hDiv.loading = false;
										if (stat === 'success') {
											var ret = $($t).triggerHandler("jqGridAfterSubmitCell", [$t, result, postdata[idname], nm, v, iRow, iCol]) || [true, ''];
											if (ret[0] === true && $.jgrid.isFunction($t.p.afterSubmitCell)) {
												ret = $t.p.afterSubmitCell.call($t, result, postdata[idname], nm, v, iRow, iCol);
											}
											if(ret[0] === true){
												if(nuem) {
													v = "";
												}
												$(cc).empty();
												$($t).jqGrid("setCell",$t.p.savedRow[fr].rowId, iCol, v2, false, false, true);
												cc = $('td', trow).eq( iCol );
												$(cc).addClass("dirty-cell");
												$(trow).addClass("edited");
												$($t).triggerHandler("jqGridAfterSaveCell", [$t.p.savedRow[fr].rowId, nm, v, iRow, iCol]);
												if ($.jgrid.isFunction($t.p.afterSaveCell)) {
													$t.p.afterSaveCell.call($t, $t.p.savedRow[fr].rowId, nm, v, iRow,iCol);
												}
												$t.p.savedRow.splice(0,1);
											} else {
												$($t).triggerHandler("jqGridErrorCell", [result, stat]);
												if ($.jgrid.isFunction($t.p.errorCell)) {
													$t.p.errorCell.call($t, result, stat);
												} else {
													$.jgrid.info_dialog(errors.errcap, ret[1], edit.bClose, {
														styleUI : $t.p.styleUI,
														top:p.top+30, 
														left:p.left ,
														onClose : function() {
															if(!$t.p.restoreCellonFail) {
																$("#"+iRow+"_"+nmjq, trow).focus();
															}
														}
													});
												}
												if( $t.p.restoreCellonFail) {
													$($t).jqGrid("restoreCell",iRow,iCol);
												}
											}
										}
									},
									error:function(res,stat,err) {
										$("#lui_"+$.jgrid.jqID($t.p.id)).hide();
										$t.grid.hDiv.loading = false;
										$($t).triggerHandler("jqGridErrorCell", [res, stat, err]);
										if ($.jgrid.isFunction($t.p.errorCell)) {
											$t.p.errorCell.call($t, res,stat,err);
										} else {
											$.jgrid.info_dialog(errors.errcap, res.status+" : "+res.statusText+"<br/>"+stat, edit.bClose, {
												styleUI : $t.p.styleUI,
												top:p.top+30, 
												left:p.left ,
												onClose : function() {
													if(!$t.p.restoreCellonFail) {
														$("#"+iRow+"_"+nmjq, trow).focus();
													}
												}
											});
										}
										if( $t.p.restoreCellonFail) {
											$($t).jqGrid("restoreCell", iRow, iCol);
										}
									}
								}, $.jgrid.ajaxOptions, $t.p.ajaxCellOptions || {}));
							} else {
								try {
									$.jgrid.info_dialog(errors.errcap,errors.nourl, edit.bClose, {styleUI : $t.p.styleUI });
									if( $t.p.restoreCellonFail) {
										$($t).jqGrid("restoreCell", iRow, iCol);
									}
								} catch (e) {}
							}
						}
						if ($t.p.cellsubmit === 'clientArray') {
							$(cc).empty();
							$($t).jqGrid("setCell", $t.p.savedRow[fr].rowId, iCol, v2, false, false, true);
							cc = $('td', trow).eq( iCol );
							$(cc).addClass("dirty-cell");
							$(trow).addClass("edited");
							$($t).triggerHandler("jqGridAfterSaveCell", [$t.p.savedRow[fr].rowId, nm, v, iRow, iCol]);
							if ($.jgrid.isFunction($t.p.afterSaveCell)) {
								$t.p.afterSaveCell.call($t, $t.p.savedRow[fr].rowId, nm, v, iRow, iCol);
							}
							$t.p.savedRow.splice(0,1);
						} else if($t.p.cellsubmit === 'storage') {
							postdata = $t.p.savedRow[fr];
							postdata[nm] = v;
							postdata[$t.p.keyName] = $.jgrid.stripPref($t.p.idPrefix, $t.p.savedRow[fr].rowId);
							$($t).jqGrid('updateStorageRecord', postdata)
							.then(function(e){
								if(e.type==="complete") {
									$(cc).empty();
									$($t).jqGrid("setCell", $t.p.savedRow[fr].rowId, iCol, v2, false, false, true);
									cc = $('td', trow).eq( iCol );
									$(cc).addClass("dirty-cell");
									$(trow).addClass("edited");
									$($t).triggerHandler("jqGridAfterSaveCell", [$t.p.savedRow[fr].rowId, nm, v, iRow, iCol]);
									if ($.jgrid.isFunction($t.p.afterSaveCell)) {
										$t.p.afterSaveCell.call($t, $t.p.savedRow[fr].rowId, nm, v, iRow, iCol);
									}
									$t.p.savedRow.splice(0,1);
									
								}
							})
							.catch(function(e) {
								$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
							});							
						}
					} else {
						try {
							if( $.jgrid.isFunction($t.p.validationCell) ) {
								$t.p.validationCell.call($t, $("#"+iRow+"_"+nmjq, trow), cv[1], iRow, iCol);
							} else {
								window.setTimeout(function(){
									$.jgrid.info_dialog(errors.errcap,v+ " " + cv[1], edit.bClose, {
										styleUI : $t.p.styleUI, 
										top:p.top+30, 
										left:p.left ,
										onClose : function() {
											if(!$t.p.restoreCellonFail) {
												$("#"+iRow+"_"+nmjq, trow).focus();
											}
										}
									});
								},50);
								if( $t.p.restoreCellonFail) {
									$($t).jqGrid("restoreCell", iRow, iCol);
								}
							}
						} catch (e) {
							alert(cv[1]);
						}
					}
				} else {
					$($t).jqGrid("restoreCell", iRow, iCol);
				}
			}
			window.setTimeout(function () { 
				$("#"+$.jgrid.jqID($t.p.knv)).attr("tabindex","-1").focus();
				if($t.p.ariaBody) {
					$($t).jqGrid('focusBodyCell', $t.p.iRow, $t.p.iCol);
				}
			},0);
		});
	},
	restoreCell : function(iRow, iCol) {
		return this.each(function(){
			var $t= this, fr = $t.p.savedRow.length >= 1 ? 0 : null;
			if (!$t.grid || $t.p.cellEdit !== true ) {return;}
			if(fr !== null) {
				var trow = $($t).jqGrid("getGridRowById", $t.p.savedRow[fr].rowId),
				cc = $('td', trow).eq( iCol );
				// datepicker fix
				if($.jgrid.isFunction($.fn.datepicker)) {
					try {
						$("input.hasDatepicker",cc).datepicker('hide');
					} catch (e) {}
				}
				$(cc).empty().attr("tabindex","-1");
				$($t).jqGrid("setCell", $t.p.savedRow[0].rowId, iCol, $t.p.savedRow[fr].v, false, false, true);
				$($t).triggerHandler("jqGridAfterRestoreCell", [$t.p.savedRow[fr].rowId, $t.p.savedRow[fr].v, iRow, iCol]);
				if ($.jgrid.isFunction($t.p.afterRestoreCell)) {
					$t.p.afterRestoreCell.call($t, $t.p.savedRow[fr].rowId, $t.p.savedRow[fr].v, iRow, iCol);
				}				
				$t.p.savedRow.splice(0,1);
			}
			window.setTimeout(function () { 
				$("#"+$t.p.knv).attr("tabindex","-1").focus();
				if($t.p.ariaBody) {
					$($t).jqGrid('focusBodyCell', $t.p.iRow, $t.p.iCol);
				}
			},0);
		});
	},
	nextCell : function (iRow, iCol, event) {
		var ret;
		this.each(function (){
			var $t = this, nCol=false, i;
			if (!$t.grid || $t.p.cellEdit !== true) {return;}
			// try to find next editable cell
			for (i=iCol+1; i<$t.p.colModel.length; i++) {
				if ( $t.p.colModel[i].editable ===true && (!$.jgrid.isFunction($t.p.isCellEditable) || $t.p.isCellEditable.call($t, $t.p.colModel[i].name,iRow,i))) {
					nCol = i; break;
				}
			}
			if(nCol !== false) {
				ret = true;
				$($t).jqGrid("editCell", iRow, nCol, true, event);
			} else {
				ret = false;
				if ($t.p.savedRow.length >0) {
					$($t).jqGrid("saveCell",iRow,iCol);
				}
			}
		});
		return ret;
	},
	prevCell : function (iRow, iCol, event) {
		var ret;
		this.each(function (){
			var $t = this, nCol=false, i;
			if (!$t.grid || $t.p.cellEdit !== true) {return false;}
			// try to find next editable cell
			for (i=iCol-1; i>=0; i--) {
				if ( $t.p.colModel[i].editable ===true && (!$.jgrid.isFunction($t.p.isCellEditable) || $t.p.isCellEditable.call($t, $t.p.colModel[i].name, iRow,i))) {
					nCol = i; 
					break;
				}
			}
			if(nCol !== false) {
				ret = true;
				$($t).jqGrid("editCell", iRow, nCol, true, event);
			} else {
				ret = false;
				if ($t.p.savedRow.length >0) {
					$($t).jqGrid("saveCell",iRow,iCol);
				}
			}
		});
		return ret;
	},
	GridNav : function() {
		return this.each(function () {
			var  $t = this;
			if (!$t.grid || $t.p.cellEdit !== true ) {return;}
			// trick to process keydown on non input elements
			$t.p.knv = $t.p.id + "_kn";
			var selection = $("<div style='position:fixed;top:0px;width:1px;height:1px;' tabindex='0'><div tabindex='-1' style='width:1px;height:1px;' id='"+$t.p.knv+"'></div></div>"),
			i, kdir;
			function scrollGrid(iR, iC, tp){
				if (tp.slice(0,1)==='v') {
					var ch = $($t.grid.bDiv)[0].clientHeight,
					st = $($t.grid.bDiv)[0].scrollTop,
					nROT = $t.rows[iR].offsetTop+$t.rows[iR].clientHeight,
					pROT = $t.rows[iR].offsetTop;
					if(tp === 'vd') {
						if(nROT >= ch) {
							$($t.grid.bDiv)[0].scrollTop = $($t.grid.bDiv)[0].scrollTop + $t.rows[iR].clientHeight;
						}
					}
					if(tp === 'vu'){
						if (pROT < st ) {
							$($t.grid.bDiv)[0].scrollTop = $($t.grid.bDiv)[0].scrollTop - $t.rows[iR].clientHeight;
						}
					}
				}
				if(tp==='h') {
					var cw = $($t.grid.bDiv)[0].clientWidth,
					sl = $($t.grid.bDiv)[0].scrollLeft,
					nCOL = $t.rows[iR].cells[iC].offsetLeft+$t.rows[iR].cells[iC].clientWidth,
					pCOL = $t.rows[iR].cells[iC].offsetLeft;
					if(nCOL >= cw+parseInt(sl,10)) {
						$($t.grid.bDiv)[0].scrollLeft = $($t.grid.bDiv)[0].scrollLeft + $t.rows[iR].cells[iC].clientWidth;
					} else if (pCOL < sl) {
						$($t.grid.bDiv)[0].scrollLeft = $($t.grid.bDiv)[0].scrollLeft - $t.rows[iR].cells[iC].clientWidth;
					}
				}
			}
			function findNextVisible(iC,act){
				var ind, i;
				if(act === 'lft') {
					ind = iC+1;
					for (i=iC;i>=0;i--){
						if ($t.p.colModel[i].hidden !== true) {
							ind = i;
							break;
						}
					}
				}
				if(act === 'rgt') {
					ind = iC-1;
					for (i=iC; i<$t.p.colModel.length;i++){
						if ($t.p.colModel[i].hidden !== true) {
							ind = i;
							break;
						}						
					}
				}
				return ind;
			}

			$(selection).insertBefore($t.grid.cDiv);
			$("#"+$t.p.knv)
			.focus()
			.keydown(function (e){
				kdir = e.keyCode;
				if($t.p.direction === "rtl") {
					if(kdir===37) { kdir = 39;}
					else if (kdir===39) { kdir = 37; }
				}
				switch (kdir) {
					case 38:
						if ($t.p.iRow-1 >0 ) {
							scrollGrid($t.p.iRow-1,$t.p.iCol,'vu');
							$($t).jqGrid("editCell",$t.p.iRow-1,$t.p.iCol,false,e);
						}
					break;
					case 40 :
						if ($t.p.iRow+1 <=  $t.rows.length-1) {
							scrollGrid($t.p.iRow+1,$t.p.iCol,'vd');
							$($t).jqGrid("editCell",$t.p.iRow+1,$t.p.iCol,false,e);
						}
					break;
					case 37 :
						if ($t.p.iCol -1 >=  0) {
							i = findNextVisible($t.p.iCol-1,'lft');
							scrollGrid($t.p.iRow, i,'h');
							$($t).jqGrid("editCell",$t.p.iRow, i,false,e);
						}
					break;
					case 39 :
						if ($t.p.iCol +1 <=  $t.p.colModel.length-1) {
							i = findNextVisible($t.p.iCol+1,'rgt');
							scrollGrid($t.p.iRow,i,'h');
							$($t).jqGrid("editCell",$t.p.iRow,i,false,e);
						}
					break;
					case 13:
						if (parseInt($t.p.iCol,10)>=0 && parseInt($t.p.iRow,10)>=0) {
							e.preventDefault();
							$($t).jqGrid("editCell",$t.p.iRow,$t.p.iCol,true,e);
						}
					break;
					default :
						return true;
				}
				return false;
			});
		});
	},
	getChangedCells : function (mthd) {
		var ret=[];
		if (!mthd) {mthd='all';}
		this.each(function(){
			var $t= this,nm;
			if (!$t.grid || $t.p.cellEdit !== true ) {return;}
			$($t.rows).each(function(j){
				var res = {};
				if ($(this).hasClass("edited")) {
					$('td',this).each( function(i) {
						nm = $t.p.colModel[i].name;
						if ( nm !== 'cb' && nm !== 'subgrid' && nm !=='sc') {
							if (mthd==='dirty') {
								if ($(this).hasClass('dirty-cell')) {
									try {
										res[nm] = $.unformat.call($t,this,{rowId:$t.rows[j].id, colModel:$t.p.colModel[i]},i);
									} catch (e){
										res[nm] = $.jgrid.htmlDecode($(this).html());
									}
								}
							} else {
								try {
									res[nm] = $.unformat.call($t,this,{rowId:$t.rows[j].id,colModel:$t.p.colModel[i]},i);
								} catch (e) {
									res[nm] = $.jgrid.htmlDecode($(this).html());
								}
							}
						}
					});
					res.id = this.id;
					ret.push(res);
				}
			});
		});
		return ret;
	}
/// end  cell editing
});

//module begin
$.extend($.jgrid,{
// Modal functions
	showModal : function(h) {
		h.w.show();
	},
	closeModal : function(h) {
		h.w.hide().attr("aria-hidden","true");
		if(h.o) {h.o.remove();}
	},
	hideModal : function (selector,o) {
		o = $.extend({jqm : true, gb :'', removemodal: false, formprop: false, form : ''}, o || {});
		var thisgrid = o.gb && typeof o.gb === "string" && o.gb.slice(0,6) === "#gbox_" ? $("#" + o.gb.slice(6))[0] : false;
		if(o.onClose) {
			var oncret = thisgrid ? o.onClose.call(thisgrid, selector) : o.onClose(selector);
			if (typeof oncret === 'boolean'  && !oncret ) { return; }
		}
		if( o.formprop && thisgrid  && o.form) {
			var frmgr, frmdata;
			if(o.form==='edit'){
				frmgr = '#' +$.jgrid.jqID("FrmGrid_"+ o.gb.slice(6));
				frmdata = "formProp";
			} else if( o.form === 'view') {
				frmgr = '#' +$.jgrid.jqID("ViewGrid_"+ o.gb.slice(6));
				frmdata = "viewProp";
			}
			$(thisgrid).data(frmdata, {
				top: $.jgrid.floatNum($(selector).css("top")),
				left : $.jgrid.floatNum($(selector).css("left")),
				width : $.jgrid.floatNum( $(selector)[0].style.width ),
				height : $.jgrid.floatNum( $(selector)[0].style.height ),
				dataheight : $(frmgr).height(),
				datawidth: $(frmgr).width()
			});
		}
		if ($.fn.jqm && o.jqm === true) {
			$(selector).attr("aria-hidden","true").jqmHide();
		} else {
			if(o.gb !== '') {
				try {
					$(o.gb).find(".jqgrid-overlay").first().hide();
				} catch (e){}
			}
			try { $(".jqgrid-overlay-modal").hide(); } catch (e) {}
			$(selector).hide().attr("aria-hidden","true");
		}
		if( o.removemodal ) {
			$(selector).remove();
		}
	},
//Helper functions
	findPos : function(obj) {
		var offset = $(obj).offset();
		return [offset.left,offset.top];
	},
	createModal : function(aIDs, content, p, insertSelector, posSelector, appendsel, css) {
		p = $.extend(true, {}, $.jgrid.jqModal || {}, p);
		var self = this,
			rtlsup = $(p.gbox).attr("dir") === "rtl" ? true : false,
			classes = $.jgrid.styleUI[(p.styleUI || 'jQueryUI')].modal,
			common = $.jgrid.styleUI[(p.styleUI || 'jQueryUI')].common,
			mw  = document.createElement('div');
		css = $.extend({}, css || {});
		mw.className= "ui-jqdialog " + classes.modal;
		mw.id = aIDs.themodal;
		var mh = document.createElement('div');
		mh.className = "ui-jqdialog-titlebar " + classes.header;
		mh.id = aIDs.modalhead;
		$(mh).append("<span class='ui-jqdialog-title "+classes.title+"'>"+p.caption+"</span>");
		var ahr= $("<a class='ui-jqdialog-titlebar-close "+common.cornerall+"' aria-label='Close'></a>")
		.hover(function(){ahr.addClass(common.hover);},
			function(){ahr.removeClass(common.hover);})
		.append("<span class='" + common.icon_base+" " + classes.icon_close + "'></span>");
		$(mh).append(ahr);
		if(rtlsup) {
			mw.dir = "rtl";
			$(".ui-jqdialog-title",mh).css("float","right");
			$(".ui-jqdialog-titlebar-close",mh).css("left",0.3+"em");
		} else {
			mw.dir = "ltr";
			$(".ui-jqdialog-title",mh).css("float","left");
			$(".ui-jqdialog-titlebar-close",mh).css("right",0.3+"em");
		}
		var mc = document.createElement('div');
		$(mc).addClass("ui-jqdialog-content " + classes.content).attr("id",aIDs.modalcontent);
		$(mc).append(content);
		mw.appendChild(mc);
		$(mw).prepend(mh);
		if(appendsel===true) { 
			$('body').append(mw); 
		} //append as first child in body -for alert dialog
		else if (typeof appendsel === "string") {
			$(appendsel).append(mw);
		} else {
			$(mw).insertBefore(insertSelector);
		}
		$(mw).css(css);
		if(p.jqModal === undefined) {p.jqModal = true;} // internal use
		var coord = {};
		if ( $.fn.jqm && p.jqModal === true) {
			if(p.left ===0 && p.top===0 && p.overlay) {
				var pos = [];
				pos = $.jgrid.findPos(posSelector);
				p.left = pos[0] + 4;
				p.top = pos[1] + 4;
				if( rtlsup && !appendsel) {
					p.left = $(p.gbox).outerWidth()- (!isNaN(p.width) ? parseInt(p.width,10) :300);// to do
				}
			}
			coord.top = p.top+"px";
			coord.left = p.left+"px";			
		} else if(p.left !==0 || p.top!==0) {
			coord.left = p.left+"px";
			coord.top = p.top+"px";
		}
		$("a.ui-jqdialog-titlebar-close",mh).click(function(){
			var oncm = $("#"+$.jgrid.jqID(aIDs.themodal)).data("onClose") || p.onClose;
			var gboxclose = $("#"+$.jgrid.jqID(aIDs.themodal)).data("gbox") || p.gbox;
			self.hideModal("#"+$.jgrid.jqID(aIDs.themodal),{gb:gboxclose,jqm:p.jqModal,onClose:oncm, removemodal: p.removemodal || false, formprop : !p.recreateForm || false, form: p.form || ''});
			return false;
		});
		if (p.width === 0 || !p.width) {p.width = 300;}
		if(p.height === 0 || !p.height) {p.height =200;}
		if(!p.zIndex) {
			var parentZ = $(insertSelector).parents("*[role=dialog]").first().css("z-index");
			if(parentZ) {
				p.zIndex = parseInt(parentZ,10)+2;
			} else {
				p.zIndex = 950;
			}
		}
		$(mw).css($.extend({
			width: isNaN(p.width) ? "auto": p.width+"px",
			height:isNaN(p.height) ? "auto" : p.height + "px",
			zIndex:p.zIndex,
			overflow: 'hidden'
		},coord))
		.attr({tabIndex: "-1","role":"dialog","aria-labelledby":aIDs.modalhead,"aria-hidden":"true"});
		if(p.drag === undefined) { p.drag=true;}
		if(p.resize === undefined) {p.resize=true;}
		if (p.drag) {
			$(mh).css('cursor','move');
			if($.fn.tinyDraggable) {
				//$(mw).jqDrag(mh);
				$(mw).tinyDraggable({ handle:"#"+$.jgrid.jqID(mh.id) });
			} else {
				try {
					$(mw).draggable({handle: $("#"+$.jgrid.jqID(mh.id))});
				} catch (e) {}
			}
		}
		if(p.resize) {
			if($.fn.jqResize) {
				$(mw).append("<div class='jqResize "+classes.resizable+" "+common.icon_base + " " +classes.icon_resizable+"'></div>");
				$("#"+$.jgrid.jqID(aIDs.themodal)).jqResize(".jqResize",aIDs.scrollelm ? "#"+$.jgrid.jqID(aIDs.scrollelm) : false);
			} else {
				try {
					$(mw).resizable({handles: 'se, sw',alsoResize: aIDs.scrollelm ? "#"+$.jgrid.jqID(aIDs.scrollelm) : false});
				} catch (r) {}
			}
		}
		if(p.closeOnEscape === true){
			$(mw).keydown( function( e ) {
				if( e.which === 27 ) {
					var cone = $("#"+$.jgrid.jqID(aIDs.themodal)).data("onClose") || p.onClose;
					self.hideModal("#"+$.jgrid.jqID(aIDs.themodal),{gb:p.gbox,jqm:p.jqModal,onClose: cone, removemodal: p.removemodal || false, formprop : !p.recreateForm || false, form: p.form || ''});
				}
			});
		}
	},
	viewModal : function (selector,o){
		o = $.extend({
			toTop: true,
			overlay: 10,
			modal: false,
			overlayClass : 'ui-widget-overlay', // to be fixed
			onShow: $.jgrid.showModal,
			onHide: $.jgrid.closeModal,
			gbox: '',
			jqm : true,
			jqM : true 
			//duration : 400,
			//easing: "swing"
		}, o || {});
		var style="";
		if(o.gbox) {
			var grid = $("#"+o.gbox.substring(6))[0];
			try {
				style = $(grid).jqGrid('getStyleUI',  grid.p.styleUI+'.common','overlay', false, 'jqgrid-overlay-modal');
				o.overlayClass = $(grid).jqGrid('getStyleUI',  grid.p.styleUI+'.common','overlay', true);
			} catch (em){}
		}
		if(o.focusField === undefined) {
			o.focusField = 0;
		}
		if(typeof o.focusField === "number" && o.focusField >= 0 ) {
			o.focusField = parseInt(o.focusField,10);
		} else if(typeof o.focusField === "boolean" && !o.focusField) {
			o.focusField = false;
		} else {
			o.focusField = 0;
		}
		if ($.fn.jqm && o.jqm === true) {
			if(o.jqM) { $(selector).attr("aria-hidden","false").jqm(o).jqmShow(); }
			else {$(selector).attr("aria-hidden","false").jqmShow();}
		} else {
			if(o.gbox !== '') {
				var zInd = parseInt($(selector).css("z-index")) - 1;
				if(o.modal) {
					if(!$(".jqgrid-overlay-modal")[0] ) {
						$('body').prepend("<div "+style+"></div>" );
					}
					$(".jqgrid-overlay-modal").css("z-index",zInd).show();
				} else {
					$(o.gbox).find(".jqgrid-overlay").first().css("z-index",zInd).show();
					$(selector).data("gbox",o.gbox);
				}
			}
			$(selector).show().attr("aria-hidden","false");
			if(o.focusField >= 0) {
				try{$(':input:visible',selector)[o.focusField].focus();}catch(_){}
			}
		}
	},
	info_dialog : function(caption, content,c_b, modalopt) {
		var mopt = {
			width:350,
			height:'auto',
			dataheight: 'auto',
			drag: true,
			resize: false,
			left:(window.innerWidth / 2) - 145,
			top:window.innerHeight / 2 - 150,
			zIndex : 1000,
			jqModal : true,
			modal : false,
			closeOnEscape : true,
			align: 'center',
			buttonalign : 'center',
			buttons : [], 
			overlay : 10,
			overlayClass : '',
			autoClose : false,
			autoCloseTime: 3500,
			position : ""
		// {text:'textbutt', id:"buttid", onClick : function(){...}}
		// if the id is not provided we set it like info_button_+ the index in the array - i.e info_button_0,info_button_1...
		};
		$.extend(true, mopt, $.jgrid.jqModal || {}, {caption:"<b>"+caption+"</b>"}, modalopt || {});
		var jm = mopt.jqModal, self = this,
		classes = $.jgrid.styleUI[(mopt.styleUI || $.jgrid.defaults.styleUI || 'jQueryUI')].modal,
		common = $.jgrid.styleUI[(mopt.styleUI || $.jgrid.defaults.styleUI || 'jQueryUI')].common;
		if(!mopt.overlayClass) {
			mopt.overlayClass = common.overlay;
		}
		if($.fn.jqm && !jm) { jm = false; }
		// in case there is no jqModal
		var buttstr ="", i;
		if(mopt.buttons.length > 0) {
			for(i=0;i<mopt.buttons.length;i++) {
				if(mopt.buttons[i].id === undefined) { mopt.buttons[i].id = "info_button_"+i; }
				buttstr += "<a id='"+mopt.buttons[i].id+"' class='fm-button " + common.button+"'>"+mopt.buttons[i].text+"</a>";
			}
		}
		var dh = isNaN(mopt.dataheight) ? mopt.dataheight : mopt.dataheight+"px";
		//cn = "text-align:"+mopt.align+";";
		var cnt = "<div id='info_id'>";
		cnt += "<div id='infocnt' class='info_content "+classes.body+"'>"+content+"</div>";
		cnt += c_b ? "<div class='info_footer " + classes.footer + "'><a id='closedialog' class='fm-button " + common.button + "'>"+c_b+"</a>"+buttstr+"</div>" :
			buttstr !== ""  ? "<div class='info_footer " + classes.footer + "'>"+buttstr+"</div>" : "";
		cnt += "</div>";

		try {
			if($("#info_dialog").attr("aria-hidden") === "false") {
				$.jgrid.hideModal("#info_dialog",{jqm:jm});
			}
			$("#info_dialog").remove();
		} catch (e){}
		var fs =  $('.ui-jqgrid').css('font-size') || '11px';
		$.jgrid.createModal({
			themodal:'info_dialog',
			modalhead:'info_head',
			modalcontent:'info_content',
			scrollelm: 'infocnt'},
			cnt,
			mopt,
			'','',true, 
			{ "font-size":fs}
		);
		if(mopt.position) {
			var inf_dlg_pos = mopt.position.split(" "), d_clas;
			switch (inf_dlg_pos[0].toLowerCase() + " " + inf_dlg_pos[1].toLowerCase() ) 
			{
				case  'top left':
					d_clas = 'top-0 start-0';
				break;
				case  'top center':
					d_clas = 'top-0 start-50 translate-middle-x';
				break;
				case  'top right':
					d_clas = 'top-0 end-0';
				break;
				case  'middle left':
					d_clas = 'top-50 start-0 translate-middle-y';
				break;
				case  'middle center':
					d_clas = 'top-50 start-50 translate-middle';
				break;
				case  'middle right':
					d_clas = 'top-50 end-0 translate-middle-y';
				break;
				case  'bottom left':
					d_clas = 'bottom-0 start-0';
				break;
				case  'bottom center':
					d_clas = 'bottom-0 start-50 translate-middle-x';
				break;
				case  'bottom right':
					d_clas = 'bottom-0 end-0';
				break;
				default :
					d_clas = 'top-50 start-50 translate-middle';
			}
			$("#info_dialog").addClass(d_clas).css({"top":"", "left":"", "width":"auto", "max-width": "500px"});
		}
		$(".info_content","#info_id").height(dh);
		// attach onclick after inserting into the dom
		if(buttstr) {
			$.each(mopt.buttons,function(i){
				$("#"+$.jgrid.jqID(this.id),"#info_id").on('click',function(){mopt.buttons[i].onClick.call($("#info_dialog")); return false;});
			});
		}
		$("#closedialog", "#info_id").on('click',function(){
			self.hideModal("#info_dialog",{
				jqm:jm,
				onClose: $("#info_dialog").data("onClose") || mopt.onClose,
				gb: $("#info_dialog").data("gbox") || mopt.gbox
			});
			return false;
		});
		if(mopt.autoClose) {
			setTimeout(function() {
				$(".ui-jqdialog-titlebar-close", "#info_head").trigger('click');
			}, mopt.autoCloseTime)
		}
		$(".fm-button","#info_dialog").hover(
			function(){$(this).addClass(common.hover);},
			function(){$(this).removeClass(common.hover);}
		);
		if($.jgrid.isFunction(mopt.beforeOpen) ) { mopt.beforeOpen(); }
		if(mopt.type && mopt.type !== "default") {
			$("#info_dialog").addClass("toast-"+mopt.type)
		}
		$.jgrid.viewModal("#info_dialog",{
			onHide: function(h) {
				$.jgrid.closeModal(h);
				h.w.remove();
				//if(h.o) { h.o.remove(); }
			},
			modal :mopt.modal,
			jqm:jm,
			overlay : mopt.overlay,
			overlayClass : mopt.overlayClass
			//duration : mopt.duration || 400,
			//easing: mopt.easing || "swing"
		});
		if($.jgrid.isFunction(mopt.afterOpen) ) { mopt.afterOpen(); }
		try{ $("#info_dialog").focus();} catch (m){}
	},
	toast : function( o ) {
		var opt  = {
			caption : "",
			text :"",
			close_icon : true,
			type: "default", //error, warning, info, success
			close_button : '',
			autoClose : true,
			autoCloseTime : 2000,
			drag: false,
			position : "middle center",
			jqModal:false, 
			duration:600,
			removemodal : true
		};
		$.extend(true, opt, $.jgrid.jqModal || {}, {caption: opt.caption }, o || {});
		if(!opt.text) {
			return;
		}
		$.jgrid.info_dialog(opt.header, opt.text, opt.close_button, opt);
		if(!opt.caption) {
			$(".ui-jqdialog-titlebar","#info_dialog").hide();
			if(opt.close_icon) {
				var close_but = $(".ui-jqdialog-titlebar-close","#info_dialog").clone(true);
				$(close_but).insertAfter($("#infocnt"));
				$("#info_id").css({"padding-right": "35px", "padding-left": "20px"});
			}
		}
	},
	bindEv: function  (el, opt) {
		var $t = this;
		if($.jgrid.isFunction(opt.dataInit)) {
			opt.dataInit.call($t,el,opt);
		}
		if(opt.dataEvents) {
			$.each(opt.dataEvents, function() {
				var tfn = this.fn;
				if (this.data !== undefined) {
					$(el).on(this.type, this.data, function(ev) {tfn.call(this, ev, opt);});
				} else {
					$(el).on(this.type, function(ev){ tfn.call(this, ev, opt);} );
				}
			});
		}
	},
// Form Functions
	createEl : function(eltype,options,vl,autowidth, ajaxso) {
		var elem = "", $t = this;
		function setAttributes(elm, atr, exl ) {
			var exclude = ['dataInit','dataEvents','dataUrl', 'buildSelect','sopt', 'searchhidden', 'defaultValue', 'attr', 'custom_element', 'custom_value', 'oper'];
			exclude = exclude.concat(['cacheUrlData','delimiter','separator']);
			if(exl !== undefined && Array.isArray(exl)) {
				$.merge(exclude, exl);
			}
			$.each(atr, function(key, value){
				if($.inArray(key, exclude) === -1) {
					$(elm).attr(key,value);
				}
			});
			if(!atr.hasOwnProperty('id')) {
				$(elm).attr('id', $.jgrid.randId());
			}
		}
		switch (eltype)
		{
			case "textarea" :
				elem = document.createElement("textarea");
				if(autowidth) {
					if(!options.cols) { $(elem).css({width:"98%"});}
				} else if (!options.cols) { options.cols = 20; }
				if(!options.rows) { options.rows = 2; }
				if(vl==='&nbsp;' || vl==='&#160;' || (vl.length===1 && vl.charCodeAt(0)===160)) {vl="";}
				elem.value = vl;
				$(elem).attr({"role":"textbox","multiline":"true"});
				setAttributes(elem, options);
			break;
			case "checkbox" : //what code for simple checkbox
				elem = document.createElement("input");
				elem.type = "checkbox";
				if( !options.value ) {
					var vl1 = (vl+"").toLowerCase();
					if(vl1.search(/(false|f|0|no|n|off|undefined)/i)<0 && vl1!=="") {
						elem.checked=true;
						elem.defaultChecked=true;
						elem.value = vl;
					} else {
						elem.value = "on";
					}
					$(elem).attr("offval","off");
				} else {
					var cbval = options.value.split(":");
					if(vl === cbval[0]) {
						elem.checked=true;
						elem.defaultChecked=true;
					}
					elem.value = cbval[0];
					$(elem).attr("offval",cbval[1]);
				}
				$(elem).attr("role","checkbox");
				setAttributes(elem, options, ['value']);
			break;
			case "select" :
				elem = document.createElement("select");
				elem.setAttribute("role","listbox");
				var msl, ovm = [];
				if(options.multiple===true) {
					msl = true;
					elem.multiple="multiple";
					$(elem).attr("aria-multiselectable","true");
				} else { msl = false; }
				if(options.dataUrl != null) {
					var rowid = null, postData = options.postData || ajaxso.postData;
					try {
						rowid = options.rowId;
					} catch(e) {}

					if ($t.p && $t.p.idPrefix) {
						rowid = $.jgrid.stripPref($t.p.idPrefix, rowid);
					}
					$.ajax($.extend({
						url: $.jgrid.isFunction(options.dataUrl) ? options.dataUrl.call($t, rowid, vl, String(options.name)) : options.dataUrl,
						type : "GET",
						dataType: "html",
						data: $.jgrid.isFunction(postData) ? postData.call($t, rowid, vl, String(options.name)) : postData,
						context: {elem:elem, options:options, vl:vl},
						success: function(data){
							var ovm = [], elem = this.elem, vl = this.vl,
							options = $.extend({},this.options),
							msl = options.multiple===true,
							cU = options.cacheUrlData === true,
							oV ='', txt, mss =[],
							a = $.jgrid.isFunction(options.buildSelect) ? options.buildSelect.call($t,data) : data;
							if(typeof a === 'string') {
								a = $( $.jgrid.trim( a ) ).html();
							}
							if(a) {
								$(elem).append(a);
								setAttributes(elem, options, postData ? ['postData'] : undefined );
								if(options.size === undefined) { options.size =  msl ? 3 : 1;}
								if(msl) {
									var multiseparator = options.multiseparator === undefined ? ",": options.multiseparator;
									ovm = vl.split(multiseparator);									
									ovm = $.map(ovm,function(n){return $.jgrid.trim(n);});
								} else {
									ovm[0] = $.jgrid.trim(vl);
								}
								//$(elem).attr(options);
								//setTimeout(function(){
								$("option",elem).each(function(i){
									txt = $(this).text();
									vl = $(this).val();
									if(cU) {
										oV += (i!== 0 ? ";": "")+ vl+":"+txt; 
									}
									//if(i===0) { this.selected = ""; }
									// fix IE8/IE7 problem with selecting of the first item on multiple=true
									if (i === 0 && elem.multiple) { this.selected = false; }
									$(this).attr("role","option");
									if($.inArray($.jgrid.trim(txt),ovm) > -1 || $.inArray($.jgrid.trim(vl),ovm) > -1 ) {
										this.selected= "selected";
										mss.push(vl);
									}
								});
								if( options.hasOwnProperty('checkUpdate') ) {
									if (options.checkUpdate) {
										$t.p.savedData[options.name] = mss.join(",");
									}
								}
								if(cU) {
									if(options.oper === 'edit') {
										$($t).jqGrid('setColProp',options.name,{ editoptions: {buildSelect: null, dataUrl : null, value : oV} });
									} else if(options.oper === 'search') {
										$($t).jqGrid('setColProp',options.name,{ searchoptions: {dataUrl : null, value : oV} });
									} else if(options.oper ==='filter') {
										if($("#fbox_"+$t.p.id)[0].p) {
											var cols = $("#fbox_"+$t.p.id)[0].p.columns, nm;
											$.each(cols,function(i) {
												nm  =  this.index || this.name;
												if(options.name === nm) {
													this.searchoptions.dataUrl = null;
													this.searchoptions.value = oV;
													return false;
												}
											});
										}
									}
								}
								$($t).triggerHandler("jqGridAddEditAfterSelectUrlComplete", [elem]);
								//},0);
							}
						}
					},ajaxso || {}));
				} else if(options.value) {
					var i;
					if(options.size === undefined) {
						options.size = msl ? 3 : 1;
					}
					if(msl) {
						ovm = vl.split(",");
						ovm = $.map(ovm,function(n){return $.jgrid.trim(n);});
					}
					if(typeof options.value === 'function') { 
						options.value = options.value.call($t, vl, options); 
					}
					var so,sv, ov, oSv, key, value,
					sep = options.separator === undefined ? ":" : options.separator,
					delim = options.delimiter === undefined ? ";" : options.delimiter;
					if(typeof options.value === 'string') {
						so = options.value.split(delim);
						for(i=0; i<so.length;i++){
							sv = so[i].split(sep);
							if(sv.length > 2 ) {
								sv[1] = $.map(sv,function(n,ii){if(ii>0) { return n;} }).join(sep);
							}
							ov = document.createElement("option");
							ov.setAttribute("role","option");
							ov.value = sv[0]; 
							ov.innerHTML = sv[1];
							if (sv[1].length == 0) {
								ov.setAttribute("aria-label","none");
							}	
							elem.appendChild(ov);
							if (!msl &&  
									($.jgrid.trim(sv[0]) === $.jgrid.trim(vl) || 
									$.jgrid.trim(sv[1]) === $.jgrid.trim(vl))) {

								ov.selected ="selected"; 
							}
							if (msl && ($.inArray($.jgrid.trim(sv[1]), ovm)>-1 || $.inArray($.jgrid.trim(sv[0]), ovm)>-1)) {ov.selected ="selected";}
						}
					} else if (Object.prototype.toString.call(options.value) === "[object Array]") {
						oSv = options.value;
						// array of arrays [[Key, Value], [Key, Value], ...]
						for (i=0; i<oSv.length; i++) {
							if(oSv[i].length === 2) {
								key = oSv[i][0]; 
								value = oSv[i][1];
								ov = document.createElement("option");
								ov.setAttribute("role","option");
								ov.value = key; ov.innerHTML = value;
								if (value.length == 0) {
									ov.setAttribute("aria-label","none");
								}
								elem.appendChild(ov);
								if (!msl &&  ( $.jgrid.trim(key) === $.jgrid.trim(vl) || $.jgrid.trim(value) === $.jgrid.trim(vl)) ) { ov.selected ="selected"; }
								if (msl && ($.inArray($.jgrid.trim(value),ovm)>-1 || $.inArray($.jgrid.trim(key),ovm)>-1)) { ov.selected ="selected"; }
							}
						}
					} else if (typeof options.value === 'object') {
						oSv = options.value;
						for (key in oSv) {
							if (oSv.hasOwnProperty(key ) ){
								ov = document.createElement("option");
								ov.setAttribute("role","option");
								ov.value = key; ov.innerHTML = oSv[key];
								if (oSv[key].length == 0) {
									ov.setAttribute("aria-label","none");
								}
								elem.appendChild(ov);
								if (!msl &&  ( $.jgrid.trim(key) === $.jgrid.trim(vl) || $.jgrid.trim(oSv[key]) === $.jgrid.trim(vl)) ) { ov.selected ="selected"; }
								if (msl && ($.inArray($.jgrid.trim(oSv[key]),ovm)>-1 || $.inArray($.jgrid.trim(key),ovm)>-1)) { ov.selected ="selected"; }
							}
						}
					}
					setAttributes(elem, options, ['value']);
				} else {
					setAttributes(elem, options );
				}
			break;
			case "image" :
			case "file" :
				elem = document.createElement("input");
				elem.type = eltype;
				setAttributes(elem, options);
				break;
			case "custom" :
				elem = document.createElement("span");
				try {
					if($.jgrid.isFunction(options.custom_element)) {
						var celm = options.custom_element.call($t,vl,options);
						if(celm) {
							celm = $(celm).addClass("customelement").attr({id:options.id,name:options.name});
							$(elem).empty().append(celm);
						} else {
							throw "e2";
						}
					} else {
						throw "e1";
					}
				} catch (e) {
					var errors = $.jgrid.getRegional($t, 'errors'),
						edit =$.jgrid.getRegional($t, 'edit');

					if (e==="e1") { $.jgrid.info_dialog(errors.errcap,"function 'custom_element' "+edit.msg.nodefined, edit.bClose, {styleUI : $t.p.styleUI });}
					else if (e==="e2") { $.jgrid.info_dialog(errors.errcap,"function 'custom_element' "+edit.msg.novalue,edit.bClose, {styleUI : $t.p.styleUI });}
					else { $.jgrid.info_dialog(errors.errcap,typeof e==="string"?e:e.message,edit.bClose, {styleUI : $t.p.styleUI }); }
				}
			break;
			default :
				var role;
				if(eltype==="button") { role = "button"; }
				else { role = "textbox"; } // ???
				elem = document.createElement("input");
				elem.type = eltype;
				elem.value = vl;
				if(eltype !== "button"){
					if(autowidth) {
						if(!options.size) { $(elem).css({width:"96%"}); }
					} else if (!options.size) { options.size = 20; }
				}
				$(elem).attr("role",role);
				setAttributes(elem, options);
		}
		return elem;
	},
// Date Validation Javascript
	checkDate : function (format, date) {
		var daysInFebruary = function(year){
		// February has 29 days in any year evenly divisible by four,
		// EXCEPT for centurial years which are not also divisible by 400.
			return (((year % 4 === 0) && ( year % 100 !== 0 || (year % 400 === 0))) ? 29 : 28 );
		},
		tsp = {}, sep;
		format = format.toLowerCase();
		//we search for /,-,. for the date separator
		if(format.indexOf("/") !== -1) {
			sep = "/";
		} else if(format.indexOf("-") !== -1) {
			sep = "-";
		} else if(format.indexOf(".") !== -1) {
			sep = ".";
		} else {
			sep = "/";
		}
		format = format.split(sep);
		date = date.split(sep);
		if (date.length !== 3) { return false; }
		var j=-1,yln, dln=-1, mln=-1, i;
		for(i=0;i<format.length;i++){
			var dv =  isNaN(date[i]) ? 0 : parseInt(date[i],10);
			tsp[format[i]] = dv;
			yln = format[i];
			if(yln.indexOf("y") !== -1) { j=i; }
			if(yln.indexOf("m") !== -1) { mln=i; }
			if(yln.indexOf("d") !== -1) { dln=i; }
		}
		if (format[j] === "y" || format[j] === "yyyy") {
			yln=4;
		} else if(format[j] ==="yy"){
			yln = 2;
		} else {
			yln = -1;
		}
		var daysInMonth = [0,31,29,31,30,31,30,31,31,30,31,30,31],
		strDate;
		if (j === -1) {
			return false;
		}
			strDate = tsp[format[j]].toString();
			if(yln === 2 && strDate.length === 1) {yln = 1;}
			if (strDate.length !== yln || (tsp[format[j]]===0 && date[j]!=="00")){
				return false;
			}
		if(mln === -1) {
			return false;
		}
			strDate = tsp[format[mln]].toString();
			if (strDate.length<1 || tsp[format[mln]]<1 || tsp[format[mln]]>12){
				return false;
			}
		if(dln === -1) {
			return false;
		}
			strDate = tsp[format[dln]].toString();
			if (strDate.length<1 || tsp[format[dln]]<1 || tsp[format[dln]]>31 || (tsp[format[mln]]===2 && tsp[format[dln]]>daysInFebruary(tsp[format[j]])) || tsp[format[dln]] > daysInMonth[tsp[format[mln]]]){
				return false;
			}
		return true;
	},
	isEmpty : function(val)
	{
		if (val === undefined || val.match(/^\s+$/) || val === "")	{
			return true;
		}
		return false;
	},
	checkTime : function(time){
	// checks only hh:ss (and optional am/pm)
		var re = /^(\d{1,2}):(\d{2})([apAP][Mm])?$/,regs;
		if(!$.jgrid.isEmpty(time))
		{
			regs = time.match(re);
			if(regs) {
				if(regs[3]) {
					if(regs[1] < 1 || regs[1] > 12) { return false; }
				} else {
					if(regs[1] > 23) { return false; }
				}
				if(regs[2] > 59) {
					return false;
				}
			} else {
				return false;
			}
		}
		return true;
	},
	checkValues : function(val, valref, customobject, nam) {
		var edtrul,i, nm, dft, len, g = this, cm = g.p.colModel,
		msg = $.jgrid.getRegional(this, 'edit.msg'), fmtdate,
		isNum = function(vn) {
			vn = vn.toString();
			if(vn.length >= 2) {
				var chkv, dot;
				if(vn[0] === "-" ) {
					chkv = vn[1];
					if(vn[2]) { dot = vn[2];}
				} else {
					chkv = vn[0];
					if(vn[1]) { dot = vn[1];}
				}
				if( chkv === "0"  && dot !== ".") {
					return false; //octal
				} 
			}
			return typeof Number(vn) === 'number' && isFinite(vn); 
		};

		if(customobject === undefined) {
			if(typeof valref==='string'){
				for( i =0, len=cm.length;i<len; i++){
					if(cm[i].name===valref) {
						edtrul = cm[i].editrules;
						valref = i;
						if(cm[i].formoptions != null) { nm = cm[i].formoptions.label; }
						break;
					}
				}
			} else if(valref >=0) {
				edtrul = cm[valref].editrules;
			}
		} else {
			edtrul = customobject;
			nm = nam===undefined ? "_" : nam;
		}
		if(edtrul) {
			if(!nm) { nm = g.p.colNames != null ? g.p.colNames[valref] : cm[valref].label; }
			if(edtrul.required === true) {
				if( $.jgrid.isEmpty(val) )  { return [false,nm+": "+msg.required,""]; }
			}
			// force required
			var rqfield = edtrul.required === false ? false : true;
			if(edtrul.number === true) {
				if( !(rqfield === false && $.jgrid.isEmpty(val)) ) {
					if(!isNum(val)) { return [false,nm+": "+msg.number,""]; }
				}
			}
			if(edtrul.minValue !== undefined && !isNaN(edtrul.minValue)) {
				if ($.jgrid.floatNum(val) < $.jgrid.floatNum(edtrul.minValue) ) { return [false,nm+": "+msg.minValue+" "+edtrul.minValue,""];}
			}
			if(edtrul.maxValue !== undefined && !isNaN(edtrul.maxValue)) {
				if ($.jgrid.floatNum(val) > $.jgrid.floatNum(edtrul.maxValue) ) { return [false,nm+": "+msg.maxValue+" "+edtrul.maxValue,""];}
			}
			var filter;
			if(edtrul.email === true) {
				if( !(rqfield === false && $.jgrid.isEmpty(val)) ) {
				// taken from $ Validate plugin
					filter = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
					if(!filter.test(val)) {return [false,nm+": "+msg.email,""];}
				}
			}
			if(edtrul.integer === true) {
				if( !(rqfield === false && $.jgrid.isEmpty(val)) ) {
					if(!isNum(val)) { return [false,nm+": "+msg.integer,""]; }
					if ((val % 1 !== 0) || (val.indexOf('.') !== -1)) { return [false,nm+": "+msg.integer,""];}
				}
			}
			if(edtrul.date === true) {
				if( !(rqfield === false && $.jgrid.isEmpty(val)) ) {
					if(cm[valref].formatoptions && cm[valref].formatoptions.newformat) {
						dft = cm[valref].formatoptions.newformat;
						fmtdate = $.jgrid.getRegional(g, 'formatter.date.masks');
						if(fmtdate && fmtdate.hasOwnProperty(dft) ) {
							dft = fmtdate[dft];
						}
					} else {
						dft = cm[valref].datefmt || "Y-m-d";
					}
					if(!$.jgrid.checkDate (dft, val)) { return [false,nm+": "+msg.date+" - "+dft,""]; }
				}
			}
			if(edtrul.time === true) {
				if( !(rqfield === false && $.jgrid.isEmpty(val)) ) {
					if(!$.jgrid.checkTime (val)) { return [false,nm+": "+msg.date+" - hh:mm (am/pm)",""]; }
				}
			}
			if(edtrul.url === true) {
				if( !(rqfield === false && $.jgrid.isEmpty(val)) ) {
					filter = /^(((https?)|(ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i;
					if(!filter.test(val)) {return [false,nm+": "+msg.url,""];}
				}
			}
			if(edtrul.custom === true) {
				if( !(rqfield === false && $.jgrid.isEmpty(val)) ) {
					if($.jgrid.isFunction(edtrul.custom_func)) {
						var ret = edtrul.custom_func.call(g,val,nm,valref);
						return Array.isArray(ret) ? ret : [false,msg.customarray,""];
					}
					return [false,msg.customfcheck,""];
				}
			}
		}
		return [true,"",""];
	},
	validateForm : function(form) {
		var	f, field, formvalid = true;

		for (f = 0; f < form.elements.length; f++) {
			field = form.elements[f];
			// ignore buttons, fieldsets, etc.
			if (field.nodeName !== "INPUT" && field.nodeName !== "TEXTAREA" && field.nodeName !== "SELECT") continue;
			// is native browser validation available?
			if (typeof field.willValidate !== "undefined") {
				// native validation available
				if (field.nodeName === "INPUT" && field.type !== field.getAttribute("type")) {
					// input type not supported! Use legacy JavaScript validation
					field.setCustomValidity($.jgrid.LegacyValidation(field) ? "" : "error");
				}
				// native browser check display error
				field.reportValidity();
			} else {
				// native validation not available
				field.validity = field.validity || {};
				field.validity.valid = $.jgrid.LegacyValidation(field);
			}

			if (field.validity.valid) {
				// remove error styles and messages
			} else {
				// style field, show error, etc.
				// form is invalid
				//var message = field.validationMessage;
				formvalid = false;
				break;
			}
		}
		return formvalid;
	},
	// basic legacy validation checking
	LegacyValidation : function (field) {
	var	valid = true,
		val = field.value,
		type = field.getAttribute("type"),
		chkbox = (type === "checkbox" || type === "radio"),
		required = field.getAttribute("required"),
		minlength = field.getAttribute("minlength"),
		maxlength = field.getAttribute("maxlength"),
		pattern = field.getAttribute("pattern");

		// disabled fields should not be validated
		if ( field.disabled ) { 
			return valid;
		}
		// value required?
		valid = valid && (!required ||
			(chkbox && field.checked) ||
			(!chkbox && val !== "")
		);

		// minlength or maxlength set?
		valid = valid && (chkbox || (
			(!minlength || val.length >= minlength) &&
			(!maxlength || val.length <= maxlength)
		));

		// test pattern
		if (valid && pattern) {
			pattern = new RegExp(pattern);
			valid = pattern.test(val);
		}

		return valid;
	},
	buildButtons : function ( buttons, source, commonstyle) {
		var icon, str;
		$.each(buttons, function(i,n) {
			// side, position, text, icon, click, id, index
			if(!n.id) {
				n.id = $.jgrid.randId();
			}
			if(!n.position) {
				n.position = 'last';
			}
			if(!n.side) {
				n.side = 'left';
			}
			icon = n.icon ? " fm-button-icon-" + n.side + "'><span class='" + commonstyle.icon_base + " " + n.icon + "'></span>" : "'>";
			str = "<a  data-index='"+i+"' id='" + n.id + "' class='fm-button " + commonstyle.button + icon + n.text+"</a>";
			if(n.position === "last" ) {
				source = source + str;
			} else {
				source = str + source;
			}
		});
		return source;
	},
	setSelNavIndex : function ($t,  selelem ) {
		var cels = $(".ui-pg-button",$t.p.pager);
		$.each(cels, function(i,n) {
			if(selelem===n) {
				$t.p.navIndex = i;
				return false;
			}
		});
		$(selelem).attr("tabindex","0");		
	},
	getFirstVisibleCol : function( $t ) {
		var ret = -1;
		for(var i = 0;i<$t.p.colModel.length;i++) {
			if($t.p.colModel[i].hidden !== true ) {
				ret = i;
				break;
			}
		}
		return ret;
	},
	getLastVisibleCol : function( $t ) {
		var ret = -1;
		for(var i = $t.p.colModel.length - 1; i>=0; i--) {
			if($t.p.colModel[i].hidden !== true ) {
				ret = i;
				break;
			}	
		}
		return ret;
	},
	/* post data to server get or post without ajax */
	postForm : function (path, params, method) {
		method = method || 'post';
		
	    var form = document.createElement('form');
		form.setAttribute('method', method);
		form.setAttribute('action', path);
		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				var hiddenField = document.createElement('input');
				hiddenField.setAttribute('type', 'hidden');
				hiddenField.setAttribute('name', key);
				hiddenField.setAttribute('value', params[key]);

				form.appendChild(hiddenField);
			}
		}

		document.body.appendChild(form);
		form.submit();
		form.parentNode.removeChild(form);
	}	
});

//module begin
$.fn.jqFilter = function( arg ) {
	if (typeof arg === 'string') {

		var fn = $.fn.jqFilter[arg];
		if (!fn) {
			throw ("jqFilter - No such method: " + arg);
		}
		var args = $.makeArray(arguments).slice(1);
		return fn.apply(this,args);
	}

	var p = $.extend(true,{
		filter: null,
		columns: [],
		sortStrategy: null,
		onChange : null,
		afterRedraw : null,
		checkValues : null,
		error: false,
		errmsg : "",
		errorcheck : true,
		showQuery : true,
		sopt : null,
		ops : [],
		operands : null,
		numopts : ['eq','ne', 'lt', 'le', 'gt', 'ge', 'nu', 'nn', 'in', 'ni'],
		stropts : ['eq', 'ne', 'bw', 'bn', 'ew', 'en', 'cn', 'nc', 'nu', 'nn', 'in', 'ni'],
		strarr : ['text', 'string', 'blob'],
		groupOps : [{ op: "AND", text: "AND" },	{ op: "OR",  text: "OR" }],
		groupButton : true,
		ruleButtons : true,
		uniqueSearchFields : false,
		direction : "ltr",
		addsubgrup : "Add subgroup",
		addrule : "Add rule",
		delgroup : "Delete group",
		delrule : "Delete rule",
		autoencode : false,
		unaryOperations : []
	}, $.jgrid.filter, arg || {});
	return this.each( function() {
		if (this.filter) {return;}
		this.p = p;
		// setup filter in case if they is not defined
		if (this.p.filter === null || this.p.filter === undefined) {
			this.p.filter = {
				groupOp: this.p.groupOps[0].op,
				rules: [],
				groups: []
			};
		}

		// Sort the columns if the sort strategy is provided.
		if (this.p.sortStrategy != null && $.jgrid.isFunction(this.p.sortStrategy)) {
			this.p.columns.sort(this.p.sortStrategy);
		}

		var i, len = this.p.columns.length, cl,
		isIE = /msie/i.test(navigator.userAgent) && !window.opera;

		// translating the options
		this.p.initFilter = $.extend(true,{},this.p.filter);
		//this.p.initFilter = {};
		// set default values for the columns if they are not set
		if( !len ) {return;}
		for(i=0; i < len; i++) {
			cl = this.p.columns[i];
			if( cl.stype ) {
				// grid compatibility
				cl.inputtype = cl.stype;
			} else if(!cl.inputtype) {
				cl.inputtype = 'text';
			}
			if( cl.sorttype ) {
				// grid compatibility
				cl.searchtype = cl.sorttype;
			} else if (!cl.searchtype) {
				cl.searchtype = 'string';
			}
			if(cl.hidden === undefined) {
				// jqGrid compatibility
				cl.hidden = false;
			}
			if(!cl.label) {
				cl.label = cl.name;
			}
			if(cl.index) {
				cl.name = cl.index;
			}
			if(!cl.hasOwnProperty('searchoptions')) {
				cl.searchoptions = {};
			}
			if(!cl.hasOwnProperty('searchrules')) {
				cl.searchrules = {};
			}
			if(cl.search === undefined) {
				cl.inlist = true;
			} else {
				cl.inlist = cl.search;
			}
		}
		var getGrid = function () {
			return $("#" + $.jgrid.jqID(p.id))[0] || null;
		},

		$tg = getGrid(),
		classes = $.jgrid.styleUI[($tg.p.styleUI || 'jQueryUI')].filter,
		common = $.jgrid.styleUI[($tg.p.styleUI || 'jQueryUI')].common;


		if(this.p.showQuery) {
			$(this).append("<table class='queryresult " + classes.table_widget + "' style='display:block;max-width:440px;border:0px none;' dir='"+this.p.direction+"'><tbody><tr><td class='query'></td></tr></tbody></table>");
		}
		/*
		 *Perform checking.
		 *
		*/
		var checkData = function(val, colModelItem) {
			var ret = [true,""], $t = getGrid();
			if($.jgrid.isFunction(colModelItem.searchrules)) {
				ret = colModelItem.searchrules.call($t, val, colModelItem);
			} else if($.jgrid && $.jgrid.checkValues) {
				try {
					ret = $.jgrid.checkValues.call($t, val, -1, colModelItem.searchrules, colModelItem.label);
				} catch (e) {}
			}
			if(ret && ret.length && ret[0] === false) {
				p.error = !ret[0];
				p.errmsg = ret[1];
			}
		};
		/* moving to common
		randId = function() {
			return Math.floor(Math.random()*10000).toString();
		};
		*/

		this.onchange = function (  ){
			// clear any error
			this.p.error = false;
			this.p.errmsg="";
			return $.jgrid.isFunction(this.p.onChange) ? this.p.onChange.call( this, this.p ) : false;
		};
		/*
		 * Redraw the filter every time when new field is added/deleted
		 * and field is  changed
		 */
		this.reDraw = function() {
			$(this).find("table.group").first().remove();
			var t = this.createTableForGroup(p.filter, null);
			$(this).append(t);
			if($.jgrid.isFunction(this.p.afterRedraw) ) {
				this.p.afterRedraw.call(this, this.p);
			}
		};
		/*
		 * Creates a grouping data for the filter
		 * @param group - object
		 * @param parentgroup - object
		 */
		this.createTableForGroup = function(group, parentgroup) {
			var that = this,  i;
			// this table will hold all the group (tables) and rules (rows)
			var table = $("<table class='group " + classes.table_widget +" ui-search-table' style='border:0px none;'><tbody></tbody></table>"),
			// create error message row
			align = "left";
			if(this.p.direction === "rtl") {
				align = "right";
				table.attr("dir","rtl");
			}
			if(parentgroup === null) {
				table.append("<tr class='error' style='display:none;'><th colspan='5' class='" + common.error + "' align='"+align+"'></th></tr>");
			}

			var tr = $("<tr></tr>");
			table.append(tr);
			// this header will hold the group operator type and group action buttons for
			// creating subgroup "+ {}", creating rule "+" or deleting the group "-"
			var th = $("<th colspan='5' align='"+align+"'></th>");
			tr.append(th);

			if(this.p.ruleButtons === true) {
			// dropdown for: choosing group operator type
			var groupOpSelect = $("<select size='1' name='select_group_op' class='opsel " + classes.srSelect + "'></select>");
			th.append(groupOpSelect);
			// populate dropdown with all posible group operators: or, and
			var str= "", selected;
			for (i = 0; i < p.groupOps.length; i++) {
				selected =  group.groupOp === that.p.groupOps[i].op ? " selected='selected'" :"";
				str += "<option value='"+that.p.groupOps[i].op+"'" + selected+">"+that.p.groupOps[i].text+"</option>";
			}

			groupOpSelect
			.append(str)
			.on('change',function() {
				group.groupOp = $(groupOpSelect).val();
				that.onchange(); // signals that the filter has changed
			});
			}
			// button for adding a new subgroup
			var inputAddSubgroup ="<span></span>";
			if(this.p.groupButton) {
				inputAddSubgroup = $("<input type='button' value='+ {}' title='" +that.p.addsubgrup+"' class='add-group " + common.button + "' name='newsubgroup'/>");
				inputAddSubgroup.on('click',function() {
					if (group.groups === undefined ) {
						group.groups = [];
					}

					group.groups.push({
						groupOp: p.groupOps[0].op,
						rules: [],
						groups: []
					}); // adding a new group

					that.reDraw(); // the html has changed, force reDraw

					that.onchange(); // signals that the filter has changed
					return false;
				});
			}
			th.append(inputAddSubgroup);
			if(this.p.ruleButtons === true) {
			// button for adding a new rule
			var inputAddRule = $("<input type='button' value='+' title='"+that.p.addrule+"' class='add-rule ui-add " + common.button + "'/ name='newrule'>"), cm;
			inputAddRule.on('click',function() {
				//if(!group) { group = {};}
				if (group.rules === undefined) {
					group.rules = [];
				}
				for (i = 0; i < that.p.columns.length; i++) {
				// but show only serchable and serchhidden = true fields
					var searchable = (that.p.columns[i].search === undefined) ?  true: that.p.columns[i].search,
					hidden = (that.p.columns[i].hidden === true),
					ignoreHiding = (that.p.columns[i].searchoptions.searchhidden === true);
					if ((ignoreHiding && searchable) || (searchable && !hidden)) {
						cm = that.p.columns[i];
						break;
					}
				}
				if( !cm ) {
					return false;
				}
				var opr;
				if( cm.searchoptions.sopt ) {opr = cm.searchoptions.sopt;}
				else if(that.p.sopt) { opr= that.p.sopt; }
				else if  ( $.inArray(cm.searchtype, that.p.strarr) !== -1 ) {opr = that.p.stropts;}
				else {opr = that.p.numopts;}

				group.rules.push({
					field: cm.name,
					op: opr[0],
					data: ""
				}); // adding a new rule

				that.reDraw(); // the html has changed, force reDraw
				// for the moment no change have been made to the rule, so
				// this will not trigger onchange event
				return false;
			});
			th.append(inputAddRule);
			}

			// button for delete the group
			if (parentgroup !== null) { // ignore the first group
				var inputDeleteGroup = $("<input type='button' value='-' title='"+that.p.delgroup+"' class='delete-group " + common.button + "'/ name='delgroup'>");
				th.append(inputDeleteGroup);
				inputDeleteGroup.on('click',function() {
				// remove group from parent
					for (i = 0; i < parentgroup.groups.length; i++) {
						if (parentgroup.groups[i] === group) {
							parentgroup.groups.splice(i, 1);
							break;
						}
					}

					that.reDraw(); // the html has changed, force reDraw

					that.onchange(); // signals that the filter has changed
					return false;
				});
			}

			// append subgroup rows
			if (group.groups !== undefined) {
				for (i = 0; i < group.groups.length; i++) {
					var trHolderForSubgroup = $("<tr></tr>");
					table.append(trHolderForSubgroup);

					var tdFirstHolderForSubgroup = $("<td class='first'></td>");
					trHolderForSubgroup.append(tdFirstHolderForSubgroup);

					var tdMainHolderForSubgroup = $("<td colspan='4'></td>");
					tdMainHolderForSubgroup.append(this.createTableForGroup(group.groups[i], group));
					trHolderForSubgroup.append(tdMainHolderForSubgroup);
				}
			}
			if(group.groupOp === undefined) {
				group.groupOp = that.p.groupOps[0].op;
			}

			// append rules rows
			var suni = that.p.ruleButtons && that.p.uniqueSearchFields, ii;
			if( suni ) {
				for ( ii = 0; ii < that.p.columns.length; ii++) {
					if(that.p.columns[ii].inlist) {
						that.p.columns[ii].search = true;
					}
				}
			}
			if (group.rules !== undefined) {
				for (i = 0; i < group.rules.length; i++) {
					table.append(
                       this.createTableRowForRule(group.rules[i], group)
					);
					if( suni ) {
						var field = group.rules[i].field;
						for ( ii = 0; ii < that.p.columns.length; ii++) {
							if(field === that.p.columns[ii].name) {
								that.p.columns[ii].search = false;
								break;
							}
						}
					}
				}
			}
			return table;
		};
		/*
		 * Create the rule data for the filter
		 */
		this.createTableRowForRule = function(rule, group ) {
			// save current entity in a variable so that it could
			// be referenced in anonimous method calls

			var that=this, $t = getGrid(), tr = $("<tr></tr>"),
			//document.createElement("tr"),

			// first column used for padding
			//tdFirstHolderForRule = document.createElement("td"),
			i, op, trpar, cm, str="", selected;
			//tdFirstHolderForRule.setAttribute("class", "first");
			tr.append("<td class='first'></td>");


			// create field container
			var ruleFieldTd = $("<td class='columns'></td>");
			tr.append(ruleFieldTd);


			// dropdown for: choosing field
			var ruleFieldSelect = $("<select size='1' name='select_field' class='" + classes.srSelect + "'></select>"), ina, aoprs = [];
			ruleFieldTd.append(ruleFieldSelect);
			ruleFieldSelect.on('change',function() {
				if( that.p.ruleButtons && that.p.uniqueSearchFields ) {
					var prev = parseInt($(this).data('curr'),10),
					curr = this.selectedIndex;
					if(prev >= 0 ) {
						that.p.columns[prev].search = true;
						$(this).data('curr', curr);
						that.p.columns[curr].search = false;
					}
				}

				rule.field = $(ruleFieldSelect).val();

				trpar = $(this).parents("tr").first();
				$(".data",trpar).empty();
				for (i=0;i<that.p.columns.length;i++) {
					if(that.p.columns[i].name ===  rule.field) {
						cm = that.p.columns[i];
						break;
					}
				}
				if(!cm) {return;}
				cm.searchoptions.id = $.jgrid.randId();
				cm.searchoptions.name = rule.field;
				cm.searchoptions.oper = 'filter';

				if(isIE && cm.inputtype === "text") {
					if(!cm.searchoptions.size) {
						cm.searchoptions.size = 10;
					}
				}
				var elm = $.jgrid.createEl.call($t, cm.inputtype,cm.searchoptions, "", true, that.p.ajaxSelectOptions || {}, true);
				$(elm).addClass("input-elm " + (cm.inputtype === 'select' ? classes.srSelect : classes.srInput) );
				//that.createElement(rule, "");

				if( cm.searchoptions.sopt ) {op = cm.searchoptions.sopt;}
				else if(that.p.sopt) { op= that.p.sopt; }
				else if  ($.inArray(cm.searchtype, that.p.strarr) !== -1) {op = that.p.stropts;}
				else {op = that.p.numopts;}
				// operators
				var s ="", so = 0;
				aoprs = [];
				$.each(that.p.ops, function() { aoprs.push(this.oper); });
				for ( i = 0 ; i < op.length; i++) {
					ina = $.inArray(op[i],aoprs);
					if(ina !== -1) {
						if(so===0) {
							rule.op = that.p.ops[ina].oper;
						}
						s += "<option value='"+that.p.ops[ina].oper+"'>"+that.p.ops[ina].text+"</option>";
						so++;
					}
				}
				$(".selectopts",trpar).empty().append( s );
				$(".selectopts",trpar)[0].selectedIndex = 0;
				if( $.jgrid.msie() && $.jgrid.msiever() < 9) {
					var sw = parseInt($("select.selectopts",trpar)[0].offsetWidth, 10) + 1;
					$(".selectopts",trpar).width( sw );
					$(".selectopts",trpar).css("width","auto");
				}
				// data
				$(".data",trpar).append( elm );
				$.jgrid.bindEv.call($t, elm, cm.searchoptions);
				$(".input-elm",trpar).on('change',function( e ) {
					var elem = e.target;
					if( cm.inputtype === 'custom' && $.jgrid.isFunction(cm.searchoptions.custom_value) ) {
						rule.data =  cm.searchoptions.custom_value.call($t, $(".customelement", this), 'get');
					} else {
						rule.data = $(elem).val();
					}
					if(cm.inputtype === 'select' && cm.searchoptions.multiple ) {
						rule.data = rule.data.join(",");
					}
					that.onchange(); // signals that the filter has changed
				});
				setTimeout(function(){ //IE, Opera, Chrome
				rule.data = $(elm).val();
				if(rule.op === 'nu' || rule.op === 'nn' || $.inArray(rule.op, that.p.unaryOperations) >=0 ) {
					$(elm).attr('readonly','true');
					$(elm).attr('disabled','true');
				}
				
				if(cm.inputtype === 'select' && cm.searchoptions.multiple && Array.isArray(rule.data)) {
					rule.data = rule.data.join(",");
				}
				that.onchange();  // signals that the filter has changed
				}, 0);
			});

			// populate drop down with user provided column definitions
			var j=0;
			for (i = 0; i < that.p.columns.length; i++) {
				// but show only serchable and serchhidden = true fields
				var searchable = (that.p.columns[i].search === undefined) ? true: that.p.columns[i].search,
				hidden = (that.p.columns[i].hidden === true),
				ignoreHiding = (that.p.columns[i].searchoptions.searchhidden === true);
				if ((ignoreHiding && searchable) || (searchable && !hidden)) {
					selected = "";
					if(rule.field === that.p.columns[i].name) {
						selected = " selected='selected'";
						j=i;
					}
					str += "<option value='"+that.p.columns[i].name+"'" +selected+">"+that.p.columns[i].label+"</option>";
				}
			}
			ruleFieldSelect.append( str );
			ruleFieldSelect.data('curr', j);


			// create operator container
			var ruleOperatorTd = $("<td class='operators'></td>");
			tr.append(ruleOperatorTd);
			cm = p.columns[j];
			// create it here so it can be referentiated in the onchange event
			//var RD = that.createElement(rule, rule.data);
			cm.searchoptions.id = $.jgrid.randId();
			if(isIE && cm.inputtype === "text") {
				if(!cm.searchoptions.size) {
					cm.searchoptions.size = 10;
				}
			}
			cm.searchoptions.name = rule.field;
			cm.searchoptions.oper = 'filter';
			var ruleDataInput = $.jgrid.createEl.call($t, cm.inputtype,cm.searchoptions, rule.data, true, that.p.ajaxSelectOptions || {}, true);
			if(rule.op === 'nu' || rule.op === 'nn' || $.inArray(rule.op, that.p.unaryOperations) >=0 ) {
				$(ruleDataInput).attr('readonly','true');
				$(ruleDataInput).attr('disabled','true');
			} //retain the state of disabled text fields in case of null ops
			// dropdown for: choosing operator
			var ruleOperatorSelect = $("<select size='1' name='select_oper' class='selectopts " + classes.srSelect + "'></select>");
			ruleOperatorTd.append(ruleOperatorSelect);
			ruleOperatorSelect.on('change',function() {
				rule.op = $(ruleOperatorSelect).val();
				trpar = $(this).parents("tr").first();
				var rd = $(".input-elm",trpar)[0];
				if (rule.op === "nu" || rule.op === "nn" || $.inArray(rule.op, that.p.unaryOperations) >= 0 ) { // disable for operator "is null" and "is not null"
					rule.data = "";
					if(rd.tagName.toUpperCase() !== 'SELECT') { rd.value = ""; }
					rd.setAttribute("readonly", "true");
					rd.setAttribute("disabled", "true");
				} else {
					if(rd.tagName.toUpperCase() === 'SELECT') { rule.data = rd.value; }
					rd.removeAttribute("readonly");
					rd.removeAttribute("disabled");
				}

				that.onchange();  // signals that the filter has changed
			});

			// populate drop down with all available operators
			if( cm.searchoptions.sopt ) {op = cm.searchoptions.sopt;}
			else if(that.p.sopt) { op= that.p.sopt; }
			else if  ($.inArray(cm.searchtype, that.p.strarr) !== -1) {op = that.p.stropts;}
			else {op = that.p.numopts;}
			str="";
			$.each(that.p.ops, function() { aoprs.push(this.oper); });
			for ( i = 0; i < op.length; i++) {
				ina = $.inArray(op[i],aoprs);
				if(ina !== -1) {
					selected = rule.op === that.p.ops[ina].oper ? " selected='selected'" : "";
					str += "<option value='"+that.p.ops[ina].oper+"'"+selected+">"+that.p.ops[ina].text+"</option>";
				}
			}
			ruleOperatorSelect.append( str );
			// create data container
			var ruleDataTd = $("<td class='data'></td>");
			tr.append(ruleDataTd);

			// textbox for: data
			// is created previously
			//ruleDataInput.setAttribute("type", "text");
			ruleDataTd.append(ruleDataInput);
			$.jgrid.bindEv.call($t, ruleDataInput, cm.searchoptions);
			$(ruleDataInput)
			.addClass("input-elm " + (cm.inputtype === 'select' ? classes.srSelect : classes.srInput) )
			.on('change', function() {
				rule.data = cm.inputtype === 'custom' ? cm.searchoptions.custom_value.call($t, $(".customelement", this),'get') : $(this).val();
				that.onchange(); // signals that the filter has changed
			});

			// create action container
			var ruleDeleteTd = $("<td></td>");
			tr.append(ruleDeleteTd);

			// create button for: delete rule
			if(this.p.ruleButtons === true) {
			var ruleDeleteInput = $("<input type='button' value='-' title='"+that.p.delrule+"' class='delete-rule ui-del " + common.button + "'/ name='delrule'>");
			ruleDeleteTd.append(ruleDeleteInput);
			//$(ruleDeleteInput).html("").height(20).width(30).button({icons: {  primary: "ui-icon-minus", text:false}});
			ruleDeleteInput.on('click',function() {
				// remove rule from group
				for (i = 0; i < group.rules.length; i++) {
					if (group.rules[i] === rule) {
						group.rules.splice(i, 1);
						break;
					}
				}

				that.reDraw(); // the html has changed, force reDraw

				that.onchange(); // signals that the filter has changed
				return false;
			});
			}
			return tr;
		};

		this.getStringForGroup = function(group) {
			var s = "(", index;
			if (group.groups !== undefined) {
				for (index = 0; index < group.groups.length; index++) {
					if (s.length > 1) {
						s += " " + group.groupOp + " ";
					}
					try {
						s += this.getStringForGroup(group.groups[index]);
					} catch (eg) {alert(eg);}
				}
			}

			if (group.rules !== undefined) {
				try{
					for (index = 0; index < group.rules.length; index++) {
						if (s.length > 1) {
							s += " " + group.groupOp + " ";
						}
						s += this.getStringForRule(group.rules[index]);
					}
				} catch (e) {alert(e);}
			}

			s += ")";

			if (s === "()") {
				return ""; // ignore groups that don't have rules
			}
			return s;
		};
		this.getStringForRule = function(rule) {
			var opUF = "",opC="", i, cm, ret, val,
			numtypes = ['int', 'integer', 'float', 'number', 'currency']; // jqGrid
			for (i = 0; i < this.p.ops.length; i++) {
				if (this.p.ops[i].oper === rule.op) {
					opUF = this.p.operands.hasOwnProperty(rule.op) ? this.p.operands[rule.op] : "";
					opC = this.p.ops[i].oper;
					break;
				}
			}
			for (i=0; i<this.p.columns.length; i++) {
				if(this.p.columns[i].name === rule.field) {
					cm = this.p.columns[i];
					break;
				}
			}
			if (cm === undefined) { return ""; }
			val = this.p.autoencode ? $.jgrid.htmlEncode(rule.data) : rule.data;
			if(opC === 'bw' || opC === 'bn') { val = val+"%"; }
			if(opC === 'ew' || opC === 'en') { val = "%"+val; }
			if(opC === 'cn' || opC === 'nc') { val = "%"+val+"%"; }
			if(opC === 'in' || opC === 'ni') { val = " ("+val+")"; }
			if(p.errorcheck) { checkData(rule.data, cm); }
			if($.inArray(cm.searchtype, numtypes) !== -1 || opC === 'nn' || opC === 'nu' || $.inArray(rule.op, this.p.unaryOperations) >= 0 ) { 
				ret = rule.field + " " + opUF + " " + val; 
			} else { 
				ret = rule.field + " " + opUF + " \"" + val + "\""; 
			}
			return ret;
		};
		this.resetFilter = function () {
			this.p.filter = $.extend(true,{},this.p.initFilter);
			this.reDraw();
			this.onchange();
		};
		this.hideError = function() {
			$("th."+common.error, this).html("");
			$("tr.error", this).hide();
		};
		this.showError = function() {
			$("th."+common.error, this).html( $.jgrid.stripScript( this.p.errmsg ));
			$("tr.error", this).show();
		};
		this.toUserFriendlyString = function() {
			return this.getStringForGroup(p.filter);
		};
		this.toString = function() {
			// this will obtain a string that can be used to match an item.
			var that = this;
			function getStringRule(rule) {
				if(that.p.errorcheck) {
					var i, cm;
					for (i=0; i<that.p.columns.length; i++) {
						if(that.p.columns[i].name === rule.field) {
							cm = that.p.columns[i];
							break;
						}
					}
					if(cm) {checkData(rule.data, cm);}
				}
				return rule.op + "(item." + rule.field + ",'" + rule.data + "')";
			}

			function getStringForGroup(group) {
				var s = "(", index;

				if (group.groups !== undefined) {
					for (index = 0; index < group.groups.length; index++) {
						if (s.length > 1) {
							if (group.groupOp === "OR") {
								s += " || ";
							}
							else {
								s += " && ";
							}
						}
						s += getStringForGroup(group.groups[index]);
					}
				}

				if (group.rules !== undefined) {
					for (index = 0; index < group.rules.length; index++) {
						if (s.length > 1) {
							if (group.groupOp === "OR") {
								s += " || ";
							}
							else  {
								s += " && ";
							}
						}
						s += getStringRule(group.rules[index]);
					}
				}

				s += ")";

				if (s === "()") {
					return ""; // ignore groups that don't have rules
				}
				return s;
			}

			return getStringForGroup(this.p.filter);
		};

		// Here we init the filter
		this.reDraw();

		if(this.p.showQuery) {
			this.onchange();
		}
		// mark is as created so that it will not be created twice on this element
		this.filter = true;
	});
};
$.extend($.fn.jqFilter,{
	/*
	 * Return SQL like string. Can be used directly
	 */
	toSQLString : function()
	{
		var s ="";
		this.each(function(){
			s = this.toUserFriendlyString();
		});
		return s;
	},
	/*
	 * Return filter data as object.
	 */
	filterData : function()
	{
		var s;
		this.each(function(){
			s = this.p.filter;
		});
		return s;

	},
	getParameter : function (param) {
		var ret = null;
		if(param !== undefined) {
			this.each(function(i,n){
				if (n.p.hasOwnProperty(param) ) {
					ret = n.p[param];
				}
			});
		}
		return ret ? ret : this[0].p;	},
	resetFilter: function() {
		return this.each(function(){
			this.resetFilter();
		});
	},
	addFilter: function (pfilter) {
		if (typeof pfilter === "string") {
			pfilter = $.jgrid.parse( pfilter );
		}
		this.each(function(){
			this.p.filter = pfilter;
			this.reDraw();
			this.onchange();
		});
	}

});
$.extend($.jgrid,{
	filterRefactor : function ( p  )  {
		/*ruleGroup : {}, ssfield:[], splitSelect:",", groupOpSelect:"OR"*/
		var filters={} /*?*/, rules, k, rule, ssdata, group, rf;
		try {
			filters = typeof p.ruleGroup === "string" ? $.jgrid.parse(p.ruleGroup) : p.ruleGroup;
			if(filters.rules && filters.rules.length) {
				rules = filters.rules;
				for(k=0; k < rules.length; k++) {
					rule = rules[k];
					rf = rule.field;
					if($.inArray(rf, p.ssfield) > -1 ) {
						ssdata = rule.data.split(p.splitSelect);
						if(ssdata.length > 1) {
							if(filters.groups === undefined) {
								filters.groups = [];
							}
							group = { groupOp: p.groupOpSelect, groups: [], rules: [] };
							filters.groups.push(group);
							$.each(ssdata,function(l) {
								if (ssdata[l]) {
									group.rules.push({ data: ssdata[l],	op: rule.op, field: rule.field});
								}
							});
							rules.splice(k, 1);
							k--;
						}
					}
				}
			}
		} catch(e) {}
		return filters;
	}
});
$.jgrid.extend({
	filterToolbar : function(p){
		var regional =  $.jgrid.getRegional(this[0], 'search');
		p = $.extend({
			autosearch: true,
			autosearchDelay: 500,
			searchOnEnter : true,
			beforeSearch: null,
			afterSearch: null,
			beforeClear: null,
			afterClear: null,
			onClearSearchValue : null,
			url : '',
			stringResult: false,
			groupOp: 'AND',
			defaultSearch : "bw",
			searchOperators : false,
			resetIcon : "x",
			splitSelect : ",",
			groupOpSelect : "OR",
			errorcheck : true,
			operands : { "eq" :"==", "ne":"!","lt":"<","le":"<=","gt":">","ge":">=","bw":"^","bn":"!^","in":"=","ni":"!=","ew":"|","en":"!@","cn":"~","nc":"!~","nu":"#","nn":"!#", "bt":"..."},
			disabledKeys :  [9, 16, 17,18,19, 20, 33, 34, 35,36,37,38,39,40,30, 45,112,113,114,115,116,117,118,119,120,121,122,123, 144, 145]
		}, regional , p  || {});
		return this.each(function(){
			var $t = this, unaryOpers=[];
			if($t.p.filterToolbar) { return; }
			if(!$($t).data('filterToolbar')) {
				$($t).data('filterToolbar', p);
			}
			if($t.p.force_regional) {
				p = $.extend(p, regional);
			}
			if ($t.p.customFilterDef !== undefined) {
				for(var uskey in $t.p.customFilterDef) {
					if($t.p.customFilterDef.hasOwnProperty(uskey)  && !p.operands.hasOwnProperty(uskey) ) {
						p.odata.push({ oper: uskey, text: $t.p.customFilterDef[uskey].text} );
						p.operands[uskey] = $t.p.customFilterDef[uskey].operand;
						if($t.p.customFilterDef[uskey].unary === true) {
							unaryOpers.push(uskey);
						}
					}
				}
			}
			var classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].filter,
			common = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].common,
			base = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].base,

			triggerToolbar = function( currentPage) {
				if(typeof(currentPage) === "undefined"){
					currentPage = 1;
				}
				var sdata={}, j=0, v, nm, sopt={},so, ms = false, ssfield = [], msfield = [], afrcol={}, arcustom=[],
					bbt =false, sop, ret=[true,"",""], err=false;
				$.each($t.p.colModel,function(){
					var $elem, fcol = false;
					nm = this.index || this.name;
					sop = this.searchoptions || {};
						$elem = $("#gs_"+ $t.p.idPrefix + $.jgrid.jqID(this.name), $t.grid.hDiv);
					//var $elem = $("#gs_"+ $t.p.idPrefix + $.jgrid.jqID(this.name),  ?  $t.grid.fhDiv : $t.grid.hDiv);
					// in case frozen col is outside the rule list
					if($elem[0] === undefined) {
						$elem = $("#gs_"+ $t.p.idPrefix + $.jgrid.jqID(this.name), $t.grid.hDiv);
					}
					if(p.searchOperators &&  sop.searchOperMenu) {
						so = $elem.parents("table.ui-search-table").find("td.ui-search-oper").children("a").attr("soper") || p.defaultSearch;
					} else {
						so  = (sop.sopt) ? sop.sopt[0] : this.stype==='select' ?  'eq' : p.defaultSearch;
					}
					if( this.stype === "custom" && $.jgrid.isFunction(sop.custom_value) && $elem.length > 0 ) {
						v = sop.custom_value.call($t, $elem, "get");
						arcustom.push(nm);
					} else {
						v = $elem.val();
					}
					// detect multiselect
					if(this.stype === 'select' && sop.multiple && Array.isArray(v)) {
						if(v.length > 0) {
							ms = true;
							ssfield.push(nm);
							v= v.length === 1 ? v[0] : v;
						} else {
							v = "";
						}
					} else if( so !== "bt" && this.stype === 'text' && sop.splitSearchWord === true) {
						msfield.push(nm);
					}
					if(this.searchrules && p.errorcheck) {
						if($.jgrid.isFunction( this.searchrules)) {
							ret = this.searchrules.call($t, v, this);
						} else if($.jgrid && $.jgrid.checkValues) {
							ret = $.jgrid.checkValues.call($t, v, -1, this.searchrules, this.label || this.name);
						}
						if(ret && ret.length && ret[0] === false ) {
							if(this.searchrules.hasOwnProperty('validationError') ){
								err = this.searchrules.validationError;
							}
							return false;
						}
					}
					if(so==="bt") {
						bbt = true;
					}
					if( !$.jgrid.isServiceCol( nm ) /*(nm !== 'cb' && nm!== 'rn' && nm !== 'subgrid' && nm !== 'sc')*/ ) {
						afrcol[nm] = v;
					}
					if(v || so==="nu" || so==="nn" || $.inArray(so, unaryOpers) >=0) {
						sdata[nm] = v;
						sopt[nm] = so;
						j++;
					} else {
						try {
							delete $t.p.postData[nm];
						} catch (z) {}
					}
				});
				if(ret[0] === false ) {
					if($.jgrid.isFunction(err)) {
						err.call($t, ret[1]);
					} else {
						var errors = $.jgrid.getRegional($t, 'errors');
						$.jgrid.info_dialog(errors.errcap, ret[1], '', {styleUI : $t.p.styleUI });
					}
					return;
				}
				var sd =  j>0 ? true : false;
				if(p.stringResult === true || $t.p.datatype === "local" || p.searchOperators === true)
				{
					var ruleGroup = "{\"groupOp\":\"" + p.groupOp + "\",\"rules\":[";
					var gi=0;
					$.each(sdata,function(i,n){
						if (gi > 0) {ruleGroup += ",";}
						ruleGroup += "{\"field\":\"" + i + "\",";
						ruleGroup += "\"op\":\"" + sopt[i] + "\",";
						n+="";
						ruleGroup += "\"data\":\"" + n.replace(/\\/g,'\\\\').replace(/\"/g,'\\"') + "\"}";
						gi++;
					});
					ruleGroup += "]}";
					// multiselect
					var filters, rules, k, rule, ssdata, group;
					if(ms) {
						filters = $.jgrid.filterRefactor({
							ruleGroup : ruleGroup,
							ssfield : ssfield,
							splitSelect : p.splitSelect,
							groupOpSelect : p.groupOpSelect
						});
						//ruleGroup = JSON.stringify( filters );
					}
					if(bbt) {
						if(!$.isPlainObject(filters)) {
							filters = $.jgrid.parse(ruleGroup);
						}
						if(filters.rules && filters.rules.length) {
							rules = filters.rules;
							for(k=0;k < rules.length; k++) {
								rule = rules[k];
								if(rule.op === "bt") {
									ssdata = rule.data.split("...");
									if(ssdata.length > 1) {
										if(filters.groups === undefined) {
											filters.groups = [];
										}
										group = { groupOp: 'AND', groups: [], rules: [] };
										filters.groups.push(group);
										$.each(ssdata,function(l) {
											var btop = l === 0 ? 'ge' : 'le';
											if(ssdata[l]) {
												group.rules.push({ data: ssdata[l], op: btop, field: rule.field});
											}
										});
										rules.splice(k, 1);
										k--;
									}
								}
							}
						}
					}
					if(  msfield.length ) {
						filters = $.jgrid.filterRefactor({
							ruleGroup : ruleGroup,
							ssfield : msfield,
							splitSelect : sop.splitSearchSeparator || ";",
							groupOpSelect : "OR"
						});
					}
					if(bbt || ms || msfield.length) {
						ruleGroup = JSON.stringify( filters );
					}
					if($t.p.mergeSearch === true && $t.p.searchModules.hasOwnProperty('filterToolbar') && $t.p.searchModules.filterToolbar !== false ) {
						if(gi > 0) {
							$t.p.searchModules.filterToolbar = ruleGroup;
						} else {
							$t.p.searchModules.filterToolbar = null;
						}
						sd = true;
						$.extend($t.p.postData,{filters: $.jgrid.splitSearch($t.p.searchModules)});
					} else {
						$.extend($t.p.postData,{filters:ruleGroup});
					}
					
					$.each(['searchField', 'searchString', 'searchOper'], function(i, n){
						if($t.p.postData.hasOwnProperty(n)) { delete $t.p.postData[n];}
					});
				} else {
					$.extend($t.p.postData,sdata);
				}
				var saveurl;
				if(p.url) {
					saveurl = $t.p.url;
					$($t).jqGrid("setGridParam", { url: p.url });
				}
				var ae = document.activeElement;
				var bsr = $($t).triggerHandler("jqGridToolbarBeforeSearch") === 'stop' ? true : false;
				if(!bsr && $.jgrid.isFunction(p.beforeSearch)){bsr = p.beforeSearch.call($t);}
				if(!bsr) { $($t).jqGrid("setGridParam",{search:sd}).trigger("reloadGrid",[ { page: currentPage } ] ); }
				if(saveurl) {$($t).jqGrid("setGridParam",{url:saveurl});}
				$($t).triggerHandler("jqGridToolbarAfterSearch");
				if($.jgrid.isFunction(p.afterSearch)){p.afterSearch.call($t);}
			},
			clearToolbar = function(trigger){
				var sdata={}, so={}, j=0, nm, $elem, v;
				trigger = (typeof trigger !== 'boolean') ? true : trigger;
				$.each($t.p.colModel,function(){
					$elem = $("#gs_"+$t.p.idPrefix+$.jgrid.jqID(this.name), $t.grid.hDiv);
					if(this.searchoptions && this.searchoptions.defaultValue !== undefined) {
						v = this.searchoptions.defaultValue;
					} else {
						v = undefined;
					}
					nm = this.index || this.name;
					so[nm] = this.searchoptions && this.searchoptions.sopt ? this.searchoptions.sopt[0] : p.defaultSearch || 'eq';
					switch (this.stype) {
						case 'select' :
							$elem.find("option").each(function (i){
								if(i===0) { this.selected = true; }
								if ($(this).val() === v) {
									this.selected = true;
									return false;
								}
							});
							if ( v !== undefined ) {
								// post the key and not the text
								sdata[nm] = v;
								j++;
							} else {
								try {
									delete $t.p.postData[nm];
								} catch(e) {}
							}
							break;
						case 'text':
							$elem.val(v || "");
							if(v !== undefined) {
								sdata[nm] = v;
								j++;
							} else {
								try {
									delete $t.p.postData[nm];
								} catch (y){}
							}
							break;
						case 'custom':
							if ($.jgrid.isFunction(this.searchoptions.custom_value) && $elem.length > 0 ) {
								this.searchoptions.custom_value.call($t, $elem, "set", v || "");
							}
							break;
					}
				});
				var sd =  j>0 ? true : false;
				$t.p.resetsearch =  true;
				if(p.stringResult === true || $t.p.datatype === "local") {
					var ruleGroup = "{\"groupOp\":\"" + p.groupOp + "\",\"rules\":[";
					var gi=0;
					$.each(sdata,function(i,n){
						if (gi > 0) {ruleGroup += ",";}
						ruleGroup += "{\"field\":\"" + i + "\",";
						ruleGroup += "\"op\":\"" + so[i] + "\",";
						n+="";
						ruleGroup += "\"data\":\"" + n.replace(/\\/g,'\\\\').replace(/\"/g,'\\"') + "\"}";
						gi++;
						if(p.searchOperators) {
							$elem = $("#gs_"+$t.p.idPrefix+$.jgrid.jqID(i), $t.grid.hDiv);
							$elem.parents("table.ui-search-table").find("td.ui-search-oper").children("a").attr("soper", so[i]).html(p.operands[so[i]]);
						}
					});
					ruleGroup += "]}";
					if($t.p.mergeSearch === true && $t.p.searchModules.hasOwnProperty('filterToolbar') && $t.p.searchModules.filterToolbar !== false ) {
						if(gi > 0) {
							$t.p.searchModules.filterToolbar = ruleGroup;
						} else {
							$t.p.searchModules.filterToolbar = null;
						}
						sd = true;
						$.extend($t.p.postData,{filters: $.jgrid.splitSearch($t.p.searchModules)});
					} else {
						$.extend($t.p.postData,{filters:ruleGroup});
					}
					
					$.each(['searchField', 'searchString', 'searchOper'], function(i, n){
						if($t.p.postData.hasOwnProperty(n)) { delete $t.p.postData[n];}
					});
				} else {
					$.extend($t.p.postData,sdata);
				}
				var saveurl;
				if(p.url) {
					saveurl = $t.p.url;
					$($t).jqGrid("setGridParam",{url:p.url});
				}
				var bcv = $($t).triggerHandler("jqGridToolbarBeforeClear") === 'stop' ? true : false;
				if(!bcv && $.jgrid.isFunction(p.beforeClear)){bcv = p.beforeClear.call($t);}
				if(!bcv) {
					if(trigger) {
						$($t).jqGrid("setGridParam",{search:sd}).trigger("reloadGrid",[{page:1}]);
					}
				}
				if(saveurl) {$($t).jqGrid("setGridParam",{url:saveurl});}
				$($t).triggerHandler("jqGridToolbarAfterClear");
				if($.jgrid.isFunction(p.afterClear)){p.afterClear();}
			},
			toggleToolbar = function(){
				var trow = $("tr.ui-search-toolbar",$t.grid.hDiv);
				if(trow.css("display") === 'none') {
					trow.show();
				} else {
					trow.hide();
				}
			},
			buildRuleMenu = function( elem, left, top ){
				$("#sopt_menu").remove();

				left=parseInt(left,10);
				top=parseInt(top,10) + 18;

				var fs =  $('.ui-jqgrid').css('font-size') || '11px',
					str = '<ul id="sopt_menu" class="ui-search-menu modal-content" role="menu" tabindex="0" style="font-size:'+fs+';left:'+left+'px;top:'+top+'px;">',
					selected = $(elem).attr("soper"), selclass,
					aoprs = [], ina,
					i, nm = $(elem).attr("colname");
				i = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', nm, true);
				if( i === -1 ) {
					return;
				}
				var cm = $t.p.colModel[i], options = $.extend({}, cm.searchoptions);
				if(!options.sopt) {
					options.sopt = [];
					options.sopt[0]= cm.stype==='select' ?  'eq' : p.defaultSearch;
				}
				$.each(p.odata, function() { aoprs.push(this.oper); });
				for ( i = 0 ; i < options.sopt.length; i++) {
					ina = $.inArray(options.sopt[i],aoprs);
					if(ina !== -1) {
						selclass = selected === p.odata[ina].oper ? common.highlight : "";
						str += '<li class="ui-menu-item '+selclass+'" role="presentation"><a class="'+ common.cornerall+' g-menu-item" tabindex="0" role="menuitem" value="'+p.odata[ina].oper+'" oper="'+p.operands[p.odata[ina].oper]+'"><table class="ui-common-table"><tr><td class="opersign">'+p.operands[p.odata[ina].oper]+'</td><td>'+ p.odata[ina].text+'</td></tr></table></a></li>';
					}
				}
				str += "</ul>";
				$('body').append(str);
				$("#sopt_menu").addClass("ui-menu " + classes.menu_widget);
				$("#sopt_menu > li > a").hover(
					function(){ $(this).addClass(common.hover); },
					function(){ $(this).removeClass(common.hover); }
				).click(function() {
					var v = $(this).attr("value"),
					oper = $(this).attr("oper");
					$($t).triggerHandler("jqGridToolbarSelectOper", [v, oper, elem]);
					$("#sopt_menu").hide();
					$(elem).text(oper).attr("soper",v);
					if(p.autosearch===true){
						var inpelm = $(elem).parent().next().children()[0];
						if( $(inpelm).val() || v==="nu" || v ==="nn" || $.inArray(v, unaryOpers) >=0) {
							triggerToolbar();
						}
					}
				});
			};
			// create the row
			var tr = $("<tr class='ui-search-toolbar' role='row'></tr>"),
			timeoutHnd, rules, filterobj;
			if( p.restoreFromFilters ) {
				if( $t.p.mergeSearch === true && $t.p.searchModules.hasOwnProperty('filterToolbar') && $t.p.searchModules.filterToolbar !== false) {
					filterobj = $t.p.searchModules.filterToolbar;
				} else {
					filterobj = $t.p.postData.filters;
				}
				if(filterobj) {
					if( typeof filterobj === "string") {
						filterobj = $.jgrid.parse( filterobj );
					}
					rules = (filterobj.rules && filterobj.rules.length) ? filterobj.rules : false;
				}
			}
			//p.disabledKeys = new Set(p.disabledKeys); // experimental 
			var dKeys = new Set(p.disabledKeys);
			if(dKeys.size !== p.disabledKeys.length) { // ie11
				for(var jj=0; jj< p.disabledKeys.length; jj++) {
					dKeys = new Set();
					dKeys.add(p.disabledKeys[jj]);
				}
			}
			var filterLabel;
			if (regional.filterFor) {
				filterLabel = regional.filterFor;
			}
			if($t.p.colSpanHeader.length) {
				$($t).jqGrid('destroyColSpanHeader', false);
			}
			
			$.each($t.p.colModel,function(ci){
				var cm=this, soptions, select="", sot="=", so, i, st, csv, df, elem, restores,
				th = $("<th role='columnheader' class='" + base.headerBox+" ui-th-"+$t.p.direction+" "+(cm.labelClasses || "")+"' id='gsh_" + $t.p.id + "_" + cm.name + "'></th>"),
				thd = $("<div><span aria-label=\"empty\" style=\"display: none;\">empty</span></div>"),
				stbl = $("<table class='ui-search-table' cellspacing='0'><tr><td class='ui-search-oper' headers=''></td><td class='ui-search-input' headers=''></td><td class='ui-search-clear' headers=''></td></tr></table>");
				if(this.hidden===true) { $(th).css("display","none");}
				this.search = this.search === false ? false : true;
				if(this.stype === undefined) {this.stype='text';}
				this.searchoptions = this.searchoptions || {};
				if(this.searchoptions.searchOperMenu === undefined) {
					this.searchoptions.searchOperMenu = true;
				}
				var title;
				if(filterLabel !== undefined){
					title = filterLabel + " " + $t.p.colNames[ci];
				} else {
					title = $t.p.colNames[ci];
				}
				soptions = $.extend({},this.searchoptions , {name:cm.index || cm.name, id: "gs_"+$t.p.idPrefix+cm.name, oper:'search', title:title});
				if(this.search){
					if( p.restoreFromFilters && rules) {
						restores = false;
						for( var is = 0; is < rules.length; is++) {
							if(rules[is].field ) {
								var snm = cm.index || cm.name;
								if( snm === rules[is].field) {
									restores = rules[is];
									break;
								}
							}
						}
					}
					if(p.searchOperators) {
						so  = (soptions.sopt) ? soptions.sopt[0] : cm.stype==='select' ?  'eq' : p.defaultSearch;
						// overwrite  search operators
						if( p.restoreFromFilters && restores) {
							so = restores.op;
						}
						for(i = 0;i<p.odata.length;i++) {
							if(p.odata[i].oper === so) {
								sot = p.operands[so] || "";
								break;
							}
						}
						st = soptions.searchtitle != null ? soptions.searchtitle : p.operandTitle;
						select = this.searchoptions.searchOperMenu ? "<a title='"+st+"' soper='"+so+"' class='soptclass' colname='"+this.name+"'>"+sot+"</a>" : "";
					}
					$("td",stbl).eq( 0 ).attr("columname", cm.name).append(select);
					if(soptions.clearSearch === undefined) {
						soptions.clearSearch = true;
					}
					if(soptions.clearSearch) {
						csv = p.resetTitle || 'Clear Search Value';
						$("td",stbl).eq( 2 ).append("<a title='"+csv+"' tabindex='0' style='padding-right: 0.3em;padding-left: 0.3em;' class='clearsearchclass'>"+p.resetIcon+"</a>");
					} else {
						$("td", stbl).eq( 2 ).hide();
					}
					if(this.surl) {
						soptions.dataUrl = this.surl;
					}
					df="";
					if(soptions.defaultValue ) {
						df = $.jgrid.isFunction(soptions.defaultValue) ? soptions.defaultValue.call($t) : soptions.defaultValue;
					}
					//overwrite default value if restore from filters
					if( p.restoreFromFilters && restores) {
						df = restores.data;
					}
					elem = $.jgrid.createEl.call($t, this.stype, soptions , df, false, $.extend({},$.jgrid.ajaxOptions, $t.p.ajaxSelectOptions || {}));
					if( this.stype !== 'custom') {
						if(this.stype==='select') {
							$(elem).addClass( classes.srSelect );
						} else  {
							$(elem).addClass( classes.srInput );
						}
					}
					$("td",stbl).eq( 1 ).append(elem);
					$(thd).append(stbl);
					if(soptions.dataEvents == null ) {
						soptions.dataEvents = [];
					}
					switch (this.stype)
					{
					case "select":
						if(p.autosearch === true) {
							soptions.dataEvents.push({
								type : "change",
								fn : function() {
									triggerToolbar();
									return false;
								}
							});
						}
						break;
					case "text":
					case "custom":
						if(p.autosearch===true){
							if(p.searchOnEnter) {
								soptions.dataEvents.push({
									type: "keypress",
									fn : function(e) {
										var key = e.charCode || e.keyCode || 0;
										if(key === 13){
											e.preventDefault();
											triggerToolbar();
											return false;
										}
										return this;
									}
								});
							} else {
								soptions.dataEvents.push({
									type: "keydown",
									fn : function(e) {
										var key = e.which;
										if( dKeys.has(key)) {
											// do nothing
										} else if( key === 13 ) {
											e.preventDefault();
											return false;
										} else {
											if(timeoutHnd) { clearTimeout(timeoutHnd); }
											timeoutHnd = setTimeout(function(){triggerToolbar();}, p.autosearchDelay);
										}
									}
								});
							}
						}
						break;
					}

					$.jgrid.bindEv.call($t, elem , soptions);
				}
				$(th).append(thd);
				$(tr).append(th);
				if(!p.searchOperators || select === "") {
					$("td",stbl).eq( 0 ).hide();
				}
			});
			$("table thead",$t.grid.hDiv).append(tr);
			if(p.searchOperators) {
				$(".soptclass",tr).click(function(e){
					var offset = $(this).offset(),
					left = ( offset.left ),
					top = ( offset.top);
					buildRuleMenu(this, left, top );
					e.stopPropagation();
				});
				$("body").on('click', function(e){
					if(e.target.className !== "soptclass") {
						$("#sopt_menu").remove();
					}
				});
			}
			$(".clearsearchclass",tr).click(function() {
				var ptr = $(this).parents("tr").first(),
					colname = $("td.ui-search-oper", ptr).attr('columname'), 
					coli=0,
					soper = $("td.ui-search-oper a", ptr).attr('soper'), 
					cm,
					vv;
				coli = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', colname, true);
				if(coli === -1 ) {
					return false;
				}
				cm = $t.p.colModel[coli];
				var sval  = $.extend( {}, cm.searchoptions || {} ),
					dval = sval.defaultValue ? sval.defaultValue : "",
					elem;
				if(cm.stype === "select") {
					elem = $("td.ui-search-input select", ptr);
					if(dval) {
						elem.val( dval );
					} else {
						elem[0].selectedIndex = 0;
					}
				} else {
					elem = $("td.ui-search-input input", ptr);
					elem.val( dval );
				}
				$($t).triggerHandler("jqGridToolbarClearVal",[elem[0], coli, sval, dval]);
				if($.jgrid.isFunction(p.onClearSearchValue)) {
					p.onClearSearchValue.call($t, elem[0], coli, sval, dval);
				}
				var operText = "";
				if(soper==="nu" || soper==="nn" || $.inArray(soper, unaryOpers) >=0) {
					vv = sval.sopt ?
							sval.sopt[0] :
							cm.stype === "select" ?
								"eq" : 
								p.defaultSearch;
						operText = $t.p.customFilterDef != null && $t.p.customFilterDef[vv] != null ? 
						$t.p.customFilterDef[vv].operand :
						p.operands[vv] || "";
						if(vv === soper) {
							$("td.ui-search-oper a", ptr).attr('soper', 'dummy').text(operText);
						} else {
							$("td.ui-search-oper a", ptr).attr('soper',vv).text(operText);
						}
						
				}
				
				// ToDo custom search type
				if(p.autosearch===true){
					triggerToolbar();
					if(vv === soper) { 
						$("td.ui-search-oper a", ptr).attr('soper',vv).text(operText);
					}
				}
			});
			$(".clearsearchclass",tr).keydown(function(event) {
				if (event.keyCode === 13) {
					event.preventDefault();
					$(".clearsearchclass", tr).trigger("click");
				}
			});
			$($t.grid.hDiv).on("scroll", function(e){
				if(!$t.grid.hScroll) {
					$t.grid.bScroll = true;
				$t.grid.bDiv.scrollLeft = $t.grid.hDiv.scrollLeft;
					if($t.p.footerrow) {
						$t.grid.sDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
					}
					if($t.p.headerrow) {
						$t.grid.hrDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
					}
				}
				$t.grid.hScroll = false;
			});
			if($t.p.colSpanHeader.length) {
				setTimeout(function() { $($t).jqGrid('setColSpanHeader');},0);
			}			
			this.p.filterToolbar = true;
			this.triggerToolbar = triggerToolbar;
			this.clearToolbar = clearToolbar;
			this.toggleToolbar = toggleToolbar;
		});
	},
	destroyFilterToolbar: function () {
		return this.each(function () {
			if (!this.p.filterToolbar) {
				return;
			}
			this.triggerToolbar = null;
			this.clearToolbar = null;
			this.toggleToolbar = null;
			this.p.filterToolbar = false;
			$(this.grid.hDiv).find("table thead tr.ui-search-toolbar").remove();
		});
	},
	refreshFilterToolbar : function ( p ) {
		p = $.extend(true, {
			filters : "",
			onClearVal : null,
			onSetVal : null
		}, p || {});
		return this.each(function () {
			var $t = this, cm = $t.p.colModel, i, l = $t.p.colModel.length, params,
			searchitem, filters, rules, rule, ssfield =[], ia;
			// clear the values on toolbar.
			// do not call clearToolbar
			if(!$t.p.filterToolbar) {
				return;
			}
			params = $($t).data('filterToolbar');
			for (i = 0; i < l; i++) {
				ssfield.push(cm[i].index || cm[i].name);
				searchitem = $("#gs_" +$t.p.idPrefix+ $.jgrid.jqID(cm[i].name));
				switch (cm[i].stype) {
					case 'select' :
					case 'text' :
						searchitem.val("");
						break;
				}
				if($.jgrid.isFunction(p.onClearVal)) {
					p.onClearVal.call($t, searchitem, cm[i].name);
				}
			}
			function setrules (filter) {
				if(filter && filter.rules) { // condition to exit
					rules = filter.rules;
					l = rules.length;
					for (i = 0; i < l; i++) {
						rule = rules[i];
						ia = $.inArray(rule.field, ssfield);
						if( ia !== -1) {
							searchitem = $("#gs_" + $t.p.idPrefix + $.jgrid.jqID(cm[ia].name));
							// problem for between operator
							if ( searchitem.length > 0) {
								if (cm[ia].stype === "select") {
									searchitem.find("option[value='" + $.jgrid.jqID(rule.data) + "']").prop('selected', true);
								} else if (cm[ia].stype === "text") {
									searchitem.val(rule.data);
								}
								if($.jgrid.isFunction(p.onSetVal)) {
									p.onSetVal.call($t, searchitem, cm[ia].name);
								}
								if( params && params.searchOperators) {
									var fsi = searchitem.parent().prev();
									if( fsi.hasClass("ui-search-oper") ) {
										$(".soptclass", fsi ).attr("soper", rule.op);
										if(params.operands.hasOwnProperty(rule.op)) {
											$(".soptclass", fsi ).html( $.jgrid.stripScript( params.operands[rule.op] ) );
										}
									}
								}
							}
					    }
					}
					if(filter.groups) {
						for(var k=0;k<filter.groups.length;k++) {
							setrules(filter.groups[k]);
						}
					}
				}
			}
			if (typeof (p.filters) === "string") {
				if(p.filters.length) {
					filters = p.filters;
				// flat filters only
				} else if( $t.p.postData.hasOwnProperty("filters")) {
					filters = $t.p.postData.filters;
				}
				filters = $.jgrid.parse(filters);
			}
	        if ($.isPlainObject(filters)) {
				setrules( filters );
	        }
		});
	},
	searchGrid : function (p) {
		var regional =  $.jgrid.getRegional(this[0], 'search');
		p = $.extend(true, {
			recreateFilter: false,
			drag: true,
			sField:'searchField',
			sValue:'searchString',
			sOper: 'searchOper',
			sFilter: 'filters',
			loadDefaults: true, // this options activates loading of default filters from grid's postData for Multipe Search only.
			beforeShowSearch: null,
			afterShowSearch : null,
			onInitializeSearch: null,
			afterRedraw : null,
			afterChange: null,
			sortStrategy: null,
			closeAfterSearch : false,
			closeAfterReset: false,
			closeOnEscape : false,
			searchOnEnter : false,
			multipleSearch : false,
			multipleGroup : false,
			//cloneSearchRowOnAdd: true,
			top : 0,
			left: 0,
			jqModal : true,
			modal: false,
			resize : true,
			width: 450,
			height: 'auto',
			dataheight: 'auto',
			showQuery: false,
			errorcheck : true,
			sopt: null,
			stringResult: undefined,
			onClose : null,
			onSearch : null,
			onReset : null,
			toTop : true,
			overlay : 30,
			columns : [],
			tmplNames : null,
			tmplFilters : null,
			tmplLabel : ' Template: ',
			showOnLoad: false,
			layer: null,
			splitSelect : ",",
			groupOpSelect : "OR",
			operands : { "eq" :"=", "ne":"<>","lt":"<","le":"<=","gt":">","ge":">=","bw":"LIKE","bn":"NOT LIKE","in":"IN","ni":"NOT IN","ew":"LIKE","en":"NOT LIKE","cn":"LIKE","nc":"NOT LIKE","nu":"IS NULL","nn":"ISNOT NULL"},
			buttons :[]
		}, regional,  p || {});
		return this.each(function() {
			var $t = this;
			if(!$t.grid) {return;}
			var fid = "fbox_"+$t.p.id,
			showFrm = true,
			mustReload = true,
			IDs = {themodal:'searchmod'+fid,modalhead:'searchhd'+fid,modalcontent:'searchcnt'+fid, scrollelm : fid},
			defaultFilters,//  = ($.isPlainObject($t.p._savedFilter) && !$.isEmptyObject($t.p._savedFilter ) ) ? $t.p._savedFilter :  $t.p.postData[p.sFilter],
			fl,
			unaryOpers = [],
			classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].filter,
			common = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].common;
			p.styleUI = $t.p.styleUI;
			if($.isPlainObject($t.p._savedFilter) && !$.isEmptyObject($t.p._savedFilter )) {
				defaultFilters = $t.p._savedFilter;
			} else if($t.p.mergeSearch === true && $t.p.searchModules.hasOwnProperty('searchGrid') && $t.p.searchModules.searchGrid !== false ) {
				$.extend($t.p.postData,{filters: $.jgrid.splitSearch($t.p.searchModules)});
				defaultFilters =  $t.p.postData[p.sFilter];
			} else {
				defaultFilters = $t.p.postData[p.sFilter];
			}
			if(typeof defaultFilters === "string") {
				defaultFilters = $.jgrid.parse( defaultFilters );
			}
			if(p.recreateFilter === true) {
				$("#"+$.jgrid.jqID(IDs.themodal)).remove();
			}
			function showFilter(_filter) {
				showFrm = $($t).triggerHandler("jqGridFilterBeforeShow", [_filter]);
				if(showFrm === undefined) {
					showFrm = true;
				}
				if(showFrm && $.jgrid.isFunction(p.beforeShowSearch)) {
					showFrm = p.beforeShowSearch.call($t,_filter);
				}
				if(showFrm) {
					$.jgrid.viewModal("#"+$.jgrid.jqID(IDs.themodal),{gbox:"#gbox_"+$.jgrid.jqID( $t.p.id ),jqm:p.jqModal, modal:p.modal, overlay: p.overlay, toTop: p.toTop});
					$($t).triggerHandler("jqGridFilterAfterShow", [_filter]);
					if($.jgrid.isFunction(p.afterShowSearch)) {
						p.afterShowSearch.call($t, _filter);
					}
				}
			}
			if ( $("#"+$.jgrid.jqID(IDs.themodal))[0] !== undefined ) {
				showFilter($("#fbox_"+$.jgrid.jqID( $t.p.id )));
			} else {
				var fil = $("<div><div id='"+fid+"' class='searchFilter' style='overflow:auto'></div></div>").insertBefore("#gview_"+$.jgrid.jqID($t.p.id)),
				align = "left", butleft ="";
				if($t.p.direction === "rtl") {
					align = "right";
					butleft = " style='text-align:left'";
					fil.attr("dir","rtl");
				}
				var columns = $.extend([],$t.p.colModel),
				bS  ="<a id='"+fid+"_search' class='fm-button " + common.button + " fm-button-icon-right ui-search'><span class='" + common.icon_base + " " +classes.icon_search + "'></span>"+p.Find+"</a>",
				bC  ="<a id='"+fid+"_reset' class='fm-button " + common.button +" fm-button-icon-left ui-reset'><span class='" + common.icon_base + " " +classes.icon_reset + "'></span>"+p.Reset+"</a>",
				bQ = "", tmpl="", colnm, found = false, bt, cmi=-1, ms = false, ssfield = [];
				if(p.showQuery) {
					bQ ="<a id='"+fid+"_query' class='fm-button " + common.button + " fm-button-icon-left'><span class='" + common.icon_base + " " +classes.icon_query + "'></span>Query</a>";
				}
				var user_buttons = $.jgrid.buildButtons( p.buttons, bQ+ bS, common);

				// groupheaders names
				var groupH = null;
				if( $($t).jqGrid('isGroupHeaderOn') ) {
					var htable = $("table.ui-jqgrid-htable", $t.grid.hDiv), 
					secRow = htable.find(".jqg-second-row-header"),
					gh_len = $t.p.groupHeader.length;
					// use the last set one
					if(secRow[0] !== undefined) {
						groupH = $t.p.groupHeader[gh_len-1];
					}
				}
				if(!p.columns.length) {
					if(groupH !== null) {
						for(var ij=0;ij<columns.length; ij++){
							var iCol = $.jgrid.inColumnHeader( columns[ij].name, groupH.groupHeaders);
							if(iCol>=0) {
								columns[ij].label = groupH.groupHeaders[iCol].titleText + "::" + $t.p.colNames[ij];
								for(var jj= 1; jj<= groupH.groupHeaders[iCol].numberOfColumns-1; jj++) {
									columns[ij+jj].label = groupH.groupHeaders[iCol].titleText + "::"+$t.p.colNames[ij+jj];
								}
								ij = ij+groupH.groupHeaders[iCol].numberOfColumns-1;
							}
						}
					}
					$.each(columns, function(i,n){
						if(!n.label) {
							n.label = $t.p.colNames[i];
						}
						// find first searchable column and set it if no default filter
						if(!found) {
							var searchable = (n.search === undefined) ?  true: n.search ,
							hidden = (n.hidden === true),
							ignoreHiding = (n.searchoptions && n.searchoptions.searchhidden === true);
							if ((ignoreHiding && searchable) || (searchable && !hidden)) {
								found = true;
								colnm = n.index || n.name;
								cmi =i;
							}
						}
						if( n.stype==="select" &&  n.searchoptions && n.searchoptions.multiple) {
							ms = true;
							ssfield.push( n.index || n.name );
						}
					});
				} else {
					columns = p.columns;
					cmi = 0;
					colnm = columns[0].index || columns[0].name;
				}
				// old behaviour
				if( (!defaultFilters && colnm) || p.multipleSearch === false  ) {
					var cmop = "eq";
					if(cmi >=0 && columns[cmi].searchoptions && columns[cmi].searchoptions.sopt) {
						cmop = columns[cmi].searchoptions.sopt[0];
					} else if(p.sopt && p.sopt.length) {
						cmop = p.sopt[0];
					}
					defaultFilters = {groupOp: "AND", rules: [{field: colnm, op: cmop, data: ""}]};
				}
				found = false;
				if(p.tmplNames && p.tmplNames.length) {
					found = true;
					tmpl = "<tr><td class='ui-search-label'>"+ p.tmplLabel +"</td>";
					tmpl += "<td><select size='1' name='select_template' class='ui-template " + classes.srSelect + "'>";
					tmpl += "<option value='default'>Default</option>";
					$.each(p.tmplNames, function(i,n){
						tmpl += "<option value='"+i+"'>"+n+"</option>";
					});
					tmpl += "</select></td></tr>";
				}
				if ($t.p.customFilterDef !== undefined) {
					for(var uskey in $t.p.customFilterDef) {
						if($t.p.customFilterDef.hasOwnProperty(uskey)  && !p.operands.hasOwnProperty(uskey) ) {
							p.odata.push({ oper: uskey, text: $t.p.customFilterDef[uskey].text} );
							p.operands[uskey] = $t.p.customFilterDef[uskey].operand;
							if($t.p.customFilterDef[uskey].unary === true) {
								unaryOpers.push(uskey);
						}
					}
				}
				}
				bt = "<table class='EditTable' style='border:0px none;margin-top:5px' id='"+fid+"_2'><tbody><tr><td colspan='2'><hr class='" + common.content + "' style='margin:1px'/></td></tr>"+tmpl+"<tr><td class='EditButton' style='text-align:"+align+"'>"+bC+"</td><td class='EditButton' "+butleft+">"+ user_buttons +"</td></tr></tbody></table>";
				fid = $.jgrid.jqID( fid);
				$("#"+fid).jqFilter({
					columns: columns,
					sortStrategy: p.sortStrategy,
					filter: p.loadDefaults ? defaultFilters : null,
					showQuery: p.showQuery,
					errorcheck : p.errorcheck,
					sopt: p.sopt,
					groupButton : p.multipleGroup,
					ruleButtons : p.multipleSearch,
					uniqueSearchFields : p.uniqueSearchFields,
					afterRedraw : p.afterRedraw,
					ops : p.odata,
					operands : p.operands,
					ajaxSelectOptions: $t.p.ajaxSelectOptions,
					groupOps: p.groupOps,
					addsubgrup : p.addsubgrup,
					addrule : p.addrule,
					delgroup : p.delgroup,
					delrule : p.delrule,
					autoencode : $t.p.autoencode,
					unaryOperations : unaryOpers,
					onChange : function() {
						if(this.p.showQuery) {
							$('.query',this).text(this.toUserFriendlyString());
						}
						if ($.jgrid.isFunction(p.afterChange)) {
							p.afterChange.call($t, $("#"+fid), p);
						}
					},
					direction : $t.p.direction,
					id: $t.p.id
				});
				fil.append( bt );
				$("#"+fid+"_2").find("[data-index]").each(function(){
					var index = parseInt($(this).attr('data-index'),10);
					if(index >=0 ) {
						$(this).on('click', function(e) {
							p.buttons[index].click.call($t, $("#"+fid), p, e);
						});
					}
				});
				if(found && p.tmplFilters && p.tmplFilters.length) {
					$(".ui-template", fil).on('change', function(){
						var curtempl = $(this).val();
						if(curtempl==="default") {
							$("#"+fid).jqFilter('addFilter', defaultFilters);
						} else {
							$("#"+fid).jqFilter('addFilter', p.tmplFilters[parseInt(curtempl,10)]);
						}
						return false;
					});
				}
				if(p.multipleGroup === true) {p.multipleSearch = true;}
				$($t).triggerHandler("jqGridFilterInitialize", [$("#"+fid)]);
				if($.jgrid.isFunction(p.onInitializeSearch) ) {
					p.onInitializeSearch.call($t, $("#"+fid));
				}
				p.gbox = "#gbox_"+$.jgrid.jqID($t.p.id);//fid;
				var fs =  $('.ui-jqgrid').css('font-size') || '11px';
				if (p.layer) {
					$.jgrid.createModal(IDs ,fil,p,"#gview_"+$.jgrid.jqID($t.p.id),$("#gbox_"+$.jgrid.jqID($t.p.id))[0], (typeof p.layer ==="string" ? "#"+$.jgrid.jqID(p.layer) : p.layer), (typeof p.layer ==="string" ?  {position: "relative", "font-size":fs} :{ "font-size":fs} ) );
				} else {
					$.jgrid.createModal(IDs ,fil,p,"#gview_"+$.jgrid.jqID($t.p.id),$("#gbox_"+$.jgrid.jqID($t.p.id))[0], null, { "font-size":fs});
				}
				if (p.searchOnEnter || p.closeOnEscape) {
					$("#"+$.jgrid.jqID(IDs.themodal)).keydown(function (e) {
						var $target = $(e.target);
						if (p.searchOnEnter && e.which === 13 && // 13 === $.ui.keyCode.ENTER
								!$target.hasClass('add-group') && !$target.hasClass('add-rule') &&
								!$target.hasClass('delete-group') && !$target.hasClass('delete-rule') &&
								(!$target.hasClass("fm-button") || !$target.is("[id$=_query]"))) {
							e.preventDefault();
							$("#"+fid+"_search").click();
							return false;
						}
						if (p.closeOnEscape && e.which === 27) { // 27 === $.ui.keyCode.ESCAPE
							$("#"+$.jgrid.jqID(IDs.modalhead)).find(".ui-jqdialog-titlebar-close").click();
							return false;
						}
					});
				}
				if(bQ) {
					$("#"+fid+"_query").on('click', function(){
						$(".queryresult", fil).toggle();
						return false;
					});
				}
				if (p.stringResult===undefined) {
					// to provide backward compatibility, inferring stringResult value from multipleSearch
					p.stringResult = p.multipleSearch;
				}
				$("#"+fid+"_search").on('click', function(){
					var sdata={}, filters;
					fl = $("#"+fid);
					fl.find(".input-elm:focus").change();
					if( ms && p.multipleSearch) {
						$t.p._savedFilter = {};
						filters = $.jgrid.filterRefactor({
							ruleGroup: $.extend(true, {}, fl.jqFilter('filterData')),
							ssfield : ssfield,
							splitSelect : p.splitSelect,
							groupOpSelect : p.groupOpSelect
						});
						$t.p._savedFilter = $.extend(true, {}, fl.jqFilter('filterData'));
					} else {
						filters = fl.jqFilter('filterData');
					}
					if(p.errorcheck) {
						fl[0].hideError();
						if(!p.showQuery) {fl.jqFilter('toSQLString');}
						if(fl[0].p.error) {
							fl[0].showError();
							return false;
						}
					}

					if(p.stringResult) {
						sdata[p.sFilter] = JSON.stringify( filters );
						$.each([p.sField,p.sValue, p.sOper], function() {sdata[this] = "";});
					} else {
						if(p.multipleSearch) {
							sdata[p.sFilter] = filters;
							$.each([p.sField,p.sValue, p.sOper], function() {sdata[this] = "";});
						} else {
							sdata[p.sField] = filters.rules[0].field;
							sdata[p.sValue] = filters.rules[0].data;
							sdata[p.sOper] = filters.rules[0].op;
							sdata[p.sFilter] = "";
						}
					}
					if(typeof sdata[p.sFilter] !== "string") {
						sdata[p.sFilter] = JSON.stringify( sdata[p.sFilter] );
					}
					$t.p.search = true;
					if($t.p.mergeSearch === true && $t.p.searchModules.hasOwnProperty('searchGrid') && $t.p.searchModules.searchGrid !== false  && p.multipleSearch) {
						if(sdata[p.sFilter] !==  "") {
							$t.p.searchModules.searchGrid = sdata[p.sFilter];
						} else {
							$t.p.searchModules.searchGrid = null;
						}
						$.extend($t.p.postData,{filters: $.jgrid.splitSearch($t.p.searchModules)});						
					} else {
						$.extend($t.p.postData,sdata);
					}
					mustReload = $($t).triggerHandler("jqGridFilterSearch");
					if( mustReload === undefined) {
						mustReload = true;
					}
					if(mustReload && $.jgrid.isFunction(p.onSearch) ) {
						mustReload = p.onSearch.call($t, $t.p.filters);
					}
					if (mustReload !== false) {
						$($t).trigger("reloadGrid",[{page:1}]);
					}
					if(p.closeAfterSearch) {
						$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID($t.p.id),jqm:p.jqModal,onClose: p.onClose});
					}
					return false;
				});
				$("#"+fid+"_reset").on('click', function(){
					var sdata={},
					fl = $("#"+fid);
					$t.p.search = false;
					$t.p.resetsearch =  true;
					if(p.multipleSearch===false) {
						sdata[p.sField] = sdata[p.sValue] = sdata[p.sOper] = "";
					} else {
						sdata[p.sFilter] = "";
					}
					fl[0].resetFilter();
					if(found) {
						$(".ui-template", fil).val("default");
					}
					if($t.p.mergeSearch === true && $t.p.searchModules.hasOwnProperty('searchGrid') && $t.p.searchModules.searchGrid !== false ) {
						$t.p.searchModules.searchGrid = null;
						$.extend($t.p.postData,{filters: $.jgrid.splitSearch($t.p.searchModules)});
						$t.p.search = true;
					} else {
						$.extend($t.p.postData,sdata);
					}
					mustReload = $($t).triggerHandler("jqGridFilterReset");
					if(mustReload === undefined) {
						mustReload = true;
					}
					if(mustReload && $.jgrid.isFunction(p.onReset) ) {
						mustReload = p.onReset.call($t);
					}
					if(mustReload !== false) {
						$($t).trigger("reloadGrid",[{page:1}]);
					}
					if (p.closeAfterReset) {
						$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID($t.p.id),jqm:p.jqModal,onClose: p.onClose});
					}
					return false;
				});
				showFilter($("#"+fid));
				$(".fm-button:not(."+common.disabled+")",fil).hover(
					function(){$(this).addClass(common.hover);},
					function(){$(this).removeClass(common.hover);}
				);
			}
		});
	},
	filterInput : function( val, p) {
		p = $.extend(true, {
			defaultSearch : 'cn',
			groupOp : 'OR',
			searchAll : false,
			beforeSearch : null,
			afterSearch : null,
			selectFirstFound : false,
			firstFoundTimeout : 30
		}, p || {});
		return this.each(function(){
			var $t = this;
			if(!$t.grid) {return;}
			var nm, sop,ruleGroup = "{\"groupOp\":\"" + p.groupOp + "\",\"rules\":[", gi=0, so, searchable;
			val +="";
			//if($t.p.datatype !== 'local') { return; }
			$.each($t.p.colModel,function(){
				nm = this.index || this.name;
				sop = this.searchoptions || {};
				so  = p.defaultSearch ? p.defaultSearch : (sop.sopt) ? sop.sopt[0] : p.defaultSearch;
				searchable =  this.search === undefined  ? true : this.search;
				if ((searchable || p.searchAll) && val !== "") {
					if (gi > 0) {ruleGroup += ",";}
					ruleGroup += "{\"field\":\"" + nm + "\",";
					ruleGroup += "\"op\":\"" + so + "\",";
					ruleGroup += "\"data\":\"" + val.replace(/\\/g,'\\\\').replace(/\"/g,'\\"') + "\"}";
					gi++;
				}
			});
			ruleGroup += "]}";
			if($t.p.mergeSearch === true && $t.p.searchModules.hasOwnProperty('filterInput') && $t.p.searchModules.filterInput !== false  ) {
				if(gi > 0) {
					$t.p.searchModules.filterInput = ruleGroup;
				} else {
					$t.p.searchModules.filterInput = null;
				}
				$.extend($t.p.postData,{filters: $.jgrid.splitSearch($t.p.searchModules)});
			} else {
				$.extend($t.p.postData,{filters:ruleGroup});
			}
			$.each(['searchField', 'searchString', 'searchOper'], function(i, n){
				if($t.p.postData.hasOwnProperty(n)) { delete $t.p.postData[n];}
			});
			var bsr = $($t).triggerHandler("jqGridFilterInputBeforeSearch") === 'stop' ? true : false;
			if(!bsr && $.jgrid.isFunction(p.beforeSearch)){bsr = p.beforeSearch.call($t);}
			if(!bsr) { $($t).jqGrid("setGridParam",{search:true}).trigger("reloadGrid",[{page:1}]); }
			if(p.selectFirstFound ) {
				setTimeout(function(){
					var row = $($t).jqGrid('getGridRowByIndex', 1);
					$($t).jqGrid("setSelection", row.id, false);
				}, p.firstFoundTimeout);
			}
			$($t).triggerHandler("jqGridFilterInputAfterSearch");
			if($.jgrid.isFunction(p.afterSearch)){p.afterSearch.call($t);}
		});
	},
	autoSelect : function (o) {
		o = $.extend(true,{
			field : "",
			direction : "asc",
			src_date : "Y-m-d",
			allValues : "All",
			count_item : true,
			create_value : true
		}, o || {} );
		return this.each(function() {
			var $t = this, item, sdata="";
			if( o.field && $t.p.data && Array.isArray( $t.p.data )) {
				var query, res, s_cnt, tmp = [], cm,
				result, i;

				try {
					query = $.jgrid.from.call($t, $t.p.data);
					result = query.groupBy( o.field, o.direction, "text", o.src_date);
					i = result.length;
				} catch(e) {

				}
				if(result && result.length) {
					res =  $("#gsh_"+$t.p.id+"_"+o.field).find("td.ui-search-input > select");
					i = result.length;
					if(o.allValues) {
						sdata = "<option value=''>"+ o.allValues +"</option>";
						tmp.push(":" + o.allValues);
					}
					while(i--) {
						item = result[i];
						s_cnt = o.count_item ? " (" +item.items.length+")" : "";
						sdata += "<option value='"+item.unique+"'>"+ item.unique + s_cnt+"</option>";
						tmp.push(item.unique+":"+item.unique + s_cnt);
					}
					res.append(sdata);
					res.on('change',function(){
						$t.triggerToolbar();
					});
					if( o.create_value ) {
						cm = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', o.field, false);
						if( !$.isEmptyObject( cm ) ) {
							if( cm.searchoptions ) {
								$.extend(cm.searchoptions, {value: tmp.join(";")});
							} else {
								cm.searchoptions = {};
								cm.searchoptions.value = tmp.join(";");
							}
						}
					}
				}
			}
		});
	}
});

//module begin
var rp_ge = {};
$.jgrid.extend({
	editGridRow : function(rowid, p){
		var regional =  $.jgrid.getRegional(this[0], 'edit'),
			currstyle = this[0].p.styleUI,
			styles = $.jgrid.styleUI[currstyle].formedit,
			commonstyle = $.jgrid.styleUI[currstyle].common;

		p = $.extend(true, {
			top : 0,
			left: 0,
			width: '500',
			datawidth: 'auto',
			height: 'auto',
			dataheight: 'auto',
			modal: false,
			overlay : 30,
			drag: true,
			resize: true,
			url: null,
			mtype : "POST",
			clearAfterAdd :true,
			closeAfterEdit : false,
			reloadAfterSubmit : true,
			onInitializeForm: null,
			beforeInitData: null,
			beforeShowForm: null,
			afterShowForm: null,
			beforeSubmit: null,
			afterSubmit: null,
			onclickSubmit: null,
			afterComplete: null,
			onclickPgButtons : null,
			afterclickPgButtons: null,
			editData : {},
			recreateForm : false,
			jqModal : true,
			closeOnEscape : false,
			addedrow : "first",
			topinfo : '',
			bottominfo: '',
			saveicon : [],
			closeicon : [],
			savekey: [false,13],
			navkeys: [false,38,40],
			checkOnSubmit : false,
			checkOnUpdate : false,
			processing : false,
			onClose : null,
			ajaxEditOptions : {},
			serializeEditData : null,
			viewPagerButtons : true,
			overlayClass : commonstyle.overlay,
			removemodal : true,
			form: 'edit',
			template : null,
			focusField : true,
			editselected : false,
			html5Check : false,
			buttons : []
		}, regional, p || {});
		rp_ge[$(this)[0].p.id] = p;
		return this.each(function(){
			var $t = this;
			if (!$t.grid || !rowid) {return;}
			$t.p.savedData = {};
			var gID = $t.p.id,
			frmgr = "FrmGrid_"+gID, frmtborg = "TblGrid_"+gID, frmtb = "#"+$.jgrid.jqID(frmtborg), frmtb2,
			IDs = {themodal:'editmod'+gID,modalhead:'edithd'+gID,modalcontent:'editcnt'+gID, scrollelm : frmgr},
			showFrm = true, maxCols = 1, maxRows=0,	postdata, diff, frmoper,
			templ = typeof rp_ge[$t.p.id].template === "string" && rp_ge[$t.p.id].template.length > 0,
			errors =$.jgrid.getRegional(this, 'errors');
			rp_ge[$t.p.id].styleUI = $t.p.styleUI || 'jQueryUI';
			if($.jgrid.isMobile()) {
				rp_ge[$t.p.id].resize = false;
			}
			if (rowid === "new") {
				rowid = "_empty";
				frmoper = "add";
				p.caption=rp_ge[$t.p.id].addCaption;
			} else {
				p.caption=rp_ge[$t.p.id].editCaption;
				frmoper = "edit";
			}
			if(!p.recreateForm) {
				if( $($t).data("formProp") ) {
					$.extend(rp_ge[$(this)[0].p.id], $($t).data("formProp"));
				}
			}
			var closeovrl = true;
			if(p.checkOnUpdate && p.jqModal && !p.modal) {
				closeovrl = false;
			}
			function getFormData(){
				var a2 ={}, i;
				$(frmtb).find(".FormElement").each(function() {
					var celm = $(".customelement", this);
					if (celm.length) {
						var  elem = celm[0], nm = $(elem).attr('name');
						$.each($t.p.colModel, function(){
							if(this.name === nm && this.editoptions && $.jgrid.isFunction(this.editoptions.custom_value)) {
								try {
									let cvr = this.editoptions.custom_value.call($t, $("#"+$.jgrid.jqID(nm),frmtb),'get');
									if( cvr === "#ignoreme#") {
										
									} else if (crv === undefined) {
										throw "e1";
									} else {
										postdata[nm] = cvr;
									}
								} catch (e) {
									if (e==="e1") {$.jgrid.info_dialog(errors.errcap,"function 'custom_value' "+rp_ge[$(this)[0]].p.msg.novalue,rp_ge[$(this)[0]].p.bClose, {styleUI : rp_ge[$(this)[0]].p.styleUI });}
									else {$.jgrid.info_dialog(errors.errcap,e.message,rp_ge[$(this)[0]].p.bClose, {styleUI : rp_ge[$(this)[0]].p.styleUI });}
								}
								return true;
							}
						});
					} else {
						switch ($(this).get(0).type) {
							case "checkbox":
								if($(this).is(":checked")) {
									postdata[this.name]= $(this).val();
								} else {
									var ofv = $(this).attr("offval");
									postdata[this.name]= ofv;
								}
							break;
							case "select-one":
								postdata[this.name]= $(this).val();
							break;
							case "select-multiple":
								postdata[this.name]= $(this).val();
								postdata[this.name] = postdata[this.name] ? postdata[this.name].join(",") : "";
							break;
							case "radio" :
								if(a2.hasOwnProperty(this.name)) {
									return true;
								} else {
									a2[this.name] = ($(this).attr("offval") === undefined) ? "off" : $(this).attr("offval");
								}
								break;
							default:
								postdata[this.name] = $(this).val();
						}
						if($t.p.autoencode) {
							postdata[this.name] = $.jgrid.htmlEncode(postdata[this.name]);
						}
					}
				});
				for(i in a2 ) {
					if( a2.hasOwnProperty(i)) {
						var val = $('input[name="'+i+'"]:checked',frmtb).val();
						postdata[i] = (val !== undefined) ? val : a2[i];
						if($t.p.autoencode) {
							postdata[i] = $.jgrid.htmlEncode(postdata[i]);
						}
					}
				}
				return true;
			}
			function createData(rowid,obj,tb,maxcols){
				var nm, hc,trdata, cnt=0,tmp, dc,elc, retpos=[], ind=false,
				tdtmpl = "<td class='CaptionTD'></td><td class='DataTD'></td>", tmpl="", i, ffld; //*2
				for (i =1; i<=maxcols;i++) {
					tmpl += tdtmpl;
				}
				if(rowid !== '_empty') {
					ind = $(obj).jqGrid("getInd",rowid);
				}
				$(obj.p.colModel).each( function(i) {
					nm = this.name;
					// hidden fields are included in the form
					if(this.editrules && this.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = this.hidden === true ? true : false;
					}
					dc = hc ? "style='display:none'" : "";
					if ( nm !== 'cb' && nm !== 'subgrid' && this.editable===true && nm !== 'rn' && nm!=='sc') {
						if(ind === false) {
							tmp = "";
						} else {
							if(nm === obj.p.ExpandColumn && obj.p.treeGrid === true) {
								tmp = $("td[role='gridcell']",obj.rows[ind]).eq( i ).text();
							} else {
								try {
									tmp =  $.unformat.call(obj, $("td[role='gridcell']",obj.rows[ind]).eq( i ),{rowId:rowid, colModel:this},i);
								} catch (_) {
									tmp =  (this.edittype && this.edittype === "textarea") ? $("td[role='gridcell']",obj.rows[ind]).eq( i ).text() : $("td[role='gridcell']",obj.rows[ind]).eq( i ).html();
								}
								if(!tmp || tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
							}
						}
						var opt = $.extend({}, this.editoptions || {} ,{id:nm,name:nm, rowId: rowid, oper:frmoper, module : 'form', checkUpdate : rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate}),
						frmopt = $.extend({}, {elmprefix:'',elmsuffix:'',rowabove:false,rowcontent:''}, this.formoptions || {}),
						rp = parseInt(frmopt.rowpos,10) || cnt+1,
						cp = parseInt((parseInt(frmopt.colpos,10) || 1)*2,10);
						if(rowid === "_empty" && opt.defaultValue ) {
							tmp = $.jgrid.isFunction(opt.defaultValue) ? opt.defaultValue.call($t) : opt.defaultValue;
						}
						if(!this.edittype) {
							this.edittype = "text";
						}
						if($t.p.autoencode) {
							tmp = $.jgrid.htmlDecode(tmp);
						}
						elc = $.jgrid.createEl.call($t,this.edittype,opt,tmp,false,$.extend({},$.jgrid.ajaxOptions,obj.p.ajaxSelectOptions || {}));
						//if(tmp === "" && this.edittype == "checkbox") {tmp = $(elc).attr("offval");}
						//if(tmp === "" && this.edittype == "select") {tmp = $("option:eq(0)",elc).text();}
						if(this.edittype === "select") {
							tmp = $(elc).val();
							if($(elc).get(0).type === 'select-multiple' && tmp) {
								tmp = tmp.join(",");
							}
						}
						if(this.edittype === 'checkbox') {
							if($(elc).is(":checked")) {
								tmp= $(elc).val();
							} else {
								tmp = $(elc).attr("offval");
							}
						}
						$(elc).addClass("FormElement");
						if(this.edittype === 'select') {
							$(elc).addClass( styles.selectClass );
						} else 	if( $.inArray(this.edittype, 
							['text','textarea','password', 
							'color', 'date', 'datetime', 'datetime-local','email','month',
							'number','range', 'search', 'tel', 'time', 'url','week'] ) > -1) {
							$(elc).addClass( styles.inputClass );
						}
						ffld = true;
						if(templ) {
							var ftmplfld = $(frm).find("#"+nm);
							if(ftmplfld.length){
								ftmplfld.replaceWith( elc );
							} else {
								ffld = false;
							}
						} else {
							//--------------------
							trdata = $(tb).find("tr[rowpos="+rp+"]");
							if(frmopt.rowabove) {
								var newdata = $("<tr><td class='contentinfo' colspan='"+(maxcols*2)+"'>"+frmopt.rowcontent+"</td></tr>");
								$(tb).append(newdata);
								newdata[0].rp = rp;
							}
							if ( trdata.length===0 ) {
								if(maxcols > 1) {
									trdata = $("<tr rowpos='"+rp+"'></tr>").addClass("FormData").attr("id","tr_"+nm);
								} else {
									trdata = $("<tr "+dc+" rowpos='"+rp+"'></tr>").addClass("FormData").attr("id","tr_"+nm);
								}
								$(trdata).append(tmpl);
								$(tb).append(trdata);
								trdata[0].rp = rp;
							}
							$("td",trdata[0]).eq( cp-2 ).html("<label for='"+nm+"' class='" + styles.labelClass + "'>"+ (frmopt.label === undefined ? obj.p.colNames[i]: frmopt.label) + "</label>");
							$("td",trdata[0]).eq( cp-1 ).append(frmopt.elmprefix).append(elc).append(frmopt.elmsuffix);
							if( maxcols > 1 && hc) {
								$("td",trdata[0]).eq( cp-2 ).hide();
								$("td",trdata[0]).eq( cp-1 ).hide();
							}
							//-------------------------
						}
						if( (rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate) && ffld) {
							$t.p.savedData[nm] = tmp;
						}
						if(this.edittype==='custom' && $.jgrid.isFunction(opt.custom_value) ) {
							opt.custom_value.call($t, $("#"+nm, elc),'set',tmp);
						}
						$.jgrid.bindEv.call($t, elc, opt);
						retpos[cnt] = i;
						cnt++;
					}
				});
				if( cnt > 0) {
					var idrow;
					if(templ) {
						idrow = "<div class='FormData' style='display:none'><input class='FormElement' id='id_g' type='text' name='"+obj.p.id+"_id' value='"+rowid+"'/>";
						$(frm).append(idrow);
					} else {
						idrow = $("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='"+ (maxcols*2-1)+"' class='DataTD'><input class='FormElement' id='id_g' type='text' name='"+obj.p.id+"_id' value='"+rowid+"'/></td></tr>");
						idrow[0].rp = cnt+999;
						$(tb).append(idrow);
					} 
					//$(tb).append(idrow);
					if(rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate) {
						$t.p.savedData[obj.p.id+"_id"] = rowid;
					}
				}			
				return retpos;
			}
			function fillData(rowid,obj,fmid){
				var nm,cnt=0,tmp, fld,opt,vl,vlc;
				if(rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate) { 
					$t.p.savedData = {};
					$t.p.savedData[obj.p.id+"_id"]=rowid;
				}
				var cm = obj.p.colModel;
				if(rowid === '_empty') {
					$(cm).each(function(){
						nm = this.name;
						opt = $.extend({}, this.editoptions || {} );
						fld = $("#"+$.jgrid.jqID(nm),fmid);
						if(fld && fld.length && fld[0] !== null) {
							vl = "";
							if(this.edittype === 'custom' && $.jgrid.isFunction(opt.custom_value)) {
								opt.custom_value.call($t, $("#"+nm,fmid),'set',vl);
							} else if(opt.defaultValue ) {
								vl = $.jgrid.isFunction(opt.defaultValue) ? opt.defaultValue.call($t) : opt.defaultValue;
								if(fld[0].type==='checkbox') {
									vlc = vl.toLowerCase();
									if(vlc.search(/(false|f|0|no|n|off|undefined)/i)<0 && vlc!=="") {
										fld[0].checked = true;
										fld[0].defaultChecked = true;
										fld[0].value = vl;
									} else {
										fld[0].checked = false;
										fld[0].defaultChecked = false;
									}
								} else {fld.val(vl);}
							} else {
								if( fld[0].type==='checkbox' ) {
									fld[0].checked = false;
									fld[0].defaultChecked = false;
									vl = $(fld).attr("offval");
								} else if (fld[0].type && fld[0].type.slice(0,6)==='select') {
									fld[0].selectedIndex = 0;
								} else {
									fld.val(vl);
								}
							}
							if(rp_ge[$t.p.id].checkOnSubmit===true || rp_ge[$t.p.id].checkOnUpdate) {
								$t.p.savedData[nm] = vl;
							}
						}
					});
					$("#id_g",fmid).val(rowid);
					return;
				}
				var tre = $(obj).jqGrid("getInd",rowid,true);
				if(!tre) {return;}
				$('td[role="gridcell"]',tre).each( function(i) {
					nm = cm[i].name;
					// hidden fields are included in the form
					if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn' && cm[i].editable===true && nm !== 'sc') {
						if(nm === obj.p.ExpandColumn && obj.p.treeGrid === true) {
							tmp = $(this).text();
						} else {
							try {
								tmp =  $.unformat.call(obj, $(this),{rowId:rowid, colModel:cm[i]},i);
							} catch (_) {
								tmp = cm[i].edittype==="textarea" ? $(this).text() : $(this).html();
							}
						}
						if($t.p.autoencode) {tmp = $.jgrid.htmlDecode(tmp);}
						if(rp_ge[$t.p.id].checkOnSubmit===true || rp_ge[$t.p.id].checkOnUpdate) { 
							$t.p.savedData[nm] = tmp;
						}
						nm = $.jgrid.jqID(nm);
						switch (cm[i].edittype) {
							case "select":
								var opv = tmp.split(",");
								opv = $.map(opv,function(n){return $.jgrid.trim(n);});
								$("#"+nm+" option",fmid).each(function(){
									if (!cm[i].editoptions.multiple && ($.jgrid.trim(tmp) === $.jgrid.trim($(this).text()) || opv[0] === $.jgrid.trim($(this).text()) || opv[0] === $.jgrid.trim($(this).val())) ){
										this.selected= true;
									} else if (cm[i].editoptions.multiple){
										if(  $.inArray($.jgrid.trim($(this).text()), opv ) > -1 || $.inArray($.jgrid.trim($(this).val()), opv ) > -1  ){
											this.selected = true;
										}else{
											this.selected = false;
										}
									} else {
										this.selected = false;
									}
								});
								if(rp_ge[$t.p.id].checkOnSubmit===true || rp_ge[$t.p.id].checkOnUpdate) {
									tmp = $("#"+nm,fmid).val();
									if(cm[i].editoptions.multiple) {
										tmp = tmp.join(",");
									}
									$t.p.savedData[nm] = tmp;
								}
								break;
							case "checkbox":
								tmp = String(tmp);
								if(cm[i].editoptions && cm[i].editoptions.value) {
									var cb = cm[i].editoptions.value.split(":");
									if(cb[0] === tmp) {
										$("#"+nm, fmid)[$t.p.useProp ? 'prop': 'attr']({"checked":true, "defaultChecked" : true});
									} else {
										$("#"+nm, fmid)[$t.p.useProp ? 'prop': 'attr']({"checked":false, "defaultChecked" : false});
									}
								} else {
									tmp = tmp.toLowerCase();
									if(tmp.search(/(false|f|0|no|n|off|undefined)/i)<0 && tmp!=="") {
										$("#"+nm, fmid)[$t.p.useProp ? 'prop': 'attr']("checked",true);
										$("#"+nm, fmid)[$t.p.useProp ? 'prop': 'attr']("defaultChecked",true); //ie
									} else {
										$("#"+nm, fmid)[$t.p.useProp ? 'prop': 'attr']("checked", false);
										$("#"+nm, fmid)[$t.p.useProp ? 'prop': 'attr']("defaultChecked", false); //ie
									}
								}
								if(rp_ge[$t.p.id].checkOnSubmit===true || rp_ge[$t.p.id].checkOnUpdate) {
									if($("#"+nm, fmid).is(":checked")) {
										tmp = $("#"+nm, fmid).val();
									} else {
										tmp = $("#"+nm, fmid).attr("offval");
									}
									$t.p.savedData[nm] = tmp;
								}
								break;
							case 'custom' :
								try {
									if(cm[i].editoptions && $.jgrid.isFunction(cm[i].editoptions.custom_value)) {
										cm[i].editoptions.custom_value.call($t, $("#"+nm, fmid),'set',tmp);
									} else {throw "e1";}
								} catch (e) {
									if (e==="e1") {$.jgrid.info_dialog(errors.errcap,"function 'custom_value' "+rp_ge[$(this)[0]].p.msg.nodefined,$.rp_ge[$(this)[0]].p.bClose, {styleUI : rp_ge[$(this)[0]].p.styleUI });}
									else {$.jgrid.info_dialog(errors.errcap,e.message,$.rp_ge[$(this)[0]].p.bClose, {styleUI : rp_ge[$(this)[0]].p.styleUI });}
								}
								break;
							default :
								if(tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
								$("#"+nm,fmid).val(tmp);
						}
						cnt++;
					}
				});
				if(cnt>0) {
					$("#id_g",frmtb).val(rowid);
					if( rp_ge[$t.p.id].checkOnSubmit===true || rp_ge[$t.p.id].checkOnUpdate ) {
						$t.p.savedData[obj.p.id+"_id"] = rowid;
					}
				}
			}
			function setNulls() {
				$.each($t.p.colModel, function(i,n){
					if(n.editoptions && n.editoptions.NullIfEmpty === true) {
						if(postdata.hasOwnProperty(n.name) && postdata[n.name] === "") {
							postdata[n.name] = 'null';
						}
					}
				});
			}
			function postIt() {
				var copydata, ret=[true,"",""], onCS = {}, opers = $t.p.prmNames, idname, oper, key, selr, i, url;
				
				var retvals = $($t).triggerHandler("jqGridAddEditBeforeCheckValues", [postdata, $(frmgr), frmoper]);
				if(retvals && typeof retvals === 'object') {postdata = retvals;}
				
				if($.jgrid.isFunction(rp_ge[$t.p.id].beforeCheckValues)) {
					retvals = rp_ge[$t.p.id].beforeCheckValues.call($t, postdata, $(frmgr),frmoper);
					if(retvals && typeof retvals === 'object') {postdata = retvals;}
				}
				if(rp_ge[$t.p.id].html5Check) {
					if( !$.jgrid.validateForm(frm[0]) ) {
						return false;
					}
				}
				for( key in postdata ){
					if(postdata.hasOwnProperty(key)) {
						ret = $.jgrid.checkValues.call($t,postdata[key],key);
						if(ret[0] === false) {break;}
					}
				}
				setNulls();
				if(ret[0]) {
					onCS = $($t).triggerHandler("jqGridAddEditClickSubmit", [rp_ge[$t.p.id], postdata, frmoper]);
					if( onCS === undefined && $.jgrid.isFunction( rp_ge[$t.p.id].onclickSubmit)) { 
						onCS = rp_ge[$t.p.id].onclickSubmit.call($t, rp_ge[$t.p.id], postdata, frmoper) || {}; 
					}
					ret = $($t).triggerHandler("jqGridAddEditBeforeSubmit", [postdata, $(frmgr), frmoper]);
					if(ret === undefined) {
						ret = [true,"",""];
					}
					if( ret[0] && $.jgrid.isFunction(rp_ge[$t.p.id].beforeSubmit))  {
						ret = rp_ge[$t.p.id].beforeSubmit.call($t,postdata,$(frmgr), frmoper);
					}
				}

				if(ret[0] && !rp_ge[$t.p.id].processing) {
					rp_ge[$t.p.id].processing = true;
					$("#sData", frmtb+"_2").addClass( commonstyle.active );
					url = rp_ge[$t.p.id].url || $($t).jqGrid('getGridParam','editurl');
					oper = opers.oper;
					idname = (url === 'clientArray' || url==='storage') ? $t.p.keyName : opers.id;
					// we add to pos data array the action - the name is oper
					postdata[oper] = ($.jgrid.trim(postdata[$t.p.id+"_id"]) === "_empty") ? opers.addoper : opers.editoper;
					if(postdata[oper] !== opers.addoper) {
						postdata[idname] = postdata[$t.p.id+"_id"];
					} else {
						// check to see if we have allredy this field in the form and if yes lieve it
						if( postdata[idname] === undefined ) {postdata[idname] = postdata[$t.p.id+"_id"];}
					}
					delete postdata[$t.p.id+"_id"];
					postdata = $.extend(postdata,rp_ge[$t.p.id].editData,onCS);
					if($t.p.treeGrid === true)  {
						if(postdata[oper] === opers.addoper) {
						selr = $($t).jqGrid("getGridParam", 'selrow');
							var tr_par_id = $t.p.treeGridModel === 'adjacency' ? $t.p.treeReader.parent_id_field : 'parent_id';
							postdata[tr_par_id] = selr;
						}
						for(i in $t.p.treeReader){
							if($t.p.treeReader.hasOwnProperty(i)) {
								var itm = $t.p.treeReader[i];
								if(postdata.hasOwnProperty(itm)) {
									if(postdata[oper] === opers.addoper && i === 'parent_id_field') {continue;}
									delete postdata[itm];
								}
							}
						}
					}
					
					postdata[idname] = $.jgrid.stripPref($t.p.idPrefix, postdata[idname]);
					var ajaxOptions = $.extend({
						url: url,
						type: rp_ge[$t.p.id].mtype,
						data: $.jgrid.isFunction(rp_ge[$t.p.id].serializeEditData) ? rp_ge[$t.p.id].serializeEditData.call($t,postdata) :  postdata,
						success:function(res,status,data){
							var key;
							$("#sData", frmtb+"_2").removeClass( commonstyle.active );
							postdata[idname] = $t.p.idPrefix + postdata[idname];
							if(data.status >= 300 && data.status !== 304) {
								ret[0] = false;
								ret[1] = $($t).triggerHandler("jqGridAddEditErrorTextFormat", [data, frmoper]);
								if ($.jgrid.isFunction(rp_ge[$t.p.id].errorTextFormat)) {
									ret[1] = rp_ge[$t.p.id].errorTextFormat.call($t, data, frmoper);
								} else {
									ret[1] = status + " Status: '" + data.statusText + "'. Error code: " + data.status;
								}
							} else {
								// data is posted successful
								// execute aftersubmit with the returned data from server
								ret = $($t).triggerHandler("jqGridAddEditAfterSubmit", [data, postdata, frmoper]);
								if(ret === undefined) {
									ret = [true,"",""];
								}
								if( ret[0] && $.jgrid.isFunction(rp_ge[$t.p.id].afterSubmit) ) {
									ret = rp_ge[$t.p.id].afterSubmit.call($t, data,postdata, frmoper);
								}
							}
							if(ret[0] === false) {
								$(".FormError",frmgr).html(ret[1]);
								$(".FormError",frmgr).show();
							} else {
								if($t.p.autoencode) {
									$.each(postdata,function(n,v){
										postdata[n] = $.jgrid.htmlDecode(v);
									});
								}
								//rp_ge[$t.p.id].reloadAfterSubmit = rp_ge[$t.p.id].reloadAfterSubmit && $t.p.datatype != "local";
								// the action is add
								if(postdata[oper] === opers.addoper ) {
									//id processing
									// user not set the id ret[2]
									if(!ret[2]) {ret[2] = $.jgrid.randId();}
									if(postdata[idname] == null || postdata[idname] === ($t.p.idPrefix + "_empty") || postdata[idname] === ""){
										postdata[idname] = ret[2];
									} else {
										ret[2] = postdata[idname];
									}
									if(rp_ge[$t.p.id].reloadAfterSubmit) {
										$($t).trigger("reloadGrid");
									} else {
										if($t.p.treeGrid === true){
											$($t).jqGrid("addChildNode",ret[2],selr,postdata );
										} else {
											$($t).jqGrid("addRowData",ret[2],postdata,p.addedrow);
										}
									}
									if(rp_ge[$t.p.id].closeAfterAdd) {
										if($t.p.treeGrid !== true){
											$($t).jqGrid("setSelection",ret[2]);
										}
										$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal,onClose: rp_ge[$t.p.id].onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});
									} else if (rp_ge[$t.p.id].clearAfterAdd) {
										fillData("_empty", $t, frmgr);
									}
								} else {
									// the action is update
									if(rp_ge[$t.p.id].reloadAfterSubmit) {
										$($t).trigger("reloadGrid");
										if( !rp_ge[$t.p.id].closeAfterEdit ) {setTimeout(function(){$($t).jqGrid("setSelection",postdata[idname]);},1000);}
									} else {
										if($t.p.treeGrid === true) {
											$($t).jqGrid("setTreeRow", postdata[idname],postdata);
										} else {
											$($t).jqGrid("setRowData", postdata[idname],postdata);
										}
									}
									if(rp_ge[$t.p.id].closeAfterEdit) {$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal,onClose: rp_ge[$t.p.id].onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});}
								}
								if( $.jgrid.isFunction(rp_ge[$t.p.id].afterComplete) || Object.prototype.hasOwnProperty.call($._data( $($t)[0], 'events' ), 'jqGridAddEditAfterComplete') ) {
									copydata = data;
									setTimeout(function(){
										$($t).triggerHandler("jqGridAddEditAfterComplete", [copydata, postdata, $(frmgr), frmoper]);
										try { 
											rp_ge[$t.p.id].afterComplete.call($t, copydata, postdata, $(frmgr), frmoper);
										} catch(excacmp) {
											//do nothing
										}
										copydata=null;
									},500);
								}
								if(rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate) {
									$(frmgr).data("disabled",false);
									if($t.p.savedData[$t.p.id+"_id"] !== "_empty"){
										for(key in $t.p.savedData) {
											if($t.p.savedData.hasOwnProperty(key) && postdata[key]) {
												$t.p.savedData[key] = postdata[key];
											}
										}
									}
								}
							}
							rp_ge[$t.p.id].processing=false;
							try{$(':input:visible',frmgr)[0].focus();} catch (e){}
						}, 
						complete : function() {
							rp_ge[$t.p.id].processing=false;
						}
					}, $.jgrid.ajaxOptions, rp_ge[$t.p.id].ajaxEditOptions );

					if (!ajaxOptions.url && !rp_ge[$t.p.id].useDataProxy) {
						if ($.jgrid.isFunction($t.p.dataProxy)) {
							rp_ge[$t.p.id].useDataProxy = true;
						} else {
							ret[0]=false;ret[1] += " "+errors.nourl;
						}
					}
					if (ret[0]) {
						if (rp_ge[$t.p.id].useDataProxy) {
							var dpret = $t.p.dataProxy.call($t, ajaxOptions, "set_"+$t.p.id); 
							if(dpret === undefined) {
								dpret = [true, ""];
							}
							if(dpret[0] === false ) {
								ret[0] = false;
								ret[1] = dpret[1] || "Error processing the row!" ;
							} else {
								if(ajaxOptions.data.oper === opers.addoper && rp_ge[$t.p.id].closeAfterAdd ) {
									$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal, onClose: rp_ge[$t.p.id].onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});
								}
								if(ajaxOptions.data.oper === opers.editoper && rp_ge[$t.p.id].closeAfterEdit ) {
									$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal, onClose: rp_ge[$t.p.id].onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});
								}
							}
						} else {
							if(ajaxOptions.url === "clientArray") {
								rp_ge[$t.p.id].reloadAfterSubmit = false;
								postdata = ajaxOptions.data;
								ajaxOptions.success(postdata,'',{status:200, statusText:''});
							} else if(ajaxOptions.url === "storage"){
								if(postdata[oper] === opers.addoper) {
									if(postdata[idname] === "_empty") {
										postdata[idname] = "";
									}
									$($t).jqGrid('addStorageRecord', postdata)
									.then(function(e){
										if(e.type==="complete") {
											ajaxOptions.success(postdata,'',{status:200, statusText:''});
										}
									})
									.catch(function(e) {
										$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
									});
								} else if(postdata[oper] === opers.editoper) {
									$($t).jqGrid('updateStorageRecord', postdata)
									.then(function(e){
										if(e.type==="complete") {
											ajaxOptions.success(postdata,'',{status:200, statusText:''});
										}
									})
									.catch(function(e) {
										$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
									});									
								}
							} else {
								$.ajax(ajaxOptions); 
							}
						}
					}
				}
				if(ret[0] === false) {
					$(frmgr).scrollTop(0);
					$(".FormError",frmgr).html(ret[1]);
					$(".FormError",frmgr).show();
					// return;
				}
			}
			function compareData(nObj, oObj ) {
				var ret = false,key;
				ret = !( $.isPlainObject(nObj) && $.isPlainObject(oObj) && Object.getOwnPropertyNames(nObj).length === Object.getOwnPropertyNames(oObj).length);
				if(!ret) {
					for (key in oObj) {
						if(oObj.hasOwnProperty(key) )  {
							if(nObj.hasOwnProperty(key) ) {
								if( nObj[key] !== oObj[key] ) {
									ret = true;
									break;
								}
							} else {
								ret = true;
								break;
							}
						}
					}
				}
				return ret;
			}
			function checkUpdates () {
				var stat = true;
				$(".FormError",frmgr).hide();
				if(rp_ge[$t.p.id].checkOnUpdate) {
					postdata = {};
					getFormData();
					diff = compareData(postdata, $t.p.savedData);
					if(diff) {
						$(frmgr).data("disabled",true);
						$(".confirm","#"+IDs.themodal).show();
						stat = false;
					}
				}
				return stat;
			}
			function restoreInline() {
				var i;
				if (rowid !== "_empty" && $t.p.savedRow !== undefined && $t.p.savedRow.length > 0 && $.jgrid.isFunction($.fn.jqGrid.restoreRow)) {
					for (i=0;i<$t.p.savedRow.length;i++) {
						if ($t.p.savedRow[i].id === rowid) {
							$($t).jqGrid('restoreRow',rowid);
							break;
						}
					}
				}
			}
			function updateNav(cr, posarr){
				var totr = posarr[1].length-1;
				if (cr===0) {
					$("#pData",frmtb2).addClass( commonstyle.disabled );
				} else if( posarr[1][cr-1] !== undefined && $("#"+$.jgrid.jqID(posarr[1][cr-1])).hasClass( commonstyle.disabled )) {
						$("#pData",frmtb2).addClass( commonstyle.disabled );
				} else {
					$("#pData",frmtb2).removeClass( commonstyle.disabled );
				}
				
				if (cr===totr) {
					$("#nData",frmtb2).addClass( commonstyle.disabled );
				} else if( posarr[1][cr+1] !== undefined && $("#"+$.jgrid.jqID(posarr[1][cr+1])).hasClass( commonstyle.disabled )) {
					$("#nData",frmtb2).addClass( commonstyle.disabled );
				} else {
					$("#nData",frmtb2).removeClass( commonstyle.disabled );
				}
			}
			function getCurrPos() {
				var rowsInGrid =  $($t).jqGrid("getDataIDs"),
				selrow = $("#id_g",frmtb).val(), pos;
				if($t.p.multiselect && rp_ge[$t.p.id].editselected) {
					var arr = [];
					for(var i=0, len = rowsInGrid.length;i<len;i++) {
						if($.inArray(rowsInGrid[i],$t.p.selarrrow) !== -1) {
							arr.push(rowsInGrid[i]);
						}
					}
					pos = $.inArray(selrow,arr);
					return [pos, arr];
				} else {
					pos = $.inArray(selrow,rowsInGrid);
				}
				return [pos,rowsInGrid];
			}
			function parseTemplate ( template ){
				var   tmpl ="";
				if(typeof template === "string") {
					tmpl = template.replace(/\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g, function(m,i){
						return '<span id="'+ i+ '" ></span>';
					});
				}
				return tmpl;
			}
			function syncSavedData () {
				if(rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate) {

					var a1=[], a2={};
					a1 = $.map($t.p.savedData, function(v, i){
						return i;
					});
					$(".FormElement", frm ).each(function(){
						if( $.jgrid.trim(this.name) !== "" && a1.indexOf(this.name) === -1 ) {
							var tv = $(this).val(), tt = $(this).get(0).type;
							if( tt === 'checkbox') {
								if(!$(this).is(":checked")) {
									tv = $(this).attr("offval");
								}
							} else if(tt === 'select-multiple') {
								tv = tv.join(",");
							} else if(tt === 'radio') {
								if(a2.hasOwnProperty(this.name)) {
									return true;
								} else {
									a2[this.name] = ($(this).attr("offval") === undefined) ? "off" : $(this).attr("offval");
								}
							}
							$t.p.savedData[this.name] = tv;
						}
					});
					for(var i in a2 ) {
						if( a2.hasOwnProperty(i)) {
							var val = $('input[name="'+i+'"]:checked',frm).val();
							$t.p.savedData[i] = (val !== undefined) ? val : a2[i];
						}
					}
				}
			}
			var dh = isNaN(rp_ge[$(this)[0].p.id].dataheight) ? rp_ge[$(this)[0].p.id].dataheight : rp_ge[$(this)[0].p.id].dataheight+"px",
			dw = isNaN(rp_ge[$(this)[0].p.id].datawidth) ? rp_ge[$(this)[0].p.id].datawidth : rp_ge[$(this)[0].p.id].datawidth+"px",
			frm = $("<form name='FormPost' id='"+frmgr+"' class='FormGrid' onSubmit='return false;' style='width:"+dw+";height:"+dh+";'></form>").data("disabled",false),
			tbl;
			if(templ) {
				tbl = parseTemplate( rp_ge[$(this)[0].p.id].template );
				frmtb2 = frmtb;
			} else {
				tbl = $("<table id='"+frmtborg+"' class='EditTable ui-common-table'><tbody></tbody></table>");
				frmtb2 = frmtb+"_2";
			}
			frmgr = "#"+ $.jgrid.jqID(frmgr);
			// errors
			$(frm).append("<div class='FormError " + commonstyle.error + "' style='display:none;'></div>" );
			// topinfo
			$(frm).append("<div class='tinfo topinfo'>"+rp_ge[$t.p.id].topinfo+"</div>");

			$($t.p.colModel).each( function() {
				var fmto = this.formoptions;
				maxCols = Math.max(maxCols, fmto ? fmto.colpos || 0 : 0 );
				maxRows = Math.max(maxRows, fmto ? fmto.rowpos || 0 : 0 );
			});
			$(frm).append(tbl);

			showFrm = $($t).triggerHandler("jqGridAddEditBeforeInitData", [frm, frmoper]);
			if(showFrm === undefined) {
				showFrm = true;
			}
			if(showFrm && $.jgrid.isFunction(rp_ge[$t.p.id].beforeInitData)) {
				showFrm = rp_ge[$t.p.id].beforeInitData.call($t,frm, frmoper);
			}
			if(showFrm === false) {return;}

			restoreInline();
			// set the id.
			// use carefull only to change here colproperties.
			// create data
			createData(rowid,$t,tbl,maxCols);
			// buttons at footer
			var rtlb = $t.p.direction === "rtl" ? true :false,
			bp = rtlb ? "nData" : "pData",
			bn = rtlb ? "pData" : "nData";
			var bP = "<a id='"+bp+"' class='fm-button " + commonstyle.button + "'><span class='" + commonstyle.icon_base + " " + styles.icon_prev+ "'></span></a>",
			bN = "<a id='"+bn+"' class='fm-button " + commonstyle.button + "'><span class='" + commonstyle.icon_base + " " + styles.icon_next+ "'></span></a>",
			bS  ="<a id='sData' class='fm-button " + commonstyle.button + "'>"+p.bSubmit+"</a>",
			bC  ="<a id='cData' class='fm-button " + commonstyle.button + "'>"+p.bCancel+"</a>",
			user_buttons = ( Array.isArray( rp_ge[$t.p.id].buttons ) ? $.jgrid.buildButtons( rp_ge[$t.p.id].buttons, bS + bC, commonstyle ) : bS + bC );
			var bt = "<table style='height:auto' class='EditTable ui-common-table' id='"+frmtborg+"_2'><tbody><tr><td colspan='2'><hr class='"+commonstyle.content+"' style='margin:1px'/></td></tr><tr id='Act_Buttons'><td class='navButton'>"+(rtlb ? bN+bP : bP+bN)+"</td><td class='EditButton'>"+ user_buttons +"</td></tr>";
			//bt += "<tr style='display:none' class='binfo'><td class='bottominfo' colspan='2'>"+rp_ge[$t.p.id].bottominfo+"</td></tr>";
			bt += "</tbody></table>";
			if(maxRows >  0) {
				var sd=[];
				$.each($(tbl)[0].rows,function(i,r){
					sd[i] = r;
				});
				sd.sort(function(a,b){
					if(a.rp > b.rp) {return 1;}
					if(a.rp < b.rp) {return -1;}
					return 0;
				});
				$.each(sd, function(index, row) {
					$('tbody',tbl).append(row);
				});
			}
			p.gbox = "#gbox_"+$.jgrid.jqID(gID);
			var cle = false;
			if(p.closeOnEscape===true){
				p.closeOnEscape = false;
				cle = true;
			}
			var tms;
			if(templ) {
				$(frm).find("#pData").replaceWith( bP );
				$(frm).find("#nData").replaceWith( bN );
				$(frm).find("#sData").replaceWith( bS );
				$(frm).find("#cData").replaceWith( bC );
				tms = $("<div id="+frmtborg+"></div>").append(frm);
			} else {
				tms = $("<div></div>").append(frm).append(bt);
			}
			
			$(frm).append("<div class='binfo topinfo bottominfo'>"+rp_ge[$t.p.id].bottominfo+"</div>");
			var fs =  $('.ui-jqgrid').css('font-size') || '11px';
			$.jgrid.createModal(IDs, tms, rp_ge[$(this)[0].p.id], "#gview_"+$.jgrid.jqID($t.p.id), $("#gbox_"+$.jgrid.jqID($t.p.id))[0], null, {"font-size": fs});

			if(rtlb) {
				$("#pData, #nData",frmtb+"_2").css("float","right");
				$(".EditButton",frmtb+"_2").css("text-align","left");
			}

			if(rp_ge[$t.p.id].topinfo) {$(".tinfo", frmgr).show();}
			if(rp_ge[$t.p.id].bottominfo) {$(".binfo",frmgr).show();}

			tms = null;bt=null;
			$("#"+$.jgrid.jqID(IDs.themodal)).keydown( function( e ) {
				var wkey = e.target;
				if ($(frmgr).data("disabled")===true ) {return false;}//??
				if(rp_ge[$t.p.id].savekey[0] === true && e.which === rp_ge[$t.p.id].savekey[1]) { // save
					if(wkey.tagName !== "TEXTAREA") {
						$("#sData", frmtb+"_2").trigger("click");
						return false;
					}
				}
				if(e.which === 27) {
					if(!checkUpdates()) {return false;}
					if(cle)	{$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:p.gbox,jqm:p.jqModal, onClose: rp_ge[$t.p.id].onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});}
					return false;
				}
				if(rp_ge[$t.p.id].navkeys[0]===true) {
					if($("#id_g",frmtb).val() === "_empty") {return true;}
					if(e.which === rp_ge[$t.p.id].navkeys[1]){ //up
						$("#pData", frmtb2).trigger("click");
						return false;
					}
					if(e.which === rp_ge[$t.p.id].navkeys[2]){ //down
						$("#nData", frmtb2).trigger("click");
						return false;
					}
				}
			});
			if(p.checkOnUpdate) {
				$("a.ui-jqdialog-titlebar-close span","#"+$.jgrid.jqID(IDs.themodal)).removeClass("jqmClose");
				$("a.ui-jqdialog-titlebar-close","#"+$.jgrid.jqID(IDs.themodal)).off("click")
				.click(function(){
					if(!checkUpdates()) {return false;}
					$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal,onClose: rp_ge[$t.p.id].onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});
					return false;
				});
			}
			p.saveicon = $.extend([true,"left", styles.icon_save ],p.saveicon);
			p.closeicon = $.extend([true,"left", styles.icon_close ],p.closeicon);
			// beforeinitdata after creation of the form
			if(p.saveicon[0]===true) {
				$("#sData",frmtb2).addClass(p.saveicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
				.append("<span class='"+commonstyle.icon_base + " " +p.saveicon[2]+"'></span>");
			}
			if(p.closeicon[0]===true) {
				$("#cData",frmtb2).addClass(p.closeicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
				.append("<span class='" + commonstyle.icon_base +" "+p.closeicon[2]+"'></span>");
			}
			if(rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate) {
				bS  ="<a id='sNew' class='fm-button "+commonstyle.button + "' style='z-index:1002'>"+p.bYes+"</a>";
				bN  ="<a id='nNew' class='fm-button "+commonstyle.button + "' style='z-index:1002;margin-left:5px'>"+p.bNo+"</a>";
				bC  ="<a id='cNew' class='fm-button "+commonstyle.button + "' style='z-index:1002;margin-left:5px;'>"+p.bExit+"</a>";
				var zI = p.zIndex  || 999;zI ++;
				$("#"+IDs.themodal).append("<div class='"+ p.overlayClass+" jqgrid-overlay confirm' style='z-index:"+zI+";display:none;position:absolute;'>&#160;"+"</div><div class='confirm ui-jqconfirm "+commonstyle.content+"' style='z-index:"+(zI+1)+"'>"+p.saveData+"<br/><br/>"+bS+bN+bC+"</div>");
				$("#sNew","#"+$.jgrid.jqID(IDs.themodal)).click(function(){
					postIt();
					$(frmgr).data("disabled",false);
					$(".confirm","#"+$.jgrid.jqID(IDs.themodal)).hide();
					return false;
				});
				$("#nNew","#"+$.jgrid.jqID(IDs.themodal)).click(function(){
					$(".confirm","#"+$.jgrid.jqID(IDs.themodal)).hide();
					$(frmgr).data("disabled",false);
					setTimeout(function(){$(":input:visible",frmgr)[0].focus();},0);
					return false;
				});
				$("#cNew","#"+$.jgrid.jqID(IDs.themodal)).click(function(){
					$(".confirm","#"+$.jgrid.jqID(IDs.themodal)).hide();
					$(frmgr).data("disabled",false);
					$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal,onClose: rp_ge[$t.p.id].onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});
					return false;
				});
			}
			// here initform 
			$($t).triggerHandler("jqGridAddEditInitializeForm", [$(frmgr), frmoper]);
			if($.jgrid.isFunction(rp_ge[$t.p.id].onInitializeForm)) { rp_ge[$t.p.id].onInitializeForm.call($t,$(frmgr), frmoper);}
			if(rowid==="_empty" || !rp_ge[$t.p.id].viewPagerButtons) {$("#pData,#nData",frmtb2).hide();} else {$("#pData,#nData",frmtb2).show();}
			$($t).triggerHandler("jqGridAddEditBeforeShowForm", [$(frmgr), frmoper]);
			if($.jgrid.isFunction(rp_ge[$t.p.id].beforeShowForm)) { rp_ge[$t.p.id].beforeShowForm.call($t, $(frmgr), frmoper);}
			syncSavedData();
			$("#"+$.jgrid.jqID(IDs.themodal)).data("onClose",rp_ge[$t.p.id].onClose);
			$.jgrid.viewModal("#"+$.jgrid.jqID(IDs.themodal),{
				gbox:"#gbox_"+$.jgrid.jqID(gID),
				jqm:p.jqModal, 
				overlay: p.overlay,
				modal:p.modal, 
				overlayClass: p.overlayClass,
				focusField : p.focusField,
				onHide :  function(h) {
					var fw = $('#editmod'+gID)[0].style.width ,
						//rtlsup = $("#gbox_"+$.jgrid.jqID(gID)).attr("dir") === "rtl" ? true : false,
						mdh = $('#editmod'+gID)[0].style.height;
						mdh = ['100%','auto'].includes(mdh) ? mdh : $.jgrid.floatNum(mdh, 200);
						fw = ['100%','auto'].includes(fw) ? fw : $.jgrid.floatNum(fw, 300);
					$($t).data("formProp", {
						top: $.jgrid.floatNum($(h.w).css("top")),
						left :  parseFloat($(h.w).css("left")),
						width : fw,
						height :  mdh ,
						dataheight : $(frmgr).height(),
						datawidth: $(frmgr).width()
					});
					h.w.remove();
					if(h.o) {h.o.remove();}
				}
			});
			if(!closeovrl) {
				$("." + $.jgrid.jqID(p.overlayClass)).click(function(){
					if(!checkUpdates()) {return false;}
					$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal, onClose: rp_ge[$t.p.id].onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});
					return false;
				});
			}
			$(".fm-button","#"+$.jgrid.jqID(IDs.themodal)).hover(
				function(){$(this).addClass( commonstyle.hover );},
				function(){$(this).removeClass( commonstyle.hover );}
			);
			$("#sData", frmtb2).click(function(){
				postdata = {};
				$(".FormError",frmgr).hide();
				// all depend on ret array
				//ret[0] - succes
				//ret[1] - msg if not succes
				//ret[2] - the id  that will be set if reload after submit false
				getFormData();
				if(postdata[$t.p.id+"_id"] === "_empty")	{
					postIt();
				} else if(p.checkOnSubmit===true ) {
					diff = compareData(postdata, $t.p.savedData);
					if(diff) {
						$(frmgr).data("disabled",true);
						$(".confirm","#"+$.jgrid.jqID(IDs.themodal)).show();
					} else {
						postIt();
					}
				} else {
					postIt();
				}
				return false;
			});
			$("#cData", frmtb2).click(function(){
				if(!checkUpdates()) {return false;}
				$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal,onClose: rp_ge[$t.p.id].onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});
				return false;
			});
			// user buttons bind
			$(frmtb2).find("[data-index]").each(function(){
				var index = parseInt($(this).attr('data-index'),10);
				if(index >=0 ) {
					if( p.buttons[index].hasOwnProperty('click')) {
						$(this).on('click', function(e) {
							p.buttons[index].click.call($t, $(frmgr)[0], rp_ge[$t.p.id], e);
						});
					}
				}
			});

			$("#nData", frmtb2).click(function(){
				if(!checkUpdates()) {return false;}
				$(".FormError",frmgr).hide();
				var npos = getCurrPos();
				npos[0] = parseInt(npos[0],10);
				if(npos[0] !== -1 && npos[1][npos[0]+1]) {
					$($t).triggerHandler("jqGridAddEditClickPgButtons", ['next',$(frmgr),npos[1][npos[0]]]);
					var nposret;
					if($.jgrid.isFunction(p.onclickPgButtons)) {
						nposret = p.onclickPgButtons.call($t, 'next',$(frmgr),npos[1][npos[0]]);
						if( nposret !== undefined && nposret === false ) {return false;}
					}
					if( $("#"+$.jgrid.jqID(npos[1][npos[0]+1])).hasClass( commonstyle.disabled )) {return false;}
					fillData(npos[1][npos[0]+1],$t,frmgr);
					if(!($t.p.multiselect &&  rp_ge[$t.p.id].editselected)) {
						$($t).jqGrid("setSelection",npos[1][npos[0]+1]);
					}
					$($t).triggerHandler("jqGridAddEditAfterClickPgButtons", ['next',$(frmgr),npos[1][npos[0]]]);
					if($.jgrid.isFunction(p.afterclickPgButtons)) {
						p.afterclickPgButtons.call($t, 'next',$(frmgr),npos[1][npos[0]+1]);
					}
					syncSavedData();
					updateNav(npos[0]+1,npos);
				}
				return false;
			});
			$("#pData", frmtb2).click(function(){
				if(!checkUpdates()) {return false;}
				$(".FormError",frmgr).hide();
				var ppos = getCurrPos();
				if(ppos[0] !== -1 && ppos[1][ppos[0]-1]) {
					$($t).triggerHandler("jqGridAddEditClickPgButtons", ['prev',$(frmgr),ppos[1][ppos[0]]]);
					var pposret;
					if($.jgrid.isFunction(p.onclickPgButtons)) {
						pposret = p.onclickPgButtons.call($t, 'prev',$(frmgr),ppos[1][ppos[0]]);
						if( pposret !== undefined && pposret === false ) {return false;}
					}
					if( $("#"+$.jgrid.jqID(ppos[1][ppos[0]-1])).hasClass( commonstyle.disabled )) {return false;}
					fillData(ppos[1][ppos[0]-1],$t,frmgr);
					if(!($t.p.multiselect &&  rp_ge[$t.p.id].editselected)) {
						$($t).jqGrid("setSelection",ppos[1][ppos[0]-1]);
					}
					$($t).triggerHandler("jqGridAddEditAfterClickPgButtons", ['prev',$(frmgr),ppos[1][ppos[0]]]);
					if($.jgrid.isFunction(p.afterclickPgButtons)) {
						p.afterclickPgButtons.call($t, 'prev',$(frmgr),ppos[1][ppos[0]-1]);
					}
					syncSavedData();
					updateNav(ppos[0]-1,ppos);
				}
				return false;
			});
			$($t).triggerHandler("jqGridAddEditAfterShowForm", [$(frmgr), frmoper]);
			if($.jgrid.isFunction(rp_ge[$t.p.id].afterShowForm)) { rp_ge[$t.p.id].afterShowForm.call($t, $(frmgr), frmoper); }
			var posInit =getCurrPos();
			updateNav(posInit[0],posInit);
			this.refreshEditForm = function( rid, force ) {
				if ( force === undefined) {
					force = false;
				}
				if( force || rowid === rid) {
					fillData(rid, this, frmgr);
				}
				if(force) {
					rowid = rid;
				}
			};
		});
	},
	viewGridRow : function(rowid, p){
		var regional =  $.jgrid.getRegional(this[0], 'view'),
			currstyle = this[0].p.styleUI,
			styles = $.jgrid.styleUI[currstyle].formedit,
			commonstyle = $.jgrid.styleUI[currstyle].common;

		p = $.extend(true, {
			top : 0,
			left: 0,
			width: 500,
			datawidth: 'auto',
			height: 'auto',
			dataheight: 'auto',
			modal: false,
			overlay: 30,
			drag: true,
			resize: true,
			jqModal: true,
			closeOnEscape : false,
			labelswidth: 'auto',
			closeicon: [],
			navkeys: [false,38,40],
			onClose: null,
			beforeShowForm : null,
			beforeInitData : null,
			viewPagerButtons : true,
			recreateForm : false,
			removemodal: true,
			form: 'view',
			buttons : []
		}, regional, p || {});
		rp_ge[$(this)[0].p.id] = p;
		return this.each(function(){
			var $t = this;
			if (!$t.grid || !rowid) {return;}
			var gID = $t.p.id,
			frmgr = "ViewGrid_"+$.jgrid.jqID( gID  ), frmtb = "ViewTbl_" + $.jgrid.jqID( gID ),
			frmgr_id = "ViewGrid_"+gID, frmtb_id = "ViewTbl_"+gID,
			IDs = {themodal:'viewmod'+gID,modalhead:'viewhd'+gID,modalcontent:'viewcnt'+gID, scrollelm : frmgr},
			showFrm = true,
			maxCols = 1, maxRows=0;
			rp_ge[$t.p.id].styleUI = $t.p.styleUI || 'jQueryUI';
			if(!p.recreateForm) {
				if( $($t).data("viewProp") ) {
					$.extend(rp_ge[$(this)[0].p.id], $($t).data("viewProp"));
				}
			}
			function focusaref(){ //Sfari 3 issues
				if(rp_ge[$t.p.id].closeOnEscape===true || rp_ge[$t.p.id].navkeys[0]===true) {
					setTimeout(function(){$(".ui-jqdialog-titlebar-close","#"+$.jgrid.jqID(IDs.modalhead)).attr("tabindex", "-1").focus();},0);
				}
			}
			function createData(rowid,obj,tb,maxcols){
				var nm, hc,trdata, cnt=0,tmp, dc, retpos=[], ind=false, i,
				tdtmpl = "<td class='CaptionTD form-view-label " + commonstyle.content + "' width='"+p.labelswidth+"'></td><td class='DataTD form-view-data ui-helper-reset "  + commonstyle.content +"'></td>", tmpl="",
				tdtmpl2 = "<td class='CaptionTD form-view-label " + commonstyle.content +"'></td><td class='DataTD form-view-data " + commonstyle.content +"'></td>",
				fmtnum = ['integer','number','currency'],max1 =0, max2=0 ,maxw,setme, viewfld;
				for (i=1;i<=maxcols;i++) {
					tmpl += i === 1 ? tdtmpl : tdtmpl2;
				}
				// find max number align rigth with property formatter
				$(obj.p.colModel).each( function() {
					if(this.editrules && this.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = this.hidden === true ? true : false;
					}
					if(!hc && this.align==='right') {
						if(this.formatter && $.inArray(this.formatter,fmtnum) !== -1 ) {
							max1 = Math.max(max1,parseInt(this.width,10));
						} else {
							max2 = Math.max(max2,parseInt(this.width,10));
						}
					}
				});
				maxw  = max1 !==0 ? max1 : max2 !==0 ? max2 : 0;
				ind = $(obj).jqGrid("getInd",rowid);
				$(obj.p.colModel).each( function(i) {
					nm = this.name;
					setme = false;
					// hidden fields are included in the form
					if(this.editrules && this.editrules.edithidden === true) {
						hc = false;
					} else {
						hc = this.hidden === true ? true : false;
					}
					dc = hc ? "style='display:none'" : "";
					viewfld = (typeof this.viewable !== 'boolean') ? true : this.viewable;
					if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn' && viewfld && nm !== 'sc') {
						if(ind === false) {
							tmp = "";
						} else {
							if(nm === obj.p.ExpandColumn && obj.p.treeGrid === true) {
								tmp = $("td",obj.rows[ind]).eq( i ).text();
							} else {
								tmp = $("td",obj.rows[ind]).eq( i ).html();
							}
						}
						setme = this.align === 'right' && maxw !==0 ? true : false;
						var frmopt = $.extend({},{rowabove:false,rowcontent:''}, this.formoptions || {}),
						rp = parseInt(frmopt.rowpos,10) || cnt+1,
						cp = parseInt((parseInt(frmopt.colpos,10) || 1)*2,10);
						if(frmopt.rowabove) {
							var newdata = $("<tr><td class='contentinfo' colspan='"+(maxcols*2)+"'>"+frmopt.rowcontent+"</td></tr>");
							$(tb).append(newdata);
							newdata[0].rp = rp;
						}
						trdata = $(tb).find("tr[rowpos="+rp+"]");
						if ( trdata.length===0 ) {
							trdata = $("<tr "+dc+" rowpos='"+rp+"'></tr>").addClass("FormData").attr("id","trv_"+nm);
							$(trdata).append(tmpl);
							$(tb).append(trdata);
							trdata[0].rp = rp;
						}
						$("td",trdata[0]).eq( cp-2 ).html('<b>'+ (frmopt.label === undefined ? obj.p.colNames[i]: frmopt.label)+'</b>');
						$("td",trdata[0]).eq( cp-1 ).append("<span>"+tmp+"</span>").attr("id","v_"+nm);
						if(setme){
							$("td",trdata[0]).eq( cp-1 ).find('span').css({ 'text-align':'right',width:maxw+"px" });
						}
						retpos[cnt] = i;
						cnt++;
					}
				});
				if( cnt > 0) {
					var idrow = $("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='"+ (maxcols*2-1)+"' class='DataTD'><input class='FormElement' id='id_g' type='text' name='id' value='"+rowid+"'/></td></tr>");
					idrow[0].rp = cnt+99;
					$(tb).append(idrow);
				}
				return retpos;
			}
			function fillData(rowid,obj){
				var nm, hc,cnt=0,tmp,trv;
				trv = $(obj).jqGrid("getInd",rowid,true);
				if(!trv) {return;}
				$('td',trv).each( function(i) {
					nm = obj.p.colModel[i].name;
					// hidden fields are included in the form
					if(obj.p.colModel[i].editrules && obj.p.colModel[i].editrules.edithidden === true) {
						hc = false;
					} else {
						hc = obj.p.colModel[i].hidden === true ? true : false;
					}
					if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn' && nm !== 'sc') {
						if(nm === obj.p.ExpandColumn && obj.p.treeGrid === true) {
							tmp = $(this).text();
						} else {
							tmp = $(this).html();
						}
						nm = $.jgrid.jqID("v_"+nm);
						$("#"+nm+" span","#"+frmtb).html(tmp);
						if (hc) {$("#"+nm,"#"+frmtb).parents("tr").first().hide();}
						cnt++;
					}
				});
				if(cnt>0) {$("#id_g","#"+frmtb).val(rowid);}
			}
			function updateNav(cr,posarr){
				var totr = posarr[1].length-1;
				if (cr===0) {
					$("#pData","#"+frmtb+"_2").addClass( commonstyle.disabled );
				} else if( posarr[1][cr-1] !== undefined && $("#"+$.jgrid.jqID(posarr[1][cr-1])).hasClass(commonstyle.disabled)) {
					$("#pData",frmtb+"_2").addClass( commonstyle.disabled );
				} else {
					$("#pData","#"+frmtb+"_2").removeClass( commonstyle.disabled );
				}
				if (cr===totr) {
					$("#nData","#"+frmtb+"_2").addClass( commonstyle.disabled );
				} else if( posarr[1][cr+1] !== undefined && $("#"+$.jgrid.jqID(posarr[1][cr+1])).hasClass( commonstyle.disabled )) {
					$("#nData",frmtb+"_2").addClass( commonstyle.disabled );
				} else {
					$("#nData","#"+frmtb+"_2").removeClass( commonstyle.disabled );
				}
			}
			function getCurrPos() {
				var rowsInGrid =  $($t).jqGrid("getDataIDs"),
				selrow = $("#id_g","#"+frmtb).val(), pos;
				if($t.p.multiselect && rp_ge[$t.p.id].viewselected) {
					var arr = [];
					for(var i=0, len = rowsInGrid.length;i<len;i++) {
						if($.inArray(rowsInGrid[i],$t.p.selarrrow) !== -1) {
							arr.push(rowsInGrid[i]);
						}
					}
					pos = $.inArray(selrow,arr);
					return [pos, arr];
				} else {
					pos = $.inArray(selrow,rowsInGrid);
				}
				return [pos,rowsInGrid];
			}

			var dh = isNaN(rp_ge[$(this)[0].p.id].dataheight) ? rp_ge[$(this)[0].p.id].dataheight : rp_ge[$(this)[0].p.id].dataheight+"px",
			dw = isNaN(rp_ge[$(this)[0].p.id].datawidth) ? rp_ge[$(this)[0].p.id].datawidth : rp_ge[$(this)[0].p.id].datawidth+"px",
			frm = $("<form name='FormPost' id='"+frmgr_id+"' class='FormGrid' style='width:"+dw+";height:"+dh+";'></form>"),
			tbl =$("<table id='"+frmtb_id+"' class='EditTable ViewTable'><tbody></tbody></table>");
			$($t.p.colModel).each( function() {
				var fmto = this.formoptions;
				maxCols = Math.max(maxCols, fmto ? fmto.colpos || 0 : 0 );
				maxRows = Math.max(maxRows, fmto ? fmto.rowpos || 0 : 0 );
			});
			// set the id.
			$(frm).append(tbl);
			showFrm = $($t).triggerHandler("jqGridViewRowBeforeInitData", [frm]);
			if(showFrm === undefined) {
				showFrm = true;
			}
			if(showFrm && $.jgrid.isFunction(rp_ge[$t.p.id].beforeInitData)) {
				showFrm = rp_ge[$t.p.id].beforeInitData.call($t, frm);
			}
			if(showFrm === false) {return;}

			createData(rowid, $t, tbl, maxCols);
			var rtlb = $t.p.direction === "rtl" ? true :false,
			bp = rtlb ? "nData" : "pData",
			bn = rtlb ? "pData" : "nData",
				// buttons at footer
			bP = "<a id='"+bp+"' class='fm-button " + commonstyle.button + "'><span class='" + commonstyle.icon_base + " " + styles.icon_prev+ "'></span></a>",
			bN = "<a id='"+bn+"' class='fm-button " + commonstyle.button + "'><span class='" + commonstyle.icon_base + " " + styles.icon_next+ "'></span></a>",
			bC  ="<a id='cData' class='fm-button " + commonstyle.button + "'>"+p.bClose+"</a>",
			user_buttons = ( Array.isArray( rp_ge[$t.p.id].buttons ) ? $.jgrid.buildButtons( rp_ge[$t.p.id].buttons, bC, commonstyle ) : bC );
			if(maxRows >  0) {
				var sd=[];
				$.each($(tbl)[0].rows,function(i,r){
					sd[i] = r;
				});
				sd.sort(function(a,b){
					if(a.rp > b.rp) {return 1;}
					if(a.rp < b.rp) {return -1;}
					return 0;
				});
				$.each(sd, function(index, row) {
					$('tbody',tbl).append(row);
				});
			}
			p.gbox = "#gbox_"+$.jgrid.jqID(gID);
			var bt = $("<div></div>").append(frm).append("<table border='0' class='EditTable' id='"+frmtb+"_2'><tbody><tr id='Act_Buttons'><td class='navButton' width='"+p.labelswidth+"'>"+(rtlb ? bN+bP : bP+bN)+"</td><td class='EditButton'>"+ user_buttons+"</td></tr></tbody></table>"),
			fs =  $('.ui-jqgrid').css('font-size') || '11px';
			
			$.jgrid.createModal(IDs,bt, rp_ge[$(this)[0].p.id],"#gview_"+$.jgrid.jqID($t.p.id),$("#gview_"+$.jgrid.jqID($t.p.id))[0], null, {"font-size":fs});
			if(rtlb) {
				$("#pData, #nData","#"+frmtb+"_2").css("float","right");
				$(".EditButton","#"+frmtb+"_2").css("text-align","left");
			}
			if(!p.viewPagerButtons) {$("#pData, #nData","#"+frmtb+"_2").hide();}
			bt = null;
			$("#"+IDs.themodal).keydown( function( e ) {
				if(e.which === 27) {
					if(rp_ge[$t.p.id].closeOnEscape) {$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:p.gbox,jqm:p.jqModal, onClose: p.onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});}
					return false;
				}
				if(p.navkeys[0]===true) {
					if(e.which === p.navkeys[1]){ //up
						$("#pData", "#"+frmtb+"_2").trigger("click");
						return false;
					}
					if(e.which === p.navkeys[2]){ //down
						$("#nData", "#"+frmtb+"_2").trigger("click");
						return false;
					}
				}
			});
			p.closeicon = $.extend([true,"left", styles.icon_close ],p.closeicon);
			if(p.closeicon[0]===true) {
				$("#cData","#"+frmtb+"_2").addClass(p.closeicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
				.append("<span class='" + commonstyle.icon_base+ " " +p.closeicon[2]+"'></span>");
			}
			$($t).triggerHandler("jqGridViewRowBeforeShowForm", [$("#"+frmgr)]);
			if($.jgrid.isFunction(p.beforeShowForm)) {p.beforeShowForm.call($t,$("#"+frmgr));}

			$.jgrid.viewModal("#"+$.jgrid.jqID(IDs.themodal),{
				gbox:"#gbox_"+$.jgrid.jqID(gID),
				jqm:p.jqModal,
				overlay: p.overlay, 
				modal:p.modal,
				onHide :  function(h) {
					var rtlsup = $("#gbox_"+$.jgrid.jqID(gID)).attr("dir") === "rtl" ? true : false,
						fw = parseFloat($('#viewmod'+gID)[0].style.width);
					$($t).data("viewProp", {
						top:parseFloat($(h.w).css("top")),
						left : rtlsup ? ( $("#gbox_"+$.jgrid.jqID(gID)).outerWidth() - fw - parseFloat($(h.w).css("left")) + 12 ) : parseFloat($(h.w).css("left")),
						width : $(h.w).width(),
						height : $(h.w).height(),
						dataheight : $("#"+frmgr).height(),
						datawidth: $("#"+frmgr).width()
					});
					h.w.remove();
					if(h.o) {h.o.remove();}
				}
			});
			$(".fm-button:not(." + commonstyle.disabled + ")","#"+frmtb+"_2").hover(
				function(){$(this).addClass( commonstyle.hover );},
				function(){$(this).removeClass( commonstyle.hover );}
			);
			focusaref();
			$("#cData", "#"+frmtb+"_2").click(function(){
				$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal, onClose: p.onClose, removemodal: rp_ge[$t.p.id].removemodal, formprop: !rp_ge[$t.p.id].recreateForm, form: rp_ge[$t.p.id].form});
				return false;
			});
			$("#"+frmtb+"_2").find("[data-index]").each(function(){
				var index = parseInt($(this).attr('data-index'),10);
				if(index >=0 ) {
					if( p.buttons[index].hasOwnProperty('click')) {
						$(this).on('click', function(e) {
							p.buttons[index].click.call($t, $("#"+frmgr_id)[0], rp_ge[$t.p.id], e);
						});
					}
				}
			});

			$("#nData", "#"+frmtb+"_2").click(function(){
				$("#FormError","#"+frmtb).hide();
				var npos = getCurrPos();
				npos[0] = parseInt(npos[0],10);
				if(npos[0] !== -1 && npos[1][npos[0]+1]) {
					$($t).triggerHandler("jqGridViewRowClickPgButtons", ['next',$("#"+frmgr),npos[1][npos[0]]]);
					if($.jgrid.isFunction(p.onclickPgButtons)) {
						p.onclickPgButtons.call($t,'next',$("#"+frmgr),npos[1][npos[0]]);
					}
					fillData(npos[1][npos[0]+1],$t);
					if(!($t.p.multiselect &&  rp_ge[$t.p.id].viewselected)) {
						$($t).jqGrid("setSelection",npos[1][npos[0]+1]);
					}
					$($t).triggerHandler("jqGridViewRowAfterClickPgButtons", ['next',$("#"+frmgr),npos[1][npos[0]+1]]);
					if($.jgrid.isFunction(p.afterclickPgButtons)) {
						p.afterclickPgButtons.call($t,'next',$("#"+frmgr),npos[1][npos[0]+1]);
					}
					updateNav(npos[0]+1,npos);
				}
				focusaref();
				return false;
			});
			$("#pData", "#"+frmtb+"_2").click(function(){
				$("#FormError","#"+frmtb).hide();
				var ppos = getCurrPos();
				if(ppos[0] !== -1 && ppos[1][ppos[0]-1]) {
					$($t).triggerHandler("jqGridViewRowClickPgButtons", ['prev',$("#"+frmgr),ppos[1][ppos[0]]]);
					if($.jgrid.isFunction(p.onclickPgButtons)) {
						p.onclickPgButtons.call($t,'prev',$("#"+frmgr),ppos[1][ppos[0]]);
					}
					fillData(ppos[1][ppos[0]-1],$t);
					if(!($t.p.multiselect &&  rp_ge[$t.p.id].viewselected)) {
						$($t).jqGrid("setSelection",ppos[1][ppos[0]-1]);
					}
					$($t).triggerHandler("jqGridViewRowAfterClickPgButtons", ['prev',$("#"+frmgr),ppos[1][ppos[0]-1]]);
					if($.jgrid.isFunction(p.afterclickPgButtons)) {
						p.afterclickPgButtons.call($t,'prev',$("#"+frmgr),ppos[1][ppos[0]-1]);
					}
					updateNav(ppos[0]-1,ppos);
				}
				focusaref();
				return false;
			});
			var posInit =getCurrPos();
			updateNav(posInit[0],posInit);
			this.refreshViewForm = function( rid, force ) {
				if ( force === undefined) {
					force = false;
				}
				if( force || rowid === rid) {
					fillData(rid, this);
				}
				if(force) {
					rowid = rid;
				}
			};
		});
	},
	delGridRow : function(rowids,p) {
		var regional =  $.jgrid.getRegional(this[0], 'del'),
			currstyle = this[0].p.styleUI,
			styles = $.jgrid.styleUI[currstyle].formedit,
			commonstyle = $.jgrid.styleUI[currstyle].common;

		p = $.extend(true, {
			top : 0,
			left: 0,
			width: 300,
			height: 'auto',
			dataheight : 'auto',
			modal: false,
			overlay: 30,
			drag: true,
			resize: true,
			url : '',
			mtype : "POST",
			reloadAfterSubmit: true,
			beforeShowForm: null,
			beforeInitData : null,
			afterShowForm: null,
			beforeSubmit: null,
			onclickSubmit: null,
			afterSubmit: null,
			jqModal : true,
			closeOnEscape : false,
			delData: {},
			delicon : [],
			cancelicon : [],
			onClose : null,
			ajaxDelOptions : {},
			processing : false,
			serializeDelData : null,
			useDataProxy : false
		}, regional, p ||{});
		rp_ge[$(this)[0].p.id] = p;
		return this.each(function(){
			var $t = this;
			if (!$t.grid ) {return;}
			if(!rowids) {return;}
			var gID = $t.p.id, onCS = {},
			showFrm = true,
			dtbl = "DelTbl_"+$.jgrid.jqID(gID),postd, idname, opers, oper,
			dtbl_id = "DelTbl_" + gID,
			IDs = {themodal:'delmod'+gID,modalhead:'delhd'+gID,modalcontent:'delcnt'+gID, scrollelm: dtbl};
			rp_ge[$t.p.id].styleUI = $t.p.styleUI || 'jQueryUI';
			if (Array.isArray(rowids)) {rowids = rowids.join();}
			if ( $("#"+$.jgrid.jqID(IDs.themodal))[0] !== undefined ) {

				showFrm = $($t).triggerHandler("jqGridDelRowBeforeInitData", [$("#"+dtbl)]);
				if(showFrm === undefined) {
					showFrm = true;
				}
				if(showFrm && $.jgrid.isFunction(rp_ge[$t.p.id].beforeInitData)) {
					showFrm = rp_ge[$t.p.id].beforeInitData.call($t, $("#"+dtbl));
				}
				if(showFrm === false) {return;}

				$("#DelData>td","#"+dtbl).text(rowids);
				$("#DelError","#"+dtbl).hide();
				if( rp_ge[$t.p.id].processing === true) {
					rp_ge[$t.p.id].processing=false;
					$("#dData", "#"+dtbl).removeClass( commonstyle.active );
				}
				$($t).triggerHandler("jqGridDelRowBeforeShowForm", [$("#"+dtbl)]);
				if($.jgrid.isFunction( rp_ge[$t.p.id].beforeShowForm  )) {
					rp_ge[$t.p.id].beforeShowForm.call($t,$("#"+dtbl));
				}
				$.jgrid.viewModal("#"+$.jgrid.jqID(IDs.themodal),{gbox:"#gbox_"+$.jgrid.jqID(gID),jqm:rp_ge[$t.p.id].jqModal, overlay: rp_ge[$t.p.id].overlay, modal:rp_ge[$t.p.id].modal});
				$($t).triggerHandler("jqGridDelRowAfterShowForm", [$("#"+dtbl)]);
				if($.jgrid.isFunction( rp_ge[$t.p.id].afterShowForm )) {
					rp_ge[$t.p.id].afterShowForm.call($t, $("#"+dtbl));
				}
			} else {
				var dh = isNaN(rp_ge[$t.p.id].dataheight) ? rp_ge[$t.p.id].dataheight : rp_ge[$t.p.id].dataheight+"px",
				dw = isNaN(p.datawidth) ? p.datawidth : p.datawidth+"px",
				tbl = "<div id='"+dtbl_id+"' class='formdata' style='width:"+dw+";overflow:auto;position:relative;height:"+dh+";'>";
				tbl += "<table class='DelTable'><tbody>";
				// error data
				tbl += "<tr id='DelError' style='display:none'><td class='" + commonstyle.error +"'></td></tr>";
				tbl += "<tr id='DelData' style='display:none'><td >"+rowids+"</td></tr>";
				tbl += "<tr><td class=\"delmsg\" style=\"white-space:pre;\">"+rp_ge[$t.p.id].msg+"</td></tr><tr><td >&#160;</td></tr>";
				// buttons at footer
				tbl += "</tbody></table></div>";
				var bS  = "<a id='dData' class='fm-button " + commonstyle.button + "'>"+p.bSubmit+"</a>",
				bC  = "<a id='eData' class='fm-button " + commonstyle.button + "'>"+p.bCancel+"</a>",
				user_buttons = ( Array.isArray( rp_ge[$t.p.id].buttons ) ? $.jgrid.buildButtons( rp_ge[$t.p.id].buttons, bS + bC, commonstyle ) : bS + bC ),
				fs =  $('.ui-jqgrid').css('font-size') || '11px';

				tbl += "<table class='EditTable ui-common-table' id='"+dtbl+"_2'><tbody><tr><td><hr class='" + commonstyle.content + "' style='margin:1px'/></td></tr><tr><td class='DelButton EditButton'>"+ user_buttons +"</td></tr></tbody></table>";
				p.gbox = "#gbox_"+$.jgrid.jqID(gID);
				$.jgrid.createModal(IDs,tbl, rp_ge[$t.p.id] ,"#gview_"+$.jgrid.jqID($t.p.id),$("#gview_"+$.jgrid.jqID($t.p.id))[0], null, {"font-size": fs});

				$(".fm-button","#"+dtbl+"_2").hover(
					function(){$(this).addClass( commonstyle.hover );},
					function(){$(this).removeClass( commonstyle.hover );}
				);
				p.delicon = $.extend([true,"left", styles.icon_del ],rp_ge[$t.p.id].delicon);
				p.cancelicon = $.extend([true,"left", styles.icon_cancel ],rp_ge[$t.p.id].cancelicon);
				if(p.delicon[0]===true) {
					$("#dData","#"+dtbl+"_2").addClass(p.delicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
					.append("<span class='" + commonstyle.icon_base + " " + p.delicon[2]+"'></span>");
				}
				if(p.cancelicon[0]===true) {
					$("#eData","#"+dtbl+"_2").addClass(p.cancelicon[1] === "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
					.append("<span class='" + commonstyle.icon_base + " " + p.cancelicon[2]+"'></span>");
				}
				$("#dData","#"+dtbl+"_2").click(function(){
					var ret=[true,""], pk,
					postdata = $("#DelData>td","#"+dtbl).text(); //the pair is name=val1,val2,...
					onCS = {};
					onCS = $($t).triggerHandler("jqGridDelRowClickSubmit", [rp_ge[$t.p.id], postdata]);
					if(onCS === undefined && $.jgrid.isFunction( rp_ge[$t.p.id].onclickSubmit ) ) {
						onCS = rp_ge[$t.p.id].onclickSubmit.call($t, rp_ge[$t.p.id], postdata) || {};
					}
					ret = $($t).triggerHandler("jqGridDelRowBeforeSubmit", [postdata]);
					if(ret === undefined) {
						ret = [true,"",""];
					}
					if( ret[0] && $.jgrid.isFunction(rp_ge[$t.p.id].beforeSubmit))  {
						ret = rp_ge[$t.p.id].beforeSubmit.call($t, postdata);
					}
					if(ret[0] && !rp_ge[$t.p.id].processing) {
						rp_ge[$t.p.id].processing = true;
						opers = $t.p.prmNames;
						postd = $.extend({},rp_ge[$t.p.id].delData, onCS);
						oper = opers.oper;
						postd[oper] = opers.deloper;
						idname = opers.id;
						postdata = String(postdata).split(",");
						if(!postdata.length) { return false; }
						for(pk in postdata) {
							if(postdata.hasOwnProperty(pk)) {
								postdata[pk] = $.jgrid.stripPref($t.p.idPrefix, postdata[pk]);
							}
						}
						postd[idname] = postdata.join();
						$(this).addClass( commonstyle.active );
						var ajaxOptions = $.extend({
							url: rp_ge[$t.p.id].url || $($t).jqGrid('getGridParam','editurl'),
							type: rp_ge[$t.p.id].mtype,
							data: $.jgrid.isFunction(rp_ge[$t.p.id].serializeDelData) ? rp_ge[$t.p.id].serializeDelData.call($t,postd) : postd,
							success:function(res, status, data){
								var i;
								$("#dData", "#"+dtbl+"_2").removeClass( commonstyle.active );
								if(data.status >= 300 && data.status !== 304) {
									ret[0] = false;
									ret[1] = $($t).triggerHandler("jqGridDelRowErrorTextFormat", [data]);
									if ($.jgrid.isFunction(rp_ge[$t.p.id].errorTextFormat)) {
										ret[1] = rp_ge[$t.p.id].errorTextFormat.call($t, data);
									}
									if(ret[1] === undefined) {
										ret[1] = status + " Status: '" + data.statusText + "'. Error code: " + data.status;
									}
								} else {
									// data is posted successful
									// execute aftersubmit with the returned data from server
									ret = $($t).triggerHandler("jqGridDelRowAfterSubmit", [data, postd]);
									if(ret === undefined) {
										ret = [true,"",""];
									}
									if( ret[0] && $.jgrid.isFunction(rp_ge[$t.p.id].afterSubmit) ) {
										ret = rp_ge[$t.p.id].afterSubmit.call($t, data, postd);
									}
								}
								if(ret[0] === false) {
									$("#DelError>td","#"+dtbl).html(ret[1]);
									$("#DelError","#"+dtbl).show();
								} else {
									if(rp_ge[$t.p.id].reloadAfterSubmit && $t.p.datatype !== "local") {
										$($t).trigger("reloadGrid");
									} else {
										if($t.p.treeGrid===true){
												try {$($t).jqGrid("delTreeNode",$t.p.idPrefix+postdata[0], true);} catch(e){}
										} else {
											for(i=0;i<postdata.length;i++) {
												$($t).jqGrid("delRowData",$t.p.idPrefix+ postdata[i]);
											}
										}
										$t.p.selrow = null;
										$t.p.selarrrow = [];
									}
									if($.jgrid.isFunction(rp_ge[$t.p.id].afterComplete) || Object.prototype.hasOwnProperty.call($._data( $($t)[0], 'events' ), 'jqGridDelRowAfterComplete')) {
										var copydata = data;
										setTimeout(function(){
											$($t).triggerHandler("jqGridDelRowAfterComplete", [copydata, postd]);
											try {
												rp_ge[$t.p.id].afterComplete.call($t, copydata, postd);
											} catch(eacg) {
												// do nothing
											}
										},500);
									}
								}
								rp_ge[$t.p.id].processing=false;
								if(ret[0]) {$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal, onClose: rp_ge[$t.p.id].onClose});}
							}
						}, $.jgrid.ajaxOptions, rp_ge[$t.p.id].ajaxDelOptions);


						if (!ajaxOptions.url && !rp_ge[$t.p.id].useDataProxy) {
							if ($.jgrid.isFunction($t.p.dataProxy)) {
								rp_ge[$t.p.id].useDataProxy = true;
							} else {
								ret[0]=false;ret[1] += " "+$.jgrid.getRegional($t, 'errors.nourl');
							}
						}
						if (ret[0]) {
							if (rp_ge[$t.p.id].useDataProxy) {
								var dpret = $t.p.dataProxy.call($t, ajaxOptions, "del_"+$t.p.id); 
								if(dpret === undefined) {
									dpret = [true, ""];
								}
								if(dpret[0] === false ) {
									ret[0] = false;
									ret[1] = dpret[1] || "Error deleting the selected row!" ;
								} else {
									$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:p.jqModal, onClose: rp_ge[$t.p.id].onClose});
								}
							}
							else {
								if(ajaxOptions.url === "clientArray") {
									postd = ajaxOptions.data;
									ajaxOptions.success(postdata,'',{status:200, statusText:''});
								} else if( ajaxOptions.url === "storage") {
									$($t).jqGrid('deleteStorageRecord', postdata)
									.then(function(e){
										if(e.type==="complete") {
											ajaxOptions.success(postdata,'',{status:200, statusText:''});
										}
									})
									.catch(function(e) {
										$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
									});
								} else {
									$.ajax(ajaxOptions); 
								}
							}
						}
					}

					if(ret[0] === false) {
						$("#DelError>td","#"+dtbl).html(ret[1]);
						$("#DelError","#"+dtbl).show();
					}
					return false;
				});
				$("#eData", "#"+dtbl+"_2").click(function(){
					$.jgrid.hideModal("#"+$.jgrid.jqID(IDs.themodal),{gb:"#gbox_"+$.jgrid.jqID(gID),jqm:rp_ge[$t.p.id].jqModal, onClose: rp_ge[$t.p.id].onClose});
					return false;
				});
				$("#"+dtbl+"_2").find("[data-index]").each(function(){
					var index = parseInt($(this).attr('data-index'),10);
					if(index >=0 ) {
						if( p.buttons[index].hasOwnProperty('click')) {
							$(this).on('click', function(e) {
								p.buttons[index].click.call($t, $("#"+dtbl_id)[0], rp_ge[$t.p.id], e);
							});
						}
					}
				});

				showFrm = $($t).triggerHandler("jqGridDelRowBeforeInitData", [$("#"+dtbl)]);
				if(showFrm === undefined) {
					showFrm = true;
				}
				if(showFrm && $.jgrid.isFunction(rp_ge[$t.p.id].beforeInitData)) {
					showFrm = rp_ge[$t.p.id].beforeInitData.call($t, $("#"+dtbl));
				}
				if(showFrm === false) {return;}
				$($t).triggerHandler("jqGridDelRowBeforeShowForm", [$("#"+dtbl)]);
				if($.jgrid.isFunction( rp_ge[$t.p.id].beforeShowForm  )) {
					rp_ge[$t.p.id].beforeShowForm.call($t,$("#"+dtbl));
				}
				$.jgrid.viewModal("#"+$.jgrid.jqID(IDs.themodal),{gbox:"#gbox_"+$.jgrid.jqID(gID),jqm:rp_ge[$t.p.id].jqModal, overlay: rp_ge[$t.p.id].overlay, modal:rp_ge[$t.p.id].modal});
				$($t).triggerHandler("jqGridDelRowAfterShowForm", [$("#"+dtbl)]);
				if($.jgrid.isFunction( rp_ge[$t.p.id].afterShowForm )) {
					rp_ge[$t.p.id].afterShowForm.call($t,$("#"+dtbl));
				}
			}
			if(rp_ge[$t.p.id].closeOnEscape===true) {
				setTimeout(function(){$(".ui-jqdialog-titlebar-close","#"+$.jgrid.jqID(IDs.modalhead)).attr("tabindex","-1").focus();},0);
			}
		});
	},
	navGrid : function (elem, p, pEdit, pAdd, pDel, pSearch, pView) {
		var regional =  $.jgrid.getRegional(this[0], 'nav'),
			currstyle = this[0].p.styleUI,
			styles = $.jgrid.styleUI[currstyle].navigator,
			commonstyle = $.jgrid.styleUI[currstyle].common;
		p = $.extend({
			edit: true,
			editicon: styles.icon_edit_nav,
			add: true,
			addicon: styles.icon_add_nav,
			del: true,
			delicon: styles.icon_del_nav,
			search: true,
			searchicon: styles.icon_search_nav,
			refresh: true,
			refreshicon: styles.icon_refresh_nav,
			refreshstate: 'firstpage',
			view: false,
			viewicon : styles.icon_view_nav,
			position : "left",
			closeOnEscape : true,
			beforeRefresh : null,
			afterRefresh : null,
			cloneToTop : false,
			alertwidth : 200,
			alertheight : 'auto',
			alerttop: null,
			alertleft: null,
			alertzIndex : null,
			dropmenu : false,
			navButtonText : ''
		}, regional, p ||{});
		return this.each(function() {
			if(this.p.navGrid) {return;}
			var $t = this, twd, tdw, o;
			if(!$t.grid || typeof elem !== 'string') {return;}
			if(!$($t).data('navGrid')) {
				$($t).data('navGrid',p);
			}
			// speedoverhead, but usefull for future 
			o = $($t).data('navGrid');
			if($t.p.force_regional) {
				o = $.extend(o, regional);
			}
			if(!o.alerttop && !o.alertleft) {
				var pos=$.jgrid.findPos(this);
				pos[0]=Math.round(pos[0]);
				pos[1]=Math.round(pos[1]);
				var hg = isNaN(this.p.height) ? $($t.grid.bDiv).height(): this.p.height;
				if(hg === 0) {
					hg = 200;
				}
				o.alertleft = pos[0] + (this.p.width/2)-parseInt(o.alertwidth,10)/2;
				o.alerttop = pos[1] + (hg/2)-25;
			}
			var alert_info = function(){
				 $.jgrid.info_dialog(o.alertcap,"<div>"+o.alerttext+"</div><span tabindex='0'><span tabindex='-1' id='jqg_alrt'></span></span>","",{
					jqModal:true,
					drag:true,
					resize:true,
					caption:o.alertcap,
					width:o.alertwidth,
					height: o.alertheight,
					top:o.alerttop,
					left:o.alertleft,
					closeOnEscape:o.closeOnEscape, 
					styleUI: $t.p.styleUI,
					zIndex: o.alertzIndex}
				);
			};
			var clone = 1, i,
			onHoverIn = function () {
				if (!$(this).hasClass(commonstyle.disabled)) {
					$(this).addClass(commonstyle.hover);
				}
			},
			onHoverOut = function () {
				$(this).removeClass(commonstyle.hover);
			};
			if(o.cloneToTop && $t.p.toppager) {clone = 2;}
			for(i = 0; i<clone; i++) {
				var tbd,
				navtbl = $("<table class='ui-pg-table navtable ui-common-table'><tbody><tr></tr></tbody></table>"),
				sep = "<td class='ui-pg-button " +commonstyle.disabled + "' style='width:4px;'><span class='ui-separator'></span></td>",
				pgid, elemids;
				if(i===0) {
					pgid = elem;
					if(pgid.indexOf("#") === 0 ) {
						pgid = pgid.substring(1);
						pgid = "#"+ $.jgrid.jqID( pgid );
					}
					elemids = $t.p.id;
					if(pgid === $t.p.toppager) {
						elemids += "_top";
						clone = 1;
					}
				} else {
					pgid = $t.p.toppager;
					elemids = $t.p.id+"_top";
				}
				if($t.p.direction === "rtl") {
					$(navtbl).attr("dir","rtl").css("float","right");
				}
				pAdd = pAdd || {};
				if (o.add) {
					tbd = $("<td class='ui-pg-button "+commonstyle.cornerall+"'></td>");
					$(tbd).append("<div class='ui-pg-div'><span class='"+commonstyle.icon_base +" " +o.addicon+"'></span>"+o.addtext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.addtitle || "",id : pAdd.id || "add_"+elemids})
					.click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							$.jgrid.setSelNavIndex( $t, this);
							if ($.jgrid.isFunction( o.addfunc )) {
								o.addfunc.call($t);
							} else {
								$($t).jqGrid("editGridRow","new",pAdd);
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				pEdit = pEdit || {};
				if (o.edit) {
					tbd = $("<td class='ui-pg-button "+commonstyle.cornerall+"'></td>");
					$(tbd).append("<div class='ui-pg-div'><span class='"+commonstyle.icon_base+" "+o.editicon+"'></span>"+o.edittext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.edittitle || "",id: pEdit.id || "edit_"+elemids})
					.click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							var sr = $t.p.selrow;
							if (sr) {
								$.jgrid.setSelNavIndex( $t, this);
								if($.jgrid.isFunction( o.editfunc ) ) {
									o.editfunc.call($t, sr);
								} else {
									$($t).jqGrid("editGridRow",sr,pEdit);
								}
							} else {
								alert_info();
								$("#jqg_alrt").focus();
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				pView = pView || {};
				if (o.view) {
					tbd = $("<td class='ui-pg-button "+commonstyle.cornerall+"'></td>");
					$(tbd).append("<div class='ui-pg-div'><span class='"+commonstyle.icon_base+" "+o.viewicon+"'></span>"+o.viewtext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.viewtitle || "",id: pView.id || "view_"+elemids})
					.click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							var sr = $t.p.selrow;
							if (sr) {
								$.jgrid.setSelNavIndex( $t, this);
								if($.jgrid.isFunction( o.viewfunc ) ) {
									o.viewfunc.call($t, sr);
								} else {
									$($t).jqGrid("viewGridRow",sr,pView);
								}
							} else {
								alert_info();
								$("#jqg_alrt").focus();
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				pDel = pDel || {};
				if (o.del) {
					tbd = $("<td class='ui-pg-button "+commonstyle.cornerall+"'></td>");
					$(tbd).append("<div class='ui-pg-div'><span class='"+commonstyle.icon_base+" "+o.delicon+"'></span>"+o.deltext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.deltitle || "",id: pDel.id || "del_"+elemids})
					.click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							var dr;
							if($t.p.multiselect) {
								dr = $t.p.selarrrow;
								if(dr.length===0) {dr = null;}
							} else {
								dr = $t.p.selrow;
							}
							if(dr){
								$.jgrid.setSelNavIndex( $t, this);
								if($.jgrid.isFunction( o.delfunc )){
									o.delfunc.call($t, dr);
								}else{
									$($t).jqGrid("delGridRow",dr,pDel);
								}
							} else  {
								alert_info();
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				if(o.add || o.edit || o.del || o.view) {$("tr",navtbl).append(sep);}
				pSearch = pSearch || {};
				if (o.search) {
					tbd = $("<td class='ui-pg-button "+commonstyle.cornerall+"'></td>");
					$(tbd).append("<div class='ui-pg-div'><span class='"+commonstyle.icon_base+" "+o.searchicon+"'></span>"+o.searchtext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.searchtitle  || "",id:pSearch.id || "search_"+elemids})
					.click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							$.jgrid.setSelNavIndex( $t, this);
							if($.jgrid.isFunction( o.searchfunc )) {
								o.searchfunc.call($t, pSearch);
							} else {
								$($t).jqGrid("searchGrid",pSearch);
							}
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					if (pSearch.showOnLoad && pSearch.showOnLoad === true) {
						$(tbd,navtbl).click();
					}
					tbd = null;
				}
				if (o.refresh) {
					tbd = $("<td class='ui-pg-button "+commonstyle.cornerall+"'></td>");
					$(tbd).append("<div class='ui-pg-div'><span class='"+commonstyle.icon_base+" "+o.refreshicon+"'></span>"+o.refreshtext+"</div>");
					$("tr",navtbl).append(tbd);
					$(tbd,navtbl)
					.attr({"title":o.refreshtitle  || "",id: "refresh_"+elemids})
					.click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							if($.jgrid.isFunction(o.beforeRefresh)) {o.beforeRefresh.call($t);}
							$t.p.search = false;
							$t.p.resetsearch =  true;
							try {
								if( o.refreshstate !== 'currentfilter') {
									var gID = $t.p.id;
									$t.p.postData.filters ="";
									try {
										$("#fbox_"+$.jgrid.jqID(gID)).jqFilter('resetFilter');
									} catch(ef) {}
									if($.jgrid.isFunction($t.clearToolbar)) {$t.clearToolbar.call($t,false);}
								}
							} catch (e) {}
							switch (o.refreshstate) {
								case 'firstpage':
									$($t).trigger("reloadGrid", [{page:1}]);
									break;
								case 'current':
								case 'currentfilter':
									$($t).trigger("reloadGrid", [{current:true}]);
									break;
							}
							if($.jgrid.isFunction(o.afterRefresh)) {o.afterRefresh.call($t);}
							$.jgrid.setSelNavIndex( $t, this);
						}
						return false;
					}).hover(onHoverIn, onHoverOut);
					tbd = null;
				}
				tdw = $(".ui-jqgrid").css("font-size") || "11px";
				$('body').append("<div id='testpg2' class='ui-jqgrid "+$.jgrid.styleUI[currstyle].base.entrieBox+"' style='font-size:"+tdw+";visibility:hidden;' ></div>");
				twd = $(navtbl).clone().appendTo("#testpg2").width();
				$("#testpg2").remove();
				
				if($t.p._nvtd) {
					if(o.dropmenu) {
						navtbl = null;
						$($t).jqGrid('_buildNavMenu', pgid, elemids, $.extend(p,{'ainfo':alert_info}), pEdit, pAdd, pDel, pSearch, pView );						
					} else if(twd > $t.p._nvtd[0] ) {
						if($t.p.responsive) {
							navtbl = null;
							$($t).jqGrid('_buildNavMenu', pgid, elemids, $.extend(p,{'ainfo':alert_info}), pEdit, pAdd, pDel, pSearch, pView );
						} else {
							$(pgid+"_"+o.position,pgid).append(navtbl).width(twd);
						}
						$t.p._nvtd[0] = twd;
					} else {
						$(pgid+"_"+o.position,pgid).append(navtbl);
					}
					$t.p._nvtd[1] = twd;
				}
				$t.p.navGrid = true;
			}
			if($t.p.storeNavOptions) {
				$t.p.navOptions = o;
				$t.p.editOptions = pEdit;
				$t.p.addOptions = pAdd;
				$t.p.delOptions = pDel;
				$t.p.searchOptions = pSearch;
				$t.p.viewOptions = pView;
				$t.p.navButtons =[];
			}

		});
	},
	navButtonAdd : function (elem, p) {
		var	currstyle = this[0].p.styleUI,
			styles = $.jgrid.styleUI[currstyle].navigator;
		p = $.extend({
			caption : "newButton",
			title: '',
			buttonicon : styles.icon_newbutton_nav,
			onClickButton: null,
			position : "last",
			cursor : 'pointer',
			internal : false
		}, p ||{});
		return this.each(function() {
			if(!this.grid || typeof elem !== 'string') {return;}
			if( elem.indexOf("#") === 0 ) {
				elem = elem.substring(1);
			}
			elem = "#" +  $.jgrid.jqID(elem);
			var findnav = $(".navtable",elem)[0], $t = this,
			//getstyle = $.jgrid.getMethod("getStyleUI"),
			disabled = $.jgrid.styleUI[currstyle].common.disabled,
			hover = $.jgrid.styleUI[currstyle].common.hover,
			cornerall = $.jgrid.styleUI[currstyle].common.cornerall,
			iconbase = $.jgrid.styleUI[currstyle].common.icon_base;

			if ($t.p.storeNavOptions && !p.internal) {
				$t.p.navButtons.push([elem,p]);
			}

			if (findnav) {
				if( p.id && $("#"+$.jgrid.jqID(p.id), findnav)[0] !== undefined )  {return;}
				var tbd = $("<td></td>");
				if(p.buttonicon.toString().toUpperCase() === "NONE") {
                    $(tbd).addClass('ui-pg-button '+cornerall).append("<div class='ui-pg-div'>"+p.caption+"</div>");
				} else	{
					$(tbd).addClass('ui-pg-button '+cornerall).append("<div class='ui-pg-div'><span class='"+iconbase+" "+p.buttonicon+"'></span>"+p.caption+"</div>");
				}
				if(p.id) {$(tbd).attr("id",p.id);}
				if(p.position==='first'){
					if(findnav.rows[0].cells.length ===0 ) {
						$("tr",findnav).append(tbd);
					} else {
						$("tr td",findnav).eq( 0 ).before(tbd);
					}
				} else {
					$("tr",findnav).append(tbd);
				}
				$(tbd,findnav)
				.attr("title",p.title  || "")
				.click(function(e){
					if (!$(this).hasClass(disabled)) {
						$.jgrid.setSelNavIndex( $t, this);
						if ($.jgrid.isFunction(p.onClickButton) ) {p.onClickButton.call($t,e);}
					}
					return false;
				})
				.hover(
					function () {
						if (!$(this).hasClass(disabled)) {
							$(this).addClass(hover);
						}
					},
					function () {$(this).removeClass(hover);}
				);
			} else {
				findnav = $(".dropdownmenu",elem)[0];
				if (findnav) {
					var id = $(findnav).val(),
					eid = p.id || $.jgrid.randId(),
					item = $('<li class="ui-menu-item" role="presentation"><a class="'+ cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+eid+'">'+(p.caption || p.title)+'</a></li>');
					if(id) {
						if(p.position === 'first') {
							$("#"+id).prepend( item );
						} else {
							$("#"+id).append( item );
						}
						$(item).on("click", function(e){
							if (!$(this).hasClass(disabled)) {
								$("#"+id).hide();
								if ($.jgrid.isFunction(p.onClickButton) ) {
									p.onClickButton.call($t,e);
								}
							}
							return false;
						}).find("a")
						.hover(
							function () {
								if (!$(this).hasClass(disabled)) {
									$(this).addClass(hover);
								}
							},
							function () {$(this).removeClass(hover);}
						);
					}
				}
			}
		});
	},
	navSeparatorAdd:function (elem,p) {
		var	currstyle = this[0].p.styleUI,
			commonstyle = $.jgrid.styleUI[currstyle].common;
		p = $.extend({
			sepclass : "ui-separator",
			sepcontent: '',
			position : "last"
		}, p ||{});
		return this.each(function() {
			if( !this.grid)  {return;}
			if( typeof elem === "string" && elem.indexOf("#") !== 0) {elem = "#"+$.jgrid.jqID(elem);}
			var findnav = $(".navtable",elem)[0], sep, id;
			if ( this.p.storeNavOptions ) {
				this.p.navButtons.push([elem,p]);
			}
			
			if(findnav) {
				sep = "<td class='ui-pg-button "+ commonstyle.disabled +"' style='width:4px;'><span class='"+p.sepclass+"'></span>"+p.sepcontent+"</td>";
				if (p.position === 'first') {
					if (findnav.rows[0].cells.length === 0) {
						$("tr", findnav).append(sep);
					} else {
						$("tr td", findnav).eq( 0 ).before(sep);
					}
				} else {
					$("tr", findnav).append(sep);
				}
			} else {
				findnav = $(".dropdownmenu",elem)[0];
				sep = "<li class='ui-menu-item " +commonstyle.disabled + "' style='width:100%' role='presentation'><hr class='ui-separator-li'></li>";
				if(findnav) {
					id = $(findnav).val();
					if(id) {
						if(p.position === "first") {
							$("#"+id).prepend( sep );
						} else {
							$("#"+id).append( sep );
						}
					}
				}
			}
		});
	},
	_buildNavMenu : function ( elem, elemids, p, pEdit, pAdd, pDel, pSearch, pView ) {
		return this.each(function() {
			var $t = this,
			//actions = ['add','edit', 'del', 'view', 'search','refresh'],
			regional =  $.jgrid.getRegional($t, 'nav'),
			currstyle = $t.p.styleUI,
			//styles = $.jgrid.styleUI[currstyle].navigator,
			classes = $.jgrid.styleUI[currstyle].filter,
			commonstyle = $.jgrid.styleUI[currstyle].common,
			mid = "form_menu_"+$.jgrid.randId(),
			bt = p.navButtonText ? p.navButtonText : regional.selectcaption || 'Actions',
			act = "<button class='dropdownmenu "+commonstyle.button+"' value='"+mid+"'>" + bt +"</button>";
			$(elem+"_"+p.position, elem).append( act );
			var _buildMenu = function() {
				var fs =  $('.ui-jqgrid').css('font-size') || '11px',
				eid, itm,
				str = $('<ul id="'+mid+'" class="ui-nav-menu modal-content ui-menu column-menu jqgrid-column-menu ' + commonstyle.shadow + '" role="menu" tabindex="0" style="display:none;font-size:'+fs+'"></ul>');
				if( p.add ) {
					pAdd = pAdd || {};
					eid = pAdd.id || "add_"+elemids;
					itm = $('<li class="ui-menu-item" role="presentation"><a class="'+ commonstyle.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+eid+'">'+(p.addtext.trim() || p.addtitle)+'</a></li>').click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							if ($.jgrid.isFunction( p.addfunc )) {
								p.addfunc.call($t);
							} else {
								$($t).jqGrid("editGridRow","new",pAdd);
							}
							$(str).hide();
						}
						return false;
					});
					$(str).append(itm);
				}
				if( p.edit ) {
					pEdit = pEdit || {};
					eid = pEdit.id || "edit_"+elemids;
					itm = $('<li class="ui-menu-item" role="presentation"><a class="'+ commonstyle.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+eid+'">'+(p.edittext.trim() || p.edittitle)+'</a></li>').click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							var sr = $t.p.selrow;
							if (sr) {
								if($.jgrid.isFunction( p.editfunc ) ) {
									p.editfunc.call($t, sr);
								} else {
									$($t).jqGrid("editGridRow",sr,pEdit);
								}
							} else {
								p.ainfo();
								$("#jqg_alrt").focus();
							}
							$(str).hide();
						}
						return false;
					});
					$(str).append(itm);
				}
				if( p.view ) {
					pView = pView || {};
					eid = pView.id || "view_"+elemids;
					itm = $('<li class="ui-menu-item" role="presentation"><a class="'+ commonstyle.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+eid+'">'+(p.viewtext.trim() || p.viewtitle)+'</a></li>').click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							var sr = $t.p.selrow;
							if (sr) {
								if($.jgrid.isFunction( p.editfunc ) ) {
									p.viewfunc.call($t, sr);
								} else {
									$($t).jqGrid("viewGridRow",sr,pView);
								}
							} else {
								p.ainfo();
								$("#jqg_alrt").focus();
							}
							$(str).hide();
						}
						return false;
					});
					$(str).append(itm);
				}
				if( p.del ) {
					pDel = pDel || {};
					eid = pDel.id || "del_"+elemids;
					itm = $('<li class="ui-menu-item" role="presentation"><a class="'+ commonstyle.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+eid+'">'+(p.deltext.trim() || p.deltitle)+'</a></li>').click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							var dr;
							if($t.p.multiselect) {
								dr = $t.p.selarrrow;
								if(dr.length===0) {dr = null;}
							} else {
								dr = $t.p.selrow;
							}
							if(dr){
								if($.jgrid.isFunction( p.delfunc )){
									p.delfunc.call($t, dr);
								}else{
									$($t).jqGrid("delGridRow",dr,pDel);
								}
							} else  {
								p.ainfo();
							}
							$(str).hide();
						}
						return false;
					});
					$(str).append(itm);
				}
				if(p.add || p.edit || p.del || p.view) {
					$(str).append("<li class='ui-menu-item " +commonstyle.disabled + "' style='width:100%' role='presentation'><hr class='ui-separator-li'></li>");
				}
				if( p.search ) {
					pSearch = pSearch || {};
					eid = pSearch.id || "search_"+elemids;
					itm = $('<li class="ui-menu-item" role="presentation"><a class="'+ commonstyle.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+eid+'">'+(p.searchtext.trim() || p.searchtitle)+'</a></li>').click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							if($.jgrid.isFunction( p.searchfunc )) {
								p.searchfunc.call($t, pSearch);
							} else {
								$($t).jqGrid("searchGrid",pSearch);
							}
							$(str).hide();
						}
						return false;
					});
					$(str).append(itm);
					if (pSearch.showOnLoad && pSearch.showOnLoad === true) {
						$( itm ).click();
					}
				}
				if( p.refresh ) {
					eid = pSearch.id || "search_"+elemids;
					itm = $('<li class="ui-menu-item" role="presentation"><a class="'+ commonstyle.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+eid+'">'+(p.refreshtext || p.refreshtitle)+'</a></li>').click(function(){
						if (!$(this).hasClass( commonstyle.disabled )) {
							if($.jgrid.isFunction(p.beforeRefresh)) {p.beforeRefresh.call($t);}
							$t.p.search = false;
							$t.p.resetsearch =  true;
							try {
								if( p.refreshstate !== 'currentfilter') {
									var gID = $t.p.id;
									$t.p.postData.filters ="";
									try {
										$("#fbox_"+$.jgrid.jqID(gID)).jqFilter('resetFilter');
									} catch(ef) {}
									if($.jgrid.isFunction($t.clearToolbar)) {$t.clearToolbar.call($t,false);}
								}
							} catch (e) {}
							switch (p.refreshstate) {
								case 'firstpage':
									$($t).trigger("reloadGrid", [{page:1}]);
									break;
								case 'current':
								case 'currentfilter':
									$($t).trigger("reloadGrid", [{current:true}]);
									break;
							}
							if($.jgrid.isFunction(p.afterRefresh)) {p.afterRefresh.call($t);}
							$(str).hide();
						}
						return false;
					});
					$(str).append(itm);
				}
				$(str).hide();
				$('body').append(str);
				$("#"+mid).addClass("ui-menu " + classes.menu_widget);
				$("#"+mid+" > li > a").hover(
					function(){ $(this).addClass(commonstyle.hover); },
					function(){ $(this).removeClass(commonstyle.hover); }
				);
			};
			_buildMenu();
			$(".dropdownmenu", elem+"_"+p.position).on("click", function( e ){
				var offset = $(this).offset(),
				left = ( offset.left ),
				top = parseInt( offset.top),
				bid =$(this).val();
				//if( $("#"+mid)[0] === undefined)  {
					//_buildMenu();
				//}
				$("#"+bid).show().css({"top":top - ($("#"+bid).height() + 35)+"px", "left":left+"px"});
				e.stopPropagation();
			});
			$("body").on('click', function(e){
				if(!$(e.target).hasClass("dropdownmenu")) {
					$("#"+mid).hide();
				}
			});
		});
	},
	GridToForm : function( rowid, formid ) {
		return this.each(function(){
			var $t = this, i;
			if (!$t.grid) {return;}
			var rowdata = $($t).jqGrid("getRowData",rowid);
			if (rowdata) {
				for(i in rowdata) {
					if(rowdata.hasOwnProperty(i)) {
					if ( $("[name="+$.jgrid.jqID(i)+"]",formid).is("input:radio") || $("[name="+$.jgrid.jqID(i)+"]",formid).is("input:checkbox"))  {
						$("[name="+$.jgrid.jqID(i)+"]",formid).each( function() {
							if( $(this).val() == rowdata[i] ) {
								$(this)[$t.p.useProp ? 'prop': 'attr']("checked",true);
							} else {
								$(this)[$t.p.useProp ? 'prop': 'attr']("checked", false);
							}
						});
					} else {
					// this is very slow on big table and form.
						$("[name="+$.jgrid.jqID(i)+"]",formid).val(rowdata[i]);
					}
				}
			}
			}
		});
	},
	FormToGrid : function(rowid, formid, mode, position){
		return this.each(function() {
			var $t = this;
			if(!$t.grid) {return;}
			if(!mode) {mode = 'set';}
			if(!position) {position = 'first';}
			var fields = $(formid).serializeArray();
			var griddata = {};
			$.each(fields, function(i, field){
				griddata[field.name] = field.value;
			});
			if(mode==='add') {$($t).jqGrid("addRowData",rowid,griddata, position);}
			else if(mode==='set') {$($t).jqGrid("setRowData",rowid,griddata);}
		});
	}
});

//module begin
$.jgrid.extend({
	groupingInit : function () {
		return this.each(function (){
			var $t = this;
			$.extend ($t.p.groupingView, {
				groupField :[],
				groupOrder:[],
				groupText:[],
				groupColumnShow:[],
				groupSummary:[],
				showSummaryOnHide: false,
				sortitems:[],
				sortnames:[],
				summary:[],
				summaryval:[],
				plusicon: '',
				minusicon: '',
				displayField: [],
				groupSummaryPos:[],
				formatDisplayField : [],
				prepareGroupField : null,
				groupRowNumbers : false,
				_locgr : false
			}, true);
		});
	},
	groupingSetup : function () {
		return this.each(function (){
			var $t = this, i, j, cml, cm = $t.p.colModel, grp = $t.p.groupingView,
			classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].grouping;
			if(grp !== null && ( (typeof grp === 'object') || $.jgrid.isFunction(grp) ) ) {
				if(!grp.plusicon) { grp.plusicon = classes.icon_plus;}
				if(!grp.minusicon) { grp.minusicon = classes.icon_minus;}
				if(!grp.groupField.length) {
					$t.p.grouping = false;
				} else {
					if (grp.visibiltyOnNextGrouping === undefined) {
						grp.visibiltyOnNextGrouping = [];
					}

					grp.lastvalues=[];
					if(!grp._locgr) {
						grp.groups =[];
					}
					grp.counters =[];
					for(i=0;i<grp.groupField.length;i++) {
						if(!grp.groupOrder[i]) {
							grp.groupOrder[i] = 'asc';
						}
						if(!grp.groupText[i]) {
							grp.groupText[i] = '{0}';
						}
						if( typeof grp.groupColumnShow[i] !== 'boolean') {
							grp.groupColumnShow[i] = true;
						}
						if( typeof grp.groupSummary[i] !== 'boolean') {
							grp.groupSummary[i] = false;
						}
						if( !grp.groupSummaryPos[i]) {
							grp.groupSummaryPos[i] = 'footer';
						}
						let vi = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', grp.groupField[i], false).hidden;
						if(grp.groupColumnShow[i] === true) {
							grp.visibiltyOnNextGrouping[i] = true;
							if(vi) {
								$($t).jqGrid('showCol',grp.groupField[i]);
							}
						} else {
							grp.visibiltyOnNextGrouping[i] = $("#"+$.jgrid.jqID($t.p.id+"_"+grp.groupField[i])).is(":visible");
							if(!vi) {
								$($t).jqGrid('hideCol',grp.groupField[i]);
							}
						}
					}
					grp.summary =[];
					if(grp.hideFirstGroupCol) {
						if(Array.isArray(grp.formatDisplayField) && !$.jgrid.isFunction(grp.formatDisplayField[0] ) ) {
							grp.formatDisplayField[0] = function (v) { return v;};
						}
					}
					for(j=0, cml = cm.length; j < cml; j++) {
						if(grp.hideFirstGroupCol) {
							if(!cm[j].hidden && grp.groupField[0] === cm[j].name) {
								cm[j].formatter = function(){return '';};
							}
						}
						if(cm[j].summaryType ) {
							if(cm[j].summaryDivider) {
								grp.summary.push({nm:cm[j].name,st:cm[j].summaryType, v: '', sd:cm[j].summaryDivider, vd:'', sr: cm[j].summaryRound, srt: cm[j].summaryRoundType || 'round'});
							} else {
								grp.summary.push({nm:cm[j].name,st:cm[j].summaryType, v: '', sr: cm[j].summaryRound, srt: cm[j].summaryRoundType || 'round'});
							}
						}
					}
				}
			} else {
				$t.p.grouping = false;
			}
		});
	},
	groupingPrepare : function ( record, irow ) {
		this.each(function(){
			var grp = this.p.groupingView, $t= this, i,
			sumGroups = function() {
				if ($.jgrid.isFunction(this.st)) {
					this.v = this.st.call($t, this.v, this.nm, record);
				} else {
					this.v = $($t).jqGrid('groupingCalculations.handler',this.st, this.v, this.nm, this.sr, this.srt, record);
					if(this.st.toLowerCase() === 'avg' && this.sd) {
						this.vd = $($t).jqGrid('groupingCalculations.handler',this.st, this.vd, this.sd, this.sr, this.srt, record);
					}
				}
			},
			grlen = grp.groupField.length, 
			formatVal = $.jgrid.isFunction(grp.prepareGroupField),
			fieldName,
			v,
			displayName,
			displayValue,
			changed = 0;
			for(i=0;i<grlen;i++) {
				fieldName = grp.groupField[i];
				displayName = grp.displayField[i];
				v = record[fieldName];
				displayValue = displayName == null ? null : record[displayName];
				if( formatVal ) {
					v = grp.prepareGroupField(v, fieldName, record);
				}
				if( displayValue == null ) {
					displayValue = v;
				}
				if( v !== undefined ) {
					if(irow === 0 ) {
						// First record always starts a new group
						grp.groups.push({idx:i,dataIndex:fieldName,value:v, displayValue: displayValue, startRow: irow, cnt:1, summary : [] } );
						grp.lastvalues[i] = v;
						grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
					} else {
						if (typeof v !== "object" && (Array.isArray(grp.isInTheSameGroup) && $.jgrid.isFunction(grp.isInTheSameGroup[i]) ? ! grp.isInTheSameGroup[i].call($t, grp.lastvalues[i], v, i, grp): grp.lastvalues[i] !== v)) {
							// This record is not in same group as previous one
							grp.groups.push({idx:i,dataIndex:fieldName,value:v, displayValue: displayValue, startRow: irow, cnt:1, summary : [] } );
							grp.lastvalues[i] = v;
							changed = 1;
							grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
						} else {
							if (changed === 1) {
								// This group has changed because an earlier group changed.
								grp.groups.push({idx:i,dataIndex:fieldName,value:v, displayValue: displayValue, startRow: irow, cnt:1, summary : [] } );
								grp.lastvalues[i] = v;
								grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
							} else {
								grp.counters[i].cnt += 1;
								grp.groups[grp.counters[i].pos].cnt = grp.counters[i].cnt;
							}
						}
					}
					$.each(grp.counters[i].summary, sumGroups);
					grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;					
				}
			}
			//gdata.push( rData );
		});
		return this;
	},
	groupingToggle : function(hid){
		this.each(function(){
			var $t = this,
			grp = $t.p.groupingView,
			strpos = hid.split('_'),
			num = parseInt(strpos[strpos.length-2], 10);
			strpos.splice(strpos.length-2,2);
			var uid = strpos.join("_"),
			minus = grp.minusicon,
			plus = grp.plusicon,
			tar = $("#"+$.jgrid.jqID(hid)),
			r = tar.length ? tar[0].nextSibling : null,
			tarspan = $("#"+$.jgrid.jqID(hid)+" span."+"tree-wrap-"+$t.p.direction),
			getGroupingLevelFromClass = function (className) {
				var nums = $.map(className.split(" "), function (item) {
					if (item.substring(0, uid.length + 1) === uid + "_") {
						return parseInt(item.substring(uid.length + 1), 10);
					}
				});
				return nums.length > 0 ? nums[0] : undefined;
			},
			itemGroupingLevel,
			showData,
			collapsed = false,
			footLevel,
			skip = false;
			if( tarspan.hasClass(minus) ) {
				if(r){
					while(r) {
						itemGroupingLevel = getGroupingLevelFromClass(r.className);
						if (itemGroupingLevel !== undefined && itemGroupingLevel <= num) {
							break;
						}
						footLevel = parseInt($(r).attr("jqfootlevel") ,10);
						skip = isNaN(footLevel) ? false : 
						 (grp.showSummaryOnHide && footLevel <= num);
						if( !skip) {
							$(r).hide();
						}
						r = r.nextSibling;
					}
				}
				tarspan.removeClass(minus).addClass(plus);
				collapsed = true;
			} else {
				if(r){
					showData = undefined;
					while(r) {
						itemGroupingLevel = getGroupingLevelFromClass(r.className);
						footLevel = parseInt($(r).attr("jqfootlevel") ,10);
						if (showData === undefined) {
							showData = itemGroupingLevel === undefined; // if the first row after the opening group is data row then show the data rows
						}
						skip = $(r).hasClass("ui-subgrid") && $(r).hasClass("ui-sg-collapsed");
						if (itemGroupingLevel !== undefined) {
							if (itemGroupingLevel <= num) {
								break;// next item of the same lever are found
							}
							if (itemGroupingLevel === num + 1) {
								if(!skip) {
									$(r).show().find(">td>span."+"tree-wrap-"+$t.p.direction).removeClass(minus).addClass(plus);
								}
							}
						} else if (showData) {
							if(!skip) {
								$(r).show();
							}
						} else if(!isNaN(footLevel) &&  footLevel >=0 &&  footLevel === num) {
								$(r).show();
						}
						r = r.nextSibling;
					}
				}
				tarspan.removeClass(plus).addClass(minus);
			}
			$($t).triggerHandler("jqGridGroupingClickGroup", [hid , collapsed]);
			if( $.jgrid.isFunction($t.p.onClickGroup)) { $t.p.onClickGroup.call($t, hid , collapsed); }

		});
		return false;
	},
	groupingRender : function (grdata, colspans, page, rn ) {
		return this.each(function(){
			var $t = this,
			grp = $t.p.groupingView, crn = $t.p.rownumbers && grp.groupRowNumbers,
			str = "", icon = "", hid, clid, pmrtl = grp.groupCollapse ? grp.plusicon : grp.minusicon, gv, cp=[], len =grp.groupField.length,
			//classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')]['grouping'],
			common = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].common;

			pmrtl = pmrtl+" tree-wrap-"+$t.p.direction; 
			$.each($t.p.colModel, function (i,n){
				var ii;
				for(ii=0;ii<len;ii++) {
					if(grp.groupField[ii] === n.name ) {
						cp[ii] = i;
						break;
					}
				}
			});
			var toEnd = 0;
			function findGroupIdx( ind , offset, grp) {
				var ret = false, i;
				if(offset===0) {
					ret = grp[ind];
				} else {
					var id = grp[ind].idx;
					if(id===0) { 
						ret = grp[ind]; 
					}  else {
						for(i=ind;i >= 0; i--) {
							if(grp[i].idx === id-offset) {
								ret = grp[i];
								break;
							}
						}
					}
				}
				return ret;
			}
			function buildSummaryTd(i, ik, grp, foffset, fstr) {
				var fdata = findGroupIdx(i, ik, grp),
				cm = $t.p.colModel,
				vv, str="", k , isput = false, tmpdata, tplfld;
				for(k=foffset; k<colspans;k++) {
					if(cm[k].hidden ) {
						tmpdata = "<td role=\"gridcell\" "+$t.formatCol(k,1,'')+">&#160;</td>";
					} else if(!isput && fstr) {
						tmpdata = fstr;
						isput = true;
					} else {
						tmpdata = "<td role=\"gridcell\" "+$t.formatCol(k,1,'')+">&#160;</td>";
					}
					$.each(fdata.summary,function(){
						if(this.nm === cm[k].name) {
							
							tplfld = (cm[k].summaryTpl) ? cm[k].summaryTpl :  "{0}";
							
							vv = this.v;
							try {
								this.groupCount = fdata.cnt;
								this.groupIndex = fdata.dataIndex;
								this.groupValue = fdata.value;
								//vv = $t.formatter('', vv, k, this);
							} catch (ef) {
								//vv = this.v;
							}
							tmpdata= "<td role=\"gridcell\" "+$t.formatCol(k,1,'')+">"+$.jgrid.template(tplfld, vv, fdata.cnt, fdata.dataIndex, fdata.displayValue, fdata.summary)+ "</td>";
							return false;
						}
					});
					str += tmpdata;
				}
				return str;
			}
			var sumreverse = $.makeArray(grp.groupSummary), mul;
			sumreverse.reverse();
			mul = $t.p.multiselect || $t.p.rownumbers ? " colspan=\"2\"" : "";
			if($t.p.multiselect && $t.p.rownumbers) {
				mul = " colspan=\"3\"";
			}
			$.each(grp.groups,function(i,n){
				if(grp._locgr) {
					if( !(n.startRow +n.cnt > (page-1)*rn && n.startRow < page*rn)) {
						return true;
					}
				}
				toEnd++;
				clid = $t.p.id+"ghead_"+n.idx;
				hid = clid+"_"+i;
				icon = "<span style='cursor:pointer;margin-right:8px;margin-left:5px;' class='" + common.icon_base +" "+pmrtl+"' onclick=\"jQuery('#"+$.jgrid.jqID($t.p.id)+"').jqGrid('groupingToggle','"+hid+"');return false;\"></span>";
				try {
					if (Array.isArray(grp.formatDisplayField) && $.jgrid.isFunction(grp.formatDisplayField[n.idx])) {
						gv = grp.formatDisplayField[n.idx].call($t, n.displayValue, n.value, $t.p.colModel[cp[n.idx]], n.idx, grp);
					} else {
						gv = $t.formatter(hid, n.displayValue, cp[n.idx], n.value );
					}
				} catch (egv) {
					gv = n.displayValue;
				}
				var grpTextStr = ''; 
				// format summary values if formatter
				for( var kk =0;kk< n.summary.length; kk++) {  
					var nv = n.summary[kk];
					var ci = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', nv.nm, true);
					if(ci>=0) {
						if(typeof nv.st === 'string' && nv.st.toLowerCase() === 'avg') {
							if(nv.sd && nv.vd) { 
								nv.v = (nv.v/nv.vd);
							} else if(nv.v && n.cnt > 0) {
								nv.v = (nv.v/n.cnt);
							}
						}
						nv.uv = nv.v;
						try {
							nv.v = $t.formatter('',nv.v, ci, this);
						} catch (e) {}
					}
				}
				
				if($.jgrid.isFunction(grp.groupText[n.idx])) { 
					grpTextStr = grp.groupText[n.idx].call($t, gv, n.cnt, n.summary);
				} else {
					grpTextStr = $.jgrid.template.call($t, grp.groupText[n.idx], gv, n.cnt, n.summary);
				}
				if( !(typeof grpTextStr ==='string' || typeof grpTextStr ==='number' ) ) {
					grpTextStr = gv;
				}
				if(grp.groupSummaryPos[n.idx] === 'header')  {
					str += "<tr id=\""+hid+"\"" +(grp.groupCollapse && n.idx>0 ? " style=\"display:none;\" " : " ") + "role=\"row\" class= \"" + common.content + " jqgroup ui-row-"+$t.p.direction+" "+clid+"\">";
					str += buildSummaryTd(i, 0, grp.groups, (mul==="" ? 0 : 1), "<td role=\"gridcell\" style=\"padding-left:"+(n.idx * 12) + "px;"+"\"" + mul + " "+ $t.formatCol(0,1,'')+">" + icon+grpTextStr + "</td>" );
					str += "</tr>";
				} else {
					str += "<tr id=\""+hid+"\"" +(grp.groupCollapse && n.idx>0 ? " style=\"display:none;\" " : " ") + "role=\"row\" class= \"" + common.content + " jqgroup ui-row-"+$t.p.direction+" "+clid+"\"><td class=\"for-sticky\" style=\"padding-left:"+(n.idx * 12) + "px;"+"\">" + icon + grpTextStr + "</td><td colspan=\""+(grp.groupColumnShow[n.idx] === false ? colspans-2 : colspans-1)+"\"></td></tr>";
				}
				var leaf = len-1 === n.idx; 
				if( leaf ) {
					var gg = grp.groups[i+1], kk, ik, offset = 0, sgr = n.startRow,
					end = gg !== undefined ?  gg.startRow : grp.groups[i].startRow + grp.groups[i].cnt;
					if(grp._locgr) {
						offset = (page-1)*rn;
						if(offset > n.startRow) {
							sgr = offset;
						}
					}
					let rncv = 0;
					for(kk=sgr;kk<end;kk++) {
						if(!grdata[kk - offset]) { break; }
						if(crn) { // rownumbers
							let rncell = $(grdata[kk - offset][1]);
							if(rncell.attr('aria-describedby') === $t.id+"_rn" ) {
								rncv++;
								rncell.attr("title", rncv+'').text(rncv+'');
								grdata[kk - offset][1] = rncell.prop('outerHTML');
							}
						}
						str += grdata[kk - offset].join('');
					}
					if(grp.groupSummaryPos[n.idx] !== 'header') {
						var jj;
						if (gg !== undefined) {
							for (jj = 0; jj < grp.groupField.length; jj++) {
								if (gg.dataIndex === grp.groupField[jj]) {
									break;
								}
							}
							toEnd = grp.groupField.length - jj;
						}
						for (ik = 0; ik < toEnd; ik++) {
							if(!sumreverse[ik]) { continue; }
							var hhdr = "";
							if(grp.groupCollapse && !grp.showSummaryOnHide) {
								hhdr = " style=\"display:none;\"";
							}
							str += "<tr"+hhdr+" jqfootlevel=\""+(n.idx-ik)+"\" role=\"row\" class=\"" + common.content + " jqfoot ui-row-"+$t.p.direction+"\">";
							str += buildSummaryTd(i, ik, grp.groups, 0, false);
							str += "</tr>";
						}
						toEnd = jj;
					}
				}
			});
			$("#"+$.jgrid.jqID($t.p.id)+" tbody").first().append(str);
			// free up memory
			str = null;
		});
	},
	groupingGroupBy : function (name, options ) {
		return this.each(function(){
			var $t = this;
			if(typeof name === "string") {
				name = [name];
			}
			var grp = $t.p.groupingView;
			$t.p.grouping = true;
			grp._locgr = false;
			//Set default, in case visibilityOnNextGrouping is undefined 
			if (grp.visibiltyOnNextGrouping === undefined) {
				grp.visibiltyOnNextGrouping = [];
			}
			var i;
			// show previous hidden groups if they are hidden and weren't removed yet
			for(i=0;i<grp.groupField.length;i++) {
				if(!grp.groupColumnShow[i] && grp.visibiltyOnNextGrouping[i]) {
					$($t).jqGrid('showCol',grp.groupField[i]);
				}
			}
			// set visibility status of current group columns on next grouping
			for(i=0;i<name.length;i++) {
				grp.visibiltyOnNextGrouping[i] = $("#"+$.jgrid.jqID($t.p.id)+"_"+$.jgrid.jqID(name[i])).is(":visible");
			}
			$t.p.groupingView = $.extend($t.p.groupingView, options || {});
			grp.groupField = name;
			$($t).trigger("reloadGrid");
		});
	},
	groupingRemove : function (current, grpViewInit) {
		return this.each(function(){
			var $t = this;
			if(current === undefined) {
				current = true;
			}
			if(grpViewInit === undefined) {
				grpViewInit = false;
			}
			$t.p.grouping = false;
			if(current===true) {
				var grp = $t.p.groupingView, i;
				// show previous hidden groups if they are hidden and weren't removed yet
				for(i=0;i<grp.groupField.length;i++) {
				if (!grp.groupColumnShow[i] && grp.visibiltyOnNextGrouping[i]) {
						$($t).jqGrid('showCol', grp.groupField);
					}
				}
				$("#"+$.jgrid.jqID($t.p.id)+" tbody").first().find("tr.jqgroup, tr.jqfoot").remove();
				$("#"+$.jgrid.jqID($t.p.id)+" tbody").first().find("tr.jqgrow:hidden").show();
			} else {
				$($t).trigger("reloadGrid");
			}
			if(grpViewInit) {
				$($t).jqGrid('groupingInit');
			}
		});
	},
	groupingCalculations : {
		handler: function(fn, v, field, round, roundType, rc) {
			var funcs = {
				sum: function() {
					return $.jgrid.floatNum(v) + $.jgrid.floatNum(rc[field]);
				},

				min: function() {
					if(v==="") {
						return $.jgrid.floatNum(rc[field]);
					}
					return Math.min($.jgrid.floatNum(v),$.jgrid.floatNum(rc[field]));
				},

				max: function() {
					if(v==="") {
						return $.jgrid.floatNum(rc[field]);
					}
					return Math.max($.jgrid.floatNum(v),$.jgrid.floatNum(rc[field]));
				},

				count: function() {
					if(v==="") {v=0;}
					if(rc.hasOwnProperty(field)) {
						return v+1;
					}
					return 0;
				},

				avg: function() {
					// the same as sum, but at end we divide it
					// so use sum instead of duplicating the code (?)
					return funcs.sum();
				}
			};

			if(!funcs[fn]) {
				throw "jqGrid Grouping No such method: " + fn;
			}
			var res = funcs[fn]();

			if (round != null) {
				if (roundType === 'fixed') {
					res = res.toFixed(round);
				} else {
					var mul = Math.pow(10, round);
					res = Math.round(res * mul) / mul;
				}
			}

			return res;
		}	
	},
	groupingResetCalcs : function () {
		return this.each(function(){
			this.p.groupingView._locgr = false;
		});
	},
	setColSpanHeader : function( o ) {
		return this.each(function(){
			var ts = this,
			i, cmi, skip = 0, th, $th, thStyle, k,
			iCol,
			cghi,
			//startColumnName,
			numberOfColumns,
			titleText,
                        toolTip,
			cVisibleColumns,
			className,
			colModel = ts.p.colModel,
			cml = colModel.length,
			ths = ts.grid.headers,
			$htable = $("table.ui-jqgrid-htable", ts.grid.hDiv),
			$thead = $htable.children("thead"),
			$firstHeaderRow = $htable.find(".jqg-first-row-header"),
			$focusElem = false,
			frozen = false,
			//classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')]['grouping'],
			numberOfHeadRows = $thead.children("tr").length;
			//base = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].base;
			if(Array.isArray( o )) {
				ts.p.colSpanHeader =  o;
			}
			if($firstHeaderRow[0] === undefined) {
				$firstHeaderRow = $('<tr>', {role: "row", "aria-hidden": "true"}).addClass("jqg-first-row-header").css("height", "auto");
			} else {
				$firstHeaderRow.empty();
			}
			if(ts.p.frozenColumns) {
				$(ts).jqGrid("destroyFrozenColumns");
				frozen = true;
			}
			for (i = 0; i < cml; i++) {
				th = ths[i].el;
				$th = $(th);
				cmi = colModel[i];
				// build the next cell for the first header row
				thStyle = { height: '0px', width: ths[i].width + 'px', display: (cmi.hidden ? 'none' : '')};
				$("<th>", {role: 'gridcell'}).css(thStyle).addClass("ui-first-th-"+ts.p.direction + " " + (cmi.labelClasses || "") ).appendTo($firstHeaderRow);
			}
			$thead.prepend($firstHeaderRow);

			//$firstRow = $thead.find("tr.jqg-first-row-header");
			$(ts).on('jqGridResizeStop.setGroupHeaders', function (e, nw, idx) {
				$firstHeaderRow.find('th').eq(idx)[0].style.width = nw + "px";
			});
			for (i = 0; i < cml; i++) {
				th = ths[i].el;
				$th = $(th);
				cmi = colModel[i];
				iCol = $.jgrid.inColumnHeader(cmi.name, ts.p.colSpanHeader);
				if (iCol >= 0) {
					cghi = ts.p.colSpanHeader[iCol];
					numberOfColumns = cghi.numberOfColumns;
					titleText = cghi.titleText || "";
					className = cghi.className || "";
					toolTip = cghi.toolTip || "";
					// caclulate the number of visible columns from the next numberOfColumns columns
					for (cVisibleColumns = 0, iCol = 0; iCol < numberOfColumns && (i + iCol < cml); iCol++) {
						if (!colModel[i + iCol].hidden) {
							cVisibleColumns++;
						}
					}

					if(cVisibleColumns > 0) {
						$th.attr("colspan", String(cVisibleColumns));
						if(numberOfHeadRows > 1) {
							for(k=1;k<numberOfHeadRows; k++) {
								$("tr",$thead).eq(k+1).find("th").eq(i).attr("colspan", String(cVisibleColumns));
							}
						}
					}
					if (titleText) {
						var fl = $th.find("div.ui-th-div")[0];
						cghi.savedLabel = fl.innerHTML;
						fl.innerHTML = titleText;
						if(typeof toolTip === "string" && toolTip !== "") {
							$th.attr("title", toolTip);
						} else if (ts.p.headertitles) {
							$th.attr("title", titleText);
						}
					}
					$th.addClass(className);
					for( skip=0;skip < numberOfColumns-1;skip++) {
						$(ths[skip+i+1].el).hide();
						ts.p.colModel[skip+i+1].hidedlg = true;
						ts.p.colModel[skip+i+1]._colspancell = true;
						if(numberOfHeadRows > 1) {
							for(k=1;k<numberOfHeadRows; k++) {
								$("tr",$thead).eq(k+1).find("th").eq(i+skip+1).hide();
							}
						}
					}
				}
			}
			
			if( $focusElem ) {
				try {
					$($focusElem).focus();
				} catch(fe) {}
			}
			if(frozen) {
				$(ts).jqGrid("setFrozenColumns");
			}

		});
	},
	destroyColSpanHeader : function(emptyColSpan) {
		if(emptyColSpan === undefined) {
			emptyColSpan = true;
		}
		return this.each(function(){
			var ts = this,
			$htable = $("table.ui-jqgrid-htable", ts.grid.hDiv),
			clitem, fl, k, j, itm, cellInd,
			$thead = $htable.children("thead");
			$("tr.jqg-first-row-header", $thead).remove();
			if(ts.p.colSpanHeader.length) {
				for(j = 0;j<ts.p.colSpanHeader.length;j++) {
					clitem = ts.p.colSpanHeader[j];
					cellInd = $.jgrid.getElemByAttrVal( ts.p.colModel, 'name', clitem.startColumnName, true);
					if(cellInd < 0 ) {
						continue;
					}
					for(k = cellInd+1; k < cellInd + clitem.numberOfColumns; k++) {
						ts.p.colModel[k].hidedlg=false;
						ts.p.colModel[k]._colspancell=false;
					}
					$(">tr", $thead).each(function( i, n) {
						itm = $("th",n).eq(cellInd);
						if(!itm.className) {
							itm.className = "";
						}
						$(itm).attr("colspan","").removeClass( itm.className );
						if($(n).hasClass('ui-jqgrid-labels')) {
							fl = itm.find("div.ui-th-div")[0];
							fl.innerHTML = clitem.savedLabel;
						}
						for(k=1;k<clitem.numberOfColumns;k++) {
							$("th", n).eq(cellInd+k).show();
						}
					});
				}
			}
			if(emptyColSpan) {
				ts.p.colSpanHeader =[];
			}
		});
	},
	setGroupHeaders : function ( o ) {
		o = $.extend({
			useColSpanStyle :  false,
			groupHeaders: []
		},o  || {});
		return this.each(function(){
			var ts = this,
			i, cmi, skip = 0, $tr, $colHeader, th, $th, thStyle,
			iCol,
			cghi,
			//startColumnName,
			numberOfColumns,
			titleText,
			toolTip,
			cVisibleColumns,
			className,
			colModel = ts.p.colModel,
			cml = colModel.length,
			ths = ts.grid.headers,
			$htable = $("table.ui-jqgrid-htable", ts.grid.hDiv),
			$trLabels = $htable.children("thead").children("tr.ui-jqgrid-labels").last().addClass("jqg-second-row-header"),
			$thead = $htable.children("thead"),
			$theadInTable,
			$firstHeaderRow = $htable.find(".jqg-first-row-header"),
			$firstRow,
			$focusElem = false,
			frozen = false,
			//classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')]['grouping'],
			base = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].base;
			if(!ts.p.groupHeader) {
				ts.p.groupHeader = [];
			}
			ts.p.groupHeader.push(o);
			ts.p.groupHeaderOn = true;
			if($firstHeaderRow[0] === undefined) {
				$firstHeaderRow = $('<tr>', {role: "row", "aria-hidden": "true"}).addClass("jqg-first-row-header").css("height", "auto");
			} else {
				$firstHeaderRow.empty();
			}
			if(ts.p.frozenColumns) {
				$(ts).jqGrid("destroyFrozenColumns");
				frozen = true;
			}
			
			if( $(document.activeElement).is('input') || $(document.activeElement).is('textarea') ) {
				$focusElem = document.activeElement;
			}
			$(ts).prepend($thead);

			$tr = $('<tr>', {role: "row"}).addClass("ui-jqgrid-labels jqg-third-row-header");
			for (i = 0; i < cml; i++) {
				th = ths[i].el;
				$th = $(th);
				cmi = colModel[i];
				// build the next cell for the first header row
				thStyle = { height: '0px', width: ths[i].width + 'px', display: (cmi.hidden ? 'none' : '')};
				$("<th>", {role: 'gridcell'}).css(thStyle).addClass("ui-first-th-"+ts.p.direction + " " + (cmi.labelClasses || "") ).appendTo($firstHeaderRow);

				th.style.width = ""; // remove unneeded style
				iCol = $.jgrid.inColumnHeader(cmi.name, o.groupHeaders);
				if (iCol >= 0) {
					cghi = o.groupHeaders[iCol];
					numberOfColumns = cghi.numberOfColumns;
					titleText = cghi.titleText;
					toolTip = cghi.toolTip || "";
					className = cghi.className || "";
					// caclulate the number of visible columns from the next numberOfColumns columns
					for (cVisibleColumns = 0, iCol = 0; iCol < numberOfColumns && (i + iCol < cml); iCol++) {
						if (!colModel[i + iCol].hidden) {
							cVisibleColumns++;
						}
					}

					// The next numberOfColumns headers will be moved in the next row
					// in the current row will be placed the new column header with the titleText.
					// The text will be over the cVisibleColumns columns
					$colHeader = $('<th>').attr({role: "columnheader", "data-spname": cmi.name})
						.addClass(base.headerBox+ " ui-th-column-header ui-th-"+ts.p.direction+" "+className + " "+(cmi.labelClasses || ""))
						//.css({'height':'22px', 'border-top': '0 none'})
						.html(titleText);
					if(cVisibleColumns > 0) {
						$colHeader.attr("colspan", String(cVisibleColumns));
					}
					if(typeof toolTip === "string" && toolTip !== "") {
						$colHeader.attr("title", toolTip);
					} else if (ts.p.headertitles) {
						$colHeader.attr("title", $colHeader.text());
					}
					// hide if not a visible cols
					if( cVisibleColumns === 0) {
						$colHeader.hide();
					}

					$th.before($colHeader); // insert new column header before the current
					$tr.append(th);         // move the current header in the next row

					// set the coumter of headers which will be moved in the next row
					skip = numberOfColumns - 1;
				} else {
					if (skip === 0) {
						if (o.useColSpanStyle) {
							// expand the header height to n rows
							var rowspan = $th.attr("rowspan") ? parseInt($th.attr("rowspan"),10) + 1 : 2;
							$th.attr("rowspan", rowspan);
						} else {
							$('<th>', {role: "columnheader"})
								.addClass(base.headerBox+" ui-th-column-header ui-th-"+ts.p.direction)
								.css({"display": cmi.hidden ? 'none' : ''})
								.attr( { "data-spname": cmi.name})
								.insertBefore($th);
							$tr.append(th);
						}
					} else {
						// move the header to the next row
						//$th.css({"padding-top": "2px", height: "19px"});
						$tr.append(th);
						skip--;
					}
				}
			}
			$theadInTable = $(ts).children("thead");
			$theadInTable.prepend($firstHeaderRow);
			$tr.insertAfter($trLabels);
			$htable.append($theadInTable);

			if (o.useColSpanStyle) {
				// Increase the height of resizing span of visible headers
				$htable.find("span.ui-jqgrid-resize").each(function () {
					var $parent = $(this).parent();
					if ($parent.is(":visible")) {
						this.style.cssText = 'height: ' + $parent.height() + 'px !important; cursor: col-resize;';
					}
				});

				// Set position of the sortable div (the main lable)
				// with the column header text to the middle of the cell.
				// One should not do this for hidden headers.
				$htable.find("div.ui-jqgrid-sortable").each(function () {
					var $ts = $(this), $parent = $ts.parent();
					if ($parent.is(":visible") && $parent.is(":has(span.ui-jqgrid-resize)")) {
						// minus 4px from the margins of the resize markers
						$ts.css('top', ($parent.height() - $ts.outerHeight()) / 2  - 4 +  'px');
					}
				});
			}

			$firstRow = $theadInTable.find("tr.jqg-first-row-header");
			$(ts).on('jqGridResizeStop.setGroupHeaders', function (e, nw, idx) {
				$firstRow.find('th').eq(idx)[0].style.width = nw + "px";
			});
			if( $focusElem ) {
				try {
					$($focusElem).focus();
				} catch(fe) {}
			}
			var testws = $("tr.jqg-second-row-header th").eq( 0 );
			if( $.jgrid.type(testws)==='object' && testws.length && $.jgrid.trim(testws[0].outerText) === "" ) {
				$("tr.jqg-second-row-header th").eq( 0 ).prepend('&nbsp;');
			}
			if(frozen) {
				$(ts).jqGrid("setFrozenColumns");
			}			
			$(ts).triggerHandler("afterSetGroupHandler", [o]);
			
		});				
	},
	destroyGroupHeader : function(nullHeader) {
		if(nullHeader === undefined) {
			nullHeader = true;
		}
		return this.each(function()
		{
			var $t = this, $tr, i, l, headers, $th, $resizing, grid = $t.grid,
			thead = $("table.ui-jqgrid-htable thead", grid.hDiv), cm = $t.p.colModel, hc, frozen = false;
			if(!grid) { return; }
			if($t.p.frozenColumns) {
				$($t).jqGrid("destroyFrozenColumns");
				frozen = true;
			}

			$(this).off('.setGroupHeaders');
			$t.p.groupHeaderOn = false;
			$tr = $("<tr>", {role: "row"}).addClass("ui-jqgrid-labels");
			headers = grid.headers;
			for (i = 0, l = headers.length; i < l; i++) {
				hc = cm[i].hidden ? "none" : "";
				$th = $(headers[i].el)
					.width( $('tr.jqg-first-row-header th', thead).eq( i ).width() )
					.css('display',hc);
				try {
					$th.removeAttr("rowSpan");
				} catch (rs) {
					//IE 6/7
					$th.attr("rowSpan",1);
				}
				$tr.append($th);
				$resizing = $th.children("span.ui-jqgrid-resize");
				if ($resizing.length>0) {// resizable column
					$resizing[0].style.height = "";
				}
				$th.children("div")[0].style.top = "";
			}
			$(thead).children('tr.ui-jqgrid-labels').remove();
			$(thead).children('tr.jqg-first-row-header').remove();
			$(thead).prepend($tr);

			if(nullHeader === true) {
				$($t).jqGrid('setGridParam',{ 'groupHeader': null});
			}
			if(frozen) {
				$($t).jqGrid("setFrozenColumns");
			}
			$($t).off("afterSetGroupHandler");
		});
	},
	isGroupHeaderOn : function () {
		var $t = this[0];
		return $t.p.groupHeaderOn === true && $t.p.groupHeader && (Array.isArray($t.p.groupHeader) || $.jgrid.isFunction($t.p.groupHeader) );
	}, 
	refreshGroupHeaders : function() {
		return this.each(function(){
			var ts = this,
			gHead,
			gh = $(ts).jqGrid("isGroupHeaderOn");
			if(gh) { 
				$(ts).jqGrid('destroyGroupHeader', false);
				gHead = $.extend([],ts.p.groupHeader);
				ts.p.groupHeader = null;
			}
			if( gh && gHead)  {
				for(var k =0; k < gHead.length; k++) {
					$(ts).jqGrid('setGroupHeaders', gHead[k]);
				}
			}
		});
	}
});

//module begin
$.jgrid = $.jgrid || {};
$.extend($.jgrid,{
	saveState : function ( jqGridId, o ) {
		o = $.extend({
			useStorage : true,
			storageType : "localStorage", // localStorage or sessionStorage
			beforeSetItem : null,
			compression: false,
			compressionModule :  'LZString', // object by example gzip, LZString
			compressionMethod : 'compressToUTF16', // string by example zip, compressToUTF16
			debug : false,
			saveData : true
		}, o || {});
		if(!jqGridId) { return; }
		var gridstate = "", data = "", ret, $t = $("#"+jqGridId)[0], tmp;
		// to use navigator set storeNavOptions to true in grid options
		if(!$t.grid) { return;}
		tmp = $($t).data('inlineNav');
		if(tmp && $t.p.inlineNav) {
			$($t).jqGrid('setGridParam',{_iN: tmp});
		}
		tmp = $($t).data('filterToolbar');
		if(tmp && $t.p.filterToolbar) {
			$($t).jqGrid('setGridParam',{_fT: tmp});
		}
		gridstate  =  $($t).jqGrid('jqGridExport', { exptype : "jsonstring", ident:"", root:"", data : o.saveData });
		data = '';
		if( o.saveData ) {
			data = $($t.grid.bDiv).find(".ui-jqgrid-btable tbody").first().html();
			var firstrow  = data.indexOf("</tr>");
			data = data.slice(firstrow + 5);
		}
		if($.jgrid.isFunction(o.beforeSetItem)) {
			ret = o.beforeSetItem.call($t, gridstate);
			if(ret != null) {
				gridstate = ret;
			}
		}
		if(o.debug) {
			$("#gbox_tree").prepend('<a id="link_save" target="_blank" download="jqGrid_dump.txt">Click to save Dump Data</a>');
			var temp = [], file, properties = {}, url;
			temp.push("Grid Options\n");
			temp.push(gridstate);
			temp.push("\n");
			temp.push("GridData\n");
			temp.push(data);
			properties.type = 'plain/text;charset=utf-8'; // Specify the file's mime-type.
			try {
				file = new File(temp, "jqGrid_dump.txt", properties);
			} catch (e) {
				file = new Blob(temp, properties);
			}
			url = URL.createObjectURL(file);
			$("#link_save").attr("href",url).on('click',function(){
				$(this).remove();
			});
		}
		if(o.compression) {
			if(o.compressionModule) {
				try {
					ret = window[o.compressionModule][o.compressionMethod](gridstate);
					if(ret != null) {
						gridstate = ret;
						data = window[o.compressionModule][o.compressionMethod](data);
					}
				} catch (e) {
					// can not execute a compression.
				}
			}
		}
		if(o.useStorage && $.jgrid.isLocalStorage()) {
			try {
				window[o.storageType].setItem("jqGrid"+$t.p.id, gridstate);
				window[o.storageType].setItem("jqGrid"+$t.p.id+"_data", data);
			} catch (e) {
				if(e.code === 22) { // chrome is 21
					// just for now. we should make some additionla changes and eventually clear some local items
					alert("Local storage limit is over!");
				}
			}
		}
		return gridstate;
	},
	loadState : function (jqGridId, gridstring, o) {
		o = $.extend({
			useStorage : true,
			storageType : "localStorage",
			clearAfterLoad: false,  // clears the jqGrid localStorage items aftre load
			beforeSetGrid : null,
			afterSetGrid : null,
			decompression: false,
			decompressionModule :  'LZString', // object by example gzip, LZString
			decompressionMethod : 'decompressFromUTF16', // string by example unzip, decompressFromUTF16
			restoreData : true
		}, o || {});
		if(!jqGridId) { return; }
		var ret, tmp, $t = $("#"+jqGridId)[0], data, iN, fT;
		if(o.useStorage) {
			try {
				gridstring = window[o.storageType].getItem("jqGrid"+$t.id);
				data = window[o.storageType].getItem("jqGrid"+$t.id+"_data");
			} catch (e) {
				// can not get data
			}
		}
		if(!gridstring) { return; }
		if(o.decompression) {
			if(o.decompressionModule) {
			try {
					ret = window[o.decompressionModule][o.decompressionMethod]( gridstring );
					if(ret != null ) {
						gridstring = ret;
						data = window[o.decompressionModule][o.decompressionMethod]( data );
					}
				} catch (e) {
					// decompression can not be done
				}
			}
		}
		ret = $.jgrid.parseFunc( gridstring );
		if( ret && $.jgrid.type(ret) === 'object') {
			if($t.grid) {
				$.jgrid.gridUnload( jqGridId );
			}
			if($.jgrid.isFunction(o.beforeSetGrid)) {
				tmp = o.beforeSetGrid( ret );
				if(tmp && $.jgrid.type(tmp) === 'object') {
					ret = tmp;
				}
			}
			// some preparings
			var retfunc = function( param ) { var p; p = param; return p;},
			prm = {
				"reccount" : ret.reccount,
				"records" : ret.records,
				"lastpage" : ret.lastpage,
				"shrinkToFit" : retfunc( ret.shrinkToFit),
				"data": retfunc(ret.data),
				"datatype" : retfunc(ret.datatype),
				"grouping" : retfunc(ret.grouping)
			};
			ret.shrinkToFit = false;
			ret.data = [];
			ret.datatype = 'local';
			ret.grouping = false;
			//ret.navGrid = false;

			if(ret.inlineNav) {
				iN = retfunc( ret._iN );
				ret._iN = null; delete ret._iN;
			}
			if(ret.filterToolbar) {
				fT = retfunc( ret._fT );
				ret._fT = null; delete ret._fT;
			}
			var grid = $("#"+jqGridId).jqGrid( ret );
			grid.jqGrid('delRowData','norecs');
			if( o.restoreData && $.jgrid.trim( data ) !== '') {
				grid.append( data );
			}
			grid.jqGrid( 'setGridParam', prm);
			if(ret.storeNavOptions && ret.navGrid) {
				// set to false so that nav grid can be run
				grid[0].p.navGrid = false;
				grid.jqGrid('navGrid', ret.pager, ret.navOptions, ret.editOptions, ret.addOptions, ret.delOptions, ret.searchOptions, ret.viewOptions);
				if(ret.navButtons && ret.navButtons.length) {
					for(var b = 0; b < ret.navButtons.length; b++) {
						if( 'sepclass'  in ret.navButtons[b][1]) {
							grid.jqGrid('navSeparatorAdd', ret.navButtons[b][0], ret.navButtons[b][1]);
						} else {
							grid.jqGrid('navButtonAdd', ret.navButtons[b][0], ret.navButtons[b][1]);
						}
					}
				}
			}
			// refresh index
			grid[0].refreshIndex();
			// subgrid
			if(ret.subGrid) {
				var ms = ret.multiselect === 1 ? 1 : 0,
					rn = ret.rownumbers === true ? 1 :0;
				grid.jqGrid('addSubGrid', ms + rn);
				// reopen the sugrid in order to maintain the subgrid state.
				// currently only one level is supported
				// todo : supposrt for unlimited  levels
				$.each(grid[0].rows, function(i, srow){
					if( $(srow).hasClass('ui-sg-expanded') ) {
						// reopen the subgrid
						$(grid[0].rows[i-1]).find('td.sgexpanded').click().click();
					}
				});
			}
			// treegrid
			if(ret.treeGrid) {
				var i = 1, len = grid[0].rows.length,
				expCol = ret.expColInd,
				isLeaf = ret.treeReader.leaf_field,
				expanded = ret.treeReader.expanded_field;
				// optimization of code needed here
				while(i<len) {
					$(grid[0].rows[i].cells[expCol])
						.find("div.treeclick")
						.on("click",function(e){
							var target = e.target || e.srcElement,
							ind2 =$.jgrid.stripPref(ret.idPrefix,$(target,grid[0].rows).closest("tr.jqgrow")[0].id),
							pos = grid[0].p._index[ind2];
							if(!grid[0].p.data[pos][isLeaf]){
								if(grid[0].p.data[pos][expanded]){
									grid.jqGrid("collapseRow",grid[0].p.data[pos]);
									grid.jqGrid("collapseNode",grid[0].p.data[pos]);
								} else {
									grid.jqGrid("expandRow",grid[0].p.data[pos]);
									grid.jqGrid("expandNode",grid[0].p.data[pos]);
								}
							}
							return false;
						});
					if(ret.ExpandColClick === true) {
						$(grid[0].rows[i].cells[expCol])
							.find("span.cell-wrapper")
							.css("cursor","pointer")
							.on("click",function(e) {
								var target = e.target || e.srcElement,
								ind2 =$.jgrid.stripPref(ret.idPrefix,$(target,grid[0].rows).closest("tr.jqgrow")[0].id),
								pos = grid[0].p._index[ind2];
								if(!grid[0].p.data[pos][isLeaf]){
									if(grid[0].p.data[pos][expanded]){
										grid.jqGrid("collapseRow", grid[0].p.data[pos]);
										grid.jqGrid("collapseNode", grid[0].p.data[pos]);
									} else {
										grid.jqGrid("expandRow", grid[0].p.data[pos]);
										grid.jqGrid("expandNode", grid[0].p.data[pos]);
									}
								}
								grid.jqGrid("setSelection",ind2);
								return false;
						});
					}
					i++;
				}
			}
			// multiselect
			if(ret.multiselect) {
				$.each(ret.selarrrow, function(){
					$("#jqg_" + jqGridId + "_"+this)[ret.useProp ? 'prop': 'attr']("checked", "checked");
				});
			}
			// grouping
			if(grid.jqGrid('isGroupHeaderOn')) {
				grid.jqGrid('refreshGroupHeaders');
			}
			// searchcol
			if(ret.searchCols) {
				for(var key in ret._results) {
					if(ret._results.hasOwnProperty(key)) {
						$("#jqs_" + jqGridId + "_"+key).val(ret._results[key].v);
					}
				}
			}
			// pivotgrid
			// 
			// inline navigator
			if(ret.inlineNav && iN) {
				grid.jqGrid('setGridParam', { inlineNav:false });
				grid.jqGrid('inlineNav', ret.pager, iN);
			}
			// toolbar filter
			if(ret.filterToolbar && fT) {
				grid.jqGrid('setGridParam', { filterToolbar:false });
				fT.restoreFromFilters = true;
				grid.jqGrid('filterToolbar', fT);
			}
			// finally frozenColums
			if( ret.frozenColumns ) {
				grid.jqGrid('setFrozenColumns');
			}
			grid[0].updatepager(true, true);

			if($.jgrid.isFunction(o.afterSetGrid)) {
				o.afterSetGrid( grid );
			}
			if(o.clearAfterLoad) {
				window[o.storageType].removeItem("jqGrid"+$t.id);
				window[o.storageType].removeItem("jqGrid"+$t.id + "_data");
			}
		} else {
			alert("can not convert to object");
		}
	},
	isGridInStorage : function ( jqGridId, options ) {
		var o = {
			storageType: "localStorage"
		};
		o =  $.extend(o , options || {});
		var ret, gridstring, data;
		try {
			gridstring = window[o.storageType].getItem("jqGrid"+jqGridId);
			data = window[o.storageType].getItem("jqGrid" + jqGridId + "_data");
			ret = gridstring != null && data != null && typeof gridstring === "string" && typeof data === "string" ;
		} catch (e) {
			ret = false;
		}
		return ret;
	},
	setRegional : function( jqGridId , options) {
		var o = {
			storageType: "sessionStorage"
		};
		o =  $.extend(o , options || {});

		if( !o.regional ) {
			return;
		}

		$.jgrid.saveState( jqGridId, o );

		o.beforeSetGrid = function(params) {
			params.regional = o.regional;
			params.force_regional = true;
			return params;
		};

		$.jgrid.loadState( jqGridId, null, o);
		// check for formatter actions
		var grid = $("#"+jqGridId)[0],
		model = $(grid).jqGrid('getGridParam','colModel'), i=-1, nav = $.jgrid.getRegional(grid, 'nav');
		$.each(model,function(k){
			if(this.formatter && this.formatter === 'actions') {
				i = k;
				return false;
			}
		});
		if(i !== -1 && nav) {
			$("#"+jqGridId + " tbody tr").each(function(){
				var td = this.cells[i];
				$(td).find(".ui-inline-edit").attr("title",nav.edittitle);
				$(td).find(".ui-inline-del").attr("title",nav.deltitle);
				$(td).find(".ui-inline-save").attr("title",nav.savetitle);
				$(td).find(".ui-inline-cancel").attr("title",nav.canceltitle);
			});
		}
		try {
			window[o.storageType].removeItem("jqGrid"+grid.id);
			window[o.storageType].removeItem("jqGrid"+grid.id+"_data");
		} catch (e) {}
	},
	jqGridImport : function(jqGridId, o) {
		o = $.extend({
			imptype : "xml", // xml, json, xmlstring, jsonstring
			impstring: "",
			impurl: "",
			mtype: "GET",
			impData : {},
			xmlGrid :{
				config : "root>grid",
				data: "root>rows"
			},
			jsonGrid :{
				config : "grid",
				data: "data"
			},
			ajaxOptions :{}
		}, o || {});
		var $t = (jqGridId.indexOf("#") === 0 ? "": "#") + $.jgrid.jqID(jqGridId);
		var xmlConvert = function (xml,o) {
			var cnfg = $(o.xmlGrid.config,xml)[0];
			var xmldata = $(o.xmlGrid.data,xml)[0], jstr, jstr1, key;
			if($.grid.xmlToJSON ) {
				jstr = $.jgrid.xmlToJSON( cnfg );
				//jstr = $.jgrid.parse(jstr);
				for(key in jstr) {
					if(jstr.hasOwnProperty(key)) {
						jstr1=jstr[key];
					}
				}
				if(xmldata) {
				// save the datatype
					var svdatatype = jstr.grid.datatype;
					jstr.grid.datatype = 'xmlstring';
					jstr.grid.datastr = xml;
					$($t).jqGrid( jstr1 ).jqGrid("setGridParam",{datatype:svdatatype});
				} else {
					setTimeout(function() { $($t).jqGrid( jstr1 ); },0);
				}
			} else {
				alert("xml2json or parse are not present");
			}
		};
		var jsonConvert = function (jsonstr,o){
			if (jsonstr && typeof jsonstr === 'string') {
				var json = $.jgrid.parseFunc(jsonstr);
				var gprm = json[o.jsonGrid.config];
				var jdata = json[o.jsonGrid.data];
				if(jdata) {
					var svdatatype = gprm.datatype;
					gprm.datatype = 'jsonstring';
					gprm.datastr = jdata;
					$($t).jqGrid( gprm ).jqGrid("setGridParam",{datatype:svdatatype});
				} else {
					$($t).jqGrid( gprm );
				}
			}
		};
		switch (o.imptype){
			case 'xml':
				$.ajax($.extend({
					url:o.impurl,
					type:o.mtype,
					data: o.impData,
					dataType:"xml",
					complete: function(xml,stat) {
						if(stat === 'success') {
							xmlConvert(xml.responseXML,o);
							$($t).triggerHandler("jqGridImportComplete", [xml, o]);
							if($.jgrid.isFunction(o.importComplete)) {
								o.importComplete(xml);
							}
						}
						xml=null;
					}
				}, o.ajaxOptions));
				break;
			case 'xmlstring' :
				// we need to make just the conversion and use the same code as xml
				if(o.impstring && typeof o.impstring === 'string') {
					var xmld = $.parseXML(o.impstring);
					if(xmld) {
						xmlConvert(xmld,o);
						$($t).triggerHandler("jqGridImportComplete", [xmld, o]);
						if($.jgrid.isFunction(o.importComplete)) {
							o.importComplete(xmld);
						}
					}
				}
				break;
			case 'json':
				$.ajax($.extend({
					url:o.impurl,
					type:o.mtype,
					data: o.impData,
					dataType:"json",
					complete: function(json) {
						try {
							jsonConvert(json.responseText,o );
							$($t).triggerHandler("jqGridImportComplete", [json, o]);
							if($.jgrid.isFunction(o.importComplete)) {
								o.importComplete(json);
							}
						} catch (ee){}
						json=null;
					}
				}, o.ajaxOptions ));
				break;
			case 'jsonstring' :
				if(o.impstring && typeof o.impstring === 'string') {
					jsonConvert(o.impstring,o );
					$($t).triggerHandler("jqGridImportComplete", [o.impstring, o]);
					if($.jgrid.isFunction(o.importComplete)) {
						o.importComplete(o.impstring);
					}
				}
				break;
		}
	}
});
	$.jgrid.extend({
		jqGridExport : function(o) {
			o = $.extend({
				exptype : "xmlstring",
				root: "grid",
				ident: "\t",
				addOptions : {},
				data : true
			}, o || {});
			var ret = null;
			this.each(function () {
				if(!this.grid) { return;}
				var gprm = $.extend(true, {}, $(this).jqGrid("getGridParam"), o.addOptions);
				// we need to check for:
				// 1.multiselect, 2.subgrid  3. treegrid and remove the unneded columns from colNames
				if(gprm.rownumbers) {
					gprm.colNames.splice(0,1);
					gprm.colModel.splice(0,1);
				}
				if(gprm.multiselect) {
					gprm.colNames.splice(0,1);
					gprm.colModel.splice(0,1);
				}
				if(gprm.searchCols) {
					gprm.colNames.splice(0,1);
					gprm.colModel.splice(0,1);
				}
				if(gprm.subGrid) {
					gprm.colNames.splice(0,1);
					gprm.colModel.splice(0,1);
				}
				gprm.knv = null;
				if(!o.data) {
					gprm.data = [];
					gprm._index = {};
				}
				switch (o.exptype) {
					case 'xmlstring' :
						ret = "<"+o.root+">"+ $.jgrid.jsonToXML( gprm, {xmlDecl:""} )+"</"+o.root+">";
						break;
					case 'jsonstring' :
						ret =  $.jgrid.stringify( gprm );
						if(o.root) { ret = "{"+ o.root +":"+ret+"}"; }
						break;
				}
			});
			return ret;
		},
		excelExport : function(o) {
			o = $.extend({
				exptype : "remote",
				url : null,
				oper: "oper",
				tag: "excel",
				beforeExport : null,
				exporthidden : false,
				exportgrouping: false,
				exportOptions : {},
				method : 'GET'
			}, o || {});
			return this.each(function(){
				if(!this.grid) { return;}
				var url;
				if(o.exptype === "remote") {
					var pdata = $.extend({},this.p.postData), expg;
					pdata[o.oper] = o.tag;
					if($.jgrid.isFunction(o.beforeExport)) {
						var result = o.beforeExport.call(this, pdata );
						if( $.isPlainObject( result ) ) {
							pdata = result;
						}
					}
					if(o.exporthidden) {
						var cm = this.p.colModel, i, len = cm.length, newm=[];
						for(i=0; i< len; i++) {
							if(cm[i].hidden === undefined) { cm[i].hidden = false; }
							newm.push({name:cm[i].name, hidden:cm[i].hidden});
						}
						var newm1 = JSON.stringify( newm );
						if(typeof newm1 === 'string' ) {
							pdata.colModel = newm1;
						}
					}
					if(o.exportgrouping) {
						expg = JSON.stringify( this.p.groupingView );
						if(typeof expg === 'string' ) {
							pdata.groupingView = expg;
						}
					}
					try {
						$.jgrid.postForm(o.url, pdata, o.method);
					} catch (e) {
						var params = jQuery.param(pdata);
						if(o.url.indexOf("?") !== -1) { url = o.url+"&"+params; }
						else { url = o.url+"?"+params; }
						window.location = url;
					}
				}
			});
		}
    });

//module begin
$.jgrid.inlineEdit = $.jgrid.inlineEdit || {};
$.jgrid.extend({
//Editing
	editRow : function(rowid,keys,oneditfunc,successfunc, url, extraparam, aftersavefunc,errorfunc, afterrestorefunc) {
		// Compatible mode old versions
		var o={}, args = $.makeArray(arguments).slice(1), $t = this[0];

		if( $.jgrid.type(args[0]) === "object" ) {
			o = args[0];
		} else {
			if (keys !== undefined) { o.keys = keys; }
			if ($.jgrid.isFunction(oneditfunc)) { o.oneditfunc = oneditfunc; }
			if ($.jgrid.isFunction(successfunc)) { o.successfunc = successfunc; }
			if (url !== undefined) { o.url = url; }
			if (extraparam !== undefined) { o.extraparam = extraparam; }
			if ($.jgrid.isFunction(aftersavefunc)) { o.aftersavefunc = aftersavefunc; }
			if ($.jgrid.isFunction(errorfunc)) { o.errorfunc = errorfunc; }
			if ($.jgrid.isFunction(afterrestorefunc)) { o.afterrestorefunc = afterrestorefunc; }
			// last two not as param, but as object (sorry)
			//if (restoreAfterError !== undefined) { o.restoreAfterError = restoreAfterError; }
			//if (mtype !== undefined) { o.mtype = mtype || "POST"; }
		}
		o = $.extend(true, {
			keys : false,
			keyevent : "keydown",
			onEnter : null,
			onEscape : null,
			oneditfunc: null,
			successfunc: null,
			url: null,
			extraparam: {},
			aftersavefunc: null,
			errorfunc: null,
			afterrestorefunc: null,
			restoreAfterError: true,
			mtype: "POST",
			focusField : true,
			saveui : "enable",
			savetext : $.jgrid.getRegional($t,'defaults.savetext')
		}, $.jgrid.inlineEdit, o );

		// End compatible
		return this.each(function(){
			var nm, tmp, editable, cnt=0, focus=null, svr={}, ind,cm, bfer,
			inpclass = $(this).jqGrid('getStyleUI',$t.p.styleUI+".inlinedit",'inputClass', true),
			selclass = $(this).jqGrid('getStyleUI',$t.p.styleUI+".inlinedit",'selectClass', true);
			if (!$t.grid ) { return; }
			ind = $($t).jqGrid("getInd",rowid,true);
			if( ind === false ) {return;}
			$t.p.beforeAction = true;
			bfer = $.jgrid.isFunction( o.beforeEditRow ) ? o.beforeEditRow.call($t,o, rowid) :  undefined;
			if( bfer === undefined ) {
				bfer = true;
			}
			if(!bfer) {
				$t.p.beforeAction = false;
				return;
			}
			editable = $(ind).attr("editable") || "0";
			if (editable === "0" && !$(ind).hasClass("not-editable-row")) {
				cm = $t.p.colModel;
				$(ind).children('td[role="gridcell"]').each( function(i) {
					nm = cm[i].name;
					var treeg = $t.p.treeGrid===true && nm === $t.p.ExpandColumn;
					if(treeg) { tmp = $(this).find("span").first().html();}
					else {
						try {
							tmp = $.unformat.call($t,this,{rowId:rowid, colModel:cm[i]},i);
						} catch (_) {
							tmp =  ( cm[i].edittype && cm[i].edittype === 'textarea' ) ? $(this).text() : $(this).html();
						}
					}
					if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn' && nm !== 'sc') {
						if($t.p.autoencode) { tmp = $.jgrid.htmlDecode(tmp); }
						//svr[nm]=tmp;
						if(cm[i].editable===true) {
							svr[nm]=tmp;
							if(focus===null) { focus = i; }
							if (treeg) { $(this).find("span").first().html(""); }
							else { $(this).html(""); }
							var opt = $.extend({},cm[i].editoptions || {},{id:rowid+"_"+nm,name:nm,rowId:rowid, oper:'edit', module : 'inline'});
							if(!cm[i].edittype) { cm[i].edittype = "text"; }
							if(tmp === "&nbsp;" || tmp === "&#160;" || (tmp !== null && tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
							var elc = $.jgrid.createEl.call($t,cm[i].edittype,opt,tmp,true,$.extend({},$.jgrid.ajaxOptions,$t.p.ajaxSelectOptions || {}));
							$(elc).addClass("editable inline-edit-cell");
							if( $.inArray(cm[i].edittype, ['text','textarea','password']) > -1) {
								$(elc).addClass( inpclass );
							} else if (cm[i].edittype === 'select') {
								$(elc).addClass( selclass );
							}
							if(treeg) { $(this).find("span").first().append(elc); }
							else { $(this).append(elc); }
							$.jgrid.bindEv.call($t, elc, opt);
							//Again IE
							if(cm[i].edittype === "select" && cm[i].editoptions!==undefined && cm[i].editoptions.multiple===true  && cm[i].editoptions.dataUrl===undefined && $.jgrid.msie()) {
								$(elc).width($(elc).width());
							}
							cnt++;
						}
					}
				});
				if(cnt > 0) {
					svr.id = rowid; $t.p.savedRow.push(svr);
					$(ind).attr("editable","1");
					if(o.focusField ) {
						if(typeof o.focusField === 'number' && parseInt(o.focusField,10) <= cm.length) {
							focus = o.focusField;
						}
						setTimeout(function(){
							var fe = $("td", ind).eq( focus ).find(":input:visible").not(":disabled");
							if(fe.length > 0) {
								fe.focus();
							}
						},0);
					}
					if(o.keys===true) {
						$(ind).on( o.keyevent ,function(e) {
							if (e.keyCode === 27) {
								if($.jgrid.isFunction( o.onEscape )) {
									o.onEscape.call($t, rowid, o, e);
									return true;
								}
								$($t).jqGrid("restoreRow",rowid, o);
								if($t.p.inlineNav) {
									try {
										$($t).jqGrid('showAddEditButtons');
									} catch (eer1) {}
								}
								return false;
							}
							if (e.keyCode === 13) {
								e.preventDefault();
								if($.jgrid.isFunction( o.onEnter )) {
									o.onEnter.call($t, rowid, o, e);
									return true;
								}
								if(e.target.tagName === 'TEXTAREA') { return true; }
								if( $($t).jqGrid("saveRow", rowid, o ) ) {
									if($t.p.inlineNav) {
										try {
											$($t).jqGrid('showAddEditButtons');
										} catch (eer2) {}
									}
								}
								return false;
							}
						});
					}
					$($t).triggerHandler("jqGridInlineEditRow", [rowid, o]);
					if( $.jgrid.isFunction(o.oneditfunc)) { o.oneditfunc.call($t, rowid); }
				}
			}
		});
	},
	saveRow : function(rowid, successfunc, url, extraparam, aftersavefunc,errorfunc, afterrestorefunc) {
		// Compatible mode old versions
		var args = $.makeArray(arguments).slice(1), o = {}, $t = this[0];

		if( $.jgrid.type(args[0]) === "object" ) {
			o = args[0];
		} else {
			if ($.jgrid.isFunction(successfunc)) { o.successfunc = successfunc; }
			if (url !== undefined) { o.url = url; }
			if (extraparam !== undefined) { o.extraparam = extraparam; }
			if ($.jgrid.isFunction(aftersavefunc)) { o.aftersavefunc = aftersavefunc; }
			if ($.jgrid.isFunction(errorfunc)) { o.errorfunc = errorfunc; }
			if ($.jgrid.isFunction(afterrestorefunc)) { o.afterrestorefunc = afterrestorefunc; }
		}
		o = $.extend(true, {
			successfunc: null,
			url: null,
			extraparam: {},
			aftersavefunc: null,
			errorfunc: null,
			afterrestorefunc: null,
			restoreAfterError: true,
			mtype: "POST",
			saveui : "enable",
			savetext : $.jgrid.getRegional($t,'defaults.savetext')
		}, $.jgrid.inlineEdit, o );
		// End compatible

		var success = false, nm, tmp={}, tmp2={}, tmp3= {}, editable, fr, cv, ind, nullIfEmpty=false,
		error = $.jgrid.trim( $($t).jqGrid('getStyleUI', $t.p.styleUI+'.common', 'error', true) );
		if (!$t.grid ) { return success; }
		ind = $($t).jqGrid("getInd",rowid,true);
		if(ind === false) {return success;}
		var errors = $.jgrid.getRegional($t, 'errors'),
		edit =$.jgrid.getRegional($t, 'edit'),
		bfsr = $.jgrid.isFunction( o.beforeSaveRow ) ? o.beforeSaveRow.call($t,o, rowid) :  undefined;
		if( bfsr === undefined ) {
			bfsr = true;
		}
		if(!bfsr) { return; }
		editable = $(ind).attr("editable");
		o.url = o.url || $t.p.editurl;
		if (editable==="1") {
			var cm, index, elem;
			$(ind).children('td[role="gridcell"]').each(function(i) {
				cm = $t.p.colModel[i];
				nm = cm.name;
				elem = "";
				if ( nm !== 'cb' && nm !== 'subgrid' && cm.editable===true && nm !== 'rn'  && nm !== 'sc' && !$(this).hasClass('not-editable-cell')) {
					switch (cm.edittype) {
						case "checkbox":
							var cbv = ["Yes","No"];
							if(cm.editoptions && cm.editoptions.value) {
								cbv = cm.editoptions.value.split(":");
							}
							tmp[nm]=  $("input",this).is(":checked") ? cbv[0] : cbv[1];
							elem = $("input",this);
							break;
						case 'text':
						case 'password':
						case 'textarea':
						case "button" :
							tmp[nm]=$("input, textarea",this).val();
							elem = $("input, textarea",this);
							break;
						case 'select':
							if(!cm.editoptions.multiple) {
								tmp[nm] = $("select option:selected",this).val();
								tmp2[nm] = $("select option:selected", this).text();
							} else {
								var sel = $("select",this), selectedText = [];
								tmp[nm] = $(sel).val();
								if(tmp[nm]) { tmp[nm]= tmp[nm].join(","); } else { tmp[nm] =""; }
								$("select option:selected",this).each(
									function(i,selected){
										selectedText[i] = $(selected).text();
									}
								);
								tmp2[nm] = selectedText.join(",");
							}
							if(cm.formatter) { tmp2={}; }
							elem = $("select",this);
							break;
						case 'custom' :
							try {
								if(cm.editoptions && $.jgrid.isFunction(cm.editoptions.custom_value)) {
									tmp[nm] = cm.editoptions.custom_value.call($t, $(".customelement",this),'get');
									if (tmp[nm] === undefined) { throw "e2"; }
								} else { throw "e1"; }
							} catch (e) {
								if (e==="e1") { $.jgrid.info_dialog(errors.errcap,"function 'custom_value' "+edit.msg.nodefined,edit.bClose, {styleUI : $t.p.styleUI }); }
								else { $.jgrid.info_dialog(errors.errcap,e.message,edit.bClose, {styleUI : $t.p.styleUI }); }
							}
							break;
					}
					cv = $.jgrid.checkValues.call($t,tmp[nm],i);
					if(cv[0] === false) {
						index = i;
						return false;
					}
					if($t.p.autoencode) { tmp[nm] = $.jgrid.htmlEncode(tmp[nm]); }
					if(o.url !== 'clientArray' && cm.editoptions && cm.editoptions.NullIfEmpty === true) {
						if(tmp[nm] === "") {
							tmp3[nm] = 'null';
							nullIfEmpty = true;
						}
					}
				}
			});
			if (cv[0] === false){
				try {
					if( $.jgrid.isFunction($t.p.validationCell) ) {
						$t.p.validationCell.call($t, elem, cv[1], ind.rowIndex, index);
					} else {
						var tr = $($t).jqGrid('getGridRowById', rowid),
							positions = $.jgrid.findPos(tr);
						$.jgrid.info_dialog(errors.errcap,cv[1],edit.bClose,{
							left:positions[0],
							top:positions[1]+$(tr).outerHeight(),
							styleUI : $t.p.styleUI,
							onClose: function(){
								if(index >= 0 ) {
									$("#"+rowid+"_" +$t.p.colModel[index].name).focus();
								}
							}
						});
					}
				} catch (e) {
					alert(cv[1]);
				}
				return success;
			}
			var idname, opers = $t.p.prmNames, oldRowId = rowid;
			if ($t.p.keyName === false) {
				idname = opers.id;
			} else {
				idname = $t.p.keyName;
			}
			if(!$.isEmptyObject(tmp)) {
				tmp[opers.oper] = opers.editoper;
				if (tmp[idname] === undefined || tmp[idname]==="") {
					tmp[idname] = rowid;
				} else if (ind.id !== $t.p.idPrefix + tmp[idname]) {
					// rename rowid
					var oldid = $.jgrid.stripPref($t.p.idPrefix, rowid);
					if ($t.p._index[oldid] !== undefined) {
						$t.p._index[tmp[idname]] = $t.p._index[oldid];
						delete $t.p._index[oldid];
					}
					rowid = $t.p.idPrefix + tmp[idname];
					$(ind).attr("id", rowid);
					if ($t.p.selrow === oldRowId) {
						$t.p.selrow = rowid;
					}
					if (Array.isArray($t.p.selarrrow)) {
						var i = $.inArray(oldRowId, $t.p.selarrrow);
						if (i>=0) {
							$t.p.selarrrow[i] = rowid;
						}
					}
					if ($t.p.multiselect) {
						var newCboxId = "jqg_" + $t.p.id + "_" + rowid;
						$("input.cbox",ind)
							.attr("id", newCboxId)
							.attr("name", newCboxId);
					}
					// TODO: to test the case of frozen columns
				}
				if($t.p.inlineData === undefined) { $t.p.inlineData ={}; }
				tmp = $.extend({},tmp,$t.p.inlineData,o.extraparam);
			}
			if (o.url === 'clientArray') {
				tmp = $.extend({},tmp, tmp2);
				if($t.p.autoencode) {
					$.each(tmp,function(n,v){
						tmp[n] = $.jgrid.htmlDecode(v);
					});
				}
				tmp = $.jgrid.isFunction($t.p.serializeRowData) ? $t.p.serializeRowData.call($t, tmp) : tmp;
				var k, resp = $($t).jqGrid("setRowData",rowid,tmp);
				$(ind).attr("editable","0");
				for(k=0;k<$t.p.savedRow.length;k++) {
					if( String($t.p.savedRow[k].id) === String(oldRowId)) {fr = k; break;}
				}
				$($t).triggerHandler("jqGridInlineAfterSaveRow", [rowid, resp, tmp, o]);
				if( $.jgrid.isFunction(o.aftersavefunc) ) { o.aftersavefunc.call($t, rowid, resp, tmp, o); }
				if(fr >= 0) { $t.p.savedRow.splice(fr,1); }
				success = true;
				$(ind).removeClass("jqgrid-new-row").off("keydown");
			} else if(o.url === 'storage') {
				tmp = $.extend({},tmp, tmp2);
				if($t.p.autoencode) {
					$.each(tmp,function(n,v){
						tmp[n] = $.jgrid.htmlDecode(v);
					});
				}
				tmp = $.jgrid.isFunction($t.p.serializeRowData) ? $t.p.serializeRowData.call($t, tmp) : tmp;
				if($(ind).hasClass("jqgrid-new-row")) {
					$($t).jqGrid('addStorageRecord', tmp)
					.then(function(e){
						if(e.type==="complete") {
							var k, resp = $($t).jqGrid("setRowData",rowid,tmp);
							$(ind).attr("editable","0");
							for(k=0;k<$t.p.savedRow.length;k++) {
								if( String($t.p.savedRow[k].id) === String(oldRowId)) {fr = k; break;}
							}
							$($t).triggerHandler("jqGridInlineAfterSaveRow", [rowid, resp, tmp, o]);
							if( $.jgrid.isFunction(o.aftersavefunc) ) { o.aftersavefunc.call($t, rowid, resp, tmp, o); }
							if(fr >= 0) { $t.p.savedRow.splice(fr,1); }
							success = true;
							$(ind).removeClass("jqgrid-new-row").off("keydown");
							if($t.p.inlineNav===true) {$($t).jqGrid('showAddEditButtons');}
						}
					})
					.catch(function(e) {
						$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
					});
			} else {
					$($t).jqGrid('updateStorageRecord', tmp)
					.then(function(e){
						if(e.type==="complete") {
							var k, resp = $($t).jqGrid("setRowData",rowid,tmp);
							$(ind).attr("editable","0");
							for(k=0;k<$t.p.savedRow.length;k++) {
								if( String($t.p.savedRow[k].id) === String(oldRowId)) {fr = k; break;}
							}
							$($t).triggerHandler("jqGridInlineAfterSaveRow", [rowid, resp, tmp, o]);
							if( $.jgrid.isFunction(o.aftersavefunc) ) { o.aftersavefunc.call($t, rowid, resp, tmp, o); }
							if(fr >= 0) { $t.p.savedRow.splice(fr,1); }
							success = true;
							$(ind).off("keydown");
							if($t.p.inlineNav===true) {$($t).jqGrid('showAddEditButtons');}
						}
					})
					.catch(function(e) {
						$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
					});			
				}
			} else {
				$($t).jqGrid("progressBar", {method:"show", loadtype : o.saveui, htmlcontent: o.savetext });
				tmp3 = $.extend({},tmp,tmp3);
				tmp3[idname] = $.jgrid.stripPref($t.p.idPrefix, tmp3[idname]);
				$.ajax($.extend({
					url:o.url,
					data: $.jgrid.isFunction($t.p.serializeRowData) ? $t.p.serializeRowData.call($t, tmp3) : tmp3,
					type: o.mtype,
					async : false, //?!?
					success: function(resuly,stat,res){
						$($t).jqGrid("progressBar", {method:"hide", loadtype : o.saveui, htmlcontent: o.savetext});
						if (stat === "success"){
							var ret = true, sucret, k;
							sucret = $($t).triggerHandler("jqGridInlineSuccessSaveRow", [res, rowid, o]);
							if ( !Array.isArray(sucret) ) {sucret = [true, tmp3];}
							if (sucret[0] && $.jgrid.isFunction(o.successfunc)) {sucret = o.successfunc.call($t, res);}
							if( Array.isArray(sucret) ) {
								// expect array - status, data, rowid
								ret = sucret[0];
								tmp = sucret[1] || tmp;
							} else {
								ret = sucret;
							}
							if (ret===true) {
								if($t.p.autoencode) {
									$.each(tmp,function(n,v){
										tmp[n] = $.jgrid.htmlDecode(v);
									});
								}
								if(nullIfEmpty) {
									$.each(tmp,function( n ){
										if(tmp[n] === 'null' ) {
											tmp[n] = '';
										}
									});
								}
								tmp = $.extend({},tmp, tmp2);
								$($t).jqGrid("setRowData",rowid,tmp);
								$(ind).attr("editable","0");
								for(k=0;k<$t.p.savedRow.length;k++) {
									if( String($t.p.savedRow[k].id) === String(rowid)) {fr = k; break;}
								}
								$($t).triggerHandler("jqGridInlineAfterSaveRow", [rowid, res, tmp, o]);
								if( $.jgrid.isFunction(o.aftersavefunc) ) { o.aftersavefunc.call($t, rowid, res, tmp, o); }
								if(fr >= 0) { $t.p.savedRow.splice(fr,1); }
								success = true;
								$(ind).removeClass("jqgrid-new-row").off("keydown");
							} else {
								$($t).triggerHandler("jqGridInlineErrorSaveRow", [rowid, res, stat, null, o]);
								if($.jgrid.isFunction(o.errorfunc) ) {
									o.errorfunc.call($t, rowid, res, stat, null);
								}
								if(o.restoreAfterError === true) {
									$($t).jqGrid("restoreRow",rowid, o);
								}
							}
						}
					},
					error:function(res,stat,err){
						$("#lui_"+$.jgrid.jqID($t.p.id)).hide();
						$($t).triggerHandler("jqGridInlineErrorSaveRow", [rowid, res, stat, err, o]);
						if($.jgrid.isFunction(o.errorfunc) ) {
							o.errorfunc.call($t, rowid, res, stat, err);
						} else {
							var rT = res.responseText || res.statusText;
							try {
								$.jgrid.info_dialog(errors.errcap,'<div class="'+error+'">'+ rT +'</div>', edit.bClose, {buttonalign:'right', styleUI : $t.p.styleUI });
							} catch(e) {
								alert(rT);
							}
						}
						if(o.restoreAfterError === true) {
							$($t).jqGrid("restoreRow",rowid, o);
						}
					}
				}, $.jgrid.ajaxOptions, $t.p.ajaxRowOptions || {}));
			}
		}
		return success;
	},
	restoreRow : function(rowid, afterrestorefunc) {
		// Compatible mode old versions
		var args = $.makeArray(arguments).slice(1), o={};

		if( $.jgrid.type(args[0]) === "object" ) {
			o = args[0];
		} else {
			if ($.jgrid.isFunction(afterrestorefunc)) { o.afterrestorefunc = afterrestorefunc; }
		}
		o = $.extend(true, {}, $.jgrid.inlineEdit, o );

		// End compatible

		return this.each(function(){
			var $t= this, fr=-1, ind, ares={}, k;
			if (!$t.grid ) { return; }
			ind = $($t).jqGrid("getInd",rowid,true);
			if(ind === false) {return;}
			var bfcr = $.jgrid.isFunction( o.beforeCancelRow ) ?	o.beforeCancelRow.call($t, o, rowid) :  undefined;
			if( bfcr === undefined ) {
				bfcr = true;
			}
			if(!bfcr) { return; }
			for(k=0;k<$t.p.savedRow.length;k++) {
				if( String($t.p.savedRow[k].id) === String(rowid)) {fr = k; break;}
			}
			if(fr >= 0) {
				if($.jgrid.isFunction($.fn.datepicker)) {
					try {
						$("input.hasDatepicker","#"+$.jgrid.jqID(ind.id)).datepicker('hide');
					} catch (e) {}
				}
				$.each($t.p.colModel, function(){
					if( $t.p.savedRow[fr].hasOwnProperty(this.name)) {
						ares[this.name] = $t.p.savedRow[fr][this.name];
					}
				});
				$($t).jqGrid("setRowData",rowid,ares);
				$(ind).attr("editable","0").off("keydown");
				$t.p.savedRow.splice(fr,1);
				if($("#"+$.jgrid.jqID(rowid), "#"+$.jgrid.jqID($t.p.id)).hasClass("jqgrid-new-row")){
					setTimeout(function(){
						$($t).jqGrid("delRowData",rowid);
						$($t).jqGrid('showAddEditButtons');
					},0);
				}
			}
			$($t).triggerHandler("jqGridInlineAfterRestoreRow", [rowid]);
			if ($.jgrid.isFunction(o.afterrestorefunc))
			{
				o.afterrestorefunc.call($t, rowid);
			}
		});
	},
	addRow : function ( p ) {
		p = $.extend(true, {
			rowID : null,
			initdata : {},
			position :"first",
			useDefValues : true,
			useFormatter : false,
			addRowParams : {extraparam:{}}
		},p  || {});
		return this.each(function(){
			if (!this.grid ) { return; }
			var $t = this;
			$t.p.beforeAction = true;
			var bfar = $.jgrid.isFunction( p.beforeAddRow ) ?	p.beforeAddRow.call($t,p.addRowParams) :  undefined;
			if( bfar === undefined ) {
				bfar = true;
			}
			if(!bfar) {
				$t.p.beforeAction = false;
				return;
			}
			p.rowID = $.jgrid.isFunction(p.rowID) ? p.rowID.call($t, p) : ( (p.rowID != null) ? p.rowID : $.jgrid.randId());
			if(p.useDefValues === true) {
				$($t.p.colModel).each(function(){
					if( this.editoptions && this.editoptions.defaultValue ) {
						var opt = this.editoptions.defaultValue,
						tmp = $.jgrid.isFunction(opt) ? opt.call($t) : opt;
						p.initdata[this.name] = tmp;
					}
				});
			}
			$($t).jqGrid('addRowData', p.rowID, p.initdata, p.position);
			p.rowID = $t.p.idPrefix + p.rowID;
			$("#"+$.jgrid.jqID(p.rowID), "#"+$.jgrid.jqID($t.p.id)).addClass("jqgrid-new-row");
			if(p.useFormatter) {
				$("#"+$.jgrid.jqID(p.rowID)+" .ui-inline-edit", "#"+$.jgrid.jqID($t.p.id)).click();
			} else {
				var opers = $t.p.prmNames,
				oper = opers.oper;
				p.addRowParams.extraparam[oper] = opers.addoper;
				$($t).jqGrid('editRow', p.rowID, p.addRowParams);
				$($t).jqGrid('setSelection', p.rowID);
			}
		});
	},
	inlineNav : function (elem, o) {
		var $t = this[0],
		regional =  $.jgrid.getRegional($t, 'nav'),
		icons = $.jgrid.styleUI[$t.p.styleUI].inlinedit;
		o = $.extend(true,{
			edit: true,
			editicon: icons.icon_edit_nav,
			add: true,
			addicon:icons.icon_add_nav,
			save: true,
			saveicon: icons.icon_save_nav,
			cancel: true,
			cancelicon: icons.icon_cancel_nav,
			addParams : {addRowParams: {extraparam: {}}},
			editParams : {},
			restoreAfterSelect : true,
			saveAfterSelect : false
		}, regional, o ||{});
		return this.each(function(){
			if (!this.grid  || this.p.inlineNav) { return; }
			var gID = $.jgrid.jqID($t.p.id),
			disabled = $.jgrid.trim( $($t).jqGrid('getStyleUI', $t.p.styleUI+'.common', 'disabled', true) );
			// check to see if navgrid is started, if not call it with all false parameters.
			if(!$t.p.navGrid) {
				$($t).jqGrid('navGrid',elem, {refresh:false, edit: false, add: false, del: false, search: false, view: false});
			}
			if(!$($t).data('inlineNav')) {
				$($t).data('inlineNav',o);
			}
			if($t.p.force_regional) {
				o = $.extend(o, regional);
			}

			$t.p.inlineNav = true;
			// detect the formatactions column
			if(o.addParams.useFormatter === true) {
				var cm = $t.p.colModel,i;
				for (i = 0; i<cm.length; i++) {
					if(cm[i].formatter && cm[i].formatter === "actions" ) {
						if(cm[i].formatoptions) {
							var defaults =  {
								keys:false,
								onEdit : null,
								onSuccess: null,
								afterSave:null,
								onError: null,
								afterRestore: null,
								extraparam: {},
								url: null
							},
							ap = $.extend( defaults, cm[i].formatoptions );
							o.addParams.addRowParams = {
								"keys" : ap.keys,
								"oneditfunc" : ap.onEdit,
								"successfunc" : ap.onSuccess,
								"url" : ap.url,
								"extraparam" : ap.extraparam,
								"aftersavefunc" : ap.afterSave,
								"errorfunc": ap.onError,
								"afterrestorefunc" : ap.afterRestore
							};
						}
						break;
					}
				}
			}
			if(o.add) {
				$($t).jqGrid('navButtonAdd', elem,{
					caption : o.addtext,
					title : o.addtitle,
					buttonicon : o.addicon,
					id : $t.p.id+"_iladd",
					internal : true,
					onClickButton : function () {
						if($t.p.beforeAction === undefined) {
							$t.p.beforeAction = true;
						}
						$($t).jqGrid('addRow', o.addParams);
						if(!o.addParams.useFormatter && $t.p.beforeAction) {
							$("#"+gID+"_ilsave").removeClass( disabled );
							$("#"+gID+"_ilcancel").removeClass( disabled );
							$("#"+gID+"_iladd").addClass( disabled );
							$("#"+gID+"_iledit").addClass( disabled );
						}
					}
				});
			}
			if(o.edit) {
				$($t).jqGrid('navButtonAdd', elem,{
					caption : o.edittext,
					title : o.edittitle,
					buttonicon : o.editicon,
					id : $t.p.id+"_iledit",
					internal : true,
					onClickButton : function () {
						var sr = $($t).jqGrid('getGridParam','selrow');
						if(sr) {
							if($t.p.beforeAction === undefined) {
								$t.p.beforeAction = true;
							}
							$($t).jqGrid('editRow', sr, o.editParams);
							if($t.p.beforeAction) {
								$("#"+gID+"_ilsave").removeClass( disabled );
								$("#"+gID+"_ilcancel").removeClass( disabled );
								$("#"+gID+"_iladd").addClass( disabled );
								$("#"+gID+"_iledit").addClass( disabled );
							}
						} else {
							$.jgrid.viewModal("#alertmod_"+gID, {gbox:"#gbox_"+gID,jqm:true});$("#jqg_alrt").focus();
						}
					}
				});
			}
			if(o.save) {
				$($t).jqGrid('navButtonAdd', elem,{
					caption : o.savetext || '',
					title : o.savetitle || 'Save row',
					buttonicon : o.saveicon,
					id : $t.p.id+"_ilsave",
					internal : true,
					onClickButton : function () {
						var sr = $t.p.savedRow[0].id;
						if(sr) {
							var opers = $t.p.prmNames,
							oper = opers.oper, tmpParams = o.editParams;
							if($("#"+$.jgrid.jqID(sr), "#"+gID ).hasClass("jqgrid-new-row")) {
								o.addParams.addRowParams.extraparam[oper] = opers.addoper;
								tmpParams = o.addParams.addRowParams;
							} else {
								if(!o.editParams.extraparam) {
									o.editParams.extraparam = {};
								}
								o.editParams.extraparam[oper] = opers.editoper;
							}
							if( $($t).jqGrid('saveRow', sr, tmpParams) ) {
								$($t).jqGrid('showAddEditButtons');
							}
						} else {
							$.jgrid.viewModal("#alertmod_"+gID, {gbox:"#gbox_"+gID,jqm:true});$("#jqg_alrt").focus();
						}
					}
				});
				$("#"+gID+"_ilsave").addClass( disabled );
			}
			if(o.cancel) {
				$($t).jqGrid('navButtonAdd', elem,{
					caption : o.canceltext || '',
					title : o.canceltitle || 'Cancel row editing',
					buttonicon : o.cancelicon,
					id : $t.p.id+"_ilcancel",
					internal : true,
					onClickButton : function () {
						var sr = $t.p.savedRow[0].id, cancelPrm = o.editParams;
						if(sr) {
							if($("#"+$.jgrid.jqID(sr), "#"+gID ).hasClass("jqgrid-new-row")) {
								cancelPrm = o.addParams.addRowParams;
							}
							$($t).jqGrid('restoreRow', sr, cancelPrm);
							$($t).jqGrid('showAddEditButtons');
						} else {
							$.jgrid.viewModal("#alertmod",{gbox:"#gbox_"+gID,jqm:true});$("#jqg_alrt").focus();
						}
					}
				});
				$("#"+gID+"_ilcancel").addClass( disabled );
			}
			if(o.restoreAfterSelect === true || o.saveAfterSelect === true) {
				$($t).on("jqGridBeforeSelectRow.inlineNav", function( event, id ) {
					if($t.p.savedRow.length > 0 && $t.p.inlineNav===true && ( id !== $t.p.selrow && $t.p.selrow !==null) ) {
						var success = true;
						if($t.p.selrow === o.addParams.rowID ) {
							$($t).jqGrid('delRowData', $t.p.selrow);
						} else {
							if(o.restoreAfterSelect === true) {
								$($t).jqGrid('restoreRow', $t.p.selrow, o.editParams);
							} else {
								success = $($t).jqGrid('saveRow', $t.p.selrow, o.editParams);
							}
						}
						if(success) {
							$($t).jqGrid('showAddEditButtons');
						}
					}
				});
			}

		});
	},
	showAddEditButtons : function()  {
		return this.each(function(){
			if (!this.grid ) { return; }
			var gID = $.jgrid.jqID(this.p.id),
			disabled = $.jgrid.trim( $(this).jqGrid('getStyleUI', this.p.styleUI+'.common', 'disabled', true) );
			$("#"+gID+"_ilsave").addClass( disabled );
			$("#"+gID+"_ilcancel").addClass( disabled );
			$("#"+gID+"_iladd").removeClass( disabled );
			$("#"+gID+"_iledit").removeClass( disabled );
		});
	},
	showSaveCancelButtons : function()  {
		return this.each(function(){
			if (!this.grid ) { return; }
			var gID = $.jgrid.jqID(this.p.id),
			disabled = $.jgrid.trim( $(this).jqGrid('getStyleUI', this.p.styleUI+'.common', 'disabled', true) );
			$("#"+gID+"_ilsave").removeClass( disabled );
			$("#"+gID+"_ilcancel").removeClass( disabled );
			$("#"+gID+"_iladd").addClass( disabled );
			$("#"+gID+"_iledit").addClass( disabled );
		});
	}
//end inline edit
});

//module begin
if ($.jgrid.msie() && $.jgrid.msiever()===8) {
	$.expr[":"].hidden = function(elem) {
		return elem.offsetWidth === 0 || elem.offsetHeight === 0 ||
			elem.style.display === "none";
	};
}
// requiere load multiselect before grid
$.jgrid._multiselect = false;
if($.ui) {
	if ($.ui.multiselect ) {
		if($.ui.multiselect.prototype._setSelected) {
			var setSelected = $.ui.multiselect.prototype._setSelected;
			$.ui.multiselect.prototype._setSelected = function(item,selected) {
				var ret = setSelected.call(this,item,selected);
				if (selected && this.selectedList) {
					var elt = this.element;
					this.selectedList.find('li').each(function() {
						if ($(this).data('optionLink')) {
							$(this).data('optionLink').remove().appendTo(elt);
						}
					});
				}
				return ret;
			};
		}
		if($.ui.multiselect.prototype.destroy) {
			$.ui.multiselect.prototype.destroy = function() {
				this.element.show();
				this.container.remove();
				if ($.Widget === undefined) {
					$.widget.prototype.destroy.apply(this, arguments);
				} else {
					$.Widget.prototype.destroy.apply(this, arguments);
				}
			};
		}
		$.jgrid._multiselect = true;
	}
}
        
$.jgrid.extend({
	sortableColumns : function (tblrow)
	{
		return this.each(function (){
			var ts = this, tid= $.jgrid.jqID( ts.p.id ), frozen = false;
			function start() {
				ts.p.disableClick = true;
				if(ts.p.frozenColumns) {
					$(ts).jqGrid("destroyFrozenColumns");
					frozen = true;
				}
			}
			function stop() { 
				setTimeout(function () { 
					ts.p.disableClick = false; 
					if(frozen) {
						$(ts).jqGrid("setFrozenColumns");
						frozen = false;
					}
				}, 50); 
			}
			var sortable_opts = {
				"tolerance" : "pointer",
				"axis" : "x",
				"scrollSensitivity": "1",
				"items": '>th:not(:has(#jqgh_'+tid+'_cb'+',#jqgh_'+tid+'_rn'+',#jqgh_'+tid+'_subgrid),:hidden)',
				"cancel": ".sortable-disabled",
				"placeholder": {
					element: function(item) {
						var el = $(document.createElement(item[0].nodeName))
						.addClass(item[0].className+" ui-sortable-placeholder ui-state-highlight")
						.removeClass("ui-sortable-helper")[0];
						return el;
					},
					update: function(self, p) {
						p.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop')||0, 10) - parseInt(self.currentItem.css('paddingBottom')||0, 10));
						p.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft')||0, 10) - parseInt(self.currentItem.css('paddingRight')||0, 10));
					}
				},
				"update": function(event, ui) {
					var p = $(ui.item).parent(),
					th = $(">th", p),
					colModel = ts.p.colModel,
					cmMap = {}, tid= ts.p.id+"_";
					$.each(colModel, function(i) { cmMap[this.name]=i; });
					var permutation = [];
					th.each(function() {
						var id = $(">div", this).get(0).id.replace(/^jqgh_/, "").replace(tid,"");
							if (cmMap.hasOwnProperty(id)) {
								permutation.push(cmMap[id]);
							}
					});
	
					$(ts).jqGrid("remapColumns",permutation, true, true);
					if ($.jgrid.isFunction(ts.p.sortable.update)) {
						ts.p.sortable.update(permutation);
					}
				}
			};
			if (ts.p.sortable.options) {
				$.extend(sortable_opts, ts.p.sortable.options);
			} else if ($.jgrid.isFunction(ts.p.sortable)) {
				ts.p.sortable = { "update" : ts.p.sortable };
			}
			if (sortable_opts.start) {
				var s = sortable_opts.start;
				sortable_opts.start = function(e,ui) {
					start();
					s.call(this,e,ui);
				};
			} else {
				sortable_opts.start = start;
			}
			if (sortable_opts.stop) {
				var st = sortable_opts.stop;
				sortable_opts.stop = function(e,ui) {
					stop();
					st.call(this,e,ui);
				};
			} else {
				sortable_opts.stop = stop;
			}
			if (ts.p.sortable.exclude) {
				sortable_opts.items += ":not("+ts.p.sortable.exclude+")";
			}
			var $e = tblrow.sortable(sortable_opts), dataObj = $e.data("sortable") || $e.data("uiSortable");
			if (dataObj != null) {
				dataObj.data("sortable").floating = true;
			}
		});
	},
    columnChooser : function(opts) {
		var self = this, selector, select, colMap = {}, fixedCols = [], dopts, mopts, $dialogContent, multiselectData, listHeight,
			colModel = self.jqGrid("getGridParam", "colModel"),
			colNames = $.extend( [], self.jqGrid("getGridParam", "colNames")),
			getMultiselectWidgetData = function ($elem) {
				return ($.ui.multiselect.prototype && $elem.data($.ui.multiselect.prototype.widgetFullName || $.ui.multiselect.prototype.widgetName)) ||
					$elem.data("ui-multiselect") || $elem.data("multiselect");
			},
			regional =  $.jgrid.getRegional(this[0], 'col');

		if ($("#colchooser_" + $.jgrid.jqID(self[0].p.id)).length) { return; }
		selector = $('<div id="colchooser_'+self[0].p.id+'" style="position:relative;overflow:hidden"><div><select multiple="multiple"></select></div></div>');
		select = $('select', selector);
		function insert(perm,i,v) {
			var a, b;
			if(i>=0){
				a = perm.slice();
				b = a.splice(i,Math.max(perm.length-i,i));
				if(i>perm.length) { i = perm.length; }
				a[i] = v;
				return a.concat(b);
			}
			return perm;
		}
		function call(fn, obj) {
			if (!fn) { return; }
			if (typeof fn === 'string') {
				if ($.fn[fn]) {
					$.fn[fn].apply(obj, $.makeArray(arguments).slice(2));
				}
			} else if ($.jgrid.isFunction(fn)) {
				fn.apply(obj, $.makeArray(arguments).slice(2));
			}
		}
		function resize_select() {

			var widgetData = getMultiselectWidgetData(select),
			$thisDialogContent = widgetData.container.closest(".ui-dialog-content");
			if ($thisDialogContent.length > 0 && typeof $thisDialogContent[0].style === "object") {
				$thisDialogContent[0].style.width = "";
			} else {
				$thisDialogContent.css("width", ""); // or just remove width style
			}

			widgetData.selectedList.height(Math.max(widgetData.selectedContainer.height() - widgetData.selectedActions.outerHeight() -1, 1));
			widgetData.availableList.height(Math.max(widgetData.availableContainer.height() - widgetData.availableActions.outerHeight() -1, 1));
		}

		opts = $.extend({
			width : 400,
			height : 240,
			classname : null,
			groupHeaders : false,
			done : function(perm) { 
				if (perm) { 
					self.jqGrid("remapColumns", perm, true); 
				}
			},
			/* msel is either the name of a ui widget class that
			   extends a multiselect, or a function that supports
			   creating a multiselect object (with no argument,
			   or when passed an object), and destroying it (when
			   passed the string "destroy"). */
			msel : "multiselect",
			/* "msel_opts" : {}, */

			/* dlog is either the name of a ui widget class that 
			   behaves in a dialog-like way, or a function, that
			   supports creating a dialog (when passed dlog_opts)
			   or destroying a dialog (when passed the string
			   "destroy")
			   */
			dlog : "dialog",
			dialog_opts : {
				minWidth: 470,
				dialogClass: "ui-jqdialog"
			},
			/* dlog_opts is either an option object to be passed 
			   to "dlog", or (more likely) a function that creates
			   the options object.
			   The default produces a suitable options object for
			   ui.dialog */
			dlog_opts : function(options) {
				var buttons = {};
				buttons[options.bSubmit] = function() {
					options.apply_perm();
					options.cleanup(false);
				};
				buttons[options.bCancel] = function() {
					options.cleanup(true);
				};
				return $.extend(true, {
					buttons: buttons,
					close: function() {
						options.cleanup(true);
					},
					modal: options.modal || false,
					resizable: options.resizable || true,
					width: options.width + 70,
					resize: resize_select
				}, options.dialog_opts || {});
			},
			/* Function to get the permutation array, and pass it to the
			   "done" function */
			apply_perm : function() {
				var perm = [];
				$('option',select).each(function() {
					if ($(this).is(":selected")) {
						self.jqGrid("showCol", colModel[this.value].name);
					} else {
						self.jqGrid("hideCol", colModel[this.value].name);
					}
				});
				
				//fixedCols.slice(0);
				$('option[selected]',select).each(function() {
					if(this.selected) {
						perm.push(parseInt(this.value,10)); 
					}
				});
				$.each(perm, function() { 
					delete colMap[colModel[parseInt(this,10)].name]; 
				});
				$.each(colMap, function() {
					var ti = parseInt(this,10);
					perm = insert(perm,ti,ti);
				});
				if (opts.done) {
					opts.done.call(self, perm);
				}
				self.jqGrid("setGridWidth", self[0].p.width, self[0].p.shrinkToFit);
			},
			/* Function to cleanup the dialog, and select. Also calls the
			   done function with no permutation (to indicate that the
			   columnChooser was aborted */
			cleanup : function(calldone) {
				call(opts.dlog, selector, 'destroy');
				call(opts.msel, select, 'destroy');
				selector.remove();
				if (calldone && opts.done) {
					opts.done.call(self);
				}
			},
			msel_opts : {
				dividerLocation : 0.5
			}
		}, regional, opts || {} );
		if($.ui) {
			if ($.ui.multiselect && $.ui.multiselect.defaults) {
				if (!$.jgrid._multiselect) {
					// should be in language file
					alert("Multiselect plugin loaded after jqGrid. Please load the plugin before the jqGrid!");
					return;
				}
				// ??? the next line uses $.ui.multiselect.defaults which will be typically undefined
				opts.msel_opts = $.extend($.ui.multiselect.defaults, opts.msel_opts);
			}
		}
		if( self.jqGrid('isGroupHeaderOn') && opts.groupHeaders) {
			var gh_len = self[0].p.groupHeader.length,
			// use the last set one
			groupH = self[0].p.groupHeader[gh_len-1];
			
			for(var ij=0;ij<colNames.length; ij++){
				var iCol = $.jgrid.inColumnHeader( colModel[ij].name, groupH.groupHeaders);
				if(iCol>=0) {
					colNames[ij] = groupH.groupHeaders[iCol].titleText + "::" + colNames[ij];
					for(var jj= 1; jj<= groupH.groupHeaders[iCol].numberOfColumns-1; jj++) {
						colNames[ij+jj] = groupH.groupHeaders[iCol].titleText + "::" + colNames[ij+jj];
					}
					ij = ij+groupH.groupHeaders[iCol].numberOfColumns-1;
				}
			}
		}

		if (opts.caption) {
			selector.attr("title", opts.caption);
		}
		if (opts.classname) {
			selector.addClass(opts.classname);
			select.addClass(opts.classname);
		}
		if (opts.width) {
			$(">div",selector).css({width: opts.width,margin:"0 auto"});
			select.css("width", opts.width);
		}
		if (opts.height) {
			$(">div",selector).css("height", opts.height);
			select.css("height", opts.height - 10);
		}

		select.empty();
		$.each(colModel, function(i) {
			colMap[this.name] = i;
			if (this.hidedlg) {
				if (!this.hidden) {
					fixedCols.push(i);
				}
				return;
			}

			select.append("<option value='"+i+"' "+
						  (this.hidden?"":"selected='selected'")+">"+$.jgrid.stripHtml(colNames[i])+"</option>");
		});

		dopts = $.jgrid.isFunction(opts.dlog_opts) ? opts.dlog_opts.call(self, opts) : opts.dlog_opts;
		call(opts.dlog, selector, dopts);
		mopts = $.jgrid.isFunction(opts.msel_opts) ? opts.msel_opts.call(self, opts) : opts.msel_opts;
		call(opts.msel, select, mopts);

		// fix height of elements of the multiselect widget
		$dialogContent = $("#colchooser_" + $.jgrid.jqID(self[0].p.id));
		// fix fontsize
		var fs =  $('.ui-jqgrid').css('font-size') || '11px';
		$dialogContent.parent().css("font-size",fs);

		$dialogContent.css({ margin: "auto" });
		$dialogContent.find(">div").css({ width: "100%", height: "100%", margin: "auto" });

		multiselectData = getMultiselectWidgetData(select);
		multiselectData.container.css({ width: "100%", height: "100%", margin: "auto" });

		multiselectData.selectedContainer.css({ width: multiselectData.options.dividerLocation * 100 + "%", height: "100%", margin: "auto", boxSizing: "border-box" });
		multiselectData.availableContainer.css({ width: (100 - multiselectData.options.dividerLocation * 100) + "%", height: "100%", margin: "auto", boxSizing: "border-box" });

		// set height for both selectedList and availableList
		multiselectData.selectedList.css("height", "auto");
		multiselectData.availableList.css("height", "auto");
		listHeight = Math.max(multiselectData.selectedList.height(), multiselectData.availableList.height());
		listHeight = Math.min(listHeight, $(window).height());
		multiselectData.selectedList.css("height", listHeight);
		multiselectData.availableList.css("height", listHeight);
		
		resize_select();
	},
	sortableRows : function (opts) {
		// Can accept all sortable options and events
		return this.each(function(){
			var $t = this;
			if(!$t.grid) { return; }
			// Currently we disable a treeGrid sortable
			if($t.p.treeGrid) { return; }
			if($.fn.sortable) {
				opts = $.extend({
					"cursor":"move",
					"axis" : "y",
					"items": " > .jqgrow"
					},
				opts || {});
				if(opts.start && $.jgrid.isFunction(opts.start)) {
					opts._start_ = opts.start;
					delete opts.start;
				} else {opts._start_=false;}
				if(opts.update && $.jgrid.isFunction(opts.update)) {
					opts._update_ = opts.update;
					delete opts.update;
				} else {opts._update_ = false;}
				opts.start = function(ev,ui) {
					$(ui.item).css("border-width","0");
					$("td",ui.item).each(function(i){
						this.style.width = $t.grid.cols[i].style.width;
					});
					if($t.p.subGrid) {
						var subgid = $(ui.item).attr("id");
						try {
							$($t).jqGrid('collapseSubGridRow',subgid);
						} catch (e) {}
					}
					if(opts._start_) {
						opts._start_.apply(this,[ev,ui]);
					}
				};
				opts.update = function (ev,ui) {
					$(ui.item).css("border-width","");
					if($t.p.rownumbers === true) {
						$("td.jqgrid-rownum",$t.rows).each(function( i ){
							$(this).html( i+1+(parseInt($t.p.page,10)-1)*parseInt($t.p.rowNum,10) );
						});
					}
					if(opts._update_) {
						opts._update_.apply(this,[ev,ui]);
					}
				};
				$($t).find("tbody").first().sortable(opts);
				$("tbody",$t).first().find(" > .jqgrow").disableSelection();
			}
		});
	},
	gridDnD : function(opts) {
		return this.each(function(){
		var $t = this, i, cn;
		if(!$t.grid) { return; }
		// Currently we disable a treeGrid drag and drop
		if($t.p.treeGrid) { return; }
		if(!$.fn.draggable || !$.fn.droppable) { return; }
		function updateDnD ()
		{
			var datadnd = $.data($t,"dnd");
			$("tr.jqgrow:not(.ui-draggable)",$t).draggable($.jgrid.isFunction(datadnd.drag) ? datadnd.drag.call($($t),datadnd) : datadnd.drag);
		}
		var appender = "<table id='jqgrid_dnd' class='ui-jqgrid-dnd'></table>";
		if($("#jqgrid_dnd")[0] === undefined) {
			$('body').append(appender);
		}

		if(typeof opts === 'string' && opts === 'updateDnD' && $t.p.jqgdnd===true) {
			updateDnD();
			return;
		}
		var tid;
		opts = $.extend({
			"drag" : function (opts) {
				return $.extend({
					start : function (ev, ui) {
						var i, subgid;
						// if we are in subgrid mode try to collapse the node
						if($t.p.subGrid) {
							subgid = $(ui.helper).attr("id");
							try {
								$($t).jqGrid('collapseSubGridRow',subgid);
							} catch (e) {}
						}
						// hack
						// drag and drop does not insert tr in table, when the table has no rows
						// we try to insert new empty row on the target(s)
						for (i=0;i<$.data($t,"dnd").connectWith.length;i++){
							if($($.data($t,"dnd").connectWith[i]).jqGrid('getGridParam','reccount') === 0 ){
								$($.data($t,"dnd").connectWith[i]).jqGrid('addRowData','jqg_empty_row',{});
							}
						}
						ui.helper.addClass("ui-state-highlight");
						$("td",ui.helper).each(function(i) {
							this.style.width = $t.grid.headers[i].width+"px";
						});
						if(opts.onstart && $.jgrid.isFunction(opts.onstart) ) { opts.onstart.call($($t),ev,ui); }
					},
					stop :function(ev,ui) {
						var i, ids;
						if(ui.helper.dropped && !opts.dragcopy) {
							ids = $(ui.helper).attr("id");
							if(ids === undefined) { ids = $(this).attr("id"); }
							$($t).jqGrid('delRowData',ids );
						}
						// if we have a empty row inserted from start event try to delete it
						for (i=0;i<$.data($t,"dnd").connectWith.length;i++){
							$($.data($t,"dnd").connectWith[i]).jqGrid('delRowData','jqg_empty_row');
						}
						if(opts.onstop && $.jgrid.isFunction(opts.onstop) ) { opts.onstop.call($($t),ev,ui); }
					}
				},opts.drag_opts || {});
			},
			"drop" : function (opts) {
				return $.extend({
					accept: function(d) {
						if (!$(d).hasClass('jqgrow')) { return d;}
						tid = $(d).closest("table.ui-jqgrid-btable");
						var target = $(this).find('table.ui-jqgrid-btable').first()[0];
						if(tid.length > 0 && $.data(tid[0],"dnd") !== undefined) {
							var cn = $.data(tid[0],"dnd").connectWith;
							return $.inArray('#'+$.jgrid.jqID(target.id),cn) !== -1 ? true : false;
						}
						return false;
					},
					drop: function(ev, ui) {
						if (!$(ui.draggable).hasClass('jqgrow')) { 
							return; 
						}
						var accept = $(ui.draggable).attr("id"),
							getdata = ui.draggable.parent().parent().jqGrid('getRowData',accept),
							keysd = [],
							target = $(this).find('table.ui-jqgrid-btable').first()[0];					
							if($.isPlainObject( getdata)) {
								keysd = Object.keys(getdata);
							}
						if(!opts.dropbyname) {
							var j, tmpdata = {}, nm, ki=0;
							var dropmodel = $("#"+$.jgrid.jqID(target.id)).jqGrid('getGridParam','colModel');
							try {
								for(j=0;j<dropmodel.length;j++) {
									nm = dropmodel[j].name;
									if( !(nm === 'cb' || nm === 'rn' || nm === 'subgrid' || nm === 'sc' )) {
										if (keysd[ki] !== undefined) {
											tmpdata[nm] = getdata[keysd[ki]];
										}
										ki++;
									}
								}
								getdata = tmpdata;
							} catch (e) {}
						}
						ui.helper.dropped = true;
						if($.data(tid[0],"dnd").beforedrop && $.jgrid.isFunction($.data(tid[0],"dnd").beforedrop) ) {
							//parameters to this callback - event, element, data to be inserted, sender, reciever
							// should return object which will be inserted into the reciever
							var datatoinsert = $.data(tid[0],"dnd").beforedrop.call(target,ev,ui,getdata,$(tid[0]),$(target));
							if (datatoinsert !== undefined && datatoinsert !== null && typeof datatoinsert === "object") { getdata = datatoinsert; }
						}
						if(ui.helper.dropped) {
							var grid;
							if(opts.autoid) {
								if($.jgrid.isFunction(opts.autoid)) {
									grid = opts.autoid.call(target,getdata);
								} else {
									grid = Math.ceil(Math.random()*1000);
									grid = opts.autoidprefix+grid;
								}
							}
							// NULL is interpreted as undefined while null as object
							$("#"+$.jgrid.jqID(target.id)).jqGrid('addRowData',grid,getdata,opts.droppos);
						}
						if(opts.ondrop && $.jgrid.isFunction(opts.ondrop) ) { opts.ondrop.call(target,ev,ui, getdata); }
					}}, opts.drop_opts || {});
			},
			"onstart" : null,
			"onstop" : null,
			"beforedrop": null,
			"ondrop" : null,
			"drop_opts" : {
				"activeClass": "ui-state-active",
				"hoverClass": "ui-state-hover",
				"tolerance": "intersect"
			},
			"drag_opts" : {
				"revert": "invalid",
				"helper": "clone",
				"cursor": "move",
				"appendTo" : "#jqgrid_dnd",
				"zIndex": 5000
			},
			"dragcopy": false,
			"dropbyname" : false,
			"droppos" : "first",
			"autoid" : true,
			"autoidprefix" : "dnd_"
		}, opts || {});
		
		if(!opts.connectWith) { return; }
		opts.connectWith = opts.connectWith.split(",");
		opts.connectWith = $.map(opts.connectWith,function(n){return $.jgrid.trim(n);});
		$.data($t,"dnd",opts);
		
		if($t.p.reccount !== 0 && !$t.p.jqgdnd) {
			updateDnD();
		}
		$t.p.jqgdnd = true;
		for (i=0;i<opts.connectWith.length;i++){
			cn =opts.connectWith[i];
			$(cn).closest('.ui-jqgrid-bdiv').droppable($.jgrid.isFunction(opts.drop) ? opts.drop.call($($t),opts) : opts.drop);
		}
		});
	},
	gridResize : function(opts) {
		return this.each(function(){
			var $t = this, gID = $.jgrid.jqID($t.p.id), req;
			if(!$t.grid || !$.fn.resizable) { return; }
			opts = $.extend(
				{}, 
				{ resizeclass : "ui-resizable-icon" },
				opts || {}
			);
			if(opts.alsoResize ) {
				opts._alsoResize_ = opts.alsoResize;
				delete opts.alsoResize;
			} else {
				opts._alsoResize_ = false;
			}
			if(opts.stop && $.jgrid.isFunction(opts.stop)) {
				opts._stop_ = opts.stop;
				delete opts.stop;
			} else {
				opts._stop_ = false;
			}
			var class_to_add = opts.resizeclass;
			if($t.p.styleUI !== "jQueryUI") {
				if(opts.handles) {
					if(opts.handles.se) {
						class_to_add += " " +opts.handles.se.replace(".","");
					} else {
						opts.handles.se = "."+class_to_add;
					}
				} else {
					opts.handles = {};
					var test = class_to_add.split(' ');
					opts.handles.se = "."+test[0];
				}
				class_to_add += " ui-resizable-se ui-resizable-handle";
			
				$("#gbox_"+gID).append('<span class="'+class_to_add+'"></span>');
			}
			opts.stop = function (ev, ui) {
				$($t).jqGrid('setGridParam',{height:$("#gview_"+gID+" .ui-jqgrid-bdiv").height()});
				$($t).jqGrid('setGridWidth',ui.size.width,opts.shrinkToFit);
				if(opts._stop_) { opts._stop_.call($t,ev,ui); }
				if($t.p.caption) {
					$("#gbox_"+ gID).css({ 'height': 'auto' });
				}
				if($t.p.frozenColumns) {
					if (req ) clearTimeout(req);
					req = setTimeout(function(){
						if (req ) clearTimeout(req);
						$("#" + gID).jqGrid("destroyFrozenColumns");
						$("#" + gID).jqGrid("setFrozenColumns");
					});
				}
			};
			if(opts._alsoResize_) {
				opts.alsoResize = "#gview_"+gID+" .ui-jqgrid-bdiv,"+opts._alsoResize_ ;
			} else {
				opts.alsoResize = $(".ui-jqgrid-bdiv","#gview_"+gID);
			}
			delete opts._alsoResize_;
			$("#gbox_"+gID).resizable(opts);
		});
	}
});

//module begin
function _pivotfilter (fn, context) {
	/*jshint validthis: true */
	var i,
		value,
		result = [],
		length;
		
	if (!this || typeof fn !== 'function' || (fn instanceof RegExp)) {
		throw new TypeError();
	}

	length = this.length;

	for (i = 0; i < length; i++) {
		if (this.hasOwnProperty(i)) {
			value = this[i];
			if (fn.call(context, value, i, this)) {
				result.push(value);
				// We need break in order to cancel loop 
				// in case the row is found
				break;
			}
		}
	}
	return result;
}
$.assocArraySize = function(obj) {
    // http://stackoverflow.com/a/6700/11236
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
        	size++;
        }
    }
    return size;
};

$.jgrid.extend({
	pivotSetup : function( data, options ){
		// data should come in json format
		// The function return the new colModel and the transformed data
		// again with group setup options which then will be passed to the grid
		var columns =[],
		pivotrows =[],
		summaries = [],
		member=[],
		labels=[],
		groupOptions = {
			grouping : true,
			groupingView :  {
				groupField : [],
				groupSummary: [],
				groupSummaryPos:[]
			}
		},
		headers = [],
		o = $.extend ( {
			rowTotals : false,
			rowTotalsText : 'Total',
			// summary columns
			colTotals : false,
			groupSummary : true,
			groupSummaryPos :  'header',
			frozenStaticCols : false,
			xMeta : []
		}, options || {});
		this.each(function(){

			var 
				$t = this,
				row,
				rowindex,
				i,
				
				rowlen = data.length,
				xlen, ylen, aggrlen,
				tmp,
				newObj,
				r=0;
			// utility funcs
			/* 
			 * Filter the data to a given criteria. Return the firt occurance
			 */
			function find(ar, fun, extra) {
				var res;
				res = _pivotfilter.call(ar, fun, extra);
				return res.length > 0 ? res[0] : null;
			}
			/*
			 * Check if the grouped row column exist (See find)
			 * If the row is not find in pivot rows retun null,
			 * otherviese the column
			 */
			function findGroup(item, index) {
				/*jshint validthis: true */
				var j = 0, ret = true, i;
				for(i in item) {
					if( item.hasOwnProperty(i) ) {
						if(item[i] != this[j]) {
							ret =  false;
							break;
						}
						j++;
						if(j>=this.length) {
							break;
						}
					}
				}
				if(ret) {
					rowindex =  index;
				}
				return ret;
			}
			/*
			 * Perform calculations of the pivot values.
			 */
			function calculation(oper, v, field, rc, _cnt)  {
				var ret;
				if( $.jgrid.isFunction(oper)) {
					ret = oper.call($t, v, field, rc);
				} else {
					switch (oper) {
						case  "sum" : 
							ret = $.jgrid.floatNum(v) + $.jgrid.floatNum(rc[field]);
							break;
						case "count" :
							if(v==="" || v == null) {
								v=0;
							}
							if(rc.hasOwnProperty(field)) {
								ret = v+1;
							} else {
								ret = 0;
							}
							break;
						case "min" : 
							if(v==="" || v == null) {
								ret = $.jgrid.floatNum(rc[field]);
							} else {
								ret =Math.min($.jgrid.floatNum(v),$.jgrid.floatNum(rc[field]));
							}
							break;
						case "max" : 
							if(v==="" || v == null) {
								ret = $.jgrid.floatNum(rc[field]);
							} else {
								ret = Math.max($.jgrid.floatNum(v),$.jgrid.floatNum(rc[field]));
							}
							break;
						case "avg" : //avg grouping
							ret = ($.jgrid.floatNum(v) * (_cnt -1) + $.jgrid.floatNum(rc[field]) ) /_cnt;
							break;	
					}
				}
				return ret;
			}
			/*
			 * The function agragates the values of the pivot grid.
			 * Return the current row with pivot summary values
			 */
			function agregateFunc ( row, aggr, value, curr) {
				// default is sum
				var arrln = aggr.length, i, label, j, jv, mainval="",swapvals=[], swapstr, _cntavg = 1, lbl;
				if( Array.isArray(value) ) {
					jv = value.length;
					swapvals = value;
				} else {
					jv = 1;
					swapvals[0]=value;
				}
				member = [];
				labels = [];
				member.root = 0;
				for(j=0;j<jv;j++) {
					var  tmpmember = [], vl;
					for(i=0; i < arrln; i++) {
						swapstr = typeof aggr[i].aggregator === 'string' ? aggr[i].aggregator : 'cust';
							
						if(value == null) {
							label = $.jgrid.trim(aggr[i].member)+"_" + swapstr;
							vl = label;
							swapvals[0]= aggr[i].label || (swapstr + " " +$.jgrid.trim(aggr[i].member));
						} else {
							vl = value[j].replace(/\s+/g, '');
							try {
								label = (arrln === 1 ? mainval + vl : mainval + vl + "_" + swapstr + "_" + String(i));
							} catch(e) {}
							swapvals[j] = value[j];
						}
						//if(j<=1 && vl !==  '_r_Totals' && mainval === "") { // this does not fix full the problem
							//mainval = vl;
						//}
						label = !isNaN(parseInt(label,10)) ? label + " " : label;
						if(aggr[i].aggregator === 'avg') {
							lbl = rowindex === -1 ? pivotrows.length+"_"+label : rowindex+"_"+label;
							if(!_avg[lbl]) {
								_avg[lbl] = 1;
							} else {
								_avg[lbl]++;
							}
							_cntavg = _avg[lbl];
						}						
						curr[label] =  tmpmember[label] = calculation( aggr[i].aggregator, curr[label], aggr[i].member, row, _cntavg);
					}
					mainval += (value && value[j] != null) ? value[j].replace(/\s+/g, '') : '';
					//vl = !isNaN(parseInt(vl,10)) ? vl + " " : vl;
					member[label] = tmpmember;
					labels[label] = swapvals[j];
				}
				return curr;
			}
			// Making the row totals without to add in yDimension
			if(o.rowTotals && o.yDimension.length > 0) {
				var dn = o.yDimension[0].dataName;
				o.yDimension.splice(0,0,{dataName:dn});
				o.yDimension[0].converter =  function(){ return '_r_Totals'; };
			}
			// build initial columns (colModel) from xDimension
			xlen = Array.isArray(o.xDimension) ? o.xDimension.length : 0;
			ylen = o.yDimension.length;
			aggrlen  = Array.isArray(o.aggregates) ? o.aggregates.length : 0;
			if(xlen === 0 || aggrlen === 0) {
				throw("xDimension or aggregates optiona are not set!");
			}
			var colc, groupfields=[], j=0;
			for(i = 0; i< xlen; i++) {
				if(!o.xDimension[i].hasOwnProperty('dataName')) {
					j++;
					continue;
				}
				colc = {name:o.xDimension[i].dataName, frozen: o.frozenStaticCols};
				if(o.xDimension[i].isGroupField == null) {
					o.xDimension[i].isGroupField =  true;
				}
				if(o.xDimension[i].isGroupField) {
					groupfields.push(o.xDimension[i].dataName);
				}
				colc = $.extend(true, colc, o.xDimension[i]);
				columns.push( colc );
			}
			xlen -= j;
			var tree={}, _avg=[], grouplen = groupfields.length, xname;
			//tree = { text: 'root', leaf: false, children: [] };
			//loop over alll the source data
			while( r < rowlen ) {
				row = data[r];
				var xValue = [];
				var yValue = []; 
				tmp = {};
				i = 0;
				// build the data from xDimension
				for(i = 0; i< columns.length; i++) {
					xname = columns[i].name;
					if(row.hasOwnProperty(xname)) {
						xValue.push( $.jgrid.trim(row[xname]) );
						tmp[xname] = $.jgrid.trim(row[xname]);
					}
				}
				
				var k = 0;
				rowindex = -1;
				// check to see if the row is in our new pivotrow set
				newObj = find(pivotrows, findGroup, xValue);
				if(!newObj) {
					// if the row is not in our set
					k = 0;
					// if yDimension is set
					if(ylen>=1) {
						// build the cols set in yDimension
						for(k=0;k<ylen;k++) {
							yValue[k] = $.jgrid.trim(row[o.yDimension[k].dataName]);
							if(yValue[k] === undefined) {
								yValue[k] = null;
								continue;
							}
							// Check to see if we have user defined conditions
							if(o.yDimension[k].converter && $.jgrid.isFunction(o.yDimension[k].converter)) {
								yValue[k] = o.yDimension[k].converter.call(this, yValue[k], xValue, yValue);
							}
						}
						// make the colums based on aggregates definition 
						// and return the members for late calculation
						tmp = agregateFunc( row, o.aggregates, yValue, tmp );
					} else  if( ylen === 0 ) {
						// if not set use direct the aggregates 
						tmp = agregateFunc( row, o.aggregates, null, tmp );
					}
					// add the result in pivot rows
					for(i=0; i < o.xMeta.length; i++) {
						var meta = o.xMeta[i];
						if( Object.hasOwn(meta, "dataName") && Object.hasOwn(row, meta.dataName) ) {
							tmp[meta.dataName] = row[meta.dataName] + "";
						}
					}
					pivotrows.push( tmp );
				} else {
					// the pivot exists
					if( rowindex >= 0) {
						k = 0;
						// make the recalculations 
						if(ylen>=1) {
							for(k=0;k<ylen;k++) {
								yValue[k] = $.jgrid.trim(row[o.yDimension[k].dataName]);
								if(yValue[k] === undefined) {
									yValue[k] = null;
									continue;
								}				
								if(o.yDimension[k].converter && $.jgrid.isFunction(o.yDimension[k].converter)) {
									yValue[k] = o.yDimension[k].converter.call(this, yValue[k], xValue, yValue);
								}
							}
							newObj = agregateFunc( row, o.aggregates, yValue, newObj );
						} else  if( ylen === 0 ) {
							newObj = agregateFunc( row, o.aggregates, null, newObj );
						}
						// update the row
						for(i=0; i < o.xMeta.length; i++) {
							var meta = o.xMeta[i];
							if( Object.hasOwn(meta, "dataName") && Object.hasOwn(row, meta.dataName) ) {
								var sep = Object.hasOwn(meta, "separator") ? meta.separator : ", "; 
								newObj[meta.dataName] += sep + row[meta.dataName];
							}
						}
						pivotrows[rowindex] = newObj;
					}
				}
				var kj=0, current = null,existing = null, kk;
				// Build a JSON tree from the member (see aggregateFunc) 
				// to make later the columns 
				// 
				for (kk in member) {
					if(member.hasOwnProperty( kk )) {
						if(kj === 0) {
							if (!tree.children||tree.children === undefined){
								tree = { text: kk, level : 0, children: [], label: kk  };
							}
							current = tree.children;
						} else {
							existing = null;
							for (i=0; i < current.length; i++) {
								if (current[i].text === kk) {
								//current[i].fields=member[kk];
									existing = current[i];
									break;
								}
							}
							if (existing) {
								current = existing.children;
							} else {
								current.push({ children: [], text: kk, level: kj,  fields: member[kk], label: labels[kk] });
								current = current[current.length - 1].children;
							}
						}
						kj++;
					}
				}
				r++;
			}
			_avg = null; // free mem
			var  lastval=[], initColLen = columns.length, swaplen = initColLen;
			if(ylen>0) {
				headers[ylen-1] = {	useColSpanStyle: false,	groupHeaders: []};
			}
			/*
			 * Recursive function which uses the tree to build the 
			 * columns from the pivot values and set the group Headers
			 */
			function list(items) {
				var l, j, key, k, col;
				for (key in items) {	 // iterate
					if (items.hasOwnProperty(key)) {
					// write amount of spaces according to level
					// and write name and newline
						if(typeof items[key] !== "object") {
							// If not a object build the header of the appropriate level
							if( key === 'level') {
								if(lastval[items.level] === undefined) {
									lastval[items.level] ='';
									if(items.level>0 && items.text.indexOf('_r_Totals') === -1) {
										headers[items.level-1] = {
											useColSpanStyle: false,
											groupHeaders: []
										};
									}
								}
								if(lastval[items.level] !== items.text && items.children.length && items.text.indexOf('_r_Totals') === -1 ) {
									if(items.level>0) {
										headers[items.level-1].groupHeaders.push({
											titleText: items.label,
											numberOfColumns : 0
										});
										var collen = headers[items.level-1].groupHeaders.length-1,
										colpos = collen === 0 ? swaplen : initColLen;//+aggrlen;
										if(items.level-1=== (o.rowTotals ? 1 : 0)) {
											if(collen>0) {
												var l1=0;
												for(var kk=0; kk<collen; kk++) { 
													l1 += headers[items.level-1].groupHeaders[kk].numberOfColumns;
												}
												if(l1) {
													colpos = l1  + xlen;
												}
											}
										}
										if(columns[colpos]) {
											headers[items.level-1].groupHeaders[collen].startColumnName = columns[colpos].name;
											headers[items.level-1].groupHeaders[collen].numberOfColumns = columns.length - colpos;
										}
										initColLen = columns.length;
									}
								}
								lastval[items.level] = items.text;
							}
							// This is in case when the member contain more than one summary item
							if(items.level === ylen  && key==='level' && ylen >0) {
								if( aggrlen > 1){
									var ll=1;
									for( l in items.fields) {
										if(items.fields.hasOwnProperty(l)) {
											if(ll===1) {
												headers[ylen-1].groupHeaders.push({startColumnName: l, numberOfColumns: 1, titleText: items.label || items.text});
											}
											ll++;
										}
									}
									headers[ylen-1].groupHeaders[headers[ylen-1].groupHeaders.length-1].numberOfColumns = ll-1;
								} else {
									headers.splice(ylen-1,1);
								}
							}
						}
						// if object, call recursively
						if (items[key] != null && typeof items[key] === "object") {
							list(items[key]);
						}
						// Finally build the columns
						if( key === 'level') {
							if( items.level > 0 &&  (items.level === (ylen===0?items.level:ylen) || lastval[items.level].indexOf('_r_Totals') !== -1 ) ){
								j=0;
								for(l in items.fields) {
									if(items.fields.hasOwnProperty( l ) ) {
										col = {};
										for(k in o.aggregates[j]) {
											if(o.aggregates[j].hasOwnProperty(k)) {
												switch( k ) {
													case 'member':
													case 'label':
													case 'aggregator':
														break;
													default:
														col[k] = o.aggregates[j][k];
												}
											}
										}	
										if(aggrlen > 1) {
											col.name = l;
											col.label = o.aggregates[j].label || items.label;
										} else {
											col.name = items.text;
											col.label = items.text==='_r_Totals' ? o.rowTotalsText : items.label;
										}
										columns.push (col);
										j++;
									}
								}
							}
						}
					}
				}
			}

			list( tree );
			var nm;
			// loop again trougth the pivot rows in order to build grand total 
			if(o.colTotals) {
				var plen = pivotrows.length;
				while(plen--) {
					for(i=xlen;i<columns.length;i++) {
						nm = columns[i].name;
						if(!summaries[nm]) {
							summaries[nm] = $.jgrid.floatNum(pivotrows[plen][nm]);
						} else {
							summaries[nm] += $.jgrid.floatNum(pivotrows[plen][nm]);
						}
					}
				}
			}
			// based on xDimension  levels build grouping 
			if( grouplen > 0) {
				for(i=0;i < grouplen; i++) {
					groupOptions.groupingView.groupField.push(groupfields[i]);
						groupOptions.groupingView.groupSummary.push(o.groupSummary);
						groupOptions.groupingView.groupSummaryPos.push(o.groupSummaryPos);
				}
				groupOptions.sortname = groupfields[i]; //columns[groupfields].name;
			} else {
				// no grouping is needed
				groupOptions.grouping = false;
			}
			groupOptions.groupingView.hideFirstGroupCol = true;
		});
		// return the final result.
		return { "colModel" : columns, "rows": pivotrows, "groupOptions" : groupOptions, "groupHeaders" :  headers, summary : summaries };
	},
	jqPivot : function( data, pivotOpt, gridOpt, ajaxOpt) {
		return this.each(function(){
			var $t = this,
				regional = gridOpt.regional ? gridOpt.regional : "en";
			if(pivotOpt.loadMsg === undefined) {
				pivotOpt.loadMsg = true;
			}
			if(pivotOpt.loadMsg) {
				$("<div class='loading_pivot ui-state-default ui-state-active row'>"+$.jgrid.getRegional($t, "regional."+regional+".defaults.loadtext")+"</div>").insertBefore($t).show();
			}

			function pivot( data) {
				if( $.jgrid.isFunction( pivotOpt.onInitPivot ) ) {
					pivotOpt.onInitPivot.call( $t );
				}
				if( !Array.isArray(data) ) {
					//throw "data provides is not an array";
					data = [];
				}
				var pivotGrid = jQuery($t).jqGrid('pivotSetup',data, pivotOpt),
				footerrow = $.assocArraySize(pivotGrid.summary) > 0 ? true : false,
				query= $.jgrid.from.call($t, pivotGrid.rows), i, so, st, len;
				if(pivotOpt.ignoreCase) {
					query = query.ignoreCase();
				}
				for(i=0; i< pivotGrid.groupOptions.groupingView.groupField.length; i++) {
					so = pivotOpt.xDimension[i].sortorder ? pivotOpt.xDimension[i].sortorder : 'asc';
					st = pivotOpt.xDimension[i].sorttype ? pivotOpt.xDimension[i].sorttype : 'text';
					query.orderBy(pivotGrid.groupOptions.groupingView.groupField[i], so, st, '', st);
				}
				len = pivotOpt.xDimension.length;
				if(gridOpt.sortname) { // should be a part of xDimension
					so = gridOpt.sortorder ? gridOpt.sortorder : 'asc';
					st = 'text';
					for( i=0; i< len; i++) {
						if(pivotOpt.xDimension[i].dataName === gridOpt.sortname) {
							st = pivotOpt.xDimension[i].sorttype ? pivotOpt.xDimension[i].sorttype : 'text';
							break;
						}
					}
					query.orderBy(gridOpt.sortname, so, st, '', st);
				} else {
					if(pivotGrid.groupOptions.sortname && len) {
						so = pivotOpt.xDimension[len-1].sortorder ? pivotOpt.xDimension[len-1].sortorder : 'asc';
						st = pivotOpt.xDimension[len-1].sorttype ? pivotOpt.xDimension[len-1].sorttype : 'text';
						query.orderBy(pivotGrid.groupOptions.sortname, so, st, '', st);					
					}
				}
				jQuery($t).jqGrid($.extend(true, {
					data: $.extend(query.select(),footerrow ? {userdata:pivotGrid.summary} : {}),
					datatype: 'local',
					footerrow : footerrow,
					userDataOnFooter: footerrow,
					colModel: pivotGrid.colModel,
					viewrecords: true,
					formatFooterData : pivotOpt.colTotals === true ? true : false,
					sortname: pivotOpt.xDimension[0].dataName // ?????
				}, pivotGrid.groupOptions, gridOpt || {}));
				var gHead = pivotGrid.groupHeaders;
				if(gHead.length) {
					for( i = 0;i < gHead.length ; i++) {
						if(gHead[i] && gHead[i].groupHeaders.length) {
							jQuery($t).jqGrid('setGroupHeaders',gHead[i]);
						}
					}
				}
				if(pivotOpt.frozenStaticCols) {
					jQuery($t).jqGrid("setFrozenColumns");
				}
				if( $.jgrid.isFunction( pivotOpt.onCompletePivot ) ) {
					pivotOpt.onCompletePivot.call( $t );
				}
				if(pivotOpt.loadMsg) {
					$(".loading_pivot").remove();
				}
			}
						
			if(typeof data === "string") {
				$.ajax($.extend({
					url : data,
					dataType: 'json',
					success : function(response) {
						pivot($.jgrid.getAccessor(response, ajaxOpt && ajaxOpt.reader ? ajaxOpt.reader: 'rows') );
					}
				}, ajaxOpt || {}) );
			} else {
				pivot( data );
			}
		});
	}
});

//module begin
$.jgrid.extend({
setSubGrid : function () {
	return this.each(function (){
		var $t = this, cm, i,
		classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].subgrid,
		suboptions = {
			plusicon : classes.icon_plus,
			minusicon : classes.icon_minus,
			openicon:  classes.icon_open,
			expandOnLoad:  false,
			selectOnExpand : false,
			selectOnCollapse : false,
			reloadOnExpand : true,
			onErrorLoadData : null
		};
		$t.p.subGridOptions = $.extend(suboptions, $t.p.subGridOptions || {});
		$t.p.colNames.unshift("");
		$t.p.colModel.unshift({name:'subgrid',width: $.jgrid.cell_width ?  $t.p.subGridWidth+$t.p.cellLayout : $t.p.subGridWidth,sortable: false,resizable:false,hidedlg:true,search:false,fixed:true});
		cm = $t.p.subGridModel;
		if(cm[0]) {
			cm[0].align = $.extend([],cm[0].align || []);
			for(i=0;i<cm[0].name.length;i++) { cm[0].align[i] = cm[0].align[i] || 'left';}
		}
	});
},
addSubGridCell :function (pos,iRow) {
	var prp='', ic, sid, icb ;
	this.each(function(){
		prp = this.formatCol(pos,iRow);
		sid= this.p.id;
		ic = this.p.subGridOptions.plusicon;
		icb = $.jgrid.styleUI[(this.p.styleUI || 'jQueryUI')].common;
	});
	return "<td role=\"gridcell\" aria-describedby=\""+sid+"_subgrid\" class=\"ui-sgcollapsed sgcollapsed\" "+prp+"><a style='cursor:pointer;' class='ui-sghref'><span class='" + icb.icon_base +" "+ic+"'></span></a></td>";
},
addSubGrid : function( pos, sind ) {
	return this.each(function(){
		var ts = this;
		if (!ts.grid ) { return; }
		var base = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].base,
			common = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].common,
			errors = $.jgrid.getRegional(this, 'errors');
		//-------------------------
		var subGridCell = function(trdiv,cell,pos)
		{
			var tddiv = $("<td align='"+ts.p.subGridModel[0].align[pos]+"'></td>").html(cell);
			$(trdiv).append(tddiv);
		};
		var subGridXml = function(sjxml, sbid){
			var tddiv, i,  sgmap,
			dummy = $("<table class='" + base.rowTable + " ui-common-table'><tbody></tbody></table>"),
			trdiv = $("<tr></tr>");
			for (i = 0; i<ts.p.subGridModel[0].name.length; i++) {
				tddiv = $("<th class='" + base.headerBox+" ui-th-subgrid ui-th-column ui-th-"+ts.p.direction+"'></th>");
				$(tddiv).html(ts.p.subGridModel[0].name[i]);
				$(tddiv).width( ts.p.subGridModel[0].width[i]);
				$(trdiv).append(tddiv);
			}
			$(dummy).append(trdiv);
			if (sjxml){
				sgmap = ts.p.xmlReader.subgrid;
				$(sgmap.root+" "+sgmap.row, sjxml).each( function(){
					trdiv = $("<tr class='" + common.content+" ui-subtblcell'></tr>");
					if(sgmap.repeatitems === true) {
						$(sgmap.cell,this).each( function(i) {
							subGridCell(trdiv, $(this).text() || '&#160;',i);
						});
					} else {
						var f = ts.p.subGridModel[0].mapping || ts.p.subGridModel[0].name;
						if (f) {
							for (i=0;i<f.length;i++) {
								subGridCell(trdiv, $.jgrid.getXmlData(this, f[i]) || '&#160;',i);
							}
						}
					}
					$(dummy).append(trdiv);
				});
			}
			var pID = $(ts.grid.bDiv).find("table").first().attr("id")+"_";
			$("#"+$.jgrid.jqID(pID+sbid)).append(dummy);
			ts.grid.hDiv.loading = false;
			$("#load_"+$.jgrid.jqID(ts.p.id)).hide();
			return false;
		};
		var subGridJson = function(sjxml, sbid){
			var tddiv,result,i,cur, sgmap,j,
			dummy = $("<table class='" + base.rowTable + " ui-common-table'><tbody></tbody></table>"),
			trdiv = $("<tr></tr>");
			for (i = 0; i<ts.p.subGridModel[0].name.length; i++) {
				tddiv = $("<th class='" + base.headerBox + " ui-th-subgrid ui-th-column ui-th-"+ts.p.direction+"'></th>");
				$(tddiv).html(ts.p.subGridModel[0].name[i]);
				$(tddiv).width( ts.p.subGridModel[0].width[i]);
				$(trdiv).append(tddiv);
			}
			$(dummy).append(trdiv);
			if (sjxml){
				sgmap = ts.p.jsonReader.subgrid;
				result = $.jgrid.getAccessor(sjxml, sgmap.root);
				if ( result !== undefined ) {
					for (i=0;i<result.length;i++) {
						cur = result[i];
						trdiv = $("<tr class='" + common.content+" ui-subtblcell'></tr>");
						if(sgmap.repeatitems === true) {
							if(sgmap.cell) { cur=cur[sgmap.cell]; }
							for (j=0;j<cur.length;j++) {
								subGridCell(trdiv, cur[j] || '&#160;',j);
							}
						} else {
							var f = ts.p.subGridModel[0].mapping || ts.p.subGridModel[0].name;
							if(f.length) {
								for (j=0;j<f.length;j++) {
									subGridCell(trdiv, $.jgrid.getAccessor(cur, f[j] ) || '&#160;',j);
								}
							}
						}
						$(dummy).append(trdiv);
					}
				}
			}
			var pID = $(ts.grid.bDiv).find("table").first().attr("id")+"_";
			$("#"+$.jgrid.jqID(pID+sbid)).append(dummy);
			ts.grid.hDiv.loading = false;
			$("#load_"+$.jgrid.jqID(ts.p.id)).hide();
			return false;
		};
		var populatesubgrid = function( rd )
		{
			var sid,dp, i, j;
			sid = $(rd).attr("id");
			dp = {nd_: (new Date().getTime())};
			dp[ts.p.prmNames.subgridid]=sid;
			if(!ts.p.subGridModel[0]) { return false; }
			if(ts.p.subGridModel[0].params) {
				for(j=0; j < ts.p.subGridModel[0].params.length; j++) {
					for(i=0; i<ts.p.colModel.length; i++) {
						if(ts.p.colModel[i].name === ts.p.subGridModel[0].params[j]) {
							dp[ts.p.colModel[i].name]= $("td", rd).eq( i ).text().replace(/\&#160\;/ig,'');
						}
					}
				}
			}
			if(!ts.grid.hDiv.loading) {
				ts.grid.hDiv.loading = true;
				$("#load_"+$.jgrid.jqID(ts.p.id)).show();
				if(!ts.p.subgridtype) { ts.p.subgridtype = ts.p.datatype; }
				if($.jgrid.isFunction(ts.p.subgridtype)) {
					ts.p.subgridtype.call(ts, dp);
				} else {
					ts.p.subgridtype = ts.p.subgridtype.toLowerCase();
				}
				switch(ts.p.subgridtype) {
					case "xml":
					case "json":
					$.ajax($.extend({
						type:ts.p.mtype,
						url: $.jgrid.isFunction(ts.p.subGridUrl) ? ts.p.subGridUrl.call(ts, dp) : ts.p.subGridUrl,
						dataType:ts.p.subgridtype,
						data: $.jgrid.isFunction(ts.p.serializeSubGridData)? ts.p.serializeSubGridData.call(ts, dp) : dp,
						success: function(res, stat, sxml) {
							if(ts.p.subgridtype === "xml") {
								subGridXml(sxml.responseXML, sid);
							} else {
								subGridJson($.jgrid.parse(sxml.responseText), sid);
							}
							sxml=null;
						}, 
						error : function(res, stat, err) {
							if($.jgrid.isFunction(ts.p.subGridOptions.onErrorLoadData) ) {
								ts.p.subGridOptions.onErrorLoadData.call(ts, rowid, res, stat, err);
							} else {
								var rT = res.responseText +" <br/>"+res.statusText;
								try {
									$.jgrid.info_dialog(errors.errcap,'<div class="'+common.error+'">'+ rT +'</div>', edit.bClose, {buttonalign:'right', styleUI : ts.p.styleUI });
								} catch(e) {
									alert(rT);
								}
							}							
						}
					}, $.jgrid.ajaxOptions, ts.p.ajaxSubgridOptions || {}));
					break;
				}
			}
			return false;
		};
		var _id, pID,atd, nhc=0, bfsc, $r;
		$.each(ts.p.colModel,function(){
			if(this.hidden === true || this.name === 'rn' || this.name === 'cb'  || this.name === 'sc' ) {
				nhc++;
			}
		});
		var len = ts.rows.length, i=1,hsret, ishsg = $.jgrid.isFunction(ts.p.isHasSubGrid);
		if( sind !== undefined && sind > 0) {
			i = sind;
			len = sind+1;
		}
		while(i < len) {
			if($(ts.rows[i]).hasClass('jqgrow')) {
				if(ts.p.scroll) {
					$(ts.rows[i].cells[pos]).off('click');
				}
				hsret = null;
				if(ishsg) {
					hsret = ts.p.isHasSubGrid.call(ts, ts.rows[i].id);
				}
				if(hsret === false) {
					ts.rows[i].cells[pos].innerHTML = "";
				} else {
					$(ts.rows[i].cells[pos]).on('click', function() {
						var tr = $(this).parent("tr")[0];
						pID = ts.p.id;
						_id = tr.id;
						$r = $("#" + $.jgrid.jqID( pID + "_" + _id + "_expandedContent" ) );
						if($(this).hasClass("sgcollapsed")) {
							bfsc = $(ts).triggerHandler("jqGridSubGridBeforeExpand", [pID + "_" + _id, _id]);
							bfsc = (bfsc === false || bfsc === 'stop') ? false : true;
							if(bfsc && $.jgrid.isFunction(ts.p.subGridBeforeExpand)) {
								bfsc = ts.p.subGridBeforeExpand.call(ts, pID+"_"+_id,_id);
							}
							if(bfsc === false) {return false;}

							if(ts.p.subGridOptions.reloadOnExpand === true || ( ts.p.subGridOptions.reloadOnExpand === false && !$r.hasClass('ui-subgrid') ) ) {
								atd = pos >=1 ? "<td colspan='"+pos+"'>&#160;</td>":"";
								$(tr).after( "<tr role='row' id='" + pID + "_" + _id + "_expandedContent" + "' class='ui-subgrid ui-sg-expanded'>"+atd+"<td class='" + common.content +" subgrid-cell'><span class='" + common.icon_base +" "+ts.p.subGridOptions.openicon+"'></span></td><td colspan='"+parseInt(ts.p.colNames.length-1-nhc,10)+"' class='" + common.content +" subgrid-data'><div id="+pID+"_"+_id+" class='tablediv'></div></td></tr>" );
								$(ts).triggerHandler("jqGridSubGridRowExpanded", [pID + "_" + _id, _id]);
								if( $.jgrid.isFunction(ts.p.subGridRowExpanded)) {
									ts.p.subGridRowExpanded.call(ts, pID+"_"+ _id,_id);
								} else {
									populatesubgrid(tr);
								}
							} else {
								$r.show().removeClass("ui-sg-collapsed").addClass("ui-sg-expanded");
							}
							$(this).html("<a style='cursor:pointer;' class='ui-sghref'><span class='" + common.icon_base +" "+ts.p.subGridOptions.minusicon+"'></span></a>").removeClass("sgcollapsed").addClass("sgexpanded");
							if(ts.p.subGridOptions.selectOnExpand) {
								$(ts).jqGrid('setSelection',_id);
							}
						} else if($(this).hasClass("sgexpanded")) {
							bfsc = $(ts).triggerHandler("jqGridSubGridRowColapsed", [pID + "_" + _id, _id]);
							bfsc = (bfsc === false || bfsc === 'stop') ? false : true;
							if( bfsc &&  $.jgrid.isFunction(ts.p.subGridRowColapsed)) {
								bfsc = ts.p.subGridRowColapsed.call(ts, pID+"_"+_id,_id );
							}
							if(bfsc===false) {return false;}
							if(ts.p.subGridOptions.reloadOnExpand === true) {
								$r.remove(".ui-subgrid");
							} else if($r.hasClass('ui-subgrid')) { // incase of dynamic deleting
								$r.hide().addClass("ui-sg-collapsed").removeClass("ui-sg-expanded");
							}
							$(this).html("<a style='cursor:pointer;' class='ui-sghref'><span class='"+common.icon_base +" "+ts.p.subGridOptions.plusicon+"'></span></a>").removeClass("sgexpanded").addClass("sgcollapsed");
							if(ts.p.subGridOptions.selectOnCollapse) {
								$(ts).jqGrid('setSelection',_id);
							}
						}
						return false;
					});
				}
			}
			i++;
		}
		if(ts.p.subGridOptions.expandOnLoad === true) {
			var offset = 0;
			if(ts.p.multiselect) { offset++;}
			if(ts.p.rownumbers) { offset++;}
			$(ts.rows).filter('.jqgrow').each(function(index,row){
				$(row.cells[offset]).click();
			});
		}
		ts.subGridXml = function(xml,sid) {subGridXml(xml,sid);};
		ts.subGridJson = function(json,sid) {subGridJson(json,sid);};
	});
},
expandSubGridRow : function(rowid) {
	return this.each(function () {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.p.subGrid===true) {
			var rc = $(this).jqGrid("getInd",rowid,true);
			if(rc) {
				var sgc = $("td.sgcollapsed",rc)[0];
				if(sgc) {
					$(sgc).trigger("click");
				}
			}
		}
	});
},
collapseSubGridRow : function(rowid) {
	return this.each(function () {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.p.subGrid===true) {
			var rc = $(this).jqGrid("getInd",rowid,true);
			if(rc) {
				var sgc = $("td.sgexpanded",rc)[0];
				if(sgc) {
					$(sgc).trigger("click");
				}
			}
		}
	});
},
toggleSubGridRow : function(rowid) {
	return this.each(function () {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.p.subGrid===true) {
			var rc = $(this).jqGrid("getInd",rowid,true);
			if(rc) {
				var sgc = $("td.sgcollapsed",rc)[0];
				if(sgc) {
					$(sgc).trigger("click");
				} else {
					sgc = $("td.sgexpanded",rc)[0];
					if(sgc) {
						$(sgc).trigger("click");
					}
				}
			}
		}
	});
}
});

//module begin
$.jgrid.extend({
	setTreeNode : function(i, len){
		return this.each(function(){
			var $t = this;
			if( !$t.grid || !$t.p.treeGrid ) {return;}
			var expCol = $t.p.expColInd,
			expanded = $t.p.treeReader.expanded_field,
			isLeaf = $t.p.treeReader.leaf_field,
			level = $t.p.treeReader.level_field,
			icon = $t.p.treeReader.icon_field,
			loaded = $t.p.treeReader.loaded,  lft, rgt, curLevel, ident,lftpos, twrap,
			ldat, lf,
			common = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].common,
			index = i;
			$($t).triggerHandler("jqGridBeforeSetTreeNode", [index, len]);
			if($.jgrid.isFunction($t.p.beforeSetTreeNode)) {
				$t.p.beforeSetTreeNode.call($t, index, len);
			}
			while(i<len) {
				var ind = $.jgrid.stripPref($t.p.idPrefix, $t.rows[i].id), dind = $t.p._index[ind], expan;
				ldat = $t.p.data[dind];
				//$t.rows[i].level = ldat[level];
				if($t.p.treeGridModel === 'nested') {
					if(!ldat[isLeaf]) {
					lft = parseInt(ldat[$t.p.treeReader.left_field],10);
					rgt = parseInt(ldat[$t.p.treeReader.right_field],10);
					// NS Model
						ldat[isLeaf] = (rgt === lft+1) ? 'true' : 'false';
						$t.rows[i].cells[$t.p._treeleafpos].innerHTML = ldat[isLeaf];
					}
				}
				//else {
					//row.parent_id = rd[$t.p.treeReader.parent_id_field];
				//}
				curLevel = parseInt(ldat[level],10);
				if($t.p.tree_root_level === 0) {
					ident = curLevel+1;
					lftpos = curLevel;
				} else {
					ident = curLevel;
					lftpos = curLevel -1;
				}
				twrap = "<div class='tree-wrap tree-wrap-"+$t.p.direction+"' style='width:"+(ident*18)+"px;'>";
				twrap += "<div style='"+($t.p.direction==="rtl" ? "right:" : "left:")+(lftpos*18)+"px;' class='"+common.icon_base+" ";


				if(ldat[loaded] !== undefined) {
					if(ldat[loaded]==="true" || ldat[loaded]===true) {
						ldat[loaded] = true;
					} else {
						ldat[loaded] = false;
					}
				}
				if(ldat[isLeaf] === "true" || ldat[isLeaf] === true) {
					twrap += ((ldat[icon] !== undefined && ldat[icon] !== "") ? ldat[icon] : $t.p.treeIcons.leaf)+" tree-leaf treeclick";
					ldat[isLeaf] = true;
					lf="leaf";
				} else {
					ldat[isLeaf] = false;
					lf="";
				}
				ldat[expanded] = ((ldat[expanded] === "true" || ldat[expanded] === true) ? true : false) && (ldat[loaded] || ldat[loaded] === undefined);
				if(ldat[expanded] === false) {
					twrap += ((ldat[isLeaf] === true) ? "'" : $t.p.treeIcons.plus+" tree-plus treeclick'");
				} else {
					twrap += ((ldat[isLeaf] === true) ? "'" : $t.p.treeIcons.minus+" tree-minus treeclick'");
				}
				
				twrap += "></div></div>";
				$($t.rows[i].cells[expCol]).wrapInner("<span class='cell-wrapper"+lf+"'></span>").prepend(twrap);

				if(curLevel !== parseInt($t.p.tree_root_level,10)) {
					//var pn = $($t).jqGrid('getNodeParent',ldat);
					//expan = pn && pn.hasOwnProperty(expanded) ? pn[expanded] : true;
					expan = $($t).jqGrid('isVisibleNode',ldat); // overhead
					if( !expan ){
						$($t.rows[i]).css("display","none");
					}
				}
				$($t.rows[i].cells[expCol])
					.find("div.treeclick")
					.on("click",function(e){
						var target = e.target || e.srcElement,
						ind2 =$.jgrid.stripPref($t.p.idPrefix,$(target,$t.rows).closest("tr.jqgrow")[0].id),
						pos = $t.p._index[ind2];
						if(!$t.p.data[pos][isLeaf]){
							if($t.p.data[pos][expanded]){
								$($t).jqGrid("collapseRow",$t.p.data[pos]);
								$($t).jqGrid("collapseNode",$t.p.data[pos]);
							} else {
								$($t).jqGrid("expandRow",$t.p.data[pos]);
								$($t).jqGrid("expandNode",$t.p.data[pos]);
							}
						}
						//return false;
					});
				if($t.p.ExpandColClick === true) {
					$($t.rows[i].cells[expCol])
						.find("span.cell-wrapper")
						.css("cursor","pointer")
						.on("click",function(e) {
							var target = e.target || e.srcElement,
							ind2 =$.jgrid.stripPref($t.p.idPrefix,$(target,$t.rows).closest("tr.jqgrow")[0].id),
							pos = $t.p._index[ind2];
							if(!$t.p.data[pos][isLeaf]){
								if($t.p.data[pos][expanded]){
									$($t).jqGrid("collapseRow",$t.p.data[pos]);
									$($t).jqGrid("collapseNode",$t.p.data[pos]);
								} else {
									$($t).jqGrid("expandRow",$t.p.data[pos]);
									$($t).jqGrid("expandNode",$t.p.data[pos]);
								}
							}
							$($t).jqGrid("setSelection",ind2);
							//return false;
						});
				}
				i++;
			}
			$($t).triggerHandler("jqGridAfterSetTreeNode", [index, len]);			
			if($.jgrid.isFunction($t.p.afterSetTreeNode)) {
				$t.p.afterSetTreeNode.call($t, index, len);
			}
		});
	},
	setTreeGrid : function() {
		return this.each(function (){
			var $t = this, i=0, pico, ecol = false, nm, key, tkey, dupcols=[],
			classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].treegrid;
			if(!$t.p.treeGrid) {return;}
			if(!$t.p.treedatatype ) {$.extend($t.p,{treedatatype: $t.p.datatype});}
			if($t.p.loadonce) { $t.p.treedatatype = 'local'; }
			$t.p.subGrid = false;$t.p.altRows =false;
			//bvn
			if (!$t.p.treeGrid_bigData) { 
				$t.p.pgbuttons = false;
				$t.p.pginput = false;
				$t.p.rowList = [];
			}
			$t.p.gridview =  true;
			//bvn
			if($t.p.rowTotal === null && !$t.p.treeGrid_bigData ) { $t.p.rowNum = 10000; }
			$t.p.multiselect = false;
			// $t.p.rowList = [];
			$t.p.expColInd = 0;
			pico = classes.icon_plus;
			if($t.p.styleUI === 'jQueryUI') {
				pico += ($t.p.direction==="rtl" ? 'w' : 'e');
			}
			$t.p.treeIcons = $.extend({plus:pico, minus: classes.icon_minus, leaf: classes.icon_leaf},$t.p.treeIcons || {});
			if($t.p.treeGridModel === 'nested') {
				$t.p.treeReader = $.extend({
					level_field: "level",
					left_field:"lft",
					right_field: "rgt",
					leaf_field: "isLeaf",
					expanded_field: "expanded",
					loaded: "loaded",
					icon_field: "icon"
				},$t.p.treeReader);
			} else if($t.p.treeGridModel === 'adjacency') {
				$t.p.treeReader = $.extend({
					level_field: "level",
					parent_id_field: "parent",
					leaf_field: "isLeaf",
					expanded_field: "expanded",
					loaded: "loaded",
					icon_field: "icon"
				},$t.p.treeReader );
			}
			for ( key in $t.p.colModel){
				if($t.p.colModel.hasOwnProperty(key)) {
					nm = $t.p.colModel[key].name;
					if( nm === $t.p.ExpandColumn && !ecol ) {
						ecol = true;
						$t.p.expColInd = i;
					}
					i++;
					//
					if( nm === $t.p.treeReader.level_field || nm === $t.p.treeReader.left_field || nm === $t.p.treeReader.right_field) {
						$t.p.colModel[key].sorttype = "integer";
					}
					for(tkey in $t.p.treeReader) {
						if($t.p.treeReader.hasOwnProperty(tkey) && $t.p.treeReader[tkey] === nm) {
							dupcols.push(nm);
						}
					}
				}
			}
			$.each($t.p.treeReader,function(j,n){
				if(n && $.inArray(n, dupcols) === -1){
					if(j==='leaf_field') { $t.p._treeleafpos= i; }
				i++;
					$t.p.colNames.push(n);
					$t.p.colModel.push({name:n,width:1,hidden:true,sortable:false,resizable:false,hidedlg:true,editable:true,search:false});
				}
			});			
		});
	},
	expandRow: function (record){
		this.each(function(){
			var $t = this, $rootpages;
			//bvn
			if (!$t.p.treeGrid_bigData) {
				$rootpages = $t.p.lastpage;
			}
			if(!$t.grid || !$t.p.treeGrid) {return;}
			var childern = $($t).jqGrid("getNodeChildren",record),
			//if ($($t).jqGrid("isVisibleNode",record)) {
			expanded = $t.p.treeReader.expanded_field,
			rowid  = record[$t.p.localReader.id],
			ret = $($t).triggerHandler("jqGridBeforeExpandTreeGridRow", [rowid, record, childern]);
			if(ret === undefined ) {
				ret = true;
			}
			if(ret && $.jgrid.isFunction($t.p.beforeExpandTreeGridRow)) {
				ret =  $t.p.beforeExpandTreeGridRow.call($t, rowid, record, childern);
			}
			if( ret === false ) { return; }
			$(childern).each(function(){
				var id  = $t.p.idPrefix + $.jgrid.getAccessor(this,$t.p.localReader.id);
				$($($t).jqGrid('getGridRowById', id)).css("display","");
				if(this[expanded]) {
					$($t).jqGrid("expandRow",this);
				}
			});
			$($t).triggerHandler("jqGridAfterExpandTreeGridRow", [rowid, record, childern]);
			if($.jgrid.isFunction($t.p.afterExpandTreeGridRow)) {
				$t.p.afterExpandTreeGridRow.call($t, rowid, record, childern);
			}
			//bvn
			if (!$t.p.treeGrid_bigData) {
				$t.p.lastpage = $rootpages;
			}
			//}
		});
	},
	collapseRow : function (record) {
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) {return;}
			var childern = $($t).jqGrid("getNodeChildren",record),
			expanded = $t.p.treeReader.expanded_field,
			rowid  = record[$t.p.localReader.id],
			ret = $($t).triggerHandler("jqGridBeforeCollapseTreeGridRow", [rowid, record, childern]);
			if(ret === undefined ) {
				ret = true;
			}			
			if(ret &&  $.jgrid.isFunction($t.p.beforeCollapseTreeGridRow)) { 
				ret = $t.p.beforeCollapseTreeGridRow.call($t, rowid, record, childern);
			}
			if( ret === false ) { return; }
			$(childern).each(function(){
				var id  = $t.p.idPrefix + $.jgrid.getAccessor(this,$t.p.localReader.id);
				$($($t).jqGrid('getGridRowById', id)).css("display","none");
				if(this[expanded]){
					$($t).jqGrid("collapseRow",this);
				}
			});
			$($t).triggerHandler("jqGridAfterCollapseTreeGridRow", [rowid, record, childern]);
			if($.jgrid.isFunction($t.p.afterCollapseTreeGridRow)) {
				$t.p.afterCollapseTreeGridRow.call($t, rowid, record, childern);
			}			
		});
	},
	// NS ,adjacency models
	getRootNodes : function() {
		var result = [];
		this.each(function(){
			var $t = this, level, parent_id, view = $t.p.data;
			if(!$t.grid || !$t.p.treeGrid) {return;}

			switch ($t.p.treeGridModel) {
				case 'nested' :
					level = $t.p.treeReader.level_field;
					$(view).each(function() {
						if(parseInt(this[level],10) === parseInt($t.p.tree_root_level,10)) {
							result.push(this);
						}
					});
					break;
				case 'adjacency' :
					parent_id = $t.p.treeReader.parent_id_field;
					$(view).each(function(){
						if(this[parent_id] === null || String(this[parent_id]).toLowerCase() === "null") {
							result.push(this);
						}
					});
					break;
			}
		});
		return result;
	},
	getNodeDepth : function(rc) {
		var ret = null;
		this.each(function(){
			if(!this.grid || !this.p.treeGrid) {return;}
			var $t = this;
			switch ($t.p.treeGridModel) {
				case 'nested' :
					var level = $t.p.treeReader.level_field;
					ret = parseInt(rc[level],10) - parseInt($t.p.tree_root_level,10);
					break;
				case 'adjacency' :
					ret = $($t).jqGrid("getNodeAncestors",rc).length;
					break;
			}
		});
		return ret;
	},
	getNodeParent : function(rc) {
		var result = null;
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) {return;}
			switch ($t.p.treeGridModel) {
				case 'nested' :
					var lftc = $t.p.treeReader.left_field,
					rgtc = $t.p.treeReader.right_field,
					levelc = $t.p.treeReader.level_field,
					lft = parseInt(rc[lftc],10), rgt = parseInt(rc[rgtc],10), level = parseInt(rc[levelc],10);
					$(this.p.data).each(function(){
						if(parseInt(this[levelc],10) === level-1 && parseInt(this[lftc],10) < lft && parseInt(this[rgtc],10) > rgt) {
							result = this;
							return false;
						}
					});
					break;
				case 'adjacency' :
					var parent_id = $t.p.treeReader.parent_id_field,
					dtid = $t.p.localReader.id,
					ind = rc[dtid], pos = $t.p._index[ind];
					while(pos--) {
						if( String( $t.p.data[pos][dtid]) === String( $.jgrid.stripPref($t.p.idPrefix, rc[parent_id]) ) ) {
							result = $t.p.data[pos];
							break;
						}
					}
					break;
			}
		});
		return result;
	},
	getNodeChildren : function(rc ) {
		var result = [];
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) {return;}
			var i, len = this.p.data.length, row;
			switch ($t.p.treeGridModel) {
				case 'nested' :
					var lftc = $t.p.treeReader.left_field,
					rgtc = $t.p.treeReader.right_field,
					levelc = $t.p.treeReader.level_field,
					lft = parseInt(rc[lftc],10), rgt = parseInt(rc[rgtc],10), level = parseInt(rc[levelc],10);
					for(i=0; i  < len; i++) {
						row = $t.p.data[i];
						if(row && parseInt(row[levelc],10) === level+1 && parseInt(row[lftc],10) > lft && parseInt(row[rgtc],10) < rgt) {
							result.push(row);
						}
					}
					break;
				case 'adjacency' :
					var parent_id = $t.p.treeReader.parent_id_field,
					dtid = $t.p.localReader.id;
					for(i=0; i  < len; i++) {
						row = $t.p.data[i];
						if(row && String(row[parent_id]) === String( $.jgrid.stripPref($t.p.idPrefix, rc[dtid]) ) ) {
							result.push(row);
						}
					}
					break;
			}
		});
		return result;
	},
	getFullTreeNode : function(rc, expand) {
		var result = [];
		this.each(function(){
			var $t = this, len,expanded = $t.p.treeReader.expanded_field;
			if(!$t.grid || !$t.p.treeGrid) {return;}
			if(expand == null || typeof expand !== 'boolean') {
				expand = false;
			}
			switch ($t.p.treeGridModel) {
				case 'nested' :
					var lftc = $t.p.treeReader.left_field,
					rgtc = $t.p.treeReader.right_field,
					levelc = $t.p.treeReader.level_field,
					lft = parseInt(rc[lftc],10), rgt = parseInt(rc[rgtc],10), level = parseInt(rc[levelc],10);
					$(this.p.data).each(function(){
						if(parseInt(this[levelc],10) >= level && parseInt(this[lftc],10) >= lft && parseInt(this[lftc],10) <= rgt) {
							if(expand) { this[expanded] = true; }
							result.push(this);
						}
					});
					break;
				case 'adjacency' :
					if(rc) {
						result.push(rc);
						var parent_id = $t.p.treeReader.parent_id_field,
						dtid = $t.p.localReader.id;
						$(this.p.data).each(function(i){
							len = result.length;
							for (i = 0; i < len; i++) {
								if ( String( $.jgrid.stripPref($t.p.idPrefix, result[i][dtid]) ) === String( this[parent_id] ) ) {
									if(expand) { this[expanded] = true; }
									result.push(this);
									break;
								}
							}
						});
					}
					break;
			}
		});
		return result;
	},	
	// End NS, adjacency Model
	getNodeAncestors : function(rc, reverse, expanded) {
		var ancestors = [];
		if(reverse === undefined ) {
			reverse = false;
		}
		this.each(function(){
			if(!this.grid || !this.p.treeGrid) {return;}
			if(expanded === undefined ) {
				expanded = false;
			} else {
				expanded = this.p.treeReader.expanded_field;
			}
			var parent = $(this).jqGrid("getNodeParent",rc);
			while (parent) {
				if(expanded) {
					try{
						parent[expanded] = true;
					} catch (etn) {}
				}
				if(reverse) {
					ancestors.unshift(parent);
				} else {
					ancestors.push(parent);
				}
				parent = $(this).jqGrid("getNodeParent",parent);	
			}
		});
		return ancestors;
	},
	isVisibleNode : function(rc) {
		var result = true;
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) {return;}
			var ancestors = $($t).jqGrid("getNodeAncestors",rc),
			expanded = $t.p.treeReader.expanded_field;
			$(ancestors).each(function(){
				result = result && this[expanded];
				if(!result) {return false;}
			});
		});
		return result;
	},
	isNodeLoaded : function(rc) {
		var result;
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) {return;}
			var isLeaf = $t.p.treeReader.leaf_field,
			loaded = $t.p.treeReader.loaded;
			if(rc !== undefined ) {
				if(rc[loaded] !== undefined) {
					result = rc[loaded];
				} else if( rc[isLeaf] || $($t).jqGrid("getNodeChildren",rc).length > 0){
					result = true;
				} else {
					result = false;
				}
			} else {
				result = false;
			}
		});
		return result;
	},
	setLeaf : function (rc, state, collapsed) {
		return this.each(function(){
			var id = $.jgrid.getAccessor(rc,this.p.localReader.id),
			rc1 = $("#"+id,this.grid.bDiv)[0],
			isLeaf = this.p.treeReader.leaf_field;
			try {
				var dr = this.p._index[id];
				if(dr != null) {
					this.p.data[dr][isLeaf] = state;
				}
			} catch(E){}
			if(state === true) {
				// set it in data
				$("div.treeclick",rc1).removeClass(this.p.treeIcons.minus+" tree-minus "+this.p.treeIcons.plus+" tree-plus").addClass(this.p.treeIcons.leaf +" tree-leaf");
			} else if(state === false) {
				var ico = this.p.treeIcons.minus+" tree-minus";
				if(collapsed) {
					ico = this.p.treeIcons.plus+" tree-plus";
				}
				$("div.treeclick",rc1).removeClass(this.p.treeIcons.leaf +" tree-leaf").addClass( ico );
			}	
		});
	},
	reloadNode: function(rc, reloadcurrent) {
		return this.each(function(){
			if(!this.grid || !this.p.treeGrid) {return;}
			var rid = this.p.localReader.id,
			currselection  = this.p.selrow;

			$(this).jqGrid("delChildren", rc[rid]);

			if(reloadcurrent=== undefined) {
				reloadcurrent = false;
			}
			
			if(!reloadcurrent) {
				if(!jQuery._data( this, "events" ).jqGridAfterSetTreeNode) {
					$(this).on("jqGridAfterSetTreeNode.reloadNode", function(){
						var isLeaf = this.p.treeReader.leaf_field;
						if(this.p.reloadnode ) {
							var rc = this.p.reloadnode,
							chld = $(this).jqGrid('getNodeChildren', rc);
							if(rc[isLeaf] && chld.length) {
								$(this).jqGrid('setLeaf', rc, false);
							} else if(!rc[isLeaf] && chld.length === 0) {
								$(this).jqGrid('setLeaf', rc, true);
							}
						}
						this.p.reloadnode = false;
					});
				}
			}
			var expanded = this.p.treeReader.expanded_field,
			parent = this.p.treeReader.parent_id_field,
			loaded = this.p.treeReader.loaded,
			level = this.p.treeReader.level_field,
			isLeaf = this.p.treeReader.leaf_field,
			lft = this.p.treeReader.left_field,
			rgt = this.p.treeReader.right_field;

			var id = $.jgrid.getAccessor(rc,this.p.localReader.id),
			rc1 = $("#"+id,this.grid.bDiv)[0];

			rc[expanded] = true;
			if(!rc[isLeaf]) {
				$("div.treeclick",rc1).removeClass(this.p.treeIcons.plus+" tree-plus").addClass(this.p.treeIcons.minus+" tree-minus");
			}
			this.p.treeANode = rc1.rowIndex;
			this.p.datatype = this.p.treedatatype;
			this.p.reloadnode = rc;
			if(reloadcurrent) {
				this.p.treeANode = rc1.rowIndex > 0 ? rc1.rowIndex - 1 : 1;
				$(this).jqGrid('delRowData', id);
			}
			if(this.p.treeGridModel === 'nested') {
				$(this).jqGrid("setGridParam",{postData:{nodeid:id,n_left:rc[lft],n_right:rc[rgt],n_level:rc[level]}});
			} else {
				$(this).jqGrid("setGridParam",{postData:{nodeid:id,parentid:rc[parent],n_level:rc[level]}} );
			}
			$(this).trigger("reloadGrid");
			
			rc[loaded] = true;
			if(this.p.treeGridModel === 'nested') {
				$(this).jqGrid("setGridParam",{selrow: currselection, postData:{nodeid:'',n_left:'',n_right:'',n_level:''}});
			} else {
				$(this).jqGrid("setGridParam",{selrow: currselection, postData:{nodeid:'',parentid:'',n_level:''}});
			}
		});
	},
	expandNode : function(rc) {
		return this.each(function(){
			if(!this.grid || !this.p.treeGrid) {return;}
			var $t = this,
			expanded = this.p.treeReader.expanded_field,
			parent = this.p.treeReader.parent_id_field,
			loaded = this.p.treeReader.loaded,
			level = this.p.treeReader.level_field,
			lft = this.p.treeReader.left_field,
			rgt = this.p.treeReader.right_field;

			if(!rc[expanded]) {
				var id = $.jgrid.getAccessor(rc,this.p.localReader.id),
				rc1 = $("#" + this.p.idPrefix + $.jgrid.jqID(id),this.grid.bDiv)[0],
				position = this.p._index[id],
				ret = $($t).triggerHandler("jqGridBeforeExpandTreeGridNode", [id, rc]);
				if(ret === undefined ) {
					ret = true;
				}			
				if( ret && $.jgrid.isFunction(this.p.beforeExpandTreeGridNode) ) {
					ret =  this.p.beforeExpandTreeGridNode.call(this, id, rc );
				}
				if( ret === false ) { return; }

				if( $(this).jqGrid("isNodeLoaded",this.p.data[position]) ) {
					rc[expanded] = true;
					$("div.treeclick",rc1).removeClass(this.p.treeIcons.plus+" tree-plus").addClass(this.p.treeIcons.minus+" tree-minus");
				} else if (!this.grid.hDiv.loading) {
					rc[expanded] = true;
					$("div.treeclick",rc1).removeClass(this.p.treeIcons.plus+" tree-plus").addClass(this.p.treeIcons.minus+" tree-minus");
					this.p.treeANode = rc1.rowIndex;
					this.p.datatype = this.p.treedatatype;
					if(this.p.treeGridModel === 'nested') {
						$(this).jqGrid("setGridParam",{postData:{nodeid:id,n_left:rc[lft],n_right:rc[rgt],n_level:rc[level]}});
					} else {
						$(this).jqGrid("setGridParam",{postData:{nodeid:id,parentid:rc[parent],n_level:rc[level]}} );
					}
					$(this).trigger("reloadGrid");
					rc[loaded] = true;
					if(this.p.treeGridModel === 'nested') {
						$(this).jqGrid("setGridParam",{postData:{nodeid:'',n_left:'',n_right:'',n_level:''}});
					} else {
						$(this).jqGrid("setGridParam",{postData:{nodeid:'',parentid:'',n_level:''}}); 
					}
				}
				$($t).triggerHandler("jqGridAfterExpandTreeGridNode", [id, rc]);
				if($.jgrid.isFunction(this.p.afterExpandTreeGridNode)) {
					this.p.afterExpandTreeGridNode.call(this, id, rc );
				}
			}
		});
	},
	collapseNode : function(rc) {
		return this.each(function(){
			if(!this.grid || !this.p.treeGrid) {return;}
			var expanded = this.p.treeReader.expanded_field,
			$t = this;
			if(rc[expanded]) {
				var id = $.jgrid.getAccessor(rc,this.p.localReader.id),
				rc1 = $("#" + this.p.idPrefix + $.jgrid.jqID(id),this.grid.bDiv)[0],
				ret = $($t).triggerHandler("jqGridBeforeCollapseTreeGridNode", [id, rc]);
				if(ret === undefined ) {
					ret = true;
				}			
				if( ret &&  $.jgrid.isFunction(this.p.beforeCollapseTreeGridNode) ) {
					ret = this.p.beforeCollapseTreeGridNode.call(this, id, rc );
				}
				rc[expanded] = false;
				if( ret === false ) { return; }
				$("div.treeclick",rc1).removeClass(this.p.treeIcons.minus+" tree-minus").addClass(this.p.treeIcons.plus+" tree-plus");
				$($t).triggerHandler("jqGridAfterCollapseTreeGridNode", [id, rc]);
				if($.jgrid.isFunction(this.p.afterCollapseTreeGridNode)) {
					this.p.afterCollapseTreeGridNode.call(this, id, rc );
				}
			}
		});
	},
	SortTree : function( sortname, newDir, st, datefmt) {
		return this.each(function(){
			if(!this.grid || !this.p.treeGrid) {return;}
			var i, len,
			rec, records = [], $t = this, query, roots,
			rt = $(this).jqGrid("getRootNodes", $t.p.search);
			// Sorting roots
			query = $.jgrid.from.call(this, rt);
			// sort tree by node type
			if( Boolean($t.p.sortTreeByNodeType)) {
				var ord = ($t.p.sortTreeNodeOrder && $t.p.sortTreeNodeOrder.toLowerCase() === 'desc') ? 'd' : 'a'; 
				query.orderBy($t.p.treeReader.leaf_field, ord, st, datefmt);
			}
			query.orderBy(sortname, newDir, st, datefmt);
			roots = query.select();
			// Sorting children
			for (i = 0, len = roots.length; i < len; i++) {
				rec = roots[i];
				records.push(rec);
				$(this).jqGrid("collectChildrenSortTree",records, rec, sortname, newDir, st, datefmt);
			}
			var ids = $(this).jqGrid("getDataIDs"), j=1;
			$.each(records, function(index) {
				var id  = $.jgrid.getAccessor(this, $t.p.localReader.id);
				if($.inArray(id, ids) !== -1) {
					$('#'+$.jgrid.jqID($t.p.id)+ ' tbody tr').eq( j ).after($('#'+$.jgrid.jqID($t.p.id)+' tbody tr#'+$.jgrid.jqID(id)));
					j++;
				}
			});
			query = null;roots=null;records=null;
		});
	},
	searchTree : function ( recs ) {
		var n = recs.length || 0, ancestors=[], lid, roots=[], result=[],tid, alen, rlen, j, k, i;
		this.each(function(){
			if(!this.grid || !this.p.treeGrid) {
				return;
			}
			if(n) {
				lid = this.p.localReader.id;
				//while( i-- ) { // reverse 
				for( i=0; i<n; i++ ) {
					ancestors = $(this).jqGrid('getNodeAncestors', recs[i], true, true);
					//add the searched item
					if( Boolean(this.p.FullTreeSearchResult) ) {
						var fnode = $(this).jqGrid('getFullTreeNode', recs[i], true);
						ancestors = ancestors.concat(fnode);
					} else {
						ancestors.push(recs[i]);
					}
					tid = ancestors[0][lid]; 
					if($.inArray(tid, roots ) !== -1) { // ignore repeated, but add missing
						for( j = 0, alen = ancestors.length; j < alen; j++) {
							//$.inArray ?!?
							var found = false;
							for( k=0, rlen = result.length; k < rlen; k++) {
								if(ancestors[j][lid] === result[k][lid]) {
									found = true;
									break;
								}
							}
							if(!found) {
								result.push(ancestors[j]);
							}
						}
							continue;
					} else {
						roots.push( tid );
					}
					result = result.concat( ancestors );
				}	
			}
		});
		return result;
	},
	collectChildrenSortTree : function(records, rec, sortname, newDir,st, datefmt) {
		return this.each(function(){
			if(!this.grid || !this.p.treeGrid) {return;}
			var i, len,
			child, ch, query, children;
			ch = $(this).jqGrid("getNodeChildren",rec, this.p.search);
			query = $.jgrid.from.call(this, ch);
			query.orderBy(sortname, newDir, st, datefmt);
			children = query.select();
			for (i = 0, len = children.length; i < len; i++) {
				child = children[i];
				records.push(child);
				$(this).jqGrid("collectChildrenSortTree",records, child, sortname, newDir, st, datefmt); 
			}
		});
	},
	// experimental 
	setTreeRow : function(rowid, data) {
		var success=false;
		this.each(function(){
			var t = this;
			if(!t.grid || !t.p.treeGrid) {return;}
			success = $(t).jqGrid("setRowData", rowid, data);
		});
		return success;
	},
	delTreeNode : function (rowid, reload) {
		return this.each(function () {
			var $t = this, rid = $t.p.localReader.id, i,
			left = $t.p.treeReader.left_field, parent,
			right = $t.p.treeReader.right_field, myright, width, res, key;
			if(!$t.grid || !$t.p.treeGrid) {return;}
			rowid = $.jgrid.stripPref($t.p.idPrefix, rowid);
			var rc = $t.p._index[rowid];
			if(typeof reload === undefined) {
				reload = false;
			}
			if(reload) {
				parent = $(this).jqGrid("getNodeParent",$t.p.data[rc]);
			}
			if (rc !== undefined) {
				// nested
				myright = parseInt($t.p.data[rc][right],10);
				width = myright -  parseInt($t.p.data[rc][left],10) + 1;
				var dr = $($t).jqGrid("getFullTreeNode",$t.p.data[rc]);
				if(dr.length>0){
					for (i=0;i<dr.length;i++){
						$($t).jqGrid("delRowData", $t.p.idPrefix + dr[i][rid]);
					}
				}
				if( $t.p.treeGridModel === "nested") {
					// ToDo - update grid data
					res = $.jgrid.from.call($t, $t.p.data)
						.greater(left,myright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][left] = parseInt(res[key][left],10) - width ;
							}
						}
					}
					res = $.jgrid.from.call($t, $t.p.data)
						.greater(right,myright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][right] = parseInt(res[key][right],10) - width ;
							}
						}
					}
				}
				if(reload) {
					var isLeaf = this.p.treeReader.leaf_field;
					var chld = $(this).jqGrid('getNodeChildren', parent);
					if(parent[isLeaf] && chld.length) {
						$(this).jqGrid('setLeaf', parent, false);
					} else if(!rc[isLeaf] && chld.length === 0) {
						$(this).jqGrid('setLeaf', parent, true);
					}
				}
			}
		});
	},
	delChildren : function (rowid) {
		return this.each(function () {
			var $t = this, rid = $t.p.localReader.id,
			left = $t.p.treeReader.left_field,
			right = $t.p.treeReader.right_field, myright, width, res, key;
			if(!$t.grid || !$t.p.treeGrid) {return;}
			rowid = $.jgrid.stripPref($t.p.idPrefix, rowid);
			var rc = $t.p._index[rowid];
			if (rc !== undefined) {
				// nested
				myright = parseInt($t.p.data[rc][right],10);
				width = myright -  parseInt($t.p.data[rc][left],10) + 1;
				var dr = $($t).jqGrid("getFullTreeNode",$t.p.data[rc]);
				if(dr.length>0){
					for (var i=0;i<dr.length;i++){
						if(dr[i][rid] !== rowid)
							$($t).jqGrid("delRowData", $t.p.idPrefix + dr[i][rid]);
					}
				}
				if( $t.p.treeGridModel === "nested") {
					// ToDo - update grid data
					res = $.jgrid.from($t.p.data)
						.greater(left,myright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][left] = parseInt(res[key][left],10) - width ;
							}
						}
					}
					res = $.jgrid.from($t.p.data)
						.greater(right,myright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][right] = parseInt(res[key][right],10) - width ;
							}
						}
					}
				}
			}
		});
	},
	addChildNode : function( nodeid, parentid, data, expandData ) {
		//return this.each(function(){
		var $t = this[0];
		if(data) {
			// we suppose tha the id is autoincremet and
			var expanded = $t.p.treeReader.expanded_field,
			isLeaf = $t.p.treeReader.leaf_field,
			level = $t.p.treeReader.level_field,
			//icon = $t.p.treeReader.icon_field,
			parent = $t.p.treeReader.parent_id_field,
			left = $t.p.treeReader.left_field,
			right = $t.p.treeReader.right_field,
			loaded = $t.p.treeReader.loaded,
			method, parentindex, parentdata, parentlevel, i, len, max=0, rowind = parentid, leaf, maxright;
			if(expandData===undefined) {expandData = false;}
			if ( nodeid == null ) {
				i = $t.p.data.length-1;
				if(	i>= 0 ) {
					while(i>=0){max = Math.max(max, parseInt($t.p.data[i][$t.p.localReader.id],10)); i--;}
				}
				nodeid = max+1;
			}
			var prow = $($t).jqGrid('getInd', parentid);
			leaf = false;
			// if not a parent we assume root
			if ( parentid === undefined  || parentid === null || parentid==="") {
				parentid = null;
				rowind = null;
				method = 'last';
				parentlevel = $t.p.tree_root_level;
				i = $t.p.data.length+1;
			} else {
				method = 'after';
				var mid = $.jgrid.stripPref($t.p.idPrefix, parentid);
				parentindex = $t.p._index[mid];
				parentdata = $t.p.data[parentindex];
				parentid = parentdata[$t.p.localReader.id];
				parentlevel = parseInt(parentdata[level],10)+1;
				var childs = $($t).jqGrid('getFullTreeNode', parentdata);
				// if there are child nodes get the last index of it
				if(childs.length) {
					i = childs[childs.length-1][$t.p.localReader.id];
					rowind = i;
					i = $($t).jqGrid('getInd',  $t.p.idPrefix + rowind);
				} else {
					i = $($t).jqGrid('getInd',  $t.p.idPrefix + parentid);
				}
				// if the node is leaf
				if(parentdata[isLeaf]) {
					leaf = true;
					parentdata[expanded] = true;
					//var prow = $($t).jqGrid('getInd', parentid);
					$($t.rows[prow])
						.find("span.cell-wrapperleaf").removeClass("cell-wrapperleaf").addClass("cell-wrapper")
						.end()
						.find("div.tree-leaf").removeClass($t.p.treeIcons.leaf+" tree-leaf").addClass($t.p.treeIcons.minus+" tree-minus");
					$t.p.data[parentindex][isLeaf] = false;
					parentdata[loaded] = true;
				}
				// incremet th index of child to be inserted
				if( i === false ) {
					throw "Parent item with id: " + rowind + " ("+ parentid+") can't be found";
					//return;
				} else {
					i++;
				}
			}
			len = i+1;

			if( data[expanded]===undefined)  {data[expanded]= false;}
			if( data[loaded]===undefined )  { data[loaded] = false;}
			data[level] = parentlevel;
			if( data[isLeaf]===undefined) {data[isLeaf]= true;}
			if( $t.p.treeGridModel === "adjacency") {
				data[parent] = parentid;
			}
			if( $t.p.treeGridModel === "nested") {
				// this method requiere more attention
				var query, res, key;
				//maxright = parseInt(maxright,10);
				// ToDo - update grid data
				if(parentid !== null) {
					maxright = parseInt(parentdata[right],10);
					query = $.jgrid.from.call($t, $t.p.data);
					query = query.greaterOrEquals(right,maxright,{stype:'integer'});
					res = query.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][left] = res[key][left] > maxright ? parseInt(res[key][left],10) +2 : res[key][left];
								res[key][right] = res[key][right] >= maxright ? parseInt(res[key][right],10) +2 : res[key][right];
							}
						}
					}
					data[left] = maxright;
					data[right]= maxright+1;
				} else {
					maxright = parseInt( $($t).jqGrid('getCol', right, false, 'max'), 10);
					res = $.jgrid.from.call($t, $t.p.data)
						.greater(left,maxright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][left] = parseInt(res[key][left],10) +2 ;
							}
						}
					}
					res = $.jgrid.from.call($t, $t.p.data)
						.greater(right,maxright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][right] = parseInt(res[key][right],10) +2 ;
							}
						}
					}
					data[left] = maxright+1;
					data[right] = maxright + 2;
				}
			}
			if( parentid === null || $($t).jqGrid("isNodeLoaded",parentdata) || leaf ) {
					$($t).jqGrid('addRowData', nodeid, data, method, $t.p.idPrefix + rowind);
					$($t).jqGrid('setTreeNode', i, len);
			}
			if(parentdata && !parentdata[expanded] && expandData) {
				$($t.rows[prow])
					.find("div.treeclick")
					.click();
			}
		}
		//});
	}
});

//module begin
$.fn.jqDrag=function(h){return i(this,h,'d');};
$.fn.jqResize=function(h,ar){return i(this,h,'r',ar);};
$.jqDnR={
	dnr:{},
	e:0,
	drag:function(v){
		if(M.k == 'd'){E.css({left:M.X+v.pageX-M.pX,top:M.Y+v.pageY-M.pY});}
		else {
			E.css({width:Math.max(v.pageX-M.pX+M.W,0),height:Math.max(v.pageY-M.pY+M.H,0)});
			if(M1){E1.css({width:Math.max(v.pageX-M1.pX+M1.W,0),height:Math.max(v.pageY-M1.pY+M1.H,0)});}
		}
		return false;
	},
	stop:function(){
		//E.css('opacity',M.o);
		$(document).off('mousemove',J.drag).off('mouseup',J.stop);
	}
};
var J=$.jqDnR,M=J.dnr,E=J.e,E1,M1,
i=function(e,h,k,aR){
	return e.each(function(){
		h=(h)?$(h,e):e;
		h.on('mousedown',{e:e,k:k},function(v){
			var d=v.data,p={};E=d.e;E1 = aR ? $(aR) : false;
			// attempt utilization of dimensions plugin to fix IE issues
			if(E.css('position') != 'relative'){try{E.position(p);}catch(e){}}
			M={
				X:p.left||f('left')||0,
				Y:p.top||f('top')||0,
				W:f('width')||E[0].scrollWidth||0,
				H:f('height')||E[0].scrollHeight||0,
				pX:v.pageX,
				pY:v.pageY,
				k:d.k
				//o:E.css('opacity')
			};
			// also resize
			if(E1 && d.k != 'd'){
				M1={
					X:p.left||f1('left')||0,
					Y:p.top||f1('top')||0,
					W:E1[0].offsetWidth||f1('width')||0,
					H:E1[0].offsetHeight||f1('height')||0,
					pX:v.pageX,
					pY:v.pageY,
					k:d.k
				};
			} else {M1 = false;}			
			//E.css({opacity:0.8});
			if($("input.hasDatepicker",E[0])[0]) {
			try {$("input.hasDatepicker",E[0]).datepicker('hide');}catch (dpe){}
			}
			$(document).mousemove($.jqDnR.drag).mouseup($.jqDnR.stop);
			return false;
		});
	});
},
f=function(k){return parseInt(E.css(k),10)||false;},
f1=function(k){return parseInt(E1.css(k),10)||false;};
/*
	jQuery tinyDraggable v1.0.2
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/jQuery-tinyDraggable
    More info: https://pixabay.com/blog/posts/p-52/
	License: http://www.opensource.org/licenses/mit-license.php
*/
$.fn.tinyDraggable = function(options){
	var settings = $.extend({ handle: 0, exclude: 0 }, options);
	return this.each(function(){
	    var dx, dy, el = $(this), handle = settings.handle ? $(settings.handle, el) : el;
        handle.on({
        mousedown: function(e){
			if (settings.exclude && ~$.inArray(e.target, $(settings.exclude, el))) { return; }
			e.preventDefault();
			var os = el.offset(); dx = e.pageX-os.left, dy = e.pageY-os.top;
			$(document).on('mousemove.drag', function(e){ el.offset({top: e.pageY-dy, left: e.pageX-dx}); });
			},
			mouseup: function(e){ $(document).off('mousemove.drag'); }
		});
	});
};

//module begin
$.fn.jqm=function(o){
var p={
overlay: 50,
closeoverlay : true,
overlayClass: 'jqmOverlay',
closeClass: 'jqmClose',
trigger: '.jqModal',
ajax: F,
ajaxText: '',
target: F,
modal: F,
toTop: F,
onShow: F,
onHide: F,
onLoad: F
};
return this.each(function(){if(this._jqm){ return H[this._jqm].c=$.extend({},H[this._jqm].c,o);} s++;this._jqm=s;
H[s]={c:$.extend(p,$.jqm.params,o),a:F,w:$(this).addClass('jqmID'+s),s:s};
if(p.trigger){$(this).jqmAddTrigger(p.trigger);}
});};

$.fn.jqmAddClose=function(e){return hs(this,e,'jqmHide');};
$.fn.jqmAddTrigger=function(e){return hs(this,e,'jqmShow');};
$.fn.jqmShow=function(t){return this.each(function(){$.jqm.open(this._jqm,t);});};
$.fn.jqmHide=function(t){return this.each(function(){$.jqm.close(this._jqm,t);});};

$.jqm = {
hash:{},
open:function(s,t){var h=H[s],c=h.c,cc='.'+c.closeClass,z=(parseInt(h.w.css('z-index')));z=(z>0)?z:3000;var o=$('<div></div>').css({height:'100%',width:'100%',position:'fixed',left:0,top:0,'z-index':z-1,opacity:c.overlay/100});if(h.a){return F;} h.t=t;h.a=true;h.w.css('z-index',z);
 if(c.modal) {if(!A[0]){setTimeout(function(){ new L('bind');},1); }A.push(s);}
 else if(c.overlay > 0) {if(c.closeoverlay) {h.w.jqmAddClose(o);}}
 else {o=F;}

 h.o=(o)?o.addClass(c.overlayClass).prependTo('body'):F;

 if(c.ajax) {var r=c.target||h.w,u=c.ajax;r=(typeof r === 'string')?$(r,h.w):$(r);u=(u.substr(0,1) === '@')?$(t).attr(u.substring(1)):u;
  r.html(c.ajaxText).load(u,function(){if(c.onLoad){c.onLoad.call(this,h);}if(cc){h.w.jqmAddClose($(cc,h.w));}e(h);});}
 else if(cc){h.w.jqmAddClose($(cc,h.w));}

 if(c.toTop&&h.o){h.w.before('<span id="jqmP'+h.w[0]._jqm+'"></span>').insertAfter(h.o);}
 (c.onShow)?c.onShow(h):h.w.show();e(h);return F;
},
close:function(s){var h=H[s];if(!h.a){return F;}h.a=F;
 if(A[0]){A.pop();if(!A[0]){new L('unbind');}}
 if(h.c.toTop&&h.o){$('#jqmP'+h.w[0]._jqm).after(h.w).remove();}
 if(h.c.onHide){h.c.onHide(h);}else{h.w.hide();if(h.o){h.o.remove();}} return F;
},
params:{}};
var s=0,H=$.jqm.hash,A=[],F=false,
e=function(h){ if(h.c.focusField===undefined) {h.c.focusField = 0;}if(h.c.focusField >=0 ) {f(h);} },
f=function(h){try{$(':input:visible',h.w)[parseInt(h.c.focusField,10)].focus();	}catch(_){}},
L=function(t){$(document)[t]("keypress",m)[t]("keydown",m)[t]("mousedown",m);},
m=function(e){var h=H[A[A.length-1]],r=(!$(e.target).parents('.jqmID'+h.s)[0]);if(r){$('.jqmID'+h.s).each(function(){var $self=$(this),offset=$self.offset();if(offset.top<=e.pageY && e.pageY<=offset.top+$self.height() && offset.left<=e.pageX && e.pageX<=offset.left+$self.width() ){r=false;return false;}});/*f(h);*/}return !r;},
hs=function(w,t,c){return w.each(function(){var s=this._jqm;$(t).each(function() {
 if(!this[c]){this[c]=[];$(this).click(function(){for(var i in {jqmShow:1,jqmHide:1}){for(var s in this[i]){if(H[this[i][s]]){H[this[i][s]].w[i](this);}}}return F;});}
 this[c].push(s);});});};

//module begin
	$.fmatter = {};
	//opts can be id:row id for the row, rowdata:the data for the row, colmodel:the column model for this column
	//example {id:1234,}
	$.extend($.fmatter,{
		isBoolean : function(o) {
			return typeof o === 'boolean';
		},
		isObject : function(o) {
			return (o && (typeof o === 'object' || $.jgrid.isFunction(o))) || false;
		},
		isString : function(o) {
			return typeof o === 'string';
		},
		isNumber : function(o) {
			return typeof o === 'number' && isFinite(o);
		},
		isValue : function (o) {
			return (this.isObject(o) || this.isString(o) || this.isNumber(o) || this.isBoolean(o));
		},
		isEmpty : function(o) {
			if(!this.isString(o) && this.isValue(o)) {
				return false;
			}
			if (!this.isValue(o)){
				return true;
			}
			o = $.jgrid.trim(o).replace(/\&nbsp\;/ig,'').replace(/\&#160\;/ig,'');
			return o==="";	
		}
	});
	$.fn.fmatter = function(formatType, cellval, opts, rwd, act) {
		// build main options before element iteration
		var v=cellval;
		opts = $.extend({}, $.jgrid.getRegional(this, 'formatter') , opts);

		try {
			v = $.fn.fmatter[formatType].call(this, cellval, opts, rwd, act);
		} catch(fe){}
		return v;
	};
	$.fmatter.util = {
		// Taken from YAHOO utils
		NumberFormat : function(nData,opts) {
			if(!$.fmatter.isNumber(nData)) {
				nData *= 1;
			}
			if($.fmatter.isNumber(nData)) {
				var bNegative = (nData < 0);
				var sOutput = String(nData);
				var sDecimalSeparator = opts.decimalSeparator || ".";
				var nDotIndex;
				if($.fmatter.isNumber(opts.decimalPlaces)) {
					// Round to the correct decimal place
					var nDecimalPlaces = opts.decimalPlaces;
					//var nDecimal = Math.pow(10, nDecimalPlaces);
					//sOutput = String(Math.round(nData*nDecimal)/nDecimal);
					// see http://www.jacklmoore.com/notes/rounding-in-javascript/
					sOutput = String(Number(Math.round(nData+'e'+nDecimalPlaces)+'e-'+nDecimalPlaces));
					nDotIndex = sOutput.lastIndexOf(".");
					if(nDecimalPlaces > 0) {
					// Add the decimal separator
						if(nDotIndex < 0) {
							sOutput += sDecimalSeparator;
							nDotIndex = sOutput.length-1;
						}
						// Replace the "."
						else if(sDecimalSeparator !== "."){
							sOutput = sOutput.replace(".",sDecimalSeparator);
						}
					// Add missing zeros
						while((sOutput.length - 1 - nDotIndex) < nDecimalPlaces) {
							sOutput += "0";
						}
					}
				}
				if(opts.thousandsSeparator) {
					var sThousandsSeparator = opts.thousandsSeparator;
					nDotIndex = sOutput.lastIndexOf(sDecimalSeparator);
					nDotIndex = (nDotIndex > -1) ? nDotIndex : sOutput.length;
					var sNewOutput = sOutput.substring(nDotIndex);
					var nCount = -1, i;
					for (i=nDotIndex; i>0; i--) {
						nCount++;
						if ((nCount%3 === 0) && (i !== nDotIndex) && (!bNegative || (i > 1))) {
							sNewOutput = sThousandsSeparator + sNewOutput;
						}
						sNewOutput = sOutput.charAt(i-1) + sNewOutput;
					}
					sOutput = sNewOutput;
				}
				// Prepend prefix
				sOutput = (opts.prefix) ? opts.prefix + sOutput : sOutput;
				// Append suffix
				sOutput = (opts.suffix) ? sOutput + opts.suffix : sOutput;
				return sOutput;
				
			}
			return nData;
		}
	};
	$.fn.fmatter.defaultFormat = function(cellval, opts) {
		return ($.fmatter.isValue(cellval) && cellval!=="" ) ?  cellval : opts.defaultValue || "&#160;";
	};
	$.fn.fmatter.email = function(cellval, opts) {
		if(!$.fmatter.isEmpty(cellval)) {
			return "<a href=\"mailto:" + cellval + "\">" + cellval + "</a>";
		}
		return $.fn.fmatter.defaultFormat(cellval,opts );
	};
	$.fn.fmatter.checkbox =function(cval, opts) {
		var op = $.extend({},opts.checkbox), ds, checkboxVal, valtrue, valfalse, lang = Object.keys($.jgrid.regional)[0], title;
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || cval === undefined ) {cval = $.fn.fmatter.defaultFormat(cval,op);}
		cval=String(cval);
		cval=(cval+"").toLowerCase();
		var bchk = cval.search(/(false|f|0|no|n|off|undefined)/i)<0 ? " checked='checked' " : "";
		checkboxVal = $.jgrid.regional[lang].defaults.valueCheckbox;
		valtrue= $.jgrid.regional[lang].defaults.valT;	
		valfalse= $.jgrid.regional[lang].defaults.valF;
		if((checkboxVal !== undefined) && (cval==="true")) {
			title = checkboxVal + " " + valtrue;
		}
		else if (checkboxVal !== undefined && cval==="false") {
			title = checkboxVal+ " " + valfalse;
		}
		else {
			title = cval;
		}
		return "<input title=\""+title+"\" type=\"checkbox\" " + bchk  + " value=\""+ cval+"\" offval=\"no\" "+ds+ "/>";
	};
	$.fn.fmatter.link = function(cellval, opts) {
		var op = {target:opts.target};
		var target = "";
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.target) {target = 'target=' + op.target;}
		if(!$.fmatter.isEmpty(cellval)) {
			return "<a "+target+" href=\"" + cellval + "\">" + cellval + "</a>";
		}
		return $.fn.fmatter.defaultFormat(cellval,opts);
	};
	$.fn.fmatter.showlink = function(cellval, opts) {
		var op = {baseLinkUrl: opts.baseLinkUrl,showAction:opts.showAction, addParam: opts.addParam || "", target: opts.target, idName: opts.idName},
		target = "", idUrl;
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.target) {target = 'target=' + op.target;}
		idUrl = op.baseLinkUrl+op.showAction + '?'+ op.idName+'='+opts.rowId+op.addParam;
		if($.fmatter.isString(cellval) || $.fmatter.isNumber(cellval)) {	//add this one even if its blank string
			return "<a "+target+" href=\"" + idUrl + "\">" + cellval + "</a>";
		}
		return $.fn.fmatter.defaultFormat(cellval,opts);
	};
	$.fn.fmatter.integer = function(cellval, opts) {
		var op = $.extend({},opts.integer);
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if($.fmatter.isEmpty(cellval)) {
			return op.defaultValue;
		}
		return $.fmatter.util.NumberFormat(cellval,op);
	};
	$.fn.fmatter.number = function (cellval, opts) {
		var op = $.extend({},opts.number);
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if($.fmatter.isEmpty(cellval)) {
			return op.defaultValue;
		}
		return $.fmatter.util.NumberFormat(cellval,op);
	};
	$.fn.fmatter.currency = function (cellval, opts) {
		var op = $.extend({},opts.currency);
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if($.fmatter.isEmpty(cellval)) {
			return op.defaultValue;
		}
		return $.fmatter.util.NumberFormat(cellval,op);
	};
	$.fn.fmatter.date = function (cellval, opts, rwd, act) {
		var op = $.extend({},opts.date);
		if(opts.colModel !== undefined && opts.colModel.formatoptions !== undefined) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(!op.reformatAfterEdit && act === 'edit'){
			return $.fn.fmatter.defaultFormat(cellval, opts);
		}
		if(!$.fmatter.isEmpty(cellval)) {
			return $.jgrid.parseDate.call(this, op.srcformat,cellval,op.newformat,op);
		}
		return $.fn.fmatter.defaultFormat(cellval, opts);
	};
	$.fn.fmatter.select = function (cellval,opts) {
		// jqGrid specific
		cellval = String(cellval);
		var oSelect = false, ret=[], sep, delim;
		if(opts.colModel.formatoptions !== undefined){
			oSelect= opts.colModel.formatoptions.value;
			sep = opts.colModel.formatoptions.separator === undefined ? ":" : opts.colModel.formatoptions.separator;
			delim = opts.colModel.formatoptions.delimiter === undefined ? ";" : opts.colModel.formatoptions.delimiter;
		} else if(opts.colModel.editoptions !== undefined){
			oSelect= opts.colModel.editoptions.value;
			sep = opts.colModel.editoptions.separator === undefined ? ":" : opts.colModel.editoptions.separator;
			delim = opts.colModel.editoptions.delimiter === undefined ? ";" : opts.colModel.editoptions.delimiter;
		}
		if (oSelect) {
			var	msl =  (opts.colModel.editoptions != null && opts.colModel.editoptions.multiple === true) === true ? true : false,
			scell = [], sv;
			if(msl) {scell = cellval.split(",");scell = $.map(scell,function(n){return $.jgrid.trim(n);});}
			if ($.fmatter.isString(oSelect)) {
				// mybe here we can use some caching with care ????
				var so = oSelect.split(delim), j=0, i;
				for(i=0; i<so.length;i++){
					sv = so[i].split(sep);
					if(sv.length > 2 ) {
						sv[1] = $.map(sv,function(n,i){if(i>0) {return n;}}).join(sep);
					}
					if(msl) {
						if($.inArray(sv[0],scell)>-1) {
							ret[j] = sv[1];
							j++;
						}
					} else if($.jgrid.trim(sv[0]) === $.jgrid.trim(cellval)) {
						ret[0] = sv[1];
						break;
					}
				}
			} else if($.fmatter.isObject(oSelect)) {
				// this is quicker
				if(msl) {
					ret = $.map(scell, function(n){
						return oSelect[n];
					});
				} else {
					ret[0] = oSelect[cellval] || "";
				}
			}
		}
		cellval = ret.join(", ");
		return  cellval === "" ? $.fn.fmatter.defaultFormat(cellval,opts) : cellval;
	};
	$.fn.fmatter.rowactions = function(act) {
		var $tr = $(this).closest("tr.jqgrow"),
			rid = $tr.attr("id"),
			$id = $(this).closest("table.ui-jqgrid-btable").attr('id').replace(/_frozen([^_]*)$/,'$1'),
			$grid = $("#"+$id),
			$t = $grid[0],
			p = $t.p,
			cm = p.colModel[$.jgrid.getCellIndex(this)],
			$actionsDiv = cm.frozen ? $("tr#"+rid+" td", $grid).eq( $.jgrid.getCellIndex(this) ).find("> div") :$(this).parent(),
			op = {
				extraparam: {}
			},
			saverow = function(rowid, res) {
				if($.jgrid.isFunction(op.afterSave)) { op.afterSave.call($t, rowid, res); }
				$actionsDiv.find("div.ui-inline-edit,div.ui-inline-del").show();
				$actionsDiv.find("div.ui-inline-save,div.ui-inline-cancel").hide();
			},
			restorerow = function(rowid) {
				if($.jgrid.isFunction(op.afterRestore)) { op.afterRestore.call($t, rowid); }
				$actionsDiv.find("div.ui-inline-edit,div.ui-inline-del").show();
				$actionsDiv.find("div.ui-inline-save,div.ui-inline-cancel").hide();
			};

		if (cm.formatoptions !== undefined) {
			// Deep clone before copying over to op, to avoid creating unintentional references.
			// Otherwise, the assignment of op.extraparam[p.prmNames.oper] below may persist into the colModel config.
			var formatoptionsClone = $.extend(true, {}, cm.formatoptions);
			op = $.extend(op, formatoptionsClone);
		}
		if (p.editOptions !== undefined) {
			op.editOptions = p.editOptions;
		}
		if (p.delOptions !== undefined) {
			op.delOptions = p.delOptions;
		}
		if ($tr.hasClass("jqgrid-new-row")){
			op.extraparam[p.prmNames.oper] = p.prmNames.addoper;
		}
		var actop = {
			keys: op.keys,
			oneditfunc: op.onEdit,
			successfunc: op.onSuccess,
			url: op.url,
			extraparam: op.extraparam,
			aftersavefunc: saverow,
			errorfunc: op.onError,
			afterrestorefunc: restorerow,
			restoreAfterError: op.restoreAfterError,
			mtype: op.mtype
		};
		switch(act)
		{
			case 'edit':
				$grid.jqGrid('editRow', rid, actop);
				if($grid[0].p.beforeAction) {
					$actionsDiv.find("div.ui-inline-edit,div.ui-inline-del").hide();
					$actionsDiv.find("div.ui-inline-save,div.ui-inline-cancel").show();
					$grid.triggerHandler("jqGridAfterGridComplete");
				}
				break;
			case 'save':
				if ($grid.jqGrid('saveRow', rid, actop)) {
					$actionsDiv.find("div.ui-inline-edit,div.ui-inline-del").show();
					$actionsDiv.find("div.ui-inline-save,div.ui-inline-cancel").hide();
					$grid.triggerHandler("jqGridAfterGridComplete");
				}
				break;
			case 'cancel' :
				$grid.jqGrid('restoreRow', rid, restorerow);
				$actionsDiv.find("div.ui-inline-edit,div.ui-inline-del").show();
				$actionsDiv.find("div.ui-inline-save,div.ui-inline-cancel").hide();
				$grid.triggerHandler("jqGridAfterGridComplete");
				break;
			case 'del':
				$grid.jqGrid('delGridRow', rid, op.delOptions);
				break;
			case 'formedit':
				$grid.jqGrid('setSelection', rid);
				$grid.jqGrid('editGridRow', rid, op.editOptions);
				break;
		}
	};
	$.fn.fmatter.actions = function(cellval,opts) {
		var op={keys:false, editbutton:true, delbutton:true, editformbutton: false},
			rowid=opts.rowId, str="",ocl,
			nav = $.jgrid.getRegional(this, 'nav'),
			classes = $.jgrid.styleUI[(opts.styleUI || 'jQueryUI')].fmatter,
			common = $.jgrid.styleUI[(opts.styleUI || 'jQueryUI')].common;
		if(opts.colModel.formatoptions !== undefined) {
			op = $.extend(op,opts.colModel.formatoptions);
		}
		if(rowid === undefined || $.fmatter.isEmpty(rowid)) {return "";}
		var hover = "onmouseover=jQuery(this).addClass('" + common.hover +"'); onmouseout=jQuery(this).removeClass('" + common.hover +"');  ";
		if(op.editformbutton){ 
			ocl = "id='jEditButton_"+rowid+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'formedit'); " + hover;
			str += "<div title='"+nav.edittitle+"' style='float:left;cursor:pointer;' class='ui-pg-div ui-inline-edit' "+ocl+"><span class='" + common.icon_base +" "+classes.icon_edit +"'></span></div>";
		} else if(op.editbutton){
			ocl = "id='jEditButton_"+rowid+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'edit'); " + hover;
			str += "<div title='"+nav.edittitle+"' style='float:left;cursor:pointer;' class='ui-pg-div ui-inline-edit' "+ocl+"><span class='" + common.icon_base +" "+classes.icon_edit +"'></span></div>";
		}
		if(op.delbutton) {
			ocl = "id='jDeleteButton_"+rowid+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'del'); " + hover;
			str += "<div title='"+nav.deltitle+"' style='float:left;' class='ui-pg-div ui-inline-del' "+ocl+"><span class='" + common.icon_base +" "+classes.icon_del +"'></span></div>";
		}
		ocl = "id='jSaveButton_"+rowid+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'save'); " + hover;
		str += "<div title='"+nav.savetitle+"' style='float:left;display:none' class='ui-pg-div ui-inline-save' "+ocl+"><span class='" + common.icon_base +" "+classes.icon_save +"'></span></div>";
		ocl = "id='jCancelButton_"+rowid+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'cancel'); " + hover;
		str += "<div title='"+nav.canceltitle+"' style='float:left;display:none;' class='ui-pg-div ui-inline-cancel' "+ocl+"><span class='" + common.icon_base +" "+classes.icon_cancel +"'></span></div>";
		return "<div  class='jqgrid_actions' style='margin-left:8px;'>" + str + "</div>";
	};
	$.unformat = function (cellval,options,pos,cnt) {
		// specific for jqGrid only
		var ret, formatType = options.colModel.formatter,
		op =options.colModel.formatoptions || {}, sep,
		re = /([\.\*\_\'\(\)\{\}\+\?\\])/g,
		unformatFunc = options.colModel.unformat||($.fn.fmatter[formatType] && $.fn.fmatter[formatType].unformat);
		if(unformatFunc !== undefined && $.jgrid.isFunction(unformatFunc) ) {
			ret = unformatFunc.call(this, $(cellval).text(), options, cellval);
		} else if(formatType !== undefined && $.fmatter.isString(formatType) ) {
			var opts = $.jgrid.getRegional(this, 'formatter') || {}, stripTag;
			switch(formatType) {
				case 'integer' :
					op = $.extend({},opts.integer,op);
					sep = op.thousandsSeparator.replace(re,"\\$1");
					stripTag = new RegExp(sep, "g");
					ret = $(cellval).text().replace(stripTag,'');
					break;
				case 'number' :
					op = $.extend({},opts.number,op);
					sep = op.thousandsSeparator.replace(re,"\\$1");
					stripTag = new RegExp(sep, "g");
					ret = $(cellval).text().replace(stripTag,"").replace(op.decimalSeparator,'.');
					break;
				case 'currency':
					op = $.extend({},opts.currency,op);
					sep = op.thousandsSeparator.replace(re,"\\$1");
					stripTag = new RegExp(sep, "g");
					ret = $(cellval).text();
					if (op.prefix && op.prefix.length) {
						ret = ret.slice(op.prefix.length);
					}
					if (op.suffix && op.suffix.length) {
						ret = ret.slice(0, ret.length - op.suffix.length);
					}
					ret = ret.replace(stripTag,'').replace(op.decimalSeparator,'.');
					break;
				case 'checkbox':
					var cbv = (options.colModel.editoptions) ? options.colModel.editoptions.value.split(":") : ["Yes","No"];
					ret = $('input',cellval).is(":checked") ? cbv[0] : cbv[1];
					break;
				case 'select' :
					ret = $.unformat.select(cellval,options,pos,cnt);
					break;
				case 'actions':
					return "";
				default:
					ret= $(cellval).text();
			}
		}
		return ret !== undefined ? ret : cnt===true ? $(cellval).text() : $.jgrid.htmlDecode($(cellval).html());
	};
	$.unformat.select = function (cellval,options,pos,cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [];
		var cell = $(cellval).text();
		if(cnt===true) {return cell;}
		var op = $.extend({}, options.colModel.formatoptions !== undefined ? options.colModel.formatoptions: options.colModel.editoptions),
		sep = op.separator === undefined ? ":" : op.separator,
		delim = op.delimiter === undefined ? ";" : op.delimiter;
		
		if(op.value){
			var oSelect = op.value,
			msl =  op.multiple === true ? true : false,
			scell = [], sv;
			if(msl) {scell = cell.split(",");scell = $.map(scell,function(n){return $.jgrid.trim(n);});}
			if ($.fmatter.isString(oSelect)) {
				var so = oSelect.split(delim), j=0, i;
				for(i=0; i<so.length;i++){
					sv = so[i].split(sep);
					if(sv.length > 2 ) {
						sv[1] = $.map(sv,function(n,i){if(i>0) {return n;}}).join(sep);
					}
					if(op.decodeValue && op.decodeValue===true) {
						sv[1] = $.jgrid.htmlDecode(sv[1]);
					}
					if(msl) {
						if($.inArray($.jgrid.trim(sv[1]),scell)>-1) {
							ret[j] = sv[0];
							j++;
						}
					} else if($.jgrid.trim(sv[1]) === $.jgrid.trim(cell)) {
						ret[0] = sv[0];
						break;
					}
				}
			} else if( $.fmatter.isObject(oSelect) || Array.isArray(oSelect) ){
				if(!msl) {scell[0] =  cell;}
				ret = $.map(scell, function(n){
					var rv;
					$.each(oSelect, function(i,val){
						if (val === n) {
							rv = i;
							return false;
						}
					});
					if( rv !== undefined ) {return rv;}
				});
			}
			return ret.join(", ");
		}
		return cell || "";
	};
	$.unformat.date = function (cellval, opts) {
		var op = $.jgrid.getRegional(this, 'formatter.date') || {};
		if(opts.formatoptions !== undefined) {
			op = $.extend({},op,opts.formatoptions);
		}		
		if(!$.fmatter.isEmpty(cellval)) {
			return $.jgrid.parseDate.call(this, op.newformat,cellval,op.srcformat,op);
		}
		return $.fn.fmatter.defaultFormat(cellval, opts);
	};

//module begin
var dragging, placeholders = $();
$.fn.html5sortable = function(options) {
	var method = String(options);
	options = $.extend({
		connectWith: false
	}, options);
	return this.each(function() {
		var items;
		if (/^enable|disable|destroy$/.test(method)) {
			items = $(this).children($(this).data('items')).attr('draggable', method === 'enable');
			if (method === 'destroy') {
				items.add(this).removeData('connectWith items')
					.off('dragstart.h5s dragend.h5s selectstart.h5s dragover.h5s dragenter.h5s drop.h5s');
			}
			return;
		}
		var isHandle, index; 
		items = $(this).children(options.items);
		var placeholder = $('<' + (/^ul|ol$/i.test(this.tagName) ? 'li' : /^tbody$/i.test(this.tagName) ? 'tr' : 'div') +
            ' class="sortable-placeholder ' + options.placeholderClass + '">').html('&nbsp;');
        items.find(options.handle).mousedown(function() {
			isHandle = true;
		}).mouseup(function() {
			isHandle = false;
		});
		$(this).data('items', options.items);
		placeholders = placeholders.add(placeholder);
		if (options.connectWith) {
			$(options.connectWith).add(this).data('connectWith', options.connectWith);
		}
		items.attr('draggable', 'true').on('dragstart.h5s', function(e) {
			if (options.handle && !isHandle) {
				return false;
			}
			isHandle = false;
			var dt = e.originalEvent.dataTransfer;
			dt.effectAllowed = 'move';
			dt.setData('Text', 'dummy');
			index = (dragging = $(this)).addClass('sortable-dragging').index();
		}).on('dragend.h5s', function() {
			if (!dragging) {
				return;
			}
			dragging.removeClass('sortable-dragging').show();
			placeholders.detach();
			if (index !== dragging.index()) {
				dragging.parent().trigger('sortupdate', {item: dragging, startindex: index, endindex: dragging.index()});
			}
			dragging = null;
		}).not('a[href], img').on('selectstart.h5s', function() {
			this.dragDrop && this.dragDrop();
			return false;
		}).end().add([this, placeholder]).on('dragover.h5s dragenter.h5s drop.h5s', function(e) {
			if (!items.is(dragging) && options.connectWith !== $(dragging).parent().data('connectWith')) {
				return true;
			}
			if (e.type === 'drop') {
				e.stopPropagation();
				placeholders.filter(':visible').after(dragging);
				dragging.trigger('dragend.h5s');
				return false;
			}
			e.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = 'move';
			if (items.is(this)) {
				if (options.forcePlaceholderSize) {
					placeholder.height(dragging.outerHeight());
				}
				dragging.hide();
				$(this)[placeholder.index() < $(this).index() ? 'after' : 'before'](placeholder);
				placeholders.not(placeholder).detach();
			} else if (!placeholders.is(this) && !$(this).children(options.items).length) {
				placeholders.detach();
				$(this).append(placeholder);
			}
			return false;
		});
	});
};

//module begin
$.extend($.jgrid,{
//window.jqGridUtils = {
	isJSON : function (mixed) {
		if (typeof mixed !== 'string') {
			mixed = JSON.stringify( mixed );
		}
		try {
			JSON.parse( mixed );
			return true;
		} catch (e) {
			return false;
		}
	},
	stringify : function(obj) {
		return JSON.stringify(obj,function(key, value){
            return (typeof value === 'function' ) ? value.toString() : value;
        });
	},
	parseFunc : function(str) {
		return JSON.parse(str,function(key, value){
			if(typeof value === "string" && value.indexOf("function") !== -1) {
				var sv = value.split(" ");
				sv[0] = $.jgrid.trim( sv[0].toLowerCase() );
				if( (sv[0].indexOf('function') === 0) && value.trim().slice(-1) === "}") {
					return  $.jgrid.runCode( value ); //eval('('+value+')');
				} else {
					return value;
				}
			}
			return value;
		});
	},
	encode : function ( text ) { // repeated, but should not depend on grid
		return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
	},
	jsonToXML : function ( tree, options ) {
		var o = $.extend( {
			xmlDecl : '<?xml version="1.0" encoding="UTF-8" ?>\n',
			attr_prefix : '-',
			encode : true
		}, options || {}),
		that = this,
		scalarToxml = function ( name, text ) {
			if ( name === "#text" ) {
				return (o.encode ? that.encode(text) : text);
			} else if(typeof(text) ==='function') {
				return "<"+name+"><![CDATA["+ text +"]]></"+name+">\n";
			} if(text === "") {
				return "<"+name+">__EMPTY_STRING_</"+name+">\n";
			} else {
				return "<"+name+">"+(o.encode ? that.encode(text) : text )+"</"+name+">\n";
			}
		},
		arrayToxml = function ( name, array ) {
			var out = [];
		    for( var i=0; i<array.length; i++ ) {
				var val = array[i];
		        if ( typeof(val) === "undefined" || val == null ) {
					out[out.length] = "<"+name+" />";
				} else if ( typeof(val) === "object" && val.constructor == Array ) {
					out[out.length] = arrayToxml( name, val );
				} else if ( typeof(val) === "object" ) {
					out[out.length] = hashToxml( name, val );
				} else {
					out[out.length] = scalarToxml( name, val );
				}
			}
			if(!out.length) {
				out[0] = "<"+ name+">__EMPTY_ARRAY_</"+name+">\n";
			}
			return out.join("");
		},
		hashToxml = function ( name, tree ) {
			var elem = [];
		    var attr = [];
		    for( var key in tree ) {
				if ( ! tree.hasOwnProperty(key) ) continue;
				var val = tree[key];
				if ( key.charAt(0) !==  o.attr_prefix ) {
					if ( val == null ) { // null or undefined
		               elem[elem.length] = "<"+key+" />";
					} else if ( typeof(val) === "object" && val.constructor === Array ) {
		                elem[elem.length] = arrayToxml( key, val );
		            } else if ( typeof(val) === "object" ) {
						elem[elem.length] = hashToxml( key, val );
					} else {
						elem[elem.length] = scalarToxml( key, val );
					}
				} else {
					attr[attr.length] = " "+(key.substring(1))+'="'+(o.encode ? that.encode( val ) : val)+'"';
				}
			}
			var jattr = attr.join("");
			var jelem = elem.join("");
			if ( name == null ) { // null or undefined
				// no tag
			} else if ( elem.length > 0 ) {
				if ( jelem.match( /\n/ )) {
					jelem = "<"+name+jattr+">\n"+jelem+"</"+name+">\n";
				} else {
					jelem = "<"+name+jattr+">"  +jelem+"</"+name+">\n";
				}
			} else {
				jelem = "<"+name+jattr+" />\n";
			}
			return jelem;
		};

		var xml = hashToxml( null, tree );
		return o.xmlDecl + xml;
	},
	xmlToJSON : function ( root, options ) {
		var o = $.extend ( {
			force_array : [], //[ "rdf:li", "item", "-xmlns" ];
			attr_prefix : '-'
		}, options || {} );
		
		if(!root) { return; }
		
	    var __force_array = {};
		if ( o.force_array ) {
			for( var i=0; i< o.force_array.length; i++ ) {
				__force_array[o.force_array[i]] = 1;
			}
		}
		
		if(typeof root === 'string') {
			root = $.parseXML(root);
		} 
		if(root.documentElement) {
			root = root.documentElement;
		}
		var addNode = function ( hash, key, cnts, val ) {
			if(typeof val === 'string') {
				if( val.indexOf('function') !== -1) {
					val =  $.jgrid.runCode( val ); //eval( '(' + val +')'); // we need this in our implement
				} else {
					switch(val) {
						case '__EMPTY_ARRAY_' :
							val = [];
							break;
						case '__EMPTY_STRING_':
							val = "";
							break;
						case "false" :
							val = false;
							break;
						case "true":
							val = true;
							break;
					}
				}
			} 
			if ( __force_array[key] ) {
				if ( cnts === 1 ) {
					hash[key] = [];
				}
				hash[key][hash[key].length] = val;      // push
			} else if ( cnts === 1 ) {                   // 1st sibling
				hash[key] = val;
			} else if ( cnts === 2 ) {                   // 2nd sibling
				hash[key] = [ hash[key], val ];
			} else {                                    // 3rd sibling and more
				hash[key][hash[key].length] = val;
			}
		},
		parseElement = function ( elem ) {
			//  COMMENT_NODE
			if ( elem.nodeType === 7 ) {
				return;
			}

			//  TEXT_NODE CDATA_SECTION_NODE
			if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
				var bool = elem.nodeValue.match( /[^\x00-\x20]/ );
				if ( bool == null ) return;     // ignore white spaces
				return elem.nodeValue;
			}
			
			var retval,	cnt = {}, i, key, val;

			//  parse attributes
			if ( elem.attributes && elem.attributes.length ) {
				retval = {};
				for ( i=0; i<elem.attributes.length; i++ ) {
					key = elem.attributes[i].nodeName;
					if ( typeof(key) !== "string" )  {
						continue;
					}
					val = elem.attributes[i].nodeValue;
					if ( ! val ) {
						continue;
					}
					key = o.attr_prefix + key;
					if ( typeof(cnt[key]) === "undefined" ) {
						cnt[key] = 0;
					}
					cnt[key] ++;
					addNode( retval, key, cnt[key], val );
				}
			}

			//  parse child nodes (recursive)
			if ( elem.childNodes && elem.childNodes.length ) {
				var textonly = true;
				if ( retval ) {
					textonly = false;
				}        // some attributes exists
				for ( i=0; i<elem.childNodes.length && textonly; i++ ) {
					var ntype = elem.childNodes[i].nodeType;
					if ( ntype === 3 || ntype === 4 ) {
						continue;
					}
					textonly = false;
				}
				if ( textonly ) {
					if ( ! retval ) {
						retval = "";
					}
					for ( i=0; i<elem.childNodes.length; i++ ) {
						retval += elem.childNodes[i].nodeValue;
					}
				} else {
					if ( ! retval ) {
						retval = {};
					}
					for ( i=0; i<elem.childNodes.length; i++ ) {
						key = elem.childNodes[i].nodeName;
						if ( typeof(key) !== "string" ) {
							continue;
						}
						val = parseElement( elem.childNodes[i] );
						if ( !val ) {
							continue;
						}
						if ( typeof(cnt[key]) === "undefined" ) {
							cnt[key] = 0;
						}
						cnt[key] ++;
						addNode( retval, key, cnt[key], val );
					}
				}
			}
			return retval;
		};
		
	    var json = parseElement( root );   // parse root node
		if ( __force_array[root.nodeName] ) {
			json = [ json ];
		}
		if ( root.nodeType !== 11 ) {            // DOCUMENT_FRAGMENT_NODE
			var tmp = {};
			tmp[root.nodeName] = json;          // root nodeName
			json = tmp;
		}
		return json;
	},
	saveAs : function (data, fname, opts) {
		opts = $.extend(true,{
			type : 'plain/text;charset=utf-8'
		}, opts || {});

		var file, url, tmp = []; 

		fname = fname == null || fname === '' ? 'jqGridFile.txt' : fname;

		if( !Array.isArray(data) ) {
			tmp[0]= data ;
		} else {
			tmp = data;	
		}
		try {
			file = new File(tmp, fname, opts);
		} catch (e) {
			file = new Blob(tmp, opts);
		}
		if ( window.navigator && window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob( file , fname );
		} else {
			url = URL.createObjectURL(file);
			var a = document.createElement("a");
			a.href = url;
			a.download = fname;
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}, 0);
		}
	},
	csvToArray : function (str, delimiter) {
		if(delimiter === undefined) {delimiter =",";}
		var headers=[],arrMatches, arr=[], objr = {}, k=0, len, lines=0;
		var objPattern = new RegExp(
			(
			// Delimiters.
			"(\\" + delimiter + "|\\r?\\n|\\r|^)" +
			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
			// Standard fields.
			"([^\"\\" + delimiter + "\\r\\n]*))"
			),
		"gi");

		while (arrMatches = objPattern.exec(str)) {
			var strMatchedDelimiter = arrMatches[1];
			if ( strMatchedDelimiter.length && strMatchedDelimiter !== delimiter ) {
				lines++;
				objr = {};
				k=0;
			}
			var strMatchedValue;
			if (arrMatches[2]) {
				strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"),"\"");
			} else {
				strMatchedValue = arrMatches[3];
			}
			if(lines === 0 ) {
				headers.push(strMatchedValue);
				len = headers.length;
			} else {
				objr[headers[k]] = strMatchedValue;
				if(k===len-1) {
					arr.push(objr);
				} else {
					k++;
				}
			}
		}
		return arr;
	}
});

//module begin

$.jgrid = $.jgrid || {};


$.extend($.jgrid,{
	formatCell : function ( cellval , colpos, rwdat, cm, $t, etype, adf, acf){
		var v = cellval;
		if( adf === undefined ) {
			adf = true;
		}
		if( acf === undefined ) {
			acf = true;
		}
		if(cm.formatter !== undefined) {
			var opts= {rowId: '', colModel:cm, gid: $t.p.id, pos:colpos, styleUI: '', isExported : true, exporttype : etype };
			if($.jgrid.isFunction( cm.formatter ) ) {
				if(acf) {
				v = cm.formatter.call($t,cellval,opts,rwdat);
				}
			} else if($.fmatter){
				if(adf) {
				v = $.fn.fmatter.call($t,cm.formatter,cellval,opts,rwdat);
			}
		}
		}
		return v == null ? '' : v;
	},
	formatCellCsv : function (v, p) {
		v = v == null ? '' : String(v);
		try {
			v = $.jgrid.stripHtml( v.replace(p._regexsep ,p.separatorReplace).replace(/\r\n/g, p.replaceNewLine).replace(/\n/g, p.replaceNewLine));
		} catch (_e) {
			v="";
		}
		if(p.escquote) {
			v = v.replace(p._regexquot, p.escquote + p.quote);
		}
		if( v.indexOf(p.separator) === -1 || v.indexOf(p.qoute) === -1) {
			v = p.quote + v + p.quote;
		}
		return v;
	},

	excelCellPos : function ( n ){
		var ordA = 'A'.charCodeAt(0),
		ordZ = 'Z'.charCodeAt(0),
		len = ordZ - ordA + 1,
		s = "";

		while( n >= 0 ) {
			s = String.fromCharCode(n % len + ordA) + s;
			n = Math.floor(n / len) - 1;
		}

		return s;
	},

	makeNode : function ( root, elemName, options ) {
		var currNode = root.createElement( elemName );

		if ( options ) {
			if ( options.attr ) {
				$(currNode).attr( options.attr );
			}
			if( options.children ) {
				$.each( options.children, function ( key, value ) {
					currNode.appendChild( value );
				});
			}
			if( options.hasOwnProperty('text') ) {
				currNode.appendChild( root.createTextNode( options.text ) );
			}
		}
		return currNode;
	},
	xmlToString : function (xmlDom) {
		return (typeof XMLSerializer!=="undefined") ? 
			(new window.XMLSerializer()).serializeToString(xmlDom) : 
			xmlDom.xml;
	},
	xmlToZip : function ( zip, obj ) {
		var $t = this,
		xmlserialiser = new XMLSerializer(),
		// IE >= 9
		ieExcel = xmlserialiser.serializeToString(
			$.parseXML( $.jgrid.excelStrings['xl/worksheets/sheet1.xml'] ) )
			.indexOf( 'xmlns:r' ) === -1,
		newDir, worksheet, i, ien, attr, attrs = [], str;

		$.each( obj, function ( name, val ) {
			if ( $.isPlainObject( val ) ) {
				newDir = zip.folder( name );
				$t.xmlToZip( newDir, val );
			} else {
				if ( ieExcel ) {
					worksheet = val.childNodes[0];
					for ( i=worksheet.attributes.length-1 ; i>=0 ; i-- ) {
						var attrName = worksheet.attributes[i].nodeName;
						var attrValue = worksheet.attributes[i].nodeValue;

						if ( attrName.indexOf( ':' ) !== -1 ) {
							attrs.push( { name: attrName, value: attrValue } );

							worksheet.removeAttribute( attrName );
						}
					}

					for ( i=0, ien=attrs.length ; i<ien ; i++ ) {
						attr = val.createAttribute( attrs[i].name.replace( ':', '_dt_b_namespace_token_' ) );
						attr.value = attrs[i].value;
						worksheet.setAttributeNode( attr );
					}
				}
				// suuport of all browsers
				str = xmlserialiser.serializeToString(val);
				// Fix IE's XML
				if ( ieExcel ) {
					if ( str.indexOf( '<?xml' ) === -1 ) {
						str = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+str;
					}
					str = str.replace( /_dt_b_namespace_token_/g, ':' );
				}

				str = str
					.replace( /<row xmlns="" /g, '<row ' )
					.replace( /<cols xmlns="">/g, '<cols>' )
					.replace( /<mergeCells xmlns="" /g, '<mergeCells ' )
					.replace( /<numFmt xmlns="" /g, '<numFmt ' )
					.replace( /<xf xmlns="" /g, '<xf ' );

				zip.file( name, str );
			}
		} );
	},
	excelStrings  : {
		"_rels/.rels":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
			'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
				'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'+
			'</Relationships>',

		"xl/_rels/workbook.xml.rels":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
			'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
				'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'+
				'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'+
			'</Relationships>',

		"[Content_Types].xml":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
			'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
				'<Default Extension="xml" ContentType="application/xml" />'+
				'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />'+
				'<Default Extension="jpeg" ContentType="image/jpeg" />'+
				'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />'+
				'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />'+
				'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />'+
			'</Types>',

		"xl/workbook.xml":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
			'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
				'<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/>'+
				'<workbookPr showInkAnnotation="0" autoCompressPictures="0"/>'+
				'<bookViews>'+
					'<workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/>'+
				'</bookViews>'+
				'<sheets>'+
					'<sheet name="Sheet1" sheetId="1" r:id="rId1"/>'+
				'</sheets>'+
			'</workbook>',

		"xl/worksheets/sheet1.xml":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
			'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+
				'<sheetData/>'+
			'</worksheet>',

		"xl/styles.xml":
			'<?xml version="1.0" encoding="UTF-8"?>'+
			'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+
				'<numFmts count="7">'+
					'<numFmt numFmtId="164" formatCode="#,##0.00_-\ [$$-45C]"/>'+
					'<numFmt numFmtId="165" formatCode="&quot;£&quot;#,##0.00"/>'+
					'<numFmt numFmtId="166" formatCode="[$€-2]\ #,##0.00"/>'+
					'<numFmt numFmtId="167" formatCode="0.0%"/>'+
					'<numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/>'+
					'<numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/>'+
					'<numFmt numFmtId="170" formatCode="yyyy/mm/dd;@"/>'+
				'</numFmts>'+
				'<fonts count="5" x14ac:knownFonts="1">'+
					'<font>'+
						'<sz val="11" />'+
						'<name val="Calibri" />'+
					'</font>'+
					'<font>'+
						'<sz val="11" />'+
						'<name val="Calibri" />'+
						'<color rgb="FFFFFFFF" />'+
					'</font>'+
					'<font>'+
						'<sz val="11" />'+
						'<name val="Calibri" />'+
						'<b />'+
					'</font>'+
					'<font>'+
						'<sz val="11" />'+
						'<name val="Calibri" />'+
						'<i />'+
					'</font>'+
					'<font>'+
						'<sz val="11" />'+
						'<name val="Calibri" />'+
						'<u />'+
					'</font>'+
				'</fonts>'+
				'<fills count="6">'+
					'<fill>'+
						'<patternFill patternType="none" />'+
					'</fill>'+
					'<fill/>'+
					'<fill>'+
						'<patternFill patternType="solid">'+
							'<fgColor rgb="FFD9D9D9" />'+
							'<bgColor indexed="64" />'+
						'</patternFill>'+
					'</fill>'+
					'<fill>'+
						'<patternFill patternType="solid">'+
							'<fgColor rgb="FFD99795" />'+
							'<bgColor indexed="64" />'+
						'</patternFill>'+
					'</fill>'+
					'<fill>'+
						'<patternFill patternType="solid">'+
							'<fgColor rgb="ffc6efce" />'+
							'<bgColor indexed="64" />'+
						'</patternFill>'+
					'</fill>'+
					'<fill>'+
						'<patternFill patternType="solid">'+
							'<fgColor rgb="ffc6cfef" />'+
							'<bgColor indexed="64" />'+
						'</patternFill>'+
					'</fill>'+
				'</fills>'+
				'<borders count="2">'+
					'<border>'+
						'<left />'+
						'<right />'+
						'<top />'+
						'<bottom />'+
						'<diagonal />'+
					'</border>'+
					'<border diagonalUp="false" diagonalDown="false">'+
						'<left style="thin">'+
							'<color auto="1" />'+
						'</left>'+
						'<right style="thin">'+
							'<color auto="1" />'+
						'</right>'+
						'<top style="thin">'+
							'<color auto="1" />'+
						'</top>'+
						'<bottom style="thin">'+
							'<color auto="1" />'+
						'</bottom>'+
						'<diagonal />'+
					'</border>'+
				'</borders>'+
				'<cellStyleXfs count="1">'+
					'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" />'+
				'</cellStyleXfs>'+
				'<cellXfs count="69">'+
					'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
					'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
						'<alignment horizontal="left"/>'+
					'</xf>'+
					'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
						'<alignment horizontal="center"/>'+
					'</xf>'+
					'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
						'<alignment horizontal="right"/>'+
					'</xf>'+
					'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
						'<alignment horizontal="fill"/>'+
					'</xf>'+
					'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
						'<alignment textRotation="90"/>'+
					'</xf>'+
					'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
						'<alignment wrapText="1"/>'+
					'</xf>'+
					'<xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="1" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="2" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="170" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
					'<xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'+
				'</cellXfs>'+
				'<cellStyles count="1">'+
					'<cellStyle name="Normal" xfId="0" builtinId="0" />'+
				'</cellStyles>'+
				'<dxfs count="0" />'+
				'<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" />'+
			'</styleSheet>'
	},
	excelParsers : [
		{ match: /^\-?\d+\.\d%$/,       style: 60, fmt: function (d) { return d/100; } }, // Precent with d.p.
		{ match: /^\-?\d+\.?\d*%$/,     style: 56, fmt: function (d) { return d/100; } }, // Percent
		{ match: /^\-?\$[\d,]+.?\d*$/,  style: 57 }, // Dollars
		{ match: /^\-?£[\d,]+.?\d*$/,   style: 58 }, // Pounds
		{ match: /^\-?€[\d,]+.?\d*$/,   style: 59 }, // Euros
		{ match: /^\-?\d+$/,            style: 65 }, // Numbers without thousand separators
		{ match: /^\-?\d+\.\d{2}$/,     style: 66 }, // Numbers 2 d.p. without thousands separators
		{ match: /^\([\d,]+\)$/,        style: 61, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets
		{ match: /^\([\d,]+\.\d{2}\)$/, style: 62, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets - 2d.p.
		{ match: /^\-?[\d,]+$/,         style: 63 }, // Numbers with thousand separators
		{ match: /^\-?[\d,]+\.\d{2}$/,  style: 64 },  // Numbers with 2 d.p. and thousands separators
		{ match: /^\d{4}\-\d{2}\-\d{2}$/, style: 67 }, // Dates
		{ match: /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi, style : 4} // hyperlink
	],
	addExcelStyle : function ( obj, options, alignment, styleSh) {
		options = $.extend({
			numFmtId : "0",
			fontId: "0",
			fillId: "0",
			borderId: "0",
			applyFont:"1",
			applyFill:"1",
			applyBorder:"1",
			xfId:"0",
			applyNumberFormat:"0",
			applyAlignment  : "0"
		}, options || {});
		alignment =  $.extend({
			horizontal: "left", // left, center, right, fill, justified
			indent: "0", // indent from left
			shrinkToFit : "1", //"0"
			textRotation : "0", // in degree
			vertical : "center", // top, bottom
			wrapText : "0"
		}, alignment || {});
		if( $.isEmptyObject( obj )) {
			obj.excel_parsers = true;
		}
		var checkSt = true;
		if(styleSh == null) {
			var es= $.jgrid.excelStrings;
			styleSh = $.parseXML( es['xl/styles.xml']);
			checkSt = false;
		}
		//var	styleSh = $.parseXML( $.jgrid.excelStrings['xl/styles.xml']), //xlsx.xl["styles.xml"];
		var formats = styleSh.getElementsByTagName("numFmts")[0],
		celsX = styleSh.getElementsByTagName("cellXfs")[0];

		var format=null, style=null;

		for(var k in obj) {
			if(obj.hasOwnProperty(k)) {
				if(k.indexOf('format') !== -1) {
					format = k;
				}
				if(k.indexOf('style') !== -1) {
					style = k;
				}
			}
		}
		if(style && !obj[style]) {
			// add the sformatter
			var count = 0,
			maxfmtid =0,
			fmnt, mycell;

			if(format && obj[format]) {
				fmnt= $(formats.getElementsByTagName("numFmt"));
				$.each( fmnt, function(i,n) {
					count++;
					maxfmtid = Math.max(maxfmtid,  parseInt( $(n).attr("numFmtId"), 10) );
				});
				mycell = $.jgrid.makeNode( styleSh , "numFmt", {attr: {numFmtId : maxfmtid + 1, formatCode : obj[format] } });
				formats.appendChild( mycell );
				$(formats).attr("count", count + 1);
			}

			var numid = maxfmtid !== 0 ? maxfmtid + 1 +"" : "0";
			count = 0;
			options.numFmtId = numid;
			mycell = options.applyAlignment === "1" ?
				$.jgrid.makeNode( styleSh , "xf", { 
					attr: options , 
					children: [	$.jgrid.makeNode( styleSh, 'alignment', {  attr : alignment } ) ]
				}) :
				$.jgrid.makeNode( styleSh , "xf", { 
					attr: options 
				});
			celsX.appendChild( mycell );
			count = $('cellXfs xf', styleSh).length;
			$(celsX).attr("count", count);
			obj[style] = count-1;
			if(!checkSt) {
				es['xl/styles.xml'] = $.jgrid.xmlToString( styleSh );
			}
		}
		return obj;
	},
	newExcelStyle : function ( xlsx, options ) {
		options = $.extend(true, {
			font : { size : 11, name : 'Calibri', options :""}, // options <b/> <i/> <u/>
			color : { patternType : "solid", fgColor : "FFFFFFF", bgColor : 64 }, // bgColor if number 0-64
			border : 0 //{leftStyle : 'none', rightStyle:'none', topStyle : 'none', bottomStyle : none, color : 'auto'}
		}, options || {});
		//PatterType can be one of the following
		/*
			none, solid,darkDown,darkGray,darkGrid,darkHorizontal,darkTrellis,
			darkUp,darkVertical,gray0625,gray125,lightDown,lightGray,lightGrid
			lightHorizontal,lightTrellis,lightUp,lightVertical,mediumGray
		*/
		// border style values can be
		/*
		  dashDot, dashDotDot, dashed, dotted, double, hair, medium, mediumDashDot,
		  mediumDashDotDot, mediumDashed, none, slantDashDot, thick, thin
		 */
		/* color can be
		  auto or string representing rgb value or number from 0-64
		*/
		//styleSheet.childNodes[0].childNodes[0] ==> number formats  <numFmts count="6"> </numFmts>
		//styleSheet.childNodes[0].childNodes[1] ==> fonts           <fonts count="5" x14ac:knownFonts="1"> </fonts>
		//styleSheet.childNodes[0].childNodes[2] ==> fills           <fills count="6"> </fills>
		//styleSheet.childNodes[0].childNodes[3] ==> borders         <borders count="2"> </borders>
		//styleSheet.childNodes[0].childNodes[4] ==> cell style xfs  <cellStyleXfs count="1"> </cellStyleXfs>
		//styleSheet.childNodes[0].childNodes[5] ==> cell xfs        <cellXfs count="69"> </cellXfs>
		//on the last line we have the 69 currently built in styles (0 - 68)

		var sSh = xlsx.xl['styles.xml'],
		   lastXfIndex   = $('cellXfs xf', sSh).length - 1,
		   lastFontIndex = $('fonts font', sSh).length - 1,
		   lastFillIndex = $('fills fill', sSh).length - 1,
		   lastBorderIndex = $('borders border', sSh).length - 1;


		var font1 =
        '<font>'+
                '<sz val="'+options.font.size+'" />'+
                '<name val="'+options.font.name+'" />'+
                options.font.options +
        '</font>';
		sSh.childNodes[0].childNodes[1].innerHTML += font1; //new font
		var bgcolor = 'rgb =';
		if(parseInt(options.color.bgColor,10) >= 0 ) {
			bgcolor = 'indexed =';
		}
		bgcolor += '"'+options.color.bgColor+'"';
		var color1 = 
			'<fill>'+
			'<patternFill patternType="'+options.color.patternType+'">'+
			'<fgColor rgb="'+options.color.fgColor+'" />'+
			'<bgColor ' + bgcolor+' />'+
			'</patternFill>'+
		'</fill>';		
		sSh.childNodes[0].childNodes[2].innerHTML += color1; //new color
		if($.isPlainObject(options.border)) {
			options.border = $.extend({leftStyle : 'none', rightStyle:'none', topStyle : 'none', bottomStyle : 'none', color : 'auto'}, options.border || {})
			var bcolor;
			if(options.border.color === 'auto') {
				bcolor = 'auto="1"'; 
			} else if( $.fmatter.isNumber(options.border.color) ) {
				bcolor = 'indexed="'+options.border.color+'"';
			} else if($.fmatter.isString(options.border.color)) {
				bcolor = 'rgb="'+options.border.color+'"';
			}
			var border1 =
			'<border diagonalUp="false" diagonalDown="false">'+
				'<left style="'+options.border.leftStyle+'">' +
					'<color '+bcolor+' />'+
				'</left>'+
				'<right style="'+options.border.rightStyle+'">' +
					'<color '+bcolor+' />'+
				'</right>'+
				'<top style="'+options.border.topStyle+'">' +
					'<color '+bcolor+' />'+
				'</top>'+
				'<bottom style="'+options.border.bottomStyle+'">' +
					'<color '+bcolor+' />'+
				'</bottom>'+
				'<diagonal />'+
			'</border>';
			sSh.childNodes[0].childNodes[3].innerHTML += border1; //new border
		} else {
			lastBorderIndex = parseInt(options.border,10)-1;
		}
        var s1 = '<xf numFmtId="0" fontId="'+(lastFontIndex+1)+'" fillId="'+(lastFillIndex+1)+'" borderId="'+(lastBorderIndex+1)+'" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"></xf>';
		sSh.childNodes[0].childNodes[5].innerHTML += s1;
		return (lastXfIndex + 1);
	}
});
/********************************************************************
*
* due to speed, every export method will have separate module
* to collect grouped data
*
*********************************************************************/
$.jgrid.extend({
	exportToCsv : function ( p ) {
		p = $.extend(true, {
			separator: ",",
			separatorReplace : " ",
			quote : '"',
			escquote : '"',
			newLine : "\r\n", // navigator.userAgent.match(/Windows/) ?	'\r\n' : '\n';
			replaceNewLine : " ",
			includeCaption : true,
			includeLabels : true,
			includeGroupHeader : true,
			includeFooter: true,
			includeHeader: true,
			fileName : "jqGridExport.csv",
			mimetype : "text/csv;charset=utf-8",
			returnAsString : false,
			onBeforeExport : null,
			treeindent : ' ',
			visibleTreeNodes : false,
			loadIndicator : true, // can be a function
			applyDefFmt : true,
			applyCustFmt : true
		}, p || {});
		var ret ="";
		this.each(function(){

			p._regexsep = new RegExp(p.separator, "g");
			p._regexquot = new RegExp(p.quote, "g");

			var $t = this,
			// get the filtered data
			data1 = $t.p.treeGrid ? $($t).jqGrid('getRowData', null, true, p.treeindent, p.visibleTreeNodes) : $t.addLocalData( true ), //this.addLocalData( true ),
			dlen = data1.length,
			cm = $t.p.colModel,
			cmlen = cm.length,
			clbl = $t.p.colNames,
			i, j=0, row, str = '' , tmp, k,
			cap = "", hdr = "", ftr="",	lbl="", albl=[], htr="";
			function groupToCsv (grdata, p) {
				var str="",
				grp = $t.p.groupingView,
				cp=[], len =grp.groupField.length,
				cm = $t.p.colModel,
				colspans = cm.length,
				toEnd = 0;

				$.each(cm, function (i,n){
					var ii;
					for(ii=0;ii<len;ii++) {
						if(grp.groupField[ii] === n.name ) {
							cp[ii] = i;
							break;
						}
					}
				});
				function findGroupIdx( ind , offset, grp) {
					var ret = false, i;
					if(offset===0) {
						ret = grp[ind];
					} else {
						var id = grp[ind].idx;
						if(id===0) {
							ret = grp[ind];
						}  else {
							for(i=ind;i >= 0; i--) {
								if(grp[i].idx === id-offset) {
									ret = grp[i];
									break;
								}
							}
						}
					}
					return ret;
				}
				function buildSummaryTd(i, ik, grp, foffset) {
					var fdata = findGroupIdx(i, ik, grp),
					//cm = $t.p.colModel,
					vv, grlen = fdata.cnt, k, retarr= new Array(p.collen), j=0;
					for(k=foffset; k<colspans;k++) {
						if(!cm[k]._expcol) {
							continue;
						}
						var tplfld = "{0}";
						$.each(fdata.summary,function(){
							if(this.nm === cm[k].name) {
								if(cm[k].summaryTpl)  {
									tplfld = cm[k].summaryTpl;
								}
								vv = this.v;
								if(typeof this.st === 'string' && this.st.toLowerCase() === 'avg') {
									if(this.sd && this.vd) {
										vv = (this.v/this.vd);
									} else if(this.v && grlen > 0) {
										vv = (this.v/grlen);
									}
								}
								try {
									this.groupCount = fdata.cnt;
									this.groupIndex = fdata.dataIndex;
									this.groupValue = fdata.value;
									vv = $t.formatter('', vv, k, this);
								} catch (ef) {
									vv = this.v;
								}
								retarr[j] =
									$.jgrid.formatCellCsv(
									$.jgrid.stripHtml(
									$.jgrid.template(tplfld,vv)
									), p ) ;
								return false;
							}
						});
						j++;
					}
					return retarr;
				}
				var sumreverse = $.makeArray(grp.groupSummary), gv, k;
				sumreverse.reverse();
				if($t.p.datatype === 'local' && !$t.p.loadonce) {
					$($t).jqGrid('groupingSetup');
					var groupingPrepare = $.jgrid.getMethod("groupingPrepare");
					for(var ll=0; ll < dlen; ll++) {
						groupingPrepare.call($($t), data1[ll], ll);
					}
				}
				$.each(grp.groups,function(i,n){
					toEnd++;
					try {
						if (Array.isArray(grp.formatDisplayField) && $.jgrid.isFunction(grp.formatDisplayField[n.idx])) {
							gv = grp.formatDisplayField[n.idx].call($t, n.displayValue, n.value, $t.p.colModel[cp[n.idx]], n.idx, grp);
						} else {
							gv = $t.formatter('', n.displayValue, cp[n.idx], n.value );
						}
					} catch (egv) {
						gv = n.displayValue;
					}
					var grpTextStr = '';
					if($.jgrid.isFunction(grp.groupText[n.idx])) {
						grpTextStr = grp.groupText[n.idx].call($t, gv, n.cnt, n.summary);
					} else {
						grpTextStr = $.jgrid.template(grp.groupText[n.idx], gv, n.cnt, n.summary);
					}
					if( !(typeof grpTextStr ==='string' || typeof grpTextStr ==='number' ) ) {
						grpTextStr = gv;
					}
					var arr;
					if(grp.groupSummaryPos[n.idx] === 'header')  {
						arr = buildSummaryTd(i, 0, grp.groups, 0 /*grp.groupColumnShow[n.idx] === false ? (mul ==="" ? 2 : 3) : ((mul ==="") ? 1 : 2)*/ );
					} else {
						arr = new Array(p.collen);
					}
					arr[0] = $.jgrid.formatCellCsv( $.jgrid.stripHtml( grpTextStr ), p);
					str +=  arr.join( p.separator ) + p.newLine;
					var leaf = len-1 === n.idx;
					if( leaf ) {
						var gg = grp.groups[i+1], kk, ik, offset = 0, sgr = n.startRow, to,
						end = gg !== undefined ?  gg.startRow : grp.groups[i].startRow + grp.groups[i].cnt;
						for(kk=sgr;kk<end;kk++) {
							if(!grdata[kk - offset]) { break; }
							to = grdata[kk - offset];
							k = 0;
							for(ik = 0; ik < cm.length; ik++) {
								if(cm[ik]._expcol) {
									arr[k] = $.jgrid.formatCellCsv(
										$.jgrid.formatCell( $.jgrid.getAccessor(to, cm[ik].name), ik, to, cm[ik], $t, 'csv', p.applyDefFmt, p.applyCustFmt ) , p);
									k++;
								}
							}
							str += arr.join( p.separator ) + p.newLine;
						}

						if(grp.groupSummaryPos[n.idx] !== 'header') {
							var jj;
							if (gg !== undefined) {
								for (jj = 0; jj < grp.groupField.length; jj++) {
									if (gg.dataIndex === grp.groupField[jj]) {
										break;
									}
								}
								toEnd = grp.groupField.length - jj;
							}
							for (ik = 0; ik < toEnd; ik++) {
								if(!sumreverse[ik]) { continue; }
								arr = buildSummaryTd(i, ik, grp.groups, 0);
								str += arr.join( p.separator ) + p.newLine;
							}
							toEnd = jj;
						}
					}
				});
				return str;
			}
			if( $.jgrid.isFunction( p.loadIndicator )) {
				p.loadIndicator.call($t,'show');
			} else if(p.loadIndicator) {
				$($t).jqGrid("progressBar", {method:"show", loadtype : $t.p.loadui, htmlcontent: $.jgrid.getRegional($t,'defaults.loadtext') });
			}
			// end group function
			var def = [], key;
			$.each(cm,function(i,n) {
				n._expcol = true;
				if(n.exportcol === undefined) {
					if(n.hidden) {
						n._expcol = false;
					}
				} else {
					n._expcol = n.exportcol;
				}
				if(n.name === 'cb' || n.name === 'rn' || n.name === 'subgrid' || n.name === 'sc') {
					n._expcol = false;
				}
				if(n._expcol) {
					albl.push( $.jgrid.formatCellCsv( clbl[i], p) );
					def.push( n.name ); // clbl[i];
				}
			});

			if(p.includeLabels) {
				lbl = albl.join( p.separator ) + p.newLine;
			}

			p.collen = albl.length;

			if( $t.p.grouping ) {
				var savlcgr = $t.p.groupingView._locgr ? true : false;
				$t.p.groupingView._locgr = false;
				str += groupToCsv(data1, p);
				$t.p.groupingView._locgr  = savlcgr;

			}  else {
				while(j < dlen) {
					row = data1[j];
					tmp = [];
					k =0;
					for(i = 0; i < cmlen; i++) {
						if(cm[i]._expcol) {
							tmp[k] = $.jgrid.formatCellCsv( $.jgrid.formatCell( $.jgrid.getAccessor(row, cm[i].name) , i, row, cm[i], $t, 'csv', p.applyDefFmt, p.applyCustFmt ), p );
							k++;
						}
					}
					str += tmp.join( p.separator ) + p.newLine;
					j++;
				}
			}
			data1 = null; // free
			// get the column length.
			tmp = new Array(p.collen);
			if(p.includeCaption && $t.p.caption) {
				j=p.collen;
				while(--j) {tmp[j]="";}
				tmp[0] = $.jgrid.formatCellCsv( $t.p.caption, p );
				cap += tmp.join( p.separator ) + p.newLine;
			}
			if(p.includeGroupHeader && $($t).jqGrid('isGroupHeaderOn')) {
				var gh = $t.p.groupHeader;
				for (i=0;i < gh.length; i++) {
					var ghdata = gh[i].groupHeaders;
					j = 0; tmp = [];
					for(key=0; key<def.length; key++ ) {
						//if(!def.hasOwnProperty( key )) {
						//	continue;
						//}
						tmp[j] = '';
						for(k=0;k<ghdata.length;k++) {
							if(ghdata[k].startColumnName === def[key]) {
								tmp[j]= $.jgrid.formatCellCsv( ghdata[k].titleText, p);
							}
						}
						j++;
					}
					hdr += tmp.join( p.separator ) + p.newLine;
				}
			}
			var hlen, il;
			if(p.includeFooter && $t.p.footerrow) {
				// already formated
				hlen = $($t).jqGrid("footerData", "getlength");
				var frows, fc;
				for(il=0;il<hlen;il++) {
					frows = $($t).jqGrid("footerData", "get", null, false, il, false);
					i=0; tmp=[];
					while(i < p.collen){
						fc = def[i];
						if(frows.hasOwnProperty(fc) ) {
							tmp.push( $.jgrid.formatCellCsv( $.jgrid.stripHtml( frows[fc] ), p ) );
						}
						i++;
					}
					ftr += tmp.join( p.separator ) + p.newLine;
				}
			}
			if(p.includeHeader && $t.p.headerrow) {
				var hrows, hc;
				hlen = $($t).jqGrid("headerData", "getlength");
				for(il=0;il<hlen;il++) {
					hrows = $($t).jqGrid("headerData", "get", null, false, il, false);
				i=0; tmp=[];
				while(i < p.collen){
						hc = def[i];
					if(hrows.hasOwnProperty(hc) ) {
						tmp.push( $.jgrid.formatCellCsv( $.jgrid.stripHtml( hrows[hc] ), p ) );
					}
					i++;
				}
				htr += tmp.join( p.separator ) + p.newLine;
			}
			}
			ret = cap + hdr + lbl + htr + str + ftr;
			if( $.jgrid.isFunction( p.loadIndicator )) {
				p.loadIndicator.call($t,'hide');
			} else if(p.loadIndicator) {
				$($t).jqGrid("progressBar", {method:"hide", loadtype : $t.p.loadui });
			}
			if($.jgrid.isFunction( p.onBeforeExport) ) {
				ret = p.onBeforeExport.call($t,ret);
				if(!ret) {
					throw "Before export does not return data!";
				}
			}
			if (p.returnAsString) {
				//return ret;
			} else {
				// add BOM fix Excel
				if(p.mimetype.toUpperCase().indexOf("UTF-8") !== -1) {
					ret = '\ufeff' + ret;
				}
				$.jgrid.saveAs( ret, p.fileName, { type : p.mimetype });
			}
		});
		return ret;
	},
	/*
	 *
	 * @param object o - settings for the export
	 * @returns excel 2007 document
	 * The method requiere jsZip lib in order to create excel document
	 */
	exportToExcel : function ( o ) {
		o = $.extend(true, {
			includeLabels : true,
			includeGroupHeader : true,
			includeFooter: true,
			includeHeader: true,
			fileName : "jqGridExport.xlsx",
			mimetype : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			maxlength : 40, // maxlength for visible string data
			onBeforeExport : null,
			customizeData : null,
			replaceStr : null,
			treeindent : ' ',
			visibleTreeNodes : false,
			loadIndicator : true, // can be a function
			applyDefFmt : true,
			applyCustFmt : true
		}, o || {} );
		this.each(function() {
			var $t = this,
			es = $.jgrid.excelStrings,
			rowPos = 0,
			rels = $.parseXML( es['xl/worksheets/sheet1.xml']),
			relsGet = rels.getElementsByTagName( "sheetData" )[0],
			styleSh = $.parseXML( es['xl/styles.xml']), //xlsx.xl["styles.xml"];

			//= styleSh.getElementsByTagName("numFmts")[0],
			//celsX = styleSh.getElementsByTagName("cellXfs")[0],

			xlsx = {
				_rels: {
					".rels": $.parseXML( es['_rels/.rels'])
				},
				xl: {
					_rels: {
						"workbook.xml.rels": $.parseXML( es['xl/_rels/workbook.xml.rels'])
					},
					"workbook.xml": $.parseXML( es['xl/workbook.xml']),
					"styles.xml": styleSh, //$.parseXML( es['xl/styles.xml']),
					"worksheets": {
						"sheet1.xml": rels
					}
				},
				"[Content_Types].xml": $.parseXML( es['[Content_Types].xml'])
			},
			cm = $t.p.colModel,
			i=0, j, ien,
			data = {
				body  : $t.p.treeGrid ? $($t).jqGrid('getRowData', null, true, o.treeindent, o.visibleTreeNodes) : $t.addLocalData( true ),
				header : [],
				footer : [],
				width : [],
				map : [],
				parser :[],
				labels : [],
				hidden : [],
				mergecell:[]
			};
			var defaultHeaderStyle = $.jgrid.addExcelStyle( {excel_header_style:""}, {fontId :"2", applyAlignment : "1"} , {horizontal: "center", vertical :"center"}, styleSh).excel_header_style;
			for ( j=0, ien=cm.length ; j<ien ; j++ ) {
				cm[j]._expcol = true;
				if(cm[j].exportcol === undefined) {
					if(cm[j].hidden) {
						cm[j]._expcol = false;
					}
				} else {
					cm[j]._expcol = cm[j].exportcol;
				}
				if(cm[j]._colspancell === undefined) {
					cm[j]._colspancell = false;
				}
				if( $.jgrid.isServiceCol(cm[j].name) || !cm[j]._expcol ) {
					data.hidden.push(cm[j].name);
					continue;
				}
				data.header[i] = cm[j].name;
				data.width[ i ] = 5;
				data.map[i] = j;
				//data.parser[j] = $.jgrid.addExcelStyle( cm[j].hasOwnProperty('exportoptions') ? $.extend( {}, cm[j].exportoptions ) : {} );
				data.labels[i] = $t.p.colNames[j];
				if(cm[j].hasOwnProperty('exportoptions')) {
					var ef={}, ehf={};
					if(cm[j].exportoptions.excel_format) {
						ef = $.jgrid.addExcelStyle( { excel_format : cm[j].exportoptions.excel_format, excel_style : cm[j].exportoptions.excel_style || ""}, {}, {}, styleSh );
					}
					if(cm[j].exportoptions.excel_header_format) {
						ehf = $.jgrid.addExcelStyle( { excel_header_format : cm[j].exportoptions.excel_header_format, excel_header_style : cm[j].exportoptions.excel_header_style || ""}, {fontId:"2",applyAlignment:"1" },{horizontal:"center"}, styleSh );
					}
					data.parser[j] = $.extend (ef,ehf);
					if(cm[j].exportoptions.replace_format) {
						data.parser[j].replace_format = cm[j].exportoptions.replace_format;
					}
					if(cm[j].exportoptions.replace_header_format) {
						data.parser[j].replace_header_format = cm[j].exportoptions.replace_header_format;
					}
				} else {
					data.parser[j] =  { excel_parsers : true };
				}
				
				i++;
			}
			if ( o.includeFooter || $t.p.footerrow) {
				var dfl = $($t).jqGrid("footerData", "getlength"), dil, dfooter;
				for(dil=0; dil<dfl; dil++) {
					dfooter = $($t).jqGrid("footerData", "get", null, false, dil, false);
					for( i in dfooter) {
						if(dfooter.hasOwnProperty(i)) {
							dfooter[i] = $.jgrid.stripHtml(dfooter[i]);
					}
				}
					data.footer.push( dfooter);
			}
			}
			if( $.jgrid.isFunction(o.customizeData) ) {
				o.customizeData.call($t, data);
			}
			function _replStrFunc (v) {
				return v.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')
						.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
			}
			function _makeCellSpecial ( p, v ) {
				return $.jgrid.makeNode(
						rels,
						'c',
						{
							attr: p,
							children: [	$.jgrid.makeNode( rels, 'v', { text: v } ) ]
						});
			}
			function _makeCellFunction ( p, v ) {
				return $.jgrid.makeNode(
						rels,
						'c',
						{
							attr: p,
							children: [	$.jgrid.makeNode( rels, 'f', { text: v } ) ]
						});
			}
			function _makeCellString ( cellId, text, estyle ) {
				if( estyle === undefined) {
					estyle = 68;
				}
				return $.jgrid.makeNode(
						rels,
						'c',
						{
							attr: { t: 'inlineStr', r: cellId, s: estyle },
							children:{ row: $.jgrid.makeNode( rels, 'is',
								{
									children: {
										row: $.jgrid.makeNode( rels, 't', {	text: text} )
									}
								})
							}
						} );
			}
			function linkParse(strLinkHTML) {
				var oDiv, oNode;

				(oDiv = document.createElement('div')).innerHTML = strLinkHTML;
				oNode = oDiv.firstChild;
				if(oNode.nodeName === 'A' ) {
					return [oNode.href,oNode.text];
				} else if (oNode.nodeName === '#text') {
					return [oNode.textContent,oNode.textContent];
				}
				return false;

			}

			var _replStr = $.jgrid.isFunction(o.replaceStr) ? o.replaceStr : _replStrFunc,
			currentRow, rowNode,
			addRow = function ( row, header, labels, skipfirstcol ) {
				if(labels===undefined) {
					labels = false;
				}
				if(skipfirstcol===undefined) {
					skipfirstcol = false;
				}
				currentRow = rowPos+1;
				rowNode = $.jgrid.makeNode( rels, "row", { attr: {r:currentRow} } );
				var maxieenum = 15, text, omit;
				for ( var i =0; i < data.header.length; i++) {
					// key = cm[i].name;
					// Concat both the Cell Columns as a letter and the Row of the cell.
					var cellId = $.jgrid.excelCellPos(i) + '' + currentRow,
					cell,
					match,
					v= (Array.isArray(row) && header) ? data.labels[i] : $.jgrid.getAccessor( row,  data.header[i] );
					if ( v == null ) {
						v = '';
					}
					if(!header) {
						omit = (i===0 && skipfirstcol);
						v = omit || (skipfirstcol && v==='') ? v : $.jgrid.formatCell( v, data.map[i], row, cm[data.map[i]], $t, 'excel', o.applyDefFmt, o.applyCustFmt);
						// convert whitespace from formatter to empty string
						if(v && (v==='&nbsp;' || v==='&#160;' || (v.length===1 && v.charCodeAt(0)===160))) { 
							v = '';
						}
					}
					data.width[i] = Math.max(data.width[i], Math.min(parseInt(v.toString().length,10), o.maxlength) );
					cell = null;
					var expo = data.parser[data.map[i]];
					if( header && labels) {
						if(expo.replace_header_format) {
							v = expo.replace_header_format(v);
						}
						if(expo.excel_header_style !== undefined) {
							if(expo.excel_header_style === 'text') {
								cell = _makeCellString( cellId, v);
							} else if (expo.excel_header_style <= 55) { 
								cell = _makeCellString( cellId, v, expo.excel_header_style);
								//cell = _makeCellSpecial( {r: cellId,s: expo.excel_style}, v );
							} else {
								cell = _makeCellSpecial( {r: cellId,s: expo.excel_header_style}, v );
							}
						} else {
							cell = _makeCellString( cellId, v, defaultHeaderStyle);
						}
						rowNode.appendChild( cell );
					} else if( expo.excel_parsers === true && !cell) {
						for ( var j=0, jen=$.jgrid.excelParsers.length ; j<jen ; j++ ) {
							var special = $.jgrid.excelParsers[j];

							if ( v.match && ! v.match(/^0\d+/) && v.match( special.match ) ) {
								var a = v;
								v = v.replace(/[^\d\.\-]/g, '');
								if ( special.fmt ) {
									v = special.fmt( v );
								}
								if(special.style === 67) { //Dates
									cell = _makeCellSpecial( { t: 'd', r: cellId, s: special.style }, v);
								}  else if(special.style === 4) { // hyperlink
									v = linkParse (a);
									if(v) {
										cell = _makeCellFunction( { t: 'str', r: cellId, s: special.style }, 'HYPERLINK(\"'+v[0]+'\",\"'+v[1]+'\")');
									} else {
										cell = _makeCellString( cellId, a);
									}
								} else {
									if(  $.inArray( special.style, ["63", "64", "65", "66"]) ) { // Numbers

										if( v.toString().length > maxieenum ) {
											text = ! a.replace ? a : _replStr(a);
											cell = _makeCellString( cellId, text);
											rowNode.appendChild( cell );
											break;
										}
									}
									cell = _makeCellSpecial( { r: cellId,s: special.style}, v );
								}
								rowNode.appendChild( cell );
								break;
							}
						}
					} else if( expo.excel_style !== undefined  && !header && !cell) {
						if(expo.replace_format) {
							v = expo.replace_format(v);
						}
						if(expo.excel_style === 'text') {
							cell = _makeCellString( cellId, v);
						} else if (expo.excel_style <= 55) { 
							cell = _makeCellString( cellId, v, expo.excel_style);
							//cell = _makeCellSpecial( {r: cellId,s: expo.excel_style}, v );
						} else {
						cell = _makeCellSpecial( {r: cellId,s: expo.excel_style}, v );
						}
						rowNode.appendChild( cell );
					}
					if( ! cell ) {
						// Detect numbers - don't match numbers with leading zeros or a negative
						if(v.match) {
							match = v.match(/^-?([1-9]\d+)(\.(\d+))?$/);
						}
						if ( (typeof v === 'number' && v.toString().length <= maxieenum) || (
								match &&
								(match[1].length + (match[2] ? match[3].length : 0) <= maxieenum))
						) {
							cell = _makeCellSpecial( {t: 'n', r: cellId }, v );
						} else {
							// Replace non standard characters for text output
							text = ! v.replace ? v : _replStr(v);
							cell = _makeCellString( cellId, text);
						}
						rowNode.appendChild( cell );
					}
				}
				relsGet.appendChild(rowNode);
				rowPos++;
			};
//=========================================================================
			function groupToExcel ( grdata ) {
				var grp = $t.p.groupingView,
				cp=[], len =grp.groupField.length,
				colspans = cm.length,
				toEnd = 0;
					$.each(cm, function (i,n){
					var ii;
					for(ii=0;ii<len;ii++) {
						if(grp.groupField[ii] === n.name ) {
							cp[ii] = i;
							break;
						}
					}
				});
				function findGroupIdx( ind , offset, grp) {
					var ret = false, i;
					if(offset===0) {
						ret = grp[ind];
					} else {
						var id = grp[ind].idx;
						if(id===0) {
							ret = grp[ind];
						}  else {
							for(i=ind;i >= 0; i--) {
								if(grp[i].idx === id-offset) {
									ret = grp[i];
									break;
								}
							}
						}
					}
					return ret;
				}
				function buildSummaryTd(i, ik, grp, foffset) {
					var fdata = findGroupIdx(i, ik, grp),
					//cm = $t.p.colModel,
					vv, grlen = fdata.cnt, k, retarr = emptyData(data.header);
					for(k=foffset; k<colspans;k++) {
						if(!cm[k]._expcol) {
							continue;
						}
						var tplfld = "{0}";
						$.each(fdata.summary,function(){
							if(this.nm === cm[k].name) {
								if(cm[k].summaryTpl)  {
									tplfld = cm[k].summaryTpl;
								}
								vv = this.v;
								if(typeof this.st === 'string' && this.st.toLowerCase() === 'avg') {
									if(this.sd && this.vd) {
										vv = (this.v/this.vd);
									} else if(this.v && grlen > 0) {
										vv = (this.v/grlen);
									}
								}
								try {
									this.groupCount = fdata.cnt;
									this.groupIndex = fdata.dataIndex;
									this.groupValue = fdata.value;
									//vv = $t.formatter('', this.v, k, this);
									//vv = this.v;
								} catch (ef) {
									vv = this.v;
								}
								retarr[this.nm] = $.jgrid.stripHtml( $.jgrid.template(tplfld,vv) );
								return false;
							}
						});
					}
					return retarr;
				}
				function emptyData ( d ) {
					var clone = {};
					for(var key=0;key<d.length; key++ ) {
						clone[ d[key] ] = "";
					}
					return clone;
				}
				var sumreverse = $.makeArray(grp.groupSummary), gv;
				sumreverse.reverse();
				if($t.p.datatype === 'local' && !$t.p.loadonce) {
					$($t).jqGrid('groupingSetup');
					var groupingPrepare = $.jgrid.getMethod("groupingPrepare");
					for(var ll=0; ll < data.body.length; ll++) {
						groupingPrepare.call($($t), data.body[ll], ll);
					}
				}
				$.each(grp.groups,function(i,n){
					toEnd++;
					try {
						if (Array.isArray(grp.formatDisplayField) && $.jgrid.isFunction(grp.formatDisplayField[n.idx])) {
							gv = grp.formatDisplayField[n.idx].call($t, n.displayValue, n.value, $t.p.colModel[cp[n.idx]], n.idx, grp);
						} else {
							gv = $t.formatter('', n.displayValue, cp[n.idx], n.value );
						}
					} catch (egv) {
						gv = n.displayValue;
					}
					var grpTextStr = '';
					if($.jgrid.isFunction(grp.groupText[n.idx])) {
						grpTextStr = grp.groupText[n.idx].call($t, gv, n.cnt, n.summary);
					} else {
						grpTextStr = $.jgrid.template(grp.groupText[n.idx], gv, n.cnt, n.summary);
					}
					if( !(typeof grpTextStr ==='string' || typeof grpTextStr ==='number' ) ) {
						grpTextStr = gv;
					}
					var arr;
					if(grp.groupSummaryPos[n.idx] === 'header')  {
						arr = buildSummaryTd(i, 0, grp.groups, 0 /*grp.groupColumnShow[n.idx] === false ? (mul ==="" ? 2 : 3) : ((mul ==="") ? 1 : 2)*/ );
					} else {
						arr = emptyData(data.header);
					}
					var fkey = Object.keys(arr);
					arr[fkey[0]] = $.jgrid.stripHtml( new Array(n.idx*5).join(' ') + grpTextStr );
					addRow( arr, false, false, true );
					var leaf = len-1 === n.idx;
					if( leaf ) {
						var gg = grp.groups[i+1], kk, ik, offset = 0, sgr = n.startRow,
						end = gg !== undefined ?  gg.startRow : grp.groups[i].startRow + grp.groups[i].cnt;
						for(kk=sgr;kk<end;kk++) {
							if(!grdata[kk - offset]) { break; }
							var to = grdata[kk - offset];
							addRow( to, false );
						}

						if(grp.groupSummaryPos[n.idx] !== 'header') {
							var jj;
							if (gg !== undefined) {
								for (jj = 0; jj < grp.groupField.length; jj++) {
									if (gg.dataIndex === grp.groupField[jj]) {
										break;
									}
								}
								toEnd = grp.groupField.length - jj;
							}
							for (ik = 0; ik < toEnd; ik++) {
								if(!sumreverse[ik]) { continue; }
								arr = buildSummaryTd(i, ik, grp.groups, 0);
								addRow( arr, false, false, true );
							}
							toEnd = jj;
						}
					}
				});
			}
//============================================================================
			if( $.jgrid.isFunction( o.loadIndicator )) {
				o.loadIndicator.call($t, 'show');
			} else if(o.loadIndicator) {
				$($t).jqGrid("progressBar", {method:"show", loadtype : $t.p.loadui, htmlcontent: $.jgrid.getRegional($t,'defaults.loadtext') });
			}
			$( 'sheets sheet', xlsx.xl['workbook.xml'] ).attr( 'name', o.sheetName );
			var mrow =0,  gh , mergecell=[],key, l, clone ={}, ind, ghdata, start, end;
			if(o.includeGroupHeader && $($t).jqGrid('isGroupHeaderOn') ) {
				gh = $t.p.groupHeader;
				for (l = 0; l < gh.length; l++) {
					ghdata = gh[l].groupHeaders;
					var colspan = gh[l].useColSpanStyle && gh.length === 1, colToSkip=[],
					ghputin = [], colInHeader = [], k, nok, cpos, fk;
					mrow++;
					// column to skip
					if(colspan) {
						for(k = 0; k < ghdata.length; k++) {
							key = ghdata[k].startColumnName;
							nok = ghdata[k].numberOfColumns;
							cpos = $.jgrid.getElemByAttrVal (cm,  'name', key, true) ;
							for(fk = cpos; fk < cpos + ghdata[k].numberOfColumns;fk++) {
								colInHeader[cm[fk].name] = key;
								ind = data.header.indexOf(cm[fk].name);
								if(  ind !== -1) {
									colToSkip.push(ind);
								}
							}
						}
					}
					
					for(j = 0; j < data.header.length; j++  ) {
						key = data.header[j];
						clone[key] = colspan ? data.labels[j] : "";
						start = -1; end = -1;
						for(k = 0; k < ghdata.length; k++) {
							if(ghdata[k].startColumnName === key) {
								ghputin.push(key);
								clone[key] = ghdata[k].titleText;
								nok = ghdata[k].numberOfColumns;
								cpos = $.jgrid.getElemByAttrVal (cm,  'name', key, true) ;
								for(fk = cpos; fk < cpos + ghdata[k].numberOfColumns;fk++) {
									if(cm[fk].hidden === true) {
										nok--;
									}
								}
								start = $.jgrid.excelCellPos(j) + mrow;
								end = $.jgrid.excelCellPos(j+ nok - 1) + mrow;

								mergecell.push({ ref: start+":"+end });
									}
								}
						if(start === -1 && end === -1 && colspan && colToSkip.indexOf(j) === -1) {
							start = $.jgrid.excelCellPos(j) + mrow;
							end = $.jgrid.excelCellPos(j) + (mrow + 1);
							mergecell.push({ ref: start+":"+end });
						}
					}
					// we are lost - need to find way					
					if(ghputin.length < ghdata.length) {
						for(k=0;k < data.hidden.length;k++) {
							var icol = $.jgrid.inColumnHeader(data.hidden[k], ghdata);
							// if hidden startColumnName 
							if(icol >= 0 ) {
								key = data.hidden[k];
								for(var key2 in colInHeader) {
									if(colInHeader[key2] === key) {
										if(clone[key2]) { // first visible in group
											clone[key2] = ghdata[icol].titleText;
											ind  = data.header.indexOf(key2);
											nok = ghdata[icol].numberOfColumns;
											cpos = $.jgrid.getElemByAttrVal (cm,  'name', key, true) ;
											for(fk = cpos; fk < cpos + ghdata[icol].numberOfColumns;fk++) {
												if(cm[fk].hidden === true) {
													nok--;
												}
											}
											start = $.jgrid.excelCellPos(ind) + mrow;
											end = $.jgrid.excelCellPos(ind+ nok - 1) + mrow;
											mergecell.push({ ref: start+":"+end });
											break;
										}
									}
								}
							}
						}
					}					
					addRow( clone, true, true );
				}

				//$('row c', rels).attr( 's', defaultHeaderStyle ); // bold

					}
			if ( o.includeLabels ) {
				if($t.p.colSpanHeader.length) {
					mrow++; gh = $t.p.colSpanHeader; clone ={};
					for(j = 0; j < data.header.length; j++  ) {
						key = data.header[j];
						clone[key] =  data.labels[j];
						for (l = 0; l < gh.length; l++) {
							ghdata = gh[l];
							if(ghdata.startColumnName === key) {
								clone[key] = ghdata.titleText;
								start = $.jgrid.excelCellPos(j) + mrow;
								end = $.jgrid.excelCellPos(j+ghdata.numberOfColumns -1) + mrow;
								mergecell.push({ ref: start+":"+end });
							}
						}
					}
					addRow( clone, true, true );
				} else {
				addRow( data.header, true, true );
				}
			
				//$('row', rels).last().find('c').attr( 's', '2' ); // bold
			}
			if (data.mergecell.length) {
			  mergecell = mergecell.concat(data.mergecell);
			}
			if(mergecell.length) {
				var merge = $.jgrid.makeNode( rels, 'mergeCells', {
					attr : {
						count : mergecell.length
					}
				});
				$('worksheet', rels).append( merge );
				for(i=0;i<mergecell.length;i++) {
					merge.appendChild($.jgrid.makeNode(rels, 'mergeCell',{
						attr:  mergecell[i]
					}));
				}
			}
			if ( o.includeHeader || $t.p.headerrow) {
				var hlen = $($t).jqGrid("headerData", "getlength"), il, hdata;
				for(il=0; il < hlen; il++) {
					hdata = $($t).jqGrid("headerData", "get", null, false, il, false);
				for( i in hdata) {
					if(hdata.hasOwnProperty(i)) {
						hdata[i] = $.jgrid.stripHtml(hdata[i]);
					}
				}
				if(!$.isEmptyObject(hdata)) {
					addRow( hdata, true );
					$('row', rels).last().find('c').attr( 's', '2' ); // bold
				}
			}
			}
			if( $t.p.grouping ) {
				var savlcgr = $t.p.groupingView._locgr ? true : false;
				$t.p.groupingView._locgr = false;
				groupToExcel(data.body);
				$t.p.groupingView._locgr = savlcgr;
			} else {
				for ( var n=0, ie=data.body.length ; n<ie ; n++ ) {
					addRow( data.body[n], false );
				}
			}
			if ( o.includeFooter || $t.p.footerrow) {
				if(!$.isEmptyObject(data.footer)) {
					if(Array.isArray(data.footer)) {
						for(var n=0;n<data.footer.length;n++) {
							addRow( data.footer[n], true );
							$('row', rels).last().find('c').attr( 's', '2' ); // bold
						}
					} else {
						addRow( data.footer, true );
						$('row', rels).last().find('c').attr( 's', '2' ); // bold						
					}
				}
			}

			// Set column widths
			var cols = $.jgrid.makeNode( rels, 'cols' );
			$('worksheet', rels).prepend( cols );

			for ( i=0, ien=data.width.length ; i<ien ; i++ ) {
				cols.appendChild( $.jgrid.makeNode( rels, 'col', {
					attr: {
						min: i+1,
						max: i+1,
						width: data.width[i],
						customWidth: 1
					}
				} ) );
			}
			if($.jgrid.isFunction( o.onBeforeExport) ) {
				o.onBeforeExport.call($t, xlsx, rowPos );
			}
			data = null; // free memory
			try {
				var zip = new JSZip();
				var zipConfig = {
					type: 'blob',
					mimeType: o.mimetype
				};
				$.jgrid.xmlToZip( zip, xlsx );
				if ( zip.generateAsync ) {
					// JSZip 3+
					zip.generateAsync( zipConfig )
					.then( function ( blob ) {
						$.jgrid.saveAs( blob, o.fileName, { type : o.mimetype } );
					});
				} else {
					// JSZip 2.5
					$.jgrid.saveAs( zip.generate( zipConfig ), o.fileName, { type : o.mimetype } );				}
			} catch(e) {
				throw e;
			} finally {
				if( $.jgrid.isFunction( o.loadIndicator )) {
					o.loadIndicator.call($t, 'hide');
				} else if(o.loadIndicator) {
					$($t).jqGrid("progressBar", {method:"hide", loadtype : $t.p.loadui });
				}
			}
		});
	},
	exportToPdf : function (o) {
		o = $.extend(true,{
			title: null,
			orientation: 'portrait',
			pageSize: 'A4',
			description: null,
			onBeforeExport: null,
			download: 'download',
			includeLabels : true,
			includeGroupHeader : true,
			includeFooter : true,
			includeHeader : true,
			fileName : "jqGridExport.pdf",
			mimetype : "application/pdf",
			treeindent : "-",
			visibleTreeNodes : false,
			centerTableOnPage : false,
			loadIndicator : true, // can be a function
			applyDefFmt : true,
			applyCustFmt : true

		}, o || {} );
		return this.each(function() {
			var $t = this, rows = [], j, cm = $t.p.colModel, ien, obj = {}, key,
			data = $t.p.treeGrid ? $($t).jqGrid('getRowData', null, true, o.treeindent, o.visibleTreeNodes) : $t.addLocalData( true ),  def = [], i=0, map=[], test=[], widths = [],  align={};
// Group function
			function groupToPdf ( grdata ) {
				var grp = $t.p.groupingView,
				cp=[], len =grp.groupField.length,
				cm = $t.p.colModel,
				colspans = cm.length,
				toEnd = 0;

				$.each(cm, function (i,n){
					var ii;
					for(ii=0;ii<len;ii++) {
						if(grp.groupField[ii] === n.name ) {
							cp[ii] = i;
							break;
						}
					}
				});

				function constructRow( row, fmt, skipfirstcol ) {
					var k =0, test=[], ommit, val;
					if(skipfirstcol === undefined ) {
						skipfirstcol = false;
					}
					//row = data[i];
					for( var key=0; key < def.length; key++ ) {
						ommit = !(key === 0 && skipfirstcol);// ? false : true;
						val = row[def[key]];
						obj = {
							text: fmt && ommit ? $.jgrid.formatCell( val + '', map[k], data[i], cm[map[k]], $t, 'pdf', o.applyDefFmt, o.applyCustFmt) : val,
							alignment : align[key],
							style : 'tableBody'
						};
						test.push(obj);
						k++;
					}
					return test;
				}

				function findGroupIdx( ind , offset, grp) {
					var ret = false, i;
					if(offset===0) {
						ret = grp[ind];
					} else {
						var id = grp[ind].idx;
						if(id===0) {
							ret = grp[ind];
						}  else {
							for(i=ind;i >= 0; i--) {
								if(grp[i].idx === id-offset) {
									ret = grp[i];
									break;
								}
							}
						}
					}
					return ret;
				}

				function buildSummaryTd(i, ik, grp, foffset) {
					var fdata = findGroupIdx(i, ik, grp),
					//cm = $t.p.colModel,
					vv, grlen = fdata.cnt, k, retarr = emptyData(def);
					for(k=foffset; k<colspans;k++) {
						if(!cm[k]._expcol) {
							continue;
						}
						var tplfld = "{0}";
						$.each(fdata.summary,function(){
							if(this.nm === cm[k].name) {
								if(cm[k].summaryTpl)  {
									tplfld = cm[k].summaryTpl;
								}
								vv = this.v;
								if(typeof this.st === 'string' && this.st.toLowerCase() === 'avg') {
									if(this.sd && this.vd) {
										vv = (this.v/this.vd);
									} else if(this.v && grlen > 0) {
										vv = (this.v/grlen);
									}
								}
								try {
									this.groupCount = fdata.cnt;
									this.groupIndex = fdata.dataIndex;
									this.groupValue = fdata.value;
									//vv = this.v;
								} catch (ef) {
									vv = this.v;
								}
								retarr[this.nm] = $.jgrid.stripHtml( $.jgrid.template(tplfld,vv) );
								return false;
							}
						});
					}
					return retarr;
				}

				function emptyData ( d ) {
					var clone = {};
					for(var key = 0; key< d.length; key++ ) {
						clone[d[key]] = "";
					}
					return clone;
				}

				var sumreverse = $.makeArray(grp.groupSummary), gv;
				sumreverse.reverse();
				if($t.p.datatype === 'local' && !$t.p.loadonce) {
					$($t).jqGrid('groupingSetup');
					var groupingPrepare = $.jgrid.getMethod("groupingPrepare");
					for(var ll=0; ll < data.length; ll++) {
						groupingPrepare.call($($t), data[ll], ll);
					}
				}
				$.each(grp.groups,function(i,n){
					toEnd++;
					try {
						if (Array.isArray(grp.formatDisplayField) && $.jgrid.isFunction(grp.formatDisplayField[n.idx])) {
							gv = grp.formatDisplayField[n.idx].call($t, n.displayValue, n.value, $t.p.colModel[cp[n.idx]], n.idx, grp);
						} else {
							gv = $t.formatter('', n.displayValue, cp[n.idx], n.value );
						}
					} catch (egv) {
						gv = n.displayValue;
					}
					var grpTextStr = '';
					if($.jgrid.isFunction(grp.groupText[n.idx])) {
						grpTextStr = grp.groupText[n.idx].call($t, gv, n.cnt, n.summary);
					} else {
						grpTextStr = $.jgrid.template(grp.groupText[n.idx], gv, n.cnt, n.summary);
					}
					if( !(typeof grpTextStr ==='string' || typeof grpTextStr ==='number' ) ) {
						grpTextStr = gv;
					}
					var arr;
					if(grp.groupSummaryPos[n.idx] === 'header')  {
						arr = buildSummaryTd(i, 0, grp.groups, 0 /*grp.groupColumnShow[n.idx] === false ? (mul ==="" ? 2 : 3) : ((mul ==="") ? 1 : 2)*/ );
					} else {
						arr = emptyData(def);
					}
					var fkey = Object.keys(arr);
					arr[fkey[0]] = $.jgrid.stripHtml( new Array(n.idx*5).join(' ') + grpTextStr );
					rows.push( constructRow (arr, true, true) );
					var leaf = len-1 === n.idx;
					if( leaf ) {
						var gg = grp.groups[i+1], kk, ik, offset = 0, sgr = n.startRow,
						end = gg !== undefined ?  gg.startRow : grp.groups[i].startRow + grp.groups[i].cnt;
						for(kk=sgr;kk<end;kk++) {
							if(!grdata[kk - offset]) { break; }
							var to = grdata[kk - offset];
							rows.push( constructRow (to, true) );
						}

						if(grp.groupSummaryPos[n.idx] !== 'header') {
							var jj;
							if (gg !== undefined) {
								for (jj = 0; jj < grp.groupField.length; jj++) {
									if (gg.dataIndex === grp.groupField[jj]) {
										break;
									}
								}
								toEnd = grp.groupField.length - jj;
							}
							for (ik = 0; ik < toEnd; ik++) {
								if(!sumreverse[ik]) { continue; }
								arr = buildSummaryTd(i, ik, grp.groups, 0);
								rows.push( constructRow (arr, true, true) );
							}
							toEnd = jj;
						}
					}
				});
			}
//============================================================================
			if( $.jgrid.isFunction( o.loadIndicator )) {
				o.loadIndicator.call($t, 'show');
			} else if(o.loadIndicator) {
				$($t).jqGrid("progressBar", {method:"show", loadtype : $t.p.loadui, htmlcontent: $.jgrid.getRegional($t,'defaults.loadtext') });
			}
			var k;
			for ( j=0, ien=cm.length ; j<ien ; j++ ) {
				cm[j]._expcol = true;
				if(cm[j].exportcol === undefined ) {
					if(cm[j].hidden) {
						cm[j]._expcol = false;
					}
				} else {
					cm[j]._expcol = cm[j].exportcol;
				}
				if( $.jgrid.isServiceCol(cm[j].name)  || !cm[j]._expcol ) {
					continue;
				}
				obj = { text:  $t.p.colNames[j], style: 'tableHeader' };
				test.push( obj );
				def[i]  = cm[j].name;
				map[i] = j;
				widths.push(cm[j].width);
				align[cm[j].name] = cm[j].align || 'left';
				i++;
			}
			var gh, clone;
			if(o.includeGroupHeader && $($t).jqGrid('isGroupHeaderOn') ) {
				gh = $t.p.groupHeader;
				for (i=0;i < gh.length; i++) {
					clone = [];
					var ghdata = gh[i].groupHeaders,
					colSpan = gh[i].useColSpanStyle;
					for(key=0; key < cm.length; key++ ) {
						/*
						if(colSpan) {
							obj = {text: $t.p.colNames[key], style: 'tableHeader', rowSpan : 2, verticalAlign : "center"};
						} else {
							obj = {text:'', style: 'tableHeader'};
						}
						*/
						var put_me = true;
						if( $.jgrid.isServiceCol( cm[key].name ) || !cm[key]._expcol ) {
							put_me = false;
						} else {
							if(colSpan) {
								obj = {text: $t.p.colNames[key], style: 'tableHeader', rowSpan : 2, verticalAlign : "center"};
							} else {
								obj = {text:'', style: 'tableHeader'};
							}		
						}
						for(k=0;k<ghdata.length;k++) {
							if(ghdata[k].startColumnName === cm[key].name) {
								var nok = ghdata[k].numberOfColumns;
								for(var fk = key; fk<key+ghdata[k].numberOfColumns;fk++) {
									if(cm[fk].hidden === true) {
										nok--;
									}
								}
								obj = {
									text : ghdata[k].titleText,
									colSpan: nok, /*ghdata[k].numberOfColumns,*/
									style: 'tableHeader'
								};
								if(put_me===false && nok >0) {
									put_me = true;
									key=key+(ghdata[k].numberOfColumns-nok);
								}
							}
						}
						if(put_me) {
							clone.push(obj);
						}
						//j++;
					}
					rows.push(clone);
				}
			}

			if(o.includeLabels) {
				if($t.p.colSpanHeader.length) {
					gh = $t.p.colSpanHeader;
					clone = [];
					for(key=0; key < def.length; key++ ) {
						obj = {text: $t.p.colNames[key], style: 'tableHeader', verticalAlign : "center"};
						for(k=0;k<gh.length;k++) {
							if(gh[k].startColumnName === def[key]) {
								obj = {
									text : gh[k].titleText,
									colSpan: gh[k].numberOfColumns,
									style: 'tableHeader'
								};
							}
						}
						clone.push(obj);
						j++;
					}
					rows.push( clone );
				} else { 
				rows.push( test );
			}
			}
			var hlen, il;
			if ( o.includeHeader && $t.p.headerrow) {
				var hdata;
				hlen = $($t).jqGrid("headerData", "getlength");
				for(il=0; il < hlen; il++) {
					hdata = $($t).jqGrid("headerData", "get", null, false, il, false);
				test=[];
				for( key =0; key< def.length; key++) {
					obj  =  {
						text : $.jgrid.stripHtml( $.jgrid.getAccessor(hdata, def[key]) ),
						style : 'tableFooter',
						alignment : align[def[key]]
					};
					test.push( obj );
				}
				rows.push( test );
			}
			}
			if($t.p.grouping) {
				var savlcgr = $t.p.groupingView._locgr ? true : false;
				$t.p.groupingView._locgr = false;
				groupToPdf(data);
				$t.p.groupingView._locgr = savlcgr;
			} else {
				var row;
				for ( i=0, ien=data.length ; i<ien ; i++ ) {
					k =0;
					test=[];
					row = data[i];
					for( key = 0;key < def.length; key++ ) {
						obj	= {
							text: $.jgrid.stripHtml($.jgrid.formatCell( $.jgrid.getAccessor(row, def[key]) + '', map[k], data[i], cm[map[k]], $t, 'pdf', o.applyDefFmt, o.applyCustFmt)),
							alignment : align[def[key]],
							style : 'tableBody'
						};
						test.push(obj);
						k++;
					}
					rows.push(test);
				}
			}

			if ( o.includeFooter && $t.p.footerrow) {
				hlen = $($t).jqGrid("footerData", "getlength");
				for(il=0; il < hlen; il++) {				
					var fdata = $($t).jqGrid("footerData", "get", null, false, il, false);
				test=[];
				for( key =0; key< def.length; key++) {
					obj  =  {
						text : $.jgrid.stripHtml( $.jgrid.getAccessor(fdata, def[key]) ),
						style : 'tableFooter',
						alignment : align[def[key]]
					};
					test.push( obj );
				}
				rows.push( test );
			}
			}
			var tblcnt = {
				style : 'tableExample',
				widths : widths,
				table: {
					headerRows: (gh!=null) ? 0 : 1,
					body: rows
				}
			};
			if(o.centerTableOnPage) {
				tblcnt = {
					columns : [
						{ width: '*', text: '' },
					{
						style : 'tableExample',
							width: 'auto',
						widths : widths,
						table: {
							headerRows: (gh!=null) ? 0 : 1,
							body: rows
							},
							alignment: "center"
						},
						{ width: '*', text: '' }
					]
				};
			}
			var doc = {
				pageSize: o.pageSize,
				pageOrientation: o.orientation,
				content: [ tblcnt ],
				styles: {
					tableHeader: {
						bold: true,
						fontSize: 11,
						color: '#2e6e9e',
						fillColor: '#dfeffc',
						alignment: 'center'
					},
					tableBody: {
						fontSize: 10
					},
					tableFooter: {
						bold: true,
						fontSize: 11,
						color: '#2e6e9e',
						fillColor: '#dfeffc'
					},
					title: {
						alignment: 'center',
						fontSize: 15
					},
					description: {}
				},
				defaultStyle: {
					fontSize: 10
				}
			};
			if ( o.description ) {
				doc.content.unshift( {
					text: o.description,
					style: 'description',
					margin: [ 0, 0, 0, 12 ]
				} );
			}

			if ( o.title ) {
				doc.content.unshift( {
					text: o.title,
					style: 'title',
					margin: [ 0, 0, 0, 12 ]
				} );
			}
			if( $.jgrid.isFunction( o.onBeforeExport ) ) {
				o.onBeforeExport.call($t, doc);
			}
			try {
				var pdf = pdfMake.createPdf( doc );
				pdf.getDataUrl(function(url) {
					if( $.jgrid.isFunction( o.loadIndicator )) {
						o.loadIndicator.call($t, 'hide');
					} else if(o.loadIndicator) {
						$($t).jqGrid("progressBar", {method:"hide", loadtype : $t.p.loadui });
					}
				});
				if ( o.download === 'open' ) {
					pdf.open();
				} else {
					pdf.getBuffer( function (buffer) {
						$.jgrid.saveAs( buffer, o.fileName, {type: o.mimetype } );
					} );
				}

			} catch(e) {
				throw e;
			}
		});
	},
	exportToHtml : function ( o ) {
		o = $.extend(true,{
			title: '',
			onBeforeExport: null,
			includeLabels : true,
			includeGroupHeader : true,
			includeFooter: true,
			includeHeader: true,
			tableClass : 'jqgridprint',
			autoPrint : false,
			topText : '',
			bottomText : '',
			returnAsString : false,
			treeindent : '&nbsp;',
			visibleTreeNodes : false,
			loadIndicator : true, // can be a function
			applyDefFmt : true,
			applyCustFmt : true
		}, o || {} );
		var ret;
		this.each(function() {
			var $t = this,
			cm = $t.p.colModel,
			i=0, j, ien, //obj={},
			data = {
				body  : $t.p.treeGrid ? $($t).jqGrid('getRowData', null, true, o.treeindent, o.visibleTreeNodes) : $t.addLocalData( true ),
				header : [],
				footer : [],
				width : [],
				map : [],
				align:[]
			};
			for ( j=0, ien=cm.length ; j<ien ; j++ ) {
				cm[j]._expcol = true;
				if(cm[j].exportcol === undefined) {
					if(cm[j].hidden) {
						cm[j]._expcol = false;
					}
				} else {
					cm[j]._expcol = cm[j].exportcol;
				}
				if( cm[j].name === 'cb' || cm[j].name === 'rn' ||  cm[j].name === 'subgrid' || cm[j].name === 'sc' || !cm[j]._expcol) {
					continue;
				}
				data.header[i] = cm[j].name;
				data.width[ i ] = cm[j].width;
				data.map[i] = j;
				data.align[i] = cm[j].align || 'left';
				i++;
			}

			var _link = document.createElement( 'a' );

			var _styleToAbs = function( el ) {
				var clone = $(el).clone()[0];

				if ( clone.nodeName.toLowerCase() === 'link' ) {
					clone.href = _relToAbs( clone.href );
				}

				return clone.outerHTML;
			};

			var _relToAbs = function( href ) {
				// Assign to a link on the original page so the browser will do all the
				// hard work of figuring out where the file actually is
				_link.href = href;
				var linkHost = _link.host;

				// IE doesn't have a trailing slash on the host
				// Chrome has it on the pathname
				if ( linkHost.indexOf('/') === -1 && _link.pathname.indexOf('/') !== 0) {
					linkHost += '/';
				}

				return _link.protocol+"//"+linkHost+_link.pathname+_link.search;
			};

			var addRow = function ( d, tag , style ) {
				var str = '<tr>', stl;
				for ( var i=0, ien=d.length ; i<ien ; i++ ) {
					stl = (style === true ? " style=width:"+data.width[i]+"px;":"");
					str += '<'+tag+stl+'>'+$t.p.colNames[data.map[i]]+'</'+tag+'>';
				}

				return str + '</tr>';
			};
			var addBodyRow = function ( d, tag, frm, style, colsp) {
				var str = '<tr>', f, stl;
				//style = true;

				for ( var i=0, ien = data.header.length; i< ien; i++ ) {
					if(colsp) {
						stl = ' colspan= "'+ (data.header.length) +'"' + " style=text-align:left";
					} else {
						stl = (style === true ? " style=width:"+data.width[i]+"px;text-align:"+data.align[i]+";" : " style=text-align:"+data.align[i]+";");
					}
					f= data.header[i];
					if (d.hasOwnProperty(f) ) {
						str += '<'+tag+stl+'>'+ (frm ? $.jgrid.formatCell( $.jgrid.getAccessor( d, f ), data.map[i], d, cm[data.map[i]], $t, 'html', o.applyDefFmt, o.applyCustFmt) : d[f])+'</'+tag+'>';
					}
					if(colsp) {
						break;
					}
				}

				return str + '</tr>';
			};
//=========================================================================
			function groupToHtml ( grdata ) {
				var grp = $t.p.groupingView,
				cp=[], len =grp.groupField.length,
				colspans = cm.length,
				toEnd = 0, retstr="";
				$.each(cm, function (i,n){
					var ii;
					for(ii=0;ii<len;ii++) {
						if(grp.groupField[ii] === n.name ) {
							cp[ii] = i;
							break;
						}
					}
				});
				function findGroupIdx( ind , offset, grp) {
					var ret = false, i;
					if(offset===0) {
						ret = grp[ind];
					} else {
						var id = grp[ind].idx;
						if(id===0) {
							ret = grp[ind];
						}  else {
							for(i=ind;i >= 0; i--) {
								if(grp[i].idx === id-offset) {
									ret = grp[i];
									break;
								}
							}
						}
					}
					return ret;
				}
				function buildSummaryTd(i, ik, grp, foffset) {
					var fdata = findGroupIdx(i, ik, grp),
					//cm = $t.p.colModel,
					vv, grlen = fdata.cnt, k, retarr = emptyData(data.header);
					for(k=foffset; k<colspans;k++) {
						if(!cm[k]._expcol) {
							continue;
						}
						var tplfld = "{0}";
						$.each(fdata.summary,function(){
							if(this.nm === cm[k].name) {
								if(cm[k].summaryTpl)  {
									tplfld = cm[k].summaryTpl;
								}
								vv = this.v;
								if(typeof this.st === 'string' && this.st.toLowerCase() === 'avg') {
									if(this.sd && this.vd) {
										vv = (this.v/this.vd);
									} else if(this.v && grlen > 0) {
										vv = (this.v/grlen);
									}
								}
								try {
									this.groupCount = fdata.cnt;
									this.groupIndex = fdata.dataIndex;
									this.groupValue = fdata.value;
									//vv = $t.formatter('', this.v, k, this);
									//vv = this.v;
								} catch (ef) {
									vv = this.v;
								}
								retarr[this.nm] = $.jgrid.stripHtml( $.jgrid.template(tplfld,vv) );
								return false;
							}
						});
					}
					return retarr;
				}
				function emptyData ( d ) {
					var clone = {};
					for(var key=0;key<d.length; key++ ) {
						clone[ d[key] ] = "";
					}
					return clone;
				}
				var sumreverse = $.makeArray(grp.groupSummary), gv;
				sumreverse.reverse();
				if($t.p.datatype === 'local' && !$t.p.loadonce) {
					$($t).jqGrid('groupingSetup');
					var groupingPrepare = $.jgrid.getMethod("groupingPrepare");
					for(var ll=0; ll < data.body.length; ll++) {
						groupingPrepare.call($($t), data.body[ll], ll);
					}
				}
				$.each(grp.groups,function(i,n){
					toEnd++;
					try {
						if (Array.isArray(grp.formatDisplayField) && $.jgrid.isFunction(grp.formatDisplayField[n.idx])) {
							gv = grp.formatDisplayField[n.idx].call($t, n.displayValue, n.value, $t.p.colModel[cp[n.idx]], n.idx, grp);
						} else {
							gv = $t.formatter('', n.displayValue, cp[n.idx], n.value );
						}
					} catch (egv) {
						gv = n.displayValue;
					}
					var grpTextStr = '';
					if($.jgrid.isFunction(grp.groupText[n.idx])) {
						grpTextStr = grp.groupText[n.idx].call($t, gv, n.cnt, n.summary);
					} else {
						grpTextStr = $.jgrid.template(grp.groupText[n.idx], gv, n.cnt, n.summary);
					}
					if( !(typeof grpTextStr ==='string' || typeof grpTextStr ==='number' ) ) {
						grpTextStr = gv;
					}
					var arr, colSpan = false;
					if(grp.groupSummaryPos[n.idx] === 'header')  {
						arr = buildSummaryTd(i, 0, grp.groups, 0 /*grp.groupColumnShow[n.idx] === false ? (mul ==="" ? 2 : 3) : ((mul ==="") ? 1 : 2)*/ );
					} else {
						arr = emptyData(data.header);
						colSpan = true;
					}
					var fkey = Object.keys(arr);
					arr[fkey[0]] =  new Array(n.idx*5).join(' ') + grpTextStr ;
					retstr += addBodyRow( arr, 'td', true, toEnd === 1, colSpan  );
					var leaf = len-1 === n.idx;
					if( leaf ) {
						var gg = grp.groups[i+1], kk, ik, offset = 0, sgr = n.startRow,
						end = gg !== undefined ?  gg.startRow : grp.groups[i].startRow + grp.groups[i].cnt;
						for(kk=sgr;kk<end;kk++) {
							if(!grdata[kk - offset]) { break; }
							var to = grdata[kk - offset];
							retstr += addBodyRow( to, 'td', true );
							//addRow( to, false );
						}

						if(grp.groupSummaryPos[n.idx] !== 'header') {
							var jj;
							if (gg !== undefined) {
								for (jj = 0; jj < grp.groupField.length; jj++) {
									if (gg.dataIndex === grp.groupField[jj]) {
										break;
									}
								}
								toEnd = grp.groupField.length - jj;
							}
							for (ik = 0; ik < toEnd; ik++) {
								if(!sumreverse[ik]) { continue; }
								arr = buildSummaryTd(i, ik, grp.groups, 0);
								retstr += addBodyRow( arr, 'td', true );
								//addRow( arr, true );
							}
							toEnd = jj;
						}
					}
				});
				return retstr;
			}
			if( $.jgrid.isFunction( o.loadIndicator )) {
				o.loadIndicator.call($t, 'show');
			} else if(o.loadIndicator) {
				$($t).jqGrid("progressBar", {method:"show", loadtype : $t.p.loadui, htmlcontent: $.jgrid.getRegional($t,'defaults.loadtext') });
			}

			var html = '<table class="'+o.tableClass+'">';

			if ( o.includeLabels ) {
				html += '<thead>'+ addRow( data.header, 'th', true ) +'</thead>';
			}

			html += '<tbody>';
			var hlen, il;
			if ( o.includeHeader && $t.p.headerrow ) {
				var hdata;
				hlen = $($t).jqGrid("footerData", "getlength");
				for(il=0; il < hlen; il++) {
					for(il=0; il < hlen; il++) {				
						hdata = $($t).jqGrid("headerData", "get", null, false, il, false);
				html += addBodyRow( hdata, 'td' , false);
			}
				}
			}
			if( $t.p.grouping ) {
				var savlcgr = $t.p.groupingView._locgr ? true : false;
				$t.p.groupingView._locgr = false;
				html += groupToHtml(data.body);
				$t.p.groupingView._locgr = savlcgr;
			} else {
				for ( i=0, ien=data.body.length ; i<ien ; i++ ) {
					html += addBodyRow( data.body[i], 'td', true, (i===0?true:false) );
				}
			}

			if ( o.includeFooter && $t.p.footerrow ) {
				hlen = $($t).jqGrid("footerData", "getlength");
				for(il=0; il < hlen; il++) {				
					data.footer[il] = $($t).jqGrid("footerData", "get", null, false, il, false);
					html += addBodyRow( data.footer[il], 'td' , false);
			}
			}
			html += '</tbody>';
			html += '</table>';
			if (o.returnAsString ) {
				ret = html;
			} else {
				// Open a new window for the printable table
				var win = window.open( '', '' );
				win.document.close();

				var head = o.title ? '<title>'+o.title+'</title>' : '';
				$('style, link').each( function () {
					head += _styleToAbs( this );
				} );

				try {
					win.document.head.innerHTML = head; // Work around for Edge
				}
				catch (e) {
					$(win.document.head).html( head ); // Old IE
				}

				win.document.body.innerHTML =
					(o.title ? '<h1>'+o.title+'</h1>' : '') +
					'<div>'+(o.topText || '')+'</div>'+
					html+
					'<div>'+(o.bottomText || '')+'</div>';

				$(win.document.body).addClass('html-view');

				$('img', win.document.body).each( function ( i, img ) {
					img.setAttribute( 'src', _relToAbs( img.getAttribute('src') ) );
				} );

				if( $.jgrid.isFunction( o.onBeforeExport ) ) {
					o.onBeforeExport.call($t, win);
				}

				if(Boolean(win.chrome)) {
					if ( o.autoPrint ) {
						win.print();
						win.close();
					}
				} else {
					setTimeout( function () {
						if ( o.autoPrint ) {
							win.print();
							win.close();
						}
					}, 1000 );
				}
			}
			if( $.jgrid.isFunction( o.loadIndicator )) {
				o.loadIndicator.call($t, 'hide');
			} else if(o.loadIndicator) {
				$($t).jqGrid("progressBar", {method:"hide", loadtype : $t.p.loadui });
			}
		});
		return ret;
	}
});

//module begin
$.extend($.jgrid,{
	focusableElementsList : [
		'>a[href]',
		'>button:not([disabled])',
		'>area[href]',
		'>input:not([disabled])',
		'>select:not([disabled])',
		'>textarea:not([disabled])',
		'>iframe',
		'>object',
		'>embed',
		'>*[tabindex]',
		'>*[contenteditable]'
	]
});
$.jgrid.extend({
	ariaBodyGrid : function ( p ) {
		var o = $.extend({
			onEnterCell : null,
			onKeyCheck : null,
			customCellAction : null
		}, p || {});

		return this.each(function (){
			var $t = this,
			getstyle = $.jgrid.getMethod("getStyleUI"),
			highlight = getstyle($t.p.styleUI+'.common','highlight', true);

			// basic functions
			function isValidCell(row, col) {
				return (
					!isNaN(row) &&
					!isNaN(col) &&
					row >= 0 &&
					col >= 0 &&
					$t.rows.length &&
					row < $t.rows.length &&
					col < $t.p.colModel.length
				);
			}
			function getNextCell( dirX, dirY) {
				var row = $t.p.iRow + dirY; // set the default one when initialize grid
				var col = $t.p.iCol + dirX; // set the default .................
				var rowCount = $t.rows.length;
				var isLeftRight = dirX !== 0;

				if (!rowCount) {
					return false;
				}
				var colCount = $t.p.colModel.length;
				if (isLeftRight) {
					if (col < 0 && row >= 2) {
						col = colCount - 1;
						row--;
					}
					if (col >= colCount) {
						col = 0;
						row++;
					}
				}
				if (!isLeftRight) {
					if (row < 1) {
						col--;
						row = rowCount - 1;
						if ($t.rows[row] && col >= 0 && !$t.rows[row].cells[col]) {
						// Sometimes the bottom row is not completely filled in. In this case,
						// jump to the next filled in cell.
							row--;
						}
					}
					else if (row >= rowCount || !$t.rows[row].cells[col]) {
						row = 1;
						col++;
					}
				}
				if (isValidCell(row, col)) {
					return {
						row: row,
						col: col
					};
				} else if (isValidCell($t.p.iRow, $t.p.iCol)) {
					return {
						row: $t.p.iRow,
						col: $t.p.iCol
					};
				} else {
					return false;
				}
			}
			function getNextVisibleCell(dirX, dirY) {
				var nextCell = getNextCell( dirX, dirY);
				if (!nextCell) {
					return false;
				}

				while ( $($t.rows[nextCell.row].cells[nextCell.col]).is(":hidden") ) {
					$t.p.iRow = nextCell.row;
					$t.p.iCol = nextCell.col;
					nextCell = getNextCell(dirX, dirY);
					if ($t.p.iRow  === nextCell.row && $t.p.iCol  === nextCell.col) {
						// There are no more cells to try if getNextCell returns the current cell
						return false;
					}
				}
				if( dirY !== 0 ) {
					$($t).jqGrid('setSelection', $t.rows[nextCell.row].id, false, null, false);
				}

				return nextCell;
			}
			function movePage ( dir ) {
				var curpage = $t.p.page, last =$t.p.lastpage;
				curpage = curpage + dir;
				if( curpage <= 0) {
					curpage = 1;
				}
				if( curpage > last ) {
					curpage = last;
				}
				if(  $t.p.page === curpage ) {
					return;
				}
				$t.p.page = curpage;
				$t.grid.populate();
			}
			var focusableElementsSelector = $.jgrid.focusableElementsList.join();
			/*
			function hasFocusableChild( el) {
				return $(focusableElementsSelector, el)[0];
			}
			 * 
			 */
			$($t).removeAttr("tabindex");
			$($t).on('jqGridAfterGridComplete.setAriaGrid', function( e ) {
				//var grid = e.target;
				$("tbody", $t).first().find(">tr:not(.jqgfirstrow)>td:not(:hidden, :has("+focusableElementsSelector+"))").attr("tabindex", -1);
				$("tbody", $t).first().find(">tr:not(.jqgfirstrow)").removeAttr("tabindex");
				if($t.p.iRow !== undefined && $t.p.iCol !== undefined) {
					if($t.rows[$t.p.iRow]) {
					$($t.rows[$t.p.iRow].cells[$t.p.iCol])
						.attr('tabindex', 0)
						.focus( function() { $(this).addClass(highlight);})
						.blur( function () { $(this).removeClass(highlight);});
					}
				}
			});
			$t.p.iRow = 1;
			$t.p.iCol = $.jgrid.getFirstVisibleCol( $t );

			var focusRow=0, focusCol=0; // set the dafualt one
			var custAct = $.jgrid.isFunction( o.customCellAction ) ? o.customCellAction : false;
			var onKeyCheck = $.jgrid.isFunction(o.onKeyCheck) ? o.onKeyCheck : false;
			$($t).on('keydown', function(e) {
				if($t.p.navigationDisabled && $t.p.navigationDisabled === true) {
					return;
				}
				if(e.target.id.startsWith("jqs_"+$t.p.id)) {
					return;
				}
				if(onKeyCheck) {
					if(!onKeyCheck.call($t, $t.rows[$t.p.iRow].id, $t.p.iRow, $t.p.iCol, e) ) {
						return;
					}
				}
				var key = e.which || e.keyCode, nextCell;
				switch(key) {
					case (38) : // DOWN
						nextCell = getNextVisibleCell(0, -1);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case (40) : // UP
						nextCell = getNextVisibleCell(0, 1);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case (37) : // LEFT
						nextCell = getNextVisibleCell(-1, 0);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case (39) : // RIGHT
						nextCell = getNextVisibleCell(1, 0);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case 36 : // HOME
						if(e.ctrlKey) {
							focusRow = 1;
						} else {
							focusRow = $t.p.iRow;
						}
						focusCol = 0;
						e.preventDefault();
						break;
					case 35 : // END
						if(e.ctrlKey) {
							focusRow = $t.rows.length - 1;
						} else {
							focusRow = $t.p.iRow;
						}
						focusCol = $t.p.colModel.length - 1;
						e.preventDefault();
						break;
					case 33 : // PAGEUP

						movePage( -1 );
						focusCol = $t.p.iCol;
						focusRow = $t.p.iRow;
						e.preventDefault();
						break;
					case 34 : // PAGEDOWN
						movePage( 1 );
						focusCol = $t.p.iCol;
						focusRow = $t.p.iRow;
						if(focusRow > $t.rows.length-1) {
							focusRow = $t.rows.length-1;
							$t.p.iRow = $t.rows.length-1;
						}
						e.preventDefault();
						break;
					case 13 : // Enter
						if( $.jgrid.isFunction( o.onEnterCell )) {
							o.onEnterCell.call( $t, $t.rows[$t.p.iRow].id ,$t.p.iRow, $t.p.iCol, e);
							e.preventDefault();
						}
						return;
					case 113 : // F2
						try{
							$($t).jqGrid('editCell', $t.p.iRow, $t.p.iCol, true, e);
						} catch(e1){}
						break;
					default:
						if( custAct ) {
							custAct.call($t, $t.rows[$t.p.iRow].id ,$t.p.iRow, $t.p.iCol, e);
						}
						return;
				}
				setTimeout(function(){
					$($t).jqGrid("focusBodyCell", focusRow, focusCol, getstyle, highlight);
				},50);
			});
			$($t).on('jqGridBeforeSelectRow.ariaGridClick',function() {
				return false;
			});
			$($t).on('jqGridCellSelect.ariaGridClick', function(el1, id, status,tdhtml, e) {
				var el = e.target;
				if($t.p.iRow > 0 && $t.p.iCol >=0) {
					$($t.rows[$t.p.iRow].cells[$t.p.iCol]).attr("tabindex", -1);
				}
				if($(el).is("td") || $(el).is("th") || el.id.startsWith("jqs_"+$t.p.id)) {
					$t.p.iCol = el.cellIndex;
				} else {
					return;
				}
				var row = $(el).closest("tr.jqgrow");
				$t.p.iRow = row[0].rowIndex;
				$(el).attr("tabindex", 0)
					.addClass(highlight)
					.focus()
					.blur(function(){$(this).removeClass(highlight);});
			});
			$t.p.ariaBody = true;
		});
	},
	excelLikeGrid : function ( p ) {
		var o = $.extend({
			beforeDeleteCell : null,
			customCellAction : null,
			customUndoFunction : null,
			specialChars : [
				'~', '!','@', '#', '$','%','^','&','*','(',')','_', '+','{','}', ':', '"', '|','<','>','?',',','.','/',';','\\','[',']' 
			],
			addonChars : false, // ^[а-я]$/i
			onKeyCheck : null
		}, p || {});

		return this.each(function (){
			var $t = this,
			getstyle = $.jgrid.getMethod("getStyleUI"),
			highlight = getstyle($t.p.styleUI+'.common','highlight', true);
			$t.p.F2key = false;
			// basic functions
			var baseFunc = {
				isValidCell : function (row, col) {
				return (
					!isNaN(row) &&
					!isNaN(col) &&
					row >= 0 &&
					col >= 0 &&
					$t.rows.length &&
					row < $t.rows.length &&
					col < $t.p.colModel.length
				);
				},
				getNextCell: function ( dirX, dirY) {
				var row = $t.p.iRow + dirY; // set the default one when initialize grid
				var col = $t.p.iCol + dirX; // set the default .................
				var rowCount = $t.rows.length;
				var isLeftRight = dirX !== 0;
				var collimit = 	$t.p.frozenColumns ? $t.p.frozenColCount + 1 : 0;
				if (!rowCount) {
					return false;
				}

				var colCount = $t.p.colModel.length;
				if (isLeftRight) {
					if (col < collimit ) {
						col = collimit;
					}
					if (col === colCount) {
						col = colCount;
					}
				}
				if (!isLeftRight) {
						if ($t.rows[row] && col >= 0 && !$t.rows[row].cells[col]) {
							row--;
						}
				}
					if (this.isValidCell(row, col)) {
					return {
						row: row,
						col: col
					};
					} else if (this.isValidCell($t.p.iRow, $t.p.iCol)) {
					return {
						row: $t.p.iRow,
						col: $t.p.iCol
					};
				} else {
					return false;
				}
				},
				getNextVisibleCell : function (dirX, dirY) {
					var nextCell = this.getNextCell( dirX, dirY);
				if (!nextCell) {
					return false;
				}

				while ( $($t.rows[nextCell.row].cells[nextCell.col]).is(":hidden") ) {
					$t.p.iRow = nextCell.row;
					$t.p.iCol = nextCell.col;
						nextCell = this.getNextCell(dirX, dirY);
					if ($t.p.iRow  === nextCell.row && $t.p.iCol  === nextCell.col) {
						// There are no more cells to try if getNextCell returns the current cell
						return false;
					}
				}
				if( dirY !== 0 ) {
					$($t).jqGrid('setSelection', $t.rows[nextCell.row].id, false, null, false);
				}

				return nextCell;
				},
				movePage : function ( dir ) {
				var curpage = $t.p.page, last =$t.p.lastpage;
				curpage = curpage + dir;
				if( curpage <= 0) {
					curpage = 1;
				}
				if( curpage > last ) {
					curpage = last;
				}
				if(  $t.p.page === curpage ) {
					return;
				}
				$t.p.page = curpage;
				$t.grid.populate();
			}
			};
			var focusableElementsSelector = $.jgrid.focusableElementsList.join();
			/*
			function hasFocusableChild( el) {
				return $(focusableElementsSelector, el)[0];
			}
			 * 
			 */
			$($t).removeAttr("tabindex");
			$($t).on('jqGridAfterGridComplete.setAriaGrid', function( e ) {
				//var grid = e.target;
				$("tbody", $t).first().find(">tr:not(.jqgfirstrow)>td:not(:hidden, :has("+focusableElementsSelector+"))").attr("tabindex", -1);
				$("tbody", $t).first().find(">tr:not(.jqgfirstrow)").removeAttr("tabindex");
				if($t.p.iRow !== undefined && $t.p.iCol !== undefined) {
					if($t.rows[$t.p.iRow]) {
					$($t.rows[$t.p.iRow].cells[$t.p.iCol])
						.attr('tabindex', 0)
						.focus( function() { $(this).addClass(highlight);})
						.blur( function () { $(this).removeClass(highlight);});
					}
				}
			});
			$t.p.iRow = 1;
			$t.p.iCol = $.jgrid.getFirstVisibleCol( $t );
			$t.p.ariaBody = true;

			var focusRow=0, focusCol=0; // set the dafualt one
			var custAct = $.jgrid.isFunction( o.customCellAction ) ? o.customCellAction : false;
			var delCell = $.jgrid.isFunction( o.beforeDeleteCell ) ? o.beforeDeleteCell : false;
			var aKeys = new Set(o.specialChars);

			//var lastVisibleCol = $.jgrid.getLastVisibleCol( $t );
			//var firstVisibleCol = $.jgrid.getFirstVisibleCol( $t );

			var paste_to_cell = false;
			$t.addEventListener('paste', function (event) {
				if(paste_to_cell) {
					var paste = (event.clipboardData || window.clipboardData).getData('text');
					$($t).jqGrid('saveCell', $t.p.iRow, $t.p.iCol, paste);
					paste_to_cell = false;
				}
			});

			var onKeyCheck = $.jgrid.isFunction(o.onKeyCheck) ? o.onKeyCheck : false;
			$($t).on('keydown', function(e) {
				if($t.p.navigationDisabled && $t.p.navigationDisabled === true) {
					return;
				}
				if(e.target.id.startsWith("jqs_"+$t.p.id)) {
					return;
				}
				if(onKeyCheck) {
					if(!onKeyCheck.call($t, $t.rows[$t.p.iRow].id, $t.p.iRow, $t.p.iCol, e, baseFunc) ) {
						return;
					}
				}
				var key = e.which || e.keyCode, nextCell;
				var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false); // ctrl detection

				switch(key) {
					case (38) : // UP
						nextCell = baseFunc.getNextVisibleCell(0, -1);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case (40) : // DOWN
					case 13 : // Enter
						nextCell = baseFunc.getNextVisibleCell(0, 1);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case (37) : // LEFT
						nextCell = baseFunc.getNextVisibleCell(-1, 0);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case (39) : // RIGHT
						nextCell = baseFunc.getNextVisibleCell(1, 0);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case 36 : // HOME
						if(e.ctrlKey) {
							focusRow = 1;
						} else {
							focusRow = $t.p.iRow;
						}
						focusCol = $t.p.frozenColumns ? $t.p.frozenColCount + 1 : 0;
						e.preventDefault();
						break;
					case 35 : // END
						if(e.ctrlKey) {
							focusRow = $t.rows.length - 1;
						} else {
							focusRow = $t.p.iRow;
						}
						focusCol = $t.p.colModel.length - 1;
						e.preventDefault();
						break;
					case 33 : // PAGEUP

						baseFunc.movePage( -1 );
						focusCol = $t.p.iCol;
						focusRow = $t.p.iRow;
						e.preventDefault();
						break;
					case 34 : // PAGEDOWN
						baseFunc.movePage( 1 );
						focusCol = $t.p.iCol;
						focusRow = $t.p.iRow;
						if(focusRow > $t.rows.length-1) {
							focusRow = $t.rows.length-1;
							$t.p.iRow = $t.rows.length-1;
						}
						e.preventDefault();
						break;
					case 9 : //TAB
						if (e.shiftKey) {
							nextCell = baseFunc.getNextVisibleCell(-1, 0);
						} else {
							nextCell = baseFunc.getNextVisibleCell(1, 0);

						}
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
					break;
					case 113 : // F2
						try{
							$($t).jqGrid('editCell', $t.p.iRow, $t.p.iCol, true, e, false);
							$t.p.F2key = true;
						} catch(e1){}
						break;
					case 8: // DEL, BACKSPACE
					case 46:
						var retDel = true;
						if( delCell ) {
							retDel = delCell.call($t, $t.rows[$t.p.iRow].id ,$t.p.iRow, $t.p.iCol, e);
						}
						if(retDel === true) {
							$($t).jqGrid('saveCell', $t.p.iRow, $t.p.iCol, "");
						}
						break;
					case 86:
						if(ctrl) {
							paste_to_cell = true;
							return true;
						}
						break;
					case 90:
						if(ctrl) {
							var undofunc = true; 
							if( $.jgrid.isFunction( o.customUndoFunction ) ) {
								undofunc = o.customUndoFunction.call($t, $t.rows[$t.p.iRow].id ,$t.p.iRow, $t.p.iCol, e);
							}
							if( undofunc && $t.p.savedValues &&
								    $($t).jqGrid('getCell', $t.rows[$t.p.iRow].id, $t.p.colModel[$t.p.iCol].name, false)  === $t.p.savedValues.newvalue &&
								    $t.p.iRow ===  $t.p.savedValues.indexRow) {
								// undo
								$($t).jqGrid('saveCell', $t.p.iRow, $t.p.iCol, $t.p.savedValues.oldvalue);
							}
							return true;
						}
						break;
					default:
						var isLetter = /^[a-z]$/i.test(e.key);
						var isNumber = /^[0-9]$/i.test(e.key);
						var other = false;
						if(o.addonChars) {
							other = o.addonChars.test(e.key);
						}

						if(isLetter || isNumber || aKeys.has(e.key) || other) {
							$($t).jqGrid('editCell', $t.p.iRow, $t.p.iCol, true, e, true);
						}
						if( custAct ) {
							custAct.call($t, $t.rows[$t.p.iRow].id ,$t.p.iRow, $t.p.iCol, e);
						}
						return;
				}
				setTimeout(function(){
					$($t).jqGrid("focusBodyCell", focusRow, focusCol, getstyle, highlight);
				},50);
			});
			$($t).on('jqGridBeforeSelectRow.ariaGridClick',function() {
				return false;
			});
			$($t).on('jqGridCellSelect.ariaGridClick', function(el1, id, status,tdhtml, e) {
				var el = e.target;
				if($t.p.iRow > 0 && $t.p.iCol >=0) {
					$($t.rows[$t.p.iRow].cells[$t.p.iCol]).attr("tabindex", -1);
				}
				if($(el).is("td") || $(el).is("th") || el.id.startsWith("jqs_"+$t.p.id)) {
					$t.p.iCol = el.cellIndex;
				} else {
					return;
				}
				if($t.p.savedRow.length) {
					$($t).jqGrid("saveCell",$t.p.savedRow[0].id,$t.p.savedRow[0].ic);
				}
				var row = $(el).closest("tr.jqgrow");
				$t.p.iRow = row[0].rowIndex;
				$(el).attr("tabindex", 0)
					.addClass(highlight)
					.focus()
					.blur(function(){$(this).removeClass(highlight);});
			}).on('jqGridDblClickRow.ariaGridDblClick', function(el1,id, iRow, iCol, e){
				$($t).jqGrid('editCell', iRow, iCol, true, e, false);
				$t.p.F2key = true;
			});
		});
	},
	focusBodyCell : function(focusRow, focusCol, _s, _h) {
		return this.each(function (){
			var $t = this,
			getstyle = !_s ? $.jgrid.getMethod("getStyleUI") : _s,
			highlight = !_h ? getstyle($t.p.styleUI+'.common','highlight', true) : _h,
			focusableElementsSelector = $.jgrid.focusableElementsList.join(),
			fe;
			function hasFocusableChild( el) {
				return $(focusableElementsSelector, el)[0];
			}

			if(focusRow !== undefined && focusCol !== undefined) {
				if (!isNaN($t.p.iRow) && !isNaN($t.p.iCol) && $t.p.iCol >= 0) {
					fe = hasFocusableChild($t.rows[$t.p.iRow].cells[$t.p.iCol]);
					if( fe ) {
						$(fe).attr('tabindex', -1);
					} else {
						$($t.rows[$t.p.iRow].cells[$t.p.iCol]).attr('tabindex', -1);
					}
				}

			} else  {
				focusRow = $t.p.iRow;
				focusCol = $t.p.iCol;
			}
			focusRow = parseInt(focusRow, 10);
			focusCol = parseInt(focusCol, 10);
			if(focusRow > 0 && focusCol >=0) {
				fe = hasFocusableChild($t.rows[focusRow].cells[focusCol]);
				if( fe ) {
					$(fe).attr('tabindex', 0)
					.addClass(highlight)
					.focus()
					.blur( function () { $(this).removeClass(highlight); });
				}  else {
					$($t.rows[focusRow].cells[focusCol])
						.attr('tabindex', 0)
						.addClass(highlight)
						.focus()
						.blur(function () { $(this).removeClass(highlight); });
			}
			$t.p.iRow = focusRow;
			$t.p.iCol = focusCol;
			}
		});
	},
	resetAriaBody : function() {
		return this.each(function(){
			var $t = this, paste_to_cell = false;
			$t.p.ariaBody = false;
			$($t).attr("tabindex","0")
				.off('keydown')
				.off('jqGridBeforeSelectRow.ariaGridClick')
				.off('jqGridCellSelect.ariaGridClick')
				.off('jqGridAfterGridComplete.setAriaGrid');
			var focusableElementsSelector = $.jgrid.focusableElementsList.join();
			$("tbody",$t).first().find(">tr:not(.jqgfirstrow)>td:not(:hidden, :has("+focusableElementsSelector+"))").removeAttr("tabindex").off("focus");
			$("tbody",$t).first().find(">tr:not(.jqgfirstrow)").attr("tabindex", -1);
			try {
				$t.removeEventListener('paste', function(event) {
					if(paste_to_cell) {
						var paste = (event.clipboardData || window.clipboardData).getData('text');
						$($t).jqGrid('saveCell', $t.p.iRow, $t.p.iCol, paste);
						paste_to_cell = false;
					}
				}, true);
			} catch(e) {}
		});
	},
	ariaHeaderGrid : function( p ) {
		var o = $.extend({
			onHeaderKeyCheck : null
		}, p || {});		
		return this.each(function (){
			var $t = this,
			getstyle = $.jgrid.getMethod("getStyleUI"),
			highlight = getstyle($t.p.styleUI+'.common','highlight', true),
			htable = $("#gbox_"+$t.p.id).find(".ui-jqgrid-hbox>table").first();
			var onHeaderKeyCheck = $.jgrid.isFunction(o.onHeaderKeyCheck) ? o.onHeaderKeyCheck : false;

			$('tr.ui-jqgrid-labels', htable).on("keydown", function(e) {
				var currindex = $t.p.selHeadInd;
				var key = e.which || e.keyCode;
				var len = $t.grid.headers.length;
				if(onHeaderKeyCheck) {
					if(!onHeaderKeyCheck.call($t, currindex, e) ) {
						return;
					}
				}
				switch (key) {
					case 37: // left
						if(currindex-1 >= 0) {
							currindex--;
							while( $($t.grid.headers[currindex].el).is(':hidden') && currindex-1 >= 0) {
								currindex--;
								if(currindex < 0) {
									break;
								}
							}
							if(currindex >= 0) {
								$($t.grid.headers[currindex].el).focus();
								$($t.grid.headers[$t.p.selHeadInd].el).attr("tabindex", "-1");
								$t.p.selHeadInd = currindex;
								e.preventDefault();
							}
						}
						break;
					case 39: // right
						if(currindex+1 < len) {
							currindex++;
							while( $($t.grid.headers[currindex].el).is(':hidden') && currindex+1 <len) {
								currindex++;
								if( currindex > len-1) {
									break;
								}
							}
							if( currindex < len) {
								$($t.grid.headers[currindex].el).focus();
								$($t.grid.headers[$t.p.selHeadInd].el).attr("tabindex", "-1");
								$t.p.selHeadInd = currindex;
								e.preventDefault();
							}
						}
						break;
					case 13: // enter
						$($t.grid.headers[currindex].el).find("div").first().trigger('click');
						e.preventDefault();
						break;
					default:
						return;
				}
			});
			$('tr.ui-jqgrid-labels>th:not(:hidden)', htable).attr("tabindex", -1).focus(function(){
				$(this).addClass(highlight).attr("tabindex", "0");
			}).blur(function(){
				$(this).removeClass(highlight);
			});
			$t.p.selHeadInd = $.jgrid.getFirstVisibleCol( $t );
			$($t.grid.headers[$t.p.selHeadInd].el).attr("tabindex","0");
		});
	},
	focusHeaderCell : function( index) {
		return this.each( function(){
			var $t = this;
			if(index === undefined) {
				index = $t.p.selHeadInd;
			}
			if(index >= 0 && index < $t.p.colModel.length) {
				$($t.grid.headers[$t.p.selHeadInd].el).attr("tabindex", "-1");
				$($t.grid.headers[index].el).focus();
				$t.p.selHeadInd = index;
			}
		});
	},
	resetAriaHeader : function() {
		return this.each(function(){
			var htable = $("#gbox_" + this.p.id).find(".ui-jqgrid-hbox>table").first();
			$('tr.ui-jqgrid-labels', htable).off("keydown");
			$('tr.ui-jqgrid-labels>th:not(:hidden)', htable).removeAttr("tabindex").off("focus blur");
		});
	},
	ariaPagerGrid : function () {
		return this.each( function(){
			var $t = this,
			getstyle = $.jgrid.getMethod("getStyleUI"),
			highlight = getstyle($t.p.styleUI+'.common','highlight', true),
				disabled = "."+getstyle($t.p.styleUI+'.common','disabled', true),
				cels = $(".ui-pg-button",$t.p.pager),
				len = cels.length;

			cels.attr("tabindex","-1").focus(function(){
				$(this).addClass(highlight);
			}).blur(function(){
				$(this).removeClass(highlight);
			});

			$t.p.navIndex = 0;
			setTimeout( function() { // make another decision here
				var navIndex = cels.not(disabled).first().attr("tabindex", "0");
				$t.p.navIndex = (navIndex[0] && navIndex[0].cellIndex) ? navIndex[0].cellIndex-1 : 0;
			}, 100);

			$($t.p.pager).find("table.ui-pager-table tr").first().on("keydown", function(e) {
				var key = e.which || e.keyCode;

				var indexa = $t.p.navIndex;//currindex;
				switch (key) {
					case 37: // left
						if(indexa-1 >= 0) {
							indexa--;
							while( $(cels[indexa]).is(disabled) && indexa-1 >= 0) {
								indexa--;
								if(indexa < 0) {
									break;
								}
							}
							if(indexa >= 0) {
								$(cels[$t.p.navIndex]).attr("tabindex","-1");
								$(cels[indexa]).attr("tabindex","0").focus();
								$t.p.navIndex = indexa;
							}

							e.preventDefault();
						}
						break;
					case 39: // right
						if(indexa+1 < len) {
							indexa++;
							while( $(cels[indexa]).is(disabled) && indexa+1 < len + 1) {
								indexa++;
								if( indexa > len-1) {
									break;
								}
							}
							if( indexa < len) {
								$(cels[$t.p.navIndex]).attr("tabindex","-1");
								$(cels[indexa]).attr("tabindex","0").focus();
								$t.p.navIndex = indexa;
							}
							e.preventDefault();
						}
						break;
					case 13: // enter
					if(!$(e.originalEvent.srcElement).hasClass("ui-pg-input")) {
						$(cels[indexa]).trigger('click');
						e.preventDefault();
					}
						break;
					default:
						return;
				}
			});
		});
	},
	focusPagerCell : function( index) {
		return this.each( function(){
			var $t = this,
				cels = $(".ui-pg-button",$t.p.pager),
				len = cels.length;
			if(index === undefined) {
				index = $t.p.navIndex;
			}
			if(index >= 0 && index < len) {
				$(cels[$t.p.navIndex]).attr("tabindex","-1");
				$(cels[index]).attr("tabindex","0").focus();
				$t.p.navIndex = index;
			}
		});
	},
	resetAriaPager : function() {
		return this.each(function(){
			$(".ui-pg-button",this.p.pager).removeAttr("tabindex").off("focus");
			$(this.p.pager).find("table.ui-pager-table tr").first().off("keydown");
		});
	},
	setAriaGrid : function ( p ) {
		var o = $.extend({
			header : true,
			body : true,
			pager : true,
			onEnterCell : null,
			customCellAction : null,
			excel : false
		}, p || {});
		return this.each(function(){
			if( o.header ) {
				$(this).jqGrid('ariaHeaderGrid', o);
			}
			if( o.body ) {
				if(o.excel) {
					$(this).jqGrid('excelLikeGrid', o);
				} else {
					$(this).jqGrid('ariaBodyGrid', o);
			}
			}
			if( o.pager ) {
				$(this).jqGrid('ariaPagerGrid');
			}
		});
	},
	resetAriaGrid : function( p ) {
		var o = $.extend({
			header : true,
			body : true,
			pager : true
		}, p || {});
		return this.each(function(){
			var $t = this;
			if( o.body ) {
				$($t).jqGrid('resetAriaBody');
			}
			if( o.header ) {
				$($t).jqGrid('resetAriaHeader');
			}
			if( o.pager ) {
				$($t).jqGrid('resetAriaPager');
			}
		});
	}
// end aria grid
});

//module begin
$.jgrid.extend({
	transposeSetup : function( data, options ){
		// return the final result.
		var columns =[], rows=[],  model = false,
		o = $.extend ( {}, options || {});
		this.each(function(){
			// trnsform data and build colModel
			var keys = Object.keys(data[o.baseindex]), rowobj, col;
			if(o.excludeSrcCols.length) {
				keys = keys.filter(function(item) {
					return !o.excludeSrcCols.includes(item);
				});
			}
			// for all columns
			for(var i =0; i<  keys.length; i++) {
				rowobj = {}; col=0;
				
				rowobj.col_name = keys[i];
				
				if(!model) {
					// build colmodel first item
					columns.push({name:"col_name"});
				}
				col++;
				  
				 
				// loop in every row and put it as column
				for(var j=0; j< data.length; j++) {
					var tmp = data[j];
					rowobj[o.nameprefix + col]= tmp[keys[i]];
					if(!model) {
						// colModel next items
						columns.push({name:o.nameprefix + col, label : o.labelprefix + col});
					}
					col++;
				}
				// colModel is build
				model = true;
				rows.push(rowobj);
			}
		});
		return { "colModel" : columns, "rows": rows };
	},
	jqTranspose : function( data, transpOpt, gridOpt, ajaxOpt) {
		transpOpt = $.extend ( {
			nameprefix : "col",  // prefix for the creted name in colModel + index
			labelprefix : "value ", // prefix for the colNames titles + index
			baseindex : 0, // which is the base index from source data to transpose rows to cols
			beforeCreateGrid : null, // even befor creating the jqGrid. passed is a object 
									// containing colModel and data (rows)
			RowAsHeader : 0,
			loadMsg : false,
			excludeSrcCols :[]
		}, transpOpt || {} );
		return this.each(function(){
			var $t = this,
				regional = (gridOpt && gridOpt.regional) ? gridOpt.regional : "en";
			if(transpOpt.loadMsg) {
				$("<div class='loading_pivot ui-state-default ui-state-active row'>"+$.jgrid.getRegional($t, "regional."+regional+".defaults.loadtext")+"</div>").insertBefore($t).show();
			}

			function transpose( data, o) {
				if(!Array.isArray(data)) {
					//throw "data provides is not an array";
					data = [];
				}
				var transpGrid = jQuery($t).jqGrid('transposeSetup',data, transpOpt);
				if($.jgrid.isFunction(transpOpt.beforeCreateGrid)) {
					transpOpt.beforeCreateGrid.call($t, transpGrid, data);
				}
				if(o.RowAsHeader !== false &&
						o.RowAsHeader >=0 &&
						transpGrid.rows.length &&
						o.RowAsHeader < transpGrid.rows.length) {

					var labels = transpGrid.rows[o.RowAsHeader], i=0;
					for(var key in labels) {
						if( Object.prototype.hasOwnProperty.call(labels, key) ){
						//labels.hasOwnProperty(key)) {
							transpGrid.colModel[i].label = labels[key];
						}
						i++;
					}
					transpGrid.rows.splice(o.RowAsHeader,1);
				}
				var query= $.jgrid.from.call($t, transpGrid.rows);
				jQuery($t).jqGrid($.extend(true, {
					datastr: query.select(),
					datatype: "jsonstring",
					colModel: transpGrid.colModel,
					jsonReader : {
						repeatitems : false
					},
					viewrecords: true
					//sortname: transpOpt.xDimension[0].dataName // ?????
				}, gridOpt || {}));
				if(transpOpt.loadMsg) {
					$(".loading_pivot").remove();
				}
			}
						
			if(typeof data === "string") {
				$.ajax($.extend({
					url : data,
					dataType: 'json',
					success : function(response) {
						transpose($.jgrid.getAccessor(response, ajaxOpt && ajaxOpt.reader ? ajaxOpt.reader: 'rows'), transpOpt );
					}
				}, ajaxOpt || {}) );
			} else {
				transpose( data, transpOpt );
			}
		});
	}
});

//module begin
$.jgrid.extend({
	setupFrozenRows : function ( options ){
		var prm = $.extend({
			first : 0,
			last : 0,
			rowids :[],
			//saveFirstLastId : false,
			classes : "frozen-row-class"
		}, options || {});

		return this.each(function(){
			// restrictions
			if(this.p.subGrid === true ||
				this.p.treeGrid === true ||
				//this.p.cellEdit === true ||
				// $t.p.sortable ||
				this.p.scroll ||
				//this.p.frozenColumns === true ||
				//this.p.frozenRows === true||
				this.p.grouping === true)
			{
				return;
			}
			var $t = this, row, pos =0, len =0;
			if(prm.rowids && prm.rowids.length > 0 ) {
				for( let i =0;i<prm.rowids.length; i++ ) {
					let j = $t.rows.length;
					while( j-- ) {
						if($t.rows[j].id === prm.rowids[i]+"") {
							$($t.rows[j]).insertBefore($t.rows[i+1]);
							break;
						}
					}
				}
				len = prm.rowids.length;
			} else if(prm.first > 0) {
				len = prm.first
			} else if(prm.last > 0 ) {
				let j = $t.rows.length;
				len = prm.last;
				for(let i=0; i<prm.last; i++) {
					$($t.rows[j-1]).insertBefore($t.rows[1]);
				}
			} else {
				return;
			}
			for(let i = 0; i < len; i++) {
				row = $t.rows[i+1];
				if(row.classList.contains("jqgrow")) {
					$(row).addClass(prm.classes).css("top", pos + "px");
				}
				pos += $(row).outerHeight();
			}
			$t.p.frozenRows = true;
		});
	},
	setFrozenRows : function (options ) {
		return this.each(function(){
			if( this.p.records > 0 ) {
				$(this).jqGrid("setupFrozenRows", options);
			}

			$(this).on('jqGridAfterGridComplete.setFrozenRows', function () {  
				$(this).jqGrid("setupFrozenRows", options);
			});			
		});
	},
	destroyFrozenRows: function(options) {
		var prm = $.extend({
			classes : "frozen-row-class",
			rowsToScan : 5
		}, options || {});
		return this.each(function(){
			var $t = this;
			for(let i=0; i < prm.rowsToScan; i++) {
				if($t.rows[i+1] && $t.rows[i+1].classList.contains(prm.classes) ) {
					$($t.rows[i+1]).removeClass(prm.classes).css("top","");
				}
			}
			$(this).off('jqGridAfterGridComplete.setFrozenRows');
			$t.p.frozenRows = false;
		});
	}
});

//module begin
$.jgrid.extend({
	dbInit : function (dbtype) {
		return this.each(function (){
			switch (dbtype) {
				case  'indexeddb':
					$(this).jqGrid('_initIndexedDB_');
				break;
			}
		});
	},
	_initIndexedDB_ : function() { 
	this.each(function(){
		var ts = this;
		indexedDB.databases().then(function(r) { 
			const connection  = indexedDB.open(ts.p.dbconfig.dbname /*, ts.p.dbconfig.dbversion*/);
			connection.onupgradeneeded = (e) => {
				console.info('Database created: '+ts.p.dbconfig.dbname);
			};
			connection.onsuccess = function(e) {
				const db = e.target.result;
				var version =  parseInt(db.version),
				idcol = $.jgrid.getElemByAttrVal(ts.p.colModel, 'key', true);

				async function getIndexedDbData( skipCreate ) {
					var data, options = ts.p.dbconfig;
					if(typeof options.dataUrl === 'string') {
						try {
						let req = await fetch(options.dataUrl, options.fetchOptions);	
							data = await req.json();
							if(options.reader !== null) {
								data = $.jgrid.getAccessor(data, options.reader);
							}
						} catch(error) {
							console.log("Error:" +error);
							return;
						}
						if($.jgrid.isFunction(options.beforeInsertData)) {
							data = options.beforeInsertData.call(ts, data);
						}
					} else if(Array.isArray(options.dataUrl)) {
						data = options.dataUrl;
					}
						ts.p.dbconfig.dbversion = version + 1;
					var secondconn = indexedDB.open(options.dbname, version + 1/*, ts.p.dbconfig.dbversion*/);
						secondconn.onupgradeneeded = function (e) {
							var db = e.target.result;
							if(!skipCreate) {
								const objectStore = db.createObjectStore(ts.p.dbconfig.dbtable, {keyPath: idcol.name});
								for(let i =0;i<ts.p.colModel.length; i++) {
									let cm = ts.p.colModel[i];
									if(cm.name === idcol.name) {
										objectStore.createIndex(cm.name, cm.name, { unique: true });
									} else {
										objectStore.createIndex(cm.name, cm.name, { unique: false });
									}
								}
							}
							const transaction = e.target.transaction;
							const objectStore1 = transaction.objectStore(ts.p.dbconfig.dbtable);
							objectStore1.transaction.oncomplete = function(e){
								// data added
								//ts.p.dbconfig.loadIfExists = false;
							};
							objectStore1.transaction.onerror = function(e){
								$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
							};
							for(var row of data){
								if(!ts.p.dbconfig.isKeyInData) {
									row[idcol.name] = Math.random().toString(16).slice(2);
								}
								objectStore1.put(row);
							}
							ts.p.dbconfig.ready_req = true;
							ts.grid.populate();
						};
						secondconn.onerror =(e) => {
							$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
						};
					}
					if($.isEmptyObject(idcol)) {
						$.jgrid.info_dialog("Warning","Missed key: No uniquie key is set in colModel. Creating table fail",'Close');
						return;
					}
					if( !db.objectStoreNames.contains(ts.p.dbconfig.dbtable) ) {
						db.close();
						getIndexedDbData( false );
				} else if(ts.p.dbconfig.loadIfExists || ts.p.dbconfig.deleteIfExists) {
					const tr = db.transaction(ts.p.dbconfig.dbtable, "readwrite");
						const oS = tr.objectStore(ts.p.dbconfig.dbtable);
						const countRequest = oS.count();
						countRequest.onsuccess = () => {						
							if(countRequest.result > 0)  {
							if(ts.p.dbconfig.deleteIfExists) {
								const objectStoreRequest = oS.clear();
								objectStoreRequest.onsuccess = (event) => {
									// report the success of our request
									console.log("All records are cleared");
									db.close();
									getIndexedDbData( true );
								};
								objectStoreRequest.onerror = (e) => {
									// report the success of our request
									$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
								};
							} else if(ts.p.dbconfig.loadIfExists) {
								db.close();
								getIndexedDbData( true );								
								} else {
									db.close();
									ts.p.dbconfig.ready_req = true;
									ts.grid.populate();
								}
							} else {
							db.close();
							getIndexedDbData( true );			
						}
					};
				} else {
					db.close();
					ts.p.dbconfig.ready_req = true;
					ts.grid.populate();
				}
			};
			connection.onerror =(e) => {
				$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
			};
		});	
	});},
	updateStorageRecord : async function (data, keyName) {
		let ts = this[0], dbcfg = ts.p.dbconfig, type = ts.p.datatype;
		return new Promise(function(resolve, reject){
			if(!Array.isArray(data)) {
				data = [data];
			}
			if(!keyName) {
				keyName = ts.p.keyName;
			}
			data = $.jgrid.normalizeDbData.call(ts, data, ts.p.colModel );
			switch(type) {
				case 'indexeddb' :
					const DBOpenRequest = window.indexedDB.open(dbcfg.dbname /*, dbcfg.dbversion*/);
					DBOpenRequest.onsuccess = (event) => {
						const db = DBOpenRequest.result;
						const transaction = db.transaction(dbcfg.dbtable, "readwrite");
						transaction.oncomplete = (event) => {
							resolve(event);
							console.log("Transaction completed succefully");
						};
						transaction.onerror = (event) => {
							reject(event);
							try {
								$.jgrid.info_dialog.call("Error", event.target.error, "Close", {styleUI : ts.p.styleUI});
							} catch (e) {
								console.log(event.target.error);
							}
						};
						const objectStore = transaction.objectStore(dbcfg.dbtable);
						for(let i=0;i<data.length;i++) {
							if(!data[i].hasOwnProperty(keyName) || data[i][keyName] === "") {
								transaction.abort();
								break;
							}
							const req2 = objectStore.openCursor();
							req2.onsuccess = (e) => {
								 const cursor = e.target.result;
								 if(!cursor) {
									 return;
								 }
								var updateData = cursor.value;
								if(updateData[keyName] === data[i][keyName]) {
									delete data[i].oper;
									updateData = Object.assign(updateData, data[i]);
									const updateRequest = cursor.update(updateData);
									return;
								} else {
									 cursor.continue();
								}
								};
							req2.onerror = (e) => {
								console.log(e.target.error);
							};
						}
					};
				break;
			} 
		});
	},
	addStorageRecord : async function (data, keyName) {
		let ts = this[0], dbcfg = ts.p.dbconfig, type = ts.p.datatype;
		return new Promise(function(resolve, reject){
			if(!Array.isArray(data)) {
				data = [data];
			}
			if(!keyName) {
				keyName = ts.p.keyName;
			}
			data = $.jgrid.normalizeDbData.call(ts, data, ts.p.colModel );
			switch(type) {
				case 'indexeddb' :
					const DBOpenRequest = window.indexedDB.open(dbcfg.dbname /*, dbcfg.dbversion*/);
					DBOpenRequest.onsuccess = (event) => {
						const db = DBOpenRequest.result;
						const transaction = db.transaction(dbcfg.dbtable, "readwrite");
						transaction.oncomplete = (event) => {
							resolve(event);
							console.log("Transaction completed succefully");
						};
						transaction.onerror = (event) => {
							reject(event);
							try {
								$.jgrid.info_dialog.call("Error", event.target.error, "Close", {styleUI : ts.p.styleUI});
							} catch (e) {
								console.log(event.target.error);
							}
						};
						const objectStore = transaction.objectStore(dbcfg.dbtable);
						for(let i=0;i<data.length;i++) {
							if(!data[i].hasOwnProperty(keyName) || data[i][keyName] === "") {
								data[i][keyName] = Math.random().toString(16).slice(2);
							}
							var objectStoreRequest = objectStore.add(data[i]);
							objectStoreRequest.onsuccess = (event) => {
								//console.log(event.type, objectStoreRequest.result);
							};
						}
					};
				break;
			} 
		});
	},
	deleteStorageRecord : async function (data, keyName) {
		let ts = this[0], dbcfg = ts.p.dbconfig, type = ts.p.datatype;
		return new Promise(function(resolve, reject){
			if(!Array.isArray(data)) {
				data = data.split(",");
			}	
			if(!keyName) {
				keyName = ts.p.keyName;
			}
			switch(type) {
				case 'indexeddb' :
					var test =[], obj={};
					for (let i=0;i<data.length;i++) {
						obj[keyName] = data[i];
						test.push(obj);
					}
					// detect keytype
					test = $.jgrid.normalizeDbData.call(ts, test, ts.p.colModel );			
					const DBOpenRequest = window.indexedDB.open(dbcfg.dbname /*, dbcfg.dbversion*/);
					DBOpenRequest.onsuccess = (event) => {
						const db = DBOpenRequest.result;
						const transaction = db.transaction(dbcfg.dbtable, "readwrite");
						transaction.oncomplete = (event) => {
							resolve(event);
							console.log("Transaction completed succefully");
						};
						transaction.onerror = (event) => {
							reject(event);
							try {
								$.jgrid.info_dialog.call("Error", event.target.error, "Close", {styleUI : ts.p.styleUI});
							} catch (e) {
								console.log(event.target.error);
							}
						};
						const objectStore = transaction.objectStore(dbcfg.dbtable);
						for(let i=0;i<data.length;i++) {
							var objectStoreRequest = objectStore.delete(test[i][keyName]);
							objectStoreRequest.onsuccess = (event) => {
								console.log("Deleted record: " + data[i]);
							};							
						}
					};
				break;
			} 
		});
	}	
});

//module begin
// clipboard
$.extend($.jgrid,{
	deserializeRow : function  (row, delimiter = ',') {
		const values = [];
		let index = 0, matchStart = 0, isInsideQuotations = false;
		while (true) {
			if (index === row.length) {
				values.push(row.slice(matchStart, index));
				break;
			}
			const char = row[index];
			if (char === delimiter && !isInsideQuotations) {
				values.push(
					row
					.slice(matchStart, index)
					.replace(/^"|"$/g, '')
					.replace(/""/g, '"')
					.replace(/\\n/g, '\n')
				);
				matchStart = index + 1;
			}
			if (char === '"')
				if (row[index + 1] === '"') index += 1;
				else isInsideQuotations = !isInsideQuotations;
			index += 1;
		}
		return values;
	},
	CSVtoObject : function (data, headers, delimiter = ',', new_line = '\t')  {
		const rows = data, /*data.split(new_line),*/ len = rows.length;
		if(len && rows[len-1] == "") {
			rows.pop()
		}
		return rows.map((row) => {
			const values = $.jgrid.deserializeRow(row, delimiter);
			return headers.reduce((obj, key, index) => {
				obj[key] = values[index];
				return obj;
			}, {});
		});
	},
	Permissions : async function() {
		const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
		navigator.permissions.query(queryOpts).then((permObj)=>{
			// state will be 'granted', 'denied' or 'prompt':
			if( permObj && permObj.state === 'denied') {
				let msg = $.jgrid.getRegional(this, 'clipboard.errors');
				$.jgrid.toast({ 
					text: msg.enb_prm, 
					autoClose : false,
					styleUI: this.p.styleUI, 
					type:"warning"
				});						
			}
			// Listen for changes to the permission state
			// permissionStatus.onchange = () => {
			//	console.log(permissionStatus.state);
			// }
		}).catch((error)=>{
			// no translation
			console.log("clipboard-read permission not supported for this browser.")
		});
	},
	copyText: async function (textValue, o) {
		try {
			await navigator.clipboard.writeText(textValue);
			if(o.show_info_after_copy) {
				let msg = $.jgrid.getRegional(this, 'clipboard.msg');
				$.jgrid.toast( {
					text: msg.text_c, 
					styleUI: this.p.styleUI, 
					type:"info",
					position: o.toastPosition
				});
			}
		} catch (err) {
			let msg = $.jgrid.getRegional(this, 'clipboard.errors');
			$.jgrid.toast( { 
				text: msg.copy_err + err, 
				autoCloseTime: 4500,
				styleUI: this.p.styleUI, 
				type:"error"
			});
		}
	},
	getClipboardContents : async function ( ) {
		try {
			const text = await navigator.clipboard.readText();
			return text;
		} catch (err) {
			let msg = $.jgrid.getRegional(this, 'clipboard.errors');
			$.jgrid.toast( {
				text: msg.read_err + err, 
				styleUI: this.p.styleUI,
				autoCloseTime: 4500,
				type:"error"
			});
		}
	},
	copyRows : function( rows, cm , o) {
		var seldata =[],header=[], h_s = false, $t = $(rows).parents('table')[0];
		for(var j=0; j<rows.length;j++) {
			var row = rows[j];
			var dat = [];
			if(row.classList.contains("jqgrow")) {
				for (var i=0;i<row.cells.length; i++) {
					if(row.cells[i].classList.contains("selected-cell")) {
						if(h_s===false) {
							header.push(cm[i].name);
						}
						if(o.copy_formated_data === true)  {
							dat.push( row.cells[i].innerText) ; //? formated data in grid
						} else {
							try {
								dat.push($.unformat.call($t,$(row.cells[i]),{rowId:row.id, colModel:cm[i] }, i ) );
							} catch(e) {
								dat.push( $.jgrid.htmlDecode(row.cells[i].innerHTML) ); //as in getCell
							}
						}
					}
				}
				if(header.length) {
					h_s = true;
				}
				if(dat.length) {
					seldata.push( dat.join( o.copy_delimiter ));
				}
			}
		}
		if(o.copy_header_included && header.length) {
			seldata.unshift( header.join( o.copy_delimiter ) );
		}
		if( $.jgrid.isFunction(o.beforeCopyData)) {
			o.beforeCopyData.call(this, seldata, o);
		}
		$.jgrid.copyText.call($t, seldata.join( o.copy_newline), o);
		o.startCellIndex = null; o.startRowIndex = null;
		if( $.jgrid.isFunction(o.afterCopyData)) {
			o.afterCopyData.call(this, seldata, o);
		}
	},
	pasteRows : function(o, paste_add) {
		if(o.startCellIndex === null || o.startRowIndex === null) {
			let msg = $.jgrid.getRegional(this, 'clipboard.msg');
			$.jgrid.toast({ 
				text: msg.select_pos, 
				position:"middle center", 
				autoClose : false,
				styleUI: this.p.styleUI, 
				type:"warning"
			});			
			return;
		}
		var cm = this.p.colModel, grid_id = this.p.id;
		$.jgrid.getClipboardContents.call(this).then((data) => {
			if(data === "" || data == null) {
				let msg = $.jgrid.getRegional(this, 'clipboard.errors');
				$.jgrid.toast( {
					text: msg.get_data_err, 
					styleUI: this.p.styleUI,
					autoCloseTime: 4500,
					type:"error"
				});
				return;
			}
			var delim = o.paste_autodetect_delim  ? $.jgrid.guessDelimiters(data) : o.paste_delimiter, headers=[];
			if( $.jgrid.isFunction(o.beforePasteData)) {
				o.beforePasteData.call(this, data, delim);
			}
			data = data.split(o.paste_newline);
			if(!o.paste_header_included) {
				headers =  $.jgrid.deserializeRow(data.shift(), delim);
			} else {
				var h_l = data[0].split(delim).length;
				h_l += o.startCellIndex;
				if(h_l > cm.length) {
					h_l = cm.length;
				}
				for (var i = o.startCellIndex; i< h_l; i++) {
					headers.push(cm[i].name);
				}
			}
			if($.jgrid.isLocalStorage()) {
				localStorage.removeItem(grid_id+"_restore");
			}
			var rows_to_paste = $.jgrid.CSVtoObject(data, headers, delim, o.paste_newline);
			$("#"+grid_id).jqGrid("updateRowsByIndex", o.startRowIndex, rows_to_paste, o, paste_add);
			if( $.jgrid.isFunction(o.afterPasteData)) {
				o.afterPasteData.call(this, data);
			}
		});
	},
	undoPaste : function( grid_id ) {
		if(!$.jgrid.isLocalStorage()) {
			return;
		}
		var data = localStorage.getItem(grid_id+"_restore");
		if (data) {
			data = JSON.parse( data );
			
			if(Array.isArray(data)) {
				for(let i=0;i<data.length; i++) {
					$("#"+grid_id).jqGrid("setRowData", data[i]["_id_"], data[i]);
				}
			}
		}
		var rws = $("#"+grid_id);
		rws.find("tr.frompaste").each(function(i,n) {
			rws.jqGrid("delRowData", n.id);
		});
	},
	guessDelimiters : function  (data, separators = ['\t', ',', ';', '|']) {
		const idx = separators
			.map((separator) => data.indexOf(separator))
		    .reduce((prev, cur) =>
				prev === -1 || (cur !== -1 && cur < prev) ? cur : prev
			);
		return data[idx] || '\t';
	},
	repeatRow : function( o ) {
		var header=[], h_s = false, $t = this;
		var rows = this.rows, cm = this.p.colModel, source, target, target_ids = [], dat = {}, storeUpdate=[];
		const err = $.jgrid.getRegional(this, 'clipboard.errors');
		for(var j=0; j<rows.length;j++) {
			target = null;
			var row = rows[j];
			if(row.classList.contains("jqgrow")) {
				for (var i=0;i<row.cells.length; i++) {
					if(row.cells[i].classList.contains("selected-cell")) {
						if(h_s===false) {
							header.push(cm[i].name);
							source = row.id;
							try {
								dat[cm[i].name] = $.unformat.call($t,$(row.cells[i]),{rowId:row.id, colModel:cm[i] }, i ) ;
							} catch(e) {
								dat[cm[i].name] = $.jgrid.htmlDecode(row.cells[i].innerHTML) ; //as in getCell
							}
						} else {
							target = row.id;
						}
					}
				}
				if(header.length) {
					h_s = true;
				}
			}
			if(target !== null ) {
				var dd = $(this).jqGrid("getRowData",  target);
				dd["_id_"] = target;
				storeUpdate.push( dd );
				target_ids.push(target);
			}
		}
		if($.jgrid.isLocalStorage()) {
			localStorage.removeItem(this.id + "_restore");
			localStorage.setItem(this.id + "_restore", JSON.stringify(storeUpdate));
		} else {
			$.jgrid.toast({ 
				text: err.local_stor_err, 
				autoCloseTime: 4500, 
				styleUI: this.p.styleUI, 
				type:"warning"
			});
		}
		for(let j=0;j<target_ids.length;j++) {
			$(this).jqGrid('setRowData', target_ids[j], dat);
		}
		o.startCellIndex = null; o.startRowIndex = null;
	},
	repeatCol : function( o ) {
		var header=[], h_s = false, $t = this;
		var rows = this.rows, cm = this.p.colModel, target, fcol, target_ids = [], dat = [], storeUpdate=[];
		const err = $.jgrid.getRegional(this, 'clipboard.errors');
		for(var j=0; j<rows.length;j++) {
			target = null; fcol =  null;
			var row = rows[j];
			if(row.classList.contains("jqgrow")) {
				for (var i=0;i<row.cells.length; i++) {
					if(row.cells[i].classList.contains("selected-cell")) {
						if(h_s===false) {
							header.push(cm[i].name);
						}
						if(fcol===null) {
							try {
								dat.push( $.unformat.call($t,$(row.cells[i]),{rowId:row.id, colModel:cm[i] }, i ) );
							} catch(e) {
								dat.push( $.jgrid.htmlDecode(row.cells[i].innerHTML) ); //as in getCell
							}
						}
						fcol = true;
						target = row.id;
					}
				}
				if(header.length) {
					h_s = true;
				}
			}
			if(target !== null ) {
				var dd = $(this).jqGrid("getRowData",  target);
				dd["_id_"] = target;
				storeUpdate.push( dd );
				target_ids.push(target);
			}
		}
		let setme;
		header.shift();
		if($.jgrid.isLocalStorage()) {
			localStorage.removeItem(this.id + "_restore");
			localStorage.setItem(this.id + "_restore", JSON.stringify(storeUpdate));
		} else {
			$.jgrid.toast({ 
				text: err.local_stor_err, 
				autoCloseTime: 4500, 
				styleUI: this.p.styleUI, 
				type:"warning"
			});
		}		
		for(let j=0; j < target_ids.length; j++) {
			setme ={};
			for (let k=0; k < header.length; k++) {
				setme[header[k]] = dat[j];
			}
			$(this).jqGrid('setRowData', target_ids[j], setme);
		}
		o.startCellIndex = null; o.startRowIndex = null;
	}	
});
$.jgrid.extend({
	bindSelection : function( o ) {
		return this.each(function(){
			var selectTo = function(cell, table) {
				var row = cell.parent();    
				var cellIndex = cell.index();
				var rowIndex = row.index();

				var rowStart, rowEnd, cellStart, cellEnd;

				if (rowIndex < o.startRowIndex) {
					rowStart = rowIndex;
					rowEnd = o.startRowIndex;
				} else {
					rowStart = o.startRowIndex;
					rowEnd = rowIndex;
				}

				if (cellIndex < o.startCellIndex) {
					cellStart = cellIndex;
					cellEnd = o.startCellIndex;
				} else {
					cellStart = o.startCellIndex;
					cellEnd = cellIndex;
				}        

				for (var i = rowStart; i <= rowEnd; i++) {
					var rowCells = table.find("tr").eq(i).find("td");
					for (var j = cellStart; j <= cellEnd; j++) {
						rowCells.eq(j).addClass(selected);
					}        
				}
			};
			
			var selected = 'selected-cell',
				table = $("#"+ $.jgrid.jqID( this.p.id ) ),
				ts = this;
			table.find("td").on('mousedown.jqgselect',function (e) {

				if(e.which === 3) { // right click button for custom copy/paste
					var rect = $("#gbox_"+ts.id)[0].getBoundingClientRect();
					$("#"+ts.p.id+"_copypaste").css({left : e.clientX - rect.left, top: e.clientY - rect.top}).show();
					return false;
				}
				o.isMouseDown = true;
				var cell = $(this);
				table.find("."+selected).removeClass(selected); // deselect everything

				if (e.shiftKey) {
					selectTo(cell, table);                
				} else {
					cell.addClass(selected);
					o.startCellIndex = cell.index();
					o.startRowIndex = cell.parent().index();
				}
				return false; // prevent text selection
			})
			.on("mouseover.jqgselect",function () {
				if (!o.isMouseDown) return;
				table.find("."+ selected).removeClass(selected);
				selectTo($(this), table);
			})
			.on("selectstart.jqgselect", function () {
				return false;
			});
		});
	},
	startClipboard : function( prm ) {
		var o = $.extend({
			copy_delimiter : '\t',
			copy_newline: '\n',
			copy_header_included : true,
			copy_formated_data : true,
			show_info_after_copy: true,
			paste_delimiter : '\t',
			paste_newline : '\n',
			paste_autodetect_delim : true,
			paste_header_included : false,
			paste_skip_formatter : true,
			show_info_after_paste: true,
			beforeCopyData : null,
			afterCopyData :null,
			beforePasteData : null,
			afterPasteData : null,
			menuConfig : {
				copy : true,
				paste: true,
				paste_add : true,
				row_vertical : true,
				row_horizontal : true,
				undo : true,
				cancel : true
			},
			toastPosition : "top center",
			userMenus : [],
			startCellIndex : null,
			startRowIndex : null,
			isMouseDown : false
		}, prm || {});
		
		return this.each(function(){
			var colmenustyle = $.jgrid.styleUI[(this.p.styleUI || 'jQueryUI')].colmenu, $t=this;
			var arf1 = '<ul id="'+this.id+'_copypaste" class="ui-search-menu modal-content column-menu ui-menu jqgrid-caption-menu ' + colmenustyle.menu_widget+'" role="menu" tabindex="0"></ul>';
			$("#gbox_"+this.id).append(arf1);
			const menus = $.jgrid.getRegional(this, 'clipboard.menus'),
			menuicons = $.jgrid.styleUI[(this.p.styleUI || 'jQueryUI')].clipboard,
			iconbase = $.jgrid.styleUI[(this.p.styleUI || 'jQueryUI')].common.icon_base;
			var menu = [], menus_copy = [];
			menu["copy"]= {"id" : "copy_act", icon : iconbase+" "+menuicons.icon_copy ,"title" : menus.copy_act, "click": function() { $.jgrid.copyRows(this.rows,this.p.colModel, o ); } };
			menu["paste"] = {"id" : "paste_act", icon : iconbase+" "+menuicons.icon_paste, "title" : menus.paste_act, "click": function() { $.jgrid.pasteRows.call(this, o, false); } };
			menu["paste_add"] = {"id" : "paste_act_add", icon : iconbase+" "+menuicons.icon_paste_add, "title" : menus.paste_act_add, "click": function() { $.jgrid.pasteRows.call(this, o, true); } };
			menu["row_vertical"] = {"id" : "repeat_act_row", icon : iconbase+" "+menuicons.icon_repeat_row, "title" : menus.repeat_act_row, "click": function() { $.jgrid.repeatRow.call( this, o); } };				
			menu["row_horizontal"] = {"id" : "repeat_act_col", icon : iconbase+" "+menuicons.icon_repeat_col, "title" : menus.repeat_act_col, "click": function() { $.jgrid.repeatCol.call( this, o); } };				
			menu["undo"] = {"id" : "undo_act", icon : iconbase+" "+menuicons.icon_undo, "title" : menus.undo_act, "click": function() { $.jgrid.undoPaste( this.id, o); } };
			menu["cancel"] = {"id" : "cancel_act", icon : iconbase+" "+menuicons.icon_cancel, "title" : menus.cancel_act, "click": function() { $("#"+$t.p.id+"_copypaste").hide(); } };
			//return;
			var cnt =0;
			for(let key in o.menuConfig) {
				if(Object.hasOwn(o.menuConfig, key) && o.menuConfig[key] === true) {
					cnt++;
					if(cnt > 1) {
						menus_copy.push({divider : true});
					}
					menus_copy.push(menu[key]);
				}
			}
			if(Array.isArray(o.userMenus) ) {
				for(let i=0; i< o.userMenus.length; i++) {
					menus_copy.push( o.userMenus[i] );
				}
			}
			$(this).jqGrid("menubarAdd", menus_copy, "_copypaste");
			$(this).on('jqGridAfterGridComplete.setBindSelections',function(){
				$(this).jqGrid('bindSelection', o);
				o.startCellIndex = o.startRowIndex = null;
			});
			$(this).on('jqGridRightClickRow.setBindSelections',function(){
				//console.log(e, id, iRow, iCol, e1);
				return false;
			});
			$(document).on("mouseup.jqgclipme", function () {
				o.isMouseDown = false;
			});
			$("body").on('click.jqgclipme', function(e){
				if(!$(e.target).closest(".ui-jqgrid-menubar").length) {
					try {
						$("#"+$t.p.id+"_copypaste").hide();
					} catch (e1) {}
				}
			});			
			$.jgrid.Permissions.call(this);
			$t.p.isClipboard = true;
			$(this).jqGrid('bindSelection', o);
			o.startCellIndex = o.startRowIndex = null;
		});
	},
	stopClipboard : function() {
		// 
		return this.each(function(){
			var selected = 'selected-cell';
			$("#"+this.p.id+"_copypaste").remove();
			$("body").off("click.jqgclipme");
			$(document).off("mouseup.jqgclipme");
			$(this)
			.off("jqGridAfterGridComplete.setBindSelections")
			.off("jqGridAfterGridComplete.setBindSelections")
			.find("td")
			.removeClass(selected)
			.off("mousedown.jqgselect")
			.off("mouseover.jqgselect")
			.off("selectstart.jqgselect");
			this.p.isClipboard = false;
		});
	},
	updateRowsByIndex : function(startInd, data, o, paste_add) {
		var success = true;
		this.each(function(){
			const err = $.jgrid.getRegional(this, 'clipboard.errors');
			const msg = $.jgrid.getRegional(this, 'clipboard.msg');
			if(Array.isArray(data)) {
				startInd = parseInt(startInd,10);
				if(startInd < 0 ) {
					success = false;
					$.jgrid.toast( {
						text: err.start_ind_err, 
						styleUI: this.p.styleUI,
						autoCloseTime: 4500,
						type:"error"
					});
				}  else {
					var datalen = data.length, i=0, row, grow, storeUpdate = [], inserted = 0, updated =0;
					while(i < datalen) {
						row = data[i];
						grow = this.rows[startInd];
						if( !grow || paste_add===true) {
							$(this).jqGrid("addRowData", null, row, "last", null, "frompaste");// perform add
							inserted++;
						} else {
							let o_row = $(this).jqGrid("getRowData",  grow.id);
							if( !$.isEmptyObject(o_row) ) {
								o_row["_id_"] = grow.id;
								data[i]["_id_"] = grow.id;
								storeUpdate.push( o_row );
								$(this).jqGrid("setRowData",  grow.id, row, undefined , false, o.paste_skip_formatter);
								updated++;
							}
							
						}
						i++;
						startInd++;
					}
					if(storeUpdate.length) {
						if($.jgrid.isLocalStorage()) {
							localStorage.setItem(this.id+"_restore", JSON.stringify(storeUpdate));
						} else {
							$.jgrid.toast({ 
								text: err.local_stor_err, 
								autoCloseTime: 4500, 
								styleUI: this.p.styleUI, 
								type:"warning"
							});
						}
					}
					if(o.show_info_after_paste) {
						$.jgrid.info_dialog(msg.info_cap,'<div>'+msg.total_row +datalen + '</div><div>'+msg.insert_row  + inserted+ '</div><div>'+msg.update_row + updated +'</div>','',{styleUI : this.p.styleUI ,autoClose: true, autoCloseTime:4500});
					}
				}
			} else {
				success = false; 
				$.jgrid.toast({ 
					text: err.not_array_err, 
					autoCloseTime:3500, 
					styleUI: this.p.styleUI, 
					type:"error"
				});
			}
		});
		return success;
	}
// end clipboard grid
});
//clipboard

}));