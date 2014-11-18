Ext.define('NextThought.view.courseware.enrollment.Redeem', {
	extend: 'NextThought.view.courseware.enrollment.Purchase',
	alias: 'widget.enrollment-gift-redeem',

	buttonCfg: [
		{name: 'Redeem', disabled: false, action: 'submit-payment'},
		{name: 'Cancel', disabled: false, action: 'go-back', secondary: true}
	],

	STATE_NAME: 'gift-redeem',

	form: [
		{
			name: 'gift',
			label: 'Redeem a Token',
			items: [
				{
					xtype: 'enrollment-set',
					label: '',
					inputs: [
						{type: 'text', name: 'token', size: 'full', placeholder: 'Token', required: true}
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
		var me = this, invalid,
			value = me.getValue();

		value.purchasable = me.enrollmentOption.Purchasable;

		me.shouldAllowSubmission()
			.then(function() {
				invalid = false;
				me.submitBtnCfg.disabled = true;
				me.fireEvent('update-buttons');
				me.addMask('Processing token.');
				return me.complete(me, value);
			}, function() {
				invalid = true;
				return Promise.reject();
			})
			.then(function(result) {
				me.done(me);
			})
			.fail(function(error) {
				if (!invalid) {
					me.removeMask();
					me.showError(error);
				}
			});
	}

});
