var main_source_file = "gallery.js";
var main_build_file = "gallery.min.js";

module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		cfg: grunt.file.readJSON('build-config.json'),
		typescript: {
			base: {
				src: ['<%= cfg.paths.source %>/<%= cfg.paths.script %>/**/*.ts'],
				dest: '<%= cfg.paths.intermed %>/<%= cfg.paths.script %>',
				options: {
					//module: 'amd', // commonjs/system/umd
					target: 'es3', // or es5/es6
					rootDir: '<%= cfg.paths.source %>/<%= cfg.paths.script %>',
					sourceMap: true,
					declaration: true,
					removeComments: false,
					preserveConstEnums: false,
					emitDecoratorData: true,
					noResolve: false,
					noEmitHelpers: false,
					noLib: false
				}
			}
		},
		uglify: {
			options: {
				banner: '/* ! <%= pkg.name %> v<%= pkg.version %>\n<%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: ['<%= cfg.paths.intermed %>/<%= cfg.paths.script %>/**/*.js'],
				dest: '<%= cfg.paths.build %>/<%= cfg.paths.script %>/<%= cfg.files.script_ugly %>'
			}
		},
		
		sass: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= cfg.paths.source %>/<%= cfg.paths.style %>',
					src: ['*.scss'],
					dest: '<%= cfg.paths.intermed %>/<%= cfg.paths.style %>',
					ext: '.css'
				}]
			}
		},
		
		copy: {
			libs: {
				files: [
					{
						expand: false, 
						src: 'node_modules/jquery/dist/jquery.min.js',
						dest: '<%= cfg.paths.intermed %>/<%= cfg.paths.libs %>/jquery.min.js',
						filter: 'isFile'
					},
					{
						expand: false, 
						src: 'node_modules/jquery/dist/jquery.min.js',
						dest: '<%= cfg.paths.build %>/<%= cfg.paths.libs %>/jquery.min.js',
						filter: 'isFile'
					}
				]
			},
			css: {
				files: [
					{
						expand: false,
						src: '<%= cfg.paths.intermed %>/<%= cfg.paths.style %>/<%= cfg.files.style_ugly %>',
						dest: '<%= cfg.paths.build %>/<%= cfg.paths.style %>/<%= cfg.files.style_ugly %>',
						filter: 'isFile'
					}
				]
			},
			html: {
				files: [
					{
						expand: true,
						cwd: '<%= cfg.paths.source %>',
						src: ['*.html'],
						dest: '<%= cfg.paths.build %>/'
					}
				]
			}
		},
		
		clean: {
			build: ['<%= cfg.paths.build %>', '<%= cfg.paths.intermed %>'],
			intermediate: ['<%= cfg.paths.intermed %>']
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-uglify'); // Uglify
	grunt.loadNpmTasks('grunt-contrib-sass'); // SASS
	grunt.loadNpmTasks('grunt-contrib-copy'); // Copy
	grunt.loadNpmTasks('grunt-typescript'); // TypeScript
	grunt.loadNpmTasks('grunt-contrib-clean'); // Clean
	grunt.registerTask('default', ['clean:build','typescript','sass','uglify','copy:libs','copy:html','copy:css']);

};