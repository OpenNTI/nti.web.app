var Ext = require('extjs');
var ComponentsCollection = require('../../../common/components/Collection');


module.exports = exports = Ext.define('NextThought.app.library.components.Collection', {
	extend: 'NextThought.common.components.Collection',
	alias: 'widget.library-collection',

	ui: 'library-collection',
	store: 'ContentBundles',
	cls: 'books',
	rowSpan: 1,

	tpl: Ext.DomHelper.markup([
		//{ cls: 'stratum collection-name', 'aria-label': '{name} {count} items', 'role': 'heading', cn: {
		//	'aria-hidden': 'true', cn: [
		//		'{name}', {cls: 'count', 'aria-hidden': 'true', html: '{count}'}
		//	]
		//}},
		{ tag: 'ul', cls: 'library-grid', 'role': 'group', 'aria-label': '{name}', cn: {
			tag: 'tpl', 'for': 'items', cn: ['{entry}']}
		}
	]),

	entryTpl: Ext.DomHelper.markup({
		tag: 'li',
		cls: 'library-grid-item item {featured} allow-zoom {archived} {upcoming}',
		'role': 'link',
		'aria-label': '{title}',
		cn: [
			{ cls: 'cover', cn: [
				{tag: 'img', src: '{icon}'}
			]},
			{ cls: 'controls', cn: [
				{ tag: 'tpl', 'if': 'preview', cn: {cls: 'preview', html: '{preview}'}},
				{ tag: 'tpl', 'if': 'badge', cn: {cls: 'badge', html: '{badge}'}}
			]},
			{ tag: 'tpl', 'if': 'enableSettings', cn: { cls: 'settings'}},
			{ tag: 'tpl', 'if': 'sample', cn: { cls: 'sample', 'data-qtip': 'Sample' }}, //store - sample flag
			{ cls: 'meta', 'aria-hidden': 'true', cn: [
				{ cls: 'courseName', html: '{courseName}' },  //course name/id
				{ cls: 'semester', html: '{semester}'},
				{ tag: 'tpl', 'if': 'title', cn: { cls: 'title', html: '{title}',
					'data-qtip': '{[values.title.length>40?Ext.String.htmlEncode(values.title):""]}' } },
				{ tag: 'tpl', 'if': 'author', cn: { cls: 'author', html: '{author}',
					//it will likely be clipped if its longer than 20 chars, so add a tip if it is
					'data-qtip': '{[values.author.length>20?Ext.String.htmlEncode(values.author):""]}' } },
				{ cls: 'description', html: '{description}' }
			]}
		]
	}),


	constructor: function () {
		this.callParent(arguments);

		if (this.store) {
			// Force the selection model to construct now. & bind the store... don't wait until render.
			// Fixes an initialization bug where the nav bar remains 'empty' after a refresh.
			this.bindStore(this.store);
		}
	},


	afterRender: function () {
		this.callParent(arguments);

		if (!Ext.is.iOS) {
			this.addCls('allow-zoom');
		}
	},

	prepareData: function (data, index, record) {
		var i = this.callParent(arguments),
			catalog = record.getCourseCatalogEntry && record.getCourseCatalogEntry();
		
		if (record.getIconImage) {
			record.getIconImage();
		}
		if (catalog && catalog.get('Preview')) {
			i.preview = 'preview';
		}

		return i;
	},

	handleSelect: function (selModel, record) {
		selModel.deselect(record);

		var node = this.getNodeByRecord(record);

		if (this.navigate) {
			this.navigate(record, node);
		}
	}
});
