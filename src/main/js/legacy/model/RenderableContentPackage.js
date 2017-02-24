const Ext = require('extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.model.RenderableContentPackage', {
	extend: 'NextThought.model.Base',

	mimeType: 'application/vnd.nextthought.renderablecontentpackage',

	isRenderableContentPackage: true,

	fields: [
		{ name: 'Archive Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'archive', type: 'string' },
		{ name: 'index', type: 'string' },
		{ name: 'index_jsonp', type: 'string' },
		{ name: 'installable', type: 'bool' },
		{ name: 'root', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'author', type: 'DCCreatorToAuthor', mapping: 'DCCreator', defaultValue: ['Author Name Here']},
		{ name: 'version', type: 'string'},
		{ name: 'PresentationProperties', type: 'auto'},
		{ name: 'path', type: 'string', defaultValue: ''},
		{ name: 'sample', type: 'bool', defaultValue: false, persist: false},
			//for filtering
		{ name: 'isCourse', type: 'bool', defaultValue: false, persist: false},

		{ name: 'icon', type: 'string' },
		{ name: 'thumb', type: 'string' }
	]
});

