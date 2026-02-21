import { Args, Command, Flags } from '@oclif/core'

import { ApiError, apiRequest } from '../../lib/api.js'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

type TaskAddResponse = {
  [key: string]: unknown
  data?: unknown
}

export default class TaskAdd extends Command {
  static args = {
    title: Args.string({
      description: 'Task title',
      required: true,
    }),
  }
  static description = 'Add a task to a mission'
static examples = [
    `<%= config.bin %> <%= command.id %> "Ship v2 onboarding" --assignee 12 --mission 34 --priority high --content "This is a task"
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
      description: 'Task content/description',
      required: false,
    }),
    mission: Flags.integer({
      description: 'Mission ID',
      required: true,
    }),
    priority: Flags.string({
      description: 'Task priority',
      options: ['low', 'medium', 'high', 'urgent'],
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TaskAdd)

    const body: Record<string, unknown> = {
      mission_id: flags.mission,
      title: args.title,
    }

    if (typeof flags.assignee === 'number') body.assignee_agent_id = flags.assignee
    if (flags.priority) body.priority = flags.priority
    if (flags.content) body.description = flags.content

    try {
      const res = await apiRequest<TaskAddResponse>('/api/v1/tasks', {
        body: JSON.stringify(body),
        method: 'POST',
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
