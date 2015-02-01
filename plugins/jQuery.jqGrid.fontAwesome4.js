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

    $.extend(true, $.jgrid, {
        originalCreateModal: $.jgrid.originalCreateModal || $.jgrid.createModal,
        createModal: function (aIDs, content, p, insertSelector, posSelector, appendsel, css) {
            $.jgrid.originalCreateModal.call(this, aIDs, content, p, insertSelector, posSelector, appendsel, css);
            if ($(insertSelector).find(">.ui-jqgrid-bdiv>div>.ui-jqgrid-btable").jqGrid("getGridParam", "fontAwesomeIcons")) {
                $("#" + $.jgrid.jqID(aIDs.modalhead) + ">a.ui-jqdialog-titlebar-close>span.ui-icon")
                    .removeClass("ui-icon ui-icon-closethick")
                    .addClass($.jgrid.icons.getClass("close"));
                $("#" + $.jgrid.jqID(aIDs.themodal) + ">div.jqResize").removeClass("ui-icon-grip-diagonal-se");
            }
        }
    });

    $.jgrid.extend({
        initFontAwesome: function () {
            return this.each(function () {
                var $grid = $(this);

                $grid.bind("jqGridFilterAfterShow", function (e, $form) {
                    // an alternative to afterShowSearch
                    var $dialog = $form.closest(".ui-jqdialog"),
                        $iconSpans = $dialog.find("a.fm-button>span.ui-icon");
                    $iconSpans.each(function () {
                        var $this = $(this);
                        $this.removeClass("ui-icon");
                        if ($this.hasClass("ui-icon-search")) {
                            $this.removeClass("ui-icon ui-icon-search")
                                .addClass($.jgrid.icons.getClass("searchSearch"));
                        } else if ($this.hasClass("ui-icon-arrowreturnthick-1-w")) {
                            $this.removeClass("ui-icon ui-icon-arrowreturnthick-1-w")
                                .addClass($.jgrid.icons.getClass("searchReset"));
                        } else if ($this.hasClass("ui-icon-comment")) {
                            $this.removeClass("ui-icon ui-icon-comment")
                                .addClass($.jgrid.icons.getClass("searchQuery"));
                        }
                    });
                }).bind("jqGridAddEditBeforeShowForm", function (e, $form) {
                    // alternative to beforeShowForm callback
                    var $dialog = $form.closest(".ui-jqdialog"),
                        $iconSpans = $dialog.find("a.fm-button>span.ui-icon");
                    $iconSpans.each(function () {
                        var $this = $(this);
                        if ($this.hasClass("ui-icon-triangle-1-w")) {
                            $this.removeClass("ui-icon ui-icon-triangle-1-w")
                                .addClass($.jgrid.icons.getClass("formPrev"));
                        } else if ($this.hasClass("ui-icon-triangle-1-e")) {
                            $this.removeClass("ui-icon ui-icon-triangle-1-e")
                                .addClass($.jgrid.icons.getClass("formNext"));
                        } else if ($this.hasClass("ui-icon-disk")) {
							$this.removeClass("ui-icon ui-icon-disk")
								.addClass($.jgrid.icons.getClass("formSave"));
                        } else if ($this.hasClass("ui-icon-close")) {
							$this.removeClass("ui-icon ui-icon-close")
								.addClass($.jgrid.icons.getClass("formUndo"));
                        }
                    });
				}).bind("jqGridViewBeforeShowForm", function (e, $form) {
					var $dialog = $form.closest(".ui-jqdialog"),
						$iconSpans = $dialog.find("a.fm-button>span.ui-icon");
					$iconSpans.each(function () {
						var $this = $(this);
						if ($this.hasClass("ui-icon-triangle-1-w")) {
							$this.removeClass("ui-icon ui-icon-triangle-1-w")
								.addClass($.jgrid.icons.getClass("formPrev"));
						} else if ($this.hasClass("ui-icon-triangle-1-e")) {
							$this.removeClass("ui-icon ui-icon-triangle-1-e")
								.addClass($.jgrid.icons.getClass("formNext"));
						} else if ($this.hasClass("ui-icon-close")) {
							$this.removeClass("ui-icon ui-icon-close")
								.addClass($.jgrid.icons.getClass("close"));
						}
					});
				}).bind("jqGridDeleteBeforeShowForm", function (e, $form) {
					var $dialog = $form.closest(".ui-jqdialog"),
						$tdButtons = $dialog.find(".EditTable .DelButton"),
						$iconSpans = $tdButtons.find(">a.fm-button>span.ui-icon");

					$iconSpans.each(function () {
						var $this = $(this);
						if ($this.hasClass("ui-icon-scissors")) {
							$this.removeClass("ui-icon ui-icon-scissors")
								.addClass($.jgrid.icons.getClass("formDel"));
						} else if ($this.hasClass("ui-icon-cancel")) {
							$this.removeClass("ui-icon ui-icon-cancel")
								.addClass($.jgrid.icons.getClass("formUndo"));
						}
					});
                }).bind("jqGridHeaderClick", function (e, gridstate) {
                    var $icon;
                    if (this.p.fontAwesomeIcons) {
                        $icon = $(this).closest(".ui-jqgrid").find(".ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span");
                        if (gridstate === "visible") {
                            $icon.removeClass("ui-icon ui-icon-circle-triangle-n ui-icon-circle-triangle-s " + $.jgrid.icons.getClass("titleHiddenGrid"))
                                .addClass($.jgrid.icons.getClass("titleVisibleGrid"));
                        } else if (gridstate === "hidden") {
                            $icon.removeClass("ui-icon ui-icon-circle-triangle-n ui-icon-circle-triangle-s " + $.jgrid.icons.getClass("titleVisibleGrid"))
                                .addClass($.jgrid.icons.getClass("titleHiddenGrid"));
                        }
                    }
                }).bind("jqGridInitGrid", function () {
                    var $this = $(this), $pager, $sortables, p = this.p;
					
					if (p.fontAwesomeIcons) {
						$pager = $this.closest(".ui-jqgrid").find(".ui-pg-table");
						$pager.find(".ui-pg-button>span.ui-icon-seek-first")
							.removeClass("ui-icon ui-icon-seek-first")
							.addClass($.jgrid.icons.getClass("pagerFirst"));
						$pager.find(".ui-pg-button>span.ui-icon-seek-prev")
							.removeClass("ui-icon ui-icon-seek-prev")
							.addClass($.jgrid.icons.getClass("pagerPrev"));
						$pager.find(".ui-pg-button>span.ui-icon-seek-next")
							.removeClass("ui-icon ui-icon-seek-next")
							.addClass($.jgrid.icons.getClass("pagerNext"));
						$pager.find(".ui-pg-button>span.ui-icon-seek-end")
							.removeClass("ui-icon ui-icon-seek-end")
							.addClass($.jgrid.icons.getClass("pagerLast"));

						$this.closest(".ui-jqgrid")
							.find(".ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>.ui-icon-circle-triangle-n")
							.removeClass("ui-icon ui-icon-circle-triangle-n")
							.addClass($.jgrid.icons.getClass("titleVisibleGrid"))
							.parent();

						$sortables = $this.closest(".ui-jqgrid")
								.find(".ui-jqgrid-htable .ui-jqgrid-labels .ui-jqgrid-sortable span.s-ico");
						$sortables.find(">span.ui-icon-triangle-1-s")
							.removeClass("ui-icon ui-icon-triangle-1-s")
							.addClass($.jgrid.icons.getClass("sortAsc"));
						$sortables.find(">span.ui-icon-triangle-1-n")
							.removeClass("ui-icon ui-icon-triangle-1-n")
							.addClass($.jgrid.icons.getClass("sortDesc"));
					}
                }).bind("jqGridBeforeInitGrid", function () {
                    var $this = $(this), $pager, $sortables, p = this.p;

					p.fontAwesomeIcons = true;

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
					
					p.actionsNavOptions = $.extend(true, {
						commonIconClass: $.jgrid.icons.getClass("actionCommonIconClass")
					}, p.actionsNavOptions || {});
                });
            });
        }
    });
}(jQuery));
