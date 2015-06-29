Ext.define('NextThought.app.context.ContainerContext', {
	requires: [
		'NextThought.app.context.types.*',
		'NextThought.app.context.components.AuthorizationContext'
	],

	constructor: function(config) {
		this.callParent(arguments);

		this.config = config;
		this.container = config.container;
	},

	/**
	 * Load the context of UserData (i.e. note)
	 * @param  {[string]} type [type of context: card, list, or leave empty.
	 *                          Leave empty, in case of a note will be presented in a note window
	 *                          'card': to be rendered as a card, @see notes in activity.
	 *                          'list': to be rendered as a list object, @see notes in profiles.]
	 * @return {[Promise]}   	[Promise that resolves with dom element for the context]
	 */
	load: function(type) {
		var url = Service.getObjectURL(this.container);
		if (!this.load_promise) {
			this.load_promise = this.__handle403Response({
				status: 403,
				responseText: '[{"Class":"CourseCatalogLegacyEntry","ContentPackageNTIID":"tag:nextthought.com,2011-10:OU-HTML-CS1323_S_2015_Intro_to_Computer_Programming.introduction_to_computer_programming","CourseNTIID":"tag:nextthought.com,2011-10:system-OID-0x4bac:5573657273:krsMx9Uw3HM","CreatedTime":0,"Credit":[{"Class":"CourseCreditLegacyInfo","Enrollment":{"label":"Non-OU Student Enrollment","url":"/app/#!library/availablecourses/IUB0YWc6bmV4dHRob3VnaHQuY29tLDIwMTEtMTA6TlRJLUNvdXJzZUluZm8tRmFsbDIwMTRfQ1NfMTMyMw"},"Hours":3,"MimeType":"application/vnd.nextthought.courses.coursecreditlegacyinfo"},{"Class":"CourseCreditLegacyInfo","Enrollment":{"label":"OU Students Enroll on Ozone","url":"http://ozone.ou.edu/"},"Hours":3,"MimeType":"application/vnd.nextthought.courses.coursecreditlegacyinfo"}],"DCCreator":null,"DCDescription":"This course is designed as an introduction to computer programming using Java. Students will learn how to a) analyze a problem, and identify and define the computing requirements appropriate to its solution b) design, implement, and evaluate a computer-based system, process, component, or program to meet desired needs, and c) apply design and development principles in the construction of software systems of varying complexity. Topics include Computers, programs, Java, input and output, identifiers, variables, assignment statements, constants, memory diagrams, primitive data types, conditional statements, repetition, methods, parameters, arguments, return values, one dimensional arrays, objects, classes, and classes from the Java Application Programmers Interface (API). No prior programming experience is assumed.","DCTitle":"Introduction to Computer Programming","Description":"This course is designed as an introduction to computer programming using Java. Students will learn how to a) analyze a problem, and identify and define the computing requirements appropriate to its solution b) design, implement, and evaluate a computer-based system, process, component, or program to meet desired needs, and c) apply design and development principles in the construction of software systems of varying complexity. Topics include Computers, programs, Java, input and output, identifiers, variables, assignment statements, constants, memory diagrams, primitive data types, conditional statements, repetition, methods, parameters, arguments, return values, one dimensional arrays, objects, classes, and classes from the Java Application Programmers Interface (API). No prior programming experience is assumed.","DisableOverviewCalendar":false,"Duration":"P112D","EndDate":"2015-05-04T06:00:00Z","EnrollmentOptions":{"Class":"EnrollmentOptions","Items":{"OpenEnrollment":{"Class":"OpenEnrollment","Enabled":true,"IsAvailable":true,"IsEnrolled":false,"MimeType":"application/vnd.nextthought.courseware.openenrollmentoption"}},"MimeType":"application/vnd.nextthought.courseware.enrollmentoptions"},"Instructors":[{"Class":"CourseCatalogInstructorLegacyInfo","JobTitle":"Associate Professor, School of Computer Science","MimeType":"application/vnd.nextthought.courses.coursecataloginstructorlegacyinfo","Name":"Deborah Trytten, Ph.D.","Suffix":null,"Title":null,"defaultphoto":""}],"Last Modified":1435528155,"LegacyPurchasableIcon":"/content/sites/platform.ou.edu/CS1323_S_2015_Intro_to_Computer_Programming/images/CS1323_promo.png","LegacyPurchasableThumbnail":"/content/sites/platform.ou.edu/CS1323_S_2015_Intro_to_Computer_Programming/images/CS1323_cover.png","Links":[{"Class":"Link","href":"/dataserver2/%2B%2Betc%2B%2Bhostsites/platform.ou.edu/%2B%2Betc%2B%2Bsite/Courses/Spring2015/CS%201323","rel":"CourseInstance"}],"MimeType":"application/vnd.nextthought.courses.coursecataloglegacyentry","NTIID":"tag:nextthought.com,2011-10:NTI-CourseInfo-Spring2015_CS_1323","OID":"tag:nextthought.com,2011-10:system-OID-0x021baa:5573657273","PlatformPresentationResources":[{"Class":"DisplayablePlatformPresentationResources","CreatedTime":1435528155,"InheritPlatformName":"shared","Last Modified":1435528155,"PlatformName":"iPad","Version":1,"href":"/content/sites/platform.ou.edu/Courses/Spring2015/CS%201323/presentation-assets/iPad/v1/"},{"Class":"DisplayablePlatformPresentationResources","CreatedTime":1435528155,"InheritPlatformName":null,"Last Modified":1435528155,"PlatformName":"shared","Version":1,"href":"/content/sites/platform.ou.edu/Courses/Spring2015/CS%201323/presentation-assets/shared/v1/"},{"Class":"DisplayablePlatformPresentationResources","CreatedTime":1435528155,"InheritPlatformName":"shared","Last Modified":1435528155,"PlatformName":"webapp","Version":1,"href":"/content/sites/platform.ou.edu/Courses/Spring2015/CS%201323/presentation-assets/webapp/v1/"}],"Prerequisites":[{"id":"","title":"MATH 1523 or concurrent enrollment, or placement into MATH 1743 or MATH 1823 or higher"}],"Preview":false,"ProviderDepartmentTitle":"School of Computer Science at the University of Oklahoma","ProviderDisplayName":"CS 1323","ProviderUniqueID":"CS 1323","Schedule":null,"StartDate":"2015-01-12T06:00:00Z","Title":"Introduction to Computer Programming","Video":"kaltura://1500101/0_aqksto2u/","contributors":null,"creators":null,"description":"This course is designed as an introduction to computer programming using Java. Students will learn how to a) analyze a problem, and identify and define the computing requirements appropriate to its solution b) design, implement, and evaluate a computer-based system, process, component, or program to meet desired needs, and c) apply design and development principles in the construction of software systems of varying complexity. Topics include Computers, programs, Java, input and output, identifiers, variables, assignment statements, constants, memory diagrams, primitive data types, conditional statements, repetition, methods, parameters, arguments, return values, one dimensional arrays, objects, classes, and classes from the Java Application Programmers Interface (API). No prior programming experience is assumed.","href":"/dataserver2/%2B%2Betc%2B%2Bhostsites/platform.ou.edu/%2B%2Betc%2B%2Bsite/Courses/Spring2015/CS%201323/CourseCatalogEntry","publisher":null,"subjects":null,"title":"Introduction to Computer Programming"}]'
			});
			// this.load_promise = Service.request({
			// 	url: url ,
			// 	headers: {
			// 		Accept: '*/*'
			// 	}
			// })
			// 	.then(this.__parseResponse.bind(this))
			// 	.then(this.__parseContext.bind(this, type))
			// 	.fail(this.__handle403Response.bind(this));
		}

		return this.load_promise;
	},


	__parseResponse: function(response) {
		var parse;

		return new Promise(function(fulfill) {
			parse = ParseUtils.parseItems(response)[0];
			fulfill(parse || Ext.decode(response, true));
		})
		.fail(function() {
			var xml = (new DOMParser()).parseFromString(response, 'text/xml');

			if (xml.querySelector('parsererror')) {
				return Promise.resolve('');
			}

			return xml;
		});
	},


	__parseContext: function(contextType, obj) {
		var typesPath = NextThought.app.context.types,
			keys = Object.keys(typesPath), i, handler;

		for (i = 0; i < keys.length; i++) {
			handler = typesPath[keys[i]];
			if (handler.canHandle && handler.canHandle(obj)) {
				break;
			}
		}

		if (handler) {
			handler = handler.create(this.config);
			return handler.parse(obj, contextType);
		}

		console.error('No handler to get context from obj:', obj);
		return Promise.resolve(null);
	},


	__handle403Response: function(response){
		var o =  Ext.decode(response.responseText, true),
			status = response.status,
			catalogEntry = o && ParseUtils.parseItems(o)[0], cmp;


		if (status === 403 && catalogEntry) {
			cmp = Ext.widget('context-authorization', {
						catalogEntry: catalogEntry
					});

			return Promise.resolve(cmp);
		}

		return Promise.reject();
	}
});
