import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { makeAutoObservable, runInAction } from "mobx";
import { ChatComment } from "../models/comment";
import { store } from "./store";


export default class CommentStore {
    comments: ChatComment[] = [];
    hubConnection: HubConnection | null = null;


    constructor() {
        makeAutoObservable(this);
    }


    createHubConnection = (activityId: string) => {
        if (store.activityStore.selectedActivity) {
            this.hubConnection = new HubConnectionBuilder()
                .withUrl(process.env.REACT_APP_CHAT_URL + '?activityId=' + activityId, {
                    accessTokenFactory: () => store.userStore.user?.token!  // passing token
                })
                .withAutomaticReconnect()  // try to reconnect if connection lost
                .configureLogging(LogLevel.Information)  // log info when connection
                .build();
            
            this.hubConnection.start().catch(error => console.log('Error connecting to hub chat: ', error));  // start connection
            
            this.hubConnection.on('LoadComments', (comments: any[]) => {
                runInAction(() => {
                  comments.forEach(comment => { 
                    comment.createdAt = new Date(comment.createdAt);  // parse date, at Z to make it UTC
                  });
                  this.comments = comments as ChatComment[];
                });
            });  // call LoadComments event defined in API to receive the activity comments

            this.hubConnection.on('ReceiveComment', (comment: any) => {
                runInAction(() => {
                  comment.createdAt = new Date(comment.createdAt);
                  this.comments.unshift(comment as ChatComment);
                });
            });  // when adding just 1 comment, ReceiveComment also defined in API
        }
    }


    stopHubConnection = () => {  // to stop connection
        this.hubConnection?.stop().catch(error => console.log('Error stopping connection: ', error));
    }


    clearComments = () =>  {  // cleanup method
        this.comments = [];
        this.stopHubConnection();
    }


    addComment = async (formValues: any) => {
      formValues.activityId = store.activityStore.selectedActivity?.id;
      try {  // SendComment needs to match the name of the method inside ChatHub in the API
        await this.hubConnection?.invoke('SendComment', formValues);
        
      } catch (error) {
        console.log(error);
      }
    }
}