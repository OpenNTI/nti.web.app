const Ext = require('extjs');

const {getString, getFormattedString} = require('legacy/util/Localization');

require('legacy/common/form/fields/SimpleTextField');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.GiftConfirmation', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-gift-confirmation',
	cls: 'enrollment-gift-confirmation',

	giftInfoTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cn: [
			'{{{NextThought.view.courseware.enrollment.GiftConfirmation.EmailReceipt}}} ',
			{tag: 'tpl', 'if': 'receiverEmail', cn: [
				'{{{NextThought.view.courseware.enrollment.GiftConfirmation.GiftCopy}}} ',
				getString('NextThought.view.courseware.enrollment.GiftConfirmation.InstructionstoRedeem')
			]},
			{tag: 'tpl', 'if': '!receiverEmail', cn: [
				'{{{NextThought.view.courseware.enrollment.GiftConfirmation.RedeemCopy}}} ',
				{tag: 'p', cls: 'bold', html: '{{{NextThought.view.courseware.enrollment.GiftConfirmation.PassGift}}}'}
			]}
		]}
	])),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{heading}'},
		{cls: 'gift-info', html: '{gift-info}'},
		{cls: 'prompt', html: '{prompt}'},
		{cls: 'support', cn: [
			'Please contact ',
			{tag: 'a', href: '{{{gift-support.link}}}', html: '{{{gift-support.label}}} '},
			'if you have any issues.'
		]},
		{cls: 'token', cn: [
			{tag: 'span', cls: 'label', html: '{{{NextThought.view.courseware.enrollment.GiftConfirmation.AccessKey}}}'},
			{cls: 'token-text'}
		]},
		{cls: 'transaction', cn: [
			{tag: 'span', cls: 'label', html: '{{{NextThought.view.courseware.enrollment.GiftConfirmation.TransID}}}'},
			{cls: 'transaction-id'}
		]},
		{cls: 'iframe-container'}
	]),

	renderSelectors: {
		tokenEl: '.token .token-text',
		transactionEl: '.transaction .transaction-id',
		giftEl: '.gift-info',
		promptEl: '.prompt',
		iframeEl: '.iframe-container'
	},

	beforeRender: function () {
		this.callParent(arguments);

		var prompt = this.getPrompt();

		this.renderData = Ext.apply(this.renderData || {}, {

			heading: getString('NextThought.view.courseware.enrollment.GiftConfirmation.GiftSuccessful'),
			prompt: prompt
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this;

		me.tokenInput = Ext.widget('simpletext', {
			inputType: 'text',
			readOnly: true,
			placeholder: 'Token',
			renderTo: me.tokenEl
		});

		me.transactionInput = Ext.widget('simpletext', {
			inputType: 'text',
			readOnly: true,
			placeholder: getString('NextThought.view.courseware.enrollment.GiftConfirmation.TransID'),
			renderTo: me.transactionEl
		});

		me.on('destroy', function () {
			me.tokenInput.destroy();
			me.transactionInput.destroy();
		});
	},

	getPrompt: function (hasReceiver) {
		var c = this.course,
			start = c.get('StartDate'),
			prompt;

		prompt = getFormattedString('NextThought.view.courseware.enrollment.GiftConfirmation.CourseOnline', {course: c.get('Title'), date: Ext.Date.format(start, 'F j, Y')}) + ' ';

		//prompt = prompt.replace('{course}', c.get('Title'));
		//prompt = prompt.replace('{date}', Ext.Date.format(start, 'F j, Y'));

		if (hasReceiver) {
			prompt += getString('NextThought.view.courseware.enrollment.GiftConfirmation.GiftActivated');
		} else {
			prompt += getString('NextThought.view.courseware.enrollment.GiftConfirmation.GiftRedeemed');
		}

		return prompt;
	},

	beforeShow: function () {
		var purchaseAttempt = this.enrollmentOption.purchaseAttempt,
			receiverEmail = purchaseAttempt && purchaseAttempt.get('Receiver'),
			transactionId = purchaseAttempt && purchaseAttempt.get('TransactionID'),
			token = purchaseAttempt && purchaseAttempt.get('RedemptionCode'),
			thankYou = purchaseAttempt && purchaseAttempt.get('VendorThankYouPage');

		if (!this.rendered) { return; }

		if (transactionId) {
			this.transactionInput.update(transactionId);
		}

		if (token) {
			this.tokenInput.update(token);
		}

		this.promptEl.update(this.getPrompt(receiverEmail));

		this.giftEl.dom.innerHTML = '';

		this.giftInfoTpl.append(this.giftEl, {
			receiverEmail: receiverEmail,
			senderEmail: purchaseAttempt && purchaseAttempt.get('Creator')
		});

		if (thankYou && thankYou.thankYouURL) {
			this.addThankYouPage(thankYou.thankYouURL);
		}
	},

	addThankYouPage: function (url) {
		var container = this.iframeEl.dom,
			existing = container.querySelector('iframe'),
			iframe;

		//Don't add the same frame twice
		if (existing && existing.src === url) { return; }

		container.innerHTML = '';

		iframe = document.createElement('iframe');
		iframe.src = url;

		container.appendChild(iframe);
	}
});
