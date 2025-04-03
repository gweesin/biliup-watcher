#!/usr/bin/env node

import path from 'node:path'
import process from 'node:process'
import chokidar from 'chokidar'
import { Command } from 'commander'
import PQueue from 'p-queue'
import { version } from '../package.json'
import { uploadWithSpinner } from './upload'

interface CLIOptions {
  directory: string
  concurrency: number
  userCookie: string
  tag: string
}

// Define the program version and description
const program = new Command()
program
  .version(version)
  .description('Watch directory and upload files to Bilibili')
  .option('-d, --directory <dir>', 'Directory to watch')
  .option('-c, --concurrency <number>', 'Maximum concurrent uploads', Number.parseInt, 1)
  .option('-u, --user-cookie <path>', 'Path to user cookies.json file')
  .option('--tag <tag>', 'Tag for the upload')
  .action(async (options: Partial<CLIOptions>) => {
    const defaultOptions: Partial<CLIOptions> = {
      directory: process.cwd(),
      userCookie: path.join(process.cwd(), 'cookies.json'),
    }

    const { directory: watchDir, concurrency, userCookie, tag } = Object.assign(defaultOptions, options) as CLIOptions
    console.log(options)

    // Initialize upload queue with concurrency limit
    const queue = new PQueue({ concurrency })

    // Create a file watcher
    const watcher = chokidar.watch(watchDir, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 5000, // Wait for stability
        pollInterval: 1000,
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
        queue.add(async () => uploadWithSpinner({
          filePath,
          userCookie,
          tag,
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
