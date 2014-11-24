(function (factory) {
	if (typeof define === "function" && define.amd) {

		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"jqgrid/i18n/grid.locale-en",
			"jqgrid/grid.base",
			"jqgrid/grid.formedit"
		], factory);
	} else {

		// Browser globals
		factory(jQuery);
	}
}(function (jQuery) {

	jQuery(function ($) {

		function build (response) {
			var html = "", template = "<option value='[value]'>[name]</option>";
			$(eval("(" + response + ")")).each(function (i, val) {
				html += template.replace(/(\[([^\[\]]+)\])/g, function ($0, $1, $2) {
					return val[$2] || "";
				});
			});
			return "<select>" + html + "</select>";
		}

		function serialize (data) {
			var str = [];
			if (data.letters) {
				data.letters = data.letters.split(",");
			}
			for (var i in data) {
				if ($.isArray(data[i])) {
					for (var j in data[i]) {
						str.push(i + "[]=" + encodeURI(data[i][j]));
					}
				} else {
					str.push(i + "=" + encodeURI(data[i]));
				}
			}
			return str.join("&");
		}

		$("#table").jqGrid({
			autowidth: true,
			colNames: ["ID", "Name", "Latitude", "Longitude", "Capital", "Letters"],
			colModel: [
				{name: "id", index: "id", width: 40, editable: false, search: false},
				{name: "name", index: "name", width: 100, editable: true, edittype: "textarea"},
				{name: "latitude", index: "title", width: 100, editable: true, edittype: "text", editoptions: {maxlength: 16}},
				{name: "longitude", index: "description", width: 100, editable: true, edittype: "text", editoptions: {maxlength: 16}},
				{name: "capital", index: "capital", width: 100, editable: true, edittype: "checkbox", editoptions: {value: "Yes:No"}},
				{name: "letters", index: "letters", width: 100, editable: true,
					edittype: "select", editoptions: {multiple: true, dataUrl: "dict.json", buildSelect: build},
					stype: "select", searchoptions: {dataUrl: "dict.json", buildSelect: build}
				}
			],
			pager: "#pager",
			datatype: "json",
			viewrecords: true,
			url: "data.json",
			onPaging: function (pgButton) {
				var curPage = grid.jqGrid("getGridParam", "page");
				var lastPage = grid.jqGrid("getGridParam", "lastpage");
				if (curPage < 1) {
					this.p.page = 1;
				}
				if (curPage > lastPage) {
					this.p.page = lastPage;
				}
			}
		}).jqGrid("navGrid", "#pager",
			{},
			{
				modal: true,
				url: "save.json",
				closeAfterEdit: true,
				reloadAfterSubmit: false,
				mtype: "GET",
				afterSubmit: function (response) {
					var json = eval("(" + response.responseText + ")");
					return [!json.message, json.message];
				},
				serializeEditData: serialize
			},
			{
				modal: true,
				url: "save.json",
				closeAfterAdd: true,
				reloadAfterSubmit: false,
				mtype: "GET",
				afterSubmit: function (response) {
					var json = eval("(" + response.responseText + ")");
					return [!json.message, json.message, json.id];
				},
				serializeEditData: serialize
			},
			{
				modal: true,
				url: "save.json",
				reloadAfterSubmit: false,
				mtype: "GET",
				afterSubmit: function (response) {
					var json = eval("(" + response.responseText + ")");
					return [!json.message, json.message];
				},
				serializeDelData: serialize
			},
			{
				sopt: ["eq", "ne", "in", "cn"],
				multipleSearch: true,
				closeAfterSearch: true
			}
		);
	});

}));