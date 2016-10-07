// @flow
const chokidar = require('chokidar');
const path = require('path');
import {fs} from 'mz';

type StringMap = {[key:string]: ?string};

export class ConfigManager {
  environment: StringMap;
  platform: string;

  configDirectory: string;
  configCache: StringMap;
  configInitialized: boolean;

  watchers: FSWatcher[];

  constructor(environment: ?StringMap = null, platform: ?string) {
    this.environment = environment || process.env;
    this.platform = platform || process.platform;

    this.configDirectory = this.getApplicationConfigDir();
    this.configCache = {};
    this.configInitialized = false;

    this.watchers = [];
  }

  destructor() {
    this.watchers.forEach((watcher: Object) => {
      watcher.close();
    });
  }

  getPlatformUserConfigDir(): string {
    // windows
    if (this.environment.APPDATA) {
      return this.environment.APPDATA;
    }

    // osx or linux, somehow userless
    if (!this.environment.HOME) {
      return '/var/local';
    }

    // osx
    else if (this.platform === 'darwin') {
      return path.join(this.environment.HOME, 'Library', 'Preferences');
    }

    // linux, with XDG
    else if (this.environment.XDG_CONFIG_HOME) {
      return this.environment.XDG_CONFIG_HOME;
    }

    // default to $HOME/.config
    const xdgDefaultPath = path.join(
      this.environment.HOME,
      '.config'
    );

    return xdgDefaultPath;
  }

  getApplicationConfigDir(): string {
    // platform-independant user override
    if (this.environment.MD_LIVE_CONFIG) {
      return this.environment.MD_LIVE_CONFIG;
    }

    // otheerwise attach markdown-live to the platform-depenant user directory
    return path.join(
      this.getPlatformUserConfigDir(this.environment),
      'markdown-live'
    );
  }

  // write default config options to the configuration directory
  init(): Promise<void> {
    return (
      this.createConfigDir()

        .then((useFilesystem: boolean): ?Promise<void> => {
          if (!useFilesystem) return null;
          return (
            this.loadExistingConfigs()
              .then(this.initializeConfigFileWatchers.bind(this))
          );
        })
    );
  }

  createConfigDir(): Promise<boolean> {
    // create the directory if it does not exist
    return fs.exists(this.configDirectory)
      .then((exists: boolean): Promise<void> => {
        // if the directory does not exist, try to make it
        if (!exists) return (fs.mkdir(this.configDirectory));

        // if it does exist, check that it is a directory. If it is not, throw
        // an exception
        return (
          fs.stat(this.configDirectory)
            .then((stat: fs.Stats) => {
              if (!stat.isDirectory()) {
                throw new Error(
                  'config directory path already exists and is not a dir'
                );
              }
            })
          );
      })
      // if the promise chain resolves correctly, we exit with 'true'
      .then((): boolean => true)

      // otherwise we log an error and exit with false
      .catch((e: Error): boolean => {
        console.error(
          `error creating ${this.configDirectory}` +
          ', defaulting to in-memory cache');
        return false;
      });

  }

  loadExistingConfigs(): Promise<void> {
    return (
      fs.readdir(this.configDirectory)
      .then((fileList: string[]): Promise<void[]> => {
        
        const loaders: Promise<void>[] = [];
        for (const file: string of fileList) {
          loaders.push(this.loadConfigFile(file));
        }

        return Promise.all(loaders);
      })
    );
  }

  loadConfigFile(fileName: string): Promise<?string | ?Object> {
    const configFileFull: string = path.resolve(this.configDirectory, fileName);
    const configFile: string = path.relative(this.configDirectory, configFileFull);

    return (
      fs.readFile(configFileFull, 'utf8')
      .then((body: string): string => {
        if (configFile.endsWith('.json')) {
          this.configCache[configFile] = JSON.parse(body);
        }
        else {
          this.configCache[configFile] = body;
        }
        return this.configCache[configFile];
      })
      .catch((e: Error) => {
        console.error('unable to read file', configFileFull, e);
      })
    );
  }

  initializeConfigFileWatchers() {
    // watch for changes update the cache
    const configDirWatcher = chokidar.watch(this.configDirectory,{
      ignoreInitial: true
    })
      .on('add', (filename: string) => {
        this.loadConfigFile(filename);
      })
      .on('change', (filename: string) => {
        this.loadConfigFile(filename);
      })
      .on('unlink', (filename: string) => {
        const configPath = path.relative(this.configDirectory, filename);
        delete this.configCache[configPath];
      });

    this.watchers.push(configDirWatcher);
  }

  read(filePath: string): Promise<?string | ?Object> {
    if (this.configCache) return this.configCache[filePath];
    return this.loadConfigFile(filePath);
  }

  write(filePath: string, content: string | Object) {
    const stringContent:string =
      (typeof content === 'object')
        ? JSON.toString(content)
        : content;

    if (this.configCache) this.configCache[filePath] = stringContent;
    const configPath = path.join(this.configDirectory, filePath);
    fs.writeFile(configPath, stringContent);
  }

  path(filePath: string): string {
    return path.resolve(this.configDirectory, filePath);
  }

}

const defaultManager: ConfigManager = new ConfigManager();
export default defaultManager;
