import { format } from "date-fns";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity, ActivityFormValues } from "../models/activity";
import { Pagination, PagingParams } from "../models/pagination";
import { Profile } from "../models/profile";
import { store } from "./store";


export default class ActivityStore {
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = false;
    pagination: Pagination | null = null;
    pagingParams = new PagingParams();
    predicateFilters = new Map().set('all', true);  // to filter from isHost, isGoing and date


    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.predicateFilters.keys(),
            () => {
                this.pagingParams = new PagingParams();
                this.activityRegistry.clear();
                this.loadActivities();
            } 
        );
    }


    get activities() {  // computed property, sorted by date
        return Array.from(this.activityRegistry.values())
            .sort((a, b) => a.date!.getTime() - b.date!.getTime());
    }

    get activitiesByDate() {  // object with dates as keys as activity lists as values
        return Object.entries(
            this.activities.reduce((activities, activity) => {
                const key = format(activity.date!, 'dd MMM yyyy');  
                activities[key] = 
                    activities[key] ? [...activities[key], activity] 
                    : [activity];
                return activities;
            }, {} as { [key: string]: Activity[] })  // initial value
        );
    }


    private setActivity = (activity: Activity) => {
        const user = store.userStore.user;  // current cached user, can't be null for this point due to authentication
        if (user) {
            activity.isGoing = activity.attendees!.some(x => x.username === user.username);
            activity.isHost = activity.hostUsername === user.username;
            activity.host = activity.attendees?.find(x => x.username === activity.hostUsername);
        }
        activity.date = new Date(activity.date!);  // trim hh/ss from date iso string
        this.activityRegistry.set(activity.id, activity);
    }
    

    loadActivities = async () => {
        this.loadingInitial = true;
        try {
            const paginatedActivities = await agent.Activities.list(this.axiosParams);  // pass axios search params
            this.setPagination(paginatedActivities.pagination);
            paginatedActivities.data.forEach(activity => this.setActivity(activity));
        } catch (error) {
            console.log(error);
        }
        this.setLoadingInitial(false);
    }


    setPagination = (pagination: Pagination) => this.pagination = pagination;


    setPagingParams = (params: PagingParams) => this.pagingParams = params;


    get axiosParams() {  // returns the pagingParams as search params object
        const params = new URLSearchParams();
        params.append('pageNumber', this.pagingParams.pageNumber.toString());
        params.append('pageSize', this.pagingParams.pageSize.toString());
        this.predicateFilters.forEach((value, key) => {
            if (key === 'startDate') {
                params.append(key, (value as Date).toISOString());
            } else {
                params.append(key, value);
            }
        });
        return params;
    }


    private getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }


    loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if (activity) {
            this.selectedActivity = activity;
            return activity;  // retuning Promise<Activity | undefined>
        } else {
            try {
                activity = await agent.Activities.details(id);
                this.setActivity(activity);
                runInAction(() => this.selectedActivity = activity);
                return activity;
            } catch (error) {
                console.log(error);
            }
            this.setLoadingInitial(false);
        }
    }


    setLoadingInitial = (loadingInitial: boolean) => {
        this.loadingInitial = loadingInitial;
    } 


    createActivity = async (activityFormValues: ActivityFormValues) => {
        const user = store.userStore.user;
        try {
            await agent.Activities.create(activityFormValues);
            
            const activity = new Activity(activityFormValues);  // initialize fields
            activity.hostUsername = user!.username;
            activity.attendees = [new Profile(user!)];
            this.setActivity(activity);

            runInAction(() => this.selectedActivity = activity);

        } catch (error) {
            console.log(error);
        }
    } 
    
    
    updateActivity = async (activityFormValues: ActivityFormValues) => {
        try {
            await agent.Activities.update(activityFormValues);
            runInAction(() => {
                if (activityFormValues.id) {
                    let updatedActivity = { ...this.getActivity(activityFormValues.id), ...activityFormValues };
                    this.activityRegistry.set(activityFormValues.id, updatedActivity as Activity);  // remove and push activity aka update
                    this.selectedActivity = updatedActivity as Activity;
                }
            });

        } catch (error) {
            console.log(error);
        }
    }
    
    
    deleteActivity = async (id: string) => {
        this.loading = true;
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistry.delete(id);
                this.loading = false;
            });
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            });
        }
    }


    updateAttendance = async () => {
        const user = store.userStore.user;
        this.loading = true;
        try {  // if an user is trying to update their attendace they are inside of an activity, it can't be null
            await agent.Activities.attend(this.selectedActivity!.id);  
            runInAction(() => {  // update locally
                if (this.selectedActivity?.isGoing) {  // going cancelled, remove from attendees
                    this.selectedActivity.attendees = this.selectedActivity.attendees?.filter(
                        a => a.username !== user?.username);
                    this.selectedActivity.isGoing = false;
                    
                } else {  // now is going, add attendee
                    const attendee = new Profile(user!);
                    this.selectedActivity?.attendees?.push(attendee);
                    this.selectedActivity!.isGoing = true;
                }

                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
            });
        } catch (error) {
            console.log(error);
        } finally {
            runInAction(() => this.loading = false);
        }
    }


    cancelActivitToggle = async () => {  // same as above in API terms but little no none local state to update
        this.loading = true;
        try {
            await agent.Activities.attend(this.selectedActivity!.id);  // negate isCancelled
            runInAction(() => {
                this.selectedActivity!.isCancelled = !this.selectedActivity!.isCancelled;
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
            });

        } catch (error) {
            console.log(error);
        } finally {
            runInAction(() => this.loading = false);
        }
    }


    clearSelectedActivity = () => {
      this.selectedActivity = undefined;
    }


    updateAttendeeFollowing = (username: string) => {  // local follow/unfollow update 
        this.activityRegistry.forEach(activity => {
            activity.attendees.forEach(attendee => {
                if (attendee.username === username) {
                    attendee.following ? attendee.followersCount-- : attendee.followersCount++;
                    attendee.following = !attendee.following; 
                }
            });
        });
    }


    setPredicateFilter = (filter: string, value: string | Date) => {
        if (['all', 'isGoing', 'isHost'].includes(filter)) {
            this.predicateFilters.forEach((value, key) => {  // cleanup everything but date 
                if (key !== 'startDate') this.predicateFilters.delete(key);
            });
        } 
            // we need to delete it to trigger the change reactions in keys
        if (filter === 'startDate') this.predicateFilters.delete('startDate');
        this.predicateFilters.set(filter, value);
    }
}