FROM node:20

RUN npm install -g @kinvolk/headlamp-plugin

WORKDIR /headlamp-plugins

COPY ./src /headlamp-plugins

RUN npx @kinvolk/headlamp-plugin build /headlamp-plugins && \
    mkdir -p /dist && \
    npx @kinvolk/headlamp-plugin extract /headlamp-plugins /dist

COPY ./scripts/copy-plugins.sh /copy-plugins.sh

RUN chmod +x /copy-plugins.sh

CMD [ "/bin/bash", "-c", "/copy-plugins.sh" ]
