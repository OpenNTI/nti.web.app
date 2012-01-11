Ext.define( 'NextThought.view.windows.ShareWithWindow', {
	extend: 'Ext.window.Window',
	requires: [
		'NextThought.view.form.fields.ShareWithField',
		'NextThought.util.AnnotationUtils'
	],
	alias : 'widget.sharewithwindow',
	
	closable: false,
	constrain: true,
	maximizable:false,
	border: false,
	width: 450,
	modal: true,
	defaults: {border: false, defaults: {anchor: '100%', border: false, margin: 8}},
	layout: 'fit',
	bbar: ['->',
		{ xtype: 'button', text: 'Share', isOk: true },
		{ xtype: 'button', text: 'Cancel', isCancel: true }
	],
	
	initComponent: function(){
		var m = this,
			u =  NextThought.cache.UserRepository.getUser(m.record.get('Creator')),
			a = u.get('avatarURL'),
			n = u.get('realname'),
			t = m.record.getModelName(),
			sw= m.record.get('sharedWith'),
			readOnly = !m.record.isModifiable(),
			title = readOnly? 'Item Info' : 'Share this...',
			content = AnnotationUtils.getBodyTextOnly(m.record) || 'This item does not have text';
			
		m.callParent(arguments);
		m.add({
			xtype: 'form',
			layout: 'anchor',
			items:[
				{ html:'<span style="font-size: 16pt; font-weight: normal">'+title+'</span>'},
				{ html:'<img src="'+a+'" width=24 height=24 valign=middle atl="'+n+'"/> '+t+' by '+n+':<hr size=1/>'},
				{ html:content, padding: '0 0 0 15px'},
				{ html:'<hr size=1/>'},
				{ xtype: 'sharewith', value: sw, allowBlank: true, readOnly: readOnly }
			]
		});

		if(readOnly){
			m.down('button[isOk]').destroy();
		}
	},

	show: function(){
		this.callParent(arguments);
//		var e = this.down('sharewith');
//		setTimeout(function(){e.focus();}, 500);
	}
});
