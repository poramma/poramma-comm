import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LaissezPasser() {


  return (
    <>
      <PageMeta title="Laissez-Passer" description="Demande de laissez-passer" />
      <PageBreadcrumb pageTitle="Laissez-Passer" />
      <ServiceView subServiceId="sub-014" />
    </>
  );
}
