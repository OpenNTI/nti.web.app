const Ext = require('extjs');

require('./ContentPackage');


module.exports = exports = Ext.define('NextThought.model.RenderableContentPackage', {
	extend: 'NextThought.model.ContentPackage',

	mimeType: 'application/vnd.nextthought.renderablecontentpackage',

	isRenderableContentPackage: true,

	fields: [
		{name: 'isPublished', type: 'bool'}
	]
});

