import { getSuiExplorerAccountUrl } from "@/lib/hooks/sui";
import { AUTH_API_BASE, LOGIN_PAGE_PATH } from "@shinami/nextjs-zklogin";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import axios from "axios";
import Link from "next/link";
import { send } from "process";
import { useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

// This is a publically accessible page, displaying optional contents for signed-in users.
export default function Index() {
  const { user, isLoading } = useZkLoginSession();
  const { unityProvider, sendMessage, addEventListener, removeEventListener } =
    useUnityContext({
      loaderUrl: "Build/public.loader.js",
      dataUrl: "Build/public.data",
      frameworkUrl: "Build/public.framework.js",
      codeUrl: "Build/public.wasm",   
    });

  //check if user is logged in then send message to unity
  useEffect(() => {
    if(user){
      sendMessage("GameController", "LoginSuccess", user.wallet)
    }
  }, [isLoading, user]);

  const handleLogin = useCallback(() => {
    window.open(`${LOGIN_PAGE_PATH}`, "_self");
  }, []);

  const handleLogout = useCallback(() => {
    window.open(`${AUTH_API_BASE}/logout`, "_self");
    // axios.get(`${AUTH_API_BASE}/logout`).then((res) => {
    //   console.log(res);
    // })
    sendMessage("GameController", "Logout")
    // console.log("logout")
  }, []);

  console.log(user)

  useEffect(() => {
    //patching the event login
    addEventListener("LoginGoogle", handleLogin);

    //patching the event logout
    addEventListener("RequestLogout", handleLogout);

    return () => {
      removeEventListener("LoginGoogle", handleLogin)
      removeEventListener("requestLogout", handleLogout)};
  }, [addEventListener, removeEventListener, handleLogin]);

  return (
    <>
      {/* <h1>Hello, {user.oidProvider} user!</h1>
      <div>
        <Link
          href={getSuiExplorerAccountUrl(user.wallet, true)}
          target="_blank"
        >
          My zkLogin wallet address
        </Link>
      </div>
      <div>
        <Link href="/protected">Sui calculator</Link>
      </div>
      <div>
        <Link href={`${AUTH_API_BASE}/logout`}>Sign out</Link>
      </div> */}
      <Unity unityProvider={unityProvider} className="w-screen h-screen" />
    </>
  );

  // if (user) {
  //   // Signed-in experience.
  //   return (
  //     <>
  //       {/* <h1>Hello, {user.oidProvider} user!</h1>
  //       <div>
  //         <Link
  //           href={getSuiExplorerAccountUrl(user.wallet, true)}
  //           target="_blank"
  //         >
  //           My zkLogin wallet address
  //         </Link>
  //       </div>
  //       <div>
  //         <Link href="/protected">Sui calculator</Link>
  //       </div>
  //       <div>
  //         <Link href={`${AUTH_API_BASE}/logout`}>Sign out</Link>
  //       </div> */}
  //       <Unity unityProvider={unityProvider} className="w-screen h-screen" />
  //     </>
  //   );
  // } else {
  //   // Anonymous experience.
  //   return (
  //     <>
  //       <h1>Hello, anonymous user!</h1>
  //       <div>
  //         <Link href={LOGIN_PAGE_PATH}>Sign in</Link>
  //       </div>
  //     </>
  //   );
  // }
}
