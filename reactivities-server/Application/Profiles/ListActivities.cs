using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Activities;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ListActivities
    {
        public class Query : IRequest<Result<List<UserActivityDto>>>
        {
            public string Username { get; set; }
            public string Predicate { get; set; }  // can be past/future/hosting
        }


        public class Handler : IRequestHandler<Query, Result<List<UserActivityDto>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;


            public Handler(DataContext context, IMapper mapper)
            {
                _mapper = mapper; 
                _context = context;
            }
            

            public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query = _context.ActivitiesAttendees  // from attendees to activities
                    .Where(x => x.AppUser.UserName == request.Username)
                    .OrderBy(x => x.Activity.Date)
                    .ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider)
                    .AsQueryable();
                
                query = request.Predicate switch  
                {  // switch assign expression, filter on predicate
                    "past" => query.Where(x => x.Date <= DateTime.Now), 
                    "future" => query.Where(x => x.Date >= DateTime.Now), 
                    "hosting" => query.Where(x => x.HostUsername == request.Username), 
                    _ => query  // default case
                };
                return Result<List<UserActivityDto>>.Sucess(await query.ToListAsync());
            }
        }
  }
}