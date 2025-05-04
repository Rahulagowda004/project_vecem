# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

# Expose port 5173
EXPOSE 5173

# Start the app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]