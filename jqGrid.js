require([
	"jquery",

	// grid
	"jqgrid/grid.base",
	"jqgrid/grid.celledit",
	"jqgrid/grid.common",
	"jqgrid/grid.custom",
	"jqgrid/grid.filter",
	"jqgrid/grid.formedit",
	"jqgrid/grid.grouping",
	"jqgrid/grid.import",
	"jqgrid/grid.inlinedit",
	"jqgrid/grid.jqueryui",
	"jqgrid/grid.pivot",
	"jqgrid/grid.subgrid",
	"jqgrid/grid.treegrid",
	"jqgrid/jqDnR",
	"jqgrid/jqModal",
	"jqgrid/jquery.fmatter",
	"jqgrid/JsonXml",

	// plugins
	"plugins/grid.addons",
	"plugins/grid.postext",
	"plugins/grid.setcolumns",
	"plugins/jquery.contextmenu",
	"plugins/jquery.searchFilter",
	"plugins/jquery.tablednd",
	"plugins/ui.multiselect"
], function ($) {
	"use strict";
	console.log("jqGrid loaded!");
});