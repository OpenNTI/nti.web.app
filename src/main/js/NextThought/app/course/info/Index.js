Ext.define('NextThought.app.course.info.Index', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-info',

	title: '',

	requires: [
		'NextThought.app.course.info.components.Outline',
		'NextThought.app.course.info.components.Body',
		'NextThought.app.course.info.Actions'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	navigation: {xtype: 'course-info-outline'},
	body: {xtype: 'course-info-body'},

	initComponent: function() {
		this.callParent(arguments);

		var me = this;
		me.initRouter();
		me.addRoute('/', this.showInfo.bind(me));
		me.addRoute('/instructors', me.showInstructors.bind(me));
		me.addRoute('/support', me.showSupport.bind(me));
		me.addRoute('/roster', me.showRoster.bind(me));
		me.on('activate', this.onActivate.bind(me));

		me.courseInfoActions = NextThought.app.course.info.Actions.create();
		me.mon(me.navigation, 
			{
				'select-route': me.changeRoute.bind(me),
				'show-enrollment': me.showEnrollment.bind(me)
			}
		);
	},

	onActivate: function() {
		this.setTitle(this.title);
	},

	bundleChanged: function(bundle) {
		var me = this,
			catalogEntry = bundle && bundle.getCourseCatalogEntry && bundle.getCourseCatalogEntry();

		function update(info, status, showRoster) {
			me.hasInfo = !!info;

			me[me.infoOnly ? 'addCls' : 'removeCls']('info-only');
			me.navigation.margin = (me.infoOnly ? '105' : '0') + ' 5 5 0';

			me.body.setContent(info, status, showRoster, bundle);
			me.navigation.setContent(info, status, showRoster);
		}

		if(me.bundle === bundle) {
			// Short-circuit since we already have the bundle
			return Promise.resolve();
		}

		me.hasInfo = !!catalogEntry;
		me.infoOnly = catalogEntry && catalogEntry.get('Preview') === true;
		me.bundle = bundle;

		if (bundle && bundle.getWrapper) {
			return bundle.getWrapper()
				.done(function(e) {
					update(catalogEntry, e.get('Status'), !!e.isAdministrative);
				})
				.fail(function() {
					//hide tab?
				});
		}

		return Promise.resolve();
	},

	showInfo: function(route, subRoute){
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function(){
			me.body.scrollInfoSectionIntoView(route);
		});
	},

	showInstructors: function(route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function(){
			me.body.scrollInfoSectionIntoView(route);
		});
	},

	showSupport: function(route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function(){
			me.body.scrollInfoSectionIntoView(route);
		});
	},

	showRoster: function(route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('roster').then(function(){
			me.body.scrollRosterIntoView(route, subRoute);
		});
	},

	changeRoute: function(title, route){
		this.pushRoute(title, route || '/');
	},

	showEnrollment: function(catalogEntry) {
		var me = this;
		this.courseInfoActions.openEnrollmentWindow(catalogEntry)
			.then(function(route){
				me.pushRootRoute(null, route, {course: catalogEntry});
			});
	}
});
