Ext.define('NextThought.view.widgets.PeopleList', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.people-list',
	requires: [
			'NextThought.proxy.UserDataLoader'
			],
	
	border: false,
	//height: 40,
	defaults: {border: false},
	items:[{html:'People:', cls: 'sidebar-header'},{margin: '1 0 1 1'}],
	
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
		var k, c = 0, p = this.items.get(1), f = this._filter;
		p.removeAll();
		for(k in this._contributors){
			this._contributors.hasOwnProperty(k);
			if(c>=10){
				p.add({xtype: 'button', text:'More'});
				break;
			}
				
			if(f.shareTargets && f.shareTargets[k]){
				c++;
				UserDataLoader.resolveUser(k, function(f){
					p.add({	xtype: 'image', 
							src: (f? f.get('avatarURL') : Ext.BLANK_IMAGE_URL), 
							height: 36, width: 36});
				});
			}
		}

        (c==0? this.hide : this.show).call(this);
	}
});