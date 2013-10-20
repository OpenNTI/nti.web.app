Ext.define('NextThought.view.course.info.outline.OpenCourseInfo',{
	extend: 'Ext.Component',
	alias: 'widget.course-info-outline-open-course',

	//<editor-fold desc="Config">

	ui: 'course-info',
	cls: 'open-course-info',
	renderTpl: Ext.DomHelper.markup([
		{ cls: 'heading', html: '{heading}' },
		{ cls: 'content', html: '{message}'},
		{ tag: 'ul', cn: [
			{ tag: 'li', html: '{pointfree}'},
			{ tag: 'li', cls: 'red', html: '{nocredit}'}
		] },
		{ cls: 'foot', cn: [
			{ cls: 'edit', html: 'Edit'},
			{ cls: 'registered', html: '{registered}' }
		] }
	]),

	renderSelectors: {
		editLink: '.edit'
	},

	beforeRender: function(){

		this.renderData = Ext.apply(this.renderData||{},{
			'heading': getString('course-info.open-course-widget.heading'),
			'message': getString('course-info.open-course-widget.message'),
			'pointfree': getString('course-info.open-course-widget.free-to-anyone'),
			'nocredit': getString('course-info.open-course-widget.not-for-credit'),
			'registered': getString('course-info.open-course-widget.registered')
		});

		this.on({
			editLink: {
				click: {
					fn: 'showEnrollWindow',
					scope: this
				}
			}
		});

		return this.callParent(arguments);
	},

	//</editor-fold>

	showEnrollWindow: function() {
		var p = ContentUtils.purchasableForContentNTIID(this.info.ntiid),
			unenroll = p && p.getLink('unenroll'),
			me = this;
		if(p){
			this.fireEvent('show-purchasable', this, p, function(){
				if(unenroll){
					console.log('Purchasable called back. To the library we go');
					me.fireEvent('go-to-library', me);
				}
			});
		}
		else{
			console.error('No purchasable found for ', this.info);
		}
	}
});
