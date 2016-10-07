/* eslint-env mocha */
import {expect} from 'chai';

import * as test from './_lib.js';
import { ConfigManager } from '../config-manager.js';

describe('ConfigManager', () => {
  describe('#read', () => {
    const testData = {
      'foo.json': '{"content":"Got that json"}',
      'bar.txt': 'Got that text',
    };

    let manager = null;
    beforeEach(function prepReadTest(done) {
      test.initDir('./test-config-read', testData)
        .then(() => {
          manager = new ConfigManager({
            MD_LIVE_CONFIG: './test-config-read',
          });
          return manager.init();
        })
        .then(done)
        .catch(done);
    });

    afterEach(function destroyReadTest(done) {
      manager.destructor();
      test.rmDir('./test-config-read')
        .then(done)
        .catch(done);
    });

    it('should return a js object when reading a json file',
      test._try((done) => {
        expect(manager.read('foo.json')).to.deep.equal({content: 'Got that json'});
        done();
      }));

    it('should return a utf-8 encoded string when reading any other file',
      test._try((done) => {
        expect(manager.read('bar.txt')).to.equal('Got that text');
        done();
      })
    );

    it('should update when a new file is added to the directory',
      test._try((done) => {

        manager.onNextUpdate(() => {
          expect(manager.read('newfile')).to.equal('This is a new file');
          done();
        });

        return test.write('./test-config-read/newfile', 'This is a new file');
      })
    );

  });
});

