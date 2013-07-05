Ext.define('NextThought.mixins.ProfileLinks',function(){
	var contactCardPopout, showCardTimer,
	 canShow;
	//the scope is being set by the caller
	function onUserNameClick(e){
		if(e){e.stopEvent();}
		var u = this.userObject || this.user,
			t = e.getTarget('.note-window');

		//FIXME this doesn't belong here.
		//Dismiss the note-window before we navigate to the profile.
		if(t){ this.up('note-window').destroy(); }

		if(u && Ext.isFunction(u.getProfileUrl)){
			this.fireEvent('change-hash', u.getProfileUrl());
		}
		else {
			console.error('This (',this,') does not have a user object');
		}
		return false;
	}


	function showCard(e, el){
		var Popup = NextThought.view.account.contacts.management.Popout,
			pop,
			user = this.userObject || this.user;

		if(!user || this instanceof Popup || !Popup.beforeShowPopup(user, el)){ return; }
		
		pop = contactCardPopout;

		if(!pop || pop.isDestroyed){
			pop = Popup.create({
				renderTo: Ext.getBody(),
				record: user,
				refEl: el,
				hidden: true
			});
		}

		pop.show();
		pop.alignTo(el, 'tl-bl?', [0,0]);

		contactCardPopout = canShow? null: pop;
	}

	function startShowCard(e, el){
		showCardTimer = Ext.defer(showCard, canShow?0:500, this, [e, el]);
	}

	function stopShowCard(){
		clearTimeout(showCardTimer);
	}

	return {


		/**
		 * Pass in Dom Nodes or Ext.Elements (var arg style) and this will make them clickable and add the css class "over"
		 * when the mouse is hovering over these elements. (it will also remove the class as the mouse leaves)
		 *
		 * This mixin method assumes we are mixed into a class thta is Observable, and has a userObject property (or a user
		 * property), where the object is an instance of {NextThought.model.User}.
		 */
		enableProfileClicks: function(){
			var me = this,
				events = {
					scope: me,
					click: onUserNameClick
				};

			
			Ext.each(arguments,function(el){
				el = Ext.get(el);
				if(!Ext.isEmpty(el)){
					//el.addClsOnOver('over');
					if(me.profileLinkCard !== false){
						events.mouseover = function(e){
							return startShowCard.call(me, e, el);
						};

						events.mouseout = function(e){
							return stopShowCard.call(me, e, el);
						};
					}

					me.mon(el,events);
				}
			});
		}
	};
});
