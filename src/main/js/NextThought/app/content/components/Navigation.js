Ext.define('NextThought.app.content.components.Navigation', {
	extend: 'NextThought.common.components.Navigation',
	alias: 'widget.content-navigation',

	requires: [
		'NextThought.app.content.components.ContentSwitcher'
	],

	cls: 'content-navigation',


	initComponent: function() {
		this.callParent(arguments);

		this.ContentSwitcher = Ext.widget('content-switcher', {
			ownerCt: this,
			switchContent: this.switchContent.bind(this)
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.bundle) {
			this.bundleChanged(this.bundle);
		}
	},


	bundleChanged: function(bundle, activeRoute) {
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

		var cls = 'is-book',
			data = bundle.asUIData();

		this.titleEl.update(data.title);

		if (data.label) {
			this.labelEl.update(data.label);
			this.labelEl.removeCls('hidden');
		} else {
			this.labelEl.update('');
			this.labelEl.addCls('hidden');
		}
	},


	switchContent: function(route) {
		if (this.bodyView && this.bodyView.onContentChange) {
			this.bodyView.onContentChange('', route);
		}
	},


	onActiveContentClicked: function(e) {
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


	onBodyClick: function(e) {
		if (!e.getTarget('.content-switcher') && this.ContentSwitcher.isVisible()) {
			this.ContentSwitcher.hide();
		}
	},

	//when we are collapsing tabs from a resize, go ahead and
	//realign the content switcher
	maybeCollapse: function() {
		var r = this.callParent(arguments);

		if (this.ContentSwitcher.isVisible()) {
			this.onActiveContentClicked();
		}

		return r;
	}
});
