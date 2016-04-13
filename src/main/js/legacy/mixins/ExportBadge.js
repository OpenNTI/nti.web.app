var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.mixins.ExportBadge', {

	showExportMenu: function (record, itemEl) {
		var me = this;
		if (!this.exportMenu) {
			this.exportMenu = Ext.widget('menu', {
				ownerCmp: this,
				constrainTo: Ext.getBody(),
				defaults: {
					ui: 'nt-menuitem',
					plain: true
				}
			});

			this.exportMenu.add(new Ext.Action({
				text: 'Download Badge',
				handler: me.downloadItemClicked.bind(me, record, itemEl),
				itemId: 'download-badge',
				ui: 'nt-menuitem', plain: true
			}));

			this.exportMenu.add(new Ext.Action({
				text: 'Send to Mozilla BackPack',
				handler: me.exportItemClicked.bind(me, record, itemEl),
				itemId: 'export-backpack',
				ui: 'nt-menuitem', plain: true
			}));
		}

		this.exportMenu.showBy(itemEl, 'tl-bl?', [0, -2]);
		this.PromptActions = NextThought.app.prompt.Actions.create();
	},


	downloadItemClicked: function (record, targetEl, menuItem, e) {
		if (record.get('Locked')) {
			this.downloadBadge(record, targetEl);			
		}
		else {
			if ($AppConfig.userObject.isEmailVerified()) {
				this.askForEmailLock('downloadBadge', record, targetEl);
			}
			else {
				this.askForEmailVerification('downloadBadge', record, targetEl);
			}
		}
	},


	exportItemClicked: function (record, targetEl, menuItem, e) {
		if (record.get('Locked')) {
			this.exportToBackPack(record, targetEl);
		}
		else {
			if ($AppConfig.userObject.isEmailVerified()) {
				this.askForEmailLock('exportToBackPack', record, targetEl);
			}
			else {
				this.askForEmailVerification('exportToBackPack', record, targetEl);
			}
		}
	},


	downloadBadge: function (record, targetEl) {
		var me = this;
		return record.lockBadge()
				.then(function () {
					me.triggerFileDownload(record);
				})
				.catch(function () {
					console.warn('Failed to lock badge...', arguments);
					me.askForEmailVerification('downloadBadge', record, targetEl);
				});
	},


	exportToBackPack: function (record, targetEl) {
		var me = this;

		return record.lockBadge()
				.then(function () {
					return record.pushToMozillaBackpack()
						.then(function (successes) {
							console.log('Congratulations, your badge was sent to backpack: ' + successes);
						})
						.catch(function (errors) {
							Ext.each(errors, function (err) {
								console.warn('Failed Assertion: ' + err.assertion + ' Reason: ' + err.reason);
							});
						});
				})
				.catch(function () {
					me.askForEmailVerification('exportToBackPack', record, targetEl);
				});
	},


	askForEmailVerification: function (nextActionName, record, targetEl) {
		if ($AppConfig.userObject.isEmailVerified()) { return; }

		var action;
		if (!this.possibleExportActions) {
			this.addAllExportActions(record);
		}

		action = this.possibleExportActions[nextActionName] || {};

		this.emailVerificationPrompt = this.PromptActions.prompt('badge-exporting', {
			user: $AppConfig.userObject,
			badge: record,
			title: 'Email Verification',
			subTitle: 'Verifying your email allows you to export your completion badge',
			saveText: action.buttonTitle
		}).then(function (rec) {
				if (action && action.onSubmit) {
					action.onSubmit();
				}
			});
	},


	askForEmailLock: function (nextActionName, record, targetEl) {
		if (record.get('Locked')) { return; }

		var u = $AppConfig.userObject,
			emailActionOption, 
			me = this,
			action;

		if (!this.possibleExportActions) {
			this.addAllExportActions(record);
		}

		action = this.possibleExportActions['lock_' + nextActionName] || {};

		this.emailVerificationPrompt = this.PromptActions.prompt('badge-exporting', {
			user: u,
			badge: record,
			title: getString('NextThought.mixins.ExportBadge.LockEmail.Title'),
			subTitle: getString('NextThought.mixins.ExportBadge.LockEmail.SubTitle'),
			saveText: action.buttonTitle
		})
			.then(function () {
				if (action && action.onSubmit) {
					action.onSubmit();
				}
			});
	},


	triggerFileDownload: function (record) {
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

		// cleanup
		Ext.fly(dom).remove();
	},


	presentError: function (title, message) {
		Ext.MessageBox.alert({
			msg: message,
			buttons: Ext.MessageBox.OK,
			scope: this,
			buttonText: {'ok': 'Close'},
			title: title
		});
	},


	buildDownloadAction: function (record) {
		var me = this,
			action = {
				name: 'downloadBadge',
				buttonTitle: 'Verify and Download',
				onSubmit: function () {
					return me.downloadBadge(record);
				}
			};

		me.possibleExportActions[action.name] = action;
	},


	buildMozillaBackpackAction: function (record) {
		var me = this,
			action = {
				name: 'exportToBackPack',
				buttonTitle: 'Verify and Export',
				onSubmit: function () {
					return me.exportToBackPack(record);
				}
			};

		me.possibleExportActions[action.name] = action;
	},


	buildLockDownloadAction: function (record) {
		var me = this,
			action = {
				name: 'lock_downloadBadge',
				buttonTitle: 'Lock and Download',
				onSubmit: function () {
					return me.downloadBadge(record);
				}
			};
		me.possibleExportActions[action.name] = action;
	},


	buildLockMozillaBackpackAction: function (record) {
		var me = this,
			action = {
				name: 'lock_exportToBackPack',
				buttonTitle: 'Lock and Export',
				onSubmit: function () {
					return me.exportToBackPack(record);
				}
			};

		me.possibleExportActions[action.name] = action;
	},


	addAllExportActions: function (record) {
		this.possibleExportActions = {};
		this.buildDownloadAction(record);
		this.buildMozillaBackpackAction(record);
		this.buildLockDownloadAction(record);
		this.buildLockMozillaBackpackAction(record);
	}
});
