Ext.define('NextThought.overrides.XTemplate',{
	override: 'Ext.XTemplate',
	applySubtemplate: function(id, values){ return Ext.XTemplate.subs[id].apply(values); }
},function(){
	var c = this;
	c.registerSubtemplate = function(name,tpl){
		c.subs = c.subs || {};
		if(tpl && !(tpl instanceof Ext.XTemplate)){
			tpl = new Ext.XTemplate(tpl);
		}
		c.subs[name] = tpl;
		if(!tpl){
			delete c.subs[name];
		}
	};
});


Ext.override(Ext.XTemplateCompiler,{

    myStringsRe: /\{{3}((?!\{\{\{|\}\}\}).+?\}?)\}{3}/g,

	parse: function(str){
        var t = this.myStringsRe.exec(str);
        if(t){
            console.debug('(Override)XTemplateCompiler#parse():', t);
            str = str.replace(this.myStringsRe,function(m,key){
                console.log('Looking up String...',key);
                //return lookup from strings
                return m;
            });
        }
        return this.callParent([str]);
    }

});
