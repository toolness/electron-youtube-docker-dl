const Docker = require('dockerode');
const url = require('url');
const fs = require('fs');
const path = require('path');

const DockerMachinedDownloader = require('./machined-downloader');

const DOCKER_CERT_PATH = process.env['DOCKER_CERT_PATH'];
const {hostname, port} = url.parse(process.env['DOCKER_HOST']);

const docker = new Docker({
  host: hostname,
  port,
  ca: fs.readFileSync(path.join(DOCKER_CERT_PATH, 'ca.pem')),
  key: fs.readFileSync(path.join(DOCKER_CERT_PATH, 'key.pem')),
  cert: fs.readFileSync(path.join(DOCKER_CERT_PATH, 'cert.pem')),
  version: 'v1.13',
});

let d = new DockerMachinedDownloader({
  docker,
  image: 'youtubedldockerized_app',
  machineName: process.env['DOCKER_MACHINE_NAME'],
  dir: path.join(__dirname, '..', 'downloads'),
});

if (module.parent === null) {
  d.download('youtube-dl', ['https://www.youtube.com/watch?v=y7afWRBNXwQ']);
}
