This is an Electron app that makes it easy to download
videos from youtube to your system. Under the hood it
uses [youtube-dl](https://rg3.github.io/youtube-dl/).

Docker is required. If you use Docker Toolbox, you should
run the app from a Docker Quickstart Terminal (or otherwise
have the docker-machine environment variables set).

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

## Quick start

I wrote this with Node 7.5, but it probably runs fine on earlier versions,
especially since TypeScript transpiles the most advanced syntax.

```
npm install
npm run compile
npm start
```

## License

This is free and unencumbered software released into the public domain.
