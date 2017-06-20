const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.Navigation', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-navigation',

	ui: 'course-assessment',
	cls: 'nav-outline scrollable',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'outline-row{[values.active ? " x-item-selected" : ""]}', 'data-qtip': '{title:htmlEncode}', 'data-root': '{route}', 'data-route': '{route}', cn: [
			{cls: 'count{[values.count ? "" : " hidden"]}', html: '{count}'},
			{cls: 'label', html: '{title:htmlEncode}'}
		]
	})),


	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', html: '{title}'},
		{cls: 'outline-list'}
	]),


	renderSelectors: {
		titleEl: '.header',
		outlineEl: '.outline-list'
	},


	beforeRender: function () {
		this.callParent(arguments);

		var rd = {
			title: this.title
		};

		this.renderData = Ext.applyIf(this.renderData || {}, rd);
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick.bind(this));

		if (this.items && this.items.length) {
			this.addItems(this.items);
		}
	},


	clear: function () {
		if (this.rendered) {
			this.outlineEl.dom.innerHTML = '';
		}

		this.items = [];
		this.componentMapping = {};
	},


	setTitle: function (title) {
		if (!this.rendered) {
			this.title = title;
		} else {
			this.titleEl.update(title);
		}
	},


	updateActive: function (item, route) {
		if (!this.rendered) {
			this.activeItem = item.xtype || item;
			return;
		}

		var current = this.el.down('.outline-list .outline-row.x-item-selected'),
			n = this.componentMapping[item.xtype];

		if (n.dom && route) {
			n.dom.setAttribute('data-route', route);
		}

		if (n && n !== current) {
			if (current) {
				current.removeCls('x-item-selected');
			}

			n.addCls('x-item-selected');
		}
	},


	addItems: function (items) {
		if (!this.rendered) {
			this.items = items;
			return;
		}

		var me = this;

		me.componentMapping = me.componentMapping || {};

		me.clear();

		(items || []).forEach(function (item) {
			me.componentMapping[item.xtype] = me.itemTpl.append(me.outlineEl, {
				route: item.route,
				title: item.title,
				count: item.count || 0,
				active: me.activeItem === item.xtype
			}, true);
		});
	},


	disabledItem: function (xtype) {
		var item = this.componentMapping[xtype];
		if (item) {
			item.addCls('disabled');
		}
	},


	onClick: function (e) {
		var item = e.getTarget('.outline-row');

		if (!item || Ext.fly(item).hasCls('disabled')) { return; }

		var route = item.getAttribute('data-route'),
			root = item.getAttribute('data-root'),
			isSelected = item.classList.contains('x-item-selected');

		this.fireEvent('select-route', item.getAttribute('data-qtip'), isSelected ? root : route);
	}
});
