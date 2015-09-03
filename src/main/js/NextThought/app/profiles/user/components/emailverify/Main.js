Ext.define('NextThought.app.profiles.user.components.emailverify.Main', {
	extend: 'Ext.Component',
	alias: 'widget.email-verify-view',

	congratsWrapperTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'congrats-wrapper', cn: [
			{cls: 'text', cn: [
				{cls: 'title', html: '{{{NextThought.view.account.verification.EmailToken.CongratulationTitle}}}'},
				{cls: 'sub', html: '{{{NextThought.view.account.verification.EmailToken.CongratulationSubTitle}}}'}
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


	renderTpl: Ext.DomHelper.markup([
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
	]),


	renderSelectors: {
		tokenEl: '.input-box input',
		submitEl: '.footer .confirm',
		cancelEl: '.footer .cancel',
		requestLinkEl: '.buttons .send-email',
		changeLinkEl: '.buttons .change-email',
		titleEl: '.header .title',
		subtitleEl: '.header .sub'
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
		this.mon(this.requestLinkEl, 'click', 'sendEmailVerification', this);
		this.on('show', function() {
			me.tokenEl.focus(200);
		});
	},


	maybeEnableSubmit: function(e) {
		var val = this.tokenEl.getValue(),
			cls = 'disabled';

		if (Ext.isEmpty(val) && !this.submitEl.hasCls(cls)) {
			this.submitEl.addCls(cls);
		} else if (!Ext.isEmpty(val) && this.submitEl.hasCls(cls)) {
			this.submitEl.removeCls(cls);
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
		if (this.ownerCt && this.ownerCt.close) {
			this.ownerCt.close();
		}
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


	showCongrats: function() {
		this.congratsWrapperTpl.append(this.el);
		this.submitEl.addCls('done');
		this.submitEl.update('Dismiss');
		this.cancelEl.hide();
	},


	presentPendingVerification: function(waitingSeconds) {
		if (!waitingSeconds) { return; }

		var time = TimeUtils.getNaturalDuration(waitingSeconds * 1000),
			timeTxt = '<b>' + time + '</b>',
			txt = getString('NextThought.view.account.verification.EmailToken.PendingTitle'),
			sub = getFormattedString('NextThought.view.account.verification.EmailToken.PendingSubTitle', {time: timeTxt}),
			me = this;

		me.onceRendered
			.then(function() {
				me.titleEl.update(txt);
				me.subtitleEl.update(sub);
			});
	},


	handlePendingError: function() {
		var txt = getString('NextThought.view.account.verification.EmailToken.PendingTitle'),
			sub = getFormattedString('NextThought.view.account.verification.EmailToken.PendingSubTitle', {time: timeTxt});

	},


	showError: function(error) {
		var errorEl = this.el.down('.error-msg');
		if (errorEl) {
			errorEl.addCls('visible');
			errorEl.update(getString('NextThought.view.account.verification.EmailToken.InvalidToken'));
		}
	},


	sendEmailVerification: function(e) {
		var me = this;

		me.isVerifyingEmail = true;

		return new Promise(function(fulfill, reject) {
			$AppConfig.userObject.sendEmailVerification()
				.then(function() {
					var txt = getString('NextThought.view.account.verification.EmailToken.Title'),
						sub = getString('NextThought.view.account.verification.EmailToken.SubTitle');

					me.onceRendered
						.then(function() {
							me.titleEl.update(txt);
							me.subtitleEl.update(sub);
						});

					delete me.isVerifyingEmail;
					fulfill();
				})
				.fail(function(resp) {
					var e = Ext.decode(resp.responseText);
					if (resp.status === 422) {
						me.presentPendingVerification(e && e.seconds);
					}

					delete me.isVerifyingEmail;
					reject();
				});
		});
	}
});