Ext.define('NextThought.model.PageInfo', {
	extend: 'NextThought.model.Base',
	idProperty: 'ID', //TODO shouldn't this be the NTIID
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing',
		'NextThought.model.assessment.Question'
	],
	fields: [
		{ name: 'AssessmentItems', type: 'arrayItem' },
		{ name: 'sharingPreference', type: 'auto' },
		{ name: 'dataFilterPreference', type: 'auto' },
		//Placeholder for client-side generated page content :} *facepalm*
		{ name: 'content', type: 'string', persist:false }
	],

	isPageInfo: true,

	getSubContainerURL: function(rel,id){
		var url = this.getLink(rel),
			enCi = encodeURIComponent(this.get('NTIID')),
			enId = encodeURIComponent(id);

		return url.replace(enCi,enId);
	},


	isPartOfCourse: function(){
		var maybe = this.isCourse;

		if(!Ext.isDefined(maybe)){
			maybe = this.getLocationInfo();
			if(maybe){
				maybe = maybe.isCourse || false; //false instead of undefined
				this.isCourse = maybe;
			}
		}

		return maybe;
	},


	isPartOfCourseNav: function(){
		var l = this.getLocationInfo(),
			toc = l && l.toc,
			ntiid = (l && l.NTIID) || '--';

		ntiid = '[ntiid="'+ntiid
					.replace(/:/g,'\\3a ') //no colons
					.replace(/,/g,'\\2c ') //no commas
				 + '"]';

		if(!l || !toc){return false;}

		return this.isPartOfCourse() && Boolean(
				/^toc$/i.test(l.location.nodeName) ||
				toc.querySelector('unit'+ntiid) ||
				toc.querySelector('lesson'+ntiid.replace(/^\[/,'[topic-')));
	},

	getLocationInfo: function(){
		return this.locationInfo || (this.locationInfo = ContentUtils.getLocation(this));
	},


    getPublicScope: function(){
        var l = this.getLocationInfo(),
            title = l && l.title;

        // FIXME: waiting on content for the right field name. Needs testing too.
        return (title && title.getScope('public')) || [];
    },

    getRestrictedScope: function(){
    	var l = this.getLocationInfo(),
    		title = l && l.title;

    	return (title && title.getScope('restricted')) || [];
    }
});
