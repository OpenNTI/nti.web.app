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

		var user = $AppConfig.userObject;
		if(!user.isEmailVerified()) {
			this.askForEmailVerification(user);
		}
	},


	askForEmailVerification: function(user) {
		var data = {email: user.get('email'), title: this.title, subTitle: this.subTitle};
		this.emailVerificationEl = Ext.get(this.emailVerificationWrapperTpl.append(this.getEl(), data));
		this.submitEl.update('Verify Email');
		this.submitEl.removeCls('disabled');
	},


	askForEmailLock: function(user) {
		var submitBtnTitle = this.emailActionOption && this.emailActionOption.buttonTitle ? this.emailActionOption.buttonTitle : 'Lock',
			data = {email: user.get('email'), title: this.title, subTitle: this.subTitle};	
		this.emailVerificationEl = Ext.get(this.emailVerificationWrapperTpl.append(this.getEl(), data));
		this.submitEl.update(submitBtnTitle);
		this.submitEl.removeCls('disabled');
	},


	submitClicked: function(e) {
		var me = this, tokenVal;
		e.stopEvent();
		
		if (e.getTarget('.done')) {
			this.close();
			return;
		}

		if(this.emailActionOption && this.emailActionOption.onSubmitClick) {
			this.emailActionOption.onSubmitClick(e)
				.then(function() {
					me.close();
				});
		}
		else if(this.emailVerificationEl && this.emailVerificationEl.hasCls('email-verify-wrapper')) {
			this.showVerificationTokenWindow();
		}
		else {
			tokenVal = this.tokenEl.getValue();
			this.saveToken(tokenVal)
				.then(function() {
					if(me.emailActionOption && me.emailActionOption.done) {
						me.emailActionOption.done()
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
