/*
	TODO: Does this need to be a model?
 */
export default Ext.define('NextThought.model.resolvers.VideoPosters', {
	requires: [
		'NextThought.model.resolvers.videoservices.*'
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
