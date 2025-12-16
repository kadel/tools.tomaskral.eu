const axios = require('axios');
const YAML = require('yaml');

async function yamlToJson(req, res) {
  try {
    // Support both POST body and GET query parameter
    const url = req.body?.url || req.query.url;
    const yaml = req.body?.yaml || req.query.yaml;

    if (!url && !yaml) {
      return res.status(400).json({
        error: 'URL or YAML content is required',
        message: 'Please provide a URL pointing to a YAML file or YAML content directly'
      });
    }

    let yamlContent;

    if (yaml) {
      // Use provided YAML string directly
      yamlContent = yaml;
    } else {
      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid URL format',
          message: 'Please provide a valid URL'
        });
      }

      // Fetch YAML content from URL
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'online-tools-api/1.0.0'
        },
        timeout: 10000
      });

      yamlContent = response.data;
    }

    // Parse YAML to JavaScript object
    const jsonObject = YAML.parse(yamlContent);

    // Return clean JSON response
    res.json(jsonObject);

  } catch (error) {
    console.error('YAML conversion error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(404).json({
        error: 'Unable to fetch URL',
        message: 'The provided URL could not be reached'
      });
    }

    if (error.name === 'YAMLParseError') {
      return res.status(422).json({
        error: 'Invalid YAML format',
        message: 'The provided content is not valid YAML'
      });
    }

    if (error.response && error.response.status) {
      return res.status(error.response.status).json({
        error: `HTTP ${error.response.status}`,
        message: `The server returned ${error.response.status} when fetching the URL`
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during conversion'
    });
  }
}

module.exports = { yamlToJson };
