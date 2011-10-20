Ext.define('NextThought.controller.Google', {
    extend: 'Ext.app.Controller',

    init: function() {
		try{
			this.stateCtlr = this.getController('State');

			if(this.isHangout()){
				gapi.hangout.data.addStateChangeListener(Ext.bind(this.stateChangeListener,this));
				gapi.hangout.addParticipantsListener(Ext.bind(this.participantsListener,this));
				this.stateCtlr.on('stateChange', this.broadcastState, this);
				history.replaceState = function(){};
			}
		}
		catch(e){
			console.error('Could not establish hangout events: ', e.stack);
		}
    },

	isHangout: function(){
		return typeof gapi != 'undefined' && gapi.hangout;
	},

	isReady: function(){
		return this.isHangout() && gapi.hangout.isApiReady();
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

		return false;
	},

	participantsListener: function(){
		console.debug("Participants Listener: ",arguments);
	},

	stateChangeListener: function(adds, removes, state, metadata){
		console.debug("State Change Listener: ",arguments);
		//this.stateCtlr.restoreState();
	}
});
