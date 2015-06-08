/*jshint eqeqeq:false, eqnull:true */
/*global jQuery */
/*jslint plusplus: true, unparam: true, eqeq: true, nomen: true, continue: true */
// Grouping module
(function ($) {
	"use strict";
	var jgrid = $.jgrid, base = $.fn.jqGrid;
	jgrid.extend({
		groupingSetup: function () {
			return this.each(function () {
				var $t = this, i, j, cml, p = $t.p, colModel = p.colModel, grp = p.groupingView, cm, summary,
					emptyFormatter = function () {
						return "";
					};
				if (grp !== null && ((typeof grp === "object") || $.isFunction(grp))) {
					if (!grp.groupField.length) {
						p.grouping = false;
					} else {
						if (grp.visibiltyOnNextGrouping === undefined) {
							grp.visibiltyOnNextGrouping = [];
						}

						grp.lastvalues = [];
						if (!grp._locgr) {
							grp.groups = [];
						}
						grp.counters = [];
						for (i = 0; i < grp.groupField.length; i++) {
							if (!grp.groupOrder[i]) {
								grp.groupOrder[i] = "asc";
							}
							if (!grp.groupText[i]) {
								grp.groupText[i] = "{0}";
							}
							if (typeof grp.groupColumnShow[i] !== "boolean") {
								grp.groupColumnShow[i] = true;
							}
							if (typeof grp.groupSummary[i] !== "boolean") {
								grp.groupSummary[i] = false;
							}
							if (!grp.groupSummaryPos[i]) {
								grp.groupSummaryPos[i] = "footer";
							}
							cm = colModel[p.iColByName[grp.groupField[i]]];
							if (grp.groupColumnShow[i] === true) {
								grp.visibiltyOnNextGrouping[i] = true;
								if (cm != null && cm.hidden === true) {
									base.showCol.call($($t), grp.groupField[i]);
								}
							} else {
								grp.visibiltyOnNextGrouping[i] = $("#" + jgrid.jqID(p.id + "_" + grp.groupField[i])).is(":visible");
								if (cm != null && cm.hidden !== true) {
									base.hideCol.call($($t), grp.groupField[i]);
								}
							}
						}
						grp.summary = [];
						if (grp.hideFirstGroupCol) {
							grp.formatDisplayField[0] = function (v) {
								return v;
							};
						}
						for (j = 0, cml = colModel.length; j < cml; j++) {
							cm = colModel[j];
							if (grp.hideFirstGroupCol) {
								if (!cm.hidden && grp.groupField[0] === cm.name) {
									cm.formatter = emptyFormatter;
								}
							}
							if (cm.summaryType) {
								summary = { nm: cm.name, st: cm.summaryType, v: "", sr: cm.summaryRound, srt: cm.summaryRoundType || "round" };
								if (cm.summaryDivider) {
									summary.sd = cm.summaryDivider;
									summary.vd = "";
								}
								grp.summary.push(summary);
							}
						}
					}
				} else {
					p.grouping = false;
				}
			});
		},
		groupingPrepare: function (record, irow) {
			this.each(function () {
				var $t = this, grp = $t.p.groupingView, groups = grp.groups, counters = grp.counters,
					lastvalues = grp.lastvalues, isInTheSameGroup = grp.isInTheSameGroup, grlen = grp.groupField.length,
					i, newGroup, newCounter, fieldName, v, displayName, displayValue, changed = 0,
					groupingCalculationsHandler = base.groupingCalculations.handler,
					buildSummaryValue = function () {
						if ($.isFunction(this.st)) {
							this.v = this.st.call($t, this.v, this.nm, record);
						} else {
							this.v = groupingCalculationsHandler.call($($t), this.st, this.v, this.nm, this.sr, this.srt, record);
							if (this.st.toLowerCase() === "avg" && this.sd) {
								this.vd = groupingCalculationsHandler.call($($t), this.st, this.vd, this.sd, this.sr, this.srt, record);
							}
						}
					};

				for (i = 0; i < grlen; i++) {
					fieldName = grp.groupField[i];
					displayName = grp.displayField[i];
					v = record[fieldName];
					displayValue = displayName == null ? null : record[displayName];

					if (displayValue == null) {
						displayValue = v;
					}
					if (v !== undefined) {
						newGroup = { idx: i, dataIndex: fieldName, value: v, displayValue: displayValue, startRow: irow, cnt: 1, summary: [] };
						if (irow === 0) {
							// First record always starts a new group
							groups.push(newGroup);
							lastvalues[i] = v;
							counters[i] = { cnt: 1, pos: groups.length - 1, summary: $.extend(true, [], grp.summary) };
							$.each(counters[i].summary, buildSummaryValue);
							groups[counters[i].pos].summary = counters[i].summary;
						} else {
							newCounter = { cnt: 1, pos: groups.length, summary: $.extend(true, [], grp.summary) };
							if (typeof v !== "object" && ($.isArray(isInTheSameGroup) && $.isFunction(isInTheSameGroup[i]) ? !isInTheSameGroup[i].call($t, lastvalues[i], v, i, grp) : lastvalues[i] !== v)) {
								// This record is not in same group as previous one
								groups.push(newGroup);
								lastvalues[i] = v;
								changed = 1;
								counters[i] = newCounter;
								$.each(counters[i].summary, buildSummaryValue);
								groups[counters[i].pos].summary = counters[i].summary;
							} else {
								if (changed === 1) {
									// This group has changed because an earlier group changed.
									groups.push(newGroup);
									lastvalues[i] = v;
									counters[i] = newCounter;
									$.each(counters[i].summary, buildSummaryValue);
									groups[counters[i].pos].summary = counters[i].summary;
								} else {
									counters[i].cnt += 1;
									groups[counters[i].pos].cnt = counters[i].cnt;
									$.each(counters[i].summary, buildSummaryValue);
									groups[counters[i].pos].summary = counters[i].summary;
								}
							}
						}
					}
				}
				//gdata.push( rData );
			});
			return this;
		},
		groupingToggle: function (hid) {
			this.each(function () {
				var $t = this, p = $t.p, jqID = jgrid.jqID,
					grp = p.groupingView,
					minus = grp.minusicon,
					plus = grp.plusicon,
					tar = $("#" + jqID(hid)),
					r = tar.length ? tar[0].nextSibling : null,
					tarspan = $("#" + jqID(hid) + " span." + "tree-wrap-" + p.direction),
					itemGroupingLevel,
					showData,
					collapsed = false,
					frz = p.frozenColumns ? p.id + "_frozen" : false,
					tar2 = frz ? $("#" + jqID(hid), "#" + jqID(frz)) : false,
					r2 = (tar2 && tar2.length) ? tar2[0].nextSibling : null,
					strpos = hid.split("_"),
					num = parseInt(strpos[strpos.length - 2], 10),
					uid,
					getGroupingLevelFromClass = function (className) {
						var nums = $.map(className.split(" "), function (item) {
							if (item.substring(0, uid.length + 1) === uid + "_") {
								return parseInt(item.substring(uid.length + 1), 10);
							}
						});
						return nums.length > 0 ? nums[0] : undefined;
					};

				strpos.splice(strpos.length - 2, 2);
				uid = strpos.join("_");
				if (tarspan.hasClass(minus)) {
					// collapse
					while (r) {
						if ($(r).hasClass("jqfoot")) {
							// hide all till the summary row of the same level.
							// don't hide the summary row if grp.showSummaryOnHide === true
							itemGroupingLevel = parseInt($(r).data("jqfootlevel"), 10);
							if ((!grp.showSummaryOnHide && itemGroupingLevel === num) || itemGroupingLevel > num) {
								$(r).hide();
								if (frz) {
									$(r2).hide();
								}
							}
							if (itemGroupingLevel < num) {
								// stop hiding of rows if the footer of parent group are found
								break;
							}
						} else {
							itemGroupingLevel = getGroupingLevelFromClass(r.className);
							if (itemGroupingLevel !== undefined && itemGroupingLevel <= num) {
								// stop hiding of rows if the grouping header of the next group of the same (or higher) level are found
								break;
							}
							$(r).hide();
							if (frz) {
								$(r2).hide();
							}
						}
						r = r.nextSibling;
						if (frz) {
							r2 = r2.nextSibling;
						}
					}
					tarspan.removeClass(minus).addClass(plus);
					collapsed = true;
				} else {
					// expand
					showData = undefined;
					while (r) {
						if ($(r).hasClass("jqfoot")) {
							itemGroupingLevel = parseInt($(r).data("jqfootlevel"), 10);
							if (itemGroupingLevel === num || (grp.showSummaryOnHide && itemGroupingLevel === num + 1)) {
								$(r).show();
								if (frz) {
									$(r2).show();
								}
							}
							if (itemGroupingLevel <= num) {
								break;
							}
						}
						itemGroupingLevel = getGroupingLevelFromClass(r.className);
						if (showData === undefined) {
							showData = itemGroupingLevel === undefined; // if the first row after the opening group is data row then show the data rows
						}
						if (itemGroupingLevel !== undefined) {
							if (itemGroupingLevel <= num) {
								break;// next grouping header of the same lever are found
							}
							if (itemGroupingLevel === num + 1) {
								$(r).show().find(">td>span." + "tree-wrap-" + p.direction).removeClass(minus).addClass(plus);
								if (frz) {
									$(r2).show().find(">td>span." + "tree-wrap-" + p.direction).removeClass(minus).addClass(plus);
								}
							}
						} else if (showData) {
							$(r).show();
							if (frz) {
								$(r2).show();
							}
						}
						r = r.nextSibling;
						if (frz) {
							r2 = r2.nextSibling;
						}
					}
					tarspan.removeClass(plus).addClass(minus);
				}
				$($t).triggerHandler("jqGridGroupingClickGroup", [hid, collapsed]);
				if ($.isFunction(p.onClickGroup)) {
					p.onClickGroup.call($t, hid, collapsed);
				}

			});
			return false;
		},
		groupingRender: function (grdata, colspans, page, rn) {
			var str = "", $t = this[0], p = $t.p, toEnd = 0, grp = p.groupingView, sumreverse = $.makeArray(grp.groupSummary), gv, cp = [],
				icon = "", hid, clid, pmrtl = (grp.groupCollapse ? grp.plusicon : grp.minusicon) + " tree-wrap-" + p.direction,
				len = grp.groupField.length;

			function findGroupIdx(ind, offset, grp) {
				var ret = false, i, id;
				if (offset === 0) {
					ret = grp[ind];
				} else {
					id = grp[ind].idx;
					if (id === 0) {
						ret = grp[ind];
					} else {
						for (i = ind; i >= 0; i--) {
							if (grp[i].idx === id - offset) {
								ret = grp[i];
								break;
							}
						}
					}
				}
				return ret;
			}

			function buildSummaryTd(i, ik, grp, foffset) {
				var fdata = findGroupIdx(i, ik, grp), cm = p.colModel,
					grlen = fdata.cnt, strTd = "", k, tmpdata, tplfld,
					processSummary = function () {
						var vv, summary = this;
						if (summary.nm === cm[k].name) {
							tplfld = cm[k].summaryTpl || "{0}";
							if (typeof summary.st === "string" && summary.st.toLowerCase() === "avg") {
								if (summary.sd && summary.vd) {
									summary.v = (summary.v / summary.vd);
								} else if (summary.v && grlen > 0) {
									summary.v = (summary.v / grlen);
								}
							}
							try {
								summary.groupCount = fdata.cnt;
								summary.groupIndex = fdata.dataIndex;
								summary.groupValue = fdata.value;
								vv = $t.formatter("", summary.v, k, summary);
							} catch (ef) {
								vv = summary.v;
							}
							tmpdata = "<td " + $t.formatCol(k, 1, "") + ">" + jgrid.format(tplfld, vv) + "</td>";
							return false;
						}
					};

				for (k = foffset; k < colspans; k++) {
					tmpdata = "<td " + $t.formatCol(k, 1, "") + ">&#160;</td>";
					$.each(fdata.summary, processSummary);
					strTd += tmpdata;
				}
				return strTd;
			}

			$.each(p.colModel, function (i, n) {
				var ii;
				for (ii = 0; ii < len; ii++) {
					if (grp.groupField[ii] === n.name) {
						cp[ii] = i;
						break;
					}
				}
			});

			sumreverse.reverse();
			$.each(grp.groups, function (i, n) {
				if (grp._locgr) {
					if (!(n.startRow + n.cnt > (page - 1) * rn && n.startRow < page * rn)) {
						return true;
					}
				}
				toEnd++;
				clid = p.id + "ghead_" + n.idx;
				hid = clid + "_" + i;
				icon = "<span style='cursor:pointer;' class='" + grp.commonIconClass + " " + pmrtl + "' onclick=\"jQuery('#" + jgrid.jqID(p.id).replace("\\", "\\\\") + "').jqGrid('groupingToggle','" + hid + "');return false;\"></span>";
				try {
					if ($.isArray(grp.formatDisplayField) && $.isFunction(grp.formatDisplayField[n.idx])) {
						n.displayValue = grp.formatDisplayField[n.idx].call($t, n.displayValue, n.value, p.colModel[cp[n.idx]], n.idx, grp);
						gv = n.displayValue;
					} else {
						gv = $t.formatter(hid, n.displayValue, cp[n.idx], n.value);
					}
				} catch (egv) {
					gv = n.displayValue;
				}
				str += "<tr id=\"" + hid + "\"" + (grp.groupCollapse && n.idx > 0 ? " style=\"display:none;\" " : " ") + "role=\"row\" class=\"ui-widget-content jqgroup ui-row-" + p.direction + " " + clid + "\"><td style=\"padding-left:" + (n.idx * 12) + "px;" + "\"";
				var grpTextStr = $.isFunction(grp.groupText[n.idx]) ?
						grp.groupText[n.idx].call($t, gv, n.cnt, n.summary) :
						jgrid.template(grp.groupText[n.idx], gv, n.cnt, n.summary),
					colspan = 1, jj, hhdr, kk, ik, offset = 0, sgr, gg, end, // k,
					leaf = len - 1 === n.idx;
				if (typeof grpTextStr !== "string" && typeof grpTextStr !== "number") {
					grpTextStr = gv;
				}
				if (grp.groupSummaryPos[n.idx] === "header") {
					colspan = 1;
					if (p.colModel[0].name === "cb" || p.colModel[1].name === "cb") {
						colspan++;
					}
					if (p.colModel[0].name === "subgrid" || p.colModel[1].name === "subgrid") {
						colspan++;
					}
					str += (colspan > 1 ? " colspan='" + colspan + "'" : "") + ">" + icon + grpTextStr + "</td>";
					/*for (k = grp.groupColumnShow[n.idx] === false ? 1 : 2; k < colspan; k++) {
						str += "<td style='display:none;'></td>";
					}*/
					str += buildSummaryTd(i, 0, grp.groups, grp.groupColumnShow[n.idx] === false ?
							colspan - 1:
							colspan);
				} else {
					str += " colspan=\"" + (grp.groupColumnShow[n.idx] === false ? colspans - 1 : colspans) + "\"" +
						">" + icon + grpTextStr + "</td>";
				}
				str += "</tr>";
				if (leaf) {
					gg = grp.groups[i + 1];
					sgr = n.startRow;
					end = gg !== undefined ? gg.startRow : grp.groups[i].startRow + grp.groups[i].cnt;
					if (grp._locgr) {
						offset = (page - 1) * rn;
						if (offset > n.startRow) {
							sgr = offset;
						}
					}
					for (kk = sgr; kk < end; kk++) {
						if (!grdata[kk - offset]) {
							break;
						}
						str += grdata[kk - offset].join("");
					}
					if (grp.groupSummaryPos[n.idx] !== "header") {
						if (gg !== undefined) {
							for (jj = 0; jj < grp.groupField.length; jj++) {
								if (gg.dataIndex === grp.groupField[jj]) {
									break;
								}
							}
							toEnd = grp.groupField.length - jj;
						}
						for (ik = 0; ik < toEnd; ik++) {
							if (!sumreverse[ik]) {
								continue;
							}
							hhdr = "";
							if (grp.groupCollapse && !grp.showSummaryOnHide) {
								hhdr = " style=\"display:none;\"";
							}
							str += "<tr" + hhdr + " data-jqfootlevel=\"" + (n.idx - ik) + "\" role=\"row\" class=\"ui-widget-content jqfoot ui-row-" + p.direction + "\">";
							str += buildSummaryTd(i, ik, grp.groups, 0);
							str += "</tr>";
						}
						toEnd = jj;
					}
				}
			});
			//$($t.tBodies[0]).append(str);
			return str;
		},
		groupingGroupBy: function (name, options) {
			return this.each(function () {
				var $t = this, p = $t.p, grp = p.groupingView, i, cm;
				if (typeof name === "string") {
					name = [name];
				}
				p.grouping = true;
				grp._locgr = false;
				//Set default, in case visibilityOnNextGrouping is undefined
				if (grp.visibiltyOnNextGrouping === undefined) {
					grp.visibiltyOnNextGrouping = [];
				}
				// show previous hidden groups if they are hidden and weren't removed yet
				for (i = 0; i < grp.groupField.length; i++) {
					cm = p.colModel[p.iColByName[grp.groupField[i]]];
					if (!grp.groupColumnShow[i] && grp.visibiltyOnNextGrouping[i] && cm != null && cm.hidden === true) {
						base.showCol.call($($t), grp.groupField[i]);
					}
				}
				// set visibility status of current group columns on next grouping
				for (i = 0; i < name.length; i++) {
					grp.visibiltyOnNextGrouping[i] = $(p.idSel + "_" + jgrid.jqID(name[i])).is(":visible");
				}
				p.groupingView = $.extend(p.groupingView, options || {});
				grp.groupField = name;
				$($t).trigger("reloadGrid");
			});
		},
		groupingRemove: function (current) {
			return this.each(function () {
				var $t = this, p = $t.p, tbody = $t.tBodies[0], grp = p.groupingView, i;
				if (current === undefined) {
					current = true;
				}
				p.grouping = false;
				if (current === true) {
					// show previous hidden groups if they are hidden and weren't removed yet
					for (i = 0; i < grp.groupField.length; i++) {
						if (!grp.groupColumnShow[i] && grp.visibiltyOnNextGrouping[i]) {
							base.showCol.call($($t), grp.groupField);
						}
					}
					$("tr.jqgroup, tr.jqfoot", tbody).remove();
					$("tr.jqgrow:hidden", tbody).show();
				} else {
					$($t).trigger("reloadGrid");
				}
			});
		},
		groupingCalculations: {
			handler: function (fn, v, field, round, roundType, rc) {
				var funcs = {
						sum: function () {
							return parseFloat(v || 0) + parseFloat((rc[field] || 0));
						},

						min: function () {
							if (v === "") {
								return parseFloat(rc[field] || 0);
							}
							return Math.min(parseFloat(v), parseFloat(rc[field] || 0));
						},

						max: function () {
							if (v === "") {
								return parseFloat(rc[field] || 0);
							}
							return Math.max(parseFloat(v), parseFloat(rc[field] || 0));
						},

						count: function () {
							if (v === "") {
								v = 0;
							}
							if (rc.hasOwnProperty(field)) {
								return v + 1;
							}
							return 0;
						},

						avg: function () {
							// the same as sum, but at end we divide it
							// so use sum instead of duplicating the code (?)
							return funcs.sum();
						}
					},
					res,
					mul;

				if (!funcs[fn]) {
					throw ("jqGrid Grouping No such method: " + fn);
				}
				res = funcs[fn]();

				if (round != null) {
					if (roundType === "fixed") {
						res = res.toFixed(round);
					} else {
						mul = Math.pow(10, round);
						res = Math.round(res * mul) / mul;
					}
				}

				return res;
			}
		}
	});
}(jQuery));
