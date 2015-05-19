Ext.define('NextThought.app.course.assessment.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-container',

	requires: [
		'NextThought.app.course.assessment.components.View'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'card',

	title: 'Assignments',

	statics: {
		showTab: function(bundle) {
			if (!bundle || !bundle.getWrapper || !bundle.shouldShowAssignments()) {
				return false
			}

			return true;
		}
	},

	items: [
		{xtype: 'box', autoEl: {html: 'assessment'}}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addDefaultRoute(this.onRoute.bind(this));

		this.add({
			xtype: 'course-assessment',
			title: this.title,
			showAssignment: this.showAssignment.bind(this),
			root: this
		});

		this.addChildRouter(this.getView());
	},

	
	onActivate: function() {
		this.setTitle(this.title);
	},


	getView: function() {
		return this.down('course-assessment');
	},

	
	bundleChanged: function(bundle) {
		var view = this.getView();

		this.currentBundle = bundle;

		return view.bundleChanged(bundle);
	},


	showAssignment: function() {},


	onRoute: function(route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		return view.handleRoute(route.path, route.precache);
	}
});
