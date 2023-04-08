'use strict'
import fs from 'fs'
import path from 'path'

import mkdirp from 'mkdirp'
import FlowEnc from './utils/flowEnc.js'
import searchFile from './utils/searchFile.js'

//
async function enccrypt(password, encType, enc, encPath) {
  encPath = path.join(process.cwd(), encPath)
  const outPath = process.cwd() + '/outFile/' + Date.now()
  console.log('you input:', password, encType, enc, encPath)
  if (!fs.existsSync(encPath)) {
    console.log('you input filePath is not exists')
    return
  }
  // 初始化目录
  if (!fs.existsSync(outPath)) {
    mkdirp.sync(outPath)
  }
  // 输入文件路径
  const allFilePath = searchFile(encPath)

  const promiseArr = []
  for (const fileInfo of allFilePath) {
    const { filePath, size } = fileInfo
    const absPath = filePath.replace(encPath, '')
    const outFilePath = outPath + absPath
    mkdirp.sync(path.dirname(outFilePath))
    // 开始加密
    if (size === 0) {
      continue
    }
    const flowEnc = new FlowEnc(password, encType, size)
    console.log('@@outFilePath', outFilePath, encType, size)
    const writeStream = fs.createWriteStream(outFilePath)
    const readStream = fs.createReadStream(filePath)
    const promise = new Promise((resolve, reject) => {
      readStream.pipe(enc === 'enc' ? flowEnc.encryptTransform() : flowEnc.decryptTransform()).pipe(writeStream)
      readStream.on('end', () => {
        console.log('@@finish filePath', filePath)
        resolve()
      })
    })
    promiseArr.push(promise)
  }
  await Promise.all(promiseArr)
}
const arg = process.argv.slice(2)
// check finish
const interval = setInterval(() => {
  console.log('waiting finish!!!')
}, 1000)

if (arg.length > 3) {
  enccrypt(...arg).then((res) => {
    clearInterval(interval)
    console.log('all file finish enc!!!')
  })
} else {
  console.log('input error， example param:nodejs-linux passwd12345 rc4 enc /home/myfolder ')
}
