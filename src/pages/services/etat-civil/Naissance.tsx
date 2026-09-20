// src/pages/services/etat-civil/Naissance.tsx
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ActeNaissance() {


  return (
    <>
      <PageMeta
        title="Demande d’acte de naissance"
        description="Effectuez la demande d’un acte de naissance officiel."
      />
      <PageBreadcrumb pageTitle="Demande d’acte de naissance" />
      <ServiceView subServiceId="sub-025" />
    </>
  );
}
