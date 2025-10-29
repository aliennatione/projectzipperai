import React, { useState, useCallback } from 'react';
import { WorkflowStep } from '../types';
import { UploadIcon } from './icons';
import { WorkflowEditor } from './WorkflowEditor';

/**
 * Proprietà per il componente CollapsibleSection.
 */
interface CollapsibleSectionProps {
    title: React.ReactNode;
    children: React.ReactNode;
    startOpen?: boolean;
}

/**
 * Un componente UI che mostra una sezione di contenuto espandibile/comprimibile.
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);

    const ChevronIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );

    return (
        <div className="w-full bg-gray-800 border border-gray-700 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
                aria-expanded={isOpen}
            >
                <div className="flex-1">{title}</div>
                <ChevronIcon />
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[5000px]' : 'max-h-0'}`}
                 style={{ transitionProperty: 'max-height' }}
            >
                <div className={`p-4 pt-0 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Componente per il caricamento di file con supporto drag-and-drop.
 */
const FileUploader: React.FC<{ onFileSelect: (files: File[]) => void; isProcessing: boolean; }> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.length) onFileSelect(Array.from(e.dataTransfer.files));
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onFileSelect(Array.from(e.target.files));
  };

  return (
    <div className="w-full">
      <label
        htmlFor="dropzone-file"
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragging ? 'border-teal-400 bg-gray-700' : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon />
          <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-teal-400">Clicca per caricare</span> o trascina e rilascia</p>
          <p className="text-xs text-gray-500">File TXT, MD, o ZIP</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md,.zip" disabled={isProcessing} multiple />
      </label>
    </div>
  );
};

/**
 * Componente per l'input di testo, ora controllato dallo stato dell'app.
 */
const TextAreaUploader: React.FC<{ 
    text: string;
    onTextChange: (value: string) => void;
    onTextSubmit: (content: string) => void; 
    isProcessing: boolean; 
}> = ({ text, onTextChange, onTextSubmit, isProcessing }) => {
    return (
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim() && !isProcessing) onTextSubmit(text.trim()); }} className="w-full flex flex-col items-center space-y-4">
            <textarea
                className="w-full h-80 bg-gray-800 border-2 border-gray-600 rounded-lg p-4 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-200 placeholder-gray-500 font-mono text-sm"
                placeholder="Incolla qui la struttura del tuo progetto o la descrizione testuale..."
                value={text} onChange={(e) => onTextChange(e.target.value)} disabled={isProcessing} aria-label="Input per il contenuto del progetto"
            />
            <button type="submit" disabled={!text.trim() || isProcessing} className="inline-flex items-center justify-center px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105">
                Genera Progetto dal Testo
            </button>
        </form>
    );
};

/**
 * Un editor per inserire una chiave API di Gemini personalizzata.
 */
const ApiKeyEditor: React.FC<{ value: string; onChange: (v: string) => void; }> = ({ value, onChange }) => (
    <div className="space-y-2 p-4 bg-gray-900/50 rounded-lg border border-yellow-500/50">
        <label htmlFor="api-key-input" className="font-semibold text-yellow-300 block">Sovrascrivi Chiave API Gemini (Opzionale)</label>
        <p className="text-xs text-gray-400">
            Se fornisci una chiave qui, verrà utilizzata al posto di quella predefinita. La chiave viene salvata solo nel tuo browser.
        </p>
        <input
            id="api-key-input"
            type="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Inserisci la tua chiave API Gemini..."
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm font-mono focus:ring-yellow-500 focus:border-yellow-500"
        />
    </div>
);

/**
 * Un editor per modificare prompt specifici, come quello di refactoring.
 */
const PromptEditor: React.FC<{ title: string, description: string, value: string, onChange: (v: string) => void }> = 
({ title, description, value, onChange }) => (
    <div className="space-y-2">
        <label className="font-semibold text-gray-300 block">{title}</label>
        <p className="text-xs text-gray-400">{description}</p>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-40 bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm font-mono focus:ring-teal-500 focus:border-teal-500"
        />
    </div>
);

