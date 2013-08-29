Ext.define('NextThought.view.form.util.Token', {
	extend: 'Ext.Component',
	alias:  'widget.token',

	clsPrefix: 'nt-token',
	cls:       this.clsPrefix + '-wrapper',

	renderTpl: new Ext.XTemplate(
			'<span class="{prefix} {prefix}-{[this.getType(values)]}">',
			'<span class="{prefix}-body">',
			'<span class="{prefix}-nib-{[this.getType(values)]} {prefix}-nib"></span> ',
			'<span class="{prefix}-label">{text}</span>&nbsp;',
			'<span id="{id}-closer" class="{prefix}-nib {prefix}-nib-end"></span>',
			'</span>',
			'</span>',
			{
				getType: function (values) {
					if (!values.model) {
						return 'person';
					}
					var model = values.model;

					return NextThought.model.UserSearch.getType(model.data);
				}
			}
	),

	childEls: ['closer'],

	initComponent: function () {
		this.addEvents('click');
		this.callParent(arguments);

		this.renderData.text = this.text;
		this.renderData.model = this.model;
		this.renderData.prefix = this.clsPrefix;

		this.cls = this.clsPrefix + '-wrapper';
	},

	afterRender: function () {
		this.callParent(arguments);
		this.closer.on('click', function () {this.fireEvent('click', this, this.model);}, this);
		this.setReadOnly(!!this.readOnly);
	},

	setReadOnly: function (readOnly) {
		this.readOnly = readOnly;
		if (this.closer) {
			if (readOnly) {
				this.closer.hide();
			}
			else {
				this.closer.show();
			}
		}
	}
});
