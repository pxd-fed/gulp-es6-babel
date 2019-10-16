'use strict';

import pkg from './package.json';
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';

const $ = plugins({
    pattern : ['*'],
    scope : ['devDependencies']
});

console.log($)

const onError = (err) => console.log(err);

/**
 *  CHARACTER SET
 */
var encoding = 'UTF-8';

/**
 *  SET PATH
 */
const DIR = {
    SRC : 'src',
    BUILD : 'build',
    // DIST : 'dist'
}

const BASE = {
    SCRIPT : '/assets/js/',
    CSS : '/assets/css/',
    SCSS : '/assets/scss/',
    IMAGES : '/assets/images/',
    FONTS : '/assets/fonts/',
    FILES : '/assets/',
    HTML : '/html/'
}

const PATH = {
    SCRIPT : {
        SRC : DIR.SRC + BASE.SCRIPT,
        BUILD : DIR.BUILD + BASE.SCRIPT,
        // DIST : DIR.DIST + BASE.SCRIPT,
        TARGET : DIR.SRC + BASE.SCRIPT + '/**/*.js'
    },
    CSS : {
        SRC : DIR.SRC + BASE.CSS,
        BUILD : DIR.BUILD + BASE.CSS,
        // DIST : DIR.DIST + BASE.CSS ,
        TARGET : DIR.SRC + BASE.CSS + '/**/*.css'
    },
    SCSS : {
        SRC : DIR.SRC + BASE.SCSS,
        BUILD : DIR.BUILD + BASE.SCSS,
        // DIST : DIR.DIST + BASE.SCSS ,
        TARGET : DIR.SRC + BASE.SCSS + '/**/*.scss'
    },
    IMAGES : {
        SRC : DIR.SRC + BASE.IMAGES,
        BUILD : DIR.BUILD + BASE.IMAGES,
        // DIST : DIR.DIST + BASE.IMAGES,
        TARGET : DIR.SRC + BASE.IMAGES + '**/*.{jpg, png, gif, jpeg, svg}',
    },
    FONTS : {
        SRC : DIR.SRC + BASE.FONTS,
        BUILD : DIR.BUILD + BASE.FONTS,
        // DIST : DIR.DIST + BASE.FONTS,
        TARGET : DIR.SRC + BASE.FONTS + '**/*.{eot, woff, woff2, ttf, svg, otf}',
    },
    FILES : {
        SRC : DIR.SRC + BASE.FILES,
        BUILD : DIR.BUILD + BASE.FILES,
        // DIST : DIR.DIST + BASE.FILES,
        TARGET : DIR.SRC + BASE.FILES + '**/*.*',
    },
    HTML : {
        SRC : DIR.SRC + BASE.HTML,
        BUILD : DIR.BUILD + BASE.HTML,
        // DIST : DIR.DIST + BASE.HTML,
        TARGET : DIR.SRC + BASE.HTML + '/**/*.{html, inc}'
    }
}

/** 
 * TASK : HTML
 */
gulp.task('html', () => {
    return gulp.src([PATH.HTML.SRC + '**/*.html', '!' + PATH.HTML.SRC + '/include/**/*.html'], {base : ''})
                .pipe($.newer(PATH.HTML.BUILD))
                .pipe($.fileInclude({
                    prefix : '<!--',
                    suffix : '-->',
                    basepath : '@file'
                }))
                .pipe($.htmlBeautify())
                .pipe($.charset({to : encoding, quiet : false}))
                .pipe(gulp.dest(PATH.HTML.BUILD))
                .pipe($.connect.reload());
});

/** 
 * TASK : CSS
 */
