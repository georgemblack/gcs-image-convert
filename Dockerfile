FROM node:14-stretch AS build-env
ADD . /build
WORKDIR /build
RUN yarn

FROM node:14-stretch
ENV NODE_ENV=production
COPY --from=build-env /build /app
WORKDIR /app
CMD ["yarn", "start"]
