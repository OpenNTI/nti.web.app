const Ext = require('extjs');
const { Info } = require('nti-web-course');
const { getService, getAppUsername } = require('nti-web-client');

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

	onRouteDeactivate: function () {
		if (!this.rendered) { return; }

		var videos = this.el.dom.getElementsByTagName('video');

		for(let v of (videos || [])) {
			v.pause && v.pause();
		}
	},

	setContent: function (content, status, bundle) {
		if (this.activeContent === content) { return Promise.resolve(); }

		this.activeContent = content;
		this.removeAll(true);

		return getService()
			.then((service) => {
				return service.getObject(content.getRaw());
			})
			.then((catalogEntry) => {
				var infoCmp = this.up('course-info');

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

				// don't show registered message bar if the active user is the one who created the course
				if (infoCmp && infoCmp.infoOnly && getAppUsername() !== catalogEntry.creator) {
					this.add({
						xtype: 'course-info-not-started',
						info: content,
						enrollmentStatus: status
					});
				}

				this.InfoCmp = this.add({
					xtype: 'react',
					component: Info,
					catalogEntry,
					onSave: (savedEntry) => {
						this.onSave && this.onSave(savedEntry);
					},
					editable: !this.viewOnly && content.hasLink('edit')
				});

				this.add({
					xtype: 'course-info-support'
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
