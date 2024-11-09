import React, { Suspense, useState } from 'react'
import { ControlPanel } from './ControlPanel'
import { AdminBar } from './AdminBar'
import { MapplicStore } from '../../mapplic/src/MapplicStore'
import { NewMap } from './NewMap'
import { UploadFieldContextProvider } from './UploadFieldContext'
import useStore from './store'
import '../../mapplic/src/mapplic.css'
import './mapplic-admin.css'

const MapplicElement = React.lazy(() => import('../../mapplic/src/MapplicElement'));

const MapplicAdmin = ({json = 'data.json', ...props}) => {
	const initStore = useStore(state => state.initStore);
	initStore(props);

	return (
		<MapplicStore>
			<UploadFieldContextProvider value={props.uploadField}>
				<AdminBuilder json={json} action={props.action} saveMap={props.saveMap} newMap={props.newMap} title={props.title} state={props.state} dir={props.dir} />
			</UploadFieldContextProvider>
		</MapplicStore>
	)
}

const AdminBuilder = ({json, action, saveMap, newMap, title, dir, state = 1}) => {
	const [view, setView] = useState('desktop');
	const [history, setHistory] = useState(0);

	const updateHistory = (step = true) => setHistory((prev) => step ? Math.abs(prev) + 1 : -Math.abs(prev) - 1);

	if (json === 'new' || newMap) return <NewMap saveMap={saveMap} dir={dir} />
	return (
		<div className="mapplic-admin">
			<ControlPanel updateHistory={updateHistory} action={action} title={title} state={state} />
			<div className="mapplic-admin-main">
				<AdminBar history={history} view={view} setView={setView} saveMap={saveMap} />
				<div className="mapplic-admin-content">
					<div id="map-container" className={view}>
						<Suspense fallback={<div>Loading...</div>}>
							<MapplicElement json={json} />
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MapplicAdmin