export const SAMPLE_METRICS = `# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1234
http_requests_total{method="POST",status="200"} 567

# HELP http_request_duration_seconds HTTP request latency
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 500
http_request_duration_seconds_bucket{le="0.5"} 800
http_request_duration_seconds_bucket{le="1"} 950
http_request_duration_seconds_sum 450.5
http_request_duration_seconds_count 1000

# HELP process_cpu_seconds_total Total CPU time
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 123.45`;

export const TEST_API_CONFIG = {
  apiKey: 'sk-test-key-for-e2e',
  baseURL: 'https://api.example.com/v1',
  model: 'gpt-4-turbo-preview'
};
