var grunt = require('grunt');

grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-browserify');

grunt.initConfig({
    watch: {
        scripts: {
            files: ['src/**/*.js', '*.js'],
            tasks: ['all'],
            options: {spawn: false}
        }
    },
    jshint: {
        all: ['src/**/*.js', '*.js', 'examples/*.js'],
        options: {esnext: true}
    },
    browserify: {
        dist: {
            files: {
                'dist/cz.js': ['src/cz.js']
            }
        }
    },
});

grunt.registerTask("all", ["jshint:all", "browserify:dist"]);
grunt.registerTask("default", ["all", "watch"]);
