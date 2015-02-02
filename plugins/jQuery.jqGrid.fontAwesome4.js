/**
 * Copyright (c) 2013, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2013-11-23
 * see http://stackoverflow.com/a/20165553/315935 for more details
 */
/*global $ */
(function ($) {
    "use strict";
	$.jgrid = $.jgrid || {};
    /*jslint unparam: true */
    $.extend(true, $.jgrid, {
        icons: {
            common: "fa", // "fa fa-lg"
            titleVisibleGrid: "fa-chevron-circle-up",
            titleHiddenGrid: "fa-chevron-circle-down",
            close: "fa-times",
            sortAsc: "fa-sort-asc fa-lg",
            sortDesc: "fa-sort-desc fa-lg",
			navCommonIconClass: "fa-fw",
            navEdit: "fa-pencil",
            navAdd: "fa-plus",
            navDel: "fa-trash-o",
            navSearch: "fa-search",
            navRefresh: "fa-refresh",
            navView: "fa-file-o",
			navSave: "fa-floppy-o",
			navCancel: "fa-ban",
			actionCommonIconClass: "ui-state-default fa-fw",
            pagerFirst: "fa-step-backward fa-fw",
            pagerPrev: "fa-backward fa-fw",
            pagerNext: "fa-forward fa-fw",
            pagerLast: "fa-step-forward fa-fw",
            formPrev: "fa-caret-left",
            formNext: "fa-caret-right",
            formSave: "fa-floppy-o",
            formUndo: "fa-undo",
            formDel: "fa-trash-o",
            searchReset: "fa-undo",
            searchQuery: "fa-comments-o",
            searchSearch: "fa-search",
			subgridCommonIconClass: "ui-state-default fa-fw",
            subgridPlus: "fa-plus",
            subgridMinus: "fa-minus",
			subgridOpenltr: "fa-reply fa-rotate-180",
			subgridOpenrtl: "fa-share fa-rotate-180",
            getClass: function (prop) {
                return this.common !== "" ? this.common + " " + this[prop] : this[prop];
            }
        }
    });

    $.jgrid.extend({
        initFontAwesome: function () {
            return this.each(function () {
                var $grid = $(this);

				$grid.bind("jqGridBeforeInitGrid", function () {
                    var $this = $(this), $pager, $sortables, p = this.p;

					p.fontAwesomeIcons = true;

					p.jqModal = $.extend(true, {
						commonIconClass: "",
						closeIcon: $.jgrid.icons.getClass("close")
					}, p.jqModal || {});
					
					$.extend(true, p, {
						pagerFirstIcon: $.jgrid.icons.getClass("pagerFirst"),
						pagerPrevIcon: $.jgrid.icons.getClass("pagerPrev"),
						pagerNextIcon: $.jgrid.icons.getClass("pagerNext"),
						pagerLastIcon: $.jgrid.icons.getClass("pagerLast"),
						sortAscIcon: $.jgrid.icons.getClass("sortAsc"),
						sortDescIcon: $.jgrid.icons.getClass("sortDesc"),
						visibleGridIcon: $.jgrid.icons.getClass("titleVisibleGrid"),
						hiddenGridIcon: $.jgrid.icons.getClass("titleHiddenGrid"),
						groupingView: {
							commonIconClass: "",
							plusicon: "fa fa-fw fa-plus-square-o",
							minusicon: "fa fa-fw fa-minus-square-o"
						},
						treeIcons: {
							commonIconClass: "fa fa-fw",
							plusRtl: "fa-lg fa-caret-left",
							plusLtr: "fa-lg fa-caret-right",
							minus: "fa-lg fa-sort-desc",
							leaf: "fa-dot-circle-o"
						}
					});

					if (p.subGrid) {
						p.subGridOptions = $.extend(true, {
							commonIconClass: $.jgrid.icons.getClass("subgridCommonIconClass"),
							plusicon: $.jgrid.icons.getClass("subgridPlus"),				//"ui-icon-plus";
							minusicon: $.jgrid.icons.getClass("subgridMinus"),				//"ui-icon-minus";
							openicon: $.jgrid.icons.getClass("subgridOpen" + p.direction)	//"ui-icon-carat-1-sw";
						},
						p.subGridOptions || {});
					}

					p.navOptions = $.extend(true, {
						editicon: $.jgrid.icons.getClass("navEdit"),
						addicon: $.jgrid.icons.getClass("navAdd"),
						delicon: $.jgrid.icons.getClass("navDel"),
						saveicon: $.jgrid.icons.getClass("navSave"),
						cancelicon: $.jgrid.icons.getClass("navCancel"),
						searchicon: $.jgrid.icons.getClass("navSearch"),
						refreshicon: $.jgrid.icons.getClass("navRefresh"),
						viewicon: $.jgrid.icons.getClass("navView"),
						commonIconClass: $.jgrid.icons.getClass("navCommonIconClass")
					}, p.navOptions || {});

					p.formEditing = $.extend(true, {
						commonIconClass: "",
						prevIcon: $.jgrid.icons.getClass("formPrev"),
						nextIcon: $.jgrid.icons.getClass("formNext"),
						saveicon : [true,"left",$.jgrid.icons.getClass("formSave")],
						closeicon : [true,"left",$.jgrid.icons.getClass("close")],
					}, p.formEditing || {});

					p.formViewing = $.extend(true, {
						commonIconClass: "",
						prevIcon: $.jgrid.icons.getClass("formPrev"),
						nextIcon: $.jgrid.icons.getClass("formNext"),
						closeicon: [true,"left",$.jgrid.icons.getClass("close")],
					}, p.formViewing || {});

					p.formDeleting = $.extend(true, {
						commonIconClass: "",
						delicon : [true,"left",$.jgrid.icons.getClass("formDel")],
						cancelicon : [true,"left",$.jgrid.icons.getClass("formUndo")],
					}, p.formDeleting || {});

					p.searching = $.extend(true, {
						commonIconClass: "",
						findDialogIcon: $.jgrid.icons.getClass("searchSearch"),
						resetDialogIcon: $.jgrid.icons.getClass("searchReset"),
						queryDialogIcon: $.jgrid.icons.getClass("searchQuery")
					}, p.searching || {});

					p.actionsNavOptions = $.extend(true, {
						commonIconClass: $.jgrid.icons.getClass("actionCommonIconClass")
					}, p.actionsNavOptions || {});
                });
            });
        }
    });
}(jQuery));
