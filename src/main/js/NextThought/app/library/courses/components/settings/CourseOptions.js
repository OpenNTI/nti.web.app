export default Ext.define('NextThought.app.library.courses.components.settings.CourseOptions', {
	extend: 'Ext.Component',
	alias: 'widget.library-course-options',

	requires: [
		'NextThought.app.course.enrollment.StateStore',
		'NextThought.app.windows.Actions',
		'NextThought.app.library.courses.components.available.CourseDetailWindow'
	],

	cls: 'course-setting-options',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'enrollment {enrollCls}', html: '{enrollText}'},
		//{cls: 'contact', html: 'Contact the Instructor'},
		{ tag: 'a', cls: 'support', href: '{supportLink}', html: 'Request Support'},
		//{ tag: 'a', cls: 'report', html: 'Report an Issue'},
		{cls: 'drop', html: 'Drop Course'}
	]),

	beforeRender: function() {
		this.callParent(arguments);

		var isOpen = this.course.isOpen(),
			registered;

		this.CourseEnrollmentStore = NextThought.app.course.enrollment.StateStore.getInstance();
		this.WindowActions = NextThought.app.windows.Actions.create();

		registered = this.CourseEnrollmentStore.getEnrolledText(this.course.getCourseCatalogEntry());

		this.renderData = Ext.apply(this.renderData || {}, {
			enrollCls: isOpen ? 'open' : 'enrolled',
			enrollText: registered,// || isOpen ? 'You are taking the Open Course.' : 'You are taking the Credit Course.',
			supportLink: 'mailto:support@nextthought.com?subject=Support%20Request',
			reportLink: ''
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'onClick', this);
	},


	onClick: function(e) {
		var instance = this.course.get('CourseInstance'),
			catalog = instance.getCourseCatalogEntry();

		if (e.getTarget('.drop')) {
			this.WindowActions.pushWindow(catalog);
		}

		this.fireEvent('close');
	}
});
