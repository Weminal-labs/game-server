import { sui } from "@/lib/hooks/sui";
import { ZkLoginUser } from "@shinami/nextjs-zklogin";

export const get_object = async (id: string): Promise<any> => {
  const txn = await sui.getObject({
    id,
    options: { showContent: true },
  });
  return txn.data?.content;
};

export const get_objects = async (address: string): Promise<any> => {
  const txn = await sui.getOwnedObjects({
    owner: address,
  });
  return txn;
};

export const load_user_assets = (user: ZkLoginUser) => {
  console.log("user wallet", user?.wallet);
  var data: any[] = [];
  if (user?.wallet) {
    get_objects(user?.wallet || "").then((res: { array: any; data: any[] }) => {
      // console.log(res);
      res.data.forEach((element: any) => {
        get_object(element.data.objectId).then((obj_data) => {
          console.log(obj_data);
          if (obj_data?.type.toString().split("::")[2] == "castoken") {
            data.push(obj_data);
          }
        });
      });
      // res.array.forEach((element: any) => {
      //   get_object(element.data.objectId).then(obj => console.log(obj))
      // });
    });
  }
  console.log(data);
  return data;
};
