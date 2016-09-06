# Structured Documents
md-live also supports documents with arbitrary handlebars templates, also known
as "structured documents". Structured documents are yaml files with the
extension `*.doc.yaml` and the following format

```yaml
--- # Header section declaring some metadata about the file
# [required] path to a handlebars template, relative to this file
- template: path/to/template.handlebars

# [optional] paths to node-compatible modules, exporting handlebars helpers
- helpers:
    name-of-helper: path/to/helper.js
    name-of-another-helper: path/to/another/helper.js
--- # Document content which is fed into the template
Attrset:
    - foo
    - bar: |
        Literally just yaml
Others:
---
```

## Header Attributes
### template
The path to a handlebars template, relative to the `*.doc.yaml` file

### helpers
Yaml map of helper names to script files of the bodies of helpers that the
template uses. Paths are relative to th `*.doc.yaml` file. These helpers need
to be compatible with the version of node mdlive is running under.

## Example
_example.doc.yaml_
```yaml
---
template: example.handlebars
helpers:
    dumb-helper: ./example-helper.js
---
messages:
    - foo
    - bar
    - baz
---
```

_example-helper.js_
```javascript
module.exports = function someHelper(inputToHelper) {
    return "I'm Helping: " + inputToHelper;
}
```

_example.handlebars_
```handlebars
<ul>
{{#each messages}}
    <li>{{dumb-helper this}}</li>
{{/each}}
</ul>
```

output:
```html
<ul>
    <li>I'm Helping: foo</li>
    <li>I'm Helping: bar</li>
    <li>I'm Helping: baz</li>
</ul>
```

