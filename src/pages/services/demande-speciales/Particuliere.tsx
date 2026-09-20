import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function DemandeParticuliere() {
  return (
    <>
      <PageMeta
        title="Demande Particulière"
        description="Formulez librement votre demande personnalisée."
      />
      <PageBreadcrumb pageTitle="Demande Particulière" />
      <ServiceView subServiceId="sub-034" />
    </>
  );
}
