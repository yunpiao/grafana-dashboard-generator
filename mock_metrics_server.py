#!/usr/bin/env python3
"""
Mock Prometheus Metrics Server
启动后访问 http://localhost:9090/metrics 获取样例数据
"""

from http.server import HTTPServer, BaseHTTPRequestHandler

SAMPLE_METRICS = """# HELP http_requests_total Total number of HTTP requests.
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 15234
http_requests_total{method="GET",status="500"} 23
http_requests_total{method="POST",status="201"} 892

# HELP http_request_duration_seconds HTTP request latency in seconds.
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.01"} 5600
http_request_duration_seconds_bucket{le="0.05"} 13800
http_request_duration_seconds_bucket{le="0.1"} 14900
http_request_duration_seconds_bucket{le="0.5"} 15200
http_request_duration_seconds_bucket{le="1"} 15234
http_request_duration_seconds_bucket{le="+Inf"} 15234
http_request_duration_seconds_sum 312.45
http_request_duration_seconds_count 15234

# HELP http_requests_in_flight Current number of HTTP requests being processed.
# TYPE http_requests_in_flight gauge
http_requests_in_flight 12

# HELP go_goroutines Number of goroutines that currently exist.
# TYPE go_goroutines gauge
go_goroutines 42

# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 5.6789012e+07
"""

class MetricsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/metrics' or self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(SAMPLE_METRICS.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[Request] {args[0]}")

if __name__ == '__main__':
    port = 9090
    server = HTTPServer(('0.0.0.0', port), MetricsHandler)
    print(f"🚀 Mock Prometheus Server running at http://localhost:{port}/metrics")
    print("   Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
