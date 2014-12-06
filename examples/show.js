(function (factory) {
	if (typeof define === "function" && define.amd) {

		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"jqgrid/i18n/grid.locale-en",
			"jqgrid/grid.base"
		], factory);
	} else {

		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	$("#table").jqGrid({
		autowidth: true,
		colNames: ["ID", "Name", "Latitude", "Longitude", "Capital", "Letters"],
		colModel: [
			{name: "id", index: "id", width: 40},
			{name: "name", index: "name", width: 100},
			{name: "latitude", index: "title", width: 100},
			{name: "longitude", index: "description", width: 100},
			{name: "capital", index: "capital", width: 100},
			{name: "letters", index: "letters", width: 100}
		],
		datatype: "json",
		viewrecords: true,
		url: "./data.json",
		pager: "#pager"
	});

}));