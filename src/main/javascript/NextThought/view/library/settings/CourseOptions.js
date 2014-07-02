Ext.define('NextThought.view.library.settings.CourseOptions', {
	extend: 'Ext.Component',
	alias: 'widget.library-course-options',

	cls: 'course-setting-options',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'enrollment {enrollCls}', html: '{enrollText}'},
		//{cls: 'contact', html: 'Contact the Instructor'},
		{ tag: 'a', cls: 'support', href: '{supportLink}', target: '_blank', html: 'Request Support'},
		//{ tag: 'a', cls: 'report', html: 'Report an Issue'},
		{cls: 'drop', html: 'Drop Course'}
	]),

	beforeRender: function() {
		this.callParent(arguments);

		var isOpen = this.course.isOpen();

		this.renderData = Ext.apply(this.renderData || {}, {
			enrollCls: isOpen ? 'open' : 'enrolled',
			enrollText: isOpen ? 'You are taking the Open Course.' : 'You are taking the Credit Course.',
			supportLink: getString('course-info.course-supoprt.link2.URL', 'mailto:support@nextthought.com', true),
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
			catalog.fireAcquisitionEvent(this, function(enrolled) {
				//if (!enrolled) {
				//	me.fireEvent('go-to-library', me);
				//}
			});
		}

		this.fireEvent('close');
	}
});
