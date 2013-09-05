Ext.define('NextThought.view.profiles.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.profile-view-container',
	requires: [
		'NextThought.view.profiles.Panel',
		'NextThought.view.profiles.PanelOld',
		'NextThought.view.ResourceNotFound'
	],

	defaultType: 'profile-panel-old',
	layout: 'auto',
	cls: 'scrollable',

	initComponent: function () {
		this.callParent(arguments);
		this.mon(this, 'deactivate', this.onDeactivated, this);
		this.mon(this, 'beforedeactivate', this.onBeforeDeactivate, this);
		if(isFeature('v2profiles')){
			this.defaultType = 'profile-panel';
		}
	},


	onBeforeDeactivate: function () {
		var child = this.down(this.defaultType);
		return child && child.fireEvent('beforedeactivate');
	},


	restore: function (state) {
		state = (state || {});
		var user = state.username,
			me = this;

		if (!me.isActive() || (state.hasOwnProperty('active') && state.active !== this.id)) {
			me.fireEvent('finished-restore');
			return;
		}

		console.debug('Setting user in profile:', user);
		me.setUser(state.profile || {}, function (panel) {
			console.debug('fire finish');
			me.setTitle('Profile: ' + ((panel && panel.displayName) || user));
			me.fireEvent('finished-restore');
		});
	},


	beforeRestore: function () {
		return !!(this.el.down('.blog-editor'));
	},


	getFragment: function () {
		var current = this.down(this.defaultType);
		return current ? current.userObject.getProfileUrl() : null;
	},


	setUser: function (state, finishCallback) {
		var current = this.down(this.defaultType),
			username = state.username,
			me = this;

		function fin() {
			me.unmask();
			Ext.callback(finishCallback, this, [current]);
		}

		if (current && current.username === username) {
			Ext.apply(current, state);
			current.setActiveTab(state.activeTab);
			fin();
			return;
		}

		this.mask('Loading...');

		UserRepository.getUser(username, function (user) {
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
					//TODO pass in the reolved user here so we don't have to pass back through the UserRepository again
					toAdd = Ext.applyIf({username: username, displayName: user.getName()}, state);
				}
				toAdd = Ext.apply(toAdd, {
					listeners: { loaded: fin, scope: this, single: true, delay: 1 }
				});
				current = this.add(toAdd);
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


	onDeactivated: function () {
		var profile = this.down(this.defaultType);
		//save memory/dom by cleaning out the profile object while its not active.
		if (profile) {
			//console.debug('Destroying profile widget');
			profile.destroy();
		}
	}
});
