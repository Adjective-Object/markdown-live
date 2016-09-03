# Structured Documents
md-live also supports documents with arbitrary handlebars templates, also known
as "structured documents". Structured documents are yaml files with the
extension `*.doc.yaml` and the following format

```yaml
--- # Header section declaring some metadata about the file
# [required] path to a handlebars template, relative to this file
- template: 

# [optional] paths to node-compatible modules, exporting handlebars helpers
- helpers:
    name-of-helper: path/to/helper.js
    name-of-helper: path/to/helper.js
--- # Document content which is fed into the template
Attrset:
    - foo
    - bar: |
        Literally just yaml
Others:
---
```

