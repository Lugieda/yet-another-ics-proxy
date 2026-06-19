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
CMD ["node", "dist/server.js"]
