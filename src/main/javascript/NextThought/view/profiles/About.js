Ext.define('NextThought.view.profiles.About', {
	extend: 'Ext.Component',
	alias: 'widget.profile-about',

	//<editor-fold desc="Config">
	requires: [
		'NextThought.view.profiles.ProfileFieldEditor',
		'NextThought.view.account.verification.EmailToken'
	],


	mixins: {
        EditingUser: 'NextThought.view.profiles.mixins.EditUserMixin'
	},

	uriFriendlyName: 'about',
	html: 'about',
	ui: 'profile',
	cls: 'about scrollable',


	placeholderTextTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'placeholder', html: '{0}'}),

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'profile-about editable make-white',
			cn: [
				{
					cls: 'meta',
					cn: [
						{
							cls: 'about field',
							cn: [
								{ cls: 'label', html: '{{{NextThought.view.profiles.About.about}}}' },
								{
									cls: 'content',
									'data-field': 'about',
									'data-rich-text': 'true',
									'data-placeholder': '{{{NextThought.view.profiles.About.write}}}',
									'data-multiline': true
								},
								{ cls: 'error-msg', 'data-prop': 'about'}
							]
						},
						{
							cls: 'fold', cn: [

								{ cls: 'field', cn: [
									{ cls: 'label', cn: { tag: 'span', 'data-field': 'affiliation', 'data-placeholder': '{{{NextThought.view.profiles.About.affiliation}}}' } },
									{ cls: 'error-msg', 'data-prop': 'affiliation' },
									{ cn: { tag: 'span', 'data-field': 'role', 'data-placeholder': '{{{NextThought.view.profiles.About.role}}}' } },
									{ cls: 'error-msg', 'data-prop': 'role'}
								]},

								{ cls: 'field', cn: [
									{ cls: 'label', html: '{{{NextThought.view.profiles.About.location}}}' },
									{ cn: { tag: 'span', 'data-field': 'location', 'data-placeholder': '{{{NextThought.view.profiles.About.location}}}' } },
									{ cls: 'error-msg', 'data-prop': 'location'}
								]},

								{ cls: 'field', cn: [
									{ cls: 'label', html: '{{{NextThought.view.profiles.About.home}}}' },
									{ cn: {tag: 'span', 'data-field': 'home_page', 'data-placeholder': '{{{NextThought.view.profiles.About.home}}}' } },
									{ cls: 'error-msg', 'data-prop': 'home_page'}
								]},

								{ cls: 'field', cn: [
									{ cls: 'label', html: '{{{NextThought.view.profiles.About.email}}}' },
									{ cn: { tag: 'span', 'data-field': 'email', 'data-placeholder': '{{{NextThought.view.profiles.About.email}}}' } },
									{ cls: 'error-msg', 'data-prop': 'email'}
								]}

							]
						},

						{ cls: 'error-msg' }
					]
				}
			]
		}
	]),


	renderSelectors: {
		profileInfoEl: '.profile-about',
		metaEl: '.profile-about .meta',
		homePageEl: '.profile-about .meta [data-field=home_page]'
	},


	emailVerificationTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ cls: 'email-verification', cn: [
			{ tag: 'tpl', 'if': 'isEmailVerified', cn: [
				{ tag: 'span', cls: 'email-verified'}
			]},
			{ tag: 'tpl', 'if': '!isEmailVerified', cn: [
				{ tag: 'span', cls: 'email-not-verified', html: '{{{NextThought.view.profiles.About.VerifyEmail}}}'},
				{ tag: 'span', cls: 'info', html: '', 'data-qtip': '{{{NextThought.view.profiles.About.EmailInfo}}}'}
			]}
		]}
	])),
	//</editor-fold>


	//<editor-fold desc="Init">
	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		//They want to disable profile fields for everyone in some environements.  If the config flag is set hide
		// everything but the safeFields (avatar and name)
		if ($AppConfig.disableProfiles === true) {
			Ext.defer(me.destroy, 1, this);
		}

		this.onSaveMap = {home_page: this.homePageChanged};

		this.on({
			'enable-edit': 'onShowEditing',
			'save-edits': 'onSaveEdits',
			'cancel-edits': 'onCancelEdits',
			beforedeactivate: 'onBeforeDeactivate',
			metaEl: {
				click: 'editMeta',
				keydown: 'onKeyDown'
			}
		});

		this.setUser(this.user);
	},


	onBeforeDeactivate: function() {
		if (this.metaEditor && this.metaEditor.editing) {
			this.metaEditor.cancelEdit();
		}

		if (this.nameEditor && this.nameEditor.editing) {
			this.nameEditor.cancelEdit();
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		var errorEls = this.el.select('.error-msg');

		errorEls.setVisibilityMode(Ext.Element.DISPLAY).hide();
		this.el.selectable();
	},
	//</editor-fold>


	//<editor-fold desc="State Management Stubs">
	getStateData: function() { return this.uriFriendlyName; },


	restore: function(data, finishCallback) {
		Ext.callback(finishCallback, null, [this]);
	},
	//</editor-fold>


	setUser: function(user) {
		var me = this,
			render = this.onceRendered,
			profileSchemaUrl = user.getLink('account.profile');

		function setupAndMask() {
			me.getEl().mask(getString('NextThought.view.profiles.About.loading'));
			if (!profileSchemaUrl) {
				me.profileInfoEl.removeCls('editable');
			}
		}

		function unmask() {
			me.getEl().unmask();
		}

		me.user = user;



		Promise.all([
			render.then(setupAndMask),
			(profileSchemaUrl ?
				   Service.request(profileSchemaUrl).then(JSON.parse) : Promise.resolve(null))
					.then(me.onProfileLoaded.bind(me, user))
					.fail(function(reason) { console.error('Could not get profile schema', reason); })
		]).then(unmask);
	},


	onProfileLoaded: function(user, schema) {
		var me = this, fn = 'editName',
			profileSchema = (schema || {}).ProfileSchema,
			nameInfo = me.getMetaInfoForField(user, 'alias', profileSchema);

		me.userObject = user;
		me.profileSchema = profileSchema;

		//Make more of the UI schema driven

		//If the name is editable it is guarenteed (right now) to be
		//us.  Given that it is also guarenteed that we won't have the add to contacts
		//button. so if its not editable we tag it with a class so we can snug the button
		//up if it exists
		if (!nameInfo.editable && isFeature('request-alias-change') && isMe(user)) {
			fn = Ext.bind(me.fireEvent, me, ['request-alias-change', me]);
		}

		if (nameInfo.editable || Ext.isFunction(fn)) {
			this.on('name-clicked', fn);
		} else {
			console.warn('Name isn`t editable and reguest-alias-change isn`t a feature');
			this.fireEvent('uneditable-name');
		}


		me.updateProfile(user, profileSchema);
	},


	/**
	 * Returns an object with two fields, shouldBeShown and editable that describe how (if at all) the profided profile
	 * field should be shown
	 *
	 * @return {Object}
	 */
	getMetaInfoForField: function(user, field, profileSchema) {
		var r = {}, val = (profileSchema || {})[field];
		r.editable = val && !val.readonly;
		r.shouldBeShown = r.editable || !Ext.isEmpty(user.get(field));
		r.field = field;
		return r;
	},


	updateProfileDetail: function(user, profileSchema) {
		var me = this;

		//Don't do anything if we are disabled in the config
		if ($AppConfig.disableProfiles === true) {
			return;
		}

		function setupMeta(el) {
			var dataFields, field = el.getAttribute('data-field'),
				info = me.getMetaInfoForField(user, field, profileSchema),
				box;

			el = Ext.get(el);

			if (info.shouldBeShown) {
				me.updateField(el, info.field, user.get(info.field));
				el[(info.editable ? 'add' : 'remove') + 'Cls']('editable');
				el.el.dom.setAttribute('data-nonempty', 'true');
				return;
			}

			el.el.dom.setAttribute('data-empty', 'true');
			box = el.parent('.field');
			dataFields = box.query('[data-field]');
			if (dataFields.length > 1) {
				if (dataFields[0].getAttribute('data-empty')) {
					if (dataFields[1].getAttribute('data-empty')) {
						Ext.destroy(el, box);
					}
				}
				return;
			}
			Ext.destroy(el, box);
		}

		function validateAgainstSchema(value) {
			var editor = this.ownerCt,
					field = editor.boundEl.getAttribute('data-field');
			return me.validate(field, value);
		}

		Ext.each(this.el.query('[data-field]'), setupMeta);

		if (this.el.query('.field').length === 0) {
			this.showEmptyState();
		}

		this.metaEditor = Ext.widget({
			xtype: 'profile-field-editor',
			autoSize: { width: 'boundEl' },
			cls: 'meta-editor',
			field: {
				xtype: 'simpletext',
				allowBlank: true,
				validator: validateAgainstSchema,
				silentIsValid: false
			},
			listeners: {
				complete: this.onSaveField,
				canceledit: this.clearError,
				scope: this
			}
		});
		this.on('destroy', 'destroy', this.metaEditor);
		this.markEmailVerificationStatus(user);
	},


	updateProfile: function(user, profileSchema) {
		var me = this;

		if (!me.rendered) {
			me.on('afterrender', me.updateProfile.bind(me, user, profileSchema));
			return;
		}

		function validateAgainstSchema(value) {
			var editor = this.ownerCt,
					field = editor.boundEl.getAttribute('data-field');
			return me.validate(field, value);
		}

		this.nameEditor = Ext.widget({
			xtype: 'profile-field-editor',
			cls: 'name-editor',
			updateEl: true,
			field: {
				xtype: 'simpletext',
				allowBlank: true,
				validator: validateAgainstSchema,
				silentIsValid: false
			},
			listeners: {
				complete: this.onSaveField,
				canceledit: this.clearError,
				scope: this
			}
		});
		this.on('destroy', 'destroy', this.nameEditor);

		this.updateProfileDetail(user, profileSchema);
	},
	//</editor-fold>


	markEmailVerificationStatus: function(user) {
		if (!isFeature('email-verify') || !user || !isMe(user) || !user.get('email')) { return; }

		var targetEl = this.metaEl.down('[data-field=email]'),
			isEmailVerified = user.isEmailVerified();

		// cleanup first
		if (this.emailVerificationEl) {
			this.emailVerificationEl.remove();
			delete this.emailVerificationEl;
		}

		this.emailVerificationEl = Ext.get(this.emailVerificationTpl.append(targetEl.parent(), {'isEmailVerified': isEmailVerified}));
		if (!isEmailVerified) {
			this.mon(this.emailVerificationEl, 'click', 'doEmailVerification', this);
		}
	},


	doEmailVerification: function(e) {
		e.preventDefault();
		if (this.isVerifyingEmail || Ext.fly(e.target).up('.sent')) { return; }
		var me = this,
			buttonEl = me.emailVerificationEl.down('.email-not-verified');

		me.isVerifyingEmail = true;
		$AppConfig.userObject.sendEmailVerification()
			.then(function() {
				me.showVerificationTokenWindow();
				me.emailVerificationEl.addCls('sent');
				me.emailVerificationEl.down('.email-not-verified').setHTML('Verification Email Sent');
				delete me.isVerifyingEmail;
			})
			.fail(function(resp) {
				var e = Ext.decode(resp.responseText);
				if (resp.status === 422) {
					me.showVerificationTokenWindow();
					me.emailVerificationWin.onceRendered.then(me.emailVerificationWin.presentPendingVerification.bind(me.emailVerificationWin, e.seconds));
				}
				delete me.isVerifyingEmail;
			});
	},


	showVerificationTokenWindow: function() {
		var me = this;
		this.emailVerificationWin = Ext.widget('email-token-window', {
			user: me.user,
			autoShow: true
		});

		me.mon(me.emailVerificationWin, 'close', me.markEmailVerificationStatus.bind(me, me.user), me);
		wait()
			.then(function() {
				me.emailVerificationWin.alignTo(me.emailVerificationEl, 'bl-br?');
			});
	},

	//<editor-fold desc="Field Editor">
	editName: function(nameEl) {

		if (!this.nameEditor.isHidden() || this.isHidden() || !this.hasCls('editing')) {
			return;
		}

		nameEl.setAttribute('data-field', 'alias');

		if (this.metaEditor && this.metaEditor.editing) {
			this.metaEditor.cancelEdit();
		}

		if (this.nameEditor.editing) {
			this.nameEditor.cancelEdit();
		}

		this.nameEditor.startEdit(Ext.get(nameEl));
	},


	editMeta: function(e) {
		var target = e.getTarget('[data-field]'),
			placeholder = target && target.querySelector('.placeholder'),
			range, sel = window.getSelection();

		if (target) {
			e.stopPropagation();

			this.clearError(target.getAttribute('data-field'));

			if (placeholder) {
				range = document.createRange();
				range.selectNodeContents(target);
				range.collapse(true);//collapse to the start
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	},
	//</editor-fold>


	//<editor-fold desc="UI Updaters & Handlers">
	onKeyDown: function(e) {
		var target = e.getTarget('[data-field][contenteditable=true]'),
			placeholder = target && target.querySelector('.placeholder');

		if (placeholder && document.activeElement === target) {
			Ext.fly(placeholder).remove();
		}
	},


	showEmptyState: function() {
		this.profileInfoEl.remove();
		this.addCls('empty');
		Ext.DomHelper.append(this.el, {
					cls: 'empty-state', cn: [
						{cls: 'header', html: getString('NextThought.view.profiles.About.emptyheader')},
						{cls: 'sub', html: getString('NextThought.view.profiles.About.emptysub')}
					]
				});
	},


	onShowEditing: function() {
		var fields = this.el.select('.editable[data-field]');

		fields.set({contenteditable: true});
		this.addCls('editing');
	},


	onHideEditing: function() {
		var fields = this.el.select('.editable[data-field]');

		fields.set({contenteditable: false});
		this.clearError();
		this.removeCls('editing');
		this.markEmailVerificationStatus(this.user);
	},


	resetFields: function(fields, values) {
		var me = this;
			user = me.user;

		(fields || []).forEach(function(field) {
			var prop = field.getAttribute('data-field'),
				val = (values && values[prop]) || user.get(prop);

			me.updateField(Ext.get(field), prop, val);
		});
	},


	updateField: function(el, n, v) {
		var placeholderText = this.placeholderTextTpl.apply([el.getAttribute('data-placeholder')]);
		if (this.onSaveMap.hasOwnProperty(n)) {
			Ext.callback(this.onSaveMap[n], this, [v, placeholderText]);
		}
		else if (this['set' + n]) {
			Ext.callback(this['set' + n], this, [v, placeholderText]);
		}
		else {
			el.update(v || placeholderText);
		}

		if (n === 'alias') {
			el.dom.setAttribute('data-qtip', v);
		}
	},


	homePageChanged: function(value, placeholderText) {
		if (!value) {
			this.homePageEl.update(placeholderText);
		}
		else {
			Ext.DomHelper.overwrite(this.homePageEl, {
				tag: 'a',
				cls: 'homePageLink',
				'target': '_blank',
				'href': value,
				html: value
			});
		}
	}
	//</editor-fold>


});
