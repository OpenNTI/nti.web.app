Ext.define('NextThought.view.profiles.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-panel',

	requires:[
		'Ext.Editor',
		'NextThought.view.profiles.parts.Activity',
		'NextThought.view.profiles.TabPanel',
		'NextThought.view.account.contacts.management.Popout'
	],

	ui: 'profile',
	layout: 'auto',

	childEls: ['body'],
	getTargetEl: function () { return this.body; },
	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'profile-head',
			cn: [{
				cls: 'avatar', cn:[{cls:'edit', html: 'Edit'}]
			},{
				cls: 'meta',
				cn: [
					{ cls: 'name', 'data-field':'alias' },
					{ cls: 'add-to-contacts', html: 'ADD'},
					{ 'data-field': 'email', 'data-placeholder': 'Email' },
					{ cn: [
						{tag: 'span', 'data-field':'role', 'data-placeholder': 'Role'},
						{tag: 'span', cls: 'separator', html:' at '},
						{tag: 'span', 'data-field': 'affiliation', 'data-placeholder': 'Affiliation'}]},
					{ 'data-field': 'location' , 'data-placeholder': 'Location'},
					{ 'data-field': 'home_page', 'data-placeholder': 'Home Page'},
					{ cls: 'actions', cn: [
						{cls: 'chat', html: 'Chat'}
					]}
				]
			}]
		},
		{
			id: '{id}-body',
			cls:'profile-items',
			html:'{%this.renderContainer(out,values)%}'
		}
	]),

	renderSelectors: {
		avatarEl: '.profile-head .avatar',
		avatarEditEl: '.profile-head .avatar .edit',
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
		addToContacts: '.add-to-contacts'
	},

	items: [{
		xtype: 'profile-tabs',
		items: [
			{title: 'Recent Activity', xtype: 'profile-activity'},
			{title: 'Thoughts', html: 'Test'},
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
		UserRepository.getUser(this.username,this.setUser, this, true);
	},

	afterRender: function(){
		var me = this;

		this.callParent(arguments);

		this.relayEvents(this.el.parent(),['scroll']);

		this.addToContacts.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.mon(this.chatEl,'click',this.onChatWith,this);
		this.mon(this.editEl,'click',this.onEditAvatar,this);
	},


	contactsMaybeChanged: function(){
		var me = this;
		if(me.addToContacts){
			me.mun(me.addToContacts, 'click');
		}
		if(!me.shouldShowAddContact(this.userObject ? this.userObject.getId() : this.username)){
			me.addToContacts.hide();
		}
		else{
			me.addToContacts.show();
			me.mon(me.addToContacts, {scope: me, click: me.addToContactsClicked});
		}
	},


	shouldShowAddContact: function(username){
		if(!$AppConfig.service.canFriend()){
			return false;
		}
		return username && username !== $AppConfig.username && !Ext.getStore('FriendsList').isContact(username);
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


	//Returns an object with two fields, shouldBeShown and
	//editable that describe how (if at all) the profided profile
	//field should be shown
	getMetaInfoForField: function(user, field, profileSchema){
		var r = {}, val = (profileSchema||{})[field];
		r.editable = val && !val.readonly;
		r.shouldBeShown = r.editable || !Ext.isEmpty(user.get(field));
		r.field = field;
		return r;
	},


	updateProfile: function(user, schema){
		var profileSchema = (schema || {}).ProfileSchema,
			nameInfo = this.getMetaInfoForField(user, 'alias', profileSchema),
			affiliationInfo = this.getMetaInfoForField(user, 'affiliation', profileSchema),
			locationInfo = this.getMetaInfoForField(user,'location', profileSchema),
			roleInfo = this.getMetaInfoForField(user, 'role', profileSchema),
			homePageInfo = this.getMetaInfoForField(user, 'home_page', profileSchema),
			emailInfo = this.getMetaInfoForField(user, 'email', profileSchema),
			roleResult, affiliationResult, me = this, homePageValue;

		this.userObject = user;
		this.profileSchema = profileSchema;

		this.mun(this.nameEl,'click',this.editName,this);
		this.mun(this.affiliationEl,'click',this.editMeta,this);
		this.mun(this.roleEl,'click',this.editMeta, this);
		this.mun(this.locationEl,'click',this.editMeta, this);
		this.mun(this.emailEl,'click',this.editMeta, this);
		this.mun(this.homePageEl,'click',this.editMeta, this);

		try {
			me.mon(Ext.getStore('FriendsList'), {scope: me, load: me.contactsMaybeChanged});
			me.contactsMaybeChanged();
			//Maybe this goes in controller?
			me.mon(Ext.getStore('FriendsList'), {scope: me, load: me.contactsMaybeChanged});
		}
		catch(e){
			console.error(Globals.getError(e));
		}

		//Make more of the UI schema driven

		this.avatarEl.setStyle({backgroundImage: 'url('+user.get('avatarURL')+')'});

		this.nameEl.update(user.getName());

		//If the name is editable it is guarenteed (right now) to be
		//us.  Given that it is also guarenteed that we won't have the add to contacts
		//button. so if its not editable we tag it with a class so we can snug the button
		//up if it exists
		if(nameInfo.editable){
			this.mon(this.nameEl,'click',this.editName,this);
		}
		else{
			this.nameEl.addCls('readonly');
		}


		function setupMeta(el, info){
			if(info.shouldBeShown){
				me.updateField(el, info.field, user.get(info.field));
				if(info.editable){
					me.mon(el,'click',me.editMeta,me);
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
			this.affiliationSepEl.remove();
		}

		function validateAgainstSchema(value){
			var editor = this.ownerCt;
				field = editor.boundEl.getAttribute('data-field');
			return me.validate(field, value);
		}

		this.nameEditor = Ext.Editor.create({
			autoSize: { width: 'boundEl' },
			cls: 'name-editor',
			updateEl: true,
			ignoreNoChange: true,
			field:{ xtype: 'simpletext', allowBlank: true, validator: validateAgainstSchema },
			listeners:{
				complete: this.onSaveField,
				scope: this
			}
		});

		this.metaEditor = Ext.Editor.create({
			autoSize: { width: 'boundEl' },
			cls: 'meta-editor',
			updateEl: false,
			ignoreNoChange: true,
			revertInvalid: true,
			field:{ xtype: 'simpletext', allowBlank: true, validator: validateAgainstSchema },
			listeners:{
				complete: this.onSaveField,
				scope: this
			}
		});
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
		var me = this, profileSchemaUrl;

		console.timeEnd(this.timeId);

		this.fireEvent('loaded');

		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setUser,this,[user]), this, {single: true});
			return;
		}

		function onProfileLoaded(u, profile){
			me.updateProfile(u, profile);
		}

		profileSchemaUrl = user.getLink('account.profile');
		if(!profileSchemaUrl){
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
		var t = e.getTarget(null,null,true),
			ed = this.metaEditor;

		if(e.getTarget('a[href]')){
			return;
		}

		//Ensure the editor is wide enough to see something...
		function resetWidth(){ t.setWidth(null); }
		if(t.getWidth() < 100){ t.setWidth(100); }
		ed.on({deactivate:resetWidth,single:true});

		ed.startEdit(t);
	},

	validate: function(field, value){
		var rules = (this.profileSchema || {})[field];
		if(!field || !rules){
			console.warn('No rules or field. Treating as valid', field, value, this.profileSchema);
		}

		//treat empty string as null
		if(Ext.isEmpty(value)){
			value = null;
		}

		if(rules.required === true && (value === null || value === undefined)){
			return false;
		}

		if(rules.type && rules.type === 'string'){
			if(value && value.length < (rules.min_length || 0)){
				return false;
			}
		}

		return true;
	},

	updateField: function(el, n, v){
		var placeholderText = '{'+el.getAttribute('data-placeholder')+'}';
		if(this.onSaveMap.hasOwnProperty(n)){
			Ext.callback(this.onSaveMap[n], this, [v, placeholderText]);
		}
		else if(this['set'+n]){
			Ext.callback(this['set'+n], this, [v, placeholderText]);
		}
		else{
			el.update(v || placeholderText);
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

		function success(n, v){
			console.log(arguments);
			me.updateField(cmp.boundEl, n, v);
		}

		function failure(){
			//alert('Could not save your '+field);
			console.error(arguments);
			cmp.startEdit(cmp.boundEl);
			cmp.field.setError();
		}

		console.debug('saving:', field,'=', newValue, 'in', user);
//TODO: Check the schema
		user.saveField(field,newValue,success,failure);
	},


	editName: function(){
		this.nameEditor.startEdit(this.nameEl);
	},


	onChatWith: function(e){
		e.stopEvent();
		console.debug('Clicked Chat');
		return false;
	},

	onEditAvatar: function(e){
		e.stopEvent();
		this.fireEvent('edit');
		return false;
	}
});
