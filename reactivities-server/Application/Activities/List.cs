using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;


namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<Result<PagedList<ActivityDto>>> 
        {
            public ActivityParams Params { get; set; }
        }  

        public class Handler : IRequestHandler<Query, Result<PagedList<ActivityDto>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;


            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _mapper = mapper; 
                _context = context;
                _userAccessor = userAccessor;
            }


            public async Task<Result<PagedList<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {  // no error handling needed
                var query = _context.Activities
                    .Where(x => x.Date >= request.Params.StartDate)  // filter by date
                    .OrderBy(x => x.Date)
                    .ProjectTo<ActivityDto>(_mapper.ConfigurationProvider, 
                            new { currentUsername = _userAccessor.GetUsername() }) 
                    .AsQueryable();  // make query
                
                if (request.Params.IsGoing && !request.Params.IsHost) 
                {  // filter IsGoing
                    query = query.Where(x => x.Attendees.Any(a => a.Username == _userAccessor.GetUsername()));
                }

                if (!request.Params.IsGoing && request.Params.IsHost) 
                {  // filter IsHost
                    query = query.Where(x => x.HostUsername == _userAccessor.GetUsername());
                }

                return Result<PagedList<ActivityDto>>.Sucess(
                    await PagedList<ActivityDto>.CreateAsync(query, 
                        request.Params.PageNumber,
                        request.Params.PageSize
                    )  // get paginated list of items from query
                );  
            }
        }
  }
}