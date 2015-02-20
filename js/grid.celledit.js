/*jshint eqeqeq:false */
/*jslint browser: true, devel: true, eqeq: true, evil: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, vars: true, white: true, maxerr: 999 */
/*global jQuery */
(function($){
/**
 * jqGrid extension for cellediting Grid Data
 * Copyright (c) 2008-2014, Tony Tomov, tony@trirand.com
 * Copyright (c) 2014-2015, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * http://trirand.com/blog/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
**/ 
/**
 * all events and options here are added anonymous and not in the base grid
 * since the array is to big. Here is the order of execution.
 * From this point we use jQuery isFunction
 * formatCell
 * beforeEditCell,
 * onSelectCell (used only for non-editable cells)
 * afterEditCell,
 * beforeSaveCell, (called before validation of values if any)
 * beforeSubmitCell (if cellsubmit remote (Ajax))
 * afterSubmitCell(if cellsubmit remote (Ajax)),
 * afterSaveCell,
 * errorCell,
 * serializeCellData - new
 * Options
 * cellsubmit ("remote","clientArray") (added in grid options)
 * cellurl
 * ajaxCellOptions
* */
"use strict";
var jgrid = $.jgrid;
jgrid.extend({
	editCell : function (iRow,iCol, ed){
		return this.each(function (){
			var $t = this, $self = $($t), p = $t.p, nm, tmp,cc, cm, feedback = jgrid.feedback;
			if (!$t.grid || p.cellEdit !== true || $t.rows == null || $t.rows[iRow] == null) {return;}
			iRow = parseInt(iRow, 10);
			iCol = parseInt(iCol, 10);
			var tr = $t.rows[iRow], rowid = tr.id, $tr = $(tr), $trOld = $($t.rows[p.iRow]);
			// select the row that can be used for other methods
			p.selrow = rowid;
			if (!p.knv) {$self.jqGrid("GridNav");}
			// check to see if we have already edited cell
			if (p.savedRow.length>0) {
				// prevent second click on that field and enable selects
				if (ed===true ) {
					if(iRow === p.iRow && iCol === p.iCol){
						return;
					}
				}
				// save the cell
				$self.jqGrid("saveCell",p.savedRow[0].id,p.savedRow[0].ic);
			} else {
				window.setTimeout(function () { $("#"+jgrid.jqID(p.knv)).attr("tabindex","-1").focus();},1);
			}
			cm = p.colModel[iCol];
			nm = cm.name;
			if (nm==='subgrid' || nm==='cb' || nm==='rn') {return;}
			cc = $("td:eq("+iCol+")",tr);
			var editable = cm.editable;
			if ($.isFunction(editable)) {
				editable = editable.call($t, {
					rowid: rowid,
					iCol: iCol,
					iRow: iRow,
					name: nm,
					cm: cm
				});
			}
			if (editable===true && ed===true && !cc.hasClass("not-editable-cell")) {
				if(parseInt(p.iCol,10)>=0  && parseInt(p.iRow,10)>=0) {
					$("td:eq("+p.iCol+")",$trOld).removeClass("edit-cell ui-state-highlight");
					$trOld.removeClass("selected-row ui-state-hover");
				}
				cc.addClass("edit-cell ui-state-highlight");
				$tr.addClass("selected-row ui-state-hover");
				try {
					tmp =  $.unformat.call($t,cc,{rowId: rowid, colModel:cm},iCol);
				} catch (_) {
					tmp = ( cm.edittype && cm.edittype === 'textarea' ) ? cc.text() : cc.html();
				}
				if(p.autoencode) { tmp = jgrid.htmlDecode(tmp); }
				if (!cm.edittype) {cm.edittype = "text";}
				p.savedRow.push({id:iRow,ic:iCol,name:nm,v:tmp});
				if(tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
				if($.isFunction(p.formatCell)) {
					var tmp2 = p.formatCell.call($t, rowid,nm,tmp,iRow,iCol);
					if(tmp2 !== undefined ) {tmp = tmp2;}
				}
				feedback.call($t, "beforeEditCell", rowid, nm, tmp, iRow, iCol);
				var opt = $.extend({}, cm.editoptions || {} ,{id:iRow+"_"+nm,name:nm,rowId: rowid});
				var elc = jgrid.createEl.call($t,cm.edittype,opt,tmp,true,$.extend({},jgrid.ajaxOptions,p.ajaxSelectOptions || {}));
				cc.html("").append(elc).attr("tabindex","0");
				jgrid.bindEv.call($t, elc, opt);
				window.setTimeout(function () { $(elc).focus();},1);
				$("input, select, textarea",cc).bind("keydown",function(e) {
					if (e.keyCode === 27) {
						if($("input.hasDatepicker",cc).length >0) {
							if( $(".ui-datepicker").is(":hidden") )  { $self.jqGrid("restoreCell",iRow,iCol); }
							else { $("input.hasDatepicker",cc).datepicker('hide'); }
						} else {
							$self.jqGrid("restoreCell",iRow,iCol);
						}
					} //ESC
					if (e.keyCode === 13 && !e.shiftKey) {
						$self.jqGrid("saveCell",iRow,iCol);
						// Prevent default action
						return false;
					} //Enter
					if (e.keyCode === 9)  {
						if(!$t.grid.hDiv.loading ) {
							if (e.shiftKey) {$self.jqGrid("prevCell",iRow,iCol);} //Shift TAb
							else {$self.jqGrid("nextCell",iRow,iCol);} //Tab
						} else {
							return false;
						}
					}
					e.stopPropagation();
				});
				feedback.call($t, "afterEditCell", rowid, nm, tmp, iRow, iCol);
				$self.triggerHandler("jqGridAfterEditCell", [rowid, nm, tmp, iRow, iCol]);
			} else {
				if (parseInt(p.iCol,10)>=0  && parseInt(p.iRow,10)>=0) {
					$("td:eq("+p.iCol+")",$trOld).removeClass("edit-cell ui-state-highlight");
					$trOld.removeClass("selected-row ui-state-hover");
				}
				cc.addClass("edit-cell ui-state-highlight");
				$tr.addClass("selected-row ui-state-hover");
				tmp = cc.html().replace(/\&#160\;/ig,'');
				feedback.call($t, "onSelectCell", rowid, nm, tmp, iRow, iCol);
			}
			p.iCol = iCol; p.iRow = iRow;
		});
	},
	saveCell : function (iRow, iCol){
		return this.each(function(){
			var $t= this, $self = $($t), p = $t.p, fr, feedback = jgrid.feedback, infoDialog = jgrid.info_dialog, jqID = jgrid.jqID,
				errors = $self.jqGrid("getGridRes","errors"), errcap = errors.errcap,
				edit = $self.jqGrid("getGridRes","edit"), editMsg = edit.msg, bClose = edit.bClose;
			if (!$t.grid || p.cellEdit !== true) {return;}
			if ( p.savedRow.length >= 1) {fr = 0;} else {fr=null;}
			if(fr !== null) {
				var tr = $t.rows[iRow], rowid = tr.id, $tr = $(tr), cc = $("td:eq("+iCol+")",tr),v,v2,
				cm = p.colModel[iCol], nm = cm.name, iRowNmSelector = "#"+iRow+"_"+jqID(nm);
				switch (cm.edittype) {
					case "select":
						if(cm.editoptions == null || !cm.editoptions.multiple) {
							v = $(iRowNmSelector+" option:selected",tr).val();
							v2 = $(iRowNmSelector+" option:selected",tr).text();
						} else {
							var sel = $(iRowNmSelector,tr), selectedText = [];
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
						v = $(iRowNmSelector,tr).is(":checked") ? cbv[0] : cbv[1];
						v2=v;
						break;
					case "password":
					case "text":
					case "textarea":
					case "button" :
						v = $(iRowNmSelector,tr).val();
						v2=v;
						break;
					case 'custom' :
						try {
							if(cm.editoptions && $.isFunction(cm.editoptions.custom_value)) {
								v = cm.editoptions.custom_value.call($t, $(".customelement",cc),'get');
								if (v===undefined) { throw "e2";}
								v2=v;
							} else { throw "e1"; }
						} catch (e) {
							if (e==="e1") { infoDialog.call($t,errcap,"function 'custom_value' "+editMsg.nodefined,bClose); }
							if (e==="e2") { infoDialog.call($t,errcap,"function 'custom_value' "+editMsg.novalue,bClose); }
							else {infoDialog.call($t,errcap,e.message,bClose); }
						}
						break;
				}
				// The common approach is if nothing changed do not do anything
				if (v2 !== p.savedRow[fr].v){
					var vvv = $self.triggerHandler("jqGridBeforeSaveCell", [rowid, nm, v, iRow, iCol]);
					if (vvv) {v = vvv; v2=vvv;}
					if ($.isFunction(p.beforeSaveCell)) {
						var vv = p.beforeSaveCell.call($t, rowid,nm, v, iRow,iCol);
						if (vv) {v = vv; v2=vv;}
					}
					var cv = jgrid.checkValues.call($t,v,iCol);
					if(cv[0] === true) {
						var addpost = $self.triggerHandler("jqGridBeforeSubmitCell", [rowid, nm, v, iRow, iCol]) || {};
						if ($.isFunction(p.beforeSubmitCell)) {
							addpost = p.beforeSubmitCell.call($t, rowid,nm, v, iRow,iCol);
							if (!addpost) {addpost={};}
						}
						if( $("input.hasDatepicker",cc).length >0) { $("input.hasDatepicker",cc).datepicker('hide'); }
						if (cm.formatter && cm.formatter === "date" && (cm.formatoptions == null || cm.formatoptions.sendFormatted !== true)) {
							// TODO: call all other predefined formatters!!! Not only formatter: "date" have the problem.
							// Floating point separator for example
							v2 = $.unformat.date.call($t, v2, cm);
						}
						if (p.cellsubmit === 'remote') {
							if (p.cellurl) {
								var postdata = {};
								if(p.autoencode) { v = jgrid.htmlEncode(v); }
								postdata[nm] = v;
								var idname,oper, opers;
								opers = p.prmNames;
								idname = opers.id;
								oper = opers.oper;
								postdata[idname] = jgrid.stripPref(p.idPrefix, rowid);
								postdata[oper] = opers.editoper;
								postdata = $.extend(addpost,postdata);
								$self.jqGrid("progressBar", {method:"show", loadtype : p.loadui, htmlcontent: jgrid.defaults.savetext || "Saving..." });
								$t.grid.hDiv.loading = true;
								$.ajax( $.extend( {
									url: p.cellurl,
									//data :$.isFunction(p.serializeCellData) ? p.serializeCellData.call($t, postdata) : postdata,
									data: jgrid.serializeFeedback.call($t, p.serializeCellData, "jqGridSerializeCellData", postdata),
									type: "POST",
									complete: function (jqXHR) {
										$self.jqGrid("progressBar", {method:"hide", loadtype : p.loadui });
										$t.grid.hDiv.loading = false;
										if ((jqXHR.status < 300 || jqXHR.status === 304) && (jqXHR.status !== 0 || jqXHR.readyState !== 4)) {
											var ret = $self.triggerHandler("jqGridAfterSubmitCell", [$t, jqXHR, postdata.id, nm, v, iRow, iCol]) || [true, ''];
											if (ret[0] === true && $.isFunction(p.afterSubmitCell)) {
												ret = p.afterSubmitCell.call($t, jqXHR,postdata.id,nm,v,iRow,iCol);
											}
											if(ret[0] === true){
												cc.empty();
												$self.jqGrid("setCell",rowid, iCol, v2, false, false, true);
												cc.addClass("dirty-cell");
												$tr.addClass("edited");
												feedback.call($t, "afterSaveCell", rowid,nm, v, iRow,iCol);
												p.savedRow.splice(0,1);
											} else {
												infoDialog.call($t,errcap,ret[1],bClose);
												$self.jqGrid("restoreCell",iRow,iCol);
											}
										}
									},
									error: function (jqXHR, textStatus, errorThrown) {
										$("#lui_"+jqID(p.id)).hide();
										$t.grid.hDiv.loading = false;
										$self.triggerHandler("jqGridErrorCell", [jqXHR, textStatus, errorThrown]);
										if ($.isFunction(p.errorCell)) {
											p.errorCell.call($t, jqXHR,textStatus,errorThrown);
											$self.jqGrid("restoreCell",iRow,iCol);
										} else {
											infoDialog.call($t,errcap,jqXHR.status+" : "+jqXHR.statusText+"<br/>"+textStatus,bClose);
											$self.jqGrid("restoreCell",iRow,iCol);
										}
									}
								}, jgrid.ajaxOptions, p.ajaxCellOptions || {}));
							} else {
								try {
									infoDialog.call($t,errcap,errors.nourl,bClose);
									$self.jqGrid("restoreCell",iRow,iCol);
								} catch (ignore) {}
							}
						}
						if (p.cellsubmit === 'clientArray') {
							cc.empty();
							$self.jqGrid("setCell",rowid,iCol, v2, false, false, true);
							cc.addClass("dirty-cell");
							$tr.addClass("edited");
							feedback.call($t, "afterSaveCell", rowid, nm, v, iRow, iCol);
							p.savedRow.splice(0,1);
						}
					} else {
						try {
							window.setTimeout(function(){infoDialog.call($t,errcap,v+" "+cv[1],bClose);},100);
							$self.jqGrid("restoreCell",iRow,iCol);
						} catch (ignore) {}
					}
				} else {
					$self.jqGrid("restoreCell",iRow,iCol);
				}
			}
			window.setTimeout(function () { $("#"+jqID(p.knv)).attr("tabindex","-1").focus();},0);
		});
	},
	restoreCell : function(iRow, iCol) {
		return this.each(function(){
			var $t= this, p = $t.p, tr = $t.rows[iRow], rowid = tr.id, v, cm;
			if (!$t.grid || p.cellEdit !== true) {return;}
			if (p.savedRow.length >= 1) {
				var cc = $("td:eq("+iCol+")",tr);
				// datepicker fix
				if($.isFunction($.fn.datepicker)) {
					try {
						$("input.hasDatepicker",cc).datepicker('hide');
					} catch (ignore) {}
				}
				$(cc).empty().attr("tabindex","-1");
				v = p.savedRow[0].v;
				cm = p.colModel[iCol];
				if (cm.formatter && cm.formatter === "date" && (cm.formatoptions == null || cm.formatoptions.sendFormatted !== true)) {
					// TODO: call all other predefined formatters!!! Not only formatter: "date" have the problem.
					// Floating point separator for example
					v = $.unformat.date.call($t, v, cm);
				}
				$($t).jqGrid("setCell",rowid, iCol, v, false, false, true);
				jgrid.feedback.call($t, "afterRestoreCell", rowid, v, iRow, iCol);
				p.savedRow.splice(0,1);
			}
			window.setTimeout(function () { $("#"+p.knv).attr("tabindex","-1").focus();},0);
		});
	},
	nextCell : function (iRow,iCol) {
		return this.each(function (){
			var $t = this, $self = $($t), p = $t.p, nCol=false, i, editable, cm;
			if (!$t.grid || p.cellEdit !== true || $t.rows == null || $t.rows[iRow] == null) {return;}
			// try to find next editable cell
			for (i=iCol+1; i<p.colModel.length; i++) {
				cm = p.colModel[i];
				editable = cm.editable;
				if ($.isFunction(editable)) {
					editable = editable.call($t, {
						rowid: $t.rows[iRow].id,
						iCol: i,
						iRow: iRow,
						name: cm.name,
						cm: cm
					});
				}
				if (editable === true) {
					nCol = i; break;
				}
			}
			if(nCol !== false) {
				$self.jqGrid("editCell",iRow,nCol,true);
			} else {
				if (p.savedRow.length >0) {
					$self.jqGrid("saveCell",iRow,iCol);
				}
			}
		});
	},
	prevCell : function (iRow,iCol) {
		return this.each(function (){
			var $t = this, $self = $($t), p = $t.p, nCol=false, i, editable, cm;
			if (!$t.grid || p.cellEdit !== true || $t.rows == null || $t.rows[iRow] == null) {return;}
			// try to find next editable cell
			for (i=iCol-1; i>=0; i--) {
				cm = p.colModel[i];
				editable = cm.editable;
				if ($.isFunction(editable)) {
					editable = editable.call($t, {
						rowid: $t.rows[iRow].id,
						iCol: i,
						iRow: iRow,
						name: cm.name,
						cm: cm,
						mode: "cell"
					});
				}
				if (editable === true) {
					nCol = i; break;
				}
			}
			if(nCol !== false) {
				$self.jqGrid("editCell",iRow,nCol,true);
			} else {
				if (p.savedRow.length >0) {
					$self.jqGrid("saveCell",iRow,iCol);
				}
			}
		});
	},
	GridNav : function() {
		return this.each(function () {
			var  $t = this, $self = $($t), p = $t.p, grid = $t.grid;
			if (!grid || p.cellEdit !== true ) {return;}
			var bDiv = grid.bDiv;
			// trick to process keydown on non input elements
			p.knv = p.id + "_kn";
			var selection = $("<div style='position:fixed;top:0px;width:1px;height:1px;' tabindex='0'><div tabindex='-1' style='width:1px;height:1px;' id='"+p.knv+"'></div></div>"),
			i, kdir;
			function scrollGrid(iR, iC, tp){
				var tr = $t.rows[iR];
				if (tp.substr(0,1)==='v') {
					var ch = bDiv.clientHeight,
					st = bDiv.scrollTop,
					nRot = tr.offsetTop+tr.clientHeight,
					pRot = tr.offsetTop;
					if(tp === 'vd') {
						if(nRot >= ch) {
							bDiv.scrollTop = bDiv.scrollTop + tr.clientHeight;
						}
					}
					if(tp === 'vu'){
						if (pRot < st ) {
							bDiv.scrollTop = bDiv.scrollTop - tr.clientHeight;
						}
					}
				}
				if(tp==='h') {
					var cw = bDiv.clientWidth,
					sl = bDiv.scrollLeft, td = tr.cells[iC],
					nCol = td.offsetLeft+td.clientWidth,
					pCol = td.offsetLeft;
					if(nCol >= cw+parseInt(sl,10)) {
						bDiv.scrollLeft = bDiv.scrollLeft + td.clientWidth;
					} else if (pCol < sl) {
						bDiv.scrollLeft = bDiv.scrollLeft - td.clientWidth;
					}
				}
			}
			function findNextVisible(iC,act){
				var ind = 0, j, colModel = p.colModel;
				if(act === 'lft') {
					ind = iC+1;
					for (j=iC;j>=0;j--){
						if (colModel[j].hidden !== true) {
							ind = j;
							break;
						}
					}
				}
				if(act === 'rgt') {
					ind = iC-1;
					for (j=iC; j<colModel.length;j++){
						if (colModel[j].hidden !== true) {
							ind = j;
							break;
						}						
					}
				}
				return ind;
			}

			$(selection).insertBefore(grid.cDiv);
			$("#"+p.knv)
			.focus()
			.keydown(function (e){
				kdir = e.keyCode;
				if(p.direction === "rtl") {
					if(kdir===37) { kdir = 39;}
					else if (kdir===39) { kdir = 37; }
				}
				switch (kdir) {
					case 38:
						if (p.iRow-1 >0 ) {
							scrollGrid(p.iRow-1,p.iCol,'vu');
							$self.jqGrid("editCell",p.iRow-1,p.iCol,false);
						}
					break;
					case 40 :
						if (p.iRow+1 <=  $t.rows.length-1) {
							scrollGrid(p.iRow+1,p.iCol,'vd');
							$self.jqGrid("editCell",p.iRow+1,p.iCol,false);
						}
					break;
					case 37 :
						if (p.iCol -1 >=  0) {
							i = findNextVisible(p.iCol-1,'lft');
							scrollGrid(p.iRow, i,'h');
							$self.jqGrid("editCell",p.iRow, i,false);
						}
					break;
					case 39 :
						if (p.iCol +1 <=  p.colModel.length-1) {
							i = findNextVisible(p.iCol+1,'rgt');
							scrollGrid(p.iRow,i,'h');
							$self.jqGrid("editCell",p.iRow,i,false);
						}
					break;
					case 13:
						if (parseInt(p.iCol,10)>=0 && parseInt(p.iRow,10)>=0) {
							$self.jqGrid("editCell",p.iRow,p.iCol,true);
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
			var $t = this, p = $t.p, htmlDecode = jgrid.htmlDecode;
			if (!$t.grid || p.cellEdit !== true ) {return;}
			$($t.rows).each(function(j){
				var res = {};
				if ($(this).hasClass("edited")) {
					$('td',this).each( function(i) {
						var cm = p.colModel[i], nm = cm.name, $td = $(this);
						if ( nm !== 'cb' && nm !== 'subgrid') {
							if (mthd==='dirty') {
								if ($td.hasClass('dirty-cell')) {
									try {
										res[nm] = $.unformat.call($t,this,{rowId:$t.rows[j].id, colModel:cm},i);
									} catch (e){
										res[nm] = htmlDecode($td.html());
									}
								}
							} else {
								try {
									res[nm] = $.unformat.call($t,this,{rowId:$t.rows[j].id,colModel:cm},i);
								} catch (e) {
									res[nm] = htmlDecode($td.html());
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
}(jQuery));
