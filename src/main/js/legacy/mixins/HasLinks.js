const Ext = require('@nti/extjs');
const { getService } = require('@nti/web-client');
const { getURL } = require('internal/legacy/util/Globals');

module.exports = exports = Ext.define('NextThought.mixins.HasLinks', {
	getLink: function (rel, raw) {
		var links =
				this.get('Links') ||
				Ext.data.Types.LINKS.convert(
					(this.raw && this.raw.Links) || []
				),
			ref = links ? links.getRelHref(rel, raw === true) : null; //raw is only ever true if and only if passing literally "true" to the param. Not 'truthy'
		return ref ? getURL(ref) : null;
	},

	getLinkProperty(rel, prop) {
		const links = this.get('Links');
		const link = links && links.getRelLink(rel);

		return link && link[prop];
	},

	getLinkFragment: function (rel) {
		return (this.getLink(rel, true) || '').split('#')[1];
	},

	getLinkMethod: function (rel) {
		var links = this.get('Links'),
			link = links && links.getRelLink(rel);

		return link && link.method;
	},

	hasLink: function (rel) {
		return !!this.getLink(rel);
	},

	deleteLink: function (rel) {
		var links = this.get('Links').links || (this.raw && this.raw.Links),
			reqLink;

		Ext.Array.every(links || [], function (link) {
			if (link && link.rel === rel) {
				reqLink = link;
				return false;
			}
			return true;
		});

		if (reqLink) {
			Ext.Array.remove(links, reqLink);
		}
	},

	getReportLinks: function () {
		var linksObj = this.get('Links'),
			links =
				(linksObj && linksObj.links) || (this.raw && this.raw.Links),
			reports = [];

		(links || []).forEach(function (link) {
			if (link.rel.indexOf('report-') === 0) {
				reports.push(link);
			}
		});

		return reports;
	},

	async fetchLink(relOrInit) {
		const {
			method = 'get',
			mode = 'parse', //parse is the default in lib-interfaces
			rel,
		} = typeof relOrInit === 'string'
			? {
					rel: relOrInit,
			  }
			: relOrInit;

		if (method !== 'get' || mode !== 'raw') {
			throw new Error(
				'[Legacy ExtJS Model] For more complicated requests, get the lib-interfaces version of this model'
			);
		}

		const service = await getService();
		return service.get(this.getLink(rel));
	},
});
