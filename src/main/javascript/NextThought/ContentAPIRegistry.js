/**
 * TODO: Explain this class.
 */
Ext.define('NextThought.ContentAPIRegistry',{
	singleton: true,
	mixins: {
		observable: 'Ext.util.Observable'
	},

	constructor: function(){
		this.mixins.observable.constructor.call(this);
		this.addEvents('update');
		this.registry = {};
	},


	/**
	 *
	 * @param publicName
	 * @param fn
	 * @param scope
	 */
	register: function(publicName, fn, scope){
		if(typeof publicName !== 'string'){
			Ext.Error.raise('publicName must be a string');
		}
		else if(!Ext.isFunction(fn)){
			Ext.Error.raise('fn must be a function');
		}
		else if(this.registry[publicName]){
			Ext.Error.raise('The function "'+publicName+'" is already registered.');
		}

		this.registry[publicName] = function(){ return fn.apply(scope||this,arguments); };
		this.fireEvent('update',this);
	},


	/**
	 *
	 */
	getAPI: function(){
		return Ext.clone(this.registry);
	}


},function(){
	window.ContentAPIRegistry = this;
});
