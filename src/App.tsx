import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import MyRequestsManager from "./pages/mesdemandes/MyRequestsManager";
import RequestDetails from "./pages/mesdemandes/RequestDetails";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import HomePage from "./pages/welcomePage/HomePage";
import { DemandePasseport, RenouvellementPasseport, PasseportMineur, RetraitPasseport, PasseportOrdinaire } from "./pages/services/passeport";
import CarteConsulaireNouvelle from "./pages/services/carte-consulaire/Nouvelle";
import CarteConsulaireRenouvellement from "./pages/services/carte-consulaire/Renouvellement";
import { Attestations, Legalisation, CertificatNationalite, AutorisationParentale } from "./pages/services/juridiques-attestations";
import { ActeNaissance, ActeMariage, ActeDivorce, ActeDeces } from "./pages/services/etat-civil";
import { Celibat, TransfertCorps,Procuration, DemandeParticuliere } from "./pages/services/demande-speciales";
import { LaissezPasser, Visa3Mois, Visa6mois, AutorisationSortie } from "./pages/services/visa-voyage";
import { LegalisationActeNaissance, LegalisationCertificatNationalite,
         LegalisationCopiePasseport, LegalisationCasierJudiciaire, LegalisationCasierJudiciaireEtudiant } from "./pages/services/legalisations";
import { ProcurationMandatsSpeciaux, ProcurationRetraitPasseport, ProcurationRetraitCarteBiometrique } from "./pages/services/procurations";
import BookAppointment from "./pages/appointments/BookAppointement";
import MyAppointments from "./pages/appointments/MyAppointments";
import { EnrolementCarteBiometrique, EnrolementNINA, FicheEtatCivil, FicheIndividuelleNINA, RetraitCarteBiometrique } from "./pages/services/document-identite";
import StudentSpace from "./pages/student/StudentSpace";
import BasicHomePage from "./pages/student/BasicHomePage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        {/* Services Consulaires */}
        <Routes>
          <Route
            index
            path="/"
            element={
              <HomePage />
            }
          />
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/dashboard" element={<Home />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            
            {/* Mes Demandes */}
            <Route
              path="/services/*"
              element={
                <Routes>
                
                  <Route
                    path="mesdemandes/gerer"
                    element={<MyRequestsManager />}
                  />
                  <Route
                    path="mesdemandes/details/:id"
                    element={<RequestDetails />}
                  />
                  {/* Services Rendez-vous*/}
                  <Route path="rendez-vous" element={<MyAppointments />} />
                  <Route path="rendez-vous/nouveau" element={<BookAppointment />} />

                  {/* Document Identite Services */}
                  <Route path="documents-identite/enrolement-carte-biometrique" element={<EnrolementCarteBiometrique />} />
                  <Route path="documents-identite/enrolement-nina" element={<EnrolementNINA />} />
                  <Route path="documents-identite/fiche-etat-civil" element={<FicheEtatCivil />} />
                  <Route path="documents-identite/fiche-individuelle-nina" element={<FicheIndividuelleNINA />} />
                  <Route path="documents-identite/retrait-carte-biometrique" element={<RetraitCarteBiometrique />} />


                  {/* Passport Services */}
                  <Route
                    path="passeport/demande"
                    element={<DemandePasseport />}
                  />
                  <Route
                    path="passeport/renouvellement"
                    element={<RenouvellementPasseport />}
                  />
                  <Route path="passeport/mineur" element={<PasseportMineur />} />
                  <Route
                    path="passeport/retrait"
                    element={<RetraitPasseport />}
                  />
                  <Route
                    path="passeport/ordinaire"
                    element={<PasseportOrdinaire />}
                  />

                  {/* Carte Consulaire Services */}
                  <Route
                    path="carte-consulaire/renouvellement"
                    element={<CarteConsulaireRenouvellement />}
                  />
                  <Route
                    path="carte-consulaire/nouvelle"
                    element={<CarteConsulaireNouvelle />}
                  />

                  {/* Visa and Travel Services */}
                  <Route
                    path="visa-voyage/visa-3mois"
                    element={<Visa3Mois />}
                  />
                  <Route
                    path="visa-voyage/visa-6mois"
                    element={<Visa6mois />}
                  />
                  <Route
                    path="visa-voyage/laissez-passer"
                    element={<LaissezPasser />}
                  />
                  <Route
                    path="visa-voyage/autorisation-sortie" 
                    element={<AutorisationSortie />}
                  />

                  {/* Juridiques Attestations Services */}
                  <Route path="attestations/attestation" element={<Attestations />} />
                  <Route path="juridiques/legalisation" element={<Legalisation />} />
                  <Route path="juridiques/nationalite" element={<CertificatNationalite />} />
                  <Route path="autorisations/autorisation-parentale" element={<AutorisationParentale />} />

                  {/* Etat Civil Services */}
                  <Route path="etat-civil/naissance" element={<ActeNaissance />} />
                  <Route path="etat-civil/mariage" element={<ActeMariage />} />
                  <Route path="etat-civil/divorce" element={<ActeDivorce />} />
                  <Route path="etat-civil/deces" element={<ActeDeces />} /> 

                  {/* Legalisations et divers */}
                  <Route path="legalisations/acte-naissance" element={<LegalisationActeNaissance />} />
                  <Route path="legalisations/certificat-nationalite" element={<LegalisationCertificatNationalite />} />
                  <Route path="legalisations/copie-passeport" element={<LegalisationCopiePasseport />} />
                  <Route path="legalisations/casier-judiciaire" element={<LegalisationCasierJudiciaire />} />
                  <Route path="legalisations/casier-judiciaire-etudiant" element={<LegalisationCasierJudiciaireEtudiant />} />

                  {/* Procurations */}
                  <Route path="procurations/mandats-speciaux" element={<ProcurationMandatsSpeciaux />} />
                  <Route path="procurations/retrait-passeport" element={<ProcurationRetraitPasseport />} />
                  <Route path="procurations/retrait-carte-biometrique" element={<ProcurationRetraitCarteBiometrique />} />

                  {/* Demande Speciales Services */}
                  <Route path="special/procuration" element={<Procuration />} />
                  <Route path="special/celibat" element={<Celibat />} />
                  <Route path="special/transfert-corps" element={<TransfertCorps />} />
                  <Route path="special/particuliere" element={<DemandeParticuliere />} />
                   {/* Fallback Route */}
                  <Route path="*" element={<Home />} />
                </Routes>
              }
            >

            </Route>

            {/* Others Page */}
            <Route path="student/home" element={<BasicHomePage />} />
            
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

          </Route>

          {/* Auth Layout */}
          <Route path="/auth/register" element={<StudentSpace/>} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
