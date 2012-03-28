Ext.define( 'NextThought.view.modes.Mode', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.mode-container',
	requires: [
			'NextThought.view.widgets.main.LeftColumn',
			'NextThought.view.widgets.main.RightColumn'
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
		var id = this.id,
			modeSwitcher = Ext.ComponentQuery.query('modeswitcher')[0];

		this.toggleButton = modeSwitcher.addMode(id+' mode label',id+'-mode-icon');
		this.toggleButton.modeReference = this;
	},


	getPlaceHolder: function(){
		return {focusable:false, disabled:true,text:'&nbsp;'};
	},


	getEmptyToolbar: function(){
		return { xtype:'toolbar', cls:'x-docked-noborder-top', items:this.getPlaceHolder()};
	},

	getSpacerColumn: function(){
		return { /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: this.getEmptyToolbar() };
	},
	
	activate: function(){
		var ct = this.ownerCt,
			me = this,
			item = 0;

		if(!ct){
			console.error('No container??');
			return false;
		}

		if (ct.getLayout().getActiveItem() === me) {
			return false;
		}

		ct.fireEvent('activate-mode', this.getId());

		ct.items.each(function(o,i){
			if(o===me) {
				item = i;
				return false;
			}
		},this);

		try{
			if(!this.toggleButton.pressed){
				this.toggleButton.toggle(true);
			}
			try{
				ct.getLayout().getActiveItem().deactivate();
			}
			catch(e){
				console.log('Could not call deactivate on active "mode"',e.stack||e.stacktrace,e);
			}
			ct.getLayout().setActiveItem(item);
			this.fireEvent('mode-activated');
			this.getMainComponent().relayout();
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
