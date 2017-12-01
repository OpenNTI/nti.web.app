import 'legacy'; //kick start the app (the core is still defined in extjs)
import React from 'react';
import ReactDOM from 'react-dom';
import {addFeatureCheckClasses} from 'nti-lib-dom';
import {ConflictResolutionHandler} from 'nti-web-commons';
import {init as initLocale} from 'nti-lib-locale';
import {overrideConfigAndForceCurrentHost} from 'nti-web-client';

initLocale();
addFeatureCheckClasses();
overrideConfigAndForceCurrentHost();

//once the all the app is react... this can just be a child of the root component... but for now, we'll mount it to a dummy div.
ReactDOM.render(
	<ConflictResolutionHandler/>,
	document.createElement('div'));