/**
 * Proprietà per il componente InputView.
 */
interface InputViewProps {
    isProcessing: boolean;
    onProcessInput: (input: string | File[]) => void;
    projectInputText: string;
    onProjectInputChange: (text: string) => void;
    onStartWithArchitect: () => void;
    
    apiKeyOverride: string;
    onApiKeyOverrideChange: (key: string) => void;
    
    workflowSteps: WorkflowStep[];
    onWorkflowStepsChange: (steps: WorkflowStep[]) => void;

    refactorPrompt: string;
    onRefactorPromptChange: (prompt: string) => void;
}

/**
 * Componente per la schermata di input principale.
 * Ora orchestra l'input tramite file o testo, e la personalizzazione del workflow e delle impostazioni.
 */
export const InputView: React.FC<InputViewProps> = ({
    isProcessing,
    onProcessInput,
    projectInputText,
    onProjectInputChange,
    onStartWithArchitect,
    apiKeyOverride,
    onApiKeyOverrideChange,
    workflowSteps,
    onWorkflowStepsChange,
    refactorPrompt,
    onRefactorPromptChange
}) => {
    const [inputMode, setInputMode] = useState<'text' | 'upload'>('text');

    return (
        <>
             <div className="w-full p-4 mb-6 bg-teal-900/30 border border-teal-500/50 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-teal-300">Hai bisogno di aiuto per iniziare?</h3>
                <p className="text-sm text-gray-300 mt-1 mb-3">Usa l'Architetto AI per progettare la struttura del tuo progetto tramite una conversazione.</p>
                <button onClick={onStartWithArchitect} className="px-5 py-2.5 bg-gray-700 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors transform hover:scale-105">
                    Avvia Architetto Chat &rarr;
                </button>
            </div>


            <div className="w-full flex flex-col items-center space-y-6 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex justify-center">
                    <div className="inline-flex rounded-md shadow-sm bg-gray-800 p-1">
                        <button
                            onClick={() => setInputMode('text')}
                            className={`px-4 py-2 text-sm font-medium rounded-l-md transition-colors focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500
                                ${inputMode === 'text' ? 'bg-teal-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            Incolla Testo
                        </button>
                         <button
                            onClick={() => setInputMode('upload')}
                            className={`px-4 py-2 text-sm font-medium rounded-r-md transition-colors focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500
                                ${inputMode === 'upload' ? 'bg-teal-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            Carica File
                        </button>
                    </div>
                </div>
                {inputMode === 'upload' ? (
                    <FileUploader onFileSelect={(files) => onProcessInput(files)} isProcessing={isProcessing} />
                ) : (
                    <TextAreaUploader text={projectInputText} onTextChange={onProjectInputChange} onTextSubmit={(text) => onProcessInput(text)} isProcessing={isProcessing} />
                )}
            </div>
            
            <CollapsibleSection title={
                <div>
                    <h3 className="text-xl font-bold text-gray-200">Personalizza Workflow di Generazione</h3>
                    <p className="text-gray-400 text-sm font-normal mt-1">Modifica la pipeline che l'AI seguirà per analizzare il tuo input.</p>
                </div>
            }>
                <div className="p-4">
                    <WorkflowEditor 
                        steps={workflowSteps}
                        onStepsChange={onWorkflowStepsChange}
                    />
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title={
                <div>
                    <h3 className="text-xl font-bold text-gray-200">Impostazioni Avanzate</h3>
                    <p className="text-gray-400 text-sm font-normal mt-1">Personalizza la chiave API e i prompt non legati al workflow.</p>
                </div>
            }>
                <div className="space-y-6 p-4">
                     <ApiKeyEditor value={apiKeyOverride} onChange={onApiKeyOverrideChange} />
                     <PromptEditor
                        title="Prompt Refactoring Codice"
                        description="Istruisce l'AI su come refattorizzare e migliorare il codice di un file nell'editor."
                        value={refactorPrompt}
                        onChange={onRefactorPromptChange}
                     />
                </div>
            </CollapsibleSection>
        </>
    );
};