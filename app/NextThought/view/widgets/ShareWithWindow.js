Ext.define( 'NextThought.view.widgets.ShareWithWindow', {
	extend: 'Ext.window.Window',
	requires: [
			'NextThought.proxy.UserDataLoader',
			'NextThought.view.widgets.ShareWithInput'
			],
	alias : 'widget.sharewithwindow',
	
	closable: false,
	maximizable:false,
	border: false,
	width: 450,
	modal: true,
	defaults: {border: false, defaults: {border: false, margin: 8}},
	layout: 'fit',
	bbar: ['->',
  		{ xtype: 'button', text: 'Share' },
  		{ xtype: 'button', text: 'Cancel', isCancel: true }
	],
	
	initComponent: function(){
		var m = this,
			u = UserDataLoader.resolveUser(m.record.get('Creator')),
			a = u.get('avatarURL'),
			n = u.get('realname'),
			t = m.record.getModelName(),
			content = m.record.get('text') || 'This item does not have text';
			
		m.callParent(arguments);
		m.add({
			xtype: 'form',
			layout: 'anchor',
			items:[
				{anchor: '100%', html:'<span style="font-size: 16pt; font-weight: normal">Share this...</span>'},
				{anchor: '100%', html:'<img src="'+a+'" width=24 height=24 valign=middle atl="'+n+'"/> '+t+' by '+n+':<hr size=1/>'},
				{anchor: '100%', html:content, padding: '0 0 0 15px'},
				{anchor: '100%', html:'<hr size=1/>'},
				{anchor: '100%', xtype: 'sharewithinput' }
			]
		});

        this.down('sharewithinput').on('select', this._selectSearch, this);
	},

    _selectSearch: function(sel, items) {
    	sel.collapse();
    }
});