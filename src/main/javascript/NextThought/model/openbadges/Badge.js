Ext.define('NextThought.model.openbadges.Badge', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'alignment', type: 'auto'},
		{name: 'criteria', type: 'string'},
		{name: 'description', type: 'string'},
		{name: 'image', type: 'string'},
		{name: 'issuer', type: 'auto'},
		{name: 'name', type: 'string'},
		{name: 'tags', type: 'auto'},
		{name: 'Locked', type: 'boolean'},
		//properties for the ui
		{name: 'earnedCls', type: 'string', persist: false},
		{name: 'isEmpty', type: 'bool', persist: false},
		{name: 'isMe', type: 'boolean', persist: false}
	],


	downloadBadge: function(record, e) {
		var me = this;
		this.lockBadge()
			.then(function() {
				me.triggerFileDownload();
			})
			.fail(function() {
				Ext.MessageBox.alert({
					msg: getString('NextThought.model.openbadges.Badge.LockFailedEmailReason'),
					buttons: Ext.MessageBox.OK,
					scope: me,
					icon: 'warning-red',
					buttonText: {'ok': 'Close'},
					title: getString('NextThought.model.openbadges.Badge.LockFailed')
				});
				console.error('Failed to lock badge...', arguments);
			});
	},


	triggerFileDownload: function() {
		var el = new Ext.XTemplate(Ext.DomHelper.markup([
				{ tag: 'a', href: '{href}', html: 'Download Badge'}
			])),
			dom = el.append(Ext.getBody(), {href: this.getLink('baked-image')});

		dom.click();
	},


	exportToBackPack: function() {
		var me = this;
		this.lockBadge()
			.then(function() {
				return me.pushToMozillaBackpack()
					.then(function(successes) {
						Ext.MessageBox.alert({
							msg: getFormattedString('NextThought.model.openbadges.Badge.MozillaBackpack.SUCCESS.Message', {badgeName: me.get('name')}),
							buttons: Ext.MessageBox.OK,
							scope: me,
							buttonText: {'ok': 'Close'},
							title: getString('NextThought.model.openbadges.Badge.MozillaBackpack.SUCCESS.Title')
						});
						console.log('Congratulations, your badge was sent to backpack');
					})
					.fail(function(errors) {
						var errorString = '', str;
						Ext.each(errors, function(err) {
							var s = 'NextThought.model.openbadges.Badge.MozillaBackpackFailed.' + err.reason,
								str = getString(s);
							if (s !== str) {
								errorString += str + '<br>';
							}
							console.error('Failed Assertion: ' + err.assertion + ' Reason: ' + err.reason);
						});

						if (Ext.isEmpty(errorString)) {
							errorString = getString('NextThought.model.openbadges.Badge.MozillaBackpackFailed.GENERAL');
						}

						Ext.MessageBox.alert({
							msg: errorString,
							buttons: Ext.MessageBox.OK,
							scope: me,
							icon: 'warning-red',
							buttonText: {'ok': 'Close'},
							title: getString('NextThought.model.openbadges.Badge.MozillaBackpackFailed.Title')
						});
						console.error('Failed to push to Mozilla Backpack');
					});
			})
			.fail(function() {
				Ext.MessageBox.alert({
					msg: getString('NextThought.model.openbadges.Badge.LockFailedEmailReason'),
					buttons: Ext.MessageBox.OK,
					scope: me,
					icon: 'warning-red',
					buttonText: {'ok': 'Close'},
					title: getString('NextThought.model.openbadges.Badge.LockFailed')
				});
				console.error('Failed to lock badge...', arguments);
			});
	},


	pushToMozillaBackpack: function() {
		var jsonURL = this.getLink('mozilla-backpack');

		if (Ext.isEmpty(jsonURL)) {
			return Promise.reject();
		}

		return new Promise(function(fulfill, reject) {
			OpenBadges.issue([jsonURL], function(errors, successes) {
				if (!Ext.isEmpty(errors)) {
					reject(errors);
				} else {
					fulfill(successes);
				}
			});
		});
	},


	lockBadge: function() {
		if (this.isBadgeLocked()) { return Promise.resolve(); }

		var me = this;
		if (!$AppConfig.userObject.isEmailVerified()) {
			return Promise.reject();
		}

		return Service.post(this.getLink('lock'))
			.then(function(resp) {
				me.deleteLink('lock');
				Promise.resolve(resp);
			});
	},


	isBadgeLocked: function() {
		return !this.hasLink('lock');
	}
});
