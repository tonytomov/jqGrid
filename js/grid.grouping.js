/*jshint eqeqeq:false, eqnull:true */
/*global jQuery, define */
// Grouping module
(function( factory ) {
	"use strict";
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./grid.base"
		], factory );
	} else {
		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
"use strict";
//module begin
$.jgrid.extend({
	groupingInit : function () {
		return this.each(function (){
			var $t = this;
			$.extend ($t.p.groupingView, {
				groupField :[],
				groupOrder:[],
				groupText:[],
				groupColumnShow:[],
				groupSummary:[],
				showSummaryOnHide: false,
				sortitems:[],
				sortnames:[],
				summary:[],
				summaryval:[],
				plusicon: '',
				minusicon: '',
				displayField: [],
				groupSummaryPos:[],
				formatDisplayField : [],
				prepareGroupField : null,
				groupRowNumbers : false,
				_locgr : false
			}, true);
		});
	},
	groupingSetup : function () {
		return this.each(function (){
			var $t = this, i, j, cml, cm = $t.p.colModel, grp = $t.p.groupingView,
			classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].grouping;
			if(grp !== null && ( (typeof grp === 'object') || $.jgrid.isFunction(grp) ) ) {
				if(!grp.plusicon) { grp.plusicon = classes.icon_plus;}
				if(!grp.minusicon) { grp.minusicon = classes.icon_minus;}
				if(!grp.groupField.length) {
					$t.p.grouping = false;
				} else {
					if (grp.visibiltyOnNextGrouping === undefined) {
						grp.visibiltyOnNextGrouping = [];
					}

					grp.lastvalues=[];
					if(!grp._locgr) {
						grp.groups =[];
					}
					grp.counters =[];
					for(i=0;i<grp.groupField.length;i++) {
						if(!grp.groupOrder[i]) {
							grp.groupOrder[i] = 'asc';
						}
						if(!grp.groupText[i]) {
							grp.groupText[i] = '{0}';
						}
						if( typeof grp.groupColumnShow[i] !== 'boolean') {
							grp.groupColumnShow[i] = true;
						}
						if( typeof grp.groupSummary[i] !== 'boolean') {
							grp.groupSummary[i] = false;
						}
						if( !grp.groupSummaryPos[i]) {
							grp.groupSummaryPos[i] = 'footer';
						}
						let vi = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', grp.groupField[i], false).hidden;
						if(grp.groupColumnShow[i] === true) {
							grp.visibiltyOnNextGrouping[i] = true;
							if(vi) {
								$($t).jqGrid('showCol',grp.groupField[i]);
							}
						} else {
							grp.visibiltyOnNextGrouping[i] = $("#"+$.jgrid.jqID($t.p.id+"_"+grp.groupField[i])).is(":visible");
							if(!vi) {
								$($t).jqGrid('hideCol',grp.groupField[i]);
							}
						}
					}
					grp.summary =[];
					if(grp.hideFirstGroupCol) {
						if(Array.isArray(grp.formatDisplayField) && !$.jgrid.isFunction(grp.formatDisplayField[0] ) ) {
							grp.formatDisplayField[0] = function (v) { return v;};
						}
					}
					for(j=0, cml = cm.length; j < cml; j++) {
						if(grp.hideFirstGroupCol) {
							if(!cm[j].hidden && grp.groupField[0] === cm[j].name) {
								cm[j].formatter = function(){return '';};
							}
						}
						if(cm[j].summaryType ) {
							if(cm[j].summaryDivider) {
								grp.summary.push({nm:cm[j].name,st:cm[j].summaryType, v: '', sd:cm[j].summaryDivider, vd:'', sr: cm[j].summaryRound, srt: cm[j].summaryRoundType || 'round'});
							} else {
								grp.summary.push({nm:cm[j].name,st:cm[j].summaryType, v: '', sr: cm[j].summaryRound, srt: cm[j].summaryRoundType || 'round'});
							}
						}
					}
				}
			} else {
				$t.p.grouping = false;
			}
		});
	},
	groupingPrepare : function ( record, irow ) {
		this.each(function(){
			var grp = this.p.groupingView, $t= this, i,
			sumGroups = function() {
				if ($.jgrid.isFunction(this.st)) {
					this.v = this.st.call($t, this.v, this.nm, record);
				} else {
					this.v = $($t).jqGrid('groupingCalculations.handler',this.st, this.v, this.nm, this.sr, this.srt, record);
					if(this.st.toLowerCase() === 'avg' && this.sd) {
						this.vd = $($t).jqGrid('groupingCalculations.handler',this.st, this.vd, this.sd, this.sr, this.srt, record);
					}
				}
			},
			grlen = grp.groupField.length, 
			formatVal = $.jgrid.isFunction(grp.prepareGroupField),
			fieldName,
			v,
			displayName,
			displayValue,
			changed = 0;
			for(i=0;i<grlen;i++) {
				fieldName = grp.groupField[i];
				displayName = grp.displayField[i];
				v = record[fieldName];
				displayValue = displayName == null ? null : record[displayName];
				if( formatVal ) {
					v = grp.prepareGroupField(v, fieldName, record);
				}
				if( displayValue == null ) {
					displayValue = v;
				}
				if( v !== undefined ) {
					if(irow === 0 ) {
						// First record always starts a new group
						grp.groups.push({idx:i,dataIndex:fieldName,value:v, displayValue: displayValue, startRow: irow, cnt:1, summary : [] } );
						grp.lastvalues[i] = v;
						grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
					} else {
						if (typeof v !== "object" && (Array.isArray(grp.isInTheSameGroup) && $.jgrid.isFunction(grp.isInTheSameGroup[i]) ? ! grp.isInTheSameGroup[i].call($t, grp.lastvalues[i], v, i, grp): grp.lastvalues[i] !== v)) {
							// This record is not in same group as previous one
							grp.groups.push({idx:i,dataIndex:fieldName,value:v, displayValue: displayValue, startRow: irow, cnt:1, summary : [] } );
							grp.lastvalues[i] = v;
							changed = 1;
							grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
						} else {
							if (changed === 1) {
								// This group has changed because an earlier group changed.
								grp.groups.push({idx:i,dataIndex:fieldName,value:v, displayValue: displayValue, startRow: irow, cnt:1, summary : [] } );
								grp.lastvalues[i] = v;
								grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
							} else {
								grp.counters[i].cnt += 1;
								grp.groups[grp.counters[i].pos].cnt = grp.counters[i].cnt;
							}
						}
					}
					$.each(grp.counters[i].summary, sumGroups);
					grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;					
				}
			}
			//gdata.push( rData );
		});
		return this;
	},
	groupingToggle : function(hid){
		this.each(function(){
			var $t = this,
			grp = $t.p.groupingView,
			strpos = hid.split('_'),
			num = parseInt(strpos[strpos.length-2], 10);
			strpos.splice(strpos.length-2,2);
			var uid = strpos.join("_"),
			minus = grp.minusicon,
			plus = grp.plusicon,
			tar = $("#"+$.jgrid.jqID(hid)),
			r = tar.length ? tar[0].nextSibling : null,
			tarspan = $("#"+$.jgrid.jqID(hid)+" span."+"tree-wrap-"+$t.p.direction),
			getGroupingLevelFromClass = function (className) {
				var nums = $.map(className.split(" "), function (item) {
					if (item.substring(0, uid.length + 1) === uid + "_") {
						return parseInt(item.substring(uid.length + 1), 10);
					}
				});
				return nums.length > 0 ? nums[0] : undefined;
			},
			itemGroupingLevel,
			showData,
			collapsed = false,
			footLevel,
			skip = false;
			if( tarspan.hasClass(minus) ) {
				if(r){
					while(r) {
						itemGroupingLevel = getGroupingLevelFromClass(r.className);
						if (itemGroupingLevel !== undefined && itemGroupingLevel <= num) {
							break;
						}
						footLevel = parseInt($(r).attr("jqfootlevel") ,10);
						skip = isNaN(footLevel) ? false : 
						 (grp.showSummaryOnHide && footLevel <= num);
						if( !skip) {
							$(r).hide();
						}
						r = r.nextSibling;
					}
				}
				tarspan.removeClass(minus).addClass(plus);
				collapsed = true;
			} else {
				if(r){
					showData = undefined;
					while(r) {
						itemGroupingLevel = getGroupingLevelFromClass(r.className);
						footLevel = parseInt($(r).attr("jqfootlevel") ,10);
						if (showData === undefined) {
							showData = itemGroupingLevel === undefined; // if the first row after the opening group is data row then show the data rows
						}
						skip = $(r).hasClass("ui-subgrid") && $(r).hasClass("ui-sg-collapsed");
						if (itemGroupingLevel !== undefined) {
							if (itemGroupingLevel <= num) {
								break;// next item of the same lever are found
							}
							if (itemGroupingLevel === num + 1) {
								if(!skip) {
									$(r).show().find(">td>span."+"tree-wrap-"+$t.p.direction).removeClass(minus).addClass(plus);
								}
							}
						} else if (showData) {
							if(!skip) {
								$(r).show();
							}
						} else if(!isNaN(footLevel) &&  footLevel >=0 &&  footLevel === num) {
								$(r).show();
						}
						r = r.nextSibling;
					}
				}
				tarspan.removeClass(plus).addClass(minus);
			}
			$($t).triggerHandler("jqGridGroupingClickGroup", [hid , collapsed]);
			if( $.jgrid.isFunction($t.p.onClickGroup)) { $t.p.onClickGroup.call($t, hid , collapsed); }

		});
		return false;
	},
	groupingRender : function (grdata, colspans, page, rn ) {
		return this.each(function(){
			var $t = this,
			grp = $t.p.groupingView, crn = $t.p.rownumbers && grp.groupRowNumbers,
			str = "", icon = "", hid, clid, pmrtl = grp.groupCollapse ? grp.plusicon : grp.minusicon, gv, cp=[], len =grp.groupField.length,
			//classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')]['grouping'],
			common = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')].common;

			pmrtl = pmrtl+" tree-wrap-"+$t.p.direction; 
			$.each($t.p.colModel, function (i,n){
				var ii;
				for(ii=0;ii<len;ii++) {
					if(grp.groupField[ii] === n.name ) {
						cp[ii] = i;
						break;
					}
				}
			});
			var toEnd = 0;
			function findGroupIdx( ind , offset, grp) {
				var ret = false, i;
				if(offset===0) {
					ret = grp[ind];
				} else {
					var id = grp[ind].idx;
					if(id===0) { 
						ret = grp[ind]; 
					}  else {
						for(i=ind;i >= 0; i--) {
							if(grp[i].idx === id-offset) {
								ret = grp[i];
								break;
							}
						}
					}
				}
				return ret;
			}
			function buildSummaryTd(i, ik, grp, foffset, fstr) {
				var fdata = findGroupIdx(i, ik, grp),
				cm = $t.p.colModel,
				vv, str="", k , isput = false, tmpdata, tplfld;
				for(k=foffset; k<colspans;k++) {
					if(cm[k].hidden ) {
						tmpdata = "<td role=\"gridcell\" "+$t.formatCol(k,1,'')+">&#160;</td>";
					} else if(!isput && fstr) {
						tmpdata = fstr;
						isput = true;
					} else {
						tmpdata = "<td role=\"gridcell\" "+$t.formatCol(k,1,'')+">&#160;</td>";
					}
					$.each(fdata.summary,function(){
						if(this.nm === cm[k].name) {
							
							tplfld = (cm[k].summaryTpl) ? cm[k].summaryTpl :  "{0}";
							
							vv = this.v;
							try {
								this.groupCount = fdata.cnt;
								this.groupIndex = fdata.dataIndex;
								this.groupValue = fdata.value;
								//vv = $t.formatter('', vv, k, this);
							} catch (ef) {
								//vv = this.v;
							}
							tmpdata= "<td role=\"gridcell\" "+$t.formatCol(k,1,'')+">"+$.jgrid.template(tplfld, vv, fdata.cnt, fdata.dataIndex, fdata.displayValue, fdata.summary)+ "</td>";
							return false;
						}
					});
					str += tmpdata;
				}
				return str;
			}
			var sumreverse = $.makeArray(grp.groupSummary), mul;
			sumreverse.reverse();
			mul = $t.p.multiselect || $t.p.rownumbers ? " colspan=\"2\"" : "";
			if($t.p.multiselect && $t.p.rownumbers) {
				mul = " colspan=\"3\"";
			}
			$.each(grp.groups,function(i,n){
				if(grp._locgr) {
					if( !(n.startRow +n.cnt > (page-1)*rn && n.startRow < page*rn)) {
						return true;
					}
				}
				toEnd++;
				clid = $t.p.id+"ghead_"+n.idx;
				hid = clid+"_"+i;
				icon = "<span style='cursor:pointer;margin-right:8px;margin-left:5px;' class='" + common.icon_base +" "+pmrtl+"' onclick=\"jQuery('#"+$.jgrid.jqID($t.p.id)+"').jqGrid('groupingToggle','"+hid+"');return false;\"></span>";
				try {
					if (Array.isArray(grp.formatDisplayField) && $.jgrid.isFunction(grp.formatDisplayField[n.idx])) {
						gv = grp.formatDisplayField[n.idx].call($t, n.displayValue, n.value, $t.p.colModel[cp[n.idx]], n.idx, grp);
					} else {
						gv = $t.formatter(hid, n.displayValue, cp[n.idx], n.value );
					}
				} catch (egv) {
					gv = n.displayValue;
				}
				var grpTextStr = ''; 
				// format summary values if formatter
				for( var kk =0;kk< n.summary.length; kk++) {  
					var nv = n.summary[kk];
					var ci = $.jgrid.getElemByAttrVal($t.p.colModel, 'name', nv.nm, true);
					if(ci>=0) {
						if(typeof nv.st === 'string' && nv.st.toLowerCase() === 'avg') {
							if(nv.sd && nv.vd) { 
								nv.v = (nv.v/nv.vd);
							} else if(nv.v && n.cnt > 0) {
								nv.v = (nv.v/n.cnt);
							}
						}
						nv.uv = nv.v;
						try {
							nv.v = $t.formatter('',nv.v, ci, this);
						} catch (e) {}
					}
				}
				
				if($.jgrid.isFunction(grp.groupText[n.idx])) { 
					grpTextStr = grp.groupText[n.idx].call($t, gv, n.cnt, n.summary);
				} else {
					grpTextStr = $.jgrid.template.call($t, grp.groupText[n.idx], gv, n.cnt, n.summary);
				}
				if( !(typeof grpTextStr ==='string' || typeof grpTextStr ==='number' ) ) {
					grpTextStr = gv;
				}
				if(grp.groupSummaryPos[n.idx] === 'header')  {
					str += "<tr id=\""+hid+"\"" +(grp.groupCollapse && n.idx>0 ? " style=\"display:none;\" " : " ") + "role=\"row\" class= \"" + common.content + " jqgroup ui-row-"+$t.p.direction+" "+clid+"\">";
					str += buildSummaryTd(i, 0, grp.groups, (mul==="" ? 0 : 1), "<td role=\"gridcell\" style=\"padding-left:"+(n.idx * 12) + "px;"+"\"" + mul + " "+ $t.formatCol(0,1,'')+">" + icon+grpTextStr + "</td>" );
					str += "</tr>";
				} else {
					str += "<tr id=\""+hid+"\"" +(grp.groupCollapse && n.idx>0 ? " style=\"display:none;\" " : " ") + "role=\"row\" class= \"" + common.content + " jqgroup ui-row-"+$t.p.direction+" "+clid+"\"><td class=\"for-sticky\" style=\"padding-left:"+(n.idx * 12) + "px;"+"\">" + icon + grpTextStr + "</td><td colspan=\""+(grp.groupColumnShow[n.idx] === false ? colspans-2 : colspans-1)+"\"></td></tr>";
				}
				var leaf = len-1 === n.idx; 
				if( leaf ) {
					var gg = grp.groups[i+1], kk, ik, offset = 0, sgr = n.startRow,
					end = gg !== undefined ?  gg.startRow : grp.groups[i].startRow + grp.groups[i].cnt;
					if(grp._locgr) {
						offset = (page-1)*rn;
						if(offset > n.startRow) {
							sgr = offset;
						}
					}
					let rncv = 0;
					for(kk=sgr;kk<end;kk++) {
						if(!grdata[kk - offset]) { break; }
						if(crn) { // rownumbers
							let rncell = $(grdata[kk - offset][1]);
							if(rncell.attr('aria-describedby') === $t.id+"_rn" ) {
								rncv++;
								rncell.attr("title", rncv+'').text(rncv+'');
								grdata[kk - offset][1] = rncell.prop('outerHTML');
							}
						}
						str += grdata[kk - offset].join('');
					}
					if(grp.groupSummaryPos[n.idx] !== 'header') {
						var jj;
						if (gg !== undefined) {
							for (jj = 0; jj < grp.groupField.length; jj++) {
								if (gg.dataIndex === grp.groupField[jj]) {
									break;
								}
							}
							toEnd = grp.groupField.length - jj;
						}
						for (ik = 0; ik < toEnd; ik++) {
							if(!sumreverse[ik]) { continue; }
							var hhdr = "";
							if(grp.groupCollapse && !grp.showSummaryOnHide) {
								hhdr = " style=\"display:none;\"";
							}
							str += "<tr"+hhdr+" jqfootlevel=\""+(n.idx-ik)+"\" role=\"row\" class=\"" + common.content + " jqfoot ui-row-"+$t.p.direction+"\">";
							str += buildSummaryTd(i, ik, grp.groups, 0, false);
							str += "</tr>";
						}
						toEnd = jj;
					}
				}
			});
			$("#"+$.jgrid.jqID($t.p.id)+" tbody").first().append(str);
			// free up memory
			str = null;
		});
	},
	groupingGroupBy : function (name, options ) {
		return this.each(function(){
			var $t = this;
			if(typeof name === "string") {
				name = [name];
			}
			var grp = $t.p.groupingView;
			$t.p.grouping = true;
			grp._locgr = false;
			//Set default, in case visibilityOnNextGrouping is undefined 
			if (grp.visibiltyOnNextGrouping === undefined) {
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
	groupingRemove : function (current, grpViewInit) {
		return this.each(function(){
			var $t = this;
			if(current === undefined) {
				current = true;
			}
			if(grpViewInit === undefined) {
				grpViewInit = false;
			}
			$t.p.grouping = false;
			if(current===true) {
				var grp = $t.p.groupingView, i;
				// show previous hidden groups if they are hidden and weren't removed yet
				for(i=0;i<grp.groupField.length;i++) {
				if (!grp.groupColumnShow[i] && grp.visibiltyOnNextGrouping[i]) {
						$($t).jqGrid('showCol', grp.groupField);
					}
				}
				$("#"+$.jgrid.jqID($t.p.id)+" tbody").first().find("tr.jqgroup, tr.jqfoot").remove();
				$("#"+$.jgrid.jqID($t.p.id)+" tbody").first().find("tr.jqgrow:hidden").show();
			} else {
				$($t).trigger("reloadGrid");
			}
			if(grpViewInit) {
				$($t).jqGrid('groupingInit');
			}
		});
	},
	groupingCalculations : {
		handler: function(fn, v, field, round, roundType, rc) {
			var funcs = {
				sum: function() {
					return $.jgrid.floatNum(v) + $.jgrid.floatNum(rc[field]);
				},

				min: function() {
					if(v==="") {
						return $.jgrid.floatNum(rc[field]);
					}
					return Math.min($.jgrid.floatNum(v),$.jgrid.floatNum(rc[field]));
				},

				max: function() {
					if(v==="") {
						return $.jgrid.floatNum(rc[field]);
					}
					return Math.max($.jgrid.floatNum(v),$.jgrid.floatNum(rc[field]));
				},

				count: function() {
					if(v==="") {v=0;}
					if(rc.hasOwnProperty(field)) {
						return v+1;
					}
					return 0;
				},

				avg: function() {
					// the same as sum, but at end we divide it
					// so use sum instead of duplicating the code (?)
					return funcs.sum();
				}
			};

			if(!funcs[fn]) {
				throw "jqGrid Grouping No such method: " + fn;
			}
			var res = funcs[fn]();

			if (round != null) {
				if (roundType === 'fixed') {
					res = res.toFixed(round);
				} else {
					var mul = Math.pow(10, round);
					res = Math.round(res * mul) / mul;
				}
			}

			return res;
		}	
	},
	groupingResetCalcs : function () {
		return this.each(function(){
			this.p.groupingView._locgr = false;
		});
	},
	setColSpanHeader : function( o ) {
		return this.each(function(){
			var ts = this,
			i, cmi, skip = 0, th, $th, thStyle, k,
			iCol,
			cghi,
			//startColumnName,
			numberOfColumns,
			titleText,
                        toolTip,
			cVisibleColumns,
			className,
			colModel = ts.p.colModel,
			cml = colModel.length,
			ths = ts.grid.headers,
			$htable = $("table.ui-jqgrid-htable", ts.grid.hDiv),
			$thead = $htable.children("thead"),
			$firstHeaderRow = $htable.find(".jqg-first-row-header"),
			$focusElem = false,
			frozen = false,
			//classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')]['grouping'],
			numberOfHeadRows = $thead.children("tr").length;
			//base = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].base;
			if(Array.isArray( o )) {
				ts.p.colSpanHeader =  o;
			}
			if($firstHeaderRow[0] === undefined) {
				$firstHeaderRow = $('<tr>', {role: "row", "aria-hidden": "true"}).addClass("jqg-first-row-header").css("height", "auto");
			} else {
				$firstHeaderRow.empty();
			}
			if(ts.p.frozenColumns) {
				$(ts).jqGrid("destroyFrozenColumns");
				frozen = true;
			}
			for (i = 0; i < cml; i++) {
				th = ths[i].el;
				$th = $(th);
				cmi = colModel[i];
				// build the next cell for the first header row
				thStyle = { height: '0px', width: ths[i].width + 'px', display: (cmi.hidden ? 'none' : '')};
				$("<th>", {role: 'gridcell'}).css(thStyle).addClass("ui-first-th-"+ts.p.direction + " " + (cmi.labelClasses || "") ).appendTo($firstHeaderRow);
			}
			$thead.prepend($firstHeaderRow);

			//$firstRow = $thead.find("tr.jqg-first-row-header");
			$(ts).on('jqGridResizeStop.setGroupHeaders', function (e, nw, idx) {
				$firstHeaderRow.find('th').eq(idx)[0].style.width = nw + "px";
			});
			for (i = 0; i < cml; i++) {
				th = ths[i].el;
				$th = $(th);
				cmi = colModel[i];
				iCol = $.jgrid.inColumnHeader(cmi.name, ts.p.colSpanHeader);
				if (iCol >= 0) {
					cghi = ts.p.colSpanHeader[iCol];
					numberOfColumns = cghi.numberOfColumns;
					titleText = cghi.titleText || "";
					className = cghi.className || "";
					toolTip = cghi.toolTip || "";
					// caclulate the number of visible columns from the next numberOfColumns columns
					for (cVisibleColumns = 0, iCol = 0; iCol < numberOfColumns && (i + iCol < cml); iCol++) {
						if (!colModel[i + iCol].hidden) {
							cVisibleColumns++;
						}
					}

					if(cVisibleColumns > 0) {
						$th.attr("colspan", String(cVisibleColumns));
						if(numberOfHeadRows > 1) {
							for(k=1;k<numberOfHeadRows; k++) {
								$("tr",$thead).eq(k+1).find("th").eq(i).attr("colspan", String(cVisibleColumns));
							}
						}
					}
					if (titleText) {
						var fl = $th.find("div.ui-th-div")[0];
						cghi.savedLabel = fl.innerHTML;
						fl.innerHTML = titleText;
						if(typeof toolTip === "string" && toolTip !== "") {
							$th.attr("title", toolTip);
						} else if (ts.p.headertitles) {
							$th.attr("title", titleText);
						}
					}
					$th.addClass(className);
					for( skip=0;skip < numberOfColumns-1;skip++) {
						$(ths[skip+i+1].el).hide();
						ts.p.colModel[skip+i+1].hidedlg = true;
						ts.p.colModel[skip+i+1]._colspancell = true;
						if(numberOfHeadRows > 1) {
							for(k=1;k<numberOfHeadRows; k++) {
								$("tr",$thead).eq(k+1).find("th").eq(i+skip+1).hide();
							}
						}
					}
				}
			}
			
			if( $focusElem ) {
				try {
					$($focusElem).focus();
				} catch(fe) {}
			}
			if(frozen) {
				$(ts).jqGrid("setFrozenColumns");
			}

		});
	},
	destroyColSpanHeader : function(emptyColSpan) {
		if(emptyColSpan === undefined) {
			emptyColSpan = true;
		}
		return this.each(function(){
			var ts = this,
			$htable = $("table.ui-jqgrid-htable", ts.grid.hDiv),
			clitem, fl, k, j, itm, cellInd,
			$thead = $htable.children("thead");
			$("tr.jqg-first-row-header", $thead).remove();
			if(ts.p.colSpanHeader.length) {
				for(j = 0;j<ts.p.colSpanHeader.length;j++) {
					clitem = ts.p.colSpanHeader[j];
					cellInd = $.jgrid.getElemByAttrVal( ts.p.colModel, 'name', clitem.startColumnName, true);
					if(cellInd < 0 ) {
						continue;
					}
					for(k = cellInd+1; k < cellInd + clitem.numberOfColumns; k++) {
						ts.p.colModel[k].hidedlg=false;
						ts.p.colModel[k]._colspancell=false;
					}
					$(">tr", $thead).each(function( i, n) {
						itm = $("th",n).eq(cellInd);
						if(!itm.className) {
							itm.className = "";
						}
						$(itm).attr("colspan","").removeClass( itm.className );
						if($(n).hasClass('ui-jqgrid-labels')) {
							fl = itm.find("div.ui-th-div")[0];
							fl.innerHTML = clitem.savedLabel;
						}
						for(k=1;k<clitem.numberOfColumns;k++) {
							$("th", n).eq(cellInd+k).show();
						}
					});
				}
			}
			if(emptyColSpan) {
				ts.p.colSpanHeader =[];
			}
		});
	},
	setGroupHeaders : function ( o ) {
		o = $.extend({
			useColSpanStyle :  false,
			groupHeaders: []
		},o  || {});
		return this.each(function(){
			var ts = this,
			i, cmi, skip = 0, $tr, $colHeader, th, $th, thStyle,
			iCol,
			cghi,
			//startColumnName,
			numberOfColumns,
			titleText,
			toolTip,
			cVisibleColumns,
			className,
			colModel = ts.p.colModel,
			cml = colModel.length,
			ths = ts.grid.headers,
			$htable = $("table.ui-jqgrid-htable", ts.grid.hDiv),
			$trLabels = $htable.children("thead").children("tr.ui-jqgrid-labels").last().addClass("jqg-second-row-header"),
			$thead = $htable.children("thead"),
			$theadInTable,
			$firstHeaderRow = $htable.find(".jqg-first-row-header"),
			$firstRow,
			$focusElem = false,
			frozen = false,
			//classes = $.jgrid.styleUI[($t.p.styleUI || 'jQueryUI')]['grouping'],
			base = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].base;
			if(!ts.p.groupHeader) {
				ts.p.groupHeader = [];
			}
			ts.p.groupHeader.push(o);
			ts.p.groupHeaderOn = true;
			if($firstHeaderRow[0] === undefined) {
				$firstHeaderRow = $('<tr>', {role: "row", "aria-hidden": "true"}).addClass("jqg-first-row-header").css("height", "auto");
			} else {
				$firstHeaderRow.empty();
			}
			if(ts.p.frozenColumns) {
				$(ts).jqGrid("destroyFrozenColumns");
				frozen = true;
			}
			
			if( $(document.activeElement).is('input') || $(document.activeElement).is('textarea') ) {
				$focusElem = document.activeElement;
			}
			$(ts).prepend($thead);

			$tr = $('<tr>', {role: "row"}).addClass("ui-jqgrid-labels jqg-third-row-header");
			for (i = 0; i < cml; i++) {
				th = ths[i].el;
				$th = $(th);
				cmi = colModel[i];
				// build the next cell for the first header row
				thStyle = { height: '0px', width: ths[i].width + 'px', display: (cmi.hidden ? 'none' : '')};
				$("<th>", {role: 'gridcell'}).css(thStyle).addClass("ui-first-th-"+ts.p.direction + " " + (cmi.labelClasses || "") ).appendTo($firstHeaderRow);

				th.style.width = ""; // remove unneeded style
				iCol = $.jgrid.inColumnHeader(cmi.name, o.groupHeaders);
				if (iCol >= 0) {
					cghi = o.groupHeaders[iCol];
					numberOfColumns = cghi.numberOfColumns;
					titleText = cghi.titleText;
					toolTip = cghi.toolTip || "";
					className = cghi.className || "";
					// caclulate the number of visible columns from the next numberOfColumns columns
					for (cVisibleColumns = 0, iCol = 0; iCol < numberOfColumns && (i + iCol < cml); iCol++) {
						if (!colModel[i + iCol].hidden) {
							cVisibleColumns++;
						}
					}

					// The next numberOfColumns headers will be moved in the next row
					// in the current row will be placed the new column header with the titleText.
					// The text will be over the cVisibleColumns columns
					$colHeader = $('<th>').attr({role: "columnheader", "data-spname": cmi.name})
						.addClass(base.headerBox+ " ui-th-column-header ui-th-"+ts.p.direction+" "+className + " "+(cmi.labelClasses || ""))
						//.css({'height':'22px', 'border-top': '0 none'})
						.html(titleText);
					if(cVisibleColumns > 0) {
						$colHeader.attr("colspan", String(cVisibleColumns));
					}
					if(typeof toolTip === "string" && toolTip !== "") {
						$colHeader.attr("title", toolTip);
					} else if (ts.p.headertitles) {
						$colHeader.attr("title", $colHeader.text());
					}
					// hide if not a visible cols
					if( cVisibleColumns === 0) {
						$colHeader.hide();
					}

					$th.before($colHeader); // insert new column header before the current
					$tr.append(th);         // move the current header in the next row

					// set the coumter of headers which will be moved in the next row
					skip = numberOfColumns - 1;
				} else {
					if (skip === 0) {
						if (o.useColSpanStyle) {
							// expand the header height to n rows
							var rowspan = $th.attr("rowspan") ? parseInt($th.attr("rowspan"),10) + 1 : 2;
							$th.attr("rowspan", rowspan);
						} else {
							$('<th>', {role: "columnheader"})
								.addClass(base.headerBox+" ui-th-column-header ui-th-"+ts.p.direction)
								.css({"display": cmi.hidden ? 'none' : ''})
								.attr( { "data-spname": cmi.name})
								.insertBefore($th);
							$tr.append(th);
						}
					} else {
						// move the header to the next row
						//$th.css({"padding-top": "2px", height: "19px"});
						$tr.append(th);
						skip--;
					}
				}
			}
			$theadInTable = $(ts).children("thead");
			$theadInTable.prepend($firstHeaderRow);
			$tr.insertAfter($trLabels);
			$htable.append($theadInTable);

			if (o.useColSpanStyle) {
				// Increase the height of resizing span of visible headers
				$htable.find("span.ui-jqgrid-resize").each(function () {
					var $parent = $(this).parent();
					if ($parent.is(":visible")) {
						this.style.cssText = 'height: ' + $parent.height() + 'px !important; cursor: col-resize;';
					}
				});

				// Set position of the sortable div (the main lable)
				// with the column header text to the middle of the cell.
				// One should not do this for hidden headers.
				$htable.find("div.ui-jqgrid-sortable").each(function () {
					var $ts = $(this), $parent = $ts.parent();
					if ($parent.is(":visible") && $parent.is(":has(span.ui-jqgrid-resize)")) {
						// minus 4px from the margins of the resize markers
						$ts.css('top', ($parent.height() - $ts.outerHeight()) / 2  - 4 +  'px');
					}
				});
			}

			$firstRow = $theadInTable.find("tr.jqg-first-row-header");
			$(ts).on('jqGridResizeStop.setGroupHeaders', function (e, nw, idx) {
				$firstRow.find('th').eq(idx)[0].style.width = nw + "px";
			});
			if( $focusElem ) {
				try {
					$($focusElem).focus();
				} catch(fe) {}
			}
			var testws = $("tr.jqg-second-row-header th").eq( 0 );
			if( $.jgrid.type(testws)==='object' && testws.length && $.jgrid.trim(testws[0].outerText) === "" ) {
				$("tr.jqg-second-row-header th").eq( 0 ).prepend('&nbsp;');
			}
			if(frozen) {
				$(ts).jqGrid("setFrozenColumns");
			}			
			$(ts).triggerHandler("afterSetGroupHandler", [o]);
			
		});				
	},
	destroyGroupHeader : function(nullHeader) {
		if(nullHeader === undefined) {
			nullHeader = true;
		}
		return this.each(function()
		{
			var $t = this, $tr, i, l, headers, $th, $resizing, grid = $t.grid,
			thead = $("table.ui-jqgrid-htable thead", grid.hDiv), cm = $t.p.colModel, hc, frozen = false;
			if(!grid) { return; }
			if($t.p.frozenColumns) {
				$($t).jqGrid("destroyFrozenColumns");
				frozen = true;
			}

			$(this).off('.setGroupHeaders');
			$t.p.groupHeaderOn = false;
			$tr = $("<tr>", {role: "row"}).addClass("ui-jqgrid-labels");
			headers = grid.headers;
			for (i = 0, l = headers.length; i < l; i++) {
				hc = cm[i].hidden ? "none" : "";
				$th = $(headers[i].el)
					.width( $('tr.jqg-first-row-header th', thead).eq( i ).width() )
					.css('display',hc);
				try {
					$th.removeAttr("rowSpan");
				} catch (rs) {
					//IE 6/7
					$th.attr("rowSpan",1);
				}
				$tr.append($th);
				$resizing = $th.children("span.ui-jqgrid-resize");
				if ($resizing.length>0) {// resizable column
					$resizing[0].style.height = "";
				}
				$th.children("div")[0].style.top = "";
			}
			$(thead).children('tr.ui-jqgrid-labels').remove();
			$(thead).children('tr.jqg-first-row-header').remove();
			$(thead).prepend($tr);

			if(nullHeader === true) {
				$($t).jqGrid('setGridParam',{ 'groupHeader': null});
			}
			if(frozen) {
				$($t).jqGrid("setFrozenColumns");
			}
			$($t).off("afterSetGroupHandler");
		});
	},
	isGroupHeaderOn : function () {
		var $t = this[0];
		return $t.p.groupHeaderOn === true && $t.p.groupHeader && (Array.isArray($t.p.groupHeader) || $.jgrid.isFunction($t.p.groupHeader) );
	}, 
	refreshGroupHeaders : function() {
		return this.each(function(){
			var ts = this,
			gHead,
			gh = $(ts).jqGrid("isGroupHeaderOn");
			if(gh) { 
				$(ts).jqGrid('destroyGroupHeader', false);
				gHead = $.extend([],ts.p.groupHeader);
				ts.p.groupHeader = null;
			}
			if( gh && gHead)  {
				for(var k =0; k < gHead.length; k++) {
					$(ts).jqGrid('setGroupHeaders', gHead[k]);
				}
			}
		});
	}
});
//module end
}));
