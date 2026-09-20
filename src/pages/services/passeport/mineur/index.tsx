import ServiceView from "../../ServiceView";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";

export default function PasseportMineur() {

  

  return (
    <>
      <PageMeta
        title="Passeport pour Mineur"
        description="Informations et étapes pour la demande de passeport pour mineurs, incluant les documents requis et les frais."
      />
      <PageBreadcrumb pageTitle="Passeport Mineur" />
      <ServiceView subServiceId="sub-009"
      />
    </>
  );
}
