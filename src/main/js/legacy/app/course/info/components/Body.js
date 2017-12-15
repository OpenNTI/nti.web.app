const Ext = require('extjs');

require('./Panel');
require('./Roster');
require('./Reports');


module.exports = exports = Ext.define('NextThought.app.course.info.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-body',

	layout: {
		type: 'card',
		deferredRender: true
	},

	initComponent: function () {
		this.callParent(arguments);

		var me = this;

		var items = [
			{
				xtype: 'course-info-panel',
				itemId: 'info',
				onSave: function (catalogEntry) {
					me.onSave && me.onSave(catalogEntry);
				}
			},
			{ xtype: 'course-info-roster', itemId: 'roster' },
			{ xtype: 'course-info-reports', itemId: 'report'}
		];

		me.add(items);
	},

	setContent: function (info, status, showRoster, bundle) {
		this.onceContentSet = Promise.all([
			this.getComponent('info').setContent(info, status, bundle),
			this.getComponent('roster').setContent(showRoster && bundle),
			this.getComponent('report').setContent(showRoster && bundle)
		]);
	},

	setActiveItem: function (itemId) {
		var targetItem = this.down('[itemId=' + itemId + ']'),
			activeItem = this.getLayout().getActiveItem();

		if (targetItem === activeItem) {
			return this.onceContentSet;
		}

		this.getLayout().setActiveItem(targetItem);
		return this.onceContentSet;
	},


	onRouteDeactivate: function () {
		var infoCmp = this.getComponent('info');

		infoCmp && infoCmp.onRouteDeactivate();
	},

	scrollRosterIntoView: function (route, subRoute) {
		// Set scroll to top. Maybe change scroll based on route and subroute??
		window.scrollTo(0, 0);
	},

	scrollReportsIntoView: function (route, subRoute) {
		window.scrollTo(0, 0);
	},

	scrollInfoSectionIntoView: function (route) {
		var infoCmp = this.getComponent('info'),
			scrollTarget, hash;

		if (!infoCmp.rendered) {
			this.mon(infoCmp, 'afterrender', this.scrollInfoSectionIntoView.bind(this, route));
		}

		route = route && route.path || '/';
		if (route === '/') {
			window.scrollTo(0, 0);
			return;
		}

		if (route === '/instructors') {
			hash = 'facilitators-section';
		}
		else if (route === '/support') {
			hash = 'course-info-support';
		}

		scrollTarget = infoCmp.getEl().dom.getElementsByClassName(hash)[0];
		window.scrollTo(0, scrollTarget.offsetTop);
	},


	showRoster (route, subRoute) {
		const roster = this.getComponent('roster');

		this.setActiveItem('roster');
		this.scrollRosterIntoView(route, subRoute);

		return roster.onRouteActivate();
	}
});
