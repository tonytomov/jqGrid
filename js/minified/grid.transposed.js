!function(e){"function"==typeof define&&define.amd?define(["jquery","./grid.base"],e):e(jQuery)}(function(u){u.jgrid.extend({transposeSetup:function(s,e){var i=[],l=[],d=!1,c=u.extend({},e||{});return this.each(function(){var e,r,o=Object.keys(s[c.baseindex]);c.excludeSrcCols.length&&(o=o.filter(function(e){return!c.excludeSrcCols.includes(e)}));for(var a=0;a<o.length;a++){r=0,(e={}).col_name=o[a],d||i.push({name:"col_name"}),r++;for(var n=0;n<s.length;n++){var t=s[n];e[c.nameprefix+r]=t[o[a]],d||i.push({name:c.nameprefix+r,label:c.labelprefix+r}),r++}d=!0,l.push(e)}}),{colModel:i,rows:l}},jqTranspose:function(o,i,l,a){return i=u.extend({nameprefix:"col",labelprefix:"value ",baseindex:0,beforeCreateGrid:null,RowAsHeader:0,loadMsg:!1,excludeSrcCols:[]},i||{}),this.each(function(){var s=this,e=l&&l.regional?l.regional:"en";function r(e,r){Array.isArray(e)||(e=[]);var o=jQuery(s).jqGrid("transposeSetup",e,i);if(u.jgrid.isFunction(i.beforeCreateGrid)&&i.beforeCreateGrid.call(s,o,e),!1!==r.RowAsHeader&&0<=r.RowAsHeader&&o.rows.length&&r.RowAsHeader<o.rows.length){var a,n=o.rows[r.RowAsHeader],t=0;for(a in n)Object.prototype.hasOwnProperty.call(n,a)&&(o.colModel[t].label=n[a]),t++;o.rows.splice(r.RowAsHeader,1)}e=u.jgrid.from.call(s,o.rows);jQuery(s).jqGrid(u.extend(!0,{datastr:e.select(),datatype:"jsonstring",colModel:o.colModel,jsonReader:{repeatitems:!1},viewrecords:!0},l||{})),i.loadMsg&&u(".loading_pivot").remove()}i.loadMsg&&u("<div class='loading_pivot ui-state-default ui-state-active row'>"+u.jgrid.getRegional(s,"regional."+e+".defaults.loadtext")+"</div>").insertBefore(s).show(),"string"==typeof o?u.ajax(u.extend({url:o,dataType:"json",success:function(e){r(u.jgrid.getAccessor(e,a&&a.reader?a.reader:"rows"),i)}},a||{})):r(o,i)})}})});