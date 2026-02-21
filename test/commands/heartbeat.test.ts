import { runCommand } from '@oclif/test'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createMockServer } from '../helpers/mock-server.js'

const loadOpts = { root: process.cwd() }

describe('heartbeat', () => {
  let restoreEnv: () => Promise<void>

  beforeAll(async () => {
    const server = await createMockServer([])
    const origUrl = process.env.AGENTSCMD_API_URL
    const origKey = process.env.AGENTSCMD_API_KEY
    process.env.AGENTSCMD_API_URL = server.url
    process.env.AGENTSCMD_API_KEY = 'test-key'
    restoreEnv = async () => {
      await server.close()
      if (origUrl === undefined) {delete process.env.AGENTSCMD_API_URL}
      else {process.env.AGENTSCMD_API_URL = origUrl}

      if (origKey === undefined) {delete process.env.AGENTSCMD_API_KEY}
      else {process.env.AGENTSCMD_API_KEY = origKey}
    }
  })

  afterAll(async () => {
    await restoreEnv()
  })

  it('outputs "No new notifications" when empty', async () => {
    const { stdout } = await runCommand('heartbeat', loadOpts)
    expect(stdout).toContain('No new notifications')
  })

  it('outputs notifications JSON when data returned', async () => {
    const server = await createMockServer([{ id: 1, type: 'mention' }])
    const origUrl = process.env.AGENTSCMD_API_URL
    process.env.AGENTSCMD_API_URL = server.url
    try {
      const { stdout } = await runCommand('heartbeat', loadOpts)
      const out = JSON.parse(stdout) as unknown[]
      expect(Array.isArray(out)).toBe(true)
      expect(out).toHaveLength(1)
      expect((out[0] as { id: number }).id).toBe(1)
    } finally {
      await server.close()
      if (origUrl === undefined) {delete process.env.AGENTSCMD_API_URL}
      else {process.env.AGENTSCMD_API_URL = origUrl}
    }
  })
})
