module.exports = function(grunt) {
	"use strict";

	grunt.initConfig({

		jshint: {
			core: {
				src: [
					"Gruntfile.js",
					"js/*.js"
				]
			}
		},

		requirejs: {
			compile: {
				options: {
					baseUrl: ".",
					mainConfigFile: "config.js",
					name: "jqGrid",
					out: "build/jqGrid.js",
					optimize: "none",
					paths: {
						"jquery": "empty:",
						"jquery-ui": "empty:"
					}
				}
			}
		}

	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-requirejs");

	grunt.registerTask("default", ["build"]);
	grunt.registerTask("build", ["requirejs"]);
	grunt.registerTask("test", ["jshint"]);

};
