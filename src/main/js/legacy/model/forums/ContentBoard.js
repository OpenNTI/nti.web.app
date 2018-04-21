const Ext = require('@nti/extjs');

require('./Board');


module.exports = exports = Ext.define('NextThought.model.forums.ContentBoard', {
	extend: 'NextThought.model.forums.Board',
	mimeType: 'application/vnd.nextthought.forums.contentboard'
});
