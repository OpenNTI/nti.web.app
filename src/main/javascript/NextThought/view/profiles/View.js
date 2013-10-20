Ext.define('NextThought.view.profiles.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.profile-view-container',
	requires: [
		'NextThought.view.profiles.Panel',
		'NextThought.view.ResourceNotFound'
	],

	defaultType: 'profile-panel',
	layout: 'fit',


	initComponent: function() {
		this.callParent(arguments);
		this.mon(this, 'deactivate', this.onDeactivated, this);
		this.mon(this, 'beforedeactivate', this.onBeforeDeactivate, this);
		this.removeCls('make-white');
	},


	onBeforeDeactivate: function() {
		var child = this.down(this.defaultType);
		return child && child.fireEvent('beforedeactivate');
	},


	restore: function(state) {
		state = (state || {});
		var user = (state.profile || {}).username,
			me = this;

		if (!me.isActive() || (state.hasOwnProperty('active') && state.active !== this.id)) {
			me.fireEvent('finished-restore');
			return;
		}

		console.debug('Setting user in profile:', user);
		me.setUser(state.profile || {}, function(panel) {
			var name = (panel && panel.displayName) || user;
				name = (panel && panel.user && panel.user.get('displayName')) || name;
			console.debug('fire finish');
			me.setTitle('Profile: ' + name);
			me.fireEvent('finished-restore');
		});
	},


	beforeRestore: function() {
		return !!(this.el.down('.blog-editor'));
	},


	getFragment: function() {
		var current = this.down(this.defaultType) || {},
			u = current.userObject || current.user;
		return u ? u.getProfileUrl() : null;
	},


	setUser: function(state, finishCallback) {
		var t = this.defaultType,
			current = this.down(t),
			username = state.username,
			me = this;

		function fin() {
			me.unmask();
			Ext.callback(finishCallback, this, [me.down(t)]);
		}

		if (current && current.username === username) {
			Ext.apply(current, state);

			current.restoreState(state);

			fin();
			return;
		}

		this.mask('Loading...');

		UserRepository.getUser(username, function(user) {
			var toAdd, shouldFireLoaded;
			this.removeAll(true);
			try {
				if (user.isUnresolved()) {
					console.error('Can\'t show profile for unresolved user', user);
					//TODO push generic unknown object handler here
					toAdd = {xtype: 'notfound'};
					shouldFireLoaded = true;
				}
				else {
					toAdd = {
						user: user,
						username: username,//TODO: can this be removed?
						stateData: state
					};
				}
				toAdd = Ext.apply(toAdd, {
					listeners: {
						restored: {fn: fin, single: true},
						delay: 1
					}
				});
				this.add(toAdd);
				if (shouldFireLoaded) {
					fin();
				}
			}
			catch (exception) {
				console.error(Globals.getError(exception));
				Ext.callback(finishCallback, this);
			}

		}, this, true);
	},


	onDeactivated: function() {
		var profile = this.down(this.defaultType);
		//save memory/dom by cleaning out the profile object while its not active.
		if (profile) {
			//console.debug('Destroying profile widget');
			profile.destroy();
		}
	}
});
