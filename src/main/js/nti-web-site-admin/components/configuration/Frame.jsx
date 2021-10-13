import './Frame.scss';
import { Suspense } from 'react';

import { Layouts, FixedElement } from '@nti/web-commons';

import NavBar from './nav-bar';

export default function SiteAdminAdvancedView({ children }) {
	return (
		<Suspense fallback={<div />}>
			<div className="advanced-admin-tools-view">
				<Layouts.NavContent.Container>
					<Layouts.NavContent.Nav className="nav-bar">
						<FixedElement>
							<NavBar />
						</FixedElement>
					</Layouts.NavContent.Nav>
					<Layouts.NavContent.Content className="content">
						{children}
					</Layouts.NavContent.Content>
				</Layouts.NavContent.Container>
			</div>
		</Suspense>
	);
}
