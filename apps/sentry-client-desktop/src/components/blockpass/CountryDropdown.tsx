import {Dispatch, SetStateAction, useEffect, useState} from "react";

interface Country {
	value: string;
	label: string;
}

interface CountryDropdownProps {
	selectedCountry: string;
	setSelectedCountry: Dispatch<SetStateAction<string>>;
}

export function CountryDropdown({selectedCountry, setSelectedCountry}: CountryDropdownProps) {
	const [countries, setCountries] = useState<Country[]>([]);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const response = await fetch(
					"https://valid.layercode.workers.dev/list/countries?format=select&flags=true&value=code"
				);
				const {countries} = await response.json();
				setCountries(countries || []);
			} catch (error) {
				console.error("Error fetching countries:", error);
			}
		};

		void fetchCountries();
	}, []);

	const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedCountry(event.target.value);
	};

	return (
		<div className="flex flex-col py-2 mt-2">
			<select
				id="country"
				onChange={handleCountryChange}
				value={selectedCountry}
			>
				<option value="">Select your country</option>
				{countries.map(({value, label}) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>
		</div>
	);
}
