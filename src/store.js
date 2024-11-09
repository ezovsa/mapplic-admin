import { create } from 'zustand'

const useStore = create((set, get) => ({
	dir: '../',

	initStore: (props) => {
		const filteredProps = Object.fromEntries(
			Object.entries(props).filter(([key, value]) => value !== undefined)
		);
		set(filteredProps);
	},
	setDir: (val) => set({dir: val}),
}));

export default useStore