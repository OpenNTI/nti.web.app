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

	broadcastState: function(delta) {
		console.debug("Hangout: Broadcasting State...");
		try{
			var state = {};
			for(var k in delta){
				state[k] = Ext.JSON.encode(delta[k]);
			}
			gapi.hangout.data.submitDelta(state);
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
		var s = {};
		for(var k in state){
			if(state.hasOwnProperty(k))
				s[k] = Ext.JSON.decode(state[k]);
		}

		this.stateCtlr.restoreState(s);
	}
});
