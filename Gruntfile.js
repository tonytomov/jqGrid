module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-css');

    grunt.initConfig({
        concat: {
            jqGrid: {
                src: ['js/grid.base.js', 'js/grid.custom.js', 'js/jqModal.js', 'js/jqDnR.js', 'js/JsonXml.js', 'js/jquery.fmatter.js', 'js/grid.common.js', 'js/grid.filter.js', 'js/grid.formedit.js', 'js/grid.inlinedit.js', 'js/grid.celledit.js', 'js/grid.subgrid.js', 'js/grid.treegrid.js', 'js/grid.grouping.js', 'js/grid.import.js', 'js/grid.jqueryui.js', 'js/grid.tbltogrid.js', 'js/grid.pivot.js'],
                dest: 'dist/jquery.jqGrid.js'
            }
        },
        cssmin: {
            jqGrid:{
                src: 'css/ui.jqgrid.css',
                dest: 'dist/ui.jqgrid.min.css'
            }
        },
        uglify: {
            jqGrid: {
                src: 'dist/jquery.jqGrid.js',
                dest: 'dist/jquery.jqGrid.min.js'
            }
        }
    });

    grunt.registerTask('default', ['concat', 'cssmin', 'uglify']);
};