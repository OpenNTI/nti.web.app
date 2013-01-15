Ext.define('NextThought.overrides.builtins.Array',{

},function(){
	(function(o,a){
		Ext.Object.each(a,function(k,v){
			if(!o[k]){
				o[k] = v;
				if(Object.defineProperty){
					Object.defineProperty(o,k,{enumerable: false});
				}
			}
		});
	}(Array.prototype,{
		first: function first(){ return this[0]; },
		last: function last(){ return this[this.length-1]; },
		peek: function peek(){ return this[this.length-1]; }
	}));


});
