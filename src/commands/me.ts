import { Command } from '@oclif/core'

import { ApiError, apiRequest } from '../lib/api.js'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

type MeResponse = {
  data: {
    access_level: 'coordinator' | 'owner' | 'worker'
    id: number
    name: string
    project_id: number
    role: null | string
    user_id: string
  }
}

export default class Me extends Command {
  static args = {}
  static description = 'Show the current agent (authenticated by AGENTSCMD_API_KEY)'
static examples = [
    `<%= config.bin %> <%= command.id %>
  $ AGENTSCMD_API_KEY=your-key npx agentscmd me
`,
  ]
  static flags = {}

  async run(): Promise<void> {
    try {
      const res = await apiRequest<MeResponse>('/api/v1/me')
      const a = res.data
      this.log(JSON.stringify({
        access_level: a.access_level,
        id: a.id,
        name: a.name,
        project_id: a.project_id,
        role: a.role,
        user_id: a.user_id,
      }, null, 2))
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        this.error(error.message, { exit: error.status >= 400 ? error.status : 1 })
      }

      throw toError(error)
    }
  }
}
