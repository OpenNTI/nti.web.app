const Ext = require('@nti/extjs');

const NTIFormat = require('legacy/util/Format');
const NavigationActions = require('legacy/app/navigation/Actions');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.membership.parts.Membership', {
	extend: 'Ext.Component',

	title: '',

	entryTpl: '',

	emptyTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'empty-text', html: '{text}'
	})),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}'},
		{cls: 'entries'}
	]),


	renderSelectors: {
		entriesEl: '.entries'
	},


	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.title
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.entriesEl, 'click', this.onEntryClick.bind(this));
	},


	addEntry: function (data) {
		var entry = Ext.get(this.entryTpl.append(this.entriesEl, data));

		if (data && data.member) {
			this.mon(data.member, 'avatarChanged', this.updateAvatar.bind(this, entry));
		}
	},


	updateAvatar: function (entry, record) {
		var avatar = entry && entry.down('.avatar-pic'), a;

		if (avatar) {
			a = NTIFormat.avatar(record);
			avatar.dom.innerHTML = a;
		}
	},


	removeAll: function () {
		this.entriesEl.dom.innerHTML = '';
	},


	showEmptyText: function (text) {
		this.emptyTpl.append(this.entriesEl, {text: text});
	},


	onEntryClick: function (e, el) {
		var entryEl = e.getTarget('.entry[data-route]'),
			route = entryEl && entryEl.getAttribute('data-route'),
			parts;

		if (route) {
			parts = [route];
			if (this.profileRouteRoot) {
				parts = Ext.Array.insert(parts, 0, [this.profileRouteRoot]);
			}
			NavigationActions.pushRootRoute('', parts.join('/'));
		}
	}
});
