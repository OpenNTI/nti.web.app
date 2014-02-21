Ext.define('NextThought.view.forums.topic.Navigation', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.forums-topic-nav',

	require: [
		'NextThought.view.forums.topic.parts.NavHeader'
	],

	cls: 'topic-nav forum-nav',

	viewConfig: {
		cls: 'nav-outline forum-outline'
	},

	selModel: {
		pruneRemoved: false
	},

	ui: 'course-assessment',
	plain: true,
	border: false,
	frame: false,
	scroll: 'vertical',
	sealedColumns: true,
	enableColumnHide: false,
	enableColumnMove: false,
	enableColumnResize: false,

	dockedItems: {
		xtype: 'forums-topic-nav-header',
		dock: 'top'
	},

	columns: [
		{dataIndex: 'Creator', width: 255, xtype: 'templatecolumn', tpl:
			Ext.DomHelper.markup([
				{ cls: 'outline-row', 'data-qtip': '{title}', cn: [
					{cls: 'author', html: '{Creator:displayName}'},
					{cls: 'title', html: '{title}'},
					{cls: 'meta', cn: [
						{tag: 'span', cls: 'count', html: '{PostCount:plural("Comment")}'},
						{tag: 'span', cls: 'created', html: '{CreatedTime:ago}'},
						{tag: 'span', cls: 'likes', html: '{LikeCount:plural("Like")}'}
					]}
				]}
			])
		}
	],


	afterRender: function() {
		this.callParent(arguments);

		var navHeader = this.down('forums-topic-nav-header');

		this.mon(navHeader, 'maybe-new-topic', 'maybeShowTopicEditor');

		this.on('cellclick', 'onItemClick');
	},


	maybeShowTopicEditor: function(e) {
		var me = this;

		this.fireEvent('new-topic', this, this.record, function() {
			me.onItemClick(me.record.activeRecord);
		});
	},


	setCurrent: function(record, store) {
		this.record = record;
		this.bindStore(store);
	},


	setActiveRecord: function(record) {
		this.record.activeRecord = record.getId();
		this.view.select([record]);
	},


	onItemClick: function(cmp, td, cellIndex, record) {
		this.fireEvent('update-body', record);
	}
});
