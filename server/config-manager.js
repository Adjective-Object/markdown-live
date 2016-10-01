// @flow
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

function getUserConfigDir(): string {
  // windows
  if (process.env.APPDATA) {
    return process.env.APPDATA;
  }

  // osx or linux, somehow userless
  if (!process.env.HOME) {
    return '/var/local';
  }

  // osx
  else if (process.platform === 'darwin') {
    return path.join(process.env.HOME, 'Library', 'Preferences');
  }

  // linux, with XDG
  else if (process.env.XDG_CONFIG_HOME) {
    return process.env.XDG_CONFIG_HOME;
  }

  // default to $HOME/.config
  const xdgDefaultPath = path.join(
    process.env.HOME,
    '.config'
  );

  return xdgDefaultPath;
}

function getApplicationConfigDir(): string {
  return path.join(
    getUserConfigDir(),
    'markdown-live'
  );
}

const configDirectory:string = getApplicationConfigDir();
let configCache:?object = null;
let configInitialized = false;

// write default config options to the configuration directory
function initConfigDir(): null {
  if (configInitialized) return;
  let useFs = true;

  // create the directory if it does not exist
  if (!fs.existsSync(configDirectory)) {
    try {
      fs.mkdirSync(configDirectory);
    }
    catch (e) {
      useFs = false;
      console.log(
        `error creating ${configDirectory}` +
        ', defaulting to in-memory cache');
    }
  }

  // if it already exists, check it is a directory. If it is not, log an error
  else {
    const existingConfigStat = fs.statSync(configDirectory);
    if (!existingConfigStat.isDirectory()) {
      useFs = false;
      console.log(
        `config directory '${configDirectory} already exists,` +
        'and is not a directory. Defaulting to in-memory config'
      );
    }
  }

  configInitialized = true;
  configCache = {};
  if (useFs) {
    const loadConfigFile = (fileName: string) => {
      const configFile = path.relative(configDirectory, fileName);
      const configFileFull = path.resolve(configDirectory, configFile);
      console.log(configFile, configFileFull);

      fs.readFile(
        configFileFull, 'utf8',
        (err: string, body: string) => {
          if (err) return;

          if (configFile.endsWith('.json')) {
            configCache[configFile] = JSON.parse(body);
          }
          else {
            configCache[configFile] = body;
          }
        });
    };

    // watch for changes update the cache
    chokidar.watch(configDirectory)
      .on('add', (filename: string) => {
        console.log('add', filename);
        loadConfigFile(filename);
      })
      .on('change', (filename: string) => {
        console.log('change in', filename);
        loadConfigFile(filename);
      })
      .on('unlink', (filename: string) => {
        console.log('unlink of', filename);
        delete configCache[filename];
      });
  }
  return;
}

function readFile(filePath: string): string {
  initConfigDir();
  if (configCache) return configCache[filePath];

  const configPath = path.join(configDirectory, filePath);
  try {
    return fs.readFileSync(configPath);
  }
  catch (err) {
    return '';
  }
}

function readJson(filePath: string): object {
  const configStr = fs.readFileSync(filePath);
  return JSON.parse(configStr);
}

function writeFile(filePath: string, content: string) {
  initConfigDir();
  if (configCache) configCache[filePath] = content;

  const configPath = path.join(configDirectory, filePath);
  fs.writeFile(configPath, content);
}

function writeObject(filePath: string, content: object) {
  writeFile(JSON.toString(content));
}

function writeSmart(filePath: string, content: string | object) {
  if (typeof content === 'object') {
    writeObject(filePath, content);
  }
  else {
    writeFile(filePath, content);
  }
}

function getConfigPath(filePath: string): string {
  return path.resolve(configDirectory, filePath);
}

export default {
  write: writeSmart,
  writeFile: writeFile,
  writeObject: writeObject,
  read: readFile,
  readJson: readJson,
  path: getConfigPath,
};
