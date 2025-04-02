#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'
import chokidar from 'chokidar'
import { Command } from 'commander'
import { execa } from 'execa'
import PQueue from 'p-queue'
import { findCookiesFile } from './cookies'

// Define the program version and description
const program = new Command()
program
  .version('1.0.0')
  .description('Watch directory and upload files to Bilibili')
  .option('-d, --directory <dir>', 'Directory to watch', process.cwd())
  .option('-c, --concurrency <number>', 'Maximum concurrent uploads', '1')
  .option('-u, --user-cookie <path>', 'Path to user cookies.json file')
  .option('--tag <tag>', 'Tag for the upload')
  .parse(process.argv)

const options = program.opts()

// Configuration
const watchDir = options.directory
const concurrency = Number.parseInt(options.concurrency, 10)
const userCookiePath = options.userCookie
const tag = options.tag
// Initialize upload queue with concurrency limit
const queue = new PQueue({ concurrency })

/**
 * Upload file to Bilibili
 * @param {string} filePath Path to file
 * @returns {Promise<void>}
 */
async function uploadFile(filePath: string): Promise<void> {
  try {
    console.log(`Starting upload for: ${filePath}`)

    // Use biliup to upload the file
    const cookies = findCookiesFile(userCookiePath)
    await execa('biliup', ['--user-cookie', cookies, 'upload', filePath, '--tag', tag], {
      stdio: 'inherit',
    })
    // Delete file after successful upload
    await fs.promises.unlink(filePath)

    console.log(`Successfully uploaded: ${filePath}`)
  }
  catch (error) {
    console.error(`Failed to upload ${filePath}:`, error)
  }
}

// Create a file watcher
const watcher = chokidar.watch(watchDir, {
  persistent: true,
  ignoreInitial: false,
  awaitWriteFinish: {
    stabilityThreshold: 2000, // Wait for 2 seconds of stability
    pollInterval: 100,
  },
})

// File stability timeout map
const fileTimers: Map<string, NodeJS.Timeout> = new Map()
const STABILITY_TIMEOUT = 5000 // 5 seconds of stability before upload

// Handle new or changed files
watcher.on('add', filePath => handleFileChange(filePath))
watcher.on('change', filePath => handleFileChange(filePath))

/**
 * Handle file changes with debouncing to ensure stability
 * @param {string} filePath Path to the changed file
 */
function handleFileChange(filePath: string): void {
  // Clear existing timer for this file if it exists
  if (fileTimers.has(filePath)) {
    clearTimeout(fileTimers.get(filePath)!)
  }

  // Set a new timer for this file
  const timer = setTimeout(() => {
    console.log(`File ${filePath} is stable, queueing for upload`)
    fileTimers.delete(filePath)

    // Add to upload queue
    queue.add(() => uploadFile(filePath))
      .then(() => {
        console.log(`Finished processing ${filePath}`)
      })
      .catch((err) => {
        console.error(`Error processing ${filePath}:`, err)
      })
  }, STABILITY_TIMEOUT)

  fileTimers.set(filePath, timer)
}

console.log(`Watching directory: ${watchDir}`)
console.log(`Max concurrent uploads: ${concurrency}`)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...')
  watcher.close().then(() => {
    console.log('File watcher closed')
    process.exit(0)
  })
})
