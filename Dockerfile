FROM node:10

WORKDIR /app

COPY package* ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]