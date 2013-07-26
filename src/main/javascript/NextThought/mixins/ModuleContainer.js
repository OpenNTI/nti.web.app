Ext.define('NextThought.mixins.ModuleContainer', {

    buildModule: function(ns, name,config){
        var m = Ext.createByAlias(ns+'.'+name,Ext.apply({container:this},config)),
            getterName = 'get'+Ext.String.capitalize(name);

        if(this[getterName]){
            console.error('Module getter name taken: '+getterName);
            return;
        }

        this[getterName] = function(){return m;};
    }
});
