Ext.define('NextThought.overrides.builtins.Object',{
	overrides: 'Ext.Object',

	statics: {
		defineAttributes: function(obj,attrs){
			var setter = '__defineSetter__',
				getter = '__defineGetter__',
				hasDefineProp = Boolean(Object.defineProperty),
				a, g, s, e = function(){};

			for( a in attrs ){
				if(attrs.hasOwnProperty(a)){
					g = attrs[a].getter || e;
					s = attrs[a].setter || e;
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


	this.defineAttributes($AppConfig,{
		username: {
			getter: function(){ try { return this.userObject.getId(); } catch(e){console.error(e.stack);} },
			setter: function(){ throw 'readonly'; }
		}
	});

});
