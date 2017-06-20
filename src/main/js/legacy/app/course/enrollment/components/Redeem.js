const Ext = require('extjs');

const {getString, getFormattedString} = require('legacy/util/Localization');

require('./Purchase');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.Redeem', {
	extend: 'NextThought.app.course.enrollment.components.Purchase',
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
									{tag: 'span', cls: 'bold', html: getString('NextThought.view.courseware.enrollment.Redeem.HelpFindAccessKey') + ' '},
									getFormattedString('NextThought.view.courseware.enrollment.Redeem.CheckEmail', {
										support: getString('gift-support.label'),
										link: getString('gift-support.link')
									})
									//getFormattedString('NextThought.view.courseware.enrollment.Redeem.ContactSupport', {support: getString('gift-support.link')})

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


	afterRender: function () {
		this.callParent(arguments);
		this.enableBubble('redeem-gift');

		if (this.enrollmentOption.AllowVendorUpdates) {
			this.revealItem('allowupdates_container');
		}

		this.redeemable = false;

		this.on({
			'reveal-item': 'enableRedeem',
			'hide-item': 'disableRedeem'
		});
	},


	fillInDefaults: function (values) {
		if (this.enrollmentOption.redeemToken) {
			values.token = this.enrollmentOption.redeemToken;
		}

		return values;
	},

	disableRedeem: function () {
		this.redeemable = false;
	},

	enableRedeem: function () {
		this.redeemable = true;
	},

	maybeSubmit: function () {
		if(!this.redeemable) {return;}

		var me = this, invalid,
			value = me.getValue();

		value.purchasable = me.enrollmentOption.Purchasable;

		me.shouldAllowSubmission()
			.then(function () {
				invalid = false;
				me.submitBtnCfg.disabled = true;
				me.fireEvent('update-buttons');
				me.addMask('Processing token.');
				return me.complete(me, value);
			}, function () {
				invalid = true;
				return Promise.reject();
			})
			.then(function (result) {
				me.done(me);
			})
			.catch(function (error) {
				if (!invalid) {
					me.submitBtnCfg.disabled = false;
					me.fireEvent('update-buttons');
					me.removeMask();
					me.showError(error);
				}
			});
	},


	//need a separate function to appear when redeeming an access key

	stopClose: function () {
		var r, me = this;

		if (this.hasMask()) {
			r = Promise.reject();
		} else {
			r = new Promise(function (fulfill, reject) {
				Ext.Msg.show({
					title: getString('NextThought.view.courseware.enrollment.Redeem.NotRedeemed'),
					msg: getString('NextThought.view.courseware.enrollment.Purchase.ProgressLost'),
					icon: 'warning-red',
					buttons: {
						primary: {
							text: getString('NextThought.view.courseware.enrollment.Purchase.StayFinish'),
							handler: reject
						},
						secondary: {
							text: getString('NextThought.view.courseware.enrollment.Purchase.LeavePage'),
							handler: function () {
								me.clearStorage();
								fulfill();
							}
						}
					}
				});
			});
		}

		return r;
	}
});
