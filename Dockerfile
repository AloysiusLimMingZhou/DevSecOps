# 1. Dependency Stage: Get all the dependencies aka libraries & etc required from the current nestjs source code

# Build Image, use Alpine Linux OS for thinnest size, with nodejs 24 as latest runtime
FROM node:24-alpine as DEPS

# Mkdir folder for container to move source code files & execute
WORKDIR /app

# Copy package.json files into the dir above
COPY package.json ./

# Perform npm run first so that nodejs load package.json and generate package-lock.json to install the dependencies. Afterwards it saves the npm cache instead of running npm run every time
# Hint: run npm CI so that nodejs specifically use package-lock.json
RUN npm run ci

# 2. Build Stage: After dependencies are installed via npm, time to build the system with nestjs
FROM DEPS as BUILDER

# Copy entire source code files from root folder into current app folder
COPY . .

# Execute nest build command using npm run build shorthand command from package.json
# After running nest build, it will understand and build the file dependencies graph between the modules, routes & service using nestjs. This is also how DI from nestjs is build
# nest build also compile ts code into js under ./dist
RUN npm run build

# 3. Test Stage
FROM BUILDER as TEST

# Set NODE_ENV environment variable to be test so use testing database
ENV NODE_ENV=test

# Set command to run unit tests, for our case its npm test:unit
CMD [ "npm", "test:unit" ]

# 4. Runtime Stage
# Start everything from scratch by rebuilding an image
FROM node:24-alpine as RUNTIME

# Recreate a new directory
WORKDIR /app

# Set NODE_ENV environment variable to be prod so use actual database
ENV NODE_ENV=production

# Copy package.json files into the dir
COPY package.json ./

# Run npm CI install, --omit=dev to skip dev-dependencies from package-lock.json then remove all npm cache 
RUN npm run ci --omit=dev && npm cache clean --force

# Copy all the built files from NestJS during builder stage to here, then take compiled js dist folder and set it as ./dist, then set privs as user node & group node with chmod
COPY --chown=node:node /app/dist ./dist

# Set user as node user for least privileges practice
USER node

# Expose backend port number as listener
EXPOSE 3000

# As js files are compiled during Build phase, can start nestjs prod server with node dist/main using npm short hand command from package.json
CMD [ "node", "dist/main.js" ]