Ext.define('NextThought.common.model.converters.Users', {
	override: 'Ext.data.Types',
	requires: [
		'Ext.data.SortTypes'
	],

	USERLIST: {
		type: 'UserList',
		convert: function(v, record) {
			var a = arguments,
				u = [];
			try {
				if (v) {
					Ext.each(v, function(o) {
						var p = typeof o === 'string' ? o : ((o.get && o.get('Username')) || o.Username);
						if (!p) {
							console.warn('WARNING: Could not handle Object: ', o, a);
						}
						else {
							u.push(p);
						}
					});
				}
			}
			catch (e) {
				console.error('USERLIST: Parsing Error: ', e.message, e.stack);
				u = v;
			}

			return u;
		},
		sortType: 'none'
	},


	AVATARURL: {
		type: 'AvatarURL',
		sortType: 'asUCString',
		convert: function convert(v, rec) {
			var re = convert.re = (convert.re || /https/i), url,
				needsSecure = re.test(location.protocol) || $AppConfig.server.forceSSL;

			if (!v && rec) {
				url = $AppConfig.server.data.split('/');
				if (!url.last()) { url.pop(); }
				url.push('users', rec.get('Username'), '@@avatar');
				return url.join('/');
			}

			function secure(v, i, a) {
				v = v.replace('www.gravatar.com', 'secure.gravatar.com').replace('http:', 'https:');
				if (a) {a[i] = v;}
				return v;
			}

			function o(v, i, a) {

				if (needsSecure) {
					v = secure(v, i, a);
				}

        //				//preload
        //				(new Image()).src = v;
				return v;
			}


			if (!Ext.isArray(v)) { v = o(v); }
			else { Ext.each(v, o); }
			return v;
		}
	},


	AVATARURLLIST: {
		type: 'AvatarURLList',
		sortType: 'asUCString',
		convert: function convert(v, rec) {
			Ext.each(v, function(o, i, a) {
				a[i] = Ext.data.Types.AVATARURL.convert(o, rec);
			});
			return v;
		}
	}
},function() {
	function set(o) { o.sortType = Ext.data.SortTypes[o.sortType]; }

	set(this.USERLIST);
	set(this.AVATARURL);
	set(this.AVATARURLLIST);
});
