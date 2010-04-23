/*
 * jqGrid common function
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
*/ 
// Modal functions
var showModal = function(h) {
	h.w.show();
};
var closeModal = function(h) {
	h.w.hide().attr("aria-hidden","true");
	if(h.o) { h.o.remove(); }
};
var hideModal = function (selector,o) {
	o = jQuery.extend({jqm : true, gb :''}, o || {});
    if(o.onClose) {
		var oncret =  o.onClose(selector);
		if (typeof oncret == 'boolean'  && !oncret ) { return; }
    }	
	if (jQuery.fn.jqm && o.jqm === true) {
		jQuery(selector).attr("aria-hidden","true").jqmHide();
	} else {
		if(o.gb != '') {
			try {jQuery(".jqgrid-overlay:first",o.gb).hide();} catch (e){}
		}
		jQuery(selector).hide().attr("aria-hidden","true");
	}
};
//Helper functions
function findPos(obj) {
	var curleft = 0, curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop; 
		} while (obj = obj.offsetParent);
		//do not change obj == obj.offsetParent 
	}
	return [curleft,curtop];
}
var createModal = function(aIDs, content, p, insertSelector, posSelector, appendsel) {
	var mw  = document.createElement('div'), rtlsup;
	rtlsup = jQuery(p.gbox).attr("dir") == "rtl" ? true : false;
	mw.className= "ui-widget ui-widget-content ui-corner-all ui-jqdialog";
	mw.id = aIDs.themodal; 
	var mh = document.createElement('div');
	mh.className = "ui-jqdialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix";
	mh.id = aIDs.modalhead;
	jQuery(mh).append("<span class='ui-jqdialog-title'>"+p.caption+"</span>");
	var ahr= jQuery("<a href='javascript:void(0)' class='ui-jqdialog-titlebar-close ui-corner-all'></a>")
	.hover(function(){ahr.addClass('ui-state-hover');},
		   function(){ahr.removeClass('ui-state-hover');})
	.append("<span class='ui-icon ui-icon-closethick'></span>");
	jQuery(mh).append(ahr);
	if(rtlsup) {
		mw.dir = "rtl";
		jQuery(".ui-jqdialog-title",mh).css("float","right");
		jQuery(".ui-jqdialog-titlebar-close",mh).css("left",0.3+"em");
	} else {
		mw.dir = "ltr";
		jQuery(".ui-jqdialog-title",mh).css("float","left");
		jQuery(".ui-jqdialog-titlebar-close",mh).css("right",0.3+"em");
	}
	var mc = document.createElement('div');
	jQuery(mc).addClass("ui-jqdialog-content ui-widget-content").attr("id",aIDs.modalcontent);
	jQuery(mc).append(content);
	mw.appendChild(mc);
	jQuery(mw).prepend(mh);
	if(appendsel===true) { jQuery('body').append(mw); } //append as first child in body -for alert dialog
	else {jQuery(mw).insertBefore(insertSelector);}
	if(typeof p.jqModal === 'undefined') {p.jqModal = true;} // internal use
	var coord = {};
	if ( jQuery.fn.jqm && p.jqModal === true) {
		if(p.left ===0 && p.top===0) {
			var pos = [];
			pos = findPos(posSelector);
			p.left = pos[0] + 4;
			p.top = pos[1] + 4;
		}
		coord.top = p.top+"px";
		coord.left = p.left;
	} else if(p.left !==0 || p.top!==0) {
		coord.left = p.left;
		coord.top = p.top+"px";
	}
	jQuery("a.ui-jqdialog-titlebar-close",mh).click(function(e){
		var oncm = jQuery("#"+aIDs.themodal).data("onClose") || p.onClose;
		var gboxclose = jQuery("#"+aIDs.themodal).data("gbox") || p.gbox;
		hideModal("#"+aIDs.themodal,{gb:gboxclose,jqm:p.jqModal,onClose:oncm});
		return false;
	});
	if (p.width === 0 || !p.width) {p.width = 300;}
	if(p.height === 0 || !p.height) {p.height =200;}
	if(!p.zIndex) {p.zIndex = 950;}
	var rtlt = 0;
	if( rtlsup && coord.left && !appendsel) {
		rtlt = jQuery(p.gbox).width()- (!isNaN(p.width) ? parseInt(p.width,10) :0) - 8; // to do
		// just in case
		coord.left = parseInt(coord.left,10) + parseInt(rtlt,10);
	}
	if(coord.left) { coord.left += "px"; }
	jQuery(mw).css(jQuery.extend({
		width: isNaN(p.width) ? "auto": p.width+"px",
		height:isNaN(p.height) ? "auto" : p.height + "px",
		zIndex:p.zIndex,
		overflow: 'hidden'
	},coord))
	.attr({tabIndex: "-1","role":"dialog","aria-labelledby":aIDs.modalhead,"aria-hidden":"true"});
	if(typeof p.drag == 'undefined') { p.drag=true;}
	if(typeof p.resize == 'undefined') {p.resize=true;}
	if (p.drag) {
		jQuery(mh).css('cursor','move');
		if(jQuery.fn.jqDrag) {
			jQuery(mw).jqDrag(mh);
		} else {
			try {
				jQuery(mw).draggable({handle: jQuery("#"+mh.id)});
			} catch (e) {}
		}
	}
	if(p.resize) {
		if(jQuery.fn.jqResize) {
			jQuery(mw).append("<div class='jqResize ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se ui-icon-grip-diagonal-se'></div>");
			jQuery("#"+aIDs.themodal).jqResize(".jqResize",aIDs.scrollelm ? "#"+aIDs.scrollelm : false);
		} else {
			try {
				jQuery(mw).resizable({handles: 'se, sw',alsoResize: aIDs.scrollelm ? "#"+aIDs.scrollelm : false});
			} catch (e) {}
		}
	}
	if(p.closeOnEscape === true){
		jQuery(mw).keydown( function( e ) {
			if( e.which == 27 ) {
				var cone = jQuery("#"+aIDs.themodal).data("onClose") || p.onClose;
				hideModal(this,{gb:p.gbox,jqm:p.jqModal,onClose: cone});
			}
		});
	}
};
var viewModal = function (selector,o){
	o = jQuery.extend({
		toTop: true,
		overlay: 10,
		modal: false,
		onShow: showModal,
		onHide: closeModal,
		gbox: '',
		jqm : true,
		jqM : true
	}, o || {});
	if (jQuery.fn.jqm && o.jqm === true) {
		if(o.jqM) { jQuery(selector).attr("aria-hidden","false").jqm(o).jqmShow(); }
		else {jQuery(selector).attr("aria-hidden","false").jqmShow();}
	} else {
		if(o.gbox != '') {
			jQuery(".jqgrid-overlay:first",o.gbox).show();
			jQuery(selector).data("gbox",o.gbox);
		}
		jQuery(selector).show().attr("aria-hidden","false");
		try{jQuery(':input:visible',selector)[0].focus();}catch(_){}
	}
};

