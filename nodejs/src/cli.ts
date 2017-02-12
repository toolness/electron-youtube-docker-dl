import DockerizedDownloader from './downloader';
import getDownloader from './get-downloader';

async function main(d: DockerizedDownloader, url: string) {
  await d.prepareHost();

  const info = await d.getVideoInfo(url);

  console.log('Full title is', info.fulltitle);

  await d.download(url);
}

if (module.parent === null) {
  if (process.argv.length <= 2) {
    console.log('Please provide a URL of a video to download.');
    process.exit(1);
  }
  main(getDownloader(), process.argv[2]);
}
