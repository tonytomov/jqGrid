require.config({
	"baseUrl": "../",

	"map": {
		"jquery.config": {
			"jquery": "jquery"
		},
		
		"*": {
			"jquery": "jquery.config"
		}
	},

	"paths": {

		// jqgrid
		"jqgrid": "js",

		// plugins
		"css": "bower_components/require-css/css.min",

		// jquery
		"jquery": "bower_components/jquery/dist/jquery.min",
		"jquery-ui": "bower_components/jquery-ui/ui",
		"jquery.config": "examples/jquery.config"

	}
});
