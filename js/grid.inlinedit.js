/*jshint eqeqeq:false, eqnull:true, devel:true */
/*jslint browser: true, devel: true, eqeq: true, evil: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, vars: true, white: true, maxerr: 999 */
/*global jQuery */
(function($){
/**
 * jqGrid extension for manipulating Grid Data
 * Copyright (c) 2008-2014, Tony Tomov, tony@trirand.com
 * Copyright (c) 2014-2015, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * http://trirand.com/blog/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
**/ 
"use strict";
var jgrid = $.jgrid, fullBoolFeedback = jgrid.fullBoolFeedback,
	getGridRes = jgrid.getMethod("getGridRes"),
	editFeedback = function (o) {
		var args = $.makeArray(arguments).slice(1);
		args.unshift("");
		args.unshift("Inline");
		args.unshift(o);
		return jgrid.feedback.apply(this, args);
	};
jgrid.inlineEdit = jgrid.inlineEdit || {};
jgrid.extend({
//Editing
    editRow: function (rowid, keys, oneditfunc, successfunc, url, extraparam, aftersavefunc, errorfunc, afterrestorefunc, beforeEditRow) {
		// Compatible mode old versions
		var oMuligrid={}, args = $.makeArray(arguments).slice(1);

		if( $.type(args[0]) === "object" ) {
			oMuligrid = args[0];
		} else {
			if (keys !== undefined) { oMuligrid.keys = keys; }
			if ($.isFunction(oneditfunc)) { oMuligrid.oneditfunc = oneditfunc; }
			if ($.isFunction(successfunc)) { oMuligrid.successfunc = successfunc; }
			if (url !== undefined) { oMuligrid.url = url; }
			if (extraparam !== undefined) { oMuligrid.extraparam = extraparam; }
			if ($.isFunction(aftersavefunc)) { oMuligrid.aftersavefunc = aftersavefunc; }
			if ($.isFunction(errorfunc)) { oMuligrid.errorfunc = errorfunc; }
			if ($.isFunction(afterrestorefunc)) { oMuligrid.afterrestorefunc = afterrestorefunc; }
			if ($.isFunction(beforeEditRow)) { oMuligrid.beforeEditRow = beforeEditRow; }
			// last two not as param, but as object (sorry)
			//if (restoreAfterError !== undefined) { oMuligrid.restoreAfterError = restoreAfterError; }
			//if (mtype !== undefined) { oMuligrid.mtype = mtype || "POST"; }			
		}

		// End compatible
		return this.each(function(){
		    var $t = this, $self = $($t), p = $t.p, nm, tmp, cnt=0, focus=null, svr={}, colModel = p.colModel, cm, opers = p.prmNames;
		    if (!$t.grid ) { return; }
		    var o = $.extend(true, {
		        keys : false,
		        oneditfunc: null,
		        successfunc: null,
		        url: null,
		        extraparam: {},
		        aftersavefunc: null,
		        errorfunc: null,
		        afterrestorefunc: null,
		        restoreAfterError: true,
		        beforeEditRow: null,
		        mtype: "POST",
		        focusField : true
		    }, jgrid.inlineEdit, p.inlineEditing || {}, oMuligrid );

		    var ind = $self.jqGrid("getInd",rowid,true);
		    if (ind === false) { return; }
           
		    if (o.extraparam[opers.oper] !== opers.addoper) {
				if (!editFeedback.call($t, o, "beforeEditRow", o, rowid)) { return; }
		    }

			var editable = $(ind).attr("editable") || "0";
			if (editable === "0" && !$(ind).hasClass("not-editable-row")) {
				var editingInfo = jgrid.detectRowEditing.call($t, rowid);
				if (editingInfo != null && editingInfo.mode === "cellEditing") {
					var savedRowInfo = editingInfo.savedRow, tr = $t.rows[savedRowInfo.id];
						$self.jqGrid("restoreCell", savedRowInfo.id, savedRowInfo.ic);
						// remove highlighting of the cell
						$(tr.cells[savedRowInfo.ic]).removeClass("edit-cell ui-state-highlight");
						$(tr).addClass("ui-state-highlight").attr({"aria-selected":"true", "tabindex" : "0"});
				}
				$('td[role="gridcell"]',ind).each( function(i) {
					cm = colModel[i];
					nm = cm.name;
					var treeg = p.treeGrid===true && nm === p.ExpandColumn;
					if(treeg) { tmp = $("span:first",this).html();}
					else {
						try {
							tmp = $.unformat.call($t,this,{rowId:rowid, colModel:cm},i);
						} catch (_) {
							tmp =  ( cm.edittype && cm.edittype === 'textarea' ) ? $(this).text() : $(this).html();
						}
					}
					if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn') {
						if(p.autoencode) { tmp = jgrid.htmlDecode(tmp); }
						svr[nm]=tmp;
						var isEditable = cm.editable;
						if ($.isFunction(isEditable)) {
							isEditable = isEditable.call($t, {
								rowid: rowid,
								iCol: i,
								iRow: ind.rowIndex,
								name: nm,
								cm: cm,
								mode: $(ind).hasClass("jqgrid-new-row") ? "add" : "edit"
							});
						}
						if (isEditable === true) {
							if(focus===null) { focus = i; }
							if (treeg) { $("span:first",this).html(""); }
							else { $(this).html(""); }
							var opt = $.extend({},cm.editoptions || {},{id:rowid+"_"+nm,name:nm,rowId:rowid});
							if(!cm.edittype) { cm.edittype = "text"; }
							if(tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
							var elc = jgrid.createEl.call($t,cm.edittype,opt,tmp,true,$.extend({},jgrid.ajaxOptions,p.ajaxSelectOptions || {}));
							$(elc).addClass("editable");
							if(treeg) { $("span:first",this).append(elc); }
							else { $(this).append(elc); }
							jgrid.bindEv.call($t, elc, opt);
							//Again IE
							if(cm.edittype === "select" && cm.editoptions!==undefined && cm.editoptions.multiple===true  && cm.editoptions.dataUrl===undefined && jgrid.msie) {
								$(elc).width($(elc).width());
							}
							cnt++;
						}
					}
				});
				if(cnt > 0) {
					svr.id = rowid; p.savedRow.push(svr);
					$(ind).attr("editable","1");
					if(o.focusField ) {
						if(typeof o.focusField === 'number' && parseInt(o.focusField,10) <= colModel.length) {
							focus = o.focusField;
						}
						setTimeout(function(){ 
							var fe = $("td:eq("+focus+") :input:visible",ind).not(":disabled"); 
							if(fe.length > 0) {
								fe.focus();
							}
						},0);
					}
					if(o.keys===true) {
						$(ind).bind("keydown",function(e) {
							if (e.keyCode === 27) {
								$self.jqGrid("restoreRow",rowid, o.afterrestorefunc);
								return false;
							}
							if (e.keyCode === 13) {
								var ta = e.target;
								if(ta.tagName === 'TEXTAREA') { return true; }
								$self.jqGrid("saveRow", rowid, o );
								return false;
							}
						});
					}
					fullBoolFeedback.call($t, o.oneditfunc, "jqGridInlineEditRow", rowid, o);
				}
			}
		});
	},
	saveRow: function (rowid, successfunc, url, extraparam, aftersavefunc, errorfunc, afterrestorefunc, beforeSaveRow) {
		// Compatible mode old versions
	    var args = $.makeArray(arguments).slice(1), o = {}, $t = this[0], $self = $($t), p = $t != null ? $t.p : null, frmoper;
		if (!$t.grid || p == null) { return; }

		if ($.type(args[0]) === "object") {
			o = args[0];
		} else {
			if ($.isFunction(successfunc)) { o.successfunc = successfunc; }
			if (url !== undefined) { o.url = url; }
			if (extraparam !== undefined) { o.extraparam = extraparam; }
			if ($.isFunction(aftersavefunc)) { o.aftersavefunc = aftersavefunc; }
			if ($.isFunction(errorfunc)) { o.errorfunc = errorfunc; }
			if ($.isFunction(afterrestorefunc)) { o.afterrestorefunc = afterrestorefunc; }
			if ($.isFunction(beforeSaveRow)) { o.beforeSaveRow = beforeSaveRow; }
		}
		var getRes = function (path) { return getGridRes.call($self, path); };
		o = $.extend(true, {
			successfunc: null,
			url: null,
			extraparam: {},
			aftersavefunc: null,
			errorfunc: null,
			afterrestorefunc: null,
			restoreAfterError: true,
			beforeSaveRow: null,
			ajaxSaveOptions: {},
			serializeSaveData: null,
			mtype: "POST",
			saveui : "enable",
			savetext : getRes("defaults.savetext") || "Saving..."
		}, jgrid.inlineEdit, p.inlineEditing || {}, o);
		// End compatible
		// TODO: add return this.each(function(){....}
		var nm, tmp = {}, tmp2 = {}, postData = {}, editable, fr, cv, ind = $self.jqGrid("getInd",rowid,true),
		errcap = getRes("errors.errcap"), bClose = getRes("edit.bClose"), editMsg = getRes("edit.msg");
		if(ind === false) {return;}
		
		var opers = p.prmNames;
		frmoper = o.extraparam[opers.oper] === opers.addoper ? "add" : "edit";

		if (!editFeedback.call($t, o, "beforeSaveRow", o, rowid, frmoper)) { return; }

		editable = $(ind).attr("editable");
		o.url = o.url || p.editurl;
		if (editable==="1") {
			var cm;
			$('td[role="gridcell"]',ind).each(function(i) {
				cm = p.colModel[i];
				nm = cm.name;
				var isEditable = cm.editable;
				if ($.isFunction(isEditable)) {
					isEditable = isEditable.call($t, {
						rowid: rowid,
						iCol: i,
						iRow: ind.rowIndex,
						name: nm,
						cm: cm,
						mode: $(ind).hasClass("jqgrid-new-row") ? "add" : "edit"
					});
				}
				if ( nm !== 'cb' && nm !== 'subgrid' && isEditable === true && nm !== 'rn' && !$(this).hasClass('not-editable-cell')) {
					switch (cm.edittype) {
						case "checkbox":
							var cbv = ["Yes","No"];
							if(cm.editoptions ) {
								cbv = cm.editoptions.value.split(":");
							}
							tmp[nm]=  $("input",this).is(":checked") ? cbv[0] : cbv[1]; 
							break;
						case 'text':
						case 'password':
						case 'textarea':
						case "button" :
							tmp[nm]=$("input, textarea",this).val();
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
							if(cm.formatter && cm.formatter === 'select') { tmp2={}; }
							break;
						case 'custom' :
							try {
								if(cm.editoptions && $.isFunction(cm.editoptions.custom_value)) {
									tmp[nm] = cm.editoptions.custom_value.call($t, $(".customelement",this),'get');
									if (tmp[nm] === undefined) { throw "e2"; }
								} else { throw "e1"; }
							} catch (e) {
								if (e==="e1") { jgrid.info_dialog.call($t,errcap,"function 'custom_value' "+editMsg.nodefined,bClose); }
								if (e==="e2") { jgrid.info_dialog.call($t,errcap,"function 'custom_value' "+editMsg.novalue,bClose); }
								else { jgrid.info_dialog.call($t,errcap,e.message,bClose); }
							}
							break;
					}
					cv = jgrid.checkValues.call($t,tmp[nm],i);
					if(cv[0] === false) {
						return false;
					}
					if(p.autoencode) { tmp[nm] = jgrid.htmlEncode(tmp[nm]); }
					if (cm.formatter && cm.formatter === "date" && (cm.formatoptions == null || cm.formatoptions.sendFormatted !== true)) {
						// TODO: call all other predefined formatters!!! Not only formatter: "date" have the problem.
						// Floating point separator for example
						tmp[nm] = $.unformat.date.call($t, tmp[nm], cm);
					}
					if(o.url !== 'clientArray' && cm.editoptions && cm.editoptions.NullIfEmpty === true) {
						if(tmp[nm] === "") {
							tmp[nm] = 'null';
						}
					}
				}
			});
			if (cv[0] === false){
				try {
					var tr = $self.jqGrid('getGridRowById', rowid), positions = jgrid.findPos(tr);
					jgrid.info_dialog.call($t,errcap,cv[1],bClose,{left:positions[0],top:positions[1]+$(tr).outerHeight()});
				} catch (e) {
					alert(cv[1]);
				}
				return;
			}
			var idname, oldRowId = rowid;
			opers = p.prmNames;
			if (p.keyName === false) {
				idname = opers.id;
			} else {
				idname = p.keyName;
			}
			if(tmp) {
				tmp[opers.oper] = opers.editoper;
				if (tmp[idname] === undefined || tmp[idname]==="") {
					tmp[idname] = rowid;
				} else if (ind.id !== p.idPrefix + tmp[idname]) {
					// rename rowid
					var oldid = jgrid.stripPref(p.idPrefix, rowid);
					if (p._index[oldid] !== undefined) {
						p._index[tmp[idname]] = p._index[oldid];
						delete p._index[oldid];
					}
					rowid = p.idPrefix + tmp[idname];
					$(ind).attr("id", rowid);
					if (p.selrow === oldRowId) {
						p.selrow = rowid;
					}
					if ($.isArray(p.selarrrow)) {
						var i = $.inArray(oldRowId, p.selarrrow);
						if (i>=0) {
							p.selarrrow[i] = rowid;
						}
					}
					if (p.multiselect) {
						var newCboxId = "jqg_" + p.id + "_" + rowid;
						$("input.cbox",ind)
							.attr("id", newCboxId)
							.attr("name", newCboxId);
					}
					// TODO: to test the case of frozen columns
				}
				if(p.inlineData === undefined) { p.inlineData ={}; }
				tmp = $.extend({},tmp,p.inlineData,o.extraparam);
			}
			if (o.url === 'clientArray') {
				tmp = $.extend({},tmp, tmp2);
				if(p.autoencode) {
					$.each(tmp,function(n,v){
						tmp[n] = jgrid.htmlDecode(v);
					});
				}
				var k, resp = $self.jqGrid("setRowData",rowid,tmp);
				$(ind).attr("editable","0");
				for(k=0;k<p.savedRow.length;k++) {
					if( String(p.savedRow[k].id) === String(oldRowId)) {fr = k; break;}
				}
				if(fr >= 0) { p.savedRow.splice(fr,1); }
				fullBoolFeedback.call($t, o.aftersavefunc, "jqGridInlineAfterSaveRow", rowid, resp, tmp, o);
				$(ind).removeClass("jqgrid-new-row").unbind("keydown");
			} else {
				$self.jqGrid("progressBar", {method:"show", loadtype : o.saveui, htmlcontent: o.savetext });
				postData = $.extend({},tmp,postData);
				postData[idname] = jgrid.stripPref(p.idPrefix, postData[idname]);

				$.ajax($.extend({
					url:o.url,
					data: jgrid.serializeFeedback.call($t,
							$.isFunction(o.serializeSaveData) ? o.serializeSaveData : p.serializeRowData,
							"jqGridInlineSerializeSaveData",
							postData),
					type: o.mtype,
					complete: function (jqXHR, textStatus) {
						$self.jqGrid("progressBar", {method:"hide", loadtype : o.saveui, htmlcontent: o.savetext});
						// textStatus can be "abort", "timeout", "error", "parsererror" or some text from text part of HTTP error occurs
						// see the answer http://stackoverflow.com/a/3617710/315935 about xhr.readyState === 4 && xhr.status === 0
						if ((jqXHR.status < 300 || jqXHR.status === 304) && (jqXHR.status !== 0 || jqXHR.readyState !== 4)){
							var ret, sucret, j;
							sucret = $self.triggerHandler("jqGridInlineSuccessSaveRow", [jqXHR, rowid, o]);
							if (!$.isArray(sucret)) {sucret = [true, tmp];}
							if (sucret[0] && $.isFunction(o.successfunc)) {sucret = o.successfunc.call($t, jqXHR);}							
							if($.isArray(sucret)) {
								// expect array - status, data, rowid
								ret = sucret[0];
								tmp = sucret[1] || tmp;
							} else {
								ret = sucret;
							}
							if (ret===true) {
								if(p.autoencode) {
									$.each(tmp,function(n,v){
										tmp[n] = jgrid.htmlDecode(v);
									});
								}
								tmp = $.extend({},tmp, tmp2);
								$self.jqGrid("setRowData",rowid,tmp);
								$(ind).attr("editable","0");
								for(j=0;j<p.savedRow.length;j++) {
									if( String(p.savedRow[j].id) === String(rowid)) {fr = j; break;}
								}
								if(fr >= 0) { p.savedRow.splice(fr,1); }
								fullBoolFeedback.call($t, o.aftersavefunc, "jqGridInlineAfterSaveRow", rowid, jqXHR, tmp, o);
								$(ind).removeClass("jqgrid-new-row").unbind("keydown");
							} else {
								fullBoolFeedback.call($t, o.errorfunc, "jqGridInlineErrorSaveRow", rowid, jqXHR, textStatus, null, o);
								if(o.restoreAfterError === true) {
									$self.jqGrid("restoreRow",rowid, o.afterrestorefunc);
								}
							}
						}
					},
					error:function(res,stat,err){
						$("#lui_"+jgrid.jqID(p.id)).hide();
						$self.triggerHandler("jqGridInlineErrorSaveRow", [rowid, res, stat, err, o]);
						if($.isFunction(o.errorfunc) ) {
							o.errorfunc.call($t, rowid, res, stat, err);
						} else {
							var rT = res.responseText || res.statusText;
							try {
								jgrid.info_dialog.call($t,errcap,'<div class="ui-state-error">'+ rT +'</div>', bClose,{buttonalign:'right'});
							} catch(e) {
								alert(rT);
							}
						}
						if(o.restoreAfterError === true) {
							$self.jqGrid("restoreRow",rowid, o.afterrestorefunc);
						}
					}
				}, jgrid.ajaxOptions, p.ajaxRowOptions, o.ajaxSaveOptions || {}));
			}
		}
		return;
	},
	restoreRow : function(rowid, afterrestorefunc) {
		// Compatible mode old versions
		var args = $.makeArray(arguments).slice(1), oMuligrid={};

		if( $.type(args[0]) === "object" ) {
			oMuligrid = args[0];
		} else {
			if ($.isFunction(afterrestorefunc)) { oMuligrid.afterrestorefunc = afterrestorefunc; }
		}

		// End compatible

		return this.each(function(){
			var $t = this, $self = $($t), p = $t.p, fr=-1, ares={}, k;
			if (!$t.grid) { return; }

			var o = $.extend(true, {}, jgrid.inlineEdit, p.inlineEditing || {}, oMuligrid);
			var ind = $self.jqGrid("getInd",rowid,true);
			if (ind === false) { return; }

			if (!editFeedback.call($t, o, "beforeCancelRow", o, rowid)) { return; }

			for(k=0;k<p.savedRow.length;k++) {
				if( String(p.savedRow[k].id) === String(rowid)) {fr = k; break;}
			}
			if(fr >= 0) {
				if($.isFunction($.fn.datepicker)) {
					try {
						$("input.hasDatepicker","#"+jgrid.jqID(ind.id)).datepicker('hide');
					} catch (ignore) {}
				}
				$.each(p.colModel, function(i){
					var isEditable = this.editable, nm = this.name;
					if ($.isFunction(isEditable)) {
						isEditable = isEditable.call($t, {
							rowid: rowid,
							iCol: i,
							iRow: ind.rowIndex,
							name: nm,
							cm: this,
							mode: $(ind).hasClass("jqgrid-new-row") ? "add" : "edit"
						});
					}
					if(isEditable === true && p.savedRow[fr].hasOwnProperty(nm)) {
						ares[nm] = p.savedRow[fr][nm];
						if (this.formatter && this.formatter === "date" && (this.formatoptions == null || this.formatoptions.sendFormatted !== true)) {
							// TODO: call all other predefined formatters!!! Not only formatter: "date" have the problem.
							// Floating point separator for example
							ares[nm] = $.unformat.date.call($t, ares[nm], this);
						}
					}
				});
				$self.jqGrid("setRowData",rowid,ares);
				$(ind).attr("editable","0").unbind("keydown");
				p.savedRow.splice(fr,1);
				if($("#"+jgrid.jqID(rowid), $t).hasClass("jqgrid-new-row")){
					setTimeout(function(){
						$self.jqGrid("delRowData",rowid);
						$self.jqGrid('showAddEditButtons', false);
					},0);
				}
			}
			fullBoolFeedback.call($t, o.afterrestorefunc, "jqGridInlineAfterRestoreRow", rowid);
		});
	},
	addRow : function (oMuligrid) {
		return this.each(function(){
		    if (!this.grid) { return; }

			var $t = this, $self = $($t), p = $t.p,
				o = $.extend(true, {
					rowID : null,
					initdata : {},
					position :"first",
					useDefValues : true,
					useFormatter: false,
					beforeAddRow: null,
					addRowParams : {extraparam:{}}
				}, jgrid.inlineEdit, p.inlineEditing || {}, oMuligrid || {});
			if (!editFeedback.call($t, o, "beforeAddRow", o.addRowParams)) { return; }

			o.rowID = $.isFunction(o.rowID) ? o.rowID.call($t, o) : ( (o.rowID != null) ? o.rowID : jgrid.randId());
			if(o.useDefValues === true) {
				$(p.colModel).each(function(){
					if( this.editoptions && this.editoptions.defaultValue ) {
						var opt = this.editoptions.defaultValue,
						tmp = $.isFunction(opt) ? opt.call($t) : opt;
						o.initdata[this.name] = tmp;
					}
				});
			}
			$self.jqGrid('addRowData', o.rowID, o.initdata, o.position);
			o.rowID = p.idPrefix + o.rowID;
			$("#"+jgrid.jqID(o.rowID), $t).addClass("jqgrid-new-row");
			if(o.useFormatter) {
				$("#"+jgrid.jqID(o.rowID)+" .ui-inline-edit", $t).click();
			} else {
				var opers = p.prmNames,
				oper = opers.oper;
				o.addRowParams.extraparam[oper] = opers.addoper;
				$self.jqGrid('editRow', o.rowID, o.addRowParams);
				$self.jqGrid('setSelection', o.rowID);
			}
		});
	},
	inlineNav : function (elem, oMuligrid) {
		if (typeof elem === "object") {
			// the option pager are skipped
			oMuligrid = elem;
			elem = undefined;
		}
		return this.each(function(){
			var $t = this, $self = $($t), p = $t.p;
			if (!this.grid || p == null) { return; }
			var $elem, gID = elem === p.toppager ? p.idSel + "_top" : p.idSel,
			gid = elem === p.toppager ? p.id + "_top" : p.id,
			o = $.extend(true,{
				edit: true,
				editicon: "ui-icon-pencil",
				add: true,
				addicon:"ui-icon-plus",
				save: true,
				saveicon:"ui-icon-disk",
				cancel: true,
				cancelicon:"ui-icon-cancel",
				commonIconClass : "ui-icon",
				iconsOverText : false,
				addParams : {addRowParams: {extraparam: {}}},
				editParams : {},
				restoreAfterSelect : true
			},
			//TODO make getRes(locales[p.locale], "nav"), jgrid.nav || {}, p.navOptions || {}
			// as the result of working getRes("nav")
			//getRes(locales[p.locale], "nav"),
			$self.jqGrid("getGridRes","nav"),
			jgrid.nav || {},
			p.navOptions || {},
			oMuligrid || {});

			if (elem === undefined) {
				if (p.pager) {
					$self.jqGrid("inlineNav", p.pager, o);
					if (p.toppager) {
						elem = p.toppager;
						gID = p.idSel + "_top";
						gid = p.id + "_top";
					} else {
						return;
					}
				} else if (p.toppager) {
					elem = p.toppager;
					gID = p.idSel + "_top";
					gid = p.id + "_top";
				}
			}
			if (elem === undefined) {
				return; // error
			}
			$elem = $(elem);
			if ($elem.length <= 0) {
				return; // error
			}
			if ($elem.find(".navtable").length <= 0) {
				// create navigator bar if it is not yet exist
				$self.jqGrid("navGrid", elem, {add: false, edit: false, del: false, search: false, refresh: false, view: false});
			}

			p._inlinenav = true;
			// detect the formatactions column
			if(o.addParams.useFormatter === true) {
				var cm = p.colModel,i, defaults, ap;
				for (i = 0; i<cm.length; i++) {
					if(cm[i].formatter && cm[i].formatter === "actions" ) {
						if(cm[i].formatoptions) {
							defaults =  {
								keys:false,
								onEdit : null,
								onSuccess: null,
								afterSave:null,
								onError: null,
								afterRestore: null,
								extraparam: {},
								url: null
							};
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
				$self.jqGrid('navButtonAdd', elem,{
					caption : o.addtext,
					title : o.addtitle,
					commonIconClass : o.commonIconClass,
					buttonicon : o.addicon,
					iconsOverText: o.iconsOverText,
					id : gid + "_iladd",
					onClickButton : function () {
						$self.jqGrid('addRow', o.addParams);
					}
				});
			}
			if(o.edit) {
				$self.jqGrid('navButtonAdd', elem,{
					caption : o.edittext,
					title : o.edittitle,
					commonIconClass : o.commonIconClass,
					buttonicon : o.editicon,
					iconsOverText: o.iconsOverText,
					id : gid + "_iledit",
					onClickButton : function () {
						var sr = p.selrow;
						if(sr) {
							$self.jqGrid('editRow', sr, o.editParams);
						} else {
							jgrid.viewModal("#alertmod",{gbox:p.gBox,jqm:true});$("#jqg_alrt").focus();							
						}
					}
				});
			}
			if(o.save) {
				$self.jqGrid('navButtonAdd', elem,{
					caption : o.savetext || '',
					title : o.savetitle || 'Save row',
					commonIconClass : o.commonIconClass,
					buttonicon : o.saveicon,
					iconsOverText: o.iconsOverText,
					id : gid + "_ilsave",
					onClickButton : function () {
						var sr = p.savedRow[0].id;
						if(sr) {
							var opers = p.prmNames,
							oper = opers.oper, tmpParams = o.editParams;
							if($("#"+jgrid.jqID(sr), $t ).hasClass("jqgrid-new-row")) {
								o.addParams.addRowParams.extraparam[oper] = opers.addoper;
								tmpParams = o.addParams.addRowParams;
							} else {
								if(!o.editParams.extraparam) {
									o.editParams.extraparam = {};
								}
								o.editParams.extraparam[oper] = opers.editoper;
							}
							$self.jqGrid('saveRow', sr, tmpParams);
						} else {
							jgrid.viewModal("#alertmod",{gbox:p.gBox,jqm:true});$("#jqg_alrt").focus();							
						}
					}
				});
				$(gID + "_ilsave").addClass('ui-state-disabled');
			}
			if(o.cancel) {
				$self.jqGrid('navButtonAdd', elem,{
					caption : o.canceltext || '',
					title : o.canceltitle || 'Cancel row editing',
					commonIconClass : o.commonIconClass,
					buttonicon : o.cancelicon,
					iconsOverText: o.iconsOverText,
					id : gid + "_ilcancel",
					onClickButton : function () {
						var sr = p.savedRow[0].id, cancelPrm = o.editParams;
						if(sr) {
							if($("#"+jgrid.jqID(sr), $t ).hasClass("jqgrid-new-row")) {
								cancelPrm = o.addParams.addRowParams;
							}
							$self.jqGrid('restoreRow', sr, cancelPrm);
						} else {
							jgrid.viewModal("#alertmod",{gbox:p.gBox,jqm:true});$("#jqg_alrt").focus();							
						}
					}
				});
				$(gID + "_ilcancel").addClass('ui-state-disabled');
			}
			if(o.restoreAfterSelect === true) {
				$self.bind("jqGridSelectRow", function (e, rowid) {
					if (p.savedRow.length > 0 && p._inlinenav === true) {
						var editingRowId = p.savedRow[0].id;
						if (rowid !== editingRowId) {
							$self.jqGrid('restoreRow', editingRowId, o.editParams);
						}
					}
				});
			}
			$self.bind("jqGridInlineAfterRestoreRow jqGridInlineAfterSaveRow", function () {
				$self.jqGrid("showAddEditButtons", false);
			});
			$self.bind("jqGridInlineEditRow", function (e, rowid) {
				$self.jqGrid("showAddEditButtons", true, rowid);
			});
		});
	},
	showAddEditButtons : function(isEditing, rowid)  {
		return this.each(function(){
			var $t = this;
			if (!$t.grid ) { return; }
			var p = $t.p, gID = p.idSel,
				saveCancel = gID + "_ilsave," + gID + "_ilcancel" + (p.toppager ? "," + gID + "_top_ilsave," + gID + "_top_ilcancel" : ""),
				addEdit = gID + "_iladd," + gID + "_iledit" + (p.toppager ? "," + gID + "_top_iladd," + gID + "_top_iledit" : "");
			$(isEditing ? addEdit : saveCancel).addClass('ui-state-disabled');
			$(isEditing ? saveCancel : addEdit).removeClass('ui-state-disabled');
		});
	}
//end inline edit
});
}(jQuery));
