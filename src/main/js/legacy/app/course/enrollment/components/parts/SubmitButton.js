const Ext = require('@nti/extjs');

require('./BaseInput');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.SubmitButton', {
	extend: 'NextThought.app.course.enrollment.components.parts.BaseInput',
	alias: 'widget.enrollment-submit-button',

	renderTpl: Ext.DomHelper.markup({
		cls: 'enrollment-input full button', cn: [
			{cls: 'button-text', html: 'Send Application'}
		]
	}),


	renderSelectors: {
		buttonEl: '.button-text'
	},


	afterRender: function () {
		this.callParent(arguments);

		this.enableBubble('send-application');

		this.mon(this.buttonEl, 'click', this.fireEvent.bind(this, 'send-application'));
	},

	changed: function () {}
});
