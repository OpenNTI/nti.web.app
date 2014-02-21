Ext.define('NextThought.view.forums.topic.Navigation', {
	extend: 'NextThought.view.forums.hierarchy.Navigation',
	alias: 'widget.forums-topic-nav',

	cls: 'topic-nav forum-nav',

	itemSelector: '.outline-row',
	tpl: Ext.DomHelper.markup({
		cls: 'nav-outline forum-outline', cn: [
			{cls: 'header', html: 'New Discussion'},
			{cls: 'outline-list', cn: [
				{tag: 'tpl', 'for': '.', cn: [
					{cls: 'outline-row', 'data-qtip': '{title}', cn: [
						{cls: 'author', html: '{Creator:displayName}'},
						{cls: 'title', html: '{title}'},
						{cls: 'meta', cn: [
							{ tag: 'span', cls: 'count', html: '{PostCount:plural("Comment")}'},
							{ tag: 'span', cls: 'created', html: '{CreatedTime:ago}'},
							{ tag: 'span', cls: 'likes', html: '{LikeCount:plural("Like")}'}
							// { tag: 'tpl', 'if': 'values[\'NewestDescendant\'] && values[\'NewestDescendant\'].isComment', cn: [
							// 	{ tag: 'span', cls: 'active', html: 'Last Comment {NewestDescendant.data.CreatedTime:ago}'}
							// ]}
						]}
					]}
				]}
			]}
		]
	}),


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'maybeShowTopicEditor');
	},


	maybeShowTopicEditor: function(e) {
		var me = this;
		if (e.getTarget('.header')) {
			this.fireEvent('new-topic', this, this.record, function() {
				me.onItemClick(me.store.getById(me.record.activeNTIID));
			});
		}
	},


	setCurrent: function(record, store) {
		this.record = record;
		this.bindStore(store);
	},


	setActiveRecord: function(record) {
		this.record.activeNTIID = record.getId();
		this.select([record]);
	},


	onItemClick: function(record) {
		this.fireEvent('update-body', record);
	}
});
