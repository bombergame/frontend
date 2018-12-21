#!/bin/sh

export DOCKER_TLS_VERIFY=1
export COMPOSE_TLS_VERSION=TLSv1_2
export DOCKER_CERT_PATH=${TRAVIS_BUILD_DIR}
export DOCKER_HOST=tcp://${SERVER_HOST}:${SERVER_PORT}

git clone https://github.com/bombergame/service-config &&
  mv ./service-config/docker-compose.yml ./docker-compose.yml &&
  ./service-config/decrypt.sh ./service-config . &&
  docker-compose -p bombergame pull && docker-compose -p bombergame up -d
