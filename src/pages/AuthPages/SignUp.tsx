import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Se inscrire"
        description="Page d'inscription"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
