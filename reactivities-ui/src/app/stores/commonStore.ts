import { makeAutoObservable, reaction } from "mobx";
import { ServerError } from "../models/serverError";

export default class CommonStore {
    error: ServerError | null = null;
    token: string | null = window.localStorage.getItem('jwt');  // try to get from local storage at init time
    appLoaded = false;
    

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.token,  // run on every token change
            token => {
                if (token) {
                    window.localStorage.setItem('jwt', token);  // save to local storage
                } else {
                    window.localStorage.removeItem('jwt');
                }
            }
        )
    }

    
    setServerError = (error: ServerError) => { this.error = error; }

    setToken = (token: string | null) => { this.token = token; }
    
    setAppLoaded = () => { this.appLoaded = true; }
}