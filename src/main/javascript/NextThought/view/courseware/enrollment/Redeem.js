Ext.define('NextThought.view.courseware.enrollment.Redeem', {
	extend: 'NextThought.view.courseware.enrollment.Purchase',
	alias: 'widget.enrollment-gift-redeem',

	buttonCfg: [
		{name: 'Redeem', disabled: true, action: 'submit-payment'},
		{name: 'Cancel', disabled: false, action: 'go-back', secondary: true}
	],

	STATE_NAME: 'gift-redeem',

	form: [
		{
			name: 'gift',
			label: 'Redeem this course with an Access Key.',
			items: [
				{
					xtype: 'enrollment-set',
					label: '',
					inputs: [
						{
							type: 'text',
							name: 'token',
							size: 'full',
							placeholder: 'Access Key',
							required: true,
							help: Ext.DomHelper.markup({
								cls: 'token-help',
								cn: [
									{tag: 'span', cls: 'bold', html: 'Not sure where to find your Access Key? '},
									'Please check your purchase confirmation or gift notification emails. ',
									'Contact ',
									{tag: 'a', href: getString('gift-support.link'), html: getString('gift-support.label') + ' '},
									'if additional support is required.'
								]
							})
						}
					]
				},
				{
					xtype: 'enrollment-set',
					hidden: true,
					name: 'allowupdates_container',
					inputs: [
						{
							type: 'checkbox',
							name: 'AllowVendorUpdates',
							text: getString('SubscribeToVendor'),
							help: getString('SubscribeToVendorLegal')
						}
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


	afterRender: function() {
		this.callParent(arguments);

		if (this.enrollmentOption.AllowVendorUpdates) {
			this.revealItem('allowupdates_container');
		}
	},


	fillInDefaults: function(values) {
		if (this.enrollmentOption.redeemToken) {
			values.token = this.enrollmentOption.redeemToken;
		}

		return values;
	},


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
					me.submitBtnCfg.disabled = false;
					me.fireEvent('update-buttons');
					me.removeMask();
					me.showError(error);
				}
			});
	}

});
