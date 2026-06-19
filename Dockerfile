FROM node:26-alpine AS build

# Create app directory
WORKDIR /usr/src/app

# Install dependencies required for build
COPY src/package.json src/tsconfig.json ./
RUN npm install

# Bundle source and build
COPY src/server.ts ./
RUN npm run build

FROM node:26-alpine
WORKDIR /usr/src/app

COPY src/package.json ./
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e 'const http = require("http"); const req = http.get("http://127.0.0.1:3000/status", res => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on("error", () => process.exit(1));'
CMD ["node", "dist/server.js"]
