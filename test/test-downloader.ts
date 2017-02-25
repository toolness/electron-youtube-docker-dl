import * as path from 'path';
import expect = require('expect.js');

import {
  convertWindowsPath,
  toInfoJsonPath,
  exampleVideoInfo,
  cleanVideoInfo,
} from '../src/downloader';

describe('cleanVideoInfo', () => {
  it('removes keys not in VideoInfo', () => {
    let v: any = {...exampleVideoInfo};
    v['boop'] = 5;
    cleanVideoInfo(v);
    expect(v).to.not.contain('boop');
  });
});

describe('toInfoJsonPath', () => {
  it('works with filenames', () => {
    expect(toInfoJsonPath('blarg.mp4')).to.equal('blarg.info.json');
  });

  it('works with absolute paths', () => {
    expect(toInfoJsonPath(path.resolve('a', 'b', 'c.mp4')))
      .to.equal(path.resolve('a', 'b', 'c.info.json'));
  });
});

describe('convertWindowsPath', () => {
  it('works as expected', () => {
    expect(convertWindowsPath('C:\\foo\\bar')).to.equal('/c/foo/bar');
  });
});
