FROM node:6.11.2

RUN npm install -g gulp-cli

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
ADD ./client /opt/app/client
ADD ./server /opt/app/server
ADD ./typings /opt/app/typings
ADD ./package.json /opt/app
ADD ./gulpfile.babel.js /opt/app
ADD ./spec.js /opt/app
ADD ./tsconfig.client.json /opt/app
ADD ./typings.json /opt/app
ADD ./webpack.build.js /opt/app
ADD ./webpack.dev.js /opt/app
ADD ./webpack.make.js /opt/app

EXPOSE 3000
CMD [ "gulp", "serve" ]
