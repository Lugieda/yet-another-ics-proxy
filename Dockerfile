# ==========================================
# STAGE 1: Build Environment
# ==========================================
FROM node:26-alpine AS build
WORKDIR /usr/src/app

# 1. Copy ONLY package files to leverage Docker layer caching
COPY src/package.json src/package-lock.json src/tsconfig.json ./

# 2. Use 'npm ci' for a fast, strict, clean install based on the lockfile
RUN npm ci

# 3. Copy the rest of the source code and compile
COPY src/server.ts src/modules ./
RUN npm run build

# ==========================================
# STAGE 2: Production Image
# ==========================================
FROM node:26-alpine
WORKDIR /usr/src/app

# 1. Copy package files to install ONLY production dependencies
COPY src/package.json src/package-lock.json ./
RUN npm ci --omit=dev

# 2. Copy ONLY the compiled JavaScript from Stage 1
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

# 3. Healthcheck to ensure the container is running properly
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e 'const http = require("http"); const req = http.get("http://127.0.0.1:3000/status", res => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on("error", () => process.exit(1));'

# 4. Start the server
CMD ["node", "dist/server.js"]
