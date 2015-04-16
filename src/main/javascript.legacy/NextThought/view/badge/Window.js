Ext.define('NextThought.view.badge.Window', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.badge-window',

	mixins: {
		'exportBadge': 'NextThought.mixins.ExportBadge'
	},

	cls: 'badge-window',
	width: 500,
	constrainTo: Ext.getBody(),
	layout: 'anchor',
	modal: true,
	header: false,

	items: [{
		xtype: 'component',
		badgeContainer: 'true',
		cls: 'badge-preview',
		renderTpl: Ext.DomHelper.markup([
			{cls: 'img', html: ''},
			{cls: 'wrap', cn: [
				{cls: 'name', html: ''},
				{cls: 'description', html: ''},
				{cls: 'issuer', cn: [
					{cls: 'label', html: 'Issuer'},
					{tag: 'a', cls: 'link', href: '', target: '_blank', html: ''}
				]},
				{cls: 'criteria', cn: [
					{cls: 'label', html: 'Criteria'},
					{tag: 'a', cls: 'link', href: '', target: '_blank', html: ''}
				]}
			]}
		]),
		renderSelectors: {
			imgEl: '.img',
			nameEl: '.name',
			descriptionEl: '.description',
			criteriaLink: '.criteria .link',
			issuerLink: '.issuer .link'
		},
		setBadge: function(record) {
			if (!this.rendered) {
				this.on('afterrender', this.setBadge.bind(this, record));
				return;
			}

			var issuer = record.get('issuer');

			this.imgEl.setStyle('background-image', 'url(' + record.get('image') + ')');
			this.nameEl.update(record.get('name'));
			this.descriptionEl.update(record.get('description'));
			this.criteriaLink.set({'href': record.get('criteria')});
			this.criteriaLink.update(record.get('criteria'));
			this.issuerLink.set({'href': issuer && issuer.url});
			this.issuerLink.update(issuer.name);
		}
	}],

	dockedItems: {
		xtype: 'container',
		dock: 'bottom',
		ui: 'footer',
		height: 55,
		baseCls: 'nti-window',
		layout: {
			type: 'hbox',
			align: 'stretchmax'
		},
		defaults: {
			cls: 'footer-region',
			xtype: 'container',
			flex: 1,
			layout: 'hbox'
		},
		items: [{
			layout: 'auto',
			defaults: { xtype: 'button', ui: 'blue', scale: 'large'},
			items: [
				{
					text: 'Export',
					// iconCls: 'export-badge',
					// tooltip: 'Export Badge',
					cls: 'x-btn-blue-large export',
					action: 'export', 
					style: { float: 'left'},
					handler: function(b, e) {
						e.stopEvent(); 
						b.up('window').exportClicked(b);
					}
				},
				// { xtype: 'box', cls: 'iframe-save', save: true, autoEl: { tag: 'a', href: '{url}', html: 'Save', target: '_blank'}},
				{
					text: 'Close',
					cls: 'x-btn-blue-large dismiss',
					action: 'cancel',
					style: { 'float': 'right'},
					handler: function(b, e) {
						e.stopEvent(); b.up('window').close();
					}
				}
			]
		}]
	},


	afterRender: function() {
		this.callParent(arguments);

		var badge = this.down('[badgeContainer]');

		if (badge) {
			badge.setBadge(this.badge);
		}
	},


	exportClicked: function(b) {
		this.showExportMenu(this.badge, b);
	}
});
