Ext.define('NextThought.view.widgets.RelatedItemsList', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.related-items',
	requires: [
		'NextThought.view.windows.VideoWindow',
		'NextThought.providers.Location'
	],

	border: false,
	defaults: {border: false, defaults: {border: false}},
	items:[{html:'Related Items:', cls: 'sidebar-header'},{cls: 'sidebar-content'}],

	filter: {},
	
	initComponent: function(){
		this.callParent(arguments);
		LocationProvider.on('change',this.setLocation,this);
	},



	setLocation: function(ntiid){
		var me = this,
			map = me.getRelatedItems(LocationProvider.getLocation(ntiid)),
			m,
			p = me.items.get(1),
			c = 0, overflow = false;
		
		p.removeAll(true);

		Ext.Object.each(map,function(id,m){

			var listeners = { 'afterrender': function(c) { c.el.on('click', me.clicked, me, {entry:m}); } },
				label = {
					xtype: 'box',
					autoEl: {tag: 'a', href: '#', html: m.label, cls: 'internal-link', style: 'display: block'},
					listeners: listeners
				},
				icon = {
					xtype: 'box',
					autoEl: {tag: 'img', src: $AppConfig.server.host+m.root+m.icon},
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

			c++;

			if(c > 5 && !overflow){
				overflow = true;
				p.add({xtype: 'button', text: 'More', margin: '5px 0px'}).on('click',
						function(s){s.hide().next().show();});

				p = p.add({hidden:true, defaults:{border:false}});
			}
		});
		
	},

	clicked : function(e,el,opts){
		var m = opts.entry;
		e.preventDefault();

		if(m.type==='index'||m.type==='link') {
			LocationProvider.setLocation(m.id);
		}

		else if(m.type==='video'){
			Ext.create('widget.video-window', {
				title: m.label,
				src:[{
					src: $AppConfig.server.host+m.root+m.href,
					type: 'video/mp4'
				}]
			}).show();

		}
		else {
			console.error('No handler for type:',m.type, m);
		}
	},
	
	applyFilter: function(filter){
		this.filter = filter;
	},
	
	
	getRelatedItems: function(loc){
		if(!loc.location) {
			return {};
		}
		var related = loc.location.getElementsByTagName('Related'),
			map = {};
		
		Ext.each(related, function(r){
			r = r.firstChild;
			do{
				if(!r.getAttribute) {
					continue;
				}

				var tag= r.tagName,
					id = r.getAttribute('ntiid'),
					type = r.getAttribute('type'),
					qual = r.getAttribute('qualifier'),

					target = tag==='page' ? Library.findLocation(id) : null,
					location = target? target.location : null,

					label = location? location.getAttribute('label') : r.getAttribute('title'),
					href = (location? location : r ).getAttribute('href');

				if(!map[id]){
					map[id] = {
						id: id,
						type: type,
						label: label,
						href: href,
						qualifier: qual,
						root: loc.root,
						icon: this.findIcon(r)
					};
				}
			}
			while(!!(r = r.nextSibling));
			
		},this);
		
		return map;
	},

	findIcon: function(node) {
		var nodeIcon = node.getAttribute('icon');

		if (!nodeIcon && node.parentNode) {
			return this.findIcon(node.parentNode);
		}

		return nodeIcon || 'missing-icon.gif';
	}

});
