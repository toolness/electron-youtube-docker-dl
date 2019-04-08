FROM ubuntu:18.04

RUN apt-get update && apt-get install -y \
  ffmpeg \
  python3.6 \
  python3.6-dev \
  build-essential \
  curl

RUN apt-get install -y python3-pip

RUN ln -s /usr/bin/python3.6 /usr/bin/python

RUN pip3 install youtube_dl==2019.4.1
