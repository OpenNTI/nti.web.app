Ext.define('NextThought.view.courseware.enrollment.credit.parts.SubmitButton', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-submit-button',

	renderTpl: Ext.DomHelper.markup({
		cls: 'credit-input full button', cn: [
			{cls: 'button-text', html: 'Send Application'}
		]
	}),


	renderSelectors: {
		buttonEl: '.button-text'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.enableBubble('send-application');

		this.mon(this.buttonEl, 'click', this.fireEvent.bind(this, 'send-application'));
	},

	changed: function() {}
});
