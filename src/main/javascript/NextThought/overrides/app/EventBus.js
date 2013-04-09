Ext.define('NextThought.overrides.app.EventBus',{
	override: 'Ext.app.EventBus',

	injectHooks: function(){
		var me = this,
			list = [
				NextThought.view.annotations.Base,
				NextThought.model.Base
			];

		if(Ext.versions.extjs.isGreaterThan('4.1.1.1')){
			console.warn('You\'re using Ext 4.2 or newer, commit to it and replace this hack. Model/Store events are supported natively');
			return;
		}

		Ext.each(list,function(o){
	        Ext.override(o, {
	            fireEvent: function(ev) {
	                if (Ext.util.Observable.prototype.fireEvent.apply(this, arguments) !== false) {
	                    return me.dispatch.call(me, ev, this, arguments);
	                }
	                return false;
	            }
	        });
		});
	}
});
