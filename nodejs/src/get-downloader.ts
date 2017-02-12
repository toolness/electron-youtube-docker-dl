import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import Docker = require('dockerode');

import DockerMachinedDownloader from './machined-downloader';
import DockerizedDownloader from './downloader';

const IMAGE_NAME = 'youtubedldockerized_app';
const DOWNLOAD_DIR = path.join(__dirname, '..', '..', 'downloads');

function getDockerMachinedDownloader(): DockerMachinedDownloader {
  const DOCKER_CERT_PATH = process.env['DOCKER_CERT_PATH'];
  const {hostname, port} = url.parse(process.env['DOCKER_HOST']);

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
    version: 'v1.13',
  });

  return new DockerMachinedDownloader({
    docker,
    image: IMAGE_NAME,
    machineName: process.env['DOCKER_MACHINE_NAME'],
    dir: DOWNLOAD_DIR,
  });
}

export default function getDownloader(): DockerizedDownloader {
  if ('DOCKER_HOST' in process.env) {
    return getDockerMachinedDownloader();
  }
  throw new Error('TODO: Support native Docker');
}
