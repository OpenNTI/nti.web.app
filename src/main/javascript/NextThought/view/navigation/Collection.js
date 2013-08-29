Ext.define('NextThought.view.navigation.Collection', {
	extend: 'Ext.view.View',
	//disabling invoking this directly. Only use this through subclasses
	//alias: 'widget.navigation-collection',

	ui: 'navigation-collection',

	trackOver:    true,
	overItemCls:  'selected',
	itemSelector: '.item',
	tpl:          Ext.DomHelper.markup([
										   { cls: 'stratum collection-name', cn: [
											   '{name}',
											   {cls: 'count', html: '{count}'}
										   ]},

										   { tag: 'tpl', 'for': 'items', cn: ['{menuitem}']}
									   ]),


	menuItemTpl: Ext.DomHelper.markup({
										  cls: 'item', 'data-qtip': '{title}', cn: [
			{ cls: 'cover', style: {backgroundImage: 'url({icon})'}},
			{ cls: 'meta', cn: [
				{ cls: 'title', html: '{title}' },
				{ cls: 'author', html: '{author}' },
				{ tag: 'tpl', 'if': 'sample', cn: { cls: 'sample', html: 'Sample' }}
			]}
		]
									  }),


	onClassExtended: function (cls, data) {
		data.menuItemTpl = data.menuItemTpl || cls.superclass.menuItemTpl || false;

		var tpl = this.prototype.tpl;

		if (!data.tpl) {
			data.tpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.tpl = data.tpl.replace('{super}', tpl);
		}

		//merge in subclass's templates
		data.tpl = data.tpl.replace('{menuitem}', data.menuItemTpl || '');
	},


	initComponent: function () {
		this.enableBubble('select');
		this.callParent(arguments);
		this.on('select', 'handleSelect', this);
	},


	collectData: function () {
		var data = {items: this.callParent(arguments)};
		data.name = this.name;
		data.count = data.items.length;
		return data;
	},


	handleSelect: function (selModel, record) {
		selModel.deselect(record);
	}
});
