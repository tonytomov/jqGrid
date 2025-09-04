/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

$.jgrid.extend({
	columnMenu : function (top, left, op) {
		return this.each(function(){
		var ts = this, getstyle = $.jgrid.getMethod("getStyleUI"),
		stylemodule = ts.p.styleUI + ".common",			
		hover = getstyle(stylemodule,'hover', true),
		iconbase = getstyle(stylemodule,'icon_base', true),
		colmenustyle = $.jgrid.styleUI[(ts.p.styleUI || 'jQueryUI')].colmenu,

		cm = ts.p.colModel, len = cm.length, i, cols=[], disp, all_visible = true, cols_nm=[],
		colNm = $.extend([], ts.p.colNames), iCol,
		texts = $.jgrid.getRegional(ts, "colmenu"), colArr =[],
		str1 = '<ul id="new_col_menu" class="ui-search-menu  ui-col-menu modal-content" role="menu" tabindex="0" style="left:'+left+'px;top:'+top+'px;">';
		if($("#new_col_menu")[0] !== undefined) {
			return;
		}
		if( op && op.selectAll ) {
			str1 += '<li class="ui-menu-item disabled" role="presentation" draggable="false"><a class="g-menu-item" tabindex="0" role="menuitem" ><table class="ui-common-table" ><tr><td class="menu_icon" title="'+texts.reorder+'"><span class="'+iconbase+' '+colmenustyle.icon_move+' notclick" style="visibility:hidden"></span></td><td class="menu_icon"><input id="chk_all" class="'+colmenustyle.input_checkbox+'" type="checkbox" name="check_all"></td><td class="menu_text">Check/Uncheck</td></tr></table></a></li>';
		}
		if(ts.p.colSpanHeader.length) { // fo future work Currently does not work
			for(var cj = 0;cj<ts.p.colSpanHeader.length;cj++) {
				var clitem = ts.p.colSpanHeader[cj];
				iCol = $.jgrid.getElemByAttrVal( cm, 'name', clitem.startColumnName, true);
				if(iCol >= 0) {
					colArr.push(iCol);
					colNm[iCol] = clitem.titleText;
				}
			}
		}
		if( $(ts).jqGrid('isGroupHeaderOn') /*&& opts.groupHeaders*/) {
			var gh_len = ts.p.groupHeader.length,
			// use the last set one
			groupH = ts.p.groupHeader[gh_len-1];
				for(var ij=0;ij<colNm.length; ij++){
				iCol = $.jgrid.inColumnHeader( cm[ij].name, groupH.groupHeaders);
				if(iCol>=0) {
					colNm[ij] = groupH.groupHeaders[iCol].titleText + "::" + colNm[ij];
					for(var jj= 1; jj<= groupH.groupHeaders[iCol].numberOfColumns-1; jj++) {
					colNm[ij+jj] = groupH.groupHeaders[iCol].titleText + "::" + colNm[ij+jj];
					}
					ij = ij+groupH.groupHeaders[iCol].numberOfColumns-1;
				}
			}
		}
		for(i=0;i<len;i++) {
		//if(!cm[i].hidedlg) { // column chooser
			var hid = !cm[i].hidden ? "checked" : "", 
				nm = cm[i].name, 
				lb = colNm[i]; //ts.p.colNames[i];
			disp = (nm === 'cb' || nm==='subgrid' || nm==='rn' || nm==='sc' ||  cm[i].hidedlg) ? "style='display:none'" :"";
			str1 += '<li '+disp+' class="ui-menu-item" role="presentation" draggable="true"><a class="g-menu-item" tabindex="0" role="menuitem" ><table class="ui-common-table" ><tr><td class="menu_icon" title="'+texts.reorder+'"><span class="'+iconbase+' '+colmenustyle.icon_move+' notclick"></span></td><td class="menu_icon"><input class="'+colmenustyle.input_checkbox+' chk_selected" type="checkbox" name="'+nm+'" '+hid+'></td><td class="menu_text">'+lb+'</td></tr></table></a></li>';
			cols.push(i);
			if( disp === "") {
				cols_nm.push(nm);
			}
			if(all_visible && hid==="") {
				all_visible = false;
			}
		}
		str1 += "</ul>";
		$('body').append(str1);
		$("#new_col_menu").addClass("ui-menu " + colmenustyle.menu_widget);
			$("#chk_all", "#new_col_menu").prop("checked",all_visible);
		if(!$.jgrid.isElementInViewport($("#new_col_menu")[0])){
			$("#new_col_menu").css("left", - parseInt($("#column_menu").innerWidth(),10) +"px");
		}
		if($.fn.html5sortable()) {
			$("#new_col_menu").html5sortable({
				handle: 'span',
				items: ':not(.disabled)',
				forcePlaceholderSize: true }
			).on('sortupdate', function(e, ui) {
				cols.splice( ui.startindex,1);
				cols.splice(ui.endindex, 0, ui.startindex);
				$(ts).jqGrid("destroyFrozenColumns");
				$(ts).jqGrid("remapColumns", cols, true);
				$(ts).triggerHandler("jqGridColMenuColumnDone", [cols, null, null]);
				if($.jgrid.isFunction(ts.p.colMenuColumnDone)) {
					ts.p.colMenuColumnDone.call( ts, cols, null, null);
				}
				$(ts).jqGrid("setFrozenColumns");
				for(i=0;i<len;i++) {
					cols[i] = i;
				}
			});
		} // NO jQuery UI
		$("#new_col_menu > li > a").on("click", function(e) {
			var checked, col_name;
			if($(e.target).hasClass('notclick')) {
				return;
			}
			if($(e.target).is(":input")) {
				checked = $(e.target).is(":checked");
			} else {
				checked = !$("input", this).is(":checked");
				$("input", this).prop("checked",checked);
			}
			col_name = $("input", this).attr('name');
			if(col_name === "check_all") {
				if(!checked) {
				$("input", "#new_col_menu" ).prop("checked",false);
					$(ts).jqGrid('hideCol', cols_nm);
				} else {
					$("input", "#new_col_menu" ).prop("checked",true);
					$(ts).jqGrid('showCol', cols_nm);
				}
			} else {
				$(ts).triggerHandler("jqGridColMenuColumnDone", [cols, col_name, checked]);
				if($.jgrid.isFunction(ts.p.colMenuColumnDone)) {
					ts.p.colMenuColumnDone.call( ts, cols, col_name, checked);
				}
				if(!checked) {
					$(ts).jqGrid('hideCol', col_name);
					//$(this).parent().attr("draggable","false");
				} else {
					$(ts).jqGrid('showCol', col_name );
					//$(this).parent().attr("draggable","true");
				}
				if(op.columns_selectAll) {
					$("#chk_all", "#new_col_menu").prop("checked",  $('.chk_selected:checked', "#new_col_menu").length === $('.chk_selected', "#new_col_menu").length );
				}
			}
		}).hover(function(){
			$(this).addClass(hover);
		},function(){
			$(this).removeClass(hover);
		});
		$("body").on('click', function(e){
			if(!$(e.target).closest("#new_col_menu").length) {
				try {
					$("#new_col_menu").remove();
				} catch (e1) {}
			}
		});
	});
	}	
});
