Ext.define('NextThought.mixins.ChatLinks', {

	/*
	 * This mixin assumes we are mixed into a class that is Observable, and has a userObject property (or a user
	 * property), where the object is an instance of {NextThought.model.User}.
	 */

	shouldShowChat: function(){
		//We show the chat button if the following conditions are true
		//1)We can chat and we have a user object
		//2)The profile we are looking at is not us
		//3)The user is online
		if(this.user){
			this.userObject = this.user;
		}

		if(!this.userObject || isMe(this.userObject) || !$AppConfig.service.canChat()){
			return false;
		}

		//Note obviously this doesn't update live when users come and go.
		//FIXME: we are getting Community entities in here? are they expected? for now just check if the have getPresence method
		if(this.userObject.getPresence){
			return this.userObject.getPresence().isOnline();
		}
		return false;
	},

	maybeShowChat: function(el){
		if(!el){
			console.error('Error: No chat element was passed to maybeShowChat.');
			return;
		}

		var me = this;
		if(me.shouldShowChat()){
			el.show();
		}
		else{
			el.hide();
		}
		me.mon(el, {click: me.onChatWith, scope:me});
	},

	onChatWith: function(e){
		e.stopEvent();
		if(!this.userObject && !this.user){
			console.warn('No userobject to chat with');
			return false;
		}
		console.debug('Clicked Chat');
		this.fireEvent('chat', this.userObject || this.user);
		return false;
	}

});