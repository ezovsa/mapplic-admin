import { useState, useEffect } from 'react'
import { UploadCloud } from 'react-feather'
import classNames from 'classnames'
import builtin from './builtInMaps'
import useStore from './store'

export const NewMap = ({saveMap}) => {
	const [preset, setPreset] = useState(false);
	const [map, setMap] = useState(false);
	const [file, setFile] = useState('');

	const dir = useStore(state => state.dir);

	useEffect(() => {
		const publish = document.getElementById('publish');
		if (publish) publish.disabled = map === false;
	}, [map]);

	return (
		<div className="flex flex-col gap-4 py-10 w-full max-w-md m-auto">
			<p className="font-bold text-4xl">Configure</p>
			<p>Select a preset to get started.</p>

			<div className="flex flex-col gap-10">
				<div className="flex flex-col gap-2">
					<span className="text-sm font-semibold">Preset</span>
					<Radio
						options={[
							{ value: 'example', text: 'Example', detail: <small className="text-gray-400">Explore a configured map</small> },
							{ value: 'builtin', text: 'Built-in', detail: <small className="text-gray-400">Use a built-in map</small> },
							{ value: 'custom', text: 'Custom', detail: <small className="text-gray-400">Upload your own file</small> }
						]}
						value={preset}
						onChange={val => {
							setPreset(val);
							setMap(false);
						}}
					/>
				</div>

				{ preset === 'example' &&
					<label className="flex flex-col gap-2">
						<span className="text-sm font-semibold">Examples</span>
						<Radio
							className="flex gap-3"
							options={[
								{ value: 'mall', text: 'Mall', png: 'retail-small' },
								{ value: 'lots', text: 'Lots', png: 'lot-small' },
								{ value: 'us', text: 'Geo', png: 'geo-small' },
							]}
							value={map}
							onChange={val => setMap(val) }
						/>
					</label>
				}
				
				{ preset === 'builtin' &&
					<label className="flex flex-col gap-2">
						<span className="text-sm font-semibold">Built-in maps</span>
						<div className="border rounded-xl overflow-hidden focus-within:outline outline-2 outline-primary">
							<select className="w-full p-3 scrollbar outline-none" value={map || ""} size="6" onChange={e => setMap(e.target.value)}>
								<option value="" disabled>Select a map</option>
								{ Object.keys(builtin).map(id => <option key={id} value={id}>{builtin[id].title}</option>)}
							</select>
						</div>
					</label>
				}

				{ preset === 'custom' &&
					<>
						<InputMap
							label="Map file"
							placeholder="SVG, PNG or JPG base map"
							onChange={(f) => {
								setFile(f);
								setMap('custom');
							}}
						/>
					</>
				}
				
				{ saveMap === 'wp'
					? (
						<button
							type="button"
							className="btn btn-primary btn-lg"
							disabled={!map}
							onClick={() => {
								const hiddenInput = document.querySelector('#mapplic-mapdata');

								if (hiddenInput) {
									let json;
									if (map === 'custom') json = getCustom(file);
									else if (map !== 'mall' && map !== 'lots') json = getBuiltIn(map, builtin[map], null, dir);
									hiddenInput.value = json ? JSON.stringify(json) : map;
									document.querySelector('form#post').submit();
								}
							}}
						>
							Create map
						</button>
					)
					: <MapLink id={map} map={builtin[map]} file={`data-${map}.json`} />
				}


			</div>

		</div>
	)
}

const Radio = ({options, className, value, onChange}) => {
	return (
		<fieldset className={className || 'flex flex-col gap-3'}>
			{ options.map(o => 
				<Option
					key={o.value}
					{...o}
					active={value === o.value}
					onClick={val => onChange(val)}
				/>
			)}
		</fieldset>
	)
}

const Option = ({text, value, png, active, onClick, detail}) => {
	const dir = useStore(state => state.dir);

	return (
		<button
			className={classNames('flex overflow-hidden relative justify-between w-full items-center text-left bg-white border px-5 py-4 rounded-xl font-semibold disabled:bg-transparent disabled:text-gray-900 focus:outline-black focus:outline-2 transition-colors', {
				'ring-blue-500 ring-1 border-blue-500 bg-blue-50': active,
				'h-16': png
			})}
			onClick={e => {
				e.preventDefault();
				onClick(value);
			}}
		>
			{ png && <img src={`${dir}img/${png}.png`} srcSet={`${dir}img/${png}2x.png 2x`} alt={text} className="absolute -right-10 -bottom-10 scale-75" /> }
			<span className="z-10">{ text }</span>
			{ detail && <span className="font-normal text-right">{ detail }</span> }
		</button>
	)
}


