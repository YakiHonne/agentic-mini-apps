import { CuratedEventsResponse } from '@/types/curate';
import { useMutation } from '@tanstack/react-query'


export const useCuratedEvents = () => {
    return useMutation({
        mutationKey: ['events'],
        mutationFn: async ({ topic, type = "search", paymentHash }: { 
            topic: string; 
            type?: string; 
            paymentHash?: string; 
        }) => {
            const response = await fetch('/api/curate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic, type, paymentHash }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch curated events');
            }

            const data: CuratedEventsResponse = await response.json();
            return data;
        }
    })
}