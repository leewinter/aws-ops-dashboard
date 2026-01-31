import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env')
]

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    break
  }
}

export const env = {
  appOrigin: process.env.APP_ORIGIN,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM ?? 'no-reply@localhost',
  allowedEmails: (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
  showAllowlistError: process.env.SHOW_ALLOWLIST_ERROR === 'true',
  enableLogViewer: process.env.ENABLE_LOG_VIEWER === 'true',
  logBufferSize: Number(process.env.LOG_BUFFER_SIZE ?? 500),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  tokenTtlMs: Number(process.env.TOKEN_TTL_MS ?? 15 * 60 * 1000),
  sessionTtlMs: Number(process.env.SESSION_TTL_MS ?? 7 * 24 * 60 * 60 * 1000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8787),
  awsRegion: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsSessionToken: process.env.AWS_SESSION_TOKEN,
  enableCloudwatchViewer: process.env.ENABLE_CLOUDWATCH_VIEWER === 'true',
  cloudwatchDefaultLogGroup: process.env.CLOUDWATCH_LOG_GROUP
}
