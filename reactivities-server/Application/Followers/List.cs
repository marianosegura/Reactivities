using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Application.Profiles;
using Application.Interfaces;

namespace Application.Followers
{
    public class List
    {
        public class Query : IRequest<Result<List<Profiles.Profile>>>
        {  
            public string Predicate { get; set; }  // followers or following?
            public string Username { get; set; }
        }  


        public class Handler : IRequestHandler<Query, Result<List<Profiles.Profile>>>
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


            public async Task<Result<List<Profiles.Profile>>> Handle(Query request, CancellationToken cancellationToken)
            { 
                var profiles = new List<Profiles.Profile>();
                if (request.Predicate == "followers")
                {
                    profiles = await _context.UserFollowings.Where(x => x.Target.UserName == request.Username)
                        .Select(u => u.Observer)  // select observer users
                        .ProjectTo<Profiles.Profile>(_mapper.ConfigurationProvider,  // map to profile 
                            new { currentUsername = _userAccessor.GetUsername() })  // pass as parameter to determine following boolean
                        .ToListAsync();
                }
                if (request.Predicate == "following")
                {
                    profiles = await _context.UserFollowings.Where(x => x.Observer.UserName == request.Username)
                        .Select(u => u.Target)  // select target users
                        .ProjectTo<Profiles.Profile>(_mapper.ConfigurationProvider,  // map to profile 
                            new { currentUsername = _userAccessor.GetUsername() })  // pass as parameter to determine following boolean
                        .ToListAsync();
                }
                return Result<List<Profiles.Profile>>.Sucess(profiles);  
            }
        }
    }
}