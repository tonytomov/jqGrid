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
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	},
	getClipboardContents : async function () {
		try {
			const text = await navigator.clipboard.readText();
			//console.log('Pasted content: ', text);
			return text;
		} catch (err) {
			console.error('Failed to read clipboard contents: ', err);
		}
	},
	copyRows : function( rows, delimiter='\t', newline ='\n') {
		var seldata =[];
		for(var j=0; j<rows.length;j++) {
			var row = rows[j];
			var dat = [];
			if(row.classList.contains("jqgrow")) {
				for (var i=0;i<row.cells.length; i++) {
					if(row.cells[i].classList.contains("selected-cell")) {
						//console.log(row.cells[i].innerText);
						dat.push(row.cells[i].innerText);
					}
				}
				if(dat.length) {
					seldata.push( dat.join( delimiter ));
				}
			}
		}
		//console.log(seldata);
		$.jgrid.copyText( seldata.join( newline ));
		startCellIndex = null; startRowIndex = null;
	},
	pasteRows : function(cm, grid_id, o, paste_add) {
		if(startCellIndex === null || startRowIndex === null) {
			alert("Please click position to paste");
			return;
		}
		this.getClipboardContents().then((data) => {
			//console.log(data);

			var delim = o.paste_autodetect_delim  ? $.jgrid.guessDelimiters(data) : o.paste_delimiter, headers=[];
			data = data.split(o.paste_newline);
			if(o.paste_header_included) {
				headers =  $.jgrid.deserializeRow(data.shift(), delim);
			} else {
				var h_l = data[0].length;
			h_l += startCellIndex;
			if(h_l > cm.length) {
				h_l = cm.length;
			}
			for (var i = startCellIndex; i< h_l; i++) {
				headers.push(cm[i].name);
			}
			}
			if($.jgrid.isLocalStorage()) {
				localStorage.removeItem(grid_id+"_restore");
			}
			var rows_to_paste = $.jgrid.CSVtoObject(data, headers, delim, o.paste_newline);
			$("#"+grid_id).jqGrid("updateRowsByIndex", startRowIndex, rows_to_paste, o, paste_add);
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
	bindSelection : function() {
		return this.each(function(){
			var selectTo = function(cell, table) {
				var row = cell.parent();    
				var cellIndex = cell.index();
				var rowIndex = row.index();

				var rowStart, rowEnd, cellStart, cellEnd;

				if (rowIndex < startRowIndex) {
					rowStart = rowIndex;
					rowEnd = startRowIndex;
				} else {
					rowStart = startRowIndex;
					rowEnd = rowIndex;
				}

				if (cellIndex < startCellIndex) {
					cellStart = cellIndex;
					cellEnd = startCellIndex;
				} else {
					cellStart = startCellIndex;
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
			table.find("td").mousedown(function (e) {

				if(e.which === 3) { // right click button for custom copy/paste
					//console.log(e);
					//var pos = $(e.currentTarget).position();
					$("#"+ts.p.id+"_copypaste").css({left : e.clientX, top: e.clientY}).show();
					return false;
				}
				isMouseDown = true;
				var cell = $(this);
				table.find("."+selected).removeClass(selected); // deselect everything

				if (e.shiftKey) {
					selectTo(cell, table);                
				} else {
					cell.addClass(selected);
					startCellIndex = cell.index();
					startRowIndex = cell.parent().index();
				}
				return false; // prevent text selection
			})
			.mouseover(function () {
				if (!isMouseDown) return;
				table.find("."+ selected).removeClass(selected);
				selectTo($(this), table);
			})
			.bind("selectstart", function () {
				return false;
			});
		});
	},
	startClipboard : function( prm ) {
		var o = $.extend({
			copy_delimiter : '\t',
			copy_newline: '\n',
			paste_delimiter : '\t',
			paste_newline : '\n',
			paste_autodetect_delim : true,
			paste_header_included : false
		}, prm || {});
		
		return this.each(function(){
			var colmenustyle = $.jgrid.styleUI[(this.p.styleUI || 'jQueryUI')].colmenu;
			var arf1 = '<ul id="'+this.id+'_copypaste" class="ui-search-menu modal-content column-menu ui-menu jqgrid-caption-menu ' + colmenustyle.menu_widget+'" role="menubar" tabindex="0"></ul>';
			$("#gbox_"+this.id).append(arf1);
			var menus_copy = new Array(
				{"id" : "copy_act", "title" : "Copy Selected to Clipboard", "click": function() { $.jgrid.copyRows(this.rows, o.copy_delimiter, o.copy_newline); } },
				{divider : true},
				{"id" : "paste_act", "title" : "Paste Update from Clipboard", "click": function() { $.jgrid.pasteRows(this.p.colModel, this.id, o, false); } },
				{divider : true},
				{"id" : "paste_act_add", "title" : "Paste Add from Clipboard", "click": function() { $.jgrid.pasteRows(this.p.colModel, this.id, o, true); } },
				{divider : true},
				{"id" : "undo_paste_act", "title" : "Undo pasted rows", "click": function() { $.jgrid.undoPaste( this.id, o); } }
			);
			$(this).jqGrid("menubarAdd", menus_copy, "_copypaste");
			$(this).on('jqGridAfterGridComplete.setBindSelections',function(){
				$(this).jqGrid('bindSelection');
				startCellIndex = startRowIndex = null;
			});
			$(this).on('jqGridRightClickRow.setBindSelections',function(e, id, iRow, iCol, e1){
				//console.log(e, id, iRow, iCol, e1);
				//$.jgrid.copyRows(this.rows)
				return false;
			});
			$(document).mouseup(function () {
				isMouseDown = false;
			});
			$.jgrid.Permissions();
		});
	},
	stopClipboard : function() {
		// to be written
	},
	updateRowsByIndex : function(startInd, data, o, paste_add) {
		var success = true;
		this.each(function(){
			if(Array.isArray(data)) {
				if(startInd < 0 ) {
					success = false;
					console.log("not vald start index");
				}  else {
					var datalen = data.length, i=0, row, grow, storeUpdate = [];
					while(i < datalen) {
						row = data[i];
						grow = this.rows[startInd];
						if( !grow || paste_add===true) {
							$(this).jqGrid("addRowData", null, row, "last", null, "frompaste");// perform add
						} else {
							let o_row = $(this).jqGrid("getRowData",  grow.id);
							if( !$.isEmptyObject(o_row) ) {
							o_row["_id_"] = grow.id;
							storeUpdate.push( o_row );
							$(this).jqGrid("setRowData",  grow.id, row);
							}
							
						}
						i++;
						startInd++;
					}
					if(storeUpdate.length) {
						if($.jgrid.isLocalStorage()) {
							localStorage.setItem(this.id+"_restore", JSON.stringify(storeUpdate));
						} else {
							alert("Local storage not available! Can not store data for undo changes!");
						}
					}
				}
			} else {
				success = false; 
				console.log("data is not array");
			}
		});
		return success;
	}
// end clipboard grid
});
//module end
}));
