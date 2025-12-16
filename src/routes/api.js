const express = require('express');
const { yamlToJson } = require('../tools/yaml-to-json');
const { mdToJira } = require('../tools/md-to-jira');

const router = express.Router();

// YAML to JSON
router.post('/yaml-to-json', yamlToJson);
router.get('/yaml-to-json', yamlToJson);

// Markdown to Jira
router.post('/md-to-jira', mdToJira);
router.get('/md-to-jira', mdToJira);

module.exports = router;
