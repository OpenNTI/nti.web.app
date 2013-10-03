Ext.define('NextThought.mixins.IsListening', {

	isListening: function(event, fn, scope) {
		var evt = this.events[event] || {},
			listeners = evt.listeners || [],
			found = false;

		Ext.each(listeners, function(l) {
			found = (l.scope === scope && l.fn === fn);
			return !found;
		});

		return found;
	}
});
