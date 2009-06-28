;(function($){
/**
 * jqGrid extension for manipulating columns properties
 * Piotr Roznicki roznicki@o2.pl
 * http://www.roznicki.prv.pl
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
$.fn.extend({
	setColumns : function(p) {
		p = $.extend({
			top : 0,
			left: 0,
			width: 200,
			height: 195,
			modal: false,
			drag: true,
			closeicon: 'ico-close.gif',
			beforeShowForm: null,
			afterShowForm: null,
			afterSubmitForm: null,
			jqModal : false,
			closeOnEscape : true,
			ShrinkToFit : false,
			jqModal : false,
			saveicon: [true,"left","ui-icon-disk"],
			closeicon: [true,"left","ui-icon-close"]
		}, $.jgrid.col, p ||{});
		return this.each(function(){
			var $t = this;
			if (!$t.grid ) { return; }
			var onBeforeShow = typeof p.beforeShowForm === 'function' ? true: false;
			var onAfterShow = typeof p.afterShowForm === 'function' ? true: false;
			var onAfterSubmit = typeof p.afterSubmitForm === 'function' ? true: false;			
			if(!p.imgpath) { p.imgpath= $t.p.imgpath; } // Added From Tony Tomov
			var gID = $t.p.id;
			var IDs = {themodal:'colmod'+gID,modalhead:'colhd'+gID,modalcontent:'colcnt'+gID};
			var dtbl = "ColTbl_"+gID;
			if ( $("#"+IDs.themodal).html() != null ) {
				if(onBeforeShow) { p.beforeShowForm($("#"+dtbl)); }
				viewModal("#"+IDs.themodal,{gbox:"#gbox_"+gID,jqm:p.jqModal, jqM:false});
				if(onAfterShow) { p.afterShowForm($("#"+dtbl)); }
			} else {
				var tbl =$("<table id='"+dtbl+"' class='ColTable EditTable' cellspacing='1' cellpading='2' border='0' style='table-layout:fixed'><tbody></tbody></table>");
				for(i=0;i<this.p.colNames.length;i++){
					if(!$t.p.colModel[i].hidedlg) { // added from T. Tomov
						$(tbl).append("<tr><td ><input type='checkbox' id='col_" + this.p.colModel[i].name + "' class='cbox' value='T' " + 
						((this.p.colModel[i].hidden===false)?"checked":"") + "/>" +  "<label for='col_" + this.p.colModel[i].name + "'>" + this.p.colNames[i] + "(" + this.p.colModel[i].name + ")</label></td></tr>");
					}
				}
				var bS  ="<a href='javascript:void(0)' id='dData' class='fm-button ui-state-default ui-corner-all'>"+p.bSubmit+"</a>",
				bC  ="<a href='javascript:void(0)' id='eData' class='fm-button ui-state-default ui-corner-all'>"+p.bCancel+"</a>";
				$(tbl).append("<tr><td class='ColButton EditButton'>"+bS+"&nbsp;"+bC+"</td></tr>");
				if(p.saveicon[0]==true) {
					$("#dData",tbl).addClass(p.saveicon[1] == "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
					.append("<span class='ui-icon "+p.saveicon[2]+"'></span>");
				}
				if(p.closeicon[0]==true) {
					$("#eData",tbl).addClass(p.closeicon[1] == "right" ? 'fm-button-icon-right' : 'fm-button-icon-left')
					.append("<span class='ui-icon "+p.closeicon[2]+"'></span>");
				}
				p.gbox = "#gbox_"+gID;
				createModal(IDs,tbl,p,"#gview_"+$t.p.id,$("#gview_"+$t.p.id)[0]);
				//if( p.drag) { DnRModal("#"+IDs.themodal,"#"+IDs.modalhead+" td.modaltext"); }
				$("#dData","#"+dtbl).click(function(e){
					for(i=0;i<$t.p.colModel.length;i++){
						if(!$t.p.colModel[i].hidedlg) { // added from T. Tomov
							if($("#col_" + $t.p.colModel[i].name).attr("checked")) {
								$($t).showCol($t.p.colModel[i].name);
								$("#col_" + $t.p.colModel[i].name).attr("defaultChecked",true); // Added from T. Tomov IE BUG
							} else {
								$($t).hideCol($t.p.colModel[i].name);
								$("#col_" + $t.p.colModel[i].name).attr("defaultChecked",""); // Added from T. Tomov IE BUG
							}
						}
					}
					if(p.ShrinkToFit===true) {
						$($t).setGridWidth($t.grid.width-0.01,true);
					}
					hideModal("#"+IDs.themodal,{gb:"#gbox_"+gID,jqm:p.jqModal});
					if (onAfterSubmit) { p.afterSubmitForm($("#"+dtbl)); }
					return false;
				});
				$("#eData", "#"+dtbl).click(function(e){
					hideModal("#"+IDs.themodal,{gb:"#gbox_"+gID,jqm:p.jqModal});
					return false;
				});
				$("#dData, #eData","#"+dtbl).hover(
				   function(){$(this).addClass('ui-state-hover');}, 
				   function(){$(this).removeClass('ui-state-hover');}
				);				
				if(onBeforeShow) { p.beforeShowForm($("#"+dtbl)); }
				viewModal("#"+IDs.themodal,{gbox:"#gbox_"+gID,jqm:p.jqModal, jqM: true});
				if(onAfterShow) { p.afterShowForm($("#"+dtbl)); }
			}
		});
	}
});
})(jQuery);