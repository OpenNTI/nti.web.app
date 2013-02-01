Ext.define('NextThought.view.profiles.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-panel',

	childEls: ['body'],
	getTargetEl: function () { return this.body; },
	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'profile-head',
			cn: [{
				tag: 'img',
				cls: 'avatar',
				src: Ext.BLANK_IMAGE_URL
			},{
				cls: 'meta',
				cn: [{
					cls: 'name'
				},{
					cls: 'etc'
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
		avatar: '.profile-head img',
		name: '.profile-head .meta .name'
	},

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

		this.avatar.set({src: user.get('avatarURL')});
		this.name.update(user.getName());
	}
});
