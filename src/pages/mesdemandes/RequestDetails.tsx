import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Upload, Trash2, Send, Smile, Paperclip, ArrowLeft, X, Eye, Mic, CheckCircle, FileDown, Reply } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import EmojiPicker from "emoji-picker-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../../components/form/input/InputField";

type RequestStatus = "EN_COURS" | "VALIDEE" | "REJETEE" | "EN_ATTENTE";

interface Document {
  id: string;
  name: string;
  url: string;
  version: number;
  updatedAt: string;

}

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  attachment?: { name: string; url: string };
  isRead?: boolean;
  replyTo?: string; // ID du message auquel on répond
}

interface Request {
  id: string;
  service: string;
  submittedAt: string;
  status: RequestStatus;
  documents: Document[];
  rejectionReason?: string;
  messages: Message[];
}

const mockData: Request[] = [
  {
    id: "REQ-2025-001",
    service: "Renouvellement Passeport",
    submittedAt: "2025-07-30T10:15:00Z",
    status: "EN_COURS",
    documents: [
      { id: "DOC-001", name: "Photo d'identité", url: "/docs/photo.pdf", version: 1, updatedAt: "2025-07-30T10:15:00Z" },
      { id: "DOC-004", name: "Formulaire rempli", url: "/docs/form.pdf", version: 1, updatedAt: "2025-07-30T10:15:00Z" },
    ],
    messages: [
      { id: "MSG-001", sender: "agent", text: "Votre demande est en cours de traitement.", timestamp: "2025-07-30T11:00:00Z" },
      { id: "MSG-002", sender: "user", text: "Merci pour l'information.", timestamp: "2025-07-30T11:30:00Z" },
    ],
  },
  {
    id: "REQ-2025-002",
    service: "Attestation de scolarité",
    submittedAt: "2025-06-14T09:00:00Z",
    status: "REJETEE",
    documents: [
      { id: "DOC-002", name: "Relevé de notes", url: "/docs/releve.pdf", version: 1, updatedAt: "2025-06-14T09:00:00Z" },
      { id: "DOC-005", name: "Certificat de naissance", url: "/docs/certificat.pdf", version: 1, updatedAt: "2025-06-14T09:00:00Z" },
    ],
    rejectionReason: "Document illisible",
    messages: [
      { id: "MSG-003", sender: "agent", text: "Le document est illisible. Veuillez le mettre à jour.", timestamp: "2025-06-15T10:00:00Z" },
    ],
  },
  {
    id: "REQ-2025-003",
    service: "Demande de bourse",
    submittedAt: "2025-07-01T14:20:00Z",
    status: "EN_ATTENTE",
    documents: [
      { id: "DOC-003", name: "Lettre de motivation", url: "/docs/lettre.pdf", version: 1, updatedAt: "2025-07-01T14:20:00Z" },
      { id: "DOC-006", name: "CV", url: "/docs/cv.pdf", version: 1, updatedAt: "2025-07-01T14:20:00Z" },
    ],
    messages: [],
  },
  {
    id: "REQ-2025-004",
    service: "Demande de visa",
    submittedAt: "2025-08-05T08:30:00Z",
    status: "VALIDEE",
    documents: [
      { id: "DOC-007", name: "Passeport", url: "/docs/passeport.pdf", version: 1, updatedAt: "2025-08-05T08:30:00Z" },
      { id: "DOC-008", name: "Formulaire de demande", url: "/docs/formulaire.pdf", version: 1, updatedAt: "2025-08-05T08:30:00Z" },
    ],
    messages: [
      { id: "MSG-004", sender: "agent", text: "Votre demande de visa a été validée.", timestamp: "2025-08-05T09:00:00Z" },
      { id: "MSG-005", sender: "user", text: "Merci pour la confirmation.", timestamp: "2025-08-05T09:15:00Z" },
    ],
  },
  {
    id: "REQ-2025-005",
    service: "Demande de carte d'identité",
    submittedAt: "2025-08-10T12:00:00Z",
    status: "EN_COURS",
    documents: [
      { id: "DOC-009", name: "Justificatif de domicile", url: "/docs/domicile.pdf", version: 1, updatedAt: "2025-08-10T12:00:00Z" },
      { id: "DOC-010", name: "Photo d'identité", url: "/docs/photo_id.pdf", version: 1, updatedAt: "2025-08-10T12:00:00Z" },
    ],
    messages: [],
  },
];

