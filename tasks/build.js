'use strict';

module.exports = function(grunt) {

    grunt.registerMultiTask("phantomizer-uglifyjs", "", function () {

        var ph_libutil = require("phantomizer-libutil");
        var meta_factory = ph_libutil.meta;
        var wd = process.cwd();

        var options = this.options({
                meta_dir:'',
                meta_file:''
        });
        var meta_dir = options.meta_dir;
        var meta_file = options.meta_file;
        var user_config = grunt.config();


        var meta_manager = new meta_factory( wd, meta_dir );

        if( meta_manager.is_fresh(meta_file) == false ){
            var done = this.async();

            // Merge task-specific and/or target-specific options with these defaults.
            var uglify_options = this.options({
                banner: '',
                compress: {
                    warnings: false
                },
                mangle: {},
                beautify: false,
                report: false
            });

            // Process banner.

            // Iterate over all src-dest file pairs.
            this.files.forEach(function(f) {
                apply_uglify(f,uglify_options);
            });

            var deps = [];
            // add grunt file to dependencies so that file are rebuild when this file changes
            for( var ooo in this.files ){
                for( var ttt in this.files[ooo].src ){
                    deps.push(this.files[ooo].src[ttt]);
                }
            }
            if ( grunt.file.exists(process.cwd()+"/Gruntfile.js")) {
                deps.push(process.cwd()+"/Gruntfile.js")
            }
            if ( grunt.file.exists(user_config.project_dir+"/../config.json")) {
                deps.push( user_config.project_dir+"/../config.json")
            }
            deps.push(__filename)


            var current_grunt_task = this.nameArgs;
            var current_grunt_opt = this.options();
            // create a cache entry, so that later we can regen or check freshness
            var entry = meta_manager.create(deps)
            entry.require_task(current_grunt_task, current_grunt_opt)

            entry.save(options.meta_file, function(err){
                if (err){
                    grunt.log.warn(err)
                    done(false);
                }
                else{
                    done();
                }
            })

        }else{
            grunt.log.ok('Your build is fresh !\n\t'+options.meta_file);
        }


    });


    function apply_uglify(file,options){

        var uglify = require('../lib/uglify').init(grunt);

        var banner = grunt.template.process(options.banner);
        var mapNameGenerator, mappingURLGenerator;

        var src = file.src.filter(function(filepath) {
            // Warn on and remove invalid source files (if nonull was set).
            if (!grunt.file.exists(filepath)) {
                grunt.log.warn('Source file "' + filepath + '" not found.');
                return false;
            } else {
                return true;
            }
        });

        // function to get the name of the sourceMap
        if (typeof options.sourceMap === "function") {
            mapNameGenerator = options.sourceMap;
        }

        // function to get the sourceMappingURL
        if (typeof options.sourceMappingURL === "function") {
            mappingURLGenerator = options.sourceMappingURL;
        }

        if (mapNameGenerator) {
            try {
                options.sourceMap = mapNameGenerator(file.dest);
            } catch (e) {
                var err = new Error('SourceMapName failed.');
                err.origError = e;
                grunt.fail.warn(err);
            }
        }

        if (mappingURLGenerator) {
            try {
                options.sourceMappingURL = mappingURLGenerator(file.dest);
            } catch (e) {
                var err = new Error('SourceMapName failed.');
                err.origError = e;
                grunt.fail.warn(err);
            }
        }

        // Minify files, warn and fail on error.
        var result;
        grunt.log.ok(src);
        grunt.log.ok(file.dest);
        try {
            result = uglify.minify(src, file.dest, options);
        } catch (e) {
            grunt.log.ok(e);
            var err = new Error('Uglification failed.');
            if (e.msg) {
                err.message += ', ' + e.msg + '.';
            }
            err.origError = e;
            grunt.fail.warn(err);
        }

        // Concat banner + minified source.
        var output = banner + result.min;

        // Write the destination file.
        grunt.file.write(file.dest, output);

        // Write source map
        if (options.sourceMap) {
            grunt.file.write(options.sourceMap, result.sourceMap);
            grunt.log.writeln('Source Map "' + options.sourceMap + '" created.');
        }

        // Print a success message.
        grunt.log.ok('File "' + file.dest + '" created.');

        // ...and report some size information.
        if (options.report) {
            contrib.minMaxInfo(result.min, result.max, options.report);
        }
    }
};