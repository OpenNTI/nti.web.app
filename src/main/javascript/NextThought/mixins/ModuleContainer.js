Ext.define('NextThought.mixins.ModuleContainer', {

	getterNameForModule: function(name){
		return 'get'+Ext.String.capitalize(name);
	},


    buildModule: function(ns, name,config){
        var m = Ext.createByAlias(ns+'.'+name,Ext.apply({container:this},config)),
            getterName = this.getterNameForModule(name);

        if(config && config.hasOwnProperty('moduleName')){
            getterName = this.getterNameForModule(config.moduleName);
        }

        console.log('getterName:' + getterName + "|");

        this[getterName] = function(){return m;};
    },

	//Returns a function that will forward the function specified by fnName
	//to the given module
	forwardToModule: function(name, fnName){
		var getter = this.getterNameForModule(name),
			module = Ext.isFunction(this[getter]) && this[getter]();
		if(!module || !Ext.isFunction(module[fnName])){
			console.error('No module named ', name, ' or the module has no function named', fnName);
			return Ext.emptyFn;
		}

		return function(){
			return module[fnName].apply(module, arguments);
		};
	}
});
