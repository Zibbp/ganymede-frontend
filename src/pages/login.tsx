import { LoginForm } from "../components/Authentication/Login";
import { Container } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";

const LoginPage = () => {
  useDocumentTitle("Ganymede - Login");
  return (
    <div>
      <Container mt={50} size="xs">
        <LoginForm />
      </Container>
    </div>
  );
};

export default LoginPage;
