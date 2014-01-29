Ext.define('NextThought.model.courseware.CourseOutline', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'auto', persist: false}
	],

	getContents: function() {
		var me = this, l,
			p = me.__promiseToLoadContents || new Promise();

		if (me.__promiseToLoadContents) {
			return p;
		}

		l = me.getLink('contents');

		console.time('Requesting Course Outline: ' + l);
		me.__promiseToLoadContents = p;

		Service.request(l)
				.fail(function(reason) { p.reject(reason); })
				.done(function(text) {
					var json = Ext.decode(text, true), items;
					if (!json) {
						p.reject('Bad response:' + text);
						return;
					}
					items = ParseUtils.parseItems(json);
					me.set('Items', items);
					console.timeEnd('Requesting Course Outline: ' + l);
					p.fulfill(me);
				});

		return p;
	},


	findNode: function(id) {
		var p = new Promise();

		if (!this.navStore) {
			p.reject('Navigation store not loaded');
			return p;
		}

		this.getContents()
				.fail(function(reason) {p.reject(reason);})
				.done(function(me) {
					var node = me.getNode(id);
					if (node) {
						p.fulfill(node);
					} else {
						p.reject('Not found');
					}
				});

		return p;
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
