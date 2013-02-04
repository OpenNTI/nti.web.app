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
				cn: [{
					cls: 'name'
				},{
					html: 'Front-End Engineer at NextThought'
				},{
					html: 'Norman, OK'
				}]
			}]
		},
		{
			id: '{id}-body',
			cls:'profile-items',
			html:'{%this.renderContainer(out,values)%}'
		}
	]),

	renderSelectors: {
		avatar: '.profile-head .avatar',
		name: '.profile-head .meta .name'
	},

	items: [{
		xtype: 'profile-tabs',
		items: [
			{title: 'A', html: 'Test'},
			{title: 'B', html: 'Test'},
			{title: 'C', html: 'Test'},
			{title: 'D', html: 'Test'}
		]
	}],

	initComponent: function(){
		this.callParent(arguments);
		this.addEvents('loaded');
		this.timeId = 'Resolve User:'+this.username;
		console.time(this.timeId);
		UserRepository.getUser(this.username,this.setUser, this);
	},


	setUser: function(user){
		console.timeEnd(this.timeId);
		this.fireEvent('loaded');

		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setUser,this,[user]), this, {single: true});
			return;
		}

		this.avatar.setStyle({backgroundImage: 'url('+user.get('avatarURL')+')'});
		this.name.update(user.getName());
	}
});