gulp.task('css', () => {
    return $.mergeStream(
        gulp.src([PATH.SCSS.TARGET, '!/**/_*.scss'])
            .pipe($.newer(PATH.CSS.BUILD))
            .pipe($.sourcemaps.init())
            .pipe($.sass({outputStyle : 'compact', sourceMap : true}).on('error', $.sass.logError))
            .pipe($.autoprefixer({browsers : ['ie 10', 'last 2 versions'], cascade : false}))
            .pipe($.sourcemaps.write()),

        gulp.src(PATH.CSS.TARGET)
            .pipe($.newer(PATH.CSS.BUILD))
            .pipe($.cleanCss({compatibility: 'ie8'}))
    )
    .pipe($.charset({to : encoding}))
    .pipe(gulp.dest(PATH.CSS.BUILD))
    .pipe($.connect.reload());
});

/**
 * SASS
 */
// gulp.task('sass', () => {
//     return gulp.src([PATH.SCSS.TARGET, '!!/**/_*.scss'])
//                 .pipe($.newer(PATH.CSS.BUILD))
//                 .pipe($.sourcemaps.init())
//                 .pipe($.sass({outputStyle : 'compact', sourceMap : true}).on('error', $.sass.logError))
//                 .pipe($.autoprefixer({browsers : ['ie 10', 'last 2 versions'], cascade : false}))
//                 .pipe($.sourcemaps.write())
//                 .pipe(gulp.dist(PATH.CSS.BUILD))
//                 .pipe($.connect.reload());
// });

/** 
 * TASK : JS
 */
gulp.task('script', () => {
    return $.mergeStream(
        gulp.src([PATH.SCRIPT.TARGET, '!'+PATH.SCRIPT.SRC + '/**/libs/*.js', '!'+PATH.SCRIPT.SRC + '/**/*.min.js'], {sourcemaps : true})
            .pipe($.newer(PATH.SCRIPT.BUILD))
            // .pipe(uglify())
            .pipe($.jsbeautifier()),

            gulp.src([PATH.SCRIPT.SRC + '/**/libs/*.js', PATH.SCRIPT.SRC + '/**/*.min.js'])
            .pipe($.newer(PATH.SCRIPT.BUILD))
    )
    .pipe($.charset({to : encoding}))
    .pipe(gulp.dest(PATH.SCRIPT.BUILD))
    .pipe($.connect.reload());
})

/** 
 * TASK : IMAGE
 */
gulp.task('images', () => {
    return gulp.src([PATH.IMAGES.TARGET])
                .pipe($.newer(PATH.IMAGES.BUILD))
                .pipe($.imagemin())
                .pipe(gulp.dest(PATH.IMAGES.BUILD))
                .pipe($.connect.reload());
});

/**
 * TASK : Fonts
 */
gulp.task('fonts', () => {
    return gulp.src([PATH.FONTS.TARGET])
                .pipe($.newer(PATH.FONTS.BUILD))
                .pipe(gulp.dest(PATH.FONTS.BUILD))
                .pipe($.connect.reload());
});

/**
 * ETC - Files
 */
gulp.task('files', () => {
    return gulp.src([PATH.FILES.TARGET])
                .pipe($.newer(PATH.FILES.BUILD))
                .pipe(gulp.dest(PATH.FILES.BUILD))
                .pipe($.connect.reload());
});

/**
 * Clean
 */
gulp.task('clean', () => {
    return $.del.sync([DIR.BUILD]);
});

/**
 * Run Server
 * LiveReload
 */
gulp.task('connect', () => {
    $.connect.server({
        root : DIR.BUILD,
        livereload : true,
        port : 8888
    });
});

/**
 * Watch
 */
gulp.task('watch', () => {
    gulp.watch([PATH.HTML.TARGET], {cwd:'./'}, ['html']);
    gulp.watch([PATH.CSS.TARGET, PATH.SCSS.TARGET], {cwd:'./'}, ['css']);
    gulp.watch([PATH.SCRIPT.TARGET], {cwd:'./'}, ['script']);
    gulp.watch([PATH.IMAGES.TARGET], {cwd:'./'}, ['images']);
});

/**
 * Default Build
 */

gulp.task('default', ['clean', 'connect', 'html', 'css', 'script', 'images', 'fonts', 'files', 'watch'], () => {
    console.log('Gulp is running');
})

