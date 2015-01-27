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
            titleButton: "ui-corner-all fa-title",
            close: "fa-times",
            sortAsc: "fa-sort-asc fa-lg",
            sortDesc: "fa-sort-desc fa-lg",
            navEdit: "fa-pencil fa-fw",
            navAdd: "fa-plus fa-fw",
            navDel: "fa-trash-o fa-fw",
            navSearch: "fa-search fa-fw",
            navRefresh: "fa-refresh fa-fw",
            navView: "fa-file-o fa-fw",
			navSave: "fa-floppy-o fa-fw",
			navCancel: "fa-ban fa-fw",
			actionEdit: "fa-fw ui-state-default fa-pencil",
			actionDel: "fa-fw ui-state-default fa-trash-o",
			actionSave: "fa-fw ui-state-default fa-floppy-o",
			actionCancel: "fa-fw ui-state-default fa-ban",
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

	$.jgrid.defaults = $.jgrid.defaults || {};
    $.extend(true, $.jgrid.defaults, {
        fontAwesomeIcons: true // the new option will be used in callbacks
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
                        var $this = $(this), $fmButton = $this.parent();
                        $this.removeClass("ui-icon");
                        if ($this.hasClass("ui-icon-search")) {
							if ($fmButton.hasClass("fm-button-icon-right")) {
								$fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("searchSearch") + "\"></span>");
							} else {
								$fmButton.html("<span class=\"" + $.jgrid.icons.getClass("searchSearch") + "\"></span><span>" + $fmButton.text() + "</span>");
							}
                        } else if ($this.hasClass("ui-icon-arrowreturnthick-1-w")) {
							if ($fmButton.hasClass("fm-button-icon-right")) {
								$fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("searchReset") + "\"></span>");
							} else {
								$fmButton.html("<span class=\"" + $.jgrid.icons.getClass("searchReset") + "\"></span><span>" + $fmButton.text() + "</span>");
							}
                        } else if ($this.hasClass("ui-icon-comment")) {
							if ($fmButton.hasClass("fm-button-icon-right")) {
								$fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("searchQuery") + "\"></span>");
							} else {
								$fmButton.html("<span class=\"" + $.jgrid.icons.getClass("searchQuery") + "\"></span><span>" + $fmButton.text() + "</span>");
							}
                        }
                    });
                }).bind("jqGridAddEditBeforeShowForm", function (e, $form) {
                    // alternative to beforeShowForm callback
                    var $dialog = $form.closest(".ui-jqdialog"),
                        $iconSpans = $dialog.find("a.fm-button>span.ui-icon");
                    $iconSpans.each(function () {
                        var $this = $(this), $fmButton = $this.parent();
                        if ($this.hasClass("ui-icon-triangle-1-w")) {
                            $this.removeClass("ui-icon ui-icon-triangle-1-w")
                                .addClass($.jgrid.icons.getClass("formPrev"));
                        } else if ($this.hasClass("ui-icon-triangle-1-e")) {
                            $this.removeClass("ui-icon ui-icon-triangle-1-e")
                                .addClass($.jgrid.icons.getClass("formNext"));
                        } else if ($this.hasClass("ui-icon-disk")) {
                            //$this.closest(".EditButton").css("float", "right");
                            if ($fmButton.hasClass("fm-button-icon-right")) {
                                $fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("formSave") + "\"></span>");
                            } else {
                                $fmButton.html("<span class=\"" + $.jgrid.icons.getClass("formSave") + "\"></span><span>" + $fmButton.text() + "</span>");
                            }
                        } else if ($this.hasClass("ui-icon-close")) {
                            //$this.closest(".EditButton").css("float", "right");
                            if ($fmButton.hasClass("fm-button-icon-right")) {
                                $fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("formUndo") + "\"></span>");
                            } else {
                                $fmButton.html("<span class=\"" + $.jgrid.icons.getClass("formUndo") + "\"></span><span>" + $fmButton.text() + "</span>");
                            }
                        }
                    });
				}).bind("jqGridViewBeforeShowForm", function (e, $form) {
					var $dialog = $form.closest(".ui-jqdialog"),
						$iconSpans = $dialog.find("a.fm-button>span.ui-icon");
					$iconSpans.each(function () {
						var $this = $(this), $fmButton = $this.parent();
						if ($this.hasClass("ui-icon-triangle-1-w")) {
							$this.removeClass("ui-icon ui-icon-triangle-1-w")
								.addClass($.jgrid.icons.getClass("formPrev"));
						} else if ($this.hasClass("ui-icon-triangle-1-e")) {
							$this.removeClass("ui-icon ui-icon-triangle-1-e")
								.addClass($.jgrid.icons.getClass("formNext"));
						} else if ($this.hasClass("ui-icon-close")) {
							if ($fmButton.hasClass("fm-button-icon-right")) {
								$fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("close") + "\"></span>");
							} else {
								$fmButton.html("<span class=\"" + $.jgrid.icons.getClass("close") + "\"></span><span>" + $fmButton.text() + "</span>");
							}
						}
					});
				}).bind("jqGridDeleteBeforeShowForm", function (e, $form) {
					var $dialog = $form.closest(".ui-jqdialog"),
						$tdButtons = $dialog.find(".EditTable .DelButton"),
						$fmButtonNew = $("<td class=\"DelButton EditButton\" style=\"float: right;\">"),
						$iconSpans = $tdButtons.find(">a.fm-button>span.ui-icon");

					$tdButtons.css("float", "right");
					$iconSpans.each(function () {
						var $this = $(this), $fmButton = $this.parent();
						if ($this.hasClass("ui-icon-scissors")) {
							$fmButton.html("<span class=\"" + $.jgrid.icons.getClass("formDel") + "\"></span><span>" + $fmButton.text() + "</span>");
							$fmButtonNew.append($fmButton);
						} else if ($this.hasClass("ui-icon-cancel")) {
							$fmButton.html("<span class=\"" + $.jgrid.icons.getClass("formUndo") + "\"></span><span>" + $fmButton.text() + "</span>");
							$fmButtonNew.append($fmButton);
						}
					});
					if ($fmButtonNew.children().length > 0) {
						// remove &nbsp; between buttons
						$tdButtons.replaceWith($fmButtonNew);
					}
                }).bind("jqGridHeaderClick", function (e, gridstate) {
                    var $icon;
                    if (this.p.fontAwesomeIcons) {
                        $icon = $(this).closest(".ui-jqgrid").find(".ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span");
                        if (gridstate === "visible") {
                            $icon.removeClass("ui-icon ui-icon-circle-triangle-n ui-icon-circle-triangle-s " + $.jgrid.icons.getClass("titleHiddenGrid"))
                                .addClass($.jgrid.icons.getClass("titleVisibleGrid")).parent().addClass($.jgrid.icons.getClass("titleButton"));
                        } else if (gridstate === "hidden") {
                            $icon.removeClass("ui-icon ui-icon-circle-triangle-n ui-icon-circle-triangle-s " + $.jgrid.icons.getClass("titleVisibleGrid"))
                                .addClass($.jgrid.icons.getClass("titleHiddenGrid")).parent().addClass($.jgrid.icons.getClass("titleButton"));
                        }
                    }
                }).bind("jqGridLoadComplete jqGridAfterInsertRow", function () {
                    var $this = $(this);
                    $this.find(">tbody>.jqgrow>td div.ui-inline-edit").html("<span class=\"" + $.jgrid.icons.getClass("actionEdit") + "\"></span>");
                    $this.find(">tbody>.jqgrow>td div.ui-inline-del").html("<span class=\"" + $.jgrid.icons.getClass("actionDel") + "\"></span>");
                    $this.find(">tbody>.jqgrow>td div.ui-inline-save").html("<span class=\"" + $.jgrid.icons.getClass("actionSave") + "\"></span>");
                    $this.find(">tbody>.jqgrow>td div.ui-inline-cancel").html("<span class=\"" + $.jgrid.icons.getClass("actionCancel") + "\"></span>");
                }).bind("jqGridInitGrid", function () {
                    var $this = $(this), $pager, $sortables, p = this.p;
                    
                    $this.closest(".ui-jqgrid-view")
                        .find(">.ui-jqgrid-toppager")
                        .removeClass("ui-state-default")
                        .addClass("ui-widget-content")
                        .find(">.ui-pager-control")
                        .addClass("ui-state-default");

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
                            //.addClass("ui-corner-all " + $.jgrid.icons.getClass("titleButton"))
                            //.css({right: ""}); // ovewrite "right: 0px;" which set jqGrid currently

                        $sortables = $this.closest(".ui-jqgrid")
                                .find(".ui-jqgrid-htable .ui-jqgrid-labels .ui-jqgrid-sortable span.s-ico");
                        $sortables.find(">span.ui-icon-triangle-1-s")
                            .removeClass("ui-icon ui-icon-triangle-1-s")
                            .addClass($.jgrid.icons.getClass("sortAsc"));
                        $sortables.find(">span.ui-icon-triangle-1-n")
                            .removeClass("ui-icon ui-icon-triangle-1-n")
                            .addClass($.jgrid.icons.getClass("sortDesc"));

						if (p.subGrid) {
							p.subGridOptions = p.subGridOptions || {};
							p.subGridOptions.commonIconClass = $.jgrid.icons.getClass("subgridCommonIconClass");
							p.subGridOptions.plusicon = $.jgrid.icons.getClass("subgridPlus");   //"ui-icon-plus";
							p.subGridOptions.minusicon = $.jgrid.icons.getClass("subgridMinus"); //"ui-icon-minus";
							p.subGridOptions.openicon = $.jgrid.icons.getClass("subgridOpen" + p.direction);   //"ui-icon-carat-1-sw";
						}
						
						p.navOptions = p.navOptions || {};
						$.extend(true, p.navOptions, {
							editicon: $.jgrid.icons.getClass("navEdit"),
							addicon: $.jgrid.icons.getClass("navAdd"),
							delicon: $.jgrid.icons.getClass("navDel"),
							saveicon: $.jgrid.icons.getClass("navSave"),
							cancelicon: $.jgrid.icons.getClass("navCancel"),
							searchicon: $.jgrid.icons.getClass("navSearch"),
							refreshicon: $.jgrid.icons.getClass("navRefresh"),
							viewicon: $.jgrid.icons.getClass("navView"),
							commonIconClass: ""
						});
                    }
                });
            });
        }
    });
}(jQuery));
