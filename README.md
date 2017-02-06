This is a simple dockerized web app that makes it easy to download
videos from youtube to your system.

## Quick start

```
docker-compose build
docker-compose up
```

Then visit http://localhost:5000. Any downloads you initiate will be in the
`downloads` directory.

## Running tests

To run the test suite/linter:

```
docker-compose run app test
```
