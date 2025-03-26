/*jshint eqeqeq:false */
/*global jQuery, define */
(function( factory ) {
	"use strict";
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./grid.base",
			"./jqModal",
			"./jqDnR"
		], factory );
	} else {
		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
"use strict";
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
//module end
}));
