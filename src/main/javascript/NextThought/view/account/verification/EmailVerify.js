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
				{tag: 'span', cls: 'email', html: 'Email: {email}'}
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
		var user = $AppConfig.userObject, btnTitle;
		this.emailVerificationEl = Ext.get(this.emailVerificationWrapperTpl.append(this.getEl(), {email: user.get('email'), title: this.title, subTitle: this.subTitle}));

		this.submitEl.update('Verify Email');
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
			this.showVerificationTokenWindow();
		}
		else {
			tokenVal = this.tokenEl.getValue();
			this.saveToken(tokenVal)
				.then(function() {
					if(me.emailActionOption && me.emailActionOption.verificationDone) {
						me.emailActionOption.verificationDone()
						.then(function () {
							me.close();
						});
					}
				})
				.fail(function (){
					me.showError();
				});
		}
	},


	showVerificationTokenWindow: function() {
		var submitBtnTitle = this.emailActionOption && this.emailActionOption.buttonTitle ? this.emailActionOption.buttonTitle : 'Submit';

		this.submitEl.addCls('disabled');
		this.submitEl.update(submitBtnTitle);
		// Reveal the token window
		this.emailVerificationEl.remove();
		delete this.emailVerificationEl;
	}
});
