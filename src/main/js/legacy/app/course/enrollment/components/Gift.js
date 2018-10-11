const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');

require('./Purchase');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.Gift', {
	extend: 'NextThought.app.course.enrollment.components.Purchase',
	alias: 'widget.enrollment-gift-purchase',

	buttonCfg: [
		{name: getString('NextThought.view.courseware.enrollment.Gift.Submit'), disabled: true, action: 'submit-payment'},
		{name: getString('NextThought.view.courseware.enrollment.Gift.Cancel'), disabled: false, action: 'go-back', secondary: true}
	],

	STATE_NAME: 'gift-form',

	form: [
		{
			name: 'gift',
			label: getString('NextThought.view.courseware.enrollment.Gift.GiftInfo'),
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{
							type: 'description',
							text: getString('NextThought.view.courseware.enrollment.Gift.GiftMessageOption')
						}
					]
				},
				{
					xtype: 'enrollment-set',
					labelCls: 'gift-recipient',
					inputs: [
						{type: 'checkbox', name: 'enable_recipient', text: getString('NextThought.view.courseware.enrollment.Gift.GiftNotificationTitle')},
						{type: 'text', name: 'to_first_name', size: 'large left', placeholder: getString('NextThought.view.courseware.enrollment.Gift.FirstName'), focusEvent: 'enable-recipient'},
						{type: 'text', name: 'to_last_name', size: 'large left', placeholder: getString('NextThought.view.courseware.enrollment.Gift.LastName'), focusEvent: 'enable-recipient'},
						{type: 'text', name: 'receiver', size: 'large left last', required: true, placeholder: getString('NextThought.view.courseware.enrollment.Gift.GifteeEmail'), focusEvent: 'enable-recipient'}
					]
				},
				{
					xtype: 'enrollment-set',
					labelCls: 'gift-message',
					inputs: [
						{type: 'textarea', name: 'message', placeholder: getString('NextThought.view.courseware.enrollment.Gift.GiftMessagePlaceholder'), focusEvent: 'enable-recipient'}
					]
				},
				{
					xtype: 'enrollment-set',
					labelCls: 'gift-from',
					label: getString('NextThought.view.courseware.enrollment.Gift.From'),
					inputs: [
						{
							type: 'text',
							name: 'sender',
							size: 'large',
							placeholder: getString('NextThought.view.courseware.enrollment.Gift.GifterName'),
							focusEvent: 'enable-recipient',
							help: getString('NextThought.view.courseware.enrollment.Gift.Notice')
						}
					]
				}
			]
		},
		{
			name: 'payment',
			label: getString('NextThought.view.courseware.enrollment.Gift.PayInfo'),
			items: [
				{
					xtype: 'enrollment-set',
					inputs: [
						{
							type: 'text',
							name: 'from',
							required: true,
							placeholder: getString('NextThought.view.courseware.enrollment.Gift.GifterEmail'),
							size: 'large',
							help: getString('NextThought.view.courseware.enrollment.Gift.GifterPurchaseNotice')
						}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Gift.CCInfo'),
					inputs: [
						{type: 'credit-card', name: 'creditCard', required: true, doNotStore: true}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Gift.BillingInfo'),
					inputs: [
						{type: 'text', name: 'address_line1', placeholder: getString('NextThought.view.courseware.enrollment.Gift.BillingAddress'), required: true, size: 'full'},
						{type: 'text', name: 'address_line2', placeholder: getString('NextThought.view.courseware.enrollment.Gift.BillingAddressOpt'), size: 'full'},
						// {type: 'text', name: 'address_line3', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line4', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line5', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						{type: 'text', name: 'address_city', placeholder: getString('NextThought.view.courseware.enrollment.Gift.CityTown'), size: 'large'},
						{type: 'text', name: 'address_state', placeholder: getString('NextThought.view.courseware.enrollment.Gift.StateProvTerrReg'), size: 'full'},
						{type: 'text', name: 'address_country', placeholder: getString('NextThought.view.courseware.enrollment.Gift.Country'), required: true, size: 'large left'},
						{type: 'text', name: 'address_zip', placeholder: getString('NextThought.view.courseware.enrollment.Gift.ZIPPostal'), size: 'small left', required: false}
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
							text: getString('NextThought.view.courseware.enrollment.Gift.LicenseAgree'),
							correct: true
						}
					]
				}
			]
		}
	],


	initComponent: function () {
		this.callParent(arguments);

		var me = this;

		me.on('enable-recipient', function () {
			var checkbox = me.recipientCheckbox || me.down('[name=enable_recipient]');

			me.recipientCheckbox = checkbox;

			if (checkbox && !checkbox.getValue()[checkbox.name]) {
				checkbox.setValue(true);
			}
		});

		this.enableBubble(['create-gift-purchase']);
	},


	fillInDefaults: function (values) {
		var user = $AppConfig.userObject,
			realname = user.get('realname'),
			email = user.get('email');

		values = this.callParent(arguments);

		if (!values['enable_recipient']) {
			values['enable_recipient'] = false;
		}

		if (!values.from && email) {
			values.from = email;
		}

		if (!values.sender && realname) {
			values.sender = realname;
		}

		return values;
	},


	changed: function (name, value) {
		this.mixins.form.changed.apply(this, arguments);

		if (name === 'enable_recipient') {
			if (value) {
				this.setRecipient(true);
			} else {
				this.setRecipient(false);
			}
		}
	},


	setRecipient: function (enabled) {
		var items = this.recipientItems || [
			this.down('[name=to_first_name]'),
			this.down('[name=to_last_name]'),
			this.down('[name=receiver]'),
			this.down('[name=message]'),
			this.down('[name=sender]')
		];


		this.recipientItems = items;

		items.forEach(function (item) {
			item[enabled ? 'removeCls' : 'addCls']('disabled');
		});

		items[2].required = enabled;
	},


	getPricingInfo: function (formValue) {
		var desc = this.callParent(arguments);

		desc.from = formValue.from;

		if (formValue['enable_recipient']) {
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
