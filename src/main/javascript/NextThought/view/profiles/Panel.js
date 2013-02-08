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
			{title: 'Library', disabled: true},
			{title: 'Connections', disabled: true}
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
		UserRepository.getUser(this.username,this.setUser, this);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.chatEl,'click',this.onChatWith,this);
		this.mon(this.messageEl,'click',this.onMessageUser,this);
		this.mon(this.emailEl,'click',this.onEmailUser,this);
		this.mon(this.editEl,'click',this.onEditAvatar,this);
	},


	setUser: function(user){
		console.timeEnd(this.timeId);
		this.fireEvent('loaded');

		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setUser,this,[user]), this, {single: true});
			return;
		}

		var canEdit = isMe(user),
			affiliation = user.get('affiliation')||(canEdit?'{Affiliation}':''),
			role = user.get('role')||(canEdit?'{Role}':''),
			location = user.get('location')||(canEdit?'{Location}':'');

		this.userObject = user;

		this.avatarEl.setStyle({backgroundImage: 'url('+user.get('avatarURL')+')'});
		this.nameEl.update(user.getName());
		this.affiliationEl.update(affiliation);
		this.roleEl.update(role);
		this.locationEl.update(location);

		if(!canEdit){
			if(!affiliation){this.affiliationEl.remove();}
			if(!role){this.roleEl.remove();}
			if(!location){this.locationEl.remove();}
			if(!affiliation || !role){
				this.affiliationSepEl.remove();
			}

			this.avatarEditEl.remove();
			return;
		}

		this.nameEditor = Ext.Editor.create({
			autoSize: { width: 'boundEl' },
			cls: 'name-editor',
			updateEl: true,
			field:{ xtype: 'simpletext' },
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
			field:{ xtype: 'simpletext', allowBlank:false },
			listeners:{
				complete: this.onSaveField,
				scope: this
			}
		});

		this.mon(this.nameEl,'click',this.editName,this);
		this.mon(this.affiliationEl,'click',this.editMeta,this);
		this.mon(this.roleEl,'click',this.editMeta, this);
		this.mon(this.locationEl,'click',this.editMeta, this);
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
