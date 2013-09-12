Ext.define('NextThought.view.profiles.About',{
	extend: 'Ext.Component',
	alias: 'widget.profile-about',

	//<editor-fold desc="Config">
	requires: [
		'NextThought.view.account.contacts.management.Popout'
	],

	mixins: {
		enableChat: 'NextThought.mixins.ChatLinks'
	},

	uriFriendlyName: 'about',
	html: 'about',
	ui: 'profile',


	placeholderTextTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'placeholder', html: '{0}'}),

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'profile-about editable make-white',
			cn:  [
				{
					cls: 'meta',
					cn:  [
						{
							cls: 'name-container',
							cn: [
								{ tag: 'span', cls: 'name', 'data-field': 'alias' },
								{ cls: 'add-to-contacts', html: 'ADD'},
								{ tag: 'a', cls: 'request-change', html: 'Request Change'}
							]},
						{ cn: { tag: 'span', 'data-field': 'email', 'data-placeholder': 'Email' } },
						{ cn: [
							{ tag: 'span', 'data-field': 'role', 'data-placeholder': 'Role' },
							{ tag: 'span', cls: 'separator', html: ' at '},
							{ tag: 'span', 'data-field': 'affiliation', 'data-placeholder': 'School or Company' }
						]},
						{ cn: {tag: 'span', 'data-field': 'location', 'data-placeholder': 'Location' } },
						{ cn: {tag: 'span', 'data-field': 'home_page', 'data-placeholder': 'Home Page' } },
						{ cls: 'error-msg' },
						{ cls: 'actions', cn: [
							{ cls: 'chat', html: 'Chat' }
						]}
					]
				}
			]
		}
	]),


	renderSelectors: {
		profileInfoEl:    '.profile-about',
		metaEl:           '.profile-about .meta',
		nameEl:           '.profile-about .meta .name',
		roleEl:           '.profile-about .meta [data-field=role]',
		affiliationEl:    '.profile-about .meta [data-field=affiliation]',
		affiliationSepEl: '.profile-about .meta .separator',
		locationEl:       '.profile-about .meta [data-field=location]',
		homePageEl:       '.profile-about .meta [data-field=home_page]',
		emailEl:          '.profile-about .meta [data-field=email]',
		actionsEl:        '.profile-about .meta .actions',
		chatEl:           '.profile-about .meta .actions .chat',
		addToContacts:    '.add-to-contacts',
		errorMsgEl:       '.error-msg',
		requestEl:        '.request-change',
		nameContainerEl:  '.name-container'
	},

	//</editor-fold>


	//<editor-fold desc="Init">
	initComponent: function () {
		this.callParent(arguments);

		this.onSaveMap = {home_page: this.homePageChanged};

		this.on({
			beforedeactivate:'onBeforeDeactivate',
			nameEl:{ click:'editName' },
			metaEl:{ click:'editMeta' },
			chatEl:{ click:'onChatWith' }
		});

		this.setUser(this.user);
	},


	onBeforeDeactivate: function () {},


	destroy: function () {
		if (this.metaEditor) {
			this.metaEditor.destroy();
		}
		if (this.nameEditor) {
			this.nameEditor.destroy();
		}

		this.callParent(arguments);
	},


	afterRender: function () {
		var elements = [],
				fields = [],
				safeFields = ['nameEl'],
				me = this;

		me.callParent(arguments);

		Ext.each(Ext.Object.getKeys(me.renderSelectors),function(k){
			elements.push(me[k]);
			if(!Ext.Array.contains(safeFields,k)){
				fields.push(me[k]);
			}
			me[k].setVisibilityMode(Ext.dom.Element.DISPLAY);
		});

		elements = new Ext.dom.CompositeElement(elements);
		fields = new Ext.dom.CompositeElement(fields);

		this.errorMsgEl.hide();
		this.requestEl.hide();

		//They want to disable profile fields for everyone in some environements.  If the config flag is set hide
		// everything but the safeFields (avatar and name)
		if ($AppConfig.disableProfiles === true) {
			fields.hide();
		}
	},
	//</editor-fold>


	//<editor-fold desc="State Management Stubs">
	getStateData: function(){ return this.uriFriendlyName; },


	restore: function(data,finishCallback){
		Ext.callback(finishCallback,null,[this]);
	},
	//</editor-fold>


	shouldShowAddContact: function (username) {
		if (!$AppConfig.service.canFriend()) {
			return false;
		}
		return username && username !== $AppConfig.username && !Ext.getStore('FriendsList').isContact(username);
	},


	setUser: function (user) {
		var me = this, profileSchemaUrl, req;

		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setUser, this, [user]), this, {single: true});
			return;
		}

		me.getEl().mask('Loading...');

		me.user = user;
		me.user.addObserverForField(this, 'Presence', this.presenceChanged, this);

		function onProfileLoaded(u, profile) {
			me.updateProfile(u, profile);
			me.getEl().unmask();
		}

		profileSchemaUrl = user.getLink('account.profile');
		if (!profileSchemaUrl) {
			me.profileInfoEl.removeCls('editable');
			onProfileLoaded(user);
			return;
		}

		req = {
			url: profileSchemaUrl,
			scope: this,
			callback: function (q, success, r) {
				var schema;
				if (!success) {
					console.log('Could not get profile schema');
				}
				else {
					schema = Ext.decode(r.responseText, true);
				}
				onProfileLoaded(user, schema);
			}
		};

		Ext.Ajax.request(req);
	},


	//<editor-fold desc="Profile Schema Logic">
	/**
	 * Returns an object with two fields, shouldBeShown and editable that describe how (if at all) the profided profile
	 * field should be shown
	 *
	 * @returns {Object}
	 */
	getMetaInfoForField: function (user, field, profileSchema) {
		var r = {}, val = (profileSchema || {})[field];
		r.editable = val && !val.readonly;
		r.shouldBeShown = r.editable || !Ext.isEmpty(user.get(field));
		r.field = field;
		return r;
	},


	validate: function (field, value) {
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
			if (value.length < (rules.min_length || 0 )) {
				this.showError('Must contain at least ' + (rules.min_length || 0 ) + ' characters.');
				return false;
			}

			if (value.length > (rules.max_length || Infinity)) {
				this.showError('May only use ' + (rules.max_length || Infinity) + ' characters.');
				return false;
			}

			if (rules.type === 'URI') {
				//We use some basic URI validation here, similar to what the ds
				//does as of r15860.  Note the ds will add http if there is no
				//scheme.  However if we detect what looks like a scheme we
				//require it to start with http[s]
				numColons = (value.match(/:/g) || []).length;
				if (numColons > 1) {
					this.showError('Must be a valid URL.');
					return false;
				}
				if (numColons === 1 && value.indexOf('http:') !== 0 && value.indexOf('https:') !== 0) {
					this.showError('Must be a valid URL.');
					return false;
				}
				return true;
			}
		}

		return true;
	},


	updateProfileDetail: function (user, profileSchema) {
		//Don't do anything if we are disabled in the config
		if ($AppConfig.disableProfiles === true) {
			return;
		}
		var affiliationInfo = this.getMetaInfoForField(user, 'affiliation', profileSchema),
			locationInfo = this.getMetaInfoForField(user, 'location', profileSchema),
			roleInfo = this.getMetaInfoForField(user, 'role', profileSchema),
			homePageInfo = this.getMetaInfoForField(user, 'home_page', profileSchema),
			emailInfo = this.getMetaInfoForField(user, 'email', profileSchema),
			roleResult, affiliationResult, homePageValue,
			me = this;


		function setupMeta(el, info) {
			if (info.shouldBeShown) {
				me.updateField(el, info.field, user.get(info.field));
				if (info.editable) {
					el.addCls('editable');
				}
				else {
					el.removeCls('editable');
				}
				return true;
			}
			el.remove();
			return false;
		}

		affiliationResult = setupMeta(this.affiliationEl, affiliationInfo);
		setupMeta(this.emailEl, emailInfo);
		roleResult = setupMeta(this.roleEl, roleInfo);
		setupMeta(this.locationEl, locationInfo);
		setupMeta(this.homePageEl, homePageInfo);

		if (!roleResult || !affiliationResult) {
			this.affiliationSepEl.hide();
		}
		else {
			this.affiliationSepEl.show();
		}

		function validateAgainstSchema(value) {
			var editor = this.ownerCt,
					field = editor.boundEl.getAttribute('data-field');
			return  me.validate(field, value);
		}

		this.metaEditor = NextThought.view.profiles.ProfileFieldEditor.create({
			autoSize: { width: 'boundEl' },
			cls: 'meta-editor',
			field: { xtype: 'simpletext', allowBlank: true, validator: validateAgainstSchema, silentIsValid: false },
			listeners: {
				complete: this.onSaveField,
				canceledit: this.clearError,
				scope: this
			}
		});
	},


	updateProfile: function (user, schema) {
		var me = this,
			profileSchema = (schema || {}).ProfileSchema,
			nameInfo = me.getMetaInfoForField(user, 'alias', profileSchema);

		me.userObject = user;
		me.profileSchema = profileSchema;

		try {
			me.mun(Ext.getStore('FriendsList'), {scope: me, 'contacts-updated': me.contactsMaybeChanged});
			me.contactsMaybeChanged();
			//Maybe this goes in controller?
			me.mon(Ext.getStore('FriendsList'), {scope: me, 'contacts-updated': me.contactsMaybeChanged});
		}
		catch (e) {
			console.error(Globals.getError(e));
		}

		//Make more of the UI schema driven

		me.nameEl.update(user.getName());
		me.nameEl.dom.setAttribute('data-qtip', user.getName());

		//If the name is editable it is guarenteed (right now) to be
		//us.  Given that it is also guarenteed that we won't have the add to contacts
		//button. so if its not editable we tag it with a class so we can snug the button
		//up if it exists
		if (nameInfo.editable) {
			me.nameEl.addCls('editable');
		}
		else {
			this.nameEl.addCls('readonly');
			this.nameEl.removeCls('editable');

			if (isFeature('request-alias-change') && isMe(user)) {
				this.nameContainerEl.on({
					scope: me,
					mouseover: function () { me.requestEl.show(); },
					mouseout: function () { me.requestEl.hide(); }
				});

				me.requestEl.on('click', function () {
					me.fireEvent('request-alias-change', me);
				}, me);
			}
		}

		me.maybeShowChat(me.chatEl);

		function validateAgainstSchema(value) {
			var editor = this.ownerCt,
					field = editor.boundEl.getAttribute('data-field');
			return  me.validate(field, value);
		}

		this.nameEditor = NextThought.view.profiles.ProfileFieldEditor.create({
			cls: 'name-editor',
			updateEl: true,
			field: { xtype: 'simpletext', allowBlank: true, validator: validateAgainstSchema, silentIsValid: false },
			listeners: {
				complete: this.onSaveField,
				canceledit: this.clearError,
				scope: this
			}
		});

		this.updateProfileDetail(user, profileSchema);
	},
	//</editor-fold>


	//<editor-fold desc="Field Editor">
	editName: function (e) {
		e.stopEvent();//don't let the event bubble, editMeta will get invoked if you do...
		if (!this.nameEditor.isHidden() || !this.nameEl.hasCls('editable')) {
			return;
		}

		if (this.metaEditor.editing) {
			this.metaEditor.cancelEdit();
		}

		if (this.nameEditor.editing) {
			this.nameEditor.cancelEdit();
		}

		this.nameEditor.startEdit(this.nameEl);
	},


	editMeta: function (e) {
		var t = e.getTarget('[data-field]', null, true),
			field = t && Ext.fly(t).getAttribute('data-field'),
			value = (field && this.userObject.get(field)) || '',
			ed = this.metaEditor;

		if (e.getTarget('a[href]') || !t || this.savingField) {
			return;
		}

		if (this.nameEditor.editing) {
			this.nameEditor.cancelEdit();
		}

		if (ed.editing) {
			ed.cancelEdit();
		}

		ed.startEdit(t, value);
	},


	onSaveField: function (cmp, newValue, oldValue) {
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
			if (/application\/json/.test(rsp.getResponseHeader('Content-Type') || "")) {
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
			me.showError(resultJson.message || 'An unknown error occurred');
			delete me.savingField;
		}

		console.debug('saving:', field, '=', newValue, 'in', user);
		//TODO: Check the schema
		me.savingField = true;
		user.saveField(field, newValue, success, failure);
	},
	//</editor-fold>


	//<editor-fold desc="UI Updaters & Handlers">
	showError: function (text) {
		this.errorMsgEl.update(text);
		this.errorMsgEl.show();
	},


	clearError: function () {
		this.errorMsgEl.hide();
	},


	updateField: function (el, n, v) {
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


	presenceChanged: function (value) {
		this.maybeShowChat(this.chatEl);
	},


	homePageChanged: function (value, placeholderText) {
		var a;
		if (!value) {
			this.homePageEl.update(placeholderText);
		}
		else {
			a = this.homePageEl.down('a');
			if (a) {
				a.set({href: value});
				a.update(value);
			}
			else {
				Ext.DomHelper.overwrite(this.homePageEl,{
					tag: 'a',
					cls: 'homePageLink',
					'target': '_blank',
					'href': value,
					html: value
				});
			}
		}
	},


	contactsMaybeChanged: function () {
		var me = this;
		if (me.addToContacts) {
			me.mun(me.addToContacts, 'click');
			if (!me.shouldShowAddContact(this.userObject ? this.userObject.getId() : this.username)) {
				me.addToContacts.hide();
			}
			else {
				me.addToContacts.show();
				me.mon(me.addToContacts, {scope: me, click: me.addToContactsClicked});
			}
		}
	},


	addToContactsClicked: function (e) {
		var me = this;
		console.log('Should add to contacts');

		function onResolvedUser(record) {
			var pop,
					el = e.target,
					alignmentEl = e.target,
					alignment = 'tr-tl?',
					play = Ext.dom.Element.getViewportHeight() - Ext.fly(el).getTop(),
					id = record.getId(),
					open = false,
					offsets = [10, -18];

			Ext.each(Ext.ComponentQuery.query('activity-popout,contact-popout'), function (o) {
				if (o.record.getId() !== id || record.modelName !== o.record.modelName) {
					o.destroy();
				}
				else {
					open = true;
					o.toFront();
				}
			});

			if (open) {
				return;
			}

			pop = NextThought.view.account.contacts.management.Popout.create({record: record, refEl: Ext.get(el)});

			pop.addCls('profile-add-to-contacts-popout');
			pop.show();
			pop.alignTo(alignmentEl, alignment, offsets);

		}

		if (this.userObject) {
			onResolvedUser(this.userObject);
		}
		else {
			UserRepository.getUser(this.username, onResolvedUser, this);
		}
	}
	//</editor-fold>


});
