

Ext.define('NextThought.events.EventBus', {
	extend: 'Ext.util.Observable',
	
    constructor: function(config) {
    	var knownEvents = {
    		'foo':true
    	};
    	
        this.addEvents(knownEvents);
        this.listeners = config.listeners;
        this.self.superclass.constructor.call(this, config);
        return this;
    }

});