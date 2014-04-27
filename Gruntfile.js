module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jslint:{
            dominos:{
                directives:{
                    node: true
                },
                options:{
                    shebang: true
                },
                src: 'dominos.js'
            }
        },
        jshint:{
            dominos:'dominos.js'
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jslint');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'jslint']);

};
