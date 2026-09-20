import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationCasierJudiciaireEtudiant() {


  return (
    <>
      <PageMeta
        title="Légalisation casier judiciaire étudiant"
        description="Service gratuit de légalisation pour les étudiants."
      />
      <PageBreadcrumb pageTitle="Légalisation casier judiciaire étudiant" />
      <ServiceView subServiceId="sub-023" />
    </>
  );
}
