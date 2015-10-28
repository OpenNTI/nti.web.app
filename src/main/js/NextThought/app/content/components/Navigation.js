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


	onActiveContentClicked: function() {
		var active = this.titleContainerEl.dom,
			rect = active && active.getBoundingClientRect();

		this.ContentSwitcher.openAt(rect.right - 10, rect.bottom);
	},


	onActiveContentUnClicked: function() {
		this.ContentSwitcher.hide();
	}
});
