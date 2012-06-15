Ext.define('NextThought.overrides.builtins.Object',{
	overrides: 'Object',

	statics: {
		defineAttributes: function(obj,attrs){
			var setter = '__defineSetter__',
				getter = '__defineGetter__',
				hasDefineProp = Boolean(Object.defineProperty),
				a, g, s;

			for( a in attrs ){
				if(attrs.hasOwnProperty(a)){
					g = attrs[a].getter || function(){};
					s = attrs[a].setter || function(){};
					if(hasDefineProp){
						Object.defineProperty(obj,a,{ enumerable: true, set: s, get: g });
					}
					else{
						obj[setter](a,s);
						obj[getter](a,g);
					}
				}
			}
		}
	}

},function(){

});
