Ext.define('NextThought.view.assessment.Score',{
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-score',
	requires: [
		'Ext.data.JsonStore',
		'Ext.chart.Chart',
		'NextThought.chart.series.Score'
	],

	initComponent: function(){
		this.store = Ext.data.JsonStore.create({fields: ['p']});
		this.callParent(arguments);
		this.add({
			xtype: 'chart',
			width: 75,
			height: 75,
			animate: true,

			store: this.store,
			insetPadding: 10,
			shadow: false,
			legend: false,

			series: [{ type: 'score', angleField: 'p' }]
		});

		this.setValue(this.value || 80);
	},


	setValue: function(value){
		var v = value || 4,
			data = [{p:v},{p:(100-v)}],
			s = this.down('chart').series.first(),
			store = this.store;

		if( s.setValue ){
			s.setValue(value);
		}
		else {
			s.scoreValue = value;
		}

		this.value = value;

//		if(value === 0){
//			data.shift();
//		}

		Ext.defer(function(){
			store.loadRawData(data,false);
		},1);
	}
});
