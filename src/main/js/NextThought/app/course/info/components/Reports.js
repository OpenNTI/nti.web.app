Ext.define('NextThought.app.course.info.components.Reports', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-reports',

	mixins: {
		FilScreen: 'NextThought.mixins.FillScreen'
	},

	cls: 'course-reports',

	renderTpl: Ext.DomHelper.markup({cls: 'report-card overview-section', cn: [
		{cls: 'description', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'about', html: '{about}'}
		]},
		{cls: 'content-card link target', cn: [
			{cls: 'thumbnail'},
			{cls: 'meta', cn: [
				{cls: 'sub-heading', html: '{courseNumber}'},
				{cls: 'heading', html: '{courseName}'}
			]}
		]}
	]}),


	renderSelectors: {
		courseNumberEl: '.meta .sub-heading',
		courseNameEl: '.meta .heading'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply((this.renderData || {}), {
			title: getString('NextThought.view.courseware.reports.View.coursetitle'),
			about: Ext.DomHelper.markup({tag: 'span', cn: [
				{html: getString('NextThought.view.courseware.reports.View.coursereport')}
			]}),
			courseNumber: this.courseNumber,
			courseName: this.courseName
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.fillScreen(me.el.dom);

		me.mon(me.el, 'click', function(e) {
			var win;

			if (e.getTarget('.target') && me.reportLink) {
				win = Ext.widget('iframe-window', {
					width: 'max',
					saveText: getString('NextThought.view.menus.Reports.savetext'),
					link: me.reportLink,
					loadingText: getString('NextThought.view.menus.Reports.loadingtext')
				});

				win.show();
			}
		});

		me.on('activate', me.fillScreen.bind(me, me.el.dom));
	},


	setContent: function(bundle) {
		if (!bundle) { return; }

		var catalog = bundle.getCourseCatalogEntry(),
			reportLinks = bundle && bundle.getReportLinks && bundle.getReportLinks();

		this.courseNumber = catalog.get('ProviderUniqueID');
		this.courseName = catalog.get('title');

		this.reportLink = reportLinks && reportLinks[0] && reportLinks[0].href;

		if (this.rendered) {
			this.courseNumberEl.update(this.courseNumber);
			this.courseNameEl.update(this.courseName);
		}
	}
});
