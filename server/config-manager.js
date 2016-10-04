// @flow
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

type StringMap = {[key:string]: ?string};

export class ConfigManager {
  environment: StringMap;
  platform: string;

  configDirectory: string;
  configCache: StringMap;
  configInitialized: boolean;

  watchers: Array<Object>;

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
  initConfigDir() {
    if (this.configInitialized) return;
    const useFs = this.createConfigDir();
    this.configInitialized = true;

    if (useFs) {
      this.initializeConfigFileWatchers();
    }
  }

  createConfigDir(): boolean {
    // create the directory if it does not exist
    if (!fs.existsSync(this.configDirectory)) {
      try {
        fs.mkdirSync(this.configDirectory);
      }
      catch (e) {
        console.log(
          `error creating ${this.configDirectory}` +
          ', defaulting to in-memory cache');
        return false;
      }
    }

    // if it already exists, check it is a directory. If it is not, log an error
    else {
      const existingConfigStat = fs.statSync(this.configDirectory);
      if (!existingConfigStat.isDirectory()) {
        console.log(
          `config directory '${this.configDirectory} already exists,` +
          'and is not a directory. Defaulting to in-memory config'
        );
        return false;
      }
    }

    return true;
  }

  initializeConfigFileWatchers() {
    const loadConfigFile = (fileName: string) => {
      const configFile: string = path.relative(this.configDirectory, fileName);
      const configFileFull: string = path.resolve(this.configDirectory, configFile);

      fs.readFile(
        configFileFull,
        'utf8',
        (err: ?ErrnoError, body: string) => {
          if (err) return;

          if (configFile.endsWith('.json')) {
            this.configCache[configFile] = JSON.parse(body);
          }
          else {
            this.configCache[configFile] = body;
          }
        });
    };

    // watch for changes update the cache
    const newWatcher = chokidar.watch(this.configDirectory)
      .on('add', (filename: string) => {
        loadConfigFile(filename);
      })
      .on('change', (filename: string) => {
        loadConfigFile(filename);
      })
      .on('unlink', (filename: string) => {
        const configPath = path.relative(this.configDirectory, filename);
        delete this.configCache[configPath];
      });

    this.watchers.push(newWatcher);
  }

  read(filePath: string): ?string | Object {
    this.initConfigDir();
    if (this.configCache) return this.configCache[filePath];

    const configPath = path.join(this.configDirectory, filePath);
    try {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      return (filePath.endsWith('.json'))
        ? JSON.parse(fileContent)
        : fileContent;
    }
    catch (err) {
      return '';
    }
  }

  write(filePath: string, content: string | Object) {
    const stringContent:string =
      (typeof content === 'object')
        ? JSON.toString(content)
        : content;

    this.initConfigDir();
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
