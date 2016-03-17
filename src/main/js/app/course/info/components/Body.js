export default Ext.define('NextThought.app.course.info.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-body',

	requires: [
		'NextThought.app.course.info.components.Panel',
		'NextThought.app.course.info.components.Roster',
		'NextThought.app.course.info.components.Reports'
	],

	layout: {
		type: 'card',
		deferredRender: true
	},
	items: [
		{ xtype: 'course-info-panel', itemId: 'info' },
		{ xtype: 'course-info-roster', itemId: 'roster' },
		{ xtype: 'course-info-reports', itemId: 'report'}
	],


	setContent: function(info, status, showRoster, bundle) {
		var me = this;
		//always reset
		me.setActiveItem('info');
		me.getComponent('info').setContent(info, status);
		me.getComponent('roster').setContent(showRoster && bundle);
		me.getComponent('report').setContent(showRoster && bundle);
	},

	setActiveItem: function(itemId) {
		var targetItem = this.down('[itemId=' + itemId + ']'),
		 	activeItem = this.getLayout().getActiveItem();

		 if (targetItem == activeItem) {
		 	return Promise.resolve();
		 }

		 this.getLayout().setActiveItem(targetItem);
		 return Promise.resolve();
	},

	scrollRosterIntoView: function(route, subRoute) {
		// Set scroll to top. Maybe change scroll based on route and subroute??
		window.scrollTo(0, 0);
	},

	scrollReportsIntoView: function(route, subRoute) {
		window.scrollTo(0, 0);
	},

	scrollInfoSectionIntoView: function(route) {
		var infoCmp = this.getComponent('info'),
			scrollTarget, hash, scrollTargetY, brect;

		if (!infoCmp.rendered) {
			this.mon(infoCmp, 'afterrender', this.scrollInfoSectionIntoView.bind(this, route));
		}

		route = route && route.path || '/';
		if (route === '/') {
			window.scrollTo(0, 0);
			return;
		}

		if (route === '/instructors') {
			hash = 'course-info-instructors';
		}
		else if (route === '/support') {
			hash = 'course-info-support';
		}

		scrollTarget = infoCmp.down(hash);
		scrollTarget = scrollTarget && scrollTarget.getEl();
		brect = scrollTarget && scrollTarget.dom.getBoundingClientRect();
		window.scrollTo(0, brect.top);
	}

});
