;(function($) {
/*
**
 * jqGrid extension - Tree Grid
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/ 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/ 
$.fn.extend({
	setTreeNode : function(rd, row){
		return this.each(function(){
			var $t = this;
			if( !$t.grid || !$t.p.treeGrid ) { return; }
			var expCol=0,i=0;
			if(!$t.p.expColInd) {
				for (var key in $t.p.colModel){
					if($t.p.colModel[key].name == $t.p.ExpandColumn) {
						expCol = i;
						$t.p.expColInd = expCol;
						break;
					}
					i++;
				}
				if(!$t.p.expColInd ) {$t.p.expColInd = expCol;}
			} else {
				expCol = $t.p.expColInd;
			}
			var expanded = $t.p.treeReader.expanded_field;
			var isLeaf = $t.p.treeReader.leaf_field;
			var level = $t.p.treeReader.level_field;
			row.level = rd[level];
			
			if($t.p.treeGridModel == 'nested') {
				row.lft = rd[$t.p.treeReader.left_field];
				row.rgt = rd[$t.p.treeReader.right_field];
				if(!rd[isLeaf]) {
				// NS Model
					rd[isLeaf] = (parseInt(row.rgt,10) === parseInt(row.lft,10)+1) ? 'true' : 'false';
				}
			} else {
				row.parent_id = rd[$t.p.treeReader.parent_id_field];
			}
			
			var curExpand = (rd[expanded] && rd[expanded] == "true") ? true : false;
			var curLevel = parseInt(row.level,10);
			var ident,lftpos;
			if($t.p.tree_root_level === 0) {
				ident = curLevel+1;
				lftpos = curLevel;
			} else {
				ident = curLevel;
				lftpos = curLevel -1;
			}
			var twrap = document.createElement("div");
			$(twrap).addClass("tree-wrap").width(ident*18);
			var treeimg = document.createElement("div");
			$(treeimg).css("left",lftpos*18).addClass("ui-icon");
			twrap.appendChild(treeimg);

			if(rd[isLeaf] == "true") {
				$(treeimg).addClass($t.p.treeIcons.leaf+" tree-leaf");
				row.isLeaf = true;
			} else {
				if(rd[expanded] == "true") {
					$(treeimg).addClass($t.p.treeIcons.minus+" tree-minus treeclick");
					row.expanded = true;
				} else {
					$(treeimg).addClass($t.p.treeIcons.plus+" tree-plus treeclick");
					row.expanded = false;
				}
				row.isLeaf = false;
			}
			if(parseInt(rd[level],10) !== parseInt($t.p.tree_root_level,10)) {                
				if(!$($t).isVisibleNode(row)){ 
					$(row).css("display","none");
				}
			}
			var mhtm = $("td:eq("+expCol+")",row).html();
			var thecell = $("td:eq("+expCol+")",row).html("<span>"+mhtm+"</span>").prepend(twrap);
			$(".treeclick",thecell).click(function(e){
				var target = e.target || e.srcElement;
				var ind =$(target,$t.rows).parents("tr:first")[0].rowIndex;
				if(!$t.rows[ind].isLeaf){
					if($t.rows[ind].expanded){
						$($t).collapseRow($t.rows[ind]);
						$($t).collapseNode($t.rows[ind]);
					} else {
						$($t).expandRow($t.rows[ind]);
						$($t).expandNode($t.rows[ind]);
					}
				}
				//e.stopPropagation();
				return false;
			});
			if($t.p.ExpandColClick === true) {
			$("span", thecell).css("cursor","pointer").click(function(e){
				var target = e.target || e.srcElement;
				var ind =$(target,$t.rows).parents("tr:first")[0].rowIndex;
				if(!$t.rows[ind].isLeaf){
					if($t.rows[ind].expanded){
						$($t).collapseRow($t.rows[ind]);
						$($t).collapseNode($t.rows[ind]);
					} else {
						$($t).expandRow($t.rows[ind]);
						$($t).expandNode($t.rows[ind]);
					}
				}
				$($t).setSelection($t.rows[ind].id);
				return false;
			});
			}
		});
	},
	setTreeGrid : function() {
		return this.each(function (){
			var $t = this;
			if(!$t.p.treeGrid) { return; }
			$.extend($t.p,{treedatatype: null});
			$t.p.treeIcons = $.extend({plus:'ui-icon-triangle-1-e',minus:'ui-icon-triangle-1-s',leaf:'ui-icon-radio-off'},$t.p.treeIcons || {});
			if($t.p.treeGridModel == 'nested') {
				$t.p.treeReader = $.extend({
					level_field: "level",
					left_field:"lft",
					right_field: "rgt",
					leaf_field: "isLeaf",
					expanded_field: "expanded"
				},$t.p.treeReader);
			} else
				if($t.p.treeGridModel == 'adjacency') {
				$t.p.treeReader = $.extend({
						level_field: "level",
						parent_id_field: "parent",
						leaf_field: "isLeaf",
						expanded_field: "expanded"
				},$t.p.treeReader );
			}
		});
	},
	expandRow: function (record){
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) { return; }
			var childern = $($t).getNodeChildren(record);
			//if ($($t).isVisibleNode(record)) {
			$(childern).each(function(i){
				$(this).css("display","");
				if(this.expanded) {
					$($t).expandRow(this);
				}
			});
			//}
		});
	},
	collapseRow : function (record) {
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) { return; }
			var childern = $($t).getNodeChildren(record);
			$(childern).each(function(i){
				$(this).css("display","none");
				$($t).collapseRow(this);
			});
		});
	},
	// NS ,adjacency models
	getRootNodes : function() {
		var result = [];
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) { return; }
			switch ($t.p.treeGridModel) {
				case 'nested' :
					var level = $t.p.treeReader.level_field;
					$($t.rows).each(function(i){
						if(parseInt(this[level],10) === parseInt($t.p.tree_root_level,10)) {
							result.push(this);
						}
					});
					break;
				case 'adjacency' :
					$($t.rows).each(function(i){
						if(this.parent_id.toLowerCase() == "null") {
							result.push(this);
						}
					});
					break;
			}
		});
		return result;
	},
	getNodeDepth : function(rc) {
		var ret = null;
		this.each(function(){
			var $t = this;
			if(!this.grid || !this.p.treeGrid) { return; }
			switch ($t.p.treeGridModel) {
				case 'nested' :
					ret = parseInt(rc.level,10) - parseInt(this.p.tree_root_level,10);
					break;
				case 'adjacency' :
					ret = $($t).getNodeAncestors(rc);
					break;
			}
		});
		return ret;
	},
	getNodeParent : function(rc) {
		var result = null;
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) { return; }
			switch ($t.p.treeGridModel) {
				case 'nested' :
					var lft = parseInt(rc.lft,10), rgt = parseInt(rc.rgt,10), level = parseInt(rc.level,10);
					$(this.rows).each(function(){
						if(parseInt(this.level,10) === level-1 && parseInt(this.lft) < lft && parseInt(this.rgt) > rgt) {
							result = this;
							return false;
						}
					});
					break;
				case 'adjacency' :
					$(this.rows).each(function(){
						if(this.id === rc.parent_id ) {
							result = this;
							return false;
						}
					});
					break;
			}
		});
		return result;
	},
	getNodeChildren : function(rc) {
		var result = [];
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) { return; }
			switch ($t.p.treeGridModel) {
				case 'nested' :
					var lft = parseInt(rc.lft,10), rgt = parseInt(rc.rgt,10), level = parseInt(rc.level,10);
					var ind = rc.rowIndex;
					$(this.rows).slice(1).each(function(i){
						if(parseInt(this.level,10) === level+1 && parseInt(this.lft,10) > lft && parseInt(this.rgt,10) < rgt) {
							result.push(this);
						}
					});
					break;
				case 'adjacency' :
					$(this.rows).slice(1).each(function(i){
						if(this.parent_id == rc.id) {
							result.push(this);
						}
					});
					break;
			}
		});
		return result;
	},
	getFullTreeNode : function(rc) {
		var result = [];
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) { return; }
			switch ($t.p.treeGridModel) {
				case 'nested' :
					var lft = parseInt(rc.lft,10), rgt = parseInt(rc.rgt,10), level = parseInt(rc.level,10);
					var ind = rc.rowIndex;
					$(this.rows).slice(1).each(function(i){
						if(parseInt(this.level,10) >= level && parseInt(this.lft,10) >= lft && parseInt(this.lft,10) <= rgt) {
							result.push(this);
						}
					});
					break;
				case 'adjacency' :
					break;
			}
		});
		return result;
	},	
	// End NS, adjacency Model
	getNodeAncestors : function(rc) {
		var ancestors = [];
		this.each(function(){
			if(!this.grid || !this.p.treeGrid) { return; }
			var parent = $(this).getNodeParent(rc);
			while (parent) {
				ancestors.push(parent);
				parent = $(this).getNodeParent(parent);	
			}
		});
		return ancestors;
	},
	isVisibleNode : function(rc) {
		var result = true;
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) { return; }
			var ancestors = $($t).getNodeAncestors(rc);
			$(ancestors).each(function(){
				result = result && this.expanded;
				if(!result) {return false;}
			});
		});
		return result;
	},
	isNodeLoaded : function(rc) {
		var result;
		this.each(function(){
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) { return; }
			if(rc.loaded !== undefined) {
				result = rc.loaded;
			} else if( rc.isLeaf || $($t).getNodeChildren(rc).length > 0){
				result = true;
			} else {
				result = false;
			}
		});
		return result;
	},
	expandNode : function(rc) {
		return this.each(function(){
			if(!this.grid || !this.p.treeGrid) { return; }
			if(!rc.expanded) {
				if( $(this).isNodeLoaded(rc) ) {
					rc.expanded = true;
					$("div.treeclick",rc).removeClass(this.p.treeIcons.plus+" tree-plus").addClass(this.p.treeIcons.minus+" tree-minus");
				} else {
					rc.expanded = true;
					$("div.treeclick",rc).removeClass(this.p.treeIcons.plus+" tree-plus").addClass(this.p.treeIcons.minus+" tree-minus");
					this.p.treeANode = rc.rowIndex;
					this.p.datatype = this.p.treedatatype;
					if(this.p.treeGridModel == 'nested') {
						$(this).setGridParam({postData:{nodeid:rc.id,n_left:rc.lft,n_right:rc.rgt,n_level:rc.level}});
					} else {
						$(this).setGridParam({postData:{nodeid:rc.id,parentid:rc.parent_id,n_level:rc.level}});
					}
					$(this).trigger("reloadGrid");
					if(this.p.treeGridModel == 'nested') {
						$(this).setGridParam({postData:{nodeid:'',n_left:'',n_right:'',n_level:''}});
					} else {
						$(this).setGridParam({postData:{nodeid:'',parentid:'',n_level:''}}); 
					}
				}
			}
		});
	},
	collapseNode : function(rc) {
		return this.each(function(){
			if(!this.grid || !this.p.treeGrid) { return; }
			if(rc.expanded) {
				rc.expanded = false;
				$("div.treeclick",rc).removeClass(this.p.treeIcons.minus+" tree-minus").addClass(this.p.treeIcons.plus+" tree-plus");
			}
		});
	},
	SortTree : function( newDir) {
		return this.each(function(){
			if(!this.grid || !this.p.treeGrid) { return; }
			var i, len,
			rec, records = [], $t = this,
			roots = $(this).getRootNodes();
			// Sorting roots
			roots.sort(function(a, b) {
				if (a.sortKey < b.sortKey) {return -newDir;}
				if (a.sortKey > b.sortKey) {return newDir;}
				return 0;
			});
			if(roots[0]){
				$("td",roots[0]).each( function( k ) {
					$(this).css("width",$t.grid.headers[k].width+"px");
					$t.grid.cols[k] = this;
				});
			}
			// Sorting children
			for (i = 0, len = roots.length; i < len; i++) {
				rec = roots[i];
				records.push(rec);
				$(this).collectChildrenSortTree(records, rec, newDir);
			}
			$.each(records, function(index, row) {
				$('tbody',$t.grid.bDiv).append(row);
				row.sortKey = null;
			});
		});
	},
	collectChildrenSortTree : function(records, rec, newDir) {
		return this.each(function(){
			if(!this.grid || !this.p.treeGrid) { return; }
			var i, len,
			child, 
			children = $(this).getNodeChildren(rec);
			children.sort(function(a, b) {
				if (a.sortKey < b.sortKey) {return -newDir;}
				if (a.sortKey > b.sortKey) {return newDir;}
				return 0;
			});
			for (i = 0, len = children.length; i < len; i++) {
				child = children[i];
				records.push(child);
				$(this).collectChildrenSortTree(records, child,newDir); 
			}
		});
	},
	// experimental 
	setTreeRow : function(rowid, data) {
		var nm, success=false;
		this.each(function(){
			var t = this;
			if(!t.grid || !t.p.treeGrid) { return; }
			success = $(t).setRowData(rowid,data);
		});
		return success;
	},
	delTreeNode : function (rowid) {
		return this.each(function () {
			var $t = this;
			if(!$t.grid || !$t.p.treeGrid) { return; }
			var rc = $($t).getInd($t.rows,rowid,true);
			if (rc) {
				var dr = $($t).getNodeChildren(rc);
				if(dr.length>0){
					for (var i=0;i<dr.length;i++){
						$($t).delRowData(dr[i].id);
					}
				}
				$($t).delRowData(rc.id);
			}
		});
	}
});
})(jQuery);