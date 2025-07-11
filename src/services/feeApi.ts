export const FeeApi = {
    async createFees(fees: any[]) {
        const res = await fetch('/api/fees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fees),
        });
        if (!res.ok) throw new Error('建立失敗');
        return res.json();
    },
    async getFees(params: any) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`/api/fees?${query}`);
        return res.json();
    },
    async updateFee(id: string, data: any) {
        const res = await fetch(`/api/fees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    async deleteFee(id: string) {
        const res = await fetch(`/api/fees/${id}`, { method: 'DELETE' });
        return res.json();
    },
}; 