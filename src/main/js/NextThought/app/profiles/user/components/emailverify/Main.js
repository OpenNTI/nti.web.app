Ext.define('NextThought.app.profiles.user.components.emailverify.Main', {
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

	layout: 'none',

	cls: 'email-verification-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	constrainTo: Ext.getBody(),
	floating: true,
	closable: true,
	resizable: false,


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
				{cls: 'footer', cn: [
					{cls: 'controls', cn: [
						{tag: 'a', cls: 'button confirm disabled', role: 'button', html: '{{{NextThought.view.account.verification.EmailToken.Submit}}}'},
						{tag: 'a', cls: 'button cancel', role: 'button', html: '{{{NextThought.view.account.verification.EmailToken.Cancel}}}'}
					]}
				]}
			]},
			{cls: 'face back', cn: [
				{ cls: 'header', cn: [
					{cls: 'title', html: 'Change Email Address'},
					{cls: 'sub'},
					{cls: 'buttons', cn: [
							{cls: 'button verify-email link', html: 'Go to verify email'}
						]
					}
				]},
				{cls: 'input-box', cn: [
					{tag: 'input', cls: 'email', value: '{email}'},
					{tag: 'span', cls: 'clear'}
				]},
				{cls: 'error-msg', html: ''},
				{cls: 'footer', cn: [
					{cls: 'controls', cn: [
						{tag: 'a', cls: 'button confirm', role: 'button', html: '{{{NextThought.view.account.verification.EmailToken.Submit}}}'},
						{tag: 'a', cls: 'button cancel', role: 'button', html: '{{{NextThought.view.account.verification.EmailToken.Cancel}}}'}
					]}
				]}
			]}
		]}
	]),


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
		confirmEditEl: '.back .footer .confirm'
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.applyIf(this.renderData || {}, {
			email: this.user && this.user.get('email')
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;
		this.mon(this.submitEl, 'click', 'submitClicked', this);
		this.mon(this.cancelEl, 'click', 'close', this);
		this.mon(this.tokenEl, 'keyup', 'maybeEnableSubmit', this);
		this.mon(this.requestLinkEl, 'click', this.handleVerificationRequest.bind(this));
		this.mon(this.clearEl, 'click', this.reset.bind(this));
		this.mon(this.changeLinkEl, 'click', this.showEmailCard.bind(this));
		this.mon(this.gotoVerifyEl, 'click', this.showVerifyCard.bind(this));
		this.mon(this.confirmEditEl, 'click', this.saveEmailClicked.bind(this));
		this.mon(this.cancelEditEl, 'click', this.close.bind(this));

		this.on('show', function() {
			me.tokenEl.focus(200);
		});
	},


	maybeEnableSubmit: function(e) {
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


	submitClicked: function(e) {
		var tokenVal = this.tokenEl.getValue(),
			me = this;

		if (e.getTarget('.done')) {
			this.close();
			return;
		}

		me.saveToken(tokenVal)
			.fail(function (){
				me.showError();
			});
	},


	close: function() {
		this.destroy();
	},


	saveToken: function(tokenVal) {
		var me = this;
		if (!Ext.isEmpty(tokenVal) && isMe(this.user)) {
			return this.user.verifyEmailToken(tokenVal)
				.then(function(resp) {
					me.showCongrats();
					if (me.onVerificationComplete) {
						me.onVerificationComplete();
					}
				});
		}

		return Promise.reject();
	},


	saveEmailClicked: function(e) {
		var emailVal = this.emailEditEl.getValue(), me = this, oldEmail = this.user && this.user.get('email');

		if (Ext.isEmpty(emailVal) || !isMe(this.user) || this.user.get('email') === emailVal) {
			return;
		}

		this.user.set('email', emailVal);

		return new Promise(function(fulfill, reject) {
			me.user.save({
				success: function(resp) {
					var o = resp.responseText,
						newUser = ParseUtils.parseItems(o)[0];

					//NOTE: Update the links that way in case the email changed, we request verification.
					me.user.set('Links', newUser.get('Links'));
					fulfill(true);
				},
				failure: function(resp) {
					var msg = Ext.JSON.decode(resp.responseText, true) || {};

					me.showEmailEditError(msg);
					me.user.set('email', oldEmail);
					reject(false);
				}
			});
		});
	},


	showEmailCard: function() {
		this.el.down('.card').addCls('flipped');
	},


	showVerifyCard: function() {
		this.el.down('.card').removeCls('flipped');
	},


	showCongrats: function() {
		this.congratsWrapperTpl.append(this.el);
		this.submitEl.addCls('done');
		this.submitEl.update('Dismiss');
		this.cancelEl.hide();
	},


	presentPendingVerification: function(waitingSeconds) {
		if (!waitingSeconds) { return; }

		var txt = 'It may take several minutes for the email to reach your inbox. Please wait before requesting another.',
			me = this;

		me.onceRendered
			.then(function() {
				me.subtitleEl.update(txt);
			});
	},


	handlePendingError: function() {
		var txt = getString('NextThought.view.account.verification.EmailToken.PendingTitle'),
			sub = getFormattedString('NextThought.view.account.verification.EmailToken.PendingSubTitle', {time: timeTxt});

	},


	showError: function(error) {
		var errorEl = this.el.down('.front .error-msg'),
			inputBoxEl = this.el.down('.front .input-box');
		if (errorEl) {
			errorEl.addCls('visible');
			errorEl.update('This token is not valid.');
			inputBoxEl.addCls('error');
		}
	},


	showEmailEditError: function(msg) {
		var errorEl = this.el.down('.back .error-msg'),
			inputBoxEl = this.el.down('.back .input-box');

		if (errorEl) {
			errorEl.addCls('visible');
			errorEl.update(msg.message || 'Invalid Email');
			inputBoxEl.addCls('error');
		}
	},


	reset: function() {
		this.clearError();
		this.tokenEl.dom.value = '';
		this.maybeEnableSubmit();
	},


	clearError: function(){
		var errorEl = this.el.down('.error-msg'),
			inputBoxEl = this.el.down('.input-box');

		errorEl.removeCls('visible');
		inputBoxEl.removeCls('error');
	},


	sendEmailVerification: function(e) {
		return $AppConfig.userObject.sendEmailVerification();
	},


	handleVerificationRequest: function() {
		var me = this;

		if (me.isVerifyingEmail) { return; }

		// Per Design request, we would like to simulate the sending and sent states for email verification,
		// even if the server might respond a lot faster. That's why we're adding the time interval
		this.requestLinkEl.update('Sending...');
		me.isVerifyingEmail = true;
		wait(1000)
			.then(this.sendEmailVerification.bind(this))
			.then(function() {
				me.requestLinkEl.update('Sent!');
				me.titleEl.update('We sent another verification email to:');
				wait(1000)
					.then(function() {
						me.requestLinkEl.update('Send another email');
						delete me.isVerifyingEmail;
					});
			})
			.fail(function(resp) {
				var e = Ext.decode(resp.responseText);
				if (resp.status === 422) {
					me.presentPendingVerification(e && e.seconds);
				}
				me.requestLinkEl.update('Send another email');
				delete me.isVerifyingEmail;
			});
	}
});
