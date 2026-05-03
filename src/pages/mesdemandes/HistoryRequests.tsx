import React, { useState } from "react";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Search, Filter, Calendar, FileDown, Eye, X, Send, Paperclip } from "lucide-react";
import {Modal} from "../../components/ui/modal";

type RequestStatus = "EN_COURS" | "VALIDEE" | "REJETEE" | "EN_ATTENTE";

interface Request {
  id: string;
  service: string;
  submittedAt: string;
  status: RequestStatus;
  fees?: string;
  delay?: string;
  documents?: string[];
  rejectionReason?: string;
  messages?: { from: "agent" | "user"; text: string; date: string }[];
}

const mockData: Request[] = [
  {
    id: "2025-001",
    service: "Renouvellement carte consulaire",
    submittedAt: "2025-07-30T10:15:00Z",
    status: "EN_COURS",
    fees: "10 000 FCFA",
    delay: "15 jours ouvrés",
    documents: ["Copie carte consulaire", "Photo d'identité récente"],
    messages: [
      { from: "agent", text: "Bonjour, merci de fournir la copie de votre carte nationale.", date: "2025-07-31T09:00:00Z" },
      { from: "user", text: "Bonjour, je l'ai envoyée hier via email.", date: "2025-07-31T10:15:00Z" },
    ]
  },
  {
    id: "2025-004",
    service: "Certificat de perte",
    submittedAt: "2025-05-04T08:10:00Z",
    status: "REJETEE",
    rejectionReason: "Document illisible. Merci de fournir une copie claire."
  },
    {
        id: "2025-002",
        service: "Demande de passeport",
        submittedAt: "2025-08-01T12:00:00Z",
        status: "VALIDEE",
        fees: "25 000 FCFA",
        delay: "10 jours ouvrés",
        documents: ["Formulaire rempli", "Photo d'identité récente"],
        messages: [
        { from: "agent", text: "Votre demande a été validée. Vous pouvez venir récupérer votre passeport.", date: "2025-08-05T14:30:00Z" }
        ]
    },
    {
        id: "2025-003",
        service: "Attestation de résidence",
        submittedAt: "2025-06-15T11:20:00Z",
        status: "EN_ATTENTE"
    }
];

const statusBadge = (status: RequestStatus) => {
  switch (status) {
    case "EN_COURS": return <Badge variant="outline" color="brand">En cours</Badge>;
    case "VALIDEE": return <Badge variant="solid" color="success">Validée</Badge>;
    case "REJETEE": return <Badge variant="solid" color="error">Rejetée</Badge>;
    case "EN_ATTENTE": return <Badge variant="outline" color="warning">En attente</Badge>;
    default: return <Badge>—</Badge>;
  }
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

export default function HistoryRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const filteredData = mockData.filter(
    (r) =>
      (r.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter ? r.status === statusFilter : true)
  );

  const sendMessage = () => {
    if (selectedRequest && newMessage.trim()) {
      const updated = {
        ...selectedRequest,
        messages: [
          ...(selectedRequest.messages || []),
          { from: "user" as "user", text: newMessage, date: new Date().toISOString() }
        ]
      };
      setSelectedRequest(updated);
      setNewMessage("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Historique de mes demandes</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Consultez toutes vos démarches.</p>
        </div>
        <Button size="sm" variant="outline"><Filter className="w-4 h-4 mr-2" /> Filtres avancés</Button>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          aria-label="Filtrer par statut" 
          className="border rounded-lg px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="EN_COURS">En cours</option>
          <option value="VALIDEE">Validée</option>
          <option value="REJETEE">Rejetée</option>
          <option value="EN_ATTENTE">En attente</option>
        </select>
      </div>

      {/* Table desktop */}
      <div className="hidden md:block bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="text-left text-xs text-slate-500 uppercase">
              <th className="px-4 py-3">N° dossier</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{r.id}</td>
                <td className="px-4 py-3">{r.service}</td>
                <td className="px-4 py-3">{formatDate(r.submittedAt)}</td>
                <td className="px-4 py-3">{statusBadge(r.status)}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="xs" variant="outline" onClick={() => setSelectedRequest(r)}>
                    <Eye className="w-4 h-4 mr-1" /> Détails
                  </Button>
                    {r.status == "VALIDEE" && (
                        <Button size="xs" variant="ghost"><FileDown className="w-4 h-4 mr-1" /> Reçu</Button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-4 md:hidden">
        {filteredData.map((r) => (
          <div key={r.id} className="bg-white rounded-lg p-4 space-y-3 shadow">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold">{r.service}</h2>
              {statusBadge(r.status)}
            </div>
            <div className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {formatDate(r.submittedAt)}
            </div>
            <div className="text-xs text-slate-500">N° dossier : {r.id}</div>
            <div className="flex justify-end space-x-2">
                <Button size="xs" variant="outline" onClick={() => setSelectedRequest(r)}>
                    <Eye className="w-4 h-4 mr-1" /> Détails
                </Button>
                {r.status === "VALIDEE" && (
                    <Button size="xs" variant="ghost">
                    <FileDown className="w-4 h-4 mr-1" /> Reçu
                    </Button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal détails */}
      {selectedRequest && (
        <Modal isOpen={true} onClose={() => setSelectedRequest(null)} className="max-w-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Détails de la demande</h2>
            <button onClick={() => setSelectedRequest(null)}><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span><strong>N° dossier :</strong> {selectedRequest.id}</span>
              {statusBadge(selectedRequest.status)}
            </div>
            <p><strong>Service :</strong> {selectedRequest.service}</p>
            <p><strong>Date de soumission :</strong> {formatDate(selectedRequest.submittedAt)}</p>
            {selectedRequest.fees && <p><strong>Frais :</strong> {selectedRequest.fees}</p>}
            {selectedRequest.delay && <p><strong>Délai :</strong> {selectedRequest.delay}</p>}
            {selectedRequest.documents && (
              <div>
                <strong>Documents fournis :</strong>
                <ul className="list-disc ml-5">
                  {selectedRequest.documents.map((doc, i) => <li key={i}>{doc}</li>)}
                </ul>
              </div>
            )}
            {selectedRequest.status === "REJETEE" && selectedRequest.rejectionReason && (
              <p className="text-red-600"><strong>Motif du rejet :</strong> {selectedRequest.rejectionReason}</p>
            )}

            {/* Discussion */}
            <div className="border rounded-lg p-3 h-60 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2">
                {selectedRequest.messages?.map((msg, i) => (
                  <div key={i} className={`p-2 rounded-lg max-w-xs ${msg.from === "user" ? "bg-brand-50 self-end" : "bg-slate-100"}`}>
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-xs text-slate-400">{formatDate(msg.date)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  className="flex-1 border rounded-lg px-3 py-2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                    title="Envoyer"
                     className="p-2 rounded-lg bg-brand-500 text-white" onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </button>
                <button 
                    title="Joindre un fichier"
                    className="p-2 rounded-lg bg-slate-200">
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
