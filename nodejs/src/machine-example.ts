import Docker = require('dockerode');
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';

import DockerMachinedDownloader from './machined-downloader';

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

let d = new DockerMachinedDownloader({
  docker,
  image: 'youtubedldockerized_app',
  machineName: process.env['DOCKER_MACHINE_NAME'],
  dir: path.join(__dirname, '..', 'downloads'),
});

async function main() {
  await d.prepareHost();

  const url = 'https://www.youtube.com/watch?v=y7afWRBNXwQ';
  const info = await d.getVideoInfo(url);

  console.log('Full title is', info.fulltitle);
  await d.download(url);
}

if (module.parent === null) {
  main();
}
