using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Application.Profiles;

namespace Application.Activities
{
    public class UserActivityDto
    {  // ActivityDto with less stuff, to show in Events tab (inside user profile)
        public Guid Id { get; set; }  
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        
        [JsonIgnore]  // don't include HostUsername in the json sent to the clients
        public string HostUsername { get; set; } 
    }
}