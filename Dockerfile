FROM node:14-stretch AS build-env
ADD . /build
WORKDIR /build
RUN yarn && yarn add --arch=x64 --platform=linux sharp

FROM node:14-alpine
ENV NODE_ENV=production
COPY --from=build-env /build /app
WORKDIR /app
CMD ["yarn", "start"]
