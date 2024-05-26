FROM mcr.microsoft.com/devcontainers/typescript-node:0-20

RUN \ 
  apt-get update && \
  apt-get install -y chromium \
  && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN /usr/bin/chromium
ENV LIGHTHOUSE_CHROMIUM_PATH /usr/bin/chromium
