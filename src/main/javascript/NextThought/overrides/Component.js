Ext.define('NextThought.overrides.Component', {
	override: 'Ext.Component',
	requires:['NextThought.mixins.Delegation'],

	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		if(me.tooltip){
			me.setNTTooltip(me.tooltip);
			me.el.set({title:undefined});
		}
	},


	setNTTooltip: function(tooltip) {
		var me = this;
		if ( !Ext.isObject(tooltip) ) {
			Ext.QuickTips.register({
				target: me.getEl().id,
				text: tooltip
			});
		}
	},

	constructor: function(){
		this.shadow = false;
		this.callParent(arguments);
		this.mixins.delegation.constructor.call(this);
	},


	rtlSetLocalX: function(x){
		var style = this.el.dom.style;
        style.left = 'auto';
        style.right = (x === null) ? 'auto' : x + 'px';
	}

},function(){
	Ext.Component.mixin('delegation',NextThought.mixins.Delegation);
});
