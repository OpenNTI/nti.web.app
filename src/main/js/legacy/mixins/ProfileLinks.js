const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
// const {isMe} = require('internal/legacy/util/Globals');
const lazy = require('internal/legacy/util/lazy-require')
	.get('Actions', () => require('internal/legacy/app/navigation/Actions'))
	.get('Popout', () =>
		require('internal/legacy/app/account/contacts/management/Popout')
	);

// let contactCardPopout;
// let showCardTimer;
// let canShow;

//the scope is being set by the caller
function onUserNameClick(e) {
	if (e) {
		e.stopEvent();
	}

	var u = this.userObject || this.user,
		profileUrl = u.getProfileUrl?.();

	if (profileUrl) {
		if (this instanceof lazy.Popout) {
			wait().then(this.destroy.bind(this));
		}

		lazy.Actions.pushRootRoute(u.getName(), u.getProfileUrl(), {
			user: u,
		});

		return false;
	}
}

module.exports = exports = Ext.define('NextThought.mixins.ProfileLinks', {
	navigateToProfile: function (u) {
		var profileUrl = u.getProfileUrl?.();

		if (profileUrl) {
			lazy.Actions.pushRootRoute(u.getName(), profileUrl, {
				user: u,
			});
		}
	},

	/*
	 * Pass in Dom Nodes or Ext.Elements (var arg style) and this will make them clickable and add the css class "over"
	 * when the mouse is hovering over these elements. (it will also remove the class as the mouse leaves)
	 *
	 * This mixin method assumes we are mixed into a class thta is Observable, and has a userObject property (or a user
	 * property), where the object is an instance of {NextThought.model.User}.
	 */
	enableProfileClicks: function () {
		var me = this,
			events = {
				scope: me,
				click: onUserNameClick,
			};

		Ext.each(arguments, function (el) {
			// var user = me.userObject || me.user;
			el = Ext.get(el);

			if (!Ext.isEmpty(el)) {
				//el.addClsOnOver('over');
				// if ((user && !isMe(user)) && me.profileLinkCard !== false) {
				//	events.mouseover = function(e) {
				//		return startShowCard.call(me, e, el);
				//	};

				//	events.mouseout = function(e) {
				//		return stopShowCard.call(me, e, el);
				//	};
				// }

				me.mon(el, events);
			}
		});
	},
});
