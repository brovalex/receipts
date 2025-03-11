# Use the official Node.js image as a base
FROM node:slim

# Prisma requirement
RUN apt-get update -y \
&& apt-get install -y openssl

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

COPY . .

# Install dependencies
RUN npm ci

CMD ["sh", "-c", "npm run db:deploy && npm run dev"]
# https://www.prisma.io/docs/guides/docker
# https://stackoverflow.com/questions/67746885/prisma-client-did-not-initialize-yet-please-run-prisma-generate-and-try-to-i

# Build the Next.js application
# RUN npm run dev

# Expose the port the app runs on
EXPOSE 3000