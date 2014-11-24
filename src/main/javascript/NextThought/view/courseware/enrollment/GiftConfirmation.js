Ext.define('NextThought.view.courseware.enrollment.GiftConfirmation', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-gift-confirmation',

	requires: ['NextThought.view.form.fields.SimpleTextField'],

	cls: 'enrollment-gift-confirmation',

	giftInfoTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cn: [
			'We\'ve sent an email receipt of this transaction to you at ',
			{tag: 'a', html: '{senderEmail}. '},
			{tag: 'tpl', 'if': 'receiverEmail', cn: [
				'We\'ve also sent you a copy of the gift notification that was sent to ',
				{tag: 'a', html: '{receiverEmail} '},
				'with instructions on how to redeem this gift.'
			]},
			{tag: 'tpl', 'if': '!receiverEmail', cn: [
				'We\'ve also sent you a separate email that contains instructions on how to redeem this gift.',
				{tag: 'p', cls: 'bold', html: 'Please be sure to pass this information along to the gift recipient in time to take advantage of the course.'}
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
			{tag: 'span', cls: 'label', html: 'Access Key:'},
			{cls: 'token-text'}
		]},
		{cls: 'transaction', cn: [
			{tag: 'span', cls: 'label', html: 'Transaction ID:'},
			{cls: 'transaction-id'}
		]}
	]),


	renderSelectors: {
		tokenEl: '.token .token-text',
		transactionEl: '.transaction .transaction-id',
		giftEl: '.gift-info'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var c = this.course,
			start = c.get('StartDate'),
			helplinks = [], i, labelprefix,
			prompt = '<span class=\'bold\' >{course}</span> starts on {date} and will be conducted fully online.</span>';

		prompt = prompt.replace('{course}', c.get('Title'));
		prompt = prompt.replace('{date}', Ext.Date.format(start, 'F j, Y'));

		for (i = 1; i <= 3; i++) {
			labelprefix = 'course-info.course-supoprt.link' + i;

			if (getString(labelprefix + '.Label') !== labelprefix + '.label') {
				helplinks.push(
					{href: getString(labelprefix + '.URL'), text: getString(labelprefix + '.Label', '', true)}
				);
			}
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			heading: 'Thank you for your purchase!',
			prompt: prompt,
			phone: getString('course-info.course-supoprt.phone'),
			helplinks: helplinks
		});
	},


	afterRender: function() {
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
			placeholder: 'Transaction ID',
			renderTo: me.transactionEl
		});

		me.on('destroy', function() {
			me.tokenInput.destroy();
			me.transactionInput.destroy();
		});
	},


	beforeShow: function() {
		var purchaseAttempt = this.enrollmentOption.purchaseAttempt,
			receiverEmail = purchaseAttempt && purchaseAttempt.get('Receiver'),
			transactionId = purchaseAttempt && purchaseAttempt.get('TransactionID'),
			token = purchaseAttempt && purchaseAttempt.get('RedemptionCode');

		if (!this.rendered) { return; }

		if (transactionId) {
			this.transactionInput.update(transactionId);
		}

		if (token) {
			this.tokenInput.update(token);
		}

		this.giftEl.dom.innerHTML = '';

		this.giftInfoTpl.append(this.giftEl, {
			receiverEmail: receiverEmail,
			senderEmail: purchaseAttempt && purchaseAttempt.get('Creator')
		});
	}
});
