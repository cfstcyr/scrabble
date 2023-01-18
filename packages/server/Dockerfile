FROM node:14.15 as dev
WORKDIR /var/www/app
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV development
CMD ["npm", "start"]

FROM node:14.15 as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM node:14.15-alpine as prod
WORKDIR /usr/src/app
RUN chown node:node ./
USER node
COPY package.json package-lock.json ./
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production
RUN npm ci --production && npm cache clean --force
COPY assets/ assets/
COPY migrations/ migrations/
COPY --from=builder /app/out out
COPY public out/public
CMD ["node", "out/index.js"]