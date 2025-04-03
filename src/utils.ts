import ora from 'ora'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function waitWithSpinner(ms: number, options: { loadingText: string, endText: string, beginText: string }): Promise<void> {
  const spinner = ora(options.loadingText).start(options.beginText)
  await sleep(ms)
  spinner.succeed(options.endText)
}
