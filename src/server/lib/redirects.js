/*eslint strict:0, import/no-commonjs:0, import/order:0*/
'use strict';
const path = require('path');
const logger = require('./logger');


const HANDLERS = {
	handleLibraryPathRedirects: /^\/library/i
};

exports = module.exports = {

	register (express, config) {
		this.basepath = config.basepath;

		express.use((req, res, next) => {
			// the query (q) is deprecated, but
			// if its present, it trumps the path (p)
			let url = req.url;
			if (!url) {
				return next();
			}

			for (let handlerName of Object.keys(HANDLERS)) {
				let test = HANDLERS[handlerName];
				if (url.match(test)) {
					return this[handlerName](url, res, next);
				}
			}

			return next();
		});
	},

	handleLibraryPathRedirects (query, res, next) {
		/* From:
		 * /app/library/courses/available/NTI-CourseInfo-iLed_iLed_001/...
		 *
		 * To:
		 * <basepath>/catalog/nti-course-catalog-entry/<id?>
		 */

		let pattern = /library\/courses\/available\/(.*)/;
		let parts = query.match(pattern);
		if (parts) {
			let url = path.join(this.basepath, 'catalog', 'nti-course-catalog-entry', parts[1]);
			logger.info('redirecting to: %s', url);
			res.redirect(url);
			return;
		}

		next();
	}
};
