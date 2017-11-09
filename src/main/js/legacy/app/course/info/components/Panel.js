const Ext = require('extjs');
const { Info } = require('nti-web-course');
const { getService } = require('nti-web-client');

const ContentProxy = require('legacy/proxy/JSONP');

require('./parts/Description');
require('./parts/Instructors');
require('./parts/NotStarted');
require('./parts/Support');
require('./parts/Title');


module.exports = exports = Ext.define('NextThought.app.course.info.components.Panel', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-panel',
	cls: 'course-info-panel scrollable',
	ui: 'course',
	layout: 'none',

	setContent: function (content, status, bundle) {
		this.removeAll(true);

		var toAdd = [],
			infoCmp = this.up('course-info');

		if (!Ext.isObject(content)) {
			if (Ext.isString(content)) {
				Service.getPageInfo(
					content,
					this.loadPage,
					this.loadPageFailed,
					this);
			}
			return;
		}

		if (infoCmp && infoCmp.infoOnly) {
			toAdd.push({
				xtype: 'course-info-not-started',
				info: content,
				enrollmentStatus: status
			});
		}

		const addComponents = (catalogEntry) => {
			toAdd.push(
				{
					xtype: 'react',
					id: 'about_target',
					component: Info,
					catalogEntry: catalogEntry,
					editable: catalogEntry.hasLink('edit')
				},
				{
					xtype: 'course-info-title',
					title: content.get('Title'),
					course: content,
					videoUrl: content.get('Video'),
					videoWidth: this.videoWidth || 764,
					videoHeight: this.videoHeight
				},{
					xtype: 'course-info-description',
					info: content,
					enrollmentStatus: status
				},{
					xtype: 'course-info-instructors',
					info: content,
					bundle
				},{
					xtype: 'course-info-support'
				});


			this.add(toAdd);
		};

		getService().then(service => {
			// load a lib-interfaces CatalogEntry model
			service.getObject(content.get('NTIID')).then((entry) => {
				this.catalogEntry = entry;

				addComponents(this.catalogEntry);
			});
		});
	},

	getVideo: function () {
		var title = this.down('course-info-title');

		return title && title.video;
	},

	//<editor-fold desc="Fallback Code">
	fillInPage: function (html) {
		var bodyTag = html.match(/<body.*?>(.*)<\/body>/i),
			parent = this.up('course-info');

		if (bodyTag.length > 1) {
			parent.addCls('make-white');
			this.add({
				xtype: 'box',
				cls: 'course-info-panel-legacy',
				html: bodyTag[1],
				listeners: {
					destroy: function () {
						parent.removeCls('make-white');
					}
				}
			});
		}
		else {
			console.error('info page has no body tag?? ', arguments);
		}
	},

	loadPage: function (pageInfo) {
		this.activeRequest = pageInfo.getId();
		ContentProxy.request({
			pageInfo: pageInfo,
			ntiid: pageInfo.getId(),
			jsonpUrl: pageInfo.getLink('jsonp_content'),
			url: pageInfo.getLink('content'),
			expectedContentType: 'text/html',
			scope: this,
			success: this.loadedPage,
			failure: this.loadPageFailed
		});
	},

	loadPageFailed: function (r) {
		console.error('server-side failure with status code ' + r.status + '. Message: ' + r.responseText);
	},

	//</editor-fold>
	loadedPage: function (r, req) {
		if (this.activeRequest !== req.pageInfo.getId()) {
			return;
		}

		this.fillInPage(r.responseText);
		delete this.activeRequest;
	}
});
