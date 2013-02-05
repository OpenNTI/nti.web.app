Ext.define('NextThought.view.profiles.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-panel',

	requires:[
		'Ext.Editor',
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
					{ cls: 'name', 'data-field':'name' },
					{ cn: [
						{tag: 'span', 'data-field':'role'},
						' at ',
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
		nameEl: '.profile-head .meta .name',
		roleEl: '.profile-head .meta [data-field=role]',
		editEl: '.profile-head .avatar .edit',
		affiliationEl: '.profile-head .meta [data-field=affiliation]',
		locationEl: '.profile-head .meta [data-field=location]',
		actionsEl: '.profile-head .meta .actions',
		messageEl: '.profile-head .meta .actions .message',
		chatEl: '.profile-head .meta .actions .chat',
		emailEl: '.profile-head .meta .actions .email'

	},

	items: [{
		xtype: 'profile-tabs',
		items: [
			{title: 'Recent Activity', html: 'TestContent'},
			{title: 'Thoughts', html: 'Test'},
			{title: 'Library', disabled: true},
			{title: 'Connections', disabled: true}
		]
	}],

	initComponent: function(){
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

		this.userObject = user;

		this.avatarEl.setStyle({backgroundImage: 'url('+user.get('avatarURL')+')'});
		this.nameEl.update(user.getName());
		this.affiliationEl.update(user.get('affiliation')||'{Affiliation}');
		this.roleEl.update(user.get('role')||'{Role}');
		this.locationEl.update(user.get('location')||'{Location}');

		this.nameEditor = Ext.Editor.create({
			autoSize: { width: 'boundEl' },
			cls: 'name-editor',
			updateEl: true,
			field:{ xtype: 'simpletext' }
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
		var field = cmp.boundEl.getAttribute('data-field');

		console.debug('saving:', field,'=', newValue, 'in', this.userObject);
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
		console.debug('Clicked Edit');
		return false;
	},


	onEmailUser: function(e){
		e.stopEvent();
		console.debug('Clicked Email');
		return false;
	}
});
