import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import Docker = require('dockerode');

import {DOWNLOAD_DIR} from './constants';
import DockerMachinedDownloader from './machined-downloader';
import DockerizedDownloader from './downloader';

const IMAGE_NAME = 'youtube-dl';
const DOCKER_VERSION = 'v1.13';

function getDockerMachinedDownloader(): DockerMachinedDownloader {
  const DOCKER_CERT_PATH = process.env['DOCKER_CERT_PATH'];
  const {hostname, port} = url.parse(process.env['DOCKER_HOST']);

  if (hostname === undefined) {
    throw new Error('hostname not in DOCKER_HOST');
  }
  if (port === undefined) {
    throw new Error('port not in DOCKER_HOST');
  }

  function loadCert(name: string): string {
    return fs.readFileSync(path.join(DOCKER_CERT_PATH, name))
      .toString('ascii');
  }

  const docker = new Docker({
    host: hostname,
    port: parseInt(port),
    ca: loadCert('ca.pem'),
    key: loadCert('key.pem'),
    cert: loadCert('cert.pem'),
    version: DOCKER_VERSION,
  });

  return new DockerMachinedDownloader({
    docker,
    image: IMAGE_NAME,
    machineName: process.env['DOCKER_MACHINE_NAME'],
    dir: DOWNLOAD_DIR,
  });
}

function getDockerizedDownloader(): DockerizedDownloader {
  const docker = new Docker({
    // TODO: What if the host is on Windows?
    socketPath: '/var/run/docker.sock',
    version:DOCKER_VERSION
  });
  return new DockerizedDownloader({
    docker,
    image: IMAGE_NAME,
    dir: DOWNLOAD_DIR
  });
}

export default function getDownloader(): DockerizedDownloader {
  if ('DOCKER_HOST' in process.env) {
    return getDockerMachinedDownloader();
  }
  return getDockerizedDownloader();
}
