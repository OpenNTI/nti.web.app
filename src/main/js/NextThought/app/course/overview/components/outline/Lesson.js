Ext.define('NextThought.app.course.overview.components.outline.Lesson', {
	extend: 'Ext.Component',
	alias: 'widget.course-outline-lesson',


	renderTpl: Ext.DomHelper.markup({html: '{label}'}),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.outlineNode.getTitle()
		});
	}
});
