Ext.define('NextThought.view.course.info.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course-info',

	requires: [
		'NextThought.view.course.info.outline.View',
		'NextThought.view.course.info.Panel'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},


	navigation: {xtype: 'course-info-outline'},
	body: {xtype: 'course-info-panel'},


	initComponent: function() {
		this.callParent(arguments);
		//we set this up to listen to a node that will not scroll...
		// so that when this view is activated it will reset the view.
		this.initCustomScrollOn('content');
	},


	onCourseChanged: function(pageInfo) {
		var me = this,
			l = ContentUtils.getLocation(pageInfo),
			toc, course, info, content;

		function update(info) {
			me.hasInfo = !!info;
			me.currentCourseInfoNtiid = Ext.isString(info) ? info : (info && info.ntiid);

			if (info) {
				info.locationInfo = l;
			}

			me[me.infoOnly?'addCls':'removeCls']('info-only');
			me.navigation.margin = (me.infoOnly? '105':'0')+' 5 5 0';

			me.body.setContent(info);
			me.navigation.setContent(info);
		}


		delete me.infoOnly;

		if (l && l !== ContentUtils.NO_LOCATION) {
			toc = l.toc && l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
			info = course && course.querySelector('info');
		}

		if (info) {
			update();//clear the current view while we load.
			me.parseNode(info, course, update);
			return;
		}

		content = pageInfo.isPartOfCourse() && course && course.getAttribute('courseInfo');
		update(content);
	},


	parseNode: function(infoNode, courseNode, callback){
		this.hasInfo = !!infoNode;
		this.infoOnly = !courseNode.querySelector('unit');

		Ext.callback(callback,this,[{
			"ntiid": "tag:nextthought.com,2011-10:OU-HTML-SOC1113_GenericCourse.course_info",
			"id": "ENGR 1510-001",
			"school": "Civil Engineering",
			"video": "kaltura://1500101/0_4ol5o04l/",
			"title": "Introduction to Water",
			"credit": [
			{
				"hours":1,
				"enrollment": {
					"label":"Enroll with Ozone.",
					"url":"http://ozone.ou.edu/---enroll-link-for-engr1510-001"
				}
			}
			],
			"startDate": new Date("2014-01-15T05:00:00+00:00"),
			"duration":"18 Weeks",
			"schedule":{
				"days": ["M","W","F"],
				"times": [
					new Date('2014-01-15T16:30:00-06:00'),
					new Date('2014-01-15T17:20:00-06:00')
				]
			},
			"description": "This couse is an introductory couse on the significance of water in our world. THe title of the course makes reference to (1) water as a global and local natural resource (Water), (2) water as a chemical compound with important properties and characteristics (H2O), and (3) the science and technology of bringing clean water to the peoples in need (WaTER, an acronym for \"Water Technologies for Engineering Regions\"). The course is designed to generate awareness of water's beneficial uses as well as the challenges associated with water quality, degradation, scarcity, over-abundance (flooding), and inequities in access to clean water. It will also introduce the students to the need to consider both techological options and cultural context in determining...",
			"prerequisites":[
			{
				"id":"ENGR 1001",
				"title":"Example Prereq"
			}
			],
			"instructors":[
			{
				"defaultphoto":"resources/...blala/photo.png",
				"username":"blac1234",
				"name":"Stephanie Blackmon, PhD",
				"title": "Assistant Professor, Adult & Higher Education"
			}
			]
		}]);
	}
});
