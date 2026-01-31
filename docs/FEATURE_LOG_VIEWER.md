# Log Viewer (Internal)

This feature exposes server logs in the UI via SSE.

## Enable

```
ENABLE_LOG_VIEWER=true
LOG_BUFFER_SIZE=500
LOG_LEVEL=info
```

## Notes

- Logs are stored in memory only and reset on restart.
- The UI connects to `/api/logs/stream` (SSE).

