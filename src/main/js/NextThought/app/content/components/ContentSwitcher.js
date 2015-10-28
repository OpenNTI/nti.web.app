Ext.define('NextThought.app.content.components.ContentSwitcher', {
	extend: 'Ext.Component',
	alias: 'widget.content-switcher',

	state_key: 'content-switcher',

	requires: [
		'NextThought.app.bundle.Actions',
		'NextThought.app.course.Actions',
		'NextThought.app.library.courses.StateStore'
	],

	mixins: {
		State: 'NextThought.mixins.State'
	},

	floating: true,


	initComponent: function() {
		this.callParent(arguments);

		this.BundleActions = NextThought.app.bundle.Actions.create();
		this.CourseActions = NextThought.app.course.Actions.create();
		this.CourseStateStore = NextThought.app.library.courses.StateStore.getInstance();
	},


	getBundleData: function(bundle, route) {
		var uiData = bundle.asUIData();

		return {
			title: uiData.title,
			icon: uiData.icon,
			rootRoute: this.BundleActions.getRouteForId(uiData.id),
			activeRoute: route
		};
	},


	getCourseData: function(bundle, route) {
		var uiData = bundle.asUIData();

		return {
			title: uiData.title,
			icon: uiData.icon,
			rootRoute: this.CourseActions.getRouteForId(uiData.id),
			activeRoute: route
		};
	},


	addBundle: function(bundle, route) {
		var state = this.getState() || {recent: []},
			uiData = bundle.isCourse ? this.getCourseData(bundle, route) : this.getBundleData(bundle, route);
	},


	applyState: function(state) {

	}
});
