import {types} from '../../sections/assets/constants';

import FullLogo from './FullLogo';
import Logo from './Logo';
import Email from './Email';

const widgets = {
	[types.fullLogo]: FullLogo,
	[types.logo]: Logo,
	[types.email]: Email,
};

const empty = () => null;
export default type => widgets[type] || empty;
