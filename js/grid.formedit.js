;(function($){
/**
 * jqGrid extension for form editing Grid Data
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/ 
var rp_ge = null;
$.fn.extend({
	searchGrid : function ( p ) {
		p = $.extend({
			top : 0,
			left: 0,
			width: 410,
			height: 'auto',
			modal: false,
			drag: true,
			resize: true,
			dirty: false,
			sField:'searchField',
			sValue:'searchString',
			sOper: 'searchOper',
			processData: "",
			checkInput :false,
			beforeShowSearch: null,
			afterShowSearch : null,
			onInitializeSearch: null,
			closeAfterSearch : true,
			jqModal : true,
			closeOnEscape : false,
			// translation
			// if you want to change or remove the order change it in sopt
			// ['bw','eq','ne','lt','le','gt','ge','ew','cn'] 
			sopt: null 
		}, $.jgrid.search, p || {});
		return this.each(function(){
			var $t = this;
			if( !$t.grid ) { return; }
			var gID = $t.p.id,
			IDs = { themodal:'srchmod'+gID,modalhead:'srchhead'+gID,modalcontent:'srchcnt'+gID };
			if ( $("#"+IDs.themodal).html() != null ) {
				if( $.isFunction('beforeShowSearch') ) { p.beforeShowSearch($("#srchcnt"+gID)); }
				viewModal("#"+IDs.themodal,{gbox:"#gbox_"+gID,jqm:p.jqModal});
				if( $.isFunction('afterShowSearch') ) { p.afterShowSearch($("#srchcnt"+gID)); }
			} else {
				var cM = $t.p.colModel;
				var cNames = "<select id='snames' class='search'>";
				var nm, hc, sf;
				for(var i=0; i< cM.length;i++) {
					nm = cM[i].name;
					sf = (cM[i].search===false) ? false: true;
					if(cM[i].editrules && cM[i].editrules.searchhidden === true) {
						hc = true;
					} else {
						if(cM[i].hidden === true ) {
							hc = false;
						} else {
							hc = true;
						}
					}					
					if( nm !== 'cb' && nm !== 'subgrid' && sf && hc===true ) { // add here condition for searchable
						var sname = (cM[i].index) ? cM[i].index : nm;
						cNames += "<option value='"+sname+"'>"+$t.p.colNames[i]+"</option>";
					}
				}
				cNames += "</select>";
				var getopt = p.sopt || ['bw','eq','ne','lt','le','gt','ge','ew','cn'];
				var sOpt = "<select id='sopt' class='search'>";
				for(var i = 0; i<getopt.length;i++) {
					sOpt += getopt[i]=='eq' ? "<option value='eq'>"+p.odata[0]+"</option>" : "";
					sOpt += getopt[i]=='ne' ? "<option value='ne'>"+p.odata[1]+"</option>" : "";
					sOpt += getopt[i]=='lt' ? "<option value='lt'>"+p.odata[2]+"</option>" : "";
					sOpt += getopt[i]=='le' ? "<option value='le'>"+p.odata[3]+"</option>" : "";
					sOpt += getopt[i]=='gt' ? "<option value='gt'>"+p.odata[4]+"</option>" : "";
					sOpt += getopt[i]=='ge' ? "<option value='ge'>"+p.odata[5]+"</option>" : "";
					sOpt += getopt[i]=='bw' ? "<option value='bw'>"+p.odata[6]+"</option>" : "";
					sOpt += getopt[i]=='ew' ? "<option value='ew'>"+p.odata[7]+"</option>" : "";
					sOpt += getopt[i]=='cn' ? "<option value='cn'>"+p.odata[8]+"</option>" : "";
				};
				sOpt += "</select>";
				// field and buttons
				var sField  = "<input id='sval' class='search' type='text' size='20' maxlength='100'/>";
				var bSearch = "<input id='sbut' type='button' value='"+p.Find+"'/>";
				var bReset  = "<input id='sreset' type='button' value='"+p.Reset+"'/>";
				var cnt = $("<table width='100%'><tbody><tr style='display:none' id='srcherr'><td colspan='5'></td></tr><tr><td>"+cNames+"</td><td>"+sOpt+"</td><td>"+sField+"</td>"+"<td>"+bSearch+"</div></td>"+"<td>"+bReset+"</td></tr></tbody></table>");
				p.gbox = "#gbox_"+$t.p.id;
				createModal(IDs,cnt,p,"#gview_"+$t.p.id,$("#gview_"+$t.p.id)[0]);
				if ( $.isFunction('onInitializeSearch') ) { p.onInitializeSearch( $("#srchcnt"+gID) ); };
				if ( $.isFunction('beforeShowSearch') ) { p.beforeShowSearch($("#srchcnt"+gID)); };
				viewModal("#"+IDs.themodal,{gbox:"#gbox_"+gID,jqm:p.jqModal});
				if($.isFunction('afterShowSearch')) { p.afterShowSearch($("#srchcnt"+gID)); }
				$("#sbut, #sreset","#"+IDs.modalcontent).addClass('ui-state-default ui-corner-all').height(21)
				.css({padding:" .2em .5em", cursor: 'pointer'})
				.hover(
				   function(){$(this).addClass('ui-state-hover');}, 
				   function(){$(this).removeClass('ui-state-hover');}
				);
				$("#sbut","#"+IDs.modalcontent).click(function(){
					if( $("#sval","#"+IDs.themodal).val() !="" ) {
						var es=[true,"",""];
						$("#srcherr >td","#srchcnt"+gID).html("").hide();
						$t.p.searchdata[p.sField] = $("option[selected]","#snames").val();
						$t.p.searchdata[p.sOper] = $("option[selected]","#sopt").val();
						$t.p.searchdata[p.sValue] = $("#sval","#"+IDs.modalcontent).val();
						if(p.checkInput) {
							for(var i=0; i< cM.length;i++) {
								var sname = (cM[i].index) ? cM[i].index : nm;
								if (sname == $t.p.searchdata[p.sField]) {
									break;
								}
							}
							es = checkValues($t.p.searchdata[p.sValue],i,$t);
						}
						if (es[0]===true) {
							$t.p.search = true; // initialize the search
							// construct array of data which is passed in populate() see jqGrid
							if(p.dirty) { $(".no-dirty-cell",$t.p.pager).addClass("dirty-cell"); }
							$t.p.page= 1;
							$($t).trigger("reloadGrid");
							if(p.closeAfterSearch === true) {
								hideModal("#"+IDs.themodal,{gb:"#gbox_"+gID,jqm:p.jqModal});
							}
						} else {
							$("#srcherr >td","#srchcnt"+gID).html(es[1]).show();
						}
					}
					return false;
				});
				$("#sreset","#"+IDs.modalcontent).click(function(){
					if ($t.p.search) {
						$("#srcherr >td","#srchcnt"+gID).html("").hide();
						$t.p.search = false;
						$t.p.searchdata = {};
						$t.p.page= 1;
						$("#sval","#"+IDs.modalcontent).val("");
						if(p.dirty) { $(".no-dirty-cell",$t.p.pager).removeClass("dirty-cell"); }
						$($t).trigger("reloadGrid");
					}
					return false;
				});
			}
		});
	},
	editGridRow : function(rowid, p){
		p = $.extend({
			top : 0,
			left: 0,
			width: 300,
			height: 'auto',
			modal: false,
			drag: true,
			resize: true,
			url: null,
			mtype : "POST",
			closeAfterAdd : false,
			clearAfterAdd : true,
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
			addedrow : "first"
		}, $.jgrid.edit, p || {});
		rp_ge = p;
		return this.each(function(){
			var $t = this;
			if (!$t.grid || !rowid) { return; }
			// I hate to rewrite code, but ...
			var gID = $t.p.id,
			IDs = {themodal:'editmod'+gID,modalhead:'edithd'+gID,modalcontent:'editcnt'+gID},
			onBeforeShow = $.isFunction(rp_ge.beforeShowForm) ? rp_ge.beforeShowForm : false,
			onAfterShow = $.isFunction(rp_ge.afterShowForm) ? rp_ge.afterShowForm : false,
			onBeforeInit = $.isFunction(rp_ge.beforeInitData) ? rp_ge.beforeInitData : false,
			onInitializeForm = $.isFunction(rp_ge.onInitializeForm) ? rp_ge.onInitializeForm : false,
			frmgr = "FrmGrid_"+gID,frmtb = "TblGrid_"+gID,
			copydata = null,
			maxCols = 1;
			if (rowid=="new") {
				rowid = "_empty";
				p.caption=p.addCaption;
			} else {
				p.caption=p.editCaption;
			};
			if(p.recreateForm===true && $("#"+IDs.themodal).html() != null) {
				$("#"+IDs.themodal).remove();
			}
			if ( $("#"+IDs.themodal).html() != null ) {
				$(".modaltext","#"+IDs.modalhead).html(p.caption);
				$("#FormError","#"+frmtb).hide();
				if(onBeforeInit) { onBeforeInit($("#"+frmgr)); }
				// filldata
				fillData(rowid,$t,frmgr);
				///
				if(rowid=="_empty") { $("#pData, #nData","#"+frmtb).hide(); } else { $("#pData, #nData","#"+frmtb).show(); }
				if(p.processing===true) {
					p.processing=false;
					$("#sData", "#"+frmtb).attr("disabled",false);
				}
				if(onBeforeShow) { onBeforeShow($("#"+frmgr)); }
				viewModal("#"+IDs.themodal,{gbox:"#gbox_"+gID,jqm:p.jqModal});
				if(onAfterShow) { onAfterShow($("#"+frmgr)); }
			} else {
				$($t.p.colModel).each( function(i) {
					maxCols = Math.max(maxCols, this.formoptions ? this.formoptions.colpos || 0 : 0 );
				});								
				var flr, frm = $("<form name='FormPost' id='"+frmgr+"' class='FormGrid'></form>"),
				tbl =$("<table id='"+frmtb+"' class='EditTable' cellspacing='0' cellpading='0' border='0' width='100%'><tbody></tbody></table>");
				$(frm).append(tbl);
				flr = $("<tr id='FormError' style='display:none'><td colspan='"+(maxCols*2)+"'></td></tr>");
				flr[0].rp = 0;
				$(tbl).append(flr);
				// set the id.
				// use carefull only to change here colproperties.
				if(onBeforeInit) { onBeforeInit($("#"+frmgr)); }
				// create data
				var valref = createData(rowid,$t,tbl,maxCols),
				// buttons at footer
				bP = "<div id='pData'></div>",
				bN = "<div id='nData'></div>",
				bS  ="<input id='sData' type='button' class='EditButton' value='"+p.bSubmit+"'/>",
				bC  ="<input id='cData' type='button'  class='EditButton' value='"+p.bCancel+"'/>";
				flr = $("<tr id='Act_Buttons'><td class='navButton ui-widget-content'>"+bP+bN+"</td><td colspan='"+(maxCols*2-1)+"' class='EditButton ui-widget-content'>"+bS+"&nbsp;"+bC+"</td></tr>");
				flr[0].rp = valref.length + 100;
				$(tbl).append(flr);
				if(maxCols >  1) {
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
				// beforeinitdata after creation of the form
				p.gbox = "#gbox_"+gID;
				createModal(IDs,frm,p,"#gview_"+$t.p.id,$("#gview_"+$t.p.id)[0]);
				// here initform - only once
				if(onInitializeForm) { onInitializeForm($("#"+frmgr)); }
				//if( p.drag ) { DnRModal("#"+IDs.themodal,"#"+IDs.modalhead); }
				if(rowid=="_empty") { $("#pData,#nData","#"+frmtb).hide(); } else { $("#pData,#nData","#"+frmtb).show(); }
				if(onBeforeShow) { onBeforeShow($("#"+frmgr)); }
				viewModal("#"+IDs.themodal,{gbox:"#gbox_"+gID,jqm:p.jqModal});
				if(onAfterShow) { onAfterShow($("#"+frmgr)); }
				$("#nData","#"+frmtb).addClass('ui-state-default ui-corner-right').append("<span class='ui-icon ui-icon-triangle-1-e'></span>");
				$("#pData","#"+frmtb).addClass('ui-state-default ui-corner-left').append("<span class='ui-icon ui-icon-triangle-1-w'></span>");
				$("#pData, #nData").hover(
				   function(){$(this).addClass('ui-state-hover');}, 
				   function(){$(this).removeClass('ui-state-hover');}
				);
				$("#sData, #cData","#"+frmtb).addClass('ui-state-default ui-corner-all').height(21)
				.css({padding:".2em .5em", cursor: 'pointer'})
				.hover(
				   function(){$(this).addClass('ui-state-hover');}, 
				   function(){$(this).removeClass('ui-state-hover');}
				);
				$("#sData", "#"+frmtb).click(function(e){
					var postdata = {}, ret=[true,"",""], extpost={};
					$("#FormError","#"+frmtb).hide();
					// all depend on ret array
					//ret[0] - succes
					//ret[1] - msg if not succes
					//ret[2] - the id  that will be set if reload after submit false
					var j =0;
					$(".FormElement", "#"+frmtb).each(function(i){
						var suc =  true;
						switch ($(this).get(0).type) {
							case "checkbox":
								if($(this).attr("checked")) {
									postdata[this.name]= $(this).val();
								}else {
									var ofv = $(this).attr("offval");
									postdata[this.name]= ofv;
									extpost[this.name] = ofv;
								}
							break;
							case "select-one":
								postdata[this.name]= $("option:selected",this).val();
								extpost[this.name]= $("option:selected",this).text();
							break;
							case "select-multiple":
								postdata[this.name]= $(this).val();
								var selectedText = [];
								$("option:selected",this).each(
									function(i,selected){
										selectedText[i] = $(selected).text();
									}
								);
								extpost[this.name]= selectedText.join(",");
							break;								
							case "password":
							case "text":
							case "textarea":
							case "button":
								postdata[this.name] = $(this).val();
								ret = checkValues(postdata[this.name],valref[i],$t);
								if(ret[0] === false) {
									suc=false;
								} else {
									postdata[this.name] = !$t.p.autoencode ? postdata[this.name] : htmlEncode(postdata[this.name]);
								}
							break;
						}
						j++;
						if(!suc) { return false; }
					});
					if(j==0) { ret[0] = false; ret[1] = $.jgrid.errors.norecords; }
					if( $.isFunction( rp_ge.onclickSubmit)) { rp_ge.editData = rp_ge.onclickSubmit(p) || {}; }
					if(ret[0]) {
						if( $.isFunction(rp_ge.beforeSubmit))  { ret = rp_ge.beforeSubmit(postdata,$("#"+frmgr)); }
					}
					var gurl = rp_ge.url ? rp_ge.url : $t.p.editurl;
					if(ret[0]) {
						if(!gurl) { ret[0]=false; ret[1] += " "+$.jgrid.errors.nourl; }
					}
					if(ret[0] === false) {
						$("#FormError>td","#"+frmtb).html(ret[1]);
						$("#FormError","#"+frmtb).show();
					} else {
						if(!p.processing) {
							p.processing = true;
							//$(".loading","#"+IDs.themodal).fadeIn("fast");
							$(this).attr("disabled",true);
							// we add to pos data array the action - the name is oper
							postdata.oper = postdata.id == "_empty" ? "add" : "edit";
							postdata = $.extend(postdata,rp_ge.editData);
							$.ajax({
								url:gurl,
								type: rp_ge.mtype,
								data:postdata,
								complete:function(data,Status){
									if(Status != "success") {
										ret[0] = false;
										ret[1] = Status+" Status: "+data.statusText +" Error code: "+data.status;
									} else {
										// data is posted successful
										// execute aftersubmit with the returned data from server
										if( $.isFunction(rp_ge.afterSubmit) ) {
											ret = rp_ge.afterSubmit(data,postdata);
										}
									}
									if(ret[0] === false) {
										$("#FormError>td","#"+frmtb).html(ret[1]);
										$("#FormError","#"+frmtb).show();
									} else {
										postdata = $.extend(postdata,extpost);
										// the action is add
										if(postdata.id=="_empty" ) {
											//id processing
											// user not set the id ret[2]
											if(!ret[2]) { ret[2] = parseInt($($t).getGridParam('records'))+1; }
											postdata.id = ret[2];
											if(rp_ge.closeAfterAdd) {
												if(rp_ge.reloadAfterSubmit) { $($t).trigger("reloadGrid"); }
												else {
													$($t).addRowData(ret[2],postdata,p.addedrow);
													$($t).setSelection(ret[2]);
												}
												hideModal("#"+IDs.themodal,{gb:"#gbox_"+gID,jqm:p.jqModal});
											} else if (rp_ge.clearAfterAdd) {
												if(rp_ge.reloadAfterSubmit) { $($t).trigger("reloadGrid"); }
												else { $($t).addRowData(ret[2],postdata,p.addedrow); }
												$(".FormElement", "#"+frmtb).each(function(i){
													switch ($(this).get(0).type) {
													case "checkbox":
														$(this).attr("checked",0);
														break;
													case "select-one":
													case "select-multiple":
														$("option",this).attr("selected","");
														break;
														case "password":
														case "text":
														case "textarea":
															if(this.name =='id') { $(this).val("_empty"); }
															else { $(this).val(""); }
														break;
													}
												});
											} else {
												if(rp_ge.reloadAfterSubmit) { $($t).trigger("reloadGrid"); }
												else { $($t).addRowData(ret[2],postdata,p.addedrow); }
											}
										} else {
											// the action is update
											if(rp_ge.reloadAfterSubmit) {
												$($t).trigger("reloadGrid");
												if( !rp_ge.closeAfterEdit ) { $($t).setSelection(postdata.id); }
											} else {
												if($t.p.treeGrid === true) {
													$($t).setTreeRow(postdata.id,postdata);
												} else {
													$($t).setRowData(postdata.id,postdata);
												}
											}
											if(rp_ge.closeAfterEdit) { hideModal("#"+IDs.themodal,{gb:"#gbox_"+gID,jqm:p.jqModal}); }
										}
										if($.isFunction(rp_ge.afterComplete)) {
											copydata = data;
											setTimeout(function(){rp_ge.afterComplete(copydata,postdata,$("#"+frmgr));copydata=null;},500);
										}
									}
									p.processing=false;
									$("#sData", "#"+frmtb).attr("disabled",false);
								}
							});
						}
					}
					return false;
				});
				$("#cData", "#"+frmtb).click(function(e){
					hideModal("#"+IDs.themodal,{gb:"#gbox_"+gID,jqm:p.jqModal});
					return false;
				});
				$("#nData", "#"+frmtb).click(function(e){
					$("#FormError","#"+frmtb).hide();
					var npos = getCurrPos();
					npos[0] = parseInt(npos[0]);
					if(npos[0] != -1 && npos[1][npos[0]+1]) {
						if($.isFunction(p.onclickPgButtons)) {
							p.onclickPgButtons('next',$("#"+frmgr),npos[1][npos[0]]);
						}
						fillData(npos[1][npos[0]+1],$t);
						$($t).setSelection(npos[1][npos[0]+1]);
						if($.isFunction(p.afterclickPgButtons)) {
							p.afterclickPgButtons('next',$("#"+frmgr),npos[1][npos[0]+1]);
						}
						updateNav(npos[0]+1,npos[1].length-1);
					};
					return false;
				});
				$("#pData", "#"+frmtb).click(function(e){
					$("#FormError","#"+frmtb).hide();
					var ppos = getCurrPos();
					if(ppos[0] != -1 && ppos[1][ppos[0]-1]) {
						if($.isFunction(p.onclickPgButtons)) {
							p.onclickPgButtons('prev',$("#"+frmgr),ppos[1][ppos[0]]);
						}
						fillData(ppos[1][ppos[0]-1],$t);
						$($t).setSelection(ppos[1][ppos[0]-1]);
						if($.isFunction(p.afterclickPgButtons)) {
							p.afterclickPgButtons('prev',$("#"+frmgr),ppos[1][ppos[0]-1]);
						}
						updateNav(ppos[0]-1,ppos[1].length-1);
					};
					return false;
				});
			};
			var posInit =getCurrPos();
			updateNav(posInit[0],posInit[1].length-1);
			function updateNav(cr,totr,rid){                
				if (cr==0) { $("#pData","#"+frmtb).addClass('ui-state-disabled'); } else { $("#pData","#"+frmtb).removeClass('ui-state-disabled'); }
				if (cr==totr) { $("#nData","#"+frmtb).addClass('ui-state-disabled'); } else { $("#nData","#"+frmtb).removeClass('ui-state-disabled'); }
			};
			function getCurrPos() {
				var rowsInGrid = $($t).getDataIDs();
				var selrow = $("#id_g","#"+frmtb).val();
				var pos = $.inArray(selrow,rowsInGrid);
				return [pos,rowsInGrid];
			};
			function createData(rowid,obj,tb,maxcols){
				var nm, hc,trdata, tdl, tde, cnt=0,tmp, dc,elc, retpos=[], ind=false,
				tdtmpl = "<td class='CaptionTD ui-widget-content'>&nbsp;</td><td class='DataTD ui-widget-content'>&nbsp;</td>", tmpl=""; //*2				
				for (var i =1;i<=maxcols;i++) {
					tmpl += tdtmpl;
				}
				if(rowid != '_empty') {
					ind = $(obj).getInd(obj.rows,rowid);
				}
				$(obj.p.colModel).each( function(i) {
					nm = this.name;
					// hidden fields are included in the form
					if(this.editrules && this.editrules.edithidden == true) {
						hc = false;
					} else {
						hc = this.hidden === true ? true : false;
					}
					dc = hc ? "style='display:none'" : "";
					if ( nm !== 'cb' && nm !== 'subgrid' && this.editable===true) {
						if(ind === false) {
							tmp = "";
						} else {
							if(nm == obj.p.ExpandColumn && obj.p.treeGrid === true) {
								tmp = $("td:eq("+i+")",obj.rows[ind]).text();
							} else {
								try {
									tmp =  $.unformat($("td:eq("+i+")",obj.rows[ind]),{colModel:this},i);
								} catch (_) {
									tmp = $("td:eq("+i+")",obj.rows[ind]).html();
								}
							}
						}
						var opt = $.extend({}, this.editoptions || {} ,{id:nm,name:nm});
						frmopt = $.extend({}, {elmprefix:'',elmsuffix:''}, this.formoptions || {}),
						rp = parseInt(frmopt.rowpos) || cnt+1,
						cp = parseInt((parseInt(frmopt.colpos) || 1)*2);
						if(!this.edittype) this.edittype = "text";
						elc = createEl(this.edittype,opt,tmp);
						$(elc).addClass("FormElement");
						trdata = $(tbl).find("tr[rowpos="+rp+"]");
						if ( trdata.length==0 ) {
							trdata = $("<tr "+dc+" rowpos='"+rp+"'></tr>").addClass("FormData").attr("id","tr_"+nm);
							$(trdata).append(tmpl);
							$(tb).append(trdata);
							trdata[0].rp = rp;
						}
						$("td:eq("+(cp-2)+")",trdata[0]).html( typeof frmopt.label === 'undefined' ? obj.p.colNames[i]: frmopt.label);
						$("td:eq("+(cp-1)+")",trdata[0]).append(frmopt.elmprefix).append(elc).append(frmopt.elmsuffix);
						retpos[cnt] = i;
						cnt++;
					};
				});
				if( cnt > 0) {
					var idrow = $("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='"+ (maxcols*2-1)+"' class='DataTD'><input class='FormElement' id='id_g' type='text' name='id' value='"+rowid+"'/></td></tr>");
					idrow[0].rp = cnt+99;
					$(tb).append(idrow);
				}
				return retpos;
			};
			function fillData(rowid,obj,fmid){
				var nm, hc,cnt=0,tmp;
				if(rowid == '_empty') {
					$(":input","#"+fmid).not("#sData, #cData",frm).val("");
					$(":checkbox","#"+fmid).attr("checked",false).attr("defaultChecked","");
					$("#id_g",frm).val("_empty");
					return;
				}
				$('table:first tr#'+rowid+' td',obj.grid.bDiv).each( function(i) {
					nm = obj.p.colModel[i].name;
					// hidden fields are included in the form
					if(obj.p.colModel[i].editrules && obj.p.colModel[i].editrules.edithidden === true) {
						hc = false;
					} else {
						hc = obj.p.colModel[i].hidden === true ? true : false;
					}
					if ( nm !== 'cb' && nm !== 'subgrid' && obj.p.colModel[i].editable===true) {
						if(nm == obj.p.ExpandColumn && obj.p.treeGrid === true) {
							tmp = $(this).text();
						} else {
							try {
								tmp =  $.unformat(this,{colModel:obj.p.colModel[i]},i);
							} catch (_) {
								tmp = $(this).html();
							}
						}
						nm = nm.replace('.',"\\.");
						switch (obj.p.colModel[i].edittype) {
							case "password":
							case "text":
							case "button" :
							case "image":
								tmp = $.htmlDecode(tmp);
								$("#"+nm,"#"+frmtb).val(tmp);
								break;
							case "textarea":
								if(tmp == "&nbsp;" || tmp == "&#160;" || (tmp.length==1 && tmp.charCodeAt(0)==160) ) {tmp='';}
								$("#"+nm,"#"+frmtb).val(tmp);
								break;
							case "select":
								tmp = $.htmlDecode(tmp);
								$("#"+nm+" option","#"+frmtb).each(function(j){
									if (!obj.p.colModel[i].editoptions.multiple && tmp == $(this).text() ){
										this.selected= true;
									} else if (obj.p.colModel[i].editoptions.multiple){
										if(  $.inArray($(this).text(), tmp.split(",") ) > -1  ){
											this.selected = true;
										}else{
											this.selected = false;
										}
									} else {
										this.selected = false;
									}
								});
								break;
							case "checkbox":
								tmp = tmp.toLowerCase();
								if(tmp.search(/(false|0|no|off|undefined)/i)<0 && tmp!=="") {
									$("#"+nm,"#"+frmtb).attr("checked",true);
									$("#"+nm,"#"+frmtb).attr("defaultChecked",true); //ie
								} else {
									$("#"+nm,"#"+frmtb).attr("checked",false);
									$("#"+nm,"#"+frmtb).attr("defaultChecked",""); //ie
								}
								break; 
						}
						if (hc) { $("#"+nm,"#"+frmtb).parents("tr:first").hide(); }
						cnt++;
					}
				});
				if(cnt>0) { $("#id_g","#"+frmtb).val(rowid); }
				else { $("#id_g","#"+frmtb).val(""); }
				return cnt;
			};
		});
	},
	delGridRow : function(rowids,p) {
		p = $.extend({
			top : 0,
			left: 0,
			width: 240,
			height: 'auto',
			modal: false,
			drag: true,
			resize: true,
			url : '',
			mtype : "POST",
			reloadAfterSubmit: true,
			beforeShowForm: null,
			afterShowForm: null,
			beforeSubmit: null,
			onclickSubmit: null,
			afterSubmit: null,
			onclickSubmit: null,
			jqModal : true,
			closeOnEscape : false,
			delData: {}
		}, $.jgrid.del, p ||{});
		return this.each(function(){
			var $t = this;
			if (!$t.grid ) { return; }
			if(!rowids) { return; }
			var onBeforeShow = typeof p.beforeShowForm === 'function' ? true: false,
			onAfterShow = typeof p.afterShowForm === 'function' ? true: false,
			gID = $t.p.id,
			IDs = {themodal:'delmod'+gID,modalhead:'delhd'+gID,modalcontent:'delcnt'+gID},
			dtbl = "DelTbl_"+gID;
			if (isArray(rowids)) { rowids = rowids.join(); }
			if ( $("#"+IDs.themodal).html() != null ) {
				$("#DelData>td","#"+dtbl).text(rowids);
				$("#DelError","#"+dtbl).hide();
				if( p.processing === true) {
					p.processing=false;
					$("#dData", "#"+dtbl).attr("disabled",false);
				}
				if(onBeforeShow) { p.beforeShowForm($("#"+dtbl)); }
				viewModal("#"+IDs.themodal,{gbox:"#gbox_"+gID,jqm:p.jqModal});
				if(onAfterShow) { p.afterShowForm($("#"+dtbl)); }
			} else {
				var tbl =$("<table id='"+dtbl+"' class='DelTable'><tbody></tbody></table>");
				// error data 
				$(tbl).append("<tr id='DelError' style='display:none'><td >"+"&nbsp;"+"</td></tr>");
				$(tbl).append("<tr id='DelData' style='display:none'><td >"+rowids+"</td></tr>");
				$(tbl).append("<tr><td >"+p.msg+"</td></tr>");
				// buttons at footer
				var bS  ="<input id='dData' type='button' value='"+p.bSubmit+"'/>",
				bC  ="<input id='eData' type='button' value='"+p.bCancel+"'/>";
				$(tbl).append("<tr><td align='right' class='DelButton'>"+bS+"&nbsp;"+bC+"</td></tr>");
				p.gbox = "#gbox_"+gID;
				createModal(IDs,tbl,p,"#gview_"+$t.p.id,$("#gview_"+$t.p.id)[0]);
				$("#dData, #eData","#"+dtbl).addClass('ui-state-default ui-corner-all').height(21)
				.css({padding:".2em .5em", cursor: 'pointer'})
				.hover(
				   function(){$(this).addClass('ui-state-hover');}, 
				   function(){$(this).removeClass('ui-state-hover');}
				);
				//if( p.drag) { DnRModal("#"+IDs.themodal,"#"+IDs.modalhead+" td.modaltext"); }
				$("#dData","#"+dtbl).click(function(e){
					var ret=[true,""];
					var postdata = $("#DelData>td","#"+dtbl).text(); //the pair is name=val1,val2,...
					if( typeof p.onclickSubmit === 'function' ) { p.delData = p.onclickSubmit(p) || {}; }
					if( typeof p.beforeSubmit === 'function' ) { ret = p.beforeSubmit(postdata); }
					var gurl = p.url ? p.url : $t.p.editurl;
					if(!gurl) { ret[0]=false;ret[1] += " "+$.jgrid.errors.nourl;}
					if(ret[0] === false) {
						$("#DelError>td","#"+dtbl).html(ret[1]);
						$("#DelError","#"+dtbl).show();
					} else {
						if(!p.processing) {
							p.processing = true;
							//$(".loading","#"+IDs.themodal).fadeIn("fast");
							$(this).attr("disabled",true);
							var postd = $.extend({oper:"del", id:postdata},p.delData);
							$.ajax({
								url:gurl,
								type: p.mtype,
								data:postd,
								complete:function(data,Status){
									if(Status != "success") {
										ret[0] = false;
										ret[1] = Status+" Status: "+data.statusText +" Error code: "+data.status;
									} else {
										// data is posted successful
										// execute aftersubmit with the returned data from server
										if( typeof p.afterSubmit === 'function' ) {
											ret = p.afterSubmit(data,postdata);
										}
									}
									if(ret[0] === false) {
										$("#DelError>td","#"+dtbl).html(ret[1]);
										$("#DelError","#"+dtbl).show();
									} else {
										if(p.reloadAfterSubmit) {
											if($t.p.treeGrid) {
												$($t).setGridParam({treeANode:0,datatype:$t.p.treedatatype});
											}
											$($t).trigger("reloadGrid");
										} else {
											var toarr = [];
											toarr = postdata.split(",");
											if($t.p.treeGrid===true){
												try {$($t).delTreeNode(toarr[0])} catch(e){}
											} else {
												for(var i=0;i<toarr.length;i++) {
													$($t).delRowData(toarr[i]);
												}
											}
											$t.p.selrow = null;
											$t.p.selarrrow = [];
										}
										if($.isFunction(p.afterComplete)) {
											setTimeout(function(){p.afterComplete(data,postdata);},500);
										}
									}
									p.processing=false;
									$("#dData", "#"+dtbl).attr("disabled",false);
									//$(".loading","#"+IDs.themodal).fadeOut("fast");
									if(ret[0]) { hideModal("#"+IDs.themodal,{gb:"#gbox_"+gID,jqm:p.jqModal}); }
								}
							});
						}
					}
					return false;
				});
				$("#eData", "#"+dtbl).click(function(e){
					hideModal("#"+IDs.themodal,{gb:"#gbox_"+gID,jqm:p.jqModal});
					return false;
				});
				if(onBeforeShow) { p.beforeShowForm($("#"+dtbl)); }
				viewModal("#"+IDs.themodal,{gbox:"#gbox_"+gID,jqm:p.jqModal});
				if(onAfterShow) { p.afterShowForm($("#"+dtbl)); }
			}
		});
	},
	navGrid : function (elem, o, pEdit,pAdd,pDel,pSearch,pRefresh) {
		o = $.extend({
			edit: true,
			editicon: "ui-icon-pencil",
			add: true,
			addicon:"ui-icon-plus",
			del: true,
			delicon:"ui-icon-trash",
			search: true,
			searchicon:"ui-icon-search",
			refresh: true,
			refreshicon:"ui-icon-refresh",
			refreshstate: 'firstpage',
			position : "left",
			closeOnEscape : true
		}, $.jgrid.nav, o ||{});
		return this.each(function() {       
			var alertIDs = {themodal:'alertmod',modalhead:'alerthd',modalcontent:'alertcnt'},
			$t = this, vwidth, vheight, twd, tdw;
			if(!$t.grid) { return; }
			if ($("#"+alertIDs.themodal).html() == null) {
				if (typeof window.innerWidth != 'undefined') {
					vwidth = window.innerWidth,
					vheight = window.innerHeight
				} else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
					vwidth = document.documentElement.clientWidth,
					vheight = document.documentElement.clientHeight
				} else {
					vwidth=1024;
					vheight=768;
				}
				createModal(alertIDs,"<div>"+o.alerttext+"</div><span tabindex='0'><span tabindex='-1' id='jqg_alrt'><span></span>",{jqModal:true,drag:true,resize:true,caption:o.alertcap,top:vheight/2-25,left:vwidth/2-100,width:200,height:'auto',closeOnEscape:o.closeOnEscape},$t.grid.hDiv,$t.grid.hDiv,true);
			}
			var tbd,
			navtbl = $("<table cellspacing='0' cellpadding='0' border='0' class='ui-pg-table navtable' style='float:left;table-layout:auto;'><tbody><tr></tr></tbody></table>"),
			sep = "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='ui-separator'></span></td>",
			pgid = $($t.p.pager).attr("id") || 'pager';
			if (o.add) {
				pAdd = pAdd || {};
				tbd = $("<td></td>");
				$(tbd).addClass('ui-pg-button ui-corner-all').append("<div class='ui-pg-div'><span class='ui-icon "+o.addicon+"'></span>"+o.addtext+"</div>");
				$("tr",navtbl).append(tbd);
				$(tbd,navtbl)
				.attr({"title":o.addtitle || "",id : pAdd.id || "add_"+$t.p.id})
				.click(function(){
					if (typeof o.addfunc == 'function') {
						o.addfunc();
					} else {
						$($t).editGridRow("new",pAdd);
					}
					return false;
				})
				.hover(
					function () {
						$(this).addClass("ui-state-hover");
					},
					function () {
						$(this).removeClass("ui-state-hover");
					}
				);
				tbd = null;
			}
			if (o.edit) {
				tbd = $("<td></td>");
				pEdit = pEdit || {};
				$(tbd).addClass('ui-pg-button ui-corner-all').append("<div class='ui-pg-div'><span class='ui-icon "+o.editicon+"'></span>"+o.edittext+"</div>");
				$("tr",navtbl).append(tbd);
				$(tbd,navtbl)
				.attr({"title":o.edittitle || "",id: pEdit.id || "edit_"+$t.p.id})
				.click(function(){
					var sr = $($t).getGridParam('selrow');
					if (sr) {
						if(typeof o.editfunc == 'function') {
							o.editfunc(sr);
						} else {
							$($t).editGridRow(sr,pEdit);
						}
					} else {
						viewModal("#"+alertIDs.themodal,{toTop:false});
						$("#jqg_alrt").focus();
					}
					return false;
				})
				.hover( function () {
					$(this).addClass("ui-state-hover");
					},
					function () {
						$(this).removeClass("ui-state-hover");
					}
				);
				tbd = null;
			}
			if (o.del) {
				tbd = $("<td></td>");
				pDel = pDel || {};
				$(tbd).addClass('ui-pg-button ui-corner-all').append("<div class='ui-pg-div'><span class='ui-icon "+o.delicon+"'></span>"+o.deltext+"</div>");
				$("tr",navtbl).append(tbd);
				$(tbd,navtbl)
				.attr({"title":o.deltitle || "",id: pDel.id || "del_"+$t.p.id})
				.click(function(){
					var dr;
					if($t.p.multiselect) {
						dr = $($t).getGridParam('selarrrow');
						if(dr.length==0) { dr = null; }
					} else {
						dr = $($t).getGridParam('selrow');
					}
					if (dr) { $($t).delGridRow(dr,pDel); }
					else  {viewModal("#"+alertIDs.themodal,{toTop:false}); $("#jqg_alrt").focus(); }
					return false;
				})
				.hover(
					function () {
						$(this).addClass("ui-state-hover");
					},
					function () {
						$(this).removeClass("ui-state-hover");
					}
				);
				tbd = null;
			}
			if(o.add || o.edit || o.del) { $("tr",navtbl).append(sep); }
			if (o.search) {
				tbd = $("<td></td>");
				pSearch = pSearch || {};
				$(tbd).addClass('ui-pg-button ui-corner-all no-dirty-cell').append("<div class='ui-pg-div'><span class='ui-icon "+o.searchicon+"'></span>"+o.searchtext+"</div>");
				$("tr",navtbl).append(tbd);
				if( $(elem)[0] == $t.p.pager[0] ) { pSearch = $.extend(pSearch,{dirty:true}); }
				$(tbd,navtbl)
				.attr({"title":o.searchtitle  || "",id:pSearch.id || "search_"+$t.p.id})
				.click(function(){
					$($t).searchGrid(pSearch);
					return false;
				})
				.hover(
					function () {
						$(this).addClass("ui-state-hover");
					},
					function () {
						$(this).removeClass("ui-state-hover");
					}
				);
				tbd = null;
			}
			if (o.refresh) {
				tbd = $("<td></td>");
				$(tbd).addClass('ui-pg-button ui-corner-all').append("<div class='ui-pg-div'><span class='ui-icon "+o.refreshicon+"'></span>"+o.refreshtext+"</div>");
				$("tr",navtbl).append(tbd);
				var dirtycell =  ($(elem)[0] == $t.p.pager[0] ) ? true : false;
				pRefresh = pRefresh || {};
				$(tbd,navtbl)
				.attr({"title":o.refreshtitle  || "",id: pRefresh.id || "refresh_"+$t.p.id})
				.click(function(){
					$t.p.search = false;
					switch (o.refreshstate) {
						case 'firstpage':
							$t.p.page=1;
							$($t).trigger("reloadGrid");
							break;
						case 'current':
							var sr = $t.p.multiselect===true ? selarrrow : $t.p.selrow;
							$($t).trigger("reloadGrid");
							setTimeout(function(){
								if($t.p.multiselect===true) {
									if(sr.length>0) {
										for(var i=0;i<sr.length;i++){
											$($t).setSelection(sr[i],false);
										}
									}
								} else {
									if(sr) {
										$($t).setSelection(sr,false);
									}
								}
							},1000);
							break;
					}
					if (dirtycell) { $(".no-dirty-cell",$t.p.pager).removeClass("dirty-cell"); }
					if(o.search) {
						var gID = $("table:first",$t.grid.bDiv).attr("id");
						$("#sval",'#srchcnt'+gID).val("");
					}
					return false;
				})
				.hover(
					function () {
						$(this).addClass("ui-state-hover");
					},
					function () {
						$(this).removeClass("ui-state-hover");
					}
				);
				tbd = null;
			}
			tdw = $(".ui-jqgrid").css("font-size") || "11px";
			$('body').append("<div id='testpg' class='ui-jqgrid ui-widget ui-widget-content' style='font-size:"+tdw+";visibility:hidden;' ></div>");
			twd = $(navtbl).clone(false).appendTo("#testpg").width();
			$("#testpg").remove();
			$("#"+pgid+"_"+o.position,"#"+pgid).append(navtbl);
			if($t.p._nvtd) {
				if(twd > $t.p._nvtd[0] ) {
					$("#"+pgid+"_"+o.position,"#"+pgid).width(twd);
					$t.p._nvtd[0] = twd;
				}
				$t.p._nvtd[1] = twd;
			}
		});
	},
	navButtonAdd : function (elem, p) {
		p = $.extend({
			caption : "newButton",
			title: '',
			buttonimg : 'ui-icon ui-icon-newwin',
			onClickButton: null,
			position : "last"
		}, p ||{});
		return this.each(function() {
			if( !this.grid)  { return; }
			if( elem.indexOf("#") != 0) { elem = "#"+elem; }
			var findnav = $(".navtable",elem)[0];
			if (findnav) {
				var tbd = $("<td></td>");
				$(tbd).addClass('ui-pg-button ui-corner-all').append("<div class='ui-pg-div'><span class='"+p.buttonimg+"'></span>"+p.caption+"</div>");
				if(p.id) {$(tbd).attr("id",p.id);}
				if(p.position=='first'){
					if(findnav.rows[0].cells.length ===0 ) {
						$("tr",findnav).append(tbd);
					} else {
						$("tr td:eq(0)",findnav).before(tbd);
					}
				} else {
					$("tr",findnav).append(tbd);
				}
				$(tbd,findnav)
				.attr("title",p.title  || "")
				.click(function(e){
					if ($.isFunction(p.onClickButton) ) { p.onClickButton(); }
					e.stopPropagation();
					return false;
				})
				.hover(
					function () {$(this).addClass("ui-state-hover");},
					function () {$(this).removeClass("ui-state-hover");}
				);
				if( this.p._nvtd ) {
					/* to be written
					var nwtd =45;
					if(this.p._nvtd[1] + nwtd > this.p._nvtd[0]) {
						this.p._nvtd[0] += nwtd;
						$(findnav).parent().width(this.p._nvtd[0]);
					}
					this.p._nvtd[1] += nwtd;
					*/
				}
			}
		});
	},
	GridToForm : function( rowid, formid ) {
		return this.each(function(){
			var $t = this;
			if (!$t.grid) { return; } 
			var rowdata = $($t).getRowData(rowid);
			if (rowdata) {
				for(var i in rowdata) {
					if ( $("[name="+i+"]",formid).is("input:radio") )  {
						$("[name="+i+"]",formid).each( function() {
							if( $(this).val() == rowdata[i] ) {
								$(this).attr("checked","checked");
							} else {
								$(this).attr("checked","");
							}
						});
					} else {
					// this is very slow on big table and form.
						$("[name="+i+"]",formid).val(rowdata[i]);
					}
				}
			}
		});
	},
	FormToGrid : function(rowid, formid){
		return this.each(function() {
			var $t = this;
			if(!$t.grid) { return; }
			var fields = $(formid).serializeArray();
			var griddata = {};
			$.each(fields, function(i, field){
				griddata[field.name] = field.value;
			});
			$($t).setRowData(rowid,griddata);
		});
	}
});
})(jQuery);
