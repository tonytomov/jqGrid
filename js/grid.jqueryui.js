;(function($){
/*
**
 * jqGrid addons using jQuery UI 
 * Author: Mark Willams
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
    remapColumns : function(permutation, updateCells, keepHeader)
    {
        /*
          After remapColumns, the column with index i, is the column
          that used to have index permutation[i].

          updateCells can be set to false as an optimization if you're going to refetch
          the data anyway

          keepHeader is really just to optimize "sortable". After sortable runs,
          the headers have already been re-ordered. Rather than put the header back
          where it started, and then move it again, we can simply leave it where
          sortable left it.
          */
        function resortArray(a) {
            var ac;
            if (a.length) {
                ac = $.makeArray(a);
            } else {
                ac = $.extend({}, a);
            }
            $.each(permutation, function(i) {
                a[i] = ac[this];
            });
        }

        var ts = this.get(0);
        function resortRows(parent, clobj) {
            $(">tr"+(clobj||""), parent).each(function() {
                var row = this;
                var elems = $.makeArray(row.cells);
                $.each(permutation, function() {
                    var e = elems[this];
                    if (e) {
                        row.appendChild(e);
                    }
                });
            });
        }

        resortArray(ts.p.colModel);
        resortArray(ts.p.colNames);
        resortArray(ts.grid.headers);

        resortRows($("thead:first", ts.grid.hDiv), keepHeader && ":not(.ui-jqgrid-labels)");

        if (updateCells) {
            resortRows($("tbody:first", ts.grid.bDiv), ".jqgrow");
            if (ts.p.footerrow) {
                resortRows($("tbody:first", ts.grid.sDiv));
            }
        }

        if (ts.p.remapColumns) {
            if (!ts.p.remapColumns.length)
                ts.p.remapColumns = $.makeArray(permutation);
            else
                resortArray(ts.p.remapColumns);
        }
        ts.p.lastsort = $.inArray(ts.p.lastsort, permutation);
        if(ts.p.treeGrid) ts.p.expColInd = $.inArray(ts.p.expColInd, permutation);
    }
})
})(jQuery);