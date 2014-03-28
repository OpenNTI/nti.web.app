Ext.define('NextThought.view.courseware.reports.parts.Link', {
	extend: 'Ext.Component',
	alias: 'widget.course-report-link',

	cls: 'report-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'description', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'about', html: '{about}'}
		]},
		{cls: 'link target', cn: [
			{cls: 'sub-heading', html: '{courseNumber}'},
			{cls: 'heading', html: '{courseName}'}
		]}
	]),

	beforeRender: function() {
		this.callParent(arguments);

		Ext.apply((this.renderData || {}), {
			title: this.title,
			about: this.about,
			courseNumber: this.courseNumber,
			courseName: this.courseName
		});
	},


	afterRender: function() {
		this.callParent(this);

		var me = this;

		me.mon(me.el, 'click', function(e) {
			if (e.getTarget('.target')) {
				me.fireEvent('show-report', me.id);
			}
		});
	}
});
