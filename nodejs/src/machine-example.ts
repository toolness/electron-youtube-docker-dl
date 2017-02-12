import Docker = require('dockerode');
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import through2 = require('through2');

const DockerMachinedDownloader = require('./machined-downloader');

const DOCKER_CERT_PATH = process.env['DOCKER_CERT_PATH'];
const {hostname, port} = url.parse(process.env['DOCKER_HOST']);

function loadCert(name: string): string {
  return fs.readFileSync(path.join(DOCKER_CERT_PATH, name))
    .toString('ascii');
}

interface VideoInfo {
  id: string;
  uploader: string;
  uploader_id: string;
  uploader_url: string;
  upload_date: string;
  license: string;
  title: string;
  thumbnail: string;
  description: string;
  categories: string[];
  tags: string[];
  duration: number;
  age_limit: number;
  webpage_url: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  average_rating: number;
  fulltitle: string;
  display_id: string;
  width: number;
  height: number;
  fps: number;
  ext: string;
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

async function getJsonInfo(url: string): Promise<VideoInfo> {
  const dataParts: string[] = [];
  const stream = through2((chunk, enc, callback) => {
    dataParts.push(chunk.toString('ascii'));
    callback();
  });
  const parsedInfo = new Promise((resolve, reject) => {
    stream.on('finish', () => {
      const allData = dataParts.join('');
      try {
        resolve(JSON.parse(allData));
      } catch (e) {
        reject('unable to parse JSON: ' + allData);
      }
    });
  });

  await d.download('youtube-dl', [
    '--restrict-filenames',
    '--no-warnings',
    '-j', url
  ], {
    out: stream,
  });

  return <VideoInfo> await parsedInfo;
}

async function main() {
  const url = 'https://www.youtube.com/watch?v=y7afWRBNXwQ';
  const info = await getJsonInfo(url);

  console.log('Full title is', info.fulltitle);
  await d.download('youtube-dl', ['--restrict-filenames', url]);
}

if (module.parent === null) {
  main();
}
