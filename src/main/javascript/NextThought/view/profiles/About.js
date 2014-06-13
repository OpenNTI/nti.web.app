Ext.define('NextThought.view.profiles.About', {
	extend: 'Ext.Component',
	alias: 'widget.profile-about',

	//<editor-fold desc="Config">
	requires: [
		'NextThought.view.profiles.ProfileFieldEditor'
	],

	uriFriendlyName: 'about',
	html: 'about',
	ui: 'profile',
	cls: 'about',


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
								{ cls: 'content', 'data-field': 'about', 'data-placeholder': '{{{NextThought.view.profiles.About.write}}}', 'data-multiline': true }
							]
						},
						{
							cls: 'fold', cn: [

								{ cls: 'field', cn: [
									{ cls: 'label', cn: { tag: 'span', 'data-field': 'affiliation', 'data-placeholder': '{{{NextThought.view.profiles.About.affiliation}}}' } },
									{ cn: { tag: 'span', 'data-field': 'role', 'data-placeholder': '{{{NextThought.view.profiles.About.role}}}' } }
								]},

								{ cls: 'field', cn: [
									{ cls: 'label', html: '{{{NextThought.view.profiles.About.location}}}' },
									{ cn: { tag: 'span', 'data-field': 'location', 'data-placeholder': '{{{NextThought.view.profiles.About.location}}}' } }
								]},

								{ cls: 'field', cn: [
									{ cls: 'label', html: '{{{NextThought.view.profiles.About.home}}}' },
									{ cn: {tag: 'span', 'data-field': 'home_page', 'data-placeholder': '{{{NextThought.view.profiles.About.home}}}' } }
								]},

								{ cls: 'field', cn: [
									{ cls: 'label', html: '{{{NextThought.view.profiles.About.email}}}' },
									{ cn: { tag: 'span', 'data-field': 'email', 'data-placeholder': '{{{NextThought.view.profiles.About.email}}}' } }
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
		homePageEl: '.profile-about .meta [data-field=home_page]',
		errorMsgEl: '.error-msg'
	},

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
			'disable-edit': 'onHideEditing',
			beforedeactivate: 'onBeforeDeactivate',
			metaEl: { click: 'editMeta' }
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
		this.errorMsgEl.setVisibilityMode(Ext.Element.DISPLAY).hide();
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
				   Service.request(profileSchemaUrl).then(JSON.decode) : Promise.resolve(null))
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


	validate: function(field, value) {
		var rules = (this.profileSchema || {})[field], numColons;
		if (!field || !rules) {
			console.warn('No rules or field. Treating as valid', field, value, this.profileSchema);
		}

		rules = rules || {};

		//treat empty string as null
		if (Ext.isEmpty(value)) {
			value = null;
		}

		//TODO encapsulate all these validations rules in some kind of profile model
		//this will let us share it and test it...

		if (rules.required === true && (value === null || value === undefined)) {
			this.showError('Required.');
			return false;
		}

		if (!value) {
			return true;
		}

		if (rules.base_type === 'string') {
			//for strings we expect a min and a max length and if they exist our string must fit in
			//those bounds
			if (value.length < (rules.min_length || 0)) {
				this.showError(getFormattedString('NextThought.view.profiles.About.short', {
					number: rules.min_length || 0
				}));
				return false;
			}

			if (value.length > (rules.max_length || Infinity)) {
				this.showError(getFormattedString('NextThought.view.profiles.About.long', {
					number: rules.max_length || 0
				}));
				return false;
			}

			if (rules.type === 'URI') {
				//We use some basic URI validation here, similar to what the ds
				//does as of r15860.  Note the ds will add http if there is no
				//scheme.  However if we detect what looks like a scheme we
				//require it to start with http[s]
				numColons = (value.match(/:/g) || []).length;
				if (numColons > 1) {
					this.showError(getString('NextThought.view.profiles.About.invalid'));
					return false;
				}
				if (numColons === 1 && value.indexOf('http:') !== 0 && value.indexOf('https:') !== 0) {
					this.showError(getString('NextThought.view.profiles.About.invalid'));
					return false;
				}
				return true;
			}
		}

		return true;
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
		var t = e.getTarget('[data-field]', null, true),
			field = t && Ext.fly(t).getAttribute('data-field'),
			value = (field && this.userObject.get(field)) || '',
			ed = this.metaEditor;

		if (!t || this.savingField || !this.hasCls('editing')) {//e.getTarget('a[href]') (the link will work as normal while we are not in edit mode)
			return;
		}

		e.stopEvent();//prevent link from working in edit mode

		if (this.nameEditor.editing) {
			this.nameEditor.cancelEdit();
		}

		if (ed.editing) {
			ed.cancelEdit();
		}

		ed.startEdit(t, value);
	},


	onSaveField: function(cmp, newValue, oldValue) {
		var field = cmp.boundEl.getAttribute('data-field'),
			user = this.userObject,
			me = this;

		if (!isMe(user)) {
			console.warn('Attempting to edit another user\'s record');
			return;
		}

		//treat empty string as null
		if (Ext.isEmpty(newValue)) {
			newValue = null;
		}

		me.clearError();

		function success(n, v) {
			console.log(arguments);
			me.updateField(cmp.boundEl, n, v);
			delete me.savingField;
		}

		function failure(rsp) {
			var resultJson = {};
			if (/application\/json/.test(rsp.getResponseHeader('Content-Type') || '')) {
				resultJson = Ext.JSON.decode(rsp.responseText, true);
			}
			//alert('Could not save your '+field);
			console.error(arguments);
			//Note we start editing against the oldValue here
			//and then set the value to newValue so that the logic
			//to detect if a value actually changed remains the same regardless of whether
			//you are saving after a failure.
			cmp.startEdit(cmp.boundEl, oldValue);
			cmp.setValue(newValue);
			cmp.field.setError();
			me.showError(resultJson.message || getString('NextThought.view.profiles.About.unknown'));
			delete me.savingField;
		}

		console.debug('saving:', field, '=', newValue, 'in', user);
		//TODO: Check the schema
		me.savingField = true;
		user.saveField(field, newValue, success, failure);
	},
	//</editor-fold>


	//<editor-fold desc="UI Updaters & Handlers">
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
		this.addCls('editing');
		console.debug('show edit', arguments);
	},


	onHideEditing: function() {
		this.removeCls('editing');
		if (this.metaEditor && this.metaEditor.editing) {
			this.metaEditor.cancelEdit();
		}

		if (this.nameEditor && this.nameEditor.editing) {
			this.nameEditor.cancelEdit();
		}
		console.debug('hide edit', arguments);
	},


	showError: function(text) {
		this.errorMsgEl.update(text);
		this.errorMsgEl.show();
	},


	clearError: function() {
		this.errorMsgEl.hide();
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
