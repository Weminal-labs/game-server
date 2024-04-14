import { useAddMutation, useRecentTxsQuery, useWeatherMutation } from "@/lib/hooks/api";
import { getSuiExplorerTransactionUrl } from "@/lib/hooks/sui";
import { WeatherResponse } from "@/lib/shared/interfaces";
import { withZkLoginSessionRequired } from "@shinami/nextjs-zklogin/client";
import Link from "next/link";
import { use, useState, useEffect } from "react";

// This is an auth-protected page. Anonymous users will be auto-redirected to the login page.
export default withZkLoginSessionRequired(({ session }) => {
  const { isLoading, user, localSession } = session;
  // const [result, setResult] = useState<WeatherResponse>();
  // const { mutateAsync: getWeather, isPending: isAdding } = useWeatherMutation();
  // const { data: txs, isLoading: isLoadingTxs } = useRecentTxsQuery();

  useEffect(() => {
    if(user){
      close()
    }
  }, [user]);

  if (isLoading) return <p>Loading zkLogin session...</p>;
  if (!user) return <p>Not logged in, please try again</p>;
});
