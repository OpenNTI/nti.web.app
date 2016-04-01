var Ext = require('extjs');
var {isFeature} = require('legacy/util/Globals');

require('legacy/common/form/fields/select');


module.exports = exports = Ext.define('NextThought.app.stream.components.Filter', {
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
				{cls: 'name', html: '{displayText}'}
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
			{cls: 'group {cls}', 'data-key': 'modifier', 'data-group': '{group}', 'data-item': '{item}', cn: [
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


	initComponent: function () {
		this.callParent(arguments);

		this.selectComponents = this.selectComponents || {};
	},


	afterRender: function () {
		this.callParent(arguments);

		if (isFeature('profile-activity-filters')) {
			this.showFilters(this.filterGroups);
		}
	},


	showFilters: function (groups) {
		var me = this;
		(groups || []).forEach(function (group) {
			me.addFilterGroup(group);
		});
	},


	addFilterGroup: function (group) {
		var type = group.type,
			tpl = this.GROUP_TYPES[type],
			items = group.items,
			g = Ext.clone(group), el;

		// Change the items to an array, if it's not.
		if (group.items && !(group.items instanceof Array)) {
			items = Object.keys(group.items).map(function (k) { return group.items[k]; });
		}

		if (tpl) {
			el = tpl.append(this.el, Ext.apply(g, {items: items}), true);
		}

		if (type === 'sort') {
			this.__addSelect(group, items, el);
			// this.mon(el, 'change', this.handleClick.bind(this));
			this.__addModifierGroup(group);
		}
		else {
			this.mon(el, 'click', this.handleClick.bind(this));
		}
	},


	setActiveFilters: function (filters) {
		if (!this.rendered) { return; }

		var me = this, dom = this.el.dom;

		//Update the filterGroup
		this.filterGroups = filters || [];

		this.filterGroups.forEach(function (group) {
			var type = group.type,
				g = dom.querySelector('[data-key=' + type + ']'),
				select = me.selectComponents[group.name];

			if (group.setActiveItem) {
				group.setActiveItem(g, group.activeItems);
			} else if (select) {
				select.selectValue(group.activeItem || group.defaultItem);
			} else {
				me.__updateGroup(group, g);
			}
		});
	},


	__addSelect: function (group, items, el) {

		let select = NextThought.common.form.fields.Select.create({
			name: group.name,
			options: items,
			renderTo: el,
			onChange: this.handleClick.bind(this)
		});

		let oldSelect = this.selectComponents[group.name];

		if (oldSelect && !oldSelect.isDestroyed) {
			oldSelect.destroy();
		}

		this.selectComponents[group.name] = select;

		this.on('destroy', () => {
			select.destroy();
		});
	},


	__addModifierGroup: function (group) {
		var items = group.items || [],
			el = this.el, modifier, tpl, groupEl, me = this;

		if (group.items && !(group.items instanceof Array)) {
			items = Object.keys(group.items).map(function (k) {return group.items[k];});
		}

		items.forEach(function (item) {
			modifier = item.modifier;

			if (modifier) {
				modifier.group = group.type;
				modifier.item = item.value;

				tpl = me.GROUP_TYPES['modifier'];
				groupEl = tpl.append(el, modifier, true);
				me.mon(groupEl, 'click', me.onTimeFilterClick.bind(me));

				if (item.active) {
					groupEl.addCls('active');
				}
			}
		});
	},


	__updateItem: function (item, dom) {
		dom.classList[item.active ? 'add' : 'remove']('active');
	},


	__updateGroup: function (group, dom) {
		var activeItem = group && (group.activeItem || group.defaultItem),
			item = group && group.items && group.items[activeItem],
			hasModifier = Boolean(group && group.modifierParam),
			d;

		if (activeItem && dom) {
			d = dom.querySelector('[data-value=' + activeItem + ']');
			if (d) {
				d.selected = true;
			}
		}

		if (hasModifier && item) {
			this.__updateModifier(item, group);
		}
	},


	__updateModifier: function (item/*, group*/) {
		var dom = this.el.dom,
			current = dom.querySelector('[data-item=' + item.value + ']'),
			prev = dom.querySelector('.active[data-item]'),
			modifier = item && item.modifier, option, old, v;

		if (prev) {
			prev.classList.remove('active');
		}

		if (current) {
			current.classList.add('active');
		}

		if (modifier) {
			v = modifier.activeItem || modifier.defaultItem || '0';
			option = current.querySelector('.option[data-value="' + v + '"]');
			old = current.querySelector('.option.selected');

			if (old) {
				old.classList.remove('selected');
			}
			if (option) {
				option.classList.add('selected');
			}
		}
	},


	setOptions: function (options) {
		if (!this.rendered) {
			this.on('afterrender', this.setOptions.bind(this, options));
			return;
		}

		var me = this;

		options.forEach(function (option) {
			var dom = me.el.dom.querySelector('[data-key="' + option.key + '"]');

			if (dom) {
				me.__updateGroup(option, dom);
			} else {
				me.groupTpl.append(me.groupsEl, option);
			}
		});
	},


	handleClick: function (e) {
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
	},


	onTimeFilterClick: function (e) {
		var target = e.target,
			group = e.getTarget('.group'),
			value = target.getAttribute('data-value'),
			itemKey = group && group.getAttribute('data-item');

		if (value) {
			group = group && group.getAttribute('data-group');

			if (this.onItemSelect) {
				this.onItemSelect(itemKey, group, value);
			}
		}
	}
});
