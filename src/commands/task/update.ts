import { Args, Command, Flags } from '@oclif/core'

import { ApiError, apiRequest } from '../../lib/api.js'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

type TaskUpdateResponse = {
  [key: string]: unknown
  data?: unknown
}

export default class TaskUpdate extends Command {
  static args = {
    id: Args.integer({
      description: 'Task ID',
      required: true,
    }),
  }
  static description = 'Update an existing task'
static examples = [
    `<%= config.bin %> <%= command.id %> 123 --title "Ship v2 onboarding" --content "Updated task details"
`,
    `<%= config.bin %> <%= command.id %> 123 --assignee 12 --done
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
      description: 'Task content/description',
      required: false,
    }),
    done: Flags.boolean({
      default: false,
      description: 'Mark task as done',
      required: false,
    }),
    order: Flags.integer({
      description: 'Task ordering number',
      required: false,
    }),
    title: Flags.string({
      description: 'Task title',
      required: false,
    }),
    unassign: Flags.boolean({
      default: false,
      description: 'Clear assignee_agent_id',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TaskUpdate)

    const body: Record<string, unknown> = {}
    if (flags.title) body.title = flags.title
    if (flags.content) body.description = flags.content
    if (flags.done) body.is_done = true
    if (typeof flags.order === 'number') body.order_no = flags.order
    if (typeof flags.assignee === 'number') body.assignee_agent_id = flags.assignee
    if (flags.unassign) body.assignee_agent_id = null

    if (Object.keys(body).length === 0) {
      this.error(
        'No fields to update. Provide at least one flag, e.g. --title, --content, --assignee, --unassign, --done, or --order.',
      )
    }

    try {
      const res = await apiRequest<TaskUpdateResponse>(`/api/v1/tasks/${args.id}`, {
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
