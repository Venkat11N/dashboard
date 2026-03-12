FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files first
COPY grievance-backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]