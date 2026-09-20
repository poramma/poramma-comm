import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ProcurationRetraitCarteBiometrique() {


  return (
    <>
      <PageMeta
        title="Procuration - Retrait carte biométrique"
        description="Service de procuration pour le retrait d'une carte biométrique."
      />
      <PageBreadcrumb pageTitle="Procuration - Retrait carte biométrique" />
      <ServiceView subServiceId="sub-031" />
    </>
  );
}
