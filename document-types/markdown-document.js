'use strict';
let marked = require('marked');
let renderer = new marked.Renderer();
let loadHandlebars = require('./lib.js').loadHandlebars
let markdownTemplate = loadHandlebars('./markdown-document.handlebars');


let MarkdownDocument = {
	isDoc: (path) => {
	    return /\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext)$/.test(path);
	},

	render: (path, data) => {
		let content = marked(data, { renderer: renderer });
		return markdownTemplate({ content });
	},

	type: 'markdown'
};

module.exports = MarkdownDocument;
