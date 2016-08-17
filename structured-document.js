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

var errorTemplate = handlebars.compile(
  fs.readFileSync(
    path.join(__dirname, 'error-template.handlebars')
  ).toString()
);

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
  var templatePath = path.join(
    path.dirname(file),
    meta.template
  )


  try {
    if (! Object.hasOwnProperty(Templates, templatePath)) {
      Templates[templatePath] = handlebars.compile(
        fs.readFileSync(templatePath).toString()
      );
    }
    return {
      template: Templates[templatePath]
    }
  } catch (e) {
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

module.exports = function buildDoc(file, data) {
  var docs = loadDocs(data);
  var meta = loadMeta(file, docs);
  var content = loadDoc(docs);

  if (!docs || !meta || !content) {
    meta = { template: errorTemplate }
    content = {
      msg: 'could not load document ' +
            file + '\n\n' + data
    };
  }

  return meta.template(content);
}