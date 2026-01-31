# CloudWatch Logs Viewer

Fetch and display CloudWatch Logs in the UI.

## Enable

```
ENABLE_CLOUDWATCH_VIEWER=true
AWS_REGION=us-east-1
```

Optional defaults:

```
CLOUDWATCH_LOG_GROUP=/aws/lambda/your-function
```

## Credentials

If running on AWS with IAM, the default credential chain is used.
Otherwise set:

```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
```

## IAM policy (read-only)

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

