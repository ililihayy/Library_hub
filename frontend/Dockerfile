FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json /app/
RUN npm ci

COPY . /app

# Baked in at build time for Vite (browser calls this URL)
ARG VITE_API_URL=http://localhost:8000/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
