using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Activities;
using Application.Comments;
using AutoMapper;
using Domain;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            string currentUsername = null;

            CreateMap<Activity, Activity>();

            CreateMap<ActivityAttendee, AttendeeDto>()  // change from Profile to AttendeeDto
                .ForMember(dto => dto.DisplayName, options => options.MapFrom(attendee => attendee.AppUser.DisplayName))
                .ForMember(dto => dto.Username, options => options.MapFrom(attendee => attendee.AppUser.UserName))
                .ForMember(dto => dto.Bio, options => options.MapFrom(attendee => attendee.AppUser.Bio))
                .ForMember(dto => dto.Image, options => 
                    options.MapFrom(attendee => attendee.AppUser.Photos.FirstOrDefault(photo => photo.IsMain).Url))
                .ForMember(p => p.FollowersCount, o => o.MapFrom(s => s.AppUser.Followers.Count))
                .ForMember(p => p.FollowingCount, o => o.MapFrom(s => s.AppUser.Followings.Count))
                .ForMember(p => p.Following, o => 
                    o.MapFrom(s => s.AppUser.Followers.Any(x => x.Observer.UserName == currentUsername)));

            CreateMap<Activity, ActivityDto>()  // populate hostname, the attendees are mapped thanks to the mapping above 
                .ForMember(dto => dto.HostUsername, options => options.MapFrom(activity => 
                    activity.Attendees.FirstOrDefault(attendee => attendee.IsHost).AppUser.UserName));
            
            CreateMap<AppUser, Profiles.Profile>()  // set main photo url
                .ForMember(profile => profile.Image, options => 
                    options.MapFrom(user => user.Photos.FirstOrDefault(photo => photo.IsMain).Url))
                .ForMember(p => p.FollowersCount, o => o.MapFrom(s => s.Followers.Count))
                .ForMember(p => p.FollowingCount, o => o.MapFrom(s => s.Followings.Count))
                .ForMember(p => p.Following, o => 
                    o.MapFrom(s => s.Followers.Any(x => x.Observer.UserName == currentUsername)));
            
            CreateMap<Comment, CommentDto>()
                .ForMember(dto => dto.DisplayName, options => options.MapFrom(comment => comment.Author.DisplayName))
                .ForMember(dto => dto.Username, options => options.MapFrom(comment => comment.Author.UserName))
                .ForMember(dto => dto.Image, options => options.MapFrom(comment => comment.Author.Photos.FirstOrDefault(photo => photo.IsMain).Url));
            
            CreateMap<ActivityAttendee, UserActivityDto>()  // used for the activities profile tab
                .ForMember(dto => dto.Id, o => o.MapFrom(a => a.Activity.Id))
                .ForMember(dto => dto.Title, o => o.MapFrom(a => a.Activity.Title))
                .ForMember(dto => dto.Description, o => o.MapFrom(a => a.Activity.Description))
                .ForMember(dto => dto.Category, o => o.MapFrom(a => a.Activity.Category))
                .ForMember(dto => dto.Date, o => o.MapFrom(a => a.Activity.Date))
                .ForMember(dto => dto.HostUsername, o => o.MapFrom(a => 
                    a.Activity.Attendees.FirstOrDefault(x => x.IsHost).AppUser.UserName));
        }
    }
}