
import React, { useState, useEffect } from 'react';
import { fetchUserRSVPEvents, getSHA256Hash, parseCalendarEvent} from '@/lib/fetchers';
import { Button } from "@heroui/button";
import { Checkbox, CheckboxGroup } from "@heroui/checkbox";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Input } from '@heroui/input';
import { Divider } from '@heroui/divider';
import { Switch } from '@heroui/switch';
import UserCalendarsList from './UserCalendarsList';

interface CreateCalendarFromRSVPsProps {
    loggedInUserPubkey: string;
    publishNostrEvent: (event: any) => void;
}

const Calendars = ({ loggedInUserPubkey, publishNostrEvent }: CreateCalendarFromRSVPsProps) => {
    const [rsvpdEvents, setRsvpdEvents] = useState<any[]>([]);
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [calendarTitle, setCalendarTitle] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [isViewMode, setIsViewMode] = useState<boolean>(false);

    useEffect(() => {
        if (!isViewMode && loggedInUserPubkey) {
            const loadRSVPEvents = async () => {
                try {
                    setLoading(true);
                    const callback = (rawEvents: any) => {
                        const parsed = rawEvents.map(parseCalendarEvent);
                        setRsvpdEvents(parsed);
                    };
                    await fetchUserRSVPEvents(loggedInUserPubkey, callback);
                } catch (err) {
                    console.error("Failed to fetch RSVP'd events:", err);
                    setError("Could not retrieve RSVP'd events.");
                } finally {
                    setLoading(false);
                }
            }
            loadRSVPEvents();
        } else {
            setLoading(false);
        }
    }, [loggedInUserPubkey, isViewMode]);

    const handleSelectionChange = (isSelected: boolean, eventId: string) => {
        setSelectedEventIds(prev =>
            isSelected ? [...prev, eventId] : prev.filter(id => id !== eventId)
        );
    };

    const handleCreateCalendar = async () => {
        if (!calendarTitle.trim()) {
            setError("Calendar title is required.");
            return;
        }
        if (selectedEventIds.length === 0) {
            setError("Please select at least one event.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        try {
            const tags = [
                ['d', Math.random().toString(36).substring(2, 10)],
                ['title', calendarTitle],
            ];

            selectedEventIds.forEach(eventId => {
                const event = rsvpdEvents.find(e => e.id === eventId);
                if (event) {
                    const eventCoordinates = `${event.kind}:${event.pubkey}:${event.d}`;
                    tags.push(['a', eventCoordinates]);
                }
            });

            const calendarEventObject = {
                pubkey: loggedInUserPubkey,
                created_at: Math.floor(Date.now() / 1000),
                kind: 31924,
                content: '',
                tags: tags,
            };

            const finalCalendarEvent = {
                id: await getSHA256Hash(JSON.stringify(calendarEventObject)),
                ...calendarEventObject
            };

            await publishNostrEvent(finalCalendarEvent);
            setCalendarTitle("");
            setSelectedEventIds([]);
        } catch (err: any) {
            console.error("Failed to publish calendar event:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-screen items-center">
            <Card className="w-full p-6 flex-row justify-between items-center max-w-screen" shadow="sm">
                <p className="font-semibold text-foreground mr-4">
                    {isViewMode ? "Viewing My Calendars" : "Create a New Calendar"}
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-default-500">Create</span>
                    <Switch
                        isSelected={isViewMode}
                        size='sm'
                        onValueChange={setIsViewMode}
                        aria-label="Toggle between Create and View modes"
                    />
                    <span className="text-xs text-default-500">View</span>
                </div>
            </Card>
            {isViewMode ? (
                <UserCalendarsList loggedInUserPubkey={loggedInUserPubkey} />
            ) : (
                loading ? (
                    <div className="flex w-full p-6 justify-center max-w-screen">
                        <Spinner label="Loading Your RSVP'd Events..." />
                    </div>
                ) : (
                    <Card className="max-w-screen mx-auto" shadow="lg">
                        <CardHeader className="p-6">
                            <h2 className="text-2xl font-bold text-foreground">Create from Your RSVPs</h2>
                        </CardHeader>
                        <Divider />
                        <CardBody className="p-6">
                            <Input
                                isRequired
                                label="Calendar Title"
                                placeholder="e.g., My Awesome Conference Schedule"
                                value={calendarTitle}
                                onChange={(e) => setCalendarTitle(e.target.value)}
                                className="mb-6"
                            />
                            <CheckboxGroup
                                label="Select events to add to the calendar"
                                value={selectedEventIds}
                            >
                                {rsvpdEvents.length > 0 ? rsvpdEvents.map(event => (
                                    <Checkbox
                                        key={event.id}
                                        value={event.id}
                                        onChange={(e) => handleSelectionChange(e.target.checked, event.id)}
                                    >
                                        {event.title}
                                    </Checkbox>
                                )) : <p className='text-sm text-default-500'>You have not RSVPd to any events yet.</p>}
                            </CheckboxGroup>

                            <Button
                                color="primary"
                                onClick={handleCreateCalendar}
                                isLoading={isSubmitting}
                                fullWidth
                                className="mt-6"
                                disabled={rsvpdEvents.length === 0}
                            >
                                {isSubmitting ? 'Creating Calendar...' : 'Create Calendar'}
                            </Button>
                            {error && <p className="text-danger mt-4 text-sm text-center">{error}</p>}
                            {successMessage && <p className="text-success mt-4 text-sm text-center">{successMessage}</p>}
                        </CardBody>
                    </Card>
                )
            )}
        </div>
    );
};

export default Calendars;
