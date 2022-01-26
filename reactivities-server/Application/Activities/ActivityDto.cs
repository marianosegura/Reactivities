using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles;

namespace Application.Activities
{
    public class ActivityDto  // same as the model, but with profiles objects instead of attendees
    {
        public Guid Id { get; set; }  // global id, detected and used by the Entity Framework
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string City { get; set; }
        public string Venue { get; set; }
        public bool IsCancelled { get; set; }
        public string HostUsername { get; set; }  // since we can't know the host from the profiles
        public ICollection<AttendeeDto> Attendees { get; set; }  // the user attendees profiles
    }
}