function info_dialog(caption, content,c_b, modalopt) {
	var mopt = {
		width:290,
		height:'auto',
		dataheight: 'auto',
		drag: true,
		resize: false,
		caption:"<b>"+caption+"</b>",
		left:250,
		top:170,
		zIndex : 1000,
		jqModal : true,
		modal : false,
		closeOnEscape : true,
		align: 'center',
		buttonalign : 'center',
		buttons : []
		// {text:'textbutt', id:"buttid", onClick : function(){...}}
		// if the id is not provided we set it like info_button_+ the index in the array - i.e info_button_0,info_button_1...
	};
	jQuery.extend(mopt,modalopt || {});
	var jm = mopt.jqModal;
	if(jQuery.fn.jqm && !jm) { jm = false; }
	// in case there is no jqModal
	var buttstr ="";
	if(mopt.buttons.length > 0) {
		for(var i=0;i<mopt.buttons.length;i++) {
			if(typeof mopt.buttons[i].id == "undefined") { mopt.buttons[i].id = "info_button_"+i; }
			buttstr += "<a href='javascript:void(0)' id='"+mopt.buttons[i].id+"' class='fm-button ui-state-default ui-corner-all'>"+mopt.buttons[i].text+"</a>";
		}
	}
	var dh = isNaN(mopt.dataheight) ? mopt.dataheight : mopt.dataheight+"px",
	cn = "text-align:"+mopt.align+";";
	var cnt = "<div id='info_id'>";
	cnt += "<div id='infocnt' style='margin:0px;padding-bottom:1em;width:100%;overflow:auto;position:relative;height:"+dh+";"+cn+"'>"+content+"</div>";
	cnt += c_b ? "<div class='ui-widget-content ui-helper-clearfix' style='text-align:"+mopt.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'><a href='javascript:void(0)' id='closedialog' class='fm-button ui-state-default ui-corner-all'>"+c_b+"</a>"+buttstr+"</div>" :
		buttstr != ""  ? "<div class='ui-widget-content ui-helper-clearfix' style='text-align:"+mopt.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'>"+buttstr+"</div>" : "";
	cnt += "</div>";

	try {
		if(jQuery("#info_dialog").attr("aria-hidden") == "false") {
			hideModal("#info_dialog",{jqm:jm});
		}
		jQuery("#info_dialog").remove();
	} catch (e){}
	createModal({
		themodal:'info_dialog',
		modalhead:'info_head',
		modalcontent:'info_content',
		scrollelm: 'infocnt'},
		cnt,
		mopt,
		'','',true
	);
	// attach onclick after inserting into the dom
	if(buttstr) {
		jQuery.each(mopt.buttons,function(i){
			jQuery("#"+this.id,"#info_id").bind('click',function(){mopt.buttons[i].onClick.call(jQuery("#info_dialog")); return false;});
		});
	}
	jQuery("#closedialog", "#info_id").click(function(e){
		hideModal("#info_dialog",{jqm:jm});
		return false;
	});
	jQuery(".fm-button","#info_dialog").hover(
		function(){jQuery(this).addClass('ui-state-hover');}, 
		function(){jQuery(this).removeClass('ui-state-hover');}
	);
	viewModal("#info_dialog",{
		onHide: function(h) {
			h.w.hide().remove();
			if(h.o) { h.o.remove(); }
		},
		modal :mopt.modal,
		jqm:jm
	});
	try{$("#info_dialog").focus();} catch (e){}
}
// Form Functions
function createEl(eltype,options,vl,autowidth, ajaxso) {
	var elem = "";
	if(options.defaultValue) { delete options.defaultValue; }
	function bindEv (el, opt) {
		if(jQuery.isFunction(opt.dataInit)) {
			// datepicker fix 
			el.id = opt.id;
			opt.dataInit(el);
			delete opt.id;
			delete opt.dataInit;
		}
		if(opt.dataEvents) {
		    jQuery.each(opt.dataEvents, function() {
		        if (this.data !== undefined) {
			        jQuery(el).bind(this.type, this.data, this.fn);
		        } else {
		            jQuery(el).bind(this.type, this.fn);
		        }
		    });
			delete opt.dataEvents;
		}
		return opt;
	}
	switch (eltype)
	{
		case "textarea" :
				elem = document.createElement("textarea");
				if(autowidth) {
					if(!options.cols) { jQuery(elem).css({width:"98%"});}
				} else if (!options.cols) { options.cols = 20; }
				if(!options.rows) { options.rows = 2; }
				if(vl=='&nbsp;' || vl=='&#160;' || (vl.length==1 && vl.charCodeAt(0)==160)) {vl="";}
				elem.value = vl;
				options = bindEv(elem,options);
				jQuery(elem).attr(options).attr({"role":"textbox","multiline":"true"});
				break;
		case "checkbox" : //what code for simple checkbox
			elem = document.createElement("input");
			elem.type = "checkbox";
			if( !options.value ) {
				var vl1 = vl.toLowerCase();
				if(vl1.search(/(false|0|no|off|undefined)/i)<0 && vl1!=="") {
					elem.checked=true;
					elem.defaultChecked=true;
					elem.value = vl;
				} else {
					elem.value = "on";
				}
				jQuery(elem).attr("offval","off");
			} else {
				var cbval = options.value.split(":");
				if(vl === cbval[0]) {
					elem.checked=true;
					elem.defaultChecked=true;
				}
				elem.value = cbval[0];
				jQuery(elem).attr("offval",cbval[1]);
				try {delete options.value;} catch (e){}
			}
			options = bindEv(elem,options);
			jQuery(elem).attr(options).attr("role","checkbox");
			break;
		case "select" :
			elem = document.createElement("select");
			elem.setAttribute("role","select");
			var msl, ovm = [];
			if(options.multiple===true) {
				msl = true;
				elem.multiple="multiple";
				$(elem).attr("aria-multiselectable","true");
			} else { msl = false; }
			if(typeof(options.dataUrl) != "undefined") {
				jQuery.ajax(jQuery.extend({
					url: options.dataUrl,
					type : "GET",
					complete: function(data,status){
						try {delete options.dataUrl; delete options.value;} catch (e){}
						var a;
						if(typeof(options.buildSelect) != "undefined") {
							var b = options.buildSelect(data);
							a = jQuery(b).html();
							delete options.buildSelect;
						} else {
							a = jQuery(data.responseText).html();
						}
						if(a) {
							jQuery(elem).append(a);
							options = bindEv(elem,options);
							if(typeof options.size === 'undefined') { options.size =  msl ? 3 : 1;}
							if(msl) {
								ovm = vl.split(",");
								ovm = jQuery.map(ovm,function(n){return jQuery.trim(n);});
							} else {
								ovm[0] = jQuery.trim(vl);
							}
							jQuery(elem).attr(options);
							setTimeout(function(){
								jQuery("option",elem).each(function(i){
									if(i===0) { this.selected = ""; }
									$(this).attr("role","option");
									if(jQuery.inArray(jQuery.trim(jQuery(this).text()),ovm) > -1 || jQuery.inArray(jQuery.trim(jQuery(this).val()),ovm) > -1 ) {
										this.selected= "selected";
										if(!msl) { return false; }
									}
								});
							},0);
						}
					}
				},ajaxso || {}));
			} else if(options.value) {
				var i;
				if(msl) {
					ovm = vl.split(",");
					ovm = jQuery.map(ovm,function(n){return jQuery.trim(n);});
					if(typeof options.size === 'undefined') {options.size = 3;}
				} else {
					options.size = 1;
				}
				if(typeof options.value === 'function') { options.value = options.value(); }
				var so,sv, ov;
				if(typeof options.value === 'string') {
					so = options.value.split(";");
					for(i=0; i<so.length;i++){
						sv = so[i].split(":");
						if(sv.length > 2 ) {
							sv[1] = jQuery.map(sv,function(n,i){if(i>0) { return n;} }).join(":");
						}
						ov = document.createElement("option");
						ov.setAttribute("role","option");
						ov.value = sv[0]; ov.innerHTML = sv[1];
						if (!msl &&  (jQuery.trim(sv[0]) == jQuery.trim(vl) || jQuery.trim(sv[1]) == jQuery.trim(vl))) { ov.selected ="selected"; }
						if (msl && (jQuery.inArray(jQuery.trim(sv[1]), ovm)>-1 || jQuery.inArray(jQuery.trim(sv[0]), ovm)>-1)) {ov.selected ="selected";}
						elem.appendChild(ov);
					}
				} else if (typeof options.value === 'object') {
					var oSv = options.value;
					for ( var key in oSv) {
						if (oSv.hasOwnProperty(key ) ){
							ov = document.createElement("option");
							ov.setAttribute("role","option");
							ov.value = key; ov.innerHTML = oSv[key];
							if (!msl &&  ( jQuery.trim(key) == jQuery.trim(vl) || jQuery.trim(oSv[key]) == jQuery.trim(vl)) ) { ov.selected ="selected"; }
							if (msl && (jQuery.inArray(jQuery.trim(oSv[key]),ovm)>-1 || jQuery.inArray(jQuery.trim(key),ovm)>-1)) { ov.selected ="selected"; }
							elem.appendChild(ov);
						}
					}
				}
				options = bindEv(elem,options);
				try {delete options.value;} catch (e){}
				jQuery(elem).attr(options);
			}
			break;
		case "text" :
		case "password" :
		case "button" :
			var role;
			if(eltype=="button") { role = "button"; }
			else { role = "textbox"; }
			elem = document.createElement("input");
			elem.type = eltype;
			elem.value = vl;
			options = bindEv(elem,options);
			if(eltype != "button"){
				if(autowidth) {
					if(!options.size) { jQuery(elem).css({width:"98%"}); }
				} else if (!options.size) { options.size = 20; }
			}
			jQuery(elem).attr(options).attr("role",role);
			break;
		case "image" :
		case "file" :
			elem = document.createElement("input");
			elem.type = eltype;
			options = bindEv(elem,options);
			jQuery(elem).attr(options);
			break;
		case "custom" :
			elem = document.createElement("span");
			try {
				if(jQuery.isFunction(options.custom_element)) {
					var celm = options.custom_element.call(this,vl,options);
					if(celm) {
						celm = jQuery(celm).addClass("customelement").attr({id:options.id,name:options.name});
						jQuery(elem).empty().append(celm);
					} else {
						throw "e2";
					}
				} else {
					throw "e1";
				}
			} catch (e) {
				if (e=="e1") { info_dialog(jQuery.jgrid.errors.errcap,"function 'custom_element' "+jQuery.jgrid.edit.msg.nodefined, jQuery.jgrid.edit.bClose);}
				if (e=="e2") { info_dialog(jQuery.jgrid.errors.errcap,"function 'custom_element' "+jQuery.jgrid.edit.msg.novalue,jQuery.jgrid.edit.bClose);}
				else { info_dialog(jQuery.jgrid.errors.errcap,e.message,jQuery.jgrid.edit.bClose); }
			}
			break;
	}
	return elem;
}
// Date Validation Javascript
function daysInFebruary (year){
	// February has 29 days in any year evenly divisible by four,
    // EXCEPT for centurial years which are not also divisible by 400.
    return (((year % 4 === 0) && ( year % 100 !== 0 || (year % 400 === 0))) ? 29 : 28 );
}
function DaysArray(n) {
	for (var i = 1; i <= n; i++) {
		this[i] = 31;
		if (i==4 || i==6 || i==9 || i==11) {this[i] = 30;}
		if (i==2) {this[i] = 29;}
	} 
	return this;
}
function checkDate (format, date) {
	var tsp = {}, sep;
	format = format.toLowerCase();
	//we search for /,-,. for the date separator
	if(format.indexOf("/") != -1) {
		sep = "/";
	} else if(format.indexOf("-") != -1) {
		sep = "-";
	} else if(format.indexOf(".") != -1) {
		sep = ".";
	} else {
		sep = "/";
	}
	format = format.split(sep);
	date = date.split(sep);
	if (date.length != 3) { return false; }
	var j=-1,yln, dln=-1, mln=-1;
	for(var i=0;i<format.length;i++){
		var dv =  isNaN(date[i]) ? 0 : parseInt(date[i],10); 
		tsp[format[i]] = dv;
		yln = format[i];
		if(yln.indexOf("y") != -1) { j=i; }
		if(yln.indexOf("m") != -1) { mln=i; }
		if(yln.indexOf("d") != -1) { dln=i; }
	}
	if (format[j] == "y" || format[j] == "yyyy") {
		yln=4;
	} else if(format[j] =="yy"){
		yln = 2;
	} else {
		yln = -1;
	}
	var daysInMonth = DaysArray(12);
	var strDate;
	if (j === -1) {
		return false;
	} else {
		strDate = tsp[format[j]].toString();
		if(yln == 2 && strDate.length == 1) {yln = 1;}
		if (strDate.length != yln || (tsp[format[j]]===0 && date[j]!="00")){
			return false;
		}
	}
	if(mln === -1) {
		return false;
	} else {
		strDate = tsp[format[mln]].toString();
		if (strDate.length<1 || tsp[format[mln]]<1 || tsp[format[mln]]>12){
			return false;
		}
	}
	if(dln === -1) {
		return false;
	} else {
		strDate = tsp[format[dln]].toString();
		if (strDate.length<1 || tsp[format[dln]]<1 || tsp[format[dln]]>31 || (tsp[format[mln]]==2 && tsp[format[dln]]>daysInFebruary(tsp[format[j]])) || tsp[format[dln]] > daysInMonth[tsp[format[mln]]]){
			return false;
		}
	}
	return true;
}

