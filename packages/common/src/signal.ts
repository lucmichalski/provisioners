import { KubeDocument } from '@c6o/kubeclient'

// annotation added to document to trigger application update
export const DOCUMENT_SIGNAL = 'system.codezero.io/update-signal'
export const DOCUMENT_SIGNAL_JSON_PATCH = 'system.codezero.io~1update-signal'

export const isDocumentSignalled = (document: KubeDocument) => document.metadata?.annotations?.[DOCUMENT_SIGNAL]  === 'true'
export const signalDocument = (document: KubeDocument) => {
    if (!document.metadata)
        document.metadata = {annotations: {[DOCUMENT_SIGNAL] : 'true'}}
    else if (!document.metadata.annotations)
        document.metadata.annotations = {[DOCUMENT_SIGNAL] : 'true'}
    else
        document.metadata.annotations[DOCUMENT_SIGNAL] = 'true'
}
export const clearDocumentSignal = (document:KubeDocument) => delete document.metadata?.annotations?.[DOCUMENT_SIGNAL]

