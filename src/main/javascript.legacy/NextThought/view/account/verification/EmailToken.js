Ext.define('NextThought.view.account.verification.EmailToken', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.email-token-window',

	cls: 'email-verification-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	constrainTo: Ext.getBody(),
	floating: true,
	closable: true,
	resizable: false,
	width: 450,
	dialog: true,
	closeAction: 'destroy',
	childEls: ['body'],
	getTargetEl: function() {
		return this.body;
	},

	getDockedItems: function() {
		return [];
	},

	layout: 'auto',
	componentLayout: 'natural',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			{cls: 'title', html: '{{{NextThought.view.account.verification.EmailToken.VerifyTitle}}}'},
			{cls: 'sub', cn: [
					{tag: 'span', html: '{{{NextThought.view.account.verification.EmailToken.RequestVerifyEmailTitle}}}'},
					{tag: 'span', cls: 'link verify-link', html: '{{{NextThought.view.account.verification.EmailToken.RequestVerifyEmailLink}}}'}
				]
			}
		]},
		{cls: 'error-msg', html: ''},
		{cls: 'input-box', cn: [
			{tag: 'input', cls: 'token-field', placeholder: '{{{NextThought.view.account.verification.EmailToken.Placeholder}}}'},
			{tag: 'span', cls: 'clear'}
		]},
		{
			id: '{id}-body', cls: 'body-container', cn: ['{%this.renderContainer(out,values)%}']
		},
		{cls: 'footer', cn: [
			{cls: 'controls', cn: [
				{tag: 'a', cls: 'button confirm disabled', role: 'button', html: '{{{NextThought.view.account.verification.EmailToken.Submit}}}'},
				{tag: 'a', cls: 'button cancel', role: 'button', html: '{{{NextThought.view.account.verification.EmailToken.Cancel}}}'}
			]}
		]}
	]),


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


	items: [],

	renderSelectors: {
		tokenEl: '.input-box input',
		submitEl: '.footer .confirm',
		cancelEl: '.footer .cancel',
		requestLinkEl: '.header .sub .verify-link',
		titleEl: '.header .title',
		subtitleEl: '.header .sub'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.submitEl, 'click', 'submitClicked', this);
		this.mon(this.cancelEl, 'click', 'close', this);
		this.mon(this.tokenEl, 'keyup', 'maybeEnableSubmit', this);
		this.mon(this.requestLinkEl, 'click', 'sendEmailVerification', this);
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


	saveToken: function(tokenVal) {
		var me = this;
		if (!Ext.isEmpty(tokenVal) && isMe(this.user)) {
			return this.user.verifyEmailToken(tokenVal)
				.then(function(resp) {
					me.showCongrats();
				});
		}

		return Promise.reject();
	},


	sendEmailVerification: function(e) {
		var me = this;

		me.isVerifyingEmail = true;
		$AppConfig.userObject.sendEmailVerification()
			.then(function() {
				var txt = getString('NextThought.view.account.verification.EmailToken.Title'),
					sub= getString('NextThought.view.account.verification.EmailToken.SubTitle');

				me.titleEl.update(txt);
				me.subtitleEl.update(sub);
				delete me.isVerifyingEmail;
			})
			.fail(function(resp) {
				var e = Ext.decode(resp.responseText);
				if (resp.status === 422) {
					var txt = getString('NextThought.view.account.verification.EmailToken.Title'),
						sub= getString('NextThought.view.account.verification.EmailToken.SubTitle');
					me.titleEl.update(txt);
					me.subtitleEl.update(sub);
				}
				delete me.isVerifyingEmail;
			});
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
			timeTxt = '<b>' + time + '</b>';
		this.pendingVerificationWrapperTpl.append(this.el, {time: timeTxt});
		this.submitEl.addCls('done');
		this.submitEl.update('Dismiss');
		this.submitEl.removeCls('disabled');
		this.cancelEl.hide();
	},


	showError: function() {
		var errorEl = this.el.down('.error-msg');
		if (errorEl) {
			errorEl.addCls('visible');
			errorEl.update(getString('NextThought.view.account.verification.EmailToken.InvalidToken'));
		}
	}


});
