module.exports = function(grunt) {
	"use strict";
var
	//builddir = "dist", // not used
	// files
	allFiles = [
		"grid.base",
		"grid.celledit",
		"grid.common",
		"grid.filter",
		"grid.formedit",
		"grid.grouping",
		"grid.import",
		"grid.inlinedit",
		"grid.jqueryui",
		"grid.pivot",
		"grid.subgrid",
		"grid.treegrid",
		"jqDnR",
		"jqModal",
		"jquery.fmatter",
		"jquery.sortable",
		"grid.utils",
		"grid.export",
		"grid.aria",
		"grid.transposed",
		"grid.frozenrows"
	],

	gridFiles = allFiles.map(function( file ) {
		return "js/" + file+".js";
	}),
	allI18nFiles = expandFiles( "js/i18n/*.js" ),
	
	cssFiles = [
		"css/ui.jqgrid.css",
		"css/addons/ui.multiselect.css"
	],
	// minified files
	minify = {
		options: {
			preserveComments: false,
			mangle: {
				toplevel: true
			},
			sourceMap :  true
		},
		main: {
			options: {
				banner: createBanner( true )
			},
			files: {
				"js/jquery.jqGrid.min.js": "js/jquery.jqGrid.js"
			}
		}
	};
	
	function mapMinFile( file ) {
		return "js/" + file.replace( /js\//, "minified/" );
	}
	function mapi18nFile( file ) {
		return "js/" + file.replace( /js\//, "minified/" );
	}

	function expandFiles( files ) {
		return grunt.util._.map( grunt.file.expandMapping( files ), "src" ).map(function( values ) {
			return values[ 0 ];
		});
	}

	var header = ''+
		'(function( factory ) {'+'\n'+
		'	"use strict";'+'\n'+
		'	if ( typeof define === "function" && define.amd ) {'+'\n'+
		'		// AMD. Register as an anonymous module.'+'\n'+
		'		define([ '+'\n'+
		'			"jquery"'+'\n'+
		'		], factory );' +'\n'+
		' 	} else {'+'\n'+
		'		// Browser globals'+'\n'+
		'		factory( jQuery );'+'\n'+
		' 	}'+'\n'+
		'}(function( $ ) {'+'\n'+
		'"use strict";'+'\n';


	function createBanner( date ) {
		return date === true ? "/**\n*\n"+
			"* @license Guriddo <%= pkg.name %> JS - v<%= pkg.version %> " +
			( date ? "- <%= grunt.template.today('isoDate') %>\n" : "\n") +
			"* Copyright(c) 2008, <%=pkg.author.name%>, <%=pkg.author.email%>\n"+
			"* \n"+
			"* License: <%= pkg.licenses[0].url %>\n"+
			"*/\n" : "";
	}
	// grid files min
	gridFiles.concat( ).forEach(function( file ) {
		minify[ file ] = {
			options: {
				banner: createBanner( false ),
				sourceMap: false
			},
			files: {}
		};
		minify[ file ].files[ mapMinFile( file ) ] = file;
	});
	// i18n files min
	allI18nFiles.concat( ).forEach(function( file ) {
		minify[ file ] = {
			options :{
				sourceMap: false
			},
			files:{}
		};
		minify[ file ].files[ mapi18nFile( file ) ] = file;
	});

	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		files: {
			dist: "<%= pkg.name %>-<%= pkg.version %>"
		},
		jshint: {
			options: {
				jshintrc: true
			},
			core: {
				src: [
				"	Gruntfile.js",
					"js/*.js"
				]
			}
		},
		concat: {
			grid: {
				options: {
					banner: createBanner( true )+ header,
					footer: '\n'+"}));",
					process: function(src, filepath) {
						var begin = src.indexOf("//module begin");
						var end = src.lastIndexOf('//module end');
						return (begin === -1 || end === -1) ? "" : src.substring(begin,end);
					}

				},
				src: gridFiles,
				dest: "js/jquery.jqGrid.js"
			}
		},
		// create requiere js version
		requirejs: {
			compile: {
				options: {
					baseUrl: ".",
					mainConfigFile: "config.js",
					name: "jqGrid",
					out: "build/jqGrid.js",
					optimize: "none",
					normalizeDirDefines:  "all",
					paths: {
						"jquery": "empty:",
						"jquery-ui": "empty:"
					}
				}
			}
		},
		uglify : minify
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	
	grunt.registerTask("default", ["build"]);
	grunt.registerTask("build", ["requirejs", "concat:grid","uglify"]);
	grunt.registerTask("test", ["jshint"]);

};
