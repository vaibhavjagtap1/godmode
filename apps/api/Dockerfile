FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json ./apps/api/package.json
RUN npm install
COPY . .
RUN npm --workspace @behindtheemail/api run build
EXPOSE 4000
CMD ["npm", "--workspace", "@behindtheemail/api", "run", "start"]
