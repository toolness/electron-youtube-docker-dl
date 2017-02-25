import DockerizedDownloader from './downloader';
import getDownloader from './get-downloader';

async function main(d: DockerizedDownloader, url: string): Promise<void> {
  await d.prepareHost();

  const info = await d.getVideoInfo(url);

  console.log('Downloading ', info.fulltitle, 'as', info._filename);

  return await d.download(url, info).promise;
}

if (module.parent === null) {
  if (process.argv.length <= 2) {
    console.log('Please provide a URL of a video to download.');
    process.exit(1);
  }

  let promise = main(getDownloader(), process.argv[2]);

  promise.then(() => {
    console.log('Download successful.');
  }, (err) => {
    console.log('Download failed:', err);
    process.exit(1);
  });
}
