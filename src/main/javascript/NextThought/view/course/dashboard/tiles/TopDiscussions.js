Ext.define('NextThought.view.course.dashboard.tiles.TopDiscussions',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-top-discussions',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord){
			var DQ = Ext.DomQuery,
				items = this.getChildrenNodes(courseNodeRecord),
				refs = DQ.filter(items||[],'[mimeType$=discussion]'),
				i, id, k, m = {};

			if(Ext.isEmpty(refs)){
				return null;
			}

			//lets figure out how many forums we have...
			for(i in refs){
				if(refs.hasOwnProperty(i)){

				i = refs[i];
				id = i.getAttribute('ntiid');

				//normalize the fake-parent id so we can bin. (this key is not a real id!)
				k = ParseUtils.parseNtiid(id);
				if(!k){return;}
				k.specific.typeSpecific = k.specific.typeSpecific.split('.')[0];
				k = k.toString();

				if(!m[k]){
					m[k] = this.create({locationInfo: locationInfo, topicNtiid: id});
				}

				}
			}

			return Ext.Object.getValues(m);
		}

	},

	cls: 'course-dashboard-discussion-item-list',
//	defaultType: 'course-dashboard-discussion-item',

	config: {
		cols: 2,
		rows: 1,
		locationInfo: null,
		topicNtiid: ''
	},

	constructor: function(config){

		config.items = [
			{xtype: 'tile-title', heading:'Top Discussions' },
			{xtype: 'container', defaultType: this.defaultType, cls:'scrollbody' }
		];

		this.callParent([config]);

		$AppConfig.service.getObject(this.getTopicNtiid(),
				this.onTopicResolved,
				this.onTopicResolveFailure,
				this,
				true
		);
	},

	onTopicResolved: function(topic){
		if(!/topic$/i.test(topic.get('Class'))){
			console.warn('Got something other than what we were expecting. Was expecting a Topic, got:', topic);
		}

	},


	onTopicResolveFailure: function(){
		console.warn('Could not load the topic object to show the comment count.');
	}

});
