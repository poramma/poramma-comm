import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function ProcurationMandatsSpeciaux() {


  return (
    <>
      <PageMeta
        title="Procuration - Mandats spéciaux"
        description="Service pour procurations relatives à des mandats spéciaux."
      />
      <PageBreadcrumb pageTitle="Procuration - Mandats spéciaux" />
      <ServiceView subServiceId="sub-029" />
    </>
  );
}
