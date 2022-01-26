using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Create
    {
        
        public class Command : IRequest<Result<Unit>>  // Unit as like we're not returning anything
        {
            public Activity Activity { get; set; }
        }


        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Activity).SetValidator(new ActivityValidator());
            }
        }


        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;  // our own accessor


            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _context = context;
            }


            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername()); 

                var attendee = new ActivityAttendee {  // wer're omitting the ids used as primary keys, I guess they are extracted form the objects due to some configuration 
                    AppUser = user, 
                    Activity = request.Activity, 
                    IsHost = true 
                };
                _context.ActivitiesAttendees.Add(attendee);  // add entry to join activity-user table

                _context.Activities.Add(request.Activity);  // add in memory
                var dbChanges = await _context.SaveChangesAsync();  // save memory state to db
                
                if (dbChanges <= 0) return Result<Unit>.Failure("Failed to create activity");
                
                return Result<Unit>.Sucess(Unit.Value);  // just to by interface complient, is like returning null
            }
        }

  }
}