function isEmpty(val)
{
	if (val.match(/^s+$/) || val == "")	{
		return true;
	} else {
		return false;
	} 
}
function checkTime(time){
	// checks only hh:ss (and optional am/pm)
	var re = /^(\d{1,2}):(\d{2})([ap]m)?$/,regs;
	if(!isEmpty(time))
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
}
function checkValues(val, valref,g) {
	var edtrul,i, nm;
	if(typeof(valref)=='string'){
		for( i =0, len=g.p.colModel.length;i<len; i++){
			if(g.p.colModel[i].name==valref) {
				edtrul = g.p.colModel[i].editrules;
				valref = i;
				try { nm = g.p.colModel[i].formoptions.label; } catch (e) {}
				break;
			}
		}
	} else if(valref >=0) {
		edtrul = g.p.colModel[valref].editrules;
	}
	if(edtrul) {
		if(!nm) { nm = g.p.colNames[valref]; }
		if(edtrul.required === true) {
			if( val.match(/^s+$/) || val == "" )  { return [false,nm+": "+jQuery.jgrid.edit.msg.required,""]; }
		}
		// force required
		var rqfield = edtrul.required === false ? false : true;
		if(edtrul.number === true) {
			if( !(rqfield === false && isEmpty(val)) ) {
				if(isNaN(val)) { return [false,nm+": "+jQuery.jgrid.edit.msg.number,""]; }
			}
		}
		if(typeof edtrul.minValue != 'undefined' && !isNaN(edtrul.minValue)) {
			if (parseFloat(val) < parseFloat(edtrul.minValue) ) { return [false,nm+": "+jQuery.jgrid.edit.msg.minValue+" "+edtrul.minValue,""];}
		}
		if(typeof edtrul.maxValue != 'undefined' && !isNaN(edtrul.maxValue)) {
			if (parseFloat(val) > parseFloat(edtrul.maxValue) ) { return [false,nm+": "+jQuery.jgrid.edit.msg.maxValue+" "+edtrul.maxValue,""];}
		}
		var filter;
		if(edtrul.email === true) {
			if( !(rqfield === false && isEmpty(val)) ) {
			// taken from jquery Validate plugin
				filter = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
				if(!filter.test(val)) {return [false,nm+": "+jQuery.jgrid.edit.msg.email,""];}
			}
		}
		if(edtrul.integer === true) {
			if( !(rqfield === false && isEmpty(val)) ) {
				if(isNaN(val)) { return [false,nm+": "+jQuery.jgrid.edit.msg.integer,""]; }
				if ((val % 1 !== 0) || (val.indexOf('.') != -1)) { return [false,nm+": "+jQuery.jgrid.edit.msg.integer,""];}
			}
		}
		if(edtrul.date === true) {
			if( !(rqfield === false && isEmpty(val)) ) {
				var dft = g.p.colModel[valref].datefmt || "Y-m-d";
				if(!checkDate (dft, val)) { return [false,nm+": "+jQuery.jgrid.edit.msg.date+" - "+dft,""]; }
			}
		}
		if(edtrul.time === true) {
			if( !(rqfield === false && isEmpty(val)) ) {
				if(!checkTime (val)) { return [false,nm+": "+jQuery.jgrid.edit.msg.date+" - hh:mm (am/pm)",""]; }
			}
		}
        if(edtrul.url === true) {
            if( !(rqfield === false && isEmpty(val)) ) {
                filter = /^(((https?)|(ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i;
                if(!filter.test(val)) {return [false,nm+": "+jQuery.jgrid.edit.msg.url,""];}
            }
        }
		if(edtrul.custom === true) {
            if( !(rqfield === false && isEmpty(val)) ) {
				if(jQuery.isFunction(edtrul.custom_func)) {
					var ret = edtrul.custom_func.call(g,val,nm);
					if(jQuery.isArray(ret)) {
						return ret;
					} else {
						return [false,jQuery.jgrid.edit.msg.customarray,""];
					}
				} else {
					return [false,jQuery.jgrid.edit.msg.customfcheck,""];
				}
			}
		}
	}
	return [true,"",""];
}
