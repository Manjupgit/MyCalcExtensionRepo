# Calculator Copilot Extension

A GitHub Copilot Extension that performs mathematical calculations.

## Features

- Performs basic mathematical calculations
- Secure request verification using GitHub's signing mechanism
- Simple HTTP server for handling Copilot requests

## Deployment

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Start the server: `npm start`

The server will run on the port specified by the `PORT` environment variable (default: 3000).

## Usage

Once deployed and registered as a GitHub Copilot Extension, users can ask Copilot to perform calculations:

- "Calculate 2 + 2"
- "What is 15 \* 7?"
- "Solve (10 + 5) / 3"

## Security

The extension verifies all incoming requests using GitHub's signature verification to ensure requests are authentic.
