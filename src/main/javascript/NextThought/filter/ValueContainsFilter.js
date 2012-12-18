Ext.define('NextThought.filter.ValueContainsFilter',{
	extend: 'NextThought.filter.Filter',
	alternateClassName: 'NextThought.ValueContainsFilter',

	compareValue: function(value, testedValue){
		var result = false;

		if(value.isModel && value.isGroup){
			value = value.get('friends');
		}

		if(!Ext.isArray(value)){
			return this.callParent(value, testedValue);
		}
		result = Boolean(Ext.Array.contains(value, testedValue));
		if(!result && testedValue.getId){
			return this.compareValue(value, testedValue.getId());
		}
		return result;
	}

});
