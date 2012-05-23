/**
 * https://developers.google.com/+/hangouts/reference
 */
Ext.define('NextThought.controller.Google', {
	extend: 'Ext.app.Controller',

	init: function() {
		try{
			var hangout = this.hangout = window.gapi===undefined ? null : gapi.hangout;
			this.stateCtlr = this.getController('State');


			if(this.isHangout()){
				gapi.hangout.data.onStateChanged.add(Ext.bind(this.stateChangeListener,this));
//				gapi.hangout.onAppVisible.add()
//				gapi.hangout.onDisplayedParticipantChanged.add()
//				gapi.hangout.onEnabledParticipantsChanged.add()
//				gapi.hangout.onParticipantsAdded.add()
//				gapi.hangout.onParticipantsChanged.add()
//				gapi.hangout.onParticipantsDisabled.add()
//				gapi.hangout.onParticipantsEnabled.add()
//				gapi.hangout.onParticipantsRemoved.add()

				//log events
				Ext.each( [
					'onAppVisible',
					'onDisplayedParticipantChanged','onEnabledParticipantsChanged',
					'onParticipantsAdded','onParticipantsChanged','onParticipantsDisabled',
					'onParticipantsEnabled','onParticipantsRemoved'
				], function (event){
					hangout[event].add(function(){
						console.debug(event, arguments);
					});
				});

				this.stateCtlr.on('stateChange', this.broadcastState, this);
				history.replaceState = function(){};
			}
		}
		catch(e){
			console.error('Could not establish hangout events: ', e.stack);
		}
	},

	isHangout: function(){
		return typeof gapi !== 'undefined' && gapi.hangout;
	},


	onHangoutReady: function(fn){
		console.info("Starting app in Hangout View");
		gapi.hangout.addApiReady.add(function(e) {
			if (e.isApiReady) {
				fn();
			}
		});
	},

	broadcastState: function(delta) {
		console.debug("Hangout: Broadcasting State...");
		var state = {}, k;
		try{
			for(k in delta){
				if (delta.hasOwnProperty(k)) {
					state[k] = Ext.JSON.encode(delta[k]);
				}
			}
			gapi.hangout.data.submitDelta(state);
		}
		catch(e){
			console.error('Could not broadcast state',e.stack);
		}

		return false;
	},


	stateChangeListener: function(stateChangedEvent){
		console.debug("State Change Listener: ",arguments);
		var state=stateChangedEvent.state,
			s = {}, k;

		for(k in state) {
			if(state.hasOwnProperty(k)) {
				s[k] = Ext.JSON.decode(state[k]);
			}
		}

		this.stateCtlr.restoreState(s);
	}
});
