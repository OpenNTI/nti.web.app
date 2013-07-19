/**
 * Enables auto-magical delegation of methods.
 *
 * To declare a method in a component as being delegated simply add a property to the method "delegated:true". At the
 * bottom of this file there is a helper class that makes this easy. @see {NextThought.mixins.Delegation.Factory}
 *
 * To attach delegate(s) to a component set the `delegate` config property to be either 'inherit' or a selector of the
 * component that will be delegated to. (It can also be an array if different components care about different aspects)
 */
Ext.define('NextThought.mixins.Delegation',function(){
	var debug = true;

	/** @private */
	function getInheritedDelegates(cmp){
		var ancestor = cmp.up('[delegate]:not([delegate="inherit"])');
		return ancestor && ancestor.delegate;
	}

	/** @private */
	function askDelegate(cmp,fn,args){
		var result = null,
			found = false;

		function getAgent(o,fn){
			return (o.deletgationAgent||{})[fn] || o[fn];
		}

		if(cmp.delegate==='inherit'){
			cmp.delegate = getInheritedDelegates(cmp);
		}

		if(!Ext.isArray(cmp.delegate)){
			cmp.delegate = [cmp.delegate];
		}

		Ext.each(cmp.delegate,function(v,i,a){
			var f;
			if(Ext.isString(v)){
				v = Ext.ComponentQuery.query(v)[0] || v;
			}

			if(!v || !v.isComponent){
				console.debug('No component:', cmp.id, a[i], i, a);
				return;
			}

			f = getAgent(v,fn);
			if(!Ext.isFunction(f)){
				console.warn('The delegate', v.id, 'does not implement', fn);
			}
			else {
				if(found){
					console.error('Multiple delegated functions: ', fn, v.id);
				}
				found = true;
				result = f.apply(v,args);
			}
		});

		return result;
	}

	/** @private */
	function setupDelegates(cmp){
		var k, v;

		function makeDelegate(k,fn,o){
			return function(){
				if(debug){ console.debug('delegating...'+k); }
				var v = askDelegate.apply(o,[o,k,arguments]);
				if(v === DelegateFactory.PREVENT_DEFAULT){return undefined;}
				return v || fn.apply(o,arguments);
			};
		}

		//I WANT all properties... so skipping !hasOwnProperty is not an option.
		/*jslint forin: true */
		for(k in cmp){
			v = cmp[k];
			if(Ext.isFunction(v) && v.delegated){
				if(debug){console.debug('Rewriting...',k);}
				cmp[k] = makeDelegate(k,v,cmp);
			}
		}
	}


	return {
		constructor: function(){
			if(!this.delegate){ return; }
			setupDelegates(this);
		},


		registerDelegationTarget: function(delegate,targetFn){
			var o = {};
			if(Ext.isString(delegate)){
				o[delegate] = Ext.isString(targetFn) ? this[targetFn] : Ext.isFunction(targetFn) ? targetFn : null;
			}
			else if(Ext.isObject(delegate)){
				Ext.Object.each(delegate,this.registerDelegationTarget,this);
			}

			this.deletgationAgent = Ext.apply(this.deletgationAgent||{},o);
		}
	};
});

/**
 * Utility class to aid in defining delegated functions.
 */
Ext.define('NextThought.mixins.Delegation.Factory',{
	singleton: true,
	alternateClassName: 'DelegateFactory',

	/** @property This is a special value to return form a delegated function to prevent the default */
	PREVENT_DEFAULT: {},

	/**
	 * Makes a delegated function with a default of the passed function.
	 *
	 * @param {Function} [fn] The default behavior if there is no delegate or if the delegate does not return
	 *                      {@link #PREVENT_DEFAULT}
	 * @returns {Function} The delegated function.
	 */
	getDelegated: function(fn){
		fn = fn || function(){};
		fn.delegated = true;
		return fn;
	}
},function(){window.DelegateFactory=this;});
