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
				emptyText: 'Section Description',
				allowBlank: false,
				name: 'Description',
				flex: 1
			},
			{
				xtype: 'datefield',
				fieldLabel: 'Open',
				labelAlign: 'left',
				labelWidth: 40,
				width: 150,
				name: 'OpenDate'
			},
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
			o = this.value ? this.value.toJSON() : undefined;

		r = Ext.create('NextThought.model.SectionInfo', o);
		r.set('Description', this.down('textfield[name=Description]').getValue());
		r.set('OpenDate', this.down('datefield[name=OpenDate]').getValue());
		r.set('CloseDate', this.down('datefield[name=CloseDate]').getValue());
		r.set('Enrolled', this.down('sharewith[name=Enrolled]').getValue());
		r.set('InstructorInfo',  {'Class': 'InstructorInfo', 'Instructors': a});
		return r;
	},


	initValue: function() {
		if (!this.value) return;
		this.setFieldValue('Description');
		this.setFieldValue('OpenDate');
		this.setFieldValue('CloseDate');
		this.setFieldValue('Enrolled');

		var i = this.value.get('InstructorInfo').get('Instructors');
		this.down('sharewith[name=Instructors]').setValue(i);
	},

	setFieldValue: function(fieldName){
		 var rn = this.down('*[name='+fieldName+']');
		 rn.setValue(this.value.get(fieldName));
		 rn.resetOriginalValue();
	 }
});
