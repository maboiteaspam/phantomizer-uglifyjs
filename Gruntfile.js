
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

  grunt.loadNpmTasks('phantomizer-uglifyjs');

  grunt.registerTask('default',
    [
      'phantomizer-uglifyjs:test'
    ]);
};
