var Ext = require('extjs');
var CommonActions = require('../../../common/Actions');
var NavigationActions = require('../../navigation/Actions');
var LoginStateStore = require('../../../login/StateStore');
var EmailverifyWindow = require('./components/emailverify/Window');
var InfoWindow = require('./components/emailverify/info/Window');
var {isFeature} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.profiles.user.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function() {
		this.callParent(arguments);
		this.LoginStore = NextThought.login.StateStore.getInstance();
		this.NavActions = NextThought.app.navigation.Actions.create();

		if (isFeature('email-verification')) {
			this.mon(this.LoginStore, 'login-ready', this.maybeAskForEmailVerification.bind(this));
		}
	},

	maybeAskForEmailVerification: function() {
		var user = $AppConfig.userObject;

		if (user && user.get('email') && !user.isEmailVerified()) {
			wait()
				.then(this.askForEmailVerfication.bind(this));
		}
	},

	askForEmailVerfication: function() {
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

		this.NavActions.presentMessageBar(cfg);
	},

	sendEmailVerification: function() {
		var me = this,
			user = $AppConfig.userObject;

		user.sendEmailVerification()
			.then(function() {
				if (!me.emailVerifyWin) {
					me.createEmailVerifyWindow();
				}

				me.emailVerifyWin.show();
				me.emailVerifyWin.center();
			})
			.fail(function(error) {
				var e = Ext.decode(error && error.responseText);

				if (!me.emailVerifyWin) {
					me.createEmailVerifyWindow();
				}

				if (error.status === 422) {
					me.emailVerifyWin.presentPendingVerification(e && e.seconds);
				}
				me.emailVerifyWin.show();
				me.emailVerifyWin.center();
			});
	},

	showMoreInfo: function() {
		this.moreInfo = Ext.widget('email-verify-info-window');
		this.moreInfo.show();
		this.moreInfo.center();
	},

	createEmailVerifyWindow: function() {
		var me = this;

		this.emailVerifyWin = Ext.widget('email-token-window', {
			user: $AppConfig.userObject,
			autoShow: false,
			onVerificationComplete: function(){
				var messageBar = Ext.getCmp('message-bar');

				if (messageBar) {
					messageBar.close();
				}
			},
			onDestroy: function(){
				delete me.emailVerifyWin;
			}
		});
	}
});
