FROM node:24-alpine AS build

# Create app directory
WORKDIR /usr/src/app

# Install dependencies required for build
COPY package.json tsconfig.json ./
RUN npm install

# Bundle source and build
COPY server.ts ./
RUN npm run build

FROM node:24-alpine
WORKDIR /usr/src/app

COPY package.json ./
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
