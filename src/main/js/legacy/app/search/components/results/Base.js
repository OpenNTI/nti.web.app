var Ext = require('extjs');
var UserRepository = require('../../../../cache/UserRepository');
var {isMe} = require('legacy/util/Globals');

const noop = () => {};

module.exports = exports = Ext.define('NextThought.app.search.components.results.Base', {
	extend: 'Ext.Component',
	alias: 'widget.search-result',
	cls: 'search-result',
	SYSTEM_CREATOR: 'system',

	pathTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'tpl', 'for': 'labels', cn: [
			{tag: 'span', cls: 'list-item{[values.cls ? " " + values.cls : ""]}', html: '{label}'}
		]
	})),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}'},
		{tag: 'span', cls: 'list-item creator', html: '{creator}'},
		{cls: 'fragments', cn: [
			{tag: 'tpl', 'for': 'fragments', cn: [
				{cls: 'avatar-container hidden'},
				{cls: 'fragment', ordinal: '{fragIndex}', html: '{text}'}
			]}
		]},
		{cls: 'meta', cn: [
			{cls: 'root-icon hidden'},
			{cls: 'path'}
		]}
	]),

	renderSelectors: {
		titleEl: '.title',
		rootIconEl: '.root-icon',
		pathEl: '.path',
		creatorEl: '.creator'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.hit.get('Title') || '',
			fragments: this.getFragmentsData(this.hit),
			label: this.label || ''
		});

		this.fillInData();
	},


	getFragmentsData (hit) {
		const fragments = hit.get('Fragments') || [];

		return fragments.reduce((acc, frag, fragIndex) => {
			const {Matches:matches = []} = frag;

			if (frag.Field !== 'keywords') {
				matches.reduce((ac, match) => {
					ac.push({
						fragIndex,
						text: match.trim()
					});

					return ac;
				}, acc);
			}

			return acc;
		}, []);
	},


	fillInData: function () {
		var me = this,
			hit = me.hit,
			name = hit.get('Creator');

		if (isMe(name)) {
			this.addCls('me');
		}

		if (name === this.SYSTEM_CREATOR) {
			me.renderData.creator === '';
		} else if (name) {
			this.addCreator(name);
		}

		me.getObject = me.fetchObject();

		me.getObject
			.then(function (obj) {
				me.hitRecord = obj;

				me.addTitle(obj);
				me.addObject(obj);

				me.getPathToObject(obj)
					.then(me.showBreadCrumb.bind(me)).catch(noop);
			})
			.catch(() => {
				me.hide();
			});
	},

	/**
	 * Retrieve the hit object
	 * Can be overriden by subclasses
	 * @return {Promise} Return promise that
	 *         resolves when the object is loaded or fails to.
	 */
	fetchObject ()  {
		return Service.getObject(this.hit && this.hit.get('NTIID'));
	},


	addCreator (name) {
		UserRepository.getUser(name)
			.then((user) => this.setCreator(user));
	},

	setCreator: function (user) {
		if(!user.getName().includes('Anonymous')) {
			var creator = 'By ' + user.getName();

			this.renderData.creator = creator;

			if (this.rendered) {
				this.creatorEl.update(creator);
			}
		}
	},


	addObject (obj) {},


	addTitle (obj) {
		this.setTitle(obj.get('title'));
	},

	setTitle: function (title) {
		this.renderData.title = title;

		if (this.rendered) {
			this.titleEl.update(title);
		}
	},

	showBreadCrumb: function (path) {
		if (!this.rendered) {
			this.on('afterrender', this.showBreadCrumb.bind(this, path));
			return;
		}

		var me = this,
			root = path[0],
			labels;

		labels = path.map(function (x) {
			if (x.getTitle) {
				return {
					label: x.getTitle()
				};
			}
		}).filter(function (x) { return !!x; });

		me.pathTpl.append(me.pathEl, {labels: labels});

		if (root && root.getIconImage) {
			root.getIconImage()
				.then(function (src) {
					if (me.rootIconEl) {
						me.rootIconEl.removeCls('hidden');
						me.rootIconEl.setStyle({backgroundImage: 'url(' + src + ')'});
					}
				});
		}
	},


	afterRender: function () {
		this.callParent(arguments);

		if (this.typeCls) {
			this.addCls(this.typeCls);
		}

		this.mon(this.el, 'click', this.clicked.bind(this));
	},

	clicked: function (e) {
		var me = this,
			fragEl = e.getTarget('[ordinal]'),
			fragIndex = fragEl && fragEl.getAttribute('ordinal');

		this.getObject
			.then(function (obj) {
				const containerId = me.hit && me.hit.isModel && me.hit.get('ContainerId');
				me.navigateToSearchHit(obj, me.hit, fragIndex, containerId);
			});
	}
});
