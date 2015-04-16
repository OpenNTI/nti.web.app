Ext.define('NextThought.view.account.activity.note.Popout', {
	extend: 'NextThought.view.account.activity.Popout',
	alias: ['widget.activity-popout-note'],

	requires: [
		'NextThought.view.account.activity.note.Preview',
		'NextThought.util.UserDataThreader'
	],

	statics: {

		popupAfterResolvingParent: function(record, el, viewRef, anchor, cb) {

			var me = this,
				ref = record.get('references').first();

			function load(resolvedRecord) {
				if (resolvedRecord !== record) {
					resolvedRecord.focusRecord = record;
				}
				me.popupNow(resolvedRecord, el, viewRef, anchor, cb);
			}

			if (!this.beforeShowPopup(record, el)) {
				return;
			}

			if (!ref) {
				load(record);
				return;
			}
      Service.getObject(ref, load, function failure() {
	            var recs = NextThought.util.UserDataThreader.threadUserData(record);
	            load((recs || []).first());
      }, me);
		}

	}
},function() {
	this.popupNow = this.popup;
	this.popup = this.popupAfterResolvingParent;
});
