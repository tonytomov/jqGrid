module.exports = function (grunt) {
	grunt.initConfig({
		pkgFreejqGrid: grunt.file.readJSON("package.json"),
		clean: [
			"css/*.min.css",
			"css/*.min.css.map",
			"js/jquery.jqgrid.min.js",
			"js/jquery.jqgrid.min.map",
			"js/jquery.jqgrid.src.js",
			"js/i18n/min/",
			"plugins/min/",
			"dist/",
			"plugins/*.min.js",
			"plugins/*.min.css",
			"plugins/*.min.css.map",
			"plugins/*.min.map",
			"js/i18n/grid.locale-*.min.js",
			"js/i18n/grid.locale-*.min.map"
		],
		copy: {
			main: {
				files: [
					{
						src: ["js/i18n/grid.locale-*.*"],
						dest: "dist/i18n/",
						//timestamp: true,
						expand: true,
						filter: "isFile",
						flatten: true
					},
					{
						src: ["plugins/*"],
						dest: "dist/plugins/",
						//timestamp: true,
						expand: true,
						filter: "isFile",
						flatten: true
					},
					{
						src: ["js/jquery.jqgrid.src.js", "js/jquery.jqgrid.min.js", "js/jquery.jqgrid.min.map"],
						dest: "dist/",
						expand: true,
						flatten: true
					}
				]
			}
		},
		concat: {
			all: {
				src: [
					"js/grid.base.js",
					"js/grid.celledit.js",
					"js/grid.common.js",
					"js/grid.custom.js",
					"js/grid.filter.js",
					"js/grid.formedit.js",
					"js/grid.grouping.js",
					"js/grid.import.js",
					"js/grid.inlinedit.js",
					"js/grid.jqueryui.js",
					"js/grid.pivot.js",
					"js/grid.subgrid.js",
					"js/grid.tbltogrid.js",
					"js/grid.treegrid.js",
					"js/jqdnr.js",
					"js/jqmodal.js",
					"js/jquery.fmatter.js",
					"js/jsonxml.js"
				],
				dest: "js/jquery.jqgrid.src.js"
			}
		},
		jshint: {
			files: ["js/jquery.jqgrid.src.js"],
			options: {
				//'-W069': false
				//"-W041": false,
				"boss": true,
				"curly": true,
				"eqeqeq": true,
				"eqnull": true,
				"expr": true,
				"immed": true,
				"noarg": true,
				//"quotmark": "double",
				"undef": true,
				"unused": true,
				"node": true
			}
		},
		jscs: {
			src: ["gruntfile.js", "js/*.js", "!js/*.min.js"],
			options: {
				config: ".jscsrc"
			}
		},
		cssmin: {
			options: {
				sourceMap: true,
				report: "gzip"
			},
			target: {
				files: [
					{
						src: "css/ui.jqgrid.css",
						dest: "css/ui.jqgrid.min.css"
					},
					{
						src: "plugins/ui.multiselect.css",
						dest: "plugins/ui.multiselect.min.css"
					}
				]
			}
		},
		closureCompiler: {
			options: {
				//checkModified: true,
				compilerOpts: {
					//create_source_map: null
					//warning_level: "QUIET",
					//warning_level: "verbose",
					//process_jquery_primitives: "", // This flag has no effect unless the compilation level is also set at ADVANCED_OPTIMIZATIONS.
					create_source_map: "js/jquery.jqgrid.min.map"
				},
				compilerFile: "node_modules/google-closure-compiler/compiler.jar"
			},
			targetName: {
				src: "js/jquery.jqgrid.src.js",
				dest: "js/jquery.jqgrid.min.js"
			}
		},
		replace: {
			dist: {
				options: {
					patterns: [
						{
							match: /\"sources\":\[\"js\/jquery\.jqgrid\.src\.js\"\],/,
							replacement: "\"sources\":[\"jquery.jqgrid.src.js\"],"
						},
						{
							match: /\"file\":\"js\/jquery\.jqgrid\.min\.js\",/,
							replacement: "\"file\":\"jquery.jqgrid.min.js\","
						}
					]
				},
				files: [
					{
						expand: true,
						flatten: true,
						src: ["js/jquery.jqgrid.min.map"],
						dest: "js/"
					}
				]
			}
		},
		file_append: {
			default_options: {
				files: [
					function () {
						return {
							append: "//# sourceMappingURL=jquery.jqgrid.min.map",
							input: "js/jquery.jqgrid.min.js"
						};
					}
				]
			}
		},
		uglify: {
			all: {
				src: "js/jquery.jqgrid.src.js",
				dest: "js/jquery.jqgrid.min.js",
				options: {
					preserveComments: false,
					sourceMap: true,
					sourceMapName: "js/jquery.jqgrid.min.map",
					report: "min",
					banner: "/*\n" +
						" jqGrid <%= pkgFreejqGrid.version %> - free jqGrid: https://github.com/free-jqgrid/jqGrid\n" +
						" Copyright (c) 2008-2014, Tony Tomov, tony@trirand.com\n" +
						" Copyright (c) 2014-2015, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com\n" +
						" Dual licensed under the MIT and GPL licenses\n" +
						" http://www.opensource.org/licenses/mit-license.php\n" +
						" http://www.gnu.org/licenses/gpl-2.0.html\n" +
						" Date: <%= grunt.template.today('isoDate') %>\n" +
						"*/",
					compress: {
						"hoist_funs": false
					}
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-closure-tools");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-replace");
	grunt.loadNpmTasks("grunt-file-append");
	grunt.loadNpmTasks("grunt-jscs");

	var closureCompilerTasks = [],
		regClosureCompilerTask = function (filePath) {
			// build names
			var filePathParts = filePath.split("\/"), filePathMin, filePathMap,
				fileName = filePathParts[filePathParts.length - 1], fileNameMin, fileNameMap,
				fileNameParts = fileName.split("."), regExp0, regExp1;

			if (fileNameParts[fileNameParts.length - 1].toLowerCase() !== "js" || fileNameParts.length < 2) { return; }
			if (fileNameParts[fileNameParts.length - 2].toLowerCase() !== "src") {
				fileNameParts[fileNameParts.length - 1] = "min";
				fileNameParts.push("js");
			} else {
				fileNameParts[fileNameParts.length - 2] = "min";
			}
			fileNameMin = fileNameParts.join(".");
			fileNameParts[fileNameParts.length - 1] = "map";
			fileNameMap = fileNameParts.join(".");

			filePathParts[filePathParts.length - 1] = fileNameMin;
			filePathMin = filePathParts.join("\/");

			filePathParts[filePathParts.length - 1] = fileNameMap;
			filePathMap = filePathParts.join("\/");

			// build two regex required for running "replace" task
			// see http://stackoverflow.com/a/6969486/315935 about which characters need be escaped
			regExp0 = new RegExp("\\\"sources\\\":\\[\\\"" +
					//filePath.split("\/").join("\\\/") +    // for example "plugins\\\/grid.odata.js" +
					filePath.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") +
					"\\\"\\],");
			regExp1 = new RegExp("\\\"file\\\":\\\"" +
					//filePathMin.split("\/").join("\\\/") + // for example "plugins\\\/grid.odata.min.js" +
					filePathMin.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") +
					"\\\",");

			// build fileDirectory
			filePathParts.pop();
			var fileDirectory = filePathParts.join("\/");
			if (fileDirectory.length === 0) {
				fileDirectory = ".";
			}
			fileDirectory += "/";

			var taskName = "closureCompiler_" + filePath.split("\/").join("_");
			grunt.registerTask(taskName, function () {
				// run "closureCompiler" task
				grunt.config.set("closureCompiler.options.compilerOpts.create_source_map", filePathMap);
				grunt.config.set("closureCompiler.targetName.src", filePath);
				grunt.config.set("closureCompiler.targetName.dest", filePathMin);
				grunt.log.writeln("    compiling '" + filePath + "' to '" + filePathMin + "' with '" + filePathMap + "' by google closure compiler...");
				grunt.task.run("closureCompiler");

				// run "replace" task
				grunt.config.set("replace.dist.options.patterns.0.match", regExp0);
				grunt.config.set("replace.dist.options.patterns.0.replacement", "\"sources\":[\"" + fileName + "\"],");
				grunt.config.set("replace.dist.options.patterns.1.match", regExp1);
				grunt.config.set("replace.dist.options.patterns.1.replacement", "\"file\":\"" + fileNameMin + "\",");
				grunt.config.set("replace.dist.files.0.src", [filePathMap]);

				grunt.config.set("replace.dist.files.0.dest", fileDirectory);
				grunt.log.writeln("    patching 'sources' and 'file' properties of '" + filePathMap + "'");
				grunt.task.run("replace");

				// run "file_append" task
				grunt.config.set("file_append.default_options.files", [
					function () {
						return {
							append: "/*\n//# sourceMappingURL=" + fileNameMap + "\n*/",
							input: filePathMin
						};
					}
				]);
				grunt.log.writeln("    appending '//# sourceMappingURL=" + fileNameMap + "' at the end of 'file' properties of '" + filePathMin + "'");
				grunt.task.run("file_append");
			});
			closureCompilerTasks.push(taskName);
		};

	regClosureCompilerTask("js/jquery.jqgrid.src.js");

	grunt.file.expand({ matchBase: true }, [
		"plugins/*.js",
		"!plugins/*.min.js",
		"js/i18n/grid.locale-*.js",
		"!js/i18n/grid.locale-*.min.js"
	]).forEach(function (path) {
		regClosureCompilerTask(path);
	});

	grunt.registerTask("closureCompilerAll", closureCompilerTasks);

	grunt.registerTask("all", ["clean", "concat", "jshint", "jscs", "closureCompilerAll", "cssmin", "copy"]);
	grunt.registerTask("default", ["concat", "jshint", "jscs", "closureCompiler_js_jquery.jqgrid.src.js", "cssmin", "copy"]);
};
