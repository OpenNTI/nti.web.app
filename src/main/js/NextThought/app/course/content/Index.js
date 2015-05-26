Ext.define('NextThought.app.course.content.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-content',

	requires: [
		'NextThought.app.content.Actions',
		'NextThought.app.contentviewer.StateStore'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},


	layout: 'none',

	
	cls: 'course-content',


	initComponent: function() {
		this.callParent(arguments);

		this.ContentActions = NextThought.app.content.Actions.create();

		this.initRouter();

		this.addRoute('/:id', this.showContent.bind(this));

		this.on('beforedeactivate', this.onBeforeDeactivate.bind(this));
	},


	onBeforeDeactivate: function() {
		if (!this.reader) { return; }

		this.reader.hide();

		this.reader.destroy();
	},


	bundleChanged: function(bundle) {
		if (bundle === this.currentBundle) { return; }

		if (this.reader) {
			this.reader.destroy();
		}

		this.currentBundle = bundle;
	},


	__loadContent: function(id, obj) {
		if (obj && obj.getId() === id) {
			return Promise.resolve(obj);
		}

		return Service.getObject(id);
	},


	showReader: function(page, parent) {
		if (!this.rendered) {
			this.on('afterrender', this.showReader.bind(this, page));
			return;
		}

		if (this.reader) {
			this.reader.destroy();
		}

		this.reader = NextThought.app.contentviewer.Index.create({
			pageInfo: page instanceof NextThought.model.PageInfo ? page : null,
			relatedWork: page instanceof NextThought.model.RelatedWork ? page : null,
			path: this.ContentActions.getContentPath(page.getId(), this.currentBundle, parent),
			pageSource: this.ContentActions.getContentPageSource(page.getId(), this.currentBundle, parent),
			bundle: this.currentBundle
		});

		this.setTitle(page.get('label'));

		this.add(this.reader);
	},



	showContent: function(route, subRoute) {
		var me = this,
			ntiid = route.params.id,
			obj = route.precache.pageInfo || route.precache.relatedWork;

		ntiid = ParseUtils.decodeFromURI(ntiid);

		this.__loadContent(ntiid, obj)
			.then(function(page) {
				me.showReader(page, route.precache.parent);
			});
	}
});