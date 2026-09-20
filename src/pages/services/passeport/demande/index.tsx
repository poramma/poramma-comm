import ServiceView from "../../ServiceView";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";

export default function DemandePasseport() {



  return (
    <>
      <PageMeta
          title="Demande de Passeport"
          description="Page pour la demande de passeport, incluant les documents requis, les frais et les étapes du processus."
        />
      <PageBreadcrumb pageTitle="Demande de Passeport" />
      <ServiceView subServiceId="sub-006"
      />
    </>
  );
}
