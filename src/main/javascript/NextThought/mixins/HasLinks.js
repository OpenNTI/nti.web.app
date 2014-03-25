Ext.define('NextThought.mixins.HasLinks', {

	getLink: function(rel) {
		var links = this.get('Links') || Ext.data.Types.LINKS.convert((this.raw && this.raw.Links) || []),
			ref = links ? links.getRelHref(rel) : null;
		return ref ? getURL(ref) : null;
	},


	hasLink: function(rel) {
		return !!this.getLink(rel);
	},


	getReportLinks: function() {
		var links = this.get('Links').links || (this.raw && this.raw.Links),
			reports = [];

		(links || []).forEach(function(link) {
			if (link.rel.indexOf('report-') === 0) {
				reports.push(link);
			}
		});

		return reports;
	}
});
