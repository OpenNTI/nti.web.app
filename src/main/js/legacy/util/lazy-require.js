Object.assign(exports, {
	get (name, packageRequire) {

		if (!exports.hasOwnProperty(name)) {
			Object.defineProperty(exports, name, {
				get () {
					delete exports[name];
					return exports[name] = packageRequire();
				}
			});
		}

		return exports;
	}
});
