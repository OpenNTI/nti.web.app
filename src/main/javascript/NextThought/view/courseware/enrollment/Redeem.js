Ext.define('NextThought.view.courseware.enrollment.Redeem', {
	extend: 'NextThought.view.courseware.enrollment.Purchase',
	alias: 'widget.enrollment-gift-redeem',

	buttonCfg: [
		{name: 'Submit', disabled: true, action: 'submit-payment'},
		{name: 'Cancel', disabled: false, action: 'go-back', secondary: true}
	],

	STATE_NAME: 'gift-form',

	form: [
		{
			name: 'gift',
			label: 'Redeem a Token',
			items: [
				{
					xtype: 'enrollment-set',
					label: '',
					inputs: [
						{type: 'text', name: 'token', size: 'full', placeholder: 'Token'}
					]
				},
				{
					xtype: 'enrollment-set',
					reveals: 'enable-submit',
					inputs: [
						{
							type: 'checkbox',
							name: 'affirm',
							doNotSend: true,
							doNotStore: true,
							text: 'I have read and agree to the <a data-event="viewLicense">licensing terms.</a>',
							correct: true
						}
					]
				}
			]
		}
	],


	maybeSubmit: function() {
		var me = this,
			value = me.getValue();

		value.purchasable = me.enrollmentOption.Purchasable;

		me.shouldAllowSubmission()
			.then(function() {
				me.submitBtnCfg.disabled = true;
				me.fireEvent('update-buttons');
				me.addMask('Processing card information. You will not be charged yet.');
				return me.complete(me, value);
			})
			.then(function(result) {
				me.done(me);
			})
			.fail(function(error) {
				me.removeMask();
				me.showError(error);
			});
	}

});
