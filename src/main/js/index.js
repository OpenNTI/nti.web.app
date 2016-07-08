import 'babel-polyfill';//applies hooks into global
import 'legacy'; //kick start the app (the core is still defined in extjs)
import {addFeatureCheckClasses} from 'nti-lib-dom';

addFeatureCheckClasses();
