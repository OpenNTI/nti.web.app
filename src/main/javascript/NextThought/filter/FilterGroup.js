Ext.define('NextThought.filter.FilterGroup',{
	alternateClassName: 'NextThought.FilterGroup',
	extend: 'NextThought.filter.Filter',

	statics: {
		OPERATION_UNION: 10,
		OPERATION_INTERSECTION: 20
	},

	constructor: function(scope, operation, filteres){
		var me = this;
		me.callParent();
		me.operation = this.clamp([this.self.OPERATION_INTERSECTION,this.self.OPERATION_UNION],operation);
		me.value = [];
		me.scope = scope;
		delete me.fieldName;
		if(Ext.isArray(filteres)){
			Ext.each(filteres,function(v){

				if(!me.addFilter(v)){
					console.error('Bad value in filters:',v);
				}
			});
		}
		else if(filteres){
			Ext.Error.raise('Bad filters value');
		}
	},


	getScope: function(){
		return this.scope;
	},


	addFilter: function(filter){
		if(filter instanceof NextThought.filter.Filter){
			this.value.push(filter);
			return true;
		}
		return false;
	},


	test: function(obj){
		if(this.operation === this.self.OPERATION_INTERSECTION ){
			return this.testIntersection(obj);

		}

		if(this.operation === this.self.OPERATION_UNION) {
			return this.testUnion(obj);
		}

		Ext.Error.raise('Invalid set operation');
	},



	testIntersection: function(obj){
		var v = this.value,
			i = v.length-1,
			t;
		for(;i>=0;i--){
			if(!v[i].test(obj)){
				return false;
			}
		}
		return true;
	},


	testUnion: function(obj){
		var v = this.value,
			i = v.length-1,
			t;
		for(;i>=0;i--){
			if(v[i].test(obj)){
				return true;
			}
		}

		return false;
	}

});
