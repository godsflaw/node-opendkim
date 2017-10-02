FROM node/8.6.0-alpine
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
ADD coverage ${LOCALDIR}/coverage
ADD src ${LOCALDIR}/src
ADD test ${LOCALDIR}/test

# install codebase
RUN (cd ${LOCALDIR} ; npm install)

# startup any services
WORKDIR "${LOCALDIR}"
CMD ["tail", "-f", "readme.md"]
