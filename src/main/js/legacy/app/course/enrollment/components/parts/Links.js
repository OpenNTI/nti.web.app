const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.Links', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-link',

	cls: 'enrollment-link',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'a', html: '{text}'}
	]),


	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			text: this.text
		});

		this.enableBubble([this.eventName]);
	},


	afterRender: function () {
		this.callParent(arguments);

		var me = this;

		if (me.otherCls) {
			me.addCls(me.otherCls);
		}

		me.mon(me.el, 'click', function () {
			var args = [me.eventName];

			args = args.concat(me.args);

			args.push(me);

			me.fireEvent.apply(me, args);
		});
	}
});
