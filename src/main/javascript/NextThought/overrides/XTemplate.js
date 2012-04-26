Ext.define('NextThought.overrides.XTemplate',{
	override: 'Ext.XTemplate',

	applySubtemplate: function(id, values){
		return Ext.XTemplate.subs[id].apply(values);
	}

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
	}
});
