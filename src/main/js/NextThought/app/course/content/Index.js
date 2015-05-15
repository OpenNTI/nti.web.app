Ext.define('NextThought.app.course.content.Index', {
	extend: 'Ext.Component',
	alias: 'widget.course-content',

	requires: [
		'NextThought.app.content.Actions',
		'NextThought.app.contentviewer.StateStore'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	
	cls: 'course-content',

	renderTpl: Ext.DomHelper.markup({
		cls: 'reader-placeholder'
	}),


	renderSelectors: {
		readerPlaceholderEl: '.reader-placeholder'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.ContentActions = NextThought.app.content.Actions.create();

		this.initRouter();

		this.addRoute('/:id', this.showContent.bind(this));
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


	showReader: function(page) {
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
			path: this.ContentActions.getContentPath(page.getId(), this.currentBundle),
			pageSource: this.ContentActions.getContentPageSource(page.getId(), this.currentBundle),
			bundle: this.currentBundle
		});

		this.reader.show();

		this.alignReader();
	},


	alignReader: function() {
		if (!this.rendered || !this.reader) {
			return;
		}

		var rect = this.readerPlaceholderEl.dom.getBoundingClientRect();

		this.reader.el.setStyle({
			top: rect.top + 'px',
			left: rect.left + 'px'
		});
	},


	showContent: function(route, subRoute) {
		var ntiid = route.params.id,
			obj = route.precache.pageInfo || route.precache.relatedWork;

		ntiid = ParseUtils.decodeFromURI(ntiid);

		this.__loadContent(ntiid, obj)
			.then(this.showReader.bind(this));
	}
});