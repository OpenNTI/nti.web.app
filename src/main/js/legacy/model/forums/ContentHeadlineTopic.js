const Ext = require('@nti/extjs');

require('./HeadlineTopic');


module.exports = exports = Ext.define('NextThought.model.forums.ContentHeadlineTopic', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	mimeType: 'application/vnd.nextthought.forums.contentheadlinetopic'
});
