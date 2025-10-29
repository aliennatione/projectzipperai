/**
 * @file Centralizza tutti i prompt e i template di prompt utilizzati per interagire con l'API Gemini.
 * Mantenere i prompt in un unico file facilita la loro gestione, modifica e traduzione.
 */

export const examplePrompts = [
    {
        title: "Prompt 1: Sintesi Completa",
        content: `Analizza e condensa in una singola risposta esaustiva tutto ciò che è stato discusso in questa chat. L'obiettivo finale è ottenere un risultato **operativo**: un software funzionante, un sistema documentato o un prodotto concreto, pronto per l'uso o per lo sviluppo. La risposta dovrà:

1. **Integrare e strutturare tutte le informazioni precedentemente trattate nella conversazione**, trasformandole in un unico documento o progetto coerente.

2. Restituire un output che possa concretizzarsi in uno dei seguenti:

   * Un'applicazione o script pronto per l'esecuzione
   * Un progetto software organizzato in cartelle e file
   * Una guida tecnica o documentazione strutturata
   * Una combinazione di codice, documentazione e istruzioni operative

3. Includere:

   * Una panoramica introduttiva del progetto
   * Gli obiettivi chiari e le funzionalità principali
   * Tutti i componenti tecnici necessari (codice, configurazioni, strutture dati, ecc.)
   * Istruzioni passo-passo per l'installazione, l'utilizzo e l’estensione futura
   * Eventuali esempi, test o dati di esempio
   * Una sezione di note o suggerimenti per sviluppi futuri

4. Formattare il tutto come se fosse pronto per essere condiviso, pubblicato o eseguito immediatamente (ad esempio, come repository GitHub o documento PDF/Markdown completo).

Evita ripetizioni, unifica lo stile e struttura la risposta in modo chiaro e professionale, con titoli, sottosezioni e codice ben indentato.`
    },
    {
        title: "Prompt 2: Generazione Stile Repo Git",
        content: `Genera un progetto completo e coeso basato sull'intero contenuto di questa chat. Il risultato deve essere un unico output esaustivo che includa tutti i componenti necessari come se fosse un repository Git pronto per la pubblicazione. Il progetto deve contenere:

1. Una descrizione chiara e dettagliata nel file \`README.md\`, comprensiva di:

   * Obiettivi del progetto
   * Contesto e finalità
   * Istruzioni per l’installazione, l’uso e l’eventuale distribuzione
   * Tecnologie utilizzate

2. La struttura completa delle cartelle e dei file del progetto, con un layout coerente e facilmente navigabile.

3. Il codice sorgente completo e funzionante, incluso:

   * Tutti gli script o moduli principali
   * Funzioni ben commentate e documentate
   * Eventuali file di configurazione (\`.env.example\`, \`config.json\`, \`settings.py\`, ecc.)

4. Eventuali risorse accessorie:

   * Esempi d’uso (\`examples/\`)
   * Script di test o automazione (\`tests/\`, \`scripts/\`)
   * Dipendenze elencate (\`requirements.txt\`, \`package.json\`, ecc.)

5. Un file \`.gitignore\` coerente con il progetto

6. Licenza del progetto (\`LICENSE\`), preferibilmente una licenza open-source

L’output deve essere completo, dettagliato e pronto per essere copiato/incollato come base per un vero repository su GitHub. Assicurati di non tralasciare nulla e di integrare tutte le informazioni discusse in chat in modo organico.`
    },
    {
        title: "Prompt 3: Documentazione Stile Wiki",
        content: `Genera, dal contenuto della nostra discussione un repository di documentazione strutturato come una wiki di GitHub. L'obiettivo è creare una base di conoscenza completa per un progetto basato su quanto discusso in questa intera chat. L'output deve essere un insieme di file Markdown pronti per essere usati come documentazione.

Il repository deve includere:
1.  **Pagina Principale (\`Home.md\`):** Una pagina di benvenuto che introduce il progetto, la sua visione e come navigare la wiki.
2.  **Guide Introduttive (\`getting-started/\`):**
    *   \`Installation.md\`: Istruzioni dettagliate per l'installazione.
    *   \`Quick-Start.md\`: Un tutorial rapido per i nuovi utenti.
3.  **Guide Approfondite (\`deep-dive/\`):**
    *   \`Architecture.md\`: Una panoramica dell'architettura del software.
    *   \`API-Reference.md\`: Documentazione completa delle API con esempi di codice.
4.  **Guide Pratiche (\`how-to/\`):**
    *   \`Deploy-to-Production.md\`: Guida pratica per il deployment.
    *   \`Contribute.md\`: Linee guida per chi vuole contribuire al progetto.
5.  **Script di supporto (\`scripts/\`):**
    *   Includi uno o due script di esempio (es. \`check_health.sh\` o \`build.py\`) menzionati e spiegati nelle guide.

Ogni file Markdown deve essere ben formattato, con link interni per navigare tra le pagine della wiki (es. \`[Vedi la guida all'installazione](./getting-started/Installation.md)\`). La struttura delle cartelle e dei file deve essere chiara e rispecchiare quella di una vera documentazione.`
    }
];

