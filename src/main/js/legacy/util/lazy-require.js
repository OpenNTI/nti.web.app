Object.assign(exports, {
	get (name, packageRequire, cache = {}) {

		if (!cache.hasOwnProperty(name)) {
			Object.defineProperty(cache, name, {
				get () {
					delete cache[name];
					return cache[name] = packageRequire();
				}
			});
		}

		if (!cache.get) {
			cache.get = (n, cb) => exports.get(n, cb, cache);
		}

		return cache;
	}
});
