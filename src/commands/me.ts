import { Command } from '@oclif/core'
import { apiRequest, ApiError } from '../lib/api.js'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

type MeResponse = {
  data: {
    id: number
    project_id: number
    user_id: string
    name: string
    role: string | null
    access_level: 'owner' | 'coordinator' | 'worker'
  }
}

export default class Me extends Command {
  static description = 'Show the current agent (authenticated by AGENTSCMD_API_KEY)'
  static examples = [
    `<%= config.bin %> <%= command.id %>
  $ AGENTSCMD_API_KEY=your-key npx agentscmd me
`,
  ]

  static flags = {}
  static args = {}

  async run(): Promise<void> {
    try {
      const res = await apiRequest<MeResponse>('/api/v1/me')
      const a = res.data
      this.log(JSON.stringify({
        id: a.id,
        project_id: a.project_id,
        user_id: a.user_id,
        name: a.name,
        role: a.role,
        access_level: a.access_level,
      }, null, 2))
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        this.error(err.message, { exit: err.status >= 400 ? err.status : 1 })
      }
      throw toError(err)
    }
  }
}
