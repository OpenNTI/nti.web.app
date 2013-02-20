Ext.define('NextThought.mixins.ProfileLinks',{


	/**
	 * Pass in Dom Nodes or Ext.Elements (var arg style) and this will make them clickable and add the css class "over"
	 * when the mouse is hovering over these elements. (it will also remove the class as the mouse leaves)
	 *
	 * This mixin method assumes we are mixed into a class thta is Observable, and has a userObject property (or a user
	 * property), where the object is an instance of {NextThought.model.User}
	 */
	enableProfileClicks: function(){
		var me = this;

		function hoverOn(){ Ext.fly(this).addCls('over'); }
		function hoverOff(){ Ext.fly(this).removeCls('over'); }
		function onUserNameClick(e){
			if(e){e.stopEvent();}
			var u = this.userObject || this.user,
				t = e.getTarget('.note-window');
			//Dismiss the note-window before we navigate to the profile.
			if(t){ this.up('note-window').destroy(); }

			if(u && Ext.isFunction(u.goToProfile)){
				u.goToProfile();
			}
			else {
				console.error('This (',this,') does not have a user object');
			}
			return false;
		}

		Ext.each(arguments,function(el){
			el = Ext.get(el);
			me.mon(el,{click:onUserNameClick, scope:me});
			el.hover(hoverOn,hoverOff);
		});
	}
});
