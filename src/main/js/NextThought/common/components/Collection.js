Ext.define('NextThought.common.components.Collection', {
	extend: 'Ext.view.View',
	//disabling invoking this directly. Only use this through subclasses
	alias: 'widget.navigation-collection',

	ui: 'navigation-collection',

	trackOver: true,
	overItemCls: 'selected',
	itemSelector: '.item',
	tpl: Ext.DomHelper.markup([
		{ cls: 'stratum collection-name', cn: [
			'{name}',
			{cls: 'count', html: '{count}'}
		]},

		{ tag: 'tpl', 'for': 'items', cn: ['{entry}']}
	]),


	entryTpl: Ext.DomHelper.markup({
		cls: 'item', 'data-qtip': '{title:htmlEncode}', cn: [
			{ cls: 'cover', style: {backgroundImage: 'url({icon})'}},
			{ cls: 'meta', cn: [
				{ cls: 'title', html: '{title}' },
				{ cls: 'author', html: '{author}' },
				{ tag: 'tpl', 'if': 'sample', cn: { cls: 'sample', html: '{{{NextThought.view.navigation.Collection.sample}}}' }}
			]}
		]
	}),


	onClassExtended: function(cls, data) {
		data.entryTpl = data.entryTpl || cls.superclass.entryTpl || false;

		var tpl = cls.superclass.__tpl || cls.superclass.tpl;

		if (!data.tpl) {
			data.tpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.tpl = data.tpl.replace('{super}', tpl);
			tpl = data.tpl;
		}

		data.__tpl = tpl;

		if (data.entryTpl) {
			//merge in subclass's templates
			data.tpl = data.tpl.replace('{entry}', data.entryTpl || '');
		}
	},


	initComponent: function() {
		this.enableBubble('select');
		this.callParent(arguments);

		var me = this;

		me.on({
			select: 'handleSelect',
			itemadd: 'updateCount',
			itemremove: 'updateCount'
		});

		me.mon(me.getStore(), 'datachanged', 'updateCount');

		me.on('itemadd', function(record, e, node) {
			if (!Ext.isArray(node)) {
				node = [node];
			}

			node.forEach(me.clamptitle.bind(me));
		});

		me.on('refresh', function() {
			var titles = me.el.select('.item .title');

			titles.each(function(title) {
				me.clampTitle(title.dom);
			});
		});
	},


	clampTitle: function(node) {
		$clamp(node, {clamp: 3});
	},


	updateCount: function() {
		if (this.rendered && this.el.down('.count')) {
			this.el.down('.count').update(this.store.getCount());
		}
		this.fireEvent('count-changed', this.store.getCount());
	},


	collectData: function() {
		var data = {items: this.callParent(arguments)};
		data.name = this.name;
		data.count = data.items.length;
		return data;
	},


	handleSelect: function(selModel, record) {
		selModel.deselect(record);
	}
});
