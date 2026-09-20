import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function PasseportOrdinaire() {


  return (
    <>
      <PageMeta title="Passeport Ordinaire" description="Demande de passeport ordinaire" />
      <PageBreadcrumb pageTitle="Passeport Ordinaire" />
      <ServiceView subServiceId="sub-006" />
    </>
  );
}
