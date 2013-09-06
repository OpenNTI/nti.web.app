Ext.define('NextThought.view.profiles.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.profile-view-container',
	requires: [
		'NextThought.view.profiles.Panel',
		'NextThought.view.profiles.PanelOld',
		'NextThought.view.ResourceNotFound'
	],

	defaultType: 'profile-panel',
	layout: 'fit',

	constructor: function(){
		if(!isFeature('v2profiles')){
			this.defaultType = 'profile-panel-old';
			this.layout = 'auto';
			this.cls = 'scrollable ' + (this.cls||'');
		}
		this.callParent(arguments);
	},

	initComponent: function () {
		this.callParent(arguments);
		this.mon(this, 'deactivate', this.onDeactivated, this);
		this.mon(this, 'beforedeactivate', this.onBeforeDeactivate, this);
		if(isFeature('v2profiles')){
			this.removeCls('make-white');
		}
	},


	onBeforeDeactivate: function () {
		var child = this.down(this.defaultType);
		return child && child.fireEvent('beforedeactivate');
	},


	restore: function (state) {
		state = (state || {});
		var user = (state.profile||{}).username,
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
		var current = this.down(this.defaultType)||{},
			u = current.userObject || current.user;
		return u ? u.getProfileUrl() : null;
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
			if(current.setActiveTab){
				current.setActiveTab(state.activeTab);
			}
			else {
				current.restoreState(state);//reduce this if/else to just the else body after v2profiles
			}
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
					toAdd = Ext.applyIf({
						user: user,
						username: username,//can be removed once v2profiles is released
						displayName: user.getName(),//can be removed once v2profiles is released
						state: state
					}, state);//remove the applyIf wrapper once v2profiles is released
				}
				toAdd = Ext.apply(toAdd, {
					listeners: {
						loaded: {fn:fin, single: true},//remove after v2profiles
						restored: {fn:fin, single: true},
						delay: 1
					}
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
