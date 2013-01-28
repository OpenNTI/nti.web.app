Ext.define('NextThought.overrides.app.EventBus',{
	override: 'Ext.app.EventBus',

	injectHooks: function(){
		var me = this,
			list = [
				NextThought.view.annotations.Base,
				NextThought.model.Base
			];

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
