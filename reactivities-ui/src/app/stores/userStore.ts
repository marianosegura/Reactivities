import { makeAutoObservable, runInAction } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { User, UserFormValues } from "../models/user";
import { store } from "./store";


export default class UserStore {
    user: User | null = null;
    refreshTokenTimeout: any;


    constructor() {
        makeAutoObservable(this);
    }


    get isLoggedIn(): boolean {
        return !!this.user;
    }


    register = async (credentials: UserFormValues) => {
        try {
            await agent.Account.register(credentials);  // we no longer get an user, need to validate email first
            // store.commonStore.setToken(user.token);  // save token to store and local storage
            // this.startRefreshTokenTimer(user);
            // runInAction(() => this.user = user);  // because is after await
            store.modalStore.closeModal();  // close login modal
            history.push(`/account/registerSuccess?email=${credentials.email}`);
        } catch (error) {
            throw error;
        }
    }


    login = async (credentials: UserFormValues) => {
        try {
            const user = await agent.Account.login(credentials);
            store.commonStore.setToken(user.token);  // save token to store and local storage
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);  // because is after await
            store.modalStore.closeModal();  // close login modal
            history.push('/activities');
        } catch (error) {
            throw error;
        }
    }


    logout = () => {
        this.stopRefreshTokenTimer();
        store.commonStore.setToken(null);
        this.user = null;
        history.push('/');
    }


    getUser = async () => {
        try {
            const user = await agent.Account.current();
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);

        } catch(error) {
            console.log(error);
        }
    }


    setImage = (image: string) => {
        if (this.user) this.user.image = image;
    }


    setDisplayName = (displayName: string) => {
        if (this.user) this.user.displayName = displayName;
    }


    refreshToken = async () => {
        this.stopRefreshTokenTimer();
        try {
            const user = await agent.Account.refreshToken();
            runInAction(() => this.user = user);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);

        } catch (error) {
            console.log(error);
        }
    }


    private startRefreshTokenTimer(user: User) {
        const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);  // refresh with 60 seconds left
        this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    }


    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}