
import Card from '../../../common/Card';

import Identity from './Identity';
import Tabs from './Tabs';
import EmailUpdate from './EmailUpdate';

export default function SiteAdminUserIdentity(props) {
	return (
		<>
			<Card className="site-admin-user-nav-bar">
				<Identity {...props} />
				<Tabs {...props} />
			</Card>
			<EmailUpdate {...props} />
		</>
	);
}
