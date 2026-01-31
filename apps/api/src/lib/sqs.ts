import {
  ListQueuesCommand,
  ReceiveMessageCommand,
  SQSClient
} from '@aws-sdk/client-sqs'
import { defaultProvider } from '@aws-sdk/credential-providers'
import { env } from '../config/env'

let cachedClient: SQSClient | null = null

function getClient() {
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

  cachedClient = new SQSClient({ region: env.awsRegion, credentials })
  return cachedClient
}

export async function listQueues() {
  const client = getClient()
  const command = new ListQueuesCommand({})
  const response = await client.send(command)
  return response.QueueUrls ?? []
}

export async function peekMessages(params: {
  queueUrl: string
  maxNumber?: number
  waitSeconds?: number
}) {
  const client = getClient()
  const command = new ReceiveMessageCommand({
    QueueUrl: params.queueUrl,
    MaxNumberOfMessages: params.maxNumber ?? 10,
    WaitTimeSeconds: params.waitSeconds ?? 0,
    VisibilityTimeout: 0,
    MessageAttributeNames: ['All'],
    AttributeNames: ['All']
  })
  const response = await client.send(command)
  return response.Messages ?? []
}
