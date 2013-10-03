Ext.define('NextThought.mixins.forum-feature.Path', {

	pathTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'span',
		cls: 'path-part',
		html: '{[values.title!==\'Discussion Board\'? values.title : values.Creator]}',
		'data-ntiid': '{NTIID}',
		'data-id': '{ID}',
		'data-href': '{href}'
	})),


	fillInPath: function(data) {
		if (!data) {
			this.fireEvent('fill-in-path', this, this.record, Ext.bind(this.fillInPath, this));
			return;
		}

		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.fillInPath, this, [data]), this, {single: true});
			return;
		}

		///OK! lets do this finally
		var me = this,
			el = me.pathEl,
			t = me.pathTpl;

		data = data.slice();
		data.unshift('forums');

		Ext.each(data, function(o) {
			if (!o) {return;}

			t.append(el, o.getData ? o.getData() : {
				title: o
			});
		});
		this.fireEvent('realign');
	}
});
