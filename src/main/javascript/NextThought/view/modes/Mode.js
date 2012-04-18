Ext.define( 'NextThought.view.modes.Mode', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.mode-container',

	uses: [
		'NextThought.view.widgets.main.ModeSwitcher'
	],

	CENTER_MIN_WIDTH: 256,

	autoScroll: false,
	border: false, 
	frame: false,
	defaults:{ border: false, frame: false },
	layout: { type:'hbox', align: 'stretch'},
	cls: 'x-application-mode-pane',
	items: [],

	initComponent: function(){
		this.addEvents('activate-mode');
		this.callParent(arguments);
		var id = this.id;
		this.modeRef = ModeSwitcher.add(id+' mode label',id+'-mode-icon',this);
	},


	getLeftToolbar: function(){
		return {
			xtype: 'toolbar',
			cls: 'x-docked-noborder-top',
			items: [
				'->',
				{ showChat: true, tooltip: 'Chat', iconCls: 'chat' },
				{ objectExplorer: true, tooltip: 'My Stuff', iconCls: 'object-explorer' } ]
		};
	},


	getRightToolbar: function(){
		return {
			xtype: 'toolbar',
			cls: 'x-docked-noborder-top',
			items: ['Community','->', {text: '&nbsp;',focusable: false, disabled:true}]
		};
	},


	getPlaceHolder: function(){
		return {focusable:false, disabled:true,text:'&nbsp;'};
	},

	activate: function(){
		var me = this,
			ct = me.ownerCt,
			button,
			item = 0;

		if(!ct){
			console.error('No container??');
			return false;
		}

		if (ct.getLayout().getActiveItem() === me) {
			return false;
		}

		ct.fireEvent('activate-mode', me.getId());

		ct.items.each(function(o,i){
			if(o===me) {
				item = i;
				return false;
			}
		},this);

		try{
			ModeSwitcher.set(me.modeRef);

			try{
				ct.getLayout().getActiveItem().deactivate();
			}
			catch(e){
				console.log('Could not call deactivate on active "mode"',e.stack||e.stacktrace,e);
			}

			ct.getLayout().setActiveItem(item);
			me.fireEvent('mode-activated');
			me.getMainComponent().relayout();
		}
		catch(er){
			console.error('Activating Mode: ', er.message, er.stack||er.stacktrace, er);
			return false;
		}
		return true;
	},

	deactivate: function(){
		this.fireEvent('mode-deactivated');
	},

	relayout: function(){
		this.ownerCt.doComponentLayout();
		this.doComponentLayout();
		this.doLayout();
	},

	getMainComponent: function(){
		//implement me in subclasses!
		return this;
	}
	
});
