import {Router, Route} from '@nti/web-routing';// eslint-disable-line

import Transcripts from './transcripts';
import Frame from './Frame';

export default Router.for([
	Route({path: '/', component: Transcripts, name: 'site-admin.transcripts'})
], {frame: Frame});
