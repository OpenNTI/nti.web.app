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
	
	_filter: {},

	applyFilter: function(filter){
		this._filter = filter;
		this.updateStream();
	},


	setStore: function(newStore){
		if( this._store ){
			this._store.un('add', this.updateStream, this);
			this._store.un('load', this.updateStream, this);
		}

		this._store = newStore;
		this._store.on({
			scope: this,
			'add': this.updateStream,
			'load': this.updateStream
		});
	},


	updateStream: function(){
		var c=0, u,
			s = this._store || {each:Ext.emptyFn},
			p = this.items.get(1),
			f = this._filter,
			overflow = false;

		p.removeAll(true);

		s.each(function(change){

			if (!change.get) {
				console.debug('do we still get this?');
				return;
			}

			u = change.get('Creator');

			if( (/all/i).test(f.groups) || (f.shareTargets && f.shareTargets[ u ]) || (f.includeMe && f.includeMe===u)){
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
