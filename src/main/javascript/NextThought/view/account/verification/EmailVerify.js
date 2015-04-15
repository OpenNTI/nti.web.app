Ext.define('NextThought.view.account.verification.EmailVerify', {
	extend: 'NextThought.view.account.verification.EmailToken',
	alias: 'widget.email-verify-window',

	emailVerificationWrapperTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'email-verify-wrapper', cn: [
			{cls: 'header', cn: [
				{cls: 'title', html: '{title}'},
				{cls: 'sub', html: '{subTitle}'}
			]},
			{cls: 'meta', cn: [
				{tag: 'span', cls: 'email', html: 'Email: {email}'}//,
//				{ tag: 'span', cls: 'link', html: '{{{NextThought.view.profiles.About.VerifyEmail}}}'},
//				{ tag: 'span', cls: 'info', html: '', 'data-qtip': '{{{NextThought.view.profiles.About.EmailInfo}}}'}
			]}
		]}
	])),


	subTitle: getString('NextThought.view.account.verification.EmailVerify.SubTitle'),
	title: getString('NextThought.view.account.verification.EmailVerify.Title'),

	afterRender: function() {
		this.callParent(arguments);
		this.askForEmailVerification();
	},


	askForEmailVerification: function() {
		var user = $AppConfig.userObject;
		this.emailVerificationEl = Ext.get(this.emailVerificationWrapperTpl.append(this.getEl(), {email: user.get('email'), title: this.title, subTitle: this.subTitle}));
		this.submitEl.update('Verify');
		this.submitEl.removeCls('disabled');
	},


	submitClicked: function(e) {
		var me = this, tokenVal;
		e.stopEvent();
		
		if (e.getTarget('.done')) {
			this.close();
			return;
		}
		
		if(this.emailVerificationEl && this.emailVerificationEl.hasCls('email-verify-wrapper')) {
			this.doEmailVerification(e);
		}
		else {
			tokenVal = this.tokenEl.getValue();
			this.saveToken(tokenVal);
		}
	},


	doEmailVerification: function(e) {
		e.preventDefault();
		if (this.isVerifyingEmail || Ext.fly(e.target).up('.sent')) { return; }
		var me = this;

		me.isVerifyingEmail = true;
		$AppConfig.userObject.sendEmailVerification()
			.then(function() {
				me.showVerificationTokenWindow();
				delete me.isVerifyingEmail;
			})
			.fail(function(resp) {
				var e = Ext.decode(resp.responseText);
				if (resp.status === 422) {
					me.showVerificationTokenWindow();
				}
				delete me.isVerifyingEmail;
			});
	},


	showVerificationTokenWindow: function() {
		this.submitEl.addCls('disabled');
		this.submitEl.update('Submit');
		// Reveal the token window
		this.emailVerificationEl.remove();
		delete this.emailVerificationEl;
	}
});
