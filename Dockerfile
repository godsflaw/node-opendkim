FROM node:8.6.0-alpine
MAINTAINER Christopher Mooney <chris@dod.net>

ENV LOCALDIR="/node-opendkim"

# drop codebase
RUN mkdir -p ${LOCALDIR}
ADD readme.md ${LOCALDIR}
ADD binding.gyp ${LOCALDIR}
ADD cli.js ${LOCALDIR}
ADD index.js ${LOCALDIR}
ADD package-lock.json ${LOCALDIR}
ADD package.json ${LOCALDIR}
ADD bin ${LOCALDIR}/bin
ADD src ${LOCALDIR}/src
ADD test ${LOCALDIR}/test

# install deps
RUN apk upgrade --update && \
  apk add --no-cache --virtual .gyp python make g++ opendkim-dev && \
  npm install -g node-gyp

# install codebase
WORKDIR "${LOCALDIR}"
RUN npm install

# startup any services
CMD ["tail", "-f", "readme.md"]
