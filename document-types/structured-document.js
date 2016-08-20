'use strict'

var handlebars = require('handlebars');
var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs');

var markdown = require('marked');
var renderer = new markdown.Renderer();

var Templates = []
handlebars.registerHelper('md', function(str) {
  return new handlebars.SafeString(
    markdown(str, {renderer: renderer})
  );
})

let loadHandlebars = require('./lib.js').loadHandlebars
let errorTemplate = loadHandlebars('./error-template.handlebars');

function loadDocs(data) {
  // load handlebars template
  try {
    var docs = []
    yaml.safeLoadAll(data, function(doc) {
      docs.push(doc)
    });
    return docs;
  } catch (e) {
    return null;
  }
}

function parseMeta(file, meta) {
  if (!meta) return null;

  var templatePath = path.join(
    path.dirname(file),
    meta.template
  )


  try {
      for(let key in meta.helpers) {
        handlebars.registerHelper(key, require(
            path.join(path.dirname(file), meta.helpers[key])
        ));
      }

      if (! Object.hasOwnProperty(Templates, templatePath)) {
        Templates[templatePath] = handlebars.compile(
          fs.readFileSync(templatePath).toString()
        );
      }

      return {
        template: Templates[templatePath]
      }
  } catch (e) {
    console.log(e);
    return null;
  }
}

function loadMeta(file, docs) {
  if (!docs) return null;
  switch(docs.length) {
    case 1: return defaultMeta
    case 2: return parseMeta(file, docs[0])
    default: return null
  }
}

function loadDoc(docs) {
  if (!docs) return null;
  switch(docs.length) {
    case 1: return docs[0]
    case 2: return docs[1]
    default: return null
  }
}

let StructuredDocument = {
  isDoc: (path) => {
    return /\.doc\.(yaml|yml)$/.test(path);
  },

  render: (path, data) => {
    var docs = loadDocs(data);
    var meta = loadMeta(path, docs);
    var content = loadDoc(docs);


    console.log(docs, meta, content);
    if (!docs || !meta || !content) {
      meta = {
          template: errorTemplate,
          helpers: []
      }
      content = {
        msg: 'could not load document ' +
              path + '\n\n' + data
      };
    }

    return meta.template(content);
  },

  type: 'structured'

}

module.exports = StructuredDocument;
