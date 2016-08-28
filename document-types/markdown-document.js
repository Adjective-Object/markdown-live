'use strict';
const marked = require('marked');
const renderer = new marked.Renderer();
const loadHandlebars = require('./lib.js').loadHandlebars;
const markdownTemplate = loadHandlebars('./markdown-document.handlebars');

const MarkdownDocument = {
	                                        isDoc: (path) => {
	                                            return /\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext)$/.test(path);
	},

	                                        render: (path, data) => {
		                                      const content = marked(data, { renderer: renderer });
		                                        return markdownTemplate({ content });
	},

	                                        type: 'markdown',
};

module.exports = MarkdownDocument;
