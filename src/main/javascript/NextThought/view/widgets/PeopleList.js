Ext.define('NextThought.view.widgets.PeopleList', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.people-list',
	requires: [
		'NextThought.providers.Contributors'
	],

	mixins:{
		avatars: 'NextThought.mixins.AvatarInformation'
	},

	border: false,
	defaults: {border: false},
	items:[{html:'People:', cls: 'sidebar-header'},{cls: 'sidebar-content'}],

	constructor: function(){
		this.contributors = {};
		this.callParent(arguments);
		this.mixins.avatars.constructor.call(this);
		//make a buffered function out of our updater
		this.updateList = Ext.Function.createBuffered(this.updateList,100,this);
	},


	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		ContributorsProvider.on('change',me.setContributors,me);
		me.on('added',function(){
			FilterManager.registerFilterListener(me, me.applyFilter,me);
		});
	},


	setContributors: function(contributors){
		this.contributors = contributors;
		this.updateList();
	},
	
	applyFilter: function(filter){
		this.filter = filter;
		this.updateList();
	},

	updateList: function(){
		var k, c = 0,
			me = this,
			p = me.items.get(1),
			f = me.filter;

		function userLoaded(users){
			var u = users[0],
				c = p.add({	xtype: 'image',
						src: (u? u.get('avatarURL') : Ext.BLANK_IMAGE_URL),
						height: 36, width: 36});

				me.setupAvatarDetailToolTip(c, u);
		}


		p.removeAll();

		for(k in me.contributors){
			if(me.contributors.hasOwnProperty(k)) {
				if(c>=10){
					p.add({xtype: 'button', text:'More'});
					break;
				}

				if(!f || f.test({'Creator':k,'$className':'String'})){
					c++;
					UserRepository.prefetchUser(k, userLoaded);
				}
			}
		}

	}
});
