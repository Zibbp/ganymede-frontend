import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import MainLayout from "../components/layouts/Main";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { getAuthentication } from "../hooks/getAuthentication";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NotificationsProvider } from "@mantine/notifications";

export default function App({ Component, pageProps }: AppProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getAuthentication().then(() => setIsLoaded(true));
  }, []);

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "ganymede-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const queryClient = new QueryClient();

  return (
    <>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{
            colorScheme,
            components: {
              Container: {
                defaultProps: {
                  sizes: {
                    xs: 540,
                    sm: 720,
                    md: 960,
                    lg: 1140,
                    xl: 1320,
                    "2xl": 1536,
                  },
                },
              },
            },
            globalStyles: (theme) => ({
              "@font-face": {
                fontFamily: "Inter",
                src: 'url("/fonts/Inter-Variable.ttf") format("truetype")',
                fontStyle: "normal",
              },
            }),
          }}
          withGlobalStyles
          withNormalizeCSS
        >
          <NotificationsProvider>
            <QueryClientProvider client={queryClient}>
              {isLoaded && (
                <MainLayout>
                  <Component {...pageProps} />
                </MainLayout>
              )}
              <ReactQueryDevtools initialIsOpen={false} position="top-left" />
            </QueryClientProvider>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

App.getInitialProps = async ({ Component, pageProps }: AppProps) => ({
  props: { Component, pageProps },
});
