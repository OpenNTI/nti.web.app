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
		var p = new Promise(),
			ns = this.navStore;

		if (!ns) {
			p.reject('Navigation store not loaded');
			return p;
		}

		this.getContents()
				.fail(function(reason) {p.reject(reason);})
				.done(function(me) {
					var legacy, node = (me.get('Items') || []).reduce(function(n, o) {
						return n || (o.findNode && o.findNode(id));
					}, null);

					//hack:
					if (node) {
						legacy = ns.getById(id);
						if (legacy) {
							node.set('title', legacy.get('label'));
						}
					}

					if (node) {
						p.fulfill(node);
					} else {
						p.reject('Not found');
					}
				});

		return p;
	}
});
