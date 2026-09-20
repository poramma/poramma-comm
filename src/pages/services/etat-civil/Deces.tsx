// src/pages/services/etat-civil/Deces.tsx
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ActeDeces() {


  return (
    <>
      <PageMeta
        title="Demande d’acte de décès"
        description="Effectuez la demande d’un acte de décès officiel."
      />
      <PageBreadcrumb pageTitle="Demande d’acte de décès" />
      <ServiceView subServiceId="sub-028" />
    </>
  );
}