const statusBadge = (status: RequestStatus) => {
  switch (status) {
    case "EN_COURS":
      return <Badge variant="outline" color="brand">En cours</Badge>;
    case "VALIDEE":
      return <Badge variant="solid" color="success">Validée</Badge>;
    case "REJETEE":
      return <Badge variant="solid" color="error">Rejetée</Badge>;
    case "EN_ATTENTE":
      return <Badge variant="outline" color="warning">En attente</Badge>;
    default:
      return null;
  }
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  // Effet pour le défilement automatique
  useEffect(() => {
    if (chatRef.current && request) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [request?.messages]);

  useEffect(() => {
    setIsLoading(true);
    // Simulation de chargement asynchrone
    const timer = setTimeout(() => {
      const foundRequest = mockData.find((r) => r.id === id);
      setRequest(foundRequest || null);
      setIsLoading(false);
    }, 500); // Délai de 500ms pour simuler le chargement
    
    return () => clearTimeout(timer);
  }, [id]);

  const handleSendMessage = () => {
    if (!messageInput.trim() && !attachment) return;

    const newMessage: Message = {
      id: editingMessageId || Date.now().toString(),
      sender: "user",
      text: messageInput,
      timestamp: new Date().toISOString(),
      attachment: attachment ? { name: attachment.name, url: URL.createObjectURL(attachment) } : undefined,
      isRead: true,
      replyTo: replyToMessageId || undefined,
    };

    setRequest((prev) =>
      prev
        ? {
            ...prev,
            messages: editingMessageId
              ? prev.messages.map((msg) => (msg.id === editingMessageId ? newMessage : msg))
              : [...prev.messages, newMessage],
          }
        : null
    );

    setMessageInput("");
    setAttachment(null);
    setEditingMessageId(null);
    setReplyToMessageId(null);
    toast.success(editingMessageId ? "Message modifié !" : "Message envoyé !");

    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  const handleEditMessage = (msgId: string, text: string) => {
    setEditingMessageId(msgId);
    setMessageInput(text);
    setShowEmojiPicker(false);
  };

  const handleDeleteMessage = (msgId: string) => {
    setRequest((prev) =>
      prev ? { ...prev, messages: prev.messages.filter((msg) => msg.id !== msgId) } : null
    );
    toast.success("Message supprimé !");
  };

  const handleReplyToMessage = (msgId: string) => {
    setReplyToMessageId(msgId);
    setMessageInput("");
    setShowEmojiPicker(false);
  };

  const handleMarkAsRead = (msgId: string) => {
    setRequest((prev) =>
      prev
        ? {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === msgId && msg.sender === "agent" ? { ...msg, isRead: true } : msg
            ),
          }
        : null
    );
    toast.info("Message marqué comme lu.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docId?: string) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (docId) {
        setRequest((prev) =>
          prev
            ? {
                ...prev,
                documents: prev.documents.map((doc) =>
                  doc.id === docId
                    ? { ...doc, name: file.name, url: URL.createObjectURL(file), version: doc.version + 1, updatedAt: new Date().toISOString() }
                    : doc
                ),
              }
            : null
        );
        toast.success("Document mis à jour !");
      } else {
        setAttachment(file);
      }
    }
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setAttachment(file);
      toast.info("Message vocal chargé !");
    }
  };

  const deleteDocument = (docId: string) => {
    setRequest((prev) =>
      prev ? { ...prev, documents: prev.documents.filter((doc) => doc.id !== docId) } : null
    );
    toast.success("Document supprimé !");
  };

  const handleCancelRequest = () => {
    setRequest((prev) => (prev ? { ...prev, status: "ANNULEE" as RequestStatus } : null));
    setShowCancelModal(false);
    toast.success("Demande annulée !");
  };

  const handleResubmitRequest = () => {
    if (newDocuments.length === 0 && request?.status === "REJETEE") {
      toast.error("Veuillez ajouter au moins un nouveau document pour ressoumettre.");
      return;
    }

    setRequest((prev) =>
      prev
        ? {
            ...prev,
            status: "EN_ATTENTE",
            documents: [
              ...prev.documents,
              ...newDocuments.map((file, idx) => ({
                id: `DOC-${Date.now() + idx}`,
                name: file.name,
                url: URL.createObjectURL(file),
                version: 1,
                updatedAt: new Date().toISOString(),
              })),
            ],
            rejectionReason: undefined,
          }
        : null
    );
    setNewDocuments([]);
    setShowResubmitModal(false);
    toast.success("Demande ressoumise !");
  };

const handleAddNewDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    setNewDocuments((prev) => [...prev, ...Array.from(e.target.files)]);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Demande non trouvée</h2>
          <p className="text-neutral-500 dark:text-neutral-400">La demande que vous recherchez n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800 p-2 lg:p-1 space-y-6 font-outfit animate-fade-in">
      <ToastContainer />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {(request.status === "EN_COURS" || request.status === "EN_ATTENTE") && (
            <Button size="sm" variant="outline" className="text-error-500 hover:text-error-700" onClick={() => setShowCancelModal(true)}>
              Annuler la demande
            </Button>
          )}
          {(request.status === "REJETEE" || request.status === "EN_ATTENTE") && (
            <Button size="sm" variant="primary" className="bg-brand-500 hover:bg-brand-700 text-white" onClick={() => setShowResubmitModal(true)}>
              Ressoumettre
            </Button>
          )}

        </div>
      </header>

        <div className="flex items-center gap-2">
           <p className="text-theme-sm text-neutral-500 dark:text-neutral-400">Soumise le {formatDate(request.submittedAt)}</p>
            <div className="ml-2 ">
              {statusBadge(request.status)}
            </div>
              
        </div>

      {request.status === "REJETEE" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 p-4 rounded-radius-lg"
        >
          <span className="font-medium">Motif du rejet :</span> {request.rejectionReason}
        </motion.div>
      )}

      {/* Documents Section */}
      <section className="space-y-4 animate-scale-up">
        <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-50">Documents soumis</h2>
        <ul className="space-y-3">
          {request.documents.map((doc) => (
            <motion.li
              key={doc.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-radius-lg bg-white dark:bg-neutral-700"
            >
              <div>
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                  {doc.name} (v{doc.version})
                </a>
                <p className="text-theme-xs text-neutral-500 dark:text-neutral-400">
                  Mis à jour le {formatDate(doc.updatedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="xs" variant="ghost" onClick={() => setPreviewDoc(doc)} className="text-neutral-500 hover:text-brand-500">
                  <Eye className="w-4 h-4" />
                </Button>
                {(request.status === "EN_ATTENTE" || request.status === "REJETEE") && (
                  <>
                    <label className="cursor-pointer text-brand-500 hover:text-brand-700">
                      <Upload className="w-4 h-4" />
                      <input title="Ajouter un fichier" type="file" className="hidden" onChange={(e) => handleFileUpload(e, doc.id)} />
                    </label>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-error-500 hover:text-error-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

    {/* Chat Section */}
    <section className="flex flex-col h-full space-y-4 animate-scale-up">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-brand-500"></div>
          <h2 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">Discussion avec le service consulaire</h2>
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          {request.status === "EN_COURS" ? (
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              En ligne
            </span>
          ) : (
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-neutral-400 mr-2"></span>
              Hors ligne
            </span>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatRef}
        className="h-80 overflow-y-auto space-y-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-radius-lg bg-white dark:bg-neutral-700 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence>
          {request.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex max-w-[85%]">
                {msg.sender !== "user" && (
                  <div className="flex-shrink-0 mr-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-medium">
                      {msg.sender === "agent" ? "A" : "S"}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <div
                    className={`p-3 rounded-xl ${
                      msg.sender === "user"
                        ? "bg-brand-500 text-white rounded-tr-none"
                        : "bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-tl-none border border-neutral-200 dark:border-neutral-600"
                    }`}
                  >
                    {msg.replyTo && (
                      <div className={`text-xs mb-1 px-2 py-1 rounded ${
                        msg.sender === "user" 
                          ? "bg-brand-600/70 text-brand-100" 
                          : "bg-neutral-100 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-300"
                      }`}>
                        <span className="font-medium">Réponse à :</span> {request.messages.find((m) => m.id === msg.replyTo)?.text.slice(0, 40)}...
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    
                    {msg.attachment && (
                      <div className="mt-2">
                        <a
                          href={msg.attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center text-xs px-2 py-1 rounded ${
                            msg.sender === "user"
                              ? "bg-brand-600/70 text-brand-100 hover:bg-brand-600"
                              : "bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-500"
                          }`}
                        >
                          <Paperclip className="w-3 h-3 mr-1" />
                          {msg.attachment.name}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center mt-1 space-x-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDate(msg.timestamp)}
                    </span>
                    
                    {msg.sender === "user" ? (
                      <div className="flex space-x-1">
                        <button
                          title="Modifier le message"
                          type="button"
                          onClick={() => handleEditMessage(msg.id, msg.text)}
                          className="text-neutral-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          title="Supprimer le message"
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-neutral-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkAsRead(msg.id)}
                        className={`text-xs flex items-center ${
                          msg.isRead 
                            ? "text-neutral-400 dark:text-neutral-500" 
                            : "text-brand-500 dark:text-brand-400 hover:underline"
                        }`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {msg.isRead ? "Lu" : "Marquer"}
                      </button>
                    )}
                    
                    <button
                      title="Répondre au message"
                      type="button"
                      onClick={() => handleReplyToMessage(msg.id)}
                      className="text-neutral-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                    >
                      <Reply className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Message Input Area */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800 bottom-0"> 
        {replyToMessageId && (
          <div className="flex items-center justify-between mb-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
            <div className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
              <span className="font-medium">Répondre à :</span> {request.messages.find((m) => m.id === replyToMessageId)?.text.slice(0, 60)}...
            </div>
            <button
              title="Annuler la réponse"
              type="button"
              onClick={() => setReplyToMessageId(null)}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={editingMessageId ? "Modifier votre message..." : "Écrivez votre message..."}
              className="w-full p-3 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={messageInput}
              onFocus={() => setShowEmojiPicker(false)}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button
                title="Ajouter un emoji"
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 text-neutral-500 hover:text-brand-500 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <label className="p-1 text-neutral-500 hover:text-brand-500 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                <Paperclip className="w-5 h-5" />
                <input title="Ajouter un fichier" type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
          
          <button
            title="Envoyer le message"
            type="button"
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className={`p-3 rounded-xl ${
              messageInput.trim()
                ? "bg-brand-500 hover:bg-brand-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
            } transition-colors`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 right-4 z-50"
            >
              <EmojiPicker 
                onEmojiClick={(emoji) => {
                  setMessageInput((prev) => prev + emoji.emoji);
                  setShowEmojiPicker(false);
                }} 
                width={300}
                height={350}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>

    {/* Document Preview Modal */}
    <AnimatePresence>
      {previewDoc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          >
            <Modal
              isOpen={true}
              onClose={() => setPreviewDoc(null)}
              className="max-w-4xl p-6 rounded-radius-lg bg-white dark:bg-neutral-800 shadow-xl animate-scale-up"
            >
              <h2 className="text-title-md font-heading font-bold text-neutral-700 dark:text-neutral-50 mb-4">
                Prévisualisation : {previewDoc.name}
              </h2>
              <div className="relative h-[60vh] bg-neutral-100 dark:bg-neutral-700 rounded-radius-sm">
                <iframe src={previewDoc.url} title={previewDoc.name} className="w-full h-full border-none" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(previewDoc.url, "_blank")}
                  className="menu-item"
                >
                  <FileDown className="w-4 h-4 mr-1" /> Télécharger
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPreviewDoc(null)} className="menu-item">
                  Fermer
                </Button>
              </div>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Modal
              isOpen={true}
              onClose={() => setShowCancelModal(false)}
              className="max-w-md p-6 rounded-radius-lg bg-white dark:bg-neutral-800 shadow-xl animate-scale-up"
            >
              <h2 className="text-title-md font-heading font-bold text-neutral-700 dark:text-neutral-50 mb-4">
                Confirmer l'annulation
              </h2>
              <p className="text-theme-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Êtes-vous sûr de vouloir annuler cette demande ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowCancelModal(false)}>
                  Annuler
                </Button>
                <Button size="sm" variant="primary" className="bg-error-500 hover:bg-error-700 text-white" onClick={handleCancelRequest}>
                  Confirmer
                </Button>
              </div>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resubmit Modal */}
      <AnimatePresence>
        {showResubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Modal
              isOpen={true}
              onClose={() => setShowResubmitModal(false)}
              className="max-w-md p-6 rounded-radius-lg bg-white dark:bg-neutral-800 shadow-xl animate-scale-up"
            >
              <h2 className="text-title-md font-heading font-bold text-neutral-700 dark:text-neutral-50 mb-4">
                Ressoumettre la demande
              </h2>
              <p className="text-theme-sm text-neutral-500 dark:text-neutral-400 mb-4">
                Ajoutez les nouveaux documents nécessaires pour ressoumettre votre demande.
              </p>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-400">Nouveaux documents</span>
                  <input
                    type="file"
                    multiple
                    className="mt-1 w-full p-2 border rounded-radius-lg bg-white dark:bg-neutral-700 dark:text-neutral-200"
                    onChange={handleAddNewDocument}
                  />
                </label>
                {newDocuments.length > 0 && (
                  <ul className="space-y-2">
                    {newDocuments.map((file, idx) => (
                      <li key={idx} className="text-theme-sm text-neutral-700 dark:text-neutral-200">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowResubmitModal(false)}>
                  Annuler
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-brand-500 hover:bg-brand-700 text-white"
                  onClick={handleResubmitRequest}
                >
                  Ressoumettre
                </Button>
              </div>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}