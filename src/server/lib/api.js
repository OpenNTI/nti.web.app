/*eslint strict:0, import/no-commonjs:0, import/order:0*/
'use strict';
const urlParser = require('url');
const path = require('path');
// const logger = require('./logger');

const HANDLERS = {
	postMessageQueryParams: /^\/post-query-params/i
};

exports = module.exports = {
	register (express, config) {
		this.basepath = config.basepath;

		express.set('views', path.resolve(__dirname, '../templates'));

		express.use((req, res, next) => {
			let url = req.url;

			if (!url) { return next(); }

			for (let handlerName of Object.keys(HANDLERS)) {
				let test = HANDLERS[handlerName];

				if (url.match(test)) {
					return this[handlerName](req, res, next);
				}
			}

			return next();
		});
	},

	postMessageQueryParams (req, res, next) {
		const parts = urlParser.parse(req.url);
		const pathParts = parts.pathname.split('/');

		res.render('post-message', {
			DATA: JSON.stringify({
				key: pathParts[pathParts.length - 1],
				params: req.query
			})
		});
	}
};
