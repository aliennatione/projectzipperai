# ProjectZipperAI ⚡️

Un'applicazione web avanzata che utilizza l'API Gemini per guidare l'utente dalla progettazione di un'idea alla generazione di una struttura di progetto completa e scaricabile. L'app combina un'interfaccia di input diretta con strumenti opzionali come una chat AI per l'architettura del software e una pipeline di generazione personalizzabile.

![Screenshot di ProjectZipperAI](https://storage.googleapis.com/project-hosting-images/project-zipper-ai-demo.png)

## Funzionalità Principali

- **Generazione Diretta e Veloce**: Incolla testo strutturato o carica file (inclusi `.zip`) per generare immediatamente una struttura di progetto.
- **Architetto Chat AI (Opzionale)**:
    - Avvia una conversazione con un assistente AI ("Architetto") per definire la struttura, le tecnologie e i file del tuo progetto da zero.
    - Il comportamento dell'Architetto è guidato da un prompt di sistema completamente personalizzabile.
- **Workflow Editor Personalizzabile (Opzionale)**:
    - In una sezione a scomparsa, puoi definire la pipeline di generazione del progetto tramite un'interfaccia visiva.
    - Riordina i passaggi (analisi, documentazione, generazione README) con il drag-and-drop, modificali, clonali o eliminali.
- **Parsing Ibrido Intelligente**: Utilizza un'analisi rapida basata su espressioni regolari, potenziata dall'intelligenza artificiale di Gemini per trovare file mancanti ed estrarre note di documentazione.
- **Editor Interattivo**:
    - Visualizza e modifica il progetto generato in un editor multi-file.
    - Aggiungi nuovi file o elimina quelli esistenti prima del download.
- **Refactoring con AI**: Migliora la qualità del codice di qualsiasi file con un solo clic.
- **Download Immediato**: Scarica l'intera struttura del progetto come un singolo file `.zip`, pronto per l'uso.

## Come Funziona: Un Flusso Semplice con Potenzialità Avanzate

ProjectZipperAI è progettato per essere immediato, ma offre strumenti potenti quando ne hai bisogno.

### Flusso Principale

1.  **Input**: All'avvio, ti trovi di fronte a un'interfaccia semplice. Puoi incollare direttamente del testo che descrive un progetto o caricare file (`.txt`, `.md`, `.zip`).
2.  **Generazione**: Clicca su "Genera Progetto". L'applicazione esegue una pipeline di default per analizzare l'input, trovare i file, estrarre la documentazione e creare un `README.md`.
3.  **Editing e Download**: Il progetto generato appare nell'editor interattivo. Qui puoi revisionare il codice, apportare modifiche e infine scaricare l'archivio `.zip`.

### Strumenti Opzionali Avanzati

- **Hai bisogno di aiuto per la progettazione? Usa l'Architetto Chat.**
  Prima di incollare il testo, puoi avviare una conversazione con l'Architetto AI. Lui ti guiderà nella definizione del progetto. Una volta terminato, l'output della chat popolerà l'area di testo principale, pronta per la generazione.

- **Vuoi un controllo totale sulla generazione? Usa il Workflow Editor.**
  Nella schermata di input, puoi espandere l'Editor del Workflow per personalizzare ogni fase del processo di analisi dell'IA. Riordina, modifica i prompt, disattiva passaggi o aggiungine di nuovi.

## Tecnologie Utilizzate

- **Frontend**: React, TypeScript, Tailwind CSS
- **API AI**: Google Gemini API (`gemini-2.5-flash`)
- **Rendering Markdown**: Marked.js
- **Utilità**: JSZip per la gestione degli archivi `.zip` lato client

## Sviluppo Locale

Per eseguire il progetto in locale, segui questi passaggi.

### Prerequisiti

- Un qualsiasi server web per servire file statici. Se hai [Node.js](https://nodejs.org/) (versione 18.x o successiva), puoi usare `http-server`.
- Una **chiave API di Google Gemini**. Puoi ottenerla da [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installazione

1.  **Clona il repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/ProjectZipperAI.git
    cd ProjectZipperAI
    ```
2.  **Avvia il server di sviluppo:**
    Questo progetto è composto da file statici e non richiede un processo di build.
    ```bash
    # Se hai Node.js, puoi usare http-server per un avvio rapido:
    npx http-server .
    ```
    Apri il tuo browser e naviga all'indirizzo fornito (solitamente `http://localhost:8080`).

3.  **Configura la Chiave API**:
    Per permettere all'applicazione di funzionare, **devi** inserire la tua chiave API di Gemini nell'apposito campo "Sovrascrivi Chiave API Gemini" all'interno delle impostazioni dell'applicazione. La chiave viene salvata localmente nel tuo browser per la sessione corrente.

## Deployment Automatico con GitHub Actions

Questo repository è configurato per il deployment automatico su **GitHub Pages**. Ogni volta che viene effettuato un push sul branch `main`, una GitHub Action si attiverà per pubblicare il contenuto del repository come un sito web statico.

Puoi trovare la configurazione del workflow nel file `.github/workflows/deploy.yml`.

## Contribuire

I contributi sono molto apprezzati! Sentiti libero di fare un fork del repository, creare un branch per le tue modifiche e aprire una Pull Request.

1.  Fai un Fork del Progetto
2.  Crea il tuo Branch per la Funzionalità (`git checkout -b feature/AmazingFeature`)
3.  Fai il Commit delle tue Modifiche (`git commit -m 'Add some AmazingFeature'`)
4.  Fai il Push sul Branch (`git push origin feature/AmazingFeature`)
5.  Apri una Pull Request

## Licenza

Distribuito sotto la Licenza MIT. Vedi `LICENSE` per maggiori informazioni.
