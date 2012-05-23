Ext.define('NextThought.controller.Session', {
	extend: 'Ext.app.Controller',

	requires:[
		'NextThought.cache.UserRepository',
		'NextThought.proxy.Socket',
		'Ext.util.Cookies'

	],

	models: [
		'User',
		'Service'
	],

	views: [
		'Window',
		'menus.MyAccount'
	],

	statics: {
		login: function(app){
//			console.time('session restore');
			function success(){
				app.fireEvent('session-ready');
//				console.timeEnd ('session restore');
				NextThought.controller.Application.launch();
			}

			function showLogin(timedout){
				var me = this,
					host = $AppConfig.server.host,
					url = Ext.String.urlAppend(
							Ext.String.urlAppend(
									$AppConfig.server.login,
									"return="+encodeURIComponent(location.toString())),
							"host=" + encodeURIComponent(host));

				if(timedout){
					alert('a request timed out');
					return;
				}
				location.replace( url );

/*
				Globals.removeLoaderSplash();
				me.win = Ext.widget({
						xtype:'nti-window',
						title: 'Login: ',
						closeAction: 'destroy',
						resizable: false,
						closable: false,
						renderTo: Ext.getBody(),
						width: '70%',
						height: '70%',
						layout: 'fit',
						items: {
							xtype: 'component', cls: 'login',
							autoEl: {
								tag: 'iframe',
								src: url,
								frameBorder: 0,
								marginWidth: 0,
								marginHeight: 0,
								scrolling: 'no',
								seamless: true,
								transparent: true,
								allowTransparency: true,
								style: 'overflow: hidden'
							},
							listeners: {
								afterrender: function(self){
									var iframe = self.getEl().dom;
									self.iframeWin = iframe.contentWindow || window.frames[iframe.name];

									self.iframeWin.addEventListener('message', function(){
										console.log('from iframe: ', arguments);
									}, true);
								}
							}
						}
					}).show().addCls('login-window');
*/
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
			try{

			Ext.Ajax.request({
				timeout: 60000,
				url: h + d + ping,
				callback: function(q,s,r){
					var l = getLink(r,'logon.handshake');
					if(!s || !l){
						if(r.timedout){
							console.log('Request timed out: ', r.request.options.url);
						}
						return Ext.callback(failureCallback,m,[r.timedout]);
					}
					Ext.Ajax.request({
						method: 'POST',
						timeout: 60000,
						url: h + l,
						params : {
							username: u
						},
						callback: function(q,s,r){
							l = getLink(r,'logon.continue');
							if(!s || !l){
								if(r.timedout){
									console.log('Request timed out: ', r.request.options.url);
								}
								return failureCallback.call(m,r.timedout);
							}
							m.logoutURL = getLink(r,'logon.logout');
							m.resolveService(successCallback,failureCallback);
						}
					});
				}
			});
			}
			catch(err){
				alert(err.message);
			}
		},


		resolveService: function(successFn, failureFn){
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
//							Ext.callback(failureFn,m);
							alert('Could not resolve service document');
							console.log('\nreq:',q,'\nresp:',r, '\n');
							return;
						}
						try{
							var doc = Ext.decode(r.responseText),
								user = doc.Items[0].Title;

							$AppConfig.service = Ext.create('NextThought.model.Service', doc, user);
							m.attemptLoginCallback(user,successFn);
						}
						catch(e){
							console.error(Globals.getError(e));
						}
					}
				});
			}
			catch(e){
				console.error('AttemptLogin Exception: ', Globals.getError(e));
			}
		},

		attemptLoginCallback: function(username,successCallback, failureCallback){
			var me = this;
			$AppConfig.username = username;
			Socket.setup();

			UserRepository.getUser(username, function(users){
				var user = users[0];
				if(user){
					user.data.Presence = 'Online';
					$AppConfig.userObject = user;
					successCallback.call(me);
				}
				else{
					alert('could not resolve user: '+username);
					console.log('could not resolve user',username, arguments);
//					failureCallback.call(me);
				}
			});
		}
	},

	init: function() {
		this.control({
			'my-account-menu [action=logout]' : {
				'click': this.handleLogout
			}
		},{});
	},

	handleLogout: function() {
		var s = $AppConfig.server,
			url = Ext.String.urlAppend(
					s.host + this.self.logoutURL,
					'success='+encodeURIComponent(location.href));
		//Log here to help address #550.
		console.log('logout, redirect to ' + url);
		Socket.tearDownSocket();
		location.replace(url);
	}
});
