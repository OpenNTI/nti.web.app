Ext.define('NextThought.filter.Filter',{
	alternateClassName: 'NextThought.Filter',

	statics: {
		OPERATION_INCLUDE: 1,
		OPERATION_EXCLUDE: 2
	},

	constructor: function(fieldName, operation, value){
		this.fieldName = fieldName;
		this.value = value;
		this.operation = this.clamp([this.self.OPERATION_EXCLUDE,this.self.OPERATION_INCLUDE], operation);
	},

	/**
	 * Limit value to the list, if the value isn't in the list, use the first option in the list.
	 * @protected
	 */
	clamp: function(options,value){
		var i=options.length-1;
		for(i;i>=0;i--){ if(options[i]===value){ return value; } }
		return options[0];
	},

	flatten: function(){ return [this]; },

	toString: function(){
		return Ext.String.format('{"{0}":"{1}", "operation": "{2}"}',
				this.fieldName, this.value,
				this.operation === this.self.OPERATION_EXCLUDE
						? 'exclude'
						: this.operation === this.self.OPERATION_INCLUDE
							? 'include'
							: 'unknown');
	},

	equals: function(o){
		if(!o){
			return false;
		}
		return (	this.fieldName	=== o.fieldName
				&&	this.value		=== o.value
				&&	this.operation	=== o.operation
			);
	},

	test: function(obj){
		var f = this.fieldName,
			v = this.value,
			o = this.operation,
			t;

		if(!Ext.isObject(obj)){
			Ext.Error.raise('Invalid test object');
		}
//debugger;
		t = obj[f];
		t = (Ext.isFunction(t)
				? t.call(obj)
				: t===undefined && obj.get
					? obj.get(f)
					: t);

		t = (v==='Everyone' && f === 'Creator') || this.compareValue(v,t);

//		console.debug(t,this.toString());

		return o === this.self.OPERATION_EXCLUDE
				? !t
				: o === this.self.OPERATION_INCLUDE
					? t
					: Ext.Error.raise('Invalid filter operation');
	},


	compareValue: function(value, testedValue){
		var result = false;

		if(value.isModel && value.isGroup){
			value = value.get('friends');
		}
		if(Ext.isArray(value)){
			result = Ext.Array.contains(value, testedValue);
		}
		else {
			result = value === testedValue;
		}

		return Boolean(result);
	}

});
