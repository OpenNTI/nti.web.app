Ext.define('NextThought.view.profiles.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-panel',

	requires:[
		'Ext.Editor',
		'NextThought.view.profiles.parts.Activity',
		'NextThought.view.profiles.TabPanel'
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
					{ cn: [
						{tag: 'span', 'data-field':'role'},
						{tag: 'span', cls: 'separator', html:' at '},
						{tag: 'span', 'data-field':'affiliation'}]},
					{ 'data-field': 'location' },
					{ cls: 'actions', cn: [
						{cls: 'message', html: 'Message'},
						{cls: 'chat', html: 'Chat'},
						{cls: 'email', html: 'Email'}
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
		actionsEl: '.profile-head .meta .actions',
		messageEl: '.profile-head .meta .actions .message',
		chatEl: '.profile-head .meta .actions .chat',
		emailEl: '.profile-head .meta .actions .email'

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
		console.time(this.timeId);
		UserRepository.getUser(this.username,this.setUser, this, true);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.relayEvents(this.el.parent(),['scroll']);
		this.mon(this.chatEl,'click',this.onChatWith,this);
		this.mon(this.messageEl,'click',this.onMessageUser,this);
		this.mon(this.emailEl,'click',this.onEmailUser,this);
		this.mon(this.editEl,'click',this.onEditAvatar,this);
	},


	//Returns an object with two fields, shouldBeShown and
	//editable that describe how (if at all) the profided profile
	//field should be shown
	getMetaInfoForField: function(user, field, profileSchema){
		var r = {}, val = profileSchema[field];
		r.editable = val && !val.readonly;
		r.shouldBeShown = r.editable || !Ext.isEmpty(user.get(field));
		r.field = field;
		return r;
	},


	updateProfile: function(user, schema){
		var profileSchema = (schema || {}).ProfileSchema || {},
			nameInfo = this.getMetaInfoForField(user, 'alias', profileSchema),
			affiliationInfo = this.getMetaInfoForField(user, 'affiliation', profileSchema),
			locationInfo = this.getMetaInfoForField(user,'location', profileSchema),
			roleInfo = this.getMetaInfoForField(user, 'role', profileSchema),
			roleResult, affiliationResult, me = this;

		this.userObject = user;

		this.mun(this.nameEl,'click',this.editName,this);
		this.mun(this.affiliationEl,'click',this.editMeta,this);
		this.mun(this.roleEl,'click',this.editMeta, this);
		this.mun(this.locationEl,'click',this.editMeta, this);

		//Make more of the UI schema driven

		this.avatarEl.setStyle({backgroundImage: 'url('+user.get('avatarURL')+')'});

		this.nameEl.update(user.getName());
		if(nameInfo.editable){
			this.mon(this.nameEl,'click',this.editName,this);
		}


		function setupMeta(el, info, placeholderText){
			if(info.shouldBeShown){
				el.update(user.get(info.field) || placeholderText);
				if(info.editable){
					me.mon(el,'click',me.editMeta,me);
				}
				return true;
			}
			el.remove();
			return false;
		}

		affiliationResult = setupMeta(this.affiliationEl, affiliationInfo, '{Affiliation}');
		roleResult = setupMeta(this.roleEl, roleInfo, '{Role}');
		setupMeta(this.locationEl, locationInfo, '{Location}');

		if(!roleResult || !affiliationResult){
			this.affiliationSepEl.remove();
		}

		function fieldValidator(val){
			//this will block empty and whitespace only strings
			return !/^\s*$/.test(val||'');
		}

		this.nameEditor = Ext.Editor.create({
			autoSize: { width: 'boundEl' },
			cls: 'name-editor',
			updateEl: true,
			field:{ xtype: 'simpletext', allowBlank:false, validator: fieldValidator },
			listeners:{
				complete: this.onSaveField,
				scope: this
			}
		});

		this.metaEditor = Ext.Editor.create({
			autoSize: { width: 'boundEl' },
			cls: 'meta-editor',
			updateEl: true,
			ignoreNoChange: true,
			revertInvalid: true,
			field:{ xtype: 'simpletext', allowBlank:false, validator: fieldValidator },
			listeners:{
				complete: this.onSaveField,
				scope: this
			}
		});
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

		//Ensure the editor is wide enough to see something...
		function resetWidth(){ t.setWidth(null); }
		if(t.getWidth() < 100){ t.setWidth(100); }
		ed.on({deactivate:resetWidth,single:true});

		ed.startEdit(t);
	},


	onSaveField: function(cmp,newValue/*,oldValue*/){
		var field = cmp.boundEl.getAttribute('data-field'),
			user = this.userObject;

		if(!isMe(user)){
			console.warn('Attempting to edit another user\'s record');
			return;
		}

		function success(){
			console.log(arguments);
		}

		function failure(){
			alert('Could not save your '+field);
			console.error(arguments);
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


	onMessageUser: function(e){
		e.stopEvent();
		console.debug('Clicked Message');
		return false;
	},


	onEditAvatar: function(e){
		e.stopEvent();
		this.fireEvent('edit');
		return false;
	},


	onEmailUser: function(e){
		e.stopEvent();
		console.debug('Clicked Email');
		return false;
	}
});
