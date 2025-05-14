FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy configuration files first
COPY .env* ./
COPY vite.config.ts tsconfig.json ./

# Install missing dependencies
RUN npm install @codemirror/lang-python

# Copy the rest of the source code
COPY . .

# Build the application for production (skip TypeScript checks)
RUN npm run build

# Use lightweight node server to serve the built app
RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "3000"]
