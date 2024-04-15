import { getSuiExplorerAccountUrl } from "@/lib/hooks/sui";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Analytics } from "@vercel/analytics/react";
import { AUTH_API_BASE, LOGIN_PAGE_PATH } from "@shinami/nextjs-zklogin";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import { useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import {
  PlayerDataResponse,
  WeatherResponse,
  UpdateUserLevelRequest,
  UpdateUserResourcesRequest,
} from "@/lib/shared/interfaces";
import { useState } from "react";
import {
  useWeatherMutation,
  usePlayerDataMutation,
  useNewHeroMutation,
  useUpdateHeroMutation,
  useUserLevelMutation,
  useUserResourcesMutation,
} from "@/lib/hooks/api";
import getWeatherCity from "@/utils/getWeather";
import { URL_AVATAR_HERO } from "@/lib/shared/enum";
import { validate } from "superstruct";
import { UpdateHeroRequest } from "@/lib/shared/interfaces";
import { sui } from "@/lib/hooks/sui";

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
  const [listMob, setListMob] = useState<any>();

  const { mutateAsync: getWeather, isPending: isAdding } = useWeatherMutation();
  const { mutateAsync: getPlayerData, isPending: isGettingData } =
    usePlayerDataMutation();
  const { mutateAsync: getNewHero, isPending: isGettingNewHero } =
    useNewHeroMutation();
  const { mutateAsync: updateHero, isPending: isUpdatingHero } =
    useUpdateHeroMutation();
  const { mutateAsync: updateUserLevel, isPending: isUpdatingUserLevel } =
    useUserLevelMutation();
  const {
    mutateAsync: updateUserResources,
    isPending: isUpdatingUserResources,
  } = useUserResourcesMutation();
  const [isRequiresData, setIsRequiresData] = useState(false);

  //check if user is logged in then start the game
  useEffect(() => {
    console.log(localSession);
    if (!isLoading && localSession && user && loadingProgression === 1) {
      sendMessage("LoginController", "LoadScene");
    }
  }, [user, loadingProgression, isLoading, localSession]);

  useEffect(() => {
    if (playerData && weather) {
      // sendMessage("GameControll", "ReceiveWeather", JSON.stringify(weather));
      // sendMessage("GameControll", "ReceiveAddress", JSON.stringify(playerData));
      sendMessage("GameControll", "stopLoadingScreen");
    }
  }, [playerData, weather, listMob]);

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
      getPlayerData({ keyPair: localSession.ephemeralKeyPair }).then(
        (data: PlayerDataResponse) => {
          console.log("Player Data", data);
          setPlayerData(data);
          sendMessage("GameControll", "ReceiveAddress", JSON.stringify(data));
        }
      );

      //get list mob
      let get_object = async (id: string): Promise<any> => {
        const txn = await sui.getObject({
          id,
          options: { showContent: true },
        });
        return txn.data?.content;
      };

      let get_objects = async (address: string): Promise<any> => {
        const txn = await sui.getOwnedObjects({
          owner: address,
        });
        return txn;
      };

      let load_user_assets = () => {
        if (user?.wallet) {
          get_objects(user?.wallet || "").then(
            (res: { array: any; data: any[] }) => {
              const hero_list: any[] = res.data.map(async (element: any) => {
                const obj_data = await get_object(element.data.objectId);
                if (obj_data?.type.toString().split("::")[2] === "Hero") {
                  return obj_data;
                }
              });
              Promise.all(hero_list).then(function (results) {
                console.log(results);
                const mob_list = results
                  .filter((mob) => mob !== undefined)
                  .filter((mob) => mob.fields.health !== 0)
                  .map((mob: any) => {
                    return {
                      location_x: mob.fields.location_x,
                      location_y: mob.fields.location_y,
                      id: mob.fields.id.id,
                      type_hero: mob.fields.type_hero,
                      level: mob.fields.level,
                      health: mob.fields.health,
                      max_health: mob.fields.max_health,
                      damage: mob.fields.damage,
                      speed: mob.fields.speed,
                      exp: mob.fields.exp,
                      max_exp: mob.fields.max_exp,
                      name: mob.fields.name,
                      description: mob.fields.description,
                      url: URL_AVATAR_HERO[mob.fields.type_hero],
                    };
                  });
                setListMob(mob_list);
                sendMessage(
                  "DataMob",
                  "loadMobExist",
                  JSON.stringify(mob_list)
                );
              });
            }
          );
        }
      };

      load_user_assets();
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

  const handleRequestId = (json: any, id: any) => {
    console.log("Request Id", json, id);
    const heroData = JSON.parse(json);
    if (!localSession) {
      console.log("Local session not found");
      return;
    }

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
      sendMessage(
        "DataMob",
        "LoadNewIdForMob",
        JSON.stringify({ id: data.id, fakeid: id, id_txb: data.txDigest })
      );
    });
  };

  const handleSaveMob = useCallback((json: any) => {
    console.log("Save Mob", json);
  }, []);

  const handleSavePlayer = useCallback(
    (json: any) => {
      console.log("Save Player", json, playerData);
      if (!localSession) {
        console.log("Local session not found");
        return;
      }

      if (!playerData) {
        console.log("Player data not found");
        return;
      }

      const player_request_update = JSON.parse(json);
      console.log("Player request update", player_request_update);
      console.log("Update Level");

      updateUserLevel({
        exp: player_request_update.exp,
        max_exp: player_request_update.maxExp,
        level: player_request_update.lv,
        keyPair: localSession.ephemeralKeyPair,
      }).then((data) => {
        console.log("Update Level", data);
      });

      updateUserResources({
        gold: player_request_update.curGold,
        meat: player_request_update.curMeat,
        wood: player_request_update.curWood,
        keyPair: localSession.ephemeralKeyPair,
      }).then((data) => {
        console.log("Update Resources", data);
      });

      setPlayerData(player_request_update);
    },
    [playerData]
  );

  const handleSaveListMob = (json: any) => {
    console.log("Save list mob", json);
    if (!localSession) {
      console.log("Local session not found");
      return;
    }

    const [error, data] = validate(
      { data: JSON.parse(json) },
      UpdateHeroRequest
    );
    if (!data) {
      console.log("Error", error);
      return;
    }

    if (data.data.length === 0) {
      console.log("Data is empty");
      return;
    }

    let filter_data = data.data.filter((hero) => {
      return hero.health !== 0;
    });

    updateHero({
      data: filter_data,
      keyPair: localSession.ephemeralKeyPair,
    }).then((data) => {
      console.log("Update Hero", data);
    });
  };

  useEffect(() => {
    addEventListener("RequestLogin", handleLogin);
    if (localSession) {
      //patching the event login

      //patching the event logout
      addEventListener("RequestLogOut", handleLogout);

      //patching the event required address from game
      addEventListener("RequestAddress", handleAddress);

      //patching the event required ID from game
      addEventListener("RequestID", handleRequestId);

      //patching the event save mob from game
      addEventListener("SaveMob", handleSaveMob);

      //patching the event save list mob from game
      addEventListener("SaveListMob", handleSaveListMob);

      //patching the event save player from game
      addEventListener("SavePlayer", handleSavePlayer);
    }

    return () => {
      removeEventListener("LoginGoogle", handleLogin);
      removeEventListener("RequestLogOut", handleLogout);
      removeEventListener("RequestAddress", handleAddress);
      removeEventListener("RequestID", handleRequestId);
      removeEventListener("SaveMob", handleSaveMob);
      removeEventListener("SavePlayer", handleSavePlayer);
      removeEventListener("SaveListMob", handleSaveListMob);
    };
  }, [
    addEventListener,
    removeEventListener,
    handleLogin,
    localSession,
    playerData,
  ]);

  return (
    <>
      <Unity unityProvider={unityProvider} className="w-screen h-screen" />
      <Analytics />
    </>
  );
}
