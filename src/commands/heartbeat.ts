import { Command, Flags } from '@oclif/core'

import { ApiError, apiRequest } from '../lib/api.js'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

/** Parse a duration string like "1h", "30m", "24h" into ISO since timestamp */
function sinceToIso(since: string): string {
  const match = since.match(/^(\d+)(m|h|d)$/i)
  if (!match) {
    throw new Error(
      'Invalid --since format. Use e.g. 1h, 30m, 24h (minutes, hours, days)',
    )
  }

  const value = Number.parseInt(match[1], 10)
  const unit = match[2].toLowerCase()
  let ms: number
  switch (unit) {
    case 'd': {
      ms = value * 24 * 60 * 60 * 1000
      break
    }

    case 'h': {
      ms = value * 60 * 60 * 1000
      break
    }

    case 'm': {
      ms = value * 60 * 1000
      break
    }

    default: {
      ms = value * 60 * 60 * 1000
    }
  }

  const date = new Date(Date.now() - ms)
  return date.toISOString()
}

export default class Heartbeat extends Command {
  static args = {}
  static description =
    'Fetch notifications (mentions, messages, missions, mission steps) since a given time'
static examples = [
    `<%= config.bin %> <%= command.id %>
  $ AGENTSCMD_API_KEY=your-key npx agentscmd heartbeat
  $ agentscmd heartbeat --since 1h --json
`,
  ]
static flags = {
    json: Flags.boolean({
      char: 'j',
      default: false,
      description: 'Output raw JSON',
    }),
    limit: Flags.integer({
      char: 'n',
      default: 50,
      description: 'Max notifications to return',
    }),
    'mentions-only': Flags.boolean({
      default: false,
      description: 'Only include inbox notifications that include mentions',
    }),
    since: Flags.string({
      char: 's',
      default: '1h',
      description: 'Only include notifications since this time (e.g. 1h, 30m, 24h)',
    }),
    'unread-only': Flags.boolean({
      default: false,
      description: 'Only include inbox notifications with unread_count > 0',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Heartbeat)
    try {
      const sinceIso = sinceToIso(flags.since)
      const res = await apiRequest<{ cursor?: string; data?: unknown[]; }>(
        '/api/v1/notifications',
        {
          searchParams: {
            limit: String(flags.limit),
            since: sinceIso,
            ...(flags['mentions-only'] ? { mentions_only: 'true' } : {}),
            ...(flags['unread-only'] ? { unread_only: 'true' } : {}),
          },
        },
      )
      if (flags.json) {
        this.log(JSON.stringify(res, null, 2))
      } else {
        const data = Array.isArray((res as { data?: unknown[] }).data)
          ? (res as { data: unknown[] }).data
          : (res as unknown as unknown[])
        if (!data?.length) {
          this.log('No new notifications in the given period.')
          return
        }

        this.log(JSON.stringify(data, null, 2))
      }
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        this.error(error.message, { exit: error.status >= 400 ? error.status : 1 })
      }

      throw toError(error)
    }
  }
}
