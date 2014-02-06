Ext.define('NextThought.view.profiles.parts.events.BlogReply', {
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-personalblogcomment-item',

	ui: 'activity',
	cls: 'reply-event',

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		flagActions: 'NextThought.mixins.FlagActions'
	},

	renderTpl: Ext.DomHelper.markup({ cls: 'reply profile-activity-reply-item', cn: [
		{ cls: 'avatar', style: {backgroundImage: 'url({Creator:avatarURL})'}},
		{ cls: 'meta', cn: [
			{ cls: 'controls', cn: [
				{ cls: 'favorite-spacer' },
				{ cls: 'like', id: '{id}-liked' }
			]},
			{ cls: 'head', cn: [
				{ tag: 'span', cls: 'link name', html: '{Creator:displayName}'},
				' commented on ',
				'the',//{ tag: 'span', cls: '{isOwn}', html: '{someones}', 'data-target': '{other}'},
				' thought: ',
				{ tag: 'span', cls: 'link title', html: '{title}'}
			]}
		]},
		{ cls: 'body', id: '{id}-body' },
		{ cls: 'respond',
			cn: [
				{
					cls: 'reply-options',
					cn: [
						{ cls: 'time', html: '{date}'}
					]
				}
			]
		}
	]}),

	childEls: ['body', 'liked'],

	initComponent: function() {
		var record = this.record;
		this.callParent(arguments);
		this.mon(record, 'destroy', 'destroy', this);
		this.on({el: {'click': 'onClick', scope: this}});
	},

	getRecord: function() {return this.record;},

	afterRender: function() {
		var me = this, rd, r = me.record,
			postRef = r.get('href').split('/').slice(0, -1).join('/'),
			username = me.record.get('Creator');

		me.callParent(arguments);
		r.addObserverForField(this, 'body', 'bodyUpdated');

		rd = me.renderData = Ext.apply(me.renderData || {},r.getData());
		rd.id = this.id;
		rd.date = Ext.Date.format(r.get('CreatedTime'), 'F j, Y');

		function resolve(json) {
			var blog = me.blog = ParseUtils.parseItems(json)[0],
				other = blog.get('Creator'),
				users = [username];

			rd.title = blog.get('title');

			//compare apples to apples. (strings)
			username = username.isModel ? username.getId() : username;
			other = other.isModel ? other.getId() : other;

			if (username !== other) {
				users.push(other);
			}

			UserRepository.getUser(users)
					.then(fillIn, failed);
		}

		function fillIn(users) {
			var other = me.targetUser = users[1] || users[0];
			rd.Creator = me.user = users[0];

			rd.isOwn = users.length > 1 ? 'link name' : '';
			rd.someones = users.length === 1 ? 'their own' : (other.getName() + '\'s');

			me.redraw(rd);
		}

		function failed() {
			throw arguments;//let the error reporter tell us about this.
		}

		Service.request(postRef)
				.then(resolve, failed);
	},


	redraw: function(data) {
		if (!this.el) {return;}
		this.renderTpl.overwrite(this.el, data);
		this.applyRenderSelectors();
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		//this.mixins.flagActions.constructor.call(this);
		this.bodyUpdated();
	},


	bodyUpdated: function() {
		var me = this, r = me.record;
		if (me.rendered) {
			r.compileBodyContent(function(html, cb) {
				me.el.down('.body').update(html);
				Ext.destroy(me.knownBodyComponents);
				if (Ext.isFunction(cb)) {
					me.knownBodyComponents = cb(me.body, this).map(function(c) {
						me.on('destroy', 'destroy', c);
						return c;
					});
				}
			});
		}
	},


	onClick: function() {
		var u = this.targetUser,
			b = this.blog,
			href = this.record.get('href'),
			args = ['Thoughts', b.get('ID'), 'comments', this.record.get('ID')];

		this.fireEvent('show-profile', u, args);
	}
});
