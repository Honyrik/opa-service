FROM node:14 as builder

COPY ./ /opt/opa_service

RUN cd /opt/opa_service && \
    yarn install --force && \
    yarn build && \
    cd /opt/opa_service/dist && \
    yarn install --force

FROM node:14-alpine3.13

ARG UID=1001
ARG GID=1001

ENV TZ=Europe/Moscow

COPY --from=builder /opt/opa_service/dist /opt/opa_service

RUN adduser -u $UID -g $GID -s /bin/bash --disabled-password opa_service; \
    apk upgrade --update-cache; \
    apk add tzdata; \
    apk add bash; \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone; \
    rm -rf /tmp/* /var/cache/apk/*; \
    chown -R $UID:$GID /opt/opa_service

USER $UID

CMD cd /opt/opa_service && \
    yarn server
