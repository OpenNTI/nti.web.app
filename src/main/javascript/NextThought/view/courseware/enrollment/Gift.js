Ext.define('NextThought.view.courseware.enrollment.Gift', {
	extend: 'NextThought.view.courseware.enrollment.Purchase',
	alias: 'widget.enrollment-gift-purchase',

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
					inputs: [
						{
							type: 'description',
							text: 'If you would like for us to send a gift notification to the person for whom you are purchasing this course, ' +
									'please enter their name and email below. Pricing information is not included in this notification'
						}
					]
				},
				{
					xtype: 'enrollment-set',
					labelCls: 'gift-recipient',
					label: 'Gift Recipient (Optional)',
					inputs: [
						{type: 'text', name: 'to_first_name', size: 'large left', placeholder: 'First Name'},
						{type: 'text', name: 'to_last_name', size: 'large left', placeholder: 'Last Name'},
						{type: 'text', name: 'receiver', size: 'large left last', placeholder: 'Email Address'}
					]
				},
				{
					xtype: 'enrollment-set',
					labelCls: 'gift-message',
					inputs: [
						{type: 'textarea', name: 'message', placeholder: 'Enter your message here...'},
						{type: 'text', name: 'sender', size: 'full', placeholder: 'From'}
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
					inputs: [
						{
							type: 'text',
							name: 'from',
							required: true,
							placeholder: 'Email Address',
							size: 'large',
							help: 'This is where we will send your purchase confirmation.'
						}
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

	fillInDefaults: function(values) {
		var user = $AppConfig.userObject,
			firstName = user.get('FirstName'),
			lastName = user.get('LastName'),
			email = user.get('email');

		if (!values.from && email) {
			values.from = email;
		}

		if (!values.sender && firstName) {
			values.sender = firstName + (lastName ? ' ' + lastName : '');
		}

		return values;
	},


	getPricingInfo: function(formValue) {
		var desc = this.callParent(arguments);

		desc.sender = formValue.sender;
		desc.from = formValue.from;
		desc.receiver = formValue.receiver;
		desc.message = formValue.message;
		//first name + ' ' + last name if last name is not falsy
		desc.to = formValue.to_first_name;

		if (formValue.to_last_name) {
			desc.to += ' ' + formValue.to_last_name;
		}

		desc.immediate = !!formValue.reviever;

		return desc;
	}
});
