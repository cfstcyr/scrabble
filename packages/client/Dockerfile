FROM node:14.15 as dev
WORKDIR /var/www/app
EXPOSE 4200
ENV PORT 4200
ENV NODE_ENV development
CMD ["npm", "run", "docker:dev"]

FROM node:14.15 as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM nginx:stable-alpine as prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/client /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]