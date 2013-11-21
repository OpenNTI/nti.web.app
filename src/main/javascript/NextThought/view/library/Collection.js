Ext.define('NextThought.view.library.Collection', {
	extend: 'NextThought.view.navigation.Collection',
	alias: 'widget.library-collection',

	ui: 'library-collection',
	store: 'library',
	cls: 'books',
	rowSpan: 1,

	tpl: Ext.DomHelper.markup([
		{ cls: 'stratum collection-name', 'aria-label': '{name} {count} items', 'role': 'heading', cn: {
			'aria-hidden': 'true', cn: [
				'{name}', {cls: 'count', 'aria-hidden': 'true', html: '{count}'}
			]
		}},
		{ cls: 'grid', 'role': 'group', 'aria-label': '{name}', cn: {
			tag: 'tpl', 'for': 'items', cn: ['{entry}']}
		}
	]),

	entryTpl: Ext.DomHelper.markup({
		cls: '{inGrid} item {featured} row-{rows} col-{cols}', 'role': 'link', 'aria-label': '{title}', cn: [
			{ cls: 'cover', style: {backgroundImage: 'url({icon})'}},
			{ tag: 'tpl', 'if': 'sample', cn: { cls: 'sample', 'data-qtip': 'Sample' }}, //store - sample flag
			{ cls: 'meta', 'aria-hidden': 'true', cn: [
				{ cls: 'courseName', html: '{courseName}' },  //course name/id
				{ cls: 'title', html: '{title:ellipsis(50)}',//because multi-line text won't honor ellipsis css, manually do it.
					'data-qtip': '{[values.title.length>50?Ext.String.htmlEncode(values.title):""]}' },
				{ cls: 'author', html: '{author}',
					//it will likely be clipped if its longer than 20 chars, so add a tip if it is
					'data-qtip': '{[values.author.length>20?Ext.String.htmlEncode(values.author):""]}' },
				{ cls: 'description', html: '{description}' }
			]}
		]
	}),


	constructor: function() {
		this.callParent(arguments);

		if (this.store) {
			// Force the selection model to construct now. & bind the store... don't wait until render.
			// Fixes an initialization bug where the nav bar remains 'empty' after a refresh.
			this.bindStore(this.store);
		}
	},


	collectData: function() {
		var rows = this.rowSpan,
			data = this.callParent(arguments);

		Ext.each(data.items, function(i, x) {
			var cols = 2;

			i.inGrid = 'grid-item';

			if (rows > 1 && x === 0) {
				i.featured = 'featured';
				cols = 4;
			}

			i.rows = rows;
			i.cols = cols;
		});
		return data;
	},


	handleSelect: function(selModel, record) {
		this.fireEvent('set-last-location-or-root', record.get('NTIID'));
		this.callParent(arguments);
	}
});
