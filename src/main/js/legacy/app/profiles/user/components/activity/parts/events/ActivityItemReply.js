const Ext = require('extjs');

const {isMe} = require('legacy/util/Globals');

require('legacy/app/annotations/note/Panel');
require('legacy/util/Content');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.ActivityItemReply', {
	extend: 'NextThought.app.annotations.note.Panel',
	alias: 'widget.profile-activity-item-reply',
	defaultType: 'profile-activity-item-reply',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'reply profile-activity-reply-item',
			cn: [
				{cls: 'avatar-wrapper', cn: ['{user:avatar}']},
				{ cls: 'meta', cn: [
					{ cls: 'controls', cn: [
						{ cls: 'favorite-spacer' },
						{ cls: 'like' }
					]},
					{ tag: 'span', cls: 'name' },
					' ',
					{ tag: 'span', cls: 'time' }
				]},
				{ cls: 'body' },
				{ cls: 'respond',
					cn: [
						{
							cls: 'reply-options',
							cn: [
								{ cls: 'link reply', html: 'Reply' },
								{ cls: 'link edit', html: 'Edit' },
								{ cls: 'link flag', html: 'Report' },
								{ cls: 'link delete', html: 'Delete' }
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
		noteBody: '.reply',
		editEl: '.reply-options .edit',
		flagEl: '.reply-options .flag',
		deleteEl: '.reply-options .delete'
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			user: this.user
		});
	},

	afterRender: function () {
		var D = Ext.dom.Element.DISPLAY;
		this.flagEl.setVisibilityMode(D);
		this.editEl.setVisibilityMode(D);
		this.deleteEl.setVisibilityMode(D);

		try {
			if (!this.up('profile-activity-item').isExpanded()) {
				this.mon(this.replyButton, 'click', this.shouldRevealReplies, this);
			}
		}
		catch (e) {
			console.warn('ActivityItemReply was not in an ActivityItem');
		}

		this.callParent(arguments);
		this.mon(this.deleteEl, 'click', this.onDelete, this);
		this.mon(this.editEl, 'click', this.onEdit, this);
	},

	onEdit: function () {
		var parent = this.up('profile-activity-item');

		if (this.replyMode || parent.replyMode) { return; }
		this.callParent(arguments);
	},

	shouldRevealReplies: function () {
		this.mun(this.replyButton, 'click', this.shouldRevealReplies, this);

		var activityItem = this.up('profile-activity-item');
		if (!activityItem || activityItem.isExpanded()) {
			return;
		}
		activityItem.replyToId = this.record.getId();
		activityItem.fireEvent('reveal-replies');
	},

	setRecord: function () {
		this.callParent(arguments);

		if (!this.rendered) {
			return;
		}

		if (isMe(this.record.get('Creator'))) {
			this.flagEl.hide();
		}
		else {
			this.editEl.hide();
			this.deleteEl.hide();
			this.flagEl.addCls('last');
		}
	}
});
