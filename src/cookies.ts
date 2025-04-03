import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * Find cookies file by traversing up directories
 * @param {string} cookiesPath Optional specific path to cookies file
 * @returns {string} Path to cookies file
 */
export function findCookiesFile(cookiesPath?: string): string {
  if (cookiesPath && fs.existsSync(cookiesPath)) {
    // eslint-disable-next-line no-console
    console.log(`Using specified cookies file: ${cookiesPath}`)
    return cookiesPath
  }

  // Start from current directory and go up to root
  let currentDir = process.cwd()
  const rootDir = path.parse(currentDir).root

  while (currentDir !== rootDir) {
    const testPath = path.join(currentDir, 'cookies.json')
    if (fs.existsSync(testPath)) {
    // eslint-disable-next-line no-console
      console.log(`Found cookies file: ${testPath}`)
      return testPath
    }
    // Move up one directory
    currentDir = path.dirname(currentDir)
  }

  // Check root directory as well
  const rootPath = path.join(rootDir, 'cookies.json')
  if (fs.existsSync(rootPath)) {
    // eslint-disable-next-line no-console
    console.log(`Found cookies file: ${rootPath}`)
    return rootPath
  }

  throw new Error('Could not find cookies.json file')
}
