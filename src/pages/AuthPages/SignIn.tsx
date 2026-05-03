import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Se connecter"
        description="Page de connexion"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
