# Build stage: compile Javascript (optional, provided as example if using Babel)
# FROM node:14.15.5-alpine as builder
# WORKDIR /app
# COPY . .
# RUN npm ci
# if importing agent SDK locally
# RUN npm install forta-agent-0.0.1.tgz
# RUN npm run build

# Final stage: install production dependencies
FROM node:14.15.5-alpine
ENV NODE_ENV=production
WORKDIR /app
# if using build stage
# COPY --from=builder /app/dist ./
COPY ./src ./src
COPY package*.json ./
COPY forta.config.json ./
RUN npm ci --production
# if importing agent SDK locally
# COPY ./forta-agent-0.0.1.tgz ./forta-agent-0.0.1.tgz
# RUN npm install forta-agent-0.0.1.tgz
CMD [ "npm", "run", "start:prod" ]