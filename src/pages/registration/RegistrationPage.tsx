import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft, ArrowRight, CheckCircle2, FileCheck2, Trash2, Upload } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import StepIndicator from "../../components/demandes/StepIndicator";
import RegistrationStatusCard from "../../components/registration/RegistrationStatusCard";
import RegistrationDossier from "../../components/registration/RegistrationDossier";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { useAuth } from "../../context/AuthContext";
import { useRegistration } from "../../context/RegistrationContext";
import { documentService, registrationService, userService } from "../../lib/services";
import type { MyDocument, RegistrationDocumentItem, UserType } from "../../lib/types";

const STEPS = ["Votre situation", "Informations", "Pièces justificatives", "Envoi du dossier"];

const USER_TYPES: { value: UserType; label: string; hint: string }[] = [
  { value: "student", label: "Étudiant(e)", hint: "Inscrit(e) dans un établissement au Maroc" },
  { value: "worker", label: "Travailleur(se)", hint: "Salarié(e) ou indépendant(e) au Maroc" },
  { value: "migrant", label: "Migrant(e)", hint: "En situation de migration ou de transit" },
  { value: "other", label: "Autre", hint: "Autre situation" },
];

const UNIVERSITIES = [
  "Université Mohammed V de Rabat",
  "Université Hassan II de Casablanca",
  "Université Cadi Ayyad de Marrakech",
  "Université Sidi Mohamed Ben Abdellah de Fès",
  "Université Ibn Tofail de Kénitra",
  "Université Abdelmalek Essaâdi de Tétouan",
  "Université Chouaib Doukkali d'El Jadida",
  "Université Ibn Zohr d'Agadir",
  "Université Mohammed Premier d'Oujda",
  "Université Moulay Ismail de Meknès",
  "Autre établissement",
];

const STUDY_LEVELS = ["Baccalauréat", "Bac +1", "Bac +2", "Licence (Bac +3)", "Master (Bac +5)", "Doctorat (Bac +8)", "Autre"];
const CONTRACT_TYPES = ["CDI", "CDD", "Stage", "Freelance", "Intérim", "Autre"];

const DOC_TYPE_LABELS: Record<string, string> = {
  ID_CARD: "Carte d'identité malienne",
  PASSPORT: "Passeport",
  STUDENT_CERT: "Certificat de scolarité",
  STUDENT_CARD: "Carte d'étudiant",
  SCHOLARSHIP_PROOF: "Justificatif de bourse",
  CONSULAR_CARD: "Carte consulaire",
  PROOF_ADDRESS: "Justificatif de domicile",
};

