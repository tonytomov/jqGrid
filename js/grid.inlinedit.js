;(function($){
/**
 * jqGrid extension for manipulating Grid Data
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/ 
$.fn.extend({
//Editing
	editRow : function(rowid,keys,oneditfunc,succesfunc, url, extraparam, aftersavefunc,errorfunc) {
		return this.each(function(){
			var $t = this, nm, tmp, editable, cnt=0, focus=null, svr=[], ind;
			if (!$t.grid ) { return; }
			var sz, ml,hc;
			if( !$t.p.multiselect ) {
				ind = $($t).getInd($t.rows,rowid);
				if( ind === false ) {return;}
				editable = $($t.rows[ind]).attr("editable") || "0";
				if (editable == "0") {
					$('td',$t.rows[ind]).each( function(i) {
						nm = $t.p.colModel[i].name;
						hc = $t.p.colModel[i].hidden===true ? true : false;
						try {
							tmp =  $.unformat(this,{colModel:$t.p.colModel[i]},i);
						} catch (_) {
							tmp = $(this).html();
						}
						svr[nm]=tmp;
						if ( nm !== 'cb' && nm !== 'subgrid' && $t.p.colModel[i].editable===true && !hc) {
							if(focus===null) { focus = i; }
							$(this).html("");
							var opt = $.extend($t.p.colModel[i].editoptions || {} ,{id:rowid+"_"+nm,name:nm});
							if(!$t.p.colModel[i].edittype) { $t.p.colModel[i].edittype = "text"; }
							var elc = createEl($t.p.colModel[i].edittype,opt,tmp,$(this));
							$(elc).addClass("editable");
							$(this).append(elc);
							//Agin IE
							if($t.p.colModel[i].edittype == "select" && $t.p.colModel[i].editoptions.multiple===true && $.browser.msie) {
								$(elc).width($(elc).width());
							}
							cnt++;
						}
					});
					if(cnt > 0) {
						svr['id'] = rowid; $t.p.savedRow.push(svr);
						$($t.rows[ind]).attr("editable","1");
						$("td:eq("+focus+") input",$t.rows[ind]).focus();
						if(keys===true) {
							$($t.rows[ind]).bind("keydown",function(e) {
								if (e.keyCode === 27) { $($t).restoreRow(rowid);}
								if (e.keyCode === 13) {
									$($t).saveRow(rowid,succesfunc, url, extraparam, aftersavefunc,errorfunc);
									return false;
								}
								e.stopPropagation();
							});
						}
						if( $.isFunction(oneditfunc)) { oneditfunc(rowid); }
					}
				}
			}
		});
	},
	saveRow : function(rowid, succesfunc, url, extraparam, aftersavefunc,errorfunc) {
		return this.each(function(){
		var $t = this, nm, tmp={}, tmp2={}, editable, fr, cv, ms, ind;
		if (!$t.grid ) { return; }
		ind = $($t).getInd($t.rows,rowid);
		if(ind === false) {return;}
		editable = $($t.rows[ind]).attr("editable");
		url = url ? url : $t.p.editurl;
		if (editable==="1" && url) {
			$("td",$t.rows[ind]).each(function(i) {
				nm = $t.p.colModel[i].name;
				if ( nm !== 'cb' && nm !== 'subgrid' && $t.p.colModel[i].editable===true) {
					if( $t.p.colModel[i].hidden===true) { tmp[nm] = $(this).html(); }
					else {
						switch ($t.p.colModel[i].edittype) {
							case "checkbox":
								var cbv = ["Yes","No"];
								if($t.p.colModel[i].editoptions ) {
									cbv = $t.p.colModel[i].editoptions.value.split(":");
								}
								tmp[nm]=  $("input",this).attr("checked") ? cbv[0] : cbv[1]; 
								break;
							case 'text':
							case 'password':
							case 'textarea':
							case "button" :
								tmp[nm]= !$t.p.autoencode ? $("input, textarea",this).val() : htmlEncode($("input, textarea",this).val());
								break;
							case 'select':
								if(!$t.p.colModel[i].editoptions.multiple) {
									tmp[nm] = $("select>option:selected",this).val();
									tmp2[nm] = $("select>option:selected", this).text();
								} else {
									var sel = $("select",this);
									tmp[nm] = $(sel).val();
									var selectedText = [];
									$("select > option:selected",this).each(
										function(i,selected){
											selectedText[i] = $(selected).text();
										}
									);
									tmp2[nm] = selectedText.join(",");
								}
								break;
						}
						cv = checkValues(tmp[nm],i,$t);
						if(cv[0] === false) {
							cv[1] = tmp[nm] + " " + cv[1];
							return false;
						}
					}
				}
			});
			if (cv[0] === false){
				try {
					info_dialog($.jgrid.errors.errcap,cv[1],$.jgrid.edit.bClose, $t.p.imgpath);
				} catch (e) {
					alert(cv[1]);
				}
				return;
			}
			if(tmp) { tmp["id"] = rowid; if(extraparam) { tmp = $.extend({},tmp,extraparam);} }
			if(!$t.grid.hDiv.loading) {
				$t.grid.hDiv.loading = true;
				$("div.loading",$t.grid.hDiv).fadeIn("fast");
				if (url == 'clientArray') {
					tmp = $.extend({},tmp, tmp2);
					$($t).setRowData(rowid,tmp);
					$($t.rows[ind]).attr("editable","0");
					for( var k=0;k<$t.p.savedRow.length;k++) {
						if( $t.p.savedRow[k].id===rowid) {fr = k; break;}
					}
					if(fr >= 0) { $t.p.savedRow.splice(fr,1); }
					if( $.isFunction(aftersavefunc) ) { aftersavefunc(rowid,res.responseText); }
				} else {
					$.ajax({url:url,
						data: tmp,
						type: "POST",
						complete: function(res,stat){
							if (stat === "success"){
								var ret;
								if( $.isFunction(succesfunc)) { ret = succesfunc(res);}
								else ret = true;
								if (ret===true) {
									tmp = $.extend({},tmp, tmp2);
									$($t).setRowData(rowid,tmp);
									$($t.rows[ind]).attr("editable","0");
									for( var k=0;k<$t.p.savedRow.length;k++) {
										if( $t.p.savedRow[k].id===rowid) {fr = k; break;}
									};
									if(fr >= 0) { $t.p.savedRow.splice(fr,1); }
									if( $.isFunction(aftersavefunc) ) { aftersavefunc(rowid,res.responseText); }
								} else { $($t).restoreRow(rowid); }
							}
						},
						error:function(res,stat){
							if($.isFunction(errorfunc) ) {
								errorfunc(res,stat);
							} else {
								alert("Error Row: "+rowid+" Result: " +res.status+":"+res.statusText+" Status: "+stat);
							}
						}
					});
				}
				$t.grid.hDiv.loading = false;
				$("div.loading",$t.grid.hDiv).fadeOut("fast");
				$($t.rows[ind]).unbind("keydown");
			}
		}
		});
	},
	restoreRow : function(rowid) {
		return this.each(function(){
			var $t= this, nm, fr,ind;
			if (!$t.grid ) { return; }
			ind = $($t).getInd($t.rows,rowid);
			if(ind === false) {return;}
			for( var k=0;k<$t.p.savedRow.length;k++) {
				if( $t.p.savedRow[k].id===rowid) {fr = k; break;}
			}
			if(fr >= 0) {
				$($t).setRowData(rowid,$t.p.savedRow[fr]);
				$($t.rows[ind]).attr("editable","0");
				$t.p.savedRow.splice(fr,1);
			}
		});
	}
//end inline edit
});
})(jQuery);
