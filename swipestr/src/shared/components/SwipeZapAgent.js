import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import SWhandler from "smart-widget-handler";
import { SimplePool } from "nostr-tools";
export default function SwipeZapAgent() {
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [userMetadata, setUserMetadata] = useState(null);
    const [errMsg, setErrMsg] = useState("This app needs a supported NOSTR client");
    const [zapAmount, setZapAmount] = useState(1000); // Default zap amount
    const [posts, setPosts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [swiping, setSwiping] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [swipeAction, setSwipeAction] = useState(null);
    const [profiles, setProfiles] = useState({});
    const [notification, setNotification] = useState(null);
    const touchStartX = React.useRef(null);
    const touchEndX = React.useRef(null);
    useEffect(() => {
        SWhandler.client.ready();
        const listener = SWhandler.client.listen((event) => {
            if (event.kind === "user-metadata") {
                setUserMetadata(event.data?.user);
                setIsUserLoading(false);
            }
            if (event.kind === "err-msg") {
                setErrMsg(event.data);
                setIsUserLoading(false);
            }
            if (event.kind === "nostr-event") {
                SWhandler.client.sendContext(event.data, event.data?.host_origin);
            }
        });
        let timer = setTimeout(() => {
            setIsUserLoading(false);
            clearTimeout(timer);
        }, 3000);
        return () => {
            listener?.close();
            clearTimeout(timer);
        };
    }, []);
    useEffect(() => {
        // Fetch posts from relays (kind 1 events)
        async function fetchPosts() {
            setLoadingPosts(true);
            try {
                const pool = new SimplePool();
                const relays = [
                    'wss://nos.lol',
                    'wss://relay.nostr.band',
                    'wss://relay.damus.io',
                    'wss://nostr.mom',
                    'wss://no.str.cr',
                ];
                const eventsMap = new Map();
                let eoseCount = 0;
                const expectedEose = relays.length;
                await new Promise((resolve) => {
                    pool.subscribe(relays, { kinds: [1], limit: 100 }, {
                        onevent(ev) {
                            if (ev && ev.id)
                                eventsMap.set(ev.id, ev);
                        },
                        oneose() {
                            eoseCount++;
                            if (eoseCount >= expectedEose)
                                resolve();
                        }
                    });
                    setTimeout(resolve, 3000);
                });
                const uniqueEvents = Array.from(eventsMap.values());
                setPosts(uniqueEvents);
                // Fetch profiles for all unique pubkeys
                const pubkeys = Array.from(new Set(uniqueEvents.map(ev => ev.pubkey)));
                const profileMap = {};
                await Promise.all(pubkeys.map(async (pk) => {
                    for (const relay of relays) {
                        const ev = await pool.get([relay], { kinds: [0], authors: [pk], limit: 1 });
                        if (ev) {
                            try {
                                const content = JSON.parse(ev.content);
                                profileMap[pk] = {
                                    name: content.display_name || content.name || pk.slice(0, 12) + '...',
                                    picture: content.picture || '',
                                };
                            }
                            catch {
                                profileMap[pk] = { name: pk.slice(0, 12) + '...', picture: '' };
                            }
                            break;
                        }
                    }
                    if (!profileMap[pk])
                        profileMap[pk] = { name: pk.slice(0, 12) + '...', picture: '' };
                }));
                setProfiles(profileMap);
            }
            catch {
                setPosts([]);
                setProfiles({});
            }
            setLoadingPosts(false);
        }
        fetchPosts();
    }, []);
    // Swipe handlers
    const handleTouchStart = (e) => {
        setSwiping(true);
        touchStartX.current = e.touches[0].clientX;
        setSwipeOffset(0);
        setSwipeAction(null);
    };
    const handleTouchMove = (e) => {
        if (!swiping)
            return;
        touchEndX.current = e.touches[0].clientX;
        setSwipeOffset((touchEndX.current ?? 0) - (touchStartX.current ?? 0));
        setSwipeAction((touchEndX.current ?? 0) - (touchStartX.current ?? 0) > 0 ? 'zap' : 'pass');
    };
    const handleTouchEnd = () => {
        if (!swiping)
            return;
        const diff = (touchEndX.current ?? 0) - (touchStartX.current ?? 0);
        if (diff > 80) {
            handleSwipeToZap();
            setCurrentIndex((prev) => Math.min(posts.length - 1, prev + 1));
        }
        else if (diff < -80) {
            setCurrentIndex((prev) => Math.min(posts.length - 1, prev + 1));
        }
        setSwiping(false);
        setSwipeOffset(0);
        setSwipeAction(null);
        touchStartX.current = null;
        touchEndX.current = null;
    };
    const handleSwipeToZap = () => {
        setNotification(null);
        // Build zap event (kind 9735)
        const zapEvent = {
            kind: 9735,
            content: `Zap via swipe!`,
            tags: [
                ["p", userMetadata?.pubkey],
                ["amount", zapAmount.toString()],
                // Add more tags as needed
            ],
        };
        SWhandler.client.requestEventPublish(zapEvent, userMetadata?.host_origin);
        // Listen for zap result (success/failure)
        const zapTimeout = setTimeout(() => {
            setNotification({ type: 'error', message: 'Zap failed or timed out.' });
        }, 8000);
        const zapListener = SWhandler.client.listen((event) => {
            if (event.kind === "nostr-event") {
                clearTimeout(zapTimeout);
                setNotification({ type: 'success', message: 'Zap sent successfully!' });
                SWhandler.client.sendContext(event.data, event.data?.host_origin);
                zapListener.close();
            }
            if (event.kind === "err-msg") {
                clearTimeout(zapTimeout);
                setNotification({ type: 'error', message: event.data || 'Zap failed.' });
                zapListener.close();
            }
        });
    };
    // Helper: extract URLs from a string
    const extractUrls = (text) => {
        if (!text)
            return [];
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.match(urlRegex) || [];
    };
    // Helper: check if URL is image or video
    const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
    const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
    if (isUserLoading) {
        return (_jsx("div", { className: "fit-container fx-centered fx-col box-pad-h box-pad-v", style: { height: "500px" } }));
    }
    if (!userMetadata) {
        return (_jsxs("div", { className: "fit-container fx-centered fx-col box-pad-h box-pad-v", style: { height: "500px" }, children: [_jsx("div", { className: "round-icon", children: _jsx("div", { className: "plus-sign-24", style: { rotate: "45deg" } }) }), _jsx("h4", { className: "p-centered", children: errMsg })] }));
    }
    if (loadingPosts) {
        return (_jsx("div", { className: "fit-container fx-centered fx-col box-pad-h box-pad-v", style: { height: "500px" }, children: _jsx("div", { style: { fontWeight: 600, fontSize: '1.2em', marginBottom: 12 }, children: "Loading Swipes..." }) }));
    }
    if (!posts.length) {
        return (_jsx("div", { className: "fit-container fx-centered fx-col box-pad-h box-pad-v", style: { height: "500px" }, children: _jsx("h4", { children: "No posts found." }) }));
    }
    const post = posts[currentIndex];
    let postContent = post?.content || "";
    // Always get the profile for the current post's pubkey
    const profile = profiles[post.pubkey] || { name: post.pubkey?.slice(0, 12) + '...', picture: '' };
    const urls = extractUrls(postContent);
    const mediaUrl = urls.find(url => isImage(url) || isVideo(url)) || null;
    return (_jsxs("div", { className: "swipezap-bg", style: {
            minHeight: '100vh',
            width: '100vw',
            background: 'linear-gradient(120deg, #181c2f 0%, #b8c1ec 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            overflow: 'hidden',
            boxSizing: 'border-box',
            padding: 0,
            margin: 0,
            maxWidth: '100vw',
            maxHeight: '100vh',
        }, children: [_jsxs("div", { className: "post-card lux-card", style: {
                    marginBottom: 32,
                    padding: 24,
                    border: swipeAction === 'zap' ? '2.5px solid #05ce78' : swipeAction === 'pass' ? '2.5px solid #b8c1ec' : '2px solid #eaeaea',
                    borderRadius: 24,
                    minWidth: 0,
                    width: '100%',
                    background: 'linear-gradient(120deg, #fff 80%, #eaeaea 100%)',
                    boxShadow: swiping ? '0 8px 32px #05ce7833, 0 1.5px 0 #c110d1' : '0 4px 32px #b8c1ec33',
                    transform: `translateX(${swipeOffset}px) rotate(${swipeOffset / 18}deg)`,
                    transition: swiping ? 'none' : 'transform 0.25s cubic-bezier(.4,2,.6,1)',
                    wordBreak: 'break-word',
                    position: 'relative',
                    userSelect: 'none',
                    touchAction: 'pan-y',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    boxSizing: 'border-box',
                }, onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', marginBottom: 18, width: '100%' }, children: [profile.picture ? (_jsx("img", { src: profile.picture, alt: profile.name, style: { width: 54, height: 54, borderRadius: 18, objectFit: 'cover', marginRight: 18, border: '2.5px solid #b8c1ec', boxShadow: '0 2px 12px #b8c1ec33' } })) : (_jsx("div", { style: { width: 54, height: 54, borderRadius: 18, background: '#eaeaea', marginRight: 18 } })), _jsx("span", { style: { fontWeight: 700, color: '#232946', fontSize: '1.25em', letterSpacing: 0.2 }, children: profile.name })] }), mediaUrl && isImage(mediaUrl) && (_jsx("img", { src: mediaUrl, alt: "media", style: { width: '100%', borderRadius: 14, marginBottom: 16, boxShadow: '0 2px 12px #b8c1ec22' } })), mediaUrl && isVideo(mediaUrl) && (_jsx("video", { src: mediaUrl, controls: true, style: { width: '100%', borderRadius: 14, marginBottom: 16, boxShadow: '0 2px 12px #b8c1ec22' } })), urls.length > 0 && !isImage(urls[0]) && !isVideo(urls[0]) && (_jsx("a", { href: urls[0], target: "_blank", rel: "noopener noreferrer", style: {
                            display: 'block',
                            background: '#f7f7fa',
                            borderRadius: 10,
                            padding: '0.7em 1.2em',
                            marginBottom: 14,
                            color: '#232946',
                            fontWeight: 600,
                            textDecoration: 'none',
                            boxShadow: '0 2px 8px #b8c1ec11',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                        }, children: urls[0] })), _jsx("div", { style: { whiteSpace: 'pre-line', fontSize: '1.18em', color: '#232946', marginBottom: 8, lineHeight: 1.6, fontWeight: 500 }, children: postContent.replace(mediaUrl || '', '').replace(urls[0] || '', '').replace(/\s{2,}/g, ' ').trim() }), _jsxs("div", { style: { position: 'absolute', top: 18, right: 24, fontWeight: 900, fontSize: '1.5em', color: swipeAction === 'zap' ? '#05ce78' : swipeAction === 'pass' ? '#b8c1ec' : '#eaeaea', textShadow: '0 2px 12px #b8c1ec33' }, children: [swipeAction === 'zap' && '⚡', swipeAction === 'pass' && '⏪'] })] }, post.id), _jsxs("div", { style: { display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 320 }, children: [_jsx("button", { className: "btn lux-btn", style: { background: '#b8c1ec', color: '#232946', fontWeight: 700, fontSize: '1.1em', borderRadius: 12, padding: '0.7em 2.2em', boxShadow: '0 2px 12px #b8c1ec33', border: 'none', transition: 'background 0.2s' }, onClick: () => setCurrentIndex((prev) => Math.min(posts.length - 1, prev + 1)), children: "Pass" }), _jsx("button", { className: "btn lux-btn", style: { background: '#05ce78', color: '#fff', fontWeight: 800, fontSize: '1.1em', borderRadius: 12, padding: '0.7em 2.2em', boxShadow: '0 2px 12px #05ce7833', border: 'none', transition: 'background 0.2s' }, onClick: () => { handleSwipeToZap(); setCurrentIndex((prev) => Math.min(posts.length - 1, prev + 1)); }, children: "Swipe" })] }), _jsxs("div", { className: "fit-container fx-centered fx-col box-pad-v lux-zapbox", style: { width: '100%', maxWidth: 320, background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #b8c1ec22', padding: '1.2em 1em', margin: '0 auto 24px auto', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: [_jsx("label", { style: { fontWeight: 600, color: '#232946', marginBottom: 8, fontSize: '1.08em', alignSelf: 'flex-start' }, children: "Zap amount (sats)" }), _jsx("input", { type: "number", className: "if ifs-full lux-input", placeholder: "Amount (sats)", value: zapAmount, min: 1, onChange: e => setZapAmount(parseInt(e.target.value) || 1), style: { marginBottom: 0, fontSize: '1.1em', borderRadius: 10, border: '1.5px solid #b8c1ec', padding: '0.7em 1.2em', background: '#f7f7fa', color: '#232946', fontWeight: 600, outline: 'none', boxShadow: '0 2px 8px #b8c1ec11', width: '100%' } })] }), _jsxs("footer", { style: { marginTop: 'auto', color: '#b8c1ec', fontWeight: 600, fontSize: '1em', letterSpacing: 0.2, opacity: 0.8, paddingBottom: 24, width: '100%', textAlign: 'center', boxSizing: 'border-box' }, children: ["Powered by Swipestr \u2022 ", new Date().getFullYear(), notification && (_jsx("div", { style: {
                            margin: '24px auto 0 auto',
                            background: notification.type === 'success' ? '#05ce78' : '#ff4d4f',
                            color: '#fff',
                            padding: '1em 2em',
                            borderRadius: 12,
                            fontWeight: 700,
                            fontSize: '1.1em',
                            boxShadow: '0 2px 16px #23294633',
                            letterSpacing: 0.2,
                            minWidth: 220,
                            maxWidth: 320,
                            textAlign: 'center',
                            transition: 'opacity 0.3s',
                            opacity: notification ? 1 : 0,
                            position: 'static',
                            display: 'block',
                        }, children: notification.message }))] })] }));
}
