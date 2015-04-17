Ext.define('NextThought.mixins.ExportBadge', {

	downloadBadge: function(record, targetEl, menuItem, e) {
		var me = this;
		record.lockBadge()
			.then(function() {
				me.triggerFileDownload(record);
			})
			.fail(function() {
				console.error('Failed to lock badge...', arguments);
				me.askForEmailVerification('downloadBadge', record, targetEl);
			});
	},


	exportToBackPack: function(record, targetEl, menuItem, e) {
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
				me.askForEmailVerification('exportToBackPack', record, targetEl);
			});
	},


	triggerFileDownload: function(record) {
		var el = new Ext.XTemplate(Ext.DomHelper.markup([
				{ tag: 'a', href: '{href}', html: 'Download Badge'}
			])),
			filename = record.getLink('baked-image'),
			dom = el.append(Ext.getBody(), {href: filename});

		// HTML5 download tag
		dom.setAttribute('download', filename);

		// Trigger a click event
		// TODO: We still need to find a more reliable solution that doesn't depend on triggering a click event ourselves.
		// For now however, this should cover all the browsers that we support.
	    if (document.createEvent) {
	        var event = document.createEvent('MouseEvents');
	        event.initEvent('click', true, true);
	        dom.dispatchEvent(event);
	    }
	    else {
	        dom.click();
	    }
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

	buildDownloadAction: function(record) {
		var me = this,
			action = {
				name: 'downloadBadge',
				buttonTitle: 'Verify and Download',
				verificationDone: function(){
					me.downloadBadge(record);
					return Promise.resolve();
				},
				verificationFailed: function() {
					return Promise.reject();
				}
			};

		me.possibleExportActions[action.name] = action;
	},


	buildMozillaBackpackAction: function(record) {
		var me = this,
			action = {
				name: 'exportToBackPack',
				buttonTitle: 'Verify and Export',
				verificationDone: function(){
					me.exportToBackPack(record);
					return Promise.resolve();
				},
				verificationFailed: function() {
					return Promise.reject();
				}
			};

		me.possibleExportActions[action.name] = action;
	},


	addAllExportActions: function(record) {
		this.possibleExportActions = {};
		this.buildDownloadAction(record);
		this.buildMozillaBackpackAction(record);
	},


	askForEmailVerification: function(nextActionName, record, targetEl) {
		if ($AppConfig.userObject.isEmailVerified()) { return; }

		var me = this;

		if(!this.possibleExportActions) {
			this.addAllExportActions(record);
		}

		this.emailVerificationWin = Ext.widget('email-verify-window', {
			user: $AppConfig.userObject,
			autoShow: true,
			emailActionOption: this.possibleExportActions[nextActionName]
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
