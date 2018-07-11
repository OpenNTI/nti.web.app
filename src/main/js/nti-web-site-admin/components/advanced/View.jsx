import {Router, Route} from '@nti/web-routing';// eslint-disable-line

import Transcripts from './transcripts';
import Integrations from './integrations';
import Frame from './Frame';

export default Router.for([
	Route({path: '/integrations', component: Integrations, name: 'site-admin.advanced.integrations'}),
	Route({path: '/', component: Transcripts, name: 'site-admin.transcripts'})
], {frame: Frame});
