const axios = require('axios');
const YAML = require('yaml');

async function yamlToJson(req, res) {
  try {
    // Support both POST body and GET query parameter
    const url = req.body?.url || req.query.url;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        message: 'Please provide a URL pointing to a YAML file as query parameter (?url=...) or in POST body'
      });
    }

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

    // Parse YAML to JavaScript object
    const yamlContent = response.data;
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
        message: 'The content at the provided URL is not valid YAML'
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