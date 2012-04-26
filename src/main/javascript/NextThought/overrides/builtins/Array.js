Ext.define('NextThought.overrides.builtins.Array',{

},function(){
	Ext.applyIf(Array.prototype,{
		first: function peek(){ return this[0]; },
		last: function peek(){ return this[this.length-1]; },
		peek: function peek(){ return this[this.length-1]; }
	});
});
