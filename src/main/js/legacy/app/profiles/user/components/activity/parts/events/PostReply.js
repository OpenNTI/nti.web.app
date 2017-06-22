const Ext = require('extjs');

const UserRepository = require('legacy/cache/UserRepository');
const ParseUtils = require('legacy/util/Parsing');
const PathActions = require('legacy/app/navigation/path/Actions');

require('legacy/mixins/ProfileLinks');
require('legacy/mixins/LikeFavoriteActions');
require('legacy/mixins/FlagActions');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.PostReply', {
	extend: 'Ext.Component',
	ui: 'activity',
	cls: 'reply-event',
	description: '---',

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		flagActions: 'NextThought.mixins.FlagActions'
	},

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'reply profile-activity-reply-item', cn: [
			'{Creator:avatar}',
			{ cls: 'meta', cn: [
				{ cls: 'controls', cn: [
					{ cls: 'favorite-spacer' },
					{ cls: 'like', id: '{id}-liked' }
				]},
				{ cls: 'head', cn: [
					{ tag: 'span', cls: 'link name', html: '{Creator:displayName}'},
					' commented on ',
					'the',//{ tag: 'span', cls: '{isOwn}', html: '{someones}', 'data-target': '{other}'},
					' {thisthing}: ',
					{ tag: 'span', cls: 'link title', html: '{title}'},
					{ cls: 'time', html: '{date}', style: 'line-height: 2'}
				]}
			]},
			{ cls: 'body', id: '{id}-body' }
		]}
	]),

	childEls: ['body', 'liked'],

	onClassExtended: function (cls, data) {
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {},cls.superclass.renderSelectors);

		var tpl = this.prototype.renderTpl;

		if (!data.renderTpl) {
			data.renderTpl = tpl;
		}
		else {
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}
	},

	initComponent: function () {
		var record = this.record;
		this.callParent(arguments);
		this.mon(record, 'destroy', 'destroy', this);
		this.on({el: {'click': 'onClick', scope: this}});

		this.PathActions = PathActions.create();
	},

	getRecord: function () {return this.record;},

	afterRender: function () {
		var me = this, rd, r = me.record,
			postRef = r.get('href').split('/').slice(0, -1).join('/'),
			username = me.record.get('Creator');

		me.callParent(arguments);
		r.addObserverForField(this, 'body', 'bodyUpdated');

		rd = me.renderData = Ext.apply(me.renderData || {},r.getData());
		rd.id = this.id;
		rd.date = Ext.Date.format(r.get('CreatedTime'), 'F j, Y');
		rd.thisthing = me.description;

		function resolve (json) {
			var post = me.post = ParseUtils.parseItems(json)[0],
				other = post.get('Creator'),
				users = [username];

			rd.title = post.get('title');

			//compare apples to apples. (strings)
			username = username.isModel ? username.getId() : username;
			other = other.isModel ? other.getId() : other;

			if (username !== other) {
				users.push(other);
			}

			UserRepository.getUser(users)
				.then(fillIn, failed);
		}

		function fillIn (users) {
			var other = me.targetUser = users[1] || users[0];
			rd.Creator = me.user = users[0];

			rd.isOwn = users.length > 1 ? 'link name' : '';
			rd.someones = users.length === 1 ? 'their own' : (other.getName() + '\'s');

			me.redraw(rd);
		}

		function failed () {
			me.destroy();
			throw arguments;//let the error reporter tell us about this.
		}

		Service.request(postRef)
			.then(resolve, failed);
	},

	redraw: function (data) {
		if (!this.el) {return;}
		this.renderTpl.overwrite(this.el, data);
		this.applyRenderSelectors();
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		//this.mixins.flagActions.constructor.call(this);
		this.bodyUpdated();
	},

	bodyUpdated: function () {
		var me = this, r = me.record;
		if (me.rendered) {
			r.compileBodyContent(function (html, cb) {
				me.el.down('.body').update(html);
				Ext.destroy(me.knownBodyComponents);
				if (Ext.isFunction(cb)) {
					me.knownBodyComponents = cb(me.body, this).map(function (c) {
						me.on('destroy', 'destroy', c);
						return c;
					});
				}
			}, this, null, null, null, {useVideoPlaceholder: true});
		}
	},

	onClick: Ext.emptyFn
});
