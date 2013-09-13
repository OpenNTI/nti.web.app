Ext.define('NextThought.view.profiles.About',{
	extend: 'Ext.Component',
	alias: 'widget.profile-about',

	//<editor-fold desc="Config">
	uriFriendlyName: 'about',
	html: 'about',
	ui: 'profile',


	placeholderTextTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'placeholder', html: '{0}'}),

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'profile-about editable make-white',
			cn: [
				{
					cls: 'meta',
					cn:  [
						{
							cls: 'about field',
							cn:[
								{ cls: 'label', html:'About' },
								{ cls: 'content', 'data-field': 'about', 'data-placeholder': 'Write something about your self.', 'data-multiline':true }
							]
						},
						{
							cls: 'fold', cn: [

								{ cls: 'field', cn:[
									{ cls: 'label', cn:{ tag: 'span', 'data-field': 'affiliation', 'data-placeholder': 'School or Company' } },
									{ cn:{ tag: 'span', 'data-field': 'role', 'data-placeholder': 'Role' } }
								]},

								{ cls: 'field', cn:[
									{ cls:'label', html: 'Location' },
									{ cn:{ tag: 'span', 'data-field': 'location', 'data-placeholder': 'Location' } }
								]},

								{ cls: 'field', cn:[
									{ cls:'label', html: 'Homepage' },
									{ cn: {tag: 'span', 'data-field': 'home_page', 'data-placeholder': 'Home Page' } }
								]},

								{ cls: 'field', cn:[
									{ cls:'label', html: 'Email' },
									{ cn: { tag: 'span', 'data-field': 'email', 'data-placeholder': 'Email' } }
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
		profileInfoEl:    '.profile-about',
		metaEl:           '.profile-about .meta',
		homePageEl:       '.profile-about .meta [data-field=home_page]',
		errorMsgEl:       '.error-msg'
	},

	//</editor-fold>


	//<editor-fold desc="Init">
	initComponent: function () {
		this.callParent(arguments);
		//They want to disable profile fields for everyone in some environements.  If the config flag is set hide
		// everything but the safeFields (avatar and name)
		if ($AppConfig.disableProfiles === true) {
			Ext.defer(this.destroy,1,this);
		}

		this.onSaveMap = {home_page: this.homePageChanged};

		this.on({
			'enable-edit': 'onShowEditing',
			'disable-edit': 'onHideEditing',
			beforedeactivate:'onBeforeDeactivate',
			metaEl:{ click:'editMeta' }
		});

		this.setUser(this.user);
	},


	onBeforeDeactivate: function () {
		if (this.metaEditor && this.metaEditor.editing) {
			this.metaEditor.cancelEdit();
		}

		if (this.nameEditor && this.nameEditor.editing) {
			this.nameEditor.cancelEdit();
		}
	},


	afterRender: function () {
		this.callParent(arguments);
		this.errorMsgEl.setVisibilityMode(Ext.Element.DISPLAY).hide();
	},
	//</editor-fold>


	//<editor-fold desc="State Management Stubs">
	getStateData: function(){ return this.uriFriendlyName; },


	restore: function(data,finishCallback){
		Ext.callback(finishCallback,null,[this]);
	},
	//</editor-fold>


	//<editor-fold desc="Profile Schema Logic">
	setUser: function (user) {
		var me = this, profileSchemaUrl, req;

		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setUser, this, [user]), this, {single: true});
			return;
		}

		me.getEl().mask('Loading...');

		me.user = user;

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
		var me = this;

		//Don't do anything if we are disabled in the config
		if ($AppConfig.disableProfiles === true) {
			return;
		}

		function setupMeta(el) {
			var field = el.getAttribute('data-field'),
				info = me.getMetaInfoForField(user, field, profileSchema),
				box;

			el = Ext.get(el);

			if (info.shouldBeShown) {
				me.updateField(el, info.field, user.get(info.field));
				el[(info.editable?'add':'remove')+'Cls']('editable');
				return;
			}

			box = el.parent('.field');
			Ext.destroy(el,box);
		}

		function validateAgainstSchema(value) {
			var editor = this.ownerCt,
					field = editor.boundEl.getAttribute('data-field');
			return  me.validate(field, value);
		}

		Ext.each(this.el.query('[data-field]'),setupMeta);

		if( this.el.query('.field').length === 0 ){
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
		this.on('destroy','destroy',this.metaEditor);
	},


	updateProfile: function (user, schema) {
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
			fn = Ext.bind(me.fireEvent,me,['request-alias-change', me]);
		}

		if(nameInfo.editable || Ext.isFunction(fn)){
			this.on('name-clicked',fn);
		}

		function validateAgainstSchema(value) {
			var editor = this.ownerCt,
					field = editor.boundEl.getAttribute('data-field');
			return  me.validate(field, value);
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
		this.on('destroy','destroy',this.nameEditor);

		this.updateProfileDetail(user, profileSchema);
	},
	//</editor-fold>


	//<editor-fold desc="Field Editor">
	editName: function (nameEl) {

		if (!this.nameEditor.isHidden() || this.isHidden() || !this.hasCls('editing')) {
			return;
		}

		nameEl.setAttribute('data-field','alias');

		if (this.metaEditor && this.metaEditor.editing) {
			this.metaEditor.cancelEdit();
		}

		if (this.nameEditor.editing) {
			this.nameEditor.cancelEdit();
		}

		this.nameEditor.startEdit(Ext.get(nameEl));
	},


	editMeta: function (e) {
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
	showEmptyState: function(){
		this.profileInfoEl.remove();
		this.addCls('empty');
		Ext.DomHelper.append(this.el, {
					cls: 'empty-state', cn: [
						{cls: 'header', html: 'Empty Profile :('},
						{cls: 'sub', html: 'This user has not filled out their profile.'}
					]
				});
	},


	onShowEditing: function(){
		this.addCls('editing');
		console.debug('show edit',arguments);
	},


	onHideEditing: function(){
		this.removeCls('editing');
		console.debug('hide edit',arguments);
	},


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


	homePageChanged: function (value, placeholderText) {
		if (!value) {
			this.homePageEl.update(placeholderText);
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
	//</editor-fold>


});
