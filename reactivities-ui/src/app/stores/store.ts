import { createContext, useContext } from "react";
import ActivityStore from "./activityStore";
import CommentStore from "./commentStore";
import CommonStore from "./commonStore";
import ModalStore from "./modalStore";
import ProfileStore from "./profileStore";
import UserStore from "./userStore";


interface Store {
    activityStore: ActivityStore;
    commonStore: CommonStore;
    userStore: UserStore;
    modalStore: ModalStore;
    profileStore: ProfileStore;
    commentStore: CommentStore;
}

export const store: Store = {
    activityStore: new ActivityStore(),
    commonStore: new CommonStore(),  // server error, token 
    userStore: new UserStore(),  // auth (login, register...)
    modalStore: new ModalStore(),  // to open modals everywhere
    profileStore: new ProfileStore(),  // to get an user profile
    commentStore: new CommentStore()  // to connect to SignalR comments hub
};

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}

