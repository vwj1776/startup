import React, { useState } from 'react';

export default function Chatbot() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const askQuestion = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/chat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });

            const data = await res.json();
            setAnswer(data.answer);
        } catch (err) {
            console.error('❌ Error asking question:', err);
            setAnswer('Error getting answer. Try again.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow">
            <h1 className="text-xl font-bold mb-4">Ask about Air Force Dress & Appearance (DAFI 36-2903)</h1>

            <textarea
                rows={4}
                className="w-full border rounded p-2 mb-2"
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />

            <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={askQuestion}
                disabled={loading || !question.trim()}
            >
                {loading ? 'Thinking...' : 'Ask'}
            </button>

            {answer && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h2 className="font-semibold">Answer:</h2>
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
}
