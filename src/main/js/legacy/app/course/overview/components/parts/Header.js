const Ext = require('@nti/extjs');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.parts.Header',
	{
		extend: 'Ext.Component',
		alias: 'widget.course-overview-header',
		ui: 'course',

		cls: 'overview-header',

		renderTpl: Ext.DomHelper.markup([
			{
				tag: 'tpl',
				if: 'AvailableBeginning',
				cn: {
					cls: 'start date {expired}',
					html: '{AvailableBeginning:date("l, F jS")}',
				},
			},
			{
				tag: 'tpl',
				if: '!AvailableBeginning && AvailableEnding',
				cn: {
					cls: 'course date {expired}',
					html: '{courseStartDate:date("l, F jS")}',
				},
			},
			{
				tag: 'tpl',
				if: '(AvailableBeginning || courseStartDate) && AvailableEnding',
				cn: {
					cls: 'end date {expired}',
					html: '- {AvailableEnding:date("l, F jS")}',
				},
			},
			{ cls: 'title', html: '{label}' },
		]),

		config: {
			title: '',
			record: null,
		},

		beforeRender: function () {
			this.callParent(arguments);

			this.renderData = Ext.apply(
				this.renderData || {},
				this.record.getData()
			);

			if (this.getTitle()) {
				this.renderData.label = this.getTitle();
			}

			var e = this.course,
				courseCatalog = e && e.getCourseCatalogEntry();

			if (courseCatalog && courseCatalog.get('StartDate')) {
				this.renderData.courseStartDate =
					courseCatalog.get('StartDate');
			}

			e = e && e.isExpired();

			if (e) {
				this.renderData.expired = 'expired';
			}
		},
	}
);
