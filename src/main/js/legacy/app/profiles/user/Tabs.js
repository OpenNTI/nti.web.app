const {Router, Route} = require('@nti/web-routing');
const {User} = require('@nti/web-profiles');

module.exports = exports = Router.for([
	Route({path: '/', component: User.Header})
]);
