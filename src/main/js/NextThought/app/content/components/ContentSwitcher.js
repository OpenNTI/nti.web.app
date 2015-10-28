Ext.define('NextThought.app.content.components.ContentSwitcher', {
	extend: 'Ext.Component',
	alias: 'widget.content-switcher',

	state_key: 'content-switcher',

	requires: [
		'NextThought.app.bundle.Actions',
		'NextThought.app.bundle.StateStore',
		'NextThought.app.course.Actions',
		'NextThought.app.course.StateStore',
		'NextThought.app.library.courses.StateStore'
	],

	mixins: {
		State: 'NextThought.mixins.State'
	},

	floating: true,


	initComponent: function() {
		this.callParent(arguments);

		this.BundleActions = NextThought.app.bundle.Actions.create();
		this.BundleStateStore = NextThought.app.bundle.StateStore.getInstance();
		this.CourseActions = NextThought.app.course.Actions.create();
		this.CourseStateStore = NextThought.app.course.StateStore.getInstance();
		this.LibraryCourseStateStore = NextThought.app.library.courses.StateStore.getInstance();
	},


	getBundleData: function(bundle, route, cls) {
		var uiData = bundle.asUIData();

		return Promise.resolve({
			id: uiData.id,
			title: uiData.title,
			thumb: uiData.thumb,
			cls: cls,
			rootRoute: this.BundleActions.getRootRouteForId(uiData.id),
			activeRoute: route
		});
	},


	getCourseData: function(bundle, route, cls) {
		var uiData = bundle.asUIData();

		return Promise.resolve({
			id: uiData.id,
			title: uiData.title,
			thumb: uiData.thumb,
			cls: cls,
			rootRoute: this.CourseActions.getRootRouteForId(uiData.id),
			activeRoute: route || this.CourseStateStore.getRouteFor(uiData.id)
		});
	},


	getFamilyData: function(family, bundle, route) {
		var me = this,
			id = family.get('CatalogFamilyID'),
			courses = this.LibraryCourseStateStore.findForCatalogFamily(id),
			uiData = family.asUIData();

		courses = courses.map(function(course) {
			var instance = course.get('CourseInstance'),
				isCurrent = instance.getId() === bundle.getId();

			return me.getCourseData(instance, isCurrent ? route : null, isCurrent ? 'current' : null);
		});

		return Promise.all([
				Promise.all(courses),
				family.getThumbImage()
			]).then(function(results) {
				uiData.subItems = results[0];
				uiData.thumb = results[1];

				return uiData;
			});
	},


	getCourseOrFamilyData: function(bundle, route) {
		var family = bundle.getCatalogFamily();

		return family ? this.getFamilyData(family, bundle, route) : this.getCourseData(bundle, route);
	},


	addBundle: function(bundle, route) {
		var state = this.getState() || {recent: []},
			getData = bundle.isCourse ? this.getCourseOrFamilyData(bundle, route) : this.getBundleData(bundle, route);

		getData.then(function(data) {});
	},


	applyState: function(state) {

	}
});
