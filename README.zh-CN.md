# biliup-watcher

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]
[English](./README.md) | 中文

bilibili视频自动上传监视器。

当视频文件上传到指定目录时，自动将其上传至哔哩哔哩。

## 使用方法

快速使用:

```bash
pnpx biliup-watcher --directory <目录路径> --user-cookie <cookies文件路径> --tag <标签>
```

完整选项:

```bash
Usage: biliup-watcher [options]

监视目录并将视频上传到哔哩哔哩

选项:
  -V, --version                   输出版本号
  -d, --directory <dir>           要监视的目录
  -c, --concurrency <number>      最大并发上传数 (默认: 1)
  -u, --user-cookie <path>        用户cookies.json文件路径
  --tag <tag>                     上传标签，用逗号分隔
  --stability-threshold <number>  文件稳定性阈值 (默认: 5000)
  --limit <number>                线程数限制。如果你的网络速度太慢（低于1Mbps），建议使用默认值
  --ignored <terms>               忽略文件名中包含特定关键词的文件（用逗号分隔）
  -h, --help                      显示帮助信息
```

## 依赖项

- [biliup-rs](https://github.com/biliup/biliup-rs)

## 许可证

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
