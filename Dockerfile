FROM node:20

WORKDIR /
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 300

CMD [ "node", "app.js" ]