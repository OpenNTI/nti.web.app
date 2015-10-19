Ext.define('NextThought.mixins.ProfileLinks', function() {
	var contactCardPopout, showCardTimer,
			canShow;
	//the scope is being set by the caller
	function onUserNameClick(e) {
		if (e) {
			e.stopEvent();
		}

		var u = this.userObject || this.user,
			profileUrl = u.getProfileUrl && u.getProfileUrl();

		if (profileUrl) {
			if (this instanceof NextThought.app.account.contacts.management.Popout) {
				wait()
					.then(this.destroy.bind(this));
			} else if (this instanceof NextThought.app.account.identity.components.MenuItem) {
				wait()
					.then(this.setMenuClosed.bind(this));
			}

			NextThought.app.navigation.Actions.pushRootRoute(u.getName(), u.getProfileUrl(), {
				user: u
			});

			return false;
		}
	}


	function showCard(e, el, position) {
		var Popup = NextThought.app.account.contacts.management.Popout,
				pop,
				user = this.userObject || this.user;

		if (!user || this instanceof Popup || (!el.parent('.activity-popout') && !Popup.beforeShowPopup(user, el))) {
			return;
		}

		pop = contactCardPopout;

		if (!pop || pop.isDestroyed) {
			pop = Popup.create({
								   renderTo: Ext.getBody(),
								   record: user,
								   refEl: el,
								   hidden: true
							   });
		}

		pop.show();
		if (el && el.dom) {
			pop.alignTo(el, 'tl-bl?', [0, 0]);
		} else {
			pop.setPosition(position || {});
		}

		contactCardPopout = canShow ? null : pop;
	}

	function startShowCard(e, el) {
		var p = el.getAnchorXY('tl');
		showCardTimer = Ext.defer(showCard, canShow ? 0 : 500, this, [e, el, p]);
	}

	function stopShowCard() {
		clearTimeout(showCardTimer);
	}

	return {
		requires: ['NextThought.app.navigation.Actions'],

		navigateToProfile: function(u) {
			var profileUrl = u.getProfileUrl && u.getProfileUrl();

			if (profileUrl) {
				NextThought.app.navigation.Actions.pushRootRoute(u.getName(), profileUrl, {
					user: u
				});
			}
		},

		/**
		 * Pass in Dom Nodes or Ext.Elements (var arg style) and this will make them clickable and add the css class "over"
		 * when the mouse is hovering over these elements. (it will also remove the class as the mouse leaves)
		 *
		 * This mixin method assumes we are mixed into a class thta is Observable, and has a userObject property (or a user
		 * property), where the object is an instance of {NextThought.model.User}.
		 */
		enableProfileClicks: function() {
			var me = this,
					events = {
						scope: me,
						click: onUserNameClick
					};

			Ext.each(arguments, function(el) {
				var user = me.userObject || me.user;
				el = Ext.get(el);

				if (!Ext.isEmpty(el)) {
					//el.addClsOnOver('over');
					// if ((user && !isMe(user)) && me.profileLinkCard !== false) {
					// 	events.mouseover = function(e) {
					// 		return startShowCard.call(me, e, el);
					// 	};

					// 	events.mouseout = function(e) {
					// 		return stopShowCard.call(me, e, el);
					// 	};
					// }

					me.mon(el, events);
				}
			});
		}
	};
});
