import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { ChatMessage } from '../types';
import { examplePrompts } from '../services/prompts';
import { ChevronUpIcon } from './icons';


/**
 * @file Componente per l'interfaccia dell'Architetto Chat.
 * Gestisce la visualizzazione della conversazione, l'input dell'utente
 * e la personalizzazione del prompt di sistema dell'AI.
 */

// --- SOTTO-COMPONENTI ---

/**
 * Visualizza un singolo messaggio nella chat, formattando il contenuto
 * come Markdown per i messaggi del modello.
 */
const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (message.role === 'model' && contentRef.current) {
            // Converte il testo Markdown in HTML e lo inserisce nell'elemento.
            // DOMPurify sarebbe raccomandato in produzione per sicurezza.
            contentRef.current.innerHTML = marked.parse(message.content) as string;
        }
    }, [message.content, message.role]);

    const isUser = message.role === 'user';
    const bgColor = isUser ? 'bg-teal-500/20' : 'bg-gray-700/50';
    const align = isUser ? 'items-end' : 'items-start';
    const textColor = isUser ? 'text-teal-200' : 'text-gray-200';

    return (
        <div className={`flex flex-col ${align} w-full`}>
            <div className={`max-w-3xl w-auto p-4 rounded-lg ${bgColor} ${textColor}`}>
                {message.role === 'model' ? (
                    <div ref={contentRef} className="prose prose-invert prose-sm max-w-none"></div>
                ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                )}
            </div>
        </div>
    );
};

/**
 * Sezione a scomparsa per modificare il prompt di sistema dell'Architetto.
 */
const SystemPromptEditor: React.FC<{
    prompt: string;
    onPromptChange: (newPrompt: string) => void;
}> = ({ prompt, onPromptChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="w-full bg-gray-800 border border-gray-700 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <h3 className="font-semibold text-gray-200">Personalizza Prompt di Sistema dell'Architetto</h3>
                <div className={`transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}>
                    <ChevronUpIcon />
                </div>
            </button>
            {isOpen && (
                <div className="p-4 pt-0">
                    <p className="text-xs text-gray-400 mb-2">
                        Questo prompt definisce la "personalità" e le istruzioni per l'Architetto AI. Modificalo per adattarlo alle tue esigenze.
                    </p>
                    <textarea
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        className="w-full h-48 bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm font-mono focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>
            )}
        </div>
    );
};

/**
 * Un editor per inserire una chiave API di Gemini, condiviso con altre viste.
 */
const ApiKeyEditor: React.FC<{ value: string; onChange: (v: string) => void; }> = ({ value, onChange }) => (
    <div className="w-full space-y-2 p-4 bg-gray-900/50 rounded-lg border border-yellow-500/50">
        <label htmlFor="api-key-input-chat" className="font-semibold text-yellow-300 block">Chiave API Gemini</label>
        <p className="text-xs text-gray-400">
            È necessaria una chiave API per comunicare con Gemini. La chiave viene salvata solo nel tuo browser.
        </p>
        <input
            id="api-key-input-chat"
            type="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Inserisci la tua chiave API Gemini qui..."
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm font-mono focus:ring-yellow-500 focus:border-yellow-500"
        />
    </div>
);

// --- COMPONENTE PRINCIPALE ---

interface ChatArchitectViewProps {
    chatHistory: ChatMessage[];
    isProcessing: boolean;
    onSendMessage: (message: string) => void;
    onUseProject: () => void;
    systemPrompt: string;
    onSystemPromptChange: (newPrompt: string) => void;
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    error: string | null;
    clearError: () => void;
}

export const ChatArchitectView: React.FC<ChatArchitectViewProps> = ({
    chatHistory, isProcessing, onSendMessage, onUseProject, systemPrompt, onSystemPromptChange, apiKey, onApiKeyChange, error, clearError
}) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Scrolla automaticamente alla fine della chat quando arrivano nuovi messaggi.
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentMessage.trim() && !isProcessing) {
            onSendMessage(currentMessage);
            setCurrentMessage('');
        }
    };
    
    // Inserisce il contenuto di un prompt di esempio nell'area di input.
    const handleExampleClick = (content: string) => {
        setCurrentMessage(prev => prev ? `${prev}\n${content}` : content);
    };

    const isReadyToUseProject = chatHistory.some(m => m.role === 'model' && m.content.includes('###'));

    return (
        <div className="w-full flex flex-col items-center space-y-6">
            
            <div className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-lg space-y-4">
                 <ApiKeyEditor value={apiKey} onChange={onApiKeyChange} />
                 {error && (
                    <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
                        <p className="font-bold">Errore:</p>
                        <p>{error}</p>
                        <button onClick={clearError} className="mt-2 text-xs font-semibold hover:underline">Chiudi</button>
                    </div>
                )}
            </div>

            {/* Visualizzazione della Chat */}
            <div ref={chatContainerRef} className="w-full h-[50vh] bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4 overflow-y-auto flex flex-col">
                {chatHistory.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                {isProcessing && chatHistory[chatHistory.length-1]?.role === 'user' && (
                     <div className="flex flex-col items-start w-full">
                        <div className="max-w-3xl w-auto p-4 rounded-lg bg-gray-700/50 text-gray-200">
                           <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                           </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Utente */}
            <form onSubmit={handleSendMessage} className="w-full flex gap-4 items-start">
                <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            handleSendMessage(e);
                        }
                    }}
                    placeholder={isProcessing ? "L'architetto sta pensando..." : "Scrivi il tuo messaggio o usa un esempio..."}
                    disabled={isProcessing}
                    className="flex-grow bg-gray-800 border-2 border-gray-600 rounded-lg p-3 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-200 placeholder-gray-500"
                    rows={3}
                />
                <button
                    type="submit"
                    disabled={!currentMessage.trim() || isProcessing}
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Invia
                </button>
            </form>
            
            {/* Sezione Esempi e Pulsante di Utilizzo */}
            <div className="w-full flex justify-between items-center gap-4 flex-wrap">
                 <div className="flex gap-2">
                    <span className="text-sm font-semibold text-gray-400">Esempi:</span>
                    {examplePrompts.slice(0, 2).map((p, i) => (
                        <button key={i} onClick={() => handleExampleClick(p.content)} className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                           {p.title}
                        </button>
                    ))}
                 </div>
                 <button 
                    onClick={onUseProject}
                    disabled={!isReadyToUseProject || isProcessing}
                    className="px-5 py-2.5 bg-gray-700 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors transform hover:scale-105 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                    title={!isReadyToUseProject ? "Disponibile dopo che l'AI ha generato una struttura di file (con '### `path/file`')." : "Passa alla vista editor con questo progetto."}
                 >
                    Usa Questa Struttura di Progetto &rarr;
                 </button>
            </div>

            {/* Editor del Prompt di Sistema */}
            <SystemPromptEditor prompt={systemPrompt} onPromptChange={onSystemPromptChange} />
        </div>
    );
};