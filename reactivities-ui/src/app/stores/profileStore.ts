import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { Photo, Profile, UserActivity } from "../models/profile";
import { store } from "./store";


export default class ProfileStore {
  profile: Profile | null = null;
  loadingProfile = false;
  uploading = false;
  loading = false;

  followings: Profile[] = [];
  loadingFollowings = false;
  activeTab = 0;  // followers or following tab?

  userActivities: UserActivity[] = [];
  loadingActivities = false;

  
  constructor() {
    makeAutoObservable(this);

    reaction(  
      () => this.activeTab,  // react to changes in activeTab, to change between followings and followers
      activeTab => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? 'followers' : 'following';
          this.loadFollowings(predicate);
        } else {
          this.followings = [];
        }
      }
    )
  }

  
  loadProfile = async (username: string) => {
    this.loadingProfile = true;
    try {
      const profile = await agent.Profiles.get(username);
      runInAction(() => {
        this.profile = profile;
        this.loadingProfile = false;
      })

    } catch (error) {
      console.log(error);
      runInAction(() => this.loadingProfile = false);
    }
  }


  get isCurrentUser() {  // is loaded profile the current user?
    if (store.userStore.user && this.profile) {
      return store.userStore.user.username === this.profile.username
    }
    return false;
  }


  uploadPhoto = async (file: Blob) => {
    this.uploading = true;
    try {
      const response = await agent.Profiles.uploadPhoto(file);
      const photo = response.data;
      
      runInAction(() => {
        if (this.profile) {
          this.profile.photos?.push(photo);  // local update
          
          if (photo.isMain && store.userStore.user) {  // update current user photo
            store.userStore.setImage(photo.url);
            this.profile.image = photo.url;
          }
          this.uploading = false;
        }
      })

    } catch (error) {
      console.log(error);
      runInAction(() => this.uploading = false);
    }
  }


  setMainPhoto = async (photo: Photo) => {
    this.loading = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      store.userStore.setImage(photo.url);
      runInAction(() => {
        if (this.profile && this.profile.photos) {
          this.profile.photos.find(x => x.isMain)!.isMain = false;  // unselected main
          this.profile.photos.find(x => x.id === photo.id)!.isMain = true;  // select new main
          this.profile.image = photo.url;  // local update
          this.loading = false;
        }
      })

    } catch (error) {
      console.log(error);
      runInAction(() => this.loading = false);
    }
  }
  
  
  deletePhoto = async (photo: Photo) => {
    this.loading = true;
    try {
      await agent.Profiles.deletePhoto(photo.id);
      runInAction(() => {
        if (this.profile) {
          this.profile.photos = this.profile.photos?.filter(x => x.id !== photo.id);
          this.loading = false;
        }
      })
  
    } catch (error) {
      console.log(error);
      runInAction(() => this.loading = false);
    }
  }


  updateProfile = async (profile: Partial<Profile>) => {
      this.loading = true;
      try {
          await agent.Profiles.updateProfile(profile);
          runInAction(() => {
            if (profile.displayName && profile.displayName !== store.userStore.user?.displayName) {  // display name was changed
              store.userStore.setDisplayName(profile.displayName);
            }
            
            this.profile = {...this.profile, ...profile as Profile};  // using as due to Partial type
            this.loading = false;
          });
          
      } catch (error) {
        console.log(error);
        runInAction(() => this.loading = false);
      }
  }


  updateFollowing = async (username: string, following: boolean) => {  // following is the new value to set, not the current one
    this.loading = true;
    try {
      await agent.Profiles.updateFollowing(username);
      store.activityStore.updateAttendeeFollowing(username);  // update the followed user
      
      runInAction(() => {  // update the follower user
        if (this.profile) {
          if (this.profile.username !== store.userStore.user?.username 
              && this.profile.username === username) {  // we are following/unfollowing the profile
            following ? this.profile.followersCount++ : this.profile.followersCount--;  // updating followers
            this.profile.following = !this.profile.following;
          }
  
          if (this.profile.username === store.userStore.user?.username) {  // we are following/unfollowing watching our profile (updating followings)
            following ? this.profile.followingCount++ : this.profile.followingCount--;
          }

        }
        
        this.followings.forEach(profile => {  // update in this store attendess list
          if (profile.username === username) {
            profile.following ? profile.followersCount-- : profile.followersCount++;
            profile.following = !profile.following; 
          }
        });
        this.loading = false;
      });
      
    } catch (error) {
      console.log(error);
      runInAction(() => this.loading = false);
    }
  }


  loadFollowings = async (predicate: string) => {
    this.loadingFollowings = true;
    try {
      const followings = await agent.Profiles.listFollowings(this.profile!.username, predicate);
      runInAction(() => {
        this.followings = followings;
        this.loadingFollowings = false;
      })

    } catch (error) {
      console.log(error);
      runInAction(() => this.loadingFollowings = false);
    }
  }
  
  
  setActiveTab = (tabNumber: any) => this.activeTab = tabNumber;


  loadUserActivities = async (username: string, predicate?: string) => {
    this.loadingActivities = true;
    try {
      const activities = await agent.Profiles.listActivities(username, predicate!);
      runInAction(() => {
        this.userActivities = activities;
        this.loadingActivities = false;
      })
  
    } catch (error) {
      console.log(error);
      runInAction(() => this.loadingActivities = false);
    }
  }
}