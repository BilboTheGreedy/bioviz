FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Use lightweight node server to serve the built app
RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "3000"]
