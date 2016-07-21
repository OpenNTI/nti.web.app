const Ext = require('extjs');
const Globals = require('legacy/util/Globals');
const {wait} = require('legacy/util/Promise');

const WindowsActions = require('legacy/app/windows/Actions');
const PromptActions = require('legacy/app/prompt/Actions');
const { encodeForURI, decodeFromURI } = require('nti-lib-ntiids');

require('legacy/common/components/NavPanel');
require('legacy/mixins/Router');
require('legacy/mixins/AuditLog');

require('./Outline');
require('./Body');
require('./editing/auditlog/Prompt');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.View', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-overview-view',
	cls: 'course-overview',

	mixins: {
		Router: 'NextThought.mixins.Router',
		auditLog: 'NextThought.mixins.AuditLog'
	},

	navigation: {xtype: 'course-outline'},
	body: {xtype: 'course-overview-body'},

	initComponent: function () {
		this.callParent(arguments);

		this.WindowActions = WindowsActions.create();
		this.PromptActions = PromptActions.create();

		this.initRouter();

		this.body.openEditing = this.openEditing.bind(this);
		this.body.closeEditing = this.closeEditing.bind(this);
		this.body.openAuditLog = this.openAuditLog.bind(this);

		this.navigation.selectOutlineNode = this.selectOutlineNode.bind(this);
		this.body.navigateToOutlineNode = this.selectOutlineNode.bind(this);

		this.addChildRouter(this.body);

		this.editingMap = {};

		this.addRoute('/edit', this.showEditOutlineNode.bind(this));
		this.addRoute('/:node', this.showOutlineNode.bind(this));
		this.addRoute('/:node/edit', this.showEditOutlineNode.bind(this));

		this.addDefaultRoute(this.showOutlineNode.bind(this));

		this.onScroll = this.onScroll.bind(this);
	},

	onRouteActivate: function () {
		this.updateOutline(this.isEditing);

		this.alignNavigation();
		this.isActive = true;

		if (this.hasEditControls) {
			this.addScrollListener();
		}
	},

	onRouteDeactivate: function () {
		delete this.isActive;
		this.removeScrollListener();

		this.body.onRouteDeactivate();
	},

	alignNavigation: function () {
		this.callParent(arguments);

		this.onScroll();
	},

	addScrollListener: function () {
		this.removeScrollListener();
		window.addEventListener('scroll', this.onScroll);
	},

	removeScrollListener: function () {
		window.removeEventListener('scroll', this.onScroll);
	},

	onScroll: function () {
		this.navigation.syncTop(this.body.getLessonTop());
	},

	getActiveLesson: function () {
		return this.activeLesson;
	},

	openEditing: function () {
		var me = this,
			bundle = me.currentBundle,
			node = me.activeNode,
			outline = me.activeOutline,
			id = node && node.getId();

		return new Promise(function (fulfill, reject) {
			if (!outline.hasSharedEntries()) {
				fulfill();
				return;
			}

			Ext.Msg.show({
				title: 'Are you sure?',
				msg: 'Changes are synced between all sections of your course.',
				doNotShowAgainKey: 'editing-shared-outline',
				buttons: {
					primary: {
						text: 'OK',
						handler: fulfill
					},
					secondary: {
						text: 'Cancel',
						handler: reject
					}
				}
			});
		}).then(function () {
			me.editingMap[bundle.getId()] = true;

			if (id) {
				me.pushRoute('Editing', encodeForURI(id) + '/edit');
			} else {
				me.pushRoute('Editing', 'edit');
			}
		});
	},

	closeEditing: function () {
		var me = this,
			bundle = me.currentBundle,
			outlineInterface = bundle && bundle.getOutlineInterface(true);

		outlineInterface.onceBuilt()
			.then(function (builtOutlineInterface) {
				var outline = builtOutlineInterface && builtOutlineInterface.getOutline(),
					nodeId = me.activeNode && me.activeNode.getId();

				outline.fillInItems();

				return outline.findOrderedContentsItem(nodeId);
			})
			.then(function (outlineNode) {
				var node,
					next = outlineNode && outlineNode.nextSibling,
					previous = outlineNode && outlineNode.previousSibling,
					id;

				if (outlineNode && outlineNode.getFirstContentNode) {
					node = outlineNode.getFirstContentNode();
				}

				while ((next || previous) && !node) {
					if (next && next.getFirstContentNode()) {
						node = next.getFirstContentNode();
						break;
					} else {
						next = next && next.nextSibling;
					}

					if (previous && previous.getFirstContentNode()) {
						node = previous.getFirstContentNode();
						break;
					} else {
						previous = previous && previous.previousSibling;
					}
				}

					// node be firstContent, next sibling, previous sibling,
				if (node) {
					id = node && node.getId();
				}

				delete me.editingMap[bundle.getId()];

				if (id) {
					id = encodeForURI(id);
					me.pushRoute('', id);
				} else {
					me.pushRoute('', '');
				}
			})
			.catch(function (reason) {
				console.error('Unable to stop editing because: ' + reason);
			});
	},

	openAuditLog: function () {
		if(this.currentBundle && this.currentBundle.getLink('recursive_audit_log')) {
			this.PromptActions.prompt('audit-log', {parent: this, record: this.currentBundle});
		}
	},

	selectOutlineNode: function (record) {
		var id = encodeForURI(record.getId()),
			route = id;

		if (this.isEditing) {
			route = Globals.trimRoute(route) + '/edit';
		}

		this.pushRoute(record.get('label'), route, {outlineNode: record});
	},

	showEditControls: function () {
		this.hasEditControls = true;

		if (this.isActive) {
			this.addScrollListener();
		}

		this.addCls('has-editing-controls');
		this.body.showEditControls();
	},

	hideEditControls: function () {
		delete this.hasEditControls;
		this.removeScrollListener();
		this.removeCls('has-editing-controls');
		this.body.hideEditControls();
	},

	updateOutline: function (editing, doNotCache) {
		var me = this,
			bundle = me.currentBundle,
			outlineInterface = editing ? bundle.getAdminOutlineInterface(doNotCache) : bundle.getOutlineInterface(doNotCache);

		outlineInterface.onceBuilt()
			.then(function (builtOutlineInterface) {
				var outline = builtOutlineInterface.getOutline();

				if (outline.getLink('edit')) {
					me.showEditControls();
				} else {
					me.hideEditControls();
				}

				me.activeOutline = outline;
				me.body.setOutline(outline);

				return outline;
			})
			.then(me.navigation.setOutline.bind(me.navigation, bundle));

		return outlineInterface;
	},

	bundleChanged: function (bundle) {
		if (this.currentBundle === bundle) { return; }

		var me = this;

		me.clear();
		me.currentBundle = bundle;

		if (!bundle || !bundle.getOutlineInterface) {
			delete me.currentBundle;
			return;
		}

		me.body.setActiveBundle(bundle);
	},

	clear: function () {
		var me = this;

		me.mon(me.body, {
			single: true,
			buffer: 1,
			add: me.unmask.bind(me)
		});

		wait()
			.then(function () {
				if (me.el && me.el.dom) {
					me.el.mask(getString('NextThought.view.courseware.View.loading'), 'loading');
				}
			});

		me.navigation.clearCollection();
		me.body.clear();
	},

	unmask: function () {
		if (this.el) {
			this.el.unmask();
		}
	},

	getActiveItem: function () {
		return this.navigation.getActiveItem();
	},

	__getRecord: function (id, record, editing, doNotCache) {
		var outline = this.updateOutline(editing, doNotCache);

		return outline.onceBuilt()
			.then(builtOutline => {
				if (id && (!record || record.getId() !== id)) {
					record = builtOutline.getNode(id);
				} else if (record) {
					//get the record that is in the outline in case it has updated
					record = builtOutline.getNode(record.getId());
				}

				//With editing the record may or may not be a content node
				if (!editing && record) {
					record = record.getFirstContentNode();
				}

				// In case, we have no record, get the first available record.
				// TODO: should we check if it's not in edit mode?
				if (!record) {
					record = builtOutline.findNodeBy(function (rec) {
						return rec.get('type') === 'lesson' && rec.get('NTIID') && rec.get('isAvailable');
					});
				}

				return record;
			});
	},

	showOutlineNode: function (route/*, subRoute*/) {
		const bundle = this.currentBundle;
		if (this.editingMap && this.editingMap[bundle.getId()]) {
			this.replaceRoute('Editing', '/edit');
			return Promise.resolve();
		}

		this.alignNavigation();
		this.navigation.stopEditing();
		this.body.showNotEditing();

		delete this.isEditing;

		const node = route.params && route.params.node;
		const id = node && decodeFromURI(node);
		const changedEditing = this.isEditing;

		return this.__getRecord(id, route.precache.outlineNode, false, changedEditing)
			.then(record => {
				this.unmask();

				if (!record) {
					console.error('No valid lesson to show');
					this.body.showEmptyState();
					return;
				}

				const selectedRecord = this.navigation.selectRecord(record, true);

				this.setTitle(selectedRecord.get('label'));
				this.activeNode = selectedRecord;

				return this.body.showOutlineNode(selectedRecord, changedEditing)
					.then(() => this.alignNavigation())
					.then(() => selectedRecord);
			});
	},

	showEditOutlineNode: function (route/*, subRoute*/) {
		this.alignNavigation();
		this.navigation.startEditing();
		this.body.showEditing();

		this.isEditing = true;

		this.editingMap[this.currentBundle.getId()] = true;

		const id = route.params && route.params.node && decodeFromURI(route.params.node);
		const changedEditing = !this.isEditing;

		return this.__getRecord(id, route.precache.outlineNode, true, changedEditing)
			.then(record => {
				if (!record) {
					console.error('No valid outline node to edit');
					return;
				}

				const theRecord = this.navigation.selectRecord(record, true);
				this.unmask();
				this.setTitle('Editing | ' + theRecord.get('label'));
				this.activeNode = theRecord;

				return this.body.editOutlineNode(theRecord, changedEditing)
					.then(() => this.alignNavigation())
					.then(() => theRecord);
			});
	}
});
