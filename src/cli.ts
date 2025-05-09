#!/usr/bin/env node

import type { Matcher } from 'chokidar'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chokidar from 'chokidar'
import { Command } from 'commander'
import PQueue from 'p-queue'
import { version } from '../package.json'
import { uploadWithSpinner } from './upload'
import { isVideoFile } from './utils'

interface CLIOptions {
  directory: string
  concurrency: number
  userCookie: string
  tag: string
  stabilityThreshold: number
  limit: number
  ignored: string[]
}

// Define the program version and description
const program = new Command()
program
  .version(version)
  .description('Watch directory and upload files to Bilibili')
  .option('-d, --directory <dir>', 'Directory to watch')
  .option('-c, --concurrency <number>', 'Maximum concurrent uploads', Number.parseInt, 1)
  .option('-u, --user-cookie <path>', 'Path to user cookies.json file')
  .option('--tag <tag>', 'Tag for the upload, split by comma')
  .option('--stability-threshold <number>', 'Stability threshold for the upload', Number.parseInt, 5000)
  .option('--limit <number>', 'Limit the number of threads. If your network speed is too slow (below 1Mbps), we recommend using the default value.', Number.parseInt, 1)
  .option('--ignored <terms...>', 'Ignore files containing specific terms in their names')
  .action(async (options: Partial<CLIOptions>) => {
    const defaultOptions: Partial<CLIOptions> = {
      directory: process.cwd(),
      userCookie: path.join(process.cwd(), 'cookies.json'),
      ignored: [],
    }

    const { directory: watchDir, concurrency, userCookie, tag, stabilityThreshold, limit, ignored } = Object.assign(defaultOptions, options) as CLIOptions

    // Initialize upload queue with concurrency limit
    const queue = new PQueue({ concurrency })

    const ignoredFn: Matcher = (filepath, stats) => {
      if (!stats?.isFile()) {
        return false
      }

      return !isVideoFile(filepath)
    }

    const STABILITY_TIMEOUT = 5000 // 5 seconds of stability before upload
    // Create a file watcher
    const watcher = chokidar.watch(watchDir, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold, // Wait for stability
        pollInterval: Math.max(stabilityThreshold / 20, STABILITY_TIMEOUT),
      },
      ignored: [ignoredFn, ...ignored],
    })

    // File stability timeout map
    const fileTimers: Map<string, NodeJS.Timeout> = new Map()

    // Handle new or changed files
    watcher.on('add', filePath => handleFileChange(filePath))
    watcher.on('change', filePath => handleFileChange(filePath))

    /**
     * Handle file changes with debouncing to ensure stability
     * @param {string} filePath Path to the changed file
     */
    function handleFileChange(filePath: string): void {
      // Only process video files
      const stats = fs.statSync(filePath)
      const fileSizeInMB = stats.size / (1024 * 1024)

      if (fileSizeInMB < 20) {
        console.log(`Remove file: ${filePath} (file size < 20MB)`)
        fs.rmSync(filePath)
        return
      }

      // Clear the existing timer for this file if it exists
      if (fileTimers.has(filePath)) {
        clearTimeout(fileTimers.get(filePath)!)
      }

      // Set a new timer for this file
      const timer = setTimeout(() => {
        console.log(`File ${filePath} is stable, queueing for upload`)
        fileTimers.delete(filePath)

        // Add to upload queue
        queue.add(async () => uploadWithSpinner({
          filePath,
          userCookie,
          tag,
          limit,
        }))
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
  })

program.parse(process.argv)
