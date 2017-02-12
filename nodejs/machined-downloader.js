const dns = require('dns');
const {spawn} = require('child_process');

const DockerizedDownloader = require('./downloader');
const {COMMAND_FAILED} = require('./constants');

function resolveDns(hostname) {
  return new Promise((resolve, reject) => {
    dns.resolve(hostname, (err, addresses) => {
      if (err) {
        return reject(err);
      }
      resolve(addresses);
    });
  });
}

function runInHost(cmd, args) {
  return new Promise((resolve, reject) => {
    spawn(cmd, args, {
      stdio: 'inherit',
    }).on('close', code => {
      if (code !== 0) {
        return reject(new Error(COMMAND_FAILED));
      }
      resolve();
    }).on('error', reject);
  });
}

class DockerMachinedDownloader extends DockerizedDownloader {
  constructor(options) {
    super(options);
    this.machineName = options.machineName;
  }

  async download(cmd, args) {
    try {
      await runInHost('docker-machine', ['active']);
    } catch (e) {
      if (e.message === COMMAND_FAILED) {
        await runInHost('docker-machine', ['start', this.machineName]);
      } else throw e;
    }
    await resolveDns('youtube.com');
    try {
      await this.runInContainer('curl', ['http://youtube.com']);
    } catch (e) {
      if (e.message === COMMAND_FAILED) {
        await runInHost('docker-machine', ['restart', this.machineName]);
      } else throw e;
    }

    await super.download(cmd, args);
  }
}

module.exports = DockerMachinedDownloader;
