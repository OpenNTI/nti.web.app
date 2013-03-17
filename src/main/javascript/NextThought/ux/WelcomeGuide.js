Ext.define('NextThought.ux.WelcomeGuide', {
	extend: 'NextThought.view.Window',
	alias: 'widget.welcome-guide',

	cls:'guide-window',
	width: 695,
	height: 640,
	layout: 'fit',
	modal: true,
	header: false,
	items: [{
		xtype: 'component',
		cls: 'help-iframe',
		autoEl: {
			tag: 'iframe',
			src: '{url}',
			frameBorder: 0,
			marginWidth: 0,
			marginHeight: 0,
			seamless: true,
			transparent: true,
			allowTransparency: true,
			style: 'overflow-x: hidden; overflow-y:auto'
		}
	}],
	dockedItems:{
		xtype: 'container',
		dock:'bottom',
		ui: 'footer',
		height:55,
		baseCls: 'nti-window',
		layout: {
			type: 'hbox',
			align: 'stretchmax'
		},
		defaults:{
			cls: 'footer-region',
			xtype: 'container',
			flex: 1,
			layout: 'hbox'
		},
		items:[{
			layout: {type:'hbox', pack:'end'},
			defaults: { xtype:'button', ui:'blue', scale:'large'},
			items:[
				//{text: 'Learn More',  action: 'more', ui: 'secondary', handler: function(b, e){ e.stopEvent();b.up('window').learnMore(); } },
				{text: 'Get Started!', cls:'.x-btn-blue-large dismiss', action: 'cancel', handler: function(b, e){ e.stopEvent(); b.up('window').close();}}
			]
		}]
	},

	initComponent: function(){
		this.callParent(arguments);
		this.down('component[cls=help-iframe]').autoEl.src = this.link.href;
		this.on('show', this.addCustomMask, this);
		this.on('close', this.removeCustomMask, this);
		if(this.deleteOnDestroy){
			this.on('destroy', this.deleteLink, this);
		}
	},

	addCustomMask: function(){
		var mask = this.zIndexManager.mask;
		mask.addCls('nti-black-clear');
	},


	removeCustomMask: function(){
		var mask = this.zIndexManager.mask;
		if(mask){
			mask.removeCls('nti-black-clear');
		}
	},


	learnMore: function(){
		console.log('Learn more was clicked');
		this.fireEvent('go-to-help');
		this.close();
	},

	deleteLink: function(){
		Ext.Ajax.request({
			url: this.link.href,
			method: 'DELETE',
			success: function(r, opts){
				console.log('Success: ', arguments);
			},
			fail: function(r, opts){
				console.log('Fail: ', arguments);
			}
		});
	}
});
