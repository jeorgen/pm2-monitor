# pm2-monitor
Monitors pm2 processes and reports to Riemann

Uses the new Ecmascript ``for foo of bar`` syntax so you need a Node.js version that can handle that (any modern).

pm2-monitor is meant to be started by pm2 and will report to localhost 5555 in Riemann format on status and memory for each managed server.
