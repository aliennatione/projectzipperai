import React, { useState, useCallback } from 'react';
import { Chat, GoogleGenAI } from '@google/genai';
import { ParsedFile, ChatMessage, WorkflowStep, PipelineData } from './types';
import { processInputFiles, parseWithRegex, findAdditionalFiles, extractDocumentationNotes } from './services/projectParser';
import { generateReadme } from './services/documentationService';
import { refactorCode } from './services/codeRefactorService';
import { codeRefactoringPrompt, architectSystemPrompt } from './services/prompts';
import { InputView } from './components/InputView';
import { EditorView } from './components/EditorView';
import { ChatArchitectView } from './components/ChatArchitectView';
import { getAiClient } from './services/geminiService';
import { INITIAL_CHAT_HISTORY, INITIAL_WORKFLOW_STEPS, GEMINI_FLASH_MODEL } from './constants';

/**
 * @file Componente radice dell'applicazione ProjectZipperAI.
 * Gestisce lo stato globale, orchestra il flusso di dati tra i servizi e
 * renderizza le viste principali ('architect', 'main'). Funge da controllore
 * centrale per la chat, il workflow e l'editor.
 */

/** Definisce le viste principali dell'applicazione. */
type AppView = 'architect' | 'main';

/**
 * Componente principale dell'applicazione.
 */
