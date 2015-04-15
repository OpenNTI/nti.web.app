Ext.define('NextThought.mixins.ExportBadge', {

	downloadBadge: function(record, itemEl) {
		var me = this;
		record.lockBadge()
			.then(function() {
				me.triggerFileDownload();
			})
			.fail(function() {
				console.error('Failed to lock badge...', arguments);
				me.askForEmailVerification(itemEl);
			});
	},


	exportToBackPack: function(record, itemEl) {
		var me = this;
		record.lockBadge()
			.then(function() {
				return record.pushToMozillaBackpack()
					.then(function(successes) {
						var msg = getFormattedString('NextThought.model.openbadges.Badge.MozillaBackpack.SUCCESS.Message', {badgeName: me.get('name')}),
							title = getString('NextThought.model.openbadges.Badge.MozillaBackpack.SUCCESS.Title');

						me.presentError(title, msg);
						console.log('Congratulations, your badge was sent to backpack');
					})
					.fail(function(errors) {
						console.error('Failed to push to Mozilla Backpack');

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
						me.presentError(getString('NextThought.model.openbadges.Badge.MozillaBackpackFailed.Title'), errorString);
					});
			})
			.fail(function() {
				console.error('Failed to lock badge...', arguments);
				me.askForEmailVerification(itemEl);
			});
	},


	triggerFileDownload: function() {
		var el = new Ext.XTemplate(Ext.DomHelper.markup([
				{ tag: 'a', href: '{href}', html: 'Download Badge'}
			])),
			dom = el.append(Ext.getBody(), {href: this.getLink('baked-image')});

		// TODO: we are creating a click event to trigger the download, maybe do it better?
		dom.click();
	},


	presentError: function(title, message) {
		Ext.MessageBox.alert({
			msg: message,
			buttons: Ext.MessageBox.OK,
			scope: this,
			buttonText: {'ok': 'Close'},
			title: title
		});
	},


	askForEmailVerification: function(targetEl) {
		if ($AppConfig.userObject.isEmailVerified()) { return; }

		var me = this;

		this.emailVerificationWin = Ext.widget('email-verify-window', {
			user: $AppConfig.userObject,
			autoShow: true
		});

		if(targetEl) {
			wait()
				.then(function() {
					me.emailVerificationWin.alignTo(targetEl, 'tl-bl?');
				});
		} else {
			this.emailVerificationWin.show();
		}
	}

});
