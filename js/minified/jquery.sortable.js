!function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)}(function(s){var d,o=s();s.fn.html5sortable=function(r){var t=String(r);return r=s.extend({connectWith:!1},r),this.each(function(){var e,n,a,i;/^enable|disable|destroy$/.test(t)?(a=s(this).children(s(this).data("items")).attr("draggable","enable"===t),"destroy"===t&&a.add(this).removeData("connectWith items").off("dragstart.h5s dragend.h5s selectstart.h5s dragover.h5s dragenter.h5s drop.h5s")):(a=s(this).children(r.items),i=s("<"+(/^ul|ol$/i.test(this.tagName)?"li":/^tbody$/i.test(this.tagName)?"tr":"div")+' class="sortable-placeholder '+r.placeholderClass+'">').html("&nbsp;"),a.find(r.handle).mousedown(function(){e=!0}).mouseup(function(){e=!1}),s(this).data("items",r.items),o=o.add(i),r.connectWith&&s(r.connectWith).add(this).data("connectWith",r.connectWith),a.attr("draggable","true").on("dragstart.h5s",function(t){if(r.handle&&!e)return!1;e=!1;t=t.originalEvent.dataTransfer;t.effectAllowed="move",t.setData("Text","dummy"),n=(d=s(this)).addClass("sortable-dragging").index()}).on("dragend.h5s",function(){d&&(d.removeClass("sortable-dragging").show(),o.detach(),n!==d.index()&&d.parent().trigger("sortupdate",{item:d,startindex:n,endindex:d.index()}),d=null)}).not("a[href], img").on("selectstart.h5s",function(){return this.dragDrop&&this.dragDrop(),!1}).end().add([this,i]).on("dragover.h5s dragenter.h5s drop.h5s",function(t){return!a.is(d)&&r.connectWith!==s(d).parent().data("connectWith")||("drop"===t.type?(t.stopPropagation(),o.filter(":visible").after(d),d.trigger("dragend.h5s")):(t.preventDefault(),t.originalEvent.dataTransfer.dropEffect="move",a.is(this)?(r.forcePlaceholderSize&&i.height(d.outerHeight()),d.hide(),s(this)[i.index()<s(this).index()?"after":"before"](i),o.not(i).detach()):o.is(this)||s(this).children(r.items).length||(o.detach(),s(this).append(i))),!1)}))})}});