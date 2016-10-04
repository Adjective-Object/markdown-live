import assert from 'better-assert';
import {isEqual} from 'underscore';

import * as test from './_lib.js';
import ConfigManager from '../config-manager.js';

describe('ConfigManager', () => {
  describe('#read', () => {
    const testData = {
      'foo.json': '{"content":"Got that json"}',
      'bar.txt': 'Got that text',
    };

    test.initDir('./test-config-read', testData)
      .then(() => {
        const manager = new ConfigManager({
          MD_LIVE_CONFIG: './test-config-read',
        });

        assert(
          'reading a json file should return a js object',
          isEqual(manager.read('foo.json'), {content: 'Got that json'})
        );

        assert(
          'reading any other file should return a utf8 string of its content',
          manager.read('bar.txt;') === 'Got that text'
        );

      });
  });

});

