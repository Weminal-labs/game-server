import { ZkLoginSessionProvider } from "@shinami/nextjs-zklogin/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import type { AppProps } from "next/app";
import "./globals.css";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ZkLoginSessionProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ZkLoginSessionProvider>
    </QueryClientProvider>
  );
}
