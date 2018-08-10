import React from 'react';
import ReactDOM from 'react-dom';
import {addFeatureCheckClasses} from '@nti/lib-dom';
import {ConflictResolutionHandler, Updates} from '@nti/web-commons';
import {overrideConfigAndForceCurrentHost, getConfigFor, initErrorReporter} from '@nti/web-client';

initErrorReporter();
addFeatureCheckClasses();
overrideConfigAndForceCurrentHost();

import 'legacy'; //kick start the app (the core is still defined in extjs)

const basePath = (x => (x = getConfigFor(x), typeof x === 'string' ? x : '/'))('basepath');

//once the all the app is react... this can just be a child of the root component... but for now, we'll mount it to a dummy div.
ReactDOM.render(
	<ConflictResolutionHandler/>,
	document.createElement('div'));
ReactDOM.render(
	<Updates.Monitor baseUrl={basePath}/>,
	document.createElement('div'));
