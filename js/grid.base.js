;(function ($) {
/*
 * jqGrid  3.5 alfa 3 - jQuery Grid
 * Copyright (c) 2008, Tony Tomov, tony@trirand.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Date: 2009-05-01
 */
$.fn.jqGrid = function( p ) {
	p = $.extend(true,{
	url: "",
	height: 150,
	page: 1,
	rowNum: 20,
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
	loadComplete: null,
	gridComplete: null,
	loadError: null,
	loadBeforeSend: null,
	afterInsertRow: null,
	beforeRequest: null,
	onHeaderClick: null,
	viewrecords: false,
	loadonce: false,
	multiselect: false,
	multikey: false,
	editurl: null,
	search: false,
	searchdata: {},
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
	prmNames: {page:"page",rows:"rows", sort: "sidx",order: "sord"},
	forceFit : false,
	gridstate : "visible",
	cellEdit: false,
	cellsubmit: "remote",
	nv:0,
	loadui: "enable",
	toolbar: [false,""],
	scroll: false,
	multiboxonly : false,
	deselectAfterSort : true,
	scrollrows : false,
	autowidth: false
	}, $.jgrid.defaults, p || {});
	var grid={         
		headers:[],
		cols:[],
		dragStart: function(i,x,y) {
			this.resizing = { idx: i, startX: x.clientX, sOL : y[0]};
			this.hDiv.style.cursor = "col-resize";
			$(".ui-jqgrid-resize-mark","#gbox_"+p.id).css({visibility:"visible",left:y[0],top:y[1],height:y[2]});
		},
		dragMove: function(x) {
			if(this.resizing) {
				var diff = x.clientX-this.resizing.startX,
				h = this.headers[this.resizing.idx],
				newWidth = h.width + diff, hn, nWn;
				if(newWidth > 25) {
					$(".ui-jqgrid-resize-mark","#gbox_"+p.id).css({left:this.resizing.sOL+diff});
					if(p.forceFit===true ){
						hn = this.headers[this.resizing.idx+p.nv];
						nWn = hn.width - diff;
						if(nWn >25) {
							h.newWidth = newWidth;
							hn.newWidth = nWn;
							this.newWidth = p.tblwidth;
						}
					} else {
						this.newWidth = p.tblwidth+diff;
						h.newWidth = newWidth;
					}
				}
			}
		},
		dragEnd: function() {
			this.hDiv.style.cursor = "default";
			if(this.resizing) {
				var idx = this.resizing.idx,
				nw = this.headers[idx].newWidth || this.headers[idx].width;
				this.resizing = false;
				$(".ui-jqgrid-resize-mark").css("visibility","hidden");
				p.colModel[idx].width = nw;
				this.headers[idx].width = nw;
				this.headers[idx].el.style.width = nw + "px";
				this.cols[idx].style.width = nw+"px";
				$('table:first tr td:eq('+idx+')',this.bDiv).css("width",nw+"px");
				$('table:first tr:first td:eq('+idx+')',this.hDiv).css("width",nw+"px");
				if(p.forceFit===true){
					nw = this.headers[idx+p.nv].newWidth || this.headers[idx+p.nv].width;
					this.headers[idx+p.nv].width = nw;
					this.headers[idx+p.nv].el.style.width = nw + "px";
					this.cols[idx+p.nv].style.width = nw+"px";
					p.colModel[idx+p.nv].width = nw;
				} else  {
					p.tblwidth = this.newWidth;
					$('table:first',this.bDiv).css("width",p.tblwidth+"px");
					$('table:first',this.hDiv).css("width",p.tblwidth+"px");
					this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				}
			}
		},
		scrollGrid: function() {
			if(p.scroll === true) {
				var scrollTop = this.bDiv.scrollTop;
				if (scrollTop != this.scrollTop) {
					this.scrollTop = scrollTop;
					if ((this.bDiv.scrollHeight-scrollTop-$(this.bDiv).height()) <= 0) {
						if(parseInt(p.page,10)+1<=parseInt(p.lastpage,10)) {
							p.page = parseInt(p.page,10)+1;
							this.populate();
						}
					}
				}
			}
			this.hDiv.scrollLeft = this.bDiv.scrollLeft;
		}
	};
	$.fn.getGridParam = function(pName) {
		var $t = this[0];
		if (!$t.grid) {return;}
		if (!pName) { return $t.p; }
		else {return $t.p[pName] ? $t.p[pName] : null;}
	};
	$.fn.setGridParam = function (newParams){
		return this.each(function(){
			if (this.grid && typeof(newParams) === 'object') {$.extend(true,this.p,newParams);}
		});
	};
	$.fn.getDataIDs = function () {
		var ids=[];
		this.each(function(){
			$(this.rows).each(function(i){
				ids[i]=this.id;
			});
		});
		return ids;
	};
	$.fn.setSortName = function (newsort) {
		return this.each(function(){
			var $t = this,i;
			for(i=0;i< $t.p.colModel.length;i++){
				if($t.p.colModel[i].name===newsort || $t.p.colModel[i].index===newsort){
					$("tr th:eq("+$t.p.lastsort+") div img",$t.grid.hDiv).remove();
					$t.p.lastsort = i;
					$t.p.sortname=newsort;
					break;
				}
			}
		});
	};
	$.fn.setSelection = function(selection,onsr,sd) {
		return this.each(function(){
			var $t = this, stat,pt, ind, olr, ner, ia, tpsr;
			onsr = onsr === false ? false : true;
			if(selection===false) {pt = sd;}
			else { ind = $($t).getInd($t.rows,selection); pt=$($t.rows[ind]);}
			selection = $(pt).attr("id");
			if (!pt.html()) {return;}
			if($t.p.selrow && $t.p.scrollrows===true) {
				olr = $($t).getInd($t.rows,$t.p.selrow);
				ner = $($t).getInd($t.rows,selection);
				if(ner >=0 ){
					if(ner > olr ) {
						scrGrid(ner,'d');
					} else {
						scrGrid(ner,'u');
					}
				}
			}
			if(!$t.p.multiselect) {
				if($(pt).attr("class") !== "subgrid") {
				if( $t.p.selrow ) {$("tr#"+$t.p.selrow.replace(".", "\\."),$t.grid.bDiv).removeClass("ui-state-highlight").attr("aria-selected","false") ;}
				$t.p.selrow = selection;
				$(pt).addClass("ui-state-highlight").attr("aria-selected","true");
				if( $t.p.onSelectRow && onsr) { $t.p.onSelectRow($t.p.selrow, true); }
				}
			} else {
				$t.p.selrow = selection;
				ia = $.inArray($t.p.selrow,$t.p.selarrrow);
				if (  ia === -1 ){ 
					if($(pt).attr("class") !== "subgrid") { $(pt).addClass("ui-state-highlight").attr("aria-selected","true");}
					stat = true;
					$("#jqg_"+$t.p.selrow.replace(".", "\\."),$t.rows).attr("checked",stat);
					$t.p.selarrrow.push($t.p.selrow);
					if( $t.p.onSelectRow && onsr) { $t.p.onSelectRow($t.p.selrow, stat); }
				} else {
					if($(pt).attr("class") !== "subgrid") { $(pt).removeClass("ui-state-highlight").attr("aria-selected","false");}
					stat = false;
					$("#jqg_"+$t.p.selrow.replace(".", "\\."),$t.rows).attr("checked",stat);
					$t.p.selarrrow.splice(ia,1);
					if( $t.p.onSelectRow && onsr) { $t.p.onSelectRow($t.p.selrow, stat); }
					tpsr = $t.p.selarrrow[0];
					$t.p.selrow = (tpsr=='undefined') ? null : tpsr;
				}
			}
			function scrGrid(iR,tp){
				var ch = $($t.grid.bDiv)[0].clientHeight,
				st = $($t.grid.bDiv)[0].scrollTop,
				nROT = $t.rows[iR].offsetTop+$t.rows[iR].clientHeight,
				pROT = $t.rows[iR].offsetTop;
				if(tp == 'd') {
					if(nROT >= ch) { $($t.grid.bDiv)[0].scrollTop = st + nROT-pROT; }
				}
				if(tp == 'u'){
					if (pROT < st) { $($t.grid.bDiv)[0].scrollTop = st - nROT+pROT; }
				}
			}
		});
	};
	$.fn.resetSelection = function(){
		return this.each(function(){
			var t = this, ind;
			if(!t.p.multiselect) {
				if(t.p.selrow) {
					$("tr#"+t.p.selrow.replace(".", "\\."),t.grid.bDiv).removeClass("ui-state-highlight");
					t.p.selrow = null;
				}
			} else {
				$(t.p.selarrrow).each(function(i,n){
					ind = $(t).getInd(t.rows,n);
					$(t.rows[ind]).removeClass("ui-state-highlight");
					$("#jqg_"+n.replace(".", "\\."),t.rows[ind]).attr("checked",false);
				});
				$("#cb_jqg",t.grid.hDiv).attr("checked",false);
				t.p.selarrrow = [];
			}
			t.p.savedRow = [];
		});
	};
	$.fn.getRowData = function( rowid ) {
		var res = {};
		this.each(function(){
			var $t = this,nm,ind;
			ind = $($t).getInd($t.rows,rowid);
			if (ind===false) {return res;}
			$('td',$t.rows[ind]).each( function(i) {
				nm = $t.p.colModel[i].name; 
				if ( nm !== 'cb' && nm !== 'subgrid') {
					if($t.p.treeGrid===true && nm == $t.p.ExpandColumn) {
						res[nm] = $.htmlDecode($("span:first",this).html());
					} else {
						res[nm] = $.htmlDecode($(this).html());
					}
				}
			});
		});
		return res;
	};
	$.fn.delRowData = function(rowid) {
		var success = false, rowInd, ia;
		this.each(function() {
			var $t = this;
			rowInd = $($t).getInd($t.rows,rowid);
			if(rowInd===false) {return false;}
			else {
				$($t.rows[rowInd]).remove();
				$t.p.records--;
				$t.p.reccount--;
				$t.updatepager();
				success=true;
				if(rowid == $t.p.selrow) {$t.p.selrow=null;}
				ia = $.inArray(rowid,$t.p.selarrrow);
				if(ia != -1) {$t.p.selarrrow.splice(ia,1);}
			}
			if(rowInd == 0 && success ) {
				$($t.rows[0]).each( function( k ) {
					$(this).css("width",$t.grid.headers[k].width+"px");
					$t.grid.cols[k] = this;
				});
			}
		});
		return success;
	};
	$.fn.setRowData = function(rowid, data) {
		var nm, success=false;
		this.each(function(){
			var t = this, vl, ind, ttd;
			if(!t.grid) {return false;}
			if( data ) {
				ind = $(t).getInd(t.rows,rowid);
				if(ind===false) {return false;}
				success=true;
				$(this.p.colModel).each(function(i){
					nm = this.name;
					vl = data[nm];
					if( vl != undefined) {
						if(t.p.treeGrid===true && nm == t.p.ExpandColumn) {
							ttd = $("td:eq("+i+") > span:first",t.rows[ind]);
						} else {
							ttd = $("td:eq("+i+")",t.rows[ind]); 
						}
						t.formatter(ttd, t.rows[ind], vl, i, t.rows[ind], 'edit');
						success = true;
					}
				});
			}
		});
		return success;
	};
	$.fn.addRowData = function(rowid,data,pos,src) {
		if(!pos) {pos = "last";}
		var success = false, nm, row, td, gi=0, si=0,sind, i;
		if(data) {
			this.each(function() {
				var t = this;
				row =  document.createElement("tr");
				row.id = rowid || t.p.records+1;
				row.className = 'ui-widget-content jqgrow';
				$(row).attr({"role":"row"})
				if(t.p.multiselect) {
					td = $("<td role='gridcell'></td>");
					$(td[0],t.grid.bDiv).html("<input type='checkbox'"+" id='jqg_"+rowid+"' class='cbox'/>");
					row.appendChild(td[0]);
					t.formatCol($(td[0],t.grid.bDiv),0,t.p.records);
					gi = 1;
				}
				if(t.p.subGrid ) { try {$(t).addSubGrid(t.grid.bDiv,row,gi,t.p.records);} catch(e){} si=1;}
				for(i = gi+si; i < this.p.colModel.length;i++){
					nm = this.p.colModel[i].name;
					td  = $("<td role='gridcell'></td>");
					t.formatter(td, row, data[nm], i, data, 'add');
					t.formatCol($(td[0],t.grid.bDiv),i,t.p.records);
					row.appendChild(td[0]);
				}
				if(t.rows.length == 0){
					$("tbody",t.grid.bDiv).append(row);
				} else {
				switch (pos) {
					case 'last':
						$(t.rows[t.rows.length-1]).after(row);
						break;
					case 'first':
						$(t.rows[0]).before(row);
						break;
					case 'after':
						sind = $(t).getInd(t.rows,src);
						sind >= 0 ?	$(t.rows[sind]).after(row): "";
						break;
					case 'before':
						sind = $(t).getInd(t.rows,src);
						sind >= 0 ?	$(t.rows[sind]).before(row): "";
						break;
				}
				}
				t.p.records++;
				t.p.reccount++;
				if(pos=='first' || (pos=='before' && sind==0)){
					if(t.rows[0]){
						$("td",t.rows[0]).each( function( k ) {
							$(this).css("width",grid.headers[k].width+"px");
							grid.cols[k] = this;
						});
					}
				}
				try {t.p.afterInsertRow(row.id,data); } catch(e){}
				t.updatepager();
				success = true;
			});
		}
		return success;
	};
	$.fn.hideCol = function(colname) {
		return this.each(function() {
			var $t = this,w=0, fndh=false;
			if (!$t.grid ) {return;}
			if( typeof colname == 'string') {colname=[colname];}
			$(this.p.colModel).each(function(i) {
				if ($.inArray(this.name,colname) != -1 && !this.hidden) {
					w = parseInt($("tr th:eq("+i+")",$t.grid.hDiv).css("width"),10);
 					$("tr th:eq("+i+")",$t.grid.hDiv).css({display:"none"});
					$($t.rows).each(function(j){
						$("td:eq("+i+")",$t.rows[j]).css({display:"none"});
					});
					$t.p.tblwidth -= w;
					this.hidden=true;
					fndh=true;
					// forcefit cond
				}
			});
			if(fndh===true) {
				$("table:first",$t.grid.hDiv).width($t.p.tblwidth);
				$("table:first",$t.grid.bDiv).width($t.p.tblwidth);
				$t.grid.hDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
			}
		});
	};
	$.fn.showCol = function(colname) {
		return this.each(function() {
			var $t = this, w = 0, fdns=false;
			if (!$t.grid ) {return;}
			if( typeof colname == 'string') {colname=[colname];}
			$($t.p.colModel).each(function(i) {
				if ($.inArray(this.name,colname) != -1 && this.hidden) {
					w = parseInt($("tr th:eq("+i+")",$t.grid.hDiv).css("width"),10);
					$("tr th:eq("+i+")",$t.grid.hDiv).css("display","");
					$($t.rows).each(function(j){
						$("td:eq("+i+")",$t.rows[j]).css("display","").width(w);
					});
					this.hidden=false;
					$t.grid.cols[i].style.width = w+"px";
					$t.grid.headers[i].width =  w;
					$t.grid.headers[i].el.style.width =  w+"px";
					this.width = w;
					$t.p.tblwidth += w;
					fdns=true;
					//forceFit cond
				}
			});
			if(fdns===true) {
				$("table:first",$t.grid.hDiv).width($t.p.tblwidth);
				$("table:first",$t.grid.bDiv).width($t.p.tblwidth);
				$t.grid.hDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
			}
		});
	};
	$.fn.setGridWidth = function(nwidth, shrink) {
		return this.each(function(){
			var $t = this, cw,
			initwidth = 0, brd=5, l, vc=0, isSafari,hs=false, scw=5, aw;
			if (!$t.grid ) {return;}
			if(typeof shrink != 'boolean') {
				shrink=$t.p.shrinkToFit;
			}
			if(isNaN(nwidth)) {return;}
			if(nwidth === grid.width) {return;}
			else { grid.width = $t.p.width = nwidth;}
			// set the base width
			$("#gbox_"+$t.p.id).css("width",nwidth+"px");
			$("#gview_"+$t.p.id).css("width",nwidth+"px");
			$($t.grid.bDiv).css("width",nwidth+"px");
			$($t.grid.hDiv).css("width",nwidth+"px");
			if($t.p.pager && $($t.p.pager).hasClass("scroll") ) {$($t.p.pager).css("width",nwidth+"px");}
			if($t.p.toolbar[0] === true){
				$($t.grid.uDiv).css("width",nwidth+"px");
				if($t.p.toolbar[1]=="both") {$($t.grid.ubDiv).css("width",nwidth+"px");}
			}
			if(shrink===true) {
				for(l=0;l<=$t.p.colModel.length-1;l++){
					if($t.p.colModel[l].hidden === false){
						initwidth += parseInt($t.p.colModel[l].width,10);
						vc=vc+1;
					}
				}
				$t.p.tblwidth = initwidth;
				aw = nwidth-brd*vc;
				isSafari = $.browser.safari ? true : false;
				
				if(shrink ===false && $t.p.forceFit == true) {$t.p.forceFit=false;}
				if(isNaN($t.p.height)) {
				} else {
					if($($t.grid.bDiv)[0].clientHeight < $($t.grid.bDiv)[0].scrollHeight){
						hs = true;
						scw = isSafari ? 14 : 22;
						aw -= scw;
					}
				}
				initwidth =0; vc=0;
				for(l=0;l<=$t.p.colModel.length-1;l++) {
					if($t.p.colModel[l].hidden === false){
						cw = Math.floor((aw)/$t.p.tblwidth*$t.p.colModel[l].width);
						$t.p.colModel[l].width =cw;
						initwidth += cw;
						$t.grid.headers[l].width=cw;
						$t.grid.headers[l].el.style.width=cw+"px";
						$t.grid.cols[l].style.width = cw+"px";
						vc = l;
					}
				}
				var cr =0;
				if (hs && nwidth-(initwidth+brd*vc) !== scw) {
					cr = nwidth-(initwidth+brd*vc)-scw;
				} else if(nwidth-(initwidth+brd*vc) !== 0) {
					cr = nwidth-(initwidth+brd*vc);
				}
				$t.p.colModel[vc].width += cr;
				cw= $t.p.colModel[vc].width;
				$t.grid.headers[vc].width = cw;
				$t.grid.headers[vc].el.style.width=cw+"px";
				$t.grid.cols[vc].style.width = cw+"px";
				$t.p.tblwidth = initwidth+cr;
				$('table:first',$t.grid.bDiv).css("width",initwidth+cr+"px");
				$('table:first',$t.grid.hDiv).css("width",initwidth+cr+"px");
				$t.grid.hDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
			}
		});
	};
	$.fn.setGridHeight = function (nh) {
		return this.each(function (){
			var $t = this;
			if(!$t.grid) {return;}
			$($t.grid.bDiv).css({height: nh+(isNaN(nh)?"":"px")});
			$t.p.height = nh;
		});
	};
	$.fn.setCaption = function (newcap){
		return this.each(function(){
			this.p.caption=newcap;
			$("span.ui-jqgrid-title",this.grid.cDiv).html(newcap);
			$(this.grid.cDiv).show();
		});
	};
	$.fn.setLabel = function(colname, nData, prop, attrp ){
		return this.each(function(){
			var $t = this, pos=-1;
			if(!$t.grid) {return;}
			if(isNaN(colname)) {
				$($t.p.colModel).each(function(i){
					if (this.name == colname) {
						pos = i;return false;
					}
				});
			} else {pos = parseInt(colname,10);}
			if(pos>=0) {
				var thecol = $("table:first th:eq("+pos+")",$t.grid.hDiv);
				if (nData){
					$("div",thecol).html(nData);
				}
				if (prop) {
					if(typeof prop === 'string') {$(thecol).addClass(prop);} else {$(thecol).css(prop);}
				}
				if(typeof attrp === 'object') {$(thecol).attr(attrp);}
			}
		});
	};
	$.fn.setCell = function(rowid,colname,nData,cssp,attrp) {
		return this.each(function(){
			var $t = this, pos =-1;
			if(!$t.grid) {return;}
			if(isNaN(colname)) {
				$($t.p.colModel).each(function(i){
					if (this.name == colname) {
						pos = i;return false;
					}
				});
			} else {pos = parseInt(colname,10);}
			if(pos>=0) {
				var ind = $($t).getInd($t.rows,rowid);
				if (ind>=0){
					var tcell = $("td:eq("+pos+")",$t.rows[ind]);
					if(nData !== "") {
						$t.formatter(tcell, $t.rows[ind], nData, pos,$t.rows[ind],'edit');
					}
					if (cssp){
						if(typeof cssp === 'string') {$(tcell).addClass(cssp);} else {$(tcell).css(cssp);}
					}
					if(typeof attrp === 'object') {$(tcell).attr(attrp);}
				}
			}
		});
	};
	$.fn.getCell = function(rowid,col) {
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
				var ind = $($t).getInd($t.rows,rowid);
				if(ind>=0) {
					ret = $.htmlDecode($("td:eq("+pos+")",$t.rows[ind]).html());
				}
			}
		});
		return ret;
	};
	$.fn.clearGridData = function() {
		return this.each(function(){
			var $t = this;
			if(!$t.grid) {return;}
			$("tbody tr", $t.grid.bDiv).remove();
			$t.p.selrow = null; $t.p.selarrrow= []; $t.p.savedRow = [];
			$t.p.records = '0';$t.p.page='0';$t.p.lastpage='0';$t.p.reccount=0;
			$t.updatepager();
		});
	};
	$.fn.getInd = function(obj,rowid,rc){
		var ret =false;
		$(obj).each(function(i){
			if(this.id===rowid) {
				ret = rc===true ? this : i;
				return false;
			}
		});
		return ret;
	};
	$.htmlDecode = function(value){
		if(value=='&nbsp;' || value=='&#160;' || (value.length==1 && value.charCodeAt(0)==160)) { return "";}
		return !value ? value : String(value).replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"');
	};
    $.jqgformat = function(format){
		var args = $.makeArray(arguments).slice(1);
        return format.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    };
	$.getAbsoluteIndex = function (t,rInd){ 
		var cntnotv=0,cntv=0, cell, i;
		for (i=0;i<t.cells.length;i++) { 
			cell=t.cells(i); 
			if (cell.style.display=='none') cntnotv++; else cntv++; 
			if (cntv>rInd) return i; 
		}
		return i; 
	};

	return this.each( function() {
		if(this.grid) {return;}
		this.p = p ;
		var i;
		if(this.p.colNames.length === 0) {
			for (i=0;i<this.p.colModel.length;i++){
				this.p.colNames[i] = this.p.colModel[i].label || this.p.colModel[i].name;
			}
		}
		if( this.p.colNames.length !== this.p.colModel.length ) {
			alert($.jgrid.errors.model);
			return;
		}
		var gv = $("<div class='ui-jqgrid-view'</div>"), ii,
		isMSIE = $.browser.msie ? true:false,
		isSafari = $.browser.safari ? true : false;
		
		$(gv).insertBefore(this);
		$(this).appendTo(gv).removeClass("scroll");
		var eg = $("<div class='ui-jqgrid ui-widget ui-widget-content ui-corner-all'></div>");
		$(eg).insertBefore(gv).attr("id","gbox_"+this.id);
		$(gv).appendTo(eg).attr("id","gview_"+this.id);
		if (isMSIE && /6.0/.test(navigator.userAgent)) {
			ii = $('<iframe src="javascript:false;document.write(\'\');"></iframe>').css({opacity:0});
		} else { ii="";}
		$("<div class='ui-widget-overlay jqgrid-overlay' id='lui_"+this.id+"'></div>").append(ii).insertBefore(gv);
		$("<div class='loading ui-state-default' id='load_"+this.id+"'>"+this.p.loadtext+"</div>").insertBefore(gv);
		$(this).attr({cellSpacing:"0",cellPadding:"0",border:"0","role":"grid","aria-multiselectable":this.p.multiselect,"aria-labelledby":"gbox_"+this.id});
		var ts = this,
		bSR = $.isFunction(this.p.beforeSelectRow) ? this.p.beforeSelectRow :false,
		ondblClickRow = $.isFunction(this.p.ondblClickRow) ? this.p.ondblClickRow :false,
		onSortCol = $.isFunction(this.p.onSortCol) ? this.p.onSortCol : false,
		loadComplete = $.isFunction(this.p.loadComplete) ? this.p.loadComplete : false,
		loadError = $.isFunction(this.p.loadError) ? this.p.loadError : false,
		loadBeforeSend = $.isFunction(this.p.loadBeforeSend) ? this.p.loadBeforeSend : false,
		onRightClickRow = $.isFunction(this.p.onRightClickRow) ? this.p.onRightClickRow : false,
		afterInsRow = $.isFunction(this.p.afterInsertRow) ? this.p.afterInsertRow : false,
		onHdCl = $.isFunction(this.p.onHeaderClick) ? this.p.onHeaderClick : false,
		beReq = $.isFunction(this.p.beforeRequest) ? this.p.beforeRequest : false,
		onSC = $.isFunction(this.p.onCellSelect) ? this.p.onCellSelect : false,
		sortkeys = ["shiftKey","altKey","ctrlKey"],
		IntNum = function(val,defval) {
			val = parseInt(val,10);
			if (isNaN(val)) { return defval ? defval : 0;}
			else {return val;}
		},
		formatCol = function (elem, pos, row){
			var ral = ts.p.colModel[pos].align;
			if(ral) { $(elem).css("text-align",ral);}
			if(ts.p.colModel[pos].hidden===true) {$(elem).css("display","none");}
			if(row===0) {
				$(elem).css({width : grid.headers[pos].width+"px"});
				grid.cols[pos] = $(elem)[0];
				grid.cols[pos].style.width = grid.headers[pos].width+"px";
			}
		},
		addCell = function(t,row,cell,pos,irow, srvr) {
			var td;
			td = $("<td role='gridcell'></td>");
			formatter(td,row,cell,pos,srvr,'add');
			$(row).append(td);
			formatCol(td, pos,irow);
		},
		formatter = function (elem, row, cellval , colpos, rwdat, _act){
			var cm = ts.p.colModel[colpos]; 
			if(typeof cm.formatter !== 'undefined') {
				var opts= {rowId: row.id, colModel:cm,rowData:row};
				if($.isFunction( cm.formatter ) ) {
					cm.formatter(elem,cellval,opts,rwdat,_act);
				} else if($.fmatter){
					$(elem).fmatter(cm.formatter, cellval,opts, rwdat, _act);
				} else {
					$(elem).html(cellVal(cellval));
				}
			}else {
				$(elem).html(cellVal(cellval));
			}
			elem[0].title = elem[0].textContent || elem[0].innerText;
		},
		cellVal =  function (val) {
			return val === undefined || val === null || val === "" ? "&#160;" : val+"";
		},
		addMulti = function(t,row,irow){
			var cbid,td;
			td = $("<td role='gridcell'></td>");
			cbid = "jqg_"+row.id;
			$(td).html("<input type='checkbox'"+" id='"+cbid+"' class='cbox' name='"+cbid+"'/>");
			formatCol(td, 0,irow);
			$(row).append(td);
		},
		reader = function (datatype) {
			var field, f=[], j=0, i;
			for(i =0; i<ts.p.colModel.length; i++){
				field = ts.p.colModel[i];
				if (field.name !== 'cb' && field.name !=='subgrid') {
					f[j] = (datatype=="xml") ? field.xmlmap || field.name : field.jsonmap || field.name;
					j++;
				}
			}
			return f;
		},
		addXmlData = function (xml,t, rcnt) {
			ts.p.reccount = 0;
			if(xml) {
				if(ts.p.treeANode===-1 && ts.p.scroll===false) {
					$("tbody tr", t).remove(); rcnt=0;
				} else { rcnt = rcnt > 0 ? rcnt :0; }
			} else { return; }
			var i,fpos,ir=0,v,row,gi=0,si=0,idn, getId,f=[],rd ={}, rl= ts.rows.length, xmlr;
			if(!ts.p.xmlReader.repeatitems) {f = reader("xml");}
			if( ts.p.keyIndex===false) {
				idn = ts.p.xmlReader.id;
				if( idn.indexOf("[") === -1 ) {
					getId = function( trow, k) {return $(idn,trow).text() || k;};
				}
				else {
					getId = function( trow, k) {return trow.getAttribute(idn.replace(/[\[\]]/g,"")) || k;};
				}
			} else {
				getId = function(trow) { return (f.length - 1 >= ts.p.keyIndex) ? $(f[ts.p.keyIndex],trow).text() : $(ts.p.xmlReader.cell+":eq("+ts.p.keyIndex+")",trow).text(); };
			}
			$(ts.p.xmlReader.page,xml).each(function() {ts.p.page = this.textContent  || this.text ; });
			$(ts.p.xmlReader.total,xml).each(function() {ts.p.lastpage = this.textContent  || this.text ; }  );
			$(ts.p.xmlReader.records,xml).each(function() {ts.p.records = this.textContent  || this.text ; }  );
			$(ts.p.xmlReader.userdata,xml).each(function() {ts.p.userData[this.getAttribute("name")]=this.textContent || this.text;});
			$(ts.p.xmlReader.root+" "+ts.p.xmlReader.row,xml).each( function( j ) {
				xmlr = this;
				row = $("<tr id='"+getId(this,j+1)+"' role='row' class ='ui-widget-content jqgrow'></tr>")[0];
				if(ts.p.multiselect==true) {
					addMulti(t,row,j);
					gi = 1;
				}
				if (ts.p.subGrid===true) {
					try {$(ts).addSubGrid(t,row,gi,this,j+rcnt);} catch (e){}
					si= 1;
				}
				if(ts.p.xmlReader.repeatitems===true){
					$(ts.p.xmlReader.cell,this).each( function (k) {
						v = this.textContent || this.text;
						addCell(t,row,v,k+gi+si,j+rcnt,xmlr);
						rd[ts.p.colModel[k+gi+si].name] = v;
					});
				} else {
					for(i = 0; i < f.length;i++) {
						v = $(f[i],this).text();
						addCell(t, row, v , i+gi+si,j+rcnt,xmlr);
						rd[ts.p.colModel[i+gi+si].name] = v;
					}
				}
				if( ts.p.treeGrid === true) {
					fpos = ts.p.treeANode >= -1 ? ts.p.treeANode: 0;
					try {$(ts).setTreeNode(rd,row);} catch (e) {}
					rl ===  0 ? $("tbody:first",t).append(row) : $(ts.rows[j+fpos+rcnt]).after(row);
				} else {
					$("tbody:first",t).append(row);
				}
				if(afterInsRow) {ts.p.afterInsertRow(row.id,rd,this);}
				rd={};
				ir++;
			});
		  	if(!ts.p.treeGrid && !ts.p.scroll) {ts.grid.bDiv.scrollTop = 0; ts.p.reccount=ir;}
			ts.p.treeANode = -1;
			endReq();
			updatepager();
		},
		addJSONData = function(data,t, rcnt) {
			ts.p.reccount = 0;
			if(data) {
				if(ts.p.treeANode === -1 && ts.p.scroll===false) {
					$("tbody tr", t).remove(); rcnt=0;
				} else { rcnt = rcnt > 0 ? rcnt :0; }
			} else { return; }
			var ir=0,v,i,j,row,f=[],cur,gi=0,si=0,drows,idn,rd={}, fpos,rl = ts.rows.length,idr;
			ts.p.page = data[ts.p.jsonReader.page];
			ts.p.lastpage= data[ts.p.jsonReader.total];
			ts.p.records= data[ts.p.jsonReader.records];
			ts.p.userData = data[ts.p.jsonReader.userdata] || {};
			if(!ts.p.jsonReader.repeatitems) {f = reader("json");}
			if( ts.p.keyIndex===false ) {
				idn = ts.p.jsonReader.id;
				if(f.length>0 && !isNaN(idn)) {idn=f[idn];}
			} else {
				idn = f.length>0 ? f[ts.p.keyIndex] : ts.p.keyIndex;
			}
			drows = data[ts.p.jsonReader.root];
			if (drows) {
			for (i=0;i<drows.length;i++) {
				cur = drows[i];
				idr = cur[idn];
				if(idr === undefined) {
					if(f.length===0){
						if(ts.p.jsonReader.cell){
							var ccur = cur[ts.p.jsonReader.cell];
							idr = ccur[idn] || i+1;
							ccur=null;
						} else {idr=i+1;}
					} else {
						idr=i+1;
					}
				}
				row = $("<tr id='"+ idr +"' role='row' class= 'ui-widget-content jqgrow'></td>")[0];
				if(ts.p.multiselect){
					addMulti(t,row,i);
					gi = 1;
				}
				if (ts.p.subGrid) {
					try { $(ts).addSubGrid(t,row,gi,drows[i],i+rcnt);} catch (e){}
					si= 1;
				}
				if (ts.p.jsonReader.repeatitems === true) {
					if(ts.p.jsonReader.cell) {cur = cur[ts.p.jsonReader.cell];}
					for (j=0;j<cur.length;j++) {
						addCell(t,row,cur[j],j+gi+si,i+rcnt,cur);
						rd[ts.p.colModel[j+gi+si].name] = cur[j];
					}
				} else {
					for (j=0;j<f.length;j++) {
						v=cur[f[j]];
						if(v===undefined) {
							try { v = eval("cur."+f[j]);}
							catch (e) {}
						}
						addCell(t,row,v,j+gi+si,i+rcnt,cur);
						rd[ts.p.colModel[j+gi+si].name] = cur[f[j]];
					}
				}
				if( ts.p.treeGrid === true) {
					fpos = ts.p.treeANode >= -1 ? ts.p.treeANode: 0;
					try {$(ts).setTreeNode(rd,row);} catch (e) {}
					rl ===  0 ? $("tbody:first",t).append(row) : $(ts.rows[i+fpos+rcnt]).after(row);
				} else {
					$("tbody:first",t).append(row);
				}				
				if(afterInsRow) {ts.p.afterInsertRow(row.id,rd,drows[i]);}
				rd={};
				ir++;
			}
			}
			if(!ts.p.treeGrid && !ts.p.scroll) {ts.grid.bDiv.scrollTop = 0;}
			ts.p.reccount=ir;
			ts.p.treeANode = -1;
			endReq();
			updatepager();
		},
		updatepager = function() {
			if(ts.p.pager) {
				var cp, last, base,bs;
				if (ts.p.loadonce) {
					cp = last = 1;
					ts.p.lastpage = ts.page =1;
					$(".selbox",ts.p.pager).attr("disabled",true);
				} else {
					cp = IntNum(ts.p.page);
					last = IntNum(ts.p.lastpage);
					$(".selbox",ts.p.pager).attr("disabled",false);
				}
				if(ts.p.pginput===true) {
					$('.ui-pg-input',ts.p.pager).val(ts.p.page);
					$('#sp_1',ts.p.pager).html(ts.p.lastpage );
				}
				if (ts.p.viewrecords){
					base = (parseInt(ts.p.page)-1)*parseInt(ts.p.rowNum);
					bs = ts.p.scroll === true ? 0 : base;
					ts.p.reccount == 0 ?
						$(".ui-paging-info",ts.p.pager).html(ts.p.emptyrecords) :
						$(".ui-paging-info",ts.p.pager).html($.jqgformat(ts.p.recordtext,bs+1,base+ts.p.reccount,ts.p.records));
				}
				if(ts.p.pgbuttons===true) {
					if(cp<=0) {cp = last = 1;}
					if(cp==1) {$("#first, #prev",ts.p.pager).addClass('ui-state-disabled').removeClass('ui-state-hover');} else {$("#first, #prev",ts.p.pager).removeClass('ui-state-disabled');}
					if(cp==last) {$("#next, #last",ts.p.pager).addClass('ui-state-disabled').removeClass('ui-state-hover');} else {$("#next, #last",ts.p.pager).removeClass('ui-state-disabled');}
				}
			}
			if($.isFunction(ts.p.gridComplete)) {ts.p.gridComplete();}
		},
		populate = function () {
			if(!grid.hDiv.loading) {
				beginReq();
				var gdata, prm = {nd: (new Date().getTime()), _search:ts.p.search};
				prm[ts.p.prmNames.rows]= ts.p.rowNum; prm[ts.p.prmNames.page]= ts.p.page;
				prm[ts.p.prmNames.sort]= ts.p.sortname; prm[ts.p.prmNames.order]= ts.p.sortorder;
				gdata = $.extend(ts.p.postData,prm);
				if (ts.p.search ===true) {gdata =$.extend(gdata,ts.p.searchdata);}
				var rcnt = ts.p.scroll===false ? 0 : ts.rows.length-1; 
				if ($.isFunction(ts.p.datatype)) {ts.p.datatype(gdata);endReq();}
				switch(ts.p.datatype)
				{
				case "json":
					$.ajax({url:ts.p.url,type:ts.p.mtype,dataType:"json",data: gdata, complete:function(JSON,st) { if(st=="success") {addJSONData(eval("("+JSON.responseText+")"),ts.grid.bDiv,rcnt); JSON=null; if(loadComplete) {loadComplete();}}}, error:function(xhr,st,err){if(loadError) {loadError(xhr,st,err);}endReq();xhr=null;}, beforeSend: function(xhr){if(loadBeforeSend) {loadBeforeSend(xhr);} xhr=null;}});
					if( ts.p.loadonce || ts.p.treeGrid) {ts.p.datatype = "local";}
				break;
				case "xml":
					$.ajax({url:ts.p.url,type:ts.p.mtype,dataType:"xml",data: gdata, complete:function(xml,st) {if(st=="success")	{addXmlData(xml.responseXML,ts.grid.bDiv,rcnt); xml=null;if(loadComplete) {loadComplete();}}}, error:function(xhr,st,err){if(loadError) {loadError(xhr,st,err);}endReq(); xhr=null;}, beforeSend: function(xhr){if(loadBeforeSend) {loadBeforeSend(xhr);} xhr=null;}});
					if( ts.p.loadonce || ts.p.treeGrid) {ts.p.datatype = "local";}
				break;
				case "xmlstring":
					addXmlData(stringToDoc(ts.p.datastr),ts.grid.bDiv);
					ts.p.datastr = null;
					ts.p.datatype = "local";
					if(loadComplete) {loadComplete();}
				break;
				case "jsonstring":
					if(typeof ts.p.datastr == 'string') { ts.p.datastr = eval("("+ts.p.datastr+")");}
					addJSONData(ts.p.datastr,ts.grid.bDiv);
					ts.p.datastr = null;
					ts.p.datatype = "local";
					if(loadComplete) {loadComplete();}
				break;
				case "local":
				case "clientSide":
					ts.p.datatype = "local";
					sortArrayData();
				break;
				}
			}
		},
		beginReq = function() {
			if(beReq) {ts.p.beforeRequest();}
			grid.hDiv.loading = true;
			if(ts.p.hiddengrid) { return;}
			switch(ts.p.loadui) {
				case "disable":
					break;
				case "enable":
					$("#load_"+ts.p.id).show();
					break;
				case "block":
					$("#lui_"+ts.p.id).show();
					$("#load_"+ts.p.id).show();
					break;
			}
		},
		endReq = function() {
			grid.hDiv.loading = false;
			switch(ts.p.loadui) {
				case "disable":
					break;
				case "enable":
					$("#load_"+ts.p.id).hide();
					break;
				case "block":
					$("#lui_"+ts.id).hide();
					$("#load_"+ts.p.id).hide();
					break;
			}
		},
		stringToDoc =	function (xmlString) {
			var xmlDoc;
			if(typeof xmlString !== 'string') return xmlString;
			try	{
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(xmlString,"text/xml");
			}
			catch(e) {
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async=false;
				xmlDoc["loadXM"+"L"](xmlString);
			}
			return (xmlDoc && xmlDoc.documentElement && xmlDoc.documentElement.tagName != 'parsererror') ? xmlDoc : null;
		},
		sortArrayData = function() {
			var stripNum = /[\$,%]/g;
			var rows=[], col=0, st, sv, findSortKey,newDir = (ts.p.sortorder == "asc") ? 1 :-1;
			$.each(ts.p.colModel,function(i,v){
				if(this.index == ts.p.sortname || this.name == ts.p.sortname){
					col = ts.p.lastsort= i;
					st = this.sorttype;
					return false;
				}
			});
			if (st == 'float' || st== 'number' || st== 'currency') {
				findSortKey = function($cell) {
					var key = parseFloat($cell.replace(stripNum, ''));
					return isNaN(key) ? 0 : key;
				};
			} else if (st=='int' || st=='integer') {
				findSortKey = function($cell) {
					return IntNum($cell.replace(stripNum, ''));
				};
			} else if(st == 'date') {
				findSortKey = function($cell) {
					var fd = ts.p.colModel[col].datefmt || "Y-m-d";
					return parseDate(fd,$cell).getTime();
				};
			} else {
				findSortKey = function($cell) {
					return $.trim($cell.toUpperCase());
				};
			}
			$.each(ts.rows, function(index, row) {
				try { sv = $.unformat($(row).children('td').eq(col),{colModel:ts.p.colModel[col]},col,true);}
				catch (_) { sv = $(row).children('td').eq(col).text(); }
				row.sortKey = findSortKey(sv);
				rows[index] = this;
			});
			if(ts.p.treeGrid) {
				$(ts).SortTree( newDir);
			} else {
				rows.sort(function(a, b) {
					if (a.sortKey < b.sortKey) {return -newDir;}
					if (a.sortKey > b.sortKey) {return newDir;}
					return 0;
				});
				if(rows[0]){
					$("td",rows[0]).each( function( k ) {
						$(this).css("width",grid.headers[k].width+"px");
						grid.cols[k] = this;
					});
				}
				$.each(rows, function(index, row) {
					$('tbody',ts.grid.bDiv).append(row);
					row.sortKey = null;
				});
			}
			if(ts.p.multiselect) {
				$("tbody tr", ts.grid.bDiv).removeClass("ui-state-highlight");
				$("[id^=jqg_]",ts.rows).attr("checked",false);
				$("#cb_jqg",ts.grid.hDiv).attr("checked",false);
				ts.p.selarrrow = [];
			}
			ts.grid.bDiv.scrollTop = 0;
			endReq();
		},
		parseDate = function(format, date) {
			var tsp = {m : 1, d : 1, y : 1970, h : 0, i : 0, s : 0}, i;
			format = format.toLowerCase();
			date = date.split(/[\\\/:_;.\s-]/);
			format = format.split(/[\\\/:_;.\s-]/);
			for(i=0;i<format.length;i++){
				tsp[format[i]] = IntNum(date[i],tsp[format[i]]);
			}
			tsp.m = parseInt(tsp.m,10)-1;
			var ty = tsp.y;
			if (ty >= 70 && ty <= 99) {tsp.y = 1900+tsp.y;}
			else if (ty >=0 && ty <=69) {tsp.y= 2000+tsp.y;}
			return new Date(tsp.y, tsp.m, tsp.d, tsp.h, tsp.i, tsp.s,0);
		},
		setPager = function (){
			var sep = "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='ui-separator'></span></td>",
			pgid= $(ts.p.pager).attr("id") || 'pager',
			pginp = (ts.p.pginput===true) ? "<td>"+$.jqgformat(ts.p.pgtext || "","<input class='ui-pg-input' type='text' size='2' maxlength='7' value='0' role='textbox'/>","<span id='sp_1'></span>")+"</td>" : "",
			pgl="<table cellspacing='0' cellpadding='0' border='0' style='table-layout:auto;' class='ui-pg-table'><tbody><tr>",
			str, pgcnt, lft, cent, rgt, twd, tdw, i,
			clearVals = function(onpaging){
				if ($.isFunction(ts.p.onPaging) ) {ts.p.onPaging(onpaging);}
				ts.p.selrow = null;
				if(ts.p.multiselect) {ts.p.selarrrow =[];$('#cb_jqg',ts.grid.hDiv).attr("checked",false);}
				ts.p.savedRow = [];
			};
			pgcnt = "pg_"+pgid;
			lft = pgid+"_left"; cent = pgid+"_center"; rgt = pgid+"_right";
			$(ts.p.pager).addClass('ui-jqgrid-pager corner-bottom')
			.append("<div id='"+pgcnt+"' class='ui-pager-control' role='group'><table cellspacing='0' cellpadding='0' border='0' class='ui-pg-table' style='width:100%;table-layout:fixed;' role='row'><tbody><tr><td id='"+lft+"' align='left'></td><td id='"+cent+"' align='center' style='white-space:nowrap;'></td><td id='"+rgt+"' align='right'></td></tr></tbody></table></div>");
			if(ts.p.pgbuttons===true) {
				pgl += "<td id='first' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-first'></span></td>";
				pgl += "<td id='prev' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-prev'></span></td>";
				pgl += pginp !="" ? sep+pginp+sep:"";
				pgl += "<td id='next' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-next'></span></td>";
				pgl += "<td id='last' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-end'></span></td>";
			} else if (pginp !="") { pgl += pginp; }
			if(ts.p.rowList.length >0){
				str="<select class='ui-pg-selbox' role='listbox'>";
				for(i=0;i<ts.p.rowList.length;i++){
					str +="<option role='option' value="+ts.p.rowList[i]+((ts.p.rowNum == ts.p.rowList[i])?' selected':'')+">"+ts.p.rowList[i];
				}
				str +="</select>";
				pgl += "<td>"+str+"</td>";
			}
			pgl += "</tr></tbody></table>";
			if(ts.p.viewrecords===true) {$("td#"+pgid+"_"+ts.p.recordpos,"#"+pgcnt).append("<div class='ui-paging-info'></div>");}
			$("td#"+pgid+"_"+ts.p.pagerpos,"#"+pgcnt).append(pgl);
			tdw = $(".ui-jqgrid").css("font-size") || "11px";
			$('body').append("<div id='testpg' class='ui-jqgrid ui-widget ui-widget-content' style='font-size:"+tdw+";visibility:hidden;' ></div>");
			twd = $(pgl).clone(false).appendTo("#testpg").width();
			$("#testpg").remove();
			if(twd > 0) {
				twd += 25;
				$("td#"+pgid+"_"+ts.p.pagerpos,"#"+pgcnt).width(twd);
			}
			ts.p._nvtd = [];
			ts.p._nvtd[0] = twd ? Math.floor((ts.p.width - twd)/2) : Math.floor(ts.p.width/3);
			ts.p._nvtd[1] = 0;
			pgl=null;
			$('.ui-pg-selbox',"#"+pgcnt).bind('change',function() { 
				ts.p.rowNum = this.value; 
				clearVals('records');
				populate();
				return false;
			});
			if(ts.p.pgbuttons===true) {
			$(".ui-pg-button","#"+pgcnt).hover(function(e){
				if($(this).hasClass('ui-state-disabled')) {
					this.style.cursor='default';
				} else {
					$(this).addClass('ui-state-hover');
					this.style.cursor='pointer';
				}
			},function(e) {
				if($(this).hasClass('ui-state-disabled')) {
				} else {
					$(this).removeClass('ui-state-hover');
					this.style.cursor= "default";
				}
			});
			$("#first, #prev, #next, #last",ts.p.pager).click( function(e) {
				var cp = IntNum(ts.p.page),
				last = IntNum(ts.p.lastpage), selclick = false,
				fp=true, pp=true, np=true,lp=true;
				if(last ===0 || last===1) {fp=false;pp=false;np=false;lp=false; }
				else if( last>1 && cp >=1) {
					if( cp === 1) { fp=false; pp=false; } 
					else if( cp>1 && cp <last){ }
					else if( cp===last){ np=false;lp=false; }
				} else if( last>1 && cp===0 ) { np=false;lp=false; cp=last-1;}
				if( this.id === 'first' && fp ) { ts.p.page=1; selclick=true;} 
				if( this.id === 'prev' && pp) { ts.p.page=(cp-1); selclick=true;} 
				if( this.id === 'next' && np) { ts.p.page=(cp+1); selclick=true;} 
				if( this.id === 'last' && lp) { ts.p.page=last; selclick=true;}
				if(selclick) {
					clearVals(this.id);
					populate();
				}
				e.stopPropagation();
				return false;
			});
			}
			if(ts.p.pginput===true) {
			$('input.ui-pg-input',"#"+pgcnt).keypress( function(e) {
				var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
				if(key == 13) {
					ts.p.page = ($(this).val()>0) ? $(this).val():ts.p.page;
					clearVals('user');
					populate();
					return false;
				}
				return this;
			});
			}
		},
		sortData = function (index, idxcol,reload){
			var imgs, so, scg, ls, iId;
			if(ts.p.savedRow.length > 0) {return;}
			if(!reload) {
				if( ts.p.lastsort === idxcol ) {
					if( ts.p.sortorder === 'asc') {
						ts.p.sortorder = 'desc';
					} else if(ts.p.sortorder === 'desc') { ts.p.sortorder='asc';}
				} else { ts.p.sortorder='asc';}
				ts.p.page = 1;
			}
			imgs = (ts.p.sortorder==='asc') ? 'ui-icon-triangle-1-n' : 'ui-icon-triangle-1-s';
			imgs = "<span class='ui-icon ui-grid-ico-sort "+imgs+ "'>&nbsp;&nbsp;&nbsp;&nbsp;</span>";
			var thd= $("thead:first",grid.hDiv).get(0);
			ls = ts.p.colModel[ts.p.lastsort].name.replace('.',"\\.");
			$("tr th div#jqgh_"+ls+" span.ui-grid-ico-sort",thd).remove();
			$("tr th:eq("+ts.p.lastsort+")",thd).attr("aria-selected","false");
			iId = index.replace('.',"\\.");
			$("tr th div#"+iId,thd).append(imgs);;
			$("tr th:eq("+idxcol+")",thd).attr("aria-selected","true");
			ts.p.lastsort = idxcol;
			index = index.substring(5);
			ts.p.sortname = ts.p.colModel[idxcol].index || index;
			so = ts.p.sortorder;
			if(onSortCol) {onSortCol(index,idxcol,so);}
			if(ts.p.datatype == "local") {
				if(ts.p.deselectAfterSort) {$(ts).resetSelection();}
			} else {
				ts.p.selrow = null;
				if(ts.p.multiselect){$("#cb_jqg",ts.grid.hDiv).attr("checked",false);}
				ts.p.selarrrow =[];
				ts.p.savedRow =[];
			}
			scg = ts.p.scroll; if(ts.p.scroll===true) {ts.p.scroll=false;}
			if(ts.p.subGrid && ts.p.datatype=='local') {
				$("td.sgexpanded","#"+ts.p.id).each(function(){
					$(this).trigger("click");
				});
			}
			populate();
			if(ts.p.sortname != index && idxcol) {ts.p.lastsort = idxcol;}
			setTimeout(function() {ts.p.scroll=scg;},500);
		},
		setColWidth = function () {
			var initwidth = 0, brd=5, l, vc=0,scw=5,cw,hs=false,aw;
			if (isSafari) { brd=0;scw=0;}
			for(l=0;l<=ts.p.colModel.length-1;l++){
				if(typeof ts.p.colModel[l].hidden == 'undefined') {ts.p.colModel[l].hidden=false;}
				if(ts.p.colModel[l].hidden===false){
					initwidth += IntNum(ts.p.colModel[l].width);
					vc++;
				}
			}
			if(isNaN(ts.p.width)) {ts.p.width = grid.width = initwidth;}
			else { grid.width = ts.p.width}
			ts.p.tblwidth = initwidth;
			aw = grid.width-brd*vc;			
			if(ts.p.shrinkToFit ===false && ts.p.forceFit === true) {ts.p.forceFit=false;}
			if(ts.p.shrinkToFit===true) {
				if(isNaN(ts.p.height)) {
				} else {
					scw = isSafari ? 18 : 17+brd;
					aw -= scw;
					hs = true;
				}
				initwidth =0; vc=0;
				for(l=0;l<=ts.p.colModel.length-1;l++) {
					if(ts.p.colModel[l].hidden === false){
						cw = Math.floor(aw/ts.p.tblwidth*ts.p.colModel[l].width);
						ts.p.colModel[l].width =cw;
						initwidth += cw;
						vc = l;
					}
				}
				var cr =0;
				if (hs && grid.width-(initwidth+brd*vc) !== scw) {
					cr = grid.width-(initwidth+brd*vc)-scw;
				} else if(!hs && grid.width-(initwidth+brd*vc) > 2) {
					cr = grid.width-(initwidth+brd*vc)-scw;
				}
				ts.p.colModel[vc].width += cr;
				ts.p.tblwidth = initwidth+cr;
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
			var i, ret = {}, brd1 = isSafari ? 0 : 5;
			ret[0] =  ret[1] = ret[2] = 0;
			for(i=0;i<=iCol;i++){
				if(ts.p.colModel[i].hidden === false ) {
					ret[0] += ts.p.colModel[i].width+brd1;
				}
			}
			ret[0] = ret[0] - ts.grid.bDiv.scrollLeft;
			if($(ts.grid.cDiv+":visible")) {ret[1] += $(ts.grid.cDiv).height() +parseInt($(ts.grid.cDiv).css("padding-top"))+parseInt($(ts.grid.cDiv).css("padding-bottom"));}
			if(ts.p.toolbar[0]==true && (ts.p.toolbar[1]=='top' || ts.p.toolbar[1]=='both')) {ret[1] += $(ts.grid.uDiv).height()+parseInt($(ts.grid.uDiv).css("border-top-width"))+parseInt($(ts.grid.uDiv).css("border-bottom-width"));}
			ret[2] += $(ts.grid.bDiv).height() + $(ts.grid.hDiv).height();
			return ret;
		};
		this.p.id = this.id;
		if ($.inArray(ts.p.multikey,sortkeys) == -1 ) {ts.p.multikey = false;}
		if(this.p.treeGrid === true) {
			this.p.subGrid = false; this.p.altRows =false;
			this.p.pgbuttons = false; this.p.pginput = false;
			this.p.multiselect = false; this.p.rowList = [];
			try {
				$(this).setTreeGrid();
				this.p.treedatatype = this.p.datatype;
				$.each(this.p.treeReader,function(i,n){
					if(n){
						ts.p.colNames.push(n);
						ts.p.colModel.push({name:n,width:1,hidden:true,sortable:false,resizable:false,hidedlg:true,editable:true,search:false});
					}
				});
			} catch (_) {}
		}
		ts.p.keyIndex=false;
		for (i=0; i<ts.p.colModel.length;i++) {
			if (ts.p.colModel[i].key===true) {
				ts.p.keyIndex = i;
				break;
			}
		}
		if(this.p.subGrid) {
			this.p.colNames.unshift("");
			this.p.colModel.unshift({name:'subgrid',width:20,sortable: false,resizable:false,hidedlg:true,search:false});
			var cm = this.p.subGridModel;
			if(cm[0]) {
				cm[0].align = $.extend([],cm[0].align || []);
				for(i=0;i<cm[0].name.length;i++) { cm[0].align[i] = cm[0].align[i] || 'left';}
			}
			cm = null;
		}
		if(this.p.multiselect) {
			this.p.colNames.unshift("<input id='cb_jqg' class='cbox' type='checkbox'/>");
			this.p.colModel.unshift({name:'cb',width:20,sortable:false,resizable:false,hidedlg:true,search:false,align:'center'});
		}
		var	xReader = {
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
		},
		jReader = {
			root: "rows",
			page: "page",
			total: "total",
			records: "records",
			repeatitems: true,
			cell: "cell",
			id: "id",
			userdata: "userdata",
			subgrid: {root:"rows", repeatitems: true, cell:"cell"}
		};
		if(ts.p.scroll===true){
			ts.p.pgbuttons = false; ts.p.pginput=false; ts.p.rowList=[];
		}
		ts.p.xmlReader = $.extend(xReader, ts.p.xmlReader);
		ts.p.jsonReader = $.extend(jReader, ts.p.jsonReader);

		var thead = document.createElement("thead"),
		trow = document.createElement("tr"),
		th, idn, thdiv, w, res, sort,
		td, ptr, tbody;
		$(trow).attr({"role":"rowheader"});
		thead.appendChild(trow);
		if(ts.p.shrinkToFit===true && ts.p.forceFit===true) {
			for (i=ts.p.colModel.length-1;i>=0;i--){
				if(!ts.p.colModel[i].hidden) {
					ts.p.colModel[i].resizable=false;
					break;
				}
			}
		}
		for(i=0;i<this.p.colNames.length;i++){
			th = document.createElement("th");
			idn = ts.p.colModel[i].name;
			thdiv = document.createElement("div");
			$(thdiv).html(ts.p.colNames[i]+"&nbsp;");
			if (idn == ts.p.sortname) {
				var imgs = (ts.p.sortorder==='asc') ? 'ui-icon-triangle-1-n' : ' ui-icon-triangle-1-s';
				imgs = "<span class='ui-icon ui-grid-ico-sort "+imgs+ "'>&nbsp;&nbsp;&nbsp;&nbsp;</span>";
				$(thdiv).append(imgs);
				ts.p.lastsort = i;
			}
			$(th).addClass('ui-state-default ui-th-column')
			.attr({"role":"columnheader"})
			.hover(function(){$(this).addClass('ui-state-hover')},function(){$(this).removeClass('ui-state-hover')});
			thdiv.id = "jqgh_"+idn;
			if(isMSIE) {thdiv.className = "ui-th-div-ie";}
			th.appendChild(thdiv);
			trow.appendChild(th);
		}
		if(this.p.multiselect) {
			var onSA = true, emp=[], chk;
			if(typeof ts.p.onSelectAll !== 'function') {onSA=false;}
			$('#cb_jqg',trow).bind('click',function(){
				if (this.checked) {
					$("[id^=jqg_]",ts.rows).attr("checked",true);
					$(ts.rows).each(function(i) {
						if(!$(this).hasClass("subgrid")){
						$(this).addClass("ui-state-highlight").attr("aria-selected","true");
						ts.p.selarrrow[i]= ts.p.selrow = this.id; 
						}
					});
					chk=true;
					emp=[];
				}
				else {
					$("[id^=jqg_]",ts.rows).attr("checked",false);
					$(ts.rows).each(function(i) {
						if(!$(this).hasClass("subgrid")){
							$(this).removeClass("ui-state-highlight").attr("aria-selected","false");
							emp[i] = this.id;
						}
					});
					ts.p.selarrrow = []; ts.p.selrow = null;
					chk=false;
				}
				if(onSA) {ts.p.onSelectAll(chk ? ts.p.selarrrow : emp,chk);}
			});
		}
		this.appendChild(thead);
		$.each(ts.p.colModel, function(i){if(!this.width) {this.width=150;}});
		if(ts.p.autowidth===true) {
			var pw = $(eg).innerWidth();
			ts.p.width = pw > 0?  pw: 'nw';
		}
		setColWidth();
		$(eg).css("width",grid.width+"px").append("<div class='ui-jqgrid-resize-mark'>&nbsp;</div>");
		$(gv).css("width",grid.width+"px");
		thead = $("thead:first",ts).get(0);
		$("tr:first th",thead).each(function ( j ) {
			w = ts.p.colModel[j].width;
			if(typeof ts.p.colModel[j].resizable === 'undefined') {ts.p.colModel[j].resizable = true;}
			res = document.createElement("span");
			$(res).html("&#160;");
			if(ts.p.colModel[j].resizable){
				$(this).addClass(ts.p.resizeclass);
				$(res).mousedown(function (e) {
					if(ts.p.forceFit===true) {ts.p.nv= nextVisible(j);}
					grid.dragStart(j, e, getOffset(j));
					e.preventDefault();
					return false;
				}).addClass('ui-jqgrid-resize');
			} else {
				res = "";
			}
			$(this).css("width",w+"px").prepend(res);
			if( ts.p.colModel[j].hidden) {$(this).css("display","none");}
			grid.headers[j] = { width: w, el: this };
			sort = ts.p.colModel[j].sortable;
			if( typeof sort !== 'boolean') {sort =  true;}
			if(sort) { 
				$("div",this).addClass("ui-jqgrid-sortable")
				.click(function(){sortData(this.id,j);return false;});
			}
		});
		
		tbody = document.createElement("tbody");
		this.appendChild(tbody);
		$(this).addClass('ui-jqgrid-btable');
		grid.hTable = document.createElement("table");
		$(grid.hTable).append(thead).css({width:ts.p.tblwidth+"px"})
		.attr({cellSpacing:"0",cellPadding:"0",border:"0","role":"grid","aria-labelledby":"gbox_"+this.id})
		.addClass("ui-jqgrid-htable");
		grid.hDiv = document.createElement("div");
		var hg = (ts.p.caption && ts.p.hiddengrid===true) ? true : false;
		var hb = $("<div class='ui-jqgrid-hbox'></div>");
		$(grid.hDiv)
			.css({ width: grid.width+"px"})
			.addClass("ui-state-default ui-jqgrid-hdiv")
			.append(hb)
			.bind("selectstart", function () { return false; });
		$(hb).append(grid.hTable);
		if(hg) {$(grid.hDiv).hide(); ts.p.gridstate = 'hidden';}
		ts.p._height =0;
		if(ts.p.pager){
			if(typeof ts.p.pager == "string") {if(ts.p.pager.substr(0,1) !="#") ts.p.pager = "#"+ts.p.pager;}
			if( $(ts.p.pager).hasClass("scroll")) {
				$(ts.p.pager).css({width: grid.width+"px"}).show();
				$(ts.p.pager).appendTo(eg).addClass('ui-state-default ui-jqgrid-pager');
				ts.p._height += parseInt($(ts.p.pager).height(),10);
				if(hg) {$(ts.p.pager).hide();}
			}
			setPager();
		}
		if( ts.p.cellEdit === false) {
		$(ts).bind('mouseover',function(e) {
			ptr = $(e.target || e.srcElement).parents("tr.jqgrow");
			if($(ptr).attr("class") !== "subgrid") {
				$(ptr).addClass("ui-state-hover");
			}
			return false;
		}).bind('mouseout',function(e) {
			ptr = $(e.target || e.srcElement).parents("tr.jqgrow");
			$(ptr).removeClass("ui-state-hover");
			return false;
		});
		}
		var ri,ci;
		$(ts).before(grid.hDiv).click(function(e) {
			td = (e.target || e.srcElement);
			if (td.href) { return true; }
			var scb = $(td).hasClass("cbox");
			ptr = $(td,ts.rows).parents("tr.jqgrow");
			if($(ptr).length === 0 ) {
				return false;
			}
			var cSel = true;
			if(bSR) { cSel = bSR(ptr.attr("id"));}
			if(cSel === true) {
				if(ts.p.cellEdit === true) {
					if(ts.p.multiselect && scb){
						$(ts).setSelection(false,true,ptr);
					} else {
						ri = ptr[0].rowIndex;
						ci = !$(td).is('td') ? $(td).parents("td:first")[0].cellIndex : td.cellIndex;
						if(isMSIE) {ci = $.getAbsoluteIndex(ptr[0],ci);}
						try {$(ts).editCell(ri,ci,true);} catch (e) {}
					}
				} else if ( !ts.p.multikey ) {
					if(ts.p.multiselect && ts.p.multiboxonly) {
						if(scb){$(ts).setSelection(false,true,ptr);}
					} else {
						$(ts).setSelection(false,true,ptr);
					}
				} else {
					if(e[ts.p.multikey]) {
						$(ts).setSelection(false,true,ptr);
					} else if(ts.p.multiselect && scb) {
						scb = $("[id^=jqg_]",ptr).attr("checked");
						$("[id^=jqg_]",ptr).attr("checked",!scb);
					}
				}
				if(onSC) {
					ri = ptr[0].id;
					ci = !$(td).is('td') ? $(td).parents("td:first")[0].cellIndex : td.cellIndex;
					if(isMSIE) {ci = $.getAbsoluteIndex(ptr[0],ci);}
					onSC(ri,ci,$(td).html(),td);
				}
			}
			e.stopPropagation();
		}).bind('reloadGrid', function(e) {
			if(ts.p.treeGrid ===true) {	ts.p.datatype = ts.p.treedatatype;}
			if(ts.p.datatype=="local"){ $(ts).resetSelection();}
			else if(!ts.p.treeGrid) {
				ts.p.selrow=null;
				if(ts.p.multiselect) {ts.p.selarrrow =[];$('#cb_jqg',ts.grid.hDiv).attr("checked",false);}
				if(ts.p.cellEdit) {ts.p.savedRow = []; }
			}
			if(ts.p.scroll===true) {$("tbody tr", ts.grid.bDiv).remove();}
			ts.grid.populate();
			return false;
		});
		if( ondblClickRow ) {
			$(this).dblclick(function(e) {
				td = (e.target || e.srcElement);
				ptr = $(td,ts.rows).parents("tr.jqgrow");
				if($(ptr).length === 0 ){return false;}
				ts.p.ondblClickRow($(ptr).attr("id"));
				return false;
			});
		}
		if (onRightClickRow) {
			$(this).bind('contextmenu', function(e) {
				td = (e.target || e.srcElement);
				ptr = $(td,ts.rows).parents("tr.jqgrow");
				if($(ptr).length === 0 ){return false;}
				if(!ts.p.multiselect) {	$(ts).setSelection(false,true,ptr);	}
				ts.p.onRightClickRow($(ptr).attr("id"));
				return false;
			});
		}
		grid.bDiv = document.createElement("div");
		$(grid.bDiv)
			.append(this)
			.addClass("ui-jqgrid-bdiv")
			.css({ height: ts.p.height+(isNaN(ts.p.height)?"":"px"), width: (grid.width)+"px"})
			.scroll(function (e) {grid.scrollGrid();});
		$("table:first",grid.bDiv).css({width:ts.p.tblwidth+"px"});
		if( isMSIE ) {
			if( $("tbody",this).size() === 2 ) { $("tbody:first",this).remove();}
			if( ts.p.multikey) {$(grid.bDiv).bind("selectstart",function(){return false;});}
			if(ts.p.treeGrid) {$(grid.bDiv).css("position","relative");}
		} else {
			if( ts.p.multikey) {$(grid.bDiv).bind("mousedown",function(){return false;});}
		}
		if(hg) {$(grid.bDiv).hide();}
		grid.cDiv = document.createElement("div");
		var arf = ts.p.hidegrid===true ? $("<a role='link' href='javascript:void(0)'/>").addClass('ui-jqgrid-titlebar-close').hover(
			function(){ arf.addClass('ui-state-hover');},
			function() {arf.removeClass('ui-state-hover');})
		.append("<span class='ui-icon ui-icon-circle-triangle-n'></span>") : "";
		$(grid.cDiv).append(arf).append("<span class='ui-jqgrid-title'>"+ts.p.caption+"</span>")
		.addClass("ui-jqgrid-titlebar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix");//.css("width",grid.width+"px");
		$(grid.cDiv).insertBefore(grid.hDiv);
		if( ts.p.toolbar[0] ) {
			grid.uDiv = document.createElement("div");
			if(ts.p.toolbar[1] == "top") {$(grid.uDiv).insertBefore(grid.hDiv);}
			else if (ts.p.toolbar[1]=="bottom" ) {$(grid.uDiv).insertAfter(grid.hDiv);}
			if(ts.p.toolbar[1]=="both") {
				grid.ubDiv = document.createElement("div");
				$(grid.uDiv).insertBefore(grid.hDiv).addClass("ui-userdata ui-state-default").attr("id","t_"+this.id);
				$(grid.ubDiv).insertAfter(grid.hDiv).addClass("ui-userdata ui-state-default").attr("id","tb_"+this.id);
				ts.p._height += IntNum($(grid.ubDiv).height());
				if(hg)  {$(grid.ubDiv).hide();}
			} else {
				$(grid.uDiv).width(grid.width).addClass("ui-userdata ui-state-default").attr("id","t_"+this.id);
			}
			ts.p._height += IntNum($(grid.uDiv).height());
			if(hg) {$(grid.uDiv).hide();}
		}
		if(ts.p.caption) {
			ts.p._height += parseInt($(grid.cDiv,ts).height(),10);
			var tdt = ts.p.datatype;
			if(ts.p.hidegrid===true) {
				$(".ui-jqgrid-titlebar-close",grid.cDiv).toggle( function(){
					$(".ui-jqgrid-bdiv, .ui-jqgrid-hdiv","#gview_"+ts.p.id).slideUp("fast");
					if(ts.p.pager) {$(ts.p.pager).slideUp("fast");}
					if(ts.p.toolbar[0]===true) {
						if( ts.p.toolbar[1]=='both') {
							$(grid.ubDiv).slideUp("fast");
						}
						$(grid.uDiv).slideUp("fast");
					}
					$("span",this).removeClass("ui-icon-circle-triangle-n").addClass("ui-icon-circle-triangle-s");
					ts.p.gridstate = 'hidden';
					if(onHdCl) {if(!hg) {ts.p.onHeaderClick(ts.p.gridstate);}}
					},
					function() {
					$(".ui-jqgrid-hdiv, .ui-jqgrid-bdiv","#gview_"+ts.p.id).slideDown("fast");
					if(ts.p.pager) {$(ts.p.pager).slideDown("fast");}
					if(ts.p.toolbar[0]===true) {
						if( ts.p.toolbar[1]=='both') {
							$(grid.ubDiv).slideDown("fast");
						}
						$(grid.uDiv).slideDown("fast");
					}
					$("span",this).removeClass("ui-icon-circle-triangle-s").addClass("ui-icon-circle-triangle-n");
					if(hg) {ts.p.datatype = tdt;populate();hg=false;}
					ts.p.gridstate = 'visible';
					if(onHdCl) {ts.p.onHeaderClick(ts.p.gridstate)}
					}
				);
				if(hg) { $(".ui-jqgrid-titlebar-close",grid.cDiv).trigger("click"); ts.p.datatype="local";}
			}
		} else {$(grid.cDiv).hide();}
		$(grid.hDiv).after(grid.bDiv)
		.mousemove(function (e) {
			if(grid.resizing){grid.dragMove(e);}
			return false;
		});
		ts.p._height += parseInt($(grid.hDiv).height(),10);
		$(document).mouseup(function (e) {
			if(grid.resizing) {	grid.dragEnd(); return false;}
			return true;
		});
		ts.formatCol = function(a,b,c) {formatCol(a,b,c);};
		ts.sortData = function(a,b,c){sortData(a,b,c);};
		ts.updatepager = function(){updatepager();};
		ts.formatter = function (elem, row, cellval , colpos, rwdat, act){formatter(elem, row, cellval , colpos, rwdat, act);};
		$.extend(grid,{populate : function(){populate();}})
		this.grid = grid;
		ts.addXmlData = function(d) {addXmlData(d,ts.grid.bDiv);};
		ts.addJSONData = function(d) {addJSONData(d,ts.grid.bDiv);};
		populate();ts.p.hiddengrid=false;
		$(window).unload(function () {
			$(this).empty();
			this.grid = null;
			this.p = null;
		});
	});
};
})(jQuery);