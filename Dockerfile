FROM ubuntu:16.10

RUN apt-get update && apt-get install -y \
  libav-tools python

RUN apt-get install -y curl && \
  curl -L https://yt-dl.org/downloads/latest/youtube-dl \
    -o /usr/local/bin/youtube-dl && \
  chmod a+rx /usr/local/bin/youtube-dl

COPY download-mp4.sh /usr/local/bin/download-mp4

RUN chmod a+rx /usr/local/bin/download-mp4
