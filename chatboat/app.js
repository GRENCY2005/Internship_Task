const { useState, useEffect, useRef } = React;

function formatTimestamp(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ChatApp() {
    const [username, setUsername] = useState('');
    const [joined, setJoined] = useState(false);
    const [messages, setMessages] = useState(() => {
        const stored = localStorage.getItem('chatMessages');
        return stored ? JSON.parse(stored) : [];
    });
    const [input, setInput] = useState('');
    const [wsStatus, setWsStatus] = useState('Connecting...');
    const wsRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!joined) return;
        const ws = new WebSocket('wss://ws.ifelse.io');
        ws.onopen = () => setWsStatus('Connected');
        ws.onclose = () => setWsStatus('Disconnected');
        ws.onerror = () => setWsStatus('Connection error');
        ws.onmessage = (event) => {
            const newMessage = {
                id: Date.now() + Math.random(),
                text: event.data,
                timestamp: new Date().toISOString(),
                direction: 'received'
            };
            setMessages(prev => {
                const updated = [...prev, newMessage];
                localStorage.setItem('chatMessages', JSON.stringify(updated));
                return updated;
            });
        };
        wsRef.current = ws;
        return () => ws.close();
    }, [joined]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleJoin = (e) => {
        e.preventDefault();
        if (username.trim()) setJoined(true);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const fullText = `${username}: ${input.trim()}`;
        const message = {
            id: Date.now() + Math.random(),
            text: fullText,
            timestamp: new Date().toISOString(),
            direction: 'sent'
        };
        wsRef.current.send(fullText);
        setMessages(prev => {
            const updated = [...prev, message];
            localStorage.setItem('chatMessages', JSON.stringify(updated));
            return updated;
        });
        setInput('');
    };

    if (!joined) {
        return React.createElement('div', {
            style: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: '2rem' }
        },
            React.createElement('h2', null, 'Join Chat'),
            React.createElement('form', { onSubmit: handleJoin, style: { display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' } },
                React.createElement('input', {
                    type: 'text',
                    value: username,
                    onChange: e => setUsername(e.target.value),
                    placeholder: 'Enter your name',
                    required: true,
                    style: { padding: '0.6rem', fontSize: '1rem' }
                }),
                React.createElement('button', {
                    type: 'submit',
                    style: { padding: '0.6rem', fontSize: '1rem', backgroundColor: 'orange', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
                }, 'Join Chat')
            )
        );
    }

    return (
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
            React.createElement('header', null, `Chatting as ${username}`),
            React.createElement('main', {
                className: 'message-list',
                id: 'message-list',
                role: 'log',
                'aria-live': 'polite',
                'aria-relevant': 'additions'
            },
                messages.map(msg =>
                    React.createElement('div', {
                        key: msg.id,
                        className: 'message ' + (msg.direction === 'sent' ? 'sent' : 'received'),
                        tabIndex: 0,
                        'aria-label': `${msg.text}`
                    },
                        msg.text,
                        React.createElement('div', { className: 'timestamp' }, formatTimestamp(new Date(msg.timestamp)))
                    )
                ),
                React.createElement('div', { ref: messagesEndRef })
            ),
            React.createElement('form', { onSubmit: sendMessage, 'aria-label': 'Send message form' },
                React.createElement('input', {
                    type: 'text',
                    value: input,
                    onChange: e => setInput(e.target.value),
                    placeholder: 'Type your message...',
                    'aria-label': 'Message input',
                    autoComplete: 'off',
                    required: true
                }),
                React.createElement('button', {
                    type: 'submit',
                    disabled: wsStatus !== 'Connected',
                    'aria-label': 'Send message button'
                }, '➤')
            ),
            React.createElement('div', { className: 'status', 'aria-live': 'polite' }, `Status: ${wsStatus}`)
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(ChatApp));
