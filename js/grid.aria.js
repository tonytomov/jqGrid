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
$.jgrid.extend({
	setupBodyGrid : function () {
		return this.each(function (){
			var $t = this;
			// basic functions
			function isValidCell(row, col) {
				return (
					!isNaN(row) &&
					!isNaN(col) &&
					row >= 0 &&
					col >= 0 &&
					$t.rows.length &&
					row < $t.rows.length &&
					col < $t.p.colModel.length
				);
			};
			function getNextCell( dirX, dirY) {
				var row = $t.p.iRow + dirY; // set the default one when initialize grid
				var col = $t.p.iCol + dirX; // set the default .................
				var rowCount = $t.rows.length;
				var isLeftRight = dirX !== 0;
				
				if (!rowCount) {
					return false;
				}
				var colCount = $t.p.colModel.length;
				if (isLeftRight) {
					if (col < 0) {
						col = colCount - 1;
						row--;
					}
					if (col >= colCount) {
						col = 0;
						row++;
					}
				}
				if (!isLeftRight) {
					if (row < 1) {
						col--;
						row = rowCount - 1;
						if ($t.rows[row] && col >= 0 && !$t.rows[row].cells[col]) {
						// Sometimes the bottom row is not completely filled in. In this case,
						// jump to the next filled in cell.
							row--;
						}
					}
					else if (row >= rowCount || !$t.rows[row].cells[col]) {
						row = 1;
						col++;
					}
				}
				if (isValidCell(row, col)) {
					return {
						row: row,
						col: col
					};
				} else if (isValidCell($t.p.iRow, $t.p.iCol)) {
					return {
						row: $t.p.iRow,
						col: $t.p.iCol
					};
				} else {
					return false;
				}				
			}
			function getNextVisibleCell(dirX, dirY) {
				var nextCell = getNextCell( dirX, dirY);
				if (!nextCell) {
					return false;
				}
				
				while ( $($t.rows[nextCell.row].cells[nextCell.col]).is(":hidden") ) {
					$t.p.iRow = nextCell.row;
					$t.p.iCol = nextCell.col;
					nextCell = getNextCell(dirX, dirY);
					if ($t.p.iRow  === nextCell.row && $t.p.iCol  === nextCell.col) {
						// There are no more cells to try if getNextCell returns the current cell
						return false;
					}
				}
				if( dirY !== 0 ) {
					$($t).jqGrid('setSelection', $t.rows[nextCell.row].id, false);
				}
				
				return nextCell;
			}
			function movePage ( dir ) {
				var curpage = $t.p.page, last =$t.p.lastpage;
				curpage = curpage + dir;
				if( curpage <= 0) {
					curpage = 1;
				}
				if( curpage > last ) {
					curpage = last;
				}
				if(  $t.p.page === curpage ) {
					return;
				}
				$t.p.page = curpage;
				$t.grid.populate();
			}
			var focusableElementsList = [
			'>a[href]',
			'>button:not([disabled])',
			'>area[href]',
			'>input:not([disabled])',
			'>select:not([disabled])',
			'>textarea:not([disabled])',
			'>iframe',
			'>object',
			'>embed',
			'>*[tabindex]',
			'>*[contenteditable]'
			];
			
			var focusableElementsSelector = focusableElementsList.join();
			function hasFocusableChild( el) {
				return $(focusableElementsSelector, el)[0];
			}
			$($t).on('jqGridAfterGridComplete.setAriaGrid', function( e ) {
				//var grid = e.target;
				$("tbody:first>tr:not(.jqgfirstrow)>td:not(:hidden, :has("+focusableElementsSelector+"))", $t).attr("tabindex", -1);
				if($t.p.iRow !== undefined && $t.p.iCol !== undefined) {
					$($t.rows[$t.p.iRow].cells[$t.p.iCol]).attr('tabindex', 0);
				}
			});
			$t.p.iRow = 1;
			for(var i = 0;i<$t.p.colModel.length;i++) {
				if($t.p.colModel[i].hidden !== true ) {
					$t.p.iCol = i;
					break;
				}
			}
			var focusRow=0, focusCol=0; // set the dafualt one
			$($t).on('keydown', function(e) {
				var key = e.which || e.keyCode, nextCell;
				switch(key) {
					case (38) : 
						nextCell = getNextVisibleCell(0, -1);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case (40) : 
						nextCell = getNextVisibleCell(0, 1);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case (37) : 
						nextCell = getNextVisibleCell(-1, 0);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case (39) :
						nextCell = getNextVisibleCell(1, 0);
						focusRow = nextCell.row;
						focusCol = nextCell.col;
						e.preventDefault();
						break;
					case 36 : // HOME
						if(e.ctrlKey) {
							focusRow = 1;
						} else {
							focusRow = $t.p.iRow;
						}
						focusCol = 0;
						e.preventDefault();
						break;
					case 35 : //END
						if(e.ctrlKey) { 
							focusRow = $t.rows.length - 1;
						} else {
							focusRow = $t.p.iRow;
						}
						focusCol = $t.p.colModel.length - 1;
						e.preventDefault();
						break;
					case 33 : // PAGEUP
						
						movePage( -1 );
						focusCol = $t.p.iCol;
						focusRow = $t.p.iRow;
						e.preventDefault();
						break;
					case 34 : // PAGEDOWN
						movePage( 1 );
						focusCol = $t.p.iCol;
						focusRow = $t.p.iRow;
						if(focusRow > $t.rows.length-1) {
							focusRow = $t.rows.length-1;
							$t.p.iRow = $t.rows.length-1;
						}
						e.preventDefault();
						break;
							
					default:
						return;
				}
				var fe;
				if (!isNaN($t.p.iRow) && !isNaN($t.p.iCol)) {
					fe = hasFocusableChild($t.rows[$t.p.iRow].cells[$t.p.iCol]);
					if( fe ) {
						$(fe).attr('tabindex', -1);
					} else {
						$($t.rows[$t.p.iRow].cells[$t.p.iCol]).attr('tabindex', -1);
					}
				}
				
				fe = hasFocusableChild($t.rows[focusRow].cells[focusCol]);
				if( fe ) {
					$(fe).attr('tabindex', 0).focus();
				}  else {
					$($t.rows[focusRow].cells[focusCol]).attr('tabindex', 0).focus();
				}
				$t.p.iRow = focusRow;
				$t.p.iCol = focusCol;
			});
			$($t).on('jqGridSelectRow.ariaGridClick', function(el1, id, status, e) {
				var el = e.target;
				if($t.p.iRow > 0 && $t.p.iCol >=0) {
					$($t.rows[$t.p.iRow].cells[$t.p.iCol]).attr("tabindex", -1);
				} 
				if($(el).is("td") || $(el).is("th")) {
					$t.p.iCol = el.cellIndex;
				} else {
					return;
				}
				var row = $(el).closest("tr.jqgrow");
				$t.p.iRow = row[0].rowIndex;
				$(el).attr("tabindex", 0);
			});
		});
	},
	setupHeaderGrid : function() {
		return this.each(function (){
			var $t = this,
			htable = $(".ui-jqgrid-hbox>table:first", "#gbox_"+$t.p.id);
			$('tr.ui-jqgrid-labels', htable).on("keydown", function(e) {
				var currindex = $t.p.selHeadInd; 
				var key = e.which || e.keyCode;
				var len = $t.grid.headers.length;
				
				switch (key) {
					case 37: // left
						if(currindex-1 >= 0) {
							currindex--;
							while( $($t.grid.headers[currindex].el).is(':hidden') && currindex-1 >= 0) {
								currindex--;
								if(currindex < 0) {
									break;
								}
							}
							if(currindex >= 0) {
								$($t.grid.headers[currindex].el).focus();
								//$($t.grid.headers[$t.p.selHeadInd].el).attr("tabindex", "-1");
								$t.p.selHeadInd = currindex;
								e.preventDefault();
							}
						}
						
						break;
					case 39: // right
						if(currindex+1 < len) {
							currindex++;
							while( $($t.grid.headers[currindex].el).is(':hidden') && currindex+1 <len) {
								currindex++;
								if( currindex > len-1) {
									break;
								}
							}
							if( currindex < len) {
								$($t.grid.headers[currindex].el).focus();
								//$($t.grid.headers[$t.p.selHeadInd].el).attr("tabindex", "-1");
								$t.p.selHeadInd = currindex;
								e.preventDefault();
							}
						}
						break;
					case 13: // enter
						$("div:first",$t.grid.headers[currindex].el).trigger('click');
						e.preventDefault();
						break;
					default:
						return;
				}
			});
			$('tr.ui-jqgrid-labels>th:not(:hidden)', htable).attr("tabindex", -1).focus(function(){
				$(this).addClass('ui-state-highlight').attr("tabindex", "0");
			}).blur(function(){
				$(this).removeClass('ui-state-highlight');
			});			
		});
	}
/// end  aria grid
});
//module end
}));
