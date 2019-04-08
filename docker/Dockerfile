FROM ubuntu:16.10

RUN apt-get update && apt-get install -y \
  libav-tools \
  python3.6 \
  python3.6-dev \
  build-essential \
  curl

RUN curl -L https://bootstrap.pypa.io/get-pip.py \
  -o /get-pip.py && \
  python3.6 /get-pip.py && \
  rm /get-pip.py

RUN ln -s /usr/bin/python3.6 /usr/bin/python

RUN pip install youtube_dl==2019.4.1
