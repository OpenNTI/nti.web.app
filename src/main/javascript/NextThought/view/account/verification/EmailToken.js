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
			{cls: 'title', html: 'Thank you! We sent you a verification email.'},
			{cls: 'sub', html: 'To finish verifying your email, enter the verification token, we sent you.'}
		]},
		{cls: 'input-box', cn: [
			{tag: 'input', cls: 'token-field', placeholder: 'Enter Token'},
			{tag: 'span', cls: 'clear'}
		]},
		{
			id: '{id}-body', cls: 'body-container', cn: ['{%this.renderContainer(out,values)%}']
		},
		{cls: 'footer', cn: [
			{cls: 'controls', cn: [
				{tag: 'a', cls: 'button confirm', role: 'button', html: 'Submit'},
				{tag: 'a', cls: 'button cancel', role: 'button', html: '{{{NextThought.view.courseware.enrollment.Window.cancel}}}'}
			]}
		]}
	]),

	items: [],

	renderSelectors: {
		tokenEl: '.input-box input',
		submitEl: '.footer .confirm',
		cancelEl: '.footer .cancel'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.submitEl, 'click', 'saveToken', this);
		this.mon(this.cancelEl, 'click', 'close', this);
	},


	saveToken: function(e) {
		var tokenVal = this.tokenEl.getValue();

		if (tokenVal && isMe(this.user)) {
			$AppConfig.userObject.verifyEmailToken(tokenVal)
				.then(function() {
					console.log('Congratulations, your email was successfully verified');
				})
				.fail(function() {
					console.log('Sorry, we could not recognized that email token. aArguments: ', arguments);
				});
		}
		else {
			this.close();
		}
	}

});
