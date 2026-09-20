import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ProcurationRetraitPasseport() {


  return (
    <>
      <PageMeta
        title="Procuration - Retrait passeport"
        description="Service de procuration pour le retrait d'un passeport."
      />
      <PageBreadcrumb pageTitle="Procuration - Retrait passeport" />
      <ServiceView subServiceId="sub-030" />
    </>
  );
}
