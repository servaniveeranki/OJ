# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create temp directory for code execution
RUN mkdir -p temp

# Install compilers and runtime environments for code execution
RUN apk add --no-cache \
    python3 \
    py3-pip \
    openjdk11 \
    g++ \
    gcc

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "index.js"]
