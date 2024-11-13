FROM node:21-alpine as builder

RUN npm install -g @kinvolk/headlamp-plugin

WORKDIR /headlamp-plugins

COPY ./src /headlamp-plugins

RUN PLUGINS=$(for name in $(ls); do if [ -d $name ]; then echo $name; fi done); \
    set -e; \
    for PLUGIN in $PLUGINS; do \
        echo "Building plugin '$PLUGIN'"; \
        cd /headlamp-plugins/$PLUGIN; \
        npm install; \
        npx @kinvolk/headlamp-plugin build .; \
        cd -; \
    done; \
    mkdir -p /dist && \
    npx @kinvolk/headlamp-plugin extract /headlamp-plugins /dist && \
    ls -R /dist

FROM node:21-alpine

COPY --from=builder /dist /dist
COPY ./scripts/install-plugins.sh /install-plugins.sh

RUN apk add --no-cache bash && \
    chmod +x /install-plugins.sh

CMD [ "/bin/bash", "-c", "/install-plugins.sh" ]
