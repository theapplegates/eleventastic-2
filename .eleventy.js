const pluginRss = require('@11ty/eleventy-plugin-rss')
const pluginNavigation = require('@11ty/eleventy-navigation')
const markdownIt = require('markdown-it')

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')
const iconsprite = require('./utils/iconsprite.js')

const Image = require("@11ty/eleventy-img")
const path = require('path')


async function imageShortcode(src, alt) {
      let sizes = "(min-width: 1024px) 100vw, 50vw"
      let srcPrefix = `./src/assets/images/`
      src = srcPrefix + src
      console.log(`Generating image(s) from:  ${src}`)
      if(alt === undefined) {
        // Throw an error on missing alt (alt="" works okay)
        throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`)
      }  
      let metadata = await Image(src, {
        widths: [150, 300,600, 900, 1500, 3000],
        formats: ['avif', 'webp', 'jpeg'],
        urlPath: "/images/",
        outputDir: "./dist/images/",
        /* =====
        Now we'll make sure each resulting file's name will 
        make sense to you. **This** is why you need 
        that `path` statement mentioned earlier.
        ===== */
        filenameFormat: function (id, src, width, format, options) {
          const extension = path.extname(src)
          const name = path.basename(src, extension)
          return `${name}-${width}w.${format}`
        }
      })  
      let lowsrc = metadata.jpeg[0]  
      return `<picture>
        ${Object.values(metadata).map(imageFormat => {
          return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`
        }).join("\n")}
        <img
          src="${lowsrc.url}"
          width="${lowsrc.width}"
          height="${lowsrc.height}"
          alt="${alt}"
          loading="lazy"
          decoding="async">
      </picture>`
    }
    
    

module.exports = function (config) {
    
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode)
    eleventyConfig.addLiquidShortcode("image", imageShortcode)
      // === Liquid needed if `markdownTemplateEngine` **isn't** changed from Eleventy default
    eleventyConfig.addJavaScriptFunction("image", imageShortcode)
    // Plugins
    config.addPlugin(pluginRss)
    config.addPlugin(pluginNavigation)

    // Filters
    Object.keys(filters).forEach((filterName) => {
        config.addFilter(filterName, filters[filterName])
    })

    // Transforms
    Object.keys(transforms).forEach((transformName) => {
        config.addTransform(transformName, transforms[transformName])
    })

    // Shortcodes
    Object.keys(shortcodes).forEach((shortcodeName) => {
        config.addShortcode(shortcodeName, shortcodes[shortcodeName])
    })

    // Icon Sprite
    config.addNunjucksAsyncShortcode('iconsprite', iconsprite)

    // Asset Watch Targets
    config.addWatchTarget('./src/assets')

    // Markdown
    config.setLibrary(
        'md',
        markdownIt({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        })
    )

    // Layouts
    config.addLayoutAlias('base', 'base.njk')
    config.addLayoutAlias('post', 'post.njk')

    // Pass-through files
    config.addPassthroughCopy('src/robots.txt')
    config.addPassthroughCopy('src/site.webmanifest')
    config.addPassthroughCopy('src/assets/images')
    config.addPassthroughCopy('src/assets/fonts')

    // Deep-Merge
    config.setDataDeepMerge(true)

    // Base Config
    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'includes',
            layouts: 'layouts',
            data: 'data'
        },
        templateFormats: ['njk', 'md', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk'
    }
}
