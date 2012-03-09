Ext.define('NextThought.view.widgets.MiniStreamList', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.mini-stream',
	requires: [
		'NextThought.view.widgets.MiniStreamEntry'
	],
	
	border: false,
	margin: '15px auto',
	defaults: {border: false},
	items:[{html:'Recent Items:', cls:'sidebar-header'},{defaults:{border: false}}],


	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		me.on('added',function(){
			FilterManager.registerFilterListener(me, me.applyFilter,me);
		});
	},
	

	applyFilter: function(filter){
		this.filter = filter;
		this.updateStream();
	},


	setStore: function(newStore){
		if( this.store ){
			this.store.un('add', this.updateStream, this);
			this.store.un('load', this.updateStream, this);
		}

		this.store = newStore;
		this.store.on({
			scope: this,
			'add': this.updateStream,
			'load': this.updateStream
		});
	},


	updateStream: function(){
		var c=0,
			s = this.store || {each:Ext.emptyFn},
			p = this.items.get(1),
			f = this.filter,
			overflow = false;

		p.removeAll(true);

		s.each(function(change){

			if( !f || f.test(change) ){
				c++;
				p.add({change: change, xtype: 'miniStreamEntry'});
			}

			if(c > 5 && !overflow){
				overflow = true;
				p.add({xtype: 'button', text: 'More', margin: 5}).on('click',
						function(s){s.hide().next().show();});
				p = p.add({hidden:true, defaults:{border:false}});
			}
		});

		if (!c) {
			p.add({html: 'No recent activity to show'});
		}
	}
});
