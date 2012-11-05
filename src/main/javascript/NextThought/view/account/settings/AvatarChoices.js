Ext.define('NextThought.view.account.settings.AvatarChoices',{
	extend: 'Ext.Component',
	alias: 'widget.avatar-choices',

	renderTpl: Ext.DomHelper.markup({
		tag: 'ul',
		cls: 'avatar-choices',
		cn: [
			{tag: 'li', cls: 'custom', cn: [
				{tag: 'img', src: '{customAvatarUrl}'},
				{
					cls: 'wrapper',
					cn: [
						{tag: 'h3', cls: 'title', html:'Custom Photo'},
						{cn:[
							{tag: 'a', cls: 'editCustom', href: '#edit', html: 'Edit'},
							' | ',
							{tag: 'a', cls: 'uploadCustom', href: '#upload', html: 'Upload New Photo'}
						]}
					]
				}
			]},
			{tag: 'li', cls: 'random', cn: [
				{tag: 'img', src: '{randomAvatarUrl}'},
				{
					cls: 'wrapper',
					cn: [
						{tag: 'h3', cls: 'title', html:'Randomly Generated'},
						{cn:[
							{tag: 'a', cls: 'more-random-choices', href: '#moreRandom', html: 'Show More'}
						]}
					]
				}
			]},

			{tag: 'li', cls: 'gravatar hidden', cn: [
				{tag: 'img', src: '{gravatarUrl}'},
				{
					cls: 'wrapper',
					cn: [
						{tag: 'h3', cls: 'title', html:'My Gravatar'},
						{cn:[
							{tag: 'a', cls: 'change gravatar', href: 'http://gravatar.com', html: 'Change', target: '_blank'}
						]}
					]
				}
			]}

		]

	}),

	renderSelectors: {
		list: 'ul.avatar-choices',
		customChoice: 'li.custom',
		randomChoice: 'li.random',
		gravatarChoice: 'li.gravatar',
		moreOptions: 'a.more.random.chouces'
	},


	initComponent: function(){
		var u = (this.user || $AppConfig.userObject),
			c = u.get('AvatarURLChoices'),
			gravatar;

		Ext.each(c,function(url){
			if(/#gravatar/i.test(url)){gravatar = url;}
			return !gravatar;
		});

		this.renderData = Ext.apply(this.renderData||{},{
			customAvatarUrl: NextThought.model.User.getUnresolved().get('avatarURL'),
			randomAvatarUrl: c[0],
			gravatarUrl: gravatar
		});

		this.hasGravatar = Boolean(gravatar);

		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		if(!this.hasGravatar){
			this.gravatarChoice.remove();
			this.updateLayout();
		}
		this.mon( this.list, 'click', this.clickHandler, this);
	},


	clickHandler: function(e){
		e.stopEvent();
		var item = e.getTarget('li', null, true),
			action = e.getTarget('a', null, true);

		if(action){
			action = action.getAttribute('href');
			if(action && this[action.substring(1)]){
				this[action.substring(1)]();
			}
		}
		else {
			this.el.select('.selected').removeCls('selected');
			item.addCls('selected');
		}

		return false;
	},


	edit: function(){},

	upload: function(){
		this.up('account-window').changeView({
			associatedPanel: 'picture-editor',
			pressed: true
		});
	},

	moreRandom: function(){}


});
