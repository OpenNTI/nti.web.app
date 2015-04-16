/*
	TODO: Does this need to be a model?
 */
Ext.define('NextThought.common.model.resolvers.VideoPosters', {
	requires: [
		'NextThought.common.model.resolvers.videoservices.*'
	],

	statics: {

		getResolver: function(source) {
			var service = source.service,
				cls = Ext.ClassManager.getByAlias('resolvers.videoservices.' + service);
			if (!cls) {
				console.error('No resolver for source:', source);
				return;
			}

			return cls.create({source: source});
		},

		resolveForSource: function(source) {
			var resolver = this.getResolver(source);

			if (!resolver) {
				return Promise.reject('No resolver');
			}

			return resolver.resolve();
		}

	}
});
