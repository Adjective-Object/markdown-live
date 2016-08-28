'use strict';
const handlebars = require('handlebars');

const path = require('path');
const fs = require('fs');

function ClientError(toast) {
	                                        this.toast = toast;
	                                        this.toast.kind = this.toast.kind || 'error';
}
ClientError.prototype = Error;

module.exports = {
	                                        loadHandlebars: (templatePath) => {
		                                        return handlebars.compile(
			fs.readFileSync(
				path.join(__dirname, templatePath)
			).toString()
		);
	},

	                                        ClientError: ClientError,
};
