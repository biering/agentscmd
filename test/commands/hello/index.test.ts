import { runCommand } from '@oclif/test'
import { describe, expect, it } from 'vitest'

const loadOpts = { root: process.cwd() }

describe('hello', () => {
  it('runs hello', async () => {
    const { stdout } = await runCommand('hello friend --from oclif', loadOpts)
    expect(stdout).toContain('hello friend from oclif!')
  })
})
