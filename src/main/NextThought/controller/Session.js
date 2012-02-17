Ext.define('NextThought.controller.Session', {
	extend: 'Ext.app.Controller',

	requires:[
		'NextThought.cache.UserRepository',
		'NextThought.util.Base64',
		'NextThought.proxy.Socket',
		'Ext.util.Cookies'

	],

	models: [
		'User',
		'Service'
	],

	views: [
		'widgets.main.SessionInfo'
	],

	statics: {
		login: function(app){
			console.groupCollapsed('Session Setup');
			console.time('session restore');
			function success(){
				Globals.removeLoaderSplash();
				app.fireEvent('session-ready');
				console.timeEnd ('session restore');
				console.groupEnd();
				NextThought.controller.Application.launch();
			}

			function showLogin(){
				var host = $AppConfig.server.host,
					url = Ext.String.urlAppend(
							Ext.String.urlAppend(
									host + $AppConfig.server.login,
									"return=" + encodeURIComponent(location.href) ),
							"host=" + encodeURIComponent(host));

				location.replace( url );
			}

			this.attemptLogin(success,showLogin);
		},


		attemptLogin: function(successCallback, failureCallback){
			var m = this,
				s = $AppConfig.server,
				h = s.host, d = s.data, ping = 'logon.ping',
				u  = decodeURIComponent( Ext.util.Cookies.get('username') );
			
			function getLink(o, relName){
				o = o || {};
				o = o.responseText || o;
				if(typeof o === 'string') { o = Ext.decode(o); }
				var l = o.Links || [], i = l.length-1;
				for(;i>=0; i--){ if(l[i].rel === relName){ return l[i].href; } }
				return null;
			}

			Ext.Ajax.request({
				url: h + d + ping,
				callback: function(q,s,r){
					var l = getLink(r,'logon.handshake');
					if(!s || !l){
						return failureCallback.call(m);
					}
					Ext.Ajax.request({
						method: 'POST',
						url: h + l,
						params : {
							username: u
						},
						callback: function(q,s,r){
							l = getLink(r,'logon.continue');
							if(!s || !l){
								return failureCallback.call(m);
							}
							m.logoutURL = getLink(r,'logon.logout');
							m.resolveService(successCallback,failureCallback);
						}
					});
				}
			});
		},


		resolveService: function(successCallback, failureCallback){
			var m = this,
				s = $AppConfig.server;

			try{
				Ext.Ajax.request({
					url: s.host + s.data,
					timeout: 20000,
					headers:{
						'Accept': 'application/vnd.nextthought.workspace+json'
					},
					scope: this,
					callback: function(q,success,r){
						if(!success){
							failureCallback.call(m);
							return;
						}
						try{
							var doc = Ext.decode(r.responseText),
								user = doc.Items[0].Title;

							$AppConfig.service = Ext.create('NextThought.model.Service', doc, user);
							m.attemptLoginCallback(user,successCallback, failureCallback);
						}
						catch(e){
							Ext.Ajax.request({
								method: 'POST',
								url: s.host + s.data + 'logout',
								callback: function(){
									failureCallback.call(m);
								}
							});

						}
					}
				});
			}
			catch(e){
				console.error('AttemptLogin Exception: ', e.message, '\n', e.stack);
			}
		},

		attemptLoginCallback: function(username,successCallback, failureCallback){
			var me = this;
			$AppConfig.username = username;
			Socket.setup();

			UserRepository.prefetchUser(username, function(users){
				var user = users[0];
				if(user){
					$AppConfig.userObject = user;
					successCallback.call(me);
				}
				else{
					failureCallback.call(me);
				}
			});
		}
	},

	init: function() {
		this.control({
			'session-info' : {
				'logout': this.handleLogout
			}
		},{});
	},

	handleLogout: function() {
		var s = $AppConfig.server,
			url = Ext.String.urlAppend(
					s.host + this.self.logoutURL,
					'success='+encodeURIComponent(location.href));

		Socket.tearDownSocket();
		location.replace(url);
	}
});
