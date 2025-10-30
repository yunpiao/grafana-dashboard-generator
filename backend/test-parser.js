/**
 * Simple test script to verify the metrics parser works correctly
 */

import { parseMetrics, validateMetrics } from './src/metricsParser.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read example metrics
const metricsPath = join(__dirname, '../test-metrics-example.txt');
const metricsText = readFileSync(metricsPath, 'utf8');

console.log('Testing Metrics Parser...\n');
console.log('='.repeat(60));

// Test validation
console.log('\n1. Validating metrics...');
const validation = validateMetrics(metricsText);

if (validation.valid) {
  console.log('✅ Metrics are valid!');
  console.log(`   Found ${validation.metricCount} metrics`);
} else {
  console.log('❌ Validation failed:', validation.error);
  process.exit(1);
}

// Test parsing
console.log('\n2. Parsing metrics...');
const summary = parseMetrics(metricsText);

console.log('\n3. Parsed Metrics Summary:');
console.log('='.repeat(60));

for (const [name, data] of Object.entries(summary)) {
  console.log(`\n📊 ${name}`);
  console.log(`   Type: ${data.type}`);
  console.log(`   Help: ${data.help || '(no help text)'}`);
  console.log(`   Labels: ${data.labels.length > 0 ? data.labels.join(', ') : '(no labels)'}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ Parser test completed successfully!');
console.log(`\nTotal metrics: ${Object.keys(summary).length}`);
console.log(`Counters: ${Object.values(summary).filter(m => m.type === 'counter').length}`);
console.log(`Gauges: ${Object.values(summary).filter(m => m.type === 'gauge').length}`);
console.log(`Histograms: ${Object.values(summary).filter(m => m.type === 'histogram').length}`);
console.log(`Summaries: ${Object.values(summary).filter(m => m.type === 'summary').length}`);


