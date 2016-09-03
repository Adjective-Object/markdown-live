# markdown-live

> Markdown preview with live update

Forked from [mobily/markdown-live](https://github.com/mobily/markdown-live) due
to inactivity

## Content
* [Screencasts](#screencasts)
* [Installation](#installation)
* [Usage](#usage)
* [CLI](#cli)
* [Contributions](#contributions)
* [Contact](#contact)
* [Changelog](#changelog)
* [License](#license)

## Screencasts

![](https://raw.githubusercontent.com/Adjective-Object/markdown-live/master/screencasts/gif1.gif)

![](https://raw.githubusercontent.com/Adjective-Object/markdown-live/master/screencasts/gif2.gif)

## Installation

```shell
$ npm install -g markdown-live
```

## Usage

To list all available options:

```shell
$ mdlive --help
```

To run with custom port and directory:

```shell
$ mdlive --port 1024 --dir [PATH]
```

To watch markdown files outside the current directory:

```shell
$ mdlive --file [, FILE]
```

To set another socket.io hostname:

```shell
$ mdlive --socket "http://127.0.0.1:8080"
```

## CLI

```shell
USAGE: mdlive [OPTIONS]

OPTIONS:

  -h, --help         Show this message and exit.
  -d, --dir          Specifies the directory to find markdown files (default: current directory).
  -f, --file         Specifies markdown files to watch.
  -p, --port         Specifies the port to use (default: 2304).
  -v, --verbose      Provides debug messages.
  -s, --socket       Specifies the socket.io hostname or IP address (default: http://localhost)
```

```shell
AVAILABLE MARKDOWN EXTENSIONS:
  
  *.markdown
  *.mdown
  *.mkdn
  *.md
  *.mkd
  *.mdwn
  *.mdtxt
  *.mdtext

AVAILABLE STRUCTURED DOCUMENT EXTENSIONS:
  *.doc.yaml
```

## Contributions

 - Fork repository
 - Create feature- or bugfix-branch
 - Create pull request
 - Use Github Issues

## Contact

 - Maxwell Huang-Hobbs, <mhuan13@gmail.com>
 - Twitter: [@adjectiveobject](https://twitter.com/adjectiveobject)

## Changelog

```
2016-08-06    1.0.9    deobfuscated sources, ported to es6. added nightmode and
                       collapsable sidebar.
2015-01-17    1.0.8    added support for alternate filename extensions
                       added support for setting socket.io hostname  or IP address
2014-12-09    1.0.6    watch *.md files outside the current directory (option: --file)
2014-12-08    1.0.5    better code highlighting
2014-12-03    1.0.0    initial version
```

## License

	The MIT License (MIT)

	Copyright (c) 2014 Marcin Dziewulski

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

