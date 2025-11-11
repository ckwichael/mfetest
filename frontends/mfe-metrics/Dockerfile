FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

RUN npm install -g serve
COPY --from=build /app/dist ./dist

COPY register.cjs ./register.cjs

EXPOSE 80
CMD node /app/register.cjs & serve -s dist -l 80 --cors