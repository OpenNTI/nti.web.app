Ext.define('NextThought.view.courseware.reports.parts.Gif', {
	extend: 'Ext.Component',
	alias: 'widget.course-report-gif',

	cls: 'report-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'description', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'about', html: '{about}'}
		]},
		{tag: 'img', cls: 'gif', src: '{src}'}
	]),

	beforeRender: function() {
		this.callParent(arguments);

		Ext.apply((this.renderData || {}), {
			title: this.title,
			about: this.about,
			src: this.src
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
