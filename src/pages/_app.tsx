import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import "../styles/globals.css";
import type { AppContext, AppProps } from "next/app";
import App from "next/app";
import {
  Container,
  MantineProvider,
  createTheme,
  em,
  rem,
} from "@mantine/core";
import MainLayout from "../components/layouts/Main";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { getAuthentication } from "../hooks/getAuthentication";
import {
  HydrationBoundary,
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

  const CONTAINER_SIZES: Record<string, string> = {
    xxs: rem(300),
    xs: rem(400),
    sm: rem(500),
    md: rem(600),
    lg: rem(700),
    xl: rem(800),
    xxl: rem(900),
    "3xl": rem(1000),
    "4xl": rem(1100),
    "5xl": rem(1200),
    "6xl": rem(1300),
    "7xl": rem(1400),
  };

  const BREAK_POINTS: Record<string, string> = {
    xs: em(36),
    sm: em(48),
    md: em(62),
    lg: em(75),
    xl: em(88),
    xxl: em(100),
  }


  const theme = createTheme({
    fontFamily: inter.style.fontFamily,
    breakpoints: {
      xs: "30em",
      sm: "48em",
      md: "64em",
      lg: "74em",
      xl: "90em",
      xxl: "100em",
      "3xl": "116em",
      "4xl": "130em",
      "5xl": "146em",
      "6xl": "160em"
    },
    components: {
      Container: Container.extend({
        vars: (_, { size, fluid }) => ({
          root: {
            '--container-size': fluid
              ? '100%'
              : size !== undefined && size in CONTAINER_SIZES
                ? CONTAINER_SIZES[size]
                : rem(size),
          },
        }),
      }),
    },
    colors: {
      dark: [
        '#C1C2C5',
        '#A6A7AB',
        '#909296',
        '#5c5f66',
        '#373A40',
        '#2C2E33',
        '#18181C',
        '#141417',
        '#141517',
        '#101113',
      ],
    },
  })

  const queryClient = new QueryClient();

  return (
    <>
      <MantineProvider
        theme={theme}
        defaultColorScheme="dark"
      >
        <Notifications />
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={pageProps.dehydratedState}>
            {isLoaded && (
              <MainLayout>
                <Component {...pageProps} />
              </MainLayout>
            )}
            <ReactQueryDevtools initialIsOpen={false} position="left" />
          </HydrationBoundary>
        </QueryClientProvider>
      </MantineProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  return { ...appProps };
};
