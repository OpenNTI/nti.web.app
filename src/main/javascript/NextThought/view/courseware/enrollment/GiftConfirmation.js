Ext.define('NextThought.view.courseware.enrollment.GiftConfirmation', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-gift-confirmation',

	requires: ['NextThought.view.form.fields.SimpleTextField'],

	cls: 'enrollment-gift-confirmation',

	giftInfoTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'receiverEmail', cn: [
			{tag: 'tpl', 'if': 'receiverName', cn:
				{tag: 'span', cn: [
					'An email has been sent to ',
					{tag: 'span', cls: 'bold', html: '{receiverName} '},
					'at ',
					{tag: 'span', cls: 'bold', html: '{receiverEmail} '},
					'with instructions about how to redeem this gift.'
				]}
			},
			{tag: 'tpl', 'if': '!receiverName', cn:
				{tag: 'span', cn: [
					'An email has been sent to ',
					{tag: 'span', cls: 'bold', html: '{receiverEmail} '},
					'with instructions about how to redeem this gift.'
				]}
			}
		]},
		{tag: 'tpl', 'if': '!receiverEmail', cn:
			{tag: 'span', cn: [
				'An email has been sent to ',
				{tag: 'span', cls: 'bold', html: '{senderEmail} '},
				'with instructions about how to redeem this gift.'
			]}
		}
	])),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{heading}'},
		{cls: 'prompt', html: '{prompt}'},
		{cls: 'gift-info', html: '{gift-info}'},
		{cls: 'token', cn: [
			{tag: 'span', cls: 'label', html: 'Token:'},
			{cls: 'token-text'}
		]},
		{cls: 'support', cn: [
			{cls: 'support-text', html: 'Please contact tech support if you have any issues.'},
			{cls: 'help-link phone', html: '{phone}'},
			{tag: 'tpl', 'for': 'helplinks', cn: [
				{tag: 'a', href: '{href}', html: '{text}', target: '_blank'}
			]}
		]}
	]),


	renderSelectors: {
		tokenEl: '.token .token-text',
		giftEl: '.gift-info'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var c = this.course,
			start = c.get('StartDate'),
			helplinks = [], i, labelprefix,
			prompt = '<span class=\'bold\' >{course} starts on {date}</span> and will be conducted fully online.</span>';

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
			heading: 'Gift Purchase Successful',
			prompt: prompt,
			phone: getString('course-info.course-supoprt.phone'),
			helplinks: helplinks
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.tokenInput = Ext.widget('simpletext', {
			inputType: 'text',
			readOnly: true,
			placeholder: 'Token',
			renderTo: this.tokenEl
		});
	},


	beforeShow: function() {
		var purchaseAttempt = this.enrollmentOption.purchaseAttempt,
			receiverEmail = purchaseAttempt && purchaseAttempt.get('Receiver'),
			receiverName = purchaseAttempt && purchaseAttempt.get('ReceiverName'),
			token = purchaseAttempt && purchaseAttempt.get('RedemptionCode');

		if (!this.rendered) { return; }

		if (token) {
			this.tokenInput.update(token);
		}

		if (receiverEmail === receiverName) {
			receiverName = '';
		}

		this.giftEl.dom.innerHTML = '';

		this.giftInfoTpl.append(this.giftEl, {
			receiverEmail: receiverEmail,
			receiverName: receiverName,
			senderEmail: purchaseAttempt && purchaseAttempt.get('Creator')
		});
	}
});
