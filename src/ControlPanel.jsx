import { useState, useEffect } from 'react'
import { Layers as LayerIcon, Folder, MapPin, Settings as SettingsIcon, Droplet, Map, Navigation } from 'react-feather'
import { AnimatePresence } from 'framer-motion'
import { Layers } from './panels/Layers'
import { Locations } from './panels/Locations'
import { Settings } from './panels/Settings'
import { Directory } from './panels/Directory'
import { Appearance } from './panels/Appearance'
import Wayfinding from './extensions/Wayfinding'
import classNames from 'classnames'
import useMapplicStore from '../../mapplic/src/MapplicStore'
import useStore from './store'

export const ControlPanel = ({updateHistory, action, title, state}) => {
	const setAdmin = useMapplicStore(state => state.setAdmin);
	const data = useMapplicStore(state => state.data);
	const setData = useMapplicStore(state => state.setData);
	const location = useMapplicStore(state => state.location);
	const setRoutesEditing = useMapplicStore(state => state.setRoutesEditing);
	const save = useStore(state => state.saveMap);
	
	const [opened, setOpened] = useState(false);

	useEffect(() => {
		setAdmin(true);
	}, []);

	useEffect(() => {
		if (location) setOpened('Locations');
	}, [location]);

	useEffect(() => {
		setRoutesEditing(opened === 'Wayfinding');
	}, [opened, setRoutesEditing]);

	const updateSetting = (setting, value = false, step = true) => {
		setData({
			settings: {
				...data.settings,
				[setting]: value
			}
		});
		updateHistory(step);
	}
	
	const updateList = (key, list, step = true) => {
		setData({
			[key]: list
		});
		updateHistory(step);
	}

	return (
		<aside>
			<div className="panel main">
				<div className="panel-content">
					<div className="main-panel-header">
						{ action 
							? ( <button onClick={action}><div className="mapplic-menu-icon"><Map size={16} /></div></button> )
							: (
								<a href={save === 'wp' ? './edit.php?post_type=mapplic_map' : './?map=new'}><div className="mapplic-menu-icon"><Map size={16} /></div></a>
							)
						}
						<span>{ title || 'Select map' }</span>
					</div>

					<div className="mapplic-panel-group" style={{padding: 12, border: 'none'}}>
						<div style={{display: 'flex', flexDirection: 'column', width: '100%', gap: 12}}>
							<MenuItem
								title="Locations"
								icon={<MapPin size={16} />}
								count={data?.locations?.length}
								opened={opened}
								extra={
									data?.locations?.length < 1 && (!data.settings.csv || !data.settings.csvEnabled)
									? <span className="py-0.5 px-1 mr-2 ml-auto rounded-md border border-lime-500 text-xs text-lime-500">Add</span>
									: null
								}
								setOpened={setOpened}
							/>
							<MenuItem title="Layers" icon={<LayerIcon size={16} />} count={data?.layers?.length} opened={opened} setOpened={setOpened} error={data?.layers?.length < 1} />
							<MenuItem title="Directory" icon={<Folder size={16} />} opened={opened} setOpened={setOpened} />
							<MenuItem title="Settings" icon={<SettingsIcon size={16} />} opened={opened} setOpened={setOpened} />
							<MenuItem title="Appearance" icon={<Droplet size={16} />} opened={opened} setOpened={setOpened} />
							{ import.meta.env.VITE_PRO && <MenuItem title="Wayfinding" icon={<Navigation size={16} />} disabled={state < 3} opened={opened} setOpened={setOpened} /> }
						</div>
					</div>
				</div>
				<div className="panel-child">
					<AnimatePresence mode="popLayout">
						{ opened === 'Locations' && <Locations key="Locations" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Layers' && <Layers key="Layers" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Directory' && <Directory Key="Directory" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Settings' && <Settings key="Settings" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Appearance' && <Appearance key="Appearance" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ import.meta.env.VITE_PRO && opened === 'Wayfinding' && <Wayfinding key="Wayfinding" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
					</AnimatePresence>
				</div>
			</div>
		</aside>
	)
}

const MenuItem = ({title, icon, count = false, disabled = false, opened, setOpened, error = false, extra}) => {
	const handleClick = () => {
		if (disabled) return false;
		if (title === opened) setOpened(false);
		else setOpened(title);
	}

	return (
		<button type="button" className={classNames('mapplic-menu-button', {'mapplic-active': title === opened})} disabled={disabled} onClick={handleClick}>
			<div className="mapplic-menu-icon">
				{ error && <span className="mapplic-menu-warning">!</span> }
				{ icon }
			</div>
			<span>{title}</span>
			{ (count > 0 || typeof count === 'string') && <span className="mapplic-menu-count">{count}</span> }

			{ extra }
		</button>
	)
}