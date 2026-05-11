FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json ./ 

RUN npm install --registry="https://package-mirror.liara.ir/repository/npm/"

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]