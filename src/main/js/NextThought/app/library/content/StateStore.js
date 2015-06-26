Ext.define('NextThought.app.library.content.StateStore', {
	extend: 'NextThought.common.StateStore',

	CONTENT_PACKAGES: [],
	CONTENT_BUNDLES: [],


	getContentPackages: function() {
		return this.CONTENT_PACKAGES;
	},


	getContentBundles: function() {
		return this.CONTENT_BUNDLES;
	},


	setContentPackages: function(packages) {
		packages = packages.map(function(p) {
			return NextThought.model.ContentBundle.fromPackage(p);
		});

		this.CONTENT_PACKAGES = packages;

		this.fireEvent('content-packages-set', packages);
	},


	setContentBundles: function(bundles) {
		this.CONTENT_BUNDLES = bundles;

		this.fireEvent('content-bundles-set', bundles);
	},


	getTitle: function(index) {
		var title, i, packages = this.CONTENT_PACKAGES, content;

		for (i = 0; i < packages.length; i++) {
			content = packages[i];

			if (content.get('index') === index || content.get('NTIID') === index) {
				return content;
			}
		}
	},


	__findIn: function(list, fn) {
		var i, item = null;

		for (i = 0; i < list.length; i++) {
			if (fn.call(null, list[i])) {
				item = list[i];
				break;
			}
		}

		return item;
	},


	findContentBy: function(fn) {
		var bundles = this.CONTENT_BUNDLES || [],
			packages = this.CONTENT_PACKAGES || [],
			content;

		content = this.__findIn(bundles, fn);

		if (!content) {
			content = this.__findIn(packages, fn);
		}

		return content;
	},


	findContent: function(id) {
		function fn(rec) {
			return rec.get('NTIID') === id;
		}

		var bundle = this.__findIn(this.CONTENT_BUNDLES, fn);

		if (!bundle) {
			bundle = this.__findIn(this.CONTENT_PACKAGES, fn);
		}

		return bundle;
	},


	findContentByPriority: function(fn) {
		var priorities = {},
			keys = [],
			result = [];

		function find(bundle) {
			var priority = fn.call(null, bundle);

			if (priority && priority > 0) {
				if (priorities[priority]) {
					priorities[priority].push(bundle);
				} else {
					keys.push(priority);
					priorities[priority] = [bundle];
				}
			}

			return false;
		}


		this.__findIn(this.CONTENT_BUNDLES, find);
		this.__findIn(this.CONTENT_PACKAGES, find);

		keys.sort();

		keys.forEach(function(key) {
			result = result.concat(priorities[key]);
		});

		return Promise.resolve([]);
	}
});
