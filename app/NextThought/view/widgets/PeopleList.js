Ext.define('NextThought.view.widgets.PeopleList', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.people-list',
	requires: [
			'NextThought.proxy.UserDataLoader'
			],
	
	border: false,
	//height: 40,
	defaults: {border: false},
	items:[{html:'People:<hr size=1/>'},{margin: '1 0 1 1'}],
	
	_filter: {},
	_contributors: {},
	
	constructor: function(){
		this.callParent(arguments);
		
		//make a buffered function out of our updater
		this.updateList = Ext.Function.createBuffered(this.updateList,100,this);
		
		return this;
	},
	
	initComponent: function(){
		this.callParent(arguments);
	},
	
	setContributors: function(contributors){
		this._contributors = contributors;
		this.updateList();
	},
	
	applyFilter: function(filter){
		this._filter = filter;
		this.updateList();
	},

	updateList: function(){
		UserDataLoader.getFriends({
			scope: this,
			success: this.listUsers});
	},
	
	listUsers: function(u){
		var c = 0, p = this.items.get(1);
		p.removeAll();
		
		//TODO: update to allow contribs from people not in the filter IF public is in the filter.
		Ext.each(u, function(f){
			var i = f.get('avatarURL'),
				n = f.get('Username');
			
			i = i ? i : Ext.BLANK_IMAGE_URL;
			
			if(c>=10){
				this.add({xtype: 'button', text:'More'});
				return false;
			}
			
			if(this._filter.shareTargets[n] && this._contributors[n]){
				c++;
				p.add({xtype: 'image', src: i, height: 36, width: 36});
			}
			
		},
		this);
	}
});