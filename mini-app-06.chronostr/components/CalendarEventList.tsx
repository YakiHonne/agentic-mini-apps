import React, { useState, useEffect } from 'react'
import { getSHA256Hash } from '@/lib/fetchers';
import {
    Card,
    CardBody,
    CardFooter,
    CardHeader
} from "@heroui/card";
import { fetchRSVPs, fetchAllEvents, fetchUserEvents, fetchUserRSVPEvents } from '@/lib/fetchers';
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Tooltip } from "@heroui/tooltip";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Input } from '@heroui/input';
import { Divider } from "@heroui/divider";
import { User } from "@heroui/user";
import { parseCalendarEvent, parseRSVPEvent } from '@/lib/fetchers';
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Switch } from "@heroui/switch";
import { formatEventDate, getAvatarUrl } from '@/lib/utils';
const LocationIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" fill="currentColor" />
    </svg>
);
const SearchIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21a9.5 9.5 0 100-19 9.5 9.5 0 000 19zM22 22l-2-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
);

interface CalendarEventListProps {
    isUserView: boolean;
    viewingPubkey?: string;
    loggedInUserPubkey: string;
    publishNostrEvent: any;
}


const CalendarEventList = ({ isUserView, viewingPubkey, loggedInUserPubkey, publishNostrEvent }: CalendarEventListProps) => {
    const [events, setEvents] = useState<any[]>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [rsvps, setRsvps] = useState<any[]>([]);
    const [viewOnlyRsvps, setViewOnlyRsvps] = useState<boolean>(false);
    const [isRsvping, setIsRsvping] = useState(false);
    const [hashtagInput, setHashtagInput] = useState('');
    const [activeHashtags, setActiveHashtags] = useState<string[]>([]);

    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();

    const [isFetchingRsvps, setIsFetchingRsvps] = useState(false);
    const [fetchRsvpsError, setFetchRsvpsError] = useState<string | null>(null);
    const [isRsvpPopoverOpen, setIsRsvpPopoverOpen] = useState(false);


    const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Add hashtag on "Enter" key press
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            const newHashtag = hashtagInput.trim().toLowerCase();

            // Add to the list if it's not empty and not already included
            if (newHashtag && !activeHashtags.includes(newHashtag)) {
                setActiveHashtags(prev => [...prev, newHashtag]);
            }
            // Clear the input field
            setHashtagInput('');
        }
    };
    const handleRemoveHashtag = (tagToRemove: string) => {
        setActiveHashtags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const onClose = () => {
        originalOnClose();
        setTimeout(() => {
        }, 300);
    };

    const handleRsvpSubmit = async (status: 'accepted' | 'declined' | 'tentative') => {
        if (!selectedEvent) {
            return;
        }

        setIsRsvping(true);

        try {
            const tags = [];

            // 'a' tag (required): Coordinates to the calendar event.
            // Format: "<kind>:<pubkey>:<d-identifier>"
            const eventCoordinates = `${selectedEvent.kind}:${selectedEvent.pubkey}:${selectedEvent.d}`;
            tags.push(['a', eventCoordinates]);
            tags.push(['e', selectedEvent.id]);
            tags.push(['p', selectedEvent.pubkey]);
            tags.push(['d', Math.random().toString(36).substring(2, 10)]);
            tags.push(['status', status]);
            const rsvpEventObject = {
                pubkey: loggedInUserPubkey,
                created_at: Math.floor(Date.now() / 1000),
                kind: 31925,
                content: '', // content is optional for RSVPs, so leaving empty
                tags: tags,
            };
            const finalRsvpEvent = {
                id: await getSHA256Hash(JSON.stringify(rsvpEventObject)),
                ...rsvpEventObject
            };
            await publishNostrEvent(finalRsvpEvent);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            console.error("Failed to publish RSVP event:", err);
        } finally {
            setIsRsvping(false);
        }
    };

    useEffect(() => {
        const loadRSVPEvents = async () => {
            setIsFetchingRsvps(true);
            if (selectedEvent) {
                const callback = (rawEvents: any) => {
                    const parsed = rawEvents.map(parseRSVPEvent);
                    setRsvps(parsed);
                }
                try {
                    await fetchRSVPs(selectedEvent?.id, callback)
                } catch (err) {
                    setFetchRsvpsError("Could not retrieve RSVPs for this event.");
                }
            }
            setIsFetchingRsvps(false);
        }
        loadRSVPEvents();
    }, [selectedEvent]);

    useEffect(() => {
        const loadAndParseEvents = async () => {
            try {
                setLoading(true);
                const callback = (rawEvents: any) => {
                    const parsed = rawEvents.map(parseCalendarEvent);
                    setEvents(parsed);
                };

                if (isUserView && viewingPubkey) {
                    if (!viewOnlyRsvps) {
                        await fetchUserEvents(viewingPubkey, callback, activeHashtags);
                    } else {
                        await fetchUserRSVPEvents(viewingPubkey, callback, activeHashtags);
                    }
                } else {
                    await fetchAllEvents(setEvents, activeHashtags);
                }
            } catch (err) {
                console.error("Failed during event fetch or processing:", err);
                setError("Could not retrieve or process events from relays.");
            } finally {
                setLoading(false);
            }
        };
        loadAndParseEvents();
    }, [isUserView, viewingPubkey, viewOnlyRsvps, activeHashtags]);

    const handleCardPress = (event: any) => {
        setSelectedEvent(event);
        onOpen();
    };

    const TitleComponent = () => {
        return (
            isUserView ?
                <div className='flex justify-between mb-6 w-full'>
                    <h2 className="text-4xl font-bold text-foreground">{viewOnlyRsvps ? "My Created RSVPs" : "My Created Events"}</h2>
                    <Switch isSelected={viewOnlyRsvps} onValueChange={setViewOnlyRsvps} />
                </div> : <h2 className='text-4xl font-bold mb-6 w-full text-foreground'>Upcoming Events</h2>
        )
    }

    if (loading && activeHashtags.length === 0) {
        return (
            <div className="flex flex-col mb-6 p-4 items-center min-h-screen">
                <TitleComponent />
                <Spinner label="Contacting Nostr Relays..." color="primary" labelColor="primary" size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-danger-500 text-lg">{error}</p>
            </div>
        );
    }

    const getStatusChipColor = (status: string): "success" | "warning" | "danger" | "default" => {
        switch (status) {
            case 'accepted': return 'success';
            case 'tentative': return 'warning';
            case 'declined': return 'danger';
            default: return 'default';
        }
    }

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <TitleComponent />
            <div className="mb-8 w-full max-w-xl mx-auto flex flex-col gap-4">
                <Input
                    placeholder="Type a hashtag and press Enter..."
                    value={hashtagInput}
                    onValueChange={setHashtagInput}
                    onKeyDown={handleAddHashtag}
                    aria-label="Hashtag search input"
                />
                {activeHashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-default-500 self-center">Filtering by:</span>
                        {activeHashtags.map(tag => (
                            <Chip
                                key={tag}
                                onClose={() => handleRemoveHashtag(tag)}
                                variant="flat"
                                color="primary"
                            >
                                #{tag}
                            </Chip>
                        ))}
                    </div>
                )}
            </div>

            {loading && (
                <div className="flex justify-center my-4">
                    <Spinner label="Searching..." size="sm" color="primary" />
                </div>
            )}
            {!loading && events && events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {events.map((event) => (
                        <Card shadow="lg" key={event.id} isHoverable isPressable onPress={() => handleCardPress(event)} className="w-full">
                            <CardHeader className="p-0">
                                <Image
                                    isZoomed
                                    removeWrapper
                                    alt={`Image for ${event.title}`}
                                    className="z-0 w-full h-[200px] object-cover"
                                    src={event.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                                />
                            </CardHeader>
                            <CardBody className="p-6">
                                <p className="text-primary font-semibold text-sm mb-2">
                                    {formatEventDate(event)}
                                </p>
                                <h3 className="font-bold text-xl text-foreground mb-2 truncate" title={event.title}>
                                    {event.title}
                                </h3>
                                <p className="text-default-600 text-sm line-clamp-3">
                                    {event.summary}
                                </p>
                            </CardBody>
                            <Divider />
                            <CardFooter className="flex-col items-start p-6">
                                {event.location && (
                                    <div className="flex items-center text-sm text-default-500 mb-4">
                                        <LocationIcon className="mr-2" />
                                        <span>{event.location}</span>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {event.hashtags.map((tag: any, index: any) => (
                                        <Chip key={index} color="default" variant="flat" size="sm">
                                            #{tag}
                                        </Chip>
                                    ))}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : !loading && (
                <div className="text-center p-12 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold text-foreground">No Events Found</h2>
                    <p className="text-default-500 mt-2">
                        {activeHashtags.length > 0
                            ? "No events match the selected hashtags. Try removing some filters."
                            : "There are no calendar events on the connected relays. Why not create one?"
                        }
                    </p>
                </div>
            )}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="xl"
                scrollBehavior="inside"
                placement="center">
                <ModalContent>
                    {(close) => (
                        <>
                            {selectedEvent && (
                                <>
                                    <ModalHeader className="flex flex-col gap-1 text-2xl">
                                        <Tooltip content={selectedEvent.title} placement="top-start" delay={0} closeDelay={0}>
                                            <h2 className="text-2xl font-bold truncate pr-6">
                                                {selectedEvent.title}
                                            </h2>
                                        </Tooltip>                                  </ModalHeader>
                                    <ModalBody className='max-h-[75vh] overflow-y-auto'>
                                        <Image
                                            removeWrapper
                                            alt={`Image for ${selectedEvent.title}`}
                                            className="z-0 w-full h-[250px] object-cover rounded-lg flex-shrink-0"
                                            src={selectedEvent.image || 'https://via.placeholder.com/600x300?text=No+Image'}
                                        />
                                        <p className="text-primary font-semibold my-2">
                                            {formatEventDate(selectedEvent)}
                                        </p>
                                        <p className="text-default-700">{selectedEvent.summary}</p>

                                        {selectedEvent.location && (
                                            <div className="flex items-center text-sm text-default-500 mt-4">
                                                <LocationIcon className="mr-2" />
                                                <Tooltip content={selectedEvent.location} placement="top-start" delay={0} closeDelay={0}>
                                                    <span className="truncate">
                                                        {selectedEvent.location}
                                                    </span>
                                                </Tooltip>
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {selectedEvent.hashtags.map((tag: any, index: any) => (
                                                <Chip key={index} color="default" variant="flat" size="sm">#{tag}</Chip>
                                            ))}
                                        </div>
                                        {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                                            <>
                                                <Divider className="my-4" />
                                                <h3 className="text-lg font-semibold text-foreground mb-2">Participants</h3>
                                                <div className="flex flex-col gap-3 max-h-52 overflow-y-auto pr-2">
                                                    {selectedEvent.participants.map((participant: any) => (
                                                        <Tooltip key={participant.pubkey} content={participant.pubkey} placement="top-start" delay={0} closeDelay={0}>
                                                            <User
                                                                name={participant.pubkey.substring(0, 10) + '...'}
                                                                description={participant.role || 'Attendee'} // Use a default role
                                                                avatarProps={{
                                                                    src: getAvatarUrl(participant.pubkey)
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </ModalBody>
                                    <ModalFooter>
                                        {!isRsvping && (
                                            <>
                                                <Button color="default" variant="light" onPress={onClose}>
                                                    Close
                                                </Button>

                                                {selectedEvent.pubkey === loggedInUserPubkey ? (
                                                    <Popover isOpen={isRsvpPopoverOpen} onOpenChange={setIsRsvpPopoverOpen} placement="top-end" showArrow>
                                                        <PopoverTrigger>
                                                            <Button color="primary" variant="flat">
                                                                View RSVPs
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="p-4 w-[340px]">
                                                            <div className="flex flex-col gap-4">
                                                                <h4 className="text-lg font-bold">Attendees</h4>
                                                                {isFetchingRsvps ? (
                                                                    <div className="flex justify-center items-center h-40">
                                                                        <Spinner label="Fetching RSVPs..." />
                                                                    </div>
                                                                ) : fetchRsvpsError ? (
                                                                    <p className="text-danger text-sm">{fetchRsvpsError}</p>
                                                                ) : rsvps.length > 0 ? (
                                                                    <div className="max-h-64 overflow-y-auto pr-2 flex flex-col gap-4">
                                                                        {rsvps.map(rsvp => (
                                                                            <div key={rsvp.id} className="flex justify-between items-center">
                                                                                <Tooltip content={rsvp.pubkey} placement="top-start" delay={0} closeDelay={0}>
                                                                                    <User
                                                                                        name={rsvp.pubkey.substring(0, 10) + '...'}
                                                                                        description={rsvp.content || rsvp.status}
                                                                                        avatarProps={{
                                                                                            src: getAvatarUrl(rsvp.pubkey)
                                                                                        }}
                                                                                    />
                                                                                </Tooltip>
                                                                                <Chip
                                                                                    size="sm"
                                                                                    variant="flat"
                                                                                    color={getStatusChipColor(rsvp.status)}
                                                                                >
                                                                                    {rsvp.status}
                                                                                </Chip>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-default-500 text-sm h-40 flex justify-center items-center">No one has RSVPd yet.</p>
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button color="success" variant="solid" onPress={() => handleRsvpSubmit('accepted')}>Accept</Button>
                                                        <Button color="warning" variant="bordered" onPress={() => handleRsvpSubmit('tentative')}>Tentative</Button>
                                                        <Button color="danger" variant="light" onPress={() => handleRsvpSubmit('declined')}>Decline</Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {isRsvping && <Spinner label="Sending RSVP..." color="primary" />}
                                    </ModalFooter>
                                </>
                            )}
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default CalendarEventList;
