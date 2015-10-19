Ext.define('NextThought.app.stream.components.Filter', {
	extend: 'Ext.Component',
	alias: 'widget.stream-filter',

	cls: 'stream-filter',

	groupTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'li', cls: 'group {cls}', 'data-key': '{key}', cn: [
			{cls: 'group-details', cn: [
				{tag: 'span', cls: 'name', html: '{name}'},
				{tag: 'span', cls: 'active-text', html: '{activeText}'}
			]},
			{tag: 'ul', cls: 'group-list', cn: [
				{tag: 'tpl', 'for': 'items', cn: [
					{tag: 'li', cls: 'group-item {active:boolStr("active")}', 'data-value': '{value}', html: '{text}'}
				]}
			]}
		]
	})),

	renderTpl: Ext.DomHelper.markup({
		tag: 'ul', cls: 'groups'
	}),


	renderSelectors: {
		groupsEl: 'ul.groups'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	__updateItem: function(item, dom) {
		dom.classList[item.active ? 'add' : 'remove']('active');
	},


	__updateGroup: function(option, dom) {
		var me = this,
			activeText = dom.querySelector('.active-text');

		dom.classList[option.active ? 'add' : 'remove']('active');

		activeText.innerText = option.activeText || '';

		option.items.forEach(function(item) {
			var itemDom = dom.querySelector('[data-value="' + item.value + '"]');

			if (itemDom) {
				me.__updateItem(item, itemDom);
			} else {
				console.warn('Updating an option that isnt there');
			}
		});
	},


	setOptions: function(options) {
		if (!this.rendered) {
			this.on('afterrender', this.setOptions.bind(this, options));
			return;
		}

		var me = this;

		options.forEach(function(option) {
			var dom = me.el.dom.querySelector('[data-key="' + option.key + '"]');

			if (dom) {
				me.__updateGroup(option, dom);
			} else {
				me.groupTpl.append(me.groupsEl, option);
			}
		});
	},


	handleClick: function(e) {
		var group = e.getTarget('.group'),
			item = e.getTarget('.group-item');

		group = group && group.getAttribute('data-key');
		item = item && item.getAttribute('data-value');

		if (item) {
			this.onItemSelect(item, group);
		} else if (group) {
			this.onGroupSelect(group);
		}
	}
});
