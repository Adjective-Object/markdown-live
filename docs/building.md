# Building

## Development Builds

By default, `make` produces development builds.

To copy assets and start webpack in daemon mode, run `make watch-app` or `make watch-web`

Development builds are output to `dist/dev/<platform>`

## Production Builds

To cut a production build, run `make prod-app` or `make prod-web`

## Packaging

To create platform packages, run 
`make prod-pkg`
