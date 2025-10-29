/**
 * @file Definisce i tipi di dati condivisi utilizzati nell'applicazione.
 */

// --- TIPI PER LA STRUTTURA DEL PROGETTO ---

/**
 * Rappresenta un singolo file analizzato dall'input dell'utente.
 * Contiene il percorso completo del file e il suo contenuto come stringa.
 */
export interface ParsedFile {
  /**
   * Il percorso completo del file all'interno della struttura del progetto.
   * Esempio: "src/components/Button.tsx"
   */
  path: string;
  /**
   * Il contenuto testuale del file.
   */
  content: string;
}

// --- TIPI PER L'ARCHITETTO CHAT ---

/**
 * Definisce il ruolo dell'autore in un messaggio di chat (utente o modello AI).
 */
export type ChatMessageRole = 'user' | 'model';

/**
 * Rappresenta un singolo messaggio all'interno della cronologia della chat.
 */
export interface ChatMessage {
    /**
     * Il ruolo di chi ha inviato il messaggio.
     */
    role: ChatMessageRole;
    /**
     * Il contenuto testuale del messaggio. Può contenere Markdown.
     */
    content: string;
}

// --- TIPI PER IL WORKFLOW EDITOR ---

/**
 * Definisce i tipi di passaggi disponibili nel workflow di generazione del progetto.
 * Ogni tipo corrisponde a un'azione specifica eseguita da un servizio.
 */
export type WorkflowStepType = 'FIND_FILES' | 'EXTRACT_DOCS' | 'GENERATE_README';

/**
 * Rappresenta un singolo passaggio configurabile all'interno della pipeline del workflow.
 */
export interface WorkflowStep {
    /**
     * Un ID univoco per il passaggio, utile per la gestione nello stato di React.
     */
    id: string;
    /**
     * Il tipo di operazione che questo passaggio esegue.
     */
    type: WorkflowStepType;
    /**
     * Un nome leggibile per l'utente visualizzato nell'interfaccia.
     */
    name: string;
    /**
     * Il prompt che verrà inviato all'AI per questo specifico passaggio.
     */
    prompt: string;
    /**
     * Flag booleano per attivare o disattivare il passaggio nella pipeline.
     */
    enabled: boolean;
}

/**
 * Rappresenta l'oggetto dati che viene passato e modificato attraverso la pipeline del workflow.
 * Ogni passaggio può leggere e scrivere su questo oggetto, arricchendo il contesto per i passaggi successivi.
 */
export interface PipelineData {
    /**
     * Il contenuto testuale completo e originale fornito dall'utente.
     */
    fullProjectContent: string;
    /**
     * L'elenco dei file del progetto, che può essere arricchito durante la pipeline.
     */
    files: ParsedFile[];
    /**
     * Note di documentazione estratte dall'AI, utilizzate principalmente per la generazione del README.
     */
    documentationNotes: string;
}