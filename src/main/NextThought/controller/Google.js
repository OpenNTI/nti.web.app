Ext.define('NextThought.controller.Google', {
    extend: 'Ext.app.Controller',

    init: function() {
		try{
			this.stateCtlr = this.getController('State');

			if(this.isHangout()){
				gapi.hangout.data.addStateChangeListener(Ext.bind(this.stateChangeListener,this));
				gapi.hangout.addParticipantsListener(Ext.bind(this.participantsListener,this));
				this.stateCtlr.on('stateChange', this.broadcastState, this);
			}
		}
		catch(e){
			console.error('Could not establish hangout events: ', e.stack);
		}
    },

	isHangout: function(){
		return typeof gapi != 'undefined' && gapi.hangout;
	},

	onHangoutReady: function(fn){
		console.info("Starting app in Hangout Mode");
		gapi.hangout.addApiReadyListener(fn);
	},

	broadcastState: function(delta){
		try{
			console.debug("Hangout: Broadcasting State...");
			gapi.hangout.data.submitDelta({delta:Ext.JSON.encode(delta)});
		}
		catch(e){
			console.error('Could not broadcast state',e.stack);
		}
	},

	participantsListener: function(){
		console.debug("\n\n\n\nParticipants Listener: ",arguments,"\n\n\n\n");
	},

	stateChangeListener: function(){
		console.debug("\n\n\n\nState Change Listener: ",arguments,"\n\n\n\n");
		//this.stateCtlr.restoreState();
	}
});
