# AWS Ops Dashboard

Monorepo with a React (Vite) frontend and a Hono API. In dev they run on separate ports; in Docker the API serves both the API and the built React app on a single port.

## Quick start

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:8787

If you are running from Windows PowerShell against WSL, prefer:

```bash
wsl -d Ubuntu-24.04 --cd /home/lee/projects/hono-magic-link -- npm install
```

## Environment variables

Create a `.env` file in the repo root (same level as `package.json`). Use `.env.example` as a starting point.

### Required

**Core app**
- `APP_ORIGIN` (string)
  - Base URL used to construct the magic link.
  - Dev default: `http://localhost:5173`.

**SMTP**
- `SMTP_HOST` (string)
  - SMTP host name. For SES (example): `email-smtp.us-east-1.amazonaws.com`.
- `SMTP_PORT` (number)
  - Common values: `587` (STARTTLS) or `465` (SSL).
- `SMTP_USER` (string)
  - SMTP username (SES SMTP user if using SES).
- `SMTP_PASS` (string)
  - SMTP password (SES SMTP password if using SES).
- `SMTP_FROM` (string)
  - From address used when sending the email.
  - Must be verified in SES if you are in SES sandbox.

If SMTP is not configured, the magic link is logged to the API console.

### Optional (auth behavior)

- `ALLOWED_EMAILS` (comma-separated list)
  - Allowlist of emails that can request links. Example:
    - `ALLOWED_EMAILS=you@example.com,teammate@example.com`
  - If empty, all emails are allowed.
- `SHOW_ALLOWLIST_ERROR` (`true`/`false`)
  - When `true`, the API returns a 403 with message `Email is not registered.` for emails not in `ALLOWED_EMAILS`.
  - When `false`, the API responds `ok: true` to avoid user enumeration.
- `TOKEN_TTL_MS` (number)
  - Magic link token time-to-live in milliseconds.
  - Default: `900000` (15 minutes).
- `SESSION_TTL_MS` (number)
  - Session cookie time-to-live in milliseconds.
  - Default: `604800000` (7 days).

### Optional (log viewer)

- `ENABLE_LOG_VIEWER` (`true`/`false`)
  - Enables the log viewer SSE endpoint and UI panel.
  - Default: `false`.
- `LOG_BUFFER_SIZE` (number)
  - Maximum number of log lines kept in memory for the viewer.
  - Default: `500`.
- `LOG_LEVEL` (string)
  - Winston log level (e.g. `error`, `warn`, `info`, `debug`).
  - Default: `info`.

### Optional (CloudWatch viewer)

- `ENABLE_CLOUDWATCH_VIEWER` (`true`/`false`)
  - Enables CloudWatch log viewer API and UI panel.
  - Default: `false`.
- `CLOUDWATCH_LOG_GROUP` (string)
  - Default log group for the CloudWatch viewer.
- `AWS_REGION` (string)
  - AWS region for CloudWatch Logs (e.g. `us-east-1`).
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN`
  - Optional static credentials. If not set, the app uses the default AWS SDK
    credential chain (IAM role, ECS task role, etc.).

### Optional (SQS viewer)

- `ENABLE_SQS_VIEWER` (`true`/`false`)
  - Enables SQS viewer API and UI panel.
  - Default: `false`.
- `SQS_QUEUE_URL` (string)
  - Default queue URL for the SQS viewer.

## Feature docs

- Log viewer: `docs/FEATURE_LOG_VIEWER.md`
- CloudWatch logs: `docs/FEATURE_CLOUDWATCH.md`
- SQS viewer: `docs/FEATURE_SQS.md`

## CloudWatch Logs viewer

Enable the viewer with:

```
ENABLE_CLOUDWATCH_VIEWER=true
AWS_REGION=us-east-1
```

If running outside AWS IAM, also set:

```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
```

Example IAM policy for read-only access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudWatchRead",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:GetMetricData",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics",
        "cloudwatch:DescribeAlarms"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogsRead",
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:GetLogEvents",
        "logs:FilterLogEvents",
        "logs:StartQuery",
        "logs:GetQueryResults"
      ],
      "Resource": "*"
    }
  ]
}
```

## Docker

```bash
docker build -t aws-ops-dashboard .
docker run -p 3000:3000 aws-ops-dashboard
```

Open http://localhost:3000