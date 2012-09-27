Ext.define('NextThought.filter.FilterGroup',{
	alternateClassName: 'NextThought.FilterGroup',
	extend: 'NextThought.filter.Filter',

	statics: {
		OPERATION_UNION: 10,
		OPERATION_INTERSECTION: 20
	},

	isFilterGroup: true,

	constructor: function(scope, operation, filteres){
		var me = this;
		me.callParent(null);
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


	flatten: function(){
		var filters = [];
		Ext.each(this.value,function(f){
			filters.push.apply(filters, f.flatten());
		});
		return filters;
	},


	toString: function(){
		if(this.value.length ===1){
			return this.value[0].toString();
		}

		return Ext.String.format('{"operation":"{0}", "filters":[{1}]}',
				(this.operation===this.self.OPERATION_UNION
						? 'union'
						: this.operation===this.self.OPERATION_INTERSECTION
							? 'intersection'
							: 'unknown' ),
				this.value);
	},


	equals: function(o){
		if(!o){
			return false;
		}

		function same(a,b){
			if(!Ext.isArray(a) || !Ext.isArray(b) || a.length !== b.length){
				return false;
			}
			var i = a.length-1;
			for(i;i>=0;i--){
				if(!m.contains.call(b,a[i])){ return false; }
			}
			return true;
		}

		var m = this;
		return (	same(m.value,o.value)
				&&	m.operation	=== o.operation
				&&	m.scope		=== o.scope
			);
	},


	getScope: function(){
		return this.scope;
	},


	contains: function(filter){
		var v = this.value||this,//or 'this' allows us to call this on arrays.
			i = v.length-1;
		for(i; i>=0; i--){
			if(v[i].equals(filter)){ return true; }
		}
		return false;
	},


	addFilter: function(filter){
		if(filter instanceof NextThought.filter.Filter
		&&(filter instanceof NextThought.filter.FilterGroup || !this.contains(filter))){
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

		return Ext.Error.raise('Invalid set operation');//i know it doesn't return, this makes the lint/validator happy
	},



	testIntersection: function(obj){
		var v = this.value,
			i = v.length-1;
		for(i;i>=0;i--){
			if(!v[i].test(obj)){
				return false;
			}
		}
		return true;
	},


	testUnion: function(obj){
		var v = this.value,
			i = v.length-1;
		for(i;i>=0;i--){
			if(v[i].test(obj)){
				return true;
			}
		}

		return false;
	}

});
