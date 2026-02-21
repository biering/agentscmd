import { Args, Command } from '@oclif/core'

import { ApiError, apiRequest } from '../lib/api.js'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

export default class Search extends Command {
  static args = {
    q: Args.string({
      description: 'Search query',
      required: true,
    }),
  }
  static description = 'Search project knowledge by query string'
static examples = [
    `<%= config.bin %> <%= command.id %> "postgresql"
`,
    `<%= config.bin %> <%= command.id %> --help
`,
  ]
static flags = {}

  async run(): Promise<void> {
    const { args } = await this.parse(Search)
    try {
      const res = await apiRequest<{ [key: string]: unknown; data?: unknown[]; }>(
        '/api/v1/knowledge',
        {
          searchParams: { q: args.q },
        },
      )
      this.log(JSON.stringify(res, null, 2))
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        this.error(error.message, { exit: error.status >= 400 ? error.status : 1 })
      }

      throw toError(error)
    }
  }
}
