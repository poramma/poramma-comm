import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function Celibat() {


  return (
    <>
      <PageMeta
        title="Certificat de Célibat"
        description="Obtenez un certificat de célibat avec les documents requis."
      />
      <PageBreadcrumb pageTitle="Certificat de Célibat" />
      <ServiceView subServiceId="sub-032" />
    </>
  );
}
