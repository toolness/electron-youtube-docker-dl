const path = require('path');

const {COMMAND_FAILED} = require('./constants');

function convertWindowsPath(pathname) {
  return pathname.replace(
    /^([A-Z])\:\\/, (_, letter) => '/' + letter.toLowerCase() + '/'
  ).replace(/\\/g, '/');
}

module.exports = class DockerizedDownloader {
  constructor(options) {
    this.docker = options.docker;
    this.image = options.image;
    this.dir = path.resolve(options.dir);

    if (process.env['COMPOSE_CONVERT_WINDOWS_PATHS'] === '1') {
      this.dir = convertWindowsPath(this.dir);
    }
  }

  runInContainer(cmd, args) {
    return new Promise((resolve, reject) => {
      this.docker.run(this.image, [cmd, ...args], process.stdout, {
        WorkingDir: '/downloads',
      }, (err, data, container) => {
        if (err) {
          return reject(err);
        }

        container.remove((err) => {
          if (err) {
            return reject(err);
          }
          if (data.StatusCode !== 0) {
            return reject(new Error(COMMAND_FAILED));
          }
          resolve();
        });
      }).on('container', container => {
        container.defaultOptions.start.Binds = [
          this.dir + ':/downloads:rw'
        ];
      });
    });
  }

  async download(cmd, args) {
    await this.runInContainer(cmd, args);
  }
};
