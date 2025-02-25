/*jshint eqeqeq:false */
/*global jQuery, define */
(function( factory ) {
	"use strict";
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./grid.base"
		], factory );
	} else {
		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
"use strict";
//module begin
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
				alert("Copy paste disabled in browser, please enable it");
			}
			// Listen for changes to the permission state
			// permissionStatus.onchange = () => {
			//	console.log(permissionStatus.state);
			// }
		}).catch((error)=>{
			console.log("clipboard-read permission not supported for this browser.")
		});
	},
	copyText: async function (textValue) {
		try {
			await navigator.clipboard.writeText(textValue);
			console.log('Text copied to clipboard');
			$.jgrid.toast({text: 'Text copied to clipboard!', position:"top center", header: "", styleUI: this.p.styleUI, type:"info"});
		} catch (err) {
			$.jgrid.toast({text: 'Failed to copy to clipboard!', position:"top center", header: "", styleUI: this.p.styleUI, type:"error"});
			console.error('Failed to copy: ', err);
		}
	},
	getClipboardContents : async function ( grid_id ) {
		try {
			const text = await navigator.clipboard.readText();
			//console.log('Pasted content: ', text);
			return text;
		} catch (err) {
			$.jgrid.toast({text: 'Failed to read clipboard contents!', position:"top center", header: "", styleUI: $("#"+grid_id)[0].p.styleUI, type:"error"});
			console.error('Failed to read clipboard contents: ', err);
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
		$.jgrid.copyText.call($t, seldata.join( o.copy_newline ));
		//startCellIndex = null; startRowIndex = null;
	},
	pasteRows : function(cm, grid_id, o, paste_add) {
		if(o.startCellIndex === null || o.startRowIndex === null) {
			alert("Please click position to paste");
			return;
		}
		this.getClipboardContents( grid_id ).then((data) => {
			//console.log(data);

			var delim = o.paste_autodetect_delim  ? $.jgrid.guessDelimiters(data) : o.paste_delimiter, headers=[];
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
			//console.log(rows_to_paste);
		});
	},
	undoPaste : function( grid_id ) {
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
					//console.log(e);
					//var pos = $(e.currentTarget).position();
					$("#"+ts.p.id+"_copypaste").css({left : e.clientX, top: e.clientY}).show();
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
			paste_delimiter : '\t',
			paste_newline : '\n',
			paste_autodetect_delim : true,
			paste_header_included : false,
			paste_skip_formatter : true,
			show_dialog_after_paste: true,
			startCellIndex : null,
			startRowIndex : null,
			isMouseDown : false
		}, prm || {});
		
		return this.each(function(){
			var colmenustyle = $.jgrid.styleUI[(this.p.styleUI || 'jQueryUI')].colmenu, $t=this;
			var arf1 = '<ul id="'+this.id+'_copypaste" class="ui-search-menu modal-content column-menu ui-menu jqgrid-caption-menu ' + colmenustyle.menu_widget+'" role="menubar" tabindex="0"></ul>';
			$("#gbox_"+this.id).append(arf1);
			var menus_copy = new Array(
				{"id" : "copy_act", "title" : "Copy Selected to Clipboard", "click": function() { $.jgrid.copyRows(this.rows,this.p.colModel, o ); } },
				{divider : true},
				{"id" : "paste_act", "title" : "Paste Update from Clipboard", "click": function() { $.jgrid.pasteRows(this.p.colModel, this.id, o, false); } },
				{divider : true},
				{"id" : "paste_act_add", "title" : "Paste Add from Clipboard", "click": function() { $.jgrid.pasteRows(this.p.colModel, this.id, o, true); } },
				{divider : true},
				{"id" : "undo_paste_act", "title" : "Undo pasted rows", "click": function() { $.jgrid.undoPaste( this.id, o); } }
			);
			$(this).jqGrid("menubarAdd", menus_copy, "_copypaste");
			$(this).on('jqGridAfterGridComplete.setBindSelections',function(){
				$(this).jqGrid('bindSelection', o);
				o.startCellIndex = o.startRowIndex = null;
			});
			$(this).on('jqGridRightClickRow.setBindSelections',function(e, id, iRow, iCol, e1){
				//console.log(e, id, iRow, iCol, e1);
				//$.jgrid.copyRows(this.rows)
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
			$.jgrid.Permissions();
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
			var locales = $.jgrid.getRegional(this, 'clipboard');
			if(Array.isArray(data)) {
				if(startInd < 0 ) {
					success = false;
					console.log("not vald start index");
				}  else {
					var datalen = data.length, i=0, row, grow, storeUpdate = [], inserted = 0, updated =0,
					edit =$.jgrid.getRegional(this, 'edit');
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
							$.jgrid.toast({text: 'Local storage not available! Can not store data for undo changes!', position:"top center", header: "", autoCloseTime:3500, styleUI: this.p.styleUI, type:"warning"});
							//alert("Local storage not available! Can not store data for undo changes!");
						}
					}
					if(o.show_dialog_after_paste) {
						$.jgrid.info_dialog("Information",'<div>Total rows : '+datalen + '</div><div>Insered : '+inserted+ '</div><div>Updated : '+updated +'</div>','',{styleUI : this.p.styleUI ,autoClose: true, autoCloseTime:3500,});
					}
				}
			} else {
				success = false; 
				$.jgrid.toast({text: 'Data is not Array!', position:"top center", header: "", autoCloseTime:3500, styleUI: this.p.styleUI, type:"error"});
				console.log("data is not array");
			}
		});
		return success;
	}
// end clipboard grid
});
//module end
}));
