const Ext = require('extjs');
const { getService } = require('nti-web-client');

const CoursesStateStore = require('../../library/courses/StateStore');

require('legacy/common/components/Navigation');
require('./ContentSwitcher');


module.exports = exports = Ext.define('NextThought.app.content.components.Navigation', {
	extend: 'NextThought.common.components.Navigation',
	alias: 'widget.content-navigation',
	cls: 'content-navigation',

	initComponent: function () {
		this.callParent(arguments);

		this.ContentSwitcher = Ext.widget('content-switcher', {
			ownerCt: this,
			switchContent: this.switchContent.bind(this),
			onVisibilityChanged: this.onVisibilityChanged.bind(this)
		});

		this.LibraryCourseStateStore = CoursesStateStore.getInstance();

		this.mon(this.LibraryCourseStateStore, {
			'modified-course': (catalogEntry) => {
				this.updateEls(this.currentBundle.asUIData(), catalogEntry);
			}
		});

		this.on('beforedestroy', this.onBeforeDestroy, this);
	},

	onBeforeDestroy: function () {
		this.ContentSwitcher && this.ContentSwitcher.destroy();
	},

	afterRender: function () {
		this.callParent(arguments);

		this.activeContentEl.addCls('has-switcher');

		if (this.bundle) {
			this.bundleChanged(this.bundle);
		}
	},

	onVisibilityChanged: function (catalogEntry) {
		this.updateEls(this.currentBundle.asUIData(), catalogEntry);
	},

	/*
	 * catalogEntry always assumed to be lib-interfaces model, not webapp model
	 */
	updateEls: function (data, catalogEntry) {
		this.titleEl.update((catalogEntry && catalogEntry.Title) || data.title);

		if (data.label) {
			this.labelEl.update(data.label);
			this.labelEl.removeCls('hidden');
		} else {
			this.labelEl.update('');
			this.labelEl.addCls('hidden');
		}

		if(!catalogEntry) {
			return;
		}

		var isPreview = catalogEntry && catalogEntry.Preview;

		if (isPreview) {
			data.preview = 'in preview';
			if (catalogEntry.StartDate) {
				data.preview += '&mdash;Course starts on '
					+ Ext.Date.format(
						catalogEntry.StartDate && new Date(catalogEntry.StartDate),
						'l, F j');
			}
			this.previewTagTpl.append(this.labelEl, {'preview': data.preview});
		}
	},

	bundleChanged: function (bundle, activeRoute) {
		if (!this.rendered) {
			this.bundle = bundle;
			return;
		}

		if (this.currentBundle === bundle) {
			this.ContentSwitcher.updateRouteFor(bundle, activeRoute);
			return;
		}

		this.currentBundle = bundle;

		this.ContentSwitcher.addBundle(bundle, activeRoute);

		var data = bundle.asUIData(),
			catalog = bundle.getCourseCatalogEntry && bundle.getCourseCatalogEntry();

		getService().then(service => {
			service.getObject(catalog.rawData).then(parsed => {
				this.updateEls(data, parsed);
			});
		});
	},

	switchContent: function (route) {
		if (this.bodyView && this.bodyView.onContentChange) {
			this.bodyView.onContentChange('', route);
		}
	},

	onActiveContentClicked: function (e) {
		var active = this.titleContainerEl.dom,
			rect = active && active.getBoundingClientRect();

		//e will only be truthy if this is called from an event handler
		//if we call it manually, we don't want it to toggle
		if (this.ContentSwitcher.isVisible() && e) {
			this.ContentSwitcher.hide();
		} else {
			this.ContentSwitcher.openAt(rect.left + (rect.width / 2), rect.bottom + 5);
		}

		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	},

	onBodyClick: function (e) {
		if (!e.getTarget('.content-switcher') && this.ContentSwitcher.isVisible()) {
			this.ContentSwitcher.hide();
		}
	},

	//when we are collapsing tabs from a resize, go ahead and
	//realign the content switcher
	maybeCollapse: function () {
		var r = this.callParent(arguments);

		if (this.ContentSwitcher.isVisible()) {
			this.onActiveContentClicked();
		}

		return r;
	}
});
