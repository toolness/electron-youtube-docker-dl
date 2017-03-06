This is an Electron app that makes it easy to download
videos from youtube to your system. Multiple downloads
can be queued; the app can be quit and resumes where
it left off when restarted.

![Screenshot](https://cloud.githubusercontent.com/assets/124687/23592912/e5f0d2aa-01d5-11e7-9437-23030df455dd.png)

Under the hood the app uses [youtube-dl](https://rg3.github.io/youtube-dl/)
and [avconv](https://libav.org/avconv.html), which are wrapped in a
Docker container to make cross-platform deployment easier (well, uh, easier
for me--not for potential users, who have to install Docker).

## Motivation

There are lots of apps that do this kind of thing, but a
lot of them seemed bloated with spyware. I figured there might
be something open-source but I thought writing something myself
would give me an excuse to explore some technologies I wasn't
very familiar with, like:

* [Electron](http://electron.atom.io/)
* [The Docker API](https://docs.docker.com/engine/api/)
* [CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
* [TypeScript 2 tagged unions](https://blog.mariusschulz.com/2016/11/03/typescript-2-0-tagged-union-types)
* Syncing [Redux](http://redux.js.org/) stores between a renderer and main process
* [Async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

So it's kind of a weird experiment and your mileage may vary
if you actually try to use it.

## Requirements

[Docker](https://www.docker.com/) is required. If you're on an
unprofessional version of Windows and are relegated to using
[Docker Toolbox](https://www.docker.com/products/docker-toolbox) like me,
you should run the app from a Docker Quickstart Terminal (or otherwise
have the docker-machine environment variables set).

You'll also need [Node JS](https://nodejs.org/en/). I wrote this with
Node 7.5, but it probably runs fine on earlier versions, especially since
TypeScript transpiles the most advanced syntax.

## Quick start

```
npm install
npm run compile
npm start
```

## Uninstallation

Wiping out the repository's directory takes care of almost everything.

You'll also want to delete the container image that was made during the
build process by running:

```
docker rmi youtube-dl
```

## License

This is free and unencumbered software released into the public domain.
