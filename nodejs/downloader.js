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

    if (process.env['COMPOSE_CONVERT_WINDOWS_PATHS'] === '1' ||
        process.env['COMPOSE_CONVERT_WINDOWS_PATHS'] === 'true') {
      this.dir = convertWindowsPath(this.dir);
    }
  }

  runInContainer(cmd, args, options) {
    options = options || {};

    const out = options.out || process.stdout;

    return new Promise((resolve, reject) => {
      this.docker.run(this.image, [cmd, ...args], out, {
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

  async download(cmd, args, options) {
    await this.runInContainer(cmd, args, options);
  }
};