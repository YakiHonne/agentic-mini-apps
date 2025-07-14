'use client';
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { fetchEventsForCalendar, parseCalendarEvent } from '@/lib/fetchers';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@heroui/modal";
import { convertToMilitaryTime } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";

import styles from './Calendar.module.css';

interface NormalizedEvent {
    id: string;
    title: string;
    summary: string;
    startTime: string | null;
    endTime: string | null;
    startDate: Date;
    endDate: Date | null;
    kind: number;
}

interface InteractiveCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    calendar: any | null;
}

const InteractiveCalendarModal = ({ isOpen, onClose, calendar }: InteractiveCalendarModalProps) => {
    const [events, setEvents] = useState<NormalizedEvent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
    const [selectedDateEvents, setSelectedDateEvents] = useState<NormalizedEvent[]>([]);


    //writing a separate normalizer to conform to react-calendar, the utils function is more for data display
    const normalizeEvent = (rawEvent: any): NormalizedEvent => {
        const parsed = parseCalendarEvent(rawEvent);
        let startDate: Date;
        let endDate: Date | null = null;
        let startTime: string | null = null;
        let endTime: string | null = null;

        if (!parsed.start) {
            //this shouldnt exist at all.
            startDate = new Date();
            startTime = null;
        }
        else {
            if (parsed.kind === 31923) {
                startDate = new Date(parseInt(parsed.start, 10) * 1000);
                startTime = convertToMilitaryTime(startDate.getTime());
            }
            else {
                startDate = new Date(parsed.start + 'T00:00:00');
                startTime = convertToMilitaryTime(startDate.getTime());
            }
        }
        if (!parsed.end) {
            endDate = null;
            endTime = null;
        }
        else {
            if (parsed.kind === 31923) {
                endDate = new Date(parseInt(parsed.end, 10) * 1000);
                endTime = convertToMilitaryTime(endDate.getTime());
            }
            else {
                endDate = new Date(parsed.end + 'T00:00:00');
                endTime = convertToMilitaryTime(endDate.getTime());
            }
        }

        return {
            id: parsed.id,
            title: parsed.title,
            summary: parsed.summary,
            startTime: startTime,
            endTime: endTime,
            startDate: startDate,
            endDate: endDate,
            kind: parsed.kind,
        };
    };

    useEffect(() => {
        if (!calendar || !isOpen) {
            setEvents([]);
            return;
        }

        const loadEventsForCalendar = async () => {
            setIsLoading(true);
            setError(null);
            try {
                await fetchEventsForCalendar(calendar, (rawEvents) => {
                    const normalized = rawEvents.map(normalizeEvent);
                    setEvents(normalized);
                });
            } catch (err) {
                console.error("Failed to load events for calendar", err);
                setError("Could not load the events for this calendar.");
            } finally {
                setIsLoading(false);
            }
        };

        loadEventsForCalendar();
    }, [calendar, isOpen]);

    //helper to check if a specific date has any events
    const hasEvents = (date: Date): boolean => {
        return events.some(event =>
            event.startDate.getFullYear() === date.getFullYear() &&
            event.startDate.getMonth() === date.getMonth() &&
            event.startDate.getDate() === date.getDate()
        );
    };

    const handleDayClick = (clickedDate: Date, domEvent: React.MouseEvent<HTMLButtonElement>) => {
        const eventsOnDay = events.filter(event =>
            event.startDate.getFullYear() === clickedDate.getFullYear() &&
            event.startDate.getMonth() === clickedDate.getMonth() &&
            event.startDate.getDate() === clickedDate.getDate()
        );

        if (eventsOnDay.length > 0) {
            setSelectedDateEvents(eventsOnDay);
            setPopoverAnchor(domEvent.currentTarget);
            setIsPopoverOpen(true);
        } else {
            setIsPopoverOpen(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="2xl" placement='center' scrollBehavior="inside">
                <ModalContent>
                    {(close) => (
                        <>
                            <ModalHeader className="text-2xl font-bold">
                                {calendar?.title || 'Calendar Details'}
                            </ModalHeader>
                            <ModalBody>
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-96">
                                        <Spinner label="Loading Events..." />
                                    </div>
                                ) : error ? (
                                    <p className="text-danger text-center h-96 flex items-center justify-center">{error}</p>
                                ) : (
                                    <Calendar
                                        className={styles.calendarContainer}
                                        tileClassName={({ date, view }) =>
                                            view === 'month' && hasEvents(date) ? styles.hasEvent : ''
                                        }
                                        onClickDay={handleDayClick}
                                        tileContent={({ date, view }) =>
                                            view === 'month' && hasEvents(date) ? (
                                                <div className={styles.eventDot}></div>
                                            ) : null
                                        }
                                    />
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" variant="light" onPress={close}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Popover
                isOpen={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
                showArrow
                placement="bottom"
                offset={10}
                triggerRef={{ current: popoverAnchor }}
            >
                <PopoverTrigger>
                    <div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="p-4 w-full max-w-screen">
                    <div className="flex flex-col">
                        <h4 className="p-4 text-lg font-bold text-foreground border-b border-default-200">
                            Events on {selectedDateEvents[0]?.startDate.toLocaleDateString()}
                        </h4>
                        <div className="flex flex-col gap-2">
                            {selectedDateEvents.map(event => (
                                <div key={event.id} className="p-2 bg-content2 rounded-lg  max-h-[300px] overflow-y-auto pr-2">
                                    <Chip size="sm" color="default" variant="bordered"className="h-auto whitespace-normal">
                                        {event.title}-{event.endDate ? event.endDate.toLocaleDateString() : 'N/A'}
                                        <span className="text-xs text-default-500 ml-2">
                                            {event.startTime ? `${event.startTime}` : 'No start time'} - 
                                            {event.endTime ? `${event.endTime}` : ''}
                                        </span>
                                    </Chip>
                                </div>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
};

export default InteractiveCalendarModal;
