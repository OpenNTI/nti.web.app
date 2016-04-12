const Ext = require('extjs');
const ParseUtils = require('legacy/util/Parsing');
const {isMe} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.account.emailverify.verify.Index', {
	extend: 'Ext.Component',
	alias: 'widget.email-verify-view',

	congratsWrapperTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'congrats-wrapper', cn: [
			{cls: 'text', cn: [
				{cls: 'title', html: 'Thank you!'},
				{cls: 'sub', html: 'Your email has been verified'}
			]}
		]}
	])),


	pendingVerificationWrapperTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'pending-wrapper', cn: [
			{cls: 'text', cn: [
				{cls: 'title', html: '{{{NextThought.view.account.verification.EmailToken.PendingTitle}}}'},
				{cls: 'sub', html: '{{{NextThought.view.account.verification.EmailToken.PendingSubTitle}}}'}
			]}
		]}
	])),


	supportEmailLinkTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'support', cn: [
			{ tag: 'span', html: 'Changing your email is not enabled on this platform. Please '},
			{ tag: 'tpl', 'if': 'email', cn: [
				{ tag: 'span', cls: 'link', cn: [
					{ tag: 'a', target: '_blank', href: 'mailto:{email}', html: 'Contact support'}
				]}
			]},
			{ tag: 'tpl', 'if': '!email', cn: [
				{ tag: 'span', html: 'Contact support'}
			]},
			{ tag: 'span', html: ' to update your email'}
		]}
	])),

	cls: 'email-verify-view',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'card', cn: [
			{cls: 'face front', cn: [
				{ cls: 'header', cn: [
					{cls: 'title', html: 'We sent a verification email to:'},
					{cls: 'email', html: '{email}'},
					{cls: 'sub'},
					{cls: 'buttons', cn: [
							{cls: 'button send-email link', html: 'Send another email'},
							{cls: 'button link change-email', html: 'Change email address'}
					]
					}
				]},
				{cls: 'input-box', cn: [
					{tag: 'input', cls: 'token-field', placeholder: 'Enter your verification token'},
					{tag: 'span', cls: 'clear'}
				]},
				{cls: 'error-msg', html: ''},
				{tag: 'tpl', 'if': 'enableFooter', cn: [
					{cls: 'footer', cn: [
						{cls: 'controls', cn: [
							{tag: 'a', cls: 'button confirm disabled', role: 'button', html: '{save}'},
							{tag: 'a', cls: 'button cancel', role: 'button', html: '{{{NextThought.view.account.verification.EmailToken.Cancel}}}'}
						]}
					]}
				]}
			]},
			{cls: 'face back', cn: [
				{ cls: 'header', cn: [
					{cls: 'buttons', cn: [
							{cls: 'button verify-email link', html: '< Back to Email Verification'}
					]
					},
					{cls: 'title', html: 'Update Email Address'},
					{cls: 'sub'}
				]},
				{cls: 'input-box', cn: [
					{tag: 'input', cls: 'email', value: '{email}'},
					{tag: 'span', cls: 'clear'}
				]},
				{cls: 'error-msg', html: ''},
				{tag: 'tpl', 'if': 'enableFooter', cn: [
					{cls: 'footer', cn: [
						{cls: 'controls', cn: [
							{tag: 'a', cls: 'button confirm', role: 'button', html: '{{{NextThought.view.account.verification.EmailToken.Submit}}}'},
							{tag: 'a', cls: 'button cancel', role: 'button', html: '{{{NextThought.view.account.verification.EmailToken.Cancel}}}'}
						]}
					]}
				]}
			]}
		]}
	]),

	enableFooter: true,

	saveText: getString('NextThought.view.account.verification.EmailToken.Submit'),

	renderSelectors: {
		tokenEl: '.front .input-box input',
		submitEl: '.front .footer .confirm',
		cancelEl: '.front .footer .cancel',
		requestLinkEl: '.front .buttons .send-email',
		changeLinkEl: '.front .buttons .change-email',
		gotoVerifyEl: '.buttons .verify-email',
		titleEl: '.front .header .title',
		subtitleEl: '.front .header .sub',
		emailEl: '.front .header .email',
		clearEl: '.front .input-box .clear',
		emailEditEl: '.back .input-box input',
		cancelEditEl: '.back .footer .cancel',
		confirmEditEl: '.back .footer .confirm',
		clearEmailEl: '.back .input-box .clear',
		subEmailEl: '.back .header .sub'
	},


	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.applyIf(this.renderData || {}, {
			email: this.user && this.user.get('email'),
			enableFooter: this.enableFooter,
			save: this.saveText
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		var me = this;
		this.mon(this.submitEl, 'click', 'submitClicked', this);
		this.mon(this.cancelEl, 'click', 'onClose', this);
		this.mon(this.tokenEl, 'keyup', 'maybeEnableSubmit', this);
		this.mon(this.requestLinkEl, 'click', this.handleVerificationRequest.bind(this));
		this.mon(this.clearEl, 'click', this.reset.bind(this));
		this.mon(this.changeLinkEl, 'click', this.showEmailCard.bind(this));
		this.mon(this.gotoVerifyEl, 'click', this.showVerifyCard.bind(this));
		this.mon(this.confirmEditEl, 'click', this.submitEmailClicked.bind(this));
		this.mon(this.cancelEditEl, 'click', this.onClose.bind(this));
		this.mon(this.clearEmailEl, 'click', this.resetEmail.bind(this));

		this.on('show', function () {
			me.tokenEl.focus(200);
		});

		this.setupEmailEdit();
	},


	maybeEnableSubmit: function (e) {
		var val = this.tokenEl.getValue(),
			cls = 'disabled',
			hasError = this.el.down('.input-box.error');

		if (Ext.isEmpty(val) && !this.submitEl.hasCls(cls)) {
			this.submitEl.addCls(cls);
			this.clearEl.hide();
		} else if (!Ext.isEmpty(val) && this.submitEl.hasCls(cls)) {
			this.submitEl.removeCls(cls);
			this.clearEl.show();
		}

		if (hasError) {
			this.clearError();
		}
	},


	submitClicked: function (e) {
		if (e.getTarget('.done')) {
			this.onClose();
			return;
		}

		this.onSave();
	},


	getValue: function () {
		return this.tokenEl.getValue();
	},


	onSave: function () {
		var tokenVal = this.getValue(),
			me = this;

		me.saveToken(tokenVal)
			.fail(function () {
				me.showError();
			});
	},


	onClose: function () {
		if(this.doClose) {
			this.doClose();
		}
		else {
			this.destroy();
		}
	},


	saveToken: function (tokenVal) {
		var me = this;
		if (!Ext.isEmpty(tokenVal) && isMe(this.user)) {
			return this.user.verifyEmailToken(tokenVal)
				.then(function (resp) {
					me.showCongrats();
					debugger;
					if (me.onVerificationComplete) {
						me.onVerificationComplete();
					}
				});
		}

		return Promise.reject();
	},


	saveEmail: function (e) {
		var emailVal = this.emailEditEl.getValue(),
			oldEmail = this.user && this.user.get('email'),
			me = this;

		if (Ext.isEmpty(emailVal) || this.user.get('email') === emailVal) {
			return Promise.reject();
		}

		this.user.set('email', emailVal);

		return new Promise(function (fulfill, reject) {
			me.user.save({
				success: function (resp) {
					var o = resp.responseText,
						newUser = ParseUtils.parseItems(o)[0];

					//NOTE: Update the links that way in case the email changed, we request verification.
					me.user.set('Links', newUser.get('Links'));
					fulfill(true);
				},
				failure: function (resp) {
					var msg = Ext.JSON.decode(resp.responseText, true) || {};

					me.showEmailEditError(msg);
					me.user.set('email', oldEmail);
					reject(false);
				}
			});
		});
	},


	submitEmailClicked: function (e) {
		if (!isMe(this.user)) {
			return;
		}
		var me = this,
			messageEl = this.el.down('.back .error-msg'),
			targetEl = Ext.get(e.target);

		if (targetEl && targetEl.hasCls('done')) {
			this.onClose();
		}

		this.saveEmail()
			.then(function () {
				me.emailEl.update(me.user.get('email'));
				messageEl.update('Your email has been updated.');
				messageEl.addCls('success visible');

				wait(800)
					.then(me.showVerifyCard.bind(me));
			});
	},


	setupEmailEdit: function () {
		var me = this,
			profileSchema;
		this.user.getSchema()
			.then(function (schema) {
				var profileSchema = schema.ProfileSchema,
					email = profileSchema && profileSchema.email;

				if(email.readonly) {
					me.subEmailEl.update('');
					me.supportEmailLinkTpl.append(me.subEmailEl, {'email': Service.getSupportLinks().supportEmail});
					me.el.down('.back .input-box').hide();
					me.confirmEditEl.update('Done');
					me.confirmEditEl.addCls('done');
					me.cancelEditEl.hide();
				}
			});
	},


	showEmailCard: function () {
		this.el.down('.card').addCls('flipped');
		this.emailEditEl.focus(200);
		this.clearEmailEl.show();
	},


	showVerifyCard: function () {
		this.el.down('.card').removeCls('flipped');
		this.tokenEl.focus(200);
	},


	showCongrats: function () {
		this.congratsWrapperTpl.append(this.el);
		this.submitEl.addCls('done');
		this.submitEl.update('Dismiss');
		this.cancelEl.hide();
	},


	presentPendingVerification: function (waitingSeconds) {
		if (!waitingSeconds) { return; }

		var txt = 'It may take several minutes for the email to reach your inbox. Please wait before requesting another.',
			me = this;

		me.onceRendered
			.then(function () {
				me.subtitleEl.update(txt);
				me.el.addCls('has-time-error');
			});
	},


	handlePendingError: function () {
		var txt = getString('NextThought.view.account.verification.EmailToken.PendingTitle'),
			sub = getFormattedString('NextThought.view.account.verification.EmailToken.PendingSubTitle', {time: timeTxt});

	},


	showError: function (error) {
		var errorEl = this.el.down('.front .error-msg'),
			inputBoxEl = this.el.down('.front .input-box');
		if (errorEl) {
			errorEl.addCls('visible');
			errorEl.update('This token is not valid.');
			inputBoxEl.addCls('error');
		}
	},


	showEmailEditError: function (msg) {
		var errorEl = this.el.down('.back .error-msg'),
			inputBoxEl = this.el.down('.back .input-box');

		if (errorEl) {
			errorEl.addCls('visible');
			errorEl.update(msg.message || 'Invalid Email');
			inputBoxEl.addCls('error');
		}
	},


	reset: function () {
		this.clearError();
		this.tokenEl.dom.value = '';
		this.maybeEnableSubmit();
	},


	clearError: function () {
		var errorEl = this.el.down('.error-msg'),
			inputBoxEl = this.el.down('.input-box');

		errorEl.removeCls('visible');
		inputBoxEl.removeCls('error');
	},


	resetEmail: function () {
		this.clearEmailError();
		this.emailEditEl.dom.value = '';
	},


	clearEmailError: function () {
		var errorEl = this.el.down('.back .error-msg'),
			inputBoxEl = this.el.down('.back .input-box');

		errorEl.removeCls('visible');
		inputBoxEl.removeCls('error');
		errorEl.removeCls('success');
		errorEl.show();
	},


	sendEmailVerification: function () {
		return $AppConfig.userObject.sendEmailVerification();
	},


	handleVerificationRequest: function (e) {
		var me = this,
			targetEl = Ext.get(e.target);

		if (me.isVerifyingEmail) { return; }

		if (targetEl && targetEl.hasCls('done')) {
			this.onClose();
		}

		// Per Design request, we would like to simulate the sending and sent states for email verification,
		// even if the server might respond a lot faster. That's why we're adding the time interval
		this.requestLinkEl.update('Sending...');
		this.requestLinkEl.addCls('sending');
		me.isVerifyingEmail = true;
		wait(1000)
			.then(this.sendEmailVerification.bind(this))
			.then(function () {
				me.el.removeCls('has-time-error');
				me.subtitleEl.update('');
				me.requestLinkEl.update('Sent!');
				me.titleEl.update('We sent another verification email to:');

				wait(1000)
					.then(function () {
						me.requestLinkEl.update('Send another email');
						me.requestLinkEl.removeCls('sending');

						delete me.isVerifyingEmail;
					});
			})
			.fail(function (resp) {
				var e = Ext.decode(resp.responseText);
				if (resp.status === 422) {
					me.presentPendingVerification(e && e.seconds);
				}
				me.requestLinkEl.update('Send another email');
				me.requestLinkEl.removeCls('sending');

				delete me.isVerifyingEmail;
			});
	}
});
