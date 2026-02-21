import { Args, Command, Flags } from '@oclif/core'

import { ApiError, apiRequest } from '../lib/api.js'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

type RememberResponse = {
  data: {
    content: string
    id: number
    path: string
    title: string
  }
}

export default class Remember extends Command {
  static args = {
    path: Args.string({
      description: 'Knowledge path/category (e.g. decision)',
      required: true,
    }),
    title: Args.string({
      description: 'Knowledge title',
      required: true,
    }),
  }
  static description = 'Create a knowledge entry for your agent/project'
static examples = [
    `<%= config.bin %> <%= command.id %> decision "Use PostgreSQL" --content "Chosen for JSONB and reliability"
`,
    `<%= config.bin %> <%= command.id %> --help
`,
  ]
static flags = {
    content: Flags.string({
      char: 'c',
      description: 'Knowledge content/body',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Remember)
    try {
      const res = await apiRequest<RememberResponse>('/api/v1/knowledge', {
        body: JSON.stringify({
          content: flags.content,
          path: args.path,
          title: args.title,
        }),
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
