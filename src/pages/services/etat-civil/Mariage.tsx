// src/pages/services/etat-civil/Mariage.tsx
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ActeMariage() {


  return (
    <>
      <PageMeta
        title="Demande d’acte de mariage"
        description="Effectuez la demande d’un acte de mariage officiel."
      />
      <PageBreadcrumb pageTitle="Demande d’acte de mariage" />
      <ServiceView subServiceId="sub-026" />
    </>
  );
}
