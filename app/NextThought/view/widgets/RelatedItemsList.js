Ext.define('NextThought.view.widgets.RelatedItemsList', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.related-items',
	requires: [
			'NextThought.proxy.UserDataLoader'
			],
	
	border: false,
	margin: '15px auto',
	defaults: {border: false, defaults: {border: false}},
	
	items:[{html:'Related Items:<hr size=1/>'},{}],
	
	_filter: {},
	
	constructor: function(){
		this.addEvents('navigate');
		this.callParent(arguments);
		
		//make a buffered function out of our updater
		//this.updateList = Ext.Function.createBuffered(this.updateList,100,this);
		
		return this;
	},
	
	initComponent: function(){
		this.callParent(arguments);
	},
	
	setLocation: function(loc){
		var map = this.getRelatedItems(loc),
			id,
			me = this,
			m,
			p = this.items.get(1);
		
		p.removeAll();
		for(id in map){
			if(!map.hasOwnProperty(id))continue;
			
			m  = map[id];
			
			p.add({
				items: {
	  				xtype: 'box',
	  				autoEl: {tag: 'a', href: '#', html: m.label},
	  				listeners: {
    					'afterrender': function(c) {
  							c.el.on('click', function(e){
  								e.preventDefault();
  								
  								me.fireEvent('navigate', m.book, m.book.root+m.href);
  							});
						},
  					}
  				}
			});
		}
		
	},
	
	applyFilter: function(filter){
		this._filter = filter;
	},
	
	
	getRelatedItems: function(loc){
		var related = loc.location.getElementsByTagName('Related'),
			map = {};
		
		Ext.each(related, function(r){
			r = r.firstChild;
			do{
			
			var id = r.getAttribute('ntiid'),
				type = r.getAttribute('type'),
				topic = Ext.DomQuery.selectNode('topic[ntiid='+id+']',loc.toc),
				label = topic.getAttribute('label'),
				href = topic.getAttribute('href');
				
				if(!map[id]){
					map[id] = {
						book: loc.book,
						id: id,
						type: type,
						label: label,
						href: href
					};
				}
			}
			while(r = r.nextSibling); 
			
		},this);
		
		return map;
	}

});