Ext.define('NextThought.view.widgets.RelatedItemsList', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.related-items',
	requires: [
			'NextThought.proxy.UserDataLoader',
            'NextThought.view.windows.VideoWindow'
			],

    border: false,
	defaults: {border: false, defaults: {border: false}},
    padding: 5,
    items:[{html:'Related Items:', cls: 'sidebar-header'},{}],

	_filter: {},
	
	constructor: function(){
		this.addEvents('navigate');
		this.callParent(arguments);
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

            var listeners = { 'afterrender': function(c) { c.el.on('click', me.clicked, me, {entry:m}); } },
                label = {
                    xtype: 'box',
                    autoEl: {tag: 'a', href: '#', html: m.label, cls: 'internal-link', style: 'display: block'},
                    listeners: listeners
                },
                icon = {
                    xtype: 'box',
                    autoEl: {tag: 'img', src: _AppConfig.server.host+m.icon},
                    listeners: listeners
                };


            p.add({
                cls: 'related-item',
                layout: {
                    type:'hbox',
                    align: 'middle'
                },
                items: [icon, label]
			});

            //TODO: limit the number of items and add a 'more' link to show them all


		}
		
	},

    clicked : function(e,el,opts){
        var m = opts.entry;
        e.preventDefault();

        if(m.type=='index'||m.type=='link')
            this.fireEvent('navigate', m.book, m.book.get('root')+m.href);

        else if(m.type=='video'){
            Ext.create('widget.video-window', {
                title: m.label,
                src:[{
                    src: _AppConfig.server.host+m.book.get('root')+m.href,
                    type: 'video/mp4'
                }]
            }).show();

        }
        else console.log('No handler for type:',m.type, m);
    },
	
	applyFilter: function(filter){
		this._filter = filter;
	},
	
	
    getRelatedItems: function(loc){
        if(!loc.location) return {};
        var related = loc.location.getElementsByTagName('Related'),
            map = {};
		
        Ext.each(related, function(r){
            r = r.firstChild;
            do{
                if(!r.getAttribute)continue;

                var tag= r.tagName,
                    id = r.getAttribute('ntiid'),
                    type = r.getAttribute('type'),
                    qual = r.getAttribute('qualifier'),

                    target = tag=='page' ? NextThought.librarySource.findLocation(id) : null,
                    location = target? target.location : null,
                    book = target? target.book : loc.book,

                    label = location? location.getAttribute('label') : r.getAttribute('title'),
                    href = (location? location : r ).getAttribute('href'),
                    icon = this.findIcon(r);

                if(!map[id]){
                    map[id] = {
                        book: book,
                        id: id,
                        type: type,
                        label: label,
                        href: href,
                        qualifier: qual,
                        icon: icon? book.get('root')+icon : book.get('icon')
                    };
                }
            }
            while(r = r.nextSibling);
			
        },this);
		
        return map;
    },

    findIcon: function(node) {
        var nodeIcon = node.getAttribute('icon');

        if (!nodeIcon && node.parentNode) return this.findIcon(node.parentNode);

        return nodeIcon;
    }

});