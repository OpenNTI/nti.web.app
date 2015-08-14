Ext.define('NextThought.mixins.Avatar', {

	statics: {
		BAKCGROUND_CHOICE_COUNT: 13,

		//http://www.materialui.co/colors 600 line
		DEFAULT_AVATAR_BG_COLORS: [
			'5E35B1',
			'3949AB',
			'1E88E5',
			'039BE5',
			'00ACC1',
			'00897B',
			'43A047',
			'7CB342',
			'C0CA33',
			'FDD835',
			'FFB300',
			'FB8C00',
			'F4511E'
		],

		AVATAR_CACHE: {},

		getValidAvatarURL: function(url) {
			if (!this.AVATAR_CACHE[url]) {
				this.AVATAR_CACHE[url] = new Promise(function(fulfill, reject) {
					var img = new Image();

					img.onload = fulfill.bind(null, url);
					img.onerror = fulfill.bind(null, null);

					img.src = url;
				});
			}

			return this.AVATAR_CACHE[url];
		},


		getUsernameHash: function(str) {
			var hash = 0, c, i;

			if (!str || str.length === 0) { return hash; }

			for (i = 0; i < str.length; i++) {
				c = str.charCodeAt(i);
				hash = ((hash << 5) - hash) + c;
				hash = hash & hash; // Convert to 32bit integer
			}

			return hash;
		},


		getDefaultBackgroundForUsername: function(username) {
			var hash = this.getUsernameHash(username),
				idx = Math.abs(hash) % this.BAKCGROUND_CHOICE_COUNT;

			if (idx < 10) {
				idx = '0' + idx;
			}

			return '/app/resources/images/profile-backgrounds/profile_bg_' + idx + '.jpg';
		},


		getBackgroundColorForUsername: function(username) {
			var hash = this.getUsernameHash(username),
				idx = Math.abs(hash) % this.DEFAULT_AVATAR_BG_COLORS.length;

			return this.DEFAULT_AVATAR_BG_COLORS[idx];
		},


		//This is isn't really a battle we can win given the complexity of names
		//globally, however as a default this should work.  If they don't like it
		//they can upload an image.  If we have a first and last from the server
		//take the first char of each, else take the first char of the display name.
		//As of 7/2015 this matches the mobile app. Unresolved users don't show initials
		getAvatarInitials: function(data, f, l, d) {
			//TODO should we cache this?

			var first = f || data.NonI18NFirstName,
			last = l || data.NonI18NLastName,
			dn = d || data.displayName;

			return first && last ? first[0] + last[0] : (dn && dn[0]);
		}
	},

	initAvatar: function() {
		var me = this;

		//Give the field converters a chance to run
		wait()
			.then(function() {
				return Promise.all([
					me.__getAvatar(),
					me.__getInitials(),
					me.__getBGColor()
				]);
			}).then(function(results) {
				me.set({
					avatarURL: results[0],
					avatarInitials: results[1],
					avatarBGColor: results[2]
				});

				// Fire a changed event. This will help update the avatarURL with the correct one,
				// when it's been temporary set to a unresolved or initials avatar while we verify if it's a valid URL.
				// Since this promise fulfills asynchronously, the view that requested
				// it could be rendered when it fulfills within the next even loop.
				me.fireEvent('avatarChanged', me);
			});
	},


	isUnresolved: function() { return true; },


	__getAvatar: function() {
		var url = this.get('avatarURL');

		if (!url) {
			return null;
		}

		//assume its a bad link until we know otherwise
		this.set('avatarURL', '');

		return NextThought.mixins.Avatar.getValidAvatarURL(url);
	},


	__getInitials: function() {
		if (this.isUnresolved()) {
			return null;
		} else {
			return NextThought.mixins.Avatar.getAvatarInitials(this.raw, this.get('FirstName'), this.get('LastName'), this.getName());
		}
	},


	__getBGColor: function() {
		return NextThought.mixins.Avatar.getBackgroundColorForUsername(this.get('Username'));
	},



	getBackgroundImage: function() {
		var background = this.get('backgroundURL'),
			username = this.get('Username');

		if (background) {
			return Promise.resolve(background);
		}

		return Promise.resolve(NextThought.mixins.Avatar.getDefaultBackgroundForUsername(username));
	}
});
