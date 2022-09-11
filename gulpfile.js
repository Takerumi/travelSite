import gulp from 'gulp'
import plumber from 'gulp-plumber'
import sass from 'gulp-dart-sass'
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import csso from 'postcss-csso'
import rename from 'gulp-rename'
// import squoosh from 'gulp-libsquoosh'
import svgo from 'gulp-svgmin'
import svgstore from 'gulp-svgstore'
import del from 'del'
import browser from 'browser-sync'

// Styles

export const styles = () => {
  return gulp
    .src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), csso()]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream())
}

// HTML

const html = () => {
  return gulp.src('source/*.html').pipe(gulp.dest('build'))
}

// Scripts

// Images

// const optimizeImages = () => {
//   return gulp
//     .src('source/img/**/*.{png,jpg}')
//     .pipe(squoosh())
//     .pipe(gulp.dest('build/img'))
// }

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}').pipe(gulp.dest('build/img'))
}

// WebP

// SVG

const svg = () =>
  gulp
    .src(['source/img/**/*.svg', '!source/img/sprite/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'))

const sprite = () => {
  return gulp
    .src('source/img/sprite/*.svg')
    .pipe(svgo())
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img/icons/'))
}

// Copy

const copy = (done) => {
  return gulp
    .src(
      ['source/fonts/*.{woff2,woff}', 'source/*.ico', 'source/*.webmanifest'],
      {
        base: 'source',
      }
    )
    .pipe(gulp.dest('build'))
  done()
}

// Clean

const clean = () => {
  return del('build')
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build',
    },
    cors: true,
    notify: false,
    ui: false,
  })
  done()
}

// Reload

const reload = (done) => {
  browser.reload()
  done()
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles))
  gulp.watch('source/*.html', gulp.series(html, reload))
}

// Build

export const build = gulp.series(
  clean,
  copy,
  // optimizeImages,
  gulp.parallel(styles, html, svg, sprite)
)

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(styles, html, svg, sprite),
  gulp.series(server, watcher)
)
