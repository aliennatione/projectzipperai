import { ChatMessage, WorkflowStep, WorkflowStepType } from './types';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

/**
 * @file Contiene costanti condivise utilizzate in tutta l'applicazione.
 * Centralizzare queste costanti rende l'applicazione più facile da configurare e mantenere.
 */

/**
 * Il modello Gemini Flash utilizzato per compiti generici come l'analisi del progetto,
 * la generazione di documentazione e il refactoring del codice.
 */
export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash';

/**
 * La cronologia della chat iniziale visualizzata quando si apre per la prima volta l'Architetto Chat.
 * Fornisce un messaggio di benvenuto e guida l'utente.
 */
export const INITIAL_CHAT_HISTORY: ChatMessage[] = [
    {
        role: 'model',
        content: `Ciao! Sono l'Architetto AI. Sono qui per aiutarti a trasformare la tua idea in un progetto software strutturato.

Descrivimi cosa vorresti costruire. Ad esempio:
- "Vorrei creare una semplice to-do list app con React."
- "Ho bisogno di un server backend con Node.js ed Express per una API REST."
- "Puoi aiutarmi a creare una landing page statica con HTML, CSS e un po' di JavaScript?"

Iniziamo a progettare insieme!`
    }
];

// --- DEFINIZIONI PER I PASSI DEL WORKFLOW ---

const fileFinderPrompt = `
Sei un assistente AI che completa un processo di analisi di file.
Riceverai il contenuto testuale originale della descrizione di un progetto e un elenco di percorsi di file che sono già stati analizzati da uno script.

I tuoi compiti sono:
1.  **Analizza il Contenuto Originale**: Leggi attentamente l'intero testo originale.
2.  **Identifica File Mancanti**: Trova eventuali strutture di file complete (con un percorso e un contenuto chiari, spesso in blocchi di codice) nel testo originale che NON sono presenti nell'elenco dei file già analizzati.
3.  **Restituisci un oggetto JSON**: Il tuo output DEVE essere un singolo oggetto JSON valido che rispetti lo schema fornito. Dovrebbe contenere una chiave, "additionalFiles", che è un array di oggetti file. Se non vengono trovati nuovi file, restituisci un array vuoto. Non aggiungere alcun testo prima or dopo l'oggetto JSON.

Il contenuto originale è fornito di seguito:
---
ORIGINAL_CONTENT_PLACEHOLDER
---

I file già analizzati dallo script (per percorso) sono:
---
PARSED_FILES_PLACEHOLDER
---
`;

const docExtractorPrompt = `
Sei un assistente AI che estrae documentazione da testo non strutturato.
Riceverai il contenuto testuale originale della descrizione di un progetto.

I tuoi compiti sono:
1.  **Analizza il Contenuto Originale**: Leggi attentamente l'intero testo.
2.  **Estrai Contenuto "Orfano"**: Identifica qualsiasi testo descrittivo importante, obiettivi del progetto, istruzioni di setup o altre informazioni pertinenti che NON fanno parte del blocco di codice di un file specifico. Questo contenuto "orfano" è prezioso per generare un file README.md di alta qualità.
3.  **Sintetizza le Note**: Condensa tutte le informazioni estratte in un'unica stringa di note coerente.
4.  **Restituisci un oggetto JSON**: Il tuo output DEVE essere un singolo oggetto JSON valido che rispetti lo schema fornito. Dovrebbe contenere una chiave, "documentationNotes", che è una stringa. Se non vengono trovate informazioni pertinenti, restituisci una stringa vuota. Non aggiungere alcun testo prima o dopo l'oggetto JSON.

Il contenuto originale è fornito di seguito:
---
ORIGINAL_CONTENT_PLACEHOLDER
---
`;

const readmeGenerationPrompt = `
Sei un technical writer esperto, specializzato nella creazione di documentazione di alta qualità e di facile comprensione per progetti open-source.

Analizza le seguenti informazioni sul progetto. Consistono nella descrizione originale completa del progetto e potrebbero includere anche note specifiche estratte da un assistente. Il tuo compito è sintetizzare tutte queste informazioni per generare un file README.md completo e ben strutturato per questo progetto, usando la sintassi Markdown.

Il README.md dovrebbe includere le seguenti sezioni, formattate per chiarezza e leggibilità:
- **Titolo del Progetto**: Un titolo chiaro e conciso.
- **Descrizione**: Un breve paragrafo che spiega cosa fa il progetto e il suo scopo principale.
- **Funzionalità Principali**: Un elenco puntato delle caratteristiche o funzionalità più importanti.
- **Tecnologie Utilizzate**: Un elenco delle tecnologie chiave, librerie o framework menzionati.
- **Struttura del Progetto**: Spiega brevemente la struttura dei file se non è ovvia.
- **Installazione e Utilizzo**: Istruzioni chiare e passo-passo su come configurare ed eseguire il progetto.
- **Contribuire**: Una sezione accogliente per i potenziali contributori.
- **Licenza**: Dichiara la licenza (es. MIT).

**ISTRUZIONI CRITICHE**:
1.  **Sintetizza Tutte le Informazioni**: Combina le informazioni sia dal contenuto originale che dalle note aggiuntive. Le "note aggiuntive" contengono spesso il contesto più importante.
2.  **ESCLUDI il Codice**: NON includere blocchi di codice completi. Sono accettabili frammenti di codice in linea per i comandi (es. \`npm install\`).
3.  **Formatta come Markdown**: L'intero output DEVE essere un unico blocco Markdown valido.

Ecco le informazioni complete da analizzare:
---
`;

/**
 * Contiene le definizioni (nome, descrizione, prompt predefinito) per ogni tipo
 * di passo del workflow disponibile. Questo centralizza la configurazione e facilita
 * l'aggiunta di nuovi tipi di passo in futuro.
 */
export const WORKFLOW_STEP_DEFINITIONS: Record<WorkflowStepType, { name: string; description: string; prompt: string; }> = {
    'FIND_FILES': {
        name: 'Trova File Aggiuntivi',
        description: "Usa l'AI per trovare file mancanti dall'input testuale.",
        prompt: fileFinderPrompt
    },
    'EXTRACT_DOCS': {
        name: 'Estrai Note di Documentazione',
        description: "Usa l'AI per estrarre note di documentazione dall'input.",
        prompt: docExtractorPrompt
    },
    'GENERATE_README': {
        name: 'Genera README.md',
        description: "Usa l'AI per generare un file README.md completo.",
        prompt: readmeGenerationPrompt
    }
};

/**
 * La configurazione del workflow predefinito che viene caricata all'avvio dell'applicazione.
 * Definisce i passaggi standard di analisi e generazione del progetto.
 */
export const INITIAL_WORKFLOW_STEPS: WorkflowStep[] = [
    {
        id: uuidv4(),
        type: 'FIND_FILES',
        name: WORKFLOW_STEP_DEFINITIONS.FIND_FILES.name,
        prompt: WORKFLOW_STEP_DEFINITIONS.FIND_FILES.prompt,
        enabled: true
    },
    {
        id: uuidv4(),
        type: 'EXTRACT_DOCS',
        name: WORKFLOW_STEP_DEFINITIONS.EXTRACT_DOCS.name,
        prompt: WORKFLOW_STEP_DEFINITIONS.EXTRACT_DOCS.prompt,
        enabled: true
    },
    {
        id: uuidv4(),
        type: 'GENERATE_README',
        name: WORKFLOW_STEP_DEFINITIONS.GENERATE_README.name,
        prompt: WORKFLOW_STEP_DEFINITIONS.GENERATE_README.prompt,
        enabled: true
    }
];