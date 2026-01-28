FROM node:18-alpine
WORKDIR /chikitsa-frontend
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]