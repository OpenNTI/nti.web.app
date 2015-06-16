Ext.define('NextThought.app.account.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.account.coppa.Window',
		'NextThought.app.account.recovery.Window',
		'NextThought.app.account.coppa.upgraded.Window'
	],

	maybeShowCoppaWindow: function() {
		var user = $AppConfig.userObject,
			showWindow = user.getLink('account.profile.needs.updated'),
			url = user.getLink('account.profile'),
			req;

		if (!showWindow) {
			return;
		}

		req = {
			url: getURL(url),
			timeout: 20000,
			scope: this,
			callback: function(q, success, r) {
				if (!success) {
					console.log('Could not get acct rel schema for coppa window. Window will not show');
					return;
				}

				try {
					var o = Ext.decode(r.responseText);
					Ext.widget('coppa-window', {
						schema: o.ProfileSchema,
						handleSubmit: this.submitCoppaInfo.bind(this)
					}).show();
				} catch (e) {
					console.error(Globals.getError(e));
				}
			}
		};

		Ext.Ajax.request(req);
		console.log('get data from ' + url + ' and show coppa window...');
	},


	showEmailRecoveryWindow: function(fieldName, linkName) {
		Ext.widget('recovery-email-window', {
			fieldName: fieldName,
			linkName: linkName,
			handleSubmit: this.fixEmail.bind(this)
		}).show();
	},


	showCoppaConfirmWindow: function() {
		var link = $AppConfig.userObject.getLink('coppa.upgraded.rollbacked');

		Ext.widget('coppa-confirm-window', {
			link: link,
			deleteOnDestroy: true
		}).show();
	},


	showWelcomePage: function() {},


	showResearchAgreement: function() {},


	showNewTermsOfService: function() {},


	submitCoppaInfo: function(values) {
		var linkToDelete = $AppConfig.userObject.getLink('account.profile.needs.updated'),
			key;

		if (!values.firstname) {
			return Promise.reject({field: 'firstname', message: 'First Name is required'});
		}

		if (!values.lastname) {
			return Promise.reject({field: 'lastname', message: 'Last Name is required'});
		}

		delete values.firstname;
		delete values.lastname;

		for (key in values) {
			if (values.hasOwnPropery(key) && values[key] !== null) {
				$AppConfig.userObject.set(key, values[key]);
			}
		}

		return new Promise(function(fulfill, reject) {
			$AppConfig.userObject.save({
				callback: function(req, success, resp) {
					if (!success) {
						reject(Ext.decode(resp.responseText));
					} else {
						//we need to delete the link now.
						Ext.Ajax.request({
							url: getURL(linkToDelete),
							timeout: 20000,
							method: 'DELETE',
							callback: function(q, success, r) {
								if (!success) {
									console.log('Could not delete the needs.updated link');
									return;
								}
							}
						});

						fulfill();
					}
				}
			});
		});
	},


	fixEmail: function(values) {
		var linkToDelete = $AppConfig.userObject.getLink(values.linkName),
			email = values.email,
			fieldName = values.fieldName,
			optionalLinkName;

		if (value.linkName === 'contact-email-sends-consent-request') {
			linkToDelete = null;
			opetionalLinkName = values.linkName;
		}

		if (fieldName && email) {
			return new Promise(function(fulfill, reject) {
				$AppConfig.userObject.saveField(fieldName, email, function() {
					if (linkToDelete) {
						//we need to delete the link now
						Ext.Ajax.request({
							url: getURL(linkToDelete),
							timeout: 20000,
							scope: this,
							method: 'DELETE',
							callback: function(q, success, r) {
								if (!success) {
									console.log('Could not delete the needs.update link');
									return;
								}
							}
						});
					}

					fulfill();
				}, function(resp) {
					reject(Ext.decode(resp.responseText));
				}, optionalLinkName);
			});
		}
	}
});
