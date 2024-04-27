const { src, dest, watch, parallel, series } = require("gulp")

const scss = require("gulp-sass")(require("sass"))
const concat = require("gulp-concat")
const uglify = require("gulp-uglify-es").default
const browseSync = require("browser-sync").create()
const autoprefixer = require("gulp-autoprefixer")
const clean = require("gulp-clean")
const webp = require("gulp-webp")
const avif = require("gulp-avif")
const imagemin = require("gulp-imagemin")
const newer = require("gulp-newer")
const svgSprite = require("gulp-svg-sprite")
const fonter = require("gulp-fonter")
const ttf2woff2 = require("gulp-ttf2woff2")
const include = require("gulp-include")

function pages() {
  return src("app/pages/*.html")
    .pipe(
      include({
        includePaths: "app/components",
      })
    )
    .pipe(dest("app"))
    .pipe(browseSync.stream())
}

function fonts() {
  return src("app/fonts/src/*.*")
    .pipe(
      fonter({
        formats: ["ttf"],
      })
    )
    .pipe(src("app/fonts/*.ttf"))
    .pipe(ttf2woff2())
    .pipe(dest("app/fonts"))
}

function images() {
  return src("app/images/src/*.{jpg,png,jpeg}")
    .pipe(newer("app/images"))
    .pipe(avif({ quality: 50 }))

    .pipe(dest("app/images"))
}

function sprite() {
  return src("app/images/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
            example: true,
          },
        },
      })
    )
    .pipe(dest("app/images"))
}

function scripts() {
  return src([
    "node_modules/jquery/dist/jquery.js",
    "node_modules/mixitup/dist/mixitup.js",
    "node_modules/@fancyapps/ui/dist/fancybox/fancybox.umd.js",
    "node_modules/slick-carousel/slick/slick.js",
    "app/js/main.js",
    "app/js/modules/*.js",
  ])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browseSync.stream())
}

function styles() {
  return src("app/scss/style.scss")
    .pipe(autoprefixer({ overrideBrowsersList: ["last 10 version"] }))
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("app/css"))
    .pipe(browseSync.stream())
}

function watching() {
  browseSync.init({
    server: {
      baseDir: "app/",
    },
  })

  watch(["app/scss/*.scss"], styles)
  watch(["app/fonts/src"], fonts)
  watch(["app/images/src"], images)
  watch(["app/js/main.js", "app/js/modules/*.js"], scripts)
  watch(["app/components/*", "app/pages/*"], pages)
  watch(["app/*.html"]).on("change", browseSync.reload)
}

function cleanDist() {
  return src("dist").pipe(clean())
}

function building() {
  return src(
    [
      "app/js/main.min.js",
      "app/css/style.min.css",
      "app/*.html",
      "app/images/*.*",
      "!app/images/*.svg",
      //"app/images/sprite.svg",
      "app/fonts/*.*",
    ],
    {
      base: "app",
    }
  ).pipe(dest("dist"))
}

exports.scripts = scripts
exports.styles = styles
exports.watching = watching
exports.images = images
exports.sprite = sprite
exports.fonts = fonts
exports.pages = pages
exports.building = building

exports.build = series(cleanDist, building)
exports.default = parallel(scripts, styles, images, pages, watching)
