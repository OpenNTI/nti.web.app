const Ext = require('@nti/extjs');
const Actions = require('internal/legacy/app/navigation/path/Actions');
const StateStore = require('internal/legacy/app/context/StateStore');

module.exports = exports = Ext.define(
	'NextThought.app.windows.components.Header',
	{
		extend: 'Ext.Component',
		alias: 'widget.window-header',

		pathTpl: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{
					tag: 'tpl',
					for: 'labels',
					cn: [
						{
							tag: 'tpl',
							if: 'noLink',
							cn: [
								{
									tag: 'span',
									cls: 'no-link',
									html: '{label}',
								},
							],
						},
						{
							tag: 'tpl',
							if: '!noLink',
							cn: [{ tag: 'span', html: '{label}' }],
						},
					],
				},
				{
					tag: 'tpl',
					if: 'leaf',
					cn: [{ tag: 'span', cls: 'leaf', html: '{leaf}' }],
				},
			])
		),

		cls: 'window-header',

		renderTpl: Ext.DomHelper.markup([{ cls: 'title' }, { cls: 'close' }]),

		renderSelectors: {
			titleEl: '.title',
			closeEl: '.close',
		},

		initComponent: function () {
			this.callParent(arguments);

			this.NavigationActions = Actions.create();
			this.ContextStore = StateStore.getInstance();
		},

		afterRender: function () {
			this.callParent(arguments);

			this.mon(this.closeEl, 'click', this.doClose.bind(this));
			this.mon(this.titleEl, 'click', 'onPathClicked');
		},

		setTitle: function (title) {
			if (!this.rendered) {
				this.on('afterrender', this.setTitle.bind(this, title));
				return;
			}

			this.titleEl.update(title);
		},

		showPath: function (titles, leaf) {
			if (!this.rendered) {
				this.on('afterrender', this.showPath.bind(this, titles, leaf));
				return;
			}

			this.pathTpl.append(this.titleEl, { labels: titles, leaf: leaf });
		},

		showPathFor: function (record, leaf, length, parent) {
			//Get the root bundle, from the context StateStore
			if (!this.rendered) {
				this.on(
					'afterrender',
					this.showPathFor.bind(this, record, leaf, length, parent)
				);
				return;
			}
			var me = this,
				container = me.titleEl;

			me.record = record;

			me.NavigationActions.getBreadCrumb(record).then(function (titles) {
				if (length && length >= 0) {
					titles = (titles && titles.slice(0, length)) || [];
				}

				if (parent) {
					titles.push({ label: parent });
				}

				titles = titles.map(function (title) {
					title.noLink = false;
					return title;
				});

				if (container.dom) {
					container.dom.innerHTML = '';
					container = me.pathTpl.append(
						container,
						{ labels: titles, leaf: leaf },
						true
					);
				}
			});
		},

		onPathClicked: function (e) {
			var rootContext = this.ContextStore.getRootContext(),
				rootObj = rootContext.obj,
				rootId = rootObj && rootObj.getId();

			if (this.record && this.record.get('ContainerId') !== rootId) {
				this.doNavigate(this.record);
			}
		},
	}
);
