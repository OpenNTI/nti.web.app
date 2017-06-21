const Ext = require('extjs');

const UserRepository = require('legacy/cache/UserRepository');
const BlogStateStore = require('legacy/app/blog/StateStore');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.Blogged', {
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-personalblogentry-item',

	ui: 'activity',
	cls: 'blogged-event',

	renderTpl: Ext.DomHelper.markup([
		'{user:avatar}',
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{headline.title}' },
			{ cls: 'counts', cn: [
				{ tag: 'span', cls: 'link comment-count', html: '{PostCount} Comment{[values.PostCount===1 ? "" : "s"]}', 'data-target': 'comments' },
				{ tag: 'span', cls: 'link likes', html: '{LikeCount} Like{[values.LikeCount===1 ? "" : "s"]}' },
				{ tag: 'span', html: '{date}'}
			] }
		]}
	]),

	initComponent: function () {
		this.callParent(arguments);

		var me = this;

		me.BlogStateStore = BlogStateStore.getInstance();

		me.mon(me.BlogStateStore, {
			'blog-deleted': function (id) {
				if (me.record.getId() === id) {
					me.destroy();
				}
			}
		});

		me.mon(me.record, 'destroy', me.destroy, me);
	},

	beforeRender: function () {
		var me = this, rd, r = me.record,
			username = me.record.get('Creator');

		me.callParent(arguments);

		rd = me.renderData = Ext.apply(me.renderData || {},r.getData());
		rd.headline = rd.headline.getData();
		rd.date = Ext.Date.format(r.get('headline').get('CreatedTime'), 'F j, Y');

		UserRepository.getUser(username, function (u) {
			me.user = u;
			rd.user = u;
			rd.avatarURL = u.get('avatarURL');
			rd.name = u.getName();
			if (me.rendered) {
				//oops...we resolved later than the render...re-render
				me.renderTpl.overwrite(me.el, rd);
			}
		});
	},


	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.el, 'click', this.onClick, this);
		this.record.addObserverForField(this, 'LikeCount', this.likeCountUpdated, this);
		this.record.addObserverForField(this, 'title', this.titleUpdated, this);
		this.record.addObserverForField(this, 'PostCount', this.updatePostCount, this);
	},


	titleUpdated: function (f, v) {
		if (this.rendered) {
			this.el.down('.title').update(v);
		}
	},


	likeCountUpdated: function (f, v) {
		if (this.rendered) {
			this.el.down('.likes').update(v + ' Like' + (v === 1 ? '' : 's'));
		}
	},


	updatePostCount: function (k, v) {
		if (!this.rendered) {
			return;
		}

		var el = this.el.down('.comment-count');
		if (el) {
			el.update(Ext.String.format('{0} Comment{1}', v, v === 1 ? '' : 's'));
		}
	},


	onClick: function (/*e*/) {
		this.navigateToObject(this.record);
	}
});
