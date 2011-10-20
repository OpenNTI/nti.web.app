Ext.define('NextThought.controller.Google', {
    extend: 'Ext.app.Controller',

    init: function() {

		var stateCtlr = this.getController('State');

        if(this.isHangout()){
			stateCtlr.on('stateChange', this.broadcastState, this);

            gapi.hangout.data.addStateChangeListener(function(){
                console.log("\n\n\n\nState Change Listener: ",arguments,"\n\n\n\n");
				//stateCtlr.restoreState();
            });
            gapi.hangout.addParticipantsListener(function(){
                console.log("\n\n\n\nParticipants Listener: ",arguments,"\n\n\n\n");
            });
        }
    },

	isHangout: function(){
		return typeof gapi != 'undefined' && gapi.hangout;
	},

	onHangoutReady: function(fn){
		gapi.hangout.addApiReadyListener(fn);
	},

	broadcastState: function(delta){
		gapi.hangout.data.submitDelta({delta:Ext.JSON.encode(delta)});
	}
});
