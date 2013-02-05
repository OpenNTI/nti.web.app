Ext.define('NextThought.view.profiles.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-panel',

	requires:[
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
				cls: 'avatar'
			},{
				cls: 'meta',
				cn: [
					{ cls: 'name' },
					{ cn: [{tag: 'span', cls:'role'},' at ',{tag: 'span', cls:'affiliation'}]},
					{ cls: 'location' },
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
		roleEl: '.profile-head .meta .role',
		affiliationEl: '.profile-head .meta .affiliation',
		locationEl: '.profile-head .meta .location',
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
	},


	setUser: function(user){
		console.timeEnd(this.timeId);
		this.fireEvent('loaded');

		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setUser,this,[user]), this, {single: true});
			return;
		}

		this.avatarEl.setStyle({backgroundImage: 'url('+user.get('avatarURL')+')'});
		this.nameEl.update(user.getName());
		this.affiliationEl.update(user.get('affiliation')||'{Affiliation}');
		this.roleEl.update(user.get('role')||'{Role}');
		this.locationEl.update(user.get('location')||'{Location}');
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


	onEmailUser: function(e){
		e.stopEvent();
		console.debug('Clicked Email');
		return false;
	}
});
