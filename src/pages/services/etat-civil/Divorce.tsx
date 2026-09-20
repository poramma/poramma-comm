import ServiceView from "../ServiceView";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";

export default function Divorce() {


  return (
    <>
      <PageMeta
        title="Demande de Divorce"
        description="Effectuez une demande de divorce officiel."
      />
      <PageBreadcrumb pageTitle="Demande de Divorce" />
      <ServiceView subServiceId="sub-027" />
    </>
  );
}