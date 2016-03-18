var Ext = require('extjs');
var {isFeature} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.course.info.components.Menu', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-outline-menu',

	//<editor-fold desc="Config">

	ui: 'course-info',
	cls: 'nav-outline static',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'{{{NextThought.view.courseware.info.outline.Menu.header}}}'
		]},
		{ cls: 'outline-menu'}
	]),

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'outline-row{[values.active ? " x-item-selected" : ""]}', 'data-qtip': '{title:htmlEncode}', 'data-route': '{route}', cn: [
			{cls: 'label', html: '{title:htmlEncode}'}
		]
	})),

	renderSelectors: {
		menuEl: '.outline-menu'
	},

	getTargetEl: function() {
		return this.menuEl;
	},

	afterRender: function() {
		this.callParent(arguments);
		this.addMenuItems();

		this.mon(this.menuEl, 'click', this.onClick.bind(this));
	},

	addMenuItems: function() {
		var me = this, items = [],
			i = ( this.info && this.info.get('Instructors')) || [] ;
		if (!this.rendered) {
			this.onceRendered.then(me.addMenuItems.bind(me));
			return;
		}

		me.itemTpl.append(me.menuEl, {
			title: 'About',
			route: '/',
			active: true
		});

		me.itemTpl.append(me.menuEl, {
			title: getFormattedString('NextThought.view.courseware.info.outline.Menu.courseinstructors', {
						instructor: Ext.util.Format.plural(i.length, 'Instructor', true)}),
			route: '/instructors'
		});

		me.itemTpl.append(me.menuEl, {
			title: getString('NextThought.view.courseware.info.outline.Menu.support'),
			route: '/support'
		});

		if (this.showRoster) {
			me.itemTpl.append(me.menuEl, {
				title: getString('NextThought.view.courseware.info.outline.Menu.roster'),
				route: '/roster'
			});

			if (isFeature('analytic-reports')) {
				me.itemTpl.append(me.menuEl, {
					title: 'Report',
					route: '/report'
				});
			}
		}
	},

	setActiveItem: function(route) {
		var activeItem = this.el && this.el.down('.x-item-selected'),
			activeItemRoute = activeItem && activeItem.getAttribute('data-route');

		if (activeItemRoute === route || !this.rendered) { return; }

		activeItem.removeCls('x-item-selected');
		activeItem = this.el.down('[data-route=' + route + ']');

		if (activeItem) {
			activeItem.addCls('x-item-selected');
		}
	},


	onClick: function(e) {
		var item = e.getTarget('.outline-row');

		if (!item) { return; }

		this.fireEvent('select-route', item.getAttribute('data-qtip'), item.getAttribute('data-route'));
	}
});