const errMessage = (err: any, fallback: string) => err?.response?.data?.message || fallback;

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registration, refresh } = useRegistration();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Étape 1 — situation
  const [userType, setUserType] = useState<UserType | "">("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [names, setNames] = useState({ firstName: "", lastName: "" });

  // Étape 2 — informations selon le profil
  const [university, setUniversity] = useState("");
  const [otherUniversity, setOtherUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [isScholar, setIsScholar] = useState(false);
  const [decisionNumber, setDecisionNumber] = useState("");
  const [promotion, setPromotion] = useState("");
  const [employer, setEmployer] = useState("");
  const [profession, setProfession] = useState("");
  const [contractType, setContractType] = useState("");

  // Étape 3 — pièces
  const [myDocs, setMyDocs] = useState<MyDocument[]>([]);
  const [chosenType, setChosenType] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    userService
      .getProfile(user.id)
      .then((p) => {
        setNames({ firstName: p.personalInfo.firstName, lastName: p.personalInfo.lastName });
        setPhone(p.personalInfo.phone || "");
        setCity(p.address.city || "");
        setAddress(p.address.address || "");
        if (p.userType && (registration?.registrationStatus === "REJECTED" || p.userType !== "other")) setUserType(p.userType as UserType);
        if (p.studentProfile) {
          const known = UNIVERSITIES.includes(p.studentProfile.university ?? "");
          setUniversity(known ? p.studentProfile.university! : p.studentProfile.university ? "Autre établissement" : "");
          setOtherUniversity(known ? "" : p.studentProfile.university ?? "");
          setFaculty(p.studentProfile.faculty ?? "");
          setStudyLevel(p.studentProfile.studyLevel ?? "");
          setIsScholar(!!p.studentProfile.scholarship?.isRecipient);
          setDecisionNumber(p.studentProfile.scholarship?.decisionNumber ?? "");
          setPromotion(p.studentProfile.scholarship?.promotion ?? "");
        }
        if (p.workerProfile) {
          setEmployer(p.workerProfile.employer ?? "");
          setProfession(p.workerProfile.profession ?? "");
          setContractType(p.workerProfile.contractType ?? "");
        }
      })
      .catch(() => toast.error("Impossible de charger votre profil."))
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadDocs = () => documentService.listMine().then(setMyDocs).catch(() => undefined);
  useEffect(() => {
    loadDocs();
  }, []);

  const docById = useMemo(() => new Map(myDocs.map((d) => [d.id, d])), [myDocs]);
  const effectiveUniversity = university === "Autre établissement" ? otherUniversity : university;

  // Dossier déjà transmis / validé / suspendu : pas de nouvel assistant, juste l'état.
  if (registration && ["SUBMITTED", "VALIDATED", "SUSPENDED"].includes(registration.registrationStatus)) {
    return (
      <>
        <PageMeta title="Mon dossier" description="Mon dossier d'enregistrement auprès de l'ambassade" />
        <PageBreadcrumb pageTitle="Mon dossier d'enregistrement" />
        <div className="space-y-6 max-w-3xl">
          <RegistrationStatusCard hideAction />
          <RegistrationDossier />
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </div>
      </>
    );
  }

  const saveStepOne = async (): Promise<boolean> => {
    const next: Record<string, string> = {};
    if (!userType) next.userType = "Choisissez votre situation";
    if (!city.trim()) next.city = "La ville de résidence est requise";
    setErrors(next);
    if (Object.keys(next).length) return false;

    await userService.updatePersonalInfo(user!.id, {
      firstName: names.firstName,
      lastName: names.lastName,
      userType: userType as UserType,
      ...(phone.trim() ? { phone: phone.trim() } : {}),
    });
    await userService.updateAddress(user!.id, { city: city.trim(), address: address.trim(), country: "Maroc" });
    await refresh();
    return true;
  };

  const saveStepTwo = async (): Promise<boolean> => {
    const next: Record<string, string> = {};
    if (userType === "student") {
      if (!effectiveUniversity.trim()) next.university = "L'établissement est requis";
      if (!faculty.trim()) next.faculty = "La faculté ou filière est requise";
      if (!studyLevel) next.studyLevel = "Le niveau d'études est requis";
    }
    if (userType === "worker") {
      if (!employer.trim()) next.employer = "L'employeur est requis";
      if (!profession.trim()) next.profession = "La profession est requise";
    }
    setErrors(next);
    if (Object.keys(next).length) return false;

    if (userType === "student") {
      await userService.updateStudentProfile(user!.id, {
        university: effectiveUniversity.trim(),
        faculty: faculty.trim(),
        studyLevel,
        scholarship: isScholar ? { isRecipient: true, decisionNumber, promotion } : { isRecipient: false },
      });
    } else if (userType === "worker") {
      await userService.updateWorkerProfile(user!.id, { employer: employer.trim(), profession: profession.trim(), contractType });
    }
    await refresh();
    return true;
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      if (step === 0 && !(await saveStepOne())) return;
      if (step === 1 && !(await saveStepTwo())) return;
      if (step === 2) {
        const latest = await refresh();
        if (latest && !latest.documents.complete) {
          toast.error(`Pièces manquantes : ${latest.documents.missing.join(", ")}`);
          return;
        }
      }
      setStep((s) => s + 1);
    } catch (err) {
      toast.error(errMessage(err, "Impossible d'enregistrer ces informations."));
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (item: RegistrationDocumentItem, file: File | undefined) => {
    if (!file) return;
    const type = chosenType[item.key] ?? item.acceptedTypes[0];
    setUploadingKey(item.key);
    try {
      await documentService.upload(file, type);
      await Promise.all([loadDocs(), refresh()]);
      toast.success("Pièce enregistrée.");
    } catch (err) {
      toast.error(errMessage(err, "Échec de l'envoi du fichier (PDF, JPG ou PNG, 20 Mo max)."));
    } finally {
      setUploadingKey(null);
    }
  };

  const handleRemove = async (documentId: string) => {
    try {
      await documentService.remove(documentId);
      await Promise.all([loadDocs(), refresh()]);
    } catch (err) {
      toast.error(errMessage(err, "Cette pièce ne peut plus être supprimée."));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await registrationService.submit();
      await refresh();
      toast.success("Votre dossier d'enregistrement a bien été reçu par l'ambassade.");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const details = err?.response?.data?.details;
      const missing = [...(details?.informations ?? []), ...(details?.documents ?? [])];
      toast.error(missing.length ? `Dossier incomplet : ${missing.join(", ")}` : errMessage(err, "Impossible d'envoyer le dossier."));
    } finally {
      setSaving(false);
    }
  };

  const sectionInfo = () => {
    if (userType === "student") {
      return (
        <div className="space-y-4">
          <div>
            <Label>Université / établissement *</Label>
            <Select
              options={UNIVERSITIES.map((u) => ({ value: u, label: u }))}
              defaultValue={university}
              onChange={(v) => setUniversity(v)}
              placeholder="Sélectionnez votre établissement"
              error={!!errors.university}
              hint={errors.university}
            />
          </div>
          {university === "Autre établissement" && (
            <div>
              <Label>Nom de l'établissement *</Label>
              <Input value={otherUniversity} onChange={(e) => setOtherUniversity(e.target.value)} placeholder="Nom de votre établissement" />
            </div>
          )}
          <div>
            <Label>Faculté / filière *</Label>
            <Input value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="Ex : Faculté des Sciences, Informatique" error={!!errors.faculty} hint={errors.faculty} />
          </div>
          <div>
            <Label>Niveau d'études *</Label>
            <Select
              options={STUDY_LEVELS.map((l) => ({ value: l, label: l }))}
              defaultValue={studyLevel}
              onChange={(v) => setStudyLevel(v)}
              placeholder="Sélectionnez votre niveau"
              error={!!errors.studyLevel}
              hint={errors.studyLevel}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={isScholar} onChange={(e) => setIsScholar(e.target.checked)} className="rounded" />
            Je suis boursier(ère) de l'État malien
          </label>
          {isScholar && (
            <div className="grid sm:grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
              <div>
                <Label>Numéro de décision</Label>
                <Input value={decisionNumber} onChange={(e) => setDecisionNumber(e.target.value)} />
              </div>
              <div>
                <Label>Promotion (année)</Label>
                <Input value={promotion} onChange={(e) => setPromotion(e.target.value)} placeholder="Ex : 2025" />
              </div>
            </div>
          )}
        </div>
      );
    }
    if (userType === "worker") {
      return (
        <div className="space-y-4">
          <div>
            <Label>Employeur *</Label>
            <Input value={employer} onChange={(e) => setEmployer(e.target.value)} error={!!errors.employer} hint={errors.employer} />
          </div>
          <div>
            <Label>Profession *</Label>
            <Input value={profession} onChange={(e) => setProfession(e.target.value)} error={!!errors.profession} hint={errors.profession} />
          </div>
          <div>
            <Label>Type de contrat</Label>
            <Select
              options={CONTRACT_TYPES.map((c) => ({ value: c, label: c }))}
              defaultValue={contractType}
              onChange={(v) => setContractType(v)}
              placeholder="Sélectionnez"
            />
          </div>
        </div>
      );
    }
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Aucune information complémentaire n'est demandée pour votre situation. Passez à l'étape suivante pour déposer vos pièces.
      </p>
    );
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="space-y-5">
          <div>
            <Label>Votre situation *</Label>
            <div className="grid sm:grid-cols-2 gap-3 mt-1">
              {USER_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setUserType(t.value)}
                  className={`text-left rounded-xl border p-4 transition ${
                    userType === t.value
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-brand-300"
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{t.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.hint}</div>
                </button>
              ))}
            </div>
            {errors.userType && <p className="text-sm text-error-500 mt-1">{errors.userType}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Ville de résidence au Maroc *</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex : Rabat" error={!!errors.city} hint={errors.city} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 6 12 34 56 78" />
            </div>
          </div>
          <div>
            <Label>Adresse au Maroc</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Numéro, rue, quartier" />
          </div>
        </div>
      );
    }

    if (step === 1) return sectionInfo();

    if (step === 2) {
      const items = registration?.documents.items ?? [];
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Déposez vos pièces (PDF, JPG ou PNG, 20 Mo maximum). Elles seront consultées par les agents de l'ambassade. Les pièces marquées * sont obligatoires.
          </p>
          {items.map((item) => {
            const doc = item.documentId ? docById.get(item.documentId) : undefined;
            const type = chosenType[item.key] ?? item.acceptedTypes[0];
            return (
              <div key={item.key} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.label} {!item.optional && <span className="text-error-500">*</span>}
                  </div>
                  {item.provided && <FileCheck2 className="w-5 h-5 text-success-600 shrink-0" />}
                </div>

                {item.provided && doc ? (
                  <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>
                      {doc.file?.originalName ?? "Document"} — {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    </span>
                    {doc.status === "UPLOADED" && (
                      <button type="button" onClick={() => handleRemove(doc.id)} className="text-error-500 hover:text-error-700" title="Supprimer cette pièce">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    {item.acceptedTypes.length > 1 && (
                      <select
                        aria-label="Type de pièce"
                        value={type}
                        onChange={(e) => setChosenType((p) => ({ ...p, [item.key]: e.target.value }))}
                        className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"
                      >
                        {item.acceptedTypes.map((t) => (
                          <option key={t} value={t}>
                            {DOC_TYPE_LABELS[t] ?? t}
                          </option>
                        ))}
                      </select>
                    )}
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-brand-600 hover:text-brand-700">
                      <Upload className="w-4 h-4" />
                      {uploadingKey === item.key ? "Envoi en cours…" : "Choisir un fichier"}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        disabled={uploadingKey !== null}
                        onChange={(e) => {
                          handleUpload(item, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Vérifiez votre dossier. Une fois envoyé, il sera examiné par un agent de l'ambassade ; vous serez informé de la décision et pourrez alors accéder aux services (demandes, rendez-vous, échanges).
        </p>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li><strong>Situation :</strong> {USER_TYPES.find((t) => t.value === userType)?.label ?? "—"}</li>
          <li><strong>Ville :</strong> {city || "—"}</li>
          {userType === "student" && (
            <>
              <li><strong>Établissement :</strong> {effectiveUniversity || "—"}</li>
              <li><strong>Filière / niveau :</strong> {faculty || "—"} — {studyLevel || "—"}</li>
              <li><strong>Bourse :</strong> {isScholar ? "Boursier(ère)" : "Non boursier(ère)"}</li>
            </>
          )}
          {userType === "worker" && (
            <li><strong>Emploi :</strong> {profession || "—"} chez {employer || "—"}</li>
          )}
          <li><strong>Pièces déposées :</strong> {registration?.documents.items.filter((d) => d.provided).length ?? 0}</li>
        </ul>
        {registration && !registration.canSubmit && (
          <div className="rounded-lg bg-warning-50 dark:bg-warning-500/10 p-3 text-sm text-warning-800 dark:text-warning-200">
            Il manque encore : {[...registration.info.missing, ...registration.documents.missing].join(", ")}.
          </div>
        )}
      </div>
    );
  };

  const isLast = step === STEPS.length - 1;

  return (
    <>
      <PageMeta title="Enregistrement" description="Enregistrement auprès de l'ambassade du Mali" />
      <PageBreadcrumb pageTitle="Enregistrement auprès de l'ambassade" />
      <ToastContainer />
      <div className="max-w-3xl space-y-6">
        {registration?.registrationStatus === "REJECTED" && <RegistrationStatusCard />}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 sm:p-6 space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Votre compte existe déjà : il reste à vous faire connaître de l'ambassade pour accéder aux services consulaires.
          </p>
          <StepIndicator steps={STEPS} currentStep={step} />
          {!loaded ? <p className="text-sm text-gray-500">Chargement…</p> : renderStep()}
          <div className="flex justify-between">
            <Button variant="outline" disabled={step === 0 || saving} onClick={() => setStep((s) => Math.max(0, s - 1))} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Précédent
            </Button>
            <Button
              variant="primary"
              disabled={saving || !loaded || (isLast && !registration?.canSubmit)}
              onClick={isLast ? handleSubmit : handleNext}
              className="flex items-center gap-2"
            >
              {saving ? (
                "Enregistrement…"
              ) : isLast ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Envoyer mon dossier
                </>
              ) : (
                <>
                  Suivant <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
