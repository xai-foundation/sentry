# Xai Web App

This is the UI implementation to interface with the Xai ecosystem smart contracts

## Run this app

### Docker

This requires docker installed

- `docker build -t xai-web .`
- `docker run -d --name xai-wep-app -p 3000:3000 --restart always xai-web`

### Dev server

Requires Node to be installed.

- `npm install`
- `npm run dev`

This will start the dev server on `http://localhost:3000`