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

	GROUP_TYPES: {
		sort: new Ext.XTemplate(Ext.DomHelper.markup([
			{cls: 'group {cls} ', 'data-key': '{type}', cn: [
				{cls: 'name', html: '{displayText}'},
				{cls: 'select-wrapper', cn: [
					{tag: 'select', name: '{name}', cn: [
						{tag: 'tpl', 'for': 'items', cn:[
							{tag: 'tpl', 'if': 'active', cn: [{
								tag: 'option', value: '{displayText}', html: '{displayText}', selected: true	
							}]},
							{tag: 'tpl', 'if': '!active', cn: [{
								tag: 'option', value: '{displayText}', html: '{displayText}'
							}]}
						]}
					]}
				]}
			]}
		])),

		activity: new Ext.XTemplate(Ext.DomHelper.markup([
			{cls: 'group {cls}', 'data-key': '{type}', cn: [
				{cls: 'name', html: '{displayText}'},
				{tag: 'tpl', 'for': 'items', cn: [
					{tag: 'label', cls: 'group-item', 'data-value': '{type}', cn: [
						{tag: 'input', type: 'checkbox'},
						{tag: 'span', html: '{text}'}
					]}
				]}
			]}
		])),

		modifier: new Ext.XTemplate(Ext.DomHelper.markup([
			{cls: 'group {cls}', 'data-key': '{type}', cn: [
				{cls: 'name', html: '{text}'},
				{tag: 'tpl', 'for': 'items', cn: [
					{cls: 'group-item {cls}', 'data-value': '{value}', html: '{text}'}
				]}
			]}
		]))
	},


	renderSelectors: {
		groupsEl: 'ul.groups'
	},


	afterRender: function() {
		this.callParent(arguments);

		if (isFeature('profile-activity-filters')) {
			this.showFilters(this.filterGroups);	
		}
	},


	showFilters: function(groups){
		var me = this;
		(groups || []).forEach(function(group) {
			me.addFilterGroup(group);
		});
	},


	addFilterGroup: function(group){
		var type = group.type,
			tpl = this.GROUP_TYPES[type],
			items = group.items, 
			g = Ext.clone(group), el;

		// Change the items to an array, if it's not.
		if (group.items && !(group.items instanceof Array)) {
			items = Object.keys(group.items).map(function(k){return group.items[k]});
		}

		if (tpl) {
			el = tpl.append(this.el, Ext.apply(g, {items: items}), true);
		}

		if (type === 'sort') {
			this.__addModifierGroup(group);
			this.mon(el, 'change', this.handleClick.bind(this));
		}
		else {
			this.mon(el, 'click', this.handleClick.bind(this));
		}
	},


	setActiveFilters: function(filters) {
		if (!this.rendered) { return; }

		var me = this, dom = this.el.dom;

		//Update the filterGroup
		this.filterGroups = filters || [];

		this.filterGroups.forEach(function(group) {
			var type = group.type,
				g = dom.querySelector('[data-key='+type+']');

			if (group.setActiveItem) {
				group.setActiveItem(g, group.activeItems);
			}
		});
	},


	__addModifierGroup: function(group){
		var items = group.items || [],
			el = this.el, modifier, tpl;

		if (group.items && !(group.items instanceof Array)) {
			items = Object.keys(group.items).map(function(k){return group.items[k]});
		}

		items.forEach(function(item){
			if (item.active) {
				modifier = item.modifier;
			}
		});

		if (modifier) {
			tpl = this.GROUP_TYPES['modifier'];
			tpl.append(el, modifier, true);
		}
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

		e.stopEvent();

		group = group && group.getAttribute('data-key');
		item = item && item.getAttribute('data-value') || e.target.value;

		if (item) {
			this.onItemSelect(item, group);
		} 
		else if (group) {
			this.onGroupSelect(group);
		}
	}
});
