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
							{tag: 'a', cls: 'edit', href: '#', html: 'Edit'},
							' | ',
							{tag: 'a', cls: 'upload', href: '#', html: 'Upload New Photo'}
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
							{tag: 'a', cls: 'more-random-choices', href: '#', html: 'Show More'}
						]}
					]
				}
			]},
			{tag: 'li', cls: 'gravatar selected', cn: [
				{tag: 'img', src: '{gravatarUrl}'},
				{
					cls: 'wrapper',
					cn: [
						{tag: 'h3', cls: 'title', html:'My Gravatar'},
						{cn:[
							{tag: 'a', cls: 'change gravatar', href: '#', html: 'Change'}
						]}
					]
				}
			]}

		]

	}),

	renderSelectors: {
		list: 'ul.avatar-choices',
		moreOptions: 'a.more.random.chouces'
	},


	initComponent: function(){
		var u = (this.user || $AppConfig.userObject),
			c = u.get('AvatarURLChoices');

		this.renderData = Ext.apply(this.renderData||{},{
			customAvatarUrl: NextThought.model.User.getUnresolved().get('avatarURL'),
			randomAvatarUrl: c[0],
			gravatarUrl: u.get('avatarURL')
		});


		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon( this.list, 'click', this.clickHandler, this);
	},


	clickHandler: function(e){
		e.stopEvent();
		var item = e.getTarget('li', null, true),
			action = e.getTarget('a', null, true);

		if(action){
			alert('clicked a link');
		}
		else {
			this.el.select('.selected').removeCls('selected');
			item.addCls('selected');
		}


		return false;
	}


});
