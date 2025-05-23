import fs from 'node:fs'
import { execa } from 'execa'
import { findCookiesFile } from './cookies'
import { sleep, waitWithSpinner } from './utils'

export interface UploadOptions {
  filePath: string
  userCookie: string
  tag: string
  limit: number
}

/**
 * Upload file to Bilibili
 * @param options Upload options
 * @returns wait until upload finish
 */
async function uploadFile(options: UploadOptions): Promise<void> {
  try {
    // eslint-disable-next-line no-console
    console.log(`Starting upload for: ${options.filePath}`)

    // Use biliup to upload the file
    const cookies = findCookiesFile(options.userCookie)

    await execa('biliup', ['--user-cookie', cookies, 'upload', options.filePath, '--tag', options.tag, '--limit', String(options.limit)], {
      stdio: 'inherit',
    })

    // Delete file after successful upload
    await fs.promises.unlink(options.filePath)

    // eslint-disable-next-line no-console
    console.log(`Successfully uploaded: ${options.filePath}\n`)
  }
  catch (error) {
    console.error(`Failed to upload ${options.filePath}:`, error)

    // todo: check if the error is because of upload interval
    // await waitWithSpinner(30_000, { loadingText: '您投稿的频率过快，请稍等30秒' })
    // return uploadFile(options)
  }
}

/**
 * Upload file to Bilibili with spinner
 * @param options Upload options
 * @returns wait until upload finish and upload interval end
 */
export async function uploadWithSpinner(options: UploadOptions): Promise<void> {
  const startTimestamp = Date.now()

  await uploadFile(options)

  const endTimestamp = Date.now()
  const duration = endTimestamp - startTimestamp
  // eslint-disable-next-line no-console
  console.log(`Upload duration: ${duration}ms`)

  // add a random buffer time to avoid upload interval limit
  const bufferTime = Math.random() * 10_000

  // bilibili api upload interval must greater than 30 seconds
  const waitTime = 30_000 - duration
  if (waitTime > 0) {
    await waitWithSpinner(waitTime + bufferTime, {
      beginText: `bilibili api 限制上传间隔需要大于 30 秒，需等待 ${waitTime}ms`,
      loadingText: '等待中...',
      endText: 'bilibili api 上传间隔等待完成',
    })
  }
  else {
    await sleep(bufferTime)
  }
}
