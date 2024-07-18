!function(e){"function"==typeof define&&define.amd?define(["jquery","./grid.base","./jqModal","./jqDnR"],e):e(jQuery)}(function(y){y.extend(y.jgrid,{showModal:function(e){e.w.show()},closeModal:function(e){e.w.hide().attr("aria-hidden","true"),e.o&&e.o.remove()},hideModal:function(e,t){var i,a,o=!(!(t=y.extend({jqm:!0,gb:"",removemodal:!1,formprop:!1,form:""},t||{})).gb||"string"!=typeof t.gb||"#gbox_"!==t.gb.slice(0,6))&&y("#"+t.gb.slice(6))[0];if(t.onClose){var r=o?t.onClose.call(o,e):t.onClose(e);if("boolean"==typeof r&&!r)return}if(t.formprop&&o&&t.form&&("edit"===t.form?(i="#"+y.jgrid.jqID("FrmGrid_"+t.gb.slice(6)),a="formProp"):"view"===t.form&&(i="#"+y.jgrid.jqID("ViewGrid_"+t.gb.slice(6)),a="viewProp"),y(o).data(a,{top:y.jgrid.floatNum(y(e).css("top")),left:y.jgrid.floatNum(y(e).css("left")),width:y.jgrid.floatNum(y(e)[0].style.width),height:y.jgrid.floatNum(y(e)[0].style.height),dataheight:y(i).height(),datawidth:y(i).width()})),y.fn.jqm&&!0===t.jqm)y(e).attr("aria-hidden","true").jqmHide();else{if(""!==t.gb)try{y(t.gb).find(".jqgrid-overlay").first().hide()}catch(e){}try{y(".jqgrid-overlay-modal").hide()}catch(e){}y(e).hide().attr("aria-hidden","true")}t.removemodal&&y(e).remove()},findPos:function(e){e=y(e).offset();return[e.left,e.top]},createModal:function(i,e,a,t,o,r,l){a=y.extend(!0,{},y.jgrid.jqModal||{},a);var n=this,d="rtl"===y(a.gbox).attr("dir"),s=y.jgrid.styleUI[a.styleUI||"jQueryUI"].modal,u=y.jgrid.styleUI[a.styleUI||"jQueryUI"].common,c=document.createElement("div"),m=(l=y.extend({},l||{}),c.className="ui-jqdialog "+s.modal,c.id=i.themodal,document.createElement("div")),f=(m.className="ui-jqdialog-titlebar "+s.header,m.id=i.modalhead,y(m).append("<span class='ui-jqdialog-title "+s.title+"'>"+a.caption+"</span>"),y("<a class='ui-jqdialog-titlebar-close "+u.cornerall+"' aria-label='Close'></a>").hover(function(){f.addClass(u.hover)},function(){f.removeClass(u.hover)}).append("<span class='"+u.icon_base+" "+s.icon_close+"'></span>")),g=(y(m).append(f),d?(c.dir="rtl",y(".ui-jqdialog-title",m).css("float","right"),y(".ui-jqdialog-titlebar-close",m).css("left","0.3em")):(c.dir="ltr",y(".ui-jqdialog-title",m).css("float","left"),y(".ui-jqdialog-titlebar-close",m).css("right","0.3em")),document.createElement("div")),e=(y(g).addClass("ui-jqdialog-content "+s.content).attr("id",i.modalcontent),y(g).append(e),c.appendChild(g),y(c).prepend(m),!0===r?y("body").append(c):"string"==typeof r?y(r).append(c):y(c).insertBefore(t),y(c).css(l),void 0===a.jqModal&&(a.jqModal=!0),{});if(y.fn.jqm&&!0===a.jqModal?(0===a.left&&0===a.top&&a.overlay&&(g=[],g=y.jgrid.findPos(o),a.left=g[0]+4,a.top=g[1]+4,d)&&!r&&(a.left=y(a.gbox).outerWidth()-(isNaN(a.width)?300:parseInt(a.width,10))),e.top=a.top+"px",e.left=a.left+"px"):0===a.left&&0===a.top||(e.left=a.left+"px",e.top=a.top+"px"),y("a.ui-jqdialog-titlebar-close",m).click(function(){var e=y("#"+y.jgrid.jqID(i.themodal)).data("onClose")||a.onClose,t=y("#"+y.jgrid.jqID(i.themodal)).data("gbox")||a.gbox;return n.hideModal("#"+y.jgrid.jqID(i.themodal),{gb:t,jqm:a.jqModal,onClose:e,removemodal:a.removemodal||!1,formprop:!a.recreateForm||!1,form:a.form||""}),!1}),0!==a.width&&a.width||(a.width=300),0!==a.height&&a.height||(a.height=200),a.zIndex||(l=y(t).parents("*[role=dialog]").first().css("z-index"),a.zIndex=l?parseInt(l,10)+2:950),y(c).css(y.extend({width:isNaN(a.width)?"auto":a.width+"px",height:isNaN(a.height)?"auto":a.height+"px",zIndex:a.zIndex,overflow:"hidden"},e)).attr({tabIndex:"-1",role:"dialog","aria-labelledby":i.modalhead,"aria-hidden":"true"}),void 0===a.drag&&(a.drag=!0),void 0===a.resize&&(a.resize=!0),a.drag)if(y(m).css("cursor","move"),y.fn.tinyDraggable)y(c).tinyDraggable({handle:"#"+y.jgrid.jqID(m.id)});else try{y(c).draggable({handle:y("#"+y.jgrid.jqID(m.id))})}catch(e){}if(a.resize)if(y.fn.jqResize)y(c).append("<div class='jqResize "+s.resizable+" "+u.icon_base+" "+s.icon_resizable+"'></div>"),y("#"+y.jgrid.jqID(i.themodal)).jqResize(".jqResize",!!i.scrollelm&&"#"+y.jgrid.jqID(i.scrollelm));else try{y(c).resizable({handles:"se, sw",alsoResize:!!i.scrollelm&&"#"+y.jgrid.jqID(i.scrollelm)})}catch(e){}!0===a.closeOnEscape&&y(c).keydown(function(e){27===e.which&&(e=y("#"+y.jgrid.jqID(i.themodal)).data("onClose")||a.onClose,n.hideModal("#"+y.jgrid.jqID(i.themodal),{gb:a.gbox,jqm:a.jqModal,onClose:e,removemodal:a.removemodal||!1,formprop:!a.recreateForm||!1,form:a.form||""}))})},viewModal:function(e,t){var i="";if((t=y.extend({toTop:!0,overlay:10,modal:!1,overlayClass:"ui-widget-overlay",onShow:y.jgrid.showModal,onHide:y.jgrid.closeModal,gbox:"",jqm:!0,jqM:!0},t||{})).gbox){var a=y("#"+t.gbox.substring(6))[0];try{i=y(a).jqGrid("getStyleUI",a.p.styleUI+".common","overlay",!1,"jqgrid-overlay-modal"),t.overlayClass=y(a).jqGrid("getStyleUI",a.p.styleUI+".common","overlay",!0)}catch(e){}}if(void 0===t.focusField&&(t.focusField=0),"number"==typeof t.focusField&&0<=t.focusField?t.focusField=parseInt(t.focusField,10):"boolean"!=typeof t.focusField||t.focusField?t.focusField=0:t.focusField=!1,y.fn.jqm&&!0===t.jqm)(t.jqM?y(e).attr("aria-hidden","false").jqm(t):y(e).attr("aria-hidden","false")).jqmShow();else if(""!==t.gbox&&(a=parseInt(y(e).css("z-index"))-1,t.modal?(y(".jqgrid-overlay-modal")[0]||y("body").prepend("<div "+i+"></div>"),y(".jqgrid-overlay-modal").css("z-index",a).show()):(y(t.gbox).find(".jqgrid-overlay").first().css("z-index",a).show(),y(e).data("gbox",t.gbox))),y(e).show().attr("aria-hidden","false"),0<=t.focusField)try{y(":input:visible",e)[t.focusField].focus()}catch(e){}},info_dialog:function(e,t,i,a){var o,r={width:350,height:"auto",dataheight:"auto",drag:!0,resize:!1,left:window.innerWidth/2-145,top:window.innerHeight/2-150,zIndex:1e3,jqModal:!0,modal:!1,closeOnEscape:!0,align:"center",buttonalign:"center",buttons:[],overlay:10,overlayClass:""},l=(y.extend(!0,r,y.jgrid.jqModal||{},{caption:"<b>"+e+"</b>"},a||{}),r.jqModal),n=this,e=y.jgrid.styleUI[r.styleUI||y.jgrid.defaults.styleUI||"jQueryUI"].modal,d=y.jgrid.styleUI[r.styleUI||y.jgrid.defaults.styleUI||"jQueryUI"].common,s=(r.overlayClass||(r.overlayClass=d.overlay),y.fn.jqm&&!l&&(l=!1),"");if(0<r.buttons.length)for(o=0;o<r.buttons.length;o++)void 0===r.buttons[o].id&&(r.buttons[o].id="info_button_"+o),s+="<a id='"+r.buttons[o].id+"' class='fm-button "+d.button+"'>"+r.buttons[o].text+"</a>";var a=isNaN(r.dataheight)?r.dataheight:r.dataheight+"px",u="text-align:"+r.align+";",c="<div id='info_id'>",c=(c+="<div id='infocnt' class='"+e.body+"' style='margin:0px;padding-bottom:1em;width:100%;overflow:auto;position:relative;height:"+a+";"+u+"'>"+t+"</div>")+(i?"<div class='"+e.footer+"' style='text-align:"+r.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'><a id='closedialog' class='fm-button "+d.button+"'>"+i+"</a>"+s+"</div>":""!==s?"<div class='"+e.footer+"' style='text-align:"+r.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'>"+s+"</div>":"")+"</div>";try{"false"===y("#info_dialog").attr("aria-hidden")&&y.jgrid.hideModal("#info_dialog",{jqm:l}),y("#info_dialog").remove()}catch(e){}a=y(".ui-jqgrid").css("font-size")||"11px";y.jgrid.createModal({themodal:"info_dialog",modalhead:"info_head",modalcontent:"info_content",scrollelm:"infocnt"},c,r,"","",!0,{"font-size":a}),s&&y.each(r.buttons,function(e){y("#"+y.jgrid.jqID(this.id),"#info_id").on("click",function(){return r.buttons[e].onClick.call(y("#info_dialog")),!1})}),y("#closedialog","#info_id").on("click",function(){return n.hideModal("#info_dialog",{jqm:l,onClose:y("#info_dialog").data("onClose")||r.onClose,gb:y("#info_dialog").data("gbox")||r.gbox}),!1}),y(".fm-button","#info_dialog").hover(function(){y(this).addClass(d.hover)},function(){y(this).removeClass(d.hover)}),y.jgrid.isFunction(r.beforeOpen)&&r.beforeOpen(),y.jgrid.viewModal("#info_dialog",{onHide:function(e){e.w.hide().remove(),e.o&&e.o.remove()},modal:r.modal,jqm:l,overlay:r.overlay,overlayClass:r.overlayClass}),y.jgrid.isFunction(r.afterOpen)&&r.afterOpen();try{y("#info_dialog").focus()}catch(e){}},bindEv:function(e,i){y.jgrid.isFunction(i.dataInit)&&i.dataInit.call(this,e,i),i.dataEvents&&y.each(i.dataEvents,function(){var t=this.fn;void 0!==this.data?y(e).on(this.type,this.data,function(e){t.call(this,e,i)}):y(e).on(this.type,function(e){t.call(this,e,i)})})},createEl:function(e,t,i,a,o){var r="",c=this;function m(i,e,t){var a=(a=["dataInit","dataEvents","dataUrl","buildSelect","sopt","searchhidden","defaultValue","attr","custom_element","custom_value","oper"]).concat(["cacheUrlData","delimiter","separator"]);void 0!==t&&Array.isArray(t)&&y.merge(a,t),y.each(e,function(e,t){-1===y.inArray(e,a)&&y(i).attr(e,t)}),e.hasOwnProperty("id")||y(i).attr("id",y.jgrid.randId())}switch(e){case"textarea":r=document.createElement("textarea"),a?t.cols||y(r).css({width:"98%"}):t.cols||(t.cols=20),t.rows||(t.rows=2),("&nbsp;"===i||"&#160;"===i||1===i.length&&160===i.charCodeAt(0))&&(i=""),r.value=i,y(r).attr({role:"textbox",multiline:"true"}),m(r,t);break;case"checkbox":(r=document.createElement("input")).type="checkbox",t.value?(i===(s=t.value.split(":"))[0]&&(r.checked=!0,r.defaultChecked=!0),r.value=s[0],y(r).attr("offval",s[1])):((s=(i+"").toLowerCase()).search(/(false|f|0|no|n|off|undefined)/i)<0&&""!==s?(r.checked=!0,r.defaultChecked=!0,r.value=i):r.value="on",y(r).attr("offval","off")),y(r).attr("role","checkbox"),m(r,t,["value"]);break;case"select":(r=document.createElement("select")).setAttribute("role","listbox");var l,n,d=[];if(!0===t.multiple?(l=!0,r.multiple="multiple",y(r).attr("aria-multiselectable","true")):l=!1,null!=t.dataUrl){var s=null,f=t.postData||o.postData;try{s=t.rowId}catch(e){}c.p&&c.p.idPrefix&&(s=y.jgrid.stripPref(c.p.idPrefix,s)),y.ajax(y.extend({url:y.jgrid.isFunction(t.dataUrl)?t.dataUrl.call(c,s,i,String(t.name)):t.dataUrl,type:"GET",dataType:"html",data:y.jgrid.isFunction(f)?f.call(c,s,i,String(t.name)):f,context:{elem:r,options:t,vl:i},success:function(e){var t,i,a=[],o=this.elem,r=this.vl,l=y.extend({},this.options),n=!0===l.multiple,d=!0===l.cacheUrlData,s="",u=[],e=y.jgrid.isFunction(l.buildSelect)?l.buildSelect.call(c,e):e;(e="string"==typeof e?y(y.jgrid.trim(e)).html():e)&&(y(o).append(e),m(o,l,f?["postData"]:void 0),void 0===l.size&&(l.size=n?3:1),n?(e=void 0===l.multiseparator?",":l.multiseparator,a=r.split(e),a=y.map(a,function(e){return y.jgrid.trim(e)})):a[0]=y.jgrid.trim(r),y("option",o).each(function(e){t=y(this).text(),r=y(this).val(),d&&(s+=(0!==e?";":"")+r+":"+t),0===e&&o.multiple&&(this.selected=!1),y(this).attr("role","option"),(-1<y.inArray(y.jgrid.trim(t),a)||-1<y.inArray(y.jgrid.trim(r),a))&&(this.selected="selected",u.push(r))}),l.hasOwnProperty("checkUpdate")&&l.checkUpdate&&(c.p.savedData[l.name]=u.join(",")),d&&("edit"===l.oper?y(c).jqGrid("setColProp",l.name,{editoptions:{buildSelect:null,dataUrl:null,value:s}}):"search"===l.oper?y(c).jqGrid("setColProp",l.name,{searchoptions:{dataUrl:null,value:s}}):"filter"===l.oper&&y("#fbox_"+c.p.id)[0].p&&(n=y("#fbox_"+c.p.id)[0].p.columns,y.each(n,function(e){if(i=this.index||this.name,l.name===i)return this.searchoptions.dataUrl=null,this.searchoptions.value=s,!1}))),y(c).triggerHandler("jqGridAddEditAfterSelectUrlComplete",[o]))}},o||{}))}else if(t.value){void 0===t.size&&(t.size=l?3:1),l&&(d=i.split(","),d=y.map(d,function(e){return y.jgrid.trim(e)})),"function"==typeof t.value&&(t.value=t.value.call(c,i,t));var u,g,p,h,j,v,b=void 0===t.separator?":":t.separator,s=void 0===t.delimiter?";":t.delimiter;if("string"==typeof t.value)for(u=t.value.split(s),n=0;n<u.length;n++)2<(g=u[n].split(b)).length&&(g[1]=y.map(g,function(e,t){if(0<t)return e}).join(b)),(p=document.createElement("option")).setAttribute("role","option"),p.value=g[0],p.innerHTML=g[1],0==g[1].length&&p.setAttribute("aria-label","none"),r.appendChild(p),l||y.jgrid.trim(g[0])!==y.jgrid.trim(i)&&y.jgrid.trim(g[1])!==y.jgrid.trim(i)||(p.selected="selected"),l&&(-1<y.inArray(y.jgrid.trim(g[1]),d)||-1<y.inArray(y.jgrid.trim(g[0]),d))&&(p.selected="selected");else if("[object Array]"===Object.prototype.toString.call(t.value))for(h=t.value,n=0;n<h.length;n++)2===h[n].length&&(j=h[n][0],v=h[n][1],(p=document.createElement("option")).setAttribute("role","option"),p.value=j,0==(p.innerHTML=v).length&&p.setAttribute("aria-label","none"),r.appendChild(p),l||y.jgrid.trim(j)!==y.jgrid.trim(i)&&y.jgrid.trim(v)!==y.jgrid.trim(i)||(p.selected="selected"),l)&&(-1<y.inArray(y.jgrid.trim(v),d)||-1<y.inArray(y.jgrid.trim(j),d))&&(p.selected="selected");else if("object"==typeof t.value)for(j in h=t.value)h.hasOwnProperty(j)&&((p=document.createElement("option")).setAttribute("role","option"),p.value=j,p.innerHTML=h[j],0==h[j].length&&p.setAttribute("aria-label","none"),r.appendChild(p),l||y.jgrid.trim(j)!==y.jgrid.trim(i)&&y.jgrid.trim(h[j])!==y.jgrid.trim(i)||(p.selected="selected"),l)&&(-1<y.inArray(y.jgrid.trim(h[j]),d)||-1<y.inArray(y.jgrid.trim(j),d))&&(p.selected="selected");m(r,t,["value"])}else m(r,t);break;case"image":case"file":(r=document.createElement("input")).type=e,m(r,t);break;case"custom":r=document.createElement("span");try{if(!y.jgrid.isFunction(t.custom_element))throw"e1";var F=t.custom_element.call(c,i,t);if(!F)throw"e2";F=y(F).addClass("customelement").attr({id:t.id,name:t.name}),y(r).empty().append(F)}catch(e){s=y.jgrid.getRegional(c,"errors"),F=y.jgrid.getRegional(c,"edit");"e1"===e?y.jgrid.info_dialog(s.errcap,"function 'custom_element' "+F.msg.nodefined,F.bClose,{styleUI:c.p.styleUI}):"e2"===e?y.jgrid.info_dialog(s.errcap,"function 'custom_element' "+F.msg.novalue,F.bClose,{styleUI:c.p.styleUI}):y.jgrid.info_dialog(s.errcap,"string"==typeof e?e:e.message,F.bClose,{styleUI:c.p.styleUI})}break;default:s="button"===e?"button":"textbox";(r=document.createElement("input")).type=e,r.value=i,"button"!==e&&(a?t.size||y(r).css({width:"96%"}):t.size||(t.size=20)),y(r).attr("role",s),m(r,t)}return r},checkDate:function(e,t){var i={},a=-1!==(e=e.toLowerCase()).indexOf("/")?"/":-1!==e.indexOf("-")?"-":-1!==e.indexOf(".")?".":"/";if(e=e.split(a),3!==(t=t.split(a)).length)return!1;for(var o=-1,r=-1,l=-1,n=0;n<e.length;n++){var d=isNaN(t[n])?0:parseInt(t[n],10);i[e[n]]=d,-1!==(s=e[n]).indexOf("y")&&(o=n),-1!==s.indexOf("m")&&(l=n),-1!==s.indexOf("d")&&(r=n)}var s="y"===e[o]||"yyyy"===e[o]?4:"yy"===e[o]?2:-1;return-1!==o&&(a=i[e[o]].toString(),2===s&&1===a.length&&(s=1),a.length===s)&&(0!==i[e[o]]||"00"===t[o])&&-1!==l&&!(i[e[l]].toString().length<1||i[e[l]]<1||12<i[e[l]]||-1===r||i[e[r]].toString().length<1||i[e[r]]<1||31<i[e[r]]||2===i[e[l]]&&i[e[r]]>((a=i[e[o]])%4!=0||a%100==0&&a%400!=0?28:29)||i[e[r]]>[0,31,29,31,30,31,30,31,31,30,31,30,31][i[e[l]]])},isEmpty:function(e){return!(void 0!==e&&!e.match(/^\s+$/)&&""!==e)},checkTime:function(e){if(!y.jgrid.isEmpty(e)){if(!(e=e.match(/^(\d{1,2}):(\d{2})([apAP][Mm])?$/)))return!1;if(e[3]){if(e[1]<1||12<e[1])return!1}else if(23<e[1])return!1;if(59<e[2])return!1}return!0},checkValues:function(e,t,i,a){function o(e){var t,i;return!(2<=(e=e.toString()).length&&("-"===e[0]?(t=e[1],e[2]&&(i=e[2])):(t=e[0],e[1]&&(i=e[1])),"0"===t)&&"."!==i)&&"number"==typeof Number(e)&&isFinite(e)}var r,l,n,d,s,u=this,c=u.p.colModel,m=y.jgrid.getRegional(this,"edit.msg");if(void 0===i)if("string"==typeof t){for(l=0,s=c.length;l<s;l++)if(c[l].name===t){r=c[l].editrules,null!=c[t=l].formoptions&&(n=c[l].formoptions.label);break}}else 0<=t&&(r=c[t].editrules);else r=i,n=void 0===a?"_":a;if(r){if(n=n||(null!=u.p.colNames?u.p.colNames[t]:c[t].label),!0===r.required&&y.jgrid.isEmpty(e))return[!1,n+": "+m.required,""];i=!1!==r.required;if(!0===r.number&&!(!1==i&&y.jgrid.isEmpty(e)||o(e)))return[!1,n+": "+m.number,""];if(void 0!==r.minValue&&!isNaN(r.minValue)&&y.jgrid.floatNum(e)<y.jgrid.floatNum(r.minValue))return[!1,n+": "+m.minValue+" "+r.minValue,""];if(void 0!==r.maxValue&&!isNaN(r.maxValue)&&y.jgrid.floatNum(e)>y.jgrid.floatNum(r.maxValue))return[!1,n+": "+m.maxValue+" "+r.maxValue,""];if(!0===r.email&&!(!1==i&&y.jgrid.isEmpty(e)||/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(e)))return[!1,n+": "+m.email,""];if(!0===r.integer&&(!1!=i||!y.jgrid.isEmpty(e))){if(!o(e))return[!1,n+": "+m.integer,""];if(e%1!=0||-1!==e.indexOf("."))return[!1,n+": "+m.integer,""]}if(!0===r.date&&!(!1==i&&y.jgrid.isEmpty(e)||(c[t].formatoptions&&c[t].formatoptions.newformat?(d=c[t].formatoptions.newformat,(a=y.jgrid.getRegional(u,"formatter.date.masks"))&&a.hasOwnProperty(d)&&(d=a[d])):d=c[t].datefmt||"Y-m-d",y.jgrid.checkDate(d,e))))return[!1,n+": "+m.date+" - "+d,""];if(!0===r.time&&!(!1==i&&y.jgrid.isEmpty(e)||y.jgrid.checkTime(e)))return[!1,n+": "+m.date+" - hh:mm (am/pm)",""];if(!0===r.url&&!(!1==i&&y.jgrid.isEmpty(e)||/^(((https?)|(ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i.test(e)))return[!1,n+": "+m.url,""];if(!0===r.custom)if(!1!=i||!y.jgrid.isEmpty(e))return y.jgrid.isFunction(r.custom_func)?(a=r.custom_func.call(u,e,n,t),Array.isArray(a)?a:[!1,m.customarray,""]):[!1,m.customfcheck,""]}return[!0,"",""]},validateForm:function(e){for(var t,i=!0,a=0;a<e.elements.length;a++)if(("INPUT"===(t=e.elements[a]).nodeName||"TEXTAREA"===t.nodeName||"SELECT"===t.nodeName)&&(void 0!==t.willValidate?("INPUT"===t.nodeName&&t.type!==t.getAttribute("type")&&t.setCustomValidity(y.jgrid.LegacyValidation(t)?"":"error"),t.reportValidity()):(t.validity=t.validity||{},t.validity.valid=y.jgrid.LegacyValidation(t)),!t.validity.valid)){i=!1;break}return i},LegacyValidation:function(e){var t=!0,i=e.value,a=e.getAttribute("type"),a="checkbox"===a||"radio"===a,o=e.getAttribute("required"),r=e.getAttribute("minlength"),l=e.getAttribute("maxlength"),n=e.getAttribute("pattern");return e.disabled||(t=(t=t&&(!o||a&&e.checked||!a&&""!==i))&&(a||(!r||i.length>=r)&&(!l||i.length<=l)))&&n&&(t=(n=new RegExp(n)).test(i)),t},buildButtons:function(e,i,a){var o;return y.each(e,function(e,t){t.id||(t.id=y.jgrid.randId()),t.position||(t.position="last"),t.side||(t.side="left"),o=t.icon?" fm-button-icon-"+t.side+"'><span class='"+a.icon_base+" "+t.icon+"'></span>":"'>",o="<a  data-index='"+e+"' id='"+t.id+"' class='fm-button "+a.button+o+t.text+"</a>","last"===t.position?i+=o:i=o+i}),i},setSelNavIndex:function(i,a){var e=y(".ui-pg-button",i.p.pager);y.each(e,function(e,t){if(a===t)return i.p.navIndex=e,!1}),y(a).attr("tabindex","0")},getFirstVisibleCol:function(e){for(var t=-1,i=0;i<e.p.colModel.length;i++)if(!0!==e.p.colModel[i].hidden){t=i;break}return t},getLastVisibleCol:function(e){for(var t=-1,i=e.p.colModel.length-1;0<=i;i--)if(!0!==e.p.colModel[i].hidden){t=i;break}return t},postForm:function(e,t,i){i=i||"post";var a,o,r=document.createElement("form");for(a in r.setAttribute("method",i),r.setAttribute("action",e),t)t.hasOwnProperty(a)&&((o=document.createElement("input")).setAttribute("type","hidden"),o.setAttribute("name",a),o.setAttribute("value",t[a]),r.appendChild(o));document.body.appendChild(r),r.submit(),r.parentNode.removeChild(r)}})});