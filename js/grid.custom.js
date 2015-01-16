/*jshint eqeqeq:false */
/*global jQuery */
(function($){
/**
 * jqGrid extension for custom methods
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/ 
 * 
 * Wildraid wildraid@mail.ru
 * Oleg Kiriljuk oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
**/
"use strict";
$.jgrid = $.jgrid || {};
$.jgrid.extend({
	clearBeforeUnload : function () {
		return this.each(function(){});
	},
	GridDestroy : function () {
		return this.each(function(){});
	},
	GridUnload : function(){
		return this.each(function(){});
	}
});
})(jQuery);
