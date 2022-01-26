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

namespace Application.Comments
{
    public class List
    {
        public class Query : IRequest<Result<List<CommentDto>>>
        {  // get activity comments
            public Guid ActivityId { get; set; }
        }  


        public class Handler : IRequestHandler<Query, Result<List<CommentDto>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;


            public Handler(DataContext context, IMapper mapper)
            {
                _mapper = mapper;
                _context = context;
            }


            public async Task<Result<List<CommentDto>>> Handle(Query request, CancellationToken cancellationToken)
            { 
                var comments = await _context.Comments
                    .Where(x => x.Activity.Id == request.ActivityId)  // get comments
                    .OrderByDescending(x => x.CreatedAt)  // order by date
                    .ProjectTo<CommentDto>(_mapper.ConfigurationProvider)  // project to dtos
                    .ToListAsync(cancellationToken);  // get as list
                return Result<List<CommentDto>>.Sucess(comments);  
            }
        }
  }
}