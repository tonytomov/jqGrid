/**
 * Copyright (c) 2013, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2012-01-19
 * see http://stackoverflow.com/a/20165553/315935 for more details
 */
/*global jQuery */
(function ($) {
    "use strict";
    /*jslint unparam: true */
    $.extend($.fn.fmatter, {
        checkboxFontAwesome4: function (cellValue, options) {
            var title = options.colModel.title !== false ? ' title="' + (options.colName || options.colModel.label || options.colModel.name) + '"' : '',
				strCellValue = String(cellValue).toLowerCase(),
				editoptions = options.colModel.editoptions,
				editYes = editoptions != null && typeof editoptions.value === "string" ? editoptions.value.split(":")[0] : "yes";
            return (cellValue === 1 || strCellValue === "1" || cellValue === true || strCellValue === "true" || strCellValue === "yes" || strCellValue === editYes) ?
                '<i class="fa fa-check-square-o fa-lg"' + title + '></i>' :
                '<i class="fa fa-square-o fa-lg"' + title + '></i>';
        }
    });
	$.extend(true,$.jgrid, {
		cmTemplate: {
			booleanCheckboxFa: {
				align: "center", formatter: "checkboxFontAwesome4",
				edittype: "checkbox", editoptions: {value: "true:false", defaultValue: "false"},
				convertOnSave: function (nData, cm) {
					var lnData = String(nData).toLowerCase(),
						cbv = cm.editoptions != null && typeof cm.editoptions.value === "string" ?
							cm.editoptions.value.split(":") : ["yes","no"];

					if ($.inArray(lnData, ["1", "true", cbv[0].toLowerCase()]) >= 0) {
						nData = true;
					} else if ($.inArray(lnData, ["0", "false", cbv[1].toLowerCase()]) >= 0) {
						nData = false;
					}
					return nData;
				},
				stype: "select", searchoptions: { sopt: ["eq", "ne"], value: ":Any;true:Yes;false:No" }
			},
		}
	});
    $.extend($.fn.fmatter.checkboxFontAwesome4, {
        unformat: function (cellValue, options, elem) {
            var cbv = (options.colModel.editoptions != null && options.colModel.editoptions.value) ?
					options.colModel.editoptions.value.split(":") :
					["Yes", "No"];
            return $(">i", elem).hasClass("fa-check-square-o") ? cbv[0] : cbv[1];
        }
    });
}(jQuery));
