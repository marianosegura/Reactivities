using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security
{
    public class IsHostRequirement : IAuthorizationRequirement
    {
    }


    
    public class IsHostRequirementHandler : AuthorizationHandler<IsHostRequirement>
    {
        private readonly DataContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public IsHostRequirementHandler(DataContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _dbContext = dbContext;
        }


        protected override Task HandleRequirementAsync(AuthorizationHandlerContext authContext, IsHostRequirement requirement)
        {
            var userId = authContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Task.CompletedTask;  // unauthorized

            var activityId = Guid.Parse(_httpContextAccessor.HttpContext?.Request.RouteValues
                .SingleOrDefault(x => x.Key == "id").Value?.ToString());  // activity id from route
            
            var attendee = _dbContext.ActivitiesAttendees
                .AsNoTracking()  // to avoid edit activity bug (FindAsync tracking the entry) 
                .SingleOrDefaultAsync(x => x.AppUserId == userId && x.ActivityId == activityId)  // FindAsync is not compatible with AsNoTracking
                .Result;  

            if (attendee == null) return Task.CompletedTask;  // unauthorized

            if (attendee.IsHost) authContext.Succeed(requirement);  // authorize

            return Task.CompletedTask;
        }
    }
}