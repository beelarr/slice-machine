const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

// Move this elsewhere
const utils = require('../website/api/utils')

const pathToFiles = path.join(process.cwd(), 'website', 'api', 'files')

const pathToSlices = path.join(process.cwd(), 'src', 'slices')
const pathToStatic = path.join(process.cwd(), 'website', 'static', 'components')

const deleteDir = dir => {
  exec(`test -d ${dir} && rm -rf ${dir}`)
}

deleteDir(pathToFiles)

/**
 * For each framework, we should build endpoints for:
 * - all slice + meta definitions: /slices?framework=nuxt
 * - each slice definition: /single?framework=nuxt&slice=x
 */

async function main() {
  await onBefore()
  Object.entries(utils.sliceFolders).map(([framework, pathToSlices]) => {
    const sliceNames = utils.getSliceNames()
    const allSlices = sliceNames.map(sliceName => {
      const slice = utils.getAllFromSliceName(sliceName, pathToSlices)
      if (fs.existsSync(path.join(pathToSlices, sliceName, 'preview.png'))) {
        const maybeErr = fs.copyFileSync(
          path.join(pathToSlices, sliceName, 'preview.png'),
          path.join(pathToStatic, `${sliceName}.png`)
        )
        if (maybeErr) {
          throw maybeErr
        }
      } else {
        throw new Error(`Unable to find preview for component ${sliceName}`)
      }
      slice.meta.imageSrc = `/components/${sliceName.png}`
      fs.writeFileSync(
        path.join(pathToFiles, framework, 'single', `${sliceName}.json`),
        JSON.stringify(slice),
        'utf8'
      )
      return slice
    })
    fs.writeFileSync(
      path.join(pathToFiles, framework, 'slices.json'),
      JSON.stringify(allSlices),
      'utf8'
    )
  })
}

/**
 * Build folders to files
 */
function onBefore() {
  const promises = []
  Object.keys(utils.sliceFolders).forEach(framework => {
    const p = new Promise(resolve => {
      try {
        fs.promises
          .mkdir(path.join(pathToFiles, framework, 'single'), {
            recursive: true
          })
          .then(resolve)
      } catch (e) {
        console.error('onBefore err: ', e)
      }
    })
    promises.push(p)
  })
  return Promise.all(promises)
}

main()
