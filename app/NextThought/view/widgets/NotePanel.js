Ext.define('NextThought.view.widgets.NotePanel',{
	extend : 'Ext.panel.Panel',
	alias: 'widget.notepanel',
	requires: ['NextThought.proxy.UserDataLoader'],
	
	cls : 'x-note-panel-cmp',
	layout : 'fit',
	
	initComponent: function(){
		this.callParent(arguments);

		var m = this,
			a = m._annotation,
			c = a._record.get('Creator') || _AppConfig.server.username;
		
		UserDataLoader.resolveUser(c,function(u){
			m.addUserControls(c,u)
		});
	},
	
	
	addUserControls: function(c,u){
		var t = [],
			m = this,
			a = m._annotation;
		if(!u) throw 'bad user';
		t.push({
			xtype: 'image', 
			src: u.get('avatarURL'), 
			height: 16, width: 16
			},
			u.get('realname'));
			
		if(a._isMine){
			t.push('->',
				{ text : 'Edit', eventName: 'edit-note' },
				{ text : 'Share', eventName: 'share-with' },
				{ text : 'Delete', eventName: 'delete' }
				);
		}
		
		m.addDocked({xtype: 'toolbar', dock: 'top', items: t});
		m.addDocked({
            xtype: 'panel',
            dock: 'bottom',
            items: [

                {html: 'Reply'}

            ]
        });
	}
	
	
});
