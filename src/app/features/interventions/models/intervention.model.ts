export interface Intervention {
	id: number | string;
	reference: string;
	customerName: string;
	vehicleLabel: string;
	interventionType: string;
	status: string;
	priority: string;
	slaStatus: string;
	createdAt: string | null;
	dueAt: string | null;
	assignedMechanic: string;
}
