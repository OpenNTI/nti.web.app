Ext.define('NextThought.overrides.builtins.RegExp',{

},function(){
	Ext.applyIf(RegExp,{
		escape:function me(text) {
			if(!me.Re){
				me.Re = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;
			}
			return text.replace(me.Re, "\\$&");
		}
	});
});
