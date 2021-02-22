const { Router, Route } = require('@nti/web-routing');
const { Navigation } = require('@nti/web-content');

module.exports = exports = Router.for([
	Route({ path: '/', component: Navigation.BookTabs }),
]);
