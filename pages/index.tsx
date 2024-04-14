import { getSuiExplorerAccountUrl } from "@/lib/hooks/sui";
import { AUTH_API_BASE, LOGIN_PAGE_PATH } from "@shinami/nextjs-zklogin";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import { useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { PlayerDataResponse, WeatherResponse } from "@/lib/shared/interfaces";
import { useState } from "react";
import {
  useWeatherMutation,
  usePlayerDataMutation,
  useNewHeroMutation,
} from "@/lib/hooks/api";
import getWeatherCity from "@/utils/getWeather";
import { URL_AVATAR_HERO } from "@/lib/shared/enum";

// This is a publically accessible page, displaying optional contents for signed-in users.
export default function Index() {
  const { user, isLoading, localSession } = useZkLoginSession();
  const {
    unityProvider,
    sendMessage,
    addEventListener,
    removeEventListener,
    loadingProgression,
  } = useUnityContext({
    loaderUrl: "Build/Scorpion.loader.js",
    dataUrl: "Build/Scorpion.data",
    frameworkUrl: "Build/Scorpion.framework.js",
    codeUrl: "Build/Scorpion.wasm",
  });
  const [result, setResult] = useState<WeatherResponse>();
  const [playerData, setPlayerData] = useState<PlayerDataResponse>();
  const [weather, setWeather] = useState<any>();
  const { mutateAsync: getWeather, isPending: isAdding } = useWeatherMutation();
  const { mutateAsync: getPlayerData, isPending: isGettingData } =
    usePlayerDataMutation();
  const { mutateAsync: getNewHero, isPending: isGettingNewHero } =
    useNewHeroMutation();
  const [isRequiresData, setIsRequiresData] = useState(false);

  //check if user is logged in then start the game
  useEffect(() => {
    if (!isLoading && localSession && user && loadingProgression === 1) {
      sendMessage("LoginController", "LoadScene");
    }
  }, [user, loadingProgression, isLoading, localSession]);

  useEffect(() => {
    if(playerData && weather) {
      // sendMessage("GameControll", "ReceiveWeather", JSON.stringify(weather));
      // sendMessage("GameControll", "ReceiveAddress", JSON.stringify(playerData));
      sendMessage("GameControll", "stopLoadingScreen")
    }
  }, [playerData, weather])

  //send data when start game
  useEffect(() => {
    if (localSession && isRequiresData) {
      //get weather data
      getWeatherCity().then((data) => {
        // setWeather(data);
        setWeather(data);
        sendMessage("WeatherControll", "ReceiveWeather", JSON.stringify(data));
      });

      //get player data
      getPlayerData({ keyPair: localSession.ephemeralKeyPair }).then((data: PlayerDataResponse) => {
        console.log("Player Data", data);
        setPlayerData(data)
        sendMessage("GameControll", "ReceiveAddress", JSON.stringify(data));
      });
    }
  }, [user, isRequiresData]);

  //login function
  const handleLogin = useCallback(() => {
    window.open(`${LOGIN_PAGE_PATH}`, "_blank");
  }, []);

  //logout function
  const handleLogout = useCallback(() => {
    window.open(`${AUTH_API_BASE}/logout`, "_self");
    sendMessage("GameController", "Logout");
  }, []);

  const handleAddress = () => {
    //get is unity is ready to receive data
    setIsRequiresData(true);
  };

  const handleRequestId = useCallback((json: any, id: any) => {
    console.log("Request Id", json, id);
    const heroData = JSON.parse(json);
    if(!localSession) {
      console.log("Local session not found");
      return
    };

    getNewHero({
      type_hero: heroData.type_hero,
      max_health: heroData.max_health,
      damage: heroData.damage,
      speed: heroData.speed,
      exp: heroData.exp,
      max_exp: heroData.max_exp,
      name: heroData.name,
      description: heroData.description,
      url: URL_AVATAR_HERO[heroData.type_hero],
      keyPair: localSession.ephemeralKeyPair,
    }).then((data) => {
      console.log("New Hero", data);
    });
  }, [localSession]);

  const handleSaveMob = useCallback((json: any) => {
    console.log("Save Mob", json);
  }, []);

  const handleSavePlayer = useCallback((json: any) => {
    console.log("Save Player", json);
  }, []);

  const handleSaveListMob = useCallback((json: any) => {
    console.log("Save list mob", json);
  }, []);

  useEffect(() => {
    //patching the event login
    addEventListener("RequestLogin", handleLogin);

    //patching the event logout
    addEventListener("RequestLogOut", handleLogout);

    //patching the event required address from game
    addEventListener("RequestAddress", handleAddress);

    //patching the event required ID from game
    addEventListener("RequestID", handleRequestId);

    //patching the event save mob from game
    addEventListener("SaveMob", handleSaveMob);

    //patching the event save player from game
    addEventListener("SavePlayer", handleSavePlayer);

    //patching the event save list mob from game
    addEventListener("SaveListMob", handleSaveListMob);

    return () => {
      removeEventListener("LoginGoogle", handleLogin);
      removeEventListener("RequestLogOut", handleLogout);
      removeEventListener("RequestAddress", handleAddress);
      removeEventListener("RequestID", handleRequestId);
      removeEventListener("SaveMob", handleSaveMob);
      removeEventListener("SavePlayer", handleSavePlayer);
      removeEventListener("SaveListMob", handleSaveListMob);
    };
  }, [addEventListener, removeEventListener, handleLogin]);

  return (
    <>
      <Unity unityProvider={unityProvider} className="w-screen h-screen" />
    </>
  );
}
