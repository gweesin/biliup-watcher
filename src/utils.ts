import ora from 'ora'

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function waitWithSpinner(ms: number, options: { loadingText: string, endText?: string, beginText?: string }): Promise<void> {
  const spinner = ora(options.loadingText).start(options.beginText)
  await sleep(ms)
  spinner.succeed(options.endText)
}

// eslint-disable-next-line regexp/no-unused-capturing-group
const videoExtensions = /\.(mp4|avi|mkv|mov|webm|flv|wmv|3gp|mpeg|ogv)$/i

export function isVideoFile(filename: string): boolean {
  return videoExtensions.test(filename)
}