const App: React.FC = () => {
    // --- STATI GLOBALI ---

    /** Stato per la vista corrente ('architect' o 'main'). L'app parte dalla vista principale. */
    const [currentView, setCurrentView] = useState<AppView>('main');
    /** Messaggio visualizzato durante le operazioni di elaborazione lunghe. */
    const [processingMessage, setProcessingMessage] = useState<string | null>(null);
    /** Messaggio di errore globale visualizzato all'utente. */
    const [error, setError] = useState<string | null>(null);
    /** Chiave API fornita dall'utente per sovrascrivere quella predefinita. */
    const [apiKeyOverride, setApiKeyOverride] = useState('');

    // --- STATI PER LA VISTA CHAT ARCHITECT ---
    
    /** Cronologia dei messaggi della chat con l'Architetto AI. */
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(INITIAL_CHAT_HISTORY);
    /** Flag che indica se l'Architetto AI sta attualmente generando una risposta. */
    const [isArchitectProcessing, setIsArchitectProcessing] = useState(false);
    /** Il prompt di sistema, modificabile dall'utente, che guida il comportamento dell'Architetto. */
    const [editableArchitectPrompt, setEditableArchitectPrompt] = useState(architectSystemPrompt);
    /** Istanza della sessione di chat con l'API Gemini. */
    const [chatInstance, setChatInstance] = useState<Chat | null>(null);
    
    // --- STATI PER LA VISTA PRINCIPALE (INPUT/EDITOR) ---
    
    /** Contenuto testuale dell'area di input principale. */
    const [projectInputText, setProjectInputText] = useState('');
    /** Elenco dei file del progetto generati dopo l'analisi. */
    const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
    /** Percorso del file attualmente selezionato nell'editor. */
    const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
    /** Fase corrente del processo nella vista principale ('input', 'processing', 'editor'). */
    const [appStep, setAppStep] = useState<'input' | 'processing' | 'editor'>('input');
    /** Elenco dei passaggi configurabili per il workflow di generazione del progetto. */
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(INITIAL_WORKFLOW_STEPS);
    /** Il prompt di refactoring, modificabile dall'utente, per migliorare il codice. */
    const [editableRefactorPrompt, setEditableRefactorPrompt] = useState(codeRefactoringPrompt);
  
    /** Flag di convenienza per verificare se l'app è in fase di elaborazione. */
    const isProcessing = appStep === 'processing';

    // --- FUNZIONI DI GESTIONE CHAT ---

    /**
     * Inizializza una nuova sessione di chat con Gemini, utilizzando il prompt di sistema corrente.
     * @param ai - L'istanza del client GoogleGenAI.
     * @returns La nuova istanza della chat.
     */
    const initializeChat = useCallback((ai: GoogleGenAI) => {
        const newChat = ai.chats.create({
            model: GEMINI_FLASH_MODEL,
            config: {
                systemInstruction: editableArchitectPrompt,
            },
        });
        setChatInstance(newChat);
        return newChat;
    }, [editableArchitectPrompt]);

    /**
     * Invia un messaggio all'Architetto AI e gestisce la risposta in streaming per un'esperienza utente reattiva.
     * Aggiorna la cronologia della chat man mano che i pezzi della risposta arrivano.
     * @param message - Il messaggio dell'utente da inviare.
     */
    const handleSendMessageToArchitect = useCallback(async (message: string) => {
        const ai = getAiClient(apiKeyOverride);
        if (!ai) {
            setError("Per favore, fornisci una chiave API valida per usare l'Architetto Chat.");
            return;
        }
        setError(null);
        setIsArchitectProcessing(true);

        const currentChat = chatInstance || initializeChat(ai);

        const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
        setChatHistory(updatedHistory);
        
        try {
            const stream = await currentChat.sendMessageStream({ message });
            
            let modelResponse = '';
            setChatHistory(prev => [...prev, { role: 'model', content: '...' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', content: modelResponse };
                    return newHistory;
                });
            }
        } catch (err: any) {
            const errorMessage = `Si è verificato un errore con l'Architetto AI: ${err.message || 'Errore sconosciuto'}`;
            setError(errorMessage);
            setChatHistory(prev => prev.filter(msg => msg.role !== 'model' || msg.content !== '...')); // Rimuove il placeholder
        } finally {
            setIsArchitectProcessing(false);
        }
    }, [apiKeyOverride, chatHistory, chatInstance, initializeChat]);

    /**
     * Prende l'ultima risposta generata dall'Architetto AI, la inserisce nell'area di testo
     * della vista principale e passa a tale vista.
     */
    const handleUseProjectFromChat = useCallback(() => {
        const lastModelMessage = [...chatHistory].reverse().find(m => m.role === 'model');
        if (lastModelMessage) {
            setProjectInputText(lastModelMessage.content);
        }
        setCurrentView('main');
    }, [chatHistory]);

    // --- FUNZIONI DI GESTIONE WORKFLOW ---
    
    /**
     * Reimposta lo stato della vista principale al suo stato iniziale, cancellando errori e dati del progetto.
     */
    const clearMainState = useCallback(() => {
        setError(null);
        setParsedFiles([]);
        setSelectedFilePath(null);
        setAppStep('input');
        setProjectInputText('');
    }, []);

    /**
     * Orchestra l'intero processo di generazione del progetto. Esegue la pipeline del workflow in modo dinamico,
     * passo dopo passo, aggiornando l'interfaccia con il progresso.
     * @param input - L'input dell'utente, che può essere una stringa di testo o un array di oggetti `File`.
     */
    const handleProcessInput = useCallback(async (input: string | File[]) => {
        setAppStep('processing');
        setError(null);
        let pipelineData: PipelineData = {
            fullProjectContent: '',
            files: [],
            documentationNotes: ''
        };

        try {
            // Passo 1: Pre-elaborazione dell'input
            setProcessingMessage('1/X: Preparazione dell\'input...');
            if (typeof input === 'string') {
                pipelineData.fullProjectContent = input;
            } else {
                pipelineData.fullProjectContent = await processInputFiles(input);
            }
            pipelineData.files = parseWithRegex(pipelineData.fullProjectContent);
            
            // Passo 2: Esecuzione dinamica della pipeline del workflow
            const activeSteps = workflowSteps.filter(step => step.enabled);
            for (let i = 0; i < activeSteps.length; i++) {
                const step = activeSteps[i];
                setProcessingMessage(`${i + 2}/${activeSteps.length + 1}: Esecuzione passo "${step.name}"...`);

                switch(step.type) {
                    case 'FIND_FILES':
                        pipelineData = await findAdditionalFiles(pipelineData, step.prompt, apiKeyOverride);
                        break;
                    case 'EXTRACT_DOCS':
                        pipelineData = await extractDocumentationNotes(pipelineData, step.prompt, apiKeyOverride);
                        break;
                    case 'GENERATE_README':
                        const readmeContent = await generateReadme(pipelineData, step.prompt, apiKeyOverride);
                        const readmeIndex = pipelineData.files.findIndex(f => f.path.toLowerCase() === 'readme.md');
                        if (readmeIndex > -1) {
                            pipelineData.files[readmeIndex].content = readmeContent;
                        } else {
                            pipelineData.files.unshift({ path: 'README.md', content: readmeContent });
                        }
                        break;
                }
            }

            if (pipelineData.files.length === 0) throw new Error("Impossibile analizzare i file. Verifica il formato dell'input.");
            
            setParsedFiles(pipelineData.files);
            setSelectedFilePath(pipelineData.files[0]?.path || null);
            setAppStep('editor');

        } catch (err: any) {
            setError(err.message || "Si è verificato un errore imprevisto durante l'elaborazione.");
            setAppStep('input');
        } finally {
            setProcessingMessage(null);
        }
    }, [workflowSteps, apiKeyOverride]);

    /**
     * Gestisce la richiesta di refactoring del codice per un file nell'editor.
     * @param currentContent - Il contenuto attuale del file da refattorizzare.
     * @returns Una promise che si risolve con il nuovo contenuto del codice o `null` in caso di fallimento.
     */
    const handleRefactorRequest = async (currentContent: string): Promise<string | null> => {
        try {
            return await refactorCode(currentContent, editableRefactorPrompt, apiKeyOverride);
        } catch (e) {
            console.error(e);
            alert(`Refactoring fallito: ${e instanceof Error ? e.message : 'Errore sconosciuto'}`);
            return null;
        }
    };
    
    // --- FUNZIONE DI RENDER ---

    /**
     * Determina quale vista renderizzare in base allo stato corrente dell'applicazione.
     * @returns Il componente React per la vista corrente.
     */
    const renderCurrentView = () => {
        if (currentView === 'architect') {
            return (
                <ChatArchitectView 
                    chatHistory={chatHistory}
                    isProcessing={isArchitectProcessing}
                    onSendMessage={handleSendMessageToArchitect}
                    onUseProject={handleUseProjectFromChat}
                    systemPrompt={editableArchitectPrompt}
                    onSystemPromptChange={setEditableArchitectPrompt}
                    apiKey={apiKeyOverride}
                    onApiKeyChange={setApiKeyOverride}
                    error={error}
                    clearError={() => setError(null)}
                />
            );
        }

        // --- Vista Principale (Input/Editor) ---
        if (isProcessing) {
            return (
                <div className="flex items-center justify-center flex-col text-center p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400"></div>
                    <p className="mt-4 text-lg font-semibold">{processingMessage}</p>
                </div>
            );
        }
  
        if (appStep === 'editor') {
            return (
                <EditorView
                    parsedFiles={parsedFiles}
                    selectedFilePath={selectedFilePath}
                    onFileSelect={setSelectedFilePath}
                    setParsedFiles={setParsedFiles}
                    onRefactorRequest={handleRefactorRequest}
                    onStartOver={clearMainState}
                />
            );
        }

        return (
          <div className="w-full flex flex-col items-center space-y-6">
              <InputView
                  isProcessing={isProcessing}
                  onProcessInput={handleProcessInput}
                  projectInputText={projectInputText}
                  onProjectInputChange={setProjectInputText}
                  onStartWithArchitect={() => setCurrentView('architect')}

                  apiKeyOverride={apiKeyOverride}
                  onApiKeyOverrideChange={setApiKeyOverride}
                  
                  workflowSteps={workflowSteps}
                  onWorkflowStepsChange={setWorkflowSteps}

                  refactorPrompt={editableRefactorPrompt}
                  onRefactorPromptChange={setEditableRefactorPrompt}
              />
  
              {error && (
                  <div className="w-full mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-center">
                      <p className="font-bold">Si è verificato un errore:</p>
                      <p>{error}</p>
                      <button onClick={() => { setError(null); if (appStep !== 'input') clearMainState(); }} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                          Riprova
                      </button>
                  </div>
              )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">ProjectZipperAI</h1>
                <p className="mt-2 text-lg text-gray-400">Progetta con l'AI, genera con un workflow, scarica il tuo progetto.</p>
            </header>

            <main className="w-full max-w-6xl flex flex-col items-center">
                {renderCurrentView()}
            </main>
            
            <footer className="mt-12 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} ProjectZipperAI. Realizzato con React, Gemini, Tailwind CSS, e JSZip.</p>
                <p className="mt-1">
                    Questo è un progetto open-source. Visualizza il codice su{' '}
                    <a href="https://github.com/google/generative-ai-docs/tree/main/demos/project_zipper" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                    GitHub
                    </a>!
                </p>
            </footer>
        </div>
    );
};

export default App;
