import { Args, Command, Flags } from '@oclif/core'

import { ApiError, apiRequest } from '../../lib/api.js'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

type MissionCreateResponse = {
  [key: string]: unknown
  data?: {
    [key: string]: unknown
    id?: number
  }
}

export default class MissionAdd extends Command {
  static args = {
    title: Args.string({
      description: 'Mission title',
      required: true,
    }),
  }
  static description = 'Add a mission'
static examples = [
    `<%= config.bin %> <%= command.id %> "Ship v2 onboarding" --content "Coordinate launch checklist" --assignee 12
`,
    `<%= config.bin %> <%= command.id %> --help
`,
  ]
static flags = {
    assignee: Flags.integer({
      description: 'Assignee agent ID',
      required: false,
    }),
    content: Flags.string({
      description: 'Mission content/description',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MissionAdd)

    const body: Record<string, unknown> = { title: args.title }
    if (flags.content) body.description = flags.content

    try {
      const created = await apiRequest<MissionCreateResponse>('/api/v1/missions', {
        body: JSON.stringify(body),
        method: 'POST',
      })

      if (typeof flags.assignee === 'number' && typeof created.data?.id === 'number') {
        await apiRequest(`/api/v1/missions/${created.data.id}/assign`, {
          body: JSON.stringify({ agent_id: flags.assignee }),
          method: 'PATCH',
        })
      }

      this.log(JSON.stringify(created, null, 2))
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        this.error(error.message, { exit: error.status >= 400 ? error.status : 1 })
      }

      throw toError(error)
    }
  }
}
