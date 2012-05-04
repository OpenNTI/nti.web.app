Ext.define('NextThought.overrides.builtins.Array',{

},function(){
	Ext.applyIf(Array.prototype,{
		first: function first(){ return this[0]; },
		last: function last(){ return this[this.length-1]; },
		peek: function peek(){ return this[this.length-1]; }
	});
});
