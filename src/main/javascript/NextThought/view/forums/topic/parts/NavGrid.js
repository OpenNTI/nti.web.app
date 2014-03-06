Ext.define('NextThought.view.forums.topic.parts.NavGrid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.forums-topic-nav-grid',

	requires: [
		'NextThought.view.forums.topic.parts.NavHeader'
	],

	viewConfig: {
		cls: 'nav-outline forum-outline'
	},

	selModel: {
		preventFocus: true,
		pruneRemoved: false
	},

	cls: 'topic-grid',

	ui: 'course-assessment',
	plain: true,
	border: false,
	frame: false,
	scroll: 'vertical',
	sealedColumns: true,
	enableColumnHide: false,
	enableColumnMove: false,
	enableColumnResize: false,
	columnLines: false,
	rowLines: false,

	dockedItems: {
		xtype: 'forums-topic-nav-header',
		dock: 'top'
	},

	columns: [
		{dataIndex: 'Creator', flex: 1, xtype: 'templatecolumn', tpl:
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

		this.navHeader = this.down('forums-topic-nav-header');

		if (this.record && !this.record.getLink('add')) {
			this.navHeader.hideNewTopic();
		} else {
			this.mon(this.navHeader, 'maybe-new-topic', 'maybeShowTopicEditor');
		}

		this.on('cellclick', 'onItemClick');

		if (Ext.is.iOS) {
			Ext.apply(this, {maxHeight: 510});
		}
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

		if (this.rendered && !this.record.getLink('add')) {
			this.navHeader.hideNewTopic();
		}
	},


	setActiveRecord: function(record) {
		this.record.activeRecord = record;
		this.view.select([record]);
	},


	onItemClick: function(cmp, td, cellIndex, record) {
		this.fireEvent('update-body', record);
	}
});
