//🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿
//1. Déclaration des variables
//🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿
let gulp = 						require('gulp');
let sass = 						require('gulp-sass')(require('sass'));
let rename = 					require('gulp-rename');
let sourcemaps = 			require('gulp-sourcemaps');
let autoprefixer = 		require('gulp-autoprefixer');
let uglify = 					require('gulp-uglify');
let browserSync = 		require('browser-sync').create();

//🌿🌿🌿🌿🌿🌿
//2. Mes tâches
//🌿🌿🌿🌿🌿🌿
///Remplace la moulinette de sass qui va transformer nos .scss en .css
gulp.task('sassification', function() {
	return gulp
	.src('dev/css/*.scss')
	.pipe(sourcemaps.init())
	.pipe(autoprefixer())
	.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
	.pipe(rename(function (path) {path.basename += '.min';}))
	.pipe(sourcemaps.write(''))
	.pipe(gulp.dest('prod/css'));
});

gulp.task('htmlification', function() {
	return gulp.src('dev/*.html')
	.pipe(gulp.dest('prod'));
});

gulp.task('imgification', function() {
	return gulp.src('dev/img/**')
	.pipe(gulp.dest('prod/img'));
});

gulp.task('jsification',function () {
	return gulp
	.src('dev/js/*.js')
	.pipe(uglify())
	.pipe(rename(function (path) {
		path.basename += '.min';
	}))
	.pipe(gulp.dest('prod/js'));
});

gulp.task('browser-sync', function (){
	browserSync.init({
		server: {
			baseDir: 'prod/',
		},
	});
})

//🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿
//3 Exécution des tâches
//🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿
gulp.task('observation',gulp.parallel('sassification','htmlification','jsification', 'imgification', function () {
	gulp.watch('dev/css/**/*.scss', gulp.series('sassification'));
	gulp.watch('dev/*.html', gulp.series('htmlification'));
	gulp.watch('dev/js/*.js', gulp.series('jsification'));
	gulp.watch('prod/**/*').on('change', browserSync.reload);
}));
gulp.task('default', gulp.parallel('observation', 'browser-sync'));