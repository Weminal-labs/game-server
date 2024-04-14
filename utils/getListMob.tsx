import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import { sui } from "@/lib/hooks/sui";

const { user, isLoading, localSession } = useZkLoginSession();

export const get_object = async (id: string): Promise<any> => {
    const txn = await sui.getObject({
        id,
        options: { showContent: true },
    });
    return txn.data?.content
}

export const get_objects = async (address: string): Promise<any> => {
    const txn = await sui.getOwnedObjects({
        owner: address
    });
    return txn
}

export const load_user_assets = () => {
    if(user?.wallet) {
      get_objects(user?.wallet||"")
      .then((res: {
        array: any; data: any[] 
      }) => {
        res.data.forEach((element: any) => {
          get_object(element.data.objectId)
          .then((obj_data) => {
            if(obj_data?.type.toString().split("::")[2] == "Hero"){
              console.log(obj_data)
            }
          })
        });
        res.array.forEach((element: any) => {
          get_object(element.data.objectId).then(obj => console.log(obj))
        });
      })
    }
  }