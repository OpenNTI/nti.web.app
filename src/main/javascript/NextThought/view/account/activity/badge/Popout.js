Ext.define('NextThought.view.account.activity.badge.Popout', {
	extend: 'NextThought.view.account.activity.Popout',
	alias: ['widget.activity-popout-badge'],

	statics: {

		popupAfterResolvingParent: function(record, el, viewRef, anchor, cb) {
			if (record.get('isEmpty')) {
				console.error('Cant popup an empty badge.');
				return;
			}

			this.popupNow.apply(this, arguments);
		}

	}
},function() {
	this.popupNow = this.popup;
	this.popup = this.popupAfterResolvingParent;
});
