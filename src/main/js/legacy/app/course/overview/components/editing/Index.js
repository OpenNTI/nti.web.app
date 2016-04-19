var Ext = require('extjs');
var MixinsRouter = require('../../../../../mixins/Router');
var MixinsScrolling = require('../../../../../mixins/Scrolling');
var OutlineIndex = require('./outline/Index');
var EditingPrompt = require('./Prompt');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing',

	mixins: {
		Router: 'NextThought.mixins.Router',
		Scrolling: 'NextThought.mixins.Scrolling'
	},

	layout: 'none',
	items: [],

	afterRender: function () {
		this.callParent(arguments);

		if (this.isLoading) {
			this.showLoadingMask();
		}
	},

	showLoadingMask: function () {
		this.isLoading = true;

		if (!this.rendered) { return; }

		var height = this.getHeight() || 0;

		height = Math.max(height, 200);

		this.el.dom.style.height = height + 'px';

		this.el.mask('Loading...');
	},

	hideLoadingMask: function () {
		delete this.isLoading;

		if (!this.rendered) { return; }

		var style = this.el.dom.style;

		if (style.removeProperty) {
			style.removeProperty('height');
		} else {
			style.height = 'auto';
		}

		this.el.unmask();
	},

	setActiveBundle: function (bundle) {
		this.bundle = bundle;
	},

	editOutlineNode: function (record, outline) {
		//If we are switching outline nodes scroll the page to the top
		if (!this.activeRecord || this.activeRecord.getId() !== record.getId()) {
			this.scrollPageToTop();
		}

		this.showLoadingMask();
		this.removeAll(true);

		this.activeRecord = record;

		var Outline = NextThought.app.course.overview.components.editing.outline.Index,
			cmp, loaded;

		if (Outline.canHandle(record.mimeType)) {
			cmp = this.add({
				xtype: 'overview-editing-outline',
				record: record,
				outline: outline,
				bundle: this.bundle,
				afterDelete: this.doDelete.bind(this),
				parentRecord: record.parent,
				navigateToOutlineNode: this.navigateToOutlineNode,
				navigate: this.navigate.bind(this)
			});
		}

		if (cmp && cmp.onceLoaded) {
			loaded = cmp.onceLoaded()
				.then(this.hideLoadingMask.bind(this));
		} else {
			this.hideLoadingMask();
			loaded = cmp ? Promise.resolve() : Promise.reject('No cmp to handle record');
		}


		return loaded;
	},

	doDelete: function () {
		var navigateTo;

		if (!this.activeRecord) { return; }

		navigateTo = this.activeRecord.nextSibling || this.activeRecord.previousSibling || this.activeRecord.parent;

		if (navigateTo) {
			this.navigateToOutlineNode(navigateTo);
		}
	},

	navigate: function (obj) {
		obj.parent = this.activeRecord;
		this.navigateToObject(obj);
	}
});
