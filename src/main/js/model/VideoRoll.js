export default Ext.define('NextThought.model.VideoRoll', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.videoroll',

	fields: [
		{name: 'Items', type: 'arrayItem'}
	],

	getItems: function(){
		return this.get('Items');
	},

	addVideo: function(item){
		if(!this.get('Items')){
			this.set('Items',[]);
		}
		return this.get('Items').push(item);
	}
});
