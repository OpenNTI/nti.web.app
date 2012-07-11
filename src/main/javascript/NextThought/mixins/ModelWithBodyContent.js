Ext.define('NextThought.mixins.ModelWithBodyContent',{

	getBodyText: function() {

		var o = this.get('body'), text = [];

		Ext.each(o,function(c){
			if(typeof(c) === 'string'){
				text.push(c.replace(/<.*?>/g, ''));
			}
		});

		return text.join('');
	}

});
