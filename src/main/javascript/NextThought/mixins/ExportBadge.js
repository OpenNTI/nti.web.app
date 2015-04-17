Ext.define('NextThought.mixins.ExportBadge', {

	downloadItemClicked: function(record, targetEl, menuItem, e) {
		if ($AppConfig.userObject.isEmailVerified() && !record.get('Locked')) {
			this.askForEmailLock('downloadBadge', record, targetEl);
		}
		else {
			this.downloadBadge(record, targetEl);
		}
	},


	exportItemClicked: function(record, targetEl, menuItem, e) {
		if ($AppConfig.userObject.isEmailVerified() && !record.get('Locked')) {
			this.askForEmailLock('exportToBackPack', record, targetEl);
		}
		else {
			this.exportToBackPack(record, targetEl);
		}
	},


	downloadBadge: function(record, targetEl) {
		var me = this;
		record.lockBadge()
			.then(function() {
				me.triggerFileDownload(record);
			})
			.fail(function() {
				console.warn('Failed to lock badge...', arguments);
				me.askForEmailVerification('downloadBadge', record, targetEl);
			});
	},


	exportToBackPack: function(record, targetEl) {
		var me = this;
		record.lockBadge()
			.then(function() {
				return record.pushToMozillaBackpack()
					.then(function(successes) {
						console.log('Congratulations, your badge was sent to backpack: ' + record.get('name'));
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
				done: function(){
					me.downloadBadge(record);
					return Promise.resolve();
				},
				done: function() {
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
				done: function(){
					me.exportToBackPack(record);
					return Promise.resolve();
				},
				failed: function() {
					return Promise.reject();
				}
			};

		me.possibleExportActions[action.name] = action;
	},


	buildLockDownloadAction: function(record) {
		var me = this,
			action = {
				name: 'lock_downloadBadge',
				buttonTitle: 'Lock and Download',
				onSubmitClick: function(e){
					e.stopEvent();
					me.downloadBadge(record);
					return Promise.resolve();
				}
			};
		me.possibleExportActions[action.name] = action;
	},


	buildLockMozillaBackpackAction: function(record) {
		var me = this,
			action = {
				name: 'lock_exportToBackPack',
				buttonTitle: 'Lock and Export',
				onSubmitClick: function(e){
					e.stopEvent();
					me.exportToBackPack(record);
					return Promise.resolve();
				}
			};

		me.possibleExportActions[action.name] = action;
	},


	addAllExportActions: function(record) {
		this.possibleExportActions = {};
		this.buildDownloadAction(record);
		this.buildMozillaBackpackAction(record);
		this.buildLockDownloadAction(record);
		this.buildLockMozillaBackpackAction(record);
	},


	askForEmailVerification: function(nextActionName, record, targetEl) {
		if ($AppConfig.userObject.isEmailVerified()) { return; }

		if(!this.possibleExportActions) {
			this.addAllExportActions(record);
		}

		this.emailVerificationWin = Ext.widget('email-verify-window', {
			user: $AppConfig.userObject,
			autoShow: true,
			emailActionOption: this.possibleExportActions[nextActionName]
		});

		this.showWindow(this.emailVerificationWin, targetEl);
	},


	askForEmailLock: function(nextActionName, record, targetEl) {
		if (record.get('Locked')) { return; }

		var u = $AppConfig.userObject,
			emailActionOption, me = this;

		if(!this.possibleExportActions) { this.addAllExportActions(record); }
		emailActionOption = this.possibleExportActions['lock_'+nextActionName];

		this.emailVerificationWin = Ext.widget('email-verify-window', {
			user: u,
			autoShow: true,
			title: 'Associate your badge to your email',
			subTitle: 'This badge is permenantely associated with the following address: ',
			emailActionOption: emailActionOption
		});

		this.emailVerificationWin.onceRendered
			.then(function () {
				me.emailVerificationWin.askForEmailLock(u);
			});

		this.showWindow(this.emailVerificationWin, targetEl);
	},


	showWindow: function(win, targetEl) {
		if (!targetEl) {
			win.show();
			return;
		}

		wait()
			.then(function() {
				win.alignTo(targetEl, 'tl-bl?');
			});
	}
});
