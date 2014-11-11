Ext.define('NextThought.view.courseware.enrollment.Gift', {
	extend: 'NextThought.view.courseware.enrollment.Purchase',
	alias: 'widget.enrollment-gift-purchase',

	requires: [
		'NextThought.view.courseware.enrollment.parts.*',
		'NextThought.mixins.enrollment-feature.Form'
	],

	mixins: {
		form: 'NextThought.mixins.enrollment-feature.Form'
	},

	defaultType: 'enrollment-group',

	buttonCfg: [
		{name: 'Submit', disabled: true, action: 'submit-payment'},
		{name: 'Cancel', disabled: false, action: 'go-back', secondary: true}
	],

	STATE_NAME: 'gift-form',

		form: [
		{
			name: 'gift',
			label: 'Gift Information',
			items: [
				{
					xtype: 'enrollment-set',
					label: 'Who is it from?',
					inputs: [
						{type: 'text', name: 'sender', required: true, size: 'large left', placeholder: 'Full Name'},
						{type: 'text', name: 'from', required: true, size: 'large left', placeholder: 'Email'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Who is it to?',
					inputs: [
						{type: 'text', name: 'receiver', required: true, size: 'large', placeholder: 'Email'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Additional Information',
					inputs: [
						{type: 'text', name: 'message', size: 'full', placeholder: 'Message'}
					]
				}
			]
		},
		{
			name: 'payment',
			label: 'Payment Information',
			items: [
				{
					xtype: 'enrollment-set',
					label: 'Coupon',
					inputs: [
						{type: 'text', name: 'coupon', placeholder: 'Coupon Code'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Credit Card Information',
					inputs: [
						{type: 'text', name: 'name', required: true, placeholder: 'Name on Card', size: 'card-name'},
						{
							type: 'text',
							name: 'number',
							required: true,
							doNotStore: true,
							//valueType: 'numeric',
							placeholder: '1234 1234 1234 1234',
							size: 'left card-number',
							validateOnChange: true,
							paymentFormatter: 'formatCardNumber',
							//validator: 'validateCardNumber',
							getter: function(val) {
								return val.replace(/[^0-9]/g, '');
							}
						},
						{
							type: 'text',
							name: 'exp_',
							required: true,
							doNotStore: true,
							placeholder: 'MM / YY',
							size: 'left card-code',
							validateOnChange: true,
							paymentFormatter: 'formatCardExpiry',
							validator: 'validateCardExpiry',
							paymentGetter: 'cardExpiryVal'
						},
						{
							type: 'text',
							name: 'cvc',
							required: true,
							doNotStore: true,
							placeholder: 'Code',
							size: 'left card-code',
							validateOnChange: true,
							paymentFormatter: 'formatCardCVC',
							validator: 'validateCardCVC'
						}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Billing Address',
					inputs: [
						{type: 'text', name: 'address_line1', placeholder: 'Address', required: true, size: 'full'},
						{type: 'text', name: 'address_line2', placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line3', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line4', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line5', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						{type: 'text', name: 'address_city', placeholder: 'City / Town', size: 'large'},
						{type: 'text', name: 'address_state', placeholder: 'State / Province / Territory / Region', size: 'full'},
						{type: 'text', name: 'address_country', placeholder: 'Country', required: true, size: 'large left'},
						{type: 'text', name: 'address_zip', placeholder: 'ZIP / Postal Code', size: 'small left', required: false}
					]//,
					// help: [
					//	{text: 'Add Address Line', type: 'event', event: 'add-address-line'}
					// ]
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


	getPricingInfo: function(formValue) {
		var desc = this.callParent(arguments);

		desc.sender = formValue.sender;
		desc.from = formValue.from;
		desc.receiver = formValue.receiver;
		desc.message = formValue.message;

		return desc;
	}
});
