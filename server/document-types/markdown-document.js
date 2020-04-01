// @flow

import marked from 'marked';
const renderer = new marked.Renderer();
import markdownTemplate from './markdown-document.handlebars';
import config from '../config-manager';

const MarkdownDocument = {
  isDoc: (path: string): boolean => {
    return (/\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext)$/).test(path);
  },
  dependencies: (path: string): Array<string> => {
    return [path, config.path('user-markdown.css')];
  },
  render: (path: string, data: string): string => {
    const content = marked(data, { renderer: renderer });
    return markdownTemplate({
      content,
      userStyles: config.read('user-markdown.css'),
    });
  },
  type: 'markdown',
};

export default  MarkdownDocument;
