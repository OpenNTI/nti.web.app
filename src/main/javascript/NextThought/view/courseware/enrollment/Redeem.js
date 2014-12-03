Ext.define('NextThought.view.courseware.enrollment.Redeem', {
	extend: 'NextThought.view.courseware.enrollment.Purchase',
	alias: 'widget.enrollment-gift-redeem',

	buttonCfg: [
		{name: getString('NextThought.view.courseware.enrollment.Redeem.Redeem'), disabled: true, action: 'submit-payment'},
		{name: getString('NextThought.view.courseware.enrollment.Redeem.Cancel'), disabled: false, action: 'go-back', secondary: true}
	],

	STATE_NAME: 'gift-redeem',

	form: [
		{
			name: 'gift',
			label: getString('NextThought.view.courseware.enrollment.Redeem.AccessKeyRedeem'),

			items: [
				{
					xtype: 'enrollment-set',
					label: '',
					inputs: [
						{
							type: 'text',
							name: 'token',
							size: 'full',
							placeholder: getString('NextThought.view.courseware.enrollment.Redeem.AccessKeyInput'),
							required: true,
							help: Ext.DomHelper.markup({
								cls: 'token-help',
								cn: [
									{tag: 'span', cls: 'bold', html: '{{{NextThought.view.courseware.enrollment.Redeem.HelpFindAccessKey}}}'},
									getString('NextThought.view.courseware.enrollment.Redeem.CheckEmail'),
									getFormattedString('NextThought.view.courseware.enrollment.Redeem.ContactSupport', {support: getString('gift-support.link')}),
									
									//commenting out current line so that the world doesn't explode if the above solution doesn't work quite right 
									/*'Contact ',
									{tag: 'a', href: getString('gift-support.link'), html: getString('gift-support.label') + ' '},
									'if additional support is required.'*/
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
							text: getString('NextThought.view.courseware.enrollment.Redeem.LicensingAgree'),
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
