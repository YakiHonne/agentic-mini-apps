export const getAvatarUrl = (pubkey: string) => `https://api.boringavatars.com/beam/120/${pubkey}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`;

export const formatEventDate = (event: any) => {
    if (!event.start) return "Date not specified";
    if (event.kind === 31923) {
        const startDate = new Date(parseInt(event.start, 10) * 1000);
        const endDate = new Date(parseInt(event.end, 10) * 1000);
        return startDate.toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) + " - "
            + (endDate.toLocaleString(undefined, {month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) === 'Invalid Date' ? " " : endDate.toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }));
    }
    if (event.kind === 31922) 
        {
            return `${event.start} - ${event.end ? event.end : "Ongoing"}`;
        }
    return "Invalid date";
};


export function convertToMilitaryTime(utc: number) {
  const date = new Date(utc);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}