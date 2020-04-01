// @flow
'use strict';

import handlebars from 'handlebars';
import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';

import markdown from 'marked';
const renderer = new markdown.Renderer();

const Templates = [];
handlebars.registerHelper('md', function markdownHelper(str) {
  return new handlebars.SafeString(
    markdown(str, {renderer: renderer})
  );
});

let currentRenderingTemplateBasePath = '';
handlebars.registerHelper('asset', function assetHelper(assetStr) {
  const resultString = `/template-assets?templatePath=${
      encodeURIComponent(currentRenderingTemplateBasePath)
    }&relativePath=${
      encodeURIComponent(assetStr)
    }`
  console.log('asset', assetStr, resultString)
  return new handlebars.SafeString(
    resultString
  );
});


import {ClientError} from './lib.js';
import errorTemplate from './error-template.handlebars';

function makeClientError(text) {
  return new ClientError({
    title: 'parse error',
    text: text,
    actions: [
      {
        text: 'docs',
        action: 'window.open(\'http://www.purple.com\', \'_blank\');',
      },
    ],
    timeout: 0,
  });
}

function loadDocs(data) {
  // load handlebars template
  const docs = [];
  yaml.safeLoadAll(data, function pushDoc(doc) {
    docs.push(doc);
  });
  return docs;
}

function parseMeta(file, meta) {
  if (!meta) {
    throw makeClientError('no meta block');
  }

  if (!meta.template) {
    throw makeClientError('template not specified in meta block of document');
  }

  const templatePath = path.join(
    path.dirname(file),
    meta.template
  );

  try {
    fs.statSync(templatePath);
  }
  catch (e) {
    throw makeClientError(
      'could not load template \'' +
      meta.template + '\''
    );
  }

  try {
    for(const key in meta.helpers) {
      const helperPath = path.join(path.dirname(file), meta.helpers[key]);
      try {
        // require via global.$require instead of require()
        // so we bypass webpack mangling
        handlebars.registerHelper(key, global.$require(
          helperPath
        ));
      }
      catch (e) {
        throw makeClientError('could not register helper \'' +
            meta.helpers[key] +
            '\' from path \'' +
            helperPath +
            '\': ' +
            e.toString()
          );
      }
    }

    if (! Object.hasOwnProperty(Templates, templatePath)) {
      try {
        Templates[templatePath] = handlebars.compile(
            fs.readFileSync(templatePath).toString()
          );
      }
      catch (e) {
        throw makeClientError('error compiling template \'' +
            meta.template + '\'');
      }
    }

    return {
      template: Templates[templatePath],
    };
  }
  catch (e) {
    console.log(e);
    return null;
  }
}

const defaultMeta = {
  helpers: [],
  template: path.join(
    /* eslint-disable no-undef */
    $dirname,
    /* eslint-enable no-undef */
    '/document-types/default-meta.handlebars'
  ),
};

function loadMeta(file, docs) {
  if (!docs) { return null; }
  switch(docs.length) {
  case 1: return defaultMeta;
  case 2: return parseMeta(file, docs[0]);
  default: return null;
  }
}

function loadDoc(docs) {
  if (!docs) { return null; }
  switch(docs.length) {
  case 1: return docs[0];
  case 2: return docs[1];
  default: return null;
  }
}

const StructuredDocument = {
  isDoc: (filePath) => {
    return (/\.doc\.(yaml|yml)$/).test(filePath);
  },

  dependencies: (filePath) => {
    return [filePath];
  },

  render: (filePath, data) => {
    const docs = loadDocs(data);
    if (docs.length !== 1 && docs.length !== 2) {
      throw makeClientError('expected 1 or 2 yaml documents. See the documentation');
    }

    currentRenderingTemplateBasePath = path.dirname(filePath);

    let meta = loadMeta(filePath, docs);
    let content = loadDoc(docs);

    if (!docs || !meta || !content) {
      meta = {
        template: errorTemplate,
        helpers: [],
      };
      content = {
        msg: 'could not load document ' +
              filePath + '\n\n' + data,
      };
    }

    return meta.template(content);
  },

  type: 'structured',

};

export default  StructuredDocument;
