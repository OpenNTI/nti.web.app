const Ext = require('@nti/extjs');

require('./OptionsMenu');


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
		{cls: 'header', html: '<span class="assignments-title">{title}</span><span class="assignments-options"/>'},
		{cls: 'outline-list'}
	]),


	renderSelectors: {
		titleEl: '.assignments-title',
		outlineEl: '.outline-list',
		assignmentsOptionsEl: '.assignments-options'
	},

	settingsIconMarkup: '<i class="icon-settings"/>',


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

		if(this.assignmentsOptionsEl) {
			this.assignmentsOptionsEl.on('click', this.showOptionsMenu.bind(this));

			if(this.showControlOnRender) {
				this.showControlOnRender = false;

				this.assignmentsOptionsEl.update(this.settingsIconMarkup);
			}
			else if(this.hideControlOnRender) {
				this.hideControlOnRender = false;

				this.assignmentsOptionsEl.update(null);
			}
		}
	},

	showOptionsMenu: function (e) {
		console.log(e.target);

		var settingsTarget = e.target;

		if (settingsTarget) {
			var menuWidth = 280;

			this.menu = Ext.widget('assignments-options-menu',
				{
					width: menuWidth,
					bundle: this.bundle,
				});


			this.menu.showBy(settingsTarget, 'tr-br');

			// re-adjust left location if left overlaps left side of window
			const offsetX = this.menu.getEl().dom.getBoundingClientRect().left;

			if(offsetX < 0) {
				this.menu.setX(this.menu.getX() + Math.abs(offsetX));
			}

			// avoid having hidden menus build up in the dom
			this.menu.on('hide', () => {
				this.menu && !this.menu.isDestroyed && this.menu.destroy();
			});

			// don't have menu linger after scrolling
			window.addEventListener('scroll', () => {
				this.menu.hide();
			});

			this.on('destroy', () => {
				this.menu && !this.menu.isDestroyed && this.menu.destroy();
			});

			return false;
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


	addAssignmentOptionControl: function (bundle) {
		this.bundle = bundle;

		if (this.rendered) {
			this.assignmentsOptionsEl.update(this.settingsIconMarkup);
		}
		else {
			this.showControlOnRender = true;
		}
	},

	removeAssignmentOptionControl: function () {
		if (this.rendered) {
			this.assignmentsOptionsEl.update(null);
		}
		else {
			this.hideControlOnRender = true;
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
