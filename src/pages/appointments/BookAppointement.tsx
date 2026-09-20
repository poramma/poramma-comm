import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Clock, Info } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import RegistrationStatusCard from "../../components/registration/RegistrationStatusCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRegistration } from "../../context/RegistrationContext";
import { catalogService, cultureService, rendezvousService } from "../../lib/services";
import type { CatalogService, CultureAdvisor, RendezVous, RendezVousSlot, ServiceSchedule } from "../../lib/types";

const DAY_LABELS = ["", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** "Lun, Mar, Mer : 09:00–15:00" — regroupe les jours qui partagent les mêmes horaires. */
function formatHours(schedules: ServiceSchedule[]): string[] {
  const byRange = new Map<string, number[]>();
  for (const s of schedules.filter((x) => x.isActive !== false)) {
    const key = `${s.startTime.slice(0, 5)}–${s.endTime.slice(0, 5)}`;
    byRange.set(key, [...(byRange.get(key) ?? []), s.dayOfWeek]);
  }
  return [...byRange.entries()].map(([range, days]) => `${[...new Set(days)].sort().map((d) => DAY_LABELS[d]).join(", ")} : ${range}`);
}

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
const formatLongDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const errorMessage = (err: any, fallback: string) => err?.response?.data?.message || fallback;

export default function BookAppointment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rescheduleId = params.get("reschedule");
  // ?culture=1 : rendez-vous avec le Conseiller Culturel (espace culturel, à visage découvert).
  const cultureMode = params.get("culture") === "1";
  const { isValidated, loading: registrationLoading } = useRegistration();

  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [advisors, setAdvisors] = useState<CultureAdvisor[]>([]);
  const [existing, setExisting] = useState<RendezVous | null>(null); // rendez-vous à déplacer
  const [subServiceId, setSubServiceId] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<RendezVousSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Services réservables : sous-services actifs qui ont des horaires d'ouverture.
  const bookable = useMemo(
    () =>
      catalog.flatMap((svc) =>
        svc.subServices
          .filter((s) => s.active !== false && (s.schedules ?? []).some((h) => h.isActive !== false))
          .map((s) => ({ id: s.id, label: `${svc.name} — ${s.name}`, name: s.name, schedules: s.schedules ?? [] }))
      ),
    [catalog]
  );
  const selected = bookable.find((s) => s.id === subServiceId);

  useEffect(() => {
    if (cultureMode) {
      // Les prestations culturelles sont hors du catalogue consulaire : on les lit dans l'espace culturel.
      cultureService
        .overview()
        .then((o) => {
          setAdvisors(o.advisors);
          setCatalog(
            o.services.map((s) => ({
              id: s.id,
              name: s.name,
              active: true,
              subServices: s.subServices.filter((sub) => sub.kind === "RENDEZ_VOUS").map((sub) => ({ id: sub.id, name: sub.name, active: true, schedules: sub.schedules })),
            }))
          );
        })
        .catch(() => toast.error("Impossible de charger l'espace culturel"));
      return;
    }
    catalogService.listServices().then(setCatalog).catch(() => toast.error("Impossible de charger la liste des services"));
  }, [cultureMode]);

  // Un seul rendez-vous culturel possible : on le sélectionne d'office.
  useEffect(() => {
    if (cultureMode && !rescheduleId && !subServiceId && bookable.length === 1) setSubServiceId(bookable[0].id);
  }, [cultureMode, rescheduleId, subServiceId, bookable]);

  // Déplacement : on charge le rendez-vous concerné et on fige son service.
  useEffect(() => {
    if (!rescheduleId) return;
    rendezvousService
      .getById(rescheduleId)
      .then((r) => {
        if (!r.canModify) {
          toast.error("Ce rendez-vous ne peut plus être déplacé.");
          navigate("/services/rendez-vous", { replace: true });
          return;
        }
        setExisting(r);
        setSubServiceId(r.subService?.id ?? "");
      })
      .catch(() => {
        toast.error("Rendez-vous introuvable.");
        navigate("/services/rendez-vous", { replace: true });
      });
  }, [rescheduleId, navigate]);

  // Jours qui ont au moins un créneau libre.
  useEffect(() => {
    setDates([]);
    setDate("");
    setSlots([]);
    setStartTime("");
    if (!subServiceId || !isValidated) return;
    setLoadingDates(true);
    rendezvousService
      .listAvailableDates(subServiceId, 30)
      .then(setDates)
      .catch((e) => toast.error(errorMessage(e, "Impossible de charger les jours disponibles")))
      .finally(() => setLoadingDates(false));
  }, [subServiceId, isValidated]);

  const loadSlots = (forDate: string) => {
    setLoadingSlots(true);
    setStartTime("");
    rendezvousService
      .listSlots(subServiceId, forDate)
      .then(setSlots)
      .catch((e) => toast.error(errorMessage(e, "Impossible de charger les créneaux")))
      .finally(() => setLoadingSlots(false));
  };

  useEffect(() => {
    if (date && subServiceId) loadSlots(date);
    else setSlots([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleConfirm = async () => {
    if (!subServiceId || !date || !startTime) return;
    if (!existing && motif.trim().length < 3) {
      toast.error("Précisez le motif de votre rendez-vous.");
      return;
    }
    setSubmitting(true);
    try {
      if (existing) {
        await rendezvousService.reschedule(existing.id, { date, startTime });
        toast.success("Votre rendez-vous a été déplacé. L'ambassade le confirmera à nouveau.");
      } else {
        await rendezvousService.book({ subServiceId, date, startTime, motif: motif.trim() });
        toast.success("Rendez-vous enregistré. L'ambassade le confirmera prochainement.");
      }
      setTimeout(() => navigate(cultureMode ? "/culture" : "/services/rendez-vous"), 1200);
    } catch (err: any) {
      toast.error(errorMessage(err, "Erreur lors de la prise de rendez-vous"));
      loadSlots(date); // le créneau a peut-être été pris entre-temps
    } finally {
      setSubmitting(false);
    }
  };

  const title = existing ? "Déplacer mon rendez-vous" : cultureMode ? "Rendez-vous avec le Conseiller Culturel" : "Prise de rendez-vous";
  const card = "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-4";

  return (
    <>
      <PageMeta title={title} description="Réservez un créneau auprès de l'ambassade." />
      <PageBreadcrumb pageTitle={title} />
      <ToastContainer />

      <div className="p-6 space-y-6">
        {registrationLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500" />
          </div>
        ) : !isValidated ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pour prendre rendez-vous, vous devez d'abord être enregistré(e) auprès de l'ambassade.
            </p>
            <RegistrationStatusCard />
          </>
        ) : (
          <>
            {existing && (
              <div className="flex gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-gray-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-gray-200">
                <Info className="h-5 w-5 shrink-0 text-brand-600" />
                <p>
                  Rendez-vous actuel : <b>{existing.subService?.name}</b>, le <b>{formatLongDay(existing.date)}</b> à <b>{existing.startTime}</b> ({existing.ticketId}).
                  Choisissez un nouveau créneau ci-dessous.
                </p>
              </div>
            )}

            {cultureMode && advisors.length > 0 && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-gray-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-gray-200">
                Vous serez reçu(e) par <b>{advisors.map((a) => `${a.name} (${a.title})`).join(" ou ")}</b>.
              </div>
            )}

            <div className={card}>
              <Label>Service concerné</Label>
              {existing ? (
                <p className="text-sm text-gray-800 dark:text-gray-200">{existing.subService?.name}</p>
              ) : (
                <Select
                  options={bookable.map((s) => ({ value: s.id, label: s.label }))}
                  defaultValue={subServiceId}
                  onChange={(value) => setSubServiceId(value)}
                  placeholder="Sélectionnez le service"
                />
              )}
              {selected && formatHours(selected.schedules).length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Horaires du service</p>
                  {formatHours(selected.schedules).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
            </div>

            {subServiceId && !existing && (
              <div className={card}>
                <Label>Motif du rendez-vous *</Label>
                <TextArea
                  rows={3}
                  value={motif}
                  onChange={(v) => setMotif(v.slice(0, 500))}
                  placeholder={cultureMode ? "Présentez brièvement votre projet ou l'objet de l'entretien…" : "Pourquoi souhaitez-vous rencontrer l'ambassade ? (ex. retrait de passeport, légalisation…)"}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Le motif est transmis à l'agent{cultureMode ? " et au Conseiller Culturel" : ""} pour préparer votre rendez-vous. {motif.length}/500
                </p>
              </div>
            )}

            {subServiceId && (
              <div className={card}>
                <Label>Jour souhaité</Label>
                {loadingDates ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recherche des jours disponibles…</p>
                ) : dates.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun créneau n'est disponible dans les 30 prochains jours pour ce service. Réessayez plus tard.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {dates.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDate(d)}
                        className={`rounded-lg border px-2 py-2 text-sm capitalize ${
                          date === d
                            ? "bg-brand-500 text-white border-brand-500"
                            : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {formatDay(d)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {date && (
              <div className={card}>
                <Label>Heure — {formatLongDay(date)}</Label>
                {loadingSlots ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des créneaux…</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucun créneau à cette date — choisissez un autre jour.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.startTime}
                        type="button"
                        disabled={!s.isAvailable}
                        title={s.isAvailable ? undefined : "Créneau complet"}
                        onClick={() => setStartTime(s.startTime)}
                        className={`flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm ${
                          !s.isAvailable
                            ? "cursor-not-allowed border-gray-200 text-gray-300 line-through dark:border-gray-800 dark:text-gray-600"
                            : startTime === s.startTime
                              ? "bg-brand-500 text-white border-brand-500"
                              : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> {s.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {startTime && (
              <div className={card}>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selected?.name ?? existing?.subService?.name} — <b>{formatLongDay(date)}</b> à <b>{startTime}</b>. Le rendez-vous sera confirmé par l'ambassade.
                </p>
                {!existing && motif.trim().length < 3 && <p className="text-sm text-warning-600">Renseignez le motif du rendez-vous (plus haut) pour pouvoir réserver.</p>}
                <Button onClick={handleConfirm} disabled={submitting || (!existing && motif.trim().length < 3)} className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  {submitting ? "Enregistrement…" : existing ? "Confirmer le nouveau créneau" : "Réserver ce créneau"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
