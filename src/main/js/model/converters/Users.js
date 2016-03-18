var Ext = require('extjs');
var Globals = require('../../util/Globals');


module.exports = exports = Ext.define('NextThought.model.converters.Users', {
    override: 'Ext.data.Types',

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

			function secure(v, i, a) {
				if (!v) {
					return v;
				}

				v = v.replace('www.gravatar.com', 'secure.gravatar.com').replace('http:', 'https:');

				if (a) {
					a[i] = v;
				}

				return v;
			}

			function maybeSecure(v, i, a) {

				if (needsSecure) {
					v = secure(v, i, a);
				}

				// //preload
				// (new Image()).src = v;
				return v;
			}

			if (v && v === '@@avatar') {
				url = Globals.trimRoute($AppConfig.server.data).split('/');

				url.push('users', rec.get('Username'), '@@avatar');
				return url.join('/');
			}

			if (!v) {
				return null;
			}

			if (!Array.isArray(v)) {
				v = maybeSecure(v);
			} else {
				Ext.each(v, maybeSecure);
			}

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
