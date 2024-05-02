# Stage 1 - building node_modules and dist folder
FROM node:18.20-alpine as builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Stage 2
FROM node:18.20-alpine
WORKDIR /usr/src/app
COPY --from=builder node_modules node_modules
COPY --from=builder dist dist
COPY package*.json ./
RUN npm prune --production && \
  mkdir log && \
  chown -R node:node log
USER node
ENV NODE_ENV production
CMD [ "node", "dist/main.js" ]