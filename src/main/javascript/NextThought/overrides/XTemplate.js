Ext.define('NextThought.overrides.XTemplate',{
	override: 'Ext.XTemplate',
	requires:['NextThought.util.Globals']
});

Ext.override(Ext.XTemplateCompiler,{

    myStringsRe: /\{{3}((?!\{\{\{|\}\}\}).+?\}?)\}{3}/g,

	parse: function(str){
        var t = this.myStringsRe.exec(str);
        if(t){
            //console.debug('(Override)XTemplateCompiler#parse():', t);
            str = str.replace(this.myStringsRe,function(m,key){
                //console.log('Looking up String...',key);
	            //return lookup from strings
                return Globals.getExternalizedString(key,m);
            });
        }
        return this.callParent([str]);
    }

});
