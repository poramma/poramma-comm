import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function TransfertCorps() {


  return (
    <>
      <PageMeta
        title="Transfert de Corps"
        description="Demande officielle pour le transfert de corps vers le Mali."
      />
      <PageBreadcrumb pageTitle="Transfert de Corps" />
      <ServiceView subServiceId="sub-033" />
    </>
  );
}
