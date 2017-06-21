const Ext = require('extjs');

const Vimeo = require('./videoservices/Vimeo');
const Youtube = require('./videoservices/Youtube');


/*
	TODO: Does this need to be a model?
 */
module.exports = exports = Ext.define('NextThought.model.resolvers.VideoPosters', {
	statics: {
		YOUTUBE: 'youtube',
		VIMEO: 'vimeo',

		getResolver: function (source) {
			var service = source.service,
				cls = Ext.ClassManager.getByAlias('resolvers.videoservices.' + service);
			if (!cls) {
				console.error('No resolver for source:', source);
				return;
			}

			return cls.create({source: source});
		},

		resolveForSource: function (source) {
			var resolver = this.getResolver(source);

			if (!resolver) {
				return Promise.reject('No resolver');
			}

			return resolver.resolve();
		},


		resolvePoster: function (type, id) {
			var resolve;

			if (type === this.YOUTUBE) {
				resolve = Youtube.resolvePosterForID(id);
			} else if (type === this.VIMEO) {
				resolve = Vimeo.resolvePosterForID(id);
			} else {
				resolve = Promise.reject('Unknown video type: ', type, id);
			}

			return resolve;
		}

	}
});
