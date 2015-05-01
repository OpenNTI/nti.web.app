Ext.define('NextThought.view.navigation.Collection', {
	extend: 'Ext.view.View',
	//disabling invoking this directly. Only use this through subclasses
	alias: 'widget.navigation-collection',

	requires: [
		'NextThought.mixins.EllipsisText'
	],

	mixins: {
		'EllipsisText': 'NextThought.mixins.EllipsisText'
	},

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

			wait(100).then(function() {
				node.forEach(function(node){
					var title = Ext.fly(node).down('.title'),
						author = Ext.fly(node).down('.author');

					if (title) { me.truncateText(title.dom); }
					if (author) { me.truncateText(author.dom); }
				});
			});
		});

		me.on('refresh', function() {
			var titles = me.el.select('.item .title'),
				authors = me.el.select('.item .author');

			// Since we are manipulating the Dom, do it last since it's expensive.
			wait(100).then(function() {
				titles.each(function(title) {
					me.truncateText(title.dom);
				});
				authors.each(function(author) {
					me.truncateText(author.dom, 'parent');
				});
			});
		});
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
