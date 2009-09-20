;(function($){
/*
**
 * jqGrid addons using jQuery UI 
 * Author: Mark Williams
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * depends on jQuery UI sortable
**/
if ($.browser.msie && $.browser.version==8) {
	$.expr[":"].hidden = function(elem) {
		return elem.offsetWidth === 0 || elem.offsetHeight === 0 ||
			elem.style.display == "none";
	}
}

$.jgrid.extend({
	sortableColumns : function (tblrow)
	{
		return this.each(function (){
			ts = this;
			function start() {ts.p.disableClick = true;};
			var sortable_opts = {
				"tolerance" : "pointer",
				"axis" : "x",
				"items": '>th:not(:has(#jqgh_cb,#jqgh_rn,#jqgh_subgrid),:hidden)',
				"placeholder": {
					element: function(item) {
						var el = $(document.createElement(item[0].nodeName))
						.addClass(item[0].className+" ui-sortable-placeholder ui-state-highlight")
						.removeClass("ui-sortable-helper")[0];
						return el;
					},
					update: function(self, p) {
						p.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop')||0, 10) - parseInt(self.currentItem.css('paddingBottom')||0, 10));
						p.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft')||0, 10) - parseInt(self.currentItem.css('paddingRight')||0, 10));
					}
				},
				"update": function(event, ui) {
					var p = $(ui.item).parent();
					var th = $(">th", p);
					var colModel = ts.p.colModel;
					var cmMap = {};
					$.each(colModel, function(i) { cmMap[this.name]=i });
					var permutation = [];
					th.each(function(i) {
						var id = $(">div", this).get(0).id.replace(/^jqgh_/, "");
							if (id in cmMap) {
								permutation.push(cmMap[id]);
							}
					});
	
					$(ts).jqGrid("remapColumns",permutation, true, true);
					if ($.isFunction(ts.p.sortable.update)) {
						ts.p.sortable.update(permutation);
					}
					setTimeout(function(){ts.p.disableClick=false}, 50);
				}
			};
			if (ts.p.sortable.options) {
				$.extend(sortable_opts, ts.p.sortable.options);
			} else if ($.isFunction(ts.p.sortable)) {
				ts.p.sortable = { "update" : ts.p.sortable };
			}
			if (sortable_opts.start) {
				var s = sortable_opts.start;
				sortable_opts.start = function(e,ui) {
					start();
					s.call(this,e,ui);
				}
			} else {
				sortable_opts.start = start;
			}
			if (ts.p.sortable.exclude) {
				sortable_opts.items += ":not("+ts.p.sortable.exclude+")";
			}
			tblrow.sortable(sortable_opts).data("sortable").floating = true;
		});
	},
    columnChooser : function(opts) {
        var self = this;
        var selector = $('<div style="position:relative;overflow:hidden"><div><select multiple="multiple"></select></div></div>');
        var select = $('select', selector);

        opts = $.extend({
            "title" : "Select columns",
            "width" : 420,
            "height" : 240,
            "classname" : null,
            "done" : function(perm) { if (perm) self.jqGrid("remapColumns", perm, true) },
            "ok" : "Ok",
            "cancel" : "Cancel",
            /* msel is either the name of a ui widget class that
               extends a multiselect, or a function that supports
               creating a multiselect object (with no argument,
               or when passed an object), and destroying it (when
               passed the string "destroy"). */
            "msel" : "multiselect",
            /* "msel_opts" : {}, */

            /* dlog is either the name of a ui widget class that 
               behaves in a dialog-like way, or a function, that
               supports creating a dialog (when passed dlog_opts)
               or destroying a dialog (when passed the string
               "destroy")
               */
            "dlog" : "dialog",

            /* dlog_opts is either an option object to be passed 
               to "dlog", or (more likely) a function that creates
               the options object.
               The default produces a suitable options object for
               ui.dialog */
            "dlog_opts" : function(opts) {
                var buttons = {};
                buttons[opts.ok] = function() {
                    opts.apply_perm();
                    opts.cleanup(false);
                };
                buttons[opts.cancel] = function() {
                    opts.cleanup(true);
                };
                return {
                    "buttons": buttons,
                    "close": function() {
                        opts.cleanup(true);
                    },
                    "resizable": false,
                    "width": opts.width+20
                };
            },
            /* Function to get the permutation array, and pass it to the
               "done" function */
            "apply_perm" : function() {
                $('option',select).each(function(i) {
                    if (this.selected) {
                        self.jqGrid("showCol", colModel[this.value].name);
                    } else {
                        self.jqGrid("hideCol", colModel[this.value].name);
                    }
                });
                
                var perm = fixedCols.slice(0);
                $('option[selected]',select).each(function() { perm.push(parseInt(this.value)) });
                $.each(perm, function() { delete colMap[colModel[this].name] });
                $.each(colMap, function() { perm.push(this) });
                if (opts.done) {
                    opts.done.call(self, perm);
                }
            },
            /* Function to cleanup the dialog, and select. Also calls the
               done function with no permutation (to indicate that the
               columnChooser was aborted */
            "cleanup" : function(calldone) {
                call(opts.dlog, selector, 'destroy');
                call(opts.msel, select, 'destroy');
                selector.remove();
                if (calldone && opts.done) {
                    opts.done.call(self);
                }
            }
        }, opts || {});

        if (opts.title) {
            selector.attr("title", opts.title);
        }
        if (opts.classname) {
            selector.addClass(classname);
            select.addClass(classname);
        }
        if (opts.width) {
            $(">div",selector).css({"width": opts.width,"margin":"0 auto"});
            select.css("width", opts.width);
        }
        if (opts.height) {
            $(">div",selector).css("height", opts.height);
            select.css("height", opts.height - 10);
        }
        var colModel = self.jqGrid("getGridParam", "colModel");
        var colNames = self.jqGrid("getGridParam", "colNames");
        var colMap = {}, fixedCols = [];

        select.empty(); var opt="";
        $.each(colModel, function(i) {
            colMap[this.name] = i;
            if (this.hidedlg) {
                if (!this.hidden) {
                    fixedCols.push(i);
                }
                return;
            }

            if (!this.hidden) {
                select.append("<option value='"+i+"' selected='selected'>"+colNames[i]+"</option>");
            } else {
                opt += "<option value='"+i+"'>"+colNames[i]+"</option>";
            }
        });
        if(opt) select.append(opt);
        function call(fn, obj) {
            if (!fn) return;
            if (typeof fn == 'string') {
                if ($.fn[fn]) {
                    $.fn[fn].apply(obj, $.makeArray(arguments).slice(2));
                }
            } else if ($.isFunction(fn)) {
                fn.apply(obj, $.makeArray(arguments).slice(2));
            }
        }

        var dopts = $.isFunction(opts.dlog_opts) ? opts.dlog_opts.call(self, opts) : opts.dlog_opts;
        call(opts.dlog, selector, dopts);
        var mopts = $.isFunction(opts.msel_opts) ? opts.msel_opts.call(self, opts) : opts.msel_opts;
        call(opts.msel, select, opts.msel_opts);
    }
})
})(jQuery);