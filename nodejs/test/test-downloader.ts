import {convertWindowsPath} from '../src/downloader';

import expect = require('expect.js');

describe('convertWindowsPath', () => {
  it('works as expected', () => {
    expect(convertWindowsPath('C:\\foo\\bar')).to.equal('/c/foo/bar');
  });
});
