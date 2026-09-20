import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function RetraitPasseport() {


  return (
    <>
      <PageMeta title="Retrait Passeport" description="Procédure de retrait du passeport" />
      <PageBreadcrumb pageTitle="Retrait du Passeport" />
      <ServiceView subServiceId="sub-008" />
    </>
  );
}
