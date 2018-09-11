const {Router, Route} = require('@nti/web-routing');
const {Navigation} = require('@nti/web-course');

module.exports = exports = Router.for([
	Route({path: '/', component: Navigation.Tabs})
]);
