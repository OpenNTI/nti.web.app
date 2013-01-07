Ext.define('NextThought.overrides.Component', {
	override: 'Ext.Component',

	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		if(me.tooltip){
			console.log('"',me.tooltip,'"');
			me.setNTTooltip(me.tooltip, true);
			me.el.set({title:undefined});
		}
	},

	setNTTooltip: function(tooltip, initial) {
		var me = this;

		if ( !Ext.isObject(tooltip) ) {
			Ext.QuickTips.register({
				target: me.getEl().id,
				text: tooltip
			});
		}
	}
});