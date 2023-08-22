// have to install gulp-cli globally by command "npm i gulp-cli -g"

const { dest, src, series, parallel, watch } = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const htmlExtender = require('gulp-html-extend');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;

function javascript() {
    return src('src/js/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(dest('./dist/js'))
        .pipe(browserSync.stream());
}

function html() {
    return src('./src/html/*.html')
        .pipe(htmlExtender({ annotations: true, verbose: false }))
        .pipe(dest('./dist'))
        .pipe(browserSync.stream())
}

function styles() {
    return (
        src('./src/scss/styles.scss')
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(autoprefixer())
            .on('error', sass.logError)
            .pipe(sourcemaps.write())
            .pipe(plumber.stop())
            .pipe(dest('./dist/css'))
            .pipe(browserSync.stream())
    );
}

async function images() {
    const { default: imagemin } = await import('gulp-imagemin');
    return (
        src('./src/images/**/*')
            .pipe(imagemin())
            .pipe(dest('./dist/images'))
            .pipe(browserSync.stream())
    )
}

function watchFiles() {
    browserSync.init({
        server: {
            baseDir: './dist',
            index: '/index.html'
        }
    });

    watch('./src/scss/**/*.scss', styles);
    watch('./src/html/**/*.html', html);
    watch('./src/js/**/*.js', javascript);
    watch('./src/images/**/*', async (...params) => {
        await clean('./dist/images')(...params)
        await images(...params);
    });
}

const clean = (path = './dist') => async () => {
    const { deleteAsync } = await import('del');
    await deleteAsync([path]);
}

exports.default = series(clean(), parallel(styles, html, javascript, images), watchFiles);
exports.build = series(clean(), parallel(styles, html, javascript, images));
