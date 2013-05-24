Ext.define('NextThought.controller.Session', {
	extend: 'Ext.app.Controller',

	requires:[
		'NextThought.cache.UserRepository',
		'NextThought.proxy.Socket',
		'NextThought.util.Object',
		'Ext.util.Cookies'
	],

	models: [
		'User',
		'Service'
	],

	views: [
		'Window',
		'account.coppa.Window',
		'account.recovery.Window',
		'menus.Settings',
		'NextThought.ux.WelcomeGuide',
		'NextThought.ux.UpdatedTos'
	],

	sessionTrackerCookie: 'sidt',


	init: function() {
		var me = this;

		me.listen({
			component:{
				'settings-menu [action=logout]' : {
					'click': me.handleLogout
				}
			}
		});


		me.sessionId = guidGenerator();

		me.sessionTracker = Ext.TaskManager.newTask({

			interval: 5000, //5 seconds
			run: function(){
				var v = Ext.util.Cookies.get(me.sessionTrackerCookie);
				if(v !== me.sessionId){
					me.sessionTracker.stop();
					Socket.tearDownSocket();

					alert({
						icon: Ext.Msg.WARNING,
						title: 'Alert',
						msg:'You\'re using the application in another tab. This session has been invalidated.',
						closable: false,
						buttons: null
					});
				}
			}
		});
	},


	handleLogout: function(keepTracker) {
		var me = this, url = getURL(Ext.String.urlAppend(
					this.logoutURL,
					'success='+encodeURIComponent(location.href)));

		if(!keepTracker){
			Ext.util.Cookies.clear(this.sessionTrackerCookie);
		}

		function finishLoggingOut(){
			Socket.tearDownSocket();
			me.application.fireEvent('session-closed');
			location.replace(url);
		}

		Ext.getBody().mask('Signing Out');
		//Log here to help address #550.
		console.log('logout, redirect to ' + url);
		this.application.fireEvent('will-logout',finishLoggingOut);
		Ext.defer(finishLoggingOut, 6000);
	},


	maybeShowCoppaWindow: function(){
		var user = $AppConfig.userObject,
			showWindow = user.getLink('account.profile.needs.updated'),
			url = user.getLink('account.profile');

		if (!showWindow){return;}

		Ext.Ajax.request({
			url: getURL(url),
			timeout: 20000,
			scope: this,
			callback: function(q,success,r){
				if(!success){
					console.log('Could not get acct rel schema for coppa window. Window will not show');
					return;
				}
				try{
					var o = Ext.decode(r.responseText);
					Ext.widget('coppa-window', {schema:o.ProfileSchema}).show();
				}
				catch(e){
					console.error(Globals.getError(e));
				}
			}
		});

		console.log('get data from ' + url + ' and show coppa window...');
	},


	showWelcomePage: function() {
		var link = this.linkElementForRel('content.initial_welcome_page');
		this.guideWin = Ext.widget('welcome-guide', {link: link, deleteOnDestroy: true});
		this.guideWin.show();
	},

	showNewTermsOfService: function() {
		var link = this.linkElementForRel('content.initial_tos_page');
		this.guideWin = Ext.widget('updated-tos', {link: link, deleteOnDestroy: true});
		this.guideWin.show();
	},

	shouldShowContentFor: function(linkRel) {
		return !Ext.isEmpty(this.linkElementForRel(linkRel));
	},

	linkElementForRel: function(linkRel) {
		var user = $AppConfig.userObject,
				links = user.get('Links') || {};
		return links.getLinksForRel ? links.getLinksForRel(linkRel)[0] : null;
	},

	maybeTakeImmediateAction: function(r){
		var m = this;
		if (m.getLink(r, 'account.profile.needs.updated')){
			m.coppaWindow = true;
		}
		else if (m.getLink(r, 'state-bounced-contact-email')){
			m.bouncedContact = true;
		}
		else if (m.getLink(r, 'state-bounced-email')){
			m.bouncedEmail = true;
		}
	},


	showEmailRecoveryWindow: function(fieldName, linkName){
		Ext.widget('recovery-email-window', {fieldName:fieldName, linkName: linkName}).show();
	},


	immediateAction: function(){
		if (this.coppaWindow){
			this.maybeShowCoppaWindow();
		}
		else if (this.bouncedContact){
			this.showEmailRecoveryWindow('contact_email', 'state-bounced-contact-email');
		}
		else if (this.bouncedEmail){
			this.showEmailRecoveryWindow('email', 'state-bounced-email');
		}

		// what is the exactly relationships between these windows?
		// currently above and below are piling on top of one another

		if (this.shouldShowContentFor('content.initial_tos_page')) {
			var u = $AppConfig.userObject,
				link = u.getLink('content.initial_tos_page'),
				created = u.get('CreatedTime'),
				timeThreshold = 2 * 60 * 1000; //2 minutes in milliseconds

			//Users accepts terms at account creation.  Heres a hueristic to detect
			//new accounts and delete the tos link automatically (they just accepted it)
			if((new Date()).getTime() >  created.getTime() + timeThreshold){
				this.showNewTermsOfService();
			}
			else if(link){
				Ext.Ajax.request({
					url: link,
					method: 'DELETE',
					success: function(r, opts){
						console.log('Success: ', arguments);
					},
					fail: function(r, opts){
						console.log('Fail: ', arguments);
					}
				});
			}
		}
		if (this.shouldShowContentFor('content.initial_welcome_page')) {
			this.showWelcomePage();
		}
	},


	login: function(app){
		function success(){
			Ext.util.Cookies.set(me.sessionTrackerCookie,me.sessionId);
			me.sessionTracker.start();
			app.fireEvent('session-ready');
			app.on('finished-loading', me.immediateAction, me);

			app.getController('Application').openViewport();
		}

		function showLogin(timedout){
			var url = Ext.String.urlAppend(
					Ext.String.urlAppend(
						$AppConfig.server.login,
						"return="+encodeURIComponent(location.toString())),
					"host=" + encodeURIComponent(getURL()));

			if(timedout){
				alert('a request timed out');
				return;
			}
			location.replace( url );
		}

		var me = this;
		me.attemptLogin(success,showLogin);
	},


	getLink: function getLink(o, relName){
		o = o || {};
		o = o.responseText || o;
		if(typeof o === 'string') {
			try {
				o = Ext.decode(o);
			}
			catch(e){
				console.error('could not decode', o);
				o = {};
			}
		}
		var l = o.Links || [], i = l.length-1;
		for(i;i>=0; i--){ if(l[i].rel === relName){ return l[i].href; } }
		return null;
	},


	attemptLogin: function(successCallback, failureCallback){
		var m = this,
			s = $AppConfig.server,
			d = s.data, ping = 'logon.ping';

		try{

			Ext.Ajax.request({
				timeout: 60000,
				url: getURL(d + ping),
				callback: function(q,s,r){
					var l = m.getLink(r,'logon.handshake');
					if(!s || !l){
						if(r.timedout){
							console.log('Request timed out: ', r.request.options.url);
						}
						return Ext.callback(failureCallback,m,[r.timedout]);
					}

					return m.performHandshake(l,successCallback,failureCallback);
				}
			});
		}
		catch(err){
			alert('Could not request handshake from Server.\n'+err.message);
		}
	},



	performHandshake: function(link,successCallback,failureCallback){
		var m = this,
			u  = decodeURIComponent( Ext.util.Cookies.get('username')),
			handshakeTimer = setTimeout(m.handshakeRecovery, 30000);

		//NOTE: handshakeTimer will retry if it doesn't return before 30 seconds because it's been reported that
		//you can get into a bad state duringn handshake, so we want to interrupt that and try again.
		Ext.Ajax.request({
			method: 'POST',
			timeout: 60000,
			url: getURL(link),
			params : {
				username: u
			},
			callback: function(q,s,r){
				clearTimeout(handshakeTimer);
				var l = m.getLink(r,'logon.continue');
				if(!s || !l){
					return failureCallback.call(m);
				}
				m.maybeTakeImmediateAction(r);
				m.logoutURL = m.getLink(r,'logon.logout');
				return m.resolveService(successCallback,failureCallback);
			}
		});
	},


	handshakeRecovery: function(){
		Ext.util.Cookies.clear('username');
		location.reload();
	},


	findResolveSelfWorkspace: function(s){
		var items = s.get('Items') || [],
			w, l;

		Ext.Array.each(items, function(item){
			var links = item.Links || [];
			l = s.getLinkFrom(links, 'ResolveSelf');
			if(l){
				w = item;
				return false;
			}
			return true;
		});

		return w;
	},


	resolveService: function(successFn, failureFn){
		var m = this,
			s = $AppConfig.server;

		try{
			Ext.Ajax.request({
				url: getURL(s.data),
				timeout: 20000,
				headers:{
					'Accept': 'application/vnd.nextthought.workspace+json'
				},
				scope: this,
				callback: function(q,success,r){
					if(!success){
						alert('Oh No! Could not talk to the server!');
						m.handleLogout();
						console.log('Could not resolve service document\nrequest:',q,'\n\nresponse:',r,'\n\n');
						return;
					}
					try{
						var sDoc = Ext.decode(r.responseText);
						sDoc = NextThought.model.Service.create(sDoc);


						if(!m.findResolveSelfWorkspace(sDoc)){
							console.error('Could not locate ResolveSelf link in:', sDoc);
							Ext.Error.raise('bad service doc');
						}

						$AppConfig.service = sDoc;
						m.attemptLoginCallback($AppConfig.service, successFn);
					}
					catch(e){
						console.error(Globals.getError(e));
						failureFn.call(m);
					}
				}
			});
		}
		catch(e){
			console.error('AttemptLogin Exception: ', Globals.getError(e));
		}
	},


	attemptLoginCallback: function(service, successCallback, failureCallback){
		var me = this, href, workspace;
		Socket.setup();

		function onFailure(){
			console.log('could not resolve app user', arguments);
			failureCallback.call(me);
		}

		function onSuccess(user){
			user.data.Presence = NextThought.model.PresenceInfo.createFromPresenceString('Online');
			user.summaryObject = false;
			UserRepository.cacheUser(user, true);
			$AppConfig.userObject = user;
			ObjectUtils.defineAttributes($AppConfig,{
				username: {
					getter: function(){ try { return this.userObject.getId(); } catch(e){console.error(e.stack);} },
					setter: function(){ throw 'readonly'; }
				}
			});
			successCallback.call(me);
		}

		workspace = this.findResolveSelfWorkspace(service);
		href = service.getLinkFrom( (workspace || {}).Links || [], 'ResolveSelf');

		if(!href){
			console.error('No link found to resolve app user', arguments);
			onFailure();
			return;
		}

		Ext.Ajax.request({
			url: getURL(href),
			scope: this,
			headers: {
				Accept: 'application/json'
			},
			callback: function(q, success, r){
				var json, user;
				if(!success){
					onFailure(arguments);
					return;
				}
				json = Ext.decode(r.responseText, true);
				user = json ? ParseUtils.parseItems(json) : null;
				user = user ? user.first() : null;

				if(user && user.get('Username') === workspace.Title){
					onSuccess(user);
				}
				else{
					onFailure(arguments);
				}
			}
		});
	}
});
