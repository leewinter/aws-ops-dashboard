import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  FilterLogEventsCommand
} from '@aws-sdk/client-cloudwatch-logs'
import { defaultProvider } from '@aws-sdk/credential-providers'
import { env } from '../config/env'

let cachedClient: CloudWatchLogsClient | null = null

export function getCloudWatchClient() {
  if (cachedClient) return cachedClient

  if (!env.awsRegion) {
    throw new Error('AWS region is not configured.')
  }

  const credentials =
    env.awsAccessKeyId && env.awsSecretAccessKey
      ? {
          accessKeyId: env.awsAccessKeyId,
          secretAccessKey: env.awsSecretAccessKey,
          sessionToken: env.awsSessionToken
        }
      : defaultProvider()

  cachedClient = new CloudWatchLogsClient({
    region: env.awsRegion,
    credentials
  })
  return cachedClient
}

export async function fetchCloudWatchLogs(params: {
  logGroupName: string
  logStreamNames?: string[]
  startTime?: number
  endTime?: number
  limit?: number
  filterPattern?: string
  nextToken?: string
}) {
  const client = getCloudWatchClient()
  const command = new FilterLogEventsCommand({
    logGroupName: params.logGroupName,
    logStreamNames: params.logStreamNames,
    startTime: params.startTime,
    endTime: params.endTime,
    limit: params.limit ?? 50,
    filterPattern: params.filterPattern,
    nextToken: params.nextToken
  })

  const response = await client.send(command)
  return {
    events: response.events ?? [],
    nextToken: response.nextToken
  }
}

export async function listCloudWatchLogGroups(params: {
  nextToken?: string
  limit?: number
}) {
  const client = getCloudWatchClient()
  const command = new DescribeLogGroupsCommand({
    nextToken: params.nextToken,
    limit: params.limit ?? 50
  })
  const response = await client.send(command)
  return {
    logGroups: response.logGroups ?? [],
    nextToken: response.nextToken
  }
}
