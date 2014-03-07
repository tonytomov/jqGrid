//This file should be used if you want to debug and develop
function jqGridInclude()
{
    var deferred = new jQuery.Deferred();
    
    var pathtojsfiles = "js/"; // need to be ajusted
    // set include to false if you do not want some modules to be included
    var modules = [
        { include: true, incfile:'i18n/grid.locale-en.js'}, // jqGrid translation
        { include: true, incfile:'grid.common.js'}, // jqGrid common for editing
        { include: true, incfile:'grid.formedit.js'}, // jqGrid Form editing
        { include: true, incfile:'grid.inlinedit.js'}, // jqGrid inline editing
        { include: true, incfile:'grid.celledit.js'}, // jqGrid cell editing
        { include: true, incfile:'grid.subgrid.js'}, //jqGrid subgrid
        { include: true, incfile:'grid.treegrid.js'}, //jqGrid treegrid
	{ include: true, incfile:'grid.grouping.js'}, //jqGrid grouping
        { include: true, incfile:'grid.custom.js'}, //jqGrid custom 
        { include: true, incfile:'grid.tbltogrid.js'}, //jqGrid table to grid 
        { include: true, incfile:'grid.import.js'}, //jqGrid import
        { include: true, incfile:'jquery.fmatter.js'}, //jqGrid formater
        { include: true, incfile:'JsonXml.js'}, //xmljson utils
        { include: true, incfile:'grid.jqueryui.js'}, //jQuery UI utils
        { include: true, incfile:'grid.filter.js'} // filter Plugin
    ];
    
    var includeJs = function( module )
    {
        if ( module.include === true )
        {
            return jQuery.getScript( pathtojsfiles+module.incfile );
        }
    };
    
    // First get base, then everything else
    jQuery.getScript(pathtojsfiles+'grid.base.js').then(function()
    {
        jQuery.when.apply(jQuery, jQuery.map(modules, includeJs)).then(function()
        {
            deferred.resolve();
        }).fail(function()
        {
            deferred.reject();
        });
    });
    
    return deferred.promise();
}

// Instead of using $(document).ready(function(){  }); you should use
jQuery.when( jqGridInclude() ).then(function(){
    // do stuff	
});
