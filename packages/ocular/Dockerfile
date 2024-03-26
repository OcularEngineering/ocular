FROM node:18-buster-slim


WORKDIR /usr/src/app

RUN npm cache clean --force

# Install turbo
RUN npm install -g turbo 

# Copy root package.json and lockfile
COPY package.json ./

COPY package-lock.json ./

# Copy the docs package.json
COPY packages/ocular/package.json ./packages/ocular/package.json

# Copy turbo.json
COPY turbo.json ./

# Copy app source
COPY . .

# RUN npm install @nx/nx-linux-arm64-gnu
RUN npm install --verbose
RUN turbo build

EXPOSE 8080

WORKDIR /usr/src/app/packages/ocular

CMD [ "npm", "run" "start" ]