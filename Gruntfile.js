module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                options: {
                    separator: ';'
                },
                files: {
                    'app/dist/app.js': ['app/js/*.js', 'app/js/*/*.js', 'app/lib/*.js', 'app/tmp/*.js']
                }
            }
        },
        uglify: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */',
            },
            dist: {
                files: {
                    'app/dist/app.js': ['app/dist/app.js'],
                },
                options: {
                    mangle: false
                }
            }
        },
        html2js: {
            dist: {
                src: ['app/views/*/*.html'],
                dest: 'app/tmp/templates.js'
            }
        },
        clean: {
            temp: {
                src: ['app/tmp']
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html2js');
    //register grunt default task
    grunt.registerTask('default', ['html2js:dist', 'concat:dist', 'uglify:dist', 'clean:temp']);
};
