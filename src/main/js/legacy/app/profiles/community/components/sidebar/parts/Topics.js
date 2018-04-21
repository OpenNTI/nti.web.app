const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.app.profiles.community.components.sidebar.parts.Topics', {
	extend: 'Ext.Component',
	alias: 'widget.profile-community-topics',


	cls: 'community-topics',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'li', cls: 'topic{[values.cls ? " " + values.cls : ""]}', 'data-route': '{route}', 'data-count': '{count}', html: '{label}'
	})),

	renderTpl: Ext.DomHelper.markup([
		{tag: 'ul', cls: 'topics'},
		{cls: 'loading hidden', html: 'Loading...'}
	]),


	renderSelectors: {
		topicsEl: '.topics',
		loadingEl: '.loading'
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.topicsEl, 'click', this.onTopicsClick.bind(this));
	},


	updateEntity: function (entity, activeForum) {
		if (!this.rendered) {
			this.on('afterrender', this.updateEntity.bind(this, entity));
			return;
		}

		var me = this;

		if (this.activeEntity !== entity) {
			me.clearTopics();
			me.loadingEl.removeCls('hidden');
		}

		me.activeEntity = entity;

		me.topicMap = {};

		entity.getForums()
			.then(function (forums) {
				me.clearTopics();

				if (entity.hasActivity()) {
					me.addTopic({
						cls: activeForum === 'all' ? 'active' : '',
						route: 'all',
						count: 0,
						label: 'All Activity'
					});

					me.topicMap.all = 'all';
				}

				forums.forEach(function (forum) {
					var id = forum.getId();

					me.topicMap[id] = forum;

					me.addTopic({
						cls: id === activeForum ? 'active' : '',
						route: id,
						count: 0,
						label: forum.get('title')
					});
				});
			})
			.always(function () {
				me.loadingEl.addCls('hidden');
			});
	},


	addTopic: function (data) {
		this.entryTpl.append(this.topicsEl, data);
	},


	clearTopics: function () {
		if (!this.rendered) {
			return;
		}

		this.topicsEl.dom.innerHTML = '';
	},


	onTopicsClick: function (e) {
		var topicEl = e.getTarget('.topic'),
			id = topicEl.getAttribute('data-route'),
			forum = this.topicMap[id];

		if (forum && !topicEl.classList.contains('active')) {
			this.showForum(forum);
		}
	}
});
