Ext.define('NextThought.view.profiles.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-panel',

	requires:[
		'NextThought.view.profiles.parts.Activity',
		'NextThought.view.profiles.parts.Blog',
		'NextThought.view.profiles.TabPanel',
		'NextThought.view.profiles.ProfileFieldEditor',
		'NextThought.view.account.contacts.management.Popout',
		'NextThought.layout.component.Natural'
	],

	mixins:{
		enableChat: 'NextThought.mixins.ChatLinks'
	},

	ui: 'profile',
	componentLayout: 'natural',
	layout: 'auto',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	placeholderTextTpl: Ext.DomHelper.createTemplate({tag:'span',cls:'placeholder',html:'{0}'}),

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'profile-head editable',
			cn: [{
				cls: 'avatar', cn:[{cls:'edit', html: 'Edit'}]
			},{
				cls: 'meta',
				cn: [
					{cn:[{tag: 'span', cls: 'name', 'data-field': 'alias' },{ cls: 'add-to-contacts', html: 'ADD'}]},
					{cn:{tag: 'span', 'data-field': 'email', 'data-placeholder': 'Email' }},
					{ cn: [
						{tag: 'span', 'data-field':'role', 'data-placeholder': 'Role'},
						{tag: 'span', cls: 'separator', html:' at '},
						{tag: 'span', 'data-field': 'affiliation', 'data-placeholder': 'School or Company'}]},
					{cn:{tag: 'span', 'data-field': 'location' , 'data-placeholder': 'Location'}},
					{cn:{tag: 'span', 'data-field': 'home_page', 'data-placeholder': 'Home Page'}},
					{ cls: 'error-msg' },
					{ cls: 'actions', cn: [
						{cls: 'chat', html: 'Chat'}
					]}
				]
			}]
		},
		{
			id: '{id}-body',
			cls:'profile-items',
			cn:['{%this.renderContainer(out,values)%}']
		}
	]),


	renderSelectors: {
		profileInfoEl: '.profile-head',
		avatarEl: '.profile-head .avatar',
		nameEl: '.profile-head .meta .name',
		roleEl: '.profile-head .meta [data-field=role]',
		editEl: '.profile-head .avatar .edit',
		affiliationEl: '.profile-head .meta [data-field=affiliation]',
		affiliationSepEl: '.profile-head .meta .separator',
		locationEl: '.profile-head .meta [data-field=location]',
		homePageEl: '.profile-head .meta [data-field=home_page]',
		emailEl: '.profile-head .meta [data-field=email]',
		actionsEl: '.profile-head .meta .actions',
		chatEl: '.profile-head .meta .actions .chat',
		addToContacts: '.add-to-contacts',
		errorMsgEl: '.error-msg'
	},


	items: [{
		xtype: 'profile-tabs',
		layout: 'auto',
		items: [
			{title: 'Recent Activity', xtype: 'profile-activity' },
			{title: 'Thoughts', xtype: 'profile-blog'},
			{title: 'Library', disabled: true, hidden: true},
			{title: 'Connections', disabled: true, hidden: true}
		]
	}],


	initComponent: function(){
		//prevent prototype corruption... until we clone it, this.hasOwnProperty('items') returns false...
		this.items = Ext.clone(this.items);
		//now this.hasOwnProperty('items') will return true...
		//pass the username down to all our configured child items.
		Ext.applyRecursively(this.items,{username:this.username});

		this.callParent(arguments);
		this.addEvents('loaded');
		this.timeId = 'Resolve User:'+this.username;

		this.onSaveMap = {home_page: this.homePageChanged};

		console.time(this.timeId);

		this.tabs = this.down('profile-tabs');
		if(this.activeTab){
			this.setActiveTab(this.activeTab);
		}
		//this is intentionally added after we "restore" the tab
		this.mon(this.tabs,'tabchange', this.trackTabs, this);
		this.on('beforedeactivate', this.onBeforeDeactivate, this);

		UserRepository.getUser(this.username,this.setUser, this, true);
	},


	trackTabs: function(tabPanel, newTab){
		if(!this.user || this.settingTab){
			return;
		}
		var tab = newTab.is('profile-activity')?undefined : newTab.title,
			params = tab && newTab.getParams ? newTab.getParams() : undefined,
			url;

		if( params ){
			tab = [tab,params];
		}

		url = this.user.getProfileUrl(tab);

		console.debug('new url:'+url);

		this.fireEvent('change-hash', url);
	},


	setActiveTab: function(tab){
		delete this.activeTab;
		this.settingTab = true;

		var n = tab? tab.indexOf('/') : 0,
			params = null,
			t;

		if(n>0){
			params = tab.substr(n+1);
			tab = tab.substr(0,n);
		}

		t =  tab ? this.down('[title="'+tab+'"]') : null;
		if(t !== this.tabs.activeTab){
			this.tabs.suspendEvents(false);
			this.tabs.setActiveTab(t||0);
			this.tabs.resumeEvents();
		}

		if( t && t.setParams ){
			t.setParams(params,this.queryObject);
		}

		delete this.settingTab;
	},


	afterRender: function(){
		this.callParent(arguments);

		this.relayEvents(Ext.get('profile'),['scroll']);

		this.affiliationSepEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.addToContacts.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.editEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.errorMsgEl.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();

		this.mon(this.chatEl,'click',this.onChatWith,this);
		this.mon(this.editEl,'click',this.onEditAvatar,this);
		this.on('scroll', this.onScroll, this);

		//They want to disable profile fields for everyone
		//in some environements.  If the config flag is set
		//hide everything but avatar and username
		if($AppConfig.disableProfiles === true){
			this.roleEl.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
			this.affiliationEl.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
			this.affiliationSepEl.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
			this.locationEl.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
			this.homePageEl.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
			this.emailEl.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
		}

		this.tabBarEl = this.tabs.getTabBar().getEl();
		this.mon(Ext.get('profile'),'scroll',this.handleScrollHeaderLock,this);
	},


	handleScrollHeaderLock: function(e,profileDom){
		var profileDomParent = profileDom && profileDom.parentNode,
			profileScroll = Ext.fly(profileDom).getScroll().top,
			tabBarParent = Ext.getDom(this.tabBarEl).parentNode,
			cutoff = 268,
			cls = 'scroll-pos-right';

		if(tabBarParent === profileDomParent && profileScroll < cutoff){
			delete this.headerLocked;
			this.tabBarEl.removeCls(cls).insertBefore(this.tabs.getEl().first());
		}
		else if(tabBarParent !== profileDomParent && profileScroll >= cutoff){
			this.headerLocked = true;
			this.tabBarEl.addCls(cls).appendTo(profileDomParent);
		}
		else if(tabBarParent !== profileDomParent) {
			this.tabBarEl.removeCls(cls);
		}
	},


	onScroll: function(e){
		var activeTab = this.tabs.activeTab,
			el, height;

		function alignEditor(ed){
			if(ed && ed.rendered){
				ed.realign();
			}
		}

		alignEditor(this.metaEditor);
		alignEditor(this.nameEditor);

		el = e.getTarget();
		height = Ext.fly(el).getHeight();

		if(el.scrollTop + height >= el.scrollHeight && activeTab && activeTab.onScrolledToBottom){
			activeTab.onScrolledToBottom();
		}
	},


	contactsMaybeChanged: function(){
		var me = this;
		if(me.addToContacts){
			me.mun(me.addToContacts, 'click');
			if(!me.shouldShowAddContact(this.userObject ? this.userObject.getId() : this.username)){
				me.addToContacts.hide();
			}
			else{
				me.addToContacts.show();
				me.mon(me.addToContacts, {scope: me, click: me.addToContactsClicked});
			}
		}
	},


	shouldShowAddContact: function(username){
		if(!$AppConfig.service.canFriend()){
			return false;
		}
		return username && username !== $AppConfig.username && !Ext.getStore('FriendsList').isContact(username);
	},


	destroy: function(){
		if(this.metaEditor){
			this.metaEditor.destroy();
		}
		if(this.nameEditor){
			this.nameEditor.destroy();
		}

		//This might not be needed since the el is owned by a component. But better safe than sorry.
		if(this.headerLocked){
			this.tabBarEl.insertBefore(this.tabs.getEl().first());
		}

		this.callParent(arguments);
	},


	addToContactsClicked: function(e){
		var me = this;
		console.log('Should add to contacts');

		function onResolvedUser(record){
			var pop,
				el = e.target,
				alignmentEl = e.target,
				alignment = 'tr-tl?',
				play = Ext.dom.Element.getViewportHeight() - Ext.fly(el).getTop(),
				id = record.getId(),
				open = false,
				offsets = [10, -18];

				Ext.each(Ext.ComponentQuery.query('activity-popout,contact-popout'),function(o){
					if(o.record.getId()!==id || record.modelName !== o.record.modelName){ o.destroy(); }
					else { open = true;  o.toFront();}
				});

			if(open){return;}

			pop = NextThought.view.account.contacts.management.Popout.create({record: record, refEl: Ext.get(el)});

			pop.addCls('profile-add-to-contacts-popout');
			pop.show();
			pop.alignTo(alignmentEl,alignment,offsets);

		}

		if(this.userObject){
			onResolvedUser(this.userObject);
		}
		else{
			UserRepository.getUser(this.username, onResolvedUser, this);
		}
	},


	/**
	 * Returns an object with two fields, shouldBeShown and editable that describe how (if at all) the profided profile
	 * field should be shown
	 *
	 * @returns {Object}
	 */
	getMetaInfoForField: function(user, field, profileSchema){
		var r = {}, val = (profileSchema||{})[field];
		r.editable = val && !val.readonly;
		r.shouldBeShown = r.editable || !Ext.isEmpty(user.get(field));
		r.field = field;
		return r;
	},


	updateProfileDetail: function(user, profileSchema){
		//Don't do anything if we are disabled in the config
		if($AppConfig.disableProfiles === true){
			return;
		}
		var affiliationInfo = this.getMetaInfoForField(user, 'affiliation', profileSchema),
			locationInfo = this.getMetaInfoForField(user,'location', profileSchema),
			roleInfo = this.getMetaInfoForField(user, 'role', profileSchema),
			homePageInfo = this.getMetaInfoForField(user, 'home_page', profileSchema),
			emailInfo = this.getMetaInfoForField(user, 'email', profileSchema),
			roleResult, affiliationResult, homePageValue,
			me = this;

		this.mun(this.affiliationEl,'click',this.editMeta,this);
		this.mun(this.roleEl,'click',this.editMeta, this);
		this.mun(this.locationEl,'click',this.editMeta, this);
		this.mun(this.emailEl,'click',this.editMeta, this);
		this.mun(this.homePageEl,'click',this.editMeta, this);

		function setupMeta(el, info){
			if(info.shouldBeShown){
				me.updateField(el, info.field, user.get(info.field));
				if(info.editable){
					me.mon(el,'click',me.editMeta,me);
					el.addCls('editable');
				}
				else{
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

		if(!roleResult || !affiliationResult){
			this.affiliationSepEl.hide();
		}
		else{
			this.affiliationSepEl.show();
		}

		function validateAgainstSchema(value){
			var editor = this.ownerCt;
				field = editor.boundEl.getAttribute('data-field');
			return  me.validate(field, value);
		}

		this.metaEditor = NextThought.view.profiles.ProfileFieldEditor.create({
			autoSize: { width: 'boundEl' },
			cls: 'meta-editor',
			field:{ xtype: 'simpletext', allowBlank: true, validator: validateAgainstSchema, silentIsValid: false },
			listeners:{
				complete: this.onSaveField,
				canceledit: this.clearError,
				scope: this
			}
		});
	},


	updateProfile: function(user, schema){
		var profileSchema = (schema || {}).ProfileSchema,
			nameInfo = this.getMetaInfoForField(user, 'alias', profileSchema),
			me = this;

		this.userObject = user;
		this.profileSchema = profileSchema;

		this.mun(this.nameEl,'click',this.editName,this);

		try {
			me.mun(Ext.getStore('FriendsList'), {scope: me, 'contacts-updated': me.contactsMaybeChanged});
			me.contactsMaybeChanged();
			//Maybe this goes in controller?
			me.mon(Ext.getStore('FriendsList'), {scope: me, 'contacts-updated': me.contactsMaybeChanged});
		}
		catch(e){
			console.error(Globals.getError(e));
		}

		//Make more of the UI schema driven

		this.avatarEl.setStyle({backgroundImage: 'url('+user.get('avatarURL')+')'});
		if(profileSchema && profileSchema.avatarURL && !profileSchema.avatarURL.readonly){
			this.editEl.show();
		}
		else{
			this.editEl.hide();
		}


		this.nameEl.update(user.getName());
		this.nameEl.dom.setAttribute('data-qtip', user.getName());

		//If the name is editable it is guarenteed (right now) to be
		//us.  Given that it is also guarenteed that we won't have the add to contacts
		//button. so if its not editable we tag it with a class so we can snug the button
		//up if it exists
		if(nameInfo.editable){
			this.mon(this.nameEl,'click',this.editName,this);
			this.nameEl.addCls('editable');
		}
		else{
			this.nameEl.addCls('readonly');
			this.nameEl.removeCls('editable');
		}

		this.maybeShowChat(this.chatEl);

		function validateAgainstSchema(value){
			var editor = this.ownerCt;
				field = editor.boundEl.getAttribute('data-field');
			return  me.validate(field, value);
		}

		this.nameEditor = NextThought.view.profiles.ProfileFieldEditor.create({
			cls: 'name-editor',
			updateEl: true,
			field:{ xtype: 'simpletext', allowBlank: true, validator:  validateAgainstSchema, silentIsValid: false },
			listeners:{
				complete: this.onSaveField,
				canceledit: this.clearError,
				scope: this
			}
		});

		this.updateProfileDetail(user, profileSchema);
	},


	avatarChanged: function(field, value){
		var avatarUrl = value;
		//Pass fields along with the changed event
		//and only do this is the avatar url changed
		if(avatarUrl){
			this.avatarEl.setStyle({backgroundImage: 'url('+avatarUrl+')'});
		}
	},


	presenceChanged: function(value){
		this.maybeShowChat(this.chatEl);
	},


	homePageChanged: function(value, placeholderText){
		var a;
		if(!value){
			this.homePageEl.update(placeholderText);
		}
		else{
			a = this.homePageEl.down('a');
			if(a){
				a.set({href: value});
				a.update(value);
			}
			else{
				Ext.DomHelper.overwrite(this.homePageEl,
									 {
										 tag: 'a',
										 cls: 'homePageLink',
										 'target': '_blank',
										 'href': value,
										 html: value
									 }
				);
			}
		}
	},


	setUser: function(user){
		var me = this, profileSchemaUrl,
			toMask;

		console.timeEnd(this.timeId);

		this.fireEvent('loaded');

		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setUser,this,[user]), this, {single: true});
			return;
		}

		toMask = me.up('#profile');
		toMask.getEl().mask('Loading...');

		//This isn't as nice as beingable to just send message to null
		if(me.user){
			me.user.removeObserverForField(this, 'avatarURL', this.avatarChanged, this);
		}

		me.user = user;
		me.user.addObserverForField(this, 'avatarURL', this.avatarChanged, this);
		me.user.addObserverForField(this, 'Presence', this.presenceChanged, this);

		function onProfileLoaded(u, profile){
			me.updateProfile(u, profile);
			toMask.unmask();
		}

		profileSchemaUrl = user.getLink('account.profile');
		if(!profileSchemaUrl){
			me.profileInfoEl.removeCls('editable');
			onProfileLoaded(user);
			return;
		}

		Ext.Ajax.request({
            url: profileSchemaUrl,
            scope: this,
            callback: function(q,success,r){
				var schema;
                if(!success){
                    console.log('Could not get profile schema');
                }
				else{
					schema = Ext.decode(r.responseText, true);
				}
				onProfileLoaded(user, schema);
            }
        });
	},


	editMeta: function(e){
		var t = e.getTarget('[data-field]',null,true),
			field = Ext.fly(t).getAttribute('data-field'),
			value = this.userObject.get(field) || '',
			ed = this.metaEditor;

		if(e.getTarget('a[href]') || this.savingField){
			return;
		}

		if(this.nameEditor.editing){
			this.nameEditor.cancelEdit();
		}

		if(ed.editing){
			ed.cancelEdit();
		}

		ed.startEdit(t,value);
	},


	showError: function(text){
		this.errorMsgEl.update(text);
		this.errorMsgEl.show();
	},


	clearError: function(){
		this.errorMsgEl.hide();
	},


	validate: function(field, value){
		var rules = (this.profileSchema || {})[field],
			numColons;
		if(!field || !rules){
			console.warn('No rules or field. Treating as valid', field, value, this.profileSchema);
		}

		rules = rules || {};

		//treat empty string as null
		if(Ext.isEmpty(value)){
			value = null;
		}

		//TODO encapsulate all these validations rules in some kind of profile model
		//this will let us share it and test it...

		if(rules.required === true && (value === null || value === undefined)){
			this.showError('Required.');
			return false;
		}

		if(!value){
			return true;
		}

		if(rules.base_type === 'string'){
			//for strings we expect a min and a max length and if they exist our string must fit in
			//those bounds
			if(value.length < (rules.min_length || 0 )){
				this.showError('Must contain at least '+(rules.min_length || 0 )+' characters.');
				return false;
			}

			if( value.length > (rules.max_length || Infinity)){
				this.showError('May only use '+(rules.max_length || Infinity)+' characters.');
				return false;
			}

			if(rules.type === 'URI'){
				//We use some basic URI validation here, similar to what the ds
				//does as of r15860.  Note the ds will add http if there is no
				//scheme.  However if we detect what looks like a scheme we
				//require it to start with http[s]
				numColons = (value.match(/:/g)||[]).length;
				if(numColons > 1){
					this.showError('Must be a valid URL.');
					return false;
				}
				if(numColons === 1 && value.indexOf('http:') !== 0 && value.indexOf('https:') !== 0){
					this.showError('Must be a valid URL.');
					return false;
				}
				return true;
			}
		}

		return true;
	},


	updateField: function(el, n, v){
		var placeholderText = this.placeholderTextTpl.apply([el.getAttribute('data-placeholder')]);
		if(this.onSaveMap.hasOwnProperty(n)){
			Ext.callback(this.onSaveMap[n], this, [v, placeholderText]);
		}
		else if(this['set'+n]){
			Ext.callback(this['set'+n], this, [v, placeholderText]);
		}
		else{
			el.update(v || placeholderText);
		}

		if(n === 'alias'){
			el.dom.setAttribute('data-qtip', v);
		}
	},


	onSaveField: function(cmp, newValue, oldValue){
		var field = cmp.boundEl.getAttribute('data-field'),
			user = this.userObject,
			me = this;

		if(!isMe(user)){
			console.warn('Attempting to edit another user\'s record');
			return;
		}

		//treat empty string as null
		if(Ext.isEmpty(newValue)){
			newValue = null;
		}

		me.clearError();

		function success(n, v){
			console.log(arguments);
			me.updateField(cmp.boundEl, n, v);
			delete me.savingField;
		}

		function failure(rsp){
			var resultJson = {};
			if(/application\/json/.test(rsp.getResponseHeader('Content-Type') || "")){
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

		console.debug('saving:', field,'=', newValue, 'in', user);
//TODO: Check the schema
		me.savingField = true;
		user.saveField(field,newValue,success,failure);
	},


	editName: function(){
		if(!this.nameEditor.isHidden()){
			return;
		}

		if( this.metaEditor.editing ){
			this.metaEditor.cancelEdit();
		}

		if( this.nameEditor.editing ){
			this.nameEditor.cancelEdit();
		}

		this.nameEditor.startEdit(this.nameEl);
	},


	onBeforeDeactivate: function(){
		console.log('about to deactivate the profile tabs');

		return Ext.Array.every(this.tabs.items.items, function(item){
			return item.fireEvent('beforedeactivate');
		});
	},


	onEditAvatar: function(e){
		e.stopEvent();
		this.fireEvent('edit');
		return false;
	}
});
