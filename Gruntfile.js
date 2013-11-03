
module.exports = function(grunt) {

    var d = __dirname+"/vendors/phantomizer-uglifyjs";

    var in_dir = d+"/demo/in/";
    var out_dir = d+"/demo/out/";
    var meta_dir = d+"/demo/out/";


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')

        ,"out_dir":out_dir
        ,"meta_dir":meta_dir

        //-
        ,'phantomizer-uglifyjs': {
            options: {
            }
            ,test: {
                files: {
                    '<%= out_dir %>/jquery.ios-slider-0.9.1-min.js': [in_dir+'/jquery.ios-slider-0.9.1.js']
                },
                options:{
                    "meta": "<%= meta_dir %>/jquery.ios-slider-0.9.1.js"
                }
            }
        }
    });

    grunt.loadNpmTasks('phantomizer-uglifyjs');

    grunt.registerTask('default',
        [
            'phantomizer-uglifyjs:test'
        ]);
};
