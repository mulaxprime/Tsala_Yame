From node:20
WORKDIR / app
COPY package*.json ./
RUN npm install && npm install qrcode-terminal
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
