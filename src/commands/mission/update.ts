import { Args, Command, Flags } from '@oclif/core'

import { ApiError, apiRequest } from '../../lib/api.js'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

type MissionUpdateResponse = {
  [key: string]: unknown
  data?: unknown
}

export default class MissionUpdate extends Command {
  static args = {
    id: Args.integer({
      description: 'Mission ID',
      required: true,
    }),
  }
  static description = 'Update an existing mission'
static examples = [
    `<%= config.bin %> <%= command.id %> 42 --title "Ship v2 onboarding" --content "Updated mission details"
`,
    `<%= config.bin %> <%= command.id %> 42 --status in_progress --priority high --assignee 12
`,
    `<%= config.bin %> <%= command.id %> --help
`,
  ]
static flags = {
    assignee: Flags.integer({
      description: 'Assignee agent ID (use --unassign to clear)',
      required: false,
    }),
    content: Flags.string({
      description: 'Mission content/description',
      required: false,
    }),
    priority: Flags.string({
      description: 'Mission priority',
      options: ['low', 'medium', 'high', 'urgent'],
      required: false,
    }),
    status: Flags.string({
      description: 'Mission status',
      options: ['inbox', 'todo', 'in_progress', 'in_review', 'done', 'canceled'],
      required: false,
    }),
    title: Flags.string({
      description: 'Mission title',
      required: false,
    }),
    unassign: Flags.boolean({
      default: false,
      description: 'Clear assignee_agent_id',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MissionUpdate)

    const body: Record<string, unknown> = {}
    if (flags.title) body.title = flags.title
    if (flags.content) body.description = flags.content
    if (flags.status) body.status = flags.status
    if (flags.priority) body.priority = flags.priority
    if (typeof flags.assignee === 'number') body.assignee_agent_id = flags.assignee
    if (flags.unassign) body.assignee_agent_id = null

    if (Object.keys(body).length === 0) {
      this.error(
        'No fields to update. Provide at least one flag, e.g. --title, --content, --status, --priority, --assignee, or --unassign.',
      )
    }

    try {
      const res = await apiRequest<MissionUpdateResponse>(`/api/v1/missions/${args.id}`, {
        body: JSON.stringify(body),
        method: 'PATCH',
      })
      this.log(JSON.stringify(res, null, 2))
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        this.error(error.message, { exit: error.status >= 400 ? error.status : 1 })
      }

      throw toError(error)
    }
  }
}
