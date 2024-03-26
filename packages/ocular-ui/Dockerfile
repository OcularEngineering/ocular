FROM node:18-alpine

WORKDIR /usr/src/app

COPY packages/ocular-ui/package.json ./packages/ocular-ui/package.json
COPY . .
EXPOSE 3001
WORKDIR /usr/src/app/packages/ocular-ui
RUN npm install --legacy-peer-deps

CMD ["npm", "run", "dev"]
