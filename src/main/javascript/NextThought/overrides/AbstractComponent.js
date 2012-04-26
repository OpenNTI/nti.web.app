Ext.define('NextThought.overrides.AbstractComponent',{
	override: 'Ext.AbstractComponent',

	up: function(selector) {
		var result = this.ownerCt||this.floatParent;
		if (selector) {
			for (; result; result = result.ownerCt||result.floatParent) {
				if (Ext.ComponentQuery.is(result, selector)) {
					return result;
				}
			}
		}
		return result;
	}

});
