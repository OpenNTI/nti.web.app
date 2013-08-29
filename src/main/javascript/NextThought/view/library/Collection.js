Ext.define('NextThought.view.library.Collection', {
	extend: 'NextThought.view.navigation.Collection',
	alias:  'widget.library-collection',

	mixins: {
		track: 'NextThought.mixins.InstanceTracking'
	},

	store: 'library',

	rowSpan: 1,

	tpl: Ext.DomHelper.markup([
								  { cls: 'stratum collection-name', 'aria-label': '{name} {count} items', 'role': 'heading', cn: {
									  'aria-hidden': 'true', cn: [
										  '{name}', {cls: 'count', 'aria-hidden': 'true', html: '{count}'}
									  ]
								  }},
								  { cls: 'grid', 'role': 'group', 'aria-label': '{name}', cn: {
									  tag: 'tpl', 'for': 'items', cn: ['{menuitem}']}
								  }
							  ]),

	menuItemTpl: Ext.DomHelper.markup({
										  cls: '{inGrid} item {featured} row-{rows} col-{cols}', 'role': 'link', 'aria-label': '{title}', cn: [
			{ cls: 'cover', style: {backgroundImage: 'url({icon})'}},
			{ tag: 'tpl', 'if': 'sample', cn: { cls: 'sample', 'data-qtip': 'Sample' }}, //store - sample flag
			{ cls: 'meta', 'aria-hidden': 'true', cn: [
				{ cls: 'courseName', html: '{courseName}' },  //course name/id
				{ cls:           'title', html: '{title:ellipsis(50)}',//because multi-line text won't honor ellipsis css, manually do it.
					'data-qtip': '{[values.title.length>50?values.title:""]}' },
				{ cls:           'author', html: '{author}',
					//it will likely be clipped if its longer than 20 chars, so add a tip if it is
					'data-qtip': '{[values.author.length>20?values.author:""]}' },
				{ cls: 'description', html: '{description}' }
			]}
		]
									  }),


	constructor: function () {
		this.callParent(arguments);
		this.trackThis();

		if (this.store) {
			this.bindStore(this.store);//force the selection model to construct now. & bind the store... don't wait
			// until render.
			// Fixes an initialization bug where the nav bar remains 'empty' after a refresh.
		}
	},


	collectData: function () {
		var rows = this.rowSpan,
				data = this.callParent(arguments);

		Ext.each(data.items, function (i, x) {
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


	handleSelect: function (selModel, record) {
		if (!this.suppressSetLocation) {
			this.fireEvent('set-last-location-or-root', record.get('NTIID'));
		}
		delete this.suppressSetLocation;
		return this.callParent(arguments);
	},


	updateSelection: function (pageInfo, silent, suppressEvent) {
		var me = this,
				ntiid = pageInfo && (pageInfo.isModel ? pageInfo.getId() : pageInfo),
				last = ContentUtils.getLineage(ntiid).last(),
				r = me.store.findRecord('NTIID', last, 0, false, true, true);

		if (!suppressEvent) {
			Ext.each(this.getInstances(), function (cmp) {
				if (cmp !== me) {
					cmp.updateSelection(pageInfo, silent, true);
				}
			});
		}
		if (r) {
			me.suppressSetLocation = Boolean(silent);
			me.getSelectionModel().select(r);
		}
		else {
			me.getSelectionModel().deselectAll();
		}
	}
});
