export function clampAddress(address: string, lead: number = 8): string {
	return address.slice(0, lead) + "..." + address.slice(lead * -1);
}
