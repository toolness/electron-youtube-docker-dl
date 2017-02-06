import os
import subprocess
from urllib.parse import urlparse


YOUTUBE_DOMAINS = [
    'youtu.be',
    'youtube.com',
    'www.youtube.com'
]

def download(url, max_retries=3):
    o = urlparse(url)
    if o.hostname.lower() in YOUTUBE_DOMAINS:
        cmd = 'download-mp4'
    else:
        cmd = 'youtube-dl'

    print("Downloading {} using {}.".format(url, cmd))

    succeeded = False

    for _ in range(max_retries):
        retval = subprocess.call(
            [cmd, url],
            cwd=os.environ['DOWNLOAD_DIR']
        )
        if retval == 0:
            succeeded = True
            break
        print("Failed to download {}, retrying.".format(url))

    if succeeded:
        print("Hooray! Successfully downloaded {}.".format(url))
    else:
        print("Alas, failed to download {}.".format(url))
