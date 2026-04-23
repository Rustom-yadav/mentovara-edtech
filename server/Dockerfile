# Use Node.js 20 Alpine for a lightweight, secure base image
FROM node:20-alpine

# Set environment variable for production
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /app

# Change ownership of /app to the built-in non-root 'node' user
RUN chown -R node:node /app

# Switch to the non-root user for security (Prevents container breakout attacks)
USER node

# Copy package.json and package-lock.json first to leverage Docker cache
COPY --chown=node:node package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY --chown=node:node . .

# Ensure the temp directory for multer uploads exists
RUN mkdir -p public/temp

# Expose the default port the app runs on
EXPOSE 8000

# Define the command to run the application
CMD ["npm", "start"]
