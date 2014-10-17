Ext.define('NextThought.view.courseware.enrollment.parts.Links', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-link',

	cls: 'enrollment-link',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'a', html: '{text}'}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			text: this.text
		});

		this.enableBubble([this.eventName]);
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el, 'click', function() {
			me.fireEvent(me.eventName);
		});
	}
});
