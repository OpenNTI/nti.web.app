const Ext = require('@nti/extjs');

require('../ContentBlobFile');

module.exports = exports = Ext.define('NextThought.model.courseware.ContentFile', {
	extend: 'NextThought.model.ContentBlobFile',

	mimeType: 'application/vnd.nextthought.courseware.contentfile'
});
