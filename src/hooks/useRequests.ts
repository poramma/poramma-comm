import { useState, useCallback } from "react";
import { demandeService } from "../lib/services";
import type { Demande } from "../lib/types";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { autoTable } from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: any;
  }
}

export function useRequests() {
  const [requests, setRequests] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Liste les demandes du demandeur connecté (GET /demandes/mine). */
  const listRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await demandeService.listMine();
      setRequests(res);
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRequestById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await demandeService.getById(id);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la récupération");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Télécharge un reçu PDF officiel */
  const downloadReceipt = useCallback(async (request: Demande) => {
    const doc = new jsPDF();
    const isDark = document.documentElement.classList.contains("dark");
    const primaryColor = isDark ? "#38BDF8" : "#1D4ED8";
    const textColor = isDark ? "#FFFFFF" : "#000000";

    const logoBase64 = await fetch("/images/poramma-logo.png")
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
      );

    const qrData = await QRCode.toDataURL(request.id, { width: 80 });

    doc.addImage(logoBase64, "PNG", 15, 10, 34, 17);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("RÉCÉPISSÉ OFFICIEL DE DEMANDE", 105, 20, { align: "center" });
    doc.line(20, 28, 190, 28);

    autoTable(doc, {
      startY: 35,
      theme: "grid",
      styles: { textColor, fontSize: 11, halign: "left" },
      headStyles: { fillColor: primaryColor, textColor: "#FFFFFF" },
      head: [["Champ", "Valeur"]],
      body: [
        ["Numéro de dossier", request.dossierNumber],
        ["Service", request.subService?.name || "—"],
        ["Statut", request.status],
        ["Soumise le", new Date(request.submittedAt).toLocaleDateString("fr-FR")],
      ],
    });

    const tableHeight = (doc.lastAutoTable?.finalY || 35) + 10;
    doc.addImage(qrData, "PNG", 150, 35, 35, 35);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor("#6B7280");
    doc.text(
      "Veuillez conserver ce document comme preuve de votre demande.\n" + "Toute falsification entraînera des poursuites.",
      20,
      tableHeight + 40,
      { maxWidth: 170 }
    );

    doc.save(`${request.dossierNumber}_recu.pdf`);
  }, []);

  return {
    requests,
    loading,
    error,
    listRequests,
    getRequestById,
    downloadReceipt,
  };
}
