using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class UpdateAttendance
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }


        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly IUserAccessor _userAccessor;
            private readonly DataContext _context;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }


            // toggles user attendance (or activity cancellation if called by the host)
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities
                    .Include(activity => activity.Attendees).ThenInclude(attendee => attendee.AppUser)
                    .FirstOrDefaultAsync(activity => activity.Id == request.Id);
                
                if (activity == null) return null;  // resulting in 404 not found
                
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());

                if (user == null) return null;

                var hostUsername = activity.Attendees.FirstOrDefault(x => x.IsHost).AppUser.UserName;  // just the host has the .IsHost flag set to true in this list

                var attendance = activity.Attendees.FirstOrDefault(x => x.AppUser.UserName == user.UserName);
                
                bool isHost = hostUsername == user.UserName;
                if (attendance != null && isHost)  // host toggles IsCancelled state
                {
                    activity.IsCancelled = !activity.IsCancelled;
                }

                if (attendance != null && !isHost)  // non-host are removed from the activity
                {
                    activity.Attendees.Remove(attendance);
                }

                if (attendance == null)
                {
                    attendance = new ActivityAttendee 
                    {
                        AppUser = user,
                        Activity = activity,
                        IsHost = false  // can't be host, since the host attendance always remains with the activity
                    };
                    activity.Attendees.Add(attendance);
                }

                var success = await _context.SaveChangesAsync() > 0;

                return success ? Result<Unit>.Sucess(Unit.Value) : Result<Unit>.Failure("Problem updating attendace");
            }
        }
    }
}