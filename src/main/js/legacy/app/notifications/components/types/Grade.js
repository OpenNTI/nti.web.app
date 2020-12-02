const Ext = require('@nti/extjs');
const {getService} = require('@nti/web-client');
const {Presentation: PresentationAssets} = require('@nti/web-commons');
const {scoped} = require('@nti/lib-locale');

require('./Base');

const CATALOG_CACHE = {};

const t = scoped('nti-web-app.notifications.components.types.Grade', {
	label: 'graded <span class="title">%(assignment)s</span>'
});

async function resolveCatalogEntry (id) {
	const service = await getService();

	const request = CATALOG_CACHE[id] || service.getObject(id);

	if(!CATALOG_CACHE[id]) {
		CATALOG_CACHE[id] = request;

		setTimeout(() => {
			delete CATALOG_CACHE[id];
		}, 10000);
	}

	return request;
}

module.exports = exports = Ext.define('NextThought.app.notifications.components.types.Grade', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notification-item-grade',

	statics: {
		mimeType: 'application/vnd.nextthought.grade'
	},

	itemCls: 'grade',
	wording: 'graded {assignment:htmlEncode}',

	fillInData: function () {
		var creator = this.record.get('Creator');

		if(creator !== 'system') {
			// if not the system user, call parent which will resolve the user's display name and avatar
			return this.callParent(arguments);
		}

		this.addCourseData();
	},

	addCourseData: async function () {
		var me = this;

		const id = me.record.get('CatalogEntryNTIID');
		const catalogEntry = await resolveCatalogEntry(id);
		CATALOG_CACHE[id] = catalogEntry;

		const asset = PresentationAssets.Asset.getPresentationAsset(catalogEntry, 'thumb');
		const img = Ext.DomHelper.markup({cls: 'avatar-container', cn: [{cls: 'profile avatar-pic', style: {backgroundImage: 'url(' + asset + ')'}}]});

		if(me.iconEl) {
			me.iconEl.update(img);
		}

		if (me.usernameEl) {
			me.usernameEl.update(catalogEntry.title);
		}
	},

	fillInWording: function () {
		var me = this,
			assignmentId = me.record.get('AssignmentId');

		if (!assignmentId) {
			me.addCls('x-hidden');
			return;
		}

		return Service.getObject(assignmentId)
			.then(function (assignment) {
				if (me.wordingEl && me.wordingEl.dom) {
					me.wordingEl.dom.innerHTML = t('label', {assignment: Ext.util.Format.htmlEncode(assignment.get('title'))});
					// me.wordingEl.dom.innerHTML = me.wording.replace('{assignment:htmlEncode}', me.titleTpl.apply({name: assignment.get('title')}));
				}
			});
	}
});
