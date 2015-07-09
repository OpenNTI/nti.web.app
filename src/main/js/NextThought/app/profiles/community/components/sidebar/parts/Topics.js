Ext.define('NextThought.app.profiles.community.components.sidebar.parts.Topics', {
	extend: 'Ext.Component',
	alias: 'widget.profile-community-topics',


	cls: 'community-topics',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'li', cls: '{[values.cls ? values.cls : ""]}', 'data-route': '{route}', 'data-count': '{count}', html: '{label}'
	})),

	renderTpl: Ext.DomHelper.markup([
		{tag: 'ul', cls: 'topics'},
		{cls: 'loading hidden', html: 'Loading...'}
	]),


	renderSelectors: {
		topicsEl: '.topics',
		loadingEl: '.loading'
	},


	updateEntity: function(entity, activeTopic) {
		if (!this.rendered) {
			this.on('afterrender', this.updateEntity.bind(this, entity));
			return;
		}

		var me = this;

		me.clearTopics();
		me.loadingEl.removeCls('hidden');

		me.addTopic({
			cls: activeTopic ? '' : 'active',
			route: '',
			count: 0,
			label: 'All Activity'
		});


		entity.getTopics()
			.then(function(forums) {
				forums.forEach(function(forum) {
					var id = forum.getId(),
						route = '/topic/';

					route += ParseUtils.encodeForURI(id);

					me.addTopic({
						cls: id === activeTopic ? 'active' : '',
						route: route,
						count: 0,
						label: forum.get('title')
					});
				});
			})
			.always(function() {
				me.loadingEl.addCls('hidden');
			});

	},


	addTopic: function(data) {
		this.entryTpl.append(this.topicsEl, data);
	},


	clearTopics: function() {
		if (!this.rendered) {
			return;
		}

		this.topicsEl.dom.innerHTML = '';
	}
});
