

Ext.define('NextThought.view.views.ItemNavigator', {
	extend:'Ext.panel.Panel',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},
	autoScroll: true,
	dockedItems: [{
		xtype: 'toolbar',
		cls: 'x-docked-noborder-top',
		items: [
			{
				text: 'Show me',
				menu: [
					{ text: 'My Stuff', checked: true },
					{ text: 'Everyone\'s Stuff' },
					{ text: 'Cool Stuff&trade;', checked: true },
					'-',
					{ text: 'Notes', checked: true  },
					{ text: 'Highlights', checked: true  },
					{ text: 'Videos' , checked: true },
					{ text: 'Conversations' , checked: true },
					'-',
					{ text: 'Custom' }
				]
			},
			{
				text: 'Sort by',
				menu: [
					{ group: 'sort', text: 'Most recent' },
					{ group: 'sort', text: 'Least recent' },
					{ group: 'sort', text: 'Rank' },
					{ group: 'sort', text: 'Cool Factor&trade;', checked: true }
				]
			}
		]
	}],
	
	icons: {
		video: 'resources/images/video.png',
		bookmark: 'resources/images/bookmark.png',
		note: 'resources/images/notes.png',
		conversation: 'resources/images/conversation.png',
		generic: 'resources/images/generic.png'
	},
	
   	
   	initComponent: function(){
   		this.callParent(arguments);

		var b = _AppConfig.server.host,
			l = _AppConfig.server.relatedContent;   		
   		Ext.Ajax.request({
			url: b+l,
			scope: this,
			success: function(r,o) { this._data = Ext.decode(r.responseText); this._renderList(); },
			failure: function(r,o) { if(NextThought.isDebug) console.log('failed to load data', arguments ); }
		});
   	},
   	
   	
   	_renderList: function(){
   		Ext.each(this._data.thoughts, this._renderListItem, this);
   	},
   	
   	_renderListItem: function(obj){
   		var src = this.icons[ this.icons.hasOwnProperty(obj.type) ? obj.type : 'generic' ];
   		this.add({
   			margin: 2,
   			padding: 5,
   			border: true,
   			title: obj.type+' by <span style="color:blue">'+obj.author+'</span>, on '+obj.dateTime,
   			html: '<img src="'+src+'" style="float: left; margin: 0 5px 5px 5px"/>'+
   				obj.text+'<div style="clear: both">&nbsp;</div>'
   		});
   		
   	}
});
