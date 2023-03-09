echo "# storegp" >> README.md

git init

git add README.md

git commit -m "first commit"

git branch -M main

git remote add origin https://github.com/himalay34/storegp.git

<<<<<<< HEAD
git push -u origin main
=======
git push -u origin main
>>>>>>> 0a2e2190a61b8f81ca26806c9f816971baa026d6



FROM node:lts-alpine


FROM node:10-alpine
RUN mkdir -p /home/app/node_modules && chown -R node:node /home/app
WORKDIR /home/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE 8090
CMD [ "node", "server.js" ]



   
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["node", "src/index.js"]
EXPOSE 3000