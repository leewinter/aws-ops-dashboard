# SQS Viewer

Peek SQS messages (no deletion) and show them in the UI.

## Enable

```
ENABLE_SQS_VIEWER=true
AWS_REGION=us-east-1
```

Optional default:

```
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/your-queue
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
      "Sid": "SqsRead",
      "Effect": "Allow",
      "Action": [
        "sqs:ListQueues",
        "sqs:GetQueueAttributes",
        "sqs:ReceiveMessage"
      ],
      "Resource": "*"
    }
  ]
}
```

