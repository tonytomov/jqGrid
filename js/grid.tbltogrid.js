/*
 Transform a table to a jqGrid.
 Peter Romianowski <peter.romianowski@optivo.de> 
 If the first column of the table contains checkboxes or
 radiobuttons then the jqGrid is made selectable.
*/
/*jslint browser: true, devel: true, eqeq: true, evil: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, vars: true, white: true, maxerr: 999 */
/*global jQuery */
// Addition - selector can be a class or id
(function($){
"use strict";
window.tableToGrid = function (selector, options) {
$(selector).each(function() {
	var self = this, $self = $(this);
	if(self.grid) {return;} //Adedd from Tony Tomov
	// This is a small "hack" to make the width of the jqGrid 100%
	$self.width("99%");
	var w = $self.width();

	// Text whether we have single or multi select
	var inputCheckbox = $('tr td:first-child input[type=checkbox]:first', $self);
	var inputRadio = $('tr td:first-child input[type=radio]:first', $self);
	var selectMultiple = inputCheckbox.length > 0;
	var selectSingle = !selectMultiple && inputRadio.length > 0;
	var selectable = selectMultiple || selectSingle;
	//var inputName = inputCheckbox.attr("name") || inputRadio.attr("name");

	// Build up the columnModel and the data
	var colModel = [];
	var colNames = [];
	$('th', $self).each(function() {
		if (colModel.length === 0 && selectable) {
			colModel.push({
				name: '__selection__',
				index: '__selection__',
				width: 0,
				hidden: true
			});
			colNames.push('__selection__');
		} else {
			colModel.push({
				name: $(this).attr("id") || $.trim($.jgrid.stripHtml($(this).html())).split(' ').join('_'),
				index: $(this).attr("id") || $.trim($.jgrid.stripHtml($(this).html())).split(' ').join('_'),
				width: $(this).width() || 150
			});
			colNames.push($(this).html());
		}
	});
	var data = [];
	var rowIds = [];
	var rowChecked = [];
	$('tbody > tr', $self).each(function() {
		var row = {};
		var rowPos = 0;
		$('td', $(this)).each(function() {
			if (rowPos === 0 && selectable) {
				var input = $('input', $(this));
				var rowId = input.attr("value");
				rowIds.push(rowId || data.length);
				if (input.is(":checked")) {
					rowChecked.push(rowId);
				}
				row[colModel[rowPos].name] = input.attr("value");
			} else {
				row[colModel[rowPos].name] = $(this).html();
			}
			rowPos++;
		});
		if(rowPos >0) { data.push(row); }
	});

	// Clear the original HTML table
	$self.empty();

	$self.jqGrid($.extend({
		datatype: "local",
		width: w,
		colNames: colNames,
		colModel: colModel,
		multiselect: selectMultiple
		//inputName: inputName,
		//inputValueCol: imputName != null ? "__selection__" : null
	}, options || {}));

	// Add data
	var a, id;
	for (a = 0; a < data.length; a++) {
		id = null;
		if (rowIds.length > 0) {
			id = rowIds[a];
			if (id && id.replace) {
				// We have to do this since the value of a checkbox
				// or radio button can be anything 
				id = encodeURIComponent(id).replace(/[.\-%]/g, "_");
			}
		}
		if (id === null) {
			id = $.jgrid.randId();
		}
		$self.jqGrid("addRowData",id, data[a]);
	}

	// Set the selection
	for (a = 0; a < rowChecked.length; a++) {
		$self.jqGrid("setSelection",rowChecked[a]);
	}
});
};
}(jQuery));
