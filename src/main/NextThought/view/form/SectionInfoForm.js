Ext.define('NextThought.view.form.SectionInfoForm', {
	extend:'Ext.form.FieldSet',
	alias: 'widget.section-info-form',

	requires: [
		'NextThought.model.SectionInfo',
		'Ext.form.field.Text',
		'Ext.form.field.Date',
		'Ext.form.FieldSet',
		'NextThought.view.form.fields.ShareWithField'
	],

	border: false,
	collapsible: true,
	collapsed: true,
	layout: 'anchor',
	title: 'Section',

	defaults: {
		padding: 5,
		anchor: '100%',
		border: false
	},

	items: [
		{
			xtype: 'panel',
			layout: 'hbox',
			items: [
				{
					xtype: 'textfield',
					fieldLabel: 'ID',
					emptyText: 'ID',
					labelWidth: 40,
					labelAlign: 'left',
					allowBlank: false,
					name: 'ID',
					flex: 1
				},
				{width: 5},
				{
					xtype: 'datefield',
					fieldLabel: 'Open',
					labelAlign: 'left',
					labelWidth: 40,
					width: 150,
					name: 'OpenDate'
				},
				{width: 5},
				{
					xtype: 'datefield',
					fieldLabel: 'Closed',
					labelAlign: 'left',
					labelWidth: 40,
					width: 150,
					name: 'CloseDate'
				}]
		},
		{
			xtype: 'textarea',
			fieldLabel: 'Description',
			emptyText: 'Section Description',
			allowBlank: false,
			name: 'Description'
		},
		{
			border: false,
			margin: '10px 0px',
			defaults: {
				padding: 0,
				margin: '10px 0px',
				anchor: '100%',
				layout: 'anchor',
				xtype:'fieldset',
				collapsible: true,
				collapsed: false,
				border: false,
				defaults: {
					padding: 0,
					margin: '10px 5px',
					anchor: '100%',
					layout: 'anchor',
					border: false,
					allowBlank: false,
					xtype: 'sharewith'
				}
			},
			items:[
				{ title: 'Instructors',   items: { emptyText: 'Instructors...', name: 'Instructors' }},
				{ title: 'Enrolled', items: { emptyText: 'Enrolled...', name: 'Enrolled' }}
			]
		}
	],


	afterRender: function() {
		this.callParent(arguments);

		if (!this.readOnly) {
			this.legend.insert(0, this.createRemoveTool());
		}

		this.initValue();
	},



	createRemoveTool: function() {
		var me = this,
			cmp;

		cmp = Ext.create('Ext.panel.Tool', {
			getElConfig: function() {
				return {
					tag: Ext.isGecko3 ? 'span' : 'div',
					id: cmp.id,
					cls: cmp.cls
				};
			},
			type: 'minus',
			handler: function(){me.destroy();},
			scope: me
		});
		this.removeTool = cmp;
		return cmp;
	},



	setValue: function(v) {
		this.value = v;
		this.initValue();
	},


	getValue: function() {
		var r,
			a = this.down('sharewith[name=Instructors]').getValue(),
			o = this.value ? this.value.toJSON() : {};

		o.ID = this.down('textfield[name=ID]').getValue();
		o.Description = this.down('textarea[name=Description]').getValue();
		o.OpenDate = this.down('datefield[name=OpenDate]').getValue();
		o.CloseDate = this.down('datefield[name=CloseDate]').getValue();
		o.Enrolled = this.down('sharewith[name=Enrolled]').getValue();
		o.InstructorInfo =  {'Class': 'InstructorInfo', 'Instructors': a};

		//o.Provider = (o.Provider && o.Provider.ID) ? o.Provider.ID : null;
		delete o.Provider;

		return Ext.create('NextThought.model.SectionInfo', o, o.OID, o);
	},


	initValue: function() {
		if (!this.value) return;
		this.setFieldValue('Description');
		this.setFieldValue('OpenDate');
		this.setFieldValue('CloseDate');
		this.setFieldValue('Enrolled');
		this.setFieldValue('ID');

		var i = this.value.get('InstructorInfo').get('Instructors');
		this.down('sharewith[name=Instructors]').setValue(i);
	},

	setFieldValue: function(fieldName){
		var rn = this.down('*[name='+fieldName+']');
		rn.setValue(this.value.get(fieldName));
		rn.resetOriginalValue();
	}
});
