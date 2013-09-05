Ext.define('NextThought.filter.ValueContainedFilter',{
	extend: 'NextThought.filter.Filter',
	alternateClassName: 'NextThought.ValueContainedFilter',

	compareValue: function(value, testedValue){
		var result = false;
		if(!Ext.isArray(testedValue)){
			return this.callParent(value, testedValue);
		}
		result = Boolean(Ext.Array.contains(testedValue, value));
		if(!result && value.getId){
			return Boolean(Ext.Array.contains(testedValue, value.getId()));
		}
		return result;
	}

});
