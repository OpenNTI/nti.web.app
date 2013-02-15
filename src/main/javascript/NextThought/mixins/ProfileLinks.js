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

		if($AppConfig.disableProfiles === true){
			return;
		}

		function hoverOn(){ Ext.fly(this).addCls('over'); }
		function hoverOff(){ Ext.fly(this).removeCls('over'); }
		function onUserNameClick(){
			var u = this.userObject || this.user;
			if(u && Ext.isFunction(u.goToProfile)){
				u.goToProfile();
			}
		}

		Ext.each(arguments,function(el){
			el = Ext.get(el);
			me.mon(el,{click:onUserNameClick, scope:me});
			el.hover(hoverOn,hoverOff);
		});
	}
});
