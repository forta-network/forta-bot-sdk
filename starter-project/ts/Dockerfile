# Build stage: compile Typescript to Javascript
FROM node:14.15.5-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
# if importing agent SDK locally
# RUN npm install forta-agent-0.0.1.tgz
RUN npm run build

# Final stage: copy compiled Javascript from previous stage and install production dependencies
FROM node:14.15.5-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY forta.config.json ./
RUN npm ci --production
# if importing agent SDK locally
# COPY ./forta-agent-0.0.1.tgz ./forta-agent-0.0.1.tgz  
# RUN npm install forta-agent-0.0.1.tgz
CMD [ "npm", "run", "start:prod" ]