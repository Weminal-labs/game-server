import { Analytics } from "@vercel/analytics/react";
import { AUTH_API_BASE, LOGIN_PAGE_PATH } from "@shinami/nextjs-zklogin";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import { useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import {
  ClaimResponse,
  PlayerDataResponse,
  PurchaseResponse,
  UpdateScoreResponse,
} from "@/lib/shared/interfaces";
import { useState } from "react";
import {
  usePlayerDataMutation,
  useUpdateScoreMutation,
  useClaimMutation,
  usePurchaseMutation,
} from "@/lib/hooks/api";
import getWeatherCity from "@/utils/getWeather";
import { sui } from "@/lib/hooks/sui";

const type_hero_by_price = [
  {
    id: 1,
    name: "Hero 1",
    description: "Hero 1",
    price: 3000,
  },
  {
    id: 2,
    name: "Hero 2",
    description: "Hero 2",
    price: 5000,
  },
  {
    id: 3,
    name: "Hero 3",
    description: "Hero 3",
    price: 8000,
  },
  {
    id: 4,
    name: "Hero 4",
    description: "Hero 4",
    price: 9000,
  },
];

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
    loaderUrl: "Build/Build.loader.js",
    dataUrl: "Build/Build.data",
    frameworkUrl: "Build/Build.framework.js",
    codeUrl: "Build/Build.wasm",
  });
  const [playerData, setPlayerData] = useState<any>();
  const [weather, setWeather] = useState<any>();
  const [listCoin, setListCoin] = useState<any[] | undefined>([]);
  const [heros, setHeros] = useState<any[]>([]);
  const { mutateAsync: getPlayerData, isPending: isGettingData } =
    usePlayerDataMutation();
  const { mutateAsync: updateScoreData, isPending: isUpdate } =
    useUpdateScoreMutation();
  const { mutateAsync: claim, isPending: isClaim } = useClaimMutation();
  const { mutateAsync: purchase, isPending: isPurchasing } =
    usePurchaseMutation();

  const [isRequiresData, setIsRequiresData] = useState(false);

  //check if user is logged in then start the game
  useEffect(() => {
    if (!isLoading && localSession && user && loadingProgression === 1) {
      sendMessage("LoginController", "LoadScene");
    }
  }, [user, loadingProgression, isLoading, localSession]);

  useEffect(() => {
    if (playerData && weather) {
      sendMessage("GameControll", "stopLoadingScreen");
    }
  }, [playerData, weather]);

  //send data when start game
  useEffect(() => {
    if (localSession && isRequiresData) {
      if (!listCoin) return;
      //get weather data
      // getWeatherCity().then((data) => {
      //   setWeather(data);
      //   sendMessage("WeatherControll", "ReceiveWeather", JSON.stringify(data));
      // });

      //get player data
      getPlayerData({ keyPair: localSession.ephemeralKeyPair }).then(
        (data: PlayerDataResponse) => {
          console.log("Player Data", data);
          setPlayerData(data);

          let totalCoin =
            listCoin.reduce((acc, item) => {
              return acc + Number(item.fields.balance);
            }, 0) / 1000000;

          let herosId = heros
            .map((hero) => hero.fields.type_hero)
            .filter(function (item, pos, self) {
              return self.indexOf(item) == pos;
            });

          let payload = {
            id: data.id,
            coin: Number(totalCoin),
            isLock: [
              false,
              !herosId.includes(1),
              !herosId.includes(2),
              !herosId.includes(3),
              !herosId.includes(4),
            ],
          };

          sendMessage("HeroSelect", "ReciveDataLobby", JSON.stringify(payload));
          sendMessage("LobbyController", "DoneLoad");
        }
      );
    }
  }, [user, isRequiresData, listCoin]);

  //get user token
  useEffect(() => {
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
            const token_list: any[] = res.data.map(async (element: any) => {
              const obj_data = await get_object(element.data.objectId);
              console.log(obj_data);
              if (
                obj_data?.type.toString().includes("castoken") ||
                obj_data?.type.toString().includes("Hero")
              ) {
                return obj_data;
              }
            });
            Promise.all(token_list).then(function (results) {
              setListCoin(
                results.filter(
                  (item) => item && item.type.toString().includes("castoken")
                )
              );
              setHeros(
                results.filter(
                  (item) => item && item.type.toString().includes("Hero")
                )
              );
            });
          }
        );
      }
    };

    load_user_assets();
  }, [user]);

  //login function
  const handleLogin = useCallback(() => {
    window.open(`${LOGIN_PAGE_PATH}`, "_blank");
  }, []);

  //logout function
  const handleLogout = useCallback(() => {
    window.open(`${AUTH_API_BASE}/logout`, "_self");
    sendMessage("GameController", "Logout");
  }, []);

  const handleGetLobby = () => {
    setIsRequiresData(true);
  };

  const handleRequestCoin = () => {
    if (!listCoin) return;
    if (listCoin.length === 0) return;
    let totalCoin =
      listCoin.reduce((acc, item) => {
        return acc + Number(item.fields.balance);
      }, 0) / 1000000;

    sendMessage("HeroSelect", "EditCoinGame", totalCoin);
  };

  const handleRequestUpdateCoin = (coin: any) => {
    console.log("coin", coin);
    if (!listCoin) return;
    if (!localSession) return;

    let hero =
      type_hero_by_price.find((item) => item.price == -1 * coin) ||
      type_hero_by_price[0];

    purchase({
      id_hero: hero?.id || 1,
      name: hero?.name || "Hero",
      description: hero?.description || "Hero",
      price: hero?.price * 1000000,
      money: listCoin.map((item) => item.fields.id.id),
      img: "https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-1/364749398_1541986079909001_7490284861161138951_n.jpg?stp=dst-jpg_p100x100&_nc_cat=103&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeGLzg7Ccfb_VYKJdqkl6E2alku9WqVhdSOWS71apWF1IwBeL0LSWbd19gfkxa7-Y8HcT81qKXEe_Umb6PG5HI-D&_nc_ohc=QDTN8G6VC2MQ7kNvgHLd9ER&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.fsgn5-12.fna&oh=00_AYAuwVGTUvIPw9tSagWtoJjD_68rpxG6iEzVBkCkF3ZGWA&oe=665FBA33",
      keyPair: localSession.ephemeralKeyPair,
    }).then((data: PurchaseResponse) => {});
  };

  const handlePushRewardForPlayer = (coin: any) => {
    if (!localSession) return;
    claim({
      amount: coin * 1000000,
      keyPair: localSession.ephemeralKeyPair,
    }).then((data: ClaimResponse) => {
      console.log("claim", data);
    });
  };

  useEffect(() => {
    //patching the event login
    addEventListener("RequestLogin", handleLogin);
    if (localSession) {
      //patching the event logout
      addEventListener("RequestLogOut", handleLogout);

      //patching the event get lobby
      addEventListener("RequestLobby", handleGetLobby);

      //patching the event request coin
      addEventListener("RequestCoin", handleRequestCoin);

      //patching the event request update coin
      addEventListener("RequestUpdateCoin", handleRequestUpdateCoin);

      addEventListener("PushRewardForPlayer", handlePushRewardForPlayer);
    }

    return () => {
      removeEventListener("LoginGoogle", handleLogin);
      removeEventListener("RequestLogOut", handleLogout);
      removeEventListener("RequestLobby", handleGetLobby);
      removeEventListener("RequestCoin", handleRequestCoin);
      removeEventListener("RequestUpdateCoin", handleRequestUpdateCoin);
      removeEventListener("PushRewardForPlayer", handlePushRewardForPlayer);
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
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Unity unityProvider={unityProvider} className="w-[80vw] h-[100vh]" />
          <Analytics />
        </>
      )}
    </>
  );
}
