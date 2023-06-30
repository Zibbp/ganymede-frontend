import "../styles/globals.css";
import type { AppProps } from "next/app";
import App from "next/app";
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
import { Notifications } from "@mantine/notifications";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }: AppProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getAuthentication().then(() => setIsLoaded(true));
  }, []);

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "ganymede-color-scheme",
    defaultValue: "dark",
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
            fontFamily: inter.style.fontFamily,
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
          }}
          withGlobalStyles
          withNormalizeCSS
        >
          <Notifications />
          <QueryClientProvider client={queryClient}>
            <Hydrate state={pageProps.dehydratedState}>
              {isLoaded && (
                <MainLayout>
                  <Component {...pageProps} />
                </MainLayout>
              )}
              <ReactQueryDevtools initialIsOpen={false} position="top-left" />
            </Hydrate>
          </QueryClientProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  return { ...appProps };
};
