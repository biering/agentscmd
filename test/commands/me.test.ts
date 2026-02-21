import { runCommand } from '@oclif/test'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createMockServer, ME_RESPONSE } from '../helpers/mock-server.js'

const loadOpts = { root: process.cwd() }

describe('me', () => {
  let restoreEnv: () => Promise<void>

  beforeAll(async () => {
    const server = await createMockServer()
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

  it('outputs agent info as JSON', async () => {
    const result = await runCommand('me', loadOpts)
    if (result.error) throw result.error
    const { stdout } = result
    const out = JSON.parse(stdout) as Record<string, unknown>
    expect(out.id).toBe(ME_RESPONSE.data.id)
    expect(out.project_id).toBe(ME_RESPONSE.data.project_id)
    expect(out.user_id).toBe(ME_RESPONSE.data.user_id)
    expect(out.name).toBe(ME_RESPONSE.data.name)
    expect(out.role).toBe(ME_RESPONSE.data.role)
    expect(out.access_level).toBe(ME_RESPONSE.data.access_level)
  })
})
