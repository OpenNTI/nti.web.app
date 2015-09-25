export default Ext.define('NextThought.app.content.components.Navigation', {
	extend: 'NextThought.common.components.Navigation',
	alias: 'widget.content-navigation',

	cls: 'content-navigation',

	afterRender: function() {
		this.callParent(arguments);

		if (this.bundle) {
			this.bundleChanged(this.bundle);
		}
	},


	bundleChanged: function(bundle) {
		if (!this.rendered) {
			this.bundle = bundle;
			return;
		}

		if (this.currentBundle === bundle) {
			return;
		}

		this.currentBundle = bundle;

		var cls = 'is-book',
			data = bundle.asUIData();

		this.titleEl.update(data.title);

		if (data.label) {
			this.titleEl.dom.setAttribute('data-label', data.label);
		} else {
			this.titleEl.dom.removeAttribute('data-label');
		}
	}
});
