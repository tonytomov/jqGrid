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
        opts = $.extend({
            "title" : "Select columns",
            "width" : 420,
            "height" : 240,
            "classname" : null,
            "done" : function(perm) { if (perm) self.jqGrid("remapColumns", perm) },
            "ok" : "Ok",
            "cancel" : "Cancel"
        }, opts || {});

        var selector = $('<div><select multiple="multiple"></select></div>');
        var select = $('select', selector);
        if (opts.title) {
            selector.attr("title", opts.title);
        }
        if (opts.classname) {
            selector.addClass(classname);
            select.addClass(classname);
        }
        if (opts.width) {
            selector.css("width", opts.width);
            select.css("width", opts.width-20);
        }
        if (opts.height) {
            selector.css("height", opts.height);
            select.css("height", opts.height - 40);
        }
        var colModel = self.jqGrid("getGridParam", "colModel");
        var colNames = self.jqGrid("getGridParam", "colNames");
        var colMap = {}, fixedCols = [];

        select.empty();
        $.each(colModel, function(i) {
            colMap[this.name] = i;
            if (this.name == "cb" || this.name == "rn" || this.name == "subgrid") {
                fixedCols.push(i);
                return;
            }
            if (this.hidedlg) return;

            var opt = "<option value='"+i+"'";
            if (!this.hidden) {
                opt += " selected";
            }
            opt += ">"+colNames[i]+"</option>";
            select.append(opt);
        });

        var buttons = {};
        buttons[opts.ok] = function() {
            $('option',select).each(function(i) {
                if (this.selected) {
                    self.jqGrid("showCol", colModel[this.value].name);
                } else {
                    self.jqGrid("hideCol", colModel[this.value].name);
                }
            });
            
            var perm = fixedCols;
            $('option[selected]',select).each(function() { perm.push(parseInt(this.value)) });
            $.each(perm, function() { delete colMap[colModel[this].name] });
            $.each(colMap, function() { perm.push(this) });

            $(this).dialog("close");
            if (opts.done) {
                opts.done.call(self, perm);
            }
        };
        buttons[opts.cancel] = function() {
            $(this).dialog("close");
        };
        var dopts = {
            "buttons": buttons,
            "close": function() {
                select.multiselect('destroy');
                $(this).dialog("destroy");
                if (opts.done) {
                    opts.done.call(self, null);
                }
            },
            "resizable": false,
            "width": opts.width+20
        };

        $(selector).dialog(dopts);
        if ($.fn.multiselect) {
            select.multiselect();
        }
    }
})
})(jQuery);