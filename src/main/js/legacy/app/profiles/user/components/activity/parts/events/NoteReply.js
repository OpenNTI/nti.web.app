var Ext = require('extjs');
var UserRepository = require('../../../../../../../cache/UserRepository');
var ParseUtils = require('../../../../../../../util/Parsing');
var EventsActivityItem = require('./ActivityItem');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.NoteReply', {
	extend: 'NextThought.app.profiles.user.components.activity.parts.events.ActivityItem',
	alias: 'widget.profile-activity-note-reply-item',

	ui: 'profile',
	cls: 'reply-event',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'note profile-activity-item',
			cn: [
				{ cls: 'content-callout context', onclick: 'void(0)'},
				{ cls: 'item reply profile-activity-reply-item', cn: [
					{ cls: 'avatar-wrapper', cn: ['{user:avatar}']},
					{ cls: 'controls', cn: [
						{ cls: 'favorite-spacer' },
						//{ cls: 'favorite' },
						{ cls: 'like' }
					]},
					{ cls: 'meta', cn: [
						{ cn: [
							{ tag: 'span', cls: 'name' },
							{ tag: 'span', cls: '', html: ' replied to ' },
							{ tag: 'span', cls: 'name other', html: '{other}' }

						] },
						{ cls: 'stamp', cn: [
							{tag: 'span', cls: 'time'}
						]}
					]},
					{ cls: 'body' },
					{ cls: 'editme' },
					{
						cls: 'foot',
						cn: [
							{ cls: 'comments', 'data-label': ' Comment', html: ' ' },
							{ cls: 'edit', html: 'Edit' },
							{ cls: 'flag', html: 'Report' },
							{ cls: 'delete', html: 'Delete' }

						]
					}
				]
				}
			]
		},
		{
			id: '{id}-body',
			cls: 'note-replies',
			cn: ['{%this.renderContainer(out,values)%}']
		}
	]),

	renderSelectors: {
		responseBox: '.editme',
		repliedToEl: '.name.other'
	},


	fillIn: function () {
		var me = this,
			replyTo = me.record.get('inReplyTo'),
			parsed = ParseUtils.parseNTIID(replyTo),
			el = me.repliedToEl;

		if (/^missing$/i.test(parsed.specific.type)) {
			el.update('[Deleted]');
			el.removeCls('name');
			return;
		}

		function resolved (u) {
			if (el.dom) {
				el.update(u.getName());
				me.mon(el, 'click', function () {
					me.fireEvent('show-profile', u);
				});
			}
		}

		function fill (o) {
			if (el.dom) {
				UserRepository.getUser(o.get('Creator')).then(resolved, error);
			}
		}

		function error () {
			if (el.dom) {
				el.removeCls('name');
				el.update('[Missing]');
			}
		}

		Service.getObject(replyTo, fill, error);
	},


	setRecordTitle: Ext.emptyFn,
	//getItemReplies: Ext.emptyFn,
	fillInReplies: Ext.emptyFn,
	loadReplies: Ext.emptyFn
});
