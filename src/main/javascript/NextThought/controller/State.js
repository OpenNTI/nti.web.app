PREVIOUS_STATE = 'previous-state';
BASE_STATE = { active: 'home' };

Ext.define('NextThought.controller.State', {
	extend: 'Ext.app.Controller',

	models: [
		'User'
	],

	requires: [
		'NextThought.providers.Location'
	],

	constructor: function(){
		var m = this.callParent(arguments);

		this.addEvents('restore');
		this.on('restore',this.restoreState,this);

		return m;
	},

	init: function() {
		var me = this;

		this.application.on('session-ready', this.onSessionReady, this);

		me.currentState = {};

		me.isHangout = this.getController('Google').isHangout();

		me.control({
			'main-views': {
				'activate-view': me.track
			}
		},{});
		ContentAPIRegistry.register('NTIPreviousPage',this.navigatePreviousPage,this);
	},


	onSessionReady: function(){
		var me = this,
			history = window.history,
			push = history.pushState || function(){};

		history.replaceState = history.replaceState || function(){};

		/**
		 * Update the application's state object from various actions in this controller.
		 *
		 * @param {Object} s The new state fragment, it will be merged into the current state, replacing keys it has,
		 *                      and leaving keys it does not have alone.
		 * @return {Boolean} Returns true if the state was changed, false otherwise.
		 */
		history.updateState = function(s){
			function isDiff(a,b){
				var ret = false;

				Ext.Object.each(b,function objItr(key,val){
					if(a[key]!==val || (Ext.isObject(val) && isDiff(a[key],val))){
						ret = true;
					}
					return !ret;//a false value will stop the iteration, if we find a
				});
				return ret;
			}

			var current = me.currentState,
				diff = isDiff(current,s);
			console.debug('update state', arguments);
			Ext.applyIf(s,{active: current.active});

			console.debug('Will state change?', diff);

			//The only thing listening to this event is the Google Hangout controller.
			if(diff && me.fireEvent('stateChange',s)){
				Ext.Object.merge(current, s);
				window.localStorage.setItem(me.getStateKey(),JSON.stringify(current));
				return true;
			}

			return false;
		};

		history.pushState = function(s,title,url){
			console.debug('push state',s);
			var location, ntiid;
			if (this.updateState(s) && !me.isPoppingHistory) {
				location = me.getState().location;
				title = LocationProvider.findTitle(location,'NextThought');
				ntiid = ParseUtils.parseNtiid(location);
				url = ntiid ? ntiid.toURLSuffix() : null;

				push.apply(history, [s,title,url]);

				if (Ext.isIE && url) {
					window.lastTimeLocationSet = new Date().getTime();
					window.location.hash = url;
				}
			}
		};

		window.onpopstate = function(e){
			console.debug('Browser is popping state', e.state);
			me.isPoppingHistory = true;
			me.onPopState(e);
			me.isPoppingHistory = false;
		};

		window.onhashchange = function(e) {
			//Hash changes are their own entry in the history... so we do not need to push history, we just need to
			// handle the change.
			console.debug('Hash change');
			var newState = me.interpretHash(location.hash);
			if(history.updateState(newState)){
				me.restoreState(newState);
				history.replaceState(me.getState(),document.title,location.toString());
			}
		};
	},


	interpretHash: function(hash){
		var ntiid = ParseUtils.parseNtiHash(hash),
			user,
			result = {};

		user = this.getUserModel().getProfileIdFromHash(hash);
		if(user){
			result = {
				active: 'profile',
				profile: {
					username: user
				}
			};
		}
		else if(ntiid){
			result.location = ntiid;
		}

		console.debug('Hash Interpeted:',result);
		return result;
	},


	getState: function(){
		return Ext.clone(this.currentState);
	},


	onPopState: function(e) {
		if(!NextThought.isInitialized || this.isHangout){
			return;
		}
		var s = e?e.state:null;
		if (s) {
			this.fireEvent('restore', s);
		}
	},


	track: function(viewId){
		if(this.currentState.active !== viewId && NextThought.isInitialized){
			//console.debug(this.currentState.active, modeId);
			this.currentState.active = viewId;

			window.history.pushState(this.currentState, 'NextThought: '+viewId);
		}
	},


	restoreState: function(stateObject){
		if(this.restoringState){
			console.warn('Restoring state while one is already restoring...');
			return;
		}
		this.restoringState = true;
		var app = this.application,
			history = window.history,
			replaceState = false, c, key, stateScoped, me = this, presentation;

		function fin(){
			var token = {};
			app.registerInitializeTask(token);
			return function(a,errorDetails){
				//Error handling... sigh
				var land = Ext.util.Cookies.get('nti.landing_page') || Library.getFirstPage();
				app.finishInitializeTask(token);
				if((errorDetails||{}).error && land){
					me.currentState.location = land;
					window.localStorage.setItem(me.getStateKey(),JSON.stringify(me.currentState));
					LocationProvider.setLocation( land, null, true);
				}
			};
		}

		if(stateObject === PREVIOUS_STATE){
			replaceState = true;
			stateObject = this.loadState();
			if (history.updateState) {
				history.updateState(stateObject);
			}
		}

		c = Ext.getCmp(stateObject.active);
		if(c){
			this.currentState.active = stateObject.active;
			c.activate();
		}

		for(key in stateObject){
			if(stateObject.hasOwnProperty(key) && /object/i.test(typeof(stateObject[key]))) {
				c = Ext.getCmp(key);
				if(c && c.restore){
					try{
						stateScoped = {};
						this.currentState[key] = stateScoped[key] = stateObject[key];
						c.on('finished-restore',fin(),this,{ single: true });
						c.restore(stateScoped);
					}
					catch(e){
						console.error('Setting state: ', e, e.message, e.stack);
					}
				}
				else {
					console.warn('The key', key, 'did not point to a component with a restore method:', c);
				}
			}
		}

		if(typeof stateObject.location !== 'undefined'){
			//Quick and dirty close the slide view if it exists.
			//Integrate this with state better so back and forward can
			//do more of what you would expdect.
			presentation = Ext.ComponentQuery.query('slidedeck-view');
			if(!Ext.isEmpty(presentation)){
				presentation = presentation.first();
				presentation.destroy();
			}
			LocationProvider.setLocation(stateObject.location, fin(), true);
		}

		if(replaceState) {
			history.replaceState(this.currentState,'Title');
		}

		this.restoringState = false;
	},



	loadState: function(){
		if(this.isHangout){
			console.info('Setting up state for Hangout...');
			return {};
		}

		// Default to the landing page of the first book if available,
		// rather than the library landing page.
		var defaultState = {
			active: 'library',
			location : Ext.util.Cookies.get('nti.landing_page') || Library.getFirstPage() || undefined
		},
			lastLocation,
			previousState,
			result;

		try {
			previousState = window.localStorage.getItem(this.getStateKey());
			console.log('local state found', previousState);
			lastLocation = Ext.decode( previousState );

			result = lastLocation && lastLocation.location ? lastLocation : defaultState;
			if(location.hash){
				console.debug('hash trumps state', location.hash);
				Ext.apply(result,this.interpretHash(location.hash));
			}
			return result;
		}
		catch(e){
			console.error('failed to decode local state, use default.', Globals.getError(e), window.localStorage);
			window.localStorage.removeItem(this.getStateKey());
			return defaultState;
		}
	},


	getStateKey: function(){
		var username = $AppConfig.username;
		if (!username){
			console.error('unknown username for state mgmt.');
		}
		return Base64.encode('state-' + username);
	},


	navigatePreviousPage: function(){
		history.back();
		return true;
	}
});