const InputMap = ({label, placeholder = '', onChange}) => {
	const dir = useStore(state => state.dir);
	const [value, setValue] = useState('');

	const handleClick = (e) => {
		if (typeof wp !== 'undefined') {
			const custom_uploader = wp.media({
				title: 'Select Image',
			});
			custom_uploader.open();
			custom_uploader.on('select', () => {
				const attachment = custom_uploader.state().get('selection').first().toJSON();

				setValue(attachment.url);
				onChange(() => attachment.sizes.full);
			});
		}
		e.preventDefault();
	}

	return (
		<label className="flex flex-col gap-2">
			<span className="text-sm font-semibold">{label}</span>
			<div className="flex border bg-white border-gray-300 gap-1 p-1 px-1.5 items-center focus-within:outline outline-2 outline-primary rounded-xl">
				<div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden">
					<ImageWithPlaceholder
						className="w-full h-full object-contain"
						src={value}
						placeholder={`${dir}img/map-placeholder.png`}
					/>
				</div>
				<input
					className="bg-transparent border-none shadow-none w-full p-2 outline-none"
					type="text"
					value={value}
					placeholder={placeholder}
					onChange={e => {
						setValue(e.target.value);
						onChange({ url: e.target.value });
					}}
				/>
				<button
					className="btn btn-secondary btn-sm rounded-lg"
					onClick={handleClick}
				>
					Upload
					<UploadCloud className="opacity-50" size={16} />
				</button>
			</div>
		</label>
	)
}

const ImageWithPlaceholder = ({src, placeholder, ...props}) => {
	const [fallback, setFallback] = useState(false);
	
	useEffect(() => {
		setFallback(false);
	}, [src]);
	
	return (
		<img
			src={fallback ? placeholder : src}
			onError={() => setFallback(true)}
			{...props}
		/>
	);
}

const MapLink = ({id, map, file}) => {
	const [exists, setExists] = useState(false);
	
	useEffect(() => {
		const checkIfFileExists = async (url) => {
			try {
				const res = await fetch(url, { method: 'HEAD' });
				if (res.status === 200) return true;
				else return false;
			} catch (error) {
				return null; // error occurred, file does not exist
			}
		}
		
		const updateExistsState = async () => {
			const result = await checkIfFileExists(file);
			setExists(result);
		}
	  
		updateExistsState();
	}, [file]);
	
	const createMap = async () => {
		try {
			await fetch('http://localhost:3000/mapplic-save', {
				mode: 'no-cors',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(getBuiltIn(id, map, file))
			});
			setExists(true);
		}
		catch (error) {
			console.error(error);
		}
	}

	if (!id) return <button disabled className="btn btn-lg btn-primary">Open</button>
	return (
		<>
			{ exists
				? <a className="btn btn-lg btn-primary" href={`./?map=${file}`}>Open {map?.title}</a>
				: <button className="btn btn-lg" onClick={createMap}>Generate {file}</button>
			}
		</>
	)
}

const getCustom = (file, title = 'Layer 1') => {
	const layer = 'layer1';

	return {
		settings: {
			mapWidth: file?.width || 1000,
			mapHeight: file?.height || 800,
			zoom: true,
			hoverTooltip: true,
			maxZoom: 3,
			layer: layer,
			layerSwitcher: 'top-right',
			resetButton: 'bottom-right',
			zoomButtons: 'bottom-right'
		},
		locations: [],
		layers: [
			{
				id: layer,
				name: title,
				file: file.url
			}
		],
		breakpoints: [
			{
				name: "all-screens",
				below: 9000,
				container: 600
			},
			{
				name: "mobile",
				below: 480,
				container: 400,
				portrait: true
			}
		]
	}
}

const getBuiltIn = (id, map, json, dir = '') => ({
	target: json,
	settings: {
		mapWidth: map.width,
		mapHeight: map.height,
		padding: 40,
		zoom: true,
		hoverTooltip: true,	
		maxZoom: 3,
		layer: id,
		layerSwitcher: 'top-right',
		resetButton: 'bottom-right',
		zoomButtons: 'bottom-right',
		extent: map.extent,
		geo: false
	},
	layers: [
		{
			id: id,
			name: map.title,
			file: `${dir}assets/maps/world/${id.toUpperCase()}.svg`
		}
	],
	locations: [
		{
			id: "def",
			title: "Default values",
			style: "subdivision",
			sample: true
		},
	],
	breakpoints: [
		{
			name: "all-screens",
			below: 9000,
			container: 600
		},
		{
			name: "mobile",
			below: 480,
			portrait: true
		}
	],
	styles: [
		{
			class: "subdivision",
			svg: true,
			marker: false,
			"base-color": "#cfdbe9",
			"hover-color": "#b1c6df",
			"active-color": "#90afd5",
			"active-stroke": "#3f6593"
		}
	]
})