Ext.define('NextThought.view.library.available.Courses', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.library-available-courses',

	requires: ['NextThought.view.courseware.coursecatalog.Collection'],

	floating: true,

	label: 'Add Courses',

	constrainTo: Ext.getBody(),
	width: 1024,
	height: '75%',
	dialog: true,
	header: false,
	componentLayout: 'natural',
	layout: 'anchor',

	cls: 'available-courses',

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],
	getDockedItems: function() { return []; },
	center: Ext.emptyFn,

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'name', html: '{label}'},
			{cls: 'close'}
		]},
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] },
		{cls: 'footer', cn: [
			{cls: 'done button close', html: 'Finished'}
		]}
	]),

	items: [
		{
			xtype: 'tabpanel',
			anchor: '100% -100px',
			defaultType: 'course-catalog-collection',
			ui: 'available',
			plain: true,
			cls: 'available-courses-tabpanel',
			bodyCls: 'scrollable',
			tabBar: {
				baseCls: 'available-courses-tabbar',
				plain: true,
				margin: 0,
				ui: 'available',
				defaults: {
					ui: 'available',
					border: false
				},
				xhooks: {
					initComponent: function() {
						this.callParent(arguments);
						//this.layout.padding = 0;
						this.layout.overflowHandler =
							new Ext.layout.container.boxOverflow.None(this.layout, {});
						this.layout.overflowHandler.scrollToItem = Ext.emptyFn;
					}
				}
			}
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.tabpanel = this.down('tabpanel');

		if (this.upcoming) {
			this.tabpanel.setActiveTab(this.updateUpcoming(this.upcoming));
		}

		if (this.current) {
			this.updateCurrent(this.current);
		}

		if (this.archived) {
			this.updateArchived(this.archived);
		}
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.label
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el, 'click', function(e) {
			if (e.getTarget('.close')) {
				me.close();
			}
		});
	},


	buildStore: function(data) {
		return new Ext.data.Store({
			model: 'NextThought.model.courses.CourseCatalogEntry',
			data: data
		});
	},


	updateCurrent: function(courses) {
		var cmp = this.tabpanel.down('[title=current]');

		if (Ext.isEmpty(courses)) {
			if (cmp) { cmp.destroy(); }

			cmp = this.tabpanel.add({
				xtype: 'box',
				autoEl: {tag: 'div', cls: 'empty-text', html: 'There are no current courses.'},
				title: 'current'
			});

			return cmp;
		}

		if (cmp) {
			if (!cmp.store) {
				cmp.bindStore(this.buildStore(courses));
			} else {
				cmp.store.loadRecords(courses);
			}
		} else {
			cmp = this.tabpanel.add({
				xtype: 'course-catalog-collection',
				store: this.buildStore(courses),
				title: 'current'
			});
		}

		return cmp;
	},


	updateUpcoming: function(courses) {
		var cmp = this.tabpanel.down('[title=upcoming]');

		if (Ext.isEmpty(courses)) {
			if (cmp) { cmp.destroy(); }

			cmp = this.tabpanel.add({
				xtype: 'box',
				autoEl: {tag: 'div', cls: 'empty-text', html: 'There are no upcoming courses.'},
				title: 'upcoming'
			});

			return cmp;
		}

		if (cmp) {
			if (!cmp.store) {
				cmp.bindStore(this.buildStore(courses));
			} else {
				cmp.store.loadRecords(courses);
			}
		} else {
			cmp = this.tabpanel.add({
				xtype: 'course-catalog-collection',
				store: this.buildStore(courses),
				title: 'upcoming'
			});
		}

		return cmp;
	},


	updateArchived: function(courses) {
		var cmp = this.tabpanel.down('[title=archived]');

		if (Ext.isEmpty(courses)) {
			if (cmp) { cmp.destroy(); }

			cmp = this.tabpanel.add({
				xtype: 'box',
				autoEl: {tag: 'div', cls: 'empty-text', html: 'There are no archived courses.'},
				title: 'archived'
			});

			return cmp;
		}

		if (cmp) {
			if (!cmp.store) {
				cmp.bindStore(this.buildStore(courses));
			} else {
				cmp.store.loadRecords(courses);
			}
		} else {
			cmp = this.tabpanel.add({
				xtype: 'course-catalog-collection',
				store: this.buildStore(courses),
				title: 'archived'
			});
		}

		return cmp;
	}
});
