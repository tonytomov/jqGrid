/*
 * jqFilter  jQuery jqGrid filter addon.
 * Copyright (c) 2011, Tony Tomov, tony@trirand.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * 
 * The work is inspired from this Stefan Pirvu
 * http://www.codeproject.com/KB/scripting/json-filtering.aspx
 *
 * The filter uses JSON entities to hold filter rules and groups. Here is an example of a filter:

{ "groupOp": "AND",
      "groups" : [ 
        { "groupOp": "OR",
            "rules": [
                { "field": "name", "op": "eq", "data": "England" }, 
                { "field": "id", "op": "le", "data": "5"}
             ]
        } 
      ],
      "rules": [
        { "field": "name", "op": "eq", "data": "Romania" }, 
        { "field": "id", "op": "le", "data": "1"}
      ]
}
*/

;(function ($) {

$.fn.jqFilter = function( arg ) {
	if (typeof arg == 'string') {
		
		var fn = $.fn.jqFilter[arg];
		if (!fn) {
			throw ("jqFilter - No such method: " + arg);
		}
		var args = $.makeArray(arguments).slice(1);
		return fn.apply(this,args);
	}

	var p = $.extend(true,{
		filter: null,
		columns: [],
		onChange : null,
		checkValues : null,
		error: false,
		errmsg : "",
		errorno : {
			"e1" : " is requiered field!",
			"e2" : " is not a number field!",
			"e3" : " is not a integer field!",
			"e4" : " should be greater or equal than",
			"e5" : " should be less than or equal to"
		},
		showQuery : true,
		ops : [
			{"name": "eq", "description": "equal", "operator":"="},
			{"name": "ne", "description": "not equal", "operator":"<>"},
			{"name": "bw", "description": "begins with", "operator":"LIKE"},
			{"name": "bn", "description": "does not begin with", "operator":"NOT LIKE"},
			{"name": "lt", "description": "less", "operator":"<"},
			{"name": "le", "description": "less or equal","operator":"<="},
			{"name": "gt", "description": "greater", "operator":">"},
			{"name": "ge", "description": "greater or equal", "operator":">="},
			{"name": "ew", "description": "ends with", "operator":"LIKE"},
			{"name": "en", "description": "does not end with", "operator":"NOT LIKE"},
			{"name": "cn", "description": "contains", "operator":"LIKE"},
			{"name": "nc", "description": "does not contain", "operator":"NOT LIKE"},
			{"name": "nu", "description": "is null", "operator":"IS NULL"},
			{"name": "nn", "description": "is not null", "operator":"IS NOT NULL"}
		],
		numopts : ['eq','ne', 'lt', 'le', 'gt', 'ge', 'nu', 'nn'],
		stropts : ['eq', 'ne', 'bw', 'bn', 'ew', 'en', 'cn', 'nc', 'nu', 'nn'],
		groupOps : ["AND", "OR"]
	}, arg || {});
	return this.each( function() {
		if (this.filter) {return;}
		this.p = p;
		// setup filter in case if they is not defined
		if (p.filter === null || p.filter === undefined) {
			p.filter = {
				groupOp: p.groupOps[0],
				rules: [],
				groups: []
			}
		}
		// set default values for the columns if they are not set
		var i, len = p.columns.length, self = this;
		if( !len ) {return;}
		for(i=0; i < len; i++) {

			if( p.columns[i].stype ) {
				// grid compatibility
				p.columns[i].inputtype = p.columns[i].stype;
			} else if(!p.columns[i].inputtype) {
				p.columns[i].inputtype = 'text';
			}
			if( p.columns[i].sorttype ) {
				// grid compatibility
				p.columns[i].searchtype = p.columns[i].sorttype;
			} else if (!p.columns[i].searchtype) {
				p.columns[i].searchtype = 'string';
			}
			if(!p.columns[i].hidden) {
				// jqGrid compatibility
				p.columns[i].hidden = false;
			}
			if(!p.columns[i].label) {
				p.columns[i].label = p.columns[i].name;
			}
			if(!p.columns[i].hasOwnProperty('options')) {
				p.columns[i].options = {};
			}
			if(!p.columns[i].hasOwnProperty('searchrules')) {
				p.columns[i].searchrules = {};
			}

		}
		if(p.showQuery) {
			$(this).append("<table class='queryresult ui-widget ui-widget-content' style='display:block;max-width:440px;border:0px none;'><tbody><tr><td class='query'></td></tr></tbody></table>")
		}

		var onchange = function (  ){
			// clear any error 
			p.error = false;
			p.errmsg="";
			return $.isFunction(p.onChange) ? p.onChange.call( self, p ) : false;
		},
		/*
		 *Perform checking.
		 *
		*/
		checkData = function(val, colModelItem) {
			var ret = [true,""];
			if($.isFunction(colModelItem.searchrules)) {
				ret = colModelItem.searchrules(val, colModelItem);
			} else if($.jgrid && $.jgrid.checkValues) {
				try {
					ret = $.jgrid.checkValues(val, -1, null, colModelItem.searchrules, colModelItem.label);
				} catch (e) {}
			}
			if(ret && ret.length && ret[0] === false) {
				p.error = !ret[0];
				p.errmsg = ret[1];
			}
		}
		/*
		 * Redrow the filter every time when new field is added/deleted
		 * and field is  changed
		 */
		reDraw = function() {
			$("table.group:first",self).remove();
			var t = createTableForGroup(p.filter, null);
			$(self).append(t);
		},
		/*
		 * Creates a grouping data for the filter
		 * @param group - object
		 * @parent group - object
		 */
		createTableForGroup = function(group, parentgroup) {
			var that = this,  i;

			// this table will hold all the group (tables) and rules (rows)
			var table = $("<table class='group ui-widget ui-widget-content' style='border:0px none'><tbody>")
			// create error message row
			if(parentgroup == null) {
				$(table).append("<tr class='error' style='display:none;'><th colspan='5' class='ui-state-error'></th><tr>");
			}

			var tr = $("<tr></tr>");
			$(table).append(tr);
			// this header will hold the group operator type and group action buttons for
			// creating subgroup "+ {}", creating rule "+" or deleting the group "-"
			var th = $("<th colspan='5' align='left'></th>");
			tr.append(th);

			// dropdown for: choosing group operator type
			var groupOpSelect = $("<select class='opsel'></select>");
			th.append(groupOpSelect);
			// populate dropdown with all posible group operators: or, and
			var str= "", selected;
			for (i = 0; i < p.groupOps.length; i++) {
				selected =  group.groupOp == p.groupOps[i] ? "selected='selected'" :"";
				str += "<option value='"+p.groupOps[i]+"'" + selected+">"+p.groupOps[i]+"</option>"
			}

			groupOpSelect
			.append(str)
			.bind('change',function() {
				group.groupOp = $(groupOpSelect).val();
				onchange(); // signals that the filter has changed
			});

			// button for adding a new subgroup
			var inputAddSubgroup = $("<input type='button' value='+ {}' title='Add subgroup' class='add-group/>");
			inputAddSubgroup.bind('click',function() {
				if (group.groups == undefined ) {
					group.groups = [];
				}

				group.groups.push({
					groupOp: p.groupOps[0],
					rules: [],
					groups: []
				}); // adding a new group

				reDraw(); // the html has changed, force reDraw

				onchange(); // signals that the filter has changed
				return false;
			});
			th.append(inputAddSubgroup);

			// button for adding a new rule
			var inputAddRule = $("<input type='button' value='+' title='Add rule' class='add-rule/>");
			inputAddRule.bind('click',function() {
				//if(!group) { group = {};}
				if (group.rules == undefined)
					group.rules = [];

				group.rules.push({
					field: p.columns[0].name,
					op: p.ops[0].name,
					data: ""
				}); // adding a new rule

				reDraw(); // the html has changed, force reDraw
				// for the moment no change have been made to the rule, so
				// this will not trigger onchange event
				return false;
			});
			th.append(inputAddRule);

			// button for delete the group
			if (parentgroup != null) { // ignore the first group
				var inputDeleteGroup = $("<input type='button' value='-' title='Delete group' class='delete-group/>");
				th.append(inputDeleteGroup);
				inputDeleteGroup.bind('click',function() {
				// remove group from parent
					for (i = 0; i < parentgroup.groups.length; i++) {
						if (parentgroup.groups[i] == group) {
							parentgroup.groups.splice(i, 1);
							break;
						}
					}

					reDraw(); // the html has changed, force reDraw

					onchange(); // signals that the filter has changed
					return false;
				});
			}

			// append subgroup rows
			if (group.groups != undefined) {
				for (i = 0; i < group.groups.length; i++) {
					var trHolderForSubgroup = $("<tr></tr>");
					table.append(trHolderForSubgroup);

					var tdFirstHolderForSubgroup = $("<td class='first'></td>");
					trHolderForSubgroup.append(tdFirstHolderForSubgroup);

					var tdMainHolderForSubgroup = $("<td colspan='4'></td>");
					tdMainHolderForSubgroup.append(createTableForGroup(group.groups[i], group));
					trHolderForSubgroup.append(tdMainHolderForSubgroup);
				}
			}
			if(group.groupOp == undefined) {
				group.groupOp = p.groupOps[0];
			}

			// append rules rows
			if (group.rules != undefined) {
				for (i = 0; i < group.rules.length; i++) {
					table.append(
                       createTableRowForRule(group.rules[i], group)
					);
				}
			}

			return table;
		},
		/*
		 * Create the rule data for the filter
		 */
		createTableRowForRule = function(rule, group) {
			// save current entity in a variable so that it could
			// be referenced in anonimous method calls

			var tr = $("<tr></tr>"),
			//document.createElement("tr"),

			// first column used for padding
			//tdFirstHolderForRule = document.createElement("td"),
			i, o, df, op, trpar, cm, str="", selected;
			//tdFirstHolderForRule.setAttribute("class", "first");
			tr.append("<td class='first'></td>");


			// create field container
			var ruleFieldTd = $("<td class='columns'></td>");
			tr.append(ruleFieldTd);


			// dropdown for: choosing field
			var ruleFieldSelect = $("<select></select>");
			ruleFieldTd.append(ruleFieldSelect);
			ruleFieldSelect.bind('change',function() {
				rule.field = $(ruleFieldSelect).val();

				trpar = $(this).parents("tr:first");
				for (i=0;i<p.columns.length;i++) {
					if(p.columns[i].name ==  rule.field) {
						cm = p.columns[i];
						break;
					}
				}
				if(!cm) {return false;}
				var elm = $.jgrid.createEl(cm.inputtype,cm.options, "", true, p.ajaxSelectOptions);
				$(elm).addClass("input-elm");
				//that.createElement(rule, "");

				if( cm.opts ) {op = cm.opts;}
				else if  (cm.searchtype=='string') {op = p.stropts;}
				else {op = p.numopts;}
				// operators
				var s ="",so="";
				for ( i = 0; i < p.ops.length; i++) {
					if($.inArray(p.ops[i].name, op) !== -1) {
						so = rule.op == p.ops[i].name ? "selected=selected" : "";
						s += "<option value='"+p.ops[i].name+"' "+ so+">"+p.ops[i].description+"</option>";
					}
				}
				$(".selectopts",trpar).empty().append( s );

				// data
				$(".data",trpar).empty().append( elm );
				$(".input-elm",trpar).bind('change',function() {
					rule.data = this.value;
					onchange(); // signals that the filter has changed
				});
				rule.data = $(elm).val();
				onchange();  // signals that the filter has changed
			});

			// populate drop down with user provided column definitions
			var j=0;
			for (i = 0; i < p.columns.length; i++) {
				selected = "";
				if(rule.field == p.columns[i].name) {
					selected = "selected='selected'";
					j=i;
				}
				str += "<option value='"+p.columns[i].name+"'" +selected+">"+p.columns[i].name+"</option>";
			}
			ruleFieldSelect.append( str )


			// create operator container
			var ruleOperatorTd = $("<td class='operators'></td>");
			tr.append(ruleOperatorTd);
			cm = p.columns[j];
			// create it here so it can be referentiated in the onchange event
			//var RD = that.createElement(rule, rule.data);
			var ruleDataInput = $.jgrid.createEl(cm.inputtype,cm.options, rule.data, true, p.ajaxSelectOptions);

			// dropdown for: choosing operator
			var ruleOperatorSelect = $("<select class='selectopts'></select>");
			ruleOperatorTd.append(ruleOperatorSelect);
			ruleOperatorSelect.bind('change',function() {
				rule.op = $(ruleOperatorSelect).val();
				trpar = $(this).parents("tr:first");
				var rd = $(".input-elm",trpar)[0];
				if (rule.op == "nu" || rule.op == "nn") { // disable for operator "is null" and "is not null"
					rule.data = "";
					rd.value = "";
					rd.setAttribute("readonly", "true");
					rd.setAttribute("disabled", "true");
				} else {
					rd.removeAttribute("readonly");
					rd.removeAttribute("disabled");
				}

				onchange();  // signals that the filter has changed
			});

			// populate drop down with all available operators
			if( cm.opts ) {op = cm.opts;}
			else if  (cm.searchtype=='string') {op = p.stropts;}
			else {op = p.numopts;}
			str="";
			for ( i = 0; i < p.ops.length; i++) {
				if($.inArray(p.ops[i].name, op) !== -1) {
					selected = rule.op == p.ops[i].name ? "selected='selected'" : "";
					str += "<option value='"+p.ops[i].name+"'>"+p.ops[i].description+"</option>";
				}
			}
			ruleOperatorSelect.append( str );
			// create data container
			var ruleDataTd = $("<td class='data'></td>");
			tr.append(ruleDataTd);

			// textbox for: data
			// is created previously
			//ruleDataInput.setAttribute("type", "text");
			ruleDataTd.append(ruleDataInput);

			$(ruleDataInput)
			.addClass("input-elm")
			.bind('change', function() {
				rule.data = $(this).val();

				onchange(); // signals that the filter has changed
			});

			// create action container
			var ruleDeleteTd = $("<td></td>");
			tr.append(ruleDeleteTd);

			// create button for: delete rule
			var ruleDeleteInput = $("<input type='button' value='-' title='Delete rule' class='delete-rule'/>");
			ruleDeleteTd.append(ruleDeleteInput);
			//$(ruleDeleteInput).html("").height(20).width(30).button({icons: {  primary: "ui-icon-minus", text:false}});
			ruleDeleteInput.bind('click',function() {
				// remove rule from group
				for (i = 0; i < group.rules.length; i++) {
					if (group.rules[i] == rule) {
						group.rules.splice(i, 1);
						break;
					}
				}

				reDraw(); // the html has changed, force reDraw

				onchange(); // signals that the filter has changed
				return false;
			});

			return tr;
		},

		getStringForGroup = function(group) {
			var s = "(", index;
			if (group.groups != undefined) {
				for (index = 0; index < group.groups.length; index++) {
					if (s.length > 1)
						s += " " + group.groupOp + " ";

					try {
						s += getStringForGroup(group.groups[index]);
					} catch (e) {alert(e);}
				}
			}

			if (group.rules != undefined) {
				try{
					for (index = 0; index < group.rules.length; index++) {
						if (s.length > 1)
							s += " " + group.groupOp + " ";
						s += getStringForRule(group.rules[index]);
					}
				} catch (e) {alert(e);}
			}

			s += ")";

			if (s == "()")
				return ""; // ignore groups that don't have rules
			else
				return s;
		},
		getStringForRule = function(rule) {
			var opUF = "",opC="", i, cm, ret, val,
			numtypes = ['int', 'integer', 'float', 'number', 'currency']; // jqGrid
			for (i = 0; i < p.ops.length; i++) {
				if (p.ops[i].name == rule.op) {
					opUF = p.ops[i].operator;
					opC = p.ops[i].name;
					break;
				}
			}
			for (i=0; i<p.columns.length; i++) {
				if(p.columns[i].name == rule.field) {
					cm = p.columns[i];
					break;
				}
			}
			val = rule.data;
			if(opC == 'bw' || opC == 'bn') val = val+"%";
			if(opC == 'ew' || opC == 'en') val = "%"+val;
			if(opC == 'cn' || opC == 'nc') val = "%"+val+"%";
			checkData(rule.data, cm);
			if($.inArray(cm.searchtype, numtypes) !== -1 || opC=='nn' || opC=='nu') ret = rule.field + " " + opUF + " " + val + "";
			else ret = rule.field + " " + opUF + " \"" + val + "\"";
			return ret;
		};
		this.hideError = function() {
			$("th.ui-state-error", this).html("");
			$("tr.error", this).hide();
		};
		this.showError = function() {
			$("th.ui-state-error", this).html(this.p.errmsg);
			$("tr.error", this).show();
		};
		this.toUserFriendlyString = function() {
			return getStringForGroup(p.filter);
		};
		this.toString = function() {
			// this will obtain a string that can be used to match an item.

			function getStringForGroup(group) {
				var s = "(", index;

				if (group.groups != undefined) {
					for (index = 0; index < group.groups.length; index++) {
						if (s.length > 1) {
							if (group.groupOp == "OR")
								s += " || ";
							else
								s += " && ";
						}
						s += getStringForGroup(group.groups[index]);
					}
				}

				if (group.rules != undefined) {
					for (index = 0; index < group.rules.length; index++) {
						if (s.length > 1) {
							if (group.groupOp == "OR")
								s += " || ";
							else
								s += " && ";
						}
						s += getStringForRule(group.rules[index]);
					}
				}

				s += ")";

				if (s == "()")
					return ""; // ignore groups that don't have rules
				else
					return s;
			}
			function getStringForRule(rule) {
				return rule.op + "(item." + rule.field + ",'" + rule.data + "')";
			}

			return getStringForGroup(self.p.filter);
		}

		// Here we init the filter
		reDraw();

		if(p.showQuery) {
			onchange();
		}
		// mark is as created so that it will not be created twice on this element
		this.filter = true;
	});
};
$.extend($.fn.jqFilter,{
	/*
	 * Return SQL like string. Can be used directly
	 */
	toSQLString : function()
	{
		var s ="";
		this.each(function(){
			s = this.toUserFriendlyString();
		});
		return s;
	},
	/*
	 * Return filter data as object.
	 */
	filterData : function()
	{
		var s;
		this.each(function(){
			s = this.p.filter;
		});
		return s;

	},
	getParameter : function (param) {
		if(param !== undefined) {
			if (this.p.hasOwnProperty(param) )
				return this.p[param];
		}
		return this.p;
	}

});
})(jQuery);
