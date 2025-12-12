#!/usr/bin/env python3
"""
Mock Prometheus Metrics Server
启动后访问 http://localhost:9090/metrics 获取样例数据
"""

from http.server import HTTPServer, BaseHTTPRequestHandler

SAMPLE_METRICS = """# HELP etcd_server_has_leader Whether or not a leader exists. 1 is existence, 0 is not.
# TYPE etcd_server_has_leader gauge
etcd_server_has_leader 1
# HELP etcd_server_is_leader Whether or not this member is a leader. 1 if is, 0 otherwise.
# TYPE etcd_server_is_leader gauge
etcd_server_is_leader 1
# HELP etcd_server_leader_changes_seen_total The number of leader changes seen.
# TYPE etcd_server_leader_changes_seen_total counter
etcd_server_leader_changes_seen_total 1
# HELP etcd_server_proposals_applied_total The total number of consensus proposals applied.
# TYPE etcd_server_proposals_applied_total gauge
etcd_server_proposals_applied_total 112
# HELP etcd_server_proposals_pending The current number of pending proposals to commit.
# TYPE etcd_server_proposals_pending gauge
etcd_server_proposals_pending 0

# HELP etcd_mvcc_db_total_size_in_bytes Total size of the underlying database physically allocated in bytes.
# TYPE etcd_mvcc_db_total_size_in_bytes gauge
etcd_mvcc_db_total_size_in_bytes 20480
# HELP etcd_debugging_mvcc_keys_total Total number of keys.
# TYPE etcd_debugging_mvcc_keys_total gauge
etcd_debugging_mvcc_keys_total 0
# HELP etcd_mvcc_range_total Total number of ranges seen by this member.
# TYPE etcd_mvcc_range_total counter
etcd_mvcc_range_total 108
# HELP etcd_mvcc_put_total Total number of puts seen by this member.
# TYPE etcd_mvcc_put_total counter
etcd_mvcc_put_total 0

# HELP grpc_server_started_total Total number of RPCs started on the server.
# TYPE grpc_server_started_total counter
grpc_server_started_total{grpc_method="Range",grpc_service="etcdserverpb.KV",grpc_type="unary"} 106
grpc_server_started_total{grpc_method="Alarm",grpc_service="etcdserverpb.Maintenance",grpc_type="unary"} 106
grpc_server_started_total{grpc_method="Put",grpc_service="etcdserverpb.KV",grpc_type="unary"} 0
grpc_server_started_total{grpc_method="Watch",grpc_service="etcdserverpb.Watch",grpc_type="bidi_stream"} 0
# HELP etcd_network_client_grpc_received_bytes_total The total number of bytes received from grpc clients.
# TYPE etcd_network_client_grpc_received_bytes_total counter
etcd_network_client_grpc_received_bytes_total 864
# HELP etcd_network_client_grpc_sent_bytes_total The total number of bytes sent to grpc clients.
# TYPE etcd_network_client_grpc_sent_bytes_total counter
etcd_network_client_grpc_sent_bytes_total 5832

# HELP etcd_disk_wal_fsync_duration_seconds The latency distributions of fsync called by WAL.
# TYPE etcd_disk_wal_fsync_duration_seconds histogram
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.001"} 0
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.002"} 1
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.004"} 100
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.008"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.016"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.032"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.064"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.128"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.256"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.512"} 114
etcd_disk_wal_fsync_duration_seconds_bucket{le="+Inf"} 114
etcd_disk_wal_fsync_duration_seconds_sum 0.705
etcd_disk_wal_fsync_duration_seconds_count 114
# HELP etcd_disk_backend_commit_duration_seconds The latency distributions of commit called by backend.
# TYPE etcd_disk_backend_commit_duration_seconds histogram
etcd_disk_backend_commit_duration_seconds_bucket{le="0.001"} 0
etcd_disk_backend_commit_duration_seconds_bucket{le="0.002"} 0
etcd_disk_backend_commit_duration_seconds_bucket{le="0.004"} 0
etcd_disk_backend_commit_duration_seconds_bucket{le="0.008"} 5
etcd_disk_backend_commit_duration_seconds_bucket{le="0.016"} 6
etcd_disk_backend_commit_duration_seconds_bucket{le="0.032"} 6
etcd_disk_backend_commit_duration_seconds_bucket{le="+Inf"} 6
etcd_disk_backend_commit_duration_seconds_sum 0.043
etcd_disk_backend_commit_duration_seconds_count 6

# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 3.930112e+07
# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 3.43
# HELP process_open_fds Number of open file descriptors.
# TYPE process_open_fds gauge
process_open_fds 19
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