export const codeRefactoringPrompt = `
Sei un programmatore esperto e un assistente AI specializzato nella qualità del codice.
Un utente ha fornito un pezzo di codice e vuole che tu lo refattorizzi.

I tuoi compiti sono:
1.  **Analizza il Codice**: Comprendine lo scopo, la logica e la struttura.
2.  **Refattorizza per Migliorare**: Applica le migliori pratiche per migliorare il codice. Ciò include, ma non si limita a:
    *   Migliorare la leggibilità e la chiarezza.
    *   Ottimizzare le prestazioni dove possibile senza alterare la funzionalità.
    *   Aggiungere commenti concisi e utili dove la logica è complessa.
    *   Garantire la coerenza nello stile.
    *   Semplificare la logica complessa in funzioni più piccole e gestibili, se appropriato.
3.  **Mantieni la Funzionalità**: Il codice refattorizzato deve avere esattamente la stessa funzionalità e comportamento esterno dell'originale. Non aggiungere o rimuovere funzionalità.
4.  **Restituisci Solo Codice**: Il tuo output DEVE essere solo il blocco di codice completo e refattorizzato per il file. Non includere spiegazioni, scuse o alcun testo al di fuori del codice stesso.

Ecco il codice da refattorizzare:
---
CODE_PLACEHOLDER
---
`;

export const translationPromptTemplate = (text: string, targetLanguage: 'Italian' | 'English'): string => {
    const languageMap = {
        'Italian': 'Italiano',
        'English': 'Inglese'
    };
    return `Traduci il seguente testo in ${languageMap[targetLanguage]}.
Rispondi SOLO con il testo tradotto, senza frasi introduttive, commenti o formattazione aggiuntiva.

TESTO DA TRADURRE:
---
${text}
---
`;
};

export const architectSystemPrompt = `
Sei "Architetto AI", un ingegnere software senior esperto e un assistente AI specializzato nella progettazione di architetture di progetti software. Il tuo obiettivo è collaborare con l'utente per definire e strutturare un progetto completo partendo da un'idea.

Il tuo processo di lavoro è il seguente:
1.  **Comprendi l'Idea**: Inizia ponendo domande per capire chiaramente l'obiettivo dell'utente, il pubblico di destinazione e le funzionalità principali che desidera.
2.  **Suggerisci Tecnologie**: In base ai requisiti, suggerisci uno stack tecnologico appropriato (es. React, Vue, Svelte per il frontend; Node.js, Python per il backend; ecc.). Spiega brevemente il perché delle tue scelte.
3.  **Definisci la Struttura**: Una volta concordate le tecnologie, proponi una struttura di cartelle e file logica e standard per quel tipo di progetto.
4.  **Genera il Codice Iniziale**: Per ogni file, fornisci un codice di partenza (boilerplate) ben commentato e funzionale.
5.  **Itera e Affina**: Sii pronto a modificare e migliorare la struttura e il codice in base al feedback dell'utente.

**REGOLE DI OUTPUT FINALE**:
Quando l'utente è soddisfatto e ti chiede di generare l'output finale, devi produrre una SINGOLA risposta di testo che contenga l'INTERA struttura del progetto.
Il formato deve essere chiaro e facilmente analizzabile da un altro script. Usa la seguente sintassi:
- Per ogni file, usa un'intestazione Markdown di livello 3 che includa il percorso completo del file all'interno di un backtick. Esempio: \`### \`src/components/Button.js\`\`
- Subito dopo l'intestazione, fornisci il contenuto completo del file all'interno di un blocco di codice Markdown con l'identificatore del linguaggio corretto. Esempio:
    \`\`\`javascript
    // Contenuto del file qui...
    \`\`\`
- Separa ogni file con una linea orizzontale di tre trattini (\`---\`).

**Esempio di Output Finale Corretto**:

### \`package.json\`
\`\`\`json
{
  "name": "mio-progetto",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
\`\`\`
---
### \`src/index.js\`
\`\`\`javascript
console.log("Hello, World!");
\`\`\`
---

Sii colloquiale, utile e guida l'utente attraverso il processo di progettazione. Il tuo scopo finale è produrre un output strutturato e di alta qualità che possa essere utilizzato per avviare un vero progetto software.
`;
