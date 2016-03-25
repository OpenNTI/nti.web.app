var Ext = require('extjs');
var EmailverifyMain = require('../../profiles/user/components/emailverify/Main');


module.exports = exports = Ext.define('NextThought.app.badge.components.Editor', {
	extend: 'Ext.container.Container',
	alias: 'widget.badge-export-editor',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		if (!this.user.isEmailVerified()) {
			this.showEmailVerfication();
		}
		else {
			this.showBadgeLock();
		}
	},

	showEmailVerfication: function () {
		if (this.activeEditor) {
			this.activeEditor.destroy();
		}

		this.activeEditor = this.add({
			xtype: 'email-verify-view',
			user: this.user,
			enableFooter: true,
			saveText: this.saveText,
			onSave: this.onSaveEmailToken.bind(this),
			onClose: this.doClose
		});

		this.onceRendered
			.then(this.setupEmailVerification.bind(this));
	},

	setupEmailVerification: function () {
		if (this.disableBack) {
			this.disableBack();
		}

		if (this.setTitle) {
			this.setTitle(this.title);
		}

		if (this.setSubTitle) {
			this.setSubTitle(this.subTitle);
		}

		// NOTE: This does the trick of hiding the footer
		// since the email verify view has its own footer
		if (this.setSaveText) {
			this.setSaveText('');
		}

		if (this.enableSave) {
			this.enableSave();
		}
	},

	/**
	 * Handles the save event on the email token view.
	 * When it succeeds, it triggers the doSave call on the prompt object
	 * to perform the fulfill action.
	 * 
	 */
	onSaveEmailToken: function () {
		var token = this.activeEditor && this.activeEditor.getValue(),
			me = this;
		if (this.user) {
			this.user.verifyEmailToken(token)
				.then(function () {
					if (me.doSave) {
						me.doSave();
					}
				})
				.fail(function () {
					me.activeEditor.showError();
				});
		}
	},

	/**
	 * Lock the badge 
	 * 
	 * @return {Promise} the promise to lock the badge.
	 */
	onSave: function () {
		var record = this.badge;
		return record.lockBadge();
	},

	showBadgeLock: function () {
		var email = this.user && this.user.get('email');

		if (this.activeEditor) {
			this.activeEditor.destroy();
		}

		this.activeEditor = this.add({
			xtype: 'box',
			autoEl: {
				cls: 'badge-lock',
				cn: [
					{cls: 'msg', html: getString('NextThought.mixins.ExportBadge.LockEmail.SubTitle')},
					{cls: 'email', html: email}
				]
			}
		});

		this.title = getString('NextThought.mixins.ExportBadge.LockEmail.Title');
		this.subTitle = '';

		this.onceRendered
			.then(this.setupEmailLock.bind(this));
	},

	setupEmailLock: function () {
		if (this.setTitle) {
			this.setTitle(this.title);
		}

		if (this.setSubTitle) {
			this.setSubTitle(this.subTitle);
		}

		if (this.setSaveText) {
			this.setSaveText(this.saveText);
		}

		if (this.enableSave) {
			this.enableSave();
		}
	}
});
