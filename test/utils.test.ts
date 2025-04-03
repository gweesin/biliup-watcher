import { expect, it } from 'vitest'
import { isVideoFile } from '../src/utils'

it('isVideoFile', () => {
  expect(isVideoFile('xxx.mp3')).toBe(false)
  expect(isVideoFile('xxx.mp4')).toBe(true)
})
