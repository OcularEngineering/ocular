import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button
} from '@react-email/components';

interface SignUpEmailProps {
  name: string;
  verificationLink: string;
}

export const SignUpSubject = 'Ocular AI: Please verify your email';

export const SignUpEmail: React.FC<Readonly<SignUpEmailProps>> = ({
  name,
  verificationLink
}) => (
  <Html>
    <Head />
    <Preview>Email Verification for Ocular sign up</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Please Verify Your Email</Heading>
        <Text style={text}>
          Thank you {name} for signing up. Please verify your email by clicking below.
          <Button
              className="bg-black rounded text-white text-xs font-semibold no-underline text-center"
              href={verificationLink}
              style={{ padding: "12px 20px" }}>
              Verify
          </Button>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default SignUpEmail;

const main = {
  backgroundColor: '#000000',
  margin: '0 auto',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: 'auto',
  padding: '96px 20px 64px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#aaaaaa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 40px',
};