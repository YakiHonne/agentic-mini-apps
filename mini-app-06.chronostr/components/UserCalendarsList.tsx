import React, { useState, useEffect } from 'react';
import {
    fetchUserCalendars,
    parseCalendarListEvent
} from '@/lib/fetchers';
import {
    Card,
    CardBody,
    CardHeader
} from "@heroui/card";
import InteractiveCalendarModal from './InteractiveCalendarModal';
import { useDisclosure } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";


interface UserCalendarsListProps {
    loggedInUserPubkey: string;
}

const LocationIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" fill="currentColor" />
    </svg>
);

const UserCalendarsList = ({ loggedInUserPubkey }: UserCalendarsListProps) => {
    const [calendars, setCalendars] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const [selectedCalendar, setSelectedCalendar] = useState<any | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Fetch the list of calendars on component mount
    useEffect(() => {
        const loadCalendars = async () => {
            if (!loggedInUserPubkey) return;
            try {
                setLoading(true);
                await fetchUserCalendars(loggedInUserPubkey, (rawEvents) => {
                    const parsed = rawEvents.map(parseCalendarListEvent);
                    console.log(parsed);
                    setCalendars(parsed);
                });
            } catch (err) {
                console.error("Failed to fetch calendars:", err);
                setError("Could not retrieve your calendars.");
            } finally {
                setLoading(false);
            }
        };
        loadCalendars();
    }, [loggedInUserPubkey]);


    const handleCalendarPress = (calendar: any) => {
        setSelectedCalendar(calendar);
        onOpen();
    };
    
    if (loading) {
        return (
            <div className="flex flex-col items-center p-8">
                <Spinner label="Loading Your Calendars..." color="primary" />
            </div>
        );
    }

    return (
        <>
            <Card className="max-w-screen w-full mx-auto" shadow="lg">
                <CardHeader className="p-6">
                    <h2 className="text-2xl font-bold text-foreground w-full text-center">My Calendars</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6">
                    {error && <p className="text-danger text-center">{error}</p>}
                    {calendars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {calendars.map(cal => (
                                <Card isPressable isHoverable key={cal.id} onPress={() => handleCalendarPress(cal)}>
                                    <CardBody className="text-center justify-center">
                                        <p className="font-semibold text-foreground">{cal.title}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-default-500 text-center">You havent created any calendars yet.</p>
                    )}
                </CardBody>
            </Card>

            <InteractiveCalendarModal
                isOpen={isOpen}
                onClose={onClose}
                calendar={selectedCalendar}
            />
        </>
    );
};

export default UserCalendarsList;