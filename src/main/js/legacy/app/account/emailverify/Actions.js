const Ext = require('extjs');
const StateStore = require('./StateStore');
const LoginStore = require('legacy/login/StateStore');
const NavActions = require('../../navigation/Actions').create();
const PromptActions = require('legacy/app/prompt/Actions').create();
const {isFeature} = require('legacy/util/Globals');
const {wait} = require('legacy/util/Promise');

require('./info/Prompt');
require('./verify/Prompt');
require('legacy/common/Actions');

module.exports = exports = Ext.define('NextThought.app.account.emailverify.Actions', {
	extend: 'NextThought.common.Actions',

	constructor () {
		if (!StateStore.loading && !StateStore.hasFinishedLoad) {
			if (window.Service) {
				this.onLogin();
			} else {
				this.mon(LoginStore, 'login-reader', this.onLogin.bind(this));
			}
		}

		StateStore.setLoaded();
	},


	onLogin () {
		if (isFeature('email-verification')) {
			this.maybeAskForEmailVerification();
		}
	},


	maybeAskForEmailVerification () {
		var user = $AppConfig.userObject;

		if (user && user.get('email') && !user.isEmailVerified()) {
			wait()
				.then(this.askForEmailVerfication.bind(this));
		}
	},


	askForEmailVerfication () {
		var cfg = {
			iconCls: 'warning',
			message: 'Please take a moment to verify your email address.',
			buttons: [
				{
					cls: 'verify',
					action: 'onEmailVerify',
					label: 'Verify Now',
					handler: this.sendEmailVerification.bind(this)
				},
				{
					cls: 'info',
					action: 'onMoreInfo',
					label: 'More Info',
					handler: this.showMoreInfo.bind(this)
				}
			],
			type: 'email-verification'
		};

		NavActions.presentMessageBar(cfg);
	},


	sendEmailVerification () {
		let user = $AppConfig.userObject;

		function onVerificationComplete () {
			NavActions.closeMessageBar();
		}

		user.sendEmailVerification()
			.then(function () {
				return PromptActions.prompt('verify-email', {
					onVerificationComplete: onVerificationComplete
				});
			}, function (error) {
				let e = Ext.decode(error && error.responseText);
				let seconds = error.status === 422 ? e && e.seconds : null;

				return PromptActions.prompt('verify-email', {
					seconds: seconds,
					onVerificationComplete: onVerificationComplete
				});
			});
	},


	showMoreInfo () {
		PromptActions.prompt('verify-email-info');
	},


	createEmailVerifyWindow () {
		var me = this;

		this.emailVerifyWin = Ext.widget('email-token-window', {
			user: $AppConfig.userObject,
			autoShow: false,
			onVerificationComplete: function () {
				var messageBar = Ext.getCmp('message-bar');

				if (messageBar) {
					messageBar.close();
				}
			},
			onDestroy: function () {
				delete me.emailVerifyWin;
			}
		});
	}
});
