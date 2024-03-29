const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const DomUtils = require('internal/legacy/util/Dom');
const Globals = require('internal/legacy/util/Globals');
const { getString } = require('internal/legacy/util/Localization');

const EmailActions = require('./Actions');

require('internal/legacy/editor/Editor');
require('internal/legacy/model/Email');
require('./Actions');
require('./EmailTokenField');

module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.components.admin.email.Editor',
	{
		extend: 'NextThought.editor.Editor',
		alias: 'widget.course-email-editor',
		enableTitle: true,
		enableObjectControls: false,
		enableTextControls: false,

		DEFAULT_SCOPES: ['All', 'ForCredit', 'Open'],

		RECEIVER_MAP: {
			All: 'All Students',
			Open: 'Open Students',
			Public: 'Open Students',
			ForCredit: 'Enrolled Students',
			ForCreditDegree: 'For Credit (degree)',
			ForCreditNonDegree: 'For Credit (non-degree)',
			Purchased: 'Purchased',
		},

		REPLY_DEFAULTS: {
			ForCredit: 'ForCredit',
			All: 'ForCredit',
			Open: 'NoReply',
		},

		toolbarTpl: Ext.DomHelper.markup([
			{
				cls: 'aux',
				cn: [
					{
						cls: 'row receiver',
						cn: [
							{ cls: 'label', html: 'To' },
							{ cls: 'field' },
							{
								cls: 'action',
								cn: [
									{
										cls: 'reply-option option',
										cn: [
											{
												tag: 'span',
												cls: 'toggle',
												cn: [
													{
														tag: 'input',
														type: 'checkbox',
														id: 'reply-check-toggle',
														cls: 'reply-check',
													},
													{
														tag: 'label',
														for: 'reply-check-toggle',
														html: 'Allow Replies',
													},
												],
											},
											{
												tag: 'span',
												cls: 'reply-scope link arrow',
												html: '',
											},
										],
									},
								],
							},
						],
					},
				],
			},
		]),

		footerControlsTpl: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{
					tag: 'span',
					cls: 'toggle',
					cn: [
						{
							tag: 'input',
							type: 'checkbox',
							id: 'email-copy-toggle',
							cls: 'email-copy',
						},
						{
							tag: 'label',
							for: 'email-copy-toggle',
							html: 'Send me a copy of the email',
						},
					],
				},
				{
					tag: 'span',
					cls: 'toggle',
					cn: [
						{
							tag: 'input',
							type: 'checkbox',
							id: 'cc-instructors-toggle',
							cls: 'cc-instructors-check',
						},
						{
							tag: 'label',
							for: 'cc-instructors-toggle',
							html: 'Copy All Instructors',
						},
					],
				},
			])
		),

		headerTplOrder: '{toolbar}{title}',
		cls: 'email-editor scrollable',
		renderTpl: Ext.DomHelper.markup({
			cls: 'editor active',
			html: '{super}',
		}),

		renderSelectors: {
			titleEl: '.title',
			footerEl: '.footer',
			receiverEl: '.row.receiver .field',
			replyOptionEl: '.reply-option',
			replyScopeEl: '.reply-option .reply-scope',
			replyCheckBoxEl: '.reply-option .reply-check',
		},

		initComponent: function () {
			this.callParent(arguments);
			this.isIndividualEmail = !!(
				this.record && this.record.get('Receiver')
			);
		},

		afterRender: function () {
			this.callParent(arguments);
			var me = this;

			Ext.EventManager.onWindowResize(this.syncHeight, this);
			this.on('destroy', function () {
				Ext.EventManager.removeResizeListener(me.syncHeight, me);
			});

			wait(500).then(this.syncHeight.bind(this)); //let the animation finish

			this.EmailActions = EmailActions.create();
			this.replyScopeEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			this.setReceiverField();
			this.setupTitleField();
			this.setReplyToField();
			this.setupFooterControls();

			this.saveButtonEl.setHTML(' Send Email');
			this.mon(
				this.replyScopeEl,
				'click',
				this.replyPickerClicked.bind(this)
			);
			this.mon(
				this.replyCheckBoxEl,
				'click',
				this.replyCheckboxClicked.bind(this)
			);

			if (!this.hasScopeChoices()) {
				this.replyScopeEl.removeCls('arrow');
			}
		},

		setupTitleField: function () {
			if (!this.titleEl) {
				return;
			}

			this.titleEl.dom.setAttribute('placeholder', 'Subject');
		},

		setupFooterControls: function () {
			var left = this.footerEl.down('.left');
			if (left) {
				this.footerControlsTpl.append(left);

				const copyCheckboxEl = this.footerEl.down('.email-copy');
				const copyInstructorsEl = this.footerEl.down(
					'.cc-instructors-check'
				);

				if (copyCheckboxEl) {
					// On by default for Group emails.
					copyCheckboxEl.dom.checked = !this.isIndividualEmail;
					this.mon(
						copyCheckboxEl,
						'click',
						this.emailCopyClicked.bind(this)
					);
					if (this.record) {
						this.record.set('Copy', !this.isIndividualEmail);
					}
				}
				if (copyInstructorsEl) {
					this.mon(
						copyInstructorsEl,
						'click',
						this.copyInstructorsClicked.bind(this)
					);
				}
			}
		},

		emailCopyClicked: function (e) {
			var i = e.target;
			if (this.record) {
				this.record.set('Copy', i.checked);
			}
		},

		copyInstructorsClicked(e) {
			const i = e.target;
			if (this.record) {
				this.record.set('includeInstructors', i.checked);
			}
		},

		setReceiverField: function () {
			var scope,
				to = this.record && this.record.get('Receiver');

			if (this.isIndividualEmail) {
				this.receiverEl.setHTML(to);
			} else {
				scope = this.record && this.record.get('scope');
				this.receiverEl.setHTML(this.RECEIVER_MAP[scope] || scope);
				this.receiverEl.addCls('group');
				this.receiverEl.addCls('link');
				this.hasScopeChoices() && this.receiverEl.addCls('arrow'); // omit arrow if it's not a select

				this.currentScope = scope;
				this.createReceiverScopePicker();
			}
		},

		getScopes() {
			return (
				(this.record && this.record.get('scopes')) ||
				this.DEFAULT_SCOPES
			);
		},

		hasScopeChoices() {
			return this.getScopes().length > 1;
		},

		createReceiverScopePicker: function () {
			const scopes = this.getScopes();

			if (scopes.length < 2) {
				return;
			}

			var me = this,
				menu = Ext.widget('menu', {
					defaults: {
						ui: 'nt-menuitem',
						xtype: 'menucheckitem',
						plain: true,
						group: 'receiver-scope',
						handler: function (item) {
							me.receiverScopeChanged(item, item.up('.menu'));
						},
					},
					width: 220,
					items: scopes.map(studentFilter => ({
						text: me.RECEIVER_MAP[studentFilter] || studentFilter,
						studentFilter,
						isLabel: true,
						checked: me.currentScope === studentFilter,
					})),
				});

			this.on('destroy', menu.destroy.bind(menu));
			this.mon(
				this.receiverEl,
				'click',
				this.showReceiverScopePicker.bind(this)
			);
			this.receiverScopeMenu = menu;
		},

		showReceiverScopePicker: function () {
			if (!this.receiverScopeMenu) {
				return;
			}

			if (!this.receiverScopeMenu.isVisible()) {
				this.receiverScopeMenu.showBy(this.receiverEl, 'tl-bl?');
			} else {
				this.receiverScopeMenu.hide();
			}
		},

		receiverScopeChanged: function (item, menu) {
			this.receiverEl.setHTML(item && item.text);
			if (this.record) {
				this.record.set('scope', item && item.studentFilter);
				this.currentScope = this.record.get('scope');
				this.filterReplyOptions();
			}
		},

		updateScope: function (record) {
			var scope = record && record.raw && record.raw.studentFilter;

			if (scope) {
				this.record.set('scope', scope);
			}
		},

		syncHeight: function () {
			var el = this.contentEl,
				container =
					this.ownerCt && this.ownerCt.el && this.ownerCt.el.dom,
				containerRect = container && container.getBoundingClientRect(),
				otherPartsHeight = 0,
				top,
				height,
				min = 300;

			if (!el) {
				return;
			}

			if (!containerRect) {
				el.setHeight(min);
			}

			top = Math.max((containerRect && containerRect.top) || 0, 0);

			otherPartsHeight +=
				(this.titleEl && this.titleEl.getHeight()) || 50;
			// otherPartsHeight += this.tagsEl.getHeight();
			// otherPartsHeight += this.sharedListEl.getHeight();
			otherPartsHeight +=
				(this.footerEl && this.footerEl.getHeight()) || 0;
			otherPartsHeight +=
				(this.receiverEl && this.receiverEl.getHeight()) || 0;

			height =
				Ext.Element.getViewportHeight() -
				(top + otherPartsHeight + 90 + 10); //top of window + height of other parts + height of header + padding

			el.setHeight(Math.max(min, height));

			wait(700).then(this.updateLayout.bind(this));
		},

		setReplyToField: function () {
			var scope;

			this.noReplyPicker = this.createNoReplyMenu();

			if (this.isIndividualEmail) {
				this.replyCheckBoxEl.dom.checked = true;
			} else {
				this.updateReplyScope();

				scope = this.record && this.record.get('scope');
				if (scope === 'ForCredit') {
					this.replyCheckBoxEl.dom.checked = true;
				}
			}

			// Set the right options.
			this.filterReplyOptions();
		},

		updateReplyScope: function () {
			var selected =
				this.noReplyPicker && this.noReplyPicker.down('[checked]');
			if (selected) {
				this.record.set('replyScope', selected.scope);
			}
		},

		replyPickerClicked: function (e) {
			var target = Ext.get(e.getTarget());

			if (this.replyScopeEl.hasCls('disabled')) {
				return;
			}

			target = target.up('.reply-option') || target;
			if (!this.noReplyPicker) {
				this.noReplyPicker = this.createNoReplyMenu();
			}

			if (this.noReplyPicker.isVisible()) {
				this.noReplyPicker.hide();
			} else {
				this.noReplyPicker.showBy(target, 'tr-br?', [0, -10]);
			}
		},

		replyCheckboxClicked: function (e) {
			var i = e.target,
				action = i.checked ? 'removeCls' : 'addCls';
			if (this.record) {
				this.record.set('NoReply', !i.checked);
			}

			if (i.checked) {
				this.updateReplyScope();
			}

			this.replyScopeEl[action]('disabled');
		},

		createNoReplyMenu: function () {
			var me = this,
				menu,
				initialScope =
					(this.record && this.record.get('scope')) || 'All',
				scopes =
					(this.record && this.record.get('scopes')) ||
					this.DEFAULT_SCOPES,
				defaults = this.REPLY_DEFAULTS;

			if (this.isIndividualEmail) {
				return;
			}

			menu = Ext.widget('menu', {
				defaults: {
					ui: 'nt-menuitem',
					xtype: 'menucheckitem',
					plain: true,
					group: 'no-reply',
					handler: function (item) {
						me.handleNoReplyMenuClick(item, item.up('.menu'));
					},
				},
				width: 200,
				items: scopes.map(scope => ({
					text: me.RECEIVER_MAP[scope] || scope,
					scope,
					checked: defaults[initialScope] === scope,
					NoReply: false,
				})),
			});

			this.on('destroy', menu.destroy.bind(menu));
			return menu;
		},

		filterReplyOptions: function () {
			var menu = this.noReplyPicker,
				me = this,
				selectedItem;

			if (this.currentScope === 'All') {
				menu.items.each(function (item) {
					if (item.scope === me.REPLY_DEFAULTS[me.currentScope]) {
						item.setChecked(true);
						selectedItem = item;
					}
				});

				if (selectedItem && selectedItem.text) {
					this.replyScopeEl.setHTML('from ' + selectedItem.text);
				}

				this.replyOptionEl.addCls('picker');
				this.replyScopeEl.show();
			} else {
				this.replyOptionEl.removeCls('picker');
				this.replyScopeEl.hide();
			}

			if (!this.replyCheckBoxEl.dom.checked) {
				this.replyScopeEl.addCls('disabled');
			}
		},

		/**
		 * Handle the reply-picker selection.
		 *
		 * Note: If a user chooses to allow reply, make sure we set both the reply option
		 * as well as the intended scope (Open, ForCredit...).
		 * When the no-reply is set to true, it will override everyhing else.
		 *
		 * @param  {Ext.MenuItem} item [description]
		 * @param  {Ext.Menu} menu [description]
		 * @returns {void}
		 */
		handleNoReplyMenuClick: function (item, menu) {
			this.record.set('NoReply', item.NoReply);
			this.record.set('replyScope', item.scope);
			if (this.replyScopeEl) {
				this.replyScopeEl.setHTML('from ' + item.text);
			}
		},

		getValue: function () {
			return {
				body: this.getBody(this.getBodyValue()),
				NoReply: this.record && this.record.get('NoReply'),
				title: this.titleEl ? this.titleEl.getValue() : undefined,
			};
		},

		onSave: function (e) {
			e.stopEvent();
			var me = this,
				v = this.getValue(),
				trimEndRe = /((<p><br><\/?p>)|(<br\/?>))*$/g,
				l,
				isAllowReply =
					this.replyCheckBoxEl && this.replyCheckBoxEl.dom.checked;

			if (DomUtils.isEmpty(v.body)) {
				me.markError(
					me.editorBodyEl,
					getString(
						'NextThought.view.profiles.parts.BlogEditor.emptybody'
					)
				);
				return;
			}

			l = v.body.length;
			if (l > 0 && v.body[l - 1].replace) {
				v.body[l - 1] = v.body[l - 1].replace(trimEndRe, '');
			}

			if (/^[^a-z0-9]+$/i.test(v.title)) {
				me.markError(
					me.titleWrapEl,
					getString(
						'NextThought.view.profiles.parts.BlogEditor.specialtitle'
					)
				);
				me.titleWrapEl.addCls('error-on-bottom');
				return;
			}

			if (/^@{1,}/.test(v.title)) {
				console.error('Title cant start with @');
				me.markError(
					me.titleWrapEl,
					getString(
						'NextThought.view.profiles.parts.BlogEditor.attitle'
					)
				);
				me.titleWrapEl.addCls('error-on-bottom');
				return;
			}

			if (me.el) {
				me.el.mask('Saving...');
			}

			// NOTE: for now the server expects the email's body to be plainText, treat it as such
			v.body = v.body.join('');

			if (this.record) {
				this.record.set({
					Body: v.body,
					Subject: v.title,
					NoReply: !isAllowReply,
				});

				this.EmailActions.sendEmail(this.record)
					.then(function () {
						me.emailSent = true;
						me.presentSuccessMessage();
						me.fireEvent('after-save');
					})
					.catch(function (err) {
						console.error(Globals.getError(err));
						if (me.el) {
							me.el.unmask();
						}

						alert({
							title: 'Error',
							msg: 'There was an error sending your email. Please try again later.',
						});

						Ext.Error.raise(
							'Error Sending Email: ' + Globals.getError(err)
						);
					});
			}
		},

		allowNavigation: function () {
			var msg =
				'You are currently creating an email. Would you like to leave without sending it?';

			if (this.emailSent) {
				return Promise.resolve();
			}

			return new Promise(function (fulfill, reject) {
				Ext.Msg.show({
					title: 'Attention!',
					msg: msg,
					buttons: {
						primary: {
							text: 'Leave',
							cls: 'caution',
							handler: fulfill,
						},
						secondary: {
							text: 'Stay',
							handler: reject,
						},
					},
				});
			});
		},

		presentSuccessMessage: function () {
			alert({
				icon: 'success',
				title: 'Email Sent',
				msg: 'Your message has been sent.',
			});
		},

		onCancel: function (e) {
			e.stopEvent();
			this.emailSent = true;
			this.fireEvent('cancel');
		},
	}
);
