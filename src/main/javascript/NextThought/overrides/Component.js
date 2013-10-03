Ext.define('NextThought.overrides.Component', {
	override: 'Ext.Component',
	requires: ['NextThought.mixins.Delegation'],


	constructor: function() {
		this.shadow = false;
		this.callParent(arguments);
		this.initDelegation();
		this.setNTTooltip();
	},


	setNTTooltip: function() {
		if (!this.rendered) {
			this.on('afterrender', 'setNTTooltip', this, {single: true});
			return;
		}

		if (this.tooltip) {
			if (!Ext.isObject(this.tooltip)) {
				Ext.QuickTips.register({
					target: this.getEl().id,
					text: this.tooltip
				});
			}
			this.el.set({title: undefined});
		}
	},


	rtlSetLocalX: function(x) {
		var style = this.el.dom.style;
    style.left = 'auto';
    style.right = (x === null) ? 'auto' : x + 'px';
	},


	isOwnerLayout: function(type) {
		var o = this.ownerLayout;
		return o && o.type === type;
	}


},function() {
	Ext.Component.mixin('delegation', NextThought.mixins.Delegation);
});
