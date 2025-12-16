# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn install          # Install dependencies
yarn dev              # Start dev server with nodemon (hot reload)
yarn start            # Start production server

# Testing
yarn test             # Run all tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Run tests with coverage report

# Docker
yarn docker:build     # Build Docker image
yarn docker:run       # Run container on port 3000
```

## Architecture

This is an Express.js web application providing online tools with both HTML UI and REST API. Deployed at tools.tomaskral.eu.

**Directory structure:**
```
src/
├── index.js              # Express app setup and routing
├── public/
│   └── index.html        # Homepage listing all tools
├── routes/
│   └── api.js            # API routes under /api/v1
└── tools/
    ├── yaml-to-json/
    │   ├── index.js      # API handler
    │   ├── index.html    # Tool UI page
    │   └── README.md     # Documentation
    └── md-to-jira/
        ├── index.js      # API handler
        ├── index.html    # Tool UI page
        └── README.md     # Documentation
```

**URL structure:**
- `/` - Homepage (static HTML)
- `/<tool-name>` - Tool UI page with interactive form
- `/api/v1/<tool-name>` - API endpoint
- `/health` - Health check

**Request flow:**
- UI pages: Express static file serving → `src/tools/<tool>/index.html`
- API calls: Express → `src/routes/api.js` → tool handler in `src/tools/<tool>/index.js`

## Adding New Tools

See `CONTRIBUTING.md` for tool development guidelines.
