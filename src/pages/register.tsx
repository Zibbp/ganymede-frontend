import { LoginForm } from "../components/Authentication/Login";
import { Container } from "@mantine/core";
import { RegisterForm } from "../components/Authentication/Register";
import { useDocumentTitle } from "@mantine/hooks";

const RegisterPage = () => {
  useDocumentTitle("Ganymede - Register");
  return (
    <div>
      <Container mt={50} size="sm">
        <RegisterForm />
      </Container>
    </div>
  );
};

export default RegisterPage;
