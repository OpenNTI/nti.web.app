Ext.define('NextThought.model.courseware.CourseOutline', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'auto', persist: false}
	],

	getContents: function() {
		var me = this, l;

		if (!me.__promiseToLoadContents) {

			l = me.getLink('contents');

			console.time('Requesting Course Outline: ' + l);
			me.__promiseToLoadContents = Service.request(l)
					.then(function(text) { return Ext.decode(text); })
					.then(function(json) { return ParseUtils.parseItems(json); })
					.done(function(items) {
						me.set('Items', items);
						console.timeEnd('Requesting Course Outline: ' + l);
						return me;
					});
		}

		return me.__promiseToLoadContents;
	},


	findNode: function(id) {
		if (!this.navStore) {
			return Promise.reject('Navigation store not loaded');
		}

		return this.getContents()
				.then(function(me) { return me.getNode(id); })
				.done(function(node) {
					if (!node) {
						throw 'Not found';
					}
					return node;//probably not needed
				});
	},


	getNode: function(id) {
		var legacy, node = (this.get('Items') || []).reduce(function(n, o) {
			return n || (o.findNode && o.findNode(id));
		}, null);

		//hack:
		if (node) {
			legacy = this.navStore.getById(id);
			if (legacy) {
				node.set('title', legacy.get('label'));
			}
		}

		return node;
	},


	isVisible: function(ntiid) {
		var i = 0, rec,
			lineage = ContentUtils.getLineage(ntiid) || [];

		for (i = 0; i < lineage.length; i++) {
			rec = this.getNode(lineage[i]);

			if (rec && rec.get('AvailableBeginning') < new Date()) {
				return true;
			}
		}

		return false;
	}
});
