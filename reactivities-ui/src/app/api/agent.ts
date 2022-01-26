import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { history } from '../..';  // from index.tsx
import { Activity, ActivityFormValues } from '../models/activity';
import { PaginatedResult } from '../models/pagination';
import { Photo, Profile, UserActivity } from '../models/profile';
import { User, UserFormValues } from '../models/user';
import { store } from '../stores/store';


axios.defaults.baseURL = process.env.REACT_APP_API_URL;


axios.interceptors.request.use(config => {  // attach token
    const token = store.commonStore.token;
    if (token) config.headers!.Authorization = `Bearer ${token}`;  // bearer token
    return config;
});


axios.interceptors.response.use(res => {  // error catching middleware
    const pagination = res.headers['pagination'];
    if (pagination) {  // pagination comes as a string, needs to be parsed
        res.data = new PaginatedResult(res.data, JSON.parse(pagination));
        return res as AxiosResponse<PaginatedResult<any>>;  // for intellisense 
    }
    return res;

}, (error: AxiosError) => {
    const { data, status, config, headers } = error.response!;
    switch (status) {
        case 400:
            if (typeof data == 'string') {  // regular 400 error
                toast.error(data);
            }

            const badGuidError = config.method === 'get' && data.errors.hasOwnProperty('id');
            if (badGuidError) {  // tried to get invalid guid, check video for explanation
                history.push('/not-found');

            }
            
            if (data.errors) {  // validation data
                const modalStateErrors = [];  // list of sublists
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        modalStateErrors.push(data.errors[key]);  // add sublist
                    }
                }  // flat 1 level of nesting, since the the list has subslits as elements
                throw modalStateErrors.flat();  // what we throw here is .catch in the callback catch
            } 
            break;
        case 401:
            if (headers['www-authenticate']?.startsWith('Bearer error="invalid_token"')) {
                store.userStore.logout();
                toast.error('Session expired - please login');
            } 
            break;
        case 404:
            history.push('/not-found');
            break;
        case 500:
            store.commonStore.setServerError(data);  // save error to store
            history.push('/server-error')
            break;
    }
    return Promise.reject(error);
});


const resBodyMiddleware = <T> (res: AxiosResponse<T>) => res.data;  // middleware to return body directly instead of response
const requests = {  // types of used requests, T ends up in AxiosResponse<T> as the body type
    get: <T> (url: string) => axios.get<T>(url).then(resBodyMiddleware),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(resBodyMiddleware),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(resBodyMiddleware),
    delete: <T> (url: string) => axios.delete<T>(url).then(resBodyMiddleware),
};


const Activities = {  // object of related requests                                          // pass search params
    list: (params: URLSearchParams) => axios.get<PaginatedResult<Activity[]>>('/activities', {params}).then(resBodyMiddleware),
    details: (id: string) => requests.get<Activity>(`/activities/${id}`),
    create: (activity: ActivityFormValues) => requests.post<void>('/activities', activity),
    update: (activity: ActivityFormValues) => requests.put<void>(`/activities/${activity.id}`, activity),
    delete: (id: string) => requests.delete<void>(`/activities/${id}`),
    attend: (id: string) => requests.post<void>(`/activities/${id}/attend`, {})
}


const Account = {  // api auth methods
    current: () => requests.get<User>('/account'),
    login: (userValues: UserFormValues) => requests.post<User>('/account/login', userValues),
    register: (userValues: UserFormValues) => requests.post<User>('/account/register', userValues),
    refreshToken: () => requests.post<User>('/account/refreshToken', {}),
    verifyEmail: (token: string, email: string) => requests.post<void>(`/account/verifyEmail?token=${token}&email=${email}`, {}),
    resendEmailConfirmation: (email: string) => requests.get(`/account/resendEmailConfirmation?email=${email}`)
}


const Profiles = {
    get: (username: string) => requests.get<Profile>(`/profiles/${username}`),
    uploadPhoto: (file: Blob) => {  // can't use requests since it needs form data
        let formData = new FormData();
        formData.append('File', file);  // need to match api expected name (File for our .NET class)
        return axios.post<Photo>('photos', formData, {
            headers: {'Content-type': 'multipart/form-data'}
        })
    },
    setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
    deletePhoto: (id: string) => requests.delete(`/photos/${id}`),
    updateProfile: (profile: Partial<Profile>) => requests.put('/profiles', profile),
    updateFollowing: (username: string) => requests.post(`/follow/${username}`, {}),
    listFollowings: (username: string, predicate: string) => requests.get<Profile[]>(`/follow/${username}?predicate=${predicate}`),
    listActivities: (username: string, predicate: string) => requests.get<UserActivity[]>(`/profiles/${username}/activities?predicate=${predicate}`)
}


const agent = {
    Activities,
    Account,
    Profiles
}


export default agent;
