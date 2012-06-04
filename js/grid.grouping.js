// Grouping module
;(function($){
"use strict";
$.extend($.jgrid,{
	template : function(format){ //jqgformat
		var args = $.makeArray(arguments).slice(1), j = 0;
		if(format===undefined) { format = ""; }
		return format.replace(/\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g, function(m,i){
			if(!isNaN(parseInt(i,10))) {
				j++;
				return args[parseInt(i,10)];
			} else {
				var nmarr = args[ j ],
				k = nmarr.length;
				while(k--) {
					if(i===nmarr[k].nm) {
						return nmarr[k].v;
						break;
					}
				}
				j++;
			}
		});
	}
});
$.jgrid.extend({
	groupingSetup : function () {
		return this.each(function (){
			var $t = this,
			grp = $t.p.groupingView;
			if(grp !== null && ( (typeof grp === 'object') || $.isFunction(grp) ) ) {
				if(!grp.groupField.length) {
					$t.p.grouping = false;
				} else {
					if ( typeof(grp.visibiltyOnNextGrouping) === 'undefined') {
						grp.visibiltyOnNextGrouping = [];
					}

					grp.lastvalues=[];
					grp.groups =[];
					grp.counters =[];
					for(var i=0;i<grp.groupField.length;i++) {
						if(!grp.groupOrder[i]) {
							grp.groupOrder[i] = 'asc';
						}
						if(!grp.groupText[i]) {
							grp.groupText[i] = '{0} and {test}';
						}
						if( typeof(grp.groupColumnShow[i]) !== 'boolean') {
							grp.groupColumnShow[i] = true;
						}
						if( typeof(grp.groupSummary[i]) !== 'boolean') {
							grp.groupSummary[i] = false;
						}
						if(grp.groupColumnShow[i] === true) {
							grp.visibiltyOnNextGrouping[i] = true;
							$($t).jqGrid('showCol',grp.groupField[i]);
						} else {
							grp.visibiltyOnNextGrouping[i] = $("#"+$.jgrid.jqID($t.p.id+"_"+grp.groupField[i])).is(":visible");
							$($t).jqGrid('hideCol',grp.groupField[i]);
						}
						grp.summary =[];
						if(grp.groupSummary[i]) {
							var cm = $t.p.colModel;
							for(var j=0, cml = cm.length; j < cml; j++) {
								if(cm[j].summaryType) {
									grp.summary.push({nm:cm[j].name,st:cm[j].summaryType, v: '' });
								}
							}
						}
					}
				}
			} else {
				$t.p.grouping = false;
			}
		});
	},
	groupingPrepare : function (rData, gdata, record, irow) {
		this.each(function(){
			var grp = this.p.groupingView, $t= this;
			var grlen = grp.groupField.length, 
			fieldName,
			v,
			changed = 0;
			for(var i=0;i<grlen;i++) {
				fieldName = grp.groupField[i];
				v = record[fieldName];
				if( v ) {
					if(irow === 0 ) {
						// First record always starts a new group
						grp.groups.push({idx:i,dataIndex:fieldName,value:v, startRow: irow, cnt:1, summary : [] } );
						grp.lastvalues[i] = v;
						grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
						$.each(grp.counters[i].summary,function() {
							if ($.isFunction(this.st)) {
								this.v = this.st.call($t, this.v, this.nm, record);
							} else {
								this.v = $($t).jqGrid('groupingCalculations.'+this.st, this.v, this.nm, record);
							}
						});
						grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;
					} else {
						if( (typeof(v) !== "object" && (grp.lastvalues[i] !== v) ) ) {
							// This record is not in same group as previous one
							grp.groups.push({idx:i,dataIndex:fieldName,value:v, startRow: irow, cnt:1, summary : [] } );
							grp.lastvalues[i] = v;
							changed = 1;
							grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
							$.each(grp.counters[i].summary,function() {
								if ($.isFunction(this.st)) {
									this.v = this.st.call($t, this.v, this.nm, record);
								} else {
									this.v = $($t).jqGrid('groupingCalculations.'+this.st, this.v, this.nm, record);
								}
							});
							grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;
						} else {
							if (changed === 1) {
								// This group has changed because an earlier group changed.
								grp.groups.push({idx:i,dataIndex:fieldName,value:v, startRow: irow, cnt:1, summary : [] } );
								grp.lastvalues[i] = v;
								grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
								$.each(grp.counters[i].summary,function() {
									if ($.isFunction(this.st)) {
										this.v = this.st.call($t, this.v, this.nm, record);
									} else {
										this.v = $($t).jqGrid('groupingCalculations.'+this.st, this.v, this.nm, record);
									}
								});
								grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;
							} else {
								grp.counters[i].cnt += 1;
								grp.groups[grp.counters[i].pos].cnt = grp.counters[i].cnt;
								if(grp.groupSummary[i]) {
									$.each(grp.counters[i].summary,function() {
										if ($.isFunction(this.st)) {
											this.v = this.st.call($t, this.v, this.nm, record);
										} else {
											this.v = $($t).jqGrid('groupingCalculations.'+this.st, this.v, this.nm, record);
										}
									});
									grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;
								}
							}
						}
					}
				}
			}
			gdata.push( rData );
		});
		return gdata;
	},
	groupingToggle : function(hid){
		this.each(function(){
			var $t = this,
			grp = $t.p.groupingView,
			strpos = hid.lastIndexOf('_'),
			uid = hid.substring(0,strpos+1),
			num = parseInt(hid.substring(strpos+1),10)+1,
			minus = grp.minusicon,
			plus = grp.plusicon,
			tar = $("#"+$.jgrid.jqID(hid)),
			r = tar.length ? tar[0].nextSibling : null,
			tarspan = $("#"+$.jgrid.jqID(hid)+" span."+"tree-wrap-"+$t.p.direction),
			collapsed = false;
			if( tarspan.hasClass(minus) ) {
				if(grp.showSummaryOnHide && grp.groupSummary[0]) {
					if(r){
						while(r) {
							if($(r).hasClass('jqfoot') ) { break; }
							$(r).hide();
							r = r.nextSibling;
						}
					}
				} else  {
					if(r){
						while(r) {
							if($(r).attr('id') ==uid+String(num) ) { break; }
							$(r).hide();
							r = r.nextSibling;
						}
					}
				}
				tarspan.removeClass(minus).addClass(plus);
				collapsed = true;
			} else {
				if(r){
					while(r) {
						if($(r).attr('id') ==uid+String(num) ) { break; }
						$(r).show();
						r = r.nextSibling;
					}
				}
				tarspan.removeClass(plus).addClass(minus);
			}
			$($t).triggerHandler("jqGridGroupingClickGroup", [hid , collapsed]);
			if( $.isFunction($t.p.onClickGroup)) { $t.p.onClickGroup.call($t, hid , collapsed); }

		});
		return false;
	},
	groupingRender : function (grdata, colspans ) {
		return this.each(function(){
			var $t = this,
			grp = $t.p.groupingView,
			str = "", icon = "", hid, pmrtl = grp.groupCollapse ? grp.plusicon : grp.minusicon, gv, cp, ii;
			//only one level for now
			if(!grp.groupDataSorted) {
				// ???? TO BE IMPROVED
				grp.sortitems[0].sort();
				grp.sortnames[0].sort();
				if(grp.groupOrder[0].toLowerCase() == 'desc')
				{
					grp.sortitems[0].reverse();
					grp.sortnames[0].reverse();
				}
			}   
			pmrtl += " tree-wrap-"+$t.p.direction; 
			ii = 0;
			while(ii < colspans) {
				if($t.p.colModel[ii].name == grp.groupField[0]) {
					cp = ii;
					break;
				}
				ii++;
			}
			$.each(grp.sortitems[0],function(i,n){
				hid = $t.p.id+"ghead_"+i;
				icon = "<span style='cursor:pointer;' class='ui-icon "+pmrtl+"' onclick=\"jQuery('#"+$.jgrid.jqID($t.p.id)+"').jqGrid('groupingToggle','"+hid+"');return false;\"></span>";
				try {
					gv = $t.formatter(hid, grp.sortnames[0][i], cp, grp.sortitems[0] );
				} catch (egv) {
					gv = grp.sortnames[0][i];
				}
				str += "<tr id=\""+hid+"\" role=\"row\" class= \"ui-widget-content jqgroup ui-row-"+$t.p.direction+"\"><td colspan=\""+colspans+"\">"+icon+$.jgrid.format(grp.groupText[0], gv, grdata[n].length)+"</td></tr>";
				for(var kk=0;kk<grdata[n].length;kk++) {
					str += grdata[n][kk].join('');
				}
				if(grp.groupSummary[0]) {
					var hhdr = "";
					if(grp.groupCollapse && !grp.showSummaryOnHide) {
						hhdr = " style=\"display:none;\"";
					}
					str += "<tr"+hhdr+" role=\"row\" class=\"ui-widget-content jqfoot ui-row-"+$t.p.direction+"\">";
					var fdata = grp.summaryval[0][n],
					cm = $t.p.colModel,
					vv, grlen = grdata[n].length;
					for(var k=0; k<colspans;k++) {
						var tmpdata = "<td "+$t.formatCol(k,1,'')+">&#160;</td>",
						tplfld = "{0}";
						$.each(fdata,function(){
							if(this.nm == cm[k].name) {
								if(cm[k].summaryTpl)  {
									tplfld = cm[k].summaryTpl;
								}
								if(this.st == 'avg') {
									if(this.v && grlen > 0) {
										this.v = (this.v/grlen);
									}
								}
								try {
									vv = $t.formatter('', this.v, k, this);
								} catch (ef) {
									vv = this.v;
								}
								tmpdata= "<td "+$t.formatCol(k,1,'')+">"+$.jgrid.format(tplfld,vv)+ "</td>";
								return false;
							}
						});
						str += tmpdata;
					}
					str += "</tr>";
				}
			});
			$("#"+$.jgrid.jqID($t.p.id)+" tbody:first").append(str);
			// free up memory
			str = null;
		});
	},
	groupingGroupBy : function (name, options ) {
		return this.each(function(){
			var $t = this;
			if(typeof(name) == "string") {
				name = [name];
			}
			var grp = $t.p.groupingView;
			$t.p.grouping = true;

			//Set default, in case visibilityOnNextGrouping is undefined 
			if (typeof grp.visibiltyOnNextGrouping == "undefined") {
				grp.visibiltyOnNextGrouping = [];
			}
			var i;
			// show previous hidden groups if they are hidden and weren't removed yet
			for(i=0;i<grp.groupField.length;i++) {
				if(!grp.groupColumnShow[i] && grp.visibiltyOnNextGrouping[i]) {
				$($t).jqGrid('showCol',grp.groupField[i]);
				}
			}
			// set visibility status of current group columns on next grouping
			for(i=0;i<name.length;i++) {
				grp.visibiltyOnNextGrouping[i] = $("#"+$.jgrid.jqID($t.p.id)+"_"+$.jgrid.jqID(name[i])).is(":visible");
			}
			$t.p.groupingView = $.extend($t.p.groupingView, options || {});
			grp.groupField = name;
			$($t).trigger("reloadGrid");
		});
	},
	groupingRemove : function (current) {
		return this.each(function(){
			var $t = this;
			if(typeof(current) == 'undefined') {
				current = true;
			}
			$t.p.grouping = false;
			if(current===true) {
				var grp = $t.p.groupingView;
				// show previous hidden groups if they are hidden and weren't removed yet
				for(var i=0;i<grp.groupField.length;i++) {
				if (!grp.groupColumnShow[i] && grp.visibiltyOnNextGrouping[i]) {
						$($t).jqGrid('showCol', grp.groupField);
					}
				}
				$("tr.jqgroup, tr.jqfoot","#"+$.jgrid.jqID($t.p.id)+" tbody:first").remove();
				$("tr.jqgrow:hidden","#"+$.jgrid.jqID($t.p.id)+" tbody:first").show();
			} else {
				$($t).trigger("reloadGrid");
			}
		});
	},
	groupingCalculations : {
		"sum" : function(v, field, rc) {
			return parseFloat(v||0) + parseFloat((rc[field]||0));
		},
		"min" : function(v, field, rc) {
			if(v==="") {
				return parseFloat(rc[field]||0);
			}
			return Math.min(parseFloat(v),parseFloat(rc[field]||0));
		},
		"max" : function(v, field, rc) {
			if(v==="") {
				return parseFloat(rc[field]||0);
			}
			return Math.max(parseFloat(v),parseFloat(rc[field]||0));
		},
		"count" : function(v, field, rc) {
			if(v==="") {v=0;}
			if(rc.hasOwnProperty(field)) {
				return v+1;
			} else {
				return 0;
			}
		},
		"avg" : function(v, field, rc) {
			// the same as sum, but at end we divide it
			return parseFloat(v||0) + parseFloat((rc[field]||0));
		}
	}
});
})(jQuery);
