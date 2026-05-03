import { useState, useCallback } from "react";
import { requestService } from "../api/services/requestService";
import { RequestDTO, RequestResponseDTO } from "../api/dto/RequestDTO";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { autoTable } from "jspdf-autotable";

export function useRequests() {
  const [requests, setRequests] = useState<RequestResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Créer une nouvelle demande */
  const createRequest = useCallback(async (data: RequestDTO) => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestService.create(data);
      // Mettre à jour la liste locale
      setRequests((prev) => [...prev, res]);
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Lister toutes les demandes */
  const listRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestService.list();
      setRequests(res);
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Récupérer une demande par ID */
  const getRequestById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestService.getById(id);
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la récupération");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

    /** Annuler une demande */
    const cancelRequest = useCallback(async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const res = await requestService.cancel(id);
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "CANCELED" } : r))
        );
        return res;
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors de l'annulation");
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);
  
    /** Mettre à jour une demande */
    const updateRequest = useCallback(async (id: string, data: RequestDTO) => {
      try {
        setLoading(true);
        setError(null);
        const res = await requestService.update(id, data);
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...data } : r))
        );
        return res;
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors de la mise à jour");
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);
  
    /** Supprimer une demande */
    const deleteRequest = useCallback(async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await requestService.delete(id);
        setRequests((prev) => prev.filter((r) => r.id !== id));
        return true;
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors de la suppression");
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

    /** Supprimer un document d'une demande */
    const deleteDocument = useCallback(async (id: string, docId: string) => {
      try {
        setLoading(true);
        setError(null);
        await requestService.deleteDocument(id, docId);
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, documents: r.documents.filter((d) => d.id !== docId) }
              : r
          )
        );
        return true;
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors de la suppression");
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

    /** Télécharger un document d'une demande */
    const downloadDocument = useCallback(async (id: string, docId: string) => {
      try {
        setLoading(true);
        setError(null);
        const res = await requestService.downloadDocument(id, docId);
        return res;
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors du téléchargement");
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

      /** Télécharger un reçu PDF officiel */
    const downloadReceipt = useCallback(async (request: RequestResponseDTO) => {
      const doc = new jsPDF();
      const isDark = document.documentElement.classList.contains("dark");
      const primaryColor = isDark ? "#38BDF8" : "#1D4ED8";
      const textColor = isDark ? "#FFFFFF" : "#000000";

      // Logo
      const logoBase64 = await fetch("/images/logo/fivision-logo.png")
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            })
        );

      // QR Code
      const qrData = await QRCode.toDataURL(request.id, { width: 80 });

      // Header
      doc.addImage(logoBase64, "PNG", 15, 10, 25, 25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.text("RÉCÉPISSÉ OFFICIEL DE DEMANDE", 105, 20, { align: "center" });
      doc.line(20, 28, 190, 28);

      // Infos principales
      autoTable(doc, {
        startY: 35,
        theme: "grid",
        styles: { textColor, fontSize: 11, halign: "left" },
        headStyles: { fillColor: primaryColor, textColor: "#FFFFFF" },
        head: [["Champ", "Valeur"]],
        body: [
          ["Numéro de demande", request.id],
          ["Service", request.service?.name || "—"],
          ["Nom complet", request.formInfo.nom || "—"],
          ["Date de naissance", request.formInfo.dateNaissance || "—"],
          ["Nationalité", request.formInfo.nationalite || "—"],
          ["Statut", request.status],
        ],
      });

      // QR à droite
      const tableHeight = (doc.lastAutoTable?.finalY || 35) + 10;
      doc.addImage(qrData, "PNG", 150, 35, 35, 35);

      // Mentions
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor("#6B7280");
      doc.text(
        "Veuillez conserver ce document comme preuve de votre demande.\n" +
          "Toute falsification entraînera des poursuites.",
        20,
        tableHeight + 40,
        { maxWidth: 170 }
      );

      doc.save(`${request.id}_receipt.pdf`);
    }, []);
    

  return {
    requests,
    loading,
    error,
    createRequest,
    listRequests,
    getRequestById,
    cancelRequest,
    updateRequest,
    deleteRequest,
    deleteDocument,
    downloadDocument,
    downloadReceipt,
  };

}
