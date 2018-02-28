const Ext = require('extjs');

const CourseCatalogEntry = require('./CourseCatalogEntry');
require('./CourseInstance');


module.exports = exports = Ext.define('NextThought.model.courses.ScormInstance', {
	extend: 'NextThought.model.courses.CourseInstance',
	mimeType: 'application/vnd.nextthought.courses.scormcourseinstance',
	static: {
		mimeType: 'application/vnd.nextthought.courses.scormcourseinstance'
	},
	isScormCourse: true,

	__precacheEntry: function () {
		var p = this.precachePromise,
			me = this,
			Cls = CourseCatalogEntry;

		if (!p) {
			this.precachePromise = new Promise(function (fulfill, reject) {
				var url = me.getLink('CourseCatalogEntry');

				if (!url) {
					return reject('Course Instance (' + me.getId() + ') has a null link for "CourseCatalogEntry".');
				}

				Cls.load(null, {
					url: url,
					callback: function (rec) {
						me.__courseCatalogEntry = rec;
						if (rec) {
							rec.get('Links').getRelLink('CourseInstance').href = me.get('href');
							me.set('Preview', rec.get('Preview'));
							rec.set('enrolled', true);//if we come from here, we are enrolled.
							me.afterEdit(['NTIID']);//let views know the record "changed".
							fulfill(rec);
						} else {
							reject('No Record, See logs');
						}
					}
				});
			});

			p = this.precachePromise;
		}

		return p;
	},
});