Ext.define('NextThought.view.widgets.MiniStreamList', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.mini-stream',
	requires: [
			'NextThought.proxy.UserDataLoader',
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

	updateStream: function(changes){
		var k, change, c=0, u,
			p = this.items.get(1),
			f = this._filter;
			
		p.removeAll();

		for(k in changes){
			if(!changes.hasOwnProperty(k))continue;
			change = changes[k];

            if (!change.get) {
                //dead change, probably deleted...
                continue;
            }

            u = change.get('Creator');

			if( /all/i.test(f.groups) || f.shareTargets && f.shareTargets[ u ] || (f.includeMe && f.includeMe==u)){
				c++;
                p.add({change: change, xtype: 'miniStreamEntry'});
			}
		}

        if (!c) p.add({html: 'No recent activity to show'});
	}
});
