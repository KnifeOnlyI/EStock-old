FROM node

WORKDIR /usr/src/app

COPY src .
COPY package*.json ./

RUN npm install

EXPOSE 8484
CMD ["npm", "start"]
