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
									'please enter their name and email below. Pricing information is not included in this notification.'
						}
					]
				},
				{
					xtype: 'enrollment-set',
					labelCls: 'gift-recipient',
					inputs: [
						{type: 'checkbox', name: 'enable_recipient', text: 'Send a gift notification to:'},
						{type: 'text', name: 'to_first_name', size: 'large left', placeholder: 'First Name', focusEvent: 'enable-recipient'},
						{type: 'text', name: 'to_last_name', size: 'large left', placeholder: 'Last Name', focusEvent: 'enable-recipient'},
						{type: 'text', name: 'receiver', size: 'large left last', required: true, placeholder: 'Email Address', focusEvent: 'enable-recipient'}
					]
				},
				{
					xtype: 'enrollment-set',
					labelCls: 'gift-message',
					inputs: [
						{type: 'textarea', name: 'message', placeholder: 'Enter your message here...', focusEvent: 'enable-recipient'}
					]
				},
				{
					xtype: 'enrollment-set',
					labelCls: 'gift-from',
					label: 'From:',
					inputs: [
						{
							type: 'text',
							name: 'sender',
							size: 'large',
							placeholder: 'Your Name',
							focusEvent: 'enable-recipient',
							help: 'This notification will be sent upon completion of purchase.'
						}
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


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.on('enable-recipient', function() {
			var checkbox = me.recipientCheckbox || me.down('[name=enable_recipient]');

			me.recipientCheckbox = checkbox;

			if (checkbox && !checkbox.getValue()[checkbox.name]) {
				checkbox.setValue(true);
			}
		});
	},


	fillInDefaults: function(values) {
		var user = $AppConfig.userObject,
			firstName = user.get('FirstName'),
			lastName = user.get('LastName'),
			email = user.get('email');

		values = this.callParent(arguments);

		if (!values.enable_recipient) {
			values.enable_recipient = false;
		}

		if (!values.from && email) {
			values.from = email;
		}

		if (!values.sender && firstName) {
			values.sender = firstName + (lastName ? ' ' + lastName : '');
		}

		return values;
	},


	changed: function(name, value) {
		this.mixins.form.changed.apply(this, arguments);

		if (name === 'enable_recipient') {
			if (value) {
				this.setRecipient(true);
			} else {
				this.setRecipient(false);
			}
		}
	},


	setRecipient: function(enabled) {
		var items = this.recipientItems || [
				this.down('[name=to_first_name]'),
				this.down('[name=to_last_name]'),
				this.down('[name=receiver]'),
				this.down('[name=message]'),
				this.down('[name=sender]')
			];


		this.recipientItems = items;

		items.forEach(function(item) {
			item[enabled ? 'removeCls' : 'addCls']('disabled');
		});

		items[2].required = enabled;
	},


	getPricingInfo: function(formValue) {
		var desc = this.callParent(arguments);

		desc.from = formValue.from;

		if (formValue.enable_recipient) {
			desc.sender = formValue.sender;
			desc.receiver = formValue.receiver;
			desc.message = formValue.message;

			if (formValue.to_first_name) {
				if (formValue.to_last_name) {
					desc.to = formValue.to_first_name + ' ' + formValue.to_last_name;
				} else {
					desc.to = formValue.to_first_name;
				}
			} else if (formValue.to_last_name) {
				desc.to = formValue.to_first_name;
			}
		}

		return desc;
	}
});
