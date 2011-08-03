

Ext.define('NextThought.controller.Modes', {
    extend: 'Ext.app.Controller',

	views: [
        'modes.Container',
        'navigation.ModeSwitcher'
    ],

    init: function() {
    	 this.control({
            'modeswitcher button': {
                toggle: this.switchModes
            }
        });
    },
    
    
    switchModes: function(button, state){
    	if(state){
	    	button.modeReference.activate();
    	}
    }
});