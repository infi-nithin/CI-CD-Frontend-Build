FROM node:20-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build -- --output-path=./dist/out
FROM node:20-alpine
RUN npm install -g http-server
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist/out/browser/ .
COPY --from=builder /app/dist/out/ .
EXPOSE 8080
CMD ["http-server", "-p", "8080"]
