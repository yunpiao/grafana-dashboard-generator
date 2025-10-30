/**
 * Metrics Parser
 * Parses Prometheus metrics text format and generates a structured summary
 */

/**
 * Parse Prometheus metrics text into a structured summary
 * @param {string} metricsText - Raw Prometheus metrics text
 * @returns {object} Structured metrics summary
 */
export function parseMetrics(metricsText) {
  if (!metricsText || typeof metricsText !== 'string') {
    throw new Error('Invalid metrics text provided');
  }

  const lines = metricsText.split('\n');
  const metricsFamilies = {};
  
  let currentMetricName = null;
  let currentHelp = '';
  let currentType = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;

    // Parse HELP lines
    if (trimmedLine.startsWith('# HELP ')) {
      const parts = trimmedLine.substring(7).split(' ');
      currentMetricName = parts[0];
      currentHelp = parts.slice(1).join(' ');
      continue;
    }

    // Parse TYPE lines
    if (trimmedLine.startsWith('# TYPE ')) {
      const parts = trimmedLine.substring(7).split(' ');
      currentMetricName = parts[0];
      currentType = parts[1] || 'untyped';
      continue;
    }

    // Skip other comments
    if (trimmedLine.startsWith('#')) continue;

    // Parse metric lines
    const metricMatch = trimmedLine.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)((?:\{[^}]*\})?)?\s+([^\s]+)(?:\s+(\d+))?$/);
    
    if (metricMatch) {
      const metricName = metricMatch[1];
      const labelsStr = metricMatch[2] || '';
      
      // Extract labels
      const labels = new Set();
      if (labelsStr) {
        const labelMatches = labelsStr.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)="[^"]*"/g);
        for (const match of labelMatches) {
          labels.add(match[1]);
        }
      }

      // Initialize metric family if not exists
      if (!metricsFamilies[metricName]) {
        metricsFamilies[metricName] = {
          type: currentType || 'untyped',
          help: currentMetricName === metricName ? currentHelp : '',
          labels: new Set()
        };
      }

      // Add labels to the set
      labels.forEach(label => metricsFamilies[metricName].labels.add(label));
    }
  }

  // Convert Sets to sorted arrays for JSON serialization
  const metricsSummary = {};
  for (const [name, data] of Object.entries(metricsFamilies)) {
    metricsSummary[name] = {
      type: data.type,
      help: data.help,
      labels: Array.from(data.labels).sort()
    };
  }

  return metricsSummary;
}

/**
 * Validate and sanitize metrics text
 * @param {string} metricsText - Raw metrics text
 * @returns {object} Validation result
 */
export function validateMetrics(metricsText) {
  try {
    const summary = parseMetrics(metricsText);
    const metricCount = Object.keys(summary).length;
    
    if (metricCount === 0) {
      return {
        valid: false,
        error: 'No valid metrics found in the provided text'
      };
    }

    return {
      valid: true,
      metricCount,
      summary
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}


