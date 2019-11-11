import {types} from '../../sections/assets/constants';

import FullLogo from './FullLogo';
import Logo from './Logo';
import Email from './Email';
import FavIcon from './FavIcon';

const widgets = {
	[types.fullLogo]: FullLogo,
	[types.logo]: Logo,
	[types.email]: Email,
	[types.favicon]: FavIcon,
};

const empty = () => null;
export default type => widgets[type] || empty;
