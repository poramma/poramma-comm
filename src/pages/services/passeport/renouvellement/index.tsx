import ServiceView from "../../ServiceView";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";

export default function RenouvellementPasseport() {


  return (
    <>
      <PageMeta
          title="Renouvellement de Passeport"
          description="Page pour le renouvellement de passeport, incluant les documents requis, les frais et les étapes du processus."
        />
      <PageBreadcrumb pageTitle="Renouvellement de Passeport" />
      <ServiceView subServiceId="sub-007"
      />
    </>
  );
}