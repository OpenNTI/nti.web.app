Ext.define('NextThought.app.blog.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.blog-window',

	layout: 'none',
	cls: 'blog-window',

	requires: [
		'NextThought.app.blog.parts.Editor',
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading'
	],

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.onClose.bind(this),
			doNavigate: this.doNavigate.bind(this)
		});

		this.loadingEl = this.add({xtype: 'window-loading'});

		if (!this.record || this.state === 'edit') {
			this.loadEditor();
		}
	},


	onClose: function() {
		this.doClose(this.activeTopic);
	},


	loadBlog: function() {
		if (this.precache.blog) {
			return Promise.resolve(this.precache.blog);
		}

		var collection = Service.getCollection('Blog'),
			href = collection && collection.href;

		if (!href) {
			return Promise.reject('No Href');
		}

		return Service.request(href)
			.then(function(resp) {
				return ParseUtils.parseItems(resp)[0];
			});
	},


	loadEditor: function() {
		var me = this;

		me.loadBlog()
			.then(function(blog) {
				me.remove(me.loadingEl);

				me.showEditor(me.record, blog);

				//TODO: Show Path
			});
	},


	showBlog: function() {},


	showEditor: function(blogPost, blog) {
		var me = this,
			editor;

		//TODO: destroy any blog components already there
		editor = me.add({
				xtype: 'profile-blog-editor',
				record: blogPost,
				blog: blog,
				sharingValue: {entities: [Service.getFakePublishCommunity()]}
			});


		me.mon(editor, {
			'cancel': function(rec) {
				me.remove(editor);

				if (me.record) {
					me.showBlog(blog);
				} else {
					me.doClose();
				}
			},
			'after-save': function(rec) {
				me.remove(editor);
				me.record = rec;
				me.showBlog(rec, forum);

				if (me.monitors && me.monitors.afterSave) {
					me.monitors.afterSave(rec);
				}
			}
		});
	}

}, function() {
	NextThought.app.windows.StateStore.register('new-blog', this);
});
