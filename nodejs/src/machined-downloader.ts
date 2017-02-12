import * as dns from 'dns';
import {spawn} from 'child_process';

import DockerizedDownloader from './downloader';
import {DownloaderOptions, RunOptions} from './downloader';
import {COMMAND_FAILED} from './constants';

function resolveDns(hostname: string) {
  return new Promise((resolve, reject) => {
    dns.resolve(hostname, (err, addresses) => {
      if (err) {
        return reject(err);
      }
      resolve(addresses);
    });
  });
}

function runInHost(cmd: string, args: string[]) {
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

interface MachinedDownloaderOptions extends DownloaderOptions {
  machineName: string;
}

class DockerMachinedDownloader extends DockerizedDownloader {
  machineName: string;

  constructor(options: MachinedDownloaderOptions) {
    super(options);
    this.machineName = options.machineName;
  }

  async download(cmd: string, args: string[], options: RunOptions) {
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

    await super.download(cmd, args, options);
  }
}

module.exports = DockerMachinedDownloader;
