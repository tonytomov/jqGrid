;(function ($) {
/*
 * jqGrid  3.6.2 - jQuery Grid
 * Copyright (c) 2008, Tony Tomov, tony@trirand.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Date: 2009-12-10
 */
$.jgrid = $.jgrid || {};
$.extend($.jgrid,{
	htmlDecode : function(value){
		if(value=='&nbsp;' || value=='&#160;' || (value.length==1 && value.charCodeAt(0)==160)) { return "";}
		return !value ? value : String(value).replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"');
	},
	htmlEncode : function (value){
		return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/\"/g, "&quot;");
	},
	format : function(format){ //jqgformat
		var args = $.makeArray(arguments).slice(1);
		if(format===undefined) format = "";
		return format.replace(/\{(\d+)\}/g, function(m, i){
			return args[i];
		});
	},
	getCellIndex : function (cell) {
		cell = $(cell);
		cell = (!cell.is('td') && !cell.is('th') ? cell.closest("td,th") : cell)[0];
		if ($.browser.msie) return $.inArray(cell, cell.parentNode.cells);
		return cell.cellIndex;
	},
	stripHtml : function(v) {
		v = v+"";
		var regexp = /<("[^"]*"|'[^']*'|[^'">])*>/gi;
		if(v) {	return v.replace(regexp,"");}
		else {return v;}
	},
	stringToDoc : function (xmlString) {
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
	parse : function(jsonString) {
		var js = jsonString, msg;
		if (js.substr(0,9) == "while(1);") { js = js.substr(9); }
		if (js.substr(0,2) == "/*") { js = js.substr(2,js.length-4); }
		if(!js) { js = "{}"; }
		($.jgrid.useJSON===true && typeof (JSON) === 'object' && typeof (JSON.parse) === 'function')
		    ? msg = JSON.parse(js)
		    : msg = eval('(' + js + ')');
		return  msg.hasOwnProperty('d') ? msg.d : msg;
	},
	empty : function () {
		while ( this.firstChild ) this.removeChild( this.firstChild );
	},
	jqID : function(sid){
		sid = sid + "";
		return sid.replace(/([\.\:\[\]])/g,"\\$1");
	},
	ajaxOptions: {},
	extend : function(methods) {
		$.extend($.fn.jqGrid,methods);
		if (!this.no_legacy_api) {
			$.fn.extend(methods);
		}
	}
});

$.fn.jqGrid = function( pin ) {
	if (typeof pin == 'string') {
		var fn = $.fn.jqGrid[pin];
		if (!fn) {
			throw ("jqGrid - No such method: " + pin);
		}
		var args = $.makeArray(arguments).slice(1);
		return fn.apply(this,args);
	}
	return this.each( function() {
		if(this.grid) {return;}

		var p = $.extend(true,{
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
			prmNames: {page:"page",rows:"rows", sort: "sidx",order: "sord", search:"_search", nd:"nd"},
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
			autowidth: false,
			scrollOffset :18,
			cellLayout: 5,
			subGridWidth: 20,
			multiselectWidth: 20,
			gridview: false,
			rownumWidth: 25,
			rownumbers : false,
			pagerpos: 'center',
			recordpos: 'right',
			footerrow : false,
			userDataOnFooter : false,
			hoverrows : true,
			altclass : 'ui-priority-secondary',
			viewsortcols : [false,'vertical',true],
			resizeclass : '',
			autoencode : false,
			remapColumns : [],
			ajaxGridOptions :{},
			direction : "ltr"
		}, $.jgrid.defaults, pin || {});
		var grid={         
			headers:[],
			cols:[],
			footers: [],
			dragStart: function(i,x,y) {
				this.resizing = { idx: i, startX: x.clientX, sOL : y[0]};
				this.hDiv.style.cursor = "col-resize";
				this.curGbox = $("#rs_m"+p.id,"#gbox_"+p.id);
				this.curGbox.css({display:"block",left:y[0],top:y[1],height:y[2]});
				if($.isFunction(p.resizeStart)) p.resizeStart.call(this,x,i);
				document.onselectstart=new Function ("return false");
			},
			dragMove: function(x) {
				if(this.resizing) {
					var diff = x.clientX-this.resizing.startX,
					h = this.headers[this.resizing.idx],
					newWidth = p.direction === "ltr" ? h.width + diff : h.width - diff, hn, nWn;
					if(newWidth > 33) {
						this.curGbox.css({left:this.resizing.sOL+diff});
						if(p.forceFit===true ){
							hn = this.headers[this.resizing.idx+p.nv];
							nWn = p.direction === "ltr" ? hn.width - diff : hn.width + diff;
							if(nWn >33) {
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
			dragEnd: function() {
				this.hDiv.style.cursor = "default";
				if(this.resizing) {
					var idx = this.resizing.idx,
					nw = this.headers[idx].newWidth || this.headers[idx].width;
					nw = parseInt(nw);
					this.resizing = false;
					$("#rs_m"+p.id).css("display","none");
					p.colModel[idx].width = nw;
					this.headers[idx].width = nw;
					this.headers[idx].el.style.width = nw + "px";
					if(this.cols.length>0) {this.cols[idx].style.width = nw+"px";}
					if(this.footers.length>0) {this.footers[idx].style.width = nw+"px";}
					if(p.forceFit===true){
						nw = this.headers[idx+p.nv].newWidth || this.headers[idx+p.nv].width;
						this.headers[idx+p.nv].width = nw;
						this.headers[idx+p.nv].el.style.width = nw + "px";
						if(this.cols.length>0) this.cols[idx+p.nv].style.width = nw+"px";
						if(this.footers.length>0) {this.footers[idx+p.nv].style.width = nw+"px";}
						p.colModel[idx+p.nv].width = nw;
					} else {
						p.tblwidth = this.newWidth || p.tblwidth;
						$('table:first',this.bDiv).css("width",p.tblwidth+"px");
						$('table:first',this.hDiv).css("width",p.tblwidth+"px");
						this.hDiv.scrollLeft = this.bDiv.scrollLeft;
						if(p.footerrow) {
							$('table:first',this.sDiv).css("width",p.tblwidth+"px");
							this.sDiv.scrollLeft = this.bDiv.scrollLeft;
						}
					}
					if($.isFunction(p.resizeStop)) p.resizeStop.call(this,nw,idx);
				}
   				this.curGbox=null;
				document.onselectstart=new Function ("return true");
			},
			populateVisible: function() {
				if (grid.timer) clearTimeout(grid.timer);
				grid.timer = null;

				var dh = $(grid.bDiv).height();
				if (!dh) return;
				var table = $("table:first", grid.bDiv);
				var rows = $("> tbody > tr:visible:first", table);
				var rh = rows.outerHeight() || grid.prevRowHeight;
				if (!rh) return;
				grid.prevRowHeight = rh;
				var rn = p.rowNum;
				if (rn < 10) {
					rn = parseInt(dh / rh) + 1 << 1;
					if (rn < 10) rn = 10;
					p.rowNum = rn;
				}
				var scrollTop = grid.scrollTop = grid.bDiv.scrollTop;
				var ttop = Math.round(table.position().top) - scrollTop;
				var tbot = ttop + table.height();
				var div = rh * rn;
				var page, npage, empty;
			    if (ttop <= 0 && tbot < dh && 
                    (p.lastpage==null||parseInt((tbot + scrollTop + div - 1) / div) < p.lastpage))
                {
					npage = parseInt((dh - tbot + div - 1) / div);
					if (tbot >= 0 || npage < 2 || p.scroll === true) {
						page = parseInt((tbot + scrollTop) / div) + 1;
						ttop = -1;
					} else {
						ttop = 1;
					}
				}
				if (ttop > 0) {
					page = parseInt(scrollTop / div) + 1;
					npage = parseInt((scrollTop + dh) / div) + 2 - page;
					empty = true;
				}

				if (npage) {
					if (p.lastpage && page > p.lastpage) {
						return;
					}
					if (grid.hDiv.loading) {
						grid.timer = setTimeout(grid.populateVisible, 200);
					} else {
						p.page = page;
						if (empty) {
							grid.selectionPreserver(table[0]);
							grid.emptyRows(grid.bDiv);
						}
						grid.populate(npage);
					}
				}
			},
			scrollGrid: function() {
				if(p.scroll) {
					var scrollTop = grid.bDiv.scrollTop;
					if (scrollTop != grid.scrollTop) {
						grid.scrollTop = scrollTop;
						if (grid.timer) clearTimeout(grid.timer);
						grid.timer = setTimeout(grid.populateVisible, 200);
					}
				}
				grid.hDiv.scrollLeft = grid.bDiv.scrollLeft;
				if(p.footerrow) {
					grid.sDiv.scrollLeft = grid.bDiv.scrollLeft;
				}
			},
			selectionPreserver : function(ts) {
				var p = ts.p;
				var sr = p.selrow, sra = p.selarrrow ? $.makeArray(p.selarrrow) : null;
				var left = ts.grid.bDiv.scrollLeft;
				var complete = p.gridComplete;
				p.gridComplete = function() {
					p.selrow = null;
					p.selarrrow = [];
					if(p.multiselect && sra && sra.length>0) {
						for(var i=0;i<sra.length;i++){
							if (sra[i] != sr)
								$(ts).jqGrid("setSelection",sra[i],false);
						}
					}
					if (sr) {
						$(ts).jqGrid("setSelection",sr,false);
					}
					ts.grid.bDiv.scrollLeft = left;
					if (p.gridComplete = complete) {
						complete();
					}
				}
			}
		};
		this.p = p ;
		var i, dir,ts;
		if(this.p.colNames.length === 0) {
			for (i=0;i<this.p.colModel.length;i++){
				this.p.colNames[i] = this.p.colModel[i].label || this.p.colModel[i].name;
			}
		}
		if( this.p.colNames.length !== this.p.colModel.length ) {
			alert($.jgrid.errors.model);
			return;
		}
		var gv = $("<div class='ui-jqgrid-view'></div>"), ii,
		isMSIE = $.browser.msie ? true:false,
		isSafari = $.browser.safari ? true : false;
		ts = this;
		ts.p.direction = $.trim(ts.p.direction.toLowerCase());
		if($.inArray(ts.p.direction,["ltr","rtl"]) == -1) ts.p.direction = "ltr";
		dir = ts.p.direction;

		$(gv).insertBefore(this);
		$(this).appendTo(gv).removeClass("scroll");
		var eg = $("<div class='ui-jqgrid ui-widget ui-widget-content ui-corner-all'></div>");
		$(eg).insertBefore(gv).attr({"id" : "gbox_"+this.id,"dir":dir});
		$(gv).appendTo(eg).attr("id","gview_"+this.id);
		if (isMSIE && $.browser.version <= 6) {
			ii = '<iframe style="display:block;position:absolute;z-index:-1;filter:Alpha(Opacity=\'0\');" src="javascript:false;"></iframe>';
		} else { ii="";}
		$("<div class='ui-widget-overlay jqgrid-overlay' id='lui_"+this.id+"'></div>").append(ii).insertBefore(gv);
		$("<div class='loading ui-state-default ui-state-active' id='load_"+this.id+"'>"+this.p.loadtext+"</div>").insertBefore(gv);
		$(this).attr({cellSpacing:"0",cellPadding:"0",border:"0","role":"grid","aria-multiselectable":!!this.p.multiselect,"aria-labelledby":"gbox_"+this.id});
		var sortkeys = ["shiftKey","altKey","ctrlKey"],
		IntNum = function(val,defval) {
			val = parseInt(val,10);
			if (isNaN(val)) { return defval ? defval : 0;}
			else {return val;}
		},
		formatCol = function (pos, rowInd){
			var ral = ts.p.colModel[pos].align, result="style=\"", clas = ts.p.colModel[pos].classes;
			if(ral) result += "text-align:"+ral+";";
			if(ts.p.colModel[pos].hidden===true) result += "display:none;";
			if(rowInd===0) {
				result += "width: "+grid.headers[pos].width+"px;"
			}
			return result+"\"" + (clas !== undefined ? (" class=\""+clas+"\"") :"");
		},
		addCell = function(rowId,cell,pos,irow, srvr) {
			var v,prp;
			v = formatter(rowId,cell,pos,srvr,'add');
			prp = formatCol( pos,irow);
			return "<td role=\"gridcell\" "+prp+" title=\""+$.jgrid.stripHtml(v)+"\">"+v+"</td>";
		},
		formatter = function (rowId, cellval , colpos, rwdat, _act){
			var cm = ts.p.colModel[colpos],v;
			if(typeof cm.formatter !== 'undefined') {
				var opts= {rowId: rowId, colModel:cm };
				if($.isFunction( cm.formatter ) ) {
					v = cm.formatter(cellval,opts,rwdat,_act);
				} else if($.fmatter){
					v = $.fn.fmatter(cm.formatter, cellval,opts, rwdat, _act);
				} else {
					v = cellVal(cellval);
				}
			} else {
				v = cellVal(cellval);
			}
			return v;
		},
		cellVal =  function (val) {
			return val === undefined || val === null || val === "" ? "&#160;" : ts.p.autoencode ? $.jgrid.htmlEncode(val+"") : val+"";
		},
		addMulti = function(rowid,pos,irow){
			var	v = "<input type=\"checkbox\""+" id=\"jqg_"+rowid+"\" class=\"cbox\" name=\"jqg_"+rowid+"\"/>",
			prp = formatCol(pos,irow);
			return "<td role='gridcell' "+prp+">"+v+"</td>";
		},
		addRowNum = function (pos,irow,pG,rN) {
			var v =  (parseInt(pG)-1)*parseInt(rN)+1+irow,
			prp = formatCol(pos,irow);
			return "<td role=\"gridcell\" class=\"ui-state-default jqgrid-rownum\" "+prp+">"+v+"</td>";
		},
		reader = function (datatype) {
			var field, f=[], j=0, i;
			for(i =0; i<ts.p.colModel.length; i++){
				field = ts.p.colModel[i];
				if (field.name !== 'cb' && field.name !=='subgrid' && field.name !=='rn') {
					f[j] = (datatype=="xml") ? field.xmlmap || field.name : field.jsonmap || field.name;
					j++;
				}
			}
			return f;
		},
		orderedCols = function (offset) {
			var order = ts.p.remapColumns;
			if (!order || !order.length)
				order = $.map(ts.p.colModel, function(v,i) { return i; });
			if (offset)
				order = $.map(order, function(v) { return v<offset?null:v-offset });
			return order;
		},
		emptyRows = function (parent, scroll) {
			var tBody = $("tbody:first", parent);
			if(!ts.p.gridview || ts.p.jqgdnd) $("*",tBody).children().unbind();
			if(isMSIE) $.jgrid.empty.apply(tBody[0]);
			else tBody[0].innerHTML="";
			if (scroll && ts.p.scroll) {
				$(">div:first", parent).css({height:"auto"}).children("div:first").css({height:0,display:"none"});
				parent.scrollTop = 0;
			}
			tBody = null;
		},
		addXmlData = function (xml,t, rcnt, more, adjust) {
			var startReq = new Date();
			ts.p.reccount = 0;
			if($.isXMLDoc(xml)) {
				if(ts.p.treeANode===-1 && !ts.p.scroll) {
					emptyRows(t);
					rcnt=0;
				} else { rcnt = rcnt > 0 ? rcnt :0; }
			} else { return; }
			var i,fpos,ir=0,v,row,gi=0,si=0,ni=0,idn, getId,f=[],F,rd ={}, rl= ts.rows.length, xmlr,rid, rowData=[],ari=0, cn=(ts.p.altRows === true) ? " "+ts.p.altclass:"",cn1;
			if(!ts.p.xmlReader.repeatitems) {f = reader("xml");}
			if( ts.p.keyIndex===false) {
				idn = ts.p.xmlReader.id;
			} else {
				idn = ts.p.keyIndex;
			}
			if(f.length>0 && !isNaN(idn)) {
				if (ts.p.remapColumns && ts.p.remapColumns.length) {
					idn = $.inArray(idn, ts.p.remapColumns);
				}
				idn=f[idn];
			}
			if( (idn+"").indexOf("[") === -1 ) {
				if (f.length) {
					getId = function( trow, k) {return $(idn,trow).text() || k;};
				} else {
					getId = function( trow, k) {return $(ts.p.xmlReader.cell,trow).eq(idn).text() || k;};
				}
			}
			else {
				getId = function( trow, k) {return trow.getAttribute(idn.replace(/[\[\]]/g,"")) || k;};
			}
			$(ts.p.xmlReader.page,xml).each(function() {ts.p.page = this.textContent  || this.text || 1; });
			$(ts.p.xmlReader.total,xml).each(function() {ts.p.lastpage = this.textContent  || this.text || 1; }  );
			$(ts.p.xmlReader.records,xml).each(function() {ts.p.records = this.textContent  || this.text  || 0; }  );
			$(ts.p.xmlReader.userdata,xml).each(function() {ts.p.userData[this.getAttribute("name")]=this.textContent || this.text;});
			var gxml = $(ts.p.xmlReader.root+" "+ts.p.xmlReader.row,xml),gl = gxml.length, j=0;
			if(gxml && gl){
			var rn = parseInt(ts.p.rowNum),br=ts.p.scroll?(parseInt(ts.p.page)-1)*rn+1:1;
			if (adjust) rn *= adjust+1;
			var afterInsRow = $.isFunction(ts.p.afterInsertRow);
			while (j<gl) {
				xmlr = gxml[j];
				rid = getId(xmlr,br+j);
				cn1 = j%2 == 1 ? cn : '';
				rowData[ari++] = "<tr id=\""+rid+"\" role=\"row\" class =\"ui-widget-content jqgrow ui-row-"+ts.p.direction+""+cn1+"\">";
				if(ts.p.rownumbers===true) {
					rowData[ari++] = addRowNum(0,j,ts.p.page,ts.p.rowNum);
					ni=1;
				}
				if(ts.p.multiselect===true) {
					rowData[ari++] = addMulti(rid,ni,j);
					gi=1;
				}
				if (ts.p.subGrid===true) {
					rowData[ari++]= $(ts).jqGrid("addSubGridCell",gi+ni,j+rcnt);
					si= 1;
				}
				if(ts.p.xmlReader.repeatitems){
					if (!F) F=orderedCols(gi+si+ni);
					var cells = $(ts.p.xmlReader.cell,xmlr);
					$.each(F, function (k) {
						var cell = cells[this];
						if (!cell) return false;
						v = cell.textContent || cell.text;
						rd[ts.p.colModel[k+gi+si+ni].name] = v;
						rowData[ari++] = addCell(rid,v,k+gi+si+ni,j+rcnt,xmlr);
					});
				} else {
					for(i = 0; i < f.length;i++) {
						v = $(f[i],xmlr).text();
						rd[ts.p.colModel[i+gi+si+ni].name] = v;
						rowData[ari++] = addCell(rid, v, i+gi+si+ni, j+rcnt, xmlr);
					}
				}
				rowData[ari++] = "</tr>";
				if(ts.p.gridview === false ) {
					if( ts.p.treeGrid === true) {
						fpos = ts.p.treeANode >= -1 ? ts.p.treeANode: 0;
						row = $(rowData.join(''))[0]; // speed overhead
						try {$(ts).jqGrid("setTreeNode",rd,row);} catch (e) {}
						rl ===  0 ? $("tbody:first",t).append(row) : $(ts.rows[j+fpos+rcnt]).after(row);
					} else {
						$("tbody:first",t).append(rowData.join(''));
					}
					if (ts.p.subGrid===true) {
						try {$(ts).jqGrid("addSubGrid",ts.rows[ts.rows.length-1],gi+ni);} catch (e){}
					}
					if(afterInsRow) {ts.p.afterInsertRow.call(ts,rid,rd,xmlr);}
					rowData=[];ari=0;
				}
				rd={};
				ir++;
				j++;
				if(ir==rn) {break;}
			}
			}
			if(ts.p.gridview === true) {
				$("tbody:first",t).append(rowData.join(''));
			}
			ts.p.totaltime = new Date() - startReq;
			if(ir>0) {ts.grid.cols = ts.rows[0].cells;if(ts.p.records===0)ts.p.records=gl;}
			rowData =null;
			if(!ts.p.treeGrid && !ts.p.scroll) {ts.grid.bDiv.scrollTop = 0;}
			ts.p.reccount=ir;
			ts.p.treeANode = -1;
			if(ts.p.userDataOnFooter) $(ts).jqGrid("footerData","set",ts.p.userData,true);
			if (!more) updatepager(false,true);
		},
		addJSONData = function(data,t, rcnt, more, adjust) {
			var startReq = new Date();
			ts.p.reccount = 0;
			if(data) {
				if(ts.p.treeANode === -1 && !ts.p.scroll) {
					emptyRows(t);
					rcnt=0;
				} else { rcnt = rcnt > 0 ? rcnt :0; }
			} else { return; }
			var ir=0,v,i,j,row,f=[],F,cur,gi=0,si=0,ni=0,len,drows,idn,rd={}, fpos,rl = ts.rows.length,idr,rowData=[],ari=0,cn=(ts.p.altRows === true) ? " "+ts.p.altclass:"",cn1;
			ts.p.page = data[ts.p.jsonReader.page] || 1;
			ts.p.lastpage= data[ts.p.jsonReader.total] || 1;
			ts.p.records= data[ts.p.jsonReader.records] || 0;
			ts.p.userData = data[ts.p.jsonReader.userdata] || {};
			if(!ts.p.jsonReader.repeatitems) {
				F = f = reader("json");
			}

			if( ts.p.keyIndex===false ) {
				idn = ts.p.jsonReader.id;
			} else {
				idn = ts.p.keyIndex;
			}
			if(f.length>0 && !isNaN(idn)) {
				if (ts.p.remapColumns && ts.p.remapColumns.length) {
					idn = $.inArray(idn, ts.p.remapColumns);
				}
				idn=f[idn];
			}
			drows = data[ts.p.jsonReader.root];
			if (drows) {
			len = drows.length, i=0;
			var rn = parseInt(ts.p.rowNum),br=ts.p.scroll?(parseInt(ts.p.page)-1)*rn+1:1;
			if (adjust) rn *= adjust+1;
			var afterInsRow = $.isFunction(ts.p.afterInsertRow);
			while (i<len) {
				cur = drows[i];
				idr = cur[idn];
				if(idr === undefined) {
					idr = br+i;
					if(f.length===0){
						if(ts.p.jsonReader.cell){
							var ccur = cur[ts.p.jsonReader.cell];
							idr = ccur[idn] || idr;
							ccur=null;
						}
					}
				}
				cn1 = i%2 == 1 ? cn : '';
				rowData[ari++] = "<tr id=\""+ idr +"\" role=\"row\" class= \"ui-widget-content jqgrow ui-row-"+ts.p.direction+""+cn1+"\">";
				if(ts.p.rownumbers===true) {
					rowData[ari++] = addRowNum(0,i,ts.p.page,ts.p.rowNum);
					ni=1;
				}
				if(ts.p.multiselect){
					rowData[ari++] = addMulti(idr,ni,i);
					gi = 1;
				}
				if (ts.p.subGrid) {
					rowData[ari++]= $(ts).jqGrid("addSubGridCell",gi+ni,i+rcnt);
					si= 1;
				}
				if (ts.p.jsonReader.repeatitems) {
					if(ts.p.jsonReader.cell) {cur = cur[ts.p.jsonReader.cell];}
					if (!F) F=orderedCols(gi+si+ni);
				}
				for (j=0;j<F.length;j++) {
					v=cur[F[j]];
					if(v===undefined) {
						try { v = eval("cur."+F[j]);}
						catch (e) {}
					}
					rowData[ari++] = addCell(idr,v,j+gi+si+ni,i+rcnt,cur);
					rd[ts.p.colModel[j+gi+si+ni].name] = v;
				}

				rowData[ari++] = "</tr>";
				if(ts.p.gridview === false ) {
					if( ts.p.treeGrid === true) {
						fpos = ts.p.treeANode >= -1 ? ts.p.treeANode: 0;
						row = $(rowData.join(''))[0];
						try {$(ts).jqGrid("setTreeNode",rd,row);} catch (e) {}
						rl ===  0 ? $("tbody:first",t).append(row) : $(ts.rows[i+fpos+rcnt]).after(row);
					} else {
						$("tbody:first",t).append(rowData.join(''));
					}
					if(ts.p.subGrid === true ) {
						try { $(ts).jqGrid("addSubGrid",ts.rows[ts.rows.length-1],gi+ni);} catch (e){}
					}
					if(afterInsRow) {ts.p.afterInsertRow(idr,rd,cur);}
					rowData=[];ari=0;
				}
				rd={};
				ir++;
				i++;
				if(ir==rn) break;
			}
			if(ts.p.gridview === true ) {
				$("tbody:first",t).append(rowData.join(''));
			}
			ts.p.totaltime = new Date() - startReq;
			if(ir>0) {ts.grid.cols = ts.rows[0].cells;if(ts.p.records===0)ts.p.records=len;}
			}
			if(!ts.p.treeGrid && !ts.p.scroll) {ts.grid.bDiv.scrollTop = 0;}
			ts.p.reccount=ir;
			ts.p.treeANode = -1;
			if(ts.p.userDataOnFooter) $(ts).jqGrid("footerData","set",ts.p.userData,true);
			if (!more) updatepager(false,true);
		},
		updatepager = function(rn, dnd) {
			var cp, last, base,bs, from,to,tot,fmt;
			base = (parseInt(ts.p.page)-1)*parseInt(ts.p.rowNum);
			to = base + ts.p.reccount;
			if (ts.p.scroll) {
				var rows = $("tbody:first > tr", ts.grid.bDiv);
				base = to - rows.length
				var rh = rows.outerHeight();
				if (rh) {
					var top = base * rh;
					var height = parseInt(ts.p.records,10) * rh;
				    $(">div:first",ts.grid.bDiv).css({height : height}).children("div:first").css({height:top,display:top?"":"none"});
				}
			}
			if(ts.p.pager) {
				fmt = $.jgrid.formatter.integer || {};
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
					$('#sp_1',ts.p.pager).html($.fmatter ? $.fmatter.util.NumberFormat(ts.p.lastpage,fmt):ts.p.lastpage).width();
					
				}
				if (ts.p.viewrecords){
					if(ts.p.reccount === 0) 
						$(".ui-paging-info",ts.p.pager).html(ts.p.emptyrecords);
					else {
						from = base+1;
						tot=ts.p.records;
						if($.fmatter) {
							from = $.fmatter.util.NumberFormat(from,fmt);
							to = $.fmatter.util.NumberFormat(to,fmt);
							tot = $.fmatter.util.NumberFormat(tot,fmt);
						}
						$(".ui-paging-info",ts.p.pager).html($.jgrid.format(ts.p.recordtext,from,to,tot));
					}
				}
				if(ts.p.pgbuttons===true) {
					if(cp<=0) {cp = last = 1;}
					if(cp==1) {$("#first, #prev",ts.p.pager).addClass('ui-state-disabled').removeClass('ui-state-hover');} else {$("#first, #prev",ts.p.pager).removeClass('ui-state-disabled');}
					if(cp==last) {$("#next, #last",ts.p.pager).addClass('ui-state-disabled').removeClass('ui-state-hover');} else {$("#next, #last",ts.p.pager).removeClass('ui-state-disabled');}
				}
			}
			if(rn===true && ts.p.rownumbers === true) {
				$("td.jqgrid-rownum",ts.rows).each(function(i){
					$(this).html(base+1+i);
				});
			}
			if(dnd && ts.p.jqgdnd) { $(ts).jqGrid('gridDnD','updateDnD');}
			if($.isFunction(ts.p.gridComplete)) {ts.p.gridComplete();}
		},
		populate = function (npage) {
			if(!ts.grid.hDiv.loading) {
				var pvis = ts.p.scroll && npage == false;
				var prm = {}, dt, dstr, pN=ts.p.prmNames;;
				if(pN.search !== null) prm[pN.search] = ts.p.search; if(pN.nd != null) prm[pN.nd] = new Date().getTime();
				if(pN.rows !== null) prm[pN.rows]= ts.p.rowNum; if(pN.page !== null) prm[pN.page]= ts.p.page;
				if(pN.sort !== null) prm[pN.sort]= ts.p.sortname; if(pN.order !== null) prm[pN.order]= ts.p.sortorder;
				var lc = ts.p.loadComplete;
				var lcf = $.isFunction(lc);
				if (!lcf) lc = null;
				var adjust = 0;
				npage = npage || 1;
				if (npage > 1) {
					if(pN.npage != null) {
						prm[pN.npage] = npage;
						adjust = npage - 1;
						npage = 1;
					} else {
						lc = function(req) {
							if (lcf) {
								ts.p.loadComplete.call(ts,req);
							}
							ts.grid.hDiv.loading = false;
							ts.p.page++;
							populate(npage-1);
						}
					}
				} else if (pN.npage != null) {
					delete ts.p.postData[pN.npage];
				}
				$.extend(ts.p.postData,prm);
				var rcnt = !ts.p.scroll ? 0 : ts.rows.length-1; 
				if ($.isFunction(ts.p.datatype)) { ts.p.datatype(ts.p.postData,"load_"+ts.p.id); return;}
				else if($.isFunction(ts.p.beforeRequest)) {ts.p.beforeRequest.call(ts);}
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
						data: $.isFunction(ts.p.serializeGridData)? ts.p.serializeGridData(ts.p.postData) : ts.p.postData,
						complete:function(req,st) {
							if(st=="success" || (req.statusText == "OK" && req.status == "200")) {
								if(dt === "xml") addXmlData(req.responseXML,ts.grid.bDiv,rcnt,npage>1,adjust);
								else addJSONData($.jgrid.parse(req.responseText),ts.grid.bDiv,rcnt,npage>1,adjust);
								if(lc) lc.call(ts,req);
								if (pvis) ts.grid.populateVisible();
							}
							req=null;
							endReq();
						},
						error:function(xhr,st,err){
							if($.isFunction(ts.p.loadError)) ts.p.loadError.call(ts,xhr,st,err);
							endReq();
							xhr=null;
						},
						beforeSend: function(xhr){
							beginReq();
							if($.isFunction(ts.p.loadBeforeSend)) ts.p.loadBeforeSend.call(this,xhr);
						}
					},$.jgrid.ajaxOptions, ts.p.ajaxGridOptions));
					if( ts.p.loadonce || ts.p.treeGrid) {ts.p.datatype = "local";}
				break;
				case "xmlstring":
					beginReq();
					addXmlData(dstr = $.jgrid.stringToDoc(ts.p.datastr),ts.grid.bDiv);
					ts.p.datatype = "local";
					if(lcf) {ts.p.loadComplete.call(ts,dstr);}
					ts.p.datastr = null;
					endReq();
				break;
				case "jsonstring":
					beginReq();
					if(typeof ts.p.datastr == 'string') dstr = $.jgrid.parse(ts.p.datastr);
					else dstr = ts.p.datastr;
					addJSONData(dstr,ts.grid.bDiv);
					ts.p.datatype = "local";
					if(lcf) {ts.p.loadComplete.call(ts,dstr);}
					ts.p.datastr = null;
					endReq();
				break;
				case "local":
				case "clientside":
					beginReq();
					ts.p.datatype = "local";
					sortArrayData();
					endReq();
				break;
				}
			}
		},
		beginReq = function() {
			ts.grid.hDiv.loading = true;
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
			ts.grid.hDiv.loading = false;
			switch(ts.p.loadui) {
				case "disable":
					break;
				case "enable":
					$("#load_"+ts.p.id).hide();
					break;
				case "block":
					$("#lui_"+ts.p.id).hide();
					$("#load_"+ts.p.id).hide();
					break;
			}
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
				$(ts).jqGrid("SortTree",newDir);
			} else {
				rows.sort(function(a, b) {
					if (a.sortKey < b.sortKey) {return -newDir;}
					if (a.sortKey > b.sortKey) {return newDir;}
					return 0;
				});
				if(rows[0]){
					$("td",rows[0]).each( function( k ) {
						$(this).css("width",grid.headers[k].width+"px");
					});
					ts.grid.cols = rows[0].cells;
				}
				var cn = "";
				if(ts.p.altRows) cn = ts.p.altclass;
				$.each(rows, function(i, row) {
					if(cn) {
						if(i%2 ==1) $(row).addClass(cn);
						else $(row).removeClass(cn);
					}
					$('tbody',ts.grid.bDiv).append(row);
					row.sortKey = null;
				});
			}
			ts.grid.bDiv.scrollTop = 0;
		},
		parseDate = function(format, date) {
			var tsp = {m : 1, d : 1, y : 1970, h : 0, i : 0, s : 0},k,hl,dM;
			date = date.split(/[\\\/:_;.\t\T\s-]/);
			format = format.split(/[\\\/:_;.\t\T\s-]/);
			var dfmt  = $.jgrid.formatter.date.monthNames;
			for(k=0,hl=format.length;k<hl;k++){
				if(format[k] == 'M') {
					dM = $.inArray(date[k],dfmt);
					if(dM !== -1 && dM < 12){date[k] = dM+1;}
				}
				if(format[k] == 'F') {
					dM = $.inArray(date[k],dfmt);
					if(dM !== -1 && dM > 11){date[k] = dM+1-12;}
				}
				tsp[format[k].toLowerCase()] = parseInt(date[k],10);
			}
			tsp.m = parseInt(tsp.m,10)-1;
			var ty = tsp.y;
			if (ty >= 70 && ty <= 99) {tsp.y = 1900+tsp.y;}
			else if (ty >=0 && ty <=69) {tsp.y= 2000+tsp.y;}
			return new Date(tsp.y, tsp.m, tsp.d, tsp.h, tsp.i, tsp.s,0);
		},
		setPager = function (){
			var sep = "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='ui-separator'></span></td>",
			pgid= $(ts.p.pager).attr("id") || 'pager',pginp = "",
			pgl="<table cellspacing='0' cellpadding='0' border='0' style='table-layout:auto;' class='ui-pg-table'><tbody><tr>",
			str="", pgcnt, lft, cent, rgt, twd, tdw, i,
			clearVals = function(onpaging){
				if ($.isFunction(ts.p.onPaging) ) {ts.p.onPaging(onpaging);}
				ts.p.selrow = null;
				if(ts.p.multiselect) {ts.p.selarrrow =[];$('#cb_'+$.jgrid.jqID(ts.p.id),ts.grid.hDiv).attr("checked",false);}
				ts.p.savedRow = [];
			};
			pgcnt = "pg_"+pgid;
			lft = pgid+"_left"; cent = pgid+"_center"; rgt = pgid+"_right";
			$(ts.p.pager).addClass('ui-jqgrid-pager ui-corner-bottom')
			.append("<div id='"+pgcnt+"' class='ui-pager-control' role='group'><table cellspacing='0' cellpadding='0' border='0' class='ui-pg-table' style='width:100%;table-layout:fixed;' role='row'><tbody><tr><td id='"+lft+"' align='left'></td><td id='"+cent+"' align='center' style='white-space:pre;'></td><td id='"+rgt+"' align='right'></td></tr></tbody></table></div>")
			.attr("dir","ltr"); //explicit setting
			if(ts.p.rowList.length >0){
				str = "<td dir='"+dir+"'>"
				str +="<select class='ui-pg-selbox' role='listbox'>";
				for(i=0;i<ts.p.rowList.length;i++){
					str +="<option role='option' value='"+ts.p.rowList[i]+"'"+((ts.p.rowNum == ts.p.rowList[i])?' selected':'')+">"+ts.p.rowList[i]+"</option>";
				}
				str +="</select></td>";
			}
			if(dir=="rtl") pgl += str;
			if(ts.p.pginput===true) pginp= "<td dir='"+dir+"'>"+$.jgrid.format(ts.p.pgtext || "","<input class='ui-pg-input' type='text' size='2' maxlength='7' value='0' role='textbox'/>","<span id='sp_1'></span>")+"</td>";
			if(ts.p.pgbuttons===true) {
				var po=["first","prev", "next","last"]; if(dir=="rtl") po.reverse();
				pgl += "<td id='"+po[0]+"' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-first'></span></td>";
				pgl += "<td id='"+po[1]+"' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-prev'></span></td>";
				pgl += pginp !="" ? sep+pginp+sep:"";
				pgl += "<td id='"+po[2]+"' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-next'></span></td>";
				pgl += "<td id='"+po[3]+"' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-end'></span></td>";
			} else if (pginp !="") { pgl += pginp; }
			if(dir=="ltr") pgl += str;
			pgl += "</tr></tbody></table>";
			if(ts.p.viewrecords===true) {$("td#"+pgid+"_"+ts.p.recordpos,"#"+pgcnt).append("<div dir='"+dir+"' style='text-align:"+ts.p.recordpos+"' class='ui-paging-info'></div>");}
			$("td#"+pgid+"_"+ts.p.pagerpos,"#"+pgcnt).append(pgl);
			tdw = $(".ui-jqgrid").css("font-size") || "11px";
			$('body').append("<div id='testpg' class='ui-jqgrid ui-widget ui-widget-content' style='font-size:"+tdw+";visibility:hidden;' ></div>");
			twd = $(pgl).clone().appendTo("#testpg").width();
			$("#testpg").remove();
			if(twd > 0) {
				if(pginp !="") twd += 50; //should be param
				$("td#"+pgid+"_"+ts.p.pagerpos,"#"+pgcnt).width(twd);
			}
			ts.p._nvtd = [];
			ts.p._nvtd[0] = twd ? Math.floor((ts.p.width - twd)/2) : Math.floor(ts.p.width/3);
			ts.p._nvtd[1] = 0;
			pgl=null;
			$('.ui-pg-selbox',"#"+pgcnt).bind('change',function() { 
				ts.p.page = Math.round(ts.p.rowNum*(ts.p.page-1)/this.value-0.5)+1;
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
		sortData = function (index, idxcol,reload,sor){
			if(!ts.p.colModel[idxcol].sortable) return;
			var imgs, so;
			if(ts.p.savedRow.length > 0) {return;}
			if(!reload) {
				if( ts.p.lastsort == idxcol ) {
					if( ts.p.sortorder == 'asc') {
						ts.p.sortorder = 'desc';
					} else if(ts.p.sortorder == 'desc') { ts.p.sortorder = 'asc';}
				} else { ts.p.sortorder = 'asc';}
				ts.p.page = 1;
			}
			if(sor) {
				if(ts.p.lastsort == idxcol && ts.p.sortorder == sor) return;
				else ts.p.sortorder = sor;
			}
			var thd= $("thead:first",ts.grid.hDiv).get(0);
			$("tr th:eq("+ts.p.lastsort+") span.ui-grid-ico-sort",thd).addClass('ui-state-disabled');
			$("tr th:eq("+ts.p.lastsort+")",thd).attr("aria-selected","false");
			$("tr th:eq("+idxcol+") span.ui-icon-"+ts.p.sortorder,thd).removeClass('ui-state-disabled');
			$("tr th:eq("+idxcol+")",thd).attr("aria-selected","true");
			if(!ts.p.viewsortcols[0]) {
				if(ts.p.lastsort != idxcol) {
					$("tr th:eq("+ts.p.lastsort+") span.s-ico",thd).hide();
					$("tr th:eq("+idxcol+") span.s-ico",thd).show();
				}
			}
			ts.p.lastsort = idxcol;
			index = index.substring(5);
			ts.p.sortname = ts.p.colModel[idxcol].index || index;
			so = ts.p.sortorder;
			if($.isFunction(ts.p.onSortCol)) {ts.p.onSortCol.call(ts,index,idxcol,so);}
			if(ts.p.datatype == "local") {
				if(ts.p.deselectAfterSort) {$(ts).jqGrid("resetSelection");}
			} else {
				ts.p.selrow = null;
				if(ts.p.multiselect){$("#cb_"+$.jgrid.jqID(ts.p.id),ts.grid.hDiv).attr("checked",false);}
				ts.p.selarrrow =[];
				ts.p.savedRow =[];
				if(ts.p.scroll) {emptyRows(ts.grid.bDiv,true);}
			}
			if(ts.p.subGrid && ts.p.datatype=='local') {
				$("td.sgexpanded","#"+ts.p.id).each(function(){
					$(this).trigger("click");
				});
			}
			populate();
			if(ts.p.sortname != index && idxcol) {ts.p.lastsort = idxcol;}
		},
		setColWidth = function () {
			var initwidth = 0, brd=ts.p.cellLayout, vc=0, lvc, scw=ts.p.scrollOffset,cw,hs=false,aw,tw=0,gw=0,
			cl = 0, cr;
			if (isSafari) { brd=0; }
			$.each(ts.p.colModel, function(i) {
				if(typeof this.hidden === 'undefined') {this.hidden=false;}
				if(this.hidden===false){
					initwidth += IntNum(this.width);
					if(this.fixed) {
						tw += this.width;
						gw += this.width+brd;
					} else {
						vc++;
					}
					cl++;
				}
			});
			if(isNaN(ts.p.width)) {ts.p.width = grid.width = initwidth;}
			else { grid.width = ts.p.width}
			ts.p.tblwidth = initwidth;
			if(ts.p.shrinkToFit ===false && ts.p.forceFit === true) {ts.p.forceFit=false;}
			if(ts.p.shrinkToFit===true && vc > 0) {
				aw = grid.width-brd*vc-gw;
				if(isNaN(ts.p.height)) {
				} else {
					aw -= scw;
					hs = true;
				}
				initwidth =0;
				$.each(ts.p.colModel, function(i) {
					if(this.hidden === false && !this.fixed){
						cw = Math.floor(aw/(ts.p.tblwidth-tw)*this.width);
						this.width =cw;
						initwidth += cw;
						lvc = i;
					}
				});
				cr =0;
				if (hs) {
					if(grid.width-gw-(initwidth+brd*vc) !== scw)
						cr = grid.width-gw-(initwidth+brd*vc)-scw;
				} else if(!hs && Math.abs(grid.width-gw-(initwidth+brd*vc)) !== 1) {
					cr = grid.width-gw-(initwidth+brd*vc);
				}
				ts.p.colModel[lvc].width += cr;
				ts.p.tblwidth = initwidth+cr+tw+cl*brd;
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
			var i, ret = {}, brd1 = isSafari ? 0 : ts.p.cellLayout;
			ret[0] =  ret[1] = ret[2] = 0;
			for(i=0;i<=iCol;i++){
				if(ts.p.colModel[i].hidden === false ) {
					ret[0] += ts.p.colModel[i].width+brd1;
				}
			}
			if(ts.p.direction=="rtl") ret[0] = ts.p.width - ret[0];
			ret[0] = ret[0] - ts.grid.bDiv.scrollLeft;
			if($(ts.grid.cDiv).is(":visible")) {ret[1] += $(ts.grid.cDiv).height() +parseInt($(ts.grid.cDiv).css("padding-top"))+parseInt($(ts.grid.cDiv).css("padding-bottom"));}
			if(ts.p.toolbar[0]==true && (ts.p.toolbar[1]=='top' || ts.p.toolbar[1]=='both')) {ret[1] += $(ts.grid.uDiv).height()+parseInt($(ts.grid.uDiv).css("border-top-width"))+parseInt($(ts.grid.uDiv).css("border-bottom-width"));}
			ret[2] += $(ts.grid.bDiv).height() + $(ts.grid.hDiv).height();
			return ret;
		};
		this.p.id = this.id;
		if ($.inArray(ts.p.multikey,sortkeys) == -1 ) {ts.p.multikey = false;}
		ts.p.keyIndex=false;
		for (i=0; i<ts.p.colModel.length;i++) {
			if (ts.p.colModel[i].key===true) {
				ts.p.keyIndex = i;
				break;
			}
		}
		ts.p.sortorder = ts.p.sortorder.toLowerCase();
		if(this.p.treeGrid === true) {
			try { $(this).jqGrid("setTreeGrid");} catch (_) {}
		}
		if(this.p.subGrid) {
			try { $(ts).jqGrid("setSubGrid");} catch (_){}
		}
		if(this.p.multiselect) {
			this.p.colNames.unshift("<input id='cb_"+this.p.id+"' class='cbox' type='checkbox'/>");
			this.p.colModel.unshift({name:'cb',width:isSafari ? ts.p.multiselectWidth+ts.p.cellLayout : ts.p.multiselectWidth,sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true});
		}
		if(this.p.rownumbers) {
			this.p.colNames.unshift("");
			this.p.colModel.unshift({name:'rn',width:ts.p.rownumWidth,sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true});
		}
		ts.p.xmlReader = $.extend({
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
		ts.p.jsonReader = $.extend({
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
		if(ts.p.scroll){
			ts.p.pgbuttons = false; ts.p.pginput=false; ts.p.rowList=[];
		}
		var thead = "<thead><tr class='ui-jqgrid-labels' role='rowheader'>",
		tdc, idn, w, res, sort,
		td, ptr, tbody, imgs,iac="",idc="";
		if(ts.p.shrinkToFit===true && ts.p.forceFit===true) {
			for (i=ts.p.colModel.length-1;i>=0;i--){
				if(!ts.p.colModel[i].hidden) {
					ts.p.colModel[i].resizable=false;
					break;
				}
			}
		}
		if(ts.p.viewsortcols[1] == 'horizontal') {iac=" ui-i-asc";idc=" ui-i-desc";}
		tdc = isMSIE ?  "class='ui-th-div-ie'" :"";
		imgs = "<span class='s-ico' style='display:none'><span sort='asc' class='ui-grid-ico-sort ui-icon-asc"+iac+" ui-state-disabled ui-icon ui-icon-triangle-1-n ui-sort-"+dir+"'></span>";
		imgs += "<span sort='desc' class='ui-grid-ico-sort ui-icon-desc"+idc+" ui-state-disabled ui-icon ui-icon-triangle-1-s ui-sort-"+dir+"'></span></span>";
		for(i=0;i<this.p.colNames.length;i++){
			thead += "<th role='columnheader' class='ui-state-default ui-th-column ui-th-"+dir+"'>";
			idn = ts.p.colModel[i].index || ts.p.colModel[i].name;
			thead += "<div id='jqgh_"+ts.p.colModel[i].name+"' "+tdc+">"+ts.p.colNames[i];
			if (idn == ts.p.sortname) {
				ts.p.lastsort = i;
			} 
			thead += imgs+"</div></th>";
		}
		thead += "</tr></thead>";
		$(this).append(thead);
		$("thead tr:first th",this).hover(function(){$(this).addClass('ui-state-hover');},function(){$(this).removeClass('ui-state-hover');});
		if(this.p.multiselect) {
			var onSA = true, emp=[], chk;
			if(typeof ts.p.onSelectAll !== 'function') {onSA=false;}
			$('#cb_'+$.jgrid.jqID(ts.p.id),this).bind('click',function(){
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
		
		$.each(ts.p.colModel, function(i){if(!this.width) {this.width=150;} this.width = parseInt(this.width);});
		if(ts.p.autowidth===true) {
			var pw = $(eg).innerWidth();
			ts.p.width = pw > 0?  pw: 'nw';
		}
		setColWidth();
		$(eg).css("width",grid.width+"px").append("<div class='ui-jqgrid-resize-mark' id='rs_m"+ts.p.id+"'>&#160;</div>");
		$(gv).css("width",grid.width+"px");
		thead = $("thead:first",ts).get(0);
		var	tfoot = "<table role='grid' style='width:"+ts.p.tblwidth+"px' class='ui-jqgrid-ftable' cellspacing='0' cellpadding='0' border='0'><tbody><tr role='row' class='ui-widget-content footrow footrow-"+dir+"'>";
		var thr = $("tr:first",thead);
		ts.p.disableClick=false;
		$("th",thr).each(function ( j ) {
			var ht = $('div',this)[0];
			w = ts.p.colModel[j].width;
			if(typeof ts.p.colModel[j].resizable === 'undefined') {ts.p.colModel[j].resizable = true;}
			if(ts.p.colModel[j].resizable){
				res = document.createElement("span");
				$(res).html("&#160;").addClass('ui-jqgrid-resize ui-jqgrid-resize-'+dir);
				!$.browser.opera ? $(res).css("cursor","col-resize") : "";
				$(this).addClass(ts.p.resizeclass);
			} else {
				res = "";
			}
			$(this).css("width",w+"px").prepend(res);
			if( ts.p.colModel[j].hidden ) $(this).css("display","none");
			grid.headers[j] = { width: w, el: this };
			sort = ts.p.colModel[j].sortable;
			if( typeof sort !== 'boolean') {ts.p.colModel[j].sortable =  true; sort=true;}
			var nm = ts.p.colModel[j].name;
			if( !(nm == 'cb' || nm=='subgrid' || nm=='rn') ) {
				if(ts.p.viewsortcols[2])
					$("div",this).addClass('ui-jqgrid-sortable');
			}
			if(sort) {
				if(ts.p.viewsortcols[0]) {$("div span.s-ico",this).show(); if(j==ts.p.lastsort){ $("div span.ui-icon-"+ts.p.sortorder,this).removeClass("ui-state-disabled");}}
				else if( j == ts.p.lastsort) {$("div span.s-ico",this).show();$("div span.ui-icon-"+ts.p.sortorder,this).removeClass("ui-state-disabled");}
			}
			tfoot += "<td role='gridcell' "+formatCol(j,0)+">&#160;</td>";
		}).mousedown(function(e) {
			if ($(e.target).closest("th>span.ui-jqgrid-resize").length != 1) return;
			var ci = $.jgrid.getCellIndex(this);
			if(ts.p.forceFit===true) {ts.p.nv= nextVisible(ci);}
			grid.dragStart(ci, e, getOffset(ci));
			return false;
		}).click(function(e) {
			if (ts.p.disableClick) {
				ts.p.disableClick = false;
				return false;
			}
			var s = "th>div.ui-jqgrid-sortable",r,d;
			if (!ts.p.viewsortcols[2]) { s = "th>div>span>span.ui-grid-ico-sort" }
			var t = $(e.target).closest(s);
			if (t.length != 1) return;
			var ci = $.jgrid.getCellIndex(this);
			if (!ts.p.viewsortcols[2]) { r=true,d=t.attr("sort") }
			sortData($('div',this)[0].id,ci,r,d);
			return false;
		});
		if (ts.p.sortable && $.fn.sortable) {
			try {
				$(ts).jqGrid("sortableColumns", thr);
			} catch (e){}
		}
		tfoot += "</tr></tbody></table>";
		
		tbody = document.createElement("tbody");
		this.appendChild(tbody);
		$(this).addClass('ui-jqgrid-btable');
		var hTable = $("<table class='ui-jqgrid-htable' style='width:"+ts.p.tblwidth+"px' role='grid' aria-labelledby='gbox_"+this.id+"' cellspacing='0' cellpadding='0' border='0'></table>").append(thead),
		hg = (ts.p.caption && ts.p.hiddengrid===true) ? true : false,
		hb = $("<div class='ui-jqgrid-hbox" + (dir=="rtl" ? "-rtl" : "" )+"'></div>");
		grid.hDiv = document.createElement("div");
		$(grid.hDiv)
			.css({ width: grid.width+"px"})
			.addClass("ui-state-default ui-jqgrid-hdiv")
			.append(hb);
		$(hb).append(hTable);
		if(hg) $(grid.hDiv).hide();
		ts.p._height =0;
		if(ts.p.pager){
			if(typeof ts.p.pager == "string") {if(ts.p.pager.substr(0,1) !="#") ts.p.pager = "#"+ts.p.pager;}
			$(ts.p.pager).css({width: grid.width+"px"}).appendTo(eg).addClass('ui-state-default ui-jqgrid-pager');
			ts.p._height += parseInt($(ts.p.pager).height(),10);
			if(hg) {$(ts.p.pager).hide();}
			setPager();
		}
		if( ts.p.cellEdit === false && ts.p.hoverrows === true) {
		$(ts).bind('mouseover',function(e) {
			ptr = $(e.target).closest("tr.jqgrow");
			if($(ptr).attr("class") !== "subgrid") {
				$(ptr).addClass("ui-state-hover");
			}
			return false;
		}).bind('mouseout',function(e) {
			ptr = $(e.target).closest("tr.jqgrow");
			$(ptr).removeClass("ui-state-hover");
			return false;
		});
		}
		var ri,ci;
		$(ts).before(grid.hDiv).click(function(e) {
			td = e.target;
			var scb = $(td).hasClass("cbox");
			ptr = $(td,ts.rows).closest("tr.jqgrow");
			if($(ptr).length === 0 ) {
				return this;
			}
			var cSel = true;
			if($.isFunction(ts.p.beforeSelectRow)) cSel = ts.p.beforeSelectRow.call(ts,ptr[0].id, e);
			if (td.tagName == 'A' || ((td.tagName == 'INPUT' || td.tagName == 'TEXTAREA' || td.tagName == 'OPTION' || td.tagName == 'SELECT' ) && !scb) ) { return true; }
			if(cSel === true) {
				if(ts.p.cellEdit === true) {
					if(ts.p.multiselect && scb){
						$(ts).jqGrid("setSelection",ptr[0].id,true);
					} else {
						ri = ptr[0].rowIndex;
						ci = $.jgrid.getCellIndex(td);
						try {$(ts).jqGrid("editCell",ri,ci,true);} catch (_) {}
					}
				} else if ( !ts.p.multikey ) {
					if(ts.p.multiselect && ts.p.multiboxonly) {
						if(scb){$(ts).jqGrid("setSelection",ptr[0].id,true);}
						else {
							$(ts.p.selarrrow).each(function(i,n){
								var ind = ts.rows.namedItem(n);
								$(ind).removeClass("ui-state-highlight");
								$("#jqg_"+$.jgrid.jqID(n),ind).attr("checked",false);
							});
							ts.p.selarrrow = [];
							$("#cb_"+$.jgrid.jqID(ts.p.id),ts.grid.hDiv).attr("checked",false);
							$(ts).jqGrid("setSelection",ptr[0].id,true);
						}
					} else {
						$(ts).jqGrid("setSelection",ptr[0].id,true);
					}
				} else {
					if(e[ts.p.multikey]) {
						$(ts).jqGrid("setSelection",ptr[0].id,true);
					} else if(ts.p.multiselect && scb) {
						scb = $("[id^=jqg_]",ptr).attr("checked");
						$("[id^=jqg_]",ptr).attr("checked",!scb);
					}
				}
				if($.isFunction(ts.p.onCellSelect)) {
					ri = ptr[0].id;
					ci = $.jgrid.getCellIndex(td);
					ts.p.onCellSelect.call(ts,ri,ci,$(td).html(),e);
				}
			}
			e.stopPropagation();
		}).bind('reloadGrid', function(e,opts) {
			if(ts.p.treeGrid ===true) {	ts.p.datatype = ts.p.treedatatype;}
			if (opts && opts.current) {
				ts.grid.selectionPreserver(ts);
			}
			if(ts.p.datatype=="local"){ $(ts).jqGrid("resetSelection");}
			else if(!ts.p.treeGrid) {
				ts.p.selrow=null;
				if(ts.p.multiselect) {ts.p.selarrrow =[];$('#cb_'+$.jgrid.jqID(ts.p.id),ts.grid.hDiv).attr("checked",false);}
				ts.p.savedRow = [];
				if(ts.p.scroll) {emptyRows(ts.grid.bDiv);}
			}
			if (opts && opts.page) {
				var page = opts.page;
				if (page > ts.p.lastpage) page = ts.p.lastpage;
				if (page < 1) page = 1;
				ts.p.page = page;
				if (ts.grid.prevRowHeight) {
					ts.grid.bDiv.scrollTop = (page - 1) * ts.grid.prevRowHeight * ts.p.rowNum;
				} else {
					ts.grid.bDiv.scrollTop = 0;
				}
			}
			if (ts.grid.prevRowHeight && ts.p.scroll) {
                delete ts.p.lastpage;
				ts.grid.populateVisible();
			} else
				ts.grid.populate();
			return false;
		});
		if( $.isFunction(this.p.ondblClickRow) ) {
			$(this).dblclick(function(e) {
				td = e.target;
				ptr = $(td,ts.rows).closest("tr.jqgrow");
				if($(ptr).length === 0 ){return false;}
				ri = ptr[0].rowIndex;
				ci = $.jgrid.getCellIndex(td);
				ts.p.ondblClickRow.call(ts,$(ptr).attr("id"),ri,ci, e);
				return false;
			});
		}
		if ($.isFunction(this.p.onRightClickRow)) {
			$(this).bind('contextmenu', function(e) {
				td = e.target;
				ptr = $(td,ts.rows).closest("tr.jqgrow");
				if($(ptr).length === 0 ){return false;}
				if(!ts.p.multiselect) {	$(ts).jqGrid("setSelection",ptr[0].id,true);	}
				ri = ptr[0].rowIndex;
				ci = $.jgrid.getCellIndex(td);
				ts.p.onRightClickRow.call(ts,$(ptr).attr("id"),ri,ci, e);
				return false;
			});
		}
		grid.bDiv = document.createElement("div");
		$(grid.bDiv)
			.append($('<div style="position:relative;>'+(isMSIE && $.browser.version < 8 ? "height:0.01%;" : "")+'"</div>').append('<div></div>').append(this))
			.addClass("ui-jqgrid-bdiv")
			.css({ height: ts.p.height+(isNaN(ts.p.height)?"":"px"), width: (grid.width)+"px"})
			.scroll(grid.scrollGrid);
		$("table:first",grid.bDiv).css({width:ts.p.tblwidth+"px"});
		if( isMSIE ) {
			if( $("tbody",this).size() == 2 ) { $("tbody:first",this).remove();}
			if( ts.p.multikey) {$(grid.bDiv).bind("selectstart",function(){return false;});}
		} else {
			if( ts.p.multikey) {$(grid.bDiv).bind("mousedown",function(){return false;});}
		}
		if(hg) {$(grid.bDiv).hide();}
		grid.cDiv = document.createElement("div");
		var arf = ts.p.hidegrid===true ? $("<a role='link' href='javascript:void(0)'/>").addClass('ui-jqgrid-titlebar-close HeaderButton').hover(
			function(){ arf.addClass('ui-state-hover');},
			function() {arf.removeClass('ui-state-hover');})
		.append("<span class='ui-icon ui-icon-circle-triangle-n'></span>").css((dir=="rtl"?"left":"right"),"0px") : "";
		$(grid.cDiv).append(arf).append("<span class='ui-jqgrid-title"+(dir=="rtl" ? "-rtl" :"" )+"'>"+ts.p.caption+"</span>")
		.addClass("ui-jqgrid-titlebar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix");
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
		if(ts.p.footerrow) {
			grid.sDiv = $("<div class='ui-jqgrid-sdiv'></div>")[0];
			hb = $("<div class='ui-jqgrid-hbox"+(dir=="rtl"?"-rtl":"")+"'></div>");
			$(grid.sDiv).append(hb).insertAfter(grid.hDiv).width(grid.width);
			$(hb).append(tfoot);
			grid.footers = $(".ui-jqgrid-ftable",grid.sDiv)[0].rows[0].cells;
			if(ts.p.rownumbers) grid.footers[0].className = 'ui-state-default jqgrid-rownum';
			if(hg) {$(grid.sDiv).hide();}
		}
		if(ts.p.caption) {
			ts.p._height += parseInt($(grid.cDiv,ts).height(),10);
			var tdt = ts.p.datatype;
			if(ts.p.hidegrid===true) {
				$(".ui-jqgrid-titlebar-close",grid.cDiv).click( function(e){
					var onHdCl = $.isFunction(ts.p.onHeaderClick);
					if(ts.p.gridstate == 'visible') {
						$(".ui-jqgrid-bdiv, .ui-jqgrid-hdiv","#gview_"+ts.p.id).slideUp("fast");
						if(ts.p.pager) {$(ts.p.pager).slideUp("fast");}
						if(ts.p.toolbar[0]===true) {
							if( ts.p.toolbar[1]=='both') {
								$(grid.ubDiv).slideUp("fast");
							}
							$(grid.uDiv).slideUp("fast");
						}
						if(ts.p.footerrow) $(".ui-jqgrid-sdiv","#gbox_"+ts.p.id).slideUp("fast");
						$("span",this).removeClass("ui-icon-circle-triangle-n").addClass("ui-icon-circle-triangle-s");
						ts.p.gridstate = 'hidden';
						if(onHdCl) {if(!hg) {ts.p.onHeaderClick.call(ts,ts.p.gridstate,e);}}
					} else if(ts.p.gridstate == 'hidden'){
						$(".ui-jqgrid-hdiv, .ui-jqgrid-bdiv","#gview_"+ts.p.id).slideDown("fast");
						if(ts.p.pager) {$(ts.p.pager).slideDown("fast");}
						if(ts.p.toolbar[0]===true) {
							if( ts.p.toolbar[1]=='both') {
								$(grid.ubDiv).slideDown("fast");
							}
							$(grid.uDiv).slideDown("fast");
						}
						if(ts.p.footerrow) $(".ui-jqgrid-sdiv","#gbox_"+ts.p.id).slideDown("fast");
						$("span",this).removeClass("ui-icon-circle-triangle-s").addClass("ui-icon-circle-triangle-n");
						if(hg) {ts.p.datatype = tdt;populate();hg=false;}
						ts.p.gridstate = 'visible';
						if(onHdCl) {ts.p.onHeaderClick.call(ts,ts.p.gridstate,e)}
					}
					return false;
				});
				if(hg) {ts.p.datatype="local"; $(".ui-jqgrid-titlebar-close",grid.cDiv).trigger("click");}
			}
		} else {$(grid.cDiv).hide();}
		$(grid.hDiv).after(grid.bDiv)
		.mousemove(function (e) {
			if(grid.resizing){grid.dragMove(e);return false;}
		});
		$(".ui-jqgrid-labels",grid.hDiv).bind("selectstart", function () { return false; });
		ts.p._height += parseInt($(grid.hDiv).height(),10);
		$(document).mouseup(function (e) {
			if(grid.resizing) {	grid.dragEnd(); return false;}
			return true;
		});
		this.updateColumns = function () {
			var r = this.rows[0], self =this;
			if(r) {
				$("td",r).each( function( k ) {
					$(this).css("width",self.grid.headers[k].width+"px");
				});
				this.grid.cols = r.cells;
			}
			return this;
		}
		ts.formatCol = formatCol;
		ts.sortData = sortData;
		ts.updatepager = updatepager;
		ts.formatter = function ( rowId, cellval , colpos, rwdat, act){return formatter(rowId, cellval , colpos, rwdat, act);};
		$.extend(grid,{populate : populate, emptyRows: emptyRows});
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
$.jgrid.extend({
	getGridParam : function(pName) {
		var $t = this[0];
		if (!$t.grid) {return;}
		if (!pName) { return $t.p; }
		else {return typeof($t.p[pName]) != "undefined" ? $t.p[pName] : null;}
	},
	setGridParam : function (newParams){
		return this.each(function(){
			if (this.grid && typeof(newParams) === 'object') {$.extend(true,this.p,newParams);}
		});
	},
	getDataIDs : function () {
		var ids=[], i=0, len;
		this.each(function(){
			len = this.rows.length;
			if(len && len>0){
				while(i<len) {
					ids[i] = this.rows[i].id;
					i++;
				}
			}
		});
		return ids;
	},
	setSelection : function(selection,onsr) {
		return this.each(function(){
			var $t = this, stat,pt, olr, ner, ia, tpsr;
			if(selection === undefined) return;
			onsr = onsr === false ? false : true;
			pt=$t.rows.namedItem(selection);
			if(pt==null) return;
			if($t.p.selrow && $t.p.scrollrows===true) {
				olr = $t.rows.namedItem($t.p.selrow).rowIndex;
				ner = $t.rows.namedItem(selection).rowIndex;
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
				if( $t.p.selrow ) {$("tr#"+$.jgrid.jqID($t.p.selrow),$t.grid.bDiv).removeClass("ui-state-highlight").attr("aria-selected","false") ;}
				$t.p.selrow = pt.id;
				$(pt).addClass("ui-state-highlight").attr("aria-selected","true");
				if( $t.p.onSelectRow && onsr) { $t.p.onSelectRow($t.p.selrow, true); }
				}
			} else {
				$t.p.selrow = pt.id;
				ia = $.inArray($t.p.selrow,$t.p.selarrrow);
				if (  ia === -1 ){ 
					if($(pt).attr("class") !== "subgrid") { $(pt).addClass("ui-state-highlight").attr("aria-selected","true");}
					stat = true;
					$("#jqg_"+$.jgrid.jqID($t.p.selrow),$t.rows).attr("checked",stat);
					$t.p.selarrrow.push($t.p.selrow);
					if( $t.p.onSelectRow && onsr) { $t.p.onSelectRow($t.p.selrow, stat); }
				} else {
					if($(pt).attr("class") !== "subgrid") { $(pt).removeClass("ui-state-highlight").attr("aria-selected","false");}
					stat = false;
					$("#jqg_"+$.jgrid.jqID($t.p.selrow),$t.rows).attr("checked",stat);
					$t.p.selarrrow.splice(ia,1);
					if( $t.p.onSelectRow && onsr) { $t.p.onSelectRow($t.p.selrow, stat); }
					tpsr = $t.p.selarrrow[0];
					$t.p.selrow = (tpsr === undefined) ? null : tpsr;
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
	},
	resetSelection : function(){
		return this.each(function(){
			var t = this, ind;
			if(!t.p.multiselect) {
				if(t.p.selrow) {
					$("tr#"+$.jgrid.jqID(t.p.selrow),t.grid.bDiv).removeClass("ui-state-highlight").attr("aria-selected","false");
					t.p.selrow = null;
				}
			} else {
				$(t.p.selarrrow).each(function(i,n){
					ind = t.rows.namedItem(n);
					$(ind).removeClass("ui-state-highlight").attr("aria-selected","false");
					$("#jqg_"+$.jgrid.jqID(n),ind).attr("checked",false);
				});
				$("#cb_"+$.jgrid.jqID(t.p.id),t.grid.hDiv).attr("checked",false);
				t.p.selarrrow = [];
			}
			t.p.savedRow = [];
		});
	},
	getRowData : function( rowid ) {
		var res = {}, resall, getall=false, len, j=0;
		this.each(function(){
			var $t = this,nm,ind;
			if(typeof(rowid) == 'undefined') {
				getall = true;
				resall = [];
				len = $t.rows.length;
			} else {
				ind = $t.rows.namedItem(rowid);
				if(!ind) return res;
				len = 1;
			}
			while(j<len){
				if(getall) ind = $t.rows[j];
				$('td',ind).each( function(i) {
					nm = $t.p.colModel[i].name; 
					if ( nm !== 'cb' && nm !== 'subgrid') {
						if($t.p.treeGrid===true && nm == $t.p.ExpandColumn) {
							res[nm] = $.jgrid.htmlDecode($("span:first",this).html());
						} else {
							try {
								res[nm] = $.unformat(this,{colModel:$t.p.colModel[i]},i);
							} catch (e){
								res[nm] = $.jgrid.htmlDecode($(this).html());
							}
						}
					}
				});
				j++;
				if(getall) { resall.push(res); res={}; }
			}
		});
		return resall ? resall: res;
	},
	delRowData : function(rowid) {
		var success = false, rowInd, ia, ri;
		this.each(function() {
			var $t = this;
			rowInd = $t.rows.namedItem(rowid);
			if(!rowInd) {return false;}
			else {
				ri = rowInd.rowIndex;
				$(rowInd).remove();
				$t.p.records--;
				$t.p.reccount--;
				$t.updatepager(true,false);
				success=true;
				if(rowid == $t.p.selrow) {$t.p.selrow=null;}
				ia = $.inArray(rowid,$t.p.selarrrow);
				if(ia != -1) {$t.p.selarrrow.splice(ia,1);}
			}
			if( ri == 0 && success ) {
				$t.updateColumns();
			}
			if( $t.p.altRows === true && success ) {
				var cn = $t.p.altclass;
				$($t.rows).each(function(i){
					if(i % 2 ==1) $(this).addClass(cn);
					else $(this).removeClass(cn);
				});
			}
		});
		return success;
	},
	setRowData : function(rowid, data, cssp) {
		var nm, success=false;
		this.each(function(){
			var t = this, vl, ind, cp = typeof cssp;;
			if(!t.grid) {return false;}
			ind = t.rows.namedItem(rowid);
			if(!ind) return false;
			if( data ) {
				$(this.p.colModel).each(function(i){
					nm = this.name;
					if( data[nm] != undefined) {
						vl = t.formatter( rowid, data[nm], i, data, 'edit');
						if(t.p.treeGrid===true && nm == t.p.ExpandColumn) {
							$("td:eq("+i+") > span:first",ind).html(vl).attr("title",$.jgrid.stripHtml(vl));
						} else {
							$("td:eq("+i+")",ind).html(vl).attr("title",$.jgrid.stripHtml(vl)); 
						}
						success = true;
					}
				});
			}
			if(cp === 'string') {$(ind).addClass(cssp);} else if(cp === 'object') {$(ind).css(cssp);}
		});
		return success;
	},
	addRowData : function(rowid,data,pos,src) {
		if(!pos) {pos = "last";}
		var success = false, nm, row="", gi=0, si=0, ni=0,sind, i, v, prp="";
		if(data) {
			this.each(function() {
				var t = this;
				if(t.p.rownumbers===true){
					prp = t.formatCol(ni,1);
					row += "<td role=\"gridcell\" class=\"ui-state-default jqgrid-rownum\" "+prp+">0</td>";
					ni=1;
				}
				if(t.p.multiselect) {
					v = "<input type=\"checkbox\""+" id=\"jqg_"+rowid+"\" class=\"cbox\"/>";
					prp = t.formatCol(ni,1);
					row += "<td role=\"gridcell\" "+prp+">"+v+"</td>";
					gi = 1;
				}
				if(t.p.subGrid===true) {
					row += $(t).jqGrid("addSubGridCell",gi+ni,1);
					si=1;
				}
				if(typeof(rowid) != 'undefined') rowid = rowid+"";
				else {
					rowid = (t.p.records+1)+"";
					if(t.p.keyIndex !== false) {
						var cmn = t.p.colModel[t.p.keyIndex+gi+si+ni].name;
						if(typeof data[cmn] != "undefined") rowid = data[cmn];
					}
				}
				for(i = gi+si+ni; i < this.p.colModel.length;i++){
					nm = this.p.colModel[i].name;
					v = t.formatter( rowid, data[nm], i, data, 'add');
					prp = t.formatCol(i,1);
					row += "<td role=\"gridcell\" "+prp+" title=\""+$.jgrid.stripHtml(v)+"\">"+v+"</td>";
				}
				row = "<tr id=\""+rowid+"\" role=\"row\" class=\"ui-widget-content jqgrow ui-row-"+t.p.direction+"\">" + row+"</tr>";
				if(t.p.subGrid===true) {
					row = $(row)[0]; 
					$(t).jqGrid("addSubGrid",row,gi+ni);
				}
				if(t.rows.length === 0){
					$("table:first",t.grid.bDiv).append(row);
				} else {
				switch (pos) {
					case 'last':
						$(t.rows[t.rows.length-1]).after(row);
						break;
					case 'first':
						$(t.rows[0]).before(row);
						break;
					case 'after':
						sind = t.rows.namedItem(src);
						if (sind) {$(t.rows[sind.rowIndex+1]).hasClass("ui-subgrid") ? $(t.rows[sind.rowIndex+1]).after(row) : $(sind).after(row);}
						break;
					case 'before':
						sind = t.rows.namedItem(src);
						if(sind) {$(sind).before(row);sind=sind.rowIndex;}
						break;
				}
				}
				t.p.records++;
				t.p.reccount++;
				if(!t.grid.cols || !t.grid.cols.length) t.grid.cols = t.rows[0].cells;
				if(pos==='first' || (pos==='before' && sind <= 1) ||  t.rows.length === 1 ){
					t.updateColumns();
				}
				if( t.p.altRows === true ) {
					var cn = t.p.altclass;
					if (pos == "last") {
						if ((t.rows.length-1)%2 == 1)  {$(t.rows[t.rows.length-1]).addClass(cn);}
					} else {
						$(t.rows).each(function(i){
							if(i % 2 ==1) $(this).addClass(cn);
							else $(this).removeClass(cn);
						});
					}
				}
				try {t.p.afterInsertRow(rowid,data); } catch(e){}
				t.updatepager(true,true);
				success = true;
			});
		}
		return success;
	},
	footerData : function(action,data, format) {
		var nm, success=false, res={};
		function isEmpty(obj) { for(var i in obj) { return false; } return true; }
		if(typeof(action) == "undefined") action = "get";
		if(typeof(format) != "boolean") format  = true;
		action = action.toLowerCase();
		this.each(function(){
			var t = this, vl, ind;
			if(!t.grid || !t.p.footerrow) {return false;}
			if(action == "set") { if(isEmpty(data)) return false; }
			success=true;
			$(this.p.colModel).each(function(i){
				nm = this.name;
				if(action == "set") {
					if( data[nm] != undefined) {
						vl = format ? t.formatter( "", data[nm], i, data, 'edit') : data[nm];
						$("tr.footrow td:eq("+i+")",t.grid.sDiv).html(vl).attr("title",$.jgrid.stripHtml(vl)); 
						success = true;
					}
				} else if(action == "get") {
					res[nm] = $("tr.footrow td:eq("+i+")",t.grid.sDiv).html();
				}
			});
		});
		return action == "get" ? res : success;
	},
	ShowHideCol : function(colname,show) {
		return this.each(function() {
			var $t = this, fndh=false;
			if (!$t.grid ) {return;}
			if( typeof colname === 'string') {colname=[colname];}
			show = show !="none" ? "" : "none";
			var sw = show == "" ? true :false;
			$(this.p.colModel).each(function(i) {
				if ($.inArray(this.name,colname) !== -1 && this.hidden === sw) {
					$("tr",$t.grid.hDiv).each(function(){
						$("th:eq("+i+")",this).css("display",show);
					});
					$($t.rows).each(function(j){
						$("td:eq("+i+")",$t.rows[j]).css("display",show);
					});
					if($t.p.footerrow) $("td:eq("+i+")",$t.grid.sDiv).css("display", show);
					if(show == "none") $t.p.tblwidth -= this.width; else $t.p.tblwidth += this.width;
					this.hidden = !sw;
					fndh=true;
				}
			});
			if(fndh===true) {
				$("table:first",$t.grid.hDiv).width($t.p.tblwidth);
				$("table:first",$t.grid.bDiv).width($t.p.tblwidth);
				$t.grid.hDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
				if($t.p.footerrow) {
					$("table:first",$t.grid.sDiv).width($t.p.tblwidth);
					$t.grid.sDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
				}
			}
		});
	},
	hideCol : function (colname) {
		return this.each(function(){$(this).jqGrid("ShowHideCol",colname,"none");});
	},
	showCol : function(colname) {
		return this.each(function(){$(this).jqGrid("ShowHideCol",colname,"");});
	},
	remapColumns : function(permutation, updateCells, keepHeader)
	{
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
		resortRows($("thead:first", ts.grid.hDiv), keepHeader && ":not(.ui-jqgrid-labels)");
		if (updateCells) {
			resortRows($("tbody:first", ts.grid.bDiv), ".jqgrow");
		}
		if (ts.p.footerrow) {
			resortRows($("tbody:first", ts.grid.sDiv));
		}
		if (ts.p.remapColumns) {
			if (!ts.p.remapColumns.length)
				ts.p.remapColumns = $.makeArray(permutation);
			else
				resortArray(ts.p.remapColumns);
		}
		ts.p.lastsort = $.inArray(ts.p.lastsort, permutation);
		if(ts.p.treeGrid) ts.p.expColInd = $.inArray(ts.p.expColInd, permutation);
	},
	setGridWidth : function(nwidth, shrink) {
		return this.each(function(){
			var $t = this, cw,
			initwidth = 0, brd=$t.p.cellLayout, lvc, vc=0, hs=false, scw=$t.p.scrollOffset, aw, gw=0, tw=0,
			cl = 0,cr;
			if (!$t.grid ) {return;}
			if(typeof shrink != 'boolean') {
				shrink=$t.p.shrinkToFit;
			}
			if(isNaN(nwidth)) {return;}
			else { nwidth = parseInt(nwidth); $t.grid.width = $t.p.width = nwidth;}
			$("#gbox_"+$t.p.id).css("width",nwidth+"px");
			$("#gview_"+$t.p.id).css("width",nwidth+"px");
			$($t.grid.bDiv).css("width",nwidth+"px");
			$($t.grid.hDiv).css("width",nwidth+"px");
			if($t.p.pager ) {$($t.p.pager).css("width",nwidth+"px");}
			if($t.p.toolbar[0] === true){
				$($t.grid.uDiv).css("width",nwidth+"px");
				if($t.p.toolbar[1]=="both") {$($t.grid.ubDiv).css("width",nwidth+"px");}
			}
			if($t.p.footerrow) $($t.grid.sDiv).css("width",nwidth+"px");
			if(shrink ===false && $t.p.forceFit == true) {$t.p.forceFit=false;}			
			if(shrink===true) {
				if ($.browser.safari) { brd=0;}
				$.each($t.p.colModel, function(i) {
					if(this.hidden===false){
						initwidth += parseInt(this.width,10);
						if(this.fixed) {
							tw += this.width;
							gw += this.width+brd;
						} else {
							vc++;
						}
						cl++;
					}
				});
				if(vc  == 0) return; 
				$t.p.tblwidth = initwidth;
				aw = nwidth-brd*vc-gw;
				if(!isNaN($t.p.height)) {
					if($($t.grid.bDiv)[0].clientHeight < $($t.grid.bDiv)[0].scrollHeight){
						hs = true;
						aw -= scw;
					}
				}
				initwidth =0;
				var cle = $t.grid.cols.length >0;
				$.each($t.p.colModel, function(i) {
					var tn = this.name;
					if(this.hidden === false && !this.fixed){
						cw = Math.floor((aw)/($t.p.tblwidth-tw)*this.width);
						this.width =cw;
						initwidth += cw;
						$t.grid.headers[i].width=cw;
						$t.grid.headers[i].el.style.width=cw+"px";
						if($t.p.footerrow) $t.grid.footers[i].style.width = cw+"px";
						if(cle) $t.grid.cols[i].style.width = cw+"px";
						lvc = i;
					}
				});
				cr =0;
				if (hs) {
					if(nwidth-gw-(initwidth+brd*vc) !== scw)
						cr = nwidth-gw-(initwidth+brd*vc)-scw;
				} else if( Math.abs(nwidth-gw-(initwidth+brd*vc)) !== 1) {
					cr = nwidth-gw-(initwidth+brd*vc);
				}
				$t.p.colModel[lvc].width += cr;
				cw= $t.p.colModel[lvc].width;
				$t.grid.headers[lvc].width = cw;
				$t.grid.headers[lvc].el.style.width=cw+"px";
				if(cle) $t.grid.cols[lvc].style.width = cw+"px";
				$t.p.tblwidth = initwidth+cr+tw+brd*cl;
				$('table:first',$t.grid.bDiv).css("width",$t.p.tblwidth+"px");
				$('table:first',$t.grid.hDiv).css("width",$t.p.tblwidth+"px");
				$t.grid.hDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
				if($t.p.footerrow) {
					$t.grid.footers[lvc].style.width = cw+"px";
					$('table:first',$t.grid.sDiv).css("width",$t.p.tblwidth+"px");
				}
			}
		});
	},
	setGridHeight : function (nh) {
		return this.each(function (){
			var $t = this;
			if(!$t.grid) {return;}
			$($t.grid.bDiv).css({height: nh+(isNaN(nh)?"":"px")});
			$t.p.height = nh;
			if ($t.p.scroll) $t.grid.populateVisible();
		});
	},
	setCaption : function (newcap){
		return this.each(function(){
			this.p.caption=newcap;
			$("span.ui-jqgrid-title",this.grid.cDiv).html(newcap);
			$(this.grid.cDiv).show();
		});
	},
	setLabel : function(colname, nData, prop, attrp ){
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
	setCell : function(rowid,colname,nData,cssp,attrp) {
		return this.each(function(){
			var $t = this, pos =-1,v;
			if(!$t.grid) {return;}
			if(isNaN(colname)) {
				$($t.p.colModel).each(function(i){
					if (this.name == colname) {
						pos = i;return false;
					}
				});
			} else {pos = parseInt(colname,10);}
			if(pos>=0) {
				var ind = $t.rows.namedItem(rowid);
				if (ind){
					var tcell = $("td:eq("+pos+")",ind);
					if(nData !== "") {
						v = $t.formatter(rowid, nData, pos,ind,'edit');
						if($t.p.treeGrid && $(".tree-wrap",$(tcell)).length>0)
							$("span",$(tcell)).html(v).attr("title",$.jgrid.stripHtml(v));
						else 
							$(tcell).html(v).attr("title",$.jgrid.stripHtml(v));
					}
					if(typeof cssp === 'string'){
						if(cssp) {$(tcell).addClass(cssp);}
						else {$(tcell).removeClass();}
					} else if(cssp) {
						$(tcell).css(cssp);
					}
					if(typeof attrp === 'object') {$(tcell).attr(attrp);}
				}
			}
		});
	},
	getCell : function(rowid,col) {
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
				var ind = $t.rows.namedItem(rowid);
				if(ind) {
					try {
						ret = $.unformat($("td:eq("+pos+")",ind),{colModel:$t.p.colModel[pos]},pos);
					} catch (e){
						ret = $.jgrid.htmlDecode($("td:eq("+pos+")",ind).html());
					}
				}
			}
		});
		return ret;
	},
	getCol : function (col, obj, mathopr) {
		var ret = [], val, sum=0;
		obj = typeof (obj) != 'boolean' ? false : obj;
		if(typeof mathopr == 'undefined') mathopr = false;
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
				var ln = $t.rows.length, i =0;
				if (ln && ln>0){
					while(i<ln){
						try {
							val = $.unformat($($t.rows[i].cells[pos]),{colModel:$t.p.colModel[pos]},pos);
						} catch (e) {
							val = $.jgrid.htmlDecode($t.rows[i].cells[pos].innerHTML);
						}
						mathopr ? sum += parseFloat(val,10) :
							obj ? ret.push({id:$t.rows[i].id,value:val}) : ret[i]=val;
						i++;
					}
					if(mathopr) {
						switch(mathopr.toLowerCase()){
							case 'sum': ret =sum; break;
							case 'avg': ret = sum/ln; break;
							case 'count': ret = ln; break;
						}
					}
				}
			}
		});
		return ret;
	},
	clearGridData : function(clearfooter) {
		return this.each(function(){
			var $t = this;
			if(!$t.grid) {return;}
			if(typeof clearfooter != 'boolean') clearfooter = false;
			$("tbody:first tr", $t.grid.bDiv).remove();
			if($t.p.footerrow && clearfooter) $(".ui-jqgrid-ftable td",$t.grid.sDiv).html("&#160;");
			$t.p.selrow = null; $t.p.selarrrow= []; $t.p.savedRow = [];
			$t.p.records = 0;$t.p.page='0';$t.p.lastpage='0';$t.p.reccount=0;
			$t.updatepager(true,false);
		});
	},
	getInd : function(rowid,rc){
		var ret =false,rw;
		this.each(function(){
			rw = this.rows.namedItem(rowid);
			if(rw) {
				ret = rc===true ? rw: rw.rowIndex;
			}
		});
		return ret;
	}
});
})(jQuery);
