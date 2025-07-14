import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
} from "@heroui/card";
import { getSHA256Hash } from '@/lib/fetchers';
import { Input, Textarea } from '@heroui/input';
import { Radio, RadioGroup } from '@heroui/radio';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Button } from '@heroui/button';


const CreateCalendarEventForm = ({ pubkey, publishNostrEvent }: { pubkey: string, publishNostrEvent: any }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [participants, setParticipants] = useState<{ pubkey: string; role: string }[]>([]);
    const [participantInput, setParticipantInput] = useState({ pubkey: '', role: '' });

    const [formData, setFormData] = useState({
        eventType: 'time', // 'time' or 'date'
        title: '',
        summary: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        timeZone: '',
        location: '',
        image: '',
        hashtags: '',
    });

    useEffect(() => {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone) {
            setFormData(prev => ({ ...prev, timeZone: userTimeZone }));
        }
    }, []);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleParticipantInputChange = (e: any) => {
        const { name, value } = e.target;
        setParticipantInput(prev => ({ ...prev, [name]: value }));
    };

    const handleAddParticipant = () => {
        if (participantInput.pubkey.trim() && !participants.some(p => p.pubkey === participantInput.pubkey)) {
            setParticipants(prev => [...prev, {
                pubkey: participantInput.pubkey.trim(),
                role: participantInput.role.trim() || 'attendee'
            }]);
            setParticipantInput({ pubkey: '', role: '' });
        }
    };

    const handleRemoveParticipant = (pubkeyToRemove: string) => {
        setParticipants(prev => prev.filter(p => p.pubkey !== pubkeyToRemove));
    };

    const handleEventTypeChange = (value: any) => {
        setFormData(prev => ({ ...prev, eventType: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const tags = [];

            if (formData.title) tags.push(['title', formData.title]);
            if (formData.summary) tags.push(['summary', formData.summary]);
            if (formData.location) tags.push(['location', formData.location]);
            if (formData.image) tags.push(['image', formData.image]);

            if (formData.hashtags) {
                formData.hashtags.split(',').forEach(tag => {
                    if (tag.trim()) tags.push(['t', tag.trim()]);
                });
            }

            if (participants.length > 0) {
                participants.forEach(p => {
                    // Format: ["p", <pubkey>, <role>] - omitting optional relay URL
                    tags.push(['p', p.pubkey, p.role]);
                });
            }

            let kind;
            if (formData.eventType === 'time') {
                kind = 31923;
                // Convert date and time to a Unix timestamp in seconds
                if (formData.startDate && formData.startTime) {
                    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
                    tags.push(['start', String(Math.floor(startDateTime.getTime() / 1000))]);
                }
                if (formData.endDate && formData.endTime) {
                    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
                    tags.push(['end', String(Math.floor(endDateTime.getTime() / 1000))]);
                }
                if (formData.timeZone) {
                    tags.push(['start_tzid', formData.timeZone]);
                    tags.push(['end_tzid', formData.timeZone]);
                }

            } else {
                kind = 31922;
                if (formData.startDate) tags.push(['start', formData.startDate]);
                if (formData.endDate) tags.push(['end', formData.endDate]);
            }

            tags.push(['d', Math.random().toString(36).substring(2, 10)]);

            const nostrEventObject = {
                pubkey: pubkey,
                created_at: Math.floor(Date.now() / 1000),
                kind: kind,
                content: formData.summary || '', // Use summary as content, or empty string
                tags: tags,
            };

            const eventData = {
                id: await getSHA256Hash(JSON.stringify(nostrEventObject)),
                ...nostrEventObject
            }

            publishNostrEvent(eventData);


        } catch (err: any) {
            console.error("Failed to publish event:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-screen mx-auto" shadow="lg">
            <CardHeader className="p-6">
                <h2 className="text-2xl font-bold text-foreground">Create a New Calendar Event</h2>
            </CardHeader>
            <Divider />
            <form onSubmit={handleSubmit}>
                <CardBody className="p-6 gap-6">
                    <RadioGroup
                        label="Event Type"
                        orientation="horizontal"
                        value={formData.eventType}
                        onValueChange={handleEventTypeChange}
                    >
                        <Radio value="time">Time-based (Specific Time)</Radio>
                        <Radio value="date">Date-based (All-Day)</Radio>
                    </RadioGroup>

                    <Input
                        isRequired
                        name="title"
                        label="Event Title"
                        placeholder="e.g., Bitcoin Meetup"
                        value={formData.title}
                        onChange={handleInputChange}
                    />
                    <Textarea
                        name="summary"
                        label="Summary / Description"
                        placeholder="A brief description of the event."
                        value={formData.summary}
                        onChange={handleInputChange}
                    />

                    {formData.eventType === 'time' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                isRequired
                                name="startDate"
                                label="Start Date"
                                type="date"
                                value={formData.startDate}
                                onChange={handleInputChange}
                            />
                            <Input
                                isRequired
                                name="startTime"
                                label="Start Time"
                                type="time"
                                value={formData.startTime}
                                onChange={handleInputChange}
                            />
                            <Input
                                name="endDate"
                                label="End Date (Optional)"
                                type="date"
                                value={formData.endDate}
                                onChange={handleInputChange}
                            />
                            <Input
                                name="endTime"
                                label="End Time (Optional)"
                                type="time"
                                value={formData.endTime}
                                onChange={handleInputChange}
                            />
                            <Input
                                name="timeZone"
                                label="Time Zone"
                                placeholder="e.g., America/New_York"
                                value={formData.timeZone}
                                onChange={handleInputChange}
                                description="Automatically detected from your browser."
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                isRequired
                                name="startDate"
                                label="Start Date"
                                type="date"
                                value={formData.startDate}
                                onChange={handleInputChange}
                            />
                            <Input
                                name="endDate"
                                label="End Date (Optional, for multi-day events)"
                                type="date"
                                value={formData.endDate}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}

                    <Divider className="my-2" />

                    <Input
                        name="location"
                        label="Location (Optional)"
                        placeholder="e.g., 123 Main St or a video call link"
                        value={formData.location}
                        onChange={handleInputChange}
                    />
                    <Input
                        name="image"
                        label="Image URL (Optional)"
                        placeholder="https://example.com/image.png"
                        value={formData.image}
                        onChange={handleInputChange}
                    />
                    <Input
                        name="hashtags"
                        label="Hashtags (Optional)"
                        placeholder="meetup, bitcoin, tech"
                        description="Separate with commas."
                        value={formData.hashtags}
                        onChange={handleInputChange}
                    />
                    <Divider className="my-2" />
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold text-foreground">Invite Participants (Optional)</h3>
                        <div className="flex flex-col sm:flex-row items-end gap-2">
                            <Input
                                name="pubkey"
                                label="Participant Pubkey"
                                placeholder="Enter a npub or hex public key"
                                value={participantInput.pubkey}
                                onChange={handleParticipantInputChange}
                                className="flex-grow"
                            />
                            <Input
                                name="role"
                                label="Role"
                                placeholder="e.g., speaker, host"
                                value={participantInput.role}
                                onChange={handleParticipantInputChange}
                                className="w-full sm:w-48"
                            />
                            <Button
                                onPress={handleAddParticipant}
                                color="primary"
                                variant="flat"
                                className="w-full sm:w-auto"
                            >
                                Add Participant
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {participants.map((p) => (
                                <Chip
                                    key={p.pubkey}
                                    onClose={() => handleRemoveParticipant(p.pubkey)}
                                    variant="flat"
                                >
                                    {`${p.pubkey.substring(0, 10)}... (${p.role})`}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </CardBody>
                <Divider />
                <CardFooter className="p-6 flex-col items-start">
                    <Button
                        color="primary"
                        type="submit"
                        isLoading={isSubmitting}
                        fullWidth
                    >
                        {isSubmitting ? 'Publishing Event...' : 'Create Event'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreateCalendarEventForm;