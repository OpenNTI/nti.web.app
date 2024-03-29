const { getService } = require('@nti/web-client');
const Ext = require('@nti/extjs');
const PromptActions = require('internal/legacy/app/prompt/Actions');
const Globals = require('internal/legacy/util/Globals');
const lazy = require('internal/legacy/util/lazy-require').get(
	'LibraryActions',
	() => require('internal/legacy/app/library/Actions')
);
const UserPasswordSet = require('internal/legacy/model/UserPasswordSet');

require('internal/legacy/common/Actions');
require('internal/legacy/common/ux/WelcomeGuide');
require('internal/legacy/common/ux/IframeConfirmWindow');
require('internal/legacy/common/ux/UpdatedTos');
require('internal/legacy/common/ux/IframeWindow');

require('./contact/Window');
require('./coppa/Window');
require('./coppa/upgraded/Window');
require('./profile_update/Window');
require('./recovery/Window');
require('./registration/Prompt');

module.exports = exports = Ext.define('NextThought.app.account.Actions', {
	extend: 'NextThought.common.Actions',

	constructor() {
		this.callParent(arguments);
	},

	maybeShowCoppaWindow() {
		var user = $AppConfig.userObject,
			showWindow = user.getLink('account.profile.needs.updated'),
			url = user.getLink('account.profile'),
			req;

		if (!showWindow) {
			return;
		}

		req = {
			url: Globals.getURL(url),
			timeout: 20000,
			scope: this,
			callback(q, success, r) {
				if (!success) {
					console.log(
						'Could not get acct rel schema for coppa window. Window will not show'
					);
					return;
				}

				try {
					var o = Ext.decode(r.responseText);
					Ext.widget('coppa-window', {
						schema: o.ProfileSchema,
						handleSubmit: this.submitCoppaInfo.bind(this),
					}).show();
				} catch (e) {
					console.error(Globals.getError(e));
				}
			},
		};

		Ext.Ajax.request(req);
		console.log('get data from ' + url + ' and show coppa window...');
	},

	showEmailRecoveryWindow(fieldName, linkName) {
		Ext.widget('recovery-email-window', {
			fieldName: fieldName,
			linkName: linkName,
			handleSubmit: this.fixEmail.bind(this),
		}).show();
	},

	showCoppaConfirmWindow() {
		var link = $AppConfig.userObject.getLink('coppa.upgraded.rollbacked');

		Ext.widget('coppa-confirm-window', {
			link: link,
			deleteOnDestroy: true,
		}).show();
	},

	showWelcomePage(link) {
		Ext.widget('welcome-guide', {
			link: link,
			deleteOnDestroy: true,
		}).show();
	},

	showResearchAgreement() {
		var user = $AppConfig.userObject,
			html = user.getLink('irb_html'),
			// pdf = user.getLink('irb_pdf'),
			post = user.getLink('SetUserResearch');

		function sendRequest(agreed) {
			if (!post) {
				return Promise.reject('No link to post to');
			}

			return Service.post(post, {
				allow_research: agreed,
			});
		}

		Ext.widget('iframe-confirm-window', {
			link: html,
			title: 'Research Agreement',
			confirmText: 'Consent',
			denyText: 'Do Not Consent',
			confirmAction: sendRequest.bind(null, true),
			denyAction: sendRequest.bind(null, true),
		}).show();
	},

	showNewTermsOfService(link) {
		Ext.widget('updated-tos', { link: link, deleteOnDestroy: true }).show();
	},

	__createWindow(link, title) {
		var win = Ext.widget('nti-window', {
			title: title,
			closeAction: 'destroy',
			width: 695,
			height: 600,
			layout: 'none',
			modal: true,
			items: {
				xtype: 'component',
				autoEl: {
					tag: 'iframe',
					src: link,
					frameBorder: 0,
					marginWidth: 0,
					marginHeight: 0,
					seamless: true,
					transparent: true,
					allowTransparency: true,
					style: 'overflow-x: hidden; overflow-y:auto; height: calc(600px - 35px); width: 100%;',
				},
			},
		});

		if (Ext.is.iPad) {
			win.on('afterrender', function () {
				var iframe = this.el.down('.x-fit-item');
				iframe
					.parent()
					.el.setStyle('-webkit-overflow-scrolling', 'touch');
				iframe.parent().el.setStyle('overflow', 'auto');
			});
		}

		return win;
	},

	showTermsOfService(link) {
		this.__createWindow(link, 'Terms of Service').show();
	},

	showChildrensPrivacy(link) {
		this.__createWindow(link, "Children's Privacy").show();
	},

	showPrivacy(link) {
		this.__createWindow(link, 'Privacy').show();
	},

	showHref(href, target) {
		window.open(href, target);
	},

	showUserProfileUpdate(user) {
		Ext.widget('profile-update-window', {
			user,
		}).show();
	},

	submitCoppaInfo(values) {
		var linkToDelete = $AppConfig.userObject.getLink(
				'account.profile.needs.updated'
			),
			key;

		if (!values.firstname) {
			return Promise.reject({
				field: 'firstname',
				message: 'First Name is required',
			});
		}

		if (!values.lastname) {
			return Promise.reject({
				field: 'lastname',
				message: 'Last Name is required',
			});
		}

		delete values.firstname;
		delete values.lastname;

		for (key in values) {
			if (values.hasOwnPropery(key) && values[key] !== null) {
				$AppConfig.userObject.set(key, values[key]);
			}
		}

		return new Promise(function (fulfill, reject) {
			$AppConfig.userObject.save({
				callback(req, success, resp) {
					if (!success) {
						reject(Ext.decode(resp.responseText));
					} else {
						//we need to delete the link now.
						Ext.Ajax.request({
							url: Globals.getURL(linkToDelete),
							timeout: 20000,
							method: 'DELETE',
							callback(q, success2) {
								if (!success2) {
									console.log(
										'Could not delete the needs.updated link'
									);
									return;
								}
							},
						});

						fulfill();
					}
				},
			});
		});
	},

	fixEmail(values) {
		var linkToDelete = $AppConfig.userObject.getLink(values.linkName),
			email = values.email,
			fieldName = values.fieldName,
			optionalLinkName;

		if (values.linkName === 'contact-email-sends-consent-request') {
			linkToDelete = null;
			optionalLinkName = values.linkName;
		}

		if (fieldName && email) {
			return new Promise(function (fulfill, reject) {
				$AppConfig.userObject.saveField(
					fieldName,
					email,
					function () {
						if (linkToDelete) {
							//we need to delete the link now
							Ext.Ajax.request({
								url: Globals.getURL(linkToDelete),
								timeout: 20000,
								scope: this,
								method: 'DELETE',
								callback(q, success) {
									if (!success) {
										console.log(
											'Could not delete the needs.update link'
										);
										return;
									}
								},
							});
						}

						fulfill();
					},
					function (resp) {
						reject(Ext.decode(resp.responseText));
					},
					optionalLinkName
				);
			});
		}
	},

	async showContactUs() {
		const service = await getService();
		const { internalSupport, supportContact } = service.getSupportLinks();

		if (supportContact && !internalSupport) {
			Globals.sendEmailTo(supportContact, 'Support Request');
			return;
		}

		Ext.widget('contact-us-window', {
			handleSubmit: this.submitContactForm.bind(this),
		}).show();
	},

	requestAliasChange() {
		Ext.widget('contact-us-window', {
			role: 'alias',
			titleKey: 'alias_request_title',
			detailKey: 'alias_request_message',
			handleSubmit: this.submitContactForm.bind(this),
		}).show();
	},

	__contactUsBodyForMessage(data) {
		var body = data.email || '[NO EMAIL SUPPLIED]';

		body += ' wrote: ' + data.message;
		return body;
	},

	__aliasBodyForMessage(data) {
		var body = data.email || '[NO EMAIL SUPPLIED]';

		body +=
			' has requested an alias change for account ' + $AppConfig.username;
		body += '. message: ' + data.message;

		return body;
	},

	submitContactForm(values, role) {
		var feedbackLink = $AppConfig.userObject.getLink('send-feedback'),
			url = Globals.getURL(feedbackLink),
			body,
			bodyFormatters = {
				contact: this.__contactUsBodyForMessage,
				alias: this.__aliasBodyForMessage,
			};

		if (!values.message) {
			return Promise.reject({
				field: 'message',
				message: 'Message cannot be empty.',
			});
		}

		if (!feedbackLink) {
			console.error('No where to send feedback to');
			return Promise.reject({
				field: '',
				message: 'Unable to send feedback at this time.',
			});
		}

		if (bodyFormatters[role]) {
			body = bodyFormatters[role](values);
		} else {
			console.error('Unknown role for contact window');
			return Promise.reject({
				field: '',
				message: 'Unable to send feedback at this time',
			});
		}

		if (!Globals.isEmail(values.email)) {
			return Promise.reject({
				field: 'email',
				message: 'You must enter a valid email address.',
			});
		}

		return new Promise(function (fulfill, reject) {
			Ext.Ajax.request({
				url: url,
				jsonData: Ext.encode({ body: body }),
				method: 'POST',
				headers: {
					Accept: 'application/json',
				},
				callback(q, success, r) {
					if (!success) {
						reject(Ext.decode(r.responseText));
					} else {
						fulfill();
					}
				},
			});
		});
	},

	changePassword(values) {
		var u = UserPasswordSet.fromUser($AppConfig.userObject);

		return new Promise(function (fulfill, reject) {
			u.set(values);
			u.save({
				callback(req, success, resp) {
					if (!success) {
						reject(
							Ext.decode(resp.responseText, true) ||
								'There was an error setting your password.'
						);
					} else {
						fulfill();
					}
				},
			});
		});
	},

	showRegistrationForm(link) {
		let PromptActionsInst = PromptActions.create();
		let LibraryActions = lazy.LibraryActions.create();

		PromptActionsInst.prompt('account-registration', { link: link }).then(
			() => {
				LibraryActions.reload();
			}
		);
	},
});
