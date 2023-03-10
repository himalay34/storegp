FROM node:lts-alpine

# WORKDIR /app

COPY package.json .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

ENV PORT 3000

EXPOSE 3000

CMD [ "npm", "start" ]