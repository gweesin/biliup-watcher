# biliup-watcher

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

a directory watcher for biliup.

Automatically upload videos to bilibili when they are uploaded to the specified directory.

## Usage

quickly usage:

```bash
pnpx biliup-watcher --directory <directory> --user-cookie <cookiesPath> --tag <tag>
```

full options:

```bash
Usage: biliup-watcher [options]

Watch directory and upload files to Bilibili

Options:
  -V, --version                   output the version number
  -d, --directory <dir>           Directory to watch
  -c, --concurrency <number>      Maximum concurrent uploads (default: 1)
  -u, --user-cookie <path>        Path to user cookies.json file
  --tag <tag>                     Tag for the upload
  --stability-threshold <number>  Stability threshold for the upload (default: 5000)
  --limit <number>                Limit the number of threads (default: 1)
  -h, --help                      display help for command
```

## peer dependencies

- [biliup-rs](https://github.com/biliup/biliup-rs)

## License

[MIT](./LICENSE) License © [gweesin](https://github.com/gweesin)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/biliup-watcher?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/biliup-watcher
[npm-downloads-src]: https://img.shields.io/npm/dm/biliup-watcher?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/biliup-watcher
[bundle-src]: https://img.shields.io/bundlephobia/minzip/biliup-watcher?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=biliup-watcher
[license-src]: https://img.shields.io/github/license/gweesin/biliup-watcher.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/gweesin/biliup-watcher/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/biliup-watcher
