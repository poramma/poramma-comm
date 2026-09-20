// src/pages/services/attestations/index.tsx
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function Attestations() {


  return (
    <>
      <PageMeta
        title="Demande d’Attestation"
        description="Effectuez une demande d’attestation officielle."
      />
      <PageBreadcrumb pageTitle="Demande d’Attestation" />
      <ServiceView subServiceId="sub-016" />
    </>
  );
}
