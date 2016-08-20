'use strict';
let handlebars = require('handlebars');

let path = require('path');
let fs = require('fs');

module.exports = {
	loadHandlebars: (templatePath) => {
		return handlebars.compile(
			fs.readFileSync(
				path.join(__dirname, templatePath)
			).toString()
		);
	}
};