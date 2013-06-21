Ext.define('NextThought.mixins.note-feature.GetLatestReply', {
//Mixin assumptions: Mixed into a Container, with a property "record" that has implemented "loadReplies"

	getItemReplies: function () {
		var me = this,
			r = me.record;

		function cb(store, records) {
			var count = store.getCount(), rec = null, items;

			//Set comments count
			if (me.commentsEl) {
				me.commentsEl.update(count + me.commentsEl.getAttribute('data-label'));
				if (count === 0 || count === 1) {
					delete me.commentsEl;
				}
			}

			//Stash replies on the record
			items = store.getItems();
			if (items.length === 1 && items[0].getId() === me.record.getId()) {
				items = (items[0].children || []).slice();
			}
			else {
				console.warn('There was an unexpected result from the reply store.');
			}
			me.record.children = items;

			//Set the latest direct reply
			store.each(function (r) {
				if ((!rec || ( (rec.get('CreatedTime')) < r.get('CreatedTime'))) && (r.get('inReplyTo') === me.record.getId())) {
					rec = r;
				}
			});

			if (rec) {
				me.add({record: rec, autoFillInReplies: false});
			}
		}

		//Sigh even though in some cases we only want one reply we still fetch them all.
		//We do this b/c what they really want is the most recently created direct reply...
		r.loadReplies(cb, me, {sortOn: 'createdTime', sortOrder: 'descending'});
	}
});
