const Ext = require('@nti/extjs');
const { dispatch } = require('@nti/lib-dispatcher');

const { getString } = require('legacy/util/Localization');

require('legacy/common/menus/Reports');

const FORUM_LIST_REFRESH = 'FORUM_LIST_REFRESH';

module.exports = exports = Ext.define('NextThought.app.forums.components.forum.parts.Header', {
	extend: 'Ext.Component',
	alias: 'widget.forums-forum-header',
	cls: 'topic-list-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'new-topic', html: '{{{NextThought.view.forums.forum.parts.Header.new}}}'},
		{cls: 'delete-forum', html: 'Delete'},
		{cls: 'edit-forum', html: 'Edit'},
		{cls: 'controls', cn: [
			{cls: 'position', cn: [
				{tag: 'span', cls: 'bold', html: '{{{NextThought.view.forums.forum.parts.Header.page}}}'},
				{tag: 'span', cls: 'current bold', html: '{currentPage}'},
				'{{{NextThought.view.forums.forum.parts.Header.of}}}',
				{tag: 'span', cls: 'total bold', html: '{totalPages}'}
			]},
			{cls: 'pager', cn: [
				{cls: 'prev disabled'},
				{cls: 'next disabled'}
			]}
		]}
	]),

	renderSelectors: {
		newTopicEl: '.new-topic',
		deleteForumEl: '.delete-forum',
		editForumEl: '.edit-forum',
		currentEl: '.controls .position .current',
		totalEl: '.controls .position .total',
		prevEl: '.controls .pager .prev',
		nextEl: '.controls .pager .next'
	},

	afterRender () {
		const me = this;

		if (!me.record.getLink('add')) {
			me.newTopicEl.destroy();
		} else {
			me.mon(me.newTopicEl, 'click', function () {
				me.fireEvent('new-topic', me, me.record, me.newTopicEl);
			});
		}

		if(me.record.hasLink('edit')) {
			me.mon(me.deleteForumEl, 'click', 'deleteForum');
			me.mon(me.editForumEl, 'click', 'editForum');
		} else {
			me.deleteForumEl.hide();
			me.editForumEl.hide();
		}

		me.updatePosition();
		me.mon(me.store, 'load', 'updatePosition');

		me.mon(me.prevEl, 'click', 'previousPage');
		me.mon(me.nextEl, 'click', 'nextPage');

	},

	editForum () {
		this.onEdit();
	},

	deleteForum () {
		Ext.Msg.show({
			msg: getString(
				'NextThought.view.forums.forum.parts.Header.deletewarning'
			),
			title: getString(
				'NextThought.view.forums.forum.parts.Header.deletetitle'
			),
			icon: 'warning-red',
			buttons: {
				primary: {
					text: 'Remove',
					handler: async () => {
						try {
							await Service.requestDelete(this.record.getLink('edit'));
							dispatch(FORUM_LIST_REFRESH);
							this.replaceRouteState(null, '', '/');
						} catch (error) {
							console.error(error);
							setTimeout(() => { alert('Unable to delete this forum.'); }, 1000);
						}
					}
				},
				secondary: 'Cancel'
			}
		});
	},

	updatePosition () {
		var total = Math.ceil(this.store.getTotalCount() / this.store.pageSize),
			currentPage = total ? this.store.currentPage : 0;

		this.prevEl[(currentPage > 1) ? 'removeCls' : 'addCls']('disabled');
		this.nextEl[(currentPage < total) ? 'removeCls' : 'addCls']('disabled');

		this.currentEl.update(currentPage || '0');
		this.totalEl.update(total || '0');
	},

	previousPage () {
		var current = this.store.currentPage;

		if (current - 1 > 0) {
			this.fireEvent('page-change', current - 1);
		}
	},

	nextPage () {
		var total = Math.ceil(this.store.getTotalCount() / this.store.pageSize),
			current = this.store.currentPage;

		if (current + 1 <= total) {
			this.fireEvent('page-change', current + 1);
		}
	}
